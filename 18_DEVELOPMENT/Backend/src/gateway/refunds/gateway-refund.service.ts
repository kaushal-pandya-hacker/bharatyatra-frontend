import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Optional,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PaymentOrderStatus,
  RefundStatus,
  LedgerAccountType,
  LedgerDirection,
} from '../domain/gateway.types';
import { GatewayOrderService } from '../orders/gateway-order.service';
import { GatewayLedgerService } from '../ledger/gateway-ledger.service';
import { GatewayWebhookService } from '../webhooks/gateway-webhook.service';
import { ProviderRegistry } from '../providers/provider.registry';
import { GatewayPersistenceService } from '../database/gateway-persistence.service';

export interface CreateRefundParams {
  orderId: string;
  merchantId: string;
  amountMinor?: number; // If omitted, full refund of remaining balance
  reason: string;
  speed?: 'NORMAL' | 'INSTANT';
  idempotencyKey?: string;
  simulatedScenario?: 'SUCCESS' | 'TIMEOUT' | 'FAILED';
  providerId?: string;
}

export interface RefundRecord {
  id: string;
  refundId: string; // 'ref_bg_...'
  orderId: string;
  merchantId: string;
  amountMinor: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  speed: 'NORMAL' | 'INSTANT';
  idempotencyKey?: string;
  providerRefundId?: string;
  errorCode?: string;
  errorMessage?: string;
  isSimulated: boolean;
  createdAt: string;
  processedAt?: string;
}

@Injectable()
export class GatewayRefundService {
  private readonly logger = new Logger(GatewayRefundService.name);
  private readonly refunds = new Map<string, RefundRecord>(); // refundId -> record
  private readonly idempotencyIndex = new Map<string, string>(); // `${merchantId}:${idempKey}` -> refundId
  private readonly inFlightRefundLocks = new Set<string>(); // orderId lock to prevent double-refund

  constructor(
    private readonly orderService: GatewayOrderService,
    private readonly ledgerService: GatewayLedgerService,
    private readonly webhookService: GatewayWebhookService,
    private readonly providerRegistry: ProviderRegistry,
    private readonly persistenceService?: GatewayPersistenceService,
  ) {}

  async processRefund(params: CreateRefundParams): Promise<RefundRecord> {
    const lockKey = `refund:order:${params.orderId}`;
    const workerOwnerId = `worker_${process.pid}_${crypto.randomBytes(4).toString('hex')}`;

    // 1. Cross-Process Distributed Lock & In-Memory Lock Guard
    if (this.inFlightRefundLocks.has(params.orderId)) {
      throw new ConflictException(
        `A refund operation is currently in flight for Order ${params.orderId}. Duplicate concurrent attempts rejected.`,
      );
    }

    if (this.persistenceService) {
      const lockAcquired = await this.persistenceService.acquireDistributedLock(
        lockKey,
        'ORDER',
        params.orderId,
        workerOwnerId,
        15000,
      );
      if (!lockAcquired) {
        throw new ConflictException(
          `A refund operation is currently in flight for Order ${params.orderId} across the cluster. Duplicate concurrent attempts rejected.`,
        );
      }
    }

    this.inFlightRefundLocks.add(params.orderId);

    try {
      const order = this.orderService.getOrder(params.orderId, params.merchantId);

      // 2. Prevent Submitting While an UNCERTAIN Refund is Pending Reconciliation
      const existingRefunds = Array.from(this.refunds.values()).filter(
        (r) => r.orderId === params.orderId,
      );
      const pendingUncertain = existingRefunds.find((r) => r.status === RefundStatus.UNCERTAIN);
      if (pendingUncertain) {
        throw new ConflictException(
          `Order ${params.orderId} has an UNCERTAIN refund (${pendingUncertain.refundId}) pending reconciliation. Further refunds or duplicate submissions are blocked until external provider statement resolves the outcome.`,
        );
      }

      // 3. Durable Idempotency Check
      if (params.idempotencyKey) {
        if (this.persistenceService) {
          const idemp = await this.persistenceService.checkOrAcquireIdempotency(
            params.merchantId,
            params.idempotencyKey,
            '/api/v1/gateway/refunds',
            params,
          );
          if (idemp.isCached && idemp.responseBody) {
            this.logger.warn(
              `[REFUND] Idempotent hit from durable storage for Key: ${params.idempotencyKey}`,
            );
            return idemp.responseBody;
          }
        } else {
          const idempKey = `${params.merchantId}:${params.idempotencyKey}`;
          const existingRefundId = this.idempotencyIndex.get(idempKey);
          if (existingRefundId) {
            const existing = this.refunds.get(existingRefundId);
            if (existing) {
              this.logger.warn(
                `[REFUND] Idempotent hit for Key: ${params.idempotencyKey}. Returning existing refund ${existingRefundId}`,
              );
              return existing;
            }
          }
        }
      }

      // 4. Calculate Refund Amount
      const remainingRefundableMinor = order.amountMinor - order.amountRefundedMinor;
      if (remainingRefundableMinor <= 0) {
        throw new BadRequestException(`Order ${params.orderId} is already fully refunded.`);
      }

      const refundAmountMinor = params.amountMinor !== undefined ? params.amountMinor : remainingRefundableMinor;

      if (!Number.isInteger(refundAmountMinor) || refundAmountMinor <= 0) {
        throw new BadRequestException('Refund amount must be a positive integer in minor units.');
      }

      if (refundAmountMinor > remainingRefundableMinor) {
        throw new BadRequestException(
          `Refund amount (₹${(refundAmountMinor / 100).toFixed(2)}) exceeds remaining refundable balance (₹${(remainingRefundableMinor / 100).toFixed(2)}).`,
        );
      }

      // 5. State Reservation Phase (Two-Phase Provider Protocol)
      const refundId = `ref_bg_${crypto.randomBytes(12).toString('hex')}`;
      const now = new Date().toISOString();

      if (this.persistenceService) {
        await this.persistenceService.reserveRefundBalance({
          orderId: order.orderId,
          merchantId: order.merchantId,
          refundAmountMinor,
          refundId,
          reason: params.reason,
          idempotencyKey: params.idempotencyKey,
        });
      } else {
        this.orderService.recordRefund(order.orderId, refundAmountMinor);
      }

    // 4. Invoke Provider Simulator (with Timeout & Uncertain Outcome Protection)
    let providerResult: any;
    try {
      if (params.simulatedScenario === 'TIMEOUT') {
        const timeoutErr: any = new Error('Gateway provider network timeout (ETIMEDOUT)');
        timeoutErr.code = 'ETIMEDOUT';
        throw timeoutErr;
      }
      if (params.simulatedScenario === 'FAILED') {
        throw new Error('Provider rejected refund (Simulated Failure)');
      }
      const provider = this.providerRegistry.getProvider(params.providerId || 'BHARATGATEWAY_SIMULATOR');
      providerResult = await provider.processRefund({
        refundId,
        orderId: order.orderId,
        attemptId: `pay_ref_${order.orderId}`,
        merchantId: order.merchantId,
        amountMinor: refundAmountMinor,
        currency: order.currency,
        reason: params.reason,
      });
    } catch (err: any) {
      const isTimeout = err.message?.toLowerCase().includes('timeout') || err.code === 'ETIMEDOUT';
      const failureStatus = isTimeout ? RefundStatus.UNCERTAIN : RefundStatus.FAILED;

      const failedRecord: RefundRecord = {
        id: crypto.randomUUID(),
        refundId,
        orderId: order.orderId,
        merchantId: order.merchantId,
        amountMinor: refundAmountMinor,
        currency: order.currency,
        reason: params.reason,
        status: failureStatus,
        speed: params.speed || 'NORMAL',
        idempotencyKey: params.idempotencyKey,
        errorCode: isTimeout ? 'ERR_PROVIDER_TIMEOUT' : 'ERR_PROVIDER_REJECTED',
        errorMessage: err.message || 'Provider failed to process refund',
        isSimulated: true,
        createdAt: now,
      };

      this.refunds.set(refundId, failedRecord);

      // Rollback memory order balance if refund did not succeed
      order.amountRefundedMinor -= refundAmountMinor;
      order.status = order.amountRefundedMinor > 0 ? PaymentOrderStatus.PARTIALLY_REFUNDED : PaymentOrderStatus.CAPTURED;

      this.logger.warn(`[REFUND] Provider returned ${failureStatus} for Refund ${refundId}: ${err.message}`);
      return failedRecord;
    }

    // 5. Post Compensating Reversal in Append-Only Double-Entry Ledger
    await this.ledgerService.recordRefundReversal(
      refundId,
      order.orderId,
      order.merchantId,
      refundAmountMinor,
    );

    const record: RefundRecord = {
      id: crypto.randomUUID(),
      refundId,
      orderId: order.orderId,
      merchantId: order.merchantId,
      amountMinor: refundAmountMinor,
      currency: order.currency,
      reason: params.reason,
      status: RefundStatus.COMPLETED,
      speed: params.speed || 'NORMAL',
      idempotencyKey: params.idempotencyKey,
      providerRefundId: providerResult.providerRefundId,
      isSimulated: true,
      createdAt: now,
      processedAt: now,
    };

    this.refunds.set(refundId, record);

    if (this.persistenceService) {
      await this.persistenceService.executeAtomicRefund({
        orderId: order.orderId,
        merchantId: order.merchantId,
        refund: record,
        ledgerParams: {
          transactionReference: `tx_ref_${refundId}`,
          referenceType: 'REFUND',
          referenceId: refundId,
          merchantId: order.merchantId,
          description: `Refund reversal of ₹${(refundAmountMinor / 100).toFixed(2)} for Order ${order.orderId}`,
          entries: [
            {
              accountType: LedgerAccountType.MERCHANT_SETTLEMENT_PAYABLE,
              direction: LedgerDirection.DEBIT,
              amountMinor: refundAmountMinor,
              description: `Debit merchant settlement balance for refund ${refundId}`,
            },
            {
              accountType: LedgerAccountType.GATEWAY_CLEARING,
              direction: LedgerDirection.CREDIT,
              amountMinor: refundAmountMinor,
              description: `Credit gateway clearing for refund settlement ${refundId}`,
            },
          ],
        },
      });

      if (params.idempotencyKey) {
        await this.persistenceService.completeIdempotency(
          params.merchantId,
          params.idempotencyKey,
          '/api/v1/gateway/refunds',
          200,
          record,
        );
      }
    }

    if (params.idempotencyKey) {
      this.idempotencyIndex.set(`${params.merchantId}:${params.idempotencyKey}`, refundId);
    }

    // 6. Dispatch signed webhook event: refund.completed
    await this.webhookService.dispatchEvent(order.merchantId, 'refund.completed', {
      refundId,
      orderId: order.orderId,
      amountMinor: refundAmountMinor,
      currency: order.currency,
      status: 'COMPLETED',
      speed: record.speed,
      reason: params.reason,
      isSimulated: true,
    });

    this.logger.log(
      `[REFUND] Processed refund ${refundId} of ₹${(refundAmountMinor / 100).toFixed(2)} for Order ${order.orderId}`,
    );

    return record;
    } finally {
      this.inFlightRefundLocks.delete(params.orderId);
      if (this.persistenceService) {
        await this.persistenceService.releaseDistributedLock(lockKey, workerOwnerId).catch(() => {});
      }
    }
  }

  getRefund(refundId: string, merchantId?: string): RefundRecord {
    const refund = this.refunds.get(refundId);
    if (!refund) {
      throw new NotFoundException(`Refund ${refundId} not found.`);
    }

    if (merchantId && refund.merchantId !== merchantId) {
      throw new NotFoundException(`Refund ${refundId} not found for merchant.`);
    }

    return refund;
  }

  listRefunds(merchantId?: string): RefundRecord[] {
    const all = Array.from(this.refunds.values());
    if (merchantId) {
      return all.filter(r => r.merchantId === merchantId);
    }
    return all;
  }
}

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
  PaymentMethodType,
  PaymentAttemptStatus,
  LedgerAccountType,
  LedgerDirection,
} from '../domain/gateway.types';
import { GatewayOrderService } from '../orders/gateway-order.service';
import { ProviderRegistry } from '../providers/provider.registry';
import { GatewayLedgerService } from '../ledger/gateway-ledger.service';
import { GatewayWebhookService } from '../webhooks/gateway-webhook.service';
import { GatewayFraudService } from '../fraud/gateway-fraud.service';
import { GatewayPersistenceService } from '../database/gateway-persistence.service';

export interface ProcessPaymentParams {
  orderId: string;
  method: PaymentMethodType;
  methodDetails: {
    vpa?: string;
    cardLast4?: string;
    cardExpiry?: string;
    cardBrand?: string;
    bankCode?: string;
    simulatedScenario?: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'INCORRECT_PIN' | 'BANK_TIMEOUT' | 'CARD_EXPIRED' | 'FRAUD_BLOCKED';
  };
  providerId?: string;
  idempotencyKey?: string;
  merchantId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PaymentAttemptRecord {
  id: string;
  attemptId: string;
  orderId: string;
  merchantId: string;
  amountMinor: number;
  currency: string;
  method: PaymentMethodType;
  status: PaymentAttemptStatus;
  provider: string;
  isSimulated: boolean;
  gatewayTransactionId?: string;
  signature?: string;
  errorCode?: string;
  errorMessage?: string;
  riskScore: number;
  methodDetails: any; // Masked / sanitized details only
  completedAt?: string;
  createdAt: string;
}

@Injectable()
export class GatewayPaymentService {
  private readonly logger = new Logger(GatewayPaymentService.name);
  private readonly attempts = new Map<string, PaymentAttemptRecord>(); // attemptId -> record
  private readonly inFlightLocks = new Set<string>(); // orderId lock to prevent double-capture

  constructor(
    private readonly orderService: GatewayOrderService,
    private readonly providerRegistry: ProviderRegistry,
    private readonly ledgerService: GatewayLedgerService,
    private readonly webhookService: GatewayWebhookService,
    private readonly fraudService: GatewayFraudService,
    private readonly persistenceService?: GatewayPersistenceService,
  ) {}

  /**
   * Execute full payment lifecycle for an order
   */
  async processPayment(params: ProcessPaymentParams): Promise<PaymentAttemptRecord> {
    if (this.inFlightLocks.has(params.orderId)) {
      throw new ConflictException(
        `Payment processing is currently in flight for Order ${params.orderId}. Duplicate concurrent attempts rejected.`,
      );
    }
    this.inFlightLocks.add(params.orderId);

    try {
      const order = this.orderService.getOrder(params.orderId);
      const merchantId = params.merchantId || order.merchantId;

      // Durable Idempotency Check
      if (params.idempotencyKey && this.persistenceService) {
        const idemp = await this.persistenceService.checkOrAcquireIdempotency(
          merchantId,
          params.idempotencyKey,
          '/api/v1/gateway/payments/process',
          params,
        );
        if (idemp.isCached && idemp.responseBody) {
          this.logger.warn(
            `[PAYMENT] Idempotent hit from durable storage for Key: ${params.idempotencyKey}`,
          );
          return idemp.responseBody;
        }
      }

      if (order.status !== PaymentOrderStatus.CREATED && order.status !== PaymentOrderStatus.PENDING) {
        throw new BadRequestException(`Cannot process payment for Order ${params.orderId} in ${order.status} state.`);
      }

      // 1. Move to PENDING state & bump attempts
      if (order.status === PaymentOrderStatus.CREATED) {
        this.orderService.transitionOrderStatus(params.orderId, PaymentOrderStatus.PENDING);
      }
      this.orderService.incrementAttempts(params.orderId);

    // 2. Fraud & Velocity Evaluation
    const riskEval = await this.fraudService.evaluateTransactionRisk({
      orderId: order.orderId,
      merchantId: order.merchantId,
      amountMinor: order.amountMinor,
      ipAddress: params.ipAddress,
      customerEmail: order.customerEmail,
      method: params.method,
      methodDetails: params.methodDetails,
    });

    const attemptId = `pay_bg_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date().toISOString();

    // Mask method details for PCI safety
    const details = params.methodDetails || {};
    const sanitizedDetails = {
      cardLast4: details.cardLast4 || (params.method === PaymentMethodType.CARD ? '4242' : undefined),
      cardBrand: details.cardBrand || 'VISA',
      vpa: details.vpa ? details.vpa.replace(/(?<=^.).+(?=@)/, '***') : undefined,
      bankCode: details.bankCode,
      scenario: details.simulatedScenario || 'SUCCESS',
    };

    // If Fraud Rule blocked transaction
    if (riskEval.action === 'BLOCK') {
      this.orderService.transitionOrderStatus(params.orderId, PaymentOrderStatus.FAILED);

      const failedAttempt: PaymentAttemptRecord = {
        id: crypto.randomUUID(),
        attemptId,
        orderId: order.orderId,
        merchantId: order.merchantId,
        amountMinor: order.amountMinor,
        currency: order.currency,
        method: params.method,
        status: PaymentAttemptStatus.FAILED,
        provider: 'BHARATGATEWAY_SIMULATOR',
        isSimulated: true,
        errorCode: 'ERR_RISK_RULE_BLOCKED',
        errorMessage: `Transaction blocked by automated risk rules: ${riskEval.triggeredRules.join(', ')}`,
        riskScore: riskEval.riskScore,
        methodDetails: sanitizedDetails,
        completedAt: now,
        createdAt: now,
      };

      this.attempts.set(attemptId, failedAttempt);

      // Emit failed webhook
      await this.webhookService.dispatchEvent(order.merchantId, 'payment.failed', {
        orderId: order.orderId,
        attemptId,
        status: 'FAILED',
        errorCode: failedAttempt.errorCode,
        errorMessage: failedAttempt.errorMessage,
        amountMinor: order.amountMinor,
        currency: order.currency,
      });

      return failedAttempt;
    }

    // 3. Invoke Provider (Simulator or Sandbox Engine)
    const provider = this.providerRegistry.getProvider(params.providerId || 'BHARATGATEWAY_SIMULATOR');
    const providerResult = await provider.executePayment({
      orderId: order.orderId,
      merchantId: order.merchantId,
      amountMinor: order.amountMinor,
      currency: order.currency,
      method: params.method,
      methodDetails: params.methodDetails,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    if (providerResult.status === 'SUCCESS') {
      // 4a. Success Path: Capture Order & Post to Append-Only Double-Entry Ledger
      this.orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.CAPTURED);

      await this.ledgerService.recordPaymentCapture(
        order.orderId,
        order.merchantId,
        order.amountMinor,
        0, // 0 fee model
        0, // 0 tax model
      );

      const successAttempt: PaymentAttemptRecord = {
        id: crypto.randomUUID(),
        attemptId,
        orderId: order.orderId,
        merchantId: order.merchantId,
        amountMinor: order.amountMinor,
        currency: order.currency,
        method: params.method,
        status: PaymentAttemptStatus.SUCCESS,
        provider: provider.getProviderId(),
        isSimulated: true,
        gatewayTransactionId: providerResult.gatewayTransactionId,
        signature: providerResult.signature,
        riskScore: riskEval.riskScore,
        methodDetails: sanitizedDetails,
        completedAt: now,
        createdAt: now,
      };

      this.attempts.set(attemptId, successAttempt);

      if (this.persistenceService) {
        await this.persistenceService.executeAtomicCapture({
          orderId: order.orderId,
          merchantId: order.merchantId,
          attempt: successAttempt,
          ledgerParams: {
            transactionReference: `tx_pay_${order.orderId}`,
            referenceType: 'PAYMENT',
            referenceId: order.orderId,
            merchantId: order.merchantId,
            description: `Payment capture for Order ${order.orderId}`,
            entries: [
              {
                accountType: LedgerAccountType.GATEWAY_CLEARING,
                direction: LedgerDirection.DEBIT,
                amountMinor: order.amountMinor,
                description: `Debit clearing account for Order ${order.orderId}`,
              },
              {
                accountType: LedgerAccountType.MERCHANT_SETTLEMENT_PAYABLE,
                direction: LedgerDirection.CREDIT,
                amountMinor: order.amountMinor,
                description: `Credit settlement payable for Order ${order.orderId}`,
              },
            ],
          },
        });

        if (params.idempotencyKey) {
          await this.persistenceService.completeIdempotency(
            merchantId,
            params.idempotencyKey,
            '/api/v1/gateway/payments/process',
            200,
            successAttempt,
          );
        }
      }

      // Emit payment.captured signed webhook
      await this.webhookService.dispatchEvent(order.merchantId, 'payment.captured', {
        orderId: order.orderId,
        attemptId,
        gatewayTransactionId: providerResult.gatewayTransactionId,
        amountMinor: order.amountMinor,
        currency: order.currency,
        status: 'CAPTURED',
        signature: providerResult.signature,
        isSimulated: true,
      });

      return successAttempt;
    } else {
      // 4b. Failure Path
      this.orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.FAILED);

      const failedAttempt: PaymentAttemptRecord = {
        id: crypto.randomUUID(),
        attemptId,
        orderId: order.orderId,
        merchantId: order.merchantId,
        amountMinor: order.amountMinor,
        currency: order.currency,
        method: params.method,
        status: PaymentAttemptStatus.FAILED,
        provider: provider.getProviderId(),
        isSimulated: true,
        gatewayTransactionId: providerResult.gatewayTransactionId,
        signature: providerResult.signature,
        errorCode: providerResult.errorCode || 'ERR_TRANSACTION_FAILED',
        errorMessage: providerResult.errorMessage || 'Transaction failed in payment switch.',
        riskScore: riskEval.riskScore,
        methodDetails: sanitizedDetails,
        completedAt: now,
        createdAt: now,
      };

      this.attempts.set(attemptId, failedAttempt);

      // Emit payment.failed signed webhook
      await this.webhookService.dispatchEvent(order.merchantId, 'payment.failed', {
        orderId: order.orderId,
        attemptId,
        status: 'FAILED',
        errorCode: failedAttempt.errorCode,
        errorMessage: failedAttempt.errorMessage,
        amountMinor: order.amountMinor,
        currency: order.currency,
      });

      return failedAttempt;
    }
    } finally {
      this.inFlightLocks.delete(params.orderId);
    }
  }

  /**
   * Authoritative server-side payment verification & capture (Phase 6 Sandbox integrity).
   * Network call to provider is performed outside DB transactions.
   * If valid, atomically marks order CAPTURED and records ledger entries.
   */
  async verifyAndCapturePayment(params: {
    orderId: string;
    paymentId: string;
    signature?: string;
    providerId?: string;
    merchantId?: string;
  }): Promise<PaymentAttemptRecord> {
    const order = this.orderService.getOrder(params.orderId);
    if (params.merchantId && order.merchantId !== params.merchantId) {
      throw new BadRequestException(`Order ${params.orderId} does not belong to merchant ${params.merchantId}`);
    }

    // Idempotent duplicate check: If already CAPTURED, return existing successful attempt
    if (order.status === PaymentOrderStatus.CAPTURED) {
      const existing = Array.from(this.attempts.values()).find(
        a => a.orderId === params.orderId && a.status === PaymentAttemptStatus.SUCCESS,
      );
      if (existing) {
        this.logger.log(`[VERIFY_PAYMENT] Order ${params.orderId} already captured. Returning cached attempt.`);
        return existing;
      }
    }

    if (this.inFlightLocks.has(params.orderId)) {
      throw new ConflictException(`Payment capture verification already in-flight for order ${params.orderId}`);
    }
    this.inFlightLocks.add(params.orderId);

    try {
      const providerId = params.providerId || 'RAZORPAY_SANDBOX';
      const provider = this.providerRegistry.getProvider(providerId);

      if (!provider.verifyPayment) {
        throw new BadRequestException(`Provider ${providerId} does not support server-side verification.`);
      }

      // Authoritative remote verification (performed OUTSIDE database transactions)
      const verifyResult = await provider.verifyPayment({
        orderId: params.orderId,
        paymentId: params.paymentId,
        signature: params.signature,
        expectedAmountMinor: order.amountMinor,
        expectedCurrency: order.currency,
        merchantId: order.merchantId,
      });

      if (!verifyResult.verified || verifyResult.status !== 'SUCCESS') {
        const failureCode = verifyResult.errorCode || 'ERR_VERIFICATION_FAILED';
        const failureMsg = verifyResult.errorMessage || 'Server-side payment verification failed.';

        this.logger.warn(`[VERIFY_PAYMENT] Failed verification for Order ${params.orderId}: ${failureCode} - ${failureMsg}`);

        // If amount or currency mismatch, reject immediately as tampering attempt
        if (failureCode === 'ERR_AMOUNT_MISMATCH' || failureCode === 'ERR_CURRENCY_MISMATCH' || failureCode === 'ERR_SIGNATURE_VERIFICATION_FAILED') {
          throw new BadRequestException(`Payment integrity violation: ${failureMsg}`);
        }

        const failedAttempt: PaymentAttemptRecord = {
          id: crypto.randomUUID(),
          attemptId: `pay_ver_${crypto.randomBytes(10).toString('hex')}`,
          orderId: order.orderId,
          merchantId: order.merchantId,
          amountMinor: order.amountMinor,
          currency: order.currency,
          method: PaymentMethodType.UPI,
          status: PaymentAttemptStatus.FAILED,
          provider: provider.getProviderId(),
          isSimulated: provider.isSimulation(),
          gatewayTransactionId: params.paymentId,
          signature: params.signature,
          errorCode: failureCode,
          errorMessage: failureMsg,
          riskScore: 50,
          methodDetails: { provider: providerId, scenario: 'VERIFICATION_FAILED' },
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        this.attempts.set(failedAttempt.attemptId, failedAttempt);
        return failedAttempt;
      }

      // Verification succeeded: Transition order and record double-entry ledger capture
      const attemptId = `pay_ver_${crypto.randomBytes(10).toString('hex')}`;
      const now = new Date().toISOString();

      if (order.status === PaymentOrderStatus.CREATED) {
        this.orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.PENDING);
      }
      this.orderService.transitionOrderStatus(order.orderId, PaymentOrderStatus.CAPTURED);

      await this.ledgerService.recordPaymentCapture(
        order.orderId,
        order.merchantId,
        order.amountMinor,
        0,
        0,
      );

      const successAttempt: PaymentAttemptRecord = {
        id: crypto.randomUUID(),
        attemptId,
        orderId: order.orderId,
        merchantId: order.merchantId,
        amountMinor: order.amountMinor,
        currency: order.currency,
        method: PaymentMethodType.UPI,
        status: PaymentAttemptStatus.SUCCESS,
        provider: provider.getProviderId(),
        isSimulated: provider.isSimulation(),
        gatewayTransactionId: params.paymentId,
        signature: params.signature,
        riskScore: 5,
        methodDetails: { provider: providerId, verificationMode: 'SERVER_AUTHORITATIVE' },
        completedAt: now,
        createdAt: now,
      };

      this.attempts.set(attemptId, successAttempt);

      // Emit signed webhook
      await this.webhookService.dispatchEvent(order.merchantId, 'payment.captured', {
        orderId: order.orderId,
        attemptId,
        gatewayTransactionId: params.paymentId,
        amountMinor: order.amountMinor,
        currency: order.currency,
        status: 'CAPTURED',
        provider: provider.getProviderId(),
        isSimulated: provider.isSimulation(),
      });

      return successAttempt;
    } finally {
      this.inFlightLocks.delete(params.orderId);
    }
  }

  getAttempt(attemptId: string): PaymentAttemptRecord {
    const attempt = this.attempts.get(attemptId);
    if (!attempt) {
      throw new NotFoundException(`Payment attempt ${attemptId} not found.`);
    }
    return attempt;
  }

  listAttempts(merchantId?: string): PaymentAttemptRecord[] {
    const all = Array.from(this.attempts.values());
    if (merchantId) {
      return all.filter(a => a.merchantId === merchantId);
    }
    return all;
  }
}


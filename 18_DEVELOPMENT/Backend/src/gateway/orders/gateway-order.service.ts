import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Optional,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentOrderStatus, SUPPORTED_CURRENCIES } from '../domain/gateway.types';
import { GatewayMerchantService } from '../merchants/gateway-merchant.service';
import { GatewayPersistenceService } from '../database/gateway-persistence.service';

export interface CreateOrderParams {
  merchantId: string;
  amountMinor: number;
  currency?: string;
  receipt?: string;
  idempotencyKey?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  returnUrl?: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderRecord {
  id: string; // Internal UUID
  orderId: string; // 'order_bg_...'
  merchantId: string;
  amountMinor: number;
  currency: string;
  receipt?: string;
  status: PaymentOrderStatus;
  idempotencyKey?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  returnUrl?: string;
  notes: Record<string, string>;
  amountRefundedMinor: number;
  attemptsCount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class GatewayOrderService {
  private readonly logger = new Logger(GatewayOrderService.name);
  private readonly orders = new Map<string, PaymentOrderRecord>(); // orderId -> record
  private readonly idempotencyIndex = new Map<string, string>(); // `${merchantId}:${idempKey}` -> orderId

  constructor(
    private readonly merchantService: GatewayMerchantService,
    private readonly persistenceService?: GatewayPersistenceService,
  ) {}

  async createOrder(params: CreateOrderParams): Promise<PaymentOrderRecord> {
    // 1. Verify Merchant Exists & Active
    const merchant = this.merchantService.getMerchant(params.merchantId);
    if (!merchant.isActive) {
      throw new BadRequestException('Merchant account is suspended or inactive.');
    }

    // 2. Durable Idempotency Check (Database-Backed with in-memory fallback)
    if (params.idempotencyKey) {
      if (this.persistenceService) {
        const idempCheck = await this.persistenceService.checkOrAcquireIdempotency(
          params.merchantId,
          params.idempotencyKey,
          '/api/v1/gateway/orders',
          params,
        );
        if (idempCheck.isCached && idempCheck.responseBody) {
          this.logger.warn(
            `[ORDER] Idempotent hit from durable storage for Key: ${params.idempotencyKey}`,
          );
          return idempCheck.responseBody;
        }
      } else {
        const idempKey = `${params.merchantId}:${params.idempotencyKey}`;
        const existingOrderId = this.idempotencyIndex.get(idempKey);
        if (existingOrderId) {
          const existingOrder = this.orders.get(existingOrderId);
          if (existingOrder) {
            this.logger.warn(
              `[ORDER] Idempotent request hit for Key: ${params.idempotencyKey}. Returning existing order ${existingOrderId}`,
            );
            return existingOrder;
          }
        }
      }
    }

    // 3. Amount Validation (Must be positive integer minor units)
    if (!Number.isInteger(params.amountMinor) || params.amountMinor <= 0) {
      throw new BadRequestException('Order amount must be a positive integer in minor units (e.g. ₹100 = 10000 paise).');
    }

    // Prevent integer overflow / absurd amounts
    if (params.amountMinor > 10000000000) { // Max ₹10 Crore
      throw new BadRequestException('Order amount exceeds maximum platform threshold.');
    }

    // 4. Currency Validation
    const currency = (params.currency || merchant.defaultCurrency || 'INR').toUpperCase();
    if (!SUPPORTED_CURRENCIES[currency]) {
      throw new BadRequestException(`Unsupported currency: ${currency}. Supported: ${Object.keys(SUPPORTED_CURRENCIES).join(', ')}`);
    }

    // 5. Generate Order IDs
    const orderId = `order_bg_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins expiry

    const order: PaymentOrderRecord = {
      id: crypto.randomUUID(),
      orderId,
      merchantId: params.merchantId,
      amountMinor: params.amountMinor,
      currency,
      receipt: params.receipt,
      status: PaymentOrderStatus.CREATED,
      idempotencyKey: params.idempotencyKey,
      customerId: params.customerId,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      description: params.description,
      returnUrl: params.returnUrl,
      notes: params.notes || {},
      amountRefundedMinor: 0,
      attemptsCount: 0,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(orderId, order);

    if (params.idempotencyKey) {
      this.idempotencyIndex.set(`${params.merchantId}:${params.idempotencyKey}`, orderId);
      if (this.persistenceService) {
        await this.persistenceService.completeIdempotency(
          params.merchantId,
          params.idempotencyKey,
          '/api/v1/gateway/orders',
          201,
          order,
        );
      }
    }

    if (this.persistenceService) {
      await this.persistenceService.persistOrder(order);
      await this.persistenceService.recordOrderStateTransition(
        orderId,
        params.merchantId,
        'NONE',
        PaymentOrderStatus.CREATED,
        'ORDER_CREATED',
        'MERCHANT_API',
      );
    }

    this.logger.log(`[ORDER] Created order ${orderId} for Merchant ${params.merchantId} (₹${(order.amountMinor / 100).toFixed(2)})`);
    return order;
  }

  getOrder(orderId: string, merchantId?: string): PaymentOrderRecord {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`);
    }

    // Tenant Isolation
    if (merchantId && order.merchantId !== merchantId) {
      throw new NotFoundException(`Order ${orderId} not found for merchant.`);
    }

    return order;
  }

  listOrders(merchantId?: string): PaymentOrderRecord[] {
    const all = Array.from(this.orders.values());
    if (merchantId) {
      return all.filter(o => o.merchantId === merchantId);
    }
    return all;
  }

  /**
   * Safe State Machine Transition Engine
   */
  transitionOrderStatus(orderId: string, newStatus: PaymentOrderStatus): PaymentOrderRecord {
    const order = this.getOrder(orderId);
    const current = order.status;

    // Allowed transition rules matrix
    const allowedTransitions: Record<PaymentOrderStatus, PaymentOrderStatus[]> = {
      [PaymentOrderStatus.CREATED]: [PaymentOrderStatus.PENDING, PaymentOrderStatus.CANCELLED],
      [PaymentOrderStatus.PENDING]: [PaymentOrderStatus.AUTHORIZED, PaymentOrderStatus.CAPTURED, PaymentOrderStatus.FAILED, PaymentOrderStatus.CANCELLED],
      [PaymentOrderStatus.AUTHORIZED]: [PaymentOrderStatus.CAPTURED, PaymentOrderStatus.FAILED, PaymentOrderStatus.CANCELLED],
      [PaymentOrderStatus.CAPTURED]: [PaymentOrderStatus.PARTIALLY_REFUNDED, PaymentOrderStatus.REFUNDED],
      [PaymentOrderStatus.PARTIALLY_REFUNDED]: [PaymentOrderStatus.PARTIALLY_REFUNDED, PaymentOrderStatus.REFUNDED],
      [PaymentOrderStatus.REFUNDED]: [],
      [PaymentOrderStatus.FAILED]: [],
      [PaymentOrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[current].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid payment order state transition from ${current} to ${newStatus}. Transition rejected by state engine.`,
      );
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    this.orders.set(orderId, order);

    if (this.persistenceService) {
      this.persistenceService
        .recordOrderStateTransition(
          orderId,
          order.merchantId,
          current,
          newStatus,
          'STATE_MACHINE_TRANSITION',
          'SYSTEM',
        )
        .catch(() => {});
      this.persistenceService.persistOrder(order).catch(() => {});
    }

    this.logger.log(`[ORDER STATE] Order ${orderId} transitioned: ${current} -> ${newStatus}`);
    return order;
  }

  incrementAttempts(orderId: string): void {
    const order = this.getOrder(orderId);
    order.attemptsCount += 1;
    order.updatedAt = new Date().toISOString();
    this.orders.set(orderId, order);
  }

  recordRefund(orderId: string, refundAmountMinor: number): PaymentOrderRecord {
    const order = this.getOrder(orderId);

    if (order.status !== PaymentOrderStatus.CAPTURED && order.status !== PaymentOrderStatus.PARTIALLY_REFUNDED) {
      throw new BadRequestException(`Cannot refund order in ${order.status} status.`);
    }

    const newTotalRefunded = order.amountRefundedMinor + refundAmountMinor;
    if (newTotalRefunded > order.amountMinor) {
      throw new BadRequestException(
        `Refund amount (₹${(refundAmountMinor / 100).toFixed(2)}) exceeds remaining refundable balance (₹${((order.amountMinor - order.amountRefundedMinor) / 100).toFixed(2)}).`,
      );
    }

    order.amountRefundedMinor = newTotalRefunded;
    const nextStatus = newTotalRefunded === order.amountMinor ? PaymentOrderStatus.REFUNDED : PaymentOrderStatus.PARTIALLY_REFUNDED;

    return this.transitionOrderStatus(orderId, nextStatus);
  }
}

import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PaymentProvider,
  CreatePaymentSessionParams,
  PaymentSessionResult,
  ExecutePaymentParams,
  ExecutePaymentResult,
  ProcessRefundParams,
  ProcessRefundResult,
  SettlementBatchParams,
  SettlementBatchResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  FetchRefundStatusResult,
} from './payment-provider.interface';

export interface RazorpaySandboxConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  baseUrl: string;
  enableLivePayments: boolean;
  requestTimeoutMs: number;
}

@Injectable()
export class RazorpaySandboxAdapter implements PaymentProvider {
  private readonly logger = new Logger(RazorpaySandboxAdapter.name);
  private readonly config: RazorpaySandboxConfig;

  // In-memory contract mock store for sandbox testing when real network credentials are absent
  private readonly mockOrders = new Map<string, any>();
  private readonly mockPayments = new Map<string, any>();
  private readonly mockRefunds = new Map<string, any>();

  constructor() {
    const keyId = process.env.RAZORPAY_SANDBOX_KEY_ID || 'rzp_test_placeholder_key';
    const keySecret = process.env.RAZORPAY_SANDBOX_KEY_SECRET || 'rzp_test_placeholder_secret_key';
    const webhookSecret = process.env.RAZORPAY_SANDBOX_WEBHOOK_SECRET || 'rzp_whsec_placeholder_secret';
    const enableLivePayments = process.env.ENABLE_LIVE_PAYMENTS === 'true';

    if (enableLivePayments) {
      throw new ForbiddenException(
        '[SECURITY VIOLATION] ENABLE_LIVE_PAYMENTS cannot be enabled during Phase 6 sandbox verification. Live payments strictly prohibited.',
      );
    }

    this.config = {
      keyId,
      keySecret,
      webhookSecret,
      baseUrl: process.env.RAZORPAY_BASE_URL || 'https://api.razorpay.com/v1',
      enableLivePayments: false,
      requestTimeoutMs: Number(process.env.RAZORPAY_TIMEOUT_MS) || 5000,
    };

    this.logger.log(
      `[RazorpaySandboxAdapter] Initialized in SANDBOX mode. HasRealCredentials: ${this.hasRealCredentials()} (LivePayments: STRICTLY_DISABLED)`,
    );
  }

  getProviderId(): string {
    return 'RAZORPAY_SANDBOX';
  }

  isSimulation(): boolean {
    return true; // Strictly sandbox/test environment
  }

  isLiveAuthorized(): boolean {
    return false; // Live payment processing disabled
  }

  hasRealCredentials(): boolean {
    return (
      this.config.keyId.startsWith('rzp_test_') &&
      this.config.keyId !== 'rzp_test_placeholder_key' &&
      this.config.keySecret !== 'rzp_test_placeholder_secret_key'
    );
  }

  /**
   * 1. Create a Sandbox Order / Session
   */
  async createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    const orderId = params.orderId;
    const rzpOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const orderData = {
      id: rzpOrderId,
      entity: 'order',
      amount: params.amountMinor,
      amount_paid: 0,
      amount_due: params.amountMinor,
      currency: params.currency || 'INR',
      receipt: orderId,
      status: 'created',
      attempts: 0,
      notes: {
        orderId,
        merchantId: params.merchantId,
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    if (this.hasRealCredentials()) {
      try {
        const res = await this.executeHttpRequest('/orders', 'POST', {
          amount: params.amountMinor,
          currency: params.currency || 'INR',
          receipt: orderId,
          notes: { orderId, merchantId: params.merchantId },
        });
        this.logger.log(`[RAZORPAY_SANDBOX: LIVE_API] Created sandbox order ${res.id} for order ${orderId}`);
        return {
          sessionId: res.id,
          orderId,
          provider: this.getProviderId(),
          checkoutUrl: `/payment-gateway/checkout/${orderId}?provider=RAZORPAY_SANDBOX&rzp_order=${res.id}`,
          isSimulated: true,
          expiresAt,
        };
      } catch (err: any) {
        this.logger.warn(`[RAZORPAY_SANDBOX] External order creation failed (${err.message}). Falling back to contract mock.`);
      }
    }

    // Contract mock fallback
    this.mockOrders.set(rzpOrderId, orderData);
    this.mockOrders.set(orderId, orderData);

    return {
      sessionId: rzpOrderId,
      orderId,
      provider: this.getProviderId(),
      checkoutUrl: `/payment-gateway/checkout/${orderId}?provider=RAZORPAY_SANDBOX&rzp_order=${rzpOrderId}`,
      isSimulated: true,
      expiresAt,
    };
  }

  /**
   * 2. Execute Payment in Sandbox
   */
  async executePayment(params: ExecutePaymentParams): Promise<ExecutePaymentResult> {
    const attemptId = `pay_rzp_${crypto.randomBytes(10).toString('hex')}`;
    const scenario = params.methodDetails?.simulatedScenario || 'SUCCESS';
    const now = new Date().toISOString();

    if (scenario === 'BANK_TIMEOUT') {
      return {
        attemptId,
        orderId: params.orderId,
        provider: this.getProviderId(),
        status: 'PENDING',
        isSimulated: true,
        gatewayTransactionId: `txn_rzp_timeout_${crypto.randomBytes(6).toString('hex')}`,
        signature: '',
        errorCode: 'ERR_PROVIDER_TIMEOUT',
        errorMessage: 'Razorpay Sandbox acquiring bank network response timed out.',
        riskScore: 20,
        completedAt: now,
      };
    }

    if (scenario === 'INSUFFICIENT_FUNDS' || scenario === 'INCORRECT_PIN' || scenario === 'CARD_EXPIRED') {
      const errMap: Record<string, { code: string; msg: string }> = {
        INSUFFICIENT_FUNDS: { code: 'BAD_REQUEST_PAYMENT_ACCOUNT_INSUFFICIENT_BALANCE', msg: 'The bank account has insufficient funds to complete the payment.' },
        INCORRECT_PIN: { code: 'BAD_REQUEST_PAYMENT_PIN_INCORRECT', msg: 'The customer PIN entered was incorrect.' },
        CARD_EXPIRED: { code: 'BAD_REQUEST_PAYMENT_CARD_EXPIRED', msg: 'Card is expired.' },
      };
      const mapped = errMap[scenario] || { code: 'BAD_REQUEST_ERROR', msg: 'Payment failed in sandbox' };

      return {
        attemptId,
        orderId: params.orderId,
        provider: this.getProviderId(),
        status: 'FAILED',
        isSimulated: true,
        gatewayTransactionId: `txn_rzp_${crypto.randomBytes(8).toString('hex')}`,
        signature: '',
        errorCode: this.mapProviderErrorCode(mapped.code),
        errorMessage: mapped.msg,
        riskScore: 15,
        completedAt: now,
      };
    }

    // Success path
    const paymentId = attemptId;
    const signature = this.generatePaymentSignature(params.orderId, paymentId);

    const paymentRecord = {
      id: paymentId,
      entity: 'payment',
      amount: params.amountMinor,
      currency: params.currency || 'INR',
      status: 'captured',
      order_id: params.orderId,
      method: params.method?.toLowerCase() || 'upi',
      captured: true,
      description: `Payment for Order ${params.orderId}`,
      created_at: Math.floor(Date.now() / 1000),
    };
    this.mockPayments.set(paymentId, paymentRecord);

    return {
      attemptId,
      orderId: params.orderId,
      provider: this.getProviderId(),
      status: 'SUCCESS',
      isSimulated: true,
      gatewayTransactionId: paymentId,
      signature,
      riskScore: 5,
      completedAt: now,
    };
  }

  /**
   * 3. Authoritative Server-Side Payment Verification
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const { orderId, paymentId, signature, expectedAmountMinor, expectedCurrency } = params;

    // A. Verify Signature if provided
    if (signature) {
      const expectedSig = this.generatePaymentSignature(orderId, paymentId);
      const isSigValid = this.safeCompare(expectedSig, signature);
      if (!isSigValid) {
        return {
          verified: false,
          status: 'FAILED',
          errorCode: 'ERR_SIGNATURE_VERIFICATION_FAILED',
          errorMessage: 'Razorpay payment signature mismatch or corrupted callback payload.',
        };
      }
    }

    // B. Fetch authoritative payment status
    let paymentData: any = null;
    if (this.hasRealCredentials()) {
      try {
        paymentData = await this.executeHttpRequest(`/payments/${paymentId}`, 'GET');
      } catch (err: any) {
        this.logger.warn(`[RAZORPAY_SANDBOX] Remote payment fetch failed (${err.message}). Checking mock store.`);
      }
    }

    if (!paymentData) {
      paymentData = this.mockPayments.get(paymentId);
    }

    if (!paymentData) {
      return {
        verified: false,
        status: 'FAILED',
        errorCode: 'ERR_PAYMENT_NOT_FOUND',
        errorMessage: `Authoritative provider payment ${paymentId} not found.`,
      };
    }

    // C. Verify Amount & Currency Consistency
    if (expectedAmountMinor !== undefined && paymentData.amount !== expectedAmountMinor) {
      return {
        verified: false,
        status: 'FAILED',
        amountMinor: paymentData.amount,
        currency: paymentData.currency,
        errorCode: 'ERR_AMOUNT_MISMATCH',
        errorMessage: `Payment amount ₹${(paymentData.amount / 100).toFixed(2)} does not match order amount ₹${(expectedAmountMinor / 100).toFixed(2)}.`,
      };
    }

    if (expectedCurrency !== undefined && paymentData.currency.toUpperCase() !== expectedCurrency.toUpperCase()) {
      return {
        verified: false,
        status: 'FAILED',
        amountMinor: paymentData.amount,
        currency: paymentData.currency,
        errorCode: 'ERR_CURRENCY_MISMATCH',
        errorMessage: `Payment currency ${paymentData.currency} does not match expected currency ${expectedCurrency}.`,
      };
    }

    const isCaptured = paymentData.status === 'captured' || paymentData.captured === true;
    return {
      verified: isCaptured,
      status: isCaptured ? 'SUCCESS' : paymentData.status === 'failed' ? 'FAILED' : 'PENDING',
      amountMinor: paymentData.amount,
      currency: paymentData.currency,
      providerPaymentId: paymentData.id,
      rawDetails: paymentData,
    };
  }

  /**
   * 4. Webhook Signature Verification (HMAC-SHA256)
   */
  verifyWebhookSignature(rawPayload: string, signature: string, secret?: string): boolean {
    if (!signature || !rawPayload) return false;
    const webhookSecret = secret || this.config.webhookSecret;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    return this.safeCompare(expectedSignature, signature);
  }

  /**
   * 5. Process Refund
   */
  async processRefund(params: ProcessRefundParams): Promise<ProcessRefundResult> {
    const providerRefundId = `rfnd_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    if (this.hasRealCredentials()) {
      try {
        const res = await this.executeHttpRequest(`/payments/${params.attemptId}/refund`, 'POST', {
          amount: params.amountMinor,
          notes: {
            refundId: params.refundId,
            orderId: params.orderId,
            reason: params.reason,
          },
        });
        return {
          refundId: params.refundId,
          status: 'COMPLETED',
          providerRefundId: res.id,
          isSimulated: true,
          processedAt: now,
        };
      } catch (err: any) {
        this.logger.warn(`[RAZORPAY_SANDBOX] Remote refund failed (${err.message}). Recording mock refund.`);
      }
    }

    const mockRecord = {
      id: providerRefundId,
      entity: 'refund',
      amount: params.amountMinor,
      currency: params.currency || 'INR',
      payment_id: params.attemptId,
      status: 'processed',
      notes: { refundId: params.refundId, orderId: params.orderId },
      created_at: Math.floor(Date.now() / 1000),
    };
    this.mockRefunds.set(providerRefundId, mockRecord);
    this.mockRefunds.set(params.refundId, mockRecord);

    return {
      refundId: params.refundId,
      status: 'COMPLETED',
      providerRefundId,
      isSimulated: true,
      processedAt: now,
    };
  }

  /**
   * 6. Retrieve Refund Status & Handle Uncertain Outcomes
   */
  async fetchRefundStatus(refundId: string, providerRefundId?: string): Promise<FetchRefundStatusResult> {
    const targetId = providerRefundId || refundId;
    let refundData: any = null;

    if (this.hasRealCredentials() && providerRefundId) {
      try {
        refundData = await this.executeHttpRequest(`/refunds/${providerRefundId}`, 'GET');
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message?.includes('timeout')) {
          return {
            refundId,
            providerRefundId,
            status: 'UNCERTAIN',
            errorCode: 'ERR_PROVIDER_TIMEOUT',
            errorMessage: 'Timeout contacting Razorpay Sandbox API. Refund status is UNCERTAIN.',
          };
        }
      }
    }

    if (!refundData) {
      refundData = this.mockRefunds.get(targetId);
    }

    if (!refundData) {
      return {
        refundId,
        providerRefundId,
        status: 'UNCERTAIN',
        errorCode: 'ERR_REFUND_NOT_FOUND',
        errorMessage: `Refund ${targetId} could not be authoritatively verified.`,
      };
    }

    const isProcessed = refundData.status === 'processed';
    return {
      refundId,
      providerRefundId: refundData.id,
      status: isProcessed ? 'COMPLETED' : refundData.status === 'failed' ? 'FAILED' : 'PENDING',
      amountMinor: refundData.amount,
      currency: refundData.currency,
    };
  }

  /**
   * 7. Settlement Batch
   */
  async fetchSettlement(params: SettlementBatchParams): Promise<SettlementBatchResult> {
    const now = new Date().toISOString();
    return {
      batchId: `set_rzp_${Date.now()}`,
      merchantId: params.merchantId,
      totalOrders: 1,
      grossAmountMinor: 100000,
      netSettlementMinor: 100000,
      feeMinor: 0,
      taxMinor: 0,
      status: 'SETTLED',
      settledAt: now,
    };
  }

  /**
   * Safe mapping from external provider errors to normalized internal error codes
   */
  mapProviderErrorCode(providerCode?: string): string {
    if (!providerCode) return 'ERR_PAYMENT_FAILED';
    const code = providerCode.toUpperCase();
    if (code.includes('TIMEOUT') || code.includes('GATEWAY_TIMEOUT')) return 'ERR_PROVIDER_TIMEOUT';
    if (code.includes('INSUFFICIENT')) return 'ERR_INSUFFICIENT_FUNDS';
    if (code.includes('PIN') || code.includes('AUTH') || code.includes('OTP')) return 'ERR_AUTHENTICATION_PIN_FAILED';
    if (code.includes('EXPIRED')) return 'ERR_CARD_EXPIRED';
    if (code.includes('BAD_REQUEST') || code.includes('INVALID')) return 'ERR_INVALID_REQUEST';
    if (code.includes('DUPLICATE')) return 'ERR_DUPLICATE_TRANSACTION';
    return 'ERR_PAYMENT_FAILED';
  }

  /**
   * Generate official Razorpay payment signature: HMAC-SHA256(order_id + '|' + payment_id, secret)
   */
  generatePaymentSignature(orderId: string, paymentId: string): string {
    return crypto
      .createHmac('sha256', this.config.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
  }

  private safeCompare(a: string, b: string): boolean {
    if (!a || !b || a.length !== b.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
    } catch {
      return false;
    }
  }

  private async executeHttpRequest(path: string, method: 'GET' | 'POST', body?: any): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

    try {
      const authHeader = `Basic ${Buffer.from(`${this.config.keyId}:${this.config.keySecret}`).toString('base64')}`;
      const url = `${this.config.baseUrl}${path}`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'BharatGateway/1.0 (Sandbox Engine)',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const errorDesc = json?.error?.description || json?.error?.reason || `HTTP ${res.status}`;
        throw new Error(errorDesc);
      }

      return json;
    } finally {
      clearTimeout(timeout);
    }
  }
}

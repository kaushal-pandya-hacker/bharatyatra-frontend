import { PaymentMethodType } from '../domain/gateway.types';

export interface CreatePaymentSessionParams {
  orderId: string;
  merchantId: string;
  amountMinor: number;
  currency: string;
  returnUrl?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

export interface PaymentSessionResult {
  sessionId: string;
  orderId: string;
  provider: string;
  checkoutUrl: string;
  isSimulated: boolean;
  expiresAt: string;
}

export interface ExecutePaymentParams {
  orderId: string;
  merchantId: string;
  amountMinor: number;
  currency: string;
  method: PaymentMethodType;
  methodDetails: {
    vpa?: string;
    cardLast4?: string;
    cardExpiry?: string;
    cardBrand?: string;
    bankCode?: string;
    simulatedScenario?: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'INCORRECT_PIN' | 'BANK_TIMEOUT' | 'CARD_EXPIRED' | 'FRAUD_BLOCKED';
  };
  ipAddress?: string;
  userAgent?: string;
}

export interface ExecutePaymentResult {
  attemptId: string;
  orderId: string;
  provider: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  isSimulated: boolean;
  gatewayTransactionId: string;
  signature: string;
  errorCode?: string;
  errorMessage?: string;
  riskScore: number;
  completedAt?: string;
}

export interface ProcessRefundParams {
  refundId: string;
  orderId: string;
  attemptId: string;
  merchantId: string;
  amountMinor: number;
  currency: string;
  reason: string;
}

export interface ProcessRefundResult {
  refundId: string;
  status: 'COMPLETED' | 'FAILED';
  providerRefundId: string;
  isSimulated: boolean;
  processedAt: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface SettlementBatchParams {
  merchantId: string;
  windowStart: string;
  windowEnd: string;
}

export interface SettlementBatchResult {
  batchId: string;
  merchantId: string;
  totalOrders: number;
  grossAmountMinor: number;
  netSettlementMinor: number;
  feeMinor: number;
  taxMinor: number;
  status: 'SETTLED' | 'PENDING';
  settledAt: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature?: string;
  expectedAmountMinor?: number;
  expectedCurrency?: string;
  merchantId?: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  amountMinor?: number;
  currency?: string;
  providerPaymentId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawDetails?: any;
}

export interface FetchRefundStatusResult {
  refundId: string;
  providerRefundId?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'UNCERTAIN';
  amountMinor?: number;
  currency?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentProvider {
  getProviderId(): string;
  isSimulation(): boolean;
  isLiveAuthorized(): boolean;
  createPaymentSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult>;
  executePayment(params: ExecutePaymentParams): Promise<ExecutePaymentResult>;
  processRefund(params: ProcessRefundParams): Promise<ProcessRefundResult>;
  fetchSettlement(params: SettlementBatchParams): Promise<SettlementBatchResult>;
  verifyPayment?(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  verifyWebhookSignature?(rawPayload: string, signature: string, secret?: string): boolean;
  fetchRefundStatus?(refundId: string, providerRefundId?: string): Promise<FetchRefundStatusResult>;
}


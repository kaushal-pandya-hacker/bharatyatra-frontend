export interface CreatePaymentOrderInput {
  bookingId: string;
  customerId: string;
  amountInr: number;
  currency?: string;
  paymentMethod?: string;
  idempotencyKey?: string;
}

export interface PaymentOrderResult {
  paymentOrderId: string;
  gatewayOrderId: string;
  provider: string;
  status: string;
  amountInr: number;
  currency: string;
  expiresAt: string;
  checkoutUrl?: string;
}

export interface VerifyPaymentInput {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

export interface WebhookPayload {
  event: string;
  provider: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  amountInr?: number;
  signature?: string;
  rawPayload: any;
}

export interface RefundInput {
  paymentId: string;
  gatewayTransactionId?: string;
  amountInr: number;
  reason: string;
}

export interface RefundResult {
  refundId: string;
  providerRefundId: string;
  status: string;
  amountInr: number;
}

export interface IPaymentProvider {
  createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyPaymentSignature(input: VerifyPaymentInput): Promise<boolean>;
  verifyWebhookSignature(payload: any, signature: string): Promise<boolean>;
  processRefund(input: RefundInput): Promise<RefundResult>;
}

export interface PaymentCheckoutParams {
  bookingId: string;
  amountInr: number;
  currency: string;
  paymentMethod: string;
}

export interface PaymentProvider {
  createCheckoutSession(params: PaymentCheckoutParams): Promise<any>;
  verifyWebhook(payload: any, signature: string): Promise<any>;
  initiateRefund(paymentId: string, amountInr: number, reason: string): Promise<any>;
}

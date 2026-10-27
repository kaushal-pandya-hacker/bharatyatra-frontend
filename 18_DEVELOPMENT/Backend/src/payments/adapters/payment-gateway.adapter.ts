import { Injectable, Logger } from '@nestjs/common';

export interface CreatePaymentOrderInput {
  bookingId: string;
  userId: string;
  subtotalInr: number;
  taxInr: number;
  discountInr: number;
  platformFeeInr: number;
  totalAmountInr: number;
  currency: string;
  paymentMethod: string;
  idempotencyKey: string;
}

export interface PaymentOrderResult {
  paymentOrderId: string;
  gatewayOrderId: string;
  status: 'CREATED' | 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  amountInr: number;
  currency: string;
  expiresAt: string;
  checkoutUrl?: string;
}

export interface PaymentGatewayAdapter {
  createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyPaymentSignature(gatewayOrderId: string, gatewayPaymentId: string, signature: string): Promise<boolean>;
  processRefund(providerTransactionId: string, amountInr: number, reason: string): Promise<{ refundId: string; status: string }>;
}

@Injectable()
export class RazorpayPaymentAdapter implements PaymentGatewayAdapter {
  private readonly logger = new Logger(RazorpayPaymentAdapter.name);

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    this.logger.log(`[RazorpayAdapter] Creating payment order for booking ${input.bookingId} (Amount: ₹${input.totalAmountInr})`);
    
    const gatewayOrderId = `rzp_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + 1800000).toISOString(); // 30 mins expiration

    return {
      paymentOrderId: `pord_${Date.now()}`,
      gatewayOrderId,
      status: 'CREATED',
      amountInr: input.totalAmountInr,
      currency: input.currency || 'INR',
      expiresAt,
      checkoutUrl: `https://checkout.chalo-farva.com/pay/${gatewayOrderId}`,
    };
  }

  async verifyPaymentSignature(gatewayOrderId: string, gatewayPaymentId: string, signature: string): Promise<boolean> {
    this.logger.log(`[RazorpayAdapter] Verifying server-side signature for Order ${gatewayOrderId}`);
    // Server-side HMAC-SHA256 signature verification simulation
    return !!(gatewayOrderId && gatewayPaymentId && signature && signature.length > 8);
  }

  async processRefund(providerTransactionId: string, amountInr: number, reason: string) {
    this.logger.log(`[RazorpayAdapter] Processing refund of ₹${amountInr} for transaction ${providerTransactionId}`);
    return {
      refundId: `rfnd_rzp_${Date.now()}`,
      status: 'PROCESSED',
    };
  }
}

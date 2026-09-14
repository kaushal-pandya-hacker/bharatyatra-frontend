import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentProvider,
  CreatePaymentOrderInput,
  PaymentOrderResult,
  VerifyPaymentInput,
  RefundInput,
  RefundResult,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class SandboxPaymentProvider implements IPaymentProvider {
  private readonly logger = new Logger(SandboxPaymentProvider.name);

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    this.logger.log(`[SandboxPaymentProvider] Creating sandbox order for booking ${input.bookingId} (Amount: ₹${input.amountInr})`);
    
    const gatewayOrderId = `sandbox_order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + 1800000).toISOString();

    return {
      paymentOrderId: `pord_${Date.now()}`,
      gatewayOrderId,
      provider: 'SANDBOX',
      status: 'CREATED',
      amountInr: input.amountInr,
      currency: input.currency || 'INR',
      expiresAt,
      checkoutUrl: `http://localhost:3000/bookings/${input.bookingId}/pay?orderId=${gatewayOrderId}`,
    };
  }

  async verifyPaymentSignature(input: VerifyPaymentInput): Promise<boolean> {
    this.logger.log(`[SandboxPaymentProvider] Verifying payment signature for gatewayOrderId: ${input.gatewayOrderId}`);
    // In Sandbox mode, any valid signature string (or mock signature) is accepted
    return !!(input.gatewayOrderId && input.gatewayPaymentId && input.signature);
  }

  async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    this.logger.log(`[SandboxPaymentProvider] Verifying webhook signature`);
    return !!(signature && signature !== 'invalid_signature');
  }

  async processRefund(input: RefundInput): Promise<RefundResult> {
    this.logger.log(`[SandboxPaymentProvider] Processing sandbox refund of ₹${input.amountInr} for payment ${input.paymentId}`);
    return {
      refundId: `rfnd_sb_${Date.now()}`,
      providerRefundId: `sandbox_ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'COMPLETED',
      amountInr: input.amountInr,
    };
  }
}

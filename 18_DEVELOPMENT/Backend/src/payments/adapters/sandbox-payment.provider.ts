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

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    return this.createPaymentOrder(input);
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    return this.verifyPaymentSignature(input);
  }

  async capturePayment(gatewayPaymentId: string, amountInr: number): Promise<{ success: boolean; status: string }> {
    this.logger.log(`[SandboxPaymentProvider] Capturing payment ${gatewayPaymentId} for amount ₹${amountInr}`);
    return { success: true, status: 'CAPTURED' };
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    return this.processRefund(input);
  }

  async getPaymentStatus(gatewayOrderId: string): Promise<{ status: string; gatewayPaymentId?: string; amountInr?: number }> {
    this.logger.log(`[SandboxPaymentProvider] Getting payment status for gateway order ${gatewayOrderId}`);
    return {
      status: 'PAID',
      gatewayPaymentId: `pay_sb_${Date.now()}`,
      amountInr: 1000,
    };
  }

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    this.logger.log(`[SandboxPaymentProvider] Creating sandbox order for booking ${input.bookingId} (Amount: ₹${input.amountInr})`);
    
    const gatewayOrderId = `sandbox_order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + 1800000).toISOString();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

    return {
      paymentOrderId: `pord_${Date.now()}`,
      gatewayOrderId,
      provider: 'SANDBOX',
      status: 'CREATED',
      amountInr: input.amountInr,
      currency: input.currency || 'INR',
      expiresAt,
      checkoutUrl: `${frontendUrl}/bookings/${input.bookingId}/pay?orderId=${gatewayOrderId}`,
    };
  }

  async verifyPaymentSignature(input: VerifyPaymentInput): Promise<boolean> {
    this.logger.log(`[SandboxPaymentProvider] Verifying payment signature for gatewayOrderId: ${input.gatewayOrderId}`);
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


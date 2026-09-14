import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider, PaymentCheckoutParams } from '../interfaces/payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(MockPaymentProvider.name);
  public readonly isDevelopmentMock = true;

  async createCheckoutSession(params: PaymentCheckoutParams): Promise<any> {
    this.logger.log(`[DEVELOPMENT MOCK] Creating Razorpay / UPI mock payment session for booking ${params.bookingId}`);
    return {
      provider: 'DEVELOPMENT MOCK - RAZORPAY / UPI',
      gatewayOrderId: `mock_order_${Date.now()}`,
      amountInr: params.amountInr,
      currency: params.currency || 'INR',
      status: 'MOCK_INITIATED',
      checkoutUrl: `http://localhost:5000/api/v1/payments/mock-checkout?order_id=mock_order_${Date.now()}`,
      isDevelopmentMock: true
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<any> {
    return {
      verified: true,
      event: payload.event || 'mock.payment.captured',
      gatewayPaymentId: `mock_pay_${Date.now()}`,
      isDevelopmentMock: true
    };
  }

  async initiateRefund(paymentId: string, amountInr: number, reason: string): Promise<any> {
    return {
      refundId: `mock_rfnd_${Date.now()}`,
      status: 'MOCK_REFUND_PROCESSING',
      amountInr,
      isDevelopmentMock: true
    };
  }
}

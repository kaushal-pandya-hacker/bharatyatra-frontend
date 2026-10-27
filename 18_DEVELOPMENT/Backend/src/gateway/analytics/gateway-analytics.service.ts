import { Injectable, Logger } from '@nestjs/common';
import { PaymentOrderStatus } from '../domain/gateway.types';
import { GatewayOrderService } from '../orders/gateway-order.service';
import { GatewayPaymentService } from '../payments/gateway-payment.service';
import { GatewayRefundService } from '../refunds/gateway-refund.service';

export interface AnalyticsSummary {
  merchantId?: string;
  totalOrdersCount: number;
  totalCapturedOrdersCount: number;
  totalFailedOrdersCount: number;
  grossVolumeMinor: number;
  netCapturedMinor: number;
  refundedVolumeMinor: number;
  overallSuccessRatePct: number;
  methodBreakdown: Record<string, { count: number; volumeMinor: number }>;
  generatedAt: string;
}

@Injectable()
export class GatewayAnalyticsService {
  private readonly logger = new Logger(GatewayAnalyticsService.name);

  constructor(
    private readonly orderService: GatewayOrderService,
    private readonly paymentService: GatewayPaymentService,
    private readonly refundService: GatewayRefundService,
  ) {}

  getAnalyticsSummary(merchantId?: string): AnalyticsSummary {
    const orders = this.orderService.listOrders(merchantId);
    const attempts = this.paymentService.listAttempts(merchantId);
    const refunds = this.refundService.listRefunds(merchantId);

    let grossVolumeMinor = 0;
    let netCapturedMinor = 0;
    let refundedVolumeMinor = 0;
    let capturedCount = 0;
    let failedCount = 0;

    const methodBreakdown: Record<string, { count: number; volumeMinor: number }> = {
      UPI: { count: 0, volumeMinor: 0 },
      CARD: { count: 0, volumeMinor: 0 },
      NETBANKING: { count: 0, volumeMinor: 0 },
      WALLET: { count: 0, volumeMinor: 0 },
    };

    for (const order of orders) {
      grossVolumeMinor += order.amountMinor;

      if (order.status === PaymentOrderStatus.CAPTURED || order.status === PaymentOrderStatus.PARTIALLY_REFUNDED || order.status === PaymentOrderStatus.REFUNDED) {
        capturedCount++;
        netCapturedMinor += order.amountMinor;
      } else if (order.status === PaymentOrderStatus.FAILED) {
        failedCount++;
      }

      refundedVolumeMinor += order.amountRefundedMinor;
    }

    for (const attempt of attempts) {
      const method = attempt.method || 'UPI';
      if (!methodBreakdown[method]) {
        methodBreakdown[method] = { count: 0, volumeMinor: 0 };
      }
      methodBreakdown[method].count++;
      if (attempt.status === 'SUCCESS') {
        methodBreakdown[method].volumeMinor += attempt.amountMinor;
      }
    }

    const totalProcessedAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => a.status === 'SUCCESS').length;
    const overallSuccessRatePct = totalProcessedAttempts > 0
      ? Math.round((successfulAttempts / totalProcessedAttempts) * 1000) / 10
      : 100.0;

    return {
      merchantId,
      totalOrdersCount: orders.length,
      totalCapturedOrdersCount: capturedCount,
      totalFailedOrdersCount: failedCount,
      grossVolumeMinor,
      netCapturedMinor,
      refundedVolumeMinor,
      overallSuccessRatePct,
      methodBreakdown,
      generatedAt: new Date().toISOString(),
    };
  }

  generateOrdersCsv(merchantId?: string): string {
    const orders = this.orderService.listOrders(merchantId);
    const headers = ['OrderId', 'MerchantId', 'AmountINR', 'Currency', 'Status', 'Receipt', 'RefundedINR', 'CreatedAt'];
    const rows = orders.map(o => [
      o.orderId,
      o.merchantId,
      (o.amountMinor / 100).toFixed(2),
      o.currency,
      o.status,
      o.receipt || '',
      (o.amountRefundedMinor / 100).toFixed(2),
      o.createdAt,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

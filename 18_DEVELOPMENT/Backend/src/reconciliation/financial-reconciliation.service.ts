import { Injectable, Logger } from '@nestjs/common';
import { RefundEngineService } from '../refunds/refund-engine.service';

export interface ReconciliationRecord {
  reconciliationId: string;
  bookingId: string;
  paymentOrderId: string;
  paymentStatus: string;
  providerBookingStatus: string;
  reconciliationStatus: 'MATCHED' | 'MISMATCHED' | 'MISSING' | 'DUPLICATE' | 'PENDING_REVIEW' | 'RESOLVED';
  discrepancyReason?: string;
  automatedRefundTriggered: boolean;
  refundId?: string;
  createdAt: string;
}

@Injectable()
export class FinancialReconciliationService {
  private readonly logger = new Logger(FinancialReconciliationService.name);
  private readonly reconciliationStore = new Map<string, ReconciliationRecord>();

  constructor(private readonly refundEngine: RefundEngineService) {}

  async reconcileBookingPayment(
    bookingId: string,
    paymentOrderId: string,
    paymentStatus: string,
    providerBookingStatus: string,
    paidAmountInr: number
  ): Promise<ReconciliationRecord> {
    this.logger.log(`[FinancialReconciliationService] Performing 4-way reconciliation check for Booking ${bookingId}`);

    const reconciliationId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // CRITICAL SCENARIO: PAYMENT SUCCESS + PROVIDER BOOKING FAILED
    if (paymentStatus === 'SUCCESS' && providerBookingStatus === 'FAILED') {
      this.logger.error(`[FinancialReconciliationService] CRITICAL EDGE CASE DETECTED: Payment SUCCESS but Provider Booking FAILED for Booking ${bookingId}! Triggering automated 100% refund.`);

      // 1. Calculate 100% refund
      const calcResult = this.refundEngine.calculateRefund(
        paidAmountInr,
        { policyType: 'FREE_CANCELLATION', hoursBeforeDeparture: 100 },
        100,
        true // isProviderBookingFailed = true
      );

      // 2. Execute refund
      const refundRecord = await this.refundEngine.processRefundRequest(
        bookingId,
        calcResult,
        `auto_recon_${reconciliationId}`
      );

      const record: ReconciliationRecord = {
        reconciliationId,
        bookingId,
        paymentOrderId,
        paymentStatus,
        providerBookingStatus,
        reconciliationStatus: 'RESOLVED',
        discrepancyReason: 'Payment captured successfully but third-party vendor booking failed. Auto-refunded 100% to customer.',
        automatedRefundTriggered: true,
        refundId: refundRecord.refundId,
        createdAt: now,
      };

      this.reconciliationStore.set(reconciliationId, record);
      return record;
    }

    // Normal Matched Scenario
    const record: ReconciliationRecord = {
      reconciliationId,
      bookingId,
      paymentOrderId,
      paymentStatus,
      providerBookingStatus,
      reconciliationStatus: paymentStatus === 'SUCCESS' && providerBookingStatus === 'CONFIRMED' ? 'MATCHED' : 'PENDING_REVIEW',
      automatedRefundTriggered: false,
      createdAt: now,
    };

    this.reconciliationStore.set(reconciliationId, record);
    return record;
  }

  async getReconciliationRecords(): Promise<ReconciliationRecord[]> {
    return Array.from(this.reconciliationStore.values());
  }
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface CancellationPolicy {
  policyType: 'FREE_CANCELLATION' | 'FLEXIBLE' | 'MODERATE' | 'STRICT' | 'NON_REFUNDABLE';
  hoursBeforeDeparture: number;
}

export interface RefundCalculationResult {
  bookingId: string;
  grossAmountInr: number;
  cancellationFeeInr: number;
  refundAmountInr: number;
  refundType: 'FULL_REFUND' | 'PARTIAL_REFUND' | 'NO_REFUND';
  reason: string;
}

export interface RefundRecord extends RefundCalculationResult {
  refundId: string;
  gatewayRefundId?: string;
  status: 'REFUND_REQUESTED' | 'REFUND_PENDING' | 'REFUND_PROCESSING' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'REFUND_FAILED';
  idempotencyKey: string;
  createdAt: string;
}

@Injectable()
export class RefundEngineService {
  private readonly logger = new Logger(RefundEngineService.name);
  private readonly refundStore = new Map<string, RefundRecord>();
  private readonly refundIdempotencyStore = new Map<string, RefundRecord>();

  calculateRefund(
    grossAmountInr: number,
    policy: CancellationPolicy,
    hoursUntilTravel: number,
    isProviderBookingFailed: boolean = false
  ): RefundCalculationResult {
    // 1. Zero-charge rule: If provider booking failed after payment, issue 100% full refund
    if (isProviderBookingFailed) {
      return {
        bookingId: 'bk_auto_refund',
        grossAmountInr,
        cancellationFeeInr: 0,
        refundAmountInr: grossAmountInr,
        refundType: 'FULL_REFUND',
        reason: 'Automated 100% refund triggered by Provider Booking Failure edge case.',
      };
    }

    // 2. Policy Matrix
    let refundPercentage = 1.0; // 100%
    if (policy.policyType === 'NON_REFUNDABLE') {
      refundPercentage = 0.0;
    } else if (policy.policyType === 'STRICT') {
      if (hoursUntilTravel >= 72) refundPercentage = 0.75;
      else if (hoursUntilTravel >= 24) refundPercentage = 0.50;
      else refundPercentage = 0.0;
    } else if (policy.policyType === 'MODERATE') {
      if (hoursUntilTravel >= 48) refundPercentage = 1.0;
      else if (hoursUntilTravel >= 24) refundPercentage = 0.50;
      else refundPercentage = 0.0;
    } else if (policy.policyType === 'FREE_CANCELLATION') {
      if (hoursUntilTravel >= 24) refundPercentage = 1.0;
      else refundPercentage = 0.80;
    }

    const refundAmountInr = Number((grossAmountInr * refundPercentage).toFixed(2));
    const cancellationFeeInr = Number((grossAmountInr - refundAmountInr).toFixed(2));

    let refundType: 'FULL_REFUND' | 'PARTIAL_REFUND' | 'NO_REFUND' = 'PARTIAL_REFUND';
    if (refundAmountInr === grossAmountInr) refundType = 'FULL_REFUND';
    else if (refundAmountInr === 0) refundType = 'NO_REFUND';

    return {
      bookingId: 'bk_calc',
      grossAmountInr,
      cancellationFeeInr,
      refundAmountInr,
      refundType,
      reason: `Calculated per policy '${policy.policyType}' (${hoursUntilTravel} hours before departure).`,
    };
  }

  async processRefundRequest(
    bookingId: string,
    calcResult: RefundCalculationResult,
    idempotencyKey: string
  ): Promise<RefundRecord> {
    // Idempotency Check
    if (idempotencyKey && this.refundIdempotencyStore.has(idempotencyKey)) {
      this.logger.warn(`[RefundEngineService] Duplicate refund request prevented by idempotency key (${idempotencyKey})`);
      return this.refundIdempotencyStore.get(idempotencyKey)!;
    }

    const refundId = `rfnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: RefundRecord = {
      ...calcResult,
      bookingId,
      refundId,
      gatewayRefundId: `rzp_rfnd_${Date.now()}`,
      status: 'REFUNDED',
      idempotencyKey,
      createdAt: now,
    };

    this.refundStore.set(refundId, record);
    if (idempotencyKey) {
      this.refundIdempotencyStore.set(idempotencyKey, record);
    }

    this.logger.log(`[RefundEngineService] Processed refund ${refundId} for Booking ${bookingId} (Refunded Amount: ₹${record.refundAmountInr})`);
    return record;
  }
}

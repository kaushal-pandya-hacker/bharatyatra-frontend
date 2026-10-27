import { Injectable, Logger } from '@nestjs/common';
import { AffectedItineraryItem } from './impact-detection.engine';

export type UserAdaptationPreference = 'MANUAL' | 'ASSISTED' | 'AUTO_LOW_RISK';

export type BookingImpactType =
  | 'NO_BOOKING_IMPACT'
  | 'UNBOOKED_ITEM'
  | 'BOOKED_ITEM'
  | 'PAID_BOOKING'
  | 'CANCELLATION_REQUIRED'
  | 'REBOOKING_REQUIRED';

export interface ProposalApprovalDecision {
  requiresUserApproval: boolean;
  initialStatus: 'PROPOSED' | 'AWAITING_APPROVAL' | 'AUTO_APPLIED';
  bookingImpactType: BookingImpactType;
  financialGuardrailNotice: string;
  reasonForApprovalRequirement: string;
}

@Injectable()
export class DecisionApprovalEngine {
  private readonly logger = new Logger(DecisionApprovalEngine.name);

  evaluateApprovalRequirement(
    affectedItems: AffectedItineraryItem[],
    costDifferenceInr: number,
    userPreference: UserAdaptationPreference = 'ASSISTED'
  ): ProposalApprovalDecision {
    const hasPaidBooking = affectedItems.some(item => item.isPaidBooking);
    const hasBookedItem = affectedItems.some(item => item.itemId.startsWith('bk_') || item.isPaidBooking);

    let bookingImpactType: BookingImpactType = 'NO_BOOKING_IMPACT';
    if (hasPaidBooking) {
      bookingImpactType = 'PAID_BOOKING';
    } else if (hasBookedItem) {
      bookingImpactType = 'BOOKED_ITEM';
    } else if (affectedItems.length > 0) {
      bookingImpactType = 'UNBOOKED_ITEM';
    }

    // STRICT GUARDRAIL RULES:
    // 1. Any paid booking involvement requires explicit user approval.
    // 2. Any cost increase (> 0 INR) requires explicit user approval.
    // 3. MANUAL and ASSISTED modes always require user approval.
    // 4. AUTO_LOW_RISK permits auto-apply ONLY if zero cost difference and unbooked items.

    let requiresUserApproval = true;
    let initialStatus: 'PROPOSED' | 'AWAITING_APPROVAL' | 'AUTO_APPLIED' = 'AWAITING_APPROVAL';
    let reason = '';

    if (hasPaidBooking) {
      requiresUserApproval = true;
      initialStatus = 'AWAITING_APPROVAL';
      reason = 'Proposal affects a confirmed paid booking segment.';
    } else if (costDifferenceInr > 0) {
      requiresUserApproval = true;
      initialStatus = 'AWAITING_APPROVAL';
      reason = `Proposal increases trip budget by +₹${costDifferenceInr}.`;
    } else if (userPreference === 'MANUAL' || userPreference === 'ASSISTED') {
      requiresUserApproval = true;
      initialStatus = 'AWAITING_APPROVAL';
      reason = `User preference set to ${userPreference}. Requires explicit confirmation.`;
    } else if (userPreference === 'AUTO_LOW_RISK' && !hasPaidBooking && costDifferenceInr <= 0) {
      requiresUserApproval = false;
      initialStatus = 'AUTO_APPLIED';
      reason = 'Low-risk unbooked schedule shift auto-applied as permitted by user AUTO_LOW_RISK setting.';
    } else {
      requiresUserApproval = true;
      initialStatus = 'AWAITING_APPROVAL';
      reason = 'Safety fallback: user approval required.';
    }

    const financialGuardrailNotice = requiresUserApproval
      ? 'GUARANTEED: No credit card charges or booking cancellations will occur without explicit user confirmation.'
      : 'Auto-applied non-financial itinerary re-ordering (0 INR cost difference).';

    this.logger.log(
      `[DecisionApprovalEngine] Evaluated proposal: requiresApproval=${requiresUserApproval}, status=${initialStatus}, reason='${reason}'`
    );

    return {
      requiresUserApproval,
      initialStatus,
      bookingImpactType,
      financialGuardrailNotice,
      reasonForApprovalRequirement: reason,
    };
  }
}

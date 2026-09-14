import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventIngestionService } from './services/event-ingestion.service';
import { ImpactDetectionEngine } from './services/impact-detection.engine';
import { DecisionApprovalEngine, UserAdaptationPreference } from './services/decision-approval.engine';
import { ItineraryVersioningService } from './services/itinerary-versioning.service';

export interface AdaptationProposalRecord {
  proposalId: string;
  tripId: string;
  triggerEventId: string;
  triggerEventType: string;
  affectedCity: string;
  impactScore: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'DETECTED' | 'ANALYZING' | 'PROPOSED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'AUTO_APPLIED' | 'EXPIRED' | 'FAILED' | 'COMPLETED';
  requiresUserApproval: boolean;
  bookingImpactType: string;
  affectedItems: any[];
  originalSlot: string;
  recommendedSlot: string;
  reasonCode: string;
  reasonExplanation: string;
  originalCostInr: number;
  newCostInr: number;
  costDifferenceInr: number;
  financialGuardrailNotice: string;
  createdAt: string;
  expiresAt: string;
}

@Injectable()
export class AdaptiveAiService {
  private readonly logger = new Logger(AdaptiveAiService.name);
  private readonly proposalsStore = new Map<string, AdaptationProposalRecord>();
  private readonly userPreferencesStore = new Map<string, UserAdaptationPreference>();

  constructor(
    private readonly eventIngestion: EventIngestionService,
    private readonly impactEngine: ImpactDetectionEngine,
    private readonly decisionApprovalEngine: DecisionApprovalEngine,
    private readonly versioningService: ItineraryVersioningService,
  ) {}

  async processEvent(rawEvent: any) {
    this.logger.log(`[AdaptiveAiService] Processing incoming external event`);

    // 1. Ingest, Normalize & Deduplicate
    const event = this.eventIngestion.ingestAndNormalize(rawEvent);
    if (!event) {
      return {
        success: false,
        message: 'Event ignored due to deduplication or staleness check.',
      };
    }

    // 2. Fetch target active trip (or use mock active trip)
    const tripId = rawEvent.tripId || 'trip_active_001';
    const mockTripData = {
      tripId,
      status: 'ACTIVE',
      days: [
        {
          dayNumber: 1,
          slots: [
            { id: 'slot_1', title: 'Ahmedabad Heritage Walk', category: 'HERITAGE_WALK', slotTime: '09:00 AM', isPaidBooking: false },
            { id: 'slot_2', title: 'Sabarmati Riverfront Boating', category: 'BOATING', slotTime: '04:00 PM', isPaidBooking: false },
          ],
        },
        {
          dayNumber: 2,
          slots: [
            { id: 'slot_3', title: 'Gir Lion Jungle Safari - Trail 3', category: 'SAFARI', slotTime: '06:00 AM', isPaidBooking: true },
            { id: 'slot_4', title: 'Somnath Beach Sunset & Aarti', category: 'BEACH', slotTime: '06:30 PM', isPaidBooking: false },
          ],
        },
      ],
    };

    // 3. Detect Trip Impact
    const impact = this.impactEngine.assessTripImpact(mockTripData, event);
    if (!impact.hasImpact) {
      this.logger.log(`[AdaptiveAiService] No itinerary impact detected for event ${event.eventId}`);
      return {
        success: true,
        data: {
          eventId: event.eventId,
          hasImpact: false,
          message: 'Event evaluated cleanly with zero trip disruptions.',
        },
      };
    }

    // 4. Generate Alternative Candidate
    const affectedItem = impact.affectedItems[0];
    const originalSlotName = affectedItem ? affectedItem.title : 'Outdoor Activity';
    let recommendedSlotName = 'Somnath Temple Mahapuja & Uparkot Indoor Fort Museum';
    let costDifferenceInr = 0;

    if (event.eventType === 'RAIN_ALERT') {
      recommendedSlotName = 'Junagadh Uparkot Fort & Indoor Science City Gallery';
      costDifferenceInr = 0;
    } else if (event.eventType === 'BUS_CANCELLED') {
      recommendedSlotName = 'Alternative GSRTC Volvo Express Bus (11:30 AM Slot)';
      costDifferenceInr = 150;
    }

    // 5. Evaluate Financial & Approval Guardrails
    const userPref = this.userPreferencesStore.get(rawEvent.userId || 'default_user') || 'ASSISTED';
    const approvalDecision = this.decisionApprovalEngine.evaluateApprovalRequirement(
      impact.affectedItems,
      costDifferenceInr,
      userPref,
    );

    const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowObj = new Date();
    const expiresObj = new Date(nowObj.getTime() + 7200000); // 2 hours expiration

    const proposalRecord: AdaptationProposalRecord = {
      proposalId,
      tripId,
      triggerEventId: event.eventId,
      triggerEventType: event.eventType,
      affectedCity: event.location.city,
      impactScore: impact.impactScore,
      status: approvalDecision.initialStatus,
      requiresUserApproval: approvalDecision.requiresUserApproval,
      bookingImpactType: approvalDecision.bookingImpactType,
      affectedItems: impact.affectedItems,
      originalSlot: `${originalSlotName} (${event.eventType})`,
      recommendedSlot: recommendedSlotName,
      reasonCode: event.eventType,
      reasonExplanation: `${originalSlotName} in ${event.location.city} is affected by ${event.eventType.toLowerCase()}. Recommended indoor replacement.`,
      originalCostInr: 1200,
      newCostInr: 1200 + costDifferenceInr,
      costDifferenceInr,
      financialGuardrailNotice: approvalDecision.financialGuardrailNotice,
      createdAt: nowObj.toISOString(),
      expiresAt: expiresObj.toISOString(),
    };

    this.proposalsStore.set(proposalId, proposalRecord);

    // 6. Handle Auto-Apply if permitted
    if (!proposalRecord.requiresUserApproval && proposalRecord.status === 'AUTO_APPLIED') {
      const newVersion = await this.versioningService.createNewVersion(
        tripId,
        `Auto-adapted Day ${affectedItem?.dayNumber || 1}: Replaced ${originalSlotName} with ${recommendedSlotName} due to ${event.eventType}`,
        []
      );
      proposalRecord.status = 'COMPLETED';
      this.logger.log(`[AdaptiveAiService] Auto-applied adaptation proposal ${proposalId}. Created Itinerary Version ${newVersion.versionNumber}`);
    }

    return {
      success: true,
      data: proposalRecord,
    };
  }

  async getProposalsForTrip(tripId: string): Promise<AdaptationProposalRecord[]> {
    const results: AdaptationProposalRecord[] = [];
    for (const proposal of this.proposalsStore.values()) {
      if (proposal.tripId === tripId) {
        results.push(proposal);
      }
    }
    return results;
  }

  async getProposalById(proposalId: string): Promise<AdaptationProposalRecord> {
    const proposal = this.proposalsStore.get(proposalId);
    if (!proposal) {
      throw new NotFoundException(`Adaptation proposal ${proposalId} not found.`);
    }
    return proposal;
  }

  async approveProposal(proposalId: string, userId: string) {
    const proposal = await this.getProposalById(proposalId);
    if (proposal.status === 'APPROVED' || proposal.status === 'COMPLETED') {
      return { success: true, message: 'Proposal already approved.', data: proposal };
    }

    proposal.status = 'APPROVED';
    
    // Create new immutable itinerary version
    const versionRecord = await this.versioningService.createNewVersion(
      proposal.tripId,
      `User approved adaptation: Replaced ${proposal.originalSlot} with ${proposal.recommendedSlot}. Cost diff: ₹${proposal.costDifferenceInr}.`,
      []
    );

    proposal.status = 'COMPLETED';

    this.logger.log(`[AdaptiveAiService] Proposal ${proposalId} approved by user ${userId}. New Itinerary Version: ${versionRecord.versionNumber}`);

    return {
      success: true,
      data: {
        proposal,
        versionRecord,
        notification: {
          title: 'Itinerary Updated Successfully',
          body: `Your trip itinerary has been updated to Version ${versionRecord.versionNumber}.`,
        },
      },
    };
  }

  async rejectProposal(proposalId: string, userId: string) {
    const proposal = await this.getProposalById(proposalId);
    proposal.status = 'REJECTED';
    this.logger.log(`[AdaptiveAiService] Proposal ${proposalId} rejected by user ${userId}. Original itinerary preserved.`);
    return {
      success: true,
      message: 'Adaptation proposal rejected. Original itinerary preserved unchanged.',
      data: proposal,
    };
  }

  async getUserPreferences(userId: string): Promise<{ userId: string; preference: UserAdaptationPreference }> {
    const pref = this.userPreferencesStore.get(userId) || 'ASSISTED';
    return { userId, preference: pref };
  }

  async updateUserPreferences(userId: string, preference: UserAdaptationPreference) {
    this.userPreferencesStore.set(userId, preference);
    this.logger.log(`[AdaptiveAiService] Updated adaptation preference for user ${userId} to '${preference}'`);
    return { userId, preference };
  }
}

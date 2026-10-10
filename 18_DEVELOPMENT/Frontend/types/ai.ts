export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface TripEvent {
  eventId: string;
  tripId: string;
  eventType: string;
  severity: EventSeverity;
  detectedAt: string;
  affectedDate: string;
  payloadJson?: Record<string, unknown>;
}

export interface AdaptationProposal {
  proposalId: string;
  tripId: string;
  eventId?: string;
  triggerDescription: string;
  proposedChangesJson: Record<string, unknown>;
  timeImpactMins: number;
  costImpactInr: number;
  confidenceScore: number;
  status: ProposalStatus;
  createdAt: string;
}

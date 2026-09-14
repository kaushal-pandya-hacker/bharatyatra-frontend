import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export type FeedbackCategory =
  | 'BUG'
  | 'BOOKING'
  | 'PAYMENT'
  | 'AI_QUALITY'
  | 'DATA_QUALITY'
  | 'SUPPLIER'
  | 'UX'
  | 'NOTIFICATIONS'
  | 'GENERAL';

export type FeedbackSeverity = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export type FeedbackStatus =
  | 'NEW'
  | 'TRIAGED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_USER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'DUPLICATE'
  | 'WONT_FIX';

export type SatisfactionScore =
  | 'VERY_SATISFIED'
  | 'SATISFIED'
  | 'NEUTRAL'
  | 'DISSATISFIED'
  | 'VERY_DISSATISFIED';

export interface SubmitFeedbackRequest {
  userId: string;
  tripId?: string;
  bookingId?: string;
  category: FeedbackCategory;
  severity?: FeedbackSeverity;
  message: string;
  satisfaction?: SatisfactionScore;
}

export interface FeedbackRecord {
  feedbackId: string;
  userId: string;
  tripId?: string;
  bookingId?: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  message: string;
  satisfaction?: SatisfactionScore;
  status: FeedbackStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  // In-memory feedback store
  private readonly feedbackStore: Map<string, FeedbackRecord> = new Map();

  constructor() {
    this.logger.log('Beta Feedback Engine Initialized');
  }

  submit(req: SubmitFeedbackRequest): FeedbackRecord {
    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const severity = req.severity || (req.category === 'PAYMENT' || req.category === 'BOOKING' ? 'P1' : 'P3');

    const record: FeedbackRecord = {
      feedbackId,
      userId: req.userId,
      tripId: req.tripId,
      bookingId: req.bookingId,
      category: req.category,
      severity,
      message: req.message,
      satisfaction: req.satisfaction,
      status: 'NEW',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.feedbackStore.set(feedbackId, record);
    this.logger.log(`Received Beta Feedback ${feedbackId} (${req.category}, ${severity}) from user ${req.userId}`);
    return record;
  }

  getAllFeedback(category?: FeedbackCategory, status?: FeedbackStatus, severity?: FeedbackSeverity): FeedbackRecord[] {
    let list = Array.from(this.feedbackStore.values());
    if (category) list = list.filter((f) => f.category === category);
    if (status) list = list.filter((f) => f.status === status);
    if (severity) list = list.filter((f) => f.severity === severity);
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateStatus(feedbackId: string, status: FeedbackStatus, adminNotes?: string): FeedbackRecord {
    const record = this.feedbackStore.get(feedbackId);
    if (!record) {
      throw new NotFoundException(`Feedback ${feedbackId} not found`);
    }
    record.status = status;
    if (adminNotes) record.adminNotes = adminNotes;
    record.updatedAt = new Date();
    this.logger.log(`Updated Beta Feedback ${feedbackId} status to ${status}`);
    return record;
  }

  getAnalyticsSummary() {
    const all = Array.from(this.feedbackStore.values());
    const categoryBreakdown: Record<string, number> = {};
    const severityBreakdown: Record<string, number> = {};
    const satisfactionBreakdown: Record<string, number> = {};

    for (const f of all) {
      categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
      severityBreakdown[f.severity] = (severityBreakdown[f.severity] || 0) + 1;
      if (f.satisfaction) {
        satisfactionBreakdown[f.satisfaction] = (satisfactionBreakdown[f.satisfaction] || 0) + 1;
      }
    }

    const p0Count = severityBreakdown['P0'] || 0;
    const p1Count = severityBreakdown['P1'] || 0;

    return {
      totalFeedback: all.length,
      unresolvedP0P1Count: p0Count + p1Count,
      categoryBreakdown,
      severityBreakdown,
      satisfactionBreakdown,
      publicLaunchBlockerExists: p0Count > 0,
    };
  }
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export enum AnalyticsEventType {
  // ACCOUNT
  USER_REGISTERED = 'USER_REGISTERED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PROFILE_UPDATED = 'PROFILE_UPDATED',

  // DISCOVERY
  HOME_VIEWED = 'HOME_VIEWED',
  DESTINATION_VIEWED = 'DESTINATION_VIEWED',
  DESTINATION_SEARCHED = 'DESTINATION_SEARCHED',
  SEARCH_STARTED = 'SEARCH_STARTED',
  SEARCH_COMPLETED = 'SEARCH_COMPLETED',
  SEARCH_FILTER_APPLIED = 'SEARCH_FILTER_APPLIED',
  SEARCH_SORT_CHANGED = 'SEARCH_SORT_CHANGED',

  // AI
  AI_PLANNER_STARTED = 'AI_PLANNER_STARTED',
  AI_PLANNER_SUBMITTED = 'AI_PLANNER_SUBMITTED',
  AI_ITINERARY_GENERATED = 'AI_ITINERARY_GENERATED',
  AI_ITINERARY_VIEWED = 'AI_ITINERARY_VIEWED',
  AI_ITINERARY_EDITED = 'AI_ITINERARY_EDITED',
  AI_ITINERARY_REGENERATED = 'AI_ITINERARY_REGENERATED',
  AI_ITINERARY_ACCEPTED = 'AI_ITINERARY_ACCEPTED',
  AI_ITINERARY_REJECTED = 'AI_ITINERARY_REJECTED',

  // TRIP
  TRIP_CREATED = 'TRIP_CREATED',
  TRIP_UPDATED = 'TRIP_UPDATED',
  TRIP_SAVED = 'TRIP_SAVED',
  TRIP_SHARED = 'TRIP_SHARED',
  TRIP_COMPLETED = 'TRIP_COMPLETED',
  TRIP_CANCELLED = 'TRIP_CANCELLED',

  // HOTEL
  HOTEL_SEARCH_STARTED = 'HOTEL_SEARCH_STARTED',
  HOTEL_SEARCH_COMPLETED = 'HOTEL_SEARCH_COMPLETED',
  HOTEL_VIEWED = 'HOTEL_VIEWED',
  HOTEL_SELECTED = 'HOTEL_SELECTED',

  // BUS
  BUS_SEARCH_STARTED = 'BUS_SEARCH_STARTED',
  BUS_SEARCH_COMPLETED = 'BUS_SEARCH_COMPLETED',
  BUS_VIEWED = 'BUS_VIEWED',
  BUS_SELECTED = 'BUS_SELECTED',

  // CHECKOUT
  CHECKOUT_STARTED = 'CHECKOUT_STARTED',
  CHECKOUT_VIEWED = 'CHECKOUT_VIEWED',
  CHECKOUT_ABANDONED = 'CHECKOUT_ABANDONED',

  // PAYMENT
  PAYMENT_STARTED = 'PAYMENT_STARTED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_VERIFICATION_FAILED = 'PAYMENT_VERIFICATION_FAILED',

  // BOOKING
  BOOKING_REQUESTED = 'BOOKING_REQUESTED',
  BOOKING_PENDING = 'BOOKING_PENDING',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_FAILED = 'BOOKING_FAILED',
  BOOKING_CANCEL_REQUESTED = 'BOOKING_CANCEL_REQUESTED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',

  // REFUNDS
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUND_PENDING = 'REFUND_PENDING',
  REFUND_COMPLETED = 'REFUND_COMPLETED',
  REFUND_FAILED = 'REFUND_FAILED',

  // ADAPTIVE AI
  ADAPTATION_TRIGGERED = 'ADAPTATION_TRIGGERED',
  ADAPTATION_EVALUATED = 'ADAPTATION_EVALUATED',
  ADAPTATION_PROPOSED = 'ADAPTATION_PROPOSED',
  ADAPTATION_ACCEPTED = 'ADAPTATION_ACCEPTED',
  ADAPTATION_REJECTED = 'ADAPTATION_REJECTED',
  ADAPTATION_AUTO_APPLIED = 'ADAPTATION_AUTO_APPLIED',
  ADAPTATION_FAILED = 'ADAPTATION_FAILED',

  // NOTIFICATIONS
  NOTIFICATION_CREATED = 'NOTIFICATION_CREATED',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  NOTIFICATION_DELIVERED = 'NOTIFICATION_DELIVERED',
  NOTIFICATION_FAILED = 'NOTIFICATION_FAILED',
  NOTIFICATION_OPENED = 'NOTIFICATION_OPENED',

  // SUPPORT
  SUPPORT_REQUESTED = 'SUPPORT_REQUESTED',
  SUPPORT_RESOLVED = 'SUPPORT_RESOLVED',
  SUPPORT_REOPENED = 'SUPPORT_REOPENED',

  // REVIEWS
  REVIEW_STARTED = 'REVIEW_STARTED',
  REVIEW_SUBMITTED = 'REVIEW_SUBMITTED',
}

export interface AnalyticsEventPayload {
  eventId?: string;
  eventType: AnalyticsEventType;
  eventVersion?: string;
  userId?: string;
  anonymousId?: string;
  sessionId?: string;
  tripId?: string;
  bookingId?: string;
  supplierId?: string;
  providerId?: string;
  timestamp?: string;
  platform?: string;
  deviceType?: string;
  appVersion?: string;
  page?: string;
  source?: string;
  campaign?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
  };
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private eventsStore: Map<string, AnalyticsEventPayload> = new Map();
  private processedEventIds: Set<string> = new Set();
  private sessionUserMap: Map<string, string> = new Map();

  constructor() {
    this.seedInitialAnalyticsData();
  }

  private seedInitialAnalyticsData() {
    const now = new Date().toISOString();
    const seeds: Array<{ type: AnalyticsEventType; count: number }> = [
      { type: AnalyticsEventType.USER_REGISTERED, count: 1250 },
      { type: AnalyticsEventType.LOGIN_SUCCESS, count: 3400 },
      { type: AnalyticsEventType.DESTINATION_VIEWED, count: 8900 },
      { type: AnalyticsEventType.SEARCH_STARTED, count: 6200 },
      { type: AnalyticsEventType.SEARCH_COMPLETED, count: 5950 },
      { type: AnalyticsEventType.AI_PLANNER_STARTED, count: 4800 },
      { type: AnalyticsEventType.AI_ITINERARY_GENERATED, count: 4320 },
      { type: AnalyticsEventType.AI_ITINERARY_ACCEPTED, count: 3110 },
      { type: AnalyticsEventType.CHECKOUT_STARTED, count: 2450 },
      { type: AnalyticsEventType.PAYMENT_STARTED, count: 2380 },
      { type: AnalyticsEventType.PAYMENT_SUCCESS, count: 2365 },
      { type: AnalyticsEventType.BOOKING_REQUESTED, count: 2365 },
      { type: AnalyticsEventType.BOOKING_CONFIRMED, count: 2343 },
      { type: AnalyticsEventType.TRIP_COMPLETED, count: 1890 },
      { type: AnalyticsEventType.ADAPTATION_TRIGGERED, count: 340 },
      { type: AnalyticsEventType.ADAPTATION_PROPOSED, count: 310 },
      { type: AnalyticsEventType.ADAPTATION_ACCEPTED, count: 275 },
    ];

    let counter = 1;
    for (const seed of seeds) {
      for (let i = 0; i < seed.count; i++) {
        const id = `evt-seed-${counter++}`;
        const evt: AnalyticsEventPayload = {
          eventId: id,
          eventType: seed.type,
          eventVersion: '1.1',
          sessionId: `sess-${Math.floor(i / 10)}`,
          timestamp: now,
        };
        this.eventsStore.set(id, evt);
        this.processedEventIds.add(id);
      }
    }
  }

  public validateAndTrackEvent(payload: AnalyticsEventPayload): AnalyticsEventPayload {
    if (!payload.eventType || !Object.values(AnalyticsEventType).includes(payload.eventType)) {
      throw new BadRequestException(`Invalid or missing eventType: ${payload.eventType}`);
    }

    const eventId = payload.eventId || `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Deduplication check
    if (this.processedEventIds.has(eventId)) {
      this.logger.warn(`Duplicate event ignored: ${eventId}`);
      return this.eventsStore.get(eventId)!;
    }

    const timestamp = payload.timestamp || new Date().toISOString();
    const eventVersion = payload.eventVersion || '1.1';

    // Session-User identity merging
    if (payload.sessionId && payload.userId) {
      this.sessionUserMap.set(payload.sessionId, payload.userId);
    }

    const effectiveUserId = payload.userId || (payload.sessionId ? this.sessionUserMap.get(payload.sessionId) : undefined);

    const record: AnalyticsEventPayload = {
      ...payload,
      eventId,
      eventVersion,
      userId: effectiveUserId,
      timestamp,
    };

    this.eventsStore.set(eventId, record);
    this.processedEventIds.add(eventId);

    this.logger.log(`Tracked Event: ${record.eventType} [${eventId}] (User: ${record.userId || record.anonymousId || 'anon'})`);
    return record;
  }

  public getOverviewMetrics() {
    const totalEvents = this.eventsStore.size;
    const registrations = Array.from(this.eventsStore.values()).filter(e => e.eventType === AnalyticsEventType.USER_REGISTERED).length;
    const searchStarts = Array.from(this.eventsStore.values()).filter(e => e.eventType === AnalyticsEventType.SEARCH_STARTED).length;
    const plannerStarts = Array.from(this.eventsStore.values()).filter(e => e.eventType === AnalyticsEventType.AI_PLANNER_STARTED).length;
    const bookingsConfirmed = Array.from(this.eventsStore.values()).filter(e => e.eventType === AnalyticsEventType.BOOKING_CONFIRMED).length;

    return {
      totalEventsRecorded: totalEvents,
      totalRegistrations: registrations,
      searchStarts,
      plannerStarts,
      bookingsConfirmed,
      conversionRatePercent: searchStarts > 0 ? Number(((bookingsConfirmed / searchStarts) * 100).toFixed(2)) : 0,
      timestamp: new Date().toISOString(),
    };
  }

  public getFunnelMetrics() {
    const getCount = (type: AnalyticsEventType) => Array.from(this.eventsStore.values()).filter(e => e.eventType === type).length;

    const visitor = getCount(AnalyticsEventType.HOME_VIEWED) || 10000;
    const destinationViewed = getCount(AnalyticsEventType.DESTINATION_VIEWED);
    const searchStarted = getCount(AnalyticsEventType.SEARCH_STARTED);
    const searchCompleted = getCount(AnalyticsEventType.SEARCH_COMPLETED);
    const aiPlannerStarted = getCount(AnalyticsEventType.AI_PLANNER_STARTED);
    const aiItineraryGenerated = getCount(AnalyticsEventType.AI_ITINERARY_GENERATED);
    const aiItineraryAccepted = getCount(AnalyticsEventType.AI_ITINERARY_ACCEPTED);
    const checkoutStarted = getCount(AnalyticsEventType.CHECKOUT_STARTED);
    const paymentStarted = getCount(AnalyticsEventType.PAYMENT_STARTED);
    const paymentSuccess = getCount(AnalyticsEventType.PAYMENT_SUCCESS);
    const bookingRequested = getCount(AnalyticsEventType.BOOKING_REQUESTED);
    const bookingConfirmed = getCount(AnalyticsEventType.BOOKING_CONFIRMED);
    const tripCompleted = getCount(AnalyticsEventType.TRIP_COMPLETED);

    return {
      funnel: [
        { stage: '1. VISITOR', count: visitor, conversionPercent: 100.0 },
        { stage: '2. DESTINATION_VIEWED', count: destinationViewed, conversionPercent: Number(((destinationViewed / visitor) * 100).toFixed(1)) },
        { stage: '3. SEARCH_STARTED', count: searchStarted, conversionPercent: Number(((searchStarted / destinationViewed) * 100).toFixed(1)) },
        { stage: '4. SEARCH_COMPLETED', count: searchCompleted, conversionPercent: Number(((searchCompleted / searchStarted) * 100).toFixed(1)) },
        { stage: '5. AI_PLANNER_STARTED', count: aiPlannerStarted, conversionPercent: Number(((aiPlannerStarted / searchCompleted) * 100).toFixed(1)) },
        { stage: '6. AI_ITINERARY_GENERATED', count: aiItineraryGenerated, conversionPercent: Number(((aiItineraryGenerated / aiPlannerStarted) * 100).toFixed(1)) },
        { stage: '7. AI_ITINERARY_ACCEPTED', count: aiItineraryAccepted, conversionPercent: Number(((aiItineraryAccepted / aiItineraryGenerated) * 100).toFixed(1)) },
        { stage: '8. CHECKOUT_STARTED', count: checkoutStarted, conversionPercent: Number(((checkoutStarted / aiItineraryAccepted) * 100).toFixed(1)) },
        { stage: '9. PAYMENT_STARTED', count: paymentStarted, conversionPercent: Number(((paymentStarted / checkoutStarted) * 100).toFixed(1)) },
        { stage: '10. PAYMENT_SUCCESS', count: paymentSuccess, conversionPercent: Number(((paymentSuccess / paymentStarted) * 100).toFixed(1)) },
        { stage: '11. BOOKING_REQUESTED', count: bookingRequested, conversionPercent: Number(((bookingRequested / paymentSuccess) * 100).toFixed(1)) },
        { stage: '12. BOOKING_CONFIRMED', count: bookingConfirmed, conversionPercent: Number(((bookingConfirmed / bookingRequested) * 100).toFixed(1)) },
        { stage: '13. TRIP_COMPLETED', count: tripCompleted, conversionPercent: Number(((tripCompleted / bookingConfirmed) * 100).toFixed(1)) },
      ],
      overallConversionRatePercent: Number(((bookingConfirmed / visitor) * 100).toFixed(2)),
    };
  }

  public getUsersMetrics() {
    return {
      registeredUsersCount: 1250,
      activeUsers30Days: 3400,
      anonymousBrowsersCount: 4200,
      sessionMergeRatePercent: 82.5,
    };
  }

  public getSearchMetrics() {
    return {
      totalSearches: 6200,
      successfulSearches: 5950,
      failedSearches: 250,
      topSearchedHub: 'Statue of Unity (Ekta Nagar)',
      searchLatencyMsP95: 420,
    };
  }

  public getAiMetrics() {
    return {
      plannerStarts: 4800,
      itinerariesGenerated: 4320,
      itinerariesAccepted: 3110,
      itinerariesRejected: 410,
      itinerariesEdited: 800,
      acceptanceRatePercent: 72.0,
      averageGenerationTimeMs: 1420,
      modelVersion: 'gemini-1.5-pro-v1',
      promptVersion: 'v1.1.0',
      knowledgeVersion: 'gujarat-kb-v1.0',
      hallucinationRatePercent: 0.0,
    };
  }

  public getAdaptiveAiMetrics() {
    return {
      triggersCount: 340,
      evaluationsCount: 340,
      proposalsCount: 310,
      acceptanceCount: 275,
      rejectionCount: 35,
      autoAppliedCount: 0,
      failuresCount: 0,
      approvalRatePercent: 88.7,
      falsePositivesCount: 12,
      falseNegativesCount: 3,
    };
  }

  public getBookingsMetrics() {
    return {
      requested: 2365,
      pending: 0,
      confirmed: 2343,
      failed: 22,
      cancelled: 42,
      bookingSuccessRatePercent: 99.1,
      cancellationRatePercent: 1.8,
    };
  }

  public getPaymentsMetrics() {
    return {
      attempts: 2380,
      success: 2365,
      failed: 15,
      verificationFailed: 0,
      paymentSuccessRatePercent: 99.4,
      gatewayLatencyMsP95: 850,
    };
  }

  public getSuppliersMetrics() {
    return {
      totalSuppliers: 148,
      topPerformingCount: 132,
      underperformingCount: 16,
      averageQualityScore: 91.4,
      bookingSuccessRatePercent: 99.1,
    };
  }

  public getRevenueMetrics() {
    return {
      grossBookingValueINR: 14250000,
      customerAmountINR: 14250000,
      taxesINR: 712500,
      discountsINR: 285000,
      platformFeeINR: 285000,
      commissionINR: 855000,
      gatewayCostINR: 199500,
      supplierPayableINR: 12910500,
      refundsINR: 255360,
      platformRevenueINR: 1140000,
      contributionMarginPercent: 6.6,
      currency: 'INR',
    };
  }

  public getCampaignsMetrics() {
    return {
      topCampaign: 'gujarat-monsoon-magic',
      topSource: 'google_organic',
      attributedBookings: 840,
      attributionRatePercent: 35.8,
    };
  }

  public getRetentionMetrics() {
    return {
      repeatTravellersCount: 178,
      repeatTripCreationRatePercent: 14.2,
      savedItinerariesCount: 1420,
    };
  }
}

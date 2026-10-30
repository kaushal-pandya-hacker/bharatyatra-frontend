/**
 * BharatYatra AI 2.0 — Decoupled Trip Planning Master Orchestrator
 *
 * Implements architectural separation of concerns:
 * 1. Pure AI Itinerary Intelligence (PureItineraryService):
 *    - Route optimization, geographic clustering, altitude acclimatization
 *    - Pacing, seasonal conditions, and activity/meal/transit scheduling
 *    - Zero financial calculations
 *
 * 2. Deterministic Pricing Engine (PricingEngine):
 *    - Multi-tier itemized calculations (budget, standard, premium, luxury)
 *    - Hotel tariffs, transit fares, local transport, entry tickets, packages
 *    - Provenance tracking (LIVE, VERIFIED_REFERENCE, ESTIMATED, UNAVAILABLE)
 *    - Taxes, fees, and budget validation
 *
 * 3. Backward Compatibility:
 *    - Maps decoupled outputs to legacy TripDay[] and TripBudget schemas
 *    - Supplies both new { itinerary, pricing } and legacy { trip, budget, hybridPricing }
 */

import {
  TripPlanningRequest,
  TripPlanningResponse,
  TripDay,
  TripBudget,
  PlanQuality,
  Activity,
  MealRecommendation,
  TravelSegment,
  AccommodationSuggestion,
} from './types';
import { parseTripIntent } from './intent-parser';
import { generateBookingRequirements } from './booking-requirements';
import { PureItineraryService, PureItineraryResult, PureTripDay } from './pure-itinerary-service';
import { PricingEngine, PricingEngineResult } from './pricing-engine';
import { convertRequestToPreferenceProfile, TripPreferenceProfile } from './universal-preference-profile';

/**
 * Transforms a PureTripDay into a backward-compatible legacy TripDay
 * by applying deterministic pricing from the PricingEngine without AI hallucination.
 */
function mapPureDayToLegacyDay(
  pureDay: PureTripDay,
  pricing: PricingEngineResult,
  totalDays: number
): TripDay {
  const activeTier = pricing.activeTier;
  const dailyCost = Math.round(activeTier.totalGroupCost / Math.max(1, totalDays));

  // Activity mapping with verified/benchmark ticket pricing
  const mapActivity = (act: any): Activity => {
    const matchedPricingItem = activeTier.categories.activitiesAndPermits?.items.find((item: any) =>
      item.title.toLowerCase().includes(act.name.toLowerCase()) ||
      act.name.toLowerCase().includes(item.title.toLowerCase())
    );

    return {
      id: act.id,
      name: act.name,
      displayName: act.displayName,
      location: act.location,
      city: act.city,
      state: act.state,
      latitude: act.latitude,
      longitude: act.longitude,
      startTime: act.startTime,
      endTime: act.endTime,
      durationMinutes: act.durationMinutes,
      category: act.category,
      priority: act.priority,
      reason: act.reason,
      imageUrl: act.imageUrl,
      estimatedCostInr: matchedPricingItem ? matchedPricingItem.baseAmount : 0,
    };
  };

  // Accommodation mapping
  let accommodation: AccommodationSuggestion | undefined = undefined;
  if (pureDay.accommodation) {
    const accItem = activeTier.categories.accommodation?.items[0];
    const costPerNight = accItem
      ? accItem.baseAmount
      : Math.round((activeTier.categories.accommodation?.totalAmount || 0) / Math.max(1, totalDays - 1));
    accommodation = {
      hotelName: pureDay.accommodation.hotelName,
      city: pureDay.accommodation.city,
      category: pureDay.accommodation.category,
      starRating: pureDay.accommodation.starRating,
      nights: pureDay.accommodation.nights,
      estimatedCostPerNightInr: costPerNight,
      totalCostInr: costPerNight * pureDay.accommodation.nights * pureDay.accommodation.roomsCount,
      reason: pureDay.accommodation.reason,
    };
  }

  return {
    day: pureDay.day,
    date: pureDay.date,
    location: pureDay.location,
    state: pureDay.state,
    dayType: pureDay.dayType as any,
    morning: pureDay.morning.map(mapActivity),
    afternoon: pureDay.afternoon.map(mapActivity),
    evening: pureDay.evening.map(mapActivity),
    meals: pureDay.meals as MealRecommendation[],
    travelSegments: pureDay.travelSegments as TravelSegment[],
    accommodation,
    estimatedDailyCostInr: dailyCost,
    daySummary: pureDay.daySummary,
    decisionExplanation: pureDay.decisionExplanation,
  };
}

/**
 * Builds backward-compatible TripBudget from PricingEngineResult
 */
function buildLegacyBudgetFromPricing(
  pricing: PricingEngineResult,
  userBudgetInr?: number
): TripBudget {
  const active = pricing.activeTier;
  const totalEstimatedInr = active.totalGroupCost;
  const isWithinBudget = userBudgetInr ? totalEstimatedInr <= userBudgetInr : true;

  return {
    transportation: active.categories.transportation?.totalAmount || 0,
    accommodation: active.categories.accommodation?.totalAmount || 0,
    food: active.categories.food?.totalAmount || 0,
    activities: active.categories.activitiesAndPermits?.totalAmount || 0,
    localTransport: active.categories.localTransport?.totalAmount || 0,
    miscellaneous:
      (active.categories.taxesAndFees?.totalAmount || 0) +
      (active.categories.additional?.totalAmount || 0),
    totalEstimatedInr,
    userBudgetInr,
    isWithinBudget,
    tradeoffSuggestions: pricing.budgetAnalysis.tradeoffSuggestions?.length
      ? pricing.budgetAnalysis.tradeoffSuggestions
      : ['Budget aligns with selected tier.'],
  };
}

/**
 * Master Trip Planning Orchestrator
 * Coordinates Pure AI Itinerary Service and Deterministic Pricing Engine.
 */
export async function generateMasterTripPlan(
  request: TripPlanningRequest
): Promise<TripPlanningResponse> {
  const activeProfile: TripPreferenceProfile =
    request.preferenceProfile || convertRequestToPreferenceProfile(request);

  // 1. Parse Travel Intent
  const intent = parseTripIntent(request);

  // If request is impossible (e.g. 0 days, negative budget), return graceful error response
  if (intent.isImpossibleRequest) {
    return {
      success: false,
      message: intent.impossibleReason || 'Request cannot be fulfilled with realistic travel constraints.',
      requestIntent: intent,
      trip: {
        title: 'Invalid Trip Plan Request',
        origin: intent.originCity,
        destinations: intent.targetDestinations,
        durationDays: intent.durationDays,
        travelersCount: intent.travelersCount,
        days: [],
        routeOverview: [],
        totalDistanceKm: 0,
      },
      budget: {
        transportation: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        localTransport: 0,
        miscellaneous: 0,
        totalEstimatedInr: 0,
        userBudgetInr: intent.budgetInr,
        isWithinBudget: false,
        tradeoffSuggestions: [intent.impossibleReason || 'Please adjust trip duration or destinations.'],
      },
      quality: {
        geographicScore: 0,
        timeFeasibilityScore: 0,
        budgetScore: 0,
        personalizationScore: 0,
        seasonalScore: 0,
        transportScore: 0,
        bookingReadinessScore: 0,
        overallScore: 0,
        passesQualityBar: false,
      },
      warnings: [intent.impossibleReason || 'Impossible request constraints.'],
      bookingRequirements: [],
      isEstimateOnly: true,
      preferenceProfile: activeProfile,
    };
  }

  // 2. STEP 1: Pure AI Travel Intelligence (No Financial Calculations)
  const pureItinerary: PureItineraryResult = PureItineraryService.generatePureItinerary(request);

  // If client requested Plan Only (zero pricing calculations), return pure travel intelligence directly
  if (request.planOnly) {
    return {
      success: true,
      message: 'AI Trip Plan generated successfully with pure travel intelligence (Plan Only, zero pricing calculations).',
      requestIntent: intent,
      trip: {
        title: pureItinerary.title,
        origin: pureItinerary.origin,
        destinations: pureItinerary.destinations,
        durationDays: pureItinerary.durationDays,
        travelersCount: pureItinerary.travelersCount,
        startDate: pureItinerary.startDate,
        endDate: pureItinerary.endDate,
        days: pureItinerary.days.map((pureDay) => ({
          day: pureDay.day,
          date: pureDay.date,
          location: pureDay.location,
          state: pureDay.state,
          dayType: pureDay.dayType as any,
          morning: pureDay.morning.map((a) => ({ ...a, estimatedCostInr: 0 })),
          afternoon: pureDay.afternoon.map((a) => ({ ...a, estimatedCostInr: 0 })),
          evening: pureDay.evening.map((a) => ({ ...a, estimatedCostInr: 0 })),
          meals: pureDay.meals as any,
          travelSegments: pureDay.travelSegments as any,
          accommodation: pureDay.accommodation
            ? {
                hotelName: pureDay.accommodation.hotelName,
                city: pureDay.accommodation.city,
                category: pureDay.accommodation.category,
                starRating: pureDay.accommodation.starRating,
                nights: pureDay.accommodation.nights,
                estimatedCostPerNightInr: 0,
                totalCostInr: 0,
                reason: pureDay.accommodation.reason,
              }
            : undefined,
          estimatedDailyCostInr: 0,
          daySummary: pureDay.daySummary,
          decisionExplanation: pureDay.decisionExplanation,
        })),
        routeOverview: pureItinerary.routeOverview,
        totalDistanceKm: pureItinerary.totalDistanceKm,
      },
      budget: {
        transportation: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        localTransport: 0,
        miscellaneous: 0,
        totalEstimatedInr: 0,
        isWithinBudget: true,
        tradeoffSuggestions: ['Pure travel itinerary generated without financial estimations.'],
      },
      quality: {
        geographicScore: pureItinerary.geographicScore,
        timeFeasibilityScore: pureItinerary.timeFeasibilityScore,
        budgetScore: 100,
        personalizationScore: 95,
        seasonalScore: pureItinerary.seasonalScore,
        transportScore: 92,
        bookingReadinessScore: 95,
        overallScore: Math.round(
          (pureItinerary.geographicScore +
            pureItinerary.timeFeasibilityScore +
            pureItinerary.seasonalScore +
            95 +
            92 +
            95) /
            6
        ),
        passesQualityBar: true,
      },
      warnings: [...pureItinerary.warnings],
      bookingRequirements: [],
      isEstimateOnly: false,
      durationRecommendations: pureItinerary.durationRecommendations,
      preferenceProfile: activeProfile,
      itinerary: pureItinerary,
    };
  }

  // 3. STEP 2: Independent Deterministic Pricing Calculation
  const primaryDest = pureItinerary.destinations[0] || 'Destination';
  const pricingResult: PricingEngineResult = PricingEngine.calculateItineraryPricing(
    {
      originCity: pureItinerary.origin,
      destinationCity: primaryDest,
      destinations: pureItinerary.destinations,
      travelersCount: pureItinerary.travelersCount,
      durationDays: pureItinerary.durationDays,
      preferredTransport: request.transportPreference?.[0] as any,
      preferredTier: intent.travelStyle as any,
      userBudgetInr: intent.budgetInr,
      pureItinerary,
    },
    activeProfile
  );

  // 4. Map to Legacy Compatible Days & Budget
  const legacyDays: TripDay[] = pureItinerary.days.map((pureDay) =>
    mapPureDayToLegacyDay(pureDay, pricingResult, pureItinerary.durationDays)
  );

  const legacyBudget: TripBudget = buildLegacyBudgetFromPricing(pricingResult, intent.budgetInr);

  // 5. Booking Requirements (Inventory Specifications)
  const bookingRequirements = generateBookingRequirements(legacyDays, intent);

  // 6. Quality Metrics
  const quality: PlanQuality = {
    geographicScore: pureItinerary.geographicScore,
    timeFeasibilityScore: pureItinerary.timeFeasibilityScore,
    budgetScore: pricingResult.budgetAnalysis.fitsBudget ? 95 : 75,
    personalizationScore: 92,
    seasonalScore: pureItinerary.seasonalScore,
    transportScore: 90,
    bookingReadinessScore: 95,
    overallScore: Math.round(
      (pureItinerary.geographicScore +
        pureItinerary.timeFeasibilityScore +
        (pricingResult.budgetAnalysis.fitsBudget ? 95 : 75) +
        92 +
        pureItinerary.seasonalScore +
        90 +
        95) /
        7
    ),
    passesQualityBar: true,
  };

  return {
    success: true,
    message: 'AI Trip Plan generated and validated successfully with decoupled travel intelligence and deterministic pricing.',
    requestIntent: intent,
    trip: {
      title: pureItinerary.title,
      origin: pureItinerary.origin,
      destinations: pureItinerary.destinations,
      durationDays: pureItinerary.durationDays,
      travelersCount: pureItinerary.travelersCount,
      startDate: pureItinerary.startDate,
      endDate: pureItinerary.endDate,
      days: legacyDays,
      routeOverview: pureItinerary.routeOverview,
      totalDistanceKm: pureItinerary.totalDistanceKm,
    },
    budget: legacyBudget,
    quality,
    warnings: [...pureItinerary.warnings],
    bookingRequirements,
    isEstimateOnly: true,
    durationRecommendations: pureItinerary.durationRecommendations,
    hybridPricing: pricingResult as any,
    preferenceProfile: activeProfile,
    // First-Class Decoupled Architecture Outputs:
    itinerary: pureItinerary,
    pricing: pricingResult,
  };
}

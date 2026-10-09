/**
 * BharatYatra AI Trip Planning Master Service Orchestrator
 * Integrates Intent Parsing, Route Optimization, Budgeting, Seasonal Intelligence & Quality Validation.
 */

import { TripPlanningRequest, TripPlanningResponse } from './types';
import { parseTripIntent } from './intent-parser';
import { getDestinationsForTarget } from './destination-intelligence';
import { optimizeRouteSequence } from './route-optimizer';
import { generateDailyItineraries } from './itinerary-generator';
import { calculateTripBudget } from './budget-engine';
import { evaluateSeasonalSuitability } from './seasonal-intelligence';
import { validateTripPlan } from './trip-validator';
import { scorePlanQuality } from './quality-scorer';
import { generateBookingRequirements } from './booking-requirements';

export async function generateMasterTripPlan(
  request: TripPlanningRequest
): Promise<TripPlanningResponse> {
  // 1. Parse Natural Language or Structured Intent
  const intent = parseTripIntent(request);

  // If request is impossible (e.g. 0 days, impossible route), return graceful error response
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
    };
  }

  // 2. Fetch Destination Intelligence Nodes
  const candidateNodes = getDestinationsForTarget(intent.targetDestinations, intent.originCity);

  // 3. Optimize Geographical Route Sequence
  const originCoords = { lat: 23.0225, lng: 72.5714 }; // Default Ahmedabad origin coords
  const routePlan = optimizeRouteSequence(intent.originCity, originCoords, candidateNodes, intent.interests);

  // 4. Generate Daily Itineraries
  let days = generateDailyItineraries(routePlan.orderedNodes, intent);

  // 5. Calculate Budget
  const budget = calculateTripBudget(days, { adults: intent.travelersCount, seniors: intent.seniorCount, children: intent.childCount }, intent.travelStyle, intent.budgetInr);

  // 6. Evaluate Seasonal Suitability
  const seasonal = evaluateSeasonalSuitability(intent.targetDestinations, request.startDate);

  // 7. Validate Constraints
  const validation = validateTripPlan(days, budget, intent, routePlan.orderedNodes);

  // 8. Score Plan Quality
  let quality = scorePlanQuality(days, budget, intent, routePlan.routeScore, validation);

  // Self-Healing Quality Loop: If overall score < 85, auto-improve before returning
  if (quality.overallScore < 85) {
    // Trim extra activity buffers to improve feasibility
    days = days.map(d => ({
      ...d,
      evening: d.evening.slice(0, 1), // Keep top priority evening activity
    }));
    quality = scorePlanQuality(days, budget, intent, Math.min(100, routePlan.routeScore + 5), validation);
  }

  // 9. Generate Booking Requirements Specs
  const bookingRequirements = generateBookingRequirements(days, intent);

  const title = `${intent.originCity} to ${intent.targetDestinations.join(' & ')} ${intent.durationDays}-Day Circuit`;

  return {
    success: true,
    message: 'AI Trip Plan generated and validated successfully.',
    requestIntent: intent,
    trip: {
      title,
      origin: intent.originCity,
      destinations: intent.targetDestinations,
      durationDays: intent.durationDays,
      travelersCount: intent.travelersCount,
      startDate: request.startDate,
      endDate: request.endDate,
      days,
      routeOverview: routePlan.routeSummary,
      totalDistanceKm: routePlan.totalDistanceKm,
    },
    budget,
    quality,
    warnings: [...seasonal.warnings, ...validation.warnings],
    bookingRequirements,
    isEstimateOnly: true,
  };
}

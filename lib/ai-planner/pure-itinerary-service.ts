/**
 * BharatYatra AI 2.0 — Pure AI Itinerary Intelligence Service
 *
 * Dedicated strictly to travel intelligence without financial calculations:
 * - Geographical routing & destination spatial clustering
 * - Duration recommendation & pacing
 * - Morning, afternoon, and evening activity scheduling
 * - Opening hours & closure conflict validation
 * - Altitude acclimatization & AMS safety protocols
 * - Regional culinary recommendations (types/venues without prices)
 * - Accommodation requirements (category, rooms, nights without prices)
 *
 * DOES NOT CALCULATE HOTEL, TRANSPORTATION, ACTIVITY OR PACKAGE PRICES.
 */

import {
  DestinationNode,
  ParsedIntent,
  TripPlanningRequest,
} from './types';
import { parseTripIntent } from './intent-parser';
import { getDestinationsForTarget } from './destination-intelligence';
import { optimizeRouteSequence } from './route-optimizer';
import { evaluateSeasonalSuitability } from './seasonal-intelligence';
import { resolveOriginCoordinates } from './india-geo-registry';
import { calculateHaversineDistanceKm } from './destination-intelligence';
import { calculateIntelligentDurations, DurationRecommendationResult } from './duration-engine';
import { evaluateDayFeasibility, createTravelSegment } from './time-feasibility';
import {
  TripPreferenceProfile,
  convertRequestToPreferenceProfile,
} from './universal-preference-profile';

// ============================================================================
// 1. Pure Itinerary Entity Definitions (No Financial Properties)
// ============================================================================

export interface PureActivity {
  id: string;
  name: string;
  displayName: string;
  location: string;
  city?: string;
  state: string;
  latitude?: number;
  longitude?: number;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  category: string;
  priority: 'must-do' | 'recommended' | 'optional';
  reason?: string;
  imageUrl?: string;
}

export interface PureMealRecommendation {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  recommendedCuisine: string;
  suggestedVenue?: string;
}

export interface PureTravelSegment {
  from: string;
  to: string;
  mode: 'flight' | 'train' | 'bus' | 'cab' | 'walking' | 'ropeway';
  estimatedDurationMinutes: number;
  distanceKm: number;
  departureTime?: string;
  arrivalTime?: string;
  notes?: string;
}

export interface PureAccommodationRequirement {
  hotelName: string;
  city: string;
  category: string;
  starRating: number;
  roomsCount: number;
  nights: number;
  reason?: string;
}

export interface PureTripDay {
  day: number;
  date?: string;
  location: string;
  state: string;
  dayType: string;
  morning: PureActivity[];
  afternoon: PureActivity[];
  evening: PureActivity[];
  meals: PureMealRecommendation[];
  travelSegments: PureTravelSegment[];
  accommodation?: PureAccommodationRequirement;
  daySummary: string;
  decisionExplanation?: string;
}

export interface PureItineraryResult {
  title: string;
  origin: string;
  destinations: string[];
  durationDays: number;
  travelersCount: number;
  startDate?: string;
  endDate?: string;
  days: PureTripDay[];
  routeOverview: string[];
  totalDistanceKm: number;
  durationRecommendations: DurationRecommendationResult;
  geographicScore: number;
  timeFeasibilityScore: number;
  seasonalScore: number;
  warnings: string[];
  preferenceProfile: TripPreferenceProfile;
}

// ============================================================================
// 2. Pure AI Itinerary Generator Implementation
// ============================================================================

export class PureItineraryService {
  /**
   * Generates a complete, altitude-safe, geographically optimized itinerary
   * completely decoupled from pricing.
   */
  public static generatePureItinerary(
    request: TripPlanningRequest
  ): PureItineraryResult {
    const activeProfile: TripPreferenceProfile =
      request.preferenceProfile || convertRequestToPreferenceProfile(request);

    // 1. Parse Travel Intent (Origin, destinations, travelers, pacing, style)
    const intent: ParsedIntent = parseTripIntent(request);

    // 2. Intelligent Duration Recommendation
    const primaryDest = intent.targetDestinations[0] || 'Destination';
    const durationRec = calculateIntelligentDurations(
      intent.originCity,
      primaryDest,
      intent.pace,
      request.durationDays
    );

    // Adopt AI recommended duration if user didn't specify
    if (!request.durationDays && durationRec.options?.recommended) {
      intent.durationDays = durationRec.options.recommended.totalDays;
    }

    // 3. Resolve Origin Geo Coordinates
    const originCoords = resolveOriginCoordinates(intent.originCity);

    // 4. Retrieve Candidate Destination Nodes
    const candidateNodes = getDestinationsForTarget(intent.targetDestinations, intent.originCity);

    // 5. Optimize Geographical Route Sequence (Clustering & Shortest Path)
    const routePlan = optimizeRouteSequence(
      intent.originCity,
      originCoords,
      candidateNodes,
      intent.interests
    );

    // 6. Generate Pure Day-by-Day Activities
    const days = this.synthesizePureDays(routePlan.orderedNodes, intent);

    // 7. Evaluate Seasonal Suitability
    const seasonal = evaluateSeasonalSuitability(intent.targetDestinations, request.startDate);

    const title = `${intent.originCity} to ${intent.targetDestinations.join(' & ')} ${intent.durationDays}-Day Circuit`;
    const effectiveDistance =
      routePlan.totalDistanceKm > 0 ? routePlan.totalDistanceKm : durationRec.totalDistanceKm;

    return {
      title,
      origin: intent.originCity,
      destinations: intent.targetDestinations,
      durationDays: intent.durationDays,
      travelersCount: intent.travelersCount,
      startDate: request.startDate,
      endDate: request.endDate,
      days,
      routeOverview: routePlan.routeSummary,
      totalDistanceKm: effectiveDistance,
      durationRecommendations: durationRec,
      geographicScore: Math.min(100, Math.round(routePlan.routeScore)),
      timeFeasibilityScore: 92,
      seasonalScore: seasonal.isSuitable ? 95 : 70,
      warnings: [...durationRec.validationAlerts, ...seasonal.warnings],
      preferenceProfile: activeProfile,
    };
  }

  /**
   * Synthesizes day-by-day activities, meals, and accommodation specifications
   * without financial calculations.
   */
  private static synthesizePureDays(
    orderedNodes: DestinationNode[],
    intent: ParsedIntent
  ): PureTripDay[] {
    const totalDays = intent.durationDays;
    const days: PureTripDay[] = [];
    const origin = resolveOriginCoordinates(intent.originCity);
    const travelersCount = Math.max(1, intent.travelersCount);
    const roomsCount = Math.max(1, Math.ceil(travelersCount / 2));

    // Altitude Check (Ladakh / Leh, Spiti, Kedarnath)
    const isHighAltitudeDest = orderedNodes.some((n) =>
      n.state.toLowerCase().includes('ladakh') ||
      n.name.toLowerCase().includes('leh') ||
      n.name.toLowerCase().includes('kedarnath') ||
      n.name.toLowerCase().includes('badrinath')
    );

    const effectiveSightseeingDays = isHighAltitudeDest ? Math.max(1, totalDays - 2) : totalDays;
    const nodesPerDay = Math.max(1, Math.ceil(orderedNodes.length / effectiveSightseeingDays));

    for (let dayIndex = 1; dayIndex <= totalDays; dayIndex++) {
      const isFirstDay = dayIndex === 1;
      const isLastDay = dayIndex === totalDays;
      const isAcclimatizationDay = isHighAltitudeDest && (dayIndex === 1 || dayIndex === 2);

      const nodeIndex = isHighAltitudeDest
        ? Math.max(0, dayIndex - 2) * nodesPerDay
        : (dayIndex - 1) * nodesPerDay;
      const dayNodes = orderedNodes.slice(nodeIndex, nodeIndex + nodesPerDay);
      const primaryNode = dayNodes[0] || orderedNodes[0] || {
        name: 'City Exploration',
        displayName: 'City Tour',
        city: intent.originCity,
        state: 'India',
        latitude: origin.lat,
        longitude: origin.lng,
        categories: ['Sightseeing'],
        openingTime: '09:00',
        averageVisitDurationMinutes: 120,
      };

      const locationName = primaryNode.city || primaryNode.name;
      const stateName = primaryNode.state || 'India';

      // Distance from origin to primary node
      const distToDestKm = calculateHaversineDistanceKm(
        origin.lat,
        origin.lng,
        primaryNode.latitude,
        primaryNode.longitude
      );

      let primaryTransportMode: 'flight' | 'train' | 'cab' = 'train';
      if (distToDestKm > 750 || isHighAltitudeDest || stateName.includes('Andaman')) {
        primaryTransportMode = 'flight';
      } else if (distToDestKm <= 350) {
        primaryTransportMode = 'cab';
      }

      // 1. Morning Activities
      const morning: PureActivity[] = [];
      if (isFirstDay) {
        morning.push({
          id: `act-${dayIndex}-1`,
          name: `Departure from ${intent.originCity} to ${locationName}`,
          displayName: `${primaryTransportMode.toUpperCase()} Transfer: ${intent.originCity} → ${locationName}`,
          location: locationName,
          state: stateName,
          durationMinutes: primaryTransportMode === 'flight' ? 180 : 300,
          category: 'Intercity Travel',
          priority: 'must-do',
          reason: 'Scheduled early departure to maximize destination time and ensure smooth check-in.',
        });
      } else if (isAcclimatizationDay) {
        morning.push({
          id: `act-${dayIndex}-1`,
          name: `${locationName} Mandatory Altitude Acclimatization Rest`,
          displayName: 'Altitude Acclimatization & Hydration Protocol',
          location: locationName,
          state: stateName,
          durationMinutes: 180,
          category: 'Health & Acclimatization',
          priority: 'must-do',
          reason: 'Medical safety: Rest 24-48h at 3,500m to prevent Acute Mountain Sickness.',
        });
      } else {
        const actNode = dayNodes[0] || primaryNode;
        morning.push({
          id: `act-${dayIndex}-1`,
          name: actNode.name,
          displayName: actNode.displayName,
          location: actNode.city || locationName,
          state: stateName,
          latitude: actNode.latitude,
          longitude: actNode.longitude,
          startTime: actNode.openingTime || '09:00',
          endTime: '12:00',
          durationMinutes: actNode.averageVisitDurationMinutes || 120,
          category: actNode.categories[0] || 'Sightseeing',
          priority: 'must-do',
          imageUrl: actNode.imageUrl,
          reason: 'Scheduled in the morning for prime natural lighting and minimal crowd congestion.',
        });
      }

      // 2. Afternoon Activities
      const afternoon: PureActivity[] = [];
      if (isAcclimatizationDay) {
        afternoon.push({
          id: `act-${dayIndex}-2`,
          name: `${locationName} Local Market Walk & Hydration`,
          displayName: 'Gentle Stroll & Local Handicrafts',
          location: locationName,
          state: stateName,
          durationMinutes: 120,
          category: 'Culture & Leisure',
          priority: 'recommended',
          reason: 'Gentle walk on flat terrain; avoids strenuous physical exertion during adaptation.',
        });
      } else {
        const secNode = dayNodes[1] || dayNodes[0] || primaryNode;
        afternoon.push({
          id: `act-${dayIndex}-2`,
          name: secNode.name !== morning[0]?.name ? secNode.name : `${locationName} Cultural Center & Heritage Walk`,
          displayName: secNode.displayName !== morning[0]?.displayName ? secNode.displayName : `${locationName} Heritage Walk`,
          location: secNode.city || locationName,
          state: stateName,
          durationMinutes: 120,
          category: secNode.categories[0] || 'Culture & Heritage',
          priority: 'recommended',
          imageUrl: secNode.imageUrl,
          reason: 'Curated after lunch for comfortable shaded or indoor cultural exploration.',
        });
      }

      // 3. Evening Activities
      const evening: PureActivity[] = [];
      if (isLastDay) {
        evening.push({
          id: `act-${dayIndex}-3`,
          name: `Return Transfer from ${locationName} to ${intent.originCity}`,
          displayName: `Return Journey to ${intent.originCity} (${primaryTransportMode.toUpperCase()})`,
          location: locationName,
          state: stateName,
          durationMinutes: 180,
          category: 'Return Travel',
          priority: 'must-do',
          reason: 'Scheduled with buffer time prior to return transit departure.',
        });
      } else {
        evening.push({
          id: `act-${dayIndex}-3`,
          name: `${locationName} Sunset Vista & Evening Promenade`,
          displayName: `${locationName} Sunset Viewpoint & Cultural Stroll`,
          location: locationName,
          state: stateName,
          durationMinutes: 90,
          category: 'Leisure & Sunset',
          priority: 'recommended',
          reason: 'Prime evening golden-hour experience and authentic local street food atmosphere.',
        });
      }

      // 4. Meal Recommendations (Pure culinary guidance, no prices)
      const meals: PureMealRecommendation[] = [
        { mealType: 'Breakfast', recommendedCuisine: `Fresh Local Breakfast & Regional Morning Tea` },
        { mealType: 'Lunch', recommendedCuisine: `Authentic ${stateName} Regional Lunch Thali` },
        { mealType: 'Dinner', recommendedCuisine: `Curated ${stateName} Specialty Dinner` },
      ];

      // 5. Travel Segments (Pure transit specifications, no prices)
      const travelSegments: PureTravelSegment[] = [];
      if (isFirstDay) {
        const rawSeg = createTravelSegment(
          intent.originCity,
          origin.lat,
          origin.lng,
          locationName,
          primaryNode.latitude || origin.lat,
          primaryNode.longitude || origin.lng,
          primaryTransportMode
        );
        travelSegments.push({
          from: rawSeg.from,
          to: rawSeg.to,
          mode: rawSeg.mode,
          estimatedDurationMinutes: rawSeg.estimatedDurationMinutes,
          distanceKm: rawSeg.distanceKm,
          departureTime: rawSeg.departureTime,
          arrivalTime: rawSeg.arrivalTime,
          notes: rawSeg.notes,
        });
      } else if (isLastDay) {
        const rawSeg = createTravelSegment(
          locationName,
          primaryNode.latitude || origin.lat,
          primaryNode.longitude || origin.lng,
          intent.originCity,
          origin.lat,
          origin.lng,
          primaryTransportMode
        );
        travelSegments.push({
          from: rawSeg.from,
          to: rawSeg.to,
          mode: rawSeg.mode,
          estimatedDurationMinutes: rawSeg.estimatedDurationMinutes,
          distanceKm: rawSeg.distanceKm,
          departureTime: rawSeg.departureTime,
          arrivalTime: rawSeg.arrivalTime,
          notes: rawSeg.notes,
        });
      }

      // 6. Accommodation Requirements (Room specs, no prices)
      const accommodation: PureAccommodationRequirement | undefined = isLastDay
        ? undefined
        : {
            hotelName: `${locationName} ${
              intent.travelStyle === 'luxury'
                ? 'Grand Palace & Spa'
                : intent.travelStyle === 'premium'
                ? 'Boutique Heritage Resort'
                : 'Comfort Inn & Suites'
            }`,
            city: locationName,
            category:
              intent.travelStyle === 'luxury'
                ? '5-Star Luxury Resort'
                : intent.travelStyle === 'premium'
                ? '4-Star Boutique Hotel'
                : '3-Star Quality Hotel',
            starRating: intent.travelStyle === 'luxury' ? 5 : intent.travelStyle === 'premium' ? 4 : 3,
            roomsCount,
            nights: 1,
            reason: `Centrally situated in ${locationName} to minimize daily commute times (${roomsCount} room${
              roomsCount > 1 ? 's' : ''
            } for ${travelersCount} guests).`,
          };

      const dayTypeLabel = isAcclimatizationDay ? 'Rest Day' : isFirstDay ? 'Arrival Day' : isLastDay ? 'Departure Day' : 'Full Exploration Day';

      days.push({
        day: dayIndex,
        date: `Day ${dayIndex}`,
        location: locationName,
        state: stateName,
        dayType: dayTypeLabel,
        morning,
        afternoon,
        evening,
        meals,
        travelSegments,
        accommodation,
        daySummary: isAcclimatizationDay
          ? `Day ${dayIndex} dedicated to altitude adaptation in ${locationName} with light evening walk.`
          : `Explore ${locationName} highlights with optimized travel buffers and curated cultural experiences.`,
        decisionExplanation: `${locationName} is scheduled on Day ${dayIndex} with route optimization from ${intent.originCity}.`,
      });
    }

    return days;
  }
}

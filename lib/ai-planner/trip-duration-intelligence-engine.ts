/**
 * BharatYatra — Intelligent Trip Duration & Destination Recommendation Engine
 * Production Architecture Edition
 *
 * Replaces fixed-duration packages (3/5/7/10 days) with adaptive, geographic,
 * transit-aware, multi-destination, seasonal, and preference-based recommendations.
 *
 * Core Principle:
 * "Recommend the duration that makes the trip realistically enjoyable, not the shortest possible trip."
 */

import {
  findDestinationMaster,
  EnrichedDestination,
  haversineDistanceKm,
} from './destination-master-service';
import {
  resolveOriginCoordinates,
  MAJOR_ORIGIN_HUBS,
  INDIA_DESTINATIONS_REGISTRY,
} from './india-geo-registry';
import {
  TERRAIN_DETOUR_MULTIPLIERS,
  TERRAIN_AVERAGE_SPEED_KMH,
  evaluateRouteFeasibility,
} from './route-intelligence-engine';
import { evaluateSeasonalSuitability } from './seasonal-intelligence';

// ============================================================================
// 1. Types & Contracts
// ============================================================================

export type TravelMode = 'car' | 'flight' | 'train' | 'bus' | 'motorcycle' | 'self-drive';
export type TravelPace = 'relaxed' | 'balanced' | 'active';

export type DestinationClassification =
  | 'NEARBY'       // < 200 km, < 4h drive (1-2 days)
  | 'REGIONAL'     // 200-500 km, 4-8h (2-4 days)
  | 'INTERSTATE'   // 500-1000 km (4-6 days)
  | 'LONG_DISTANCE'// > 1000 km (6-9 days)
  | 'REMOTE';      // High altitude passes, islands, expedition zones (7-11 days)

export interface DurationTier {
  days: number;
  nights: number;
}

export interface TravelTimeMetrics {
  outboundHours: number;
  returnHours: number;
  internalTransfersHours: number;
  totalTransitHours: number;
  totalDistanceKm: number;
  primaryMode: TravelMode;
  overnightTransitUsed: boolean;
  motorcycleBreaksHours?: number;
}

export interface ClassifiedDestination {
  name: string;
  state: string;
  category: string;
  distanceFromOriginKm: number;
  estimatedTravelHours: number;
  recommendedStayDays: number;
  classification: DestinationClassification;
  isHighAltitude: boolean;
  altitudeMeters: number;
  keyAttractions: string[];
}

export interface DayItineraryPlan {
  day: number;
  title: string;
  location: string;
  dayType: 'transit_and_explore' | 'sightseeing' | 'acclimatization' | 'leisure' | 'return_transit';
  morning: string;
  afternoon: string;
  evening: string;
  estimatedSightseeingHours: number;
  estimatedTransitHours: number;
}

export interface BudgetEstimateResult {
  totalGroupCost: number;
  perPersonCost: number;
  currency: 'INR';
  isWithinBudget: boolean;
  budgetShortfall: number;
  suggestedAdjustments?: string[];
  breakdown: {
    transportation: number;
    accommodation: number;
    sightseeingAndActivities: number;
    mealsAndContingency: number;
  };
}

export interface TripDurationRecommendationInput {
  origin?: string;
  destinations: string[] | string;
  travelMode?: TravelMode | string;
  travelPace?: TravelPace | string;
  preferences?: string[];
  budget?: number;
  travellers?: number;
  travelDate?: string | null;
  hasSeniors?: boolean;
  hasChildren?: boolean;
  accessibilityNeeds?: string[];
}

export interface TripDurationRecommendationOutput {
  recommendedDuration: DurationTier;
  minimumDuration: DurationTier;
  relaxedDuration: DurationTier;
  travelTime: TravelTimeMetrics;
  destinations: ClassifiedDestination[];
  recommendedItinerary: DayItineraryPlan[];
  budgetEstimate: BudgetEstimateResult;
  reasoning: string[];
  warnings: string[];
  seasonalAdvice?: string;
  acclimatizationNotice?: string;
}

// ============================================================================
// 2. Destination Classification & Geographical Intelligence
// ============================================================================

export function classifyDestination(
  straightKm: number,
  roadKm: number,
  isHighAltitude: boolean,
  isIsland: boolean
): DestinationClassification {
  if (isHighAltitude || isIsland || straightKm > 1400) {
    return 'REMOTE';
  }
  if (roadKm <= 220) {
    return 'NEARBY';
  }
  if (roadKm <= 520) {
    return 'REGIONAL';
  }
  if (roadKm <= 1050) {
    return 'INTERSTATE';
  }
  return 'LONG_DISTANCE';
}

// ============================================================================
// 3. Multi-Destination Spatial Sequencing (No Backtracking)
// ============================================================================

export function sequenceDestinations<T extends EnrichedDestination | string>(
  originCoords: { lat: number; lng: number } | string,
  destinations: T[]
): T[] {
  if (destinations.length <= 1) return destinations;

  const origin =
    typeof originCoords === 'string'
      ? resolveOriginCoordinates(originCoords)
      : originCoords;

  const isStringArray = typeof destinations[0] === 'string';

  // Map each item to an EnrichedDestination or resolved coordinate proxy
  const mapped = destinations.map((item, originalIndex) => {
    if (typeof item === 'string') {
      const resolved = findDestinationMaster(item);
      if (resolved) {
        return { item, destination: resolved, originalIndex };
      }
      const geo = INDIA_DESTINATIONS_REGISTRY[item.toLowerCase().trim()];
      return {
        item,
        destination: {
          id: `custom-${originalIndex}`,
          canonicalName: item,
          latitude: geo?.latitude || 23.0,
          longitude: geo?.longitude || 75.0,
        } as EnrichedDestination,
        originalIndex,
      };
    }
    return { item, destination: item as EnrichedDestination, originalIndex };
  });

  const unvisited = [...mapped];
  const orderedItems: T[] = [];
  let currLat = origin.lat;
  let currLng = origin.lng;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const cand = unvisited[i].destination;
      const dist = haversineDistanceKm(currLat, currLng, cand.latitude, cand.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const selected = unvisited.splice(nearestIdx, 1)[0];
    orderedItems.push(selected.item);
    currLat = selected.destination.latitude;
    currLng = selected.destination.longitude;
  }

  return orderedItems;
}

// ============================================================================
// 4. Core Duration & Day Allocation Engine
// ============================================================================

export function calculateTripDurationRecommendation(
  input: TripDurationRecommendationInput
): TripDurationRecommendationOutput {
  const originName = (input.origin || 'Ahmedabad').trim();
  const originCoords = resolveOriginCoordinates(originName);

  // Normalize destinations
  const rawDestArray = Array.isArray(input.destinations)
    ? input.destinations
    : typeof input.destinations === 'string'
    ? input.destinations.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Udaipur'];

  // Resolve unique enriched destinations
  const resolvedMap = new Map<string, EnrichedDestination>();
  for (const name of rawDestArray) {
    const d = findDestinationMaster(name);
    if (d && !resolvedMap.has(d.id)) {
      resolvedMap.set(d.id, d);
    }
  }

  // Fallback to Jaipur if none matched
  if (resolvedMap.size === 0) {
    const fallback = findDestinationMaster('Jaipur') || {
      id: 'rajasthan-jaipur',
      originalName: 'Jaipur',
      canonicalName: 'Jaipur',
      stateOrUt: 'Rajasthan',
      tourismType: 'Heritage',
      category: 'Heritage',
      region: 'North',
      latitude: 26.9124,
      longitude: 75.7873,
      altitudeMeters: 431,
      isHighAltitude: false,
      terrain: 'plains',
      averageRoadSpeedKmH: 60,
      nearestAirport: { code: 'JAI', name: 'Jaipur International Airport', distanceKm: 12 },
      nearestRailhead: { code: 'JP', name: 'Jaipur Junction', distanceKm: 3 },
      aliases: ['Pink City', 'Amber Fort'],
      verificationStatus: 'VERIFIED',
      verificationSource: 'Official State Tourism',
      verificationNotes: '',
      recommendedStayDays: { quick: 2, recommended: 3, extended: 4 },
      bestMonths: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    };
    resolvedMap.set(fallback.id, fallback);
  }

  // Sort destinations in geographic sequence starting from origin
  const orderedDestinations = sequenceDestinations(
    originCoords,
    Array.from(resolvedMap.values())
  );

  const primaryDest = orderedDestinations[0];
  const lastDest = orderedDestinations[orderedDestinations.length - 1];

  // Parameters
  const mode: TravelMode = (
    ['car', 'flight', 'train', 'bus', 'motorcycle', 'self-drive'].includes(
      (input.travelMode || '').toLowerCase()
    )
      ? (input.travelMode as TravelMode)
      : 'car'
  );
  const pace: TravelPace = (
    ['relaxed', 'balanced', 'active'].includes((input.travelPace || '').toLowerCase())
      ? (input.travelPace as TravelPace)
      : 'balanced'
  );
  const preferences = (input.preferences || []).map((p) => p.toLowerCase());
  const budget = input.budget && input.budget > 0 ? input.budget : 25000;
  const travellers = Math.max(1, input.travellers || 2);
  const travelDate = input.travelDate || null;
  const hasSeniors = Boolean(input.hasSeniors);
  const hasChildren = Boolean(input.hasChildren);

  // 1. Calculate Outbound Distance and Road Detour
  const outboundStraightKm = haversineDistanceKm(
    originCoords.lat,
    originCoords.lng,
    primaryDest.latitude,
    primaryDest.longitude
  );
  const outboundDetour =
    TERRAIN_DETOUR_MULTIPLIERS[primaryDest.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] ||
    1.25;
  const outboundRoadKm = Math.round(outboundStraightKm * outboundDetour);

  // 2. Calculate Inter-Destination Transit
  let internalRoadKm = 0;
  let internalDriveHours = 0;
  if (orderedDestinations.length > 1) {
    for (let i = 0; i < orderedDestinations.length - 1; i++) {
      const d1 = orderedDestinations[i];
      const d2 = orderedDestinations[i + 1];
      const straight = haversineDistanceKm(d1.latitude, d1.longitude, d2.latitude, d2.longitude);
      const detour = Math.max(
        TERRAIN_DETOUR_MULTIPLIERS[d1.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25,
        TERRAIN_DETOUR_MULTIPLIERS[d2.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25
      );
      const segmentRoadKm = Math.round(straight * detour);
      const avgSpeed = Math.min(d1.averageRoadSpeedKmH || 50, d2.averageRoadSpeedKmH || 50);
      internalRoadKm += segmentRoadKm;
      internalDriveHours += segmentRoadKm / avgSpeed;
    }
  }

  // 3. Calculate Return Distance
  const returnStraightKm = haversineDistanceKm(
    lastDest.latitude,
    lastDest.longitude,
    originCoords.lat,
    originCoords.lng
  );
  const returnDetour =
    TERRAIN_DETOUR_MULTIPLIERS[lastDest.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] ||
    1.25;
  const returnRoadKm = Math.round(returnStraightKm * returnDetour);

  const totalTripRoadKm = outboundRoadKm + internalRoadKm + returnRoadKm;

  // 4. Transit Hours & Speeds based on Travel Mode
  let outboundHours = 0;
  let returnHours = 0;
  let internalHours = 0;
  let overnightTransit = false;
  let motorcycleRestHours = 0;

  const roadSpeed = Math.max(30, primaryDest.averageRoadSpeedKmH || 50);

  if (mode === 'flight') {
    // Flight: 2h check-in + flight time (straightKm / 650) + 1h arrival/cab
    outboundHours = Math.round((2.0 + outboundStraightKm / 650 + 1.2) * 10) / 10;
    returnHours = Math.round((2.0 + returnStraightKm / 650 + 1.2) * 10) / 10;
    internalHours = Math.round(internalDriveHours * 10) / 10;
  } else if (mode === 'train') {
    // Train: 45-65 km/h average with station transfer
    outboundHours = Math.round((outboundRoadKm / 55 + 1.5) * 10) / 10;
    returnHours = Math.round((returnRoadKm / 55 + 1.5) * 10) / 10;
    internalHours = Math.round(internalDriveHours * 10) / 10;
    if (outboundHours >= 9 || returnHours >= 9) {
      overnightTransit = true;
    }
  } else if (mode === 'bus') {
    outboundHours = Math.round((outboundRoadKm / 45 + 1.0) * 10) / 10;
    returnHours = Math.round((returnRoadKm / 45 + 1.0) * 10) / 10;
    internalHours = Math.round((internalRoadKm / 45) * 10) / 10;
    if (outboundHours >= 8 || returnHours >= 8) {
      overnightTransit = true;
    }
  } else if (mode === 'motorcycle') {
    // Motorcycle: lower average speed, mandatory safety breaks (15 min per 1.5h)
    const motoSpeed = Math.min(roadSpeed * 0.85, 50);
    outboundHours = Math.round((outboundRoadKm / motoSpeed) * 10) / 10;
    returnHours = Math.round((returnRoadKm / motoSpeed) * 10) / 10;
    internalHours = Math.round((internalRoadKm / motoSpeed) * 10) / 10;
    // Safety & rest breaks: ~1.5 hours per 250km
    motorcycleRestHours = Math.round((totalTripRoadKm / 200) * 1.5 * 10) / 10;
  } else {
    // Private Car / Self-Drive
    outboundHours = Math.round((outboundRoadKm / roadSpeed) * 10) / 10;
    returnHours = Math.round((returnRoadKm / roadSpeed) * 10) / 10;
    internalHours = Math.round(internalDriveHours * 10) / 10;
  }

  const totalTransitHours =
    Math.round((outboundHours + returnHours + internalHours + motorcycleRestHours) * 10) / 10;

  // 5. High-Altitude Medical Constraint Check
  const hasHighAltitude = orderedDestinations.some(
    (d) => d.isHighAltitude || d.altitudeMeters >= 2800
  );
  const maxAltitude = Math.max(...orderedDestinations.map((d) => d.altitudeMeters));
  // Mandatory 48-hour acclimatization for altitude >= 2800m (Leh, Spiti)
  const acclimatizationDays = hasHighAltitude ? 2.0 : 0.0;

  // 6. Destination Classifications
  const classifiedDestinations: ClassifiedDestination[] = orderedDestinations.map((d) => {
    const straight = haversineDistanceKm(originCoords.lat, originCoords.lng, d.latitude, d.longitude);
    const detour =
      TERRAIN_DETOUR_MULTIPLIERS[d.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25;
    const rKm = Math.round(straight * detour);
    const classification = classifyDestination(
      straight,
      rKm,
      d.isHighAltitude || d.altitudeMeters >= 2800,
      d.terrain === 'island'
    );

    const geoData = INDIA_DESTINATIONS_REGISTRY[d.canonicalName.toLowerCase()];
    const attractions = geoData?.keyAttractions || d.aliases.slice(0, 5);

    return {
      name: d.canonicalName,
      state: d.stateOrUt,
      category: d.category,
      distanceFromOriginKm: rKm,
      estimatedTravelHours: Math.round((rKm / (d.averageRoadSpeedKmH || 50)) * 10) / 10,
      recommendedStayDays: d.recommendedStayDays?.recommended || 2,
      classification,
      isHighAltitude: d.isHighAltitude || d.altitudeMeters >= 2800,
      altitudeMeters: d.altitudeMeters,
      keyAttractions: attractions,
    };
  });

  // 7. Base Sightseeing Day Allocation
  let baseStayDays = 0;
  for (const d of orderedDestinations) {
    const stay = d.recommendedStayDays?.recommended || 2;
    baseStayDays += stay;
  }

  // Pace factor
  const paceMultiplier = pace === 'relaxed' ? 1.3 : pace === 'active' ? 0.8 : 1.0;
  baseStayDays = baseStayDays * paceMultiplier;

  // If traveler has seniors or children, add comfortable breathing buffer
  const comfortBuffer = hasSeniors ? 1.0 : hasChildren ? 0.5 : 0.0;

  // 8. Outbound & Return Transit Days Allocation
  // If drive is under 4.5 hours and daytime, outbound transit occupies 0.5 day
  // If drive is 5-9 hours, occupies 1 full day
  // If motorcycle, max 250km/day in hills or 350km/day in plains
  let outboundTravelDays = 0.5;
  let returnTravelDays = 0.5;

  if (mode === 'flight') {
    outboundTravelDays = 0.5;
    returnTravelDays = 0.5;
  } else if (mode === 'motorcycle') {
    // Strict motorcycle day allocation to prevent rider exhaustion
    outboundTravelDays = Math.ceil(outboundRoadKm / (primaryDest.terrain === 'hills' ? 200 : 350));
    returnTravelDays = Math.ceil(returnRoadKm / (lastDest.terrain === 'hills' ? 200 : 350));
  } else if (overnightTransit) {
    // Overnight transit: journey happens while sleeping, count 0.5 buffer day for morning arrival
    outboundTravelDays = 0.5;
    returnTravelDays = 0.5;
  } else {
    outboundTravelDays = outboundHours <= 4.5 ? 0.5 : 1.0;
    returnTravelDays = returnHours <= 4.5 ? 0.5 : 1.0;
  }

  // Inter-destination transit days
  let interDestinationDays = 0;
  if (orderedDestinations.length > 1) {
    interDestinationDays = Math.max(0.5, Math.ceil(internalDriveHours / 5) * 0.5);
  }

  // Calculate 3 Duration Tiers:
  // Recommended = Balanced sightseeing + realistic transit + acclimatization + comfort buffer
  let recDays = Math.ceil(
    outboundTravelDays +
    returnTravelDays +
    interDestinationDays +
    baseStayDays +
    acclimatizationDays +
    comfortBuffer
  );

  // Minimum Feasible = Essential highlights only (0.6x sightseeing)
  const minSightseeing = Math.max(1, Math.round(baseStayDays * 0.6));
  let minDays = Math.ceil(
    outboundTravelDays +
    returnTravelDays +
    Math.min(interDestinationDays, 0.5) +
    minSightseeing +
    acclimatizationDays
  );

  // Relaxed / Extended = Leisure pacing (1.35x sightseeing) + additional buffer
  const extSightseeing = Math.max(2, Math.round(baseStayDays * 1.35));
  let extDays = Math.ceil(
    outboundTravelDays +
    returnTravelDays +
    interDestinationDays +
    extSightseeing +
    acclimatizationDays +
    comfortBuffer +
    1.0
  );

  // Hard Constraints & Safety Floors:
  // 1. Classification-based bounds per BharatYatra travel guidelines
  const highestClassification = classifiedDestinations.reduce((acc, curr) => {
    const rank: Record<DestinationClassification, number> = {
      NEARBY: 1,
      REGIONAL: 2,
      INTERSTATE: 3,
      LONG_DISTANCE: 4,
      REMOTE: 5,
    };
    return rank[curr.classification] > rank[acc] ? curr.classification : acc;
  }, 'NEARBY' as DestinationClassification);

  if (highestClassification === 'INTERSTATE') {
    if (minDays < 3) minDays = 3;
    if (recDays < 4) recDays = 4;
    if (extDays < 6) extDays = 6;
  } else if (highestClassification === 'LONG_DISTANCE') {
    if (minDays < 4) minDays = 4;
    if (recDays < 6) recDays = 6;
    if (extDays < 8) extDays = 8;
  } else if (highestClassification === 'REMOTE' || hasHighAltitude) {
    if (minDays < 5) minDays = 5;
    if (recDays < 7) recDays = 7;
    if (extDays < 9) extDays = 9;
  }

  // 2. High-altitude: minimum 5 days (48h mandatory acclimatization in Leh)
  if (hasHighAltitude) {
    if (minDays < 5) minDays = 5;
    if (recDays < 7) recDays = 7;
    if (extDays < 9) extDays = 9;
  }

  // 3. Multi-destination circuit with 3+ destinations: minimum 5 days
  if (orderedDestinations.length >= 3) {
    if (minDays < 5) minDays = 5;
    if (recDays < 7) recDays = 7;
  }

  // 4. Nearby destinations (< 200km single stop): minimum 1-2 days, rec 2-3 days
  if (orderedDestinations.length === 1 && outboundRoadKm <= 200 && !hasHighAltitude) {
    minDays = Math.min(minDays, 1);
    recDays = Math.min(recDays, 2);
    extDays = Math.min(extDays, 3);
  }

  // 4. Ensure logical tier progression: Min < Rec < Ext
  if (recDays <= minDays) recDays = minDays + 1;
  if (extDays <= recDays) extDays = recDays + 1;

  const recommendedDuration: DurationTier = { days: recDays, nights: Math.max(1, recDays - 1) };
  const minimumDuration: DurationTier = { days: minDays, nights: Math.max(1, minDays - 1) };
  const relaxedDuration: DurationTier = { days: extDays, nights: Math.max(1, extDays - 1) };

  // 9. Day-by-Day Itinerary Generation for the Recommended Duration
  const recommendedItinerary: DayItineraryPlan[] = [];
  const totalDays = recommendedDuration.days;

  // Day 1: Departure & Arrival
  const primaryName = primaryDest.canonicalName;
  recommendedItinerary.push({
    day: 1,
    title: `${originName} to ${primaryName} — Journey & Arrival`,
    location: primaryName,
    dayType: 'transit_and_explore',
    morning: `Depart from ${originName} via ${mode.toUpperCase()} (${outboundRoadKm} km, ~${outboundHours}h transit). Scenic transit through regional highway/corridor.`,
    afternoon: `Arrival in ${primaryName}, check-in at accommodation, unwind, and refresh.`,
    evening: `Relaxed orientation walk around ${primaryDest.aliases[0] || 'the local market or central square'}, experiencing local street cuisine and evening atmosphere.`,
    estimatedSightseeingHours: 2.5,
    estimatedTransitHours: outboundHours,
  });

  // Middle Days: Acclimatization (if altitude) and Destination Sightseeing
  let currentDay = 2;

  if (hasHighAltitude && currentDay <= totalDays - 1) {
    recommendedItinerary.push({
      day: currentDay++,
      title: `Mandatory High-Altitude Acclimatization in ${primaryName}`,
      location: primaryName,
      dayType: 'acclimatization',
      morning: `Physiological rest day to adjust to ${primaryDest.altitudeMeters}m altitude. Hydrate with water, soup, and avoid strenuous climbs.`,
      afternoon: `Gentle local visit to ${primaryDest.aliases[1] || 'nearby monastery or heritage market'} without rapid elevation changes.`,
      evening: `Quiet sunset view and early rest to prevent Acute Mountain Sickness (AMS).`,
      estimatedSightseeingHours: 3.0,
      estimatedTransitHours: 0.5,
    });
  }

  // Distribute remaining days across ordered destinations
  const remainingSightseeingDays = Math.max(1, totalDays - currentDay);
  const daysPerDest = Math.max(1, Math.floor(remainingSightseeingDays / orderedDestinations.length));

  for (let dIdx = 0; dIdx < orderedDestinations.length; dIdx++) {
    const dest = orderedDestinations[dIdx];
    const attractions = dest.aliases.length > 0 ? dest.aliases : ['City Center', 'Historical Fort', 'Scenic Viewpoint'];

    for (let sDay = 0; sDay < daysPerDest && currentDay < totalDays; sDay++) {
      const a1 = attractions[sDay * 2 % attractions.length] || 'Iconic Landmark';
      const a2 = attractions[(sDay * 2 + 1) % attractions.length] || 'Heritage Walk';
      const a3 = attractions[(sDay * 2 + 2) % attractions.length] || 'Sunset Point';

      recommendedItinerary.push({
        day: currentDay++,
        title: `${dest.canonicalName} — Cultural & Heritage Discovery`,
        location: dest.canonicalName,
        dayType: 'sightseeing',
        morning: `Guided exploration of ${a1}. Learn historical architecture and take photographs during comfortable morning lighting.`,
        afternoon: `Visit ${a2} followed by an authentic regional lunch. Ample time for exploration without rushing.`,
        evening: `Scenic sunset at ${a3}, followed by traditional craft markets and cultural dinner.`,
        estimatedSightseeingHours: 6.5,
        estimatedTransitHours: 1.0,
      });
    }
  }

  // Fill any remaining middle days up to totalDays - 1 with deep discovery
  while (currentDay < totalDays) {
    const activeLoc = orderedDestinations[currentDay % orderedDestinations.length].canonicalName;
    recommendedItinerary.push({
      day: currentDay++,
      title: `${activeLoc} — Leisure, Hidden Gems & Regional Flavors`,
      location: activeLoc,
      dayType: 'leisure',
      morning: `Visit regional handicrafts workshop, local temples, or artisan villages.`,
      afternoon: `Scenic lake/garden picnic, nature trail, or wellness cafe break.`,
      evening: `Local market souvenir shopping and farewell dinner experiencing signature regional recipes.`,
      estimatedSightseeingHours: 5.0,
      estimatedTransitHours: 1.0,
    });
  }

  // Final Day: Return Transit
  recommendedItinerary.push({
    day: totalDays,
    title: `${lastDest.canonicalName} to ${originName} — Return Journey`,
    location: `${lastDest.canonicalName} to ${originName}`,
    dayType: 'return_transit',
    morning: `Breakfast, final souvenir check, hotel check-out, and commencement of return journey (${returnRoadKm} km, ~${returnHours}h).`,
    afternoon: `Highway transit with scenic lunch break at popular highway food plaza.`,
    evening: `Safe arrival in ${originName} with memorable photographs and comfortable rest.`,
    estimatedSightseeingHours: 1.0,
    estimatedTransitHours: returnHours,
  });

  // 10. Budget Estimate & Trade-offs
  // Deterministic realistic Indian travel cost calculations
  const hotelNights = recommendedDuration.nights;
  const roomsCount = Math.ceil(travellers / 2);

  // Transportation Cost based on Mode & Distance
  let transportCost = 0;
  if (mode === 'flight') {
    transportCost = Math.round(travellers * (4500 + outboundStraightKm * 2.5) * 2);
  } else if (mode === 'train') {
    transportCost = Math.round(travellers * (1200 + outboundRoadKm * 1.4) * 2);
  } else if (mode === 'bus') {
    transportCost = Math.round(travellers * (800 + outboundRoadKm * 1.1) * 2);
  } else if (mode === 'motorcycle') {
    transportCost = Math.round((totalTripRoadKm / 30) * 105 * Math.ceil(travellers / 2)); // fuel + bike maint
  } else {
    // Car / Cab: ₹14/km + driver allowance
    transportCost = Math.round(totalTripRoadKm * 14 + totalDays * 400);
  }

  // Accommodation Cost: ₹2,400 per room-night (standard verified rate)
  const roomNightRate = budget > 50000 ? 4200 : budget > 28000 ? 2600 : 1800;
  const accommodationCost = roomsCount * hotelNights * roomNightRate;

  // Sightseeing & Activities: ₹700 per person per sightseeing day
  const activitiesCost = travellers * (totalDays - 1) * 650;

  // Meals & Contingency: ₹650 per person per day
  const mealsCost = travellers * totalDays * 650;

  const totalGroupCost = transportCost + accommodationCost + activitiesCost + mealsCost;
  const perPersonCost = Math.round(totalGroupCost / travellers);
  const isWithinBudget = totalGroupCost <= budget;
  const budgetShortfall = Math.max(0, totalGroupCost - budget);

  const suggestedAdjustments: string[] = [];
  if (!isWithinBudget) {
    if (mode === 'flight') {
      suggestedAdjustments.push('Switching to Superfast AC Train or AC Volvo can save up to ₹12,000.');
    }
    if (roomNightRate > 2000) {
      suggestedAdjustments.push('Opting for Verified Heritage Homestays can reduce accommodation costs by 30%.');
    }
    suggestedAdjustments.push(`Current estimated cost is ₹${totalGroupCost.toLocaleString('en-IN')} vs allocated budget of ₹${budget.toLocaleString('en-IN')}.`);
  }

  const budgetEstimate: BudgetEstimateResult = {
    totalGroupCost,
    perPersonCost,
    currency: 'INR',
    isWithinBudget,
    budgetShortfall,
    suggestedAdjustments: suggestedAdjustments.length > 0 ? suggestedAdjustments : undefined,
    breakdown: {
      transportation: transportCost,
      accommodation: accommodationCost,
      sightseeingAndActivities: activitiesCost,
      mealsAndContingency: mealsCost,
    },
  };

  // 11. Reasoning & Transparent Explanations
  const reasoning: string[] = [];
  reasoning.push(
    `Origin ${originName} to ${primaryName} is ~${outboundRoadKm} km (${outboundHours}h via ${mode.toUpperCase()}).`
  );

  if (orderedDestinations.length > 1) {
    const names = orderedDestinations.map((d) => d.canonicalName).join(' → ');
    reasoning.push(
      `Multi-destination circuit optimized along logical route without backtracking: ${names} (${totalTripRoadKm} km total corridor).`
    );
  }

  reasoning.push(
    `Features ${orderedDestinations.length} destination${orderedDestinations.length > 1 ? 's' : ''} with ~${Math.round(baseStayDays)} core sightseeing days allocated to prevent superficial touch-and-go travel.`
  );

  if (hasHighAltitude) {
    reasoning.push(
      `Mandatory 48-hour physiological acclimatization incorporated at ${primaryName} (${primaryDest.altitudeMeters}m) to safeguard against Acute Mountain Sickness (AMS).`
    );
  }

  if (mode === 'motorcycle') {
    reasoning.push(
      `Motorcycle pacing limits daily riding to comfortable safety boundaries (< 350 km/day) with ~${motorcycleRestHours}h mandatory rest breaks.`
    );
  }

  reasoning.push(
    `Recommended ${recommendedDuration.days} Days / ${recommendedDuration.nights} Nights ensures departure and return journeys do not cannibalize daytime sightseeing.`
  );

  // 12. Warnings & Seasonal Advice
  const warnings: string[] = [];
  let seasonalAdvice: string | undefined;

  const seasonalCheck = evaluateSeasonalSuitability(
    orderedDestinations.map((d) => d.canonicalName),
    travelDate || '2026-10-15'
  );

  if (seasonalCheck.warnings.length > 0) {
    seasonalCheck.warnings.forEach((w) => warnings.push(w));
  }
  if (seasonalCheck.mountainPassAlerts.length > 0) {
    seasonalCheck.mountainPassAlerts.forEach((m) => warnings.push(m));
  }
  if (seasonalCheck.recommendations.length > 0) {
    seasonalAdvice = seasonalCheck.recommendations.join('. ');
  }

  if (hasHighAltitude) {
    warnings.push(
      'High Altitude Destination: Drink 3-4 liters of water daily, do not consume alcohol during first 48 hours, and carry Dimox if prescribed by a physician.'
    );
  }

  if (budgetShortfall > 0) {
    warnings.push(
      `Budget Notice: Trip costs exceed budget by ₹${budgetShortfall.toLocaleString('en-IN')}. Consider adjusting accommodation tier or transport mode.`
    );
  }

  if (primaryDest.permitsRequired && primaryDest.permitsRequired.length > 0) {
    warnings.push(`Permits Required: ${primaryDest.permitsRequired.join(', ')}.`);
  }

  return {
    recommendedDuration,
    minimumDuration,
    relaxedDuration,
    travelTime: {
      outboundHours,
      returnHours,
      internalTransfersHours: Math.round(internalDriveHours * 10) / 10,
      totalTransitHours,
      totalDistanceKm: totalTripRoadKm,
      primaryMode: mode,
      overnightTransitUsed: overnightTransit,
      motorcycleBreaksHours: mode === 'motorcycle' ? motorcycleRestHours : undefined,
    },
    destinations: classifiedDestinations,
    recommendedItinerary,
    budgetEstimate,
    reasoning,
    warnings,
    seasonalAdvice: seasonalAdvice || undefined,
    acclimatizationNotice: hasHighAltitude
      ? `High-altitude physiological safety: Mandatory 48-hour acclimatization and rest at ${primaryDest.canonicalName} (${primaryDest.altitudeMeters}m). Extreme exertion or rapid ascent is medically inadvisable.`
      : undefined,
  };
}

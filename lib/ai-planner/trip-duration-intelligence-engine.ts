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
import { calculateTripCost } from './trip-cost-engine';

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

export interface CustomizeDurationInput extends TripDurationRecommendationInput {
  customDays: number;
}

export interface CustomizeDurationOutput {
  isFeasible: boolean;
  customDays: number;
  customNights: number;
  originalRecommendedDays: number;
  minimumDays: number;
  relaxedDays: number;
  status: 'OPTIMAL' | 'MINIMUM_FEASIBLE' | 'EXTENDED' | 'TOO_SHORT' | 'EXCESSIVE';
  explanation: string;
  feasibilityWarning?: string;
  updatedItinerary: DayItineraryPlan[];
  budgetEstimate: BudgetEstimateResult;
  changesSummary: {
    sightseeingDays: number;
    transitDays: number;
    freeLeisureDays: number;
    hotelNights: number;
  };
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

  // 1. Origin & Destination Distinction & Attraction Clustering
  const originNorm = originName.toLowerCase().trim();
  const isOriginExplicitlySelected = rawDestArray.some((raw) => {
    const s = raw.toLowerCase().trim();
    return s === originNorm || s.includes(originNorm) || originNorm.includes(s);
  });

  // Calculate Outbound & Return Coordinates & Straight-Line Distances
  const outboundStraightKm = haversineDistanceKm(
    originCoords.lat,
    originCoords.lng,
    primaryDest.latitude,
    primaryDest.longitude
  );

  const returnStraightKm = haversineDistanceKm(
    lastDest.latitude,
    lastDest.longitude,
    originCoords.lat,
    originCoords.lng
  );

  const isLocalIntraCity =
    outboundStraightKm <= 35 &&
    (primaryDest.canonicalName.toLowerCase().includes(originNorm) ||
      originNorm.includes(primaryDest.canonicalName.toLowerCase()) ||
      (primaryDest.district && primaryDest.district.toLowerCase().includes(originNorm)) ||
      (primaryDest.city && primaryDest.city.toLowerCase().includes(originNorm)));

  const outboundDetour = isLocalIntraCity
    ? 1.0
    : TERRAIN_DETOUR_MULTIPLIERS[primaryDest.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25;
  const outboundRoadKm = isLocalIntraCity ? Math.max(10, Math.round(outboundStraightKm * 1.1)) : Math.round(outboundStraightKm * outboundDetour);

  const returnDetour = isLocalIntraCity
    ? 1.0
    : TERRAIN_DETOUR_MULTIPLIERS[lastDest.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25;
  const returnRoadKm = isLocalIntraCity ? Math.max(10, Math.round(returnStraightKm * 1.1)) : Math.round(returnStraightKm * returnDetour);

  // 2. Inter-Destination Transit & Intra-City Attraction Transitions
  let internalRoadKm = 0;
  let internalDriveHours = 0;
  if (orderedDestinations.length > 1) {
    for (let i = 0; i < orderedDestinations.length - 1; i++) {
      const d1 = orderedDestinations[i];
      const d2 = orderedDestinations[i + 1];
      const straight = haversineDistanceKm(d1.latitude, d1.longitude, d2.latitude, d2.longitude);
      const isAdjacentAttraction = straight <= 35;

      if (isAdjacentAttraction) {
        // Local intra-city / intra-district transfer between attractions
        const segmentRoadKm = Math.max(5, Math.round(straight * 1.2));
        internalRoadKm += segmentRoadKm;
        internalDriveHours += segmentRoadKm / 30; // 30 km/h city traffic
      } else {
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
  }

  const totalTripRoadKm = outboundRoadKm + internalRoadKm + returnRoadKm;

  // 3. Segmented Corridor Speeds (Plains Highways vs Mountain Passes)
  const calculateSegmentedRoadHours = (distKm: number, terrain: string, avgRoadSpeed?: number): number => {
    if (distKm <= 35) {
      // Intra-city commute
      return Math.round((distKm / 30) * 10) / 10;
    }
    if (terrain === 'high-altitude-pass' || terrain === 'hills') {
      // Long-distance mountain corridor: Plains expressway at 75 km/h, mountain pass at 32 km/h
      const mountainKm = Math.min(distKm * 0.35, 450);
      const plainsKm = Math.max(0, distKm - mountainKm);
      const plainsSpeed = 75;
      const mountainSpeed = Math.max(30, avgRoadSpeed || 32);
      return Math.round(((plainsKm / plainsSpeed) + (mountainKm / mountainSpeed)) * 10) / 10;
    }
    // Plains / Regular corridors
    const speed = Math.max(55, avgRoadSpeed || 65);
    return Math.round((distKm / speed) * 10) / 10;
  };

  let outboundHours = 0;
  let returnHours = 0;
  let internalHours = 0;
  let overnightTransit = false;
  let motorcycleRestHours = 0;

  if (isLocalIntraCity) {
    outboundHours = 0.5;
    returnHours = 0.5;
    internalHours = Math.round(internalDriveHours * 10) / 10;
  } else if (mode === 'flight') {
    // Flight: 2h check-in + flight time (straightKm / 650) + 1.2h baggage/cab
    outboundHours = Math.round((2.0 + outboundStraightKm / 650 + 1.2) * 10) / 10;
    returnHours = Math.round((2.0 + returnStraightKm / 650 + 1.2) * 10) / 10;
    internalHours = Math.round(internalDriveHours * 10) / 10;
  } else if (mode === 'train') {
    outboundHours = Math.round((outboundRoadKm / 65 + 1.5) * 10) / 10;
    returnHours = Math.round((returnRoadKm / 65 + 1.5) * 10) / 10;
    internalHours = Math.round(internalDriveHours * 10) / 10;
    if (outboundHours >= 9 || returnHours >= 9) {
      overnightTransit = true;
    }
  } else if (mode === 'bus') {
    outboundHours = Math.round((outboundRoadKm / 50 + 1.0) * 10) / 10;
    returnHours = Math.round((returnRoadKm / 50 + 1.0) * 10) / 10;
    internalHours = Math.round((internalRoadKm / 45) * 10) / 10;
    if (outboundHours >= 8 || returnHours >= 8) {
      overnightTransit = true;
    }
  } else if (mode === 'motorcycle') {
    const motoSpeed = Math.min(calculateSegmentedRoadHours(outboundRoadKm, primaryDest.terrain, primaryDest.averageRoadSpeedKmH), 50);
    outboundHours = Math.round((outboundRoadKm / motoSpeed) * 10) / 10;
    returnHours = Math.round((returnRoadKm / motoSpeed) * 10) / 10;
    internalHours = Math.round((internalRoadKm / motoSpeed) * 10) / 10;
    motorcycleRestHours = Math.round((totalTripRoadKm / 200) * 1.5 * 10) / 10;
  } else {
    // Private Car / Self-Drive (Segmented realistic speeds)
    outboundHours = calculateSegmentedRoadHours(outboundRoadKm, primaryDest.terrain, primaryDest.averageRoadSpeedKmH);
    returnHours = calculateSegmentedRoadHours(returnRoadKm, lastDest.terrain, lastDest.averageRoadSpeedKmH);
    internalHours = Math.round(internalDriveHours * 10) / 10;
  }

  const totalTransitHours =
    Math.round((outboundHours + returnHours + internalHours + motorcycleRestHours) * 10) / 10;

  // 4. High-Altitude Medical Constraint Check
  const hasHighAltitude = orderedDestinations.some(
    (d) => d.isHighAltitude || d.altitudeMeters >= 2800
  );
  // Mandatory 48-hour acclimatization for altitude >= 2800m (Leh, Spiti)
  const acclimatizationDays = hasHighAltitude ? 2.0 : 0.0;

  // 5. Destination Classifications
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

  // 6. Geographic Attraction Clustering & Sightseeing Allocation
  interface DestinationCluster {
    clusterKey: string;
    clusterLabel: string;
    district: string;
    stateOrUt: string;
    destinations: EnrichedDestination[];
    isOriginCluster: boolean;
    centerLat: number;
    centerLng: number;
    clusterStayDays: number;
  }

  const clusters: DestinationCluster[] = [];
  for (const d of orderedDestinations) {
    const dDistrict = (d.district || d.city || d.stateOrUt || '').toLowerCase().trim();
    const dDistToOrigin = haversineDistanceKm(originCoords.lat, originCoords.lng, d.latitude, d.longitude);
    const isOriginDist = dDistToOrigin <= 35 || dDistrict.includes(originNorm) || originNorm.includes(dDistrict);

    let foundCluster: DestinationCluster | undefined;
    for (const c of clusters) {
      const distToClusterCenter = haversineDistanceKm(c.centerLat, c.centerLng, d.latitude, d.longitude);
      const sameDistrict = dDistrict && c.district && (dDistrict === c.district || dDistrict.includes(c.district) || c.district.includes(dDistrict));
      if (sameDistrict || (distToClusterCenter <= 35 && c.stateOrUt === d.stateOrUt)) {
        foundCluster = c;
        break;
      }
    }

    if (foundCluster) {
      foundCluster.destinations.push(d);
    } else {
      clusters.push({
        clusterKey: dDistrict || d.canonicalName,
        clusterLabel: d.city || d.district || d.canonicalName,
        district: dDistrict,
        stateOrUt: d.stateOrUt,
        destinations: [d],
        isOriginCluster: isOriginDist,
        centerLat: d.latitude,
        centerLng: d.longitude,
        clusterStayDays: 0,
      });
    }
  }

  // Calculate stay days per cluster
  let baseStayDays = 0;
  for (const cluster of clusters) {
    if (cluster.isOriginCluster) {
      // If user did NOT explicitly select origin, origin receives zero sightseeing days
      if (!isOriginExplicitlySelected && cluster.destinations.every(d => d.canonicalName.toLowerCase().trim() === originNorm)) {
        cluster.clusterStayDays = 0;
        continue;
      }
      // If user explicitly picked attractions inside origin city (e.g. Kankaria Lake + Hutheesing Temple)
      const count = cluster.destinations.length;
      if (count === 1) cluster.clusterStayDays = 0.5;
      else if (count === 2) cluster.clusterStayDays = 1.0;
      else if (count <= 4) cluster.clusterStayDays = 1.5;
      else cluster.clusterStayDays = 2.0;
    } else {
      // External destination cluster
      const count = cluster.destinations.length;
      const primaryInCluster = cluster.destinations[0];
      const baseRec = primaryInCluster.recommendedStayDays?.recommended || 2;
      if (count === 1) {
        cluster.clusterStayDays = baseRec;
      } else {
        // Multiple attractions clustered in same city/district: 0.5 day per additional attraction
        cluster.clusterStayDays = Math.min(baseRec + (count - 1) * 0.5, baseRec + 1.5);
      }
    }
    baseStayDays += cluster.clusterStayDays;
  }

  if (baseStayDays === 0) {
    baseStayDays = 1.0;
  }

  // Pace factor
  const paceMultiplier = pace === 'relaxed' ? 1.3 : pace === 'active' ? 0.8 : 1.0;
  baseStayDays = baseStayDays * paceMultiplier;

  // Comfort buffer for seniors or children
  const comfortBuffer = hasSeniors ? 1.0 : hasChildren ? 0.5 : 0.0;

  // 7. Outbound & Return Transit Days Allocation
  let outboundTravelDays = 0.5;
  let returnTravelDays = 0.5;

  const isAllLocalCityTrip = clusters.length === 1 && clusters[0].isOriginCluster;

  if (isAllLocalCityTrip) {
    // Local city trip: No long-distance travel days needed
    outboundTravelDays = 0;
    returnTravelDays = 0;
  } else if (mode === 'flight') {
    outboundTravelDays = 0.5;
    returnTravelDays = 0.5;
  } else if (mode === 'motorcycle') {
    outboundTravelDays = Math.ceil(outboundRoadKm / (primaryDest.terrain === 'hills' ? 200 : 350));
    returnTravelDays = Math.ceil(returnRoadKm / (lastDest.terrain === 'hills' ? 200 : 350));
  } else if (overnightTransit) {
    outboundTravelDays = 0.5;
    returnTravelDays = 0.5;
  } else {
    outboundTravelDays = outboundHours <= 4.5 ? 0.5 : 1.0;
    returnTravelDays = returnHours <= 4.5 ? 0.5 : 1.0;
  }

  // Inter-destination transit days
  let interDestinationDays = 0;
  if (!isAllLocalCityTrip && clusters.length > 1) {
    interDestinationDays = Math.max(0.5, Math.ceil(internalDriveHours / 5) * 0.5);
  }

  // 8. Calculate 3 Duration Tiers (Fast Track, Recommended, Relaxed)
  let recDays = Math.ceil(
    outboundTravelDays +
    returnTravelDays +
    interDestinationDays +
    baseStayDays +
    acclimatizationDays +
    comfortBuffer
  );

  const minSightseeing = Math.max(1, Math.round(baseStayDays * 0.6));
  let minDays = Math.ceil(
    outboundTravelDays +
    returnTravelDays +
    Math.min(interDestinationDays, 0.5) +
    minSightseeing +
    acclimatizationDays
  );

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

  // Constraints & Safety Floors:
  if (isAllLocalCityTrip) {
    // Local city trip (< 35km): 1-2 days
    minDays = 1;
    recDays = Math.max(1, Math.min(2, Math.round(baseStayDays)));
    extDays = recDays + 1;
  } else {
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

    if (hasHighAltitude) {
      if (minDays < 5) minDays = 5;
      if (recDays < 7) recDays = 7;
      if (extDays < 9) extDays = 9;
    }

    if (clusters.length >= 3) {
      if (minDays < 5) minDays = 5;
      if (recDays < 7) recDays = 7;
    }

    const hasIsland = orderedDestinations.some(
      (d) => d.terrain === 'island' || d.stateOrUt.includes('Andaman') || d.stateOrUt.includes('Lakshadweep')
    );
    const uniqueStates = new Set(orderedDestinations.map((d) => d.stateOrUt));
    const hasCrossRegion = uniqueStates.size > 1 && totalTripRoadKm > 1600;

    if (hasIsland || hasCrossRegion) {
      if (minDays < 6) minDays = 6;
      if (recDays < 8) recDays = 8;
      if (extDays < 10) extDays = 10;
    }

    if (orderedDestinations.length === 1 && outboundRoadKm <= 200 && !hasHighAltitude) {
      minDays = Math.min(minDays, 1);
      recDays = Math.min(recDays, 2);
      extDays = Math.min(extDays, 3);
    }
  }

  // Strict Tier Progression Guarantee: Min < Rec < Ext
  if (recDays <= minDays) recDays = minDays + 1;
  if (extDays <= recDays) extDays = recDays + 1;

  const recommendedDuration: DurationTier = { days: recDays, nights: Math.max(1, recDays - 1) };
  const minimumDuration: DurationTier = { days: minDays, nights: Math.max(1, minDays - 1) };
  const relaxedDuration: DurationTier = { days: extDays, nights: Math.max(1, extDays - 1) };

  // 9. Day-by-Day Itinerary Generation for Recommended Duration
  const recommendedItinerary: DayItineraryPlan[] = [];
  const totalDays = recommendedDuration.days;

  if (isAllLocalCityTrip) {
    // Local City Exploration Day-by-Day
    const clusterDests = orderedDestinations.map(d => d.canonicalName).join(' & ');
    recommendedItinerary.push({
      day: 1,
      title: `${originName} — City Landmarks & Cultural Discovery`,
      location: originName,
      dayType: 'sightseeing',
      morning: `Morning visit to ${orderedDestinations[0]?.canonicalName || 'Local Landmark'}. Comfortable morning hours for photography.`,
      afternoon: `Authentic regional lunch followed by visit to ${orderedDestinations[1]?.canonicalName || orderedDestinations[0]?.canonicalName}.`,
      evening: `Evening lakeside or heritage stroll with traditional street culinary experience.`,
      estimatedSightseeingHours: 6.0,
      estimatedTransitHours: 1.0,
    });

    if (totalDays > 1) {
      for (let dayNum = 2; dayNum <= totalDays; dayNum++) {
        recommendedItinerary.push({
          day: dayNum,
          title: `${originName} — Artisans, Markets & Leisure`,
          location: originName,
          dayType: 'leisure',
          morning: `Visit to artisan workshops, historic pols/galleries, or botanical gardens.`,
          afternoon: `Traditional Gujarati thali or regional cuisine lunch followed by craft markets.`,
          evening: `Relaxed sunset view at promenade or cultural auditorium.`,
          estimatedSightseeingHours: 5.0,
          estimatedTransitHours: 0.5,
        });
      }
    }
  } else {
    // Inter-city or Remote Route
    const primaryName = primaryDest.canonicalName;
    recommendedItinerary.push({
      day: 1,
      title: `${originName} to ${primaryName} — Journey & Arrival`,
      location: primaryName,
      dayType: 'transit_and_explore',
      morning: `Depart from ${originName} via ${mode.toUpperCase()} (${outboundRoadKm} km, ~${outboundHours}h transit). Scenic transit through regional corridor.`,
      afternoon: `Arrival in ${primaryName}, check-in at accommodation, unwind, and refresh.`,
      evening: `Relaxed orientation walk around ${primaryDest.aliases[0] || 'the local market or central square'}, experiencing local street cuisine.`,
      estimatedSightseeingHours: 2.5,
      estimatedTransitHours: outboundHours,
    });

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

    recommendedItinerary.push({
      day: totalDays,
      title: `${lastDest.canonicalName} to ${originName} — Return Journey`,
      location: `${lastDest.canonicalName} to ${originName}`,
      dayType: 'return_transit',
      morning: `Breakfast, final souvenir check, hotel check-out, and commencement of return journey (${returnRoadKm} km, ~${returnHours}h).`,
      afternoon: `Highway/flight transit with scenic lunch break.`,
      evening: `Safe arrival in ${originName} with memorable photographs and comfortable rest.`,
      estimatedSightseeingHours: 1.0,
      estimatedTransitHours: returnHours,
    });
  }

  // 10. Budget Estimate via Canonical Trip Cost Engine
  const costBreakdown = calculateTripCost({
    originCity: originName,
    destinations: orderedDestinations.map((d) => d.canonicalName),
    travelersCount: travellers,
    durationDays: totalDays,
    travelMode: mode,
    userBudgetInr: budget,
  });

  const budgetEstimate: BudgetEstimateResult = {
    totalGroupCost: costBreakdown.totalEstimatedCostInr,
    perPersonCost: costBreakdown.perPersonCostInr,
    currency: 'INR',
    isWithinBudget: costBreakdown.budgetComparison.isWithinBudget,
    budgetShortfall: costBreakdown.budgetComparison.budgetShortfall,
    suggestedAdjustments: costBreakdown.budgetComparison.recommendation ? [costBreakdown.budgetComparison.recommendation] : undefined,
    breakdown: {
      transportation: costBreakdown.categories.transportation + costBreakdown.categories.localTransfers,
      accommodation: costBreakdown.categories.accommodation,
      sightseeingAndActivities: costBreakdown.categories.activitiesAndPermits,
      mealsAndContingency: costBreakdown.categories.food + costBreakdown.categories.taxes + costBreakdown.categories.contingency,
    },
  };

  // 11. Reasoning & Transparent Explanations
  const primaryDestName = primaryDest.canonicalName;
  const uniqueStates = new Set(orderedDestinations.map((d) => d.stateOrUt || (d as any).state || ''));
  const hasCrossRegion = totalTripRoadKm > 1600;
  const hasIsland = orderedDestinations.some((d) => d.region === 'Islands' || d.terrain === 'island');
  const budgetShortfall = costBreakdown.budgetComparison.budgetShortfall || 0;

  const reasoning: string[] = [];
  reasoning.push(
    `Origin ${originName} to ${primaryDestName} is ~${outboundRoadKm} km (${outboundHours}h via ${mode.toUpperCase()}).`
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
      `Mandatory 48-hour physiological acclimatization incorporated at ${primaryDestName} (${primaryDest.altitudeMeters}m) to safeguard against Acute Mountain Sickness (AMS).`
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

  if (hasIsland && (mode === 'car' || mode === 'motorcycle' || mode === 'bus')) {
    warnings.push(
      'Island Maritime Notice: Destinations in island territories (Andaman & Nicobar / Lakshadweep) are inaccessible by continuous road travel from mainland India. Flight connectivity to Port Blair and authorized ferry transit is required.'
    );
  }

  if (hasCrossRegion) {
    reasoning.push(
      `Cross-region journey covers ${uniqueStates.size} distinct states/territories with > 1,600 km corridor. Dedicated multi-leg transit days have been allocated.`
    );
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

// ============================================================================
// 5. Customize Trip Duration & Dynamic Itinerary Recalculation
// ============================================================================

export function customizeTripDuration(input: CustomizeDurationInput): CustomizeDurationOutput {
  const baseResult = calculateTripDurationRecommendation(input);
  const minDays = baseResult.minimumDuration.days;
  const recDays = baseResult.recommendedDuration.days;
  const relDays = baseResult.relaxedDuration.days;
  const customDays = Math.max(1, Math.round(input.customDays));
  const customNights = Math.max(1, customDays - 1);
  const travellers = Math.max(1, input.travellers || 2);
  const budget = input.budget && input.budget > 0 ? input.budget : 25000;

  const isFeasible = customDays >= minDays;
  let status: CustomizeDurationOutput['status'] = 'OPTIMAL';
  let explanation = '';
  let feasibilityWarning: string | undefined;

  if (customDays < minDays) {
    status = 'TOO_SHORT';
    feasibilityWarning = `Selected duration of ${customDays} days is below the minimum feasible threshold of ${minDays} days for these destinations. Travelers will spend excessive time in transit with insufficient rest or attraction hours.`;
    explanation = `High fatigue risk: Compressing this route to ${customDays} days will eliminate leisure exploration and force touch-and-go travel.`;
  } else if (customDays === minDays) {
    status = 'MINIMUM_FEASIBLE';
    explanation = `Focused highlights itinerary: ${customDays} days / ${customNights} nights covers primary landmarks with fast-paced transitions.`;
  } else if (customDays === recDays) {
    status = 'OPTIMAL';
    explanation = `AI-recommended best balance: ${customDays} days / ${customNights} nights allows balanced sightseeing, local cuisine, and comfortable return transit.`;
  } else if (customDays <= relDays) {
    status = 'EXTENDED';
    explanation = `Relaxed immersion itinerary: ${customDays} days / ${customNights} nights provides slow-paced exploration, buffer days, and offbeat discoveries.`;
  } else {
    status = 'EXCESSIVE';
    explanation = `Extended expedition schedule: ${customDays} days / ${customNights} nights includes extensive leisure and regional immersion.`;
  }

  // Generate updated itinerary matching customDays
  const updatedItinerary: DayItineraryPlan[] = [];
  const originName = (input.origin || 'Ahmedabad').trim();
  const primaryName = baseResult.destinations[0]?.name || 'Destination';
  const lastName = baseResult.destinations[baseResult.destinations.length - 1]?.name || primaryName;
  const mode = baseResult.travelTime.primaryMode;
  const hasHighAltitude = baseResult.destinations.some((d) => d.isHighAltitude);

  // Day 1
  updatedItinerary.push({
    day: 1,
    title: `${originName} to ${primaryName} — Outbound Journey & Orientation`,
    location: primaryName,
    dayType: 'transit_and_explore',
    morning: `Depart from ${originName} via ${mode.toUpperCase()} (~${baseResult.travelTime.outboundHours.toFixed(1)}h transit). Arrival in ${primaryName}.`,
    afternoon: `Hotel check-in, unpack, freshen up, and enjoy regional welcome refreshment.`,
    evening: `Evening orientation walk through ${baseResult.destinations[0]?.keyAttractions[0] || 'local promenade'}, sampling street snacks.`,
    estimatedSightseeingHours: 2.5,
    estimatedTransitHours: baseResult.travelTime.outboundHours,
  });

  let curDay = 2;

  // Altitude day if present
  if (hasHighAltitude && curDay < customDays) {
    updatedItinerary.push({
      day: curDay++,
      title: `Altitude Acclimatization in ${primaryName}`,
      location: primaryName,
      dayType: 'acclimatization',
      morning: `Rest and hydrate to adapt to high elevation. Leisurely breakfast.`,
      afternoon: `Gentle local market visit or nearby spiritual site without rapid elevation gain.`,
      evening: `Restful dinner and early sleep for mountain safety.`,
      estimatedSightseeingHours: 3.0,
      estimatedTransitHours: 0.5,
    });
  }

  // Middle exploration days
  const middleDays = Math.max(0, customDays - curDay);
  const destCount = baseResult.destinations.length;
  for (let m = 0; m < middleDays; m++) {
    const targetDest = baseResult.destinations[m % destCount];
    const sights = targetDest.keyAttractions;
    const s1 = sights[m % sights.length] || 'Historic Landmark';
    const s2 = sights[(m + 1) % sights.length] || 'Scenic Viewpoint';

    updatedItinerary.push({
      day: curDay++,
      title: `${targetDest.name} — ${m % 2 === 0 ? 'Landmarks & Heritage' : 'Nature & Leisure Trail'}`,
      location: targetDest.name,
      dayType: m >= destCount * 2 ? 'leisure' : 'sightseeing',
      morning: `Morning guided visit to ${s1}. Excellent lighting for photography and cultural insights.`,
      afternoon: `Authentic regional lunch followed by visit to ${s2} and artisan craft stalls.`,
      evening: `Scenic sunset point followed by traditional dinner and cultural performance.`,
      estimatedSightseeingHours: m >= destCount * 2 ? 4.0 : 6.0,
      estimatedTransitHours: 1.0,
    });
  }

  // Final Day
  if (customDays > 1) {
    updatedItinerary.push({
      day: customDays,
      title: `${lastName} to ${originName} — Return Transit`,
      location: `${lastName} to ${originName}`,
      dayType: 'return_transit',
      morning: `Breakfast, check-out, and commencement of return journey (${baseResult.travelTime.totalDistanceKm} km total corridor).`,
      afternoon: `Highway/flight transit with scenic refreshment stops.`,
      evening: `Safe return to ${originName} with unforgettable memories.`,
      estimatedSightseeingHours: 1.0,
      estimatedTransitHours: baseResult.travelTime.returnHours,
    });
  }

  // Recalculate Budget for custom days via canonical Trip Cost Engine
  const customCostBreakdown = calculateTripCost({
    originCity: originName,
    destinations: baseResult.destinations.map((d) => d.name),
    travelersCount: travellers,
    durationDays: customDays,
    travelMode: mode,
    userBudgetInr: budget,
  });

  const budgetEstimate: BudgetEstimateResult = {
    totalGroupCost: customCostBreakdown.totalEstimatedCostInr,
    perPersonCost: customCostBreakdown.perPersonCostInr,
    currency: 'INR',
    isWithinBudget: customCostBreakdown.budgetComparison.isWithinBudget,
    budgetShortfall: customCostBreakdown.budgetComparison.budgetShortfall,
    suggestedAdjustments: customCostBreakdown.budgetComparison.recommendation
      ? [customCostBreakdown.budgetComparison.recommendation]
      : undefined,
    breakdown: {
      transportation: customCostBreakdown.categories.transportation + customCostBreakdown.categories.localTransfers,
      accommodation: customCostBreakdown.categories.accommodation,
      sightseeingAndActivities: customCostBreakdown.categories.activitiesAndPermits,
      mealsAndContingency: customCostBreakdown.categories.food + customCostBreakdown.categories.taxes + customCostBreakdown.categories.contingency,
    },
  };

  const sightseeingDaysCount = updatedItinerary.filter((d) => d.dayType === 'sightseeing').length;
  const transitDaysCount = updatedItinerary.filter((d) => d.dayType === 'transit_and_explore' || d.dayType === 'return_transit').length;
  const freeLeisureDaysCount = updatedItinerary.filter((d) => d.dayType === 'leisure' || d.dayType === 'acclimatization').length;

  return {
    isFeasible,
    customDays,
    customNights,
    originalRecommendedDays: recDays,
    minimumDays: minDays,
    relaxedDays: relDays,
    status,
    explanation,
    feasibilityWarning,
    updatedItinerary,
    budgetEstimate,
    changesSummary: {
      sightseeingDays: sightseeingDaysCount,
      transitDays: transitDaysCount,
      freeLeisureDays: freeLeisureDaysCount,
      hotelNights: customNights,
    },
  };
}

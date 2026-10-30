/**
 * BharatYatra AI 2.0 — Destination Discovery & Preference Geography Sync Engine
 * Recommends realistic, geographically feasible destinations based on origin, duration, budget,
 * season, and interests without regional bias.
 * Seamlessly synchronizes with Phase 2 Universal Trip Preference Profiles.
 */

import {
  findDestinationMaster,
  searchDestinations,
  haversineDistanceKm,
  EnrichedDestination,
  ALL_36_STATES_AND_UTS,
} from './destination-master-service';
import { evaluateRouteFeasibility, RouteFeasibilityReport } from './route-intelligence-engine';
import { evaluateSeasonalSuitability } from './seasonal-intelligence';
import { CANONICAL_CIRCUITS, CanonicalCircuit } from './tourism-circuit-engine';
import { resolveOriginCoordinates } from './india-geo-registry';
import { TripPreferenceProfile } from './universal-preference-profile';

export interface DiscoveryQuery {
  originCity: string;
  durationDays: number;
  totalBudgetInr?: number;
  travelMonth?: number; // 1 - 12
  interests?: string[];
  travelStyle?: 'budget' | 'balanced' | 'premium' | 'luxury';
  pace?: 'relaxed' | 'balanced' | 'fast';
  preferredRegion?: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast' | 'Himalayan' | 'Islands';
  limit?: number;
}

export interface DestinationRecommendation {
  destination: EnrichedDestination;
  routeFeasibility: RouteFeasibilityReport;
  fitScore: number; // 0 - 100
  matchingReasons: string[];
  suggestedDurationDays: number;
  estimatedCostPerPersonInr: number;
  seasonalStatus: {
    isSuitable: boolean;
    suitabilityScore: number;
    advisory?: string;
  };
  connectedCircuit?: CanonicalCircuit;
}

export interface DiscoveryResult {
  origin: string;
  durationDays: number;
  budgetLimitInr?: number;
  travelMonth: number;
  recommendations: DestinationRecommendation[];
  regionalFairnessDistribution: Record<string, number>;
  discoveryAdvice: string;
}

export interface PreferenceGeoSyncResult {
  profileId: string;
  version: number;
  destinationResolved: {
    canonicalName: string;
    stateOrUt: string;
    latitude: number;
    longitude: number;
    altitudeMeters: number;
    isHighAltitude: boolean;
    terrain: string;
  };
  transportHubs: {
    nearestAirport: { code: string; name: string; distanceKm: number };
    nearestRailhead: { code: string; name: string; distanceKm: number };
  };
  routeIntelligence: {
    recommendedMode: 'flight' | 'train' | 'road' | 'multi-modal';
    straightLineKm: number;
    actualRoadKm: number;
    travelDurationHours: number;
    recommendationReason: string;
  };
  seasonalAdvisory: {
    suitabilityScore: number;
    weatherClassification: string;
    warnings: string[];
    mountainPassAlerts: string[];
    wildlifeAlerts: string[];
  };
  permitsRequired: string[];
  mandatoryAcclimatizationRequired: boolean;
  suggestedDurationAdjustment?: {
    currentDays: number;
    recommendedMinDays: number;
    reason: string;
  };
}

/**
 * Intelligent Destination Discovery based on real geographic accessibility,
 * travel time budgets, seasonal windows, and spending limits.
 */
export function discoverDestinations(query: DiscoveryQuery): DiscoveryResult {
  const origin = query.originCity || 'Ahmedabad';
  const originCoords = resolveOriginCoordinates(origin);
  const duration = query.durationDays || 5;
  const month = query.travelMonth || (new Date().getMonth() + 1);
  const budget = query.totalBudgetInr;
  const interests = (query.interests || []).map(i => i.toLowerCase());
  const limit = query.limit || 6;

  // Max realistic straight-line radius from origin based on available travel days and budget
  // For short trips (<= 4 days), distant flight destinations are unviable on tight budgets
  let maxPracticalRadiusKm = 2400; // All-India default
  if (duration <= 3) {
    maxPracticalRadiusKm = 400; // Strictly driving distance for weekend/short getaways
  } else if (duration <= 5 && budget && budget <= 25000) {
    maxPracticalRadiusKm = 650; // Regional driving / overnight train radius for budget trips
  }

  const allDestinations = searchDestinations({ limit: 400 });
  const scoredRecommendations: DestinationRecommendation[] = [];

  for (const dest of allDestinations) {
    const dist = haversineDistanceKm(originCoords.lat, originCoords.lng, dest.latitude, dest.longitude);

    // Skip destinations that are too far for short duration trips
    if (dist > maxPracticalRadiusKm) continue;

    // Evaluate route feasibility
    const route = evaluateRouteFeasibility(origin, dest.canonicalName);

    // Seasonal evaluation
    const seasonal = evaluateSeasonalSuitability([dest.canonicalName], `2026-${String(month).padStart(2, '0')}-15`);
    if (seasonal.suitabilityScore < 4) continue; // Skip severely restricted destinations

    // Budget feasibility check
    const lowestTravelCost = Math.min(...route.options.filter(o => o.isPractical).map(o => o.estimatedCostPerPersonInr.budget));
    const estimatedDailyStayCost = dest.isHighAltitude ? 3500 : (dest.terrain === 'hills' ? 2600 : 1800);
    const totalEstCost = lowestTravelCost + (estimatedDailyStayCost * duration);

    if (budget && totalEstCost > budget * 1.25) {
      // Exceeds budget boundary
      continue;
    }

    // Compute Fit Score
    let score = 70;
    const reasons: string[] = [];

    // Distance & travel time efficiency bonus
    if (duration <= 5 && dist <= 500) {
      score += 15;
      reasons.push(`Optimal travel proximity (${Math.round(dist)} km) fits comfortably within ${duration}-day schedule without travel burnout.`);
    }

    // Seasonal bonus
    if (seasonal.suitabilityScore >= 8) {
      score += 10;
      reasons.push(`Month ${month} offers prime seasonal weather for ${dest.canonicalName}.`);
    }

    // Interest matching
    if (interests.length > 0) {
      const catMatch = interests.some(i =>
        dest.category.toLowerCase().includes(i) ||
        dest.tourismType.toLowerCase().includes(i) ||
        dest.canonicalName.toLowerCase().includes(i)
      );
      if (catMatch) {
        score += 15;
        reasons.push(`Directly matches your interest in ${dest.category}.`);
      }
    }

    // Associated canonical circuit bonus
    const connected = Object.values(CANONICAL_CIRCUITS).find(c =>
      c.orderedStops.some(s => s.toLowerCase() === dest.canonicalName.toLowerCase())
    );
    if (connected) {
      score += 5;
      reasons.push(`Part of the classic ${connected.name}.`);
    }

    scoredRecommendations.push({
      destination: dest,
      routeFeasibility: route,
      fitScore: Math.min(100, score),
      matchingReasons: reasons,
      suggestedDurationDays: Math.min(duration, dest.recommendedStayDays.recommended),
      estimatedCostPerPersonInr: totalEstCost,
      seasonalStatus: {
        isSuitable: seasonal.isSuitable,
        suitabilityScore: seasonal.suitabilityScore,
        advisory: seasonal.warnings[0],
      },
      connectedCircuit: connected,
    });
  }

  // Sort by fit score
  scoredRecommendations.sort((a, b) => b.fitScore - a.fitScore);
  const topRecommendations = scoredRecommendations.slice(0, limit);

  // Regional fairness distribution tracking
  const regionalDist: Record<string, number> = {};
  topRecommendations.forEach(r => {
    const reg = r.destination.region;
    regionalDist[reg] = (regionalDist[reg] || 0) + 1;
  });

  return {
    origin,
    durationDays: duration,
    budgetLimitInr: budget,
    travelMonth: month,
    recommendations: topRecommendations,
    regionalFairnessDistribution: regionalDist,
    discoveryAdvice: `Generated ${topRecommendations.length} geographically viable recommendations tailored for ${duration} days departing from ${origin} with zero travel schedule over-packing.`,
  };
}

/**
 * Synchronizes Universal Trip Preference Profile with authoritative India Geography Engine
 */
export function syncPreferencesWithGeography(profile: TripPreferenceProfile): PreferenceGeoSyncResult {
  const originCity = profile.identity.origin || 'New Delhi';
  const destQuery = profile.identity.destination || 'Leh';
  const travelDate = profile.identity.startDate || '2026-10-15';
  const durationDays = profile.identity.tripDurationDays || 6;

  // 1. Resolve Destination
  const destMaster = findDestinationMaster(destQuery);
  const destName = destMaster ? destMaster.canonicalName : destQuery;
  const destState = destMaster ? destMaster.stateOrUt : (profile.identity.originState || 'India');
  const lat = destMaster ? destMaster.latitude : 28.6139;
  const lng = destMaster ? destMaster.longitude : 77.2090;
  const alt = destMaster ? destMaster.altitudeMeters : 250;
  const isHighAlt = destMaster ? destMaster.isHighAltitude : (alt >= 2800);
  const terrain = destMaster ? destMaster.terrain : 'plains';

  // 2. Resolve Route & Transport Hubs
  const routeReport = evaluateRouteFeasibility(originCity, destName);

  // 3. Evaluate Seasonal Status
  const seasonalResult = evaluateSeasonalSuitability([destName], travelDate);

  // 4. Check Duration Feasibility
  let durationNotice: PreferenceGeoSyncResult['suggestedDurationAdjustment'];
  if (isHighAlt && durationDays < 5) {
    durationNotice = {
      currentDays: durationDays,
      recommendedMinDays: 6,
      reason: `High altitude destination (${alt}m) requires mandatory 48-hour low-exertion acclimatization in Leh before ascending higher passes. Total trip duration should be at least 6 days for medical safety.`,
    };
  }

  return {
    profileId: profile.id,
    version: profile.version,
    destinationResolved: {
      canonicalName: destName,
      stateOrUt: destState,
      latitude: lat,
      longitude: lng,
      altitudeMeters: alt,
      isHighAltitude: isHighAlt,
      terrain,
    },
    transportHubs: {
      nearestAirport: destMaster ? destMaster.nearestAirport : { code: 'DEL', name: 'DEL Airport', distanceKm: 40 },
      nearestRailhead: destMaster ? destMaster.nearestRailhead : { code: 'NDLS', name: 'NDLS Railhead', distanceKm: 25 },
    },
    routeIntelligence: {
      recommendedMode: routeReport.recommendedMode,
      straightLineKm: routeReport.straightLineDistanceKm,
      actualRoadKm: routeReport.options.find(o => o.mode === 'road')?.actualRouteDistanceKm || routeReport.straightLineDistanceKm * 1.25,
      travelDurationHours: routeReport.options.find(o => o.mode === routeReport.recommendedMode)?.estimatedDurationHours || 5.0,
      recommendationReason: routeReport.recommendationReason,
    },
    seasonalAdvisory: {
      suitabilityScore: seasonalResult.suitabilityScore,
      weatherClassification: seasonalResult.weatherClassification,
      warnings: seasonalResult.warnings,
      mountainPassAlerts: seasonalResult.mountainPassAlerts,
      wildlifeAlerts: seasonalResult.wildlifeParkAlerts,
    },
    permitsRequired: destMaster?.permitsRequired || (isHighAlt ? ['Protected Area Permit (PAP/ILP)'] : []),
    mandatoryAcclimatizationRequired: isHighAlt,
    suggestedDurationAdjustment: durationNotice,
  };
}

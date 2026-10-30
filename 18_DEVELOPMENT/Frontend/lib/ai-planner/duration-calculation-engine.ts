/**
 * BharatYatra AI 2.0 — Intelligent Trip Duration Calculation Engine
 * Formulates realistic travel durations using geographic distances, transit logistics,
 * mountain pass conditions, high-altitude acclimatization, seasonal windows,
 * and traveller pace preferences.
 */

import {
  findDestinationMaster,
  EnrichedDestination,
  haversineDistanceKm,
} from './destination-master-service';
import {
  evaluateRouteFeasibility,
  RouteFeasibilityReport,
  TERRAIN_DETOUR_MULTIPLIERS,
  TERRAIN_AVERAGE_SPEED_KMH,
} from './route-intelligence-engine';
import { evaluateSeasonalSuitability, SeasonalCheckResult } from './seasonal-intelligence';
import { CANONICAL_CIRCUITS } from './tourism-circuit-engine';
import { resolveOriginCoordinates, MAJOR_ORIGIN_HUBS } from './india-geo-registry';
import { TripPreferenceProfile, DurationSelectionMode } from './universal-preference-profile';

export type FeasibilityClassification =
  | 'FEASIBLE'
  | 'FEASIBLE_WITH_COMPROMISES'
  | 'NOT_RECOMMENDED'
  | 'INFEASIBLE';

export interface DurationBreakdown {
  totalDays: number;
  hotelNights: number;
  outboundTravelDays: number;
  returnTravelDays: number;
  interDestinationTravelDays: number;
  sightseeingDays: number;
  acclimatizationRestDays: number;
  weatherBufferDays: number;
}

export interface DurationTierOption {
  tier: 'quick' | 'recommended' | 'extended';
  title: string;
  badge?: string;
  isRecommended: boolean;
  totalDays: number;
  hotelNights: number;
  breakdown: DurationBreakdown;
  includedDestinations: string[];
  omittedDestinations?: string[];
  keyHighlights: string[];
  travelIntensity: 'high' | 'balanced' | 'relaxed';
  primaryTransportMode: 'flight' | 'train' | 'road' | 'multi-modal';
  estimatedCostRangeInr: {
    min: number;
    max: number;
  };
  tradeoffsAndCompromises: string;
  feasibilityRating: FeasibilityClassification;
  explanation: string;
}

export interface CustomDurationEvaluation {
  requestedDays: number;
  minimumRequiredDays: number;
  recommendedDays: number;
  classification: FeasibilityClassification;
  isFeasible: boolean;
  discrepancyDays: number; // positive = excess, negative = deficit
  feasibilityReasons: string[];
  compromisesRequired: string[];
  suggestedDestinationsToDrop?: string[];
  alternativeDestinations?: string[];
  adjustedBreakdown: DurationBreakdown;
}

export interface IntelligentDurationResult {
  origin: string;
  destinationQuery: string;
  destinations: string[];
  selectedMode: 'automatic' | 'recommended-tiers' | 'custom';
  calculatedAutomaticDays: number;
  automaticExplanation: string;
  options: {
    quick: DurationTierOption;
    recommended: DurationTierOption;
    extended: DurationTierOption;
  };
  customEvaluation?: CustomDurationEvaluation;
  overallFeasibility: FeasibilityClassification;
  acclimatizationNotice?: string;
  seasonalAlerts: string[];
  routeFeasibilityReport: RouteFeasibilityReport;
}

export interface DurationEngineInput {
  originCity: string;
  destinations: string | string[];
  mode?: 'automatic' | 'recommended-tiers' | 'custom';
  travelPace?: 'relaxed' | 'balanced' | 'fast';
  interests?: string[];
  travelDate?: string;
  requestedDays?: number;
  travelerComposition?: {
    adults: number;
    seniors?: number;
    children?: number;
    infants?: number;
  };
  mobilityRequirement?: 'standard' | 'wheelchair-friendly' | 'minimal-walking' | 'elderly-assisted';
  budgetCategory?: 'budget' | 'standard' | 'balanced' | 'premium' | 'luxury';
}

/**
 * Calculates transit days between origin and destination based on real-world connectivity
 */
export function calculateOriginTransitDays(
  originCity: string,
  dest: EnrichedDestination
): {
  outboundDays: number;
  returnDays: number;
  recommendedMode: 'flight' | 'train' | 'road' | 'multi-modal';
  transitDescription: string;
  roundTripCostPerPax: number;
} {
  const origin = resolveOriginCoordinates(originCity);
  const straightKm = haversineDistanceKm(origin.lat, origin.lng, dest.latitude, dest.longitude);

  // Winding multiplier
  const mult = TERRAIN_DETOUR_MULTIPLIERS[dest.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25;
  const roadKm = Math.round(straightKm * mult);

  // If destination is High Altitude or Island or distance > 950km
  if (dest.isHighAltitude || dest.terrain === 'island' || straightKm > 950) {
    const isDirectFlightCity = ['delhi', 'mumbai', 'srinagar', 'jammu'].includes(originCity.toLowerCase());
    const outboundDays = isDirectFlightCity ? 0.5 : 1.0;
    const returnDays = isDirectFlightCity ? 0.5 : 1.0;
    const estFlightCost = Math.round(3500 + straightKm * 2.2);

    return {
      outboundDays,
      returnDays,
      recommendedMode: 'flight',
      transitDescription: `Flight connection from ${origin.city} to ${dest.nearestAirport.code} (${dest.nearestAirport.name}).`,
      roundTripCostPerPax: estFlightCost * 2,
    };
  }

  // Medium distance (350km to 950km)
  if (straightKm >= 350) {
    // Train or flight
    return {
      outboundDays: 1.0, // Overnight train or daytime transit
      returnDays: 1.0,
      recommendedMode: 'train',
      transitDescription: `Overnight Superfast Train or AC Coach from ${origin.city} to ${dest.nearestRailhead.code}.`,
      roundTripCostPerPax: Math.round(1200 + straightKm * 1.5) * 2,
    };
  }

  // Short distance (< 350km)
  const driveHrs = Math.round(roadKm / (dest.averageRoadSpeedKmH || 50));
  const isHalfDay = driveHrs <= 5;
  return {
    outboundDays: isHalfDay ? 0.5 : 1.0,
    returnDays: isHalfDay ? 0.5 : 1.0,
    recommendedMode: 'road',
    transitDescription: `Scenic highway road drive from ${origin.city} to ${dest.canonicalName} (${roadKm} km, ~${driveHrs}h).`,
    roundTripCostPerPax: Math.round(roadKm * 4.5),
  };
}

/**
 * Intelligent Trip Duration Calculation Engine
 */
export function calculateIntelligentDuration(input: DurationEngineInput): IntelligentDurationResult {
  const originCity = input.originCity || 'Ahmedabad';
  const rawDestinations = Array.isArray(input.destinations) ? input.destinations : [input.destinations];
  const pace = input.travelPace || 'balanced';
  const travelDate = input.travelDate || '2026-10-15';
  const travelers = input.travelerComposition || { adults: 2 };
  const hasSeniors = (travelers.seniors || 0) > 0;
  const hasChildren = (travelers.children || 0) > 0;
  const budgetCat = input.budgetCategory || 'standard';

  // 1. Resolve Destinations
  const resolvedDestinations: EnrichedDestination[] = [];
  rawDestinations.forEach(dName => {
    const d = findDestinationMaster(dName);
    if (d && !resolvedDestinations.some(rd => rd.id === d.id)) {
      resolvedDestinations.push(d);
    }
  });

  if (resolvedDestinations.length === 0) {
    const fallback = findDestinationMaster('Jaipur')!;
    resolvedDestinations.push(fallback);
  }

  const primaryDest = resolvedDestinations[0];
  const destinationNames = resolvedDestinations.map(d => d.canonicalName);

  // 2. Evaluate Route & Seasonal Constraints
  const routeReport = evaluateRouteFeasibility(originCity, primaryDest.canonicalName);
  const seasonalReport = evaluateSeasonalSuitability(destinationNames, travelDate);

  // 3. Check High Altitude Medical Constraints
  const hasHighAltitude = resolvedDestinations.some(d => d.isHighAltitude || d.altitudeMeters >= 2800);
  const maxAltitude = Math.max(...resolvedDestinations.map(d => d.altitudeMeters));
  // Mandatory 48-hour acclimatization for high altitude
  const acclimatizationDays = hasHighAltitude ? 2.0 : 0.0;

  // 4. Calculate Origin Transit Requirements
  const transitInfo = calculateOriginTransitDays(originCity, primaryDest);

  // 5. Calculate Inter-Destination Transit Days
  let interDestinationDays = 0;
  if (resolvedDestinations.length > 1) {
    for (let i = 0; i < resolvedDestinations.length - 1; i++) {
      const d1 = resolvedDestinations[i];
      const d2 = resolvedDestinations[i + 1];
      const straight = haversineDistanceKm(d1.latitude, d1.longitude, d2.latitude, d2.longitude);
      const mult = Math.max(
        TERRAIN_DETOUR_MULTIPLIERS[d1.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25,
        TERRAIN_DETOUR_MULTIPLIERS[d2.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25
      );
      const roadKm = Math.round(straight * mult);
      const minSpeed = Math.min(d1.averageRoadSpeedKmH, d2.averageRoadSpeedKmH);
      const driveHrs = roadKm / minSpeed;

      // If drive is > 4.5 hours, counts as 0.75 or 1 full travel day
      interDestinationDays += driveHrs > 4.5 ? 1.0 : 0.5;
    }
  }

  // 6. Pace Modifiers
  const paceFactor = pace === 'relaxed' ? 1.3 : (pace === 'fast' ? 0.75 : 1.0);
  const comfortBufferDays = hasSeniors ? 1.0 : (hasChildren ? 0.5 : 0.0);
  const weatherBufferDays = seasonalReport.suitabilityScore <= 6 ? 1.0 : 0.0;
  const isLongCorridor = routeReport.straightLineDistanceKm > 1100;

  // Base stay days per tier
  const baseQuickStay = Math.max(1.5, resolvedDestinations.reduce((sum, d) => sum + d.recommendedStayDays.quick, 0) * paceFactor * 0.7);
  const minRecStay = isLongCorridor ? 3.0 : 2.5;
  const baseRecStay = Math.max(minRecStay, resolvedDestinations.reduce((sum, d) => sum + d.recommendedStayDays.recommended, 0) * paceFactor);
  const baseExtStay = Math.max(4.0, resolvedDestinations.reduce((sum, d) => sum + d.recommendedStayDays.extended, 0) * paceFactor * 1.2);

  // ==========================================
  // TIER A: QUICK TRIP
  // ==========================================
  const quickSightseeing = Math.max(1, Math.round(baseQuickStay));
  const quickInterTransit = Math.min(interDestinationDays, 1.0);
  let quickTotalDays = Math.ceil(transitInfo.outboundDays + transitInfo.returnDays + acclimatizationDays + quickInterTransit + quickSightseeing);

  // Safety floor for multi-destination circuit (>= 3 destinations)
  if (resolvedDestinations.length >= 3 && quickTotalDays < 5) {
    quickTotalDays = 5;
  }

  // Medical Safety Floor: High altitude trip CANNOT be under 5 days
  if (hasHighAltitude && quickTotalDays < 5) {
    quickTotalDays = 5;
  }

  const quickNights = Math.max(1, quickTotalDays - 1);
  const quickDestinations = resolvedDestinations.length > 2 ? resolvedDestinations.slice(0, 2).map(d => d.canonicalName) : destinationNames;
  const quickOmitted = destinationNames.filter(d => !quickDestinations.includes(d));

  const quickOption: DurationTierOption = {
    tier: 'quick',
    title: 'Quick Trip — Essential Highlights',
    isRecommended: false,
    totalDays: quickTotalDays,
    hotelNights: quickNights,
    breakdown: {
      totalDays: quickTotalDays,
      hotelNights: quickNights,
      outboundTravelDays: transitInfo.outboundDays,
      returnTravelDays: transitInfo.returnDays,
      interDestinationTravelDays: quickInterTransit,
      sightseeingDays: quickSightseeing,
      acclimatizationRestDays: acclimatizationDays,
      weatherBufferDays: 0,
    },
    includedDestinations: quickDestinations,
    omittedDestinations: quickOmitted.length > 0 ? quickOmitted : undefined,
    keyHighlights: resolvedDestinations[0].aliases.slice(0, 3),
    travelIntensity: 'high',
    primaryTransportMode: transitInfo.recommendedMode,
    estimatedCostRangeInr: {
      min: Math.round((transitInfo.roundTripCostPerPax + quickNights * 2200) * (budgetCat === 'budget' ? 0.8 : 1.0)),
      max: Math.round((transitInfo.roundTripCostPerPax + quickNights * 3800) * (budgetCat === 'luxury' ? 2.2 : 1.2)),
    },
    tradeoffsAndCompromises: hasHighAltitude
      ? `Compressed schedule. Strictly adheres to mandatory 48-hour acclimatization in ${primaryDest.canonicalName}; omits remote passes to avoid medical risks.`
      : `High-tempo schedule covering primary landmarks. Minimal rest buffer and early morning departures required.`,
    feasibilityRating: hasHighAltitude && quickTotalDays <= 5 ? 'FEASIBLE_WITH_COMPROMISES' : 'FEASIBLE',
    explanation: `Designed for travellers with constrained vacation days. Focuses exclusively on top iconic attractions of ${quickDestinations.join(' & ')}.`,
  };

  // ==========================================
  // TIER B: RECOMMENDED TRIP (Primary Choice)
  // ==========================================
  const recSightseeing = Math.max(2, Math.round(baseRecStay));
  let recTotalDays = Math.ceil(
    transitInfo.outboundDays +
    transitInfo.returnDays +
    acclimatizationDays +
    interDestinationDays +
    recSightseeing +
    comfortBufferDays
  );

  // Safety floor for high-altitude recommended trip
  if (hasHighAltitude && recTotalDays < 7) {
    recTotalDays = 7;
  }

  // Safety floor for long-distance cross-country corridors (> 1100 km)
  if (isLongCorridor && recTotalDays < 5) {
    recTotalDays = 5;
  }

  const recNights = Math.max(2, recTotalDays - 1);
  const recOption: DurationTierOption = {
    tier: 'recommended',
    title: 'Recommended Trip — Balanced Experience',
    badge: 'Recommended',
    isRecommended: true,
    totalDays: recTotalDays,
    hotelNights: recNights,
    breakdown: {
      totalDays: recTotalDays,
      hotelNights: recNights,
      outboundTravelDays: transitInfo.outboundDays,
      returnTravelDays: transitInfo.returnDays,
      interDestinationTravelDays: interDestinationDays,
      sightseeingDays: recSightseeing,
      acclimatizationRestDays: acclimatizationDays,
      weatherBufferDays: weatherBufferDays,
    },
    includedDestinations: destinationNames,
    keyHighlights: resolvedDestinations.flatMap(d => d.aliases).slice(0, 6),
    travelIntensity: 'balanced',
    primaryTransportMode: transitInfo.recommendedMode,
    estimatedCostRangeInr: {
      min: Math.round((transitInfo.roundTripCostPerPax + recNights * 2500) * (budgetCat === 'budget' ? 0.8 : 1.0)),
      max: Math.round((transitInfo.roundTripCostPerPax + recNights * 4500) * (budgetCat === 'luxury' ? 2.2 : 1.2)),
    },
    tradeoffsAndCompromises: `Optimal equilibrium between sightseeing depth, comfortable travel hours (< 5 hours/day), and relaxing evening leisure.`,
    feasibilityRating: 'FEASIBLE',
    explanation: `Evidence-based ideal duration for ${originCity} to ${destinationNames.join(' -> ')}. Provides adequate time for all primary landmarks and scenic transit.`,
  };

  // ==========================================
  // TIER C: EXTENDED TRIP
  // ==========================================
  const extSightseeing = Math.max(3, Math.round(baseExtStay));
  let extTotalDays = Math.ceil(
    transitInfo.outboundDays +
    transitInfo.returnDays +
    acclimatizationDays +
    interDestinationDays +
    extSightseeing +
    comfortBufferDays +
    weatherBufferDays +
    1.0 // Dedicated leisure exploration day
  );

  if (hasHighAltitude && extTotalDays < 9) {
    extTotalDays = 9;
  }

  const extNights = Math.max(3, extTotalDays - 1);
  const extOption: DurationTierOption = {
    tier: 'extended',
    title: 'Extended Trip — In-Depth Immersion',
    isRecommended: false,
    totalDays: extTotalDays,
    hotelNights: extNights,
    breakdown: {
      totalDays: extTotalDays,
      hotelNights: extNights,
      outboundTravelDays: transitInfo.outboundDays,
      returnTravelDays: transitInfo.returnDays,
      interDestinationTravelDays: interDestinationDays,
      sightseeingDays: extSightseeing,
      acclimatizationRestDays: acclimatizationDays,
      weatherBufferDays: weatherBufferDays + 1.0,
    },
    includedDestinations: destinationNames,
    keyHighlights: resolvedDestinations.flatMap(d => d.aliases).slice(0, 10),
    travelIntensity: 'relaxed',
    primaryTransportMode: transitInfo.recommendedMode,
    estimatedCostRangeInr: {
      min: Math.round((transitInfo.roundTripCostPerPax + extNights * 2500) * (budgetCat === 'budget' ? 0.8 : 1.0)),
      max: Math.round((transitInfo.roundTripCostPerPax + extNights * 5000) * (budgetCat === 'luxury' ? 2.5 : 1.3)),
    },
    tradeoffsAndCompromises: `Unhurried pace allowing deep cultural immersion, village walks, local culinary explorations, and ample rest intervals without fatigue.`,
    feasibilityRating: 'FEASIBLE',
    explanation: `Comprehensive itinerary including off-the-beaten-path experiences and contingency buffers for weather or mountain pass delays.`,
  };

  // ==========================================
  // CUSTOM DURATION EVALUATION
  // ==========================================
  let customEval: CustomDurationEvaluation | undefined;
  if (input.requestedDays) {
    const requested = input.requestedDays;
    const minRequired = quickTotalDays;
    const isFeasible = requested >= minRequired;
    const discrepancy = requested - recTotalDays;

    const reasons: string[] = [];
    const compromises: string[] = [];
    let classification: FeasibilityClassification = 'FEASIBLE';

    if (requested < minRequired) {
      if (hasHighAltitude && requested < 5) {
        classification = 'INFEASIBLE';
        reasons.push(`Medical Safety Violation: High altitude destination (${maxAltitude}m) requires at least 48 hours in Leh for physiological acclimatization. A ${requested}-day trip leaves zero time for sightseeing and risks severe Acute Mountain Sickness (AMS).`);
      } else {
        classification = 'NOT_RECOMMENDED';
        reasons.push(`Insufficient Duration: Total round-trip transit from ${originCity} takes ~${transitInfo.outboundDays + transitInfo.returnDays} days, leaving only ${Math.max(0, requested - (transitInfo.outboundDays + transitInfo.returnDays))} days for exploration.`);
      }

      compromises.push(`Increase trip duration to at least ${minRequired} days.`);
      if (destinationNames.length > 1) {
        compromises.push(`Drop secondary destinations (${destinationNames.slice(1).join(', ')}) to focus only on ${destinationNames[0]}.`);
      }
    } else if (requested === minRequired) {
      classification = 'FEASIBLE_WITH_COMPROMISES';
      reasons.push(`Feasible but demanding: Schedule matches Quick Trip profile with tight transit windows.`);
      compromises.push(`Early morning departures required; limited leisure evenings.`);
    } else {
      classification = 'FEASIBLE';
      reasons.push(`Requested duration of ${requested} days comfortably accommodates transit, sightseeing, and rest buffers.`);
    }

    customEval = {
      requestedDays: requested,
      minimumRequiredDays: minRequired,
      recommendedDays: recTotalDays,
      classification,
      isFeasible,
      discrepancyDays: discrepancy,
      feasibilityReasons: reasons,
      compromisesRequired: compromises,
      suggestedDestinationsToDrop: requested < minRequired && destinationNames.length > 1 ? destinationNames.slice(1) : undefined,
      adjustedBreakdown: {
        totalDays: requested,
        hotelNights: Math.max(1, requested - 1),
        outboundTravelDays: transitInfo.outboundDays,
        returnTravelDays: transitInfo.returnDays,
        interDestinationTravelDays: Math.min(interDestinationDays, requested * 0.25),
        sightseeingDays: Math.max(1, requested - (transitInfo.outboundDays + transitInfo.returnDays + acclimatizationDays)),
        acclimatizationRestDays: acclimatizationDays,
        weatherBufferDays: 0,
      },
    };
  }

  // Automatic Mode Decision
  const calculatedAutoDays = recOption.totalDays;
  const autoExplanation = `Engine selected ${calculatedAutoDays} days (${recOption.hotelNights} nights) based on ${originCity} origin distance (${routeReport.straightLineDistanceKm} km), ${transitInfo.recommendedMode} transit, and ${destinationNames.length} destination(s).`;

  return {
    origin: originCity,
    destinationQuery: destinationNames.join(', '),
    destinations: destinationNames,
    selectedMode: input.requestedDays ? 'custom' : (input.mode || 'automatic'),
    calculatedAutomaticDays: calculatedAutoDays,
    automaticExplanation: autoExplanation,
    options: {
      quick: quickOption,
      recommended: recOption,
      extended: extOption,
    },
    customEvaluation: customEval,
    overallFeasibility: customEval ? customEval.classification : 'FEASIBLE',
    acclimatizationNotice: hasHighAltitude
      ? `High-altitude destination (${maxAltitude}m >= 2,800m). Mandatory 48-hour low-exertion acclimatization included in all duration options.`
      : undefined,
    seasonalAlerts: [
      ...seasonalReport.warnings,
      ...seasonalReport.mountainPassAlerts,
      ...seasonalReport.wildlifeParkAlerts,
    ],
    routeFeasibilityReport: routeReport,
  };
}

/**
 * Synchronizes Duration Recommendation with Phase 2 Universal Preference Profile
 */
export function syncDurationWithPreferences(
  profile: TripPreferenceProfile,
  chosenTierOrDays: 'quick' | 'recommended' | 'extended' | number
): {
  profile: TripPreferenceProfile;
  result: IntelligentDurationResult;
  updatedFields: string[];
} {
  const origin = profile.identity.origin;
  const destination = profile.identity.destination;
  const durationResult = calculateIntelligentDuration({
    originCity: origin,
    destinations: profile.identity.destinationList.length > 0 ? profile.identity.destinationList : destination,
    travelPace: profile.identity.tripType === 'adventure' ? 'fast' : 'balanced',
    travelerComposition: profile.identity.travelerComposition,
    requestedDays: typeof chosenTierOrDays === 'number' ? chosenTierOrDays : undefined,
    budgetCategory: profile.budget.pricingCategory,
  });

  let selectedDays: number;
  let mode: DurationSelectionMode;

  if (typeof chosenTierOrDays === 'number') {
    selectedDays = chosenTierOrDays;
    mode = 'custom';
  } else if (chosenTierOrDays === 'quick') {
    selectedDays = durationResult.options.quick.totalDays;
    mode = 'quick';
  } else if (chosenTierOrDays === 'extended') {
    selectedDays = durationResult.options.extended.totalDays;
    mode = 'extended';
  } else {
    selectedDays = durationResult.options.recommended.totalDays;
    mode = 'recommended';
  }

  // Check locked keys
  const isLocked = profile.lockedKeys.includes('identity.tripDurationDays');
  const updatedFields: string[] = [];

  if (!isLocked) {
    profile.identity.tripDurationDays = selectedDays;
    profile.identity.durationMode = mode;
    profile.version += 1;
    profile.lastUpdated = new Date().toISOString();
    updatedFields.push('identity.tripDurationDays', 'identity.durationMode');

    // Update accommodation nights in budget if budget is not locked
    if (!profile.lockedKeys.includes('budget.totalBudget')) {
      const nights = Math.max(1, selectedDays - 1);
      const estPerNight = profile.budget.pricingCategory === 'budget' ? 1800 :
        (profile.budget.pricingCategory === 'luxury' ? 8500 : 3500);
      const flightOrTrainFixed = durationResult.routeFeasibilityReport.options.find(o => o.isPractical)?.estimatedCostPerPersonInr.standard || 5000;
      
      const newTotal = (flightOrTrainFixed * profile.identity.travelersCount) +
        (nights * estPerNight) +
        (selectedDays * 1200 * profile.identity.travelersCount); // food & local transit
      
      profile.budget.totalBudget = Math.round(newTotal);
      profile.budget.perPersonBudget = Math.round(newTotal / profile.identity.travelersCount);
      profile.budget.dailyBudget = Math.round(newTotal / selectedDays);
      updatedFields.push('budget.totalBudget', 'budget.perPersonBudget', 'budget.dailyBudget');
    }
  }

  return {
    profile,
    result: durationResult,
    updatedFields,
  };
}

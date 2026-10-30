/**
 * BharatYatra AI 2.0 — Route Intelligence Engine
 * Computes terrain-aware road distances, multi-modal feasibility (Flight, Train, Road, Ferry),
 * and practical hub selections across India.
 * Distinguishes geographic straight-line proximity from true travel connectivity.
 */

import { haversineDistanceKm, findDestinationMaster, ALL_36_STATES_AND_UTS, DISTRICT_COORDINATES } from './destination-master-service';
import { MAJOR_ORIGIN_HUBS, resolveOriginCoordinates } from './india-geo-registry';

export interface RouteModalOption {
  mode: 'flight' | 'train' | 'road' | 'ferry' | 'multi-modal';
  isPractical: boolean;
  unpracticalReason?: string;
  straightLineDistanceKm: number;
  actualRouteDistanceKm: number;
  estimatedDurationHours: number;
  estimatedCostPerPersonInr: {
    budget: number;
    standard: number;
    premium: number;
  };
  departureHub: {
    code: string;
    name: string;
    type: 'airport' | 'railway' | 'bus-terminal' | 'ferry-wharf';
  };
  arrivalHub: {
    code: string;
    name: string;
    type: 'airport' | 'railway' | 'bus-terminal' | 'ferry-wharf';
  };
  onwardRoadDistanceKm: number;
  onwardRoadDurationHours: number;
  transfersCount: number;
  routeSummary: string;
  co2GramsPerPaxKm: number;
}

export interface RouteFeasibilityReport {
  origin: {
    name: string;
    state: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    state: string;
    lat: number;
    lng: number;
    terrain: string;
    altitudeMeters: number;
    isHighAltitude: boolean;
  };
  straightLineDistanceKm: number;
  recommendedMode: 'flight' | 'train' | 'road' | 'multi-modal';
  recommendationReason: string;
  options: RouteModalOption[];
  acclimatizationRequired: boolean;
  acclimatizationNotice?: string;
  roadDifficulty: 'easy' | 'moderate' | 'difficult' | 'extreme';
  detourMultiplier: number;
}

/**
 * Terrain Winding Multipliers
 * Real-world Indian road distance / straight-line aerial distance
 */
export const TERRAIN_DETOUR_MULTIPLIERS = {
  plains: 1.20,
  coastal: 1.35,
  hills: 1.65,
  'high-altitude-pass': 1.85,
  island: 1.10,
};

/**
 * Average commercial road speed limits across Indian terrain (km/h)
 */
export const TERRAIN_AVERAGE_SPEED_KMH = {
  plains: 60,
  coastal: 45,
  hills: 30,
  'high-altitude-pass': 24,
  island: 35,
};

/**
 * Evaluates route feasibility between any origin city and destination in India
 */
export function evaluateRouteFeasibility(
  originCity: string,
  destinationQuery: string
): RouteFeasibilityReport {
  const origin = resolveOriginCoordinates(originCity);
  const dest = findDestinationMaster(destinationQuery);

  const destCoords = dest ? { lat: dest.latitude, lng: dest.longitude } :
    (DISTRICT_COORDINATES[destinationQuery.toLowerCase()] || { lat: 28.6139, lng: 77.2090 });

  const destName = dest ? dest.canonicalName : destinationQuery;
  const destState = dest ? dest.stateOrUt : 'India';
  const destTerrain = dest ? dest.terrain : 'plains';
  const destAltitude = dest ? dest.altitudeMeters : 250;
  const isHighAlt = dest ? dest.isHighAltitude : (destAltitude >= 2800);

  const straightLineKm = haversineDistanceKm(origin.lat, origin.lng, destCoords.lat, destCoords.lng);

  // Winding multiplier based on destination terrain
  const detourMult = TERRAIN_DETOUR_MULTIPLIERS[destTerrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25;
  const roadDistanceKm = Math.round(straightLineKm * detourMult);
  const avgSpeed = TERRAIN_AVERAGE_SPEED_KMH[destTerrain as keyof typeof TERRAIN_AVERAGE_SPEED_KMH] || 50;

  // Road duration calculation (with required rest stops for long drives)
  let rawDriveHours = roadDistanceKm / avgSpeed;
  if (roadDistanceKm > 400) {
    rawDriveHours += Math.floor(roadDistanceKm / 300) * 1.5; // Rest and meal breaks
  }
  const roadDurationHours = Math.round(rawDriveHours * 10) / 10;

  // Road Option
  const isRoadPractical = roadDistanceKm <= 550 && destTerrain !== 'island';
  const roadOption: RouteModalOption = {
    mode: 'road',
    isPractical: isRoadPractical,
    unpracticalReason: roadDistanceKm > 550 ?
      `Extreme road distance (${roadDistanceKm} km, ~${roadDurationHours}h drive). Not practical as primary leisure transport.` :
      (destTerrain === 'island' ? 'Island destination — direct road travel impossible without ferry or flight.' : undefined),
    straightLineDistanceKm: straightLineKm,
    actualRouteDistanceKm: roadDistanceKm,
    estimatedDurationHours: roadDurationHours,
    estimatedCostPerPersonInr: {
      budget: Math.round(roadDistanceKm * 2.2), // Shared cab / bus
      standard: Math.round(roadDistanceKm * 4.5), // AC Volvo bus / private sedan share
      premium: Math.round(roadDistanceKm * 9.0), // Dedicated private SUV
    },
    departureHub: { code: 'LOCAL_BUS', name: `${origin.city} Inter-State Bus Terminal`, type: 'bus-terminal' },
    arrivalHub: { code: 'DEST_STAND', name: `${destName} Central Bus Stand`, type: 'bus-terminal' },
    onwardRoadDistanceKm: 0,
    onwardRoadDurationHours: 0,
    transfersCount: roadDistanceKm > 400 ? 1 : 0,
    routeSummary: `Direct Highway / Scenic Mountain Road Drive via State & National Highways`,
    co2GramsPerPaxKm: 120,
  };

  // Rail Option
  const originHub = MAJOR_ORIGIN_HUBS[origin.city.toLowerCase()];
  const originRail = originHub ? originHub.primaryRailhead : 'NDLS';
  const destRail = dest ? dest.nearestRailhead.code : 'NDLS';
  const destRailDistanceKm = dest ? dest.nearestRailhead.distanceKm : 30;

  const railTrackKm = Math.round(straightLineKm * 1.25);
  const railDurationHours = Math.round((railTrackKm / 52 + 1.0) * 10) / 10;
  const isRailPractical = straightLineKm >= 120 && straightLineKm <= 1600 && destTerrain !== 'island' && destRail !== 'NONE';

  const railOption: RouteModalOption = {
    mode: 'train',
    isPractical: isRailPractical,
    unpracticalReason: destTerrain === 'island' || destRail === 'NONE' ?
      'No railway connectivity on island territory.' :
      (straightLineKm > 1600 ? `Excessive train travel time (~${railDurationHours}h across >1,600 km). Flight is significantly more comfortable.` :
        (straightLineKm < 120 ? 'Short distance — direct road transport is faster than station procedures.' : undefined)),
    straightLineDistanceKm: straightLineKm,
    actualRouteDistanceKm: railTrackKm + destRailDistanceKm,
    estimatedDurationHours: railDurationHours + Math.round(destRailDistanceKm / 40),
    estimatedCostPerPersonInr: {
      budget: Math.max(350, Math.round(railTrackKm * 0.75)), // Sleeper class
      standard: Math.max(900, Math.round(railTrackKm * 1.65)), // 3AC
      premium: Math.max(1600, Math.round(railTrackKm * 2.8)), // 2AC / 1AC
    },
    departureHub: { code: originRail, name: `${origin.city} Junction`, type: 'railway' },
    arrivalHub: { code: destRail, name: dest ? dest.nearestRailhead.name : `${destName} Railhead`, type: 'railway' },
    onwardRoadDistanceKm: destRailDistanceKm,
    onwardRoadDurationHours: Math.round(destRailDistanceKm / 40 * 10) / 10,
    transfersCount: 1,
    routeSummary: `Indian Railways Superfast / Express to ${destRail} + ${destRailDistanceKm}km local connection`,
    co2GramsPerPaxKm: 35,
  };

  // Flight Option
  const originAirport = originHub ? originHub.primaryAirport : 'DEL';
  const destAirport = dest ? dest.nearestAirport.code : 'DEL';
  const destAirportDistanceKm = dest ? dest.nearestAirport.distanceKm : 40;

  const isFlightPractical = straightLineKm >= 350 || destTerrain === 'island' || isHighAlt;
  const airFlightHours = Math.round((straightLineKm / 620 + 0.5) * 10) / 10;
  const onwardRoadHours = Math.round(destAirportDistanceKm / (dest ? dest.averageRoadSpeedKmH : 45) * 10) / 10;
  const totalFlightJourneyHours = Math.round((2.0 + airFlightHours + 0.75 + onwardRoadHours) * 10) / 10;

  const flightOption: RouteModalOption = {
    mode: 'flight',
    isPractical: isFlightPractical,
    unpracticalReason: straightLineKm < 350 && destTerrain !== 'island' ?
      `Short distance (${straightLineKm} km). Airport check-in time exceeds total driving time.` : undefined,
    straightLineDistanceKm: straightLineKm,
    actualRouteDistanceKm: Math.round(straightLineKm + destAirportDistanceKm),
    estimatedDurationHours: totalFlightJourneyHours,
    estimatedCostPerPersonInr: {
      budget: Math.max(3200, Math.round(2800 + straightLineKm * 1.9)),
      standard: Math.max(4800, Math.round(4200 + straightLineKm * 2.6)),
      premium: Math.max(8500, Math.round(7500 + straightLineKm * 4.5)),
    },
    departureHub: { code: originAirport, name: `${origin.city} Airport`, type: 'airport' },
    arrivalHub: { code: destAirport, name: dest ? dest.nearestAirport.name : `${destName} Airport`, type: 'airport' },
    onwardRoadDistanceKm: destAirportDistanceKm,
    onwardRoadDurationHours: onwardRoadHours,
    transfersCount: 1,
    routeSummary: `Domestic Flight from ${originAirport} to ${destAirport} + ${destAirportDistanceKm}km ground transfer to ${destName}`,
    co2GramsPerPaxKm: 180,
  };

  // Determine Recommended Mode
  let recommendedMode: 'flight' | 'train' | 'road' | 'multi-modal' = 'road';
  let reason = '';

  if (destTerrain === 'island') {
    recommendedMode = 'flight';
    reason = `Island destination — air connection to ${destAirport} is the primary reliable transit route.`;
  } else if (isHighAlt || straightLineKm > 950) {
    recommendedMode = 'flight';
    reason = `Long distance (${straightLineKm} km straight-line) or mountain terrain. Flight to ${destAirport} saves 25-45+ hours of driving fatigue.`;
  } else if (straightLineKm <= 400) {
    recommendedMode = 'road';
    reason = `Comfortable driving distance (${roadDistanceKm} km road, ~${roadDurationHours}h). Private cab or AC bus offers door-to-door flexibility.`;
  } else {
    recommendedMode = 'train';
    reason = `Balanced regional distance (${straightLineKm} km). Overnight Superfast Train offers cost-effective, comfortable travel without airport hassles.`;
  }

  // Mountain road difficulty
  let difficulty: 'easy' | 'moderate' | 'difficult' | 'extreme' = 'easy';
  if (destTerrain === 'high-altitude-pass') difficulty = 'extreme';
  else if (destTerrain === 'hills') difficulty = 'difficult';
  else if (destTerrain === 'coastal') difficulty = 'moderate';

  return {
    origin: { name: origin.city, state: origin.state, lat: origin.lat, lng: origin.lng },
    destination: {
      name: destName,
      state: destState,
      lat: destCoords.lat,
      lng: destCoords.lng,
      terrain: destTerrain,
      altitudeMeters: destAltitude,
      isHighAltitude: isHighAlt,
    },
    straightLineDistanceKm: straightLineKm,
    recommendedMode,
    recommendationReason: reason,
    options: [flightOption, railOption, roadOption],
    acclimatizationRequired: isHighAlt,
    acclimatizationNotice: isHighAlt ?
      `High altitude destination (${destAltitude}m >= 2,800m). Mandatory 24–48 hours low-exertion acclimatization in ${destName} before ascending higher passes to prevent Acute Mountain Sickness (AMS).` :
      undefined,
    roadDifficulty: difficulty,
    detourMultiplier: detourMult,
  };
}

/**
 * Validates whether two destinations can be co-visited on the same day without excessive travel fatigue
 */
export function evaluateCoVisitFeasibility(
  destAQuery: string,
  destBQuery: string
): {
  canVisitSameDay: boolean;
  distanceKm: number;
  drivingTimeHours: number;
  advice: string;
} {
  const destA = findDestinationMaster(destAQuery);
  const destB = findDestinationMaster(destBQuery);

  if (!destA || !destB) {
    return {
      canVisitSameDay: false,
      distanceKm: 0,
      drivingTimeHours: 0,
      advice: 'One or both destinations could not be verified in the master database.',
    };
  }

  const straightKm = haversineDistanceKm(destA.latitude, destA.longitude, destB.latitude, destB.longitude);
  const avgTerrainMult = Math.max(
    TERRAIN_DETOUR_MULTIPLIERS[destA.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25,
    TERRAIN_DETOUR_MULTIPLIERS[destB.terrain as keyof typeof TERRAIN_DETOUR_MULTIPLIERS] || 1.25
  );
  const roadKm = Math.round(straightKm * avgTerrainMult);
  const minSpeed = Math.min(destA.averageRoadSpeedKmH, destB.averageRoadSpeedKmH);
  const driveHours = Math.round((roadKm / minSpeed) * 10) / 10;

  // Maximum recommended one-way transit between morning and afternoon attractions is 2.5 hours
  const canCoVisit = driveHours <= 2.5;

  let advice = '';
  if (canCoVisit) {
    advice = `Excellent cluster pairing (${roadKm} km, ~${driveHours}h drive). Ideal for same-day sequential itinerary.`;
  } else {
    advice = `High separation (${roadKm} km, ~${driveHours}h mountain/highway drive). Recommend allocating distinct days with an overnight stop.`;
  }

  return {
    canVisitSameDay: canCoVisit,
    distanceKm: roadKm,
    drivingTimeHours: driveHours,
    advice,
  };
}

/**
 * 6 Mandatory Benchmark Corridors Solvers
 */
export const NATIONAL_BENCHMARK_CORRIDORS = {
  // 1. Ahmedabad -> Ladakh
  'ahmedabad-ladakh': () => {
    const report = evaluateRouteFeasibility('Ahmedabad', 'Leh');
    return {
      corridorId: 'AMD-IXL',
      corridorName: 'Ahmedabad to Ladakh (Trans-Himalayan)',
      recommendedHub: 'IXL (Kushok Bakula Rimpochee Airport, Leh)',
      transitRoute: 'Flight AMD -> DEL -> IXL (~4.5 hrs total travel time)',
      roadEvaluation: 'Direct road travel is ~1,850+ km and requires 42-48 hours through treacherous high mountain passes. Strictly NOT recommended for leisure.',
      acclimatizationProtocol: 'Mandatory 48 hours acclimatization in Leh (3,524m) before proceeding to Khardung La (5,359m) or Pangong Tso (4,225m).',
      seasonality: 'Best visited May to October. Highway passes (Manali-Leh & Srinagar-Leh) closed during winter (Nov-April).',
      report,
    };
  },

  // 2. Ahmedabad -> Goa
  'ahmedabad-goa': () => {
    const report = evaluateRouteFeasibility('Ahmedabad', 'Goa');
    return {
      corridorId: 'AMD-GOI',
      corridorName: 'Ahmedabad to Goa (Coastal Leisure)',
      recommendedHub: 'GOI / GOX (Goa International Airports)',
      transitRoute: 'Direct Flight AMD -> GOI (1 hr 45 min) or Konkan-bound Express Train ADI -> MAO (~20 hrs)',
      roadEvaluation: 'Road distance is ~1,100 km (~20-22 hrs drive). Suitable for private multi-day road trips via Mumbai/Pune, but flight is optimal for leisure.',
      seasonality: 'Best visited October to March. June to September has heavy southwest monsoons with closed beach shacks.',
      report,
    };
  },

  // 3. Delhi -> Kerala
  'delhi-kerala': () => {
    const report = evaluateRouteFeasibility('New Delhi', 'Kochi');
    return {
      corridorId: 'DEL-COK',
      corridorName: 'Delhi to Kerala (Backwaters & Hills)',
      recommendedHub: 'COK (Cochin International Airport)',
      transitRoute: 'Direct Flight DEL -> COK (3 hrs 10 min) or Kerala Express / Rajdhani Express NDLS -> ERS (40-44 hrs)',
      roadEvaluation: 'Road distance is ~2,600 km (>48 hrs drive). Infeasible for leisure travel.',
      onwardGround: 'Private AC cab from Kochi to Munnar (125 km, ~3.5 hrs scenic ghat road) and Alleppey (65 km, ~1.5 hrs).',
      seasonality: 'Best visited September to March. Monsoon Ayurveda packages available in June-August.',
      report,
    };
  },

  // 4. Mumbai -> Meghalaya
  'mumbai-meghalaya': () => {
    const report = evaluateRouteFeasibility('Mumbai', 'Shillong');
    return {
      corridorId: 'BOM-GAU',
      corridorName: 'Mumbai to Meghalaya (Northeast Hills)',
      recommendedHub: 'GAU (Lokpriya Gopinath Bordoloi Airport, Guwahati) or SHL (Umroi)',
      transitRoute: 'Flight BOM -> GAU (3 hrs 15 min) + Scenic NH-6 cab to Shillong (100 km, ~3 hrs) and Cherrapunji (54 km, ~2 hrs)',
      roadEvaluation: 'Direct road distance from Mumbai is ~2,600 km (>50 hrs drive across 6 states). Flight to Guwahati is the only practical leisure recommendation.',
      seasonality: 'Best visited October to May. June to August receives extreme monsoon rainfall in Cherrapunji/Mawsynram.',
      report,
    };
  },

  // 5. Bengaluru -> Rajasthan
  'bengaluru-rajasthan': () => {
    const report = evaluateRouteFeasibility('Bengaluru', 'Jaipur');
    return {
      corridorId: 'BLR-JAI',
      corridorName: 'Bengaluru to Rajasthan (Royal Heritage)',
      recommendedHub: 'JAI (Jaipur International Airport) / UDR (Udaipur)',
      transitRoute: 'Direct Flight BLR -> JAI (2 hrs 30 min) or Superfast Train SBC -> JP (~36 hrs)',
      roadEvaluation: 'Road distance is ~1,900 km (~34 hrs drive). Flight is recommended.',
      seasonality: 'Best visited October to March. May to June has extreme desert heat (>43°C).',
      report,
    };
  },

  // 6. Chennai -> Himachal Pradesh
  'chennai-himachal': () => {
    const report = evaluateRouteFeasibility('Chennai', 'Manali');
    return {
      corridorId: 'MAA-IXC',
      corridorName: 'Chennai to Himachal Pradesh (Himalayan Retreat)',
      recommendedHub: 'IXC (Chandigarh International Airport) or DEL (New Delhi)',
      transitRoute: 'Flight MAA -> IXC (2 hrs 45 min) + Luxury Volvo Coach / Private Cab to Shimla (115 km, ~3.5 hrs) or Manali (290 km, ~7-8 hrs via Kiratpur-Nerchowk 4-lane expressway)',
      roadEvaluation: 'Direct road distance from Chennai is ~2,750 km (>50 hrs drive). Not practical for vacation.',
      seasonality: 'Shimla/Manali best visited March to June (summer) or Dec to Feb (snowfall). July-August has monsoon landslide risks.',
      report,
    };
  },
};

// ============================================================================
// PHASE 7: MULTIMODAL ROUTE INTELLIGENCE & GRAPH EXPORTS
// ============================================================================
export * from './route-graph-engine';
export * from './multimodal-route-engine';

import {
  multimodalRouteEngine,
  RouteOptimizationResult,
  RouteOptimizationStrategy,
} from './multimodal-route-engine';
import { TripPreferenceProfile } from './universal-preference-profile';

/**
 * Phase 7 Master Route Intelligence Solver:
 * Discovers multimodal routes (Flight, Train, Bus, Road, Ferry), evaluates 9-dimension feasibility,
 * computes transfer connection buffers, and optimizes across 5 travel strategies.
 */
export function solveIntelligentRoute(params: {
  originCity: string;
  destinationQuery: string;
  travelMonth?: number;
  strategy?: RouteOptimizationStrategy;
  preferenceProfile?: TripPreferenceProfile;
}): RouteOptimizationResult {
  return multimodalRouteEngine.solveRoute(params);
}


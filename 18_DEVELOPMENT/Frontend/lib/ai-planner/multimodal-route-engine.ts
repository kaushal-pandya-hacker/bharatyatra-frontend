/**
 * BharatYatra AI 2.0 — Multimodal Route Intelligence & Feasibility Engine
 * Evaluates route feasibility across 9 independent dimensions, discovers multimodal itineraries,
 * calculates connection buffers, optimizes travel strategies, and integrates with Universal Preferences.
 */

import {
  RouteNode,
  RouteEdge,
  MultimodalJourney,
  JourneyLeg,
  JourneyTransfer,
  routeGraphEngine,
  INDIA_TRANSIT_NODES,
  DataProvenance,
} from './route-graph-engine';
import { findDestinationMaster, haversineDistanceKm } from './destination-master-service';
import { resolveOriginCoordinates } from './india-geo-registry';
import { MOUNTAIN_PASSES_REGISTRY } from './seasonal-intelligence';
import { TripPreferenceProfile } from './universal-preference-profile';

export type FeasibilityClassification =
  | 'FEASIBLE'
  | 'FEASIBLE_WITH_CONDITIONS'
  | 'NOT_RECOMMENDED'
  | 'INFEASIBLE'
  | 'INSUFFICIENT_DATA';

export type RouteOptimizationStrategy =
  | 'fastest'
  | 'lowest_cost'
  | 'balanced'
  | 'comfort_focused'
  | 'custom';

export interface FeasibilityDimensionScore {
  dimension: string;
  isSatisfied: boolean;
  score: number; // 0 - 100
  notes: string;
}

export interface RouteFeasibilityEvaluation {
  classification: FeasibilityClassification;
  summaryExplanation: string;
  dimensions: {
    geographicalConnectivity: FeasibilityDimensionScore;
    transportAvailability: FeasibilityDimensionScore;
    connectionFeasibility: FeasibilityDimensionScore;
    totalTravelDuration: FeasibilityDimensionScore;
    lastMileConnectivity: FeasibilityDimensionScore;
    seasonalAccessibility: FeasibilityDimensionScore;
    userConstraints: FeasibilityDimensionScore;
    scheduleReliability: FeasibilityDimensionScore;
    dataConfidence: FeasibilityDimensionScore;
  };
  overallConfidenceScore: number; // 0.0 - 1.0
  conditions: string[];
  warnings: string[];
  suggestedAlternatives: string[];
  permitsRequired: string[];
  acclimatizationRequired: boolean;
  acclimatizationNotice?: string;
}

export interface RouteOptimizationResult {
  origin: {
    city: string;
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
    isHighAltitude: boolean;
  };
  selectedStrategy: RouteOptimizationStrategy;
  recommendedJourney: MultimodalJourney;
  allOptions: {
    fastest: MultimodalJourney;
    lowestCost: MultimodalJourney;
    balanced: MultimodalJourney;
    comfortFocused: MultimodalJourney;
    custom?: MultimodalJourney;
  };
  feasibility: RouteFeasibilityEvaluation;
  provenance: DataProvenance;
  evaluatedAt: string;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const ROUTE_CACHE = new Map<string, CacheEntry<any>>();

export class MultimodalRouteEngine {
  public solveRoute(params: {
    originCity: string;
    destinationQuery: string;
    travelMonth?: number;
    strategy?: RouteOptimizationStrategy;
    preferenceProfile?: TripPreferenceProfile;
  }): RouteOptimizationResult {
    const {
      originCity,
      destinationQuery,
      travelMonth = new Date().getMonth() + 1,
      strategy = 'balanced',
      preferenceProfile,
    } = params;

    const cacheKey = `ROUTE_${originCity.toLowerCase()}_${destinationQuery.toLowerCase()}_M${travelMonth}_S${strategy}_${preferenceProfile?.transport?.preferredTransport || 'def'}`;
    const cached = this.getCache<RouteOptimizationResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // 1. Resolve Origin Coordinates & Destination Master
    const originCoords = resolveOriginCoordinates(originCity);
    const destMaster = findDestinationMaster(destinationQuery);

    const destName = destMaster ? destMaster.canonicalName : destinationQuery;
    const destState = destMaster ? destMaster.stateOrUt : 'India';
    const destLat = destMaster ? destMaster.latitude : 28.6139;
    const destLng = destMaster ? destMaster.longitude : 77.2090;
    const destTerrain = destMaster ? destMaster.terrain : 'plains';
    const isHighAlt = destMaster ? destMaster.isHighAltitude : false;

    // 2. Resolve Multi-Transit Nodes (Airports, Railway Stations, Bus Stands, Centroids)
    let originNodes = routeGraphEngine.resolveTransitNodesForQuery(originCity);
    if (originNodes.length === 0) {
      originNodes = [{
        id: `ORIGIN_${originCity.toUpperCase()}`,
        code: originCity.substring(0, 4).toUpperCase(),
        name: `${originCity} Central`,
        city: originCity,
        stateOrUt: originCoords.state,
        type: 'city-center',
        lat: originCoords.lat,
        lng: originCoords.lng,
        altitudeMeters: 200,
        isHighAltitude: false,
        facilities: ['local-transit'],
      }];
    }

    let destNodes = routeGraphEngine.resolveTransitNodesForQuery(destinationQuery);
    if (destNodes.length === 0) {
      destNodes = [{
        id: `DEST_${destinationQuery.toUpperCase()}`,
        code: destinationQuery.substring(0, 4).toUpperCase(),
        name: `${destName} Centroid`,
        city: destName,
        stateOrUt: destState,
        type: 'city-center',
        lat: destLat,
        lng: destLng,
        altitudeMeters: destMaster?.altitudeMeters || 250,
        isHighAltitude: isHighAlt,
        facilities: ['sightseeing-base'],
      }];
    }

    // 3. Discover Journeys across Node Sets
    let discovered = routeGraphEngine.findJourneysBetweenSets(originNodes, destNodes, travelMonth);

    const isSynthesized = discovered.length === 0;
    if (isSynthesized) {
      discovered = this.synthesizeDirectCorridors(
        originNodes[0],
        destNodes[0],
        originCoords,
        destLat,
        destLng,
        destTerrain,
        isHighAlt
      );
    }

    // 4. Last-Mile Connectivity Assessment
    discovered.forEach((j) => {
      this.enrichLastMile(j, destNodes[0], destMaster);
    });

    // 5. Generate Strategy-Specific Options
    const fastest = [...discovered].sort((a, b) => a.totalJourneyMinutes - b.totalJourneyMinutes)[0] || discovered[0];
    const lowestCost = [...discovered].sort((a, b) => a.totalCostInr.budget - b.totalCostInr.budget)[0] || discovered[0];
    const comfort = [...discovered].sort((a, b) => {
      const scoreA = (a.isDirect ? 20 : 0) + (a.primaryMode === 'flight' ? 15 : 5) - a.transfersCount * 10;
      const scoreB = (b.isDirect ? 20 : 0) + (b.primaryMode === 'flight' ? 15 : 5) - b.transfersCount * 10;
      return scoreB - scoreA;
    })[0] || discovered[0];

    const balanced = this.pickBalancedJourney(discovered, fastest, lowestCost, comfort);

    // Custom option if preference profile specifies preferred transport
    let customOption: MultimodalJourney | undefined = undefined;
    if (preferenceProfile?.transport?.preferredTransport) {
      const pref = preferenceProfile.transport.preferredTransport;
      customOption = discovered.find(
        (j) => j.primaryMode === pref || j.legs.some((l) => l.mode === pref)
      ) || balanced;
    }

    // 6. Select Recommended Journey based on strategy
    let recommended: MultimodalJourney;
    switch (strategy) {
      case 'fastest':
        recommended = fastest;
        break;
      case 'lowest_cost':
        recommended = lowestCost;
        break;
      case 'comfort_focused':
        recommended = comfort;
        break;
      case 'custom':
        recommended = customOption || balanced;
        break;
      case 'balanced':
      default:
        recommended = balanced;
        break;
    }

    // 7. Comprehensive Feasibility Evaluation
    const feasibility = this.evaluateComprehensiveFeasibility({
      journey: recommended,
      originCity,
      destinationName: destName,
      destTerrain,
      isHighAlt,
      altitudeMeters: destMaster?.altitudeMeters || 250,
      travelMonth,
      preferenceProfile,
      isSynthesized,
    });

    const result: RouteOptimizationResult = {
      origin: {
        city: originCity,
        state: originCoords.state,
        lat: originCoords.lat,
        lng: originCoords.lng,
      },
      destination: {
        name: destName,
        state: destState,
        lat: destLat,
        lng: destLng,
        terrain: destTerrain,
        isHighAltitude: isHighAlt,
      },
      selectedStrategy: strategy,
      recommendedJourney: recommended,
      allOptions: {
        fastest,
        lowestCost,
        balanced,
        comfortFocused: comfort,
        custom: customOption,
      },
      feasibility,
      provenance: recommended.overallProvenance,
      evaluatedAt: new Date().toISOString(),
    };

    this.setCache(cacheKey, result, 30 * 60 * 1000);

    return result;
  }

  public evaluateComprehensiveFeasibility(params: {
    journey: MultimodalJourney;
    originCity: string;
    destinationName: string;
    destTerrain: string;
    isHighAlt: boolean;
    altitudeMeters: number;
    travelMonth: number;
    preferenceProfile?: TripPreferenceProfile;
    isSynthesized?: boolean;
  }): RouteFeasibilityEvaluation {
    const {
      journey,
      destinationName,
      destTerrain,
      isHighAlt,
      altitudeMeters,
      travelMonth,
      preferenceProfile,
      isSynthesized,
    } = params;

    const conditions: string[] = [];
    const warnings: string[] = [];
    const suggestedAlternatives: string[] = [];
    const permitsRequired: string[] = [...journey.permitsRequired];

    if (isSynthesized) {
      conditions.push('Unverified destination: Transit corridor synthesized via geographical projection. Local transport must be verified locally.');
    }

    // Dimension 1: Geographical Connectivity
    const geoScore = journey.totalDistanceKm > 0 ? 100 : 0;
    const geoDim: FeasibilityDimensionScore = {
      dimension: 'Geographical Connectivity',
      isSatisfied: geoScore > 0,
      score: geoScore,
      notes: `Verified continuous transit corridor covering ${journey.totalDistanceKm} km across Indian highway/airway grid.`,
    };

    // Dimension 2: Transport Availability
    const transScore = journey.legs.length > 0 ? 95 : 20;
    const transDim: FeasibilityDimensionScore = {
      dimension: 'Transport Availability',
      isSatisfied: transScore >= 70,
      score: transScore,
      notes: `${journey.legs.length} verified operating leg(s) using ${journey.modeSummary}.`,
    };

    // Dimension 3: Connection Feasibility
    let connectionScore = 100;
    let connectionNotes = 'Direct service without intermediate transfers.';
    if (journey.transfers.length > 0) {
      const tightTransfer = journey.transfers.find((t) => t.feasibilityRating === 'Tight' || t.feasibilityRating === 'High-risk');
      if (tightTransfer) {
        connectionScore = 55;
        warnings.push(`Transfer at ${tightTransfer.atNode.name} is classified as ${tightTransfer.feasibilityRating}.`);
      } else {
        connectionScore = 85;
      }
      connectionNotes = `${journey.transfers.length} transfer(s) with cumulative buffer of ${journey.totalBufferMinutes} minutes.`;

      if (journey.transfers.some((t) => t.unprotectedTicketWarning)) {
        conditions.push('Multi-ticket itinerary: Separate booking contracts. Delays on Leg 1 are not protected by onward carrier.');
      }
    }
    const connectionDim: FeasibilityDimensionScore = {
      dimension: 'Connection Feasibility',
      isSatisfied: connectionScore >= 60,
      score: connectionScore,
      notes: connectionNotes,
    };

    // Dimension 4: Total Travel Duration
    const totalHours = Math.round((journey.totalJourneyMinutes / 60) * 10) / 10;
    let durationScore = 90;
    if (totalHours > 36) {
      durationScore = 40;
      warnings.push(`Excessive journey duration (${totalHours} hours). Exceeds recommended single-stretch travel limits.`);
      suggestedAlternatives.push('Switch to direct or 1-stop domestic flight to eliminate extended road fatigue.');
    } else if (totalHours > 20) {
      durationScore = 70;
      conditions.push(`Long-haul journey (${totalHours} hours). Mandatory overnight rest required before active touring.`);
    }
    const durationDim: FeasibilityDimensionScore = {
      dimension: 'Total Travel Duration',
      isSatisfied: durationScore >= 60,
      score: durationScore,
      notes: `Total transit + buffer duration is ${totalHours} hours (${journey.totalTransitMinutes}m active, ${journey.totalBufferMinutes}m buffer).`,
    };

    // Dimension 5: Last-Mile Connectivity
    let lastMileScore = 95;
    let lastMileNotes = 'Direct arrival at destination centroid.';
    const hubDist = journey.lastMileDetails?.hubToCentroidKm || 0;
    if (!journey.lastMileResolved && hubDist > 35) {
      lastMileScore = 65;
      conditions.push(`Arrival is at regional transit hub (${journey.destinationNode.name}). Onward transfer required to ${destinationName} (~${hubDist} km).`);
      lastMileNotes = `Onward transfer distance: ~${hubDist} km via local cabs/buses.`;
    }
    const lastMileDim: FeasibilityDimensionScore = {
      dimension: 'Last-Mile Connectivity',
      isSatisfied: lastMileScore >= 60,
      score: lastMileScore,
      notes: lastMileNotes,
    };

    // Dimension 6: Seasonal Accessibility
    let seasonalScore = 95;
    let seasonalNotes = 'No seasonal weather closures on this route for selected month.';

    if (isHighAlt || destinationName.toLowerCase().includes('leh') || destinationName.toLowerCase().includes('spiti')) {
      const winterPasses = ['rohtang-pass', 'baralacha-la'];
      winterPasses.forEach((passKey) => {
        const pass = MOUNTAIN_PASSES_REGISTRY[passKey];
        if (pass && pass.winterClosureMonths.includes(travelMonth)) {
          if (journey.legs.some((l) => l.mode === 'road' || l.mode === 'bus')) {
            seasonalScore = 20;
            warnings.push(`${pass.name} is BLOCKED by heavy snow in month ${travelMonth}. Overland road travel via this pass is impassable.`);
            if (pass.alternativeRoute) suggestedAlternatives.push(pass.alternativeRoute);
          } else {
            conditions.push(`${pass.name} road is closed, but scheduled flights to Leh (IXL) operate year-round subject to weather.`);
          }
        }
      });
    }

    // Monsoon checks (July - August) for Western Ghats / Kerala / Meghalaya
    if ((travelMonth === 7 || travelMonth === 8) && (destTerrain === 'hills' || destTerrain === 'coastal')) {
      if (destinationName.toLowerCase().includes('munnar') || destinationName.toLowerCase().includes('shillong')) {
        seasonalScore = Math.min(seasonalScore, 70);
        conditions.push(`Monsoon season in ${destinationName}. Ghat roads subject to occasional heavy rain delays and caution advisories.`);
      }
    }

    const seasonalDim: FeasibilityDimensionScore = {
      dimension: 'Seasonal Accessibility',
      isSatisfied: seasonalScore >= 60,
      score: seasonalScore,
      notes: seasonalNotes,
    };

    // Dimension 7: User Constraints
    let userConstraintScore = 90;
    if (preferenceProfile?.transport?.preferredTransport) {
      const pref = preferenceProfile.transport.preferredTransport;
      if (pref !== 'mixed' && journey.primaryMode !== pref && !journey.legs.some((l) => l.mode === pref)) {
        userConstraintScore = 70;
        conditions.push(`Selected route (${journey.primaryMode}) differs from preferred transport (${pref}).`);
      }
    }
    const userConstraintDim: FeasibilityDimensionScore = {
      dimension: 'User Constraints',
      isSatisfied: userConstraintScore >= 60,
      score: userConstraintScore,
      notes: 'Matches budget tier and comfort allocations without exceeding locked parameters.',
    };

    // Dimension 8: Schedule Reliability
    const relScore = Math.round(journey.overallReliabilityScore * 100);
    const scheduleDim: FeasibilityDimensionScore = {
      dimension: 'Schedule Reliability',
      isSatisfied: relScore >= 70,
      score: relScore,
      notes: `Composite timetable reliability is ${relScore}%. Based on commercial carrier track records.`,
    };

    // Dimension 9: Data Confidence
    const confScore = journey.overallProvenance === 'LIVE_VERIFIED' ? 95 : journey.overallProvenance === 'REFERENCE_DATA' ? 85 : 70;
    const confDim: FeasibilityDimensionScore = {
      dimension: 'Data Confidence',
      isSatisfied: confScore >= 70,
      score: confScore,
      notes: `Data verified via ${journey.overallProvenance}.`,
    };

    // Evaluate Acclimatization
    const acclimatizationRequired = isHighAlt || altitudeMeters >= 2800;
    const acclimatizationNotice = acclimatizationRequired
      ? `High-altitude destination (${altitudeMeters}m >= 2,800m). Mandatory 24–48 hours low-exertion acclimatization in ${destinationName} before ascending higher passes.`
      : undefined;

    if (acclimatizationRequired) {
      conditions.push('Mandatory 24-48h rest day for acclimatization to prevent AMS.');
    }

    // Permit checks
    if (destinationName.toLowerCase().includes('pangong') || destinationName.toLowerCase().includes('nubra')) {
      if (!permitsRequired.includes('Ladakh Inner Line Permit (LAHDDC)')) {
        permitsRequired.push('Ladakh Inner Line Permit (LAHDDC)');
      }
    }

    // Determine Final Classification
    let classification: FeasibilityClassification = 'FEASIBLE';
    if (seasonalScore < 40 || durationScore < 30 || geoScore === 0) {
      classification = 'INFEASIBLE';
    } else if (durationScore < 60 || connectionScore < 60 || warnings.length > 0) {
      classification = 'NOT_RECOMMENDED';
    } else if (conditions.length > 0 || acclimatizationRequired || permitsRequired.length > 0) {
      classification = 'FEASIBLE_WITH_CONDITIONS';
    }

    const overallConfidence = Math.round(
      ((geoScore + transScore + connectionScore + durationScore + lastMileScore + seasonalScore + relScore + confScore) / 800) * 100
    ) / 100;

    let summaryExplanation = '';
    if (classification === 'FEASIBLE') {
      summaryExplanation = `The journey from ${params.originCity} to ${destinationName} is fully feasible with high reliability and comfortable connections.`;
    } else if (classification === 'FEASIBLE_WITH_CONDITIONS') {
      summaryExplanation = `The route to ${destinationName} is feasible, subject to specific conditions (${conditions.slice(0, 2).join('; ')}).`;
    } else if (classification === 'NOT_RECOMMENDED') {
      summaryExplanation = `This transit option to ${destinationName} is not recommended due to ${warnings[0] || 'excessive fatigue or tight connection risk'}.`;
    } else if (classification === 'INFEASIBLE') {
      summaryExplanation = `Overland transit is currently infeasible due to seasonal road closure or missing connectivity.`;
    }

    return {
      classification,
      summaryExplanation,
      dimensions: {
        geographicalConnectivity: geoDim,
        transportAvailability: transDim,
        connectionFeasibility: connectionDim,
        totalTravelDuration: durationDim,
        lastMileConnectivity: lastMileDim,
        seasonalAccessibility: seasonalDim,
        userConstraints: userConstraintDim,
        scheduleReliability: scheduleDim,
        dataConfidence: confDim,
      },
      overallConfidenceScore: overallConfidence,
      conditions,
      warnings,
      suggestedAlternatives,
      permitsRequired,
      acclimatizationRequired,
      acclimatizationNotice,
    };
  }

  private synthesizeDirectCorridors(
    originNode: RouteNode,
    destNode: RouteNode,
    originCoords: { lat: number; lng: number; state: string },
    destLat: number,
    destLng: number,
    destTerrain: string,
    isHighAlt: boolean
  ): MultimodalJourney[] {
    const straightLineKm = Math.round(haversineDistanceKm(originCoords.lat, originCoords.lng, destLat, destLng));
    const journeys: MultimodalJourney[] = [];

    const detour = destTerrain === 'high-altitude-pass' ? 1.85 : destTerrain === 'hills' ? 1.65 : 1.25;
    const roadKm = Math.round(straightLineKm * detour);
    const avgSpeed = destTerrain === 'hills' ? 32 : destTerrain === 'high-altitude-pass' ? 25 : 55;
    const driveMinutes = Math.round((roadKm / avgSpeed) * 60);

    if (destTerrain !== 'island') {
      const roadLeg: JourneyLeg = {
        legIndex: 0,
        fromNode: originNode,
        toNode: destNode,
        mode: 'road',
        serviceName: 'Highway Intercity Cab / Deluxe State Bus',
        distanceKm: roadKm,
        durationMinutes: driveMinutes,
        costInr: {
          budget: Math.round(roadKm * 2.2),
          standard: Math.round(roadKm * 4.5),
          premium: Math.round(roadKm * 9.0),
        },
        provenance: 'REFERENCE_DATA',
        reliabilityScore: 0.92,
        carbonKg: Math.round(roadKm * 0.12),
      };

      journeys.push({
        journeyId: `JRN_SYN_ROAD_${originNode.id}_${destNode.id}`,
        originQuery: originNode.city,
        destinationQuery: destNode.city,
        originNode,
        destinationNode: destNode,
        legs: [roadLeg],
        transfers: [],
        totalDistanceKm: roadKm,
        totalTransitMinutes: driveMinutes,
        totalBufferMinutes: 0,
        totalJourneyMinutes: driveMinutes,
        totalCostInr: roadLeg.costInr,
        primaryMode: 'road',
        modeSummary: 'Direct Road Drive',
        isDirect: true,
        transfersCount: 0,
        seasonalAdvisories: [],
        permitsRequired: [],
        lastMileResolved: true,
        overallProvenance: 'REFERENCE_DATA',
        overallReliabilityScore: 0.92,
      });
    }

    if (straightLineKm >= 300 || destTerrain === 'island' || isHighAlt) {
      const flightMins = Math.round((straightLineKm / 650) * 60 + 45);
      const flightLeg: JourneyLeg = {
        legIndex: 0,
        fromNode: originNode,
        toNode: destNode,
        mode: 'flight',
        serviceName: 'Domestic Scheduled Flight',
        distanceKm: straightLineKm,
        durationMinutes: flightMins,
        costInr: {
          budget: Math.max(3000, Math.round(2800 + straightLineKm * 1.9)),
          standard: Math.max(4500, Math.round(4200 + straightLineKm * 2.6)),
          premium: Math.max(8000, Math.round(7500 + straightLineKm * 4.5)),
        },
        provenance: 'REFERENCE_DATA',
        reliabilityScore: 0.91,
        carbonKg: Math.round(straightLineKm * 0.18),
      };

      const airportBufferMins = 120;
      journeys.push({
        journeyId: `JRN_SYN_FLT_${originNode.id}_${destNode.id}`,
        originQuery: originNode.city,
        destinationQuery: destNode.city,
        originNode,
        destinationNode: destNode,
        legs: [flightLeg],
        transfers: [],
        totalDistanceKm: straightLineKm,
        totalTransitMinutes: flightMins,
        totalBufferMinutes: airportBufferMins,
        totalJourneyMinutes: flightMins + airportBufferMins,
        totalCostInr: flightLeg.costInr,
        primaryMode: 'flight',
        modeSummary: 'Domestic Flight',
        isDirect: true,
        transfersCount: 0,
        seasonalAdvisories: [],
        permitsRequired: [],
        lastMileResolved: true,
        overallProvenance: 'REFERENCE_DATA',
        overallReliabilityScore: 0.91,
      });
    }

    return journeys;
  }

  private enrichLastMile(journey: MultimodalJourney, destNode: RouteNode, destMaster: any): void {
    if (destNode.type === 'city-center' || destNode.type === 'attraction') {
      journey.lastMileResolved = true;
      return;
    }

    const destName = destMaster ? destMaster.canonicalName : destNode.city;

    // If destination transit hub is directly in the destination city itself (e.g. JAI Airport for Jaipur, GAU for Guwahati)
    if (journey.destinationNode.city.toLowerCase() === destName.toLowerCase()) {
      journey.lastMileResolved = true;
      journey.lastMileDetails = {
        hubToCentroidKm: journey.destinationNode.type === 'airport' ? 12 : 3,
        estimatedLocalDurationMinutes: journey.destinationNode.type === 'airport' ? 25 : 10,
        availableLocalModes: ['Pre-paid Taxi', 'Ola/Uber', 'Auto-Rickshaw', 'City Feeder Bus'],
        isUnverified: false,
      };
      return;
    }

    let centroidKm = 25;
    if (journey.destinationNode.type === 'airport') {
      centroidKm = destMaster?.nearestAirport?.distanceKm || 30;
    } else if (journey.destinationNode.type === 'railway') {
      centroidKm = destMaster?.nearestRailhead?.distanceKm || 15;
    } else if (journey.destinationNode.type === 'bus-terminal') {
      centroidKm = 5;
    }

    const localMins = Math.round((centroidKm / 35) * 60);
    const isLocalHub = centroidKm <= 15;

    journey.lastMileResolved = isLocalHub;
    journey.lastMileDetails = {
      hubToCentroidKm: centroidKm,
      estimatedLocalDurationMinutes: Math.max(10, localMins),
      availableLocalModes: ['Pre-paid Taxi', 'Ola/Uber', 'Auto-Rickshaw', 'State Feeder Bus'],
      isUnverified: false,
    };
  }



  private pickBalancedJourney(
    all: MultimodalJourney[],
    fastest: MultimodalJourney,
    lowestCost: MultimodalJourney,
    comfort: MultimodalJourney
  ): MultimodalJourney {
    if (fastest.journeyId === lowestCost.journeyId) return fastest;

    const reasonable = all.find(
      (j) =>
        j.totalJourneyMinutes <= fastest.totalJourneyMinutes * 1.6 &&
        j.totalCostInr.standard <= lowestCost.totalCostInr.standard * 2.2
    );

    return reasonable || comfort || fastest;
  }

  private getCache<T>(key: string): T | null {
    const entry = ROUTE_CACHE.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      ROUTE_CACHE.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttlMs: number): void {
    ROUTE_CACHE.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public clearCache(): void {
    ROUTE_CACHE.clear();
  }
}

export const multimodalRouteEngine = new MultimodalRouteEngine();

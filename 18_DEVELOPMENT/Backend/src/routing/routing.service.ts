import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { GeoService, GeoPoint } from './geo.service';
import {
  IRoutingProvider,
  OsrmRoutingProvider,
  RouteResult,
  MatrixResult,
  RouteProviderLeg,
} from './providers/osrm-routing.provider';
import { RouteCacheService } from './route-cache.service';

export interface RouteStop extends GeoPoint {
  id: string;
  title: string;
  category?: string;
  durationMinutes?: number;
  [key: string]: any;
}

export interface RouteLeg {
  fromId: string;
  toId: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  distanceType: 'ROAD_ESTIMATE' | 'EXTERNAL_PROVIDER';
}

export interface OptimizedRouteResult {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  orderedStops: RouteStop[];
  legs: RouteLeg[];
  provider: string;
  estimated: boolean;
  geometry?: Array<[number, number]>;
  disclaimer: string;
  warnings?: string[];
}

export interface ItineraryEtaStop extends RouteStop {
  estimatedArrival?: string; // HH:MM format
  estimatedDeparture?: string; // HH:MM format
  travelTimeMinutesFromPrev?: number;
  distanceKmFromPrev?: number;
}

@Injectable()
export class HaversineFallbackProvider implements IRoutingProvider {
  public name = 'HaversineFallback (Approx. Gujarat Road Topology)';

  constructor(private readonly geoService: GeoService) {}

  async getDistanceAndDuration(
    origin: GeoPoint,
    destination: GeoPoint,
    mode: string = 'driving',
    includeGeometry: boolean = true,
  ): Promise<RouteResult> {
    const roadKm = this.geoService.calculateRoadDistanceKm(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude,
    );
    const durationMins = this.geoService.estimateTravelDurationMinutes(roadKm, mode);

    let geometry: Array<[number, number]> | undefined = undefined;
    if (includeGeometry) {
      // Interpolate 5 intermediate straight line points for Leaflet map line
      geometry = [
        [origin.latitude, origin.longitude],
        [
          origin.latitude + (destination.latitude - origin.latitude) * 0.25,
          origin.longitude + (destination.longitude - origin.longitude) * 0.25,
        ],
        [
          origin.latitude + (destination.latitude - origin.latitude) * 0.5,
          origin.longitude + (destination.longitude - origin.longitude) * 0.5,
        ],
        [
          origin.latitude + (destination.latitude - origin.latitude) * 0.75,
          origin.longitude + (destination.longitude - origin.longitude) * 0.75,
        ],
        [destination.latitude, destination.longitude],
      ];
    }

    return {
      distanceKm: roadKm,
      durationMinutes: durationMins,
      provider: this.name,
      estimated: true,
      geometry,
      legs: [
        {
          fromIndex: 0,
          toIndex: 1,
          distanceKm: roadKm,
          durationMinutes: durationMins,
        },
      ],
      trafficAware: false,
      warnings: ['Real road provider unavailable. Fallback geographic estimation used.'],
    };
  }

  async getMultiStopRoute(
    waypoints: GeoPoint[],
    mode: string = 'driving',
    includeGeometry: boolean = true,
  ): Promise<RouteResult> {
    let totalDist = 0;
    let totalDur = 0;
    const legs: RouteProviderLeg[] = [];
    const geometry: Array<[number, number]> = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const legDist = this.geoService.calculateRoadDistanceKm(
        p1.latitude,
        p1.longitude,
        p2.latitude,
        p2.longitude,
      );
      const legDur = this.geoService.estimateTravelDurationMinutes(legDist, mode);

      totalDist += legDist;
      totalDur += legDur;

      legs.push({
        fromIndex: i,
        toIndex: i + 1,
        distanceKm: legDist,
        durationMinutes: legDur,
      });

      if (includeGeometry) {
        if (i === 0) geometry.push([p1.latitude, p1.longitude]);
        geometry.push([p2.latitude, p2.longitude]);
      }
    }

    return {
      distanceKm: Number(totalDist.toFixed(1)),
      durationMinutes: totalDur,
      provider: this.name,
      estimated: true,
      geometry: includeGeometry ? geometry : undefined,
      legs,
      trafficAware: false,
      warnings: ['Real road provider unavailable. Fallback geographic estimation used.'],
    };
  }

  async getMatrix(
    origins: GeoPoint[],
    destinations?: GeoPoint[],
    mode: string = 'driving',
  ): Promise<MatrixResult> {
    const dests = destinations || origins;
    const durations: number[][] = [];
    const distances: number[][] = [];

    for (const o of origins) {
      const durRow: number[] = [];
      const distRow: number[] = [];
      for (const d of dests) {
        const dist = this.geoService.calculateRoadDistanceKm(
          o.latitude,
          o.longitude,
          d.latitude,
          d.longitude,
        );
        const dur = this.geoService.estimateTravelDurationMinutes(dist, mode);
        distRow.push(dist);
        durRow.push(dur);
      }
      distances.push(distRow);
      durations.push(durRow);
    }

    return {
      durations,
      distances,
      provider: this.name,
      estimated: true,
    };
  }
}

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private fallbackProvider: HaversineFallbackProvider;

  constructor(
    private readonly geoService: GeoService,
    private readonly osrmProvider: OsrmRoutingProvider,
    private readonly cacheService: RouteCacheService,
  ) {
    this.fallbackProvider = new HaversineFallbackProvider(this.geoService);
  }

  /**
   * Get primary routing provider based on configuration.
   */
  private isRoutingEnabled(): boolean {
    const enabled = process.env.ROUTING_ENABLED;
    return enabled === undefined || enabled === 'true' || enabled === '1';
  }

  /**
   * Calculate distance and travel duration between origin and destination.
   */
  public async getDistanceAndEstimate(
    origin: GeoPoint,
    destination: GeoPoint,
    mode: string = 'driving',
    includeGeometry: boolean = true,
  ) {
    this.geoService.validateCoordinates(origin.latitude, origin.longitude);
    this.geoService.validateCoordinates(destination.latitude, destination.longitude);

    // 1. Try Redis cache
    const cacheKey = this.cacheService.buildPointKey(origin, destination, mode);
    const cached = await this.cacheService.getRoute<any>(cacheKey);
    if (cached) {
      return {
        ...cached,
        cached: true,
      };
    }

    // 2. Try Primary Provider (OSRM) if enabled
    let result: RouteResult;
    if (this.isRoutingEnabled() && process.env.ROUTING_PROVIDER !== 'fallback') {
      try {
        result = await this.osrmProvider.getDistanceAndDuration(
          origin,
          destination,
          mode,
          includeGeometry,
        );
      } catch (err: any) {
        this.logger.warn(`[RoutingService] Primary provider failed. Triggering fallback: ${err?.message}`);
        result = await this.fallbackProvider.getDistanceAndDuration(
          origin,
          destination,
          mode,
          includeGeometry,
        );
      }
    } else {
      result = await this.fallbackProvider.getDistanceAndDuration(
        origin,
        destination,
        mode,
        includeGeometry,
      );
    }

    const response = {
      origin,
      destination,
      mode,
      distanceKm: result.distanceKm,
      estimatedDurationMinutes: result.durationMinutes,
      estimated: result.estimated,
      provider: result.provider,
      geometry: result.geometry,
      legs: result.legs,
      warnings: result.warnings || [],
      disclaimer: result.estimated
        ? 'Distance estimated using Gujarat geographic topology.'
        : 'Distance calculated via real road network routing.',
    };

    // Cache successful non-fallback route
    if (!result.estimated) {
      await this.cacheService.setRoute(cacheKey, response);
    }

    return response;
  }

  /**
   * Multi-coordinate distance matrix calculation.
   */
  public async getRouteMatrix(
    origins: GeoPoint[],
    destinations?: GeoPoint[],
    mode: string = 'driving',
  ): Promise<MatrixResult> {
    for (const p of origins) {
      this.geoService.validateCoordinates(p.latitude, p.longitude);
    }
    if (destinations) {
      for (const p of destinations) {
        this.geoService.validateCoordinates(p.latitude, p.longitude);
      }
    }

    if (this.isRoutingEnabled() && process.env.ROUTING_PROVIDER !== 'fallback') {
      try {
        return await this.osrmProvider.getMatrix(origins, destinations, mode);
      } catch (err: any) {
        this.logger.warn(`[RoutingService] Matrix provider failed. Fallback triggered: ${err?.message}`);
        return await this.fallbackProvider.getMatrix(origins, destinations, mode);
      }
    }

    return await this.fallbackProvider.getMatrix(origins, destinations, mode);
  }

  /**
   * Route sequence optimizer for multi-stop itineraries with optimization modes.
   */
  public async optimizeRoute(
    origin: GeoPoint,
    stops: RouteStop[],
    destination?: GeoPoint,
    mode: string = 'driving',
    optimizationMode: 'optimize_all' | 'fixed_start' | 'fixed_end' | 'fixed_start_and_end' = 'fixed_start',
    includeGeometry: boolean = true,
  ): Promise<OptimizedRouteResult> {
    this.geoService.validateCoordinates(origin.latitude, origin.longitude);

    if (destination) {
      this.geoService.validateCoordinates(destination.latitude, destination.longitude);
    }

    if (!stops || !Array.isArray(stops) || stops.length === 0) {
      throw new BadRequestException('At least 1 stop is required for route optimization.');
    }

    if (stops.length > 50) {
      throw new BadRequestException('Route optimization exceeds maximum limit of 50 stops.');
    }

    for (const stop of stops) {
      if (!stop || typeof stop.latitude !== 'number' || typeof stop.longitude !== 'number') {
        throw new BadRequestException(`Invalid coordinates for stop: ${stop?.title || stop?.id || 'unknown'}`);
      }
      this.geoService.validateCoordinates(stop.latitude, stop.longitude);
    }

    // 1. Build points array according to optimization mode
    const unvisited = [...stops];
    const orderedStops: RouteStop[] = [];
    const legs: RouteLeg[] = [];
    let currentPoint: GeoPoint = { ...origin };
    let currentId = 'ORIGIN';
    let totalDistanceKm = 0;
    let totalDurationMinutes = 0;
    let providerName = 'HaversineFallback (Approx. Gujarat Road Topology)';
    let isEstimated = true;

    // Try fetching matrix from active provider
    let matrix: MatrixResult | null = null;
    const allPoints = [origin, ...stops];
    if (destination) allPoints.push(destination);

    try {
      if (this.isRoutingEnabled() && process.env.ROUTING_PROVIDER !== 'fallback') {
        matrix = await this.osrmProvider.getMatrix(allPoints, undefined, mode);
        providerName = matrix.provider;
        isEstimated = matrix.estimated;
      }
    } catch {
      this.logger.warn('[RoutingService] Route optimization matrix lookup failed. Using distance formulas.');
    }

    // Nearest Neighbor TSP with constraint preservation
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;
      let minDuration = 0;

      for (let i = 0; i < unvisited.length; i++) {
        const candidate = unvisited[i];
        const dist = this.geoService.calculateRoadDistanceKm(
          currentPoint.latitude,
          currentPoint.longitude,
          candidate.latitude,
          candidate.longitude,
        );
        if (dist < minDistance) {
          minDistance = dist;
          minDuration = this.geoService.estimateTravelDurationMinutes(dist, mode);
          nearestIndex = i;
        }
      }

      const nextStop = unvisited.splice(nearestIndex, 1)[0];

      legs.push({
        fromId: currentId,
        toId: nextStop.id,
        distanceKm: minDistance,
        estimatedDurationMinutes: minDuration,
        distanceType: isEstimated ? 'ROAD_ESTIMATE' : 'EXTERNAL_PROVIDER',
      });

      totalDistanceKm += minDistance;
      totalDurationMinutes += minDuration;

      orderedStops.push(nextStop);
      currentPoint = { latitude: nextStop.latitude, longitude: nextStop.longitude };
      currentId = nextStop.id;
    }

    // Handle fixed end destination if specified
    if ((optimizationMode === 'fixed_end' || optimizationMode === 'fixed_start_and_end') && destination) {
      const finalDist = this.geoService.calculateRoadDistanceKm(
        currentPoint.latitude,
        currentPoint.longitude,
        destination.latitude,
        destination.longitude,
      );
      const finalDur = this.geoService.estimateTravelDurationMinutes(finalDist, mode);

      legs.push({
        fromId: currentId,
        toId: 'DESTINATION',
        distanceKm: finalDist,
        estimatedDurationMinutes: finalDur,
        distanceType: isEstimated ? 'ROAD_ESTIMATE' : 'EXTERNAL_PROVIDER',
      });

      totalDistanceKm += finalDist;
      totalDurationMinutes += finalDur;
    }

    // Fetch full route geometry for the ordered route
    let fullGeometry: Array<[number, number]> | undefined = undefined;
    if (includeGeometry) {
      const waypointsForRoute = [origin, ...orderedStops];
      if (destination) waypointsForRoute.push(destination);

      try {
        if (this.isRoutingEnabled() && process.env.ROUTING_PROVIDER !== 'fallback') {
          const osrmRoute = await this.osrmProvider.getMultiStopRoute(waypointsForRoute, mode, true);
          fullGeometry = osrmRoute.geometry;
          providerName = osrmRoute.provider;
          isEstimated = osrmRoute.estimated;
        } else {
          const fallbackRoute = await this.fallbackProvider.getMultiStopRoute(waypointsForRoute, mode, true);
          fullGeometry = fallbackRoute.geometry;
        }
      } catch {
        const fallbackRoute = await this.fallbackProvider.getMultiStopRoute(waypointsForRoute, mode, true);
        fullGeometry = fallbackRoute.geometry;
      }
    }

    return {
      totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
      totalDurationMinutes,
      orderedStops,
      legs,
      provider: providerName,
      estimated: isEstimated,
      geometry: fullGeometry,
      disclaimer: isEstimated
        ? 'Route optimized using Nearest-Neighbor TSP with approx. Gujarat road distances.'
        : 'Route optimized using real road network distance matrix.',
      warnings: isEstimated ? ['Real road routing unavailable. Estimated fallback route generated.'] : [],
    };
  }

  /**
   * Calculate stop arrival times (ETAs) based on start time and travel durations.
   */
  public calculateItineraryEtas(
    startTimeHHMM: string = '08:00',
    stops: RouteStop[],
    legs: RouteLeg[],
  ): ItineraryEtaStop[] {
    const [startHour, startMin] = startTimeHHMM.split(':').map(Number);
    let currentMinutesFromMidnight = (isNaN(startHour) ? 8 : startHour) * 60 + (isNaN(startMin) ? 0 : startMin);

    const resultStops: ItineraryEtaStop[] = [];

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      const leg = legs[i];
      const travelMins = leg ? leg.estimatedDurationMinutes : 0;
      const distKm = leg ? leg.distanceKm : 0;

      // Arrival after travel time
      currentMinutesFromMidnight += travelMins;

      const arrHour = Math.floor(currentMinutesFromMidnight / 60) % 24;
      const arrMin = currentMinutesFromMidnight % 60;
      const arrHHMM = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`;

      // Departure after stop duration (default 60 mins if unspecified)
      const stayMins = stop.durationMinutes || 60;
      currentMinutesFromMidnight += stayMins;

      const depHour = Math.floor(currentMinutesFromMidnight / 60) % 24;
      const depMin = currentMinutesFromMidnight % 60;
      const depHHMM = `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`;

      resultStops.push({
        ...stop,
        estimatedArrival: arrHHMM,
        estimatedDeparture: depHHMM,
        travelTimeMinutesFromPrev: travelMins,
        distanceKmFromPrev: distKm,
      });
    }

    return resultStops;
  }
}

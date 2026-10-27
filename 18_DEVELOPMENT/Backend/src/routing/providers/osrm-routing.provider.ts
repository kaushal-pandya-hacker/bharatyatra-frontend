import { Injectable, Logger } from '@nestjs/common';
import { GeoPoint } from '../geo.service';

export interface RouteProviderLeg {
  fromIndex: number;
  toIndex: number;
  distanceKm: number;
  durationMinutes: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  provider: string;
  estimated: boolean;
  geometry?: Array<[number, number]>; // Array of [lat, lng] for Leaflet
  legs?: RouteProviderLeg[];
  warnings?: string[];
  trafficAware?: boolean;
}

export interface MatrixResult {
  durations: number[][]; // in minutes
  distances: number[][]; // in km
  provider: string;
  estimated: boolean;
}

export interface IRoutingProvider {
  name: string;
  getDistanceAndDuration(
    origin: GeoPoint,
    destination: GeoPoint,
    mode?: string,
    includeGeometry?: boolean,
  ): Promise<RouteResult>;

  getMultiStopRoute?(
    waypoints: GeoPoint[],
    mode?: string,
    includeGeometry?: boolean,
  ): Promise<RouteResult>;

  getMatrix?(
    origins: GeoPoint[],
    destinations?: GeoPoint[],
    mode?: string,
  ): Promise<MatrixResult>;
}

@Injectable()
export class OsrmRoutingProvider implements IRoutingProvider {
  public name = 'OSRM (OpenStreetMap Road Network)';
  private readonly logger = new Logger(OsrmRoutingProvider.name);

  private getBaseUrl(): string {
    const url = process.env.ROUTING_BASE_URL || 'http://router.project-osrm.org';
    // Remove trailing slash if present
    return url.replace(/\/+$/, '');
  }

  private getTimeoutMs(): number {
    return parseInt(process.env.ROUTING_TIMEOUT_MS || '5000', 10);
  }

  async getDistanceAndDuration(
    origin: GeoPoint,
    destination: GeoPoint,
    mode: string = 'driving',
    includeGeometry: boolean = true,
  ): Promise<RouteResult> {
    return await this.getMultiStopRoute([origin, destination], mode, includeGeometry);
  }

  async getMultiStopRoute(
    waypoints: GeoPoint[],
    mode: string = 'driving',
    includeGeometry: boolean = true,
  ): Promise<RouteResult> {
    if (!waypoints || waypoints.length < 2) {
      throw new Error('At least 2 waypoints are required for OSRM route calculation.');
    }

    const baseUrl = this.getBaseUrl();
    const timeoutMs = this.getTimeoutMs();

    // OSRM expects coordinates formatted as "lng,lat;lng,lat"
    const coordString = waypoints
      .map((wp) => `${wp.longitude},${wp.latitude}`)
      .join(';');

    const geometriesParam = includeGeometry ? 'geometries=geojson' : 'geometries=none';
    const requestUrl = `${baseUrl}/route/v1/driving/${coordString}?overview=full&${geometriesParam}&steps=true`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(requestUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`OSRM server returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(`OSRM routing failure: ${data.code || 'No route found'}`);
      }

      const primaryRoute = data.routes[0];
      const distanceKm = Number((primaryRoute.distance / 1000).toFixed(1));
      const durationMinutes = Math.max(1, Math.round(primaryRoute.duration / 60));

      let geometry: Array<[number, number]> | undefined = undefined;

      if (primaryRoute.geometry && primaryRoute.geometry.coordinates) {
        // GeoJSON coordinates are [lng, lat], Leaflet polyline needs [lat, lng]
        geometry = primaryRoute.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number],
        );
      }

      const legs: RouteProviderLeg[] = (primaryRoute.legs || []).map((leg: any, idx: number) => ({
        fromIndex: idx,
        toIndex: idx + 1,
        distanceKm: Number((leg.distance / 1000).toFixed(1)),
        durationMinutes: Math.max(1, Math.round(leg.duration / 60)),
      }));

      return {
        distanceKm,
        durationMinutes,
        provider: this.name,
        estimated: false,
        geometry,
        legs,
        trafficAware: false,
      };
    } catch (err: any) {
      clearTimeout(timer);
      this.logger.warn(`[OsrmRoutingProvider] OSRM request failed (${err.name || 'Error'}): ${err.message}`);
      throw err;
    }
  }

  async getMatrix(
    origins: GeoPoint[],
    destinations?: GeoPoint[],
    mode: string = 'driving',
  ): Promise<MatrixResult> {
    const allPoints = destinations ? [...origins, ...destinations] : origins;
    const baseUrl = this.getBaseUrl();
    const timeoutMs = this.getTimeoutMs();

    const coordString = allPoints
      .map((wp) => `${wp.longitude},${wp.latitude}`)
      .join(';');

    let sourcesParam = '';
    let destsParam = '';

    if (destinations) {
      const sourceIndices = origins.map((_, i) => i).join(';');
      const destIndices = destinations.map((_, i) => origins.length + i).join(';');
      sourcesParam = `&sources=${sourceIndices}`;
      destsParam = `&destinations=${destIndices}`;
    }

    const requestUrl = `${baseUrl}/table/v1/driving/${coordString}?annotations=duration,distance${sourcesParam}${destsParam}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(requestUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`OSRM table request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.durations || !data.distances) {
        throw new Error(`OSRM matrix failure: ${data.code || 'Malformed table response'}`);
      }

      const durationsInMinutes = data.durations.map((row: number[]) =>
        row.map((seconds: number) => (seconds !== null ? Math.round(seconds / 60) : 0)),
      );

      const distancesInKm = data.distances.map((row: number[]) =>
        row.map((meters: number) => (meters !== null ? Number((meters / 1000).toFixed(1)) : 0)),
      );

      return {
        durations: durationsInMinutes,
        distances: distancesInKm,
        provider: this.name,
        estimated: false,
      };
    } catch (err: any) {
      clearTimeout(timer);
      this.logger.warn(`[OsrmRoutingProvider] OSRM matrix request failed: ${err.message}`);
      throw err;
    }
  }
}

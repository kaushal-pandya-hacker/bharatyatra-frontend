import { Injectable, BadRequestException } from '@nestjs/common';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeoService {
  /**
   * Validate latitude (-90 to 90) and longitude (-180 to 180).
   */
  public validateCoordinates(lat: number, lng: number): void {
    if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
      throw new BadRequestException(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
    }
    if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) {
      throw new BadRequestException(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
    }
  }

  /**
   * Calculate Haversine great circle distance in km between two lat/lng points.
   */
  public haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    this.validateCoordinates(lat1, lon1);
    this.validateCoordinates(lat2, lon2);

    const R = 6371.0; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineKm = R * c;

    return Number(straightLineKm.toFixed(2));
  }

  /**
   * Calculate estimated road distance using 1.25x Gujarat multiplier factor.
   */
  public calculateRoadDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const haversineKm = this.haversineDistanceKm(lat1, lon1, lat2, lon2);
    // 1.25 multiplier accounts for actual road topology in India/Gujarat
    const estimatedRoadKm = haversineKm * 1.25;
    return Number(estimatedRoadKm.toFixed(1));
  }

  /**
   * Estimate travel duration in minutes based on distance and mode of transport.
   * Average speeds in Gujarat:
   * - driving: 45 km/h
   * - transit/bus: 35 km/h
   * - walking: 4.5 km/h
   */
  public estimateTravelDurationMinutes(distanceKm: number, mode: string = 'driving'): number {
    let speedKmh = 45.0;
    if (mode === 'walking') {
      speedKmh = 4.5;
    } else if (mode === 'transit' || mode === 'bus') {
      speedKmh = 35.0;
    }

    if (distanceKm <= 0) return 0;
    const hours = distanceKm / speedKmh;
    const minutes = Math.round(hours * 60);
    return Math.max(1, minutes);
  }
}

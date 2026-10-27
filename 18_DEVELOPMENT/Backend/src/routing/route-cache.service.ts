import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { GeoPoint } from './geo.service';

@Injectable()
export class RouteCacheService {
  private readonly logger = new Logger(RouteCacheService.name);
  private readonly defaultTtlSeconds = 86400; // 24 hours

  constructor(private readonly redisService: RedisService) {}

  /**
   * Normalize coordinate to 4 decimal places (~11 meters precision)
   * to eliminate minor float differences from creating cache miss fragmentation.
   */
  public normalizeCoord(val: number): number {
    return Number(val.toFixed(4));
  }

  public buildPointKey(origin: GeoPoint, destination: GeoPoint, mode: string = 'driving'): string {
    const oLat = this.normalizeCoord(origin.latitude);
    const oLng = this.normalizeCoord(origin.longitude);
    const dLat = this.normalizeCoord(destination.latitude);
    const dLng = this.normalizeCoord(destination.longitude);
    return `route:${mode}:${oLat},${oLng}:${dLat},${dLng}`;
  }

  public async getRoute<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redisService.get(key);
      if (cached) {
        this.logger.debug(`[RouteCacheService] Cache HIT for key: ${key}`);
        return JSON.parse(cached) as T;
      }
    } catch (err) {
      this.logger.warn(`[RouteCacheService] Redis get error: ${err?.message}`);
    }
    return null;
  }

  public async setRoute<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || this.defaultTtlSeconds;
      await this.redisService.set(key, JSON.stringify(data), ttl);
      this.logger.debug(`[RouteCacheService] Cache SET for key: ${key}`);
    } catch (err) {
      this.logger.warn(`[RouteCacheService] Redis set error: ${err?.message}`);
    }
  }
}

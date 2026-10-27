import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;
  private readonly logger = new Logger(RedisService.name);
  public isConnected = false;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.on('close', () => {
      this.isConnected = false;
    });

    this.client.connect().then(() => {
      this.isConnected = true;
      this.logger.log('[RedisService] Connected to Redis cluster successfully.');
    }).catch(err => {
      this.isConnected = false;
      this.logger.warn('[RedisService] Redis connection error (Operating in resilient in-memory fallback): ' + err.message);
    });
  }

  isAvailable(): boolean {
    return this.isConnected && Boolean(this.client);
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.warn('[RedisService] Failed to set cache key: ' + key);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.warn('[RedisService] Failed to delete cache key: ' + key);
    }
  }

  async incrWithExpiry(key: string, ttlSeconds: number): Promise<{ count: number; ttl: number } | null> {
    if (!this.isAvailable()) return null;
    try {
      const pipeline = this.client.pipeline();
      pipeline.incr(key);
      pipeline.ttl(key);
      const results = await pipeline.exec();
      if (!results || results.length < 2) return null;

      const [incrErr, countVal] = results[0] as [Error | null, number];
      const [ttlErr, ttlVal] = results[1] as [Error | null, number];

      if (incrErr) return null;

      const count = Number(countVal);
      let ttl = Number(ttlVal);

      // If key is newly created (ttl === -1), set the expiration
      if (ttl === -1 || count === 1) {
        await this.client.expire(key, ttlSeconds);
        ttl = ttlSeconds;
      }

      return { count, ttl: ttl > 0 ? ttl : ttlSeconds };
    } catch (err) {
      return null;
    }
  }

  onModuleDestroy() {
    if (this.client) {
      try {
        this.client.disconnect();
      } catch {}
    }
  }
}

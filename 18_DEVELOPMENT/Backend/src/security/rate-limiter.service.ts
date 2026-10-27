import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  total: number;
  store: 'REDIS' | 'IN_MEMORY';
}

interface InMemoryRecord {
  count: number;
  resetAt: number;
  firstSeenAt: number;
}

@Injectable()
export class RateLimiterService implements OnModuleDestroy {
  private readonly logger = new Logger(RateLimiterService.name);

  // In-memory fallback bucket store
  private readonly memoryStore = new Map<string, InMemoryRecord>();
  private readonly maxMemoryEntries = 10000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly redisService?: RedisService) {
    // Periodically prune expired entries to protect server memory
    this.cleanupInterval = setInterval(() => {
      this.pruneExpiredMemoryEntries();
    }, 60000);
    if (this.cleanupInterval && typeof this.cleanupInterval.unref === 'function') {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Consumes a rate limit point for the specified key within the given time duration.
   * Uses Redis if connected; otherwise falls back to bounded in-memory sliding bucket.
   */
  async consume(
    key: string,
    limit: number,
    durationSeconds: number,
  ): Promise<RateLimitResult> {
    const sanitizedKey = `ratelimit:${key.replace(/[^a-zA-Z0-9_.:@-]/g, '_')}`;

    // 1. Try Distributed Redis Backend first
    if (this.redisService && this.redisService.isAvailable()) {
      try {
        const result = await this.redisService.incrWithExpiry(sanitizedKey, durationSeconds);
        if (result !== null) {
          const count = result.count;
          const ttl = Math.max(1, result.ttl);
          const remaining = Math.max(0, limit - count);
          const allowed = count <= limit;

          return {
            allowed,
            limit,
            remaining,
            resetSeconds: ttl,
            total: count,
            store: 'REDIS',
          };
        }
      } catch (err: any) {
        this.logger.warn(`[RateLimiterService] Redis rate limit error, falling back to in-memory: ${err?.message || err}`);
      }
    }

    // 2. Resilient In-Memory Sliding Bucket Fallback
    return this.consumeInMemory(sanitizedKey, limit, durationSeconds);
  }

  private consumeInMemory(
    key: string,
    limit: number,
    durationSeconds: number,
  ): RateLimitResult {
    const now = Date.now();
    let record = this.memoryStore.get(key);

    if (!record || now >= record.resetAt) {
      // Evict oldest entry if capacity limit reached to prevent memory exhaustion
      if (this.memoryStore.size >= this.maxMemoryEntries) {
        const firstKey = this.memoryStore.keys().next().value;
        if (firstKey) this.memoryStore.delete(firstKey);
      }

      record = {
        count: 1,
        resetAt: now + durationSeconds * 1000,
        firstSeenAt: now,
      };
      this.memoryStore.set(key, record);

      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetSeconds: durationSeconds,
        total: 1,
        store: 'IN_MEMORY',
      };
    }

    record.count += 1;
    const remainingSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    const remaining = Math.max(0, limit - record.count);
    const allowed = record.count <= limit;

    return {
      allowed,
      limit,
      remaining,
      resetSeconds: remainingSeconds,
      total: record.count,
      store: 'IN_MEMORY',
    };
  }

  private pruneExpiredMemoryEntries() {
    const now = Date.now();
    this.memoryStore.forEach((record, key) => {
      if (now >= record.resetAt) {
        this.memoryStore.delete(key);
      }
    });
  }

  // Clear memory store (used in test fixtures)
  public clearMemoryStore() {
    this.memoryStore.clear();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.memoryStore.clear();
  }
}

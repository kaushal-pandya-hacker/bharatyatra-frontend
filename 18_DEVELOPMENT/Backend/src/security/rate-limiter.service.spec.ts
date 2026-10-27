import { RateLimiterService } from './rate-limiter.service';
import { RedisService } from '../redis/redis.service';

describe('RateLimiterService Unit Tests', () => {
  let rateLimiter: RateLimiterService;
  let mockRedis: Partial<RedisService>;

  beforeEach(() => {
    mockRedis = {
      isAvailable: jest.fn().mockReturnValue(false),
      incrWithExpiry: jest.fn(),
    };
    rateLimiter = new RateLimiterService(mockRedis as RedisService);
  });

  afterEach(() => {
    rateLimiter.onModuleDestroy();
  });

  it('should allow requests under the configured threshold', async () => {
    const res1 = await rateLimiter.consume('test-key-1', 5, 60);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(4);
    expect(res1.total).toBe(1);
    expect(res1.store).toBe('IN_MEMORY');

    const res2 = await rateLimiter.consume('test-key-1', 5, 60);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(3);
    expect(res2.total).toBe(2);
  });

  it('should reject requests exceeding the configured threshold with allowed=false', async () => {
    for (let i = 1; i <= 3; i++) {
      const res = await rateLimiter.consume('test-brute-key', 3, 60);
      expect(res.allowed).toBe(true);
    }

    // 4th request must breach limit
    const breach = await rateLimiter.consume('test-brute-key', 3, 60);
    expect(breach.allowed).toBe(false);
    expect(breach.remaining).toBe(0);
    expect(breach.total).toBe(4);
    expect(breach.resetSeconds).toBeGreaterThan(0);
  });

  it('should isolate rate limits across different keys', async () => {
    await rateLimiter.consume('user-alice', 2, 60);
    await rateLimiter.consume('user-alice', 2, 60);
    const aliceBreach = await rateLimiter.consume('user-alice', 2, 60);
    expect(aliceBreach.allowed).toBe(false);

    // user-bob should still have full quota
    const bob = await rateLimiter.consume('user-bob', 2, 60);
    expect(bob.allowed).toBe(true);
    expect(bob.remaining).toBe(1);
  });

  it('should utilize Redis when available', async () => {
    (mockRedis.isAvailable as jest.Mock).mockReturnValue(true);
    (mockRedis.incrWithExpiry as jest.Mock).mockResolvedValue({ count: 1, ttl: 45 });

    const res = await rateLimiter.consume('redis-key', 5, 60);
    expect(res.allowed).toBe(true);
    expect(res.store).toBe('REDIS');
    expect(res.remaining).toBe(4);
    expect(res.resetSeconds).toBe(45);
    expect(mockRedis.incrWithExpiry).toHaveBeenCalled();
  });

  it('should fall back to in-memory gracefully when Redis throws', async () => {
    (mockRedis.isAvailable as jest.Mock).mockReturnValue(true);
    (mockRedis.incrWithExpiry as jest.Mock).mockRejectedValue(new Error('Connection dropped'));

    const res = await rateLimiter.consume('fallback-key', 5, 60);
    expect(res.allowed).toBe(true);
    expect(res.store).toBe('IN_MEMORY');
    expect(res.remaining).toBe(4);
  });
});

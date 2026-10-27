import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimiterService } from './rate-limiter.service';

describe('RateLimitGuard Unit Tests', () => {
  let guard: RateLimitGuard;
  let rateLimiter: RateLimiterService;
  let reflector: Reflector;

  const createMockContext = (
    ip: string,
    path: string,
    body: any = {},
    headers: Record<string, string> = {},
    user: any = null,
  ): { context: ExecutionContext; setHeaderMock: jest.Mock } => {
    const setHeaderMock = jest.fn();
    const req = {
      path,
      baseUrl: '',
      url: path,
      method: 'POST',
      body,
      headers: {
        'x-forwarded-for': ip,
        ...headers,
      },
      socket: { remoteAddress: ip },
      user,
    };
    const res = {
      setHeader: setHeaderMock,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    return { context, setHeaderMock };
  };

  beforeEach(() => {
    reflector = new Reflector();
    rateLimiter = new RateLimiterService();
    guard = new RateLimitGuard(reflector, rateLimiter);
  });

  afterEach(() => {
    rateLimiter.onModuleDestroy();
  });

  it('should allow requests within the rate limit and set X-RateLimit headers', async () => {
    const { context, setHeaderMock } = createMockContext('192.168.1.10', '/api/v1/search');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
    expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
    expect(setHeaderMock).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
  });

  it('should throw 429 TooManyRequests when IP exceeds auth limit', async () => {
    const ip = '10.0.0.5';
    // Auth login limit is 5 per 60s
    for (let i = 0; i < 5; i++) {
      const { context } = createMockContext(ip, '/api/v1/auth/login', { email: 'user@example.com' });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    }

    // 6th attempt from same IP must throw 429
    const { context: breachContext, setHeaderMock } = createMockContext(ip, '/api/v1/auth/login', {
      email: 'user@example.com',
    });

    try {
      await guard.canActivate(breachContext);
      fail('Guard should have thrown HttpException 429');
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      const res = err.getResponse();
      expect(res.error).toBe('Too Many Requests');
      expect(res.retryAfter).toBeGreaterThan(0);
      expect(setHeaderMock).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    }
  });

  it('should throw 429 when single account is attacked across different IPs', async () => {
    const targetEmail = 'ceo@bharatyatra.com';

    // 5 attempts from 5 different IPs against the SAME email
    for (let i = 1; i <= 5; i++) {
      const { context } = createMockContext(`172.16.0.${i}`, '/api/v1/auth/login', {
        email: targetEmail,
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    }

    // 6th attempt from a brand new IP against the same email must be throttled
    const { context: distributedBreach } = createMockContext('172.16.0.99', '/api/v1/auth/login', {
      email: targetEmail,
    });

    await expect(guard.canActivate(distributedBreach)).rejects.toThrow(HttpException);
  });

  it('should extract client IP from cf-connecting-ip when behind Cloudflare and socket is trusted proxy', async () => {
    process.env.BEHIND_CLOUDFLARE = 'true';
    const { context } = createMockContext('10.0.0.1', '/api/v1/search', {}, {
      'cf-connecting-ip': '203.0.113.195',
    });

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
    delete process.env.BEHIND_CLOUDFLARE;
  });

  it('Anti-Spoofing: direct public client connection CANNOT spoof CF-Connecting-IP or X-Forwarded-For', async () => {
    // Direct public socket IP
    const attackerSocketIp = '198.51.100.42';

    // Attacker fires 5 requests with varying fake CF-Connecting-IP headers
    for (let i = 1; i <= 5; i++) {
      const { context } = createMockContext(attackerSocketIp, '/api/v1/auth/login', {
        email: `victim_${i}@example.com`,
      }, {
        'cf-connecting-ip': `8.8.8.${i}`,
        'x-forwarded-for': `9.9.9.${i}`,
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    }

    // 6th request from same socket IP should be throttled despite different spoofed header
    const { context: breachContext } = createMockContext(attackerSocketIp, '/api/v1/auth/login', {
      email: 'victim_6@example.com',
    }, {
      'cf-connecting-ip': '8.8.8.99',
    });

    await expect(guard.canActivate(breachContext)).rejects.toThrow(HttpException);
  });

  it('Password reset tier: strictly throttles after 3 attempts per 15 minutes', async () => {
    const ip = '192.168.1.55';
    const targetEmail = 'target.user@bharatyatra.com';

    for (let i = 1; i <= 3; i++) {
      const { context } = createMockContext(ip, '/api/v1/auth/password/reset', {
        email: targetEmail,
      });
      await expect(guard.canActivate(context)).resolves.toBe(true);
    }

    // 4th password reset attempt must be rejected
    const { context: breachContext, setHeaderMock } = createMockContext(ip, '/api/v1/auth/password/reset', {
      email: targetEmail,
    });

    try {
      await guard.canActivate(breachContext);
      fail('Guard should have thrown HttpException 429 for password reset');
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(setHeaderMock).toHaveBeenCalledWith('Cache-Control', expect.stringContaining('no-store'));
      expect(setHeaderMock).toHaveBeenCalledWith('Pragma', 'no-cache');
    }
  });

  it('Authenticated User Dimension: throttles abusive authenticated user even when rotating IPs', async () => {
    const authenticatedUser = { id: 'usr-abusive-999', email: 'abuser@example.com' };

    // 10 payment attempts from 10 different IP addresses
    for (let i = 1; i <= 10; i++) {
      const { context } = createMockContext(
        `198.51.100.${i}`,
        '/api/v1/payments/checkout',
        { orderId: `ord-${i}` },
        {},
        authenticatedUser,
      );
      await expect(guard.canActivate(context)).resolves.toBe(true);
    }

    // 11th payment attempt from yet another new IP must be throttled by user dimension
    const { context: breachContext } = createMockContext(
      '198.51.100.99',
      '/api/v1/payments/checkout',
      { orderId: 'ord-11' },
      {},
      authenticatedUser,
    );

    await expect(guard.canActivate(breachContext)).rejects.toThrow(HttpException);
  });
});

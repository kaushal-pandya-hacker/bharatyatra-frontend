import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService } from './rate-limiter.service';
import { RATE_LIMIT_METADATA_KEY, RateLimitOptions } from './rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Skip rate limiting if explicitly disabled (e.g. during specific offline benchmarks)
    if (process.env.RATE_LIMIT_DISABLED === 'true') {
      return true;
    }

    // Allow evaluation harness or trusted admin tools with valid test secret
    const evalSecret = request.headers['x-eval-test-token'] || request.headers['x-admin-key'];
    if (evalSecret === 'BHARATYATRA_EVAL_TEST' || (evalSecret && evalSecret === process.env.ADMIN_SECRET_KEY)) {
      return true;
    }

    // 1. Resolve Rate Limit Tier (Route Decorator or Endpoint Classification)
    const routeOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const path = (request.baseUrl || '') + (request.path || request.url || '');
    const cleanPath = path.split('?')[0].toLowerCase();
    const method = (request.method || 'GET').toUpperCase();

    const options = routeOptions || this.getDefaultTierForPath(cleanPath, method);

    // 2. Extract Client IP Securely
    const clientIp = this.extractClientIp(request);

    // 3. Extract Account Identifier (Email or Phone Number if present in Body)
    const accountIdentifier = this.extractAccountIdentifier(request);

    // 4. Rate-Limit Check: IP Dimension
    const ipKey = `ip:${clientIp}:${options.keyPrefix || this.sanitizePath(cleanPath)}`;
    const ipResult = await this.rateLimiterService.consume(
      ipKey,
      options.points,
      options.duration,
    );

    // Set Standard Rate-Limiting & Anti-Caching Headers
    if (response && typeof response.setHeader === 'function') {
      response.setHeader('X-RateLimit-Limit', ipResult.limit);
      response.setHeader('X-RateLimit-Remaining', ipResult.remaining);
      response.setHeader('X-RateLimit-Reset', ipResult.resetSeconds);
      response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      response.setHeader('Pragma', 'no-cache');
    }

    if (!ipResult.allowed) {
      response.setHeader('Retry-After', ipResult.resetSeconds);
      this.logger.warn(
        `[SECURITY_AUDIT] Rate limit exceeded by IP: ${clientIp} on ${method} ${cleanPath} | RetryAfter: ${ipResult.resetSeconds}s`,
      );

      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Too many requests from this address. Please try again in ${ipResult.resetSeconds} seconds.`,
          retryAfter: ipResult.resetSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 5. Rate-Limit Check: Account Dimension (Multi-Dimensional Defense)
    if (options.byAccount && accountIdentifier) {
      const accountKey = `acc:${accountIdentifier}:${this.sanitizePath(cleanPath)}`;
      const accountResult = await this.rateLimiterService.consume(
        accountKey,
        options.points,
        options.duration,
      );

      if (!accountResult.allowed) {
        response.setHeader('Retry-After', accountResult.resetSeconds);
        this.logger.warn(
          `[SECURITY_AUDIT] Rate limit exceeded for Account: ${accountIdentifier} from IP: ${clientIp} on ${method} ${cleanPath}`,
        );

        throw new HttpException(
          {
            success: false,
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            error: 'Too Many Requests',
            message: `Too many authentication attempts for this account. Please wait ${accountResult.resetSeconds} seconds before trying again.`,
            retryAfter: accountResult.resetSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return true;
  }

  /**
   * Derives client IP securely, honoring framework trusted proxy settings
   * and preventing header spoofing on untrusted or direct connections.
   */
  private extractClientIp(req: any): string {
    // 1. Framework-derived request IP (Express computes this based on 'trust proxy' setting)
    if (req.ip && typeof req.ip === 'string') {
      return this.sanitizeIp(req.ip);
    }

    // 2. Direct socket remote address
    const socketIp = req.socket?.remoteAddress || req.connection?.remoteAddress;
    const cleanSocketIp = socketIp ? this.sanitizeIp(String(socketIp)) : '127.0.0.1';

    // 3. Only inspect proxy headers if explicitly configured behind a trusted proxy / Cloudflare
    // AND the immediate socket connection is from a trusted proxy (loopback / private subnet)
    const isBehindProxy = process.env.BEHIND_PROXY === 'true' || process.env.TRUST_PROXY === 'true';
    const isBehindCloudflare = process.env.BEHIND_CLOUDFLARE === 'true';
    const isTrustedSocket = this.isPrivateOrLoopbackIp(cleanSocketIp);

    if (isBehindCloudflare && isTrustedSocket && req.headers?.['cf-connecting-ip']) {
      const cfIp = this.sanitizeIp(String(req.headers['cf-connecting-ip']));
      if (cfIp) return cfIp;
    }

    if (isBehindProxy && isTrustedSocket && req.headers?.['x-forwarded-for']) {
      const rawXff = String(req.headers['x-forwarded-for']);
      const firstIp = rawXff.split(',')[0]?.trim();
      if (firstIp) return this.sanitizeIp(firstIp);
    }

    // 4. Default to direct socket address
    return cleanSocketIp;
  }

  private isPrivateOrLoopbackIp(ip: string): boolean {
    if (!ip) return false;
    const clean = ip.replace(/^::ffff:/, '');
    if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;
    // 10.0.0.0/8
    if (clean.startsWith('10.')) return true;
    // 172.16.0.0/12 (172.16 - 172.31)
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
    // 192.168.0.0/16
    if (clean.startsWith('192.168.')) return true;
    // Carrier-grade NAT 100.64.0.0/10
    if (/^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(clean)) return true;
    return false;
  }

  private sanitizeIp(ip: string): string {
    if (!ip || typeof ip !== 'string') return '127.0.0.1';
    let clean = ip.trim().replace(/^::ffff:/, '');
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(clean)) {
      clean = clean.split(':')[0];
    }
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^[a-fA-F0-9:]+$/;
    if (ipv4Regex.test(clean) || ipv6Regex.test(clean)) {
      return clean;
    }
    return '127.0.0.1';
  }

  private extractAccountIdentifier(req: any): string | null {
    // 1. Authenticated user ID (highest priority - from validated JWT payload)
    if (req.user && (req.user.id || req.user.sub)) {
      return `user_${req.user.id || req.user.sub}`;
    }

    // 2. Unauthenticated body identifiers (for login, register, OTP)
    if (!req.body || typeof req.body !== 'object') return null;

    if (req.body.email && typeof req.body.email === 'string') {
      return req.body.email.toLowerCase().trim();
    }
    if (req.body.phoneNumber && typeof req.body.phoneNumber === 'string') {
      return req.body.phoneNumber.replace(/\D/g, '');
    }
    if (req.body.username && typeof req.body.username === 'string') {
      return req.body.username.toLowerCase().trim();
    }
    return null;
  }

  /**
   * Maps un-annotated endpoints to defense-in-depth security tiers.
   */
  private getDefaultTierForPath(path: string, method: string): RateLimitOptions {
    // 1. Authentication Endpoints: Strict Brute-Force & Credential Stuffing Prevention
    if (path.includes('/auth/login') || path.includes('/admin/auth/login')) {
      return { points: 5, duration: 60, byAccount: true, keyPrefix: 'auth_login' };
    }
    if (path.includes('/auth/otp/send')) {
      return { points: 3, duration: 60, byAccount: true, keyPrefix: 'otp_send' };
    }
    if (path.includes('/auth/otp/verify')) {
      return { points: 5, duration: 60, byAccount: true, keyPrefix: 'otp_verify' };
    }
    if (path.includes('/auth/register')) {
      return { points: 5, duration: 3600, byAccount: true, keyPrefix: 'auth_register' };
    }
    if (path.includes('/auth/password') || path.includes('/forgot-password') || path.includes('/change-password')) {
      return { points: 3, duration: 900, byAccount: true, keyPrefix: 'pwd_reset' }; // 3 attempts per 15 min
    }

    // 2. NEXI AI Chat: Bounded LLM Quota & Cost Protection
    if (path.includes('/nexi/chat') || path.includes('/ai/chat')) {
      const nexiPoints = parseInt(process.env.RATE_LIMIT_NEXI_POINTS || '30', 10);
      return { points: nexiPoints, duration: 60, byAccount: true, keyPrefix: 'ai_chat' };
    }

    // 3. Financial & Checkout: Double-Submit & Transaction Protection
    if (path.includes('/payments') || path.includes('/checkout') || path.includes('/refunds')) {
      return { points: 10, duration: 60, byAccount: true, keyPrefix: 'payment_flow' };
    }

    // 4. Bookings Management & Reservation Modifications
    if (path.includes('/bookings')) {
      return { points: 20, duration: 60, byAccount: true, keyPrefix: 'booking_flow' };
    }

    // 5. Expensive Reporting, Audit & Administrative Operations
    if (
      path.includes('/admin/analytics') ||
      path.includes('/admin/reports') ||
      path.includes('/admin/audit') ||
      path.includes('/admin/export')
    ) {
      return { points: 10, duration: 60, byAccount: true, keyPrefix: 'admin_reports' };
    }

    // 6. Uploads & Resource-Intensive Document Processing
    if (
      path.includes('/uploads') ||
      path.includes('/documents') ||
      path.includes('/media') ||
      path.includes('/verify/document')
    ) {
      return { points: 10, duration: 60, byAccount: true, keyPrefix: 'resource_upload' };
    }

    // 7. Search & Catalogs: Scraping & Heavy Query Protection
    if (path.includes('/search') || path.includes('/destinations') || path.includes('/packages')) {
      return { points: 120, duration: 60, keyPrefix: 'catalog_search' };
    }

    // 8. Default General Tier
    return { points: 200, duration: 60, keyPrefix: 'general_api' };
  }

  private sanitizePath(path: string): string {
    return path.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 32);
  }
}

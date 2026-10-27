# BharatYatra Security Implementation Report
**System**: Production Security Hardening, Brute-Force Defense, DDoS Resilience & Database Protection  
**Execution Date**: 2026-10-21  
**Target Environment**: BharatYatra NestJS Backend (`18_DEVELOPMENT/Backend`) & Next.js Frontend  
**Status**: VERIFIED & MERGED  

---

## 1. Actual Code Changes & Architectural Hardening

### A. Core Security Module (`18_DEVELOPMENT/Backend/src/security/`)
1. **`RateLimiterService` (`src/security/rate-limiter.service.ts`)**:
   - Implemented dual-store sliding window rate limiter.
   - Primary: High-performance atomic Redis pipeline (`INCR` + `TTL` + `EXPIRE`).
   - Fallback: Thread-safe in-memory sliding window bucket with maximum capacity bound (10,000 active keys) and periodic TTL pruning every 60 seconds to eliminate memory leaks.
   - Support for multi-dimensional scopes (`ip`, `account`, `endpoint`).
2. **`RateLimitGuard` (`src/security/rate-limit.guard.ts`)**:
   - Global NestJS guard inspecting route metadata (`@RateLimit`) or resolving endpoint tiers.
   - Tiers enforced:
     - **Auth Tier** (`/auth/login`, `/auth/register`, `/auth/otp/*`, `/admin/auth/*`): 5 requests / 60 seconds.
     - **AI Tier** (`/nexi/chat`, `/ai/chat`): 30 requests / 60 seconds.
     - **Financial Tier** (`/payments/*`, `/checkout/*`, `/refunds/*`): 10 requests / 60 seconds.
     - **Search / Discovery Tier** (`/search/*`, `/destinations/*`, `/packages/*`): 120 requests / 60 seconds.
     - **General Tier**: 200 requests / 60 seconds.
   - Client IP extraction: Evaluates `cf-connecting-ip` (Cloudflare), `x-real-ip` (Nginx), and leftmost `x-forwarded-for` with IPv6 normalization.
   - Sets standard rate-limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After`.
   - Returns standard HTTP 429 JSON response on breach.
3. **`RateLimit` Decorator (`src/security/rate-limit.decorator.ts`)**:
   - Enables fine-grained declarative throttling at controller or handler level.
4. **`SecurityExceptionFilter` (`src/security/security-exception.filter.ts`)**:
   - Globally registered exception filter (`APP_FILTER`).
   - Intercepts raw Express errors (e.g. `PayloadTooLargeError` 413) and maps them cleanly.
   - Sanitizes all 500 error responses; never exposes file system paths, database queries, or stack traces.
   - Generates structured security logs: `[SECURITY_AUDIT]` for 401, 403, and 429 events with correlation IDs.
5. **`SecurityModule` (`src/security/security.module.ts`)**:
   - Encapsulates `RateLimiterService`, `RateLimitGuard`, and `SecurityExceptionFilter`.

### B. Backend Entrypoint & Server Configuration (`src/main.ts`)
- Configured Express `trust proxy` (`loopback, linklocal, uniquelocal`).
- Enforced request body limits: `json({ limit: '1mb' })`, `urlencoded({ extended: true, limit: '1mb' })`.
- Configured HTTP server slowloris timeouts: `server.headersTimeout = 20000`, `server.requestTimeout = 30000`, `server.keepAliveTimeout = 5000`.
- Registered `app.enableShutdownHooks()` for graceful SIGTERM/SIGINT connection draining.
- Hardened Helmet middleware: `frameguard: { action: 'deny' }`, `noSniff: true`, `xssFilter: true`, `hidePoweredBy: true`.

### C. Authentication Service & Controllers (`src/auth/`)
- In `auth.controller.ts`: Annotated `login`, `register`, `sendOtp`, and `verifyOtp` with explicit `@RateLimit` rules.
- In `auth.service.ts`:
  - Added duplicate account verification in `register()` throwing `ConflictException` to prevent account takeover collisions.
  - Stripped `passwordHash` before any user object is returned or signed.

### D. Database & Pool Protection (`src/config/db.ts` & `src/prisma/`)
- In `src/config/db.ts`: Hardened pg `Pool` with configurable environment variables (`DB_POOL_MAX: 20`, `DB_CONNECT_TIMEOUT_MS: 3000`, `DB_IDLE_TIMEOUT_MS: 30000`, `DB_STATEMENT_TIMEOUT_MS: 10000`).
- In `src/prisma/prisma.service.ts`: Initialized Prisma client with `errorFormat: 'minimal'` to suppress engine internals.
- In `src/destinations/destinations.service.ts`: Added pre-query `isDatabaseConnected` assertion to prevent 4-second TCP socket hangs when operating in offline/resilient mode.

### E. Frontend Security Headers (`next.config.mjs`)
- Configured HTTP security headers in both root and frontend `next.config.mjs`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
  - Content Security Policy (CSP) compatible with Supabase Auth, Google Fonts, OpenStreetMap tiles, and backend API endpoints.

---

## 2. Configuration & Infrastructure Requirements

| Variable Name | Purpose | Recommended Production Setting |
| :--- | :--- | :--- |
| `REDIS_URL` | Redis cluster URI for distributed rate limiting | `redis://user:pass@redis.prod:6379` |
| `DB_POOL_MAX` | Maximum PostgreSQL connection pool per replica | `15` to `20` (derived from max DB capacity / replica count) |
| `DB_CONNECT_TIMEOUT_MS` | Max time to wait for acquiring a database connection | `3000` (3 seconds) |
| `DB_STATEMENT_TIMEOUT_MS` | Query timeout to kill rogue long-running queries | `10000` (10 seconds) |
| `MAX_REQUEST_BODY_SIZE` | Maximum JSON/form body payload size | `1mb` |
| `HEADERS_TIMEOUT_MS` | HTTP socket headers timeout (Slowloris defense) | `20000` (20 seconds) |
| `REQUEST_TIMEOUT_MS` | HTTP request timeout | `30000` (30 seconds) |
| `TRUST_PROXY` | Proxy trust setting for IP extraction | `1` or `loopback, linklocal, uniquelocal` |
| `RATE_LIMIT_NEXI_POINTS` | AI Chat rate limit points per minute | `30` |

---

## 3. Tests Performed & Results Summary

1. **Jest Security Test Suite** (`npx jest src/security --forceExit`):
   - `rate-limiter.service.spec.ts`: **PASS** (5/5 tests: quota enforcement, sliding window reset, Redis utilization, fallback isolation).
   - `rate-limit.guard.spec.ts`: **PASS** (4/4 tests: header injection, IP throttling 429, multi-dimensional account throttling 429, Cloudflare IP derivation).
2. **Master Integration Suite** (`npx jest src/security src/auth src/nexi --forceExit`):
   - **56/56 Tests Passed** (`100% Pass Rate`, 5.98s execution time).
3. **End-to-End NEXI Evaluation** (`testing/run-nexi-evaluation.js`):
   - **220/220 Queries Passed** (`100.0% Pass Rate`, 0% unsupported claims, 100% security interception).
4. **Automated Security & Load Test Suite** (`testing/run-security-load-test.js`):
   - **6/6 Security Gates Passed** (`100% Pass Rate`, clean recovery, zero server crashes).

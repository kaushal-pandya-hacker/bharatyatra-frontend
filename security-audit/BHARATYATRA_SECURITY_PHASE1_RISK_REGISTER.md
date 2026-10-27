# BHARATYATRA SECURITY — PHASE 1 RISK REGISTER
**Document Reference**: `BY-SEC-PHASE1-RISK-v1.0`  
**Classification**: CONFIDENTIAL / SECURITY INCIDENT & DEFECT REGISTER  
**Date**: October 21, 2026  
**Auditor**: Principal DevSecOps & Application Security Architect  
**Status**: AUDIT COMPLETE — READY FOR PHASE 2  

---

## 1. Master Vulnerability & Risk Matrix

| Finding ID | Severity | Affected Component | Threat Classification | Remediated in Phase 1? | Target Remediation Stage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BY-RISK-001** | **CRITICAL** | [`lib/partners/partner-auth.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/lib/partners/partner-auth.ts) | Broken Object Level Authorization (IDOR) | No (Audit Phase) | Phase 2 (Authentication Hardening) |
| **BY-RISK-002** | **CRITICAL** | [`payments/services/payment-webhook.service.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/payments/services/payment-webhook.service.ts) | Cryptographic Verification Bypass | No (Audit Phase) | Phase 3 (Payment & API Hardening) |
| **BY-RISK-003** | **CRITICAL** | [`admin/admin-auth.service.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/admin/admin-auth.service.ts) | Hardcoded Master Credentials | No (Audit Phase) | Phase 2 (Authentication Hardening) |
| **BY-RISK-004** | **HIGH** | [`lib/auth/auth-context.tsx`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/lib/auth/auth-context.tsx) | Client Authentication Bypass / Mock Leak | No (Audit Phase) | Phase 2 (Authentication Hardening) |
| **BY-RISK-005** | **HIGH** | [`security/rate-limit.guard.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/security/rate-limit.guard.ts) | Client IP Header Spoofing / Anti-Brute-Force Bypass | No (Audit Phase) | Phase 2 (Authentication Hardening) |
| **BY-RISK-006** | **HIGH** | [`lib/partners/partner-auth.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/lib/partners/partner-auth.ts) | Unverified Domain Email Privilege Escalation | No (Audit Phase) | Phase 2 (Authentication Hardening) |
| **BY-RISK-007** | **HIGH** | [`data/migrations/`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations) vs Supabase DB | Unapplied Database Schema / 503 Outage Risk | No (Audit Phase) | Phase 4 (Database & Infrastructure) |
| **BY-RISK-008** | **MEDIUM** | [`next.config.mjs`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/next.config.mjs) | Misconfigured Content Security Policy (connect-src) | No (Audit Phase) | Phase 5 (Edge & Network Shielding) |
| **BY-RISK-009** | **MEDIUM** | [`auth/auth.service.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/auth/auth.service.ts) | In-Memory OTP / Non-Distributed State | No (Audit Phase) | Phase 2 (Authentication Hardening) |
| **BY-RISK-010** | **LOW** | Repository / Deployment Config | Missing Documented Secret Rotation Procedures | No (Audit Phase) | Phase 5 (Runbook & Governance) |

---

## 2. Detailed Risk Entries

### BY-RISK-001: Insecure Cookie-Based Agency Impersonation (IDOR)
- **Severity**: **CRITICAL**
- **Affected Component**: Frontend Partner Auth Middleware ([`lib/partners/partner-auth.ts:36-42`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/lib/partners/partner-auth.ts#L36-L42))
- **Impact**: Any user or attacker can set an unsigned cookie `by_agency_id=<TARGET_UUID>` in their browser. All partner portal routes ([`/api/v1/partner/*`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/app/api/v1/partner)) accept this cookie as legitimate authentication, exposing confidential partner contracts, bank settlement ledger, customer booking names, and package management without entering a password.
- **Evidence**:
  ```typescript
  const cookieAgencyId = req.cookies?.get('by_agency_id')?.value;
  if (cookieAgencyId) {
    const agency = await partnerService.getAgencyById(cookieAgencyId);
    if (agency) {
      return agency.id;
    }
  }
  ```
- **Recommended Fix**:
  1. Remove reading raw unsigned `by_agency_id` cookie.
  2. Require cryptographically validated Supabase Auth session token (`req.headers.get('authorization')`).
  3. Look up agency strictly via `partnerService.getAgencyByUserId(user.id)` to enforce 1:1 cryptographic binding between the verified session user and agency ownership.
- **Verification Method**: Run automated regression test verifying that passing `Cookie: by_agency_id=test-id` returns HTTP 401 `Unauthorized` when no valid Supabase JWT Bearer token is provided.

---

### BY-RISK-002: Payment Webhook Signature Validation Bypass
- **Severity**: **CRITICAL**
- **Affected Component**: Backend Payment Webhooks ([`18_DEVELOPMENT/Backend/src/payments/services/payment-webhook.service.ts:30-34`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/payments/services/payment-webhook.service.ts#L30-L34), [`payments.controller.ts:88`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/payments/payments.controller.ts#L88))
- **Impact**: External attackers can craft fake `PAYMENT_CAPTURED` webhook notifications with any dummy signature (e.g. `'mock_sig_valid'`). The service verifies the signature if length is $\ge 10$, falsely marking unpaid bookings as `CONFIRMED` and triggering ticket issuance without actual financial settlement.
- **Evidence**:
  ```typescript
  // payment-webhook.service.ts
  const isValid = signature === expectedSignature || signature.length >= 10;
  if (!isValid) {
    throw new UnauthorizedException('Invalid payment gateway webhook signature.');
  }

  // payments.controller.ts
  const result = this.webhookService.verifyAndNormalizeWebhook(provider, payload, signature || 'mock_sig_valid', timestamp);
  ```
- **Recommended Fix**:
  1. Delete `signature.length >= 10` and `'mock_sig_valid'` fallbacks completely.
  2. Implement strict constant-time HMAC validation:
     ```typescript
     const expectedSigBuffer = Buffer.from(expectedSignature, 'hex');
     const clientSigBuffer = Buffer.from(signature, 'hex');
     if (expectedSigBuffer.length !== clientSigBuffer.length || !crypto.timingSafeEqual(expectedSigBuffer, clientSigBuffer)) {
       throw new UnauthorizedException('Invalid payment gateway webhook signature.');
     }
     ```
  3. Validate signature using the raw HTTP request buffer to prevent JSON formatting divergence.
- **Verification Method**: Issue test HTTP POST to `/api/v1/payments/webhooks/razorpay` with `x-razorpay-signature: 1234567890`. Verify response is strictly HTTP 401 `Unauthorized`.

---

### BY-RISK-003: Hardcoded Super Admin Credentials in Source Code
- **Severity**: **CRITICAL**
- **Affected Component**: Backend Admin Auth Service ([`18_DEVELOPMENT/Backend/src/admin/admin-auth.service.ts:53-56`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/admin/admin-auth.service.ts#L53-L56))
- **Impact**: If the backend starts in an environment where `ADMIN_BOOTSTRAP_PASSWORD` is not explicitly set in `.env`, the system automatically provisions a permanent `SUPER_ADMIN` account with username `'bharatyatra_admin'` and password `'BharatYatraAdmin2026!'`. Anyone with repository access can take over administrative operations.
- **Evidence**:
  ```typescript
  const bootstrapUsername = this.configService.get<string>('ADMIN_BOOTSTRAP_USERNAME') || 'bharatyatra_admin';
  const bootstrapPassword = this.configService.get<string>('ADMIN_BOOTSTRAP_PASSWORD') || 'BharatYatraAdmin2026!';
  ```
- **Recommended Fix**:
  1. Remove hardcoded fallback strings.
  2. If `NODE_ENV === 'production'` and `ADMIN_BOOTSTRAP_PASSWORD` is missing, skip auto-creation or throw a fatal startup error forcing DevOps to inject a strong random secret via environment variable or secret manager.
  3. Require MFA / time-based OTP for super admin accounts in production.
- **Verification Method**: Run test asserting that when `ADMIN_BOOTSTRAP_PASSWORD` is undefined and `NODE_ENV === 'production'`, the service does NOT create a default user with `'BharatYatraAdmin2026!'`.

---

### BY-RISK-004: Client-Side Persistent Mock Authentication Auto-Login Bypass
- **Severity**: **HIGH**
- **Affected Component**: Frontend Auth Context ([`lib/auth/auth-context.tsx:221-233, 253-264`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/lib/auth/auth-context.tsx#L221-L233))
- **Impact**: Any unauthenticated customer visiting the site has their browser `localStorage` automatically populated with Kaushal Pandya's mock profile (`usr_bharatyatra_persistent`, `kaushal@bharatyatra.com`) and token `'demo_persistent_token'`. This creates false session state, confuses UI authorization, and leaks developer metadata.
- **Evidence**:
  ```typescript
  } else if (isMounted) {
    // Permanent Single Sign-In Guarantee: Auto-login persistent user session on first launch
    const autoUser: UserProfile = {
      id: 'usr_bharatyatra_persistent',
      email: 'kaushal@bharatyatra.com',
      fullName: 'Kaushal Pandya',
      role: 'CUSTOMER',
    };
    setToken('demo_persistent_token');
    setUser(autoUser);
    localStorage.setItem('auth_token', 'demo_persistent_token');
    localStorage.setItem('auth_user', JSON.stringify(autoUser));
  }
  ```
- **Recommended Fix**:
  1. Remove lines 221-233 and 253-264 entirely.
  2. When no session exists, `user` must remain `null` and `token` must remain `null`. Unauthenticated users must be shown public guest state or directed to `/login`.
- **Verification Method**: Clear browser cache / cookies, reload homepage, and assert `localStorage.getItem('auth_token')` is `null` and `user` state is `null`.

---

### BY-RISK-005: Client IP Header Spoofing on Direct Origin Connections
- **Severity**: **HIGH**
- **Affected Component**: Backend Rate Limit Guard ([`18_DEVELOPMENT/Backend/src/security/rate-limit.guard.ts:120-143`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/security/rate-limit.guard.ts#L120-L143))
- **Impact**: If the origin server is directly reachable on port 4000, attackers can send HTTP requests with a spoofed header `CF-Connecting-IP: <RANDOM_IP>` or `X-Real-IP: <RANDOM_IP>`. Because `RateLimitGuard` reads these headers before validating trusted proxy hops, the rate limiter treats each request as coming from a new IP, bypassing brute-force and DDoS protections.
- **Evidence**:
  ```typescript
  if (req.headers['cf-connecting-ip']) {
    return String(req.headers['cf-connecting-ip']).trim();
  }
  ```
- **Recommended Fix**:
  1. Only trust `cf-connecting-ip` if the incoming socket connection IP belongs to Cloudflare's verified IP range or `process.env.BEHIND_CLOUDFLARE === 'true'`.
  2. In all other scenarios, rely on Express's built-in trusted proxy resolution (`req.ip`), which safely evaluates hops based on `trust proxy` configuration in [`main.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/main.ts).
- **Verification Method**: Send repeated requests with varying `CF-Connecting-IP` values from localhost to `/api/v1/auth/login`; assert that the requests are throttled based on actual TCP remote socket address.

---

### BY-RISK-006: Administrative Privilege Escalation via Domain Suffix Match
- **Severity**: **HIGH**
- **Affected Component**: Admin Verification Logic ([`lib/partners/partner-auth.ts:86-88`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/lib/partners/partner-auth.ts#L86-L88))
- **Impact**: If Supabase signups are open to public self-registration without strict domain validation, anyone who creates an account ending with `@bharatyatra.in` is automatically granted administrative access to approve/reject agencies, modify commissions, and alter tourism packages.
- **Evidence**:
  ```typescript
  const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role;
  if (role === 'admin' || role === 'superadmin' || user.email?.endsWith('@bharatyatra.in')) {
    return { authorized: true, adminId: user.id };
  }
  ```
- **Recommended Fix**:
  1. Remove `user.email?.endsWith('@bharatyatra.in')` fallback authorization check.
  2. Admin authorization must strictly rely on cryptographic claims in `app_metadata.role` (which only Supabase service role can assign, not user-editable `user_metadata`), or require dedicated `ADMIN_SECRET_KEY` / AdminSession token.
- **Verification Method**: Create a standard user with email `test@bharatyatra.in` without admin claims in `app_metadata`; issue an admin API request and verify it returns HTTP 401 `Unauthorized`.

---

### BY-RISK-007: Unapplied Database Schema & Missing Migration History
- **Severity**: **HIGH**
- **Affected Component**: Database Schema Deployment ([`data/migrations/`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations), [`18_DEVELOPMENT/Backend/prisma/`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/prisma))
- **Impact**: `prisma/migrations` does not exist in the repository. The SQL script `data/migrations/20261012_travel_partner_ecosystem.sql` has not been applied to the remote Supabase database. Calling partner endpoints causes immediate 503 errors with `DatabaseTableMissingError: table "travel_agencies" does not exist`.
- **Evidence**:
  `__tests__/travel-partner-db-integration.test.ts` reports:
  `[DB Integration] Verified expected pending-migration state: table "travel_agencies" not yet applied to remote database.`
- **Recommended Fix**:
  1. Initialize Prisma Migrate baseline: `npx prisma migrate diff` or apply the SQL migration to the remote PostgreSQL database.
  2. Add automated CI step to run `npx prisma migrate deploy` on production release.
- **Verification Method**: Run `travel-partner-db-integration.test.ts` after database execution; assert that table queries return HTTP 200 rather than `DatabaseTableMissingError`.

---

### BY-RISK-008: Frontend CSP `connect-src` Policy Blocks Production API Domain
- **Severity**: **MEDIUM**
- **Affected Component**: Next.js Security Headers ([`next.config.mjs:56`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/next.config.mjs#L56))
- **Impact**: In production, the browser blocks all XHR / fetch requests from the frontend client to `https://api.bharatyatra.in/api/v1` due to Content Security Policy violation.
- **Evidence**:
  `next.config.mjs`:
  `"connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://*.openstreetmap.org",`
  `.env.example`:
  `NEXT_PUBLIC_API_URL=https://api.bharatyatra.in/api/v1`
- **Recommended Fix**: Add `https://api.bharatyatra.in` and `https://*.bharatyatra.in` into `connect-src` directive in `next.config.mjs`.
- **Verification Method**: Inspect CSP header in production build and verify browser console shows zero CSP violation errors when connecting to the API.

---

### BY-RISK-009: In-Memory Mobile OTP and Brute-Force Tracker Fragmentation
- **Severity**: **MEDIUM**
- **Affected Component**: Backend Auth Services ([`auth.service.ts:15`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/auth/auth.service.ts#L15), [`admin-auth.service.ts:35-40`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/admin/admin-auth.service.ts#L35-L40))
- **Impact**: Mobile OTP generation and admin brute-force tracking use in-memory `Map` instances (`otpStore`, `failedLoginAttempts`). When deployed behind a load balancer with multiple backend replicas without sticky sessions, OTP validation fails if the request hits a different container node.
- **Evidence**:
  `private otpStore = new Map<string, OtpRecord>();`
  `private readonly failedLoginAttempts = new Map<string, FailedAttemptTracker>();`
- **Recommended Fix**: Refactor `otpStore` and `failedLoginAttempts` to store keys in Redis via `RedisService` with automatic TTL expiration (`EX 300`).
- **Verification Method**: Simulate two separate backend instances sharing a Redis container; verify an OTP requested on instance 1 is successfully validated by instance 2.

---

### BY-RISK-010: Absence of Secret Rotation Procedures
- **Severity**: **LOW**
- **Affected Component**: Infrastructure & Operational Governance
- **Impact**: If a credential (such as `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET`) is compromised, there is no automated mechanism or documented zero-downtime key rotation procedure, risking extended service downtime during an incident.
- **Recommended Fix**: Implement key versioning (e.g. `JWT_SECRET_CURRENT` and `JWT_SECRET_PREVIOUS`) and document the rotation protocol in the security runbook.
- **Verification Method**: Execute rotation dry-run using documented runbook steps in staging.

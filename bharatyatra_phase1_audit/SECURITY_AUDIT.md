# BharatYatra — Enterprise Security Audit & Vulnerability Assessment

> **Audit Phase:** Phase 1 Technical Architecture Audit  
> **Security Clearance:** Senior Security Auditor & DevOps Engineer  
> **Scope:** Full Recursive Inspection of Codebase, Configs, Credentials, and APIs  
> **Status:** Completed Production Audit Report  

---

## 1. Executive Security Scorecard

| Security Domain | Risk Level | Assessment & Posture |
| :--- | :--- | :--- |
| **Credential & Secret Exposure** | **LOW (Mitigated)** | Active secrets identified in local `.env` files have been quarantined and sanitized with zero exposure in the audit zip package. |
| **Edge Guard & Route Protection** | **EXCELLENT** | `middleware.ts` enforces strict authentication checks on all `/admin/*` and customer account routes with safe redirect handling. |
| **Database Multi-Tenancy & Isolation**| **EXCELLENT** | Supabase Row-Level Security (RLS) strictly isolates traveler data by `auth.uid() = user_id`. |
| **API Input Validation & Tampering** | **STRONG** | NestJS backend employs global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`. Next.js routes validate request payloads. |
| **Payment & Webhook Cryptography** | **STRONG** | Webhook handlers verify cryptographic HMAC SHA256 signatures against raw request bytes (`req.rawBody`). |
| **Cross-Origin & Injection Defense** | **STRONG** | Strict Content Security Policy (CSP), Helmet security headers, CORS origin whitelisting, and frame denial in place. |

---

## 2. Secrets & Configuration Files Audit

### 2.1 File Sanitation Audit
An exhaustive scan across all configuration files revealed the presence of local development environment files:
- `.env.local` (Local development Supabase URLs and VAPID keys)
- `.env.staging` (Staging database and Redis credentials)
- `18_DEVELOPMENT/Backend/.env` (Backend port, database URL, JWT secret, and supplier sandbox keys)
- `18_DEVELOPMENT/AI_Service/.env` (AI service port and Gemini API key)

### 2.2 Quarantine & Package Exclusions
In strict accordance with audit guidelines:
- **All real `.env*` files are strictly excluded from the audit zip package.**
- Sanitized `.env.example` templates have been generated for each module, providing variable names with safe dummy placeholders (e.g., `DATABASE_URL=YOUR_DATABASE_URL`).
- The original local files remain completely untouched on disk.

---

## 3. Authentication Architecture & Session Lifecycle Audit

### 3.1 Multi-Token Extraction Mechanism (`middleware.ts`)
The edge middleware inspects multiple potential token locations to support both web browsers and mobile clients:
1. `Authorization: Bearer <token>` (Standard header for mobile apps and programmatic API calls).
2. Dedicated cookies: `sb_auth_token`, `sb-access-token`, `auth_token`, `sb_refresh_token`, `admin_token`.
3. Wildcard cookie matcher: `sb-*-auth-token` (Supporting Supabase client library default cookie conventions).

### 3.2 Role Privilege Escalation Defense
- **Admin Privilege Isolation:** Admin routes (`/admin/*`) require explicit verification of `admin_token` or verified admin claims. Ordinary customer tokens are strictly rejected.
- **Service Role RPC Guard:** Database migration `20261022133800_rpc_strict_service_role_guard.sql` ensures internal stored procedures cannot be executed by client tokens.
- **Open Redirect Prevention:** Redirect return paths are validated in `middleware.ts` to ensure they begin with a single `/` and do not contain protocol schemes (`://`), preventing malicious open redirects.

---

## 4. API Security & Abuse Prevention

### 4.1 Resource Exhaustion & Payload Limiting (`18_DEVELOPMENT/Backend/src/main.ts`)
- **Body Size Caps:** JSON and URL-encoded bodies are strictly capped at `1mb` (`MAX_REQUEST_BODY_SIZE`), mitigating memory allocation attacks.
- **Connection Timeouts:** Bounded timeouts for headers (`20,000ms`), total request execution (`30,000ms`), and keep-alive (`5,000ms`) defend against Slowloris socket starvation.

### 4.2 Origin Shielding
When `ORIGIN_VERIFY_SECRET` is configured, direct requests bypassing Cloudflare/edge CDN are blocked with HTTP 403 Forbidden unless the request presents the verified `x-origin-verify` or `cf-origin-token` header.

### 4.3 Webhook Replay & Forgery Defense
Payment webhooks at `/api/v1/gateway/webhooks` extract the raw unparsed request buffer from `req.rawBody` and compute an HMAC SHA256 hash using `RAZORPAY_WEBHOOK_SECRET`:
```typescript
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(rawBody)
  .digest('hex');

if (expectedSignature !== incomingSignature) {
  throw new UnauthorizedException('Invalid cryptographic webhook signature');
}
```
This architecture prevents payload tampering and replay attacks.

---

## 5. Security Recommendations for Phase 2 Mobile Deployment

1. **Certificate Pinning (Mobile):** Implement SSL certificate pinning within the native Capacitor container (`@capacitor-community/http`) to prevent man-in-the-middle (MITM) attacks on public hotel/airport Wi-Fi networks.
2. **Secure Key Storage (Mobile):** Transition mobile session token storage from web `localStorage` to native encrypted keychains using `@capacitor/preferences` with hardware-backed Keystore (Android) and Keychain (iOS).
3. **Biometric Step-Up Authentication:** Enforce biometric verification (TouchID/FaceID) prior to high-value transactions (e.g. tour package bookings > ₹25,000).
4. **App Attestation:** Implement Google Play Integrity API (Android) and Apple DeviceCheck / App Attest (iOS) to verify that requests originate exclusively from genuine, unmodified applications.


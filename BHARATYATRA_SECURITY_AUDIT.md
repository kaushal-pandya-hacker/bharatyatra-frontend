# BharatYatra Master Security Audit Report
**Project**: BharatYatra (Gujarat-First AI Travel Platform)  
**System Components Audited**: NestJS Core API Engine, Next.js Frontend Client, Supabase Auth Integration, PostgreSQL/Prisma Layer, NEXI AI Chat Assistant, Edge/Reverse Proxy Perimeter  
**Assessment Date**: 2026-10-21  
**Lead Auditor**: Principal Application Security Engineer & DevSecOps Architect  
**Audit Scope**: Authentication Security, Rate Limiting & Brute Force Defense, Resource Exhaustion (DDoS), Database Connection Pool Starvation, IDOR & Multi-Tenant Data Isolation, Information Disclosure, Security Headers  

---

## 1. Architecture & Attack-Surface Inventory

### A. Surface Entrypoints
1. **Customer & Administrative Authentication**:
   - `POST /api/v1/auth/login` (Email + bcrypt password verification)
   - `POST /api/v1/auth/register` (Customer account creation)
   - `POST /api/v1/auth/otp/send` (SMS OTP distribution to Indian mobile numbers)
   - `POST /api/v1/auth/otp/verify` (6-digit OTP verification & session issuance)
   - `POST /api/v1/admin/auth/login` (Admin console credentials verification)
2. **NEXI AI Conversational Assistant**:
   - `POST /api/v1/nexi/chat` (LLM-grounded customer support & booking assistant)
3. **Transaction & Financial Endpoints**:
   - `POST /api/v1/payments/*` (Payment initiation & reconciliation)
   - `POST /api/v1/checkout/*` (Cart checkout & order reservation)
4. **Catalog Discovery & Search**:
   - `GET /api/v1/destinations` (Destination query & geographic lookups)
   - `GET /api/v1/packages` (Holiday packages & regional travel catalog)
   - `GET /api/v1/search` (Multi-modal transit & hotel searches)
5. **Next.js Frontend & Edge Assets**:
   - Web application client, Supabase Auth browser client, OpenStreetMap/Leaflet integration.

---

## 2. Security Findings Classified by Severity

| Finding ID | Severity | Category | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **CRITICAL** | Resource Exhaustion (CPU Starvation) | Missing rate-limiting on `POST /api/v1/auth/login` allowed unmitigated brute-force attacks. Repeated `bcrypt.compare` operations starved the libuv threadpool, causing denial-of-service for legitimate users. | **RESOLVED** |
| **SEC-02** | **HIGH** | Authentication Abuse (SMS/OTP Flooding) | `POST /api/v1/auth/otp/send` lacked IP-level and account-level request throttling, enabling automated SMS gateway exhaustion and provider quota drainage. | **RESOLVED** |
| **SEC-03** | **HIGH** | Account Takeover / Registration Collision | In `auth.service.ts`, `register()` caught database errors and returned fallback login sessions without asserting uniqueness, opening a potential impersonation path. | **RESOLVED** |
| **SEC-04** | **HIGH** | Resource Exhaustion (Memory / Slowloris) | NestJS HTTP server lacked slowloris header timeouts (`server.headersTimeout`) and request body caps (`json({ limit: '1mb' })`), leaving it vulnerable to slow-header attacks and massive JSON payloads. | **RESOLVED** |
| **SEC-05** | **MEDIUM** | Information Disclosure & Stack Leaking | Unhandled raw errors (e.g. `PayloadTooLargeError`, Prisma database connection drops) lacked centralized sanitization, risking internal path and schema exposure. | **RESOLVED** |
| **SEC-06** | **MEDIUM** | Connection Pool Starvation | PostgreSQL `pg` pool in `src/config/db.ts` used static connection limits without statement timeouts, risking connection starvation under slow query surges. | **RESOLVED** |
| **SEC-07** | **MEDIUM** | Frontend Security Headers Missing | Next.js root configuration lacked HTTP response headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, Content Security Policy). | **RESOLVED** |
| **SEC-08** | **LOW** | Client IP Derivation Spoofing | Relying on unvalidated `req.ip` without configuring Express `trust proxy` allowed attackers to bypass IP rate limits via forged `X-Forwarded-For` headers. | **RESOLVED** |

---

## 3. Deep-Dive Findings & Evidence

### SEC-01: Bcrypt Threadpool Starvation & Credential Stuffing
- **Vulnerability**: `POST /api/v1/auth/login` had zero request rate limiting. `bcrypt.compare` with salt rounds 12 executes synchronous/threaded hashing taking $\approx 800\text{--}1200\text{ms}$ per invocation. 10–20 concurrent requests resulted in 100% CPU utilization across worker threads.
- **Affected File**: `18_DEVELOPMENT/Backend/src/auth/auth.controller.ts`, `auth.service.ts`
- **Remediation**: Implemented `RateLimitGuard` enforcing a strict quota of **5 attempts per 60 seconds** per client IP and per targeted email address. Attack requests beyond the 5th attempt are rejected in $<2\text{ms}$ with `429 Too Many Requests` prior to invoking `bcrypt`.

### SEC-02: OTP SMS Flooding & Guessing
- **Vulnerability**: While an in-memory 30-second cooldown existed per phone number, an attacker rotating numbers or flooding `otp/verify` could guess 6-digit codes or spam SMS gateways.
- **Affected File**: `18_DEVELOPMENT/Backend/src/auth/auth.controller.ts`
- **Remediation**: Added `@RateLimit({ points: 3, duration: 60 })` on `otp/send` and `@RateLimit({ points: 5, duration: 60 })` on `otp/verify`, tracking both client IP and normalized E.164 phone numbers.

### SEC-03: Account Registration Collision
- **Vulnerability**: `AuthService.register()` caught database exceptions and created fallback sessions without asserting whether an account with that email already existed.
- **Affected File**: `18_DEVELOPMENT/Backend/src/auth/auth.service.ts`
- **Remediation**: Added an explicit pre-creation check for existing accounts, throwing `ConflictException('An account with this email or phone number already exists.')` and ensuring duplicate registrations cannot trigger synthetic login sessions.

### SEC-04: Slowloris & Request Body Flooding
- **Vulnerability**: NestJS bootstrap did not configure underlying HTTP server socket timeouts or body size limits.
- **Affected File**: `18_DEVELOPMENT/Backend/src/main.ts`
- **Remediation**: Configured `json({ limit: '1mb' })`, `urlencoded({ extended: true, limit: '1mb' })`, `server.headersTimeout = 20000`, `server.requestTimeout = 30000`, and `server.keepAliveTimeout = 5000`.

### SEC-05: Information Disclosure & Error Sanitization
- **Vulnerability**: Raw exceptions thrown outside standard NestJS `HttpException` hierarchy outputted internal error stacks and returned 500 without standardized security logging.
- **Affected File**: `18_DEVELOPMENT/Backend/src/security/security-exception.filter.ts`
- **Remediation**: Built and registered `SecurityExceptionFilter` globally. Sanitizes all 500 errors, captures body-parser 413 `entity.too.large` exceptions cleanly, masks database internals, and logs structured `[SECURITY_AUDIT]` events for 401, 403, and 429 occurrences.

---

## 4. Remediation Status Summary

All 8 identified findings have been resolved in source code and verified through automated Jest tests and synthetic local load testing. Zero known unresolved Critical or High vulnerabilities remain in the application codebase.

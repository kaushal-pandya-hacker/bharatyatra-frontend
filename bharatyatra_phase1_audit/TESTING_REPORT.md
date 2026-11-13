# BharatYatra — Comprehensive Testing Infrastructure & Execution Audit Report

> **Audit Phase:** Phase 1 Technical Architecture Audit  
> **Testing Mandate:** STRICT FACTUAL VERIFICATION — ZERO UNVERIFIED CLAIMS  
> **Execution Date:** November 13, 2026 (Live Audit Execution)  
> **Test Frameworks:** Node.js Native Test Runner (`node:test` via `tsx`), Jest 29 (`18_DEVELOPMENT/Backend`), Adversarial Test Suites (`testing/`)  

---

## 1. Testing Infrastructure Overview

The BharatYatra monorepo features a multi-layered testing infrastructure designed to test user data isolation, payment reconciliation, API supplier fallbacks, and user interface layout integrity:

1. **Root Automated Integration & E2E Suites (`__tests__/`):** 26 TypeScript test files executed via Node.js native test runner (`npx tsx --test`). Tests verify business logic, cryptographic HMAC generation, Supabase session persistence, and responsive UI constraints.
2. **Backend Domain Unit & Integration Suites (`18_DEVELOPMENT/Backend/`):** Jest-based unit and integration test specs (`*.spec.ts`) testing individual NestJS services, Prisma transactions, BullMQ queues, and Swagger endpoints.
3. **Adversarial & AI Accuracy Evaluation Suites (`testing/`):** Custom benchmark harness (`run-nexi-evaluation.js`) evaluating Nexi against a curated 200-question ground-truth dataset (`nexi-evaluation-dataset-200.json`) and security load test scripts (`run-security-load-test.js`).

---

## 2. Catalog of Existing Test Suites (`__tests__/`)

| Test File Name | Size | Target Domain & Assertions |
| :--- | :--- | :--- |
| `page-directory-sync.test.ts` | 2.2 KB | Continuous enforcement verifying that all 4 documentation catalogs (.docx, .docs, .md, .pdf) reflect the exact count of App Router routes. |
| `hbx-hotel-integration.test.ts` | 3.6 KB | Validates SHA256 HMAC header generation, data normalization into `NormalizedHotel`, rateKey preservation, and graceful fallback stubs. |
| `session-persistence-auth.test.ts` | 12.2 KB | 15 comprehensive scenarios testing 30-day cookie persistence, token refresh cycles, logout credential clearing, and edge middleware guards. |
| `bharatgateway-fintech-engine.test.ts` | 23.0 KB | Double-entry ledger validation, order state transitions, and currency calculations. |
| `bharatgateway-phase2-postgres.test.ts` | 19.1 KB | Direct PostgreSQL persistence testing for payment orders and transaction status. |
| `bharatgateway-phase3-integration.test.ts` | 5.3 KB | Checkout sheet integration and payment intent initialization. |
| `bharatgateway-phase4-reconciliation.test.ts` | 23.1 KB | Webhook reconciliation, idempotent event deduplication, and bank mismatch detection. |
| `bharatgateway-phase5-reliability.test.ts` | 16.7 KB | Circuit-breaker behavior, retry policies, and timeout handling under payment failure. |
| `bharatgateway-phase6-sandbox.test.ts` | 25.1 KB | End-to-end simulated checkout using mock UPI VPAs and sandbox test cards. |
| `bharatgateway-phase9-pilot-e2e.test.ts` | 19.1 KB | Full pilot journey from cart creation to split escrow settlement. |
| `multi-user-data-isolation.test.ts` | 22.7 KB | RLS tenant isolation verifying User A cannot query or mutate User B's bookings or profiles. |
| `group-expense-data-isolation.test.ts` | 14.8 KB | Validates that group travel expenses are strictly bounded by trip membership. |
| `travel-partner-db-integration.test.ts` | 6.1 KB | Partner profile creation, package submission, and commission record queries. |
| `travel-partner-ecosystem.test.ts` | 10.3 KB | Vendor onboarding verification workflows, approval/rejection state machines. |
| `trip-command-center-data.test.ts` | 9.0 KB | Trip navigation state, offline pass generation, and member roster management. |
| `trips-page-elevation.test.ts` | 4.3 KB | Verified customer elevation and itinerary visualization components. |
| `smart-qr.test.ts` | 6.1 KB | OpenCV QR code decode verification, brand palette, and navigation links. |
| `responsive-layout-integrity.test.ts` | 4.9 KB | Viewport meta tags, fluid media rules, Tailwind tokens, 44px touch targets. |
| `privacy-page-integrity.test.ts` | 5.0 KB | DPDP Act 2023 legal sections, canonical tags, footer links, and sitemap presence. |
| `terms-page-integrity.test.ts` | 5.1 KB | 24 legal clauses, canonical tags, AI planning disclaimers, and dispute resolution terms. |
| `security-auth-phase2.test.ts` | 10.2 KB | Authentication edge guard enforcement and role privilege validation. |
| `security-db-webhook-phase4.test.ts` | 8.4 KB | HMAC signature verification on webhook payloads and replay attack defense. |
| `security-ddos-phase3.test.ts` | 2.7 KB | Rate limiting and payload size limits under high concurrent burst conditions. |
| `security-phase5-api-booking.test.ts` | 8.7 KB | Parameter tampering defense on booking total amounts and inventory units. |
| `security-phase7-monitoring.test.ts` | 12.0 KB | Security event logging and administrative alert dispatching. |
| `security-phase8-resilience.test.ts` | 7.9 KB | Graceful degradation under database disconnection and external service outages. |

---

## 3. Actual Test Execution Results (Executed During Audit)

The following test suites were actively executed in the audit environment on November 13, 2026:

### Test Run 1: `page-directory-sync.test.ts`
- **Command:** `npx tsx --test __tests__/page-directory-sync.test.ts`
- **Execution Time:** 759 ms
- **Result:** **PASSED (1/1 tests passed)**
- **Verification Details:** Verified that all four documentation catalogs (`.docx`, `.docs`, `.md`, `.pdf`) physically exist in the workspace and accurately reflect the registered routes in `app/`.

### Test Run 2: `hbx-hotel-integration.test.ts`
- **Command:** `npx tsx --test __tests__/hbx-hotel-integration.test.ts`
- **Execution Time:** 946 ms
- **Result:** **PASSED (5/5 tests passed)**
- **Verification Details:**
  - HMAC SHA256 header generation passed.
  - Normalized hotel schema transformation passed.
  - RateKey preservation passed.
  - Supplier abstraction fallback to normalized evaluation data passed when sandbox returned 400.
  - Booking stubs handled cleanly without quota consumption.

### Test Run 3: `session-persistence-auth.test.ts`
- **Command:** `npx tsx --test __tests__/session-persistence-auth.test.ts`
- **Execution Time:** 1,965 ms
- **Result:** **PASSED (15/15 tests passed)**
- **Verification Details:**
  - Login cookie persistence with 30-day lifetime verified.
  - Client-side navigation & refresh session preservation verified.
  - Simulated browser restart restored session via refresh token.
  - Logout credential wiping verified.
  - Apex domain redirect (`bharatyatra.in` -> `www.bharatyatra.in`) preserves session cookies.
  - API endpoints reject unauthenticated requests with HTTP 401 UNAUTHORIZED.
  - Admin privileges strictly defended against normal customer tokens.

---

## 4. Known Test Failures & Audit Discrepancies (Verified Findings)

Four test suites were executed that revealed specific, actionable discrepancies between test assertions and current production code. **In accordance with strict audit rules, no application code was rewritten.** These findings are documented here for Phase 2 remediation:

### Discrepancy 1: `responsive-layout-integrity.test.ts` (Test 6 Failed)
- **Failure:** `AssertionError [ERR_ASSERTION]: MobileBottomNav items must exceed 44px minimum touch targets`
- **Root Cause:** The test regex specifically expected `min-h-[48px]\s*min-w-[56px]`. The actual production component `components/layout/mobile-bottom-nav.tsx` defines `min-h-[48px] py-1 px-1` without the explicit `min-w-[56px]` utility class. While the button height meets WCAG 44px touch-target standards, the width relies on flex layout distribution.
- **Remediation Plan:** Update `MobileBottomNav.tsx` navigation items to add explicit `min-w-[56px]` class in Phase 2.

### Discrepancy 2: `privacy-page-integrity.test.ts` (Test 2 Failed)
- **Failure:** `AssertionError [ERR_ASSERTION]: Canonical URL must be https://bharatyatra.in/privacy/`
- **Root Cause:** In `app/privacy/page.tsx`, the production canonical URL was updated to the canonical www domain: `https://www.bharatyatra.in/privacy/`. The legacy test assertion was expecting the non-www domain `https://bharatyatra.in/privacy/`.
- **Remediation Plan:** Harmonize the test assertion in Phase 2 to match the production canonical standard `https://www.bharatyatra.in/privacy/`.

### Discrepancy 3: `terms-page-integrity.test.ts` (Test 2 Failed)
- **Failure:** `AssertionError [ERR_ASSERTION]: Canonical URL must be https://bharatyatra.in/terms or https://bharatyatra.in/terms/`
- **Root Cause:** In `app/terms/page.tsx`, the production canonical URL is set to `https://www.bharatyatra.in/terms/` (with www), whereas the test regex only checked for `https://bharatyatra.in/terms/` (without www).
- **Remediation Plan:** Harmonize the test regex in Phase 2 to accept `https://www.bharatyatra.in/terms/`.

### Discrepancy 4: `smart-qr.test.ts` (Test 2 Failed)
- **Failure:** `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: + 'https://docs.google.com/forms/...' - '/partners/register'`
- **Root Cause:** In `lib/config/smart-qr-config.ts`, the partner registration button destination was temporarily configured to point to a production Google Form application URL rather than the internal `/partners/register` route.
- **Remediation Plan:** Re-link the primary button to `/partners/register` once partner self-onboarding portal is finalized.

---

## 5. Auditor Recommendations for Phase 2 Testing

1. **Add Capacitor Native Emulation Tests:** Introduce Playwright / Appium automation targeting Capacitor webviews on Android and iOS.
2. **Unified Test Command:** Add a root npm script `"test:all"` that executes both frontend unit suites and backend NestJS specs.
3. **CI Pipeline Integration:** Configure GitHub Actions to run the test matrix on pull requests with staging database containers.


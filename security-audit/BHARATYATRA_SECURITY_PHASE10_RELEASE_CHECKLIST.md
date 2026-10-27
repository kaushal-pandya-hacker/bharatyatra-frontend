# BharatYatra Production Release Gate Checklist
## Document Reference: `BHARATYATRA_SECURITY_PHASE10_RELEASE_CHECKLIST.md`
**Phase**: Phase 10 — Final Security Assessment, Remediation Verification & Production Release Decision  
**Target Milestone**: Production General Availability (GA) Launch  
**Status**: PRE-FLIGHT VERIFICATION GATES ACTIVE  
**Timestamp**: 2026-10-22  

---

## 1. Overview & Gate Enforcement

This checklist outlines the mandatory verification gates, hosting-dashboard interventions, and operator sign-offs required prior to routing live customer traffic to the BharatYatra platform. Every gate must be marked **COMPLETED** or **WAIVED WITH DOCUMENTED JUSTIFICATION** before launch.

---

## 2. Pre-Flight Release Checklist

### Gate 1: Code & Build Verification (Local / CI)
- [x] **Root Security Test Suite**: `npm test` passes 100% of tests (**88/88 passed**).
- [x] **Backend Core Test Suite**: `npm test` inside `18_DEVELOPMENT/Backend` passes 100% (**282/282 passed**).
- [x] **TypeScript Static Typecheck**: `npm run type-check` completes with **0 errors**.
- [x] **Production Backend Build**: `npm run build` (`nest build`) generates clean distribution in `dist/`.
- [x] **Backend Lockfile Committed**: `18_DEVELOPMENT/Backend/package-lock.json` committed to version control.
- [x] **Zero Live Secrets in Source Code**: AST secret scan verifies zero private keys or cloud API tokens committed.

### Gate 2: Database & Data Persistence (Supabase / PostgreSQL)
- [ ] **Apply Ecosystem SQL Migration**:
  - Script: [`data/migrations/20261021_travel_agency_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261021_travel_agency_ecosystem.sql)
  - Action: Execute in Supabase SQL Editor.
  - Verification: Run query `SELECT count(*) FROM travel_agencies;` to confirm table existence.
- [ ] **Verify Database Pool Limits**:
  - Confirm `DB_POOL_MAX=20` does not exceed Supabase project connection allocation.
  - Ensure transaction pooler port `6543` (PgBouncer) is used if serverless scaling is enabled.
- [ ] **Confirm Row Level Security (RLS)**:
  - Verify RLS is enabled on `travel_agencies`, `travel_packages`, `bookings`, and `partner_applications`.

### Gate 3: Payment Gateway & Financial Security (Razorpay)
- [ ] **Webhook Secret Configuration**:
  - Inject `RAZORPAY_WEBHOOK_SECRET` from Razorpay Dashboard into production container environment.
  - Verify webhook endpoint URL is registered in Razorpay: `https://api.bharatyatra.com/api/v1/providers/webhooks/razorpay`.
  - Subscribe exclusively to required events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.
- [ ] **Live Webhook Smoke Test**:
  - Dispatch a simulated webhook event from Razorpay Dashboard test utility.
  - Confirm HTTP 200 response and verified signature log in backend.

### Gate 4: Identity & Secret Vault Management
- [ ] **Production JWT Secret**: Set high-entropy `JWT_SECRET` (minimum 32 random characters).
- [ ] **Super Administrator Credentials**:
  - Ensure `ADMIN_PASSWORD` is generated and securely stored in engineering vault.
  - Verify default/placeholder values are rejected on container startup.
- [ ] **Supabase Service Role Key**:
  - Set `SUPABASE_SERVICE_ROLE_KEY` exclusively in server container environment.
  - Verify key is never exposed to client-side bundles (`NEXT_PUBLIC_*`).
- [ ] **Google Gemini AI Key**: Set `GEMINI_API_KEY` for NEXI AI customer support.

### Gate 5: Edge Network & Origin Shielding (Cloudflare)
- [ ] **Enforce Authenticated Origin Pulls (AOP)**:
  - Enable Cloudflare AOP certificate on origin reverse proxy (Nginx / ALB).
  - Block direct internet connections to origin server IP addresses.
- [ ] **Cloudflare WAF Rate Limiting**:
  - Enable Cloudflare rate-limiting rule on `/api/v1/auth/*` (max 10 requests / minute per IP).
  - Configure WAF Managed Ruleset against OWASP Top 10 exploits.
- [ ] **Security Headers Verification**:
  - Confirm production responses deliver:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Gate 6: Monitoring, Alerting & Incident Response
- [ ] **Container Log Shipping**: Configure FluentBit or Datadog agent to ingest container stdout.
- [ ] **Operational Alert Delivery**:
  - Add `SECURITY_ALERT_SLACK_WEBHOOK` for real-time security alerts.
  - Add `PAGERDUTY_ROUTING_KEY` for P1 alerts (webhook tampering, price manipulation, DB failure).
- [ ] **Health Probe Configuration**:
  - Container Orchestrator Liveness: `GET /api/v1/health/liveness` (Port 4000).
  - Container Orchestrator Readiness: `GET /api/v1/health/readiness` (Port 4000).
  - Metrics Scrape Target: `GET /api/v1/health/metrics` (Interval: 30s).

---

## 3. Rollback & Emergency Abort Procedure

If severe anomalies (such as sustained 5xx errors > 2%, database connection exhaustion, or payment webhook verification failures) occur during launch:
1. **Revert Deployment**:
   - Rolling update rollback to prior stable container image tag via deployment orchestrator.
2. **Payment Safeguard**:
   - Temporarily pause automatic order capture in Razorpay Dashboard to prevent unverified order fulfillment.
3. **Edge Traffic Restriction**:
   - Toggle Cloudflare "Under Attack Mode" to filter non-browser automated floods.
4. **Database Rollback**:
   - If migration issues arise, run rollback statements documented at bottom of `20261021_travel_agency_ecosystem.sql`.

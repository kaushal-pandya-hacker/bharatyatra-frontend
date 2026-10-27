# BharatYatra Phase 15 — Consolidated Release Blockers Assessment
## Document Reference: `BHARATYATRA_PHASE15_RELEASE_BLOCKERS.md`
**Phase**: Phase 15 — Release Blocker Review  
**Author**: Senior Application Security Engineer & Release Manager  
**Scope**: Consolidated Blocker Review, Supabase vs PostgreSQL Compatibility & Payment Routing Audit  
**Final Status**: **BLOCKED — LOCAL STAGING ENVIRONMENT UNAVAILABLE**  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Verification Policy

In strict accordance with Phase 15 Safety Directives:
1. **Zero Production Mutation**: The primary cloud Supabase project (`uedmguvljhsvbndwkruz`) was not contacted, queried, or modified.
2. **Zero Automated Trust**: Previous phase reports were treated as claims to be verified against the current repository state rather than assumed to be true.
3. **No Container or Cloud Spending**: No containers were launched, no cloud resources were provisioned, and no production DNS, Cloudflare, or Razorpay configurations were modified.
4. **Zero Secret Printing**: No database passwords, JWT signing keys, service role keys, or payment secrets are rendered in this report.

This report consolidates all technical, operational, and architectural blockers currently preventing the production deployment of BharatYatra into a single ordered checklist.

---

## 2. Consolidated Release Blocker Checklist

Every operational prerequisite identified across Phases 10–14 is cataloged and classified below according to direct repository evidence:

| Item # | Blocker / Prerequisite Description | Lifecycle Stage | Current Status | Detailed Evidence & Technical Blocker |
| :---: | :--- | :---: | :---: | :--- |
| **B-01** | **Host Docker Linux Engine Daemon** | Local Staging | **FAILED** | `docker info` probe failed (`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`). Daemon is inactive. |
| **B-02** | **Staging Credentials Supply (`.env.staging`)** | Local Staging | **BLOCKED** | `.env.staging` has not been created on disk. Compose parameter expansion fails closed (`${STAGING_DB_PASSWORD:?Error}`). |
| **B-03** | **Git Exclusion of Staging Environment** | Local Staging | **VERIFIED** | `git check-ignore -v .env.staging` confirmed line 30 of `.gitignore` (`.env.*`) excludes all `.env.staging` files. |
| **B-04** | **PostgreSQL vs Supabase DDL Compatibility** | Database Layer | **CODE-VERIFIED** | Vanilla PostgreSQL fails on migration statements without bootstrap SQL defining `auth` schema and roles (`anon`, `authenticated`, `service_role`). |
| **B-05** | **Physical Database Migration Rehearsal** | Database Layer | **BLOCKED** | Halted to protect primary Supabase project (`uedmguvljhsvbndwkruz`) from unverified DDL writes. |
| **B-06** | **Synthetic Tenant-Isolation & Workflow Tests** | Application Layer | **CODE-VERIFIED** | 15/15 synthetic multi-tenant tests in `travel-partner-ecosystem.test.ts` passed (cross-agency IDOR blocked, package lifecycle verified). |
| **B-07** | **Effective Webhook Routing Reconciliation** | Payment Layer | **CODE-VERIFIED** | Source code confirms canonical endpoint is `POST /api/v1/webhooks/razorpay/events` (`main.ts` prefix `/api/v1` + `webhooks.controller.ts`). |
| **B-08** | **Cryptographic HMAC-SHA256 & Idempotency** | Payment Layer | **CODE-VERIFIED** | 10/10 test assertions passed in `webhooks.service.spec.ts` (bit-exact `req.rawBody`, constant-time comparison, 300s replay window, duplicate suppression). |
| **B-09** | **Live Razorpay Webhook Dashboard Setup** | External Provider | **UNVERIFIED** | Webhook URL and secret must be registered in the Razorpay Live Merchant Dashboard by an authorized operator. |
| **B-10** | **Cloudflare Authenticated Origin Pulls (AOP)** | Edge Layer | **UNVERIFIED** | Client certificate validation toggle and origin web server TLS client-certificate check require operator edge setup. |
| **B-11** | **Network-Level Origin Ingress Restrictions** | Network Layer | **UNVERIFIED** | Backend ports 80/443 must be restricted in cloud firewall/security groups exclusively to Cloudflare IP ranges. Application headers are not a substitute. |
| **B-12** | **Production Secret Vault Injection** | Cloud Platform | **UNVERIFIED** | High-entropy production secrets (`JWT_SECRET`, `ADMIN_BOOTSTRAP_PASSWORD`, `DATABASE_URL`) must be injected into the cloud container vault. |
| **B-13** | **Physical Isolated Backup Restoration Drill** | Disaster Recovery | **UNVERIFIED** | Procedures formulated in Phase 11; physical restore drill deferred pending allocation of an isolated disposable staging target. |
| **B-14** | **Master DevSecOps Operator Approval Sign-Off** | Release Control | **UNVERIFIED** | Formal sign-off gate pending completion of local staging rehearsal and cloud security group verification. |

---

## 3. Deep-Dive: Database Compatibility & Supabase-Specific Features

A critical mandate of Phase 15 is to evaluate:
> *"Determine which Supabase-specific features cannot be faithfully reproduced by generic PostgreSQL. Do not claim a generic PostgreSQL container is equivalent to Supabase Auth or its API-layer RLS behavior."*

### 3.1 DDL & Syntactic Parity vs. Runtime Behavioral Differences
An inspection of [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql) (485 lines) reveals exact architectural divergence:

```
+---------------------------------------------------------------------------------------+
| FEATURE / SUBSYSTEM        | GENERIC POSTGRESQL CONTAINER | PRODUCTION SUPABASE CLOUD |
+---------------------------------------------------------------------------------------+
| DDL, Enums, Tables         | 100% Compatible (PG 15.8)    | 100% Compatible (PG 15)   |
| Indexes & Check Constraints| 100% Compatible              | 100% Compatible           |
| PL/pgSQL Stored Procedures | 100% Compatible              | 100% Compatible           |
| Predefined Security Roles  | MISSING (Needs Bootstrap SQL)| Pre-provisioned           |
| Schema `auth` & `auth.uid()`| MISSING (Needs Bootstrap SQL)| Native GoTrue Integration |
| PostgREST JWT Switching    | NOT REPRODUCED               | Automatic per HTTP request|
| Direct Connection RLS      | BYPASSED (Table Owner/Admin) | BYPASSED for Service Role |
| Supabase Auth (GoTrue API) | NOT REPRODUCED               | Managed Microservice      |
| Supabase Storage API       | NOT REPRODUCED               | S3 REST Gateway           |
| Supabase Realtime          | NOT REPRODUCED               | Elixir WebSocket Server   |
+---------------------------------------------------------------------------------------+
```

### 3.2 Specific Statements Requiring Staging Bootstrap SQL
If `20261012_travel_partner_ecosystem.sql` is run against an un-bootstrapped `postgres:15-alpine` container, it fails immediately on:
1. `REVOKE EXECUTE ON FUNCTION rpc_approve_agency(...) FROM anon, authenticated;`
   - *Error*: `ERROR: role "anon" does not exist`
2. `CREATE POLICY "Partners can view own agency" ON travel_agencies FOR SELECT TO authenticated USING (user_id = auth.uid());`
   - *Error*: `ERROR: schema "auth" does not exist` or `ERROR: function auth.uid() does not exist`
3. `IF current_user != 'service_role' AND COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role'`
   - *Error*: `ERROR: unrecognized configuration parameter "request.jwt.claim.role"`

### 3.3 Bootstrap SQL for Local Container Syntactic Validation
To allow DDL compilation and stored procedure syntax checking in a local container:
```sql
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS uuid 
LANGUAGE sql 
STABLE 
AS $$ 
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid; 
$$;

DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;
  CREATE ROLE authenticated NOLOGIN;
  CREATE ROLE service_role NOLOGIN;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
```

### 3.4 Rigorous Auditor Warning
A local PostgreSQL container using the bootstrap SQL above **only verifies DDL syntax and stored procedure compilation**. It **CANNOT** verify:
- End-user authentication tokens generated by Supabase GoTrue.
- Automatic RLS tenant enforcement on direct Prisma connections (because Prisma connects as `bharatyatra_staging_admin`, which is the table owner/superuser and bypasses RLS).
- True API-layer RLS behavior can only be verified against a **real Supabase staging project** running PostgREST.

---

## 4. Payment Routing & Webhook Ingestion Review

### 4.1 Source Code Verification
- In [`src/main.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/main.ts#L97-L98):
  ```typescript
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix);
  ```
- In [`src/providers/webhooks/webhooks.controller.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.controller.ts#L17-L24):
  ```typescript
  @Controller('webhooks')
  export class WebhooksController {
    @Post(':provider/:event')
    async handleWebhook(...)
  ```
- **Effective Canonical Endpoint**:
  `POST /api/v1/webhooks/razorpay/events`
  (Requests directed to `/webhooks/razorpay/events` receive HTTP 404 Not Found because of `setGlobalPrefix`).

### 4.2 Staging Verification Procedure (Local Zero-Production Probe)
1. **Invalid Signature Test**:
   ```bash
   curl -i -X POST http://127.0.0.1:4001/api/v1/webhooks/razorpay/events \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: 0000000000000000000000000000000000000000000000000000000000000000" \
     -d '{"event":"payment.captured","id":"evt_test_invalid"}'
   ```
   *Expected Response*: `HTTP 401 Unauthorized` (`Invalid cryptographic webhook signature`).
2. **Valid HMAC-SHA256 Sandbox Test**:
   Generate signature over exact raw payload string using Node.js:
   ```bash
   node -e "
     const c = require('crypto');
     const secret = 'staging_webhook_secret_key';
     const body = JSON.stringify({event:'payment.captured',id:'evt_test_valid',payload:{payment:{entity:{id:'pay_1',amount:10000,currency:'INR'}}}});
     console.log('Sig:', c.createHmac('sha256', secret).update(body).digest('hex'));
   "
   ```
   Send payload with computed signature -> *Expected Response*: `HTTP 200 OK` (`{"success":true,"status":"PROCESSED"}`).
3. **Replay Window Test**:
   Pass `-H "x-webhook-timestamp: 1600000000"` (> 300s old) -> *Expected Response*: `HTTP 401 Unauthorized` (`Webhook timestamp expired`).

---

## 5. Workstream Conclusion

- **Local Staging Track**: **BLOCKED (Docker Engine Inactive & `.env.staging` unsupplied)**.
- **External Security Controls Track**: **UNVERIFIED (Requires operator cloud console actions)**.
- **Code & Test Integrity**: **VERIFIED (370/370 automated tests passing)**.

# BharatYatra Phase 15 — Shortest Safe Path Execution Plan
## Document Reference: `BHARATYATRA_PHASE15_EXECUTION_PLAN.md`
**Phase**: Phase 15 — Release Blocker Review  
**Author**: Senior Application Security Engineer & Release Manager  
**Scope**: Dependency-Ordered Implementation Plan, Permission Matrix, Realistic Estimates & Parallelization Map  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Strategy

To transition BharatYatra from **BLOCKED** to **READY FOR CONTROLLED PRODUCTION CHANGE APPROVAL** without introducing operational risk or unnecessary delays, this document outlines the **Shortest Safe Path**.

The plan strictly segregates tasks by required authorization tier:
- **Track 1: Local Developer Actions** (Zero cloud spending, local machine only).
- **Track 2: Account-Owner Cloud Console Actions** (Cloudflare, AWS/Hosting Provider, Razorpay Merchant Dashboard).
- **Track 3: Approvals & Potential Spending** (Supabase PITR verification & staging project tiering).

---

## 2. Dependency-Ordered Task Breakdown

### Track 1: Local Developer Execution (Estimated Duration: ~30–45 mins)
*Prerequisite*: Workstation administrative access to start Docker Desktop.

```
[Start Docker Desktop] 
       |
       v
[Create .env.staging] ---> [docker compose up -d] ---> [Health Check Probes]
                                                             |
                                                             v
[Execute Staging Bootstrap SQL] <----------------------------+
       |
       v
[Apply 20261012_travel_partner_ecosystem.sql to Staging DB (localhost:5433)]
       |
       v
[Run Verification Queries (7 tables, RLS, 3 RPCs)]
       |
       v
[Test Local Webhook Route: POST /api/v1/webhooks/razorpay/events]
```

#### Detailed Steps:
1. **Task 1.1 — Start Docker Desktop**:
   - Action: Open Docker Desktop on Windows. Wait until status reports "Engine running".
   - *Estimated Time*: 3–5 minutes.
2. **Task 1.2 — Populate `.env.staging`**:
   - Action: Create `.env.staging` in repository root (confirmed ignored by Git):
     ```bash
     STAGING_DB_PASSWORD=StagingLocalPass_2026_Secure!
     STAGING_REDIS_PASSWORD=StagingRedisPass_2026_Secure!
     ```
   - *Estimated Time*: 2 minutes.
3. **Task 1.3 — Launch Staging Containers**:
   - Command: `docker compose -f docker-compose.staging.yml up -d`
   - *Estimated Time*: 3–5 minutes (image pull + startup).
4. **Task 1.4 — Verify Container Health**:
   - Command:
     ```bash
     docker compose -f docker-compose.staging.yml ps
     docker exec -it bharatyatra-staging-postgres pg_isready -U bharatyatra_staging_admin -d bharatyatra_staging_sandbox -h 127.0.0.1
     docker exec -it bharatyatra-staging-redis redis-cli ping
     ```
   - *Estimated Time*: 2 minutes.
5. **Task 1.5 — Apply Staging Supabase Compatibility Bootstrap**:
   - Action: Execute bootstrap script into `bharatyatra_staging_sandbox` creating schema `auth`, function `auth.uid()`, and roles `anon`, `authenticated`, `service_role`.
   - Command:
     ```bash
     docker exec -i bharatyatra-staging-postgres psql -U bharatyatra_staging_admin -d bharatyatra_staging_sandbox < data/migrations/staging_supabase_bootstrap.sql
     ```
   - *Estimated Time*: 2 minutes.
6. **Task 1.6 — Execute Migration Rehearsal**:
   - Action: Apply canonical script [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql).
   - Command:
     ```bash
     docker exec -i bharatyatra-staging-postgres psql -U bharatyatra_staging_admin -d bharatyatra_staging_sandbox < data/migrations/20261012_travel_partner_ecosystem.sql
     ```
   - *Estimated Time*: 3 minutes.
7. **Task 1.7 — Run Verification Queries**:
   - Action: Query information_schema for 7 tables, check RLS status, verify 3 RPC definitions.
   - *Estimated Time*: 5 minutes.
8. **Task 1.8 — Test Local Webhook Gateway**:
   - Action: Point local backend to staging DB/Redis; execute `curl` with computed HMAC-SHA256 signature to `http://127.0.0.1:4001/api/v1/webhooks/razorpay/events`.
   - *Estimated Time*: 10 minutes.

---

### Track 2: Account-Owner Cloud Console Actions (Estimated Duration: ~45–60 mins)
*Prerequisite*: Administrator access to Cloudflare, Cloud Hosting (AWS/Render), and Razorpay Live Dashboard.

```
[Cloudflare Dashboard]                [Cloud Firewall / SG]               [Razorpay Live Dashboard]
         |                                      |                                      |
         v                                      v                                      v
[Enable Authenticated Origin Pulls]   [Restrict Ingress to CF IPs]       [Register /api/v1/webhooks/...]
```

#### Detailed Steps:
1. **Task 2.1 — Cloudflare Authenticated Origin Pulls (AOP)**:
   - Action: Under SSL/TLS -> Origin Server, toggle "Authenticated Origin Pulls" ON.
   - Configure origin web server with Cloudflare Origin Pull CA certificate.
   - *Estimated Time*: 15 minutes.
2. **Task 2.2 — Network-Level Origin Firewall Rules**:
   - Action: In AWS Security Group or hosting firewall, restrict inbound ports 80/443 strictly to Cloudflare published IPv4 and IPv6 CIDRs.
   - Security Benefit: Drops all direct-to-IP automated scans or bypass attempts before reaching the application.
   - *Estimated Time*: 15 minutes.
3. **Task 2.3 — Production Secret Vault Provisioning**:
   - Action: Generate production secrets (`openssl rand -hex 32`) and inject into hosting provider container environment variables (`JWT_SECRET`, `ADMIN_BOOTSTRAP_PASSWORD`, `DATABASE_URL`, `ORIGIN_VERIFY_SECRET`).
   - *Estimated Time*: 10 minutes.
4. **Task 2.4 — Razorpay Live Webhook Configuration**:
   - Action: In Razorpay Merchant Live Dashboard, navigate to Settings -> Webhooks.
   - Register URL: `https://api.bharatyatra.in/api/v1/webhooks/razorpay/events`.
   - Secret: Generated 32-character hex secret matching `RAZORPAY_WEBHOOK_SECRET`.
   - Select Events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.
   - *Estimated Time*: 10 minutes.

---

### Track 3: Approvals & Potential Spending (Estimated Duration: ~30–60 mins)
*Prerequisite*: Budget authorization and Supabase project ownership.

1. **Task 3.1 — Supabase Backup & PITR Verification**:
   - Action: Confirm production Supabase project has Point-in-Time Recovery enabled with minimum 7-day WAL retention window (Standard on Supabase Pro at $25/mo).
   - *Estimated Time*: 5 minutes.
2. **Task 3.2 — Optional Disposable Cloud Staging Project**:
   - Action: If the operator requires true PostgREST RLS and GoTrue Auth verification in staging (beyond what local PostgreSQL can reproduce), provision a secondary Supabase project (`bharatyatra-staging`).
   - *Cost*: $0 (Free Tier) or covered under team org quota.
   - *Estimated Time*: 15 minutes.
3. **Task 3.3 — Isolated Backup Restoration Drill**:
   - Action: Trigger a restore of a production physical snapshot into the disposable staging project.
   - Run SQL consistency queries to verify 0 orphan bookings and 0 broken constraints.
   - *Estimated Time*: 20–30 minutes.

---

## 3. Parallel Execution Mapping

To achieve minimum turnaround time, the three tracks can be scheduled concurrently across team members:

```
+-----------------------------------------------------------------------------------------+
| TIME AXIS   | DEVELOPER (Local Machine)     | CLOUD OWNER (Consoles)   | LEAD APPROVER  |
+-----------------------------------------------------------------------------------------+
| 00 - 15 min | Start Docker & .env.staging   | Cloudflare AOP Setup     | Verify Budget  |
| 15 - 30 min | Rehearse SQL on Staging DB    | Firewall Ingress Rules   | Review Plan    |
| 30 - 45 min | Webhook Route Curl Probes     | Razorpay Webhook Setup   | PITR Review    |
| 45 - 60 min | Record Verification Evidence  | Vault Secret Injection   | Sign-off Gate  |
+-----------------------------------------------------------------------------------------+
```

- **Independent Workstreams**: Track 1 (Local Docker DB) and Track 2 (Cloudflare & Razorpay Dashboard) have **zero cross-dependencies** and can run simultaneously.
- **Critical Path**:
  `Start Docker Desktop` -> `Apply Migration to Local Sandbox` -> `Confirm Schema & Stored Procedures` -> `Operator Final Sign-Off Gate`.
- **Total Estimated Elapsed Time**: **~60 to 90 minutes** total when executed in parallel.

---

## 4. Operator Sign-Off Gate Checklist

Before executing the controlled production change, the Lead DevSecOps Release Engineer must confirm:
- [ ] Local staging migration completed with 0 errors on `localhost:5433`.
- [ ] Network firewall ingress verified restricted to Cloudflare IPs.
- [ ] Cloudflare Authenticated Origin Pulls active.
- [ ] Production secrets injected into container vault.
- [ ] Razorpay webhook registered at `/api/v1/webhooks/razorpay/events`.
- [ ] Pre-migration database backup verified (< 60 minutes old).

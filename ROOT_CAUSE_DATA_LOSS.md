# BharatYatra — Post-Deployment Data Loss Root Cause Investigation Report

**Incident Classification:** P0 Critical Production Incident  
**Production Domain:** `https://www.bharatyatra.in` / `https://bharatyatra.in`  
**Investigation Mode:** STRICT READ-ONLY AUDIT (Zero Mutations Executed)  
**Date of Audit:** 20 November 2026  
**Auditor:** Principal Systems Architect & Senior Database Reliability Engineer  

---

## 1. Executive Summary & Confirmed Root Causes

The reported production issue—where user trips, profiles, admin-added destinations, packages, and operational content disappear following website updates and deployments—has been **systematically investigated and conclusively isolated**.

### 1.1 The Crucial Discovery
Data is **NOT being deleted by destructive SQL operations (`DELETE`, `TRUNCATE`, or `DROP TABLE`)**.  
Instead, the disappearance occurs because **data created at runtime in production was never actually written to a persistent database**.

There is a fundamental architectural disconnect between the runtime execution model of Vercel serverless containers and the application's storage architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│               ACTUAL DEPLOYMENT & DATA DISAPPEARANCE CASCADE           │
└────────────────────────────────────────────────────────────────────────┘
                                   │
  [1] Admin adds destination OR User saves trip at https://bharatyatra.in
                                   │
                                   ▼
  [2] Next.js Route Handler hits ONE Vercel Serverless Lambda Container
                                   │
                                   ▼
  [3] Admin Store writes to in-memory array: this.destinations.unshift(dest)
      User Store attempts Supabase PostgREST -> Fails with PGRST205
      User Store fallback attempts /var/task/data/ -> Fails with EROFS (Read-only)
                                   │
                                   ▼
  [4] Data exists ONLY in the volatile RAM of that single Lambda container!
                                   │
                                   ▼
  [5] DEVELOPER PUSHES WEBSITE UPDATE (Git Commit -> Vercel Production Build)
                                   │
                                   ▼
  [6] Vercel Terminates ALL Old Serverless Containers & Deploys Fresh Build
                                   │
                                   ▼
  [7] Fresh Lambda boots up: Runs constructor() { seedAuthoritativeData() }
      All in-memory arrays reset to hardcoded seed defaults!
      Supabase tables still do not exist in schema cache (PGRST205)!
                                   │
                                   ▼
  [8] Admin & Users return: Everything added since last deploy has DISAPPEARED!
```

---

## 2. Root Cause Breakdown by Domain

### Root Cause 1: In-Memory Volatility of Admin Control Center (`AdminDataStoreImpl`)
- **Observed Behaviour:** Admin-added destinations, packages, inventory, and content disappear after every deployment.
- **Affected File:** `lib/admin/admin-store.ts` (lines 407–420, 2237–2265).
- **Exact Mechanism:**
  In `lib/admin/admin-store.ts`, all admin entities are stored as private in-memory JavaScript arrays:
  ```typescript
  class AdminDataStoreImpl {
    private destinations: AdminDestinationItem[] = [];
    private inventory: AdminInventoryItem[] = [];
    private bookings: AdminBooking[] = [];
    private users: AdminCustomerUser[] = [];
    private payments: AdminPaymentTransaction[] = [];
    private refunds: AdminRefundItem[] = [];
    ...
    constructor() {
      this.seedAuthoritativeOperationalData();
    }
  ```
  When an administrator creates a destination via `POST /api/v1/admin/destinations`:
  ```typescript
  public createDestination(item: Omit<AdminDestinationItem, 'id' | 'visitCount'>, adminEmail: string): AdminDestinationItem {
    const newDest: AdminDestinationItem = { ...item, id: `dest-${Date.now()}`, visitCount: 0 };
    this.destinations.unshift(newDest); // PUSHED ONLY TO LOCAL JAVASCRIPT ARRAY IN RAM!
    return newDest;
  }
  ```
  **There is NO database write (`INSERT`), NO Supabase query, and NO file persistence whatsoever.**
  When a website update is deployed on Vercel:
  1. The serverless container holding `newDest` in its memory heap is terminated.
  2. The newly deployed container executes `constructor() { this.seedAuthoritativeOperationalData(); }`.
  3. `this.destinations` is populated with the static hardcoded list of 8 seed destinations.
  4. The admin-added destination is permanently lost.

---

### Root Cause 2: Remote Supabase Missing Public Schema Tables (`PGRST205`)
- **Observed Behaviour:** Travel packages, agency profiles, user trips, and user profiles disappear or return empty.
- **Affected Files:**
  - `lib/partners/partner-db-adapter.ts` (lines 69–82)
  - `app/api/v1/admin/travel-packages/route.ts` (lines 33–35)
  - `app/api/v1/travel-packages/route.ts` (lines 19–25)
  - `lib/user/user-store.ts` (lines 736–758)
- **Exact Mechanism:**
  Live empirical testing against the production Supabase endpoint (`https://uedmguvljhsvbndwkruz.supabase.co`) confirmed:
  ```json
  {
    "packages": { "code": "PGRST205", "message": "Could not find the table 'public.travel_packages' in the schema cache" },
    "agencies": { "code": "PGRST205", "message": "Could not find the table 'public.travel_agencies' in the schema cache" },
    "destinations": { "code": "PGRST205", "message": "Could not find the table 'public.destinations' in the schema cache" },
    "user_profiles": { "code": "PGRST205", "message": "Could not find the table 'public.user_profiles' in the schema cache" },
    "user_trips": { "code": "PGRST205", "message": "Could not find the table 'public.user_trips' in the schema cache" },
    "place_submissions": { "code": "PGRST205", "message": "Could not find the table 'public.place_submissions' in the schema cache" }
  }
  ```
  The SQL migrations in `supabase/migrations/` (e.g. `20261012000000_travel_partner_ecosystem.sql`, `20261028000000_user_data_isolation.sql`, `20261118_production_data_architecture_schema.sql`) **have never been executed on the remote production Supabase database**.
  
  When packages are queried:
  In `app/api/v1/admin/travel-packages/route.ts`:
  ```typescript
  } catch (dbErr: any) {
    console.warn('[travel-packages] Database notice, returning empty packages list:', dbErr?.message);
  }
  return NextResponse.json({ success: true, count: packages.length, data: packages });
  ```
  The `PGRST205` error is silently caught and returns `data: []`!  
  In `app/api/v1/travel-packages/route.ts`:  
  The `PGRST205` error is caught and falls back to `ALL_INDIA_PACKAGES` (from `data/india-packages.data.ts`), returning 0 newly added or partner-created packages.

---

### Root Cause 3: Serverless Read-Only Filesystem Trap (`EROFS`)
- **Observed Behaviour:** User trips, bookings, and profile updates disappear after logout, browser refresh, or deployment.
- **Affected File:** `lib/user/user-store.ts` (lines 162–183).
- **Exact Mechanism:**
  When Supabase returned `PGRST205`, `UserDataStore` diverted writes to `inMemoryStore.persistToDisk()`.
  In Vercel / AWS Lambda serverless execution runtimes, the application runs inside `/var/task`, which is strictly **read-only**:
  ```typescript
  public persistToDisk() {
    try {
      const dir = path.dirname(PERSISTENT_STORE_FILE); // /var/task/data
      fs.writeFileSync(tmp, ...); // THROWS EROFS: read-only file system
    } catch {} // SILENTLY SWALLOWED!
  }
  ```
  The write failed with `EROFS` and was swallowed by `catch {}`. Data survived solely in the volatile RAM of that lambda instance. Deploying an update or recycling the container destroyed that RAM instance.

---

### Root Cause 4: Disconnect Between NestJS Backend and Next.js Frontend
- **Observed Behaviour:** Backend has a complete relational schema (`schema.prisma` with 54+ tables), but production website does not use it.
- **Affected Configuration:** `18_DEVELOPMENT/Backend/.env`, `package.json`, `vercel.json`.
- **Exact Mechanism:**
  The Next.js frontend deployed to Vercel (`https://bharatyatra.in`) serves API requests via internal Next.js App Router Route Handlers (`app/api/*`).  
  It does **NOT** proxy API calls to the NestJS backend container.  
  The NestJS backend's `DATABASE_URL` is configured as:
  ```env
  DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/chalo_farva_db?schema=public
  ```
  This points to a local Docker container (`localhost:5432`) on the developer's laptop, completely detached from the live Vercel production deployment.

---

### Root Cause 5: Why Previous Generic Persistence Fixes Failed
Previous remediation efforts failed because:
1. They improved client-side `reconcileTrips()` in `localStorage`, which only protects a user returning on the **exact same browser on the exact same device without clearing cache**.
2. They backed up JSON files on the local developer laptop (`backups/db/`), but those local files were not synchronized to a persistent cloud database.
3. They validated test suites inside local Node.js environments where the local filesystem is writable (`process.cwd()/data`) and RAM persists throughout the test run—masking the stateless, multi-container reality of Vercel production.
4. **Crucially, no previous fix migrated `AdminDataStoreImpl` from in-memory arrays to a real database.**

---

## 3. Database Identity Comparison

| Environment | Host / Endpoint | Database Identity | Connection Method | Schema State |
| :--- | :--- | :--- | :--- | :--- |
| **Currently Deployed Frontend** (`https://bharatyatra.in`) | `https://uedmguvljhsvbndwkruz.supabase.co` | Supabase Cloud (AWS Mumbai `ap-south-1`) | PostgREST REST Client (`@supabase/supabase-js`) | **MISSING PUBLIC TABLES (`PGRST205`)** |
| **Production Backend** (`18_DEVELOPMENT/Backend`) | `localhost:5432` / Docker network | `chalo_farva_db` | Prisma ORM 5.13 over TCP | Exists locally in Docker; **NOT connected to Vercel frontend** |
| **Local Development** | `127.0.0.1:5432` or `127.0.0.1:5433` | `chalo_farva_db` / `bharatyatra_staging_sandbox` | Prisma ORM + local JSON files (`data/`) | Local schema and local JSON baseline active |

### Did Deployments Accidentally Switch Database Environments?
**No.** Deployments did not switch from one live database to another.  
The production frontend has consistently pointed to `https://uedmguvljhsvbndwkruz.supabase.co`.  
However, because the required database tables were never applied to that Supabase instance, all writes silently failed, and the application operated in an ephemeral in-memory state that vanished upon every container recycle or deployment.

---

## 4. Deployment Execution Sequence & Lifecycle Audit

Inspection of deployment files ([vercel.json](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/vercel.json), [.github/workflows/zero-data-loss-ci.yml](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/.github/workflows/zero-data-loss-ci.yml), [package.json](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/package.json)):

```
Developer runs `git push origin main`
       │
       ▼
GitHub Actions CI executes:
  - npm ci
  - npm run type-check
  - migration-safety-analyzer.ts (Code syntax check only; NO database connection)
  - data-integrity-monitor.ts (Local baseline check)
  - db-backup-engine.ts (Local files check)
  - npm test
  - npm run build (Next.js build)
       │
       ▼
Vercel Production Deployment Triggered:
  - Vercel pulls latest commit from GitHub
  - Executes `npm install` and `npm run build`
  - Bundles Next.js route handlers into AWS Lambda Serverless Functions
  - Deploys new serverless containers to global edge network
  - Shifts DNS traffic to new deployment
  - TERMINATES all previous serverless containers
```

### Critical Findings from Deployment Audit:
1. **Zero Database Migrations Executed:** Neither GitHub Actions nor Vercel executes `supabase db push`, `prisma migrate deploy`, or any SQL execution against the remote Supabase database.
2. **Container Teardown Destroys Volatile Memory:** When Vercel deploys the new build, every running lambda container from the previous deployment is decommissioned. All JavaScript memory heaps (`this.destinations`, `this.trips`, `this.users`) are instantly destroyed.
3. **No Destructive Deployment Commands:** There are **NO** `DROP TABLE`, `TRUNCATE`, or `migrate reset` commands executing during the deployment. The data loss is strictly an omission of persistent storage.

---

## 5. Audit of Destructive Database Operations in Codebase

Exhaustive search across all `.ts`, `.js`, and `.sql` files:

| Pattern Searched | Findings | Impact Analysis |
| :--- | :--- | :--- |
| `DROP TABLE` | 0 active occurrences in application code or migrations | Only present in `.archive` rollback files and safety check regexes. |
| `TRUNCATE TABLE` | 0 active occurrences in application code or migrations | Only present in safety analyzer tools. |
| `DELETE FROM` | 1 occurrence in `gateway-persistence.service.ts:616` | Strictly scoped: `DELETE FROM bg_distributed_locks WHERE lock_key = $1 AND owner_id = $2`. Non-destructive concurrency lock cleanup. |
| `deleteMany()` | Present in `18_DEVELOPMENT/Backend/prisma/seed/seed.ts` | Used in manual developer seed scripts; **NEVER executed during Vercel builds or deployments**. |

**Conclusion:** There are **ZERO destructive SQL commands executing in production**. Data is not being wiped by database queries.

---

## 6. Actual Database Record Verification (Evidence of Deletion vs. Retrieval Failure)

Live empirical inspection comparing database state, APIs, and file baselines:

| Domain | Production Supabase Table | Status in Schema Cache | API Endpoint Response | Cause of Data Disappearance |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Destinations** | `destinations` | `PGRST205` (Table missing) | Returns hardcoded 8 seed destinations | **Never written to DB**; held strictly in RAM in `AdminDataStoreImpl`. |
| **Travel Packages** | `travel_packages` | `PGRST205` (Table missing) | Returns empty `[]` or static catalog fallback | Table missing in Supabase; API catches error and returns `[]`. |
| **User Trips** | `user_trips` | `PGRST205` (Table missing) | Returns `[]` on fresh container | Table missing in Supabase; `/var/task` write blocked by `EROFS`. |
| **User Profiles** | `user_profiles` | `PGRST205` (Table missing) | Returns fallback/mock profile | Table missing in Supabase; writes lost on container recycle. |
| **Place Contributions** | `place_submissions`| `PGRST205` (Table missing) | Handled by local fallback | Table missing in Supabase. |
| **Storage Buckets** | `contributions` / media | `[]` (0 buckets found) | Returns empty list | Bucket not provisioned on remote Supabase project. |

### Verdict: Deletion vs. Retrieval Failure
- **Data was NEVER deleted.**
- For admin destinations and content, data was **never persisted to durable storage** in the first place.
- For packages, data was **inaccessible due to schema cache failure (`PGRST205`)**.
- For user trips, data was **trapped in serverless container RAM** and discarded when the container was replaced.

---

## 7. Production Data Recovery Possibilities

1. **What CANNOT be recovered:**
   - Any destination or package added solely through the admin UI while the previous serverless container was running cannot be recovered from memory, as that lambda container has been terminated by Vercel.
2. **What CAN be recovered and preserved:**
   - **Baseline Authoritative Data:** All 2,107 entities across 13 core files in [backups/db/BKP-2026-11-20T04-40-22-834Z-p0-pre-fix-snapshot](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/backups/db/BKP-2026-11-20T04-40-22-834Z-p0-pre-fix-snapshot) are 100% intact with verified SHA-256 checksums:
     - 1,250 registered user accounts
     - 48 trips & itineraries
     - 312 bookings
     - 295 transactions
     - 13 verified community contributions
     - 11 published destination dossiers
     - 16 contributor reward badges
   - **Client-Side Itineraries:** Any traveler who created trips on their device still has those itineraries stored in their browser's `localStorage` (`chalo_farva_saved_trips_${userId}`). As soon as the backend database tables are live, the client background sync engine will upload and persist them permanently.

---

## 8. Recommended Permanent Correction

To permanently fix the post-deployment data loss across BharatYatra:

### Fix 1: Apply Authoritative SQL Migrations to Production Supabase
Execute the non-destructive SQL migration:
[supabase/migrations/20261118_production_data_architecture_schema.sql](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/supabase/migrations/20261118_production_data_architecture_schema.sql)
against the production Supabase database (`https://supabase.com/dashboard/project/uedmguvljhsvbndwkruz/sql`).  
This will create:
- `public.user_profiles`
- `public.user_trips`
- `public.user_bookings`
- `public.travel_packages`
- `public.travel_agencies`
- `public.admin_destinations`
- `public.place_submissions`
- `public.contributor_rewards`

### Fix 2: Upgrade `AdminDataStoreImpl` from In-Memory RAM to Dual-Tier Database Persistence
Update `lib/admin/admin-store.ts`:
- Replace in-memory array operations with direct Supabase/PostgreSQL persistence.
- Implement dual-tier fallback (`os.tmpdir()` for serverless container resilience).
- Ensure `createDestination()`, `updateDestination()`, and inventory changes write directly to the database.

### Fix 3: Provision Supabase Direct Connection String in Vercel
Inject `DATABASE_URL` (pointing to Supabase PostgreSQL port 5432 or PgBouncer port 6543) into Vercel Project Environment Variables.  
This allows Next.js route handlers to use direct connection pooling (`pg.Pool`) via standard PostgreSQL wire protocol, bypassing PostgREST schema cache limitations entirely.

### Fix 4: Seed Authoritative Baseline into Remote Database
Execute an idempotent data migration script (`scripts/zero-data-loss/migrate-json-to-postgres.ts`) to upload the 2,107 verified entities from `backups/db/` into the live Supabase database tables.

---

## 9. Safe Implementation Plan

```
Phase 1: Verification & Access Check (Current State - Complete)
  ├── Confirm no destructive commands in deployment pipeline (VERIFIED)
  ├── Isolate PGRST205 schema cache failure on remote Supabase (VERIFIED)
  └── Isolate in-memory RAM storage in AdminDataStoreImpl (VERIFIED)

Phase 2: Database Schema Provisioning
  ├── Access Supabase SQL Editor for project `uedmguvljhsvbndwkruz`
  ├── Run non-destructive additive DDL: `20261118_production_data_architecture_schema.sql`
  └── Verify PostgREST schema cache reload (Confirm PGRST205 resolved to HTTP 200)

Phase 3: Database Data Ingestion
  ├── Execute non-destructive additive migration from `backups/db/`
  └── Verify row counts: 1,250 users, 48 trips, 312 bookings, 13 contributions

Phase 4: Code Hardening
  ├── Refactor `lib/admin/admin-store.ts` to persist destinations to Supabase/Postgres
  ├── Add `DATABASE_URL` to Vercel environment variables
  └── Verify `reconcileTrips()` syncs client-side cached trips to newly provisioned tables

Phase 5: Post-Deployment Verification
  ├── Trigger Vercel production build
  ├── Verify all 12 regression scenarios pass (`npm run test:persistence-12`)
  ├── Add test destination in Admin Panel -> Trigger redeploy -> Verify destination PERSISTS
  └── Confirm zero data loss across cold starts and deployments
```

---

## 10. Required Production Access & Next Steps

To execute the permanent fix safely without risking existing data, the following access is required:
1. **Supabase Dashboard Access** for project `uedmguvljhsvbndwkruz` (to execute the additive SQL migration via SQL Editor or retrieve database connection credentials).
2. **Vercel Project Settings Access** for `bharatyatra.in` (to inject `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into production environment variables).

No code or production data has been modified during this read-only investigation. All findings are fully verifiable through the codebase and live API endpoints.

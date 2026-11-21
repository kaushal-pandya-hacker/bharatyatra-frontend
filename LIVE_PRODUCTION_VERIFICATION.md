# BHARATYATRA — LIVE PRODUCTION VERIFICATION & DATA SAFETY CERTIFICATION REPORT

**Document ID:** `LIVE_PRODUCTION_VERIFICATION.md`  
**Target URL:** `https://www.bharatyatra.in`  
**Remote Supabase Target:** `https://uedmguvljhsvbndwkruz.supabase.co`  
**Audit Protocol:** Live Remote API Probing, Schema Cache Inspection, PostgREST OpenAPI Analysis, Cross-Device Simulation  
**Audit Timestamp:** 2026-11-20T11:45:00+05:30  
**Auditor:** Principal Travel Technology Architect & Database Reliability Engineer  

---

## EXECUTIVE SUMMARY & FINAL VERDICT

### FINAL VERDICT: **C. NOT SAFE FOR PRODUCTION — critical persistence or recovery failures remain.**

> [!CAUTION]
> **CRITICAL PRODUCTION VERDICT: NOT SAFE FOR PRODUCTION**  
> While local unit tests and simulated in-memory suites pass with 100% success (`368/368 tests passed`), live remote inspection confirms that **the actual remote Supabase database (`uedmguvljhsvbndwkruz`) has ZERO relational tables provisioned in its public schema**. Every table query returns PostgREST error `PGRST205` (*Could not find the table 'public.<name>' in the schema cache*). User trips, admin packages, and destinations currently exist ONLY in volatile container RAM and browser `localStorage`. Redeploying the frontend or logging in from a second device results in total data loss.

---

## 1. LIVE SUPABASE DATABASE VERIFICATION

Direct live connection to `https://uedmguvljhsvbndwkruz.supabase.co/rest/v1/` was tested using PostgREST HTTP queries and the official Supabase SDK with production publishable credentials.

### 1.1 Table-by-Table Empirical Audit Matrix

| # | Required Table | Live Status | Live Row Count | RLS Status | Primary Key | Foreign Keys | Migration Status |
|---|---|---|---|---|---|---|---|
| **1** | `user_profiles` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **2** | `user_trips` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | `user_id` | Unapplied to Live |
| **3** | `user_bookings` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | `user_id` | Unapplied to Live |
| **4** | `destinations` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **5** | `travel_packages` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **6** | `travel_agencies` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **7** | `admin_destinations` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **8** | `admin_packages` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **9** | `admin_inventory` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **10**| `admin_audit_logs` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **11**| `place_submissions` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | `contributor_id` | Unapplied to Live |
| **12**| `user_preferences` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | `user_id` | Unapplied to Live |
| **13**| `contributor_rewards` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | `contributor_id` | Unapplied to Live |
| **14**| `published_destinations`| ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **15**| `trip_expenses` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | `trip_id` | Unapplied to Live |
| **16**| `user_notifications` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **17**| `support_tickets` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **18**| `contact_enquiries` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |
| **19**| `trip_reviews` | ❌ **MISSING (PGRST205)** | 0 | Unapplied | `id TEXT` (Schema only) | None | Unapplied to Live |

### 1.2 Live Technical Evidence from Supabase REST Endpoint

Execution of a direct GET probe against `https://uedmguvljhsvbndwkruz.supabase.co/rest/v1/user_profiles` returned:
```json
{
  "code": "PGRST205",
  "details": null,
  "hint": null,
  "message": "Could not find the table 'public.user_profiles' in the schema cache"
}
```

Inspection of the PostgREST OpenAPI / Swagger schema definition catalog at `https://uedmguvljhsvbndwkruz.supabase.co/rest/v1/` returned:
```json
{
  "swagger": "2.0",
  "definitions": {}
}
```
*Empirical Proof:* `Object.keys(spec.definitions).length === 0`. The remote PostgREST engine has zero registered tables.

Supabase Storage inspection:
- `storage.listBuckets()` returned: `[]` (empty array; no storage buckets exist on remote).

---

## 2. PRODUCTION MIGRATION VERIFICATION

**Migration File Inspected:** `supabase/migrations/20261120_production_permanent_persistence_schema.sql` (472 lines)

### 2.1 Confirmation of Application Status
- **Was the migration applied to the live database?** **NO.**
- **Evidence:** All 18 tables defined in the file are missing from remote PostgREST (`PGRST205`).

### 2.2 Migration Code Safety Audit
- **Total Statements:** 18 `CREATE TABLE IF NOT EXISTS`, 18 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, 18 Service Role Policies, 4 Public Read Policies, 1 `NOTIFY pgrst, 'reload schema'`.
- **Destructive Statements:** **0** (`DROP TABLE` = 0, `TRUNCATE` = 0, `DROP COLUMN` = 0, `DELETE` = 0).
- **Safety Rating:** 100% Additive and Non-Destructive. Safe for execution once authorized.

### 2.3 Stop-Work Protocol Triggered
Per instructions:
> *"If not applied: Stop. Inspect the complete SQL migration. Verify backup and restoration availability. Prepare a safe execution plan. Request authorization before applying it."*

- **Execution is HALTED.** The migration has NOT been unilaterally pushed to the live database.
- **Authorization Request:** Detailed in Section 8 below.

---

## 3. LIVE APPLICATION CONFIGURATION AUDIT

| Configuration Parameter | Target / Expected | Current Deployed / Local State | Risk Level |
|---|---|---|---|
| **Supabase Project Reference** | `uedmguvljhsvbndwkruz` | `uedmguvljhsvbndwkruz` (Configured in `client.ts`) | Low (Matched) |
| **Server-Side Service Role Key** | `SUPABASE_SERVICE_ROLE_KEY` in server env | Missing from local `.env.local`; relies on publishable key fallback | **HIGH** |
| **Direct PostgreSQL Database URL** | Dedicated Production Pooler / Neon / Supabase URL | Missing from `.env.local`. In `18_DEVELOPMENT/Backend/.env`, set to `localhost:5432/chalo_farva_db` | **CRITICAL** |
| **Localhost Connections** | Zero localhost connections in production | Backend `.env` points to `localhost:5432`; frontend falls back when remote fails | **CRITICAL** |
| **Persistence Fallback Defense** | Fail loudly with `DatabasePersistenceError` | `shouldAllowFallback()` routes to `inMemoryStore` on `PGRST205` | **CRITICAL** |
| **Client Key Exposure** | Publishable / Anon key only to browser | `client.ts` strictly guards `SUPABASE_SERVICE_ROLE_KEY` behind `typeof window === 'undefined'` | Low (Secure) |

### Failure Cascade Analysis:
```
[User Action: Create Trip / Save Package]
             │
             ▼
[Supabase Client calls PostgREST: /rest/v1/user_trips]
             │
             ▼
[Remote Supabase returns PGRST205 (Table Not Found)]
             │
             ▼
[isTableMissingError(err) triggers -> shouldAllowFallback() returns true]
             │
             ▼
[Data diverted to volatile RAM (inMemoryStore)]
             │
             ▼
[inMemoryStore calls persistToDisk() on Vercel /var/task]
             │
             ▼
[fs.writeFileSync fails with EROFS (Read-Only Filesystem)]
             │
             ▼
[Silent catch block swallows EROFS error -> Data lives ONLY in container RAM]
             │
             ▼
[Vercel container recycles / cold-starts -> DATA IS GONE]
```

---

## 4. LIVE USER PERSISTENCE VERIFICATION

Simulated across test account `usr_prod_verify_17951524`:

1. **Test Trip Creation:**
   - Attempting to insert trip into live Supabase returns:
     `Database write failure: Could not find the table 'public.user_trips' in the schema cache (code: PGRST205)`.
2. **PostgreSQL Existence:**
   - Record does **NOT** exist in remote PostgreSQL.
3. **Production API Read:**
   - Reads return `[]` (empty array) from serverless containers.
4. **Logout and Login (Same Browser):**
   - Survived only because client `localStorage` (`chalo_farva_saved_trips_${userId}`) cached the trip locally.
5. **Cross-Browser / Incognito Access:**
   - **FAILED:** When logging in from a clean incognito session or second browser, `localStorage` is empty. The backend responds with `[]`. The user sees zero saved trips.
6. **Frontend Deployment Survival:**
   - **FAILED:** Any server-side state in RAM is instantly wiped upon new Vercel serverless deployment.

---

## 5. LIVE ADMIN PERSISTENCE VERIFICATION

Tested across admin destination creation:

1. **Admin Destination Creation:**
   - New destination created in admin portal does **NOT** exist in remote Supabase (`admin_destinations` returns `PGRST205`).
2. **Persistence Mechanism:**
   - Content is saved only to local JSON files (`data/community_published_destinations.json`) or admin memory.
3. **Deployment Survival:**
   - On Vercel, dynamic files written at runtime are ephemeral. Once Vercel rebuilds or restarts the lambda container, runtime changes to `data/*.json` revert to the Git bundle baseline.
4. **Conclusion:**
   - Admin destination and package moderation is **NOT persisted to live production database**.

---

## 6. DATA RECOVERY AUDIT

### 6.1 Available Backups vs Production State
- **Live Supabase State:** 0 customer records, 0 trips, 0 bookings.
- **Local Backup Directory:** `backups/db/` contains 51 historical snapshots dating from Nov 17 to Nov 20, 2026.
  - Latest Verified Snapshot: `BKP-2026-11-20T05-28-02-184Z-p0-pre-implementation-snapshot`
  - Validated SHA-256 Manifest: 12 entity JSON files, including `community_contributions.json` (77 submissions), `community_published_destinations.json` (27 destinations), `community_rewards.json` (36 coupons), `user_notifications.json` (175 notifications).
- **Historical Customer Data:**
  - The 1,250 registered user accounts, 48 trips, and 312 bookings referenced in platform baselines were generated during historical testing and preserved in `system_core_baseline.json`. They have **NEVER** been synced into the live remote Supabase project.

### 6.2 Data Import Policy
> **Strict Policy Enforcement:** Stale or test backup data will **NEVER** be automatically imported into production without prior reconciliation, schema provisioning, and explicit client authorization.

---

## 7. REMAINING PRODUCTION RISKS

1. **Risk 1 (Schema Absence):** Any user who registers or creates a trip on `https://www.bharatyatra.in` today will lose their trip as soon as they switch browsers or clear browser cookies.
2. **Risk 2 (Storage Failure):** Photo uploads for community place contributions fail because remote Supabase storage bucket `contributions` does not exist.
3. **Risk 3 (Admin Desynchronization):** Admin approvals and rewards issued in the admin portal do not sync to remote PostgreSQL, leaving travel partner and supplier ledgers unbacked.

---

## 8. SAFE EXECUTION PLAN & AUTHORIZATION REQUEST

To transition BharatYatra from **NOT SAFE FOR PRODUCTION** to **PRODUCTION VERIFIED**, the following 4-step execution plan must be performed:

### Step 1: Remote Supabase Schema Provisioning
- Execute `supabase/migrations/20261120_production_permanent_persistence_schema.sql` directly on the remote Supabase PostgreSQL instance via Supabase Management API or SQL Editor.
- Verify that PostgREST reloads its schema cache (`NOTIFY pgrst, 'reload schema'`).
- Verify that all 18 tables return `HTTP 200 OK` on `GET /rest/v1/<table>?select=*&limit=1`.

### Step 2: Storage Bucket Provisioning
- Execute storage bucket creation via Supabase SQL Editor:
  ```sql
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('contributions', 'contributions', true) 
  ON CONFLICT (id) DO NOTHING;
  ```

### Step 3: Vercel Environment Variable Alignment
- Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel Project Settings (Production & Preview).
- Set direct `DATABASE_URL` (Supabase Connection Pooler / Session mode on port 5432 / 6543) in Vercel to activate Tier 2 direct `pg.Pool` querying.

### Step 4: Idempotent Historical Data Migration
- Execute `scripts/zero-data-loss/migrate-json-to-postgres.ts` in live mode (`dryRun: false`) to backfill the 77 community submissions, 27 published destinations, and 36 verified reward coupons into live PostgreSQL.

---

### ACTION REQUIRED

Please confirm authorization to proceed with **Step 1 (Remote Supabase Schema Provisioning)** using the safe, non-destructive migration file `20261120_production_permanent_persistence_schema.sql`.

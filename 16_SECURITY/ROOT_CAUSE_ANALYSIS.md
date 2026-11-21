# BharatYatra — Deep Root-Cause Analysis
## Technical Root Causes Behind Recurring User Data Loss & Disappearance

**Incident Classification:** P0 Production Reliability Issue  
**Target URL:** `https://bharatyatra.in`  
**Date of Root Cause Isolation:** 20 November 2026  
**Engineering Team:** Database Reliability & Security Architecture  

---

## 1. Architectural Summary of Failure Modes

The investigation identified **four primary technical root causes** acting in tandem across the frontend, serverless backend, and database tiers that resulted in recurring data loss:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRIMARY FAILURE CASCADE                         │
└────────────────────────────────────────────────────────────────────────┘
                                 │
     [1] Remote Supabase PostgREST Returns PGRST205 (Missing Schema)
                                 │
                                 ▼
     [2] UserDataStore Diverts Write to inMemoryStore (RAM Only)
                                 │
                                 ▼
     [3] inMemoryStore.persistToDisk() Fails with EROFS (Read-Only FS)
                                 │
                                 ▼
     [4] Silent Catch Swallows Error; Trip Lives ONLY in Container RAM
                                 │
                                 ▼
     [5] Container Recycles / Redeploys -> RAM Wiped -> 0 Trips Returned
                                 │
                                 ▼
     [6] New Device Logs In -> Receives [] -> Client Overwrites Local Vault
```

---

## 2. Root Cause 1: Remote Supabase Schema Cache Desynchronization (`PGRST205`)

### Technical Mechanism:
- Production Vercel deployments query the remote Supabase endpoint `https://uedmguvljhsvbndwkruz.supabase.co` using PostgREST client (`@supabase/supabase-js`).
- Execution of `check-remote-supabase-status.ts` against the live remote Supabase project returned:
  ```json
  {
    "code": "PGRST205",
    "message": "Could not find the table 'public.user_profiles' in the schema cache"
  }
  ```
  Identical `PGRST205` errors were returned for `public.user_trips`, `public.user_bookings`, and `public.place_submissions`.
- Because PostgREST could not find the relational tables in its cached PostgreSQL metadata catalog, every write and query directed to Supabase failed immediately.

### Failure Impact:
All database mutations were deflected into fallback handling.

---

## 3. Root Cause 2: Serverless Filesystem `EROFS` Swallowed by Silent Catch

### Technical Mechanism:
- When PostgREST failed with `PGRST205`, `UserDataStore` triggered `shouldAllowFallback()`, routing the write to `inMemoryStore`.
- `inMemoryStore.saveTrip()` placed the trip into an in-memory `Map` and invoked `this.persistToDisk()`.
- In `lib/user/user-store.ts` (lines 162–183):
  ```typescript
  public persistToDisk() {
    try {
      if (typeof window === 'undefined') {
        const dir = path.dirname(PERSISTENT_STORE_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const snapshot = { ... };
        const tmp = `${PERSISTENT_STORE_FILE}.tmp.${Date.now()}`;
        fs.writeFileSync(tmp, JSON.stringify(snapshot, null, 2), 'utf-8');
        fs.renameSync(tmp, PERSISTENT_STORE_FILE);
      }
    } catch {} // SILENT CATCH!
  }
  ```
- `PERSISTENT_STORE_FILE` was configured as `path.join(process.cwd(), 'data', 'persistent_user_store.json')`.
- On Vercel / AWS Lambda serverless execution runtimes, `process.cwd()` points to `/var/task` (the deployment bundle).
- `/var/task` is strictly **read-only** (`EROFS: read-only file system`).
- `fs.writeFileSync` threw `EROFS`.
- The empty `catch {}` block swallowed the error without logging, alerting, or redirecting to writable storage (`/tmp`).

### Failure Impact:
User data existed solely within the volatile memory heap of a single serverless container instance. As soon as AWS Lambda / Vercel shut down or scaled the instance, or when a subsequent HTTP request hit a different container, all user data was completely gone.

---

## 4. Root Cause 3: Empty Server Response Overwriting Client Vault on New Devices

### Technical Mechanism:
- In `lib/trips/trip-storage.ts`, when a user logs in on a new device or in incognito mode, `localTrips` starts as an empty array (`[]`).
- `fetchUserTripsFromApi` sends a GET request to `/api/v1/trips`.
- Because the backend lambda container had no cached state and Supabase returned `PGRST205`, the backend responded:
  ```json
  {
    "success": true,
    "count": 0,
    "data": []
  }
  ```
- The client treated this as a valid, authoritative server response.
- `reconcileTrips([], [])` computed `[]`.
- `localStorage.setItem('chalo_farva_saved_trips_' + userId, '[]')` was called.
- The user perceived that their account was empty and all historical trips had disappeared.

---

## 5. Root Cause 4: Identity Mutation & Floating User IDs

### Technical Mechanism:
- In `lib/auth/auth-context.tsx`, `completeProfile()` contained the following fallback logic when `user` was temporarily not yet hydrated:
  ```typescript
  const fallbackUser: UserProfile = user
    ? { ...user, fullName: cleanName, email: cleanEmail || user.email }
    : {
        id: `usr_${Date.now()}`,
        email: cleanEmail || `user_${Date.now()}@bharatyatra.com`,
        fullName: cleanName,
        role: 'CUSTOMER',
      };
  ```
- If a user completed or updated their profile before the async Supabase session hydrated, this code generated a new random ID like `usr_1795149818510`.
- All client-side storage keys are strictly keyed by user ID:
  - `chalo_farva_saved_trips_${userId}`
  - `bharatyatra_travel_profile_${userId}`
- When the user ID changed from `usr_A` to `usr_B`, all trips saved under `chalo_farva_saved_trips_usr_A` remained locked under the old key, appearing completely gone to the user.

---

## 6. Root Cause 5: Disconnect Between Backend Prisma ORM and Next.js Serverless APIs

### Technical Mechanism:
- The repository contains a comprehensive PostgreSQL relational schema in `18_DEVELOPMENT/Backend/prisma/schema.prisma` with 54+ tables.
- However, Next.js App Router API route handlers (`app/api/v1/*`) did not utilize a direct PostgreSQL connection pool (`pg.Pool`), relying solely on PostgREST REST calls to Supabase.
- When PostgREST schema cache was missing the tables, Next.js had no secondary connection mechanism to execute direct SQL queries against the underlying PostgreSQL instance.

---

## 7. Remediation Strategy Implemented

1. **Dual-Tier Serverless Filesystem Resilience:**
   - Updated `InMemoryUserDataStore` to write to `PRIMARY_STORE_FILE` (`data/persistent_user_store.json`), and on `EROFS` / write failure, immediately fall back to `SERVERLESS_STORE_FILE` in `os.tmpdir()` (`/tmp/bharatyatra_persistent_user_store.json`).
   - On load, both files are scanned and additively merged so serverless container restarts retain all historical and newly added records.
2. **Direct PostgreSQL Connection Pooling (`pg.Pool`):**
   - Integrated direct PostgreSQL pooling in `lib/user/user-store.ts` via `getPgPool()`.
   - When `DATABASE_URL` / `POSTGRES_URL` is configured, queries execute directly over PostgreSQL wire protocol (`INSERT ... ON CONFLICT DO UPDATE`), completely bypassing PostgREST schema cache limitations.
3. **Safe Non-Destructive Client Reconciliation:**
   - Guarded `fetchUserTripsFromApi()`: If the server returns 0 trips and local storage is empty, it checks guest and legacy storage keys before finalizing.
   - If local storage has trips and server returns 0 trips, local trips are strictly preserved and queued for background server synchronization.
4. **Stable Identity Anchor:**
   - Updated `completeProfile()`: If `user` is null, it first checks `localStorage.getItem('auth_user')` and `getStoredUserId()` to preserve existing user IDs rather than generating random IDs.

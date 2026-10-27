# BharatGateway™ — Final Issues and Fixes Log

**Document Version:** 1.0.0  
**Repository:** `BhartYatra_4`  
**Engineer:** Senior Payment Gateway, PostgreSQL & DevOps Engineer  
**Audit Date:** 2026-10-23  

---

## Issue 1: Silent PostgreSQL Fallback Masking Database Unavailability in Integration Tests

### Severity
**High (Test Integrity & False Positive Risk)**

### Description
In previous test runs, `__tests__/bharatgateway-phase2-postgres.test.ts` reported that all 11 tests passed with exit code 0, despite logging:
`[Phase 2 Test] PostgreSQL not reachable: connect ECONNREFUSED 127.0.0.1:5433. Running in fallback.`
The test suite was designated as the "PostgreSQL Reliability, Atomicity & Concurrency Suite", yet it executed entirely against in-memory JavaScript `Map` structures when PostgreSQL was down. This provided a false sense of database verification without exercising any SQL transactions, row locks, or disk persistence.

### Root Cause
1. In `before()` hook of `__tests__/bharatgateway-phase2-postgres.test.ts`, the connection attempt was wrapped in an uncaught `try/catch` block that merely set `isPostgresAvailable = false` and logged a warning without throwing or failing.
2. `GatewayPersistenceService` provided a dual-mode implementation (real `pg.Pool` when connected, in-memory fallback when disconnected).
3. The test suite never asserted that `isPostgresAvailable` or `persistenceService.isDatabaseConnected()` was true.

### Fix Applied
1. Modified `__tests__/bharatgateway-phase2-postgres.test.ts`:
   - In the `before()` hook, if the initial PostgreSQL probe fails, an explicit `Error` is thrown:
     ```ts
     throw new Error(
       `[PREREQUISITE_BLOCKED] PostgreSQL is unreachable at ${safeHostPort}/${safeDb} (${err.message}). ` +
       `This suite is explicitly designated as an authentic PostgreSQL integration test and cannot silently pass via in-memory fallback. ` +
       `Prerequisite to run real DB tests: Start the gateway database container with 'docker compose -f docker-compose.gateway.yml up -d gateway-postgres' or configure GATEWAY_DATABASE_URL with an accessible PostgreSQL instance.`
     );
     ```
   - Added an assertion that `persistenceService.isDatabaseConnected()` must equal `true`.
   - Added a new test suite `0. Live Database Connectivity & Target Verification` that checks `current_database()` equals `bharatgateway_dev` (or staging sandbox) without printing credentials.
2. Scoped all test records to a dedicated test merchant (`TEST_MERCHANT_ID = 'merch_phase2_pg_test'`) and implemented a teardown hook to delete only test-created rows while strictly preserving persistent volumes and database structures.

### Verification
Ran `npx tsx --test __tests__/bharatgateway-phase2-postgres.test.ts`. With Docker stopped, the test now **fails honestly with exit code 1** and clearly prints the exact prerequisite instead of falsely reporting 11 passed tests.

---

## Issue 2: PostgreSQL Port and Database Target Inconsistency (5433 vs. 5432)

### Severity
**Medium (Configuration Inconsistency & Deployment Drift)**

### Description
`docker-compose.gateway.yml` (the dedicated Compose service for BharatGateway) configured the PostgreSQL service with host port `"5432:5432"`, username `gateway_user`, and database `bharatgateway_dev`. However:
1. `GatewayPersistenceService` fell back to `127.0.0.1:5433/bharatyatra_staging_sandbox` (the legacy staging port mapped in `docker-compose.staging.yml`).
2. `__tests__/bharatgateway-phase2-postgres.test.ts` hardcoded connection string targeting `127.0.0.1:5433`.

### Root Cause
Configuration was copied from earlier staging integration files without reconciling with the dedicated gateway compose environment.

### Fix Applied
1. In `18_DEVELOPMENT/Backend/src/gateway/database/gateway-persistence.service.ts`:
   Aligned the default fallback connection string to:
   ```ts
   const connStr =
     process.env.GATEWAY_DATABASE_URL ||
     process.env.DATABASE_URL ||
     process.env.STAGING_DATABASE_URL ||
     'postgresql://gateway_user:gateway_secure_password_2026@127.0.0.1:5432/bharatgateway_dev';
   ```
2. In `__tests__/bharatgateway-phase2-postgres.test.ts`:
   Targeted the same precedence order, matching the local `gateway-postgres` container on port `5432`.
3. Added `public isDatabaseConnected(): boolean` method to `GatewayPersistenceService` to allow upstream components to inspect live connection state.

### Verification
Both `gateway-persistence.service.ts` and `bharatgateway-phase2-postgres.test.ts` now consistently probe `127.0.0.1:5432/bharatgateway_dev`.

---

## Issue 3: Inactive Docker Desktop Service on Windows Host

### Severity
**Low (Environmental Prerequisite)**

### Description
Command execution of `docker ps` returned:
`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine... The system cannot find the file specified.`
Inspection of Windows services revealed `com.docker.service` (Docker Desktop Service) in `Stopped` status.

### Impact
PostgreSQL container `bharatgateway-postgres` cannot be spawned autonomously without the user starting Docker Desktop.

### Fix / Resolution
1. Correctly classified status as `BLOCKED — PREREQUISITE REQUIRED` for the PostgreSQL integration suite.
2. Verified all 6 other gateway suites run completely independently in in-memory simulation mode without requiring Docker or PostgreSQL.
3. Provided exact single-line commands in `BHARATGATEWAY_LOCAL_TESTING_GUIDE.md` for launching Docker Desktop and running migrations.

---

## Issue 4: Razorpay Live Payment Security Gate Verification

### Severity
**Informational / Preventative (Security Control)**

### Description
Audited `RazorpaySandboxAdapter` to ensure zero possibility of accidental live charges during local testing or CI.

### Findings & Verification
- Confirmed that setting `ENABLE_LIVE_PAYMENTS=true` immediately throws a `ForbiddenException` during adapter instantiation:
  ```ts
  if (enableLivePayments) {
    throw new ForbiddenException(
      '[SECURITY VIOLATION] ENABLE_LIVE_PAYMENTS cannot be enabled during Phase 6 sandbox verification. Live payments strictly prohibited.',
    );
  }
  ```
- Confirmed `isLiveAuthorized()` returns `false`.
- Confirmed that in the absence of valid `rzp_test_...` credentials, the adapter defaults safely to `CONTRACT_MOCK` mode, returning simulated orders, payment IDs, and signatures.

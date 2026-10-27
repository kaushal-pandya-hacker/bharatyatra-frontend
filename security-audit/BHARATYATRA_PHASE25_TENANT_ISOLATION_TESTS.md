# BharatYatra Phase 25 — Tenant Isolation and RPC Security Validation Report

**Execution Date:** 2026-10-22  
**Target Environment:** Local Disposable Supabase Stack (PostgREST API gateway)  
**Endpoint Target:** `http://127.0.0.1:54321/rest/v1`  
**Database Host:** `127.0.0.1:54322` (`supabase_db_BhartYatra_3`)  
**Staging Stack Preserved:** `bharatyatra-staging-postgres` (`127.0.0.1:5433`), `bharatyatra-staging-redis` (`127.0.0.1:6380`)  
**Cloud / Production Contact:** Strictly Zero (No cloud Supabase, No live Razorpay)  
**Credential Sanitization:** Zero API keys, JWT tokens, connection strings, or secrets exposed  

---

## 1. Executive Summary

In Phase 25, comprehensive security and tenant isolation testing was executed against the local Supabase environment running migration `20261012000000_travel_partner_ecosystem.sql`. All testing was conducted through the PostgREST REST API layer using minted cryptographic JWTs with specific claim sets (`anon`, `authenticated` with tenant claims `user_a` and `user_b`, and `service_role`).

### Test Execution Overview

| Suite | Focus Area | Total | Passed | Failed |
|---|---|---|---|---|
| **Suite 1** | Anonymous Public Boundaries & Leakage Defense | 7 | 7 | 0 |
| **Suite 2** | Authenticated Tenant Isolation (Owner Access) | 6 | 6 | 0 |
| **Suite 3** | Cross-Tenant IDOR Attack Defense (Negative Tests) | 5 | 5 | 0 |
| **Suite 4** | Privilege Escalation & Audit Log Immutability | 2 | 2 | 0 |
| **Suite 5** | Privileged RPC Security & Execution | 7 | 4 | 3 |
| **Suite 6** | Data Integrity, Constraints & Atomic Rollback | 3 | 2 | 1 |
| **Total** | | **30** | **26** | **4** |

### Final Phase Status

```
FAIL — AUTHORIZATION OR DATA INTEGRITY DEFECT
```

> **Root Cause Summary:**  
> The 4 failing tests (T5.5, T5.6, T5.7, T6.3) all stem from a single, critical authorization defect in the migration's stored procedure definitions (`rpc_approve_agency`, `rpc_suspend_agency`, `rpc_settle_commission`). The procedures attempt to check caller authorization using `current_setting('request.jwt.claim.role', true)` and `current_user != 'service_role'`. In modern Supabase/PostgREST stacks, JWT claims are placed in `request.jwt.claims` (JSON), and `SECURITY DEFINER` functions switch `current_user` to the function owner (`postgres`), rendering legitimate `service_role` invocations through the API permanently blocked (`Access Denied: Only service_role can execute ...`).
>
> In accordance with Phase 25 safety instructions (*"If a test fails, preserve evidence and do not weaken the policy to make it pass. Do not modify production"*), no policies were weakened, the database state was preserved, and the defect is formally documented below with exact remediation guidance.

---

## 2. Infrastructure & Environment Verification

### 2.1 Container Verification
Before launching test suites, all local container identities, health statuses, and port bindings were verified:

```
CONTAINER ID   IMAGE                                      COMMAND                  STATUS                  PORTS
a67cf50b86a8   supabase/studio:2025.02.17-df67bb3         "node server.js"         Up About an hour (healthy)  127.0.0.1:54323->3000/tcp
d2766324db6b   kong:2.8.1                                 "/docker-entrypoint.…"   Up About an hour (healthy)  127.0.0.1:54321->8000/tcp
df4e9a0f589d   postgrest/postgrest:v12.2.8                "postgrest"              Up About an hour            127.0.0.1:54324->3000/tcp
476f3459c72e   supabase/postgres-meta:v0.88.5             "node dist/server/in…"   Up About an hour (healthy)  127.0.0.1:54325->8080/tcp
9fc7af3f0b24   supabase/storage-api:v1.22.4               "docker-entrypoint.s…"   Up About an hour (healthy)  127.0.0.1:54326->5000/tcp
f0d2c9c735d4   supabase/gotrue:v2.173.0                   "gotrue"                 Up About an hour (healthy)  127.0.0.1:54327->9999/tcp
d4653ae89fe9   supabase/postgres:15.8.1.085               "docker-entrypoint.s…"   Up About an hour (healthy)  127.0.0.1:54322->5432/tcp
c37466181f2f   bharatyatra-staging-postgres (isolated)    "docker-entrypoint.s…"   Up 2 hours (healthy)        127.0.0.1:5433->5432/tcp
fbe5847413d7   bharatyatra-staging-redis (isolated)       "docker-entrypoint.s…"   Up 2 hours (healthy)        127.0.0.1:6380->6379/tcp
```

- **Loopback Enforcement:** All exposed ports are strictly bound to `127.0.0.1`.
- **Existing Staging Containers:** `bharatyatra-staging-postgres` and `bharatyatra-staging-redis` remained completely untouched and healthy throughout testing.
- **Production Isolation:** Zero DNS queries, socket connections, or requests were routed to cloud Supabase (`uedmguvljhsvbndwkruz`) or live payment gateways.

### 2.2 Applied Migration Schema
Migration `20261012000000_travel_partner_ecosystem.sql` verified present in database `postgres`:
- **7 Tables with RLS Enabled:** `travel_agencies`, `agency_verification_documents`, `travel_partner_agreements`, `travel_packages`, `travel_commission_ledger`, `travel_partner_audit_logs`, `travel_partner_notifications`.
- **5 Custom Enums:** `travel_agency_type`, `agency_verification_status`, `package_publication_status`, `commission_basis_type`, `ledger_event_type`.
- **17 RLS Policies:**
  - 7 `service_role` full access policies
  - 3 public policies (discovery, agency directory, application submission)
  - 7 partner isolation policies (`TO authenticated USING (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()))`)
- **3 Stored Procedures:** `rpc_approve_agency`, `rpc_suspend_agency`, `rpc_settle_commission`.

---

## 3. Comprehensive Test Results Matrix

All 30 test cases were executed through the PostgREST endpoint `http://127.0.0.1:54321/rest/v1`.

### Suite 1: Anonymous Public Boundaries & Leakage Defense

| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T1.1** | Anonymous `SELECT /travel_agencies` | Can see APPROVED agencies only; SUBMITTED agencies hidden | Found 1 records. `hasAgencyA(APPROVED)=true`, `hasAgencyB(SUBMITTED)=false` | **PASS** |
| **T1.2** | Anonymous `SELECT /travel_packages` | Can see PUBLISHED packages only; DRAFT packages hidden | Found 1 records. `hasPkgA1(PUBLISHED)=true`, `hasPkgA2(DRAFT)=false` | **PASS** |
| **T1.3** | Anonymous `SELECT /travel_partner_agreements` | 0 rows returned (Empty array `[]`); zero financial contract leakage | Returned 0 rows | **PASS** |
| **T1.4** | Anonymous `SELECT /travel_commission_ledger` | 0 rows returned (Empty array `[]`); zero payout ledger leakage | Returned 0 rows | **PASS** |
| **T1.5** | Anonymous `SELECT /agency_verification_documents` | 0 rows returned (Empty array `[]`); zero KYC document leakage | Returned 0 rows | **PASS** |
| **T1.6** | Anonymous `SELECT /travel_partner_audit_logs` | 0 rows returned (Empty array `[]`); zero audit log leakage | Returned 0 rows | **PASS** |
| **T1.7** | Anonymous `POST /travel_agencies` (Public Onboarding) | HTTP 201 Created when `verification_status = 'SUBMITTED'` | HTTP Status: 201 | **PASS** |

### Suite 2: Authenticated Tenant Isolation (Owner Access)

| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T2.1** | User A `SELECT /travel_agencies?id=eq.agy-test-tenant-a` | 1 row returned (`agy-test-tenant-a`) matching `user_id = auth.uid()` | Returned 1 rows. ID: `agy-test-tenant-a` | **PASS** |
| **T2.2** | User A `SELECT /travel_packages?agency_id=eq.agy-test-tenant-a` | Sees both DRAFT and PUBLISHED packages owned by their agency | Found 2 packages. `hasDraft=true`, `hasPublished=true` | **PASS** |
| **T2.3** | User A `SELECT /travel_partner_agreements?agency_id=eq.agy-test-tenant-a` | 1 row returned (`agr-test-a-01`) for own agency | Returned 1 rows | **PASS** |
| **T2.4** | User A `SELECT /travel_commission_ledger?agency_id=eq.agy-test-tenant-a` | 1 row returned (`led-test-a-01`) for own agency | Returned 1 rows | **PASS** |
| **T2.5** | User A `SELECT /agency_verification_documents?agency_id=eq.agy-test-tenant-a` | 1 row returned (`doc-test-a-01`) for own agency | Returned 1 rows | **PASS** |
| **T2.6** | User A `PATCH /travel_agencies?id=eq.agy-test-tenant-a` | Profile updated successfully (`WITH CHECK (user_id = auth.uid())`) | HTTP Status: 200. Rows affected: 1 | **PASS** |

### Suite 3: Cross-Tenant IDOR Attack Defense (Negative Tests)

| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T3.1** | IDOR: User A `SELECT /travel_agencies?id=eq.agy-test-tenant-b` | 0 rows returned (Blocked by RLS; Agency B is unapproved and owned by User B) | Returned 0 rows | **PASS** |
| **T3.2** | IDOR: User A `SELECT /travel_partner_agreements?agency_id=eq.agy-test-tenant-b` | 0 rows returned (Blocked by RLS) | Returned 0 rows | **PASS** |
| **T3.3** | IDOR: User A `SELECT /travel_commission_ledger?agency_id=eq.agy-test-tenant-b` | 0 rows returned (Blocked by RLS) | Returned 0 rows | **PASS** |
| **T3.4** | IDOR: User A `PATCH /travel_packages?id=eq.pkg-test-b-published` | 0 rows modified (Price tampering / package hijacking blocked by RLS) | Modified 0 rows | **PASS** |
| **T3.5** | IDOR: User A `DELETE /agency_verification_documents?agency_id=eq.agy-test-tenant-b` | 0 rows deleted (Cross-tenant document destruction blocked by RLS) | Deleted 0 rows | **PASS** |

### Suite 4: Privilege Escalation & Audit Log Immutability

| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T4.1** | Privilege Escalation: User A `POST /travel_partner_audit_logs` | HTTP 403 Forbidden / Access Denied (Audit logs are strictly system/admin append-only) | HTTP Status: 403. Message: `"new row violates row-level security policy for table travel_partner_audit_logs"` | **PASS** |
| **T4.2** | Audit Immutability: User A `SELECT /travel_partner_audit_logs` | 0 rows returned (Audit logs hidden from tenant partners) | Returned 0 rows | **PASS** |

### Suite 5: Privileged RPC Security & Execution

| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T5.1** | Anonymous `POST /rpc/rpc_approve_agency` | HTTP 401 Unauthorized (`permission denied for function`) | HTTP Status: 401. Error: `"permission denied for function rpc_approve_agency"` | **PASS** |
| **T5.2** | User A `POST /rpc/rpc_approve_agency` | HTTP 403 Forbidden (`permission denied for function`) | HTTP Status: 403. Error: `"permission denied for function rpc_approve_agency"` | **PASS** |
| **T5.3** | User A `POST /rpc/rpc_suspend_agency` | HTTP 403 Forbidden (`permission denied for function`) | HTTP Status: 403. Error: `"permission denied for function rpc_suspend_agency"` | **PASS** |
| **T5.4** | User A `POST /rpc/rpc_settle_commission` | HTTP 403 Forbidden (`permission denied for function`) | HTTP Status: 403. Error: `"permission denied for function rpc_settle_commission"` | **PASS** |
| **T5.5** | Service Role `POST /rpc/rpc_approve_agency` | Agency verification status updated to `APPROVED` atomically | HTTP Status: 400. Error: `"Access Denied: Only service_role can execute rpc_approve_agency"` | **FAIL** |
| **T5.6** | Service Role `POST /rpc/rpc_suspend_agency` | Agency `SUSPENDED` & published packages cascaded to `PAUSED` | HTTP Status: 400. Error: `"Access Denied: Only service_role can execute rpc_suspend_agency"` | **FAIL** |
| **T5.7** | Service Role `POST /rpc/rpc_settle_commission` | Ledger entry status updated to `SETTLED` with reference | HTTP Status: 400. Error: `"Access Denied: Only service_role can execute rpc_settle_commission"` | **FAIL** |

### Suite 6: Data Integrity, Constraints & Atomic Rollback

| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T6.1** | Foreign Key Violation: Package with non-existent `agency_id` | HTTP 409 Conflict (`violates foreign key constraint travel_packages_agency_id_fkey`) | HTTP Status: 409. Error: `insert or update on table "travel_packages" violates foreign key constraint "travel_packages_agency_id_fkey"` | **PASS** |
| **T6.2** | Unique Constraint Violation: Duplicate agency `business_slug` | HTTP 409 Conflict (`violates unique constraint travel_agencies_business_slug_key`) | HTTP Status: 409. Error: `duplicate key value violates unique constraint "travel_agencies_business_slug_key"` | **PASS** |
| **T6.3** | Atomic Exception: RPC on non-existent entity | Stored procedure raises exception and rolls back cleanly without partial mutations | HTTP Status: 400. Error: `"Access Denied: Only service_role can execute rpc_approve_agency"` (Blocked before business logic) | **FAIL** |

---

## 4. Defect Deep Dive & Root Cause Analysis

### 4.1 Defect Description
Stored procedures `rpc_approve_agency`, `rpc_suspend_agency`, and `rpc_settle_commission` fail with an unbypassable authorization error when invoked through the Supabase REST API (PostgREST) using the valid `service_role` bearer token and `service_role` API key.

### 4.2 Exact Vulnerable Code
Lines 327–330, 394–397, and 455–458 in `20261012000000_travel_partner_ecosystem.sql`:

```sql
-- Lines 327-330
IF current_user != 'service_role' AND COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
    RAISE EXCEPTION 'Access Denied: Only service_role can execute rpc_approve_agency';
END IF;
```

### 4.3 Root Cause Mechanics
The check contains two fatal structural flaws:

1. **`SECURITY DEFINER` Execution Context:**
   Each function is created with `SECURITY DEFINER` and owned by `postgres`. In PostgreSQL, inside a `SECURITY DEFINER` function, `current_user` evaluates to the **owner** of the function (`postgres`), regardless of the role assumed by PostgREST or the database session.
   - Therefore, `current_user != 'service_role'` evaluates to `'postgres' != 'service_role'`, which is **always TRUE**.

2. **Obsolete PostgREST GUC Convention:**
   In PostgREST 9+ (and standard across all Supabase releases), incoming JWT claims are stored as a JSON object in the single configuration variable `request.jwt.claims`. PostgREST no longer sets individual scalar settings such as `request.jwt.claim.role`.
   - Therefore, `current_setting('request.jwt.claim.role', true)` evaluates to `NULL`.
   - `COALESCE(NULL, '') != 'service_role'` evaluates to `'' != 'service_role'`, which is **always TRUE**.

Because both operands of `AND` evaluate to `TRUE`:
$$\text{TRUE} \land \text{TRUE} \equiv \text{TRUE}$$

The function unconditionally raises an `Access Denied` exception on every API call, completely disabling administrative partner approvals, partner suspensions, and payout settlements through the API gateway.

### 4.4 Diagnostic Proof
A direct query into the local PostgreSQL instance executing the exact same session environment as PostgREST proved the divergence between legacy GUC and standard Supabase auth helper:

```sql
SET "request.jwt.claims" = '{"role": "service_role"}';
SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), '<EMPTY>') AS legacy_claim,
       auth.role() AS modern_auth_role;
```

**Output:**
```
 legacy_claim | modern_auth_role 
--------------+------------------
 <EMPTY>      | service_role
```

### 4.5 Recommended Non-Weakening Remediation
To resolve this defect without compromising security:

1. Replace the legacy GUC check in all three stored procedures with Supabase's native, hardened role resolution helper `auth.role()`:
   ```sql
   -- Hardened replacement guard
   IF auth.role() != 'service_role' THEN
       RAISE EXCEPTION 'Access Denied: Only service_role can execute %', pg_proc.proname;
   END IF;
   ```
2. Retain the existing `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated;` and `GRANT EXECUTE ... TO service_role;` statements, which already provide defense-in-depth at the PostgreSQL grant level.

---

## 5. Security Architecture & Function Properties Audit

The PostgreSQL system catalog was inspected to confirm function ownership, `SECURITY DEFINER` status, search path configuration, and permission ACLs:

```sql
SELECT 
    p.proname AS function_name,
    pg_get_userbyid(p.proowner) AS owner,
    p.prosecdef AS is_security_definer,
    p.proconfig AS configuration_settings,
    array_to_string(p.proacl, E'\n') AS permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname IN ('rpc_approve_agency', 'rpc_suspend_agency', 'rpc_settle_commission');
```

### Findings Table

| Function | Owner | SECURITY DEFINER | `search_path` | Granted Roles |
|---|---|---|---|---|
| `rpc_approve_agency` | `postgres` | `true` | `{"search_path=public, pg_temp"}` | `postgres=X/postgres`, `service_role=X/postgres` |
| `rpc_suspend_agency` | `postgres` | `true` | `{"search_path=public, pg_temp"}` | `postgres=X/postgres`, `service_role=X/postgres` |
| `rpc_settle_commission` | `postgres` | `true` | `{"search_path=public, pg_temp"}` | `postgres=X/postgres`, `service_role=X/postgres` |

- **Search-Path Hardening:** All three functions enforce `SET search_path = public, pg_temp`, preventing search-path hijacking attacks.
- **Permission Grants:** `EXECUTE` privileges are successfully revoked from `PUBLIC`, `anon`, and `authenticated`. Unprivileged users attempting to invoke these functions receive PostgreSQL permission denials (`401`/`403`) before the function body is entered.

---

## 6. Synthetic Data Lifecycle & Cleanup Verification

All test fixtures used exclusively synthetic identifiers (`agy-test-tenant-a`, `agy-test-tenant-b`, `pkg-test-a-*`, `pkg-test-b-*`, `agr-test-a-01`, `doc-test-a-01`, `led-test-a-01`).

Following test execution, automated teardown removed all synthetic entities. Independent database catalog queries confirmed complete cleanup:

```sql
SELECT id, business_name FROM travel_agencies WHERE id LIKE 'agy-test%';
-- Result: 0 rows

SELECT id, title FROM travel_packages WHERE id LIKE 'pkg-test%';
-- Result: 0 rows
```

Zero test records, test artifacts, or lingering mock accounts exist in the database.

---

## 7. Final Security Verdict

```
FAIL — AUTHORIZATION OR DATA INTEGRITY DEFECT
```

- **Tenant Isolation (RLS):** Fully verified and hardened. Cross-tenant reads, cross-tenant modifications, unauthenticated leaks, and unprivileged audit log injection are completely blocked by PostgreSQL RLS policies.
- **RPC Privileged Execution:** Blocked by an authorization defect within the stored procedures' claim check logic.
- **Action Required:** Remediate the GUC claim check in `rpc_approve_agency`, `rpc_suspend_agency`, and `rpc_settle_commission` using `auth.role()` in an approved remediation migration.

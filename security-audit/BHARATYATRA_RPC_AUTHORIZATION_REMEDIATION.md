# BharatYatra — Targeted RPC Authorization Remediation & Regression Verification

**Execution Date:** 2026-10-22  
**Target Environment:** Local Supabase Stack (`http://127.0.0.1:54321/rest/v1`, Database: `127.0.0.1:54322`)  
**Staging Stack Preserved:** `bharatyatra-staging-postgres` (port `5433`), `bharatyatra-staging-redis` (port `6380`)  
**Remediation Migration:** `supabase/migrations/20261022132210_rpc_authorization_remediation.sql`  
**Original Migration Preserved:** `supabase/migrations/20261012000000_travel_partner_ecosystem.sql` (Unmodified)  
**Production Isolation:** Zero interaction with cloud Supabase (`uedmguvljhsvbndwkruz`) or live Razorpay; zero credentials leaked  

---

## 1. Executive Summary

In Phase 25, an authorization defect was identified in the travel partner stored procedures (`rpc_approve_agency`, `rpc_suspend_agency`, `rpc_settle_commission`): the procedures relied on an obsolete PostgREST configuration setting (`request.jwt.claim.role`) and assumed `current_user` inside a `SECURITY DEFINER` function would reflect the caller's role, permanently blocking legitimate `service_role` invocations through the Supabase REST API gateway.

In this remediation phase:
1. **Preserved History:** The original applied migration file was preserved without in-place modification.
2. **Forward-Only Migration:** A new timestamped corrective migration (`20261022132210_rpc_authorization_remediation.sql`) was created and applied locally via `npx supabase migration up --local`.
3. **Hardened Authorization & State Guards:**
   - Switched to Supabase's native claim resolution helper `auth.role()` combined with `session_user` checks.
   - Enforced input argument validation on all RPC parameters.
   - Enforced strict state transition rules (preventing redundant approvals or suspensions).
   - Added row-level locking (`FOR UPDATE`) and duplicate settlement protection in `rpc_settle_commission`.
   - Maintained immutable audit logging, in-app partner notifications, hardened `search_path = public, pg_temp`, and restricted execution grants.
4. **Comprehensive Regression Testing:** Executed 36 automated security scenarios across 7 test suites against the local PostgREST gateway.
   - **Prior 30 Scenarios:** 30 Passed (100%).
   - **New Regression Scenarios:** 6 Passed (100%).
   - **Total:** 36 Passed / 0 Failed.

### Final Verification Status

```
PASS — RPC FIX VERIFIED LOCALLY
```

---

## 2. Remediation Architecture & Design

### 2.1 Forward-Only Corrective Migration
Following repository release governance, the baseline migration `20261012000000_travel_partner_ecosystem.sql` remains intact. The fix was applied forward via:

`supabase/migrations/20261022132210_rpc_authorization_remediation.sql`

### 2.2 Core Technical Fixes

#### A. Dual-Layer Role & Identity Guard
Inside a PostgreSQL `SECURITY DEFINER` function, `current_user` evaluates to the function owner (`postgres`), while PostgREST connects as role `authenticator` and places JWT claims in the JSON setting `request.jwt.claims`.

The obsolete guard:
```sql
-- Defective: Always evaluated to TRUE (Access Denied)
IF current_user != 'service_role' AND COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
```

Was replaced with the hardened dual-layer check:
```sql
-- Remediated: Reliably inspects JWT claims via auth.role() and database session identity
IF COALESCE(auth.role(), '') != 'service_role' 
   AND current_user != 'service_role' 
   AND session_user NOT IN ('postgres', 'service_role') THEN
    RAISE EXCEPTION 'Access Denied: Only service_role can execute %', pg_proc.proname;
END IF;
```

#### B. Input Validation
All procedures now validate incoming parameters before accessing table data:
- `p_agency_id` / `p_ledger_id`: non-null, non-empty whitespace-trimmed string.
- `p_admin_id`: non-null, non-empty whitespace-trimmed string.
- `p_commission_rate`: numeric bound check `[0.00, 100.00]`.
- `p_settlement_ref`: non-null, non-empty whitespace-trimmed string.

#### C. Permitted State Transitions & Row Locking
- `rpc_approve_agency`: Acquires an exclusive row lock (`FOR UPDATE`). Rejects agencies already in `APPROVED` status (`Invalid state transition: Agency % is already APPROVED`) and agencies in `SUSPENDED` status (`Cannot approve SUSPENDED agency % directly`).
- `rpc_suspend_agency`: Acquires an exclusive row lock (`FOR UPDATE`). Rejects agencies already `SUSPENDED`. Cascades package suppression by transitioning all `PUBLISHED` packages belonging to the agency to `PAUSED`.
- `rpc_settle_commission`: Acquires an exclusive row lock (`FOR UPDATE`). Enforces duplicate settlement prevention:
  ```sql
  IF v_entry.status = 'SETTLED' THEN
      RAISE EXCEPTION 'Invalid state transition: Ledger entry % has already been settled (settlement reference: %)',
          p_ledger_id, v_entry.settlement_reference;
  END IF;
  IF v_entry.status = 'REVERSED' THEN
      RAISE EXCEPTION 'Invalid state transition: Cannot settle REVERSED ledger entry %', p_ledger_id;
  END IF;
  ```

#### D. Privilege Grants & Search Path
- `SET search_path = public, pg_temp` prevents malicious schema path injection.
- Execution revoked from `PUBLIC`, `anon`, and `authenticated`; granted exclusively to `service_role`.

---

## 3. Migration Execution & Catalog Verification

### 3.1 Migration Execution Log
```
Connecting to local database...
Applying migration 20261022132210_rpc_authorization_remediation.sql...
{"applied":["C:\\Users\\Pandya Kaushal\\Desktop\\BhartYatra_3\\supabase\\migrations\\20261022132210_rpc_authorization_remediation.sql"],"message":"Migrations applied"}
```

### 3.2 Migration Status Table
```
{"migrations":[
  {"local":"20261012000000","remote":"20261012000000","time":"2026-10-12 00:00:00"},
  {"local":"20261022132210","remote":"20261022132210","time":"2026-10-22 13:22:10"}
],"message":"Migrations listed"}
```

### 3.3 Function Catalog Properties
```sql
SELECT p.proname, pg_get_userbyid(p.proowner) AS owner, p.prosecdef, p.proconfig, p.proacl
FROM pg_proc p WHERE p.proname IN ('rpc_approve_agency', 'rpc_suspend_agency', 'rpc_settle_commission');
```

```
     function_name     |  owner   | is_security_definer |     configuration_settings      |       permissions       
-----------------------+----------+---------------------+---------------------------------+-------------------------
 rpc_approve_agency    | postgres | t                   | {"search_path=public, pg_temp"} | postgres=X/postgres    +
                       |          |                     |                                 | service_role=X/postgres
 rpc_suspend_agency    | postgres | t                   | {"search_path=public, pg_temp"} | postgres=X/postgres    +
                       |          |                     |                                 | service_role=X/postgres
 rpc_settle_commission | postgres | t                   | {"search_path=public, pg_temp"} | postgres=X/postgres    +
                       |          |                     |                                 | service_role=X/postgres
```

---

## 4. Comprehensive 36-Test Results Matrix

Testing conducted directly through PostgREST endpoint `http://127.0.0.1:54321/rest/v1`.

### Suite 1: Anonymous Public Boundaries & Leakage Defense
| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T1.1** | Anonymous `SELECT travel_agencies` | See APPROVED only; SUBMITTED hidden | Found 1 records. `hasAgencyA=true`, `hasAgencyB=false` | **PASS** |
| **T1.2** | Anonymous `SELECT travel_packages` | See PUBLISHED only; DRAFT hidden | Found 1 records. `hasPkgA1=true`, `hasPkgA2=false` | **PASS** |
| **T1.3** | Anonymous `SELECT travel_partner_agreements` | 0 rows returned (Empty array `[]`) | Returned 0 rows | **PASS** |
| **T1.4** | Anonymous `SELECT travel_commission_ledger` | 0 rows returned (Empty array `[]`) | Returned 0 rows | **PASS** |
| **T1.5** | Anonymous `SELECT agency_verification_documents` | 0 rows returned (Empty array `[]`) | Returned 0 rows | **PASS** |
| **T1.6** | Anonymous `SELECT travel_partner_audit_logs` | 0 rows returned (Empty array `[]`) | Returned 0 rows | **PASS** |
| **T1.7** | Anonymous `POST travel_agencies` (Onboarding) | HTTP 201 Created | HTTP Status: 201 | **PASS** |

### Suite 2: Authenticated Tenant Isolation (Owner Access)
| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T2.1** | User A `SELECT own agency profile` | 1 row returned (`agy-test-tenant-a`) | Returned 1 rows. ID: `agy-test-tenant-a` | **PASS** |
| **T2.2** | User A `SELECT own packages (inc. DRAFT)` | Sees both DRAFT and PUBLISHED own packages | Found 2 packages. `hasDraft=true`, `hasPublished=true` | **PASS** |
| **T2.3** | User A `SELECT own partner agreement` | 1 row returned (`agr-test-a-01`) | Returned 1 rows | **PASS** |
| **T2.4** | User A `SELECT own commission ledger` | 1 row returned (`led-test-a-01`) | Returned 1 rows | **PASS** |
| **T2.5** | User A `SELECT own verification documents` | 1 row returned (`doc-test-a-01`) | Returned 1 rows | **PASS** |
| **T2.6** | User A `PATCH own agency profile` | Profile updated successfully | HTTP Status: 200. Rows affected: 1 | **PASS** |

### Suite 3: Cross-Tenant IDOR Attack Defense
| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T3.1** | IDOR: User A `SELECT Agency B profile` | 0 rows returned (Empty array `[]`) | Returned 0 rows | **PASS** |
| **T3.2** | IDOR: User A `SELECT Agency B agreements` | 0 rows returned (Blocked by RLS) | Returned 0 rows | **PASS** |
| **T3.3** | IDOR: User A `SELECT Agency B commission ledger` | 0 rows returned (Blocked by RLS) | Returned 0 rows | **PASS** |
| **T3.4** | IDOR: User A `PATCH Agency B package` | 0 rows modified (Blocked by RLS) | Modified 0 rows | **PASS** |
| **T3.5** | IDOR: User A `DELETE Agency B documents` | 0 rows deleted (Blocked by RLS) | Deleted 0 rows | **PASS** |

### Suite 4: Privilege Escalation & Audit Log Immutability
| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T4.1** | Privilege Escalation: User A `POST audit logs` | Access Denied / 0 rows inserted | HTTP Status: 403 (violates RLS) | **PASS** |
| **T4.2** | Audit Immutability: User A `SELECT audit logs` | 0 rows returned (Only service_role can read) | Returned 0 rows | **PASS** |

### Suite 5: Privileged RPC Security & Execution (Remediated)
| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T5.1** | Anonymous `POST /rpc/rpc_approve_agency` | HTTP 401 Unauthorized | HTTP Status: 401 (`permission denied for function`) | **PASS** |
| **T5.2** | User A `POST /rpc/rpc_approve_agency` | HTTP 403 Forbidden | HTTP Status: 403 (`permission denied for function`) | **PASS** |
| **T5.3** | User A `POST /rpc/rpc_suspend_agency` | HTTP 403 Forbidden | HTTP Status: 403 (`permission denied for function`) | **PASS** |
| **T5.4** | User A `POST /rpc/rpc_settle_commission` | HTTP 403 Forbidden | HTTP Status: 403 (`permission denied for function`) | **PASS** |
| **T5.5** | Service Role `POST /rpc/rpc_approve_agency` | Status changed to `APPROVED` atomically | HTTP Status: 200. Returned status: `APPROVED` | **PASS** |
| **T5.6** | Service Role `POST /rpc/rpc_suspend_agency` | Agency `SUSPENDED` & package cascaded to `PAUSED` | Agency status: `SUSPENDED`, Package status: `PAUSED` | **PASS** |
| **T5.7** | Service Role `POST /rpc/rpc_settle_commission` | Commission status `SETTLED` | HTTP Status: 200. Status: `SETTLED`, Ref: `SETTLE_TXN_8849204` | **PASS** |

### Suite 6: Data Integrity & Constraints
| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T6.1** | Foreign key constraint on `travel_packages` | HTTP 409 Conflict (violates foreign key constraint) | HTTP Status: 409 (`violates foreign key constraint`) | **PASS** |
| **T6.2** | Unique constraint on `business_slug` | HTTP 409 Conflict (violates unique constraint) | HTTP Status: 409 (`duplicate key value violates unique constraint`) | **PASS** |
| **T6.3** | RPC atomic exception on non-existent entity | Raises exception and rolls back cleanly | HTTP Status: 400. Error: `Agency agy-ghost-999 not found` | **PASS** |

### Suite 7: Advanced Regression, State Transitions & Duplicate Protection (New)
| ID | Test Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **T7.1** | State Transition: Re-approving `APPROVED` agency | Blocked with invalid state transition error | HTTP Status: 400. Error: `Invalid state transition: Agency agy-test-tenant-a is already APPROVED` | **PASS** |
| **T7.2** | State Transition: Re-suspending `SUSPENDED` agency | Blocked with invalid state transition error | HTTP Status: 400. Error: `Invalid state transition: Agency agy-test-tenant-b is already SUSPENDED` | **PASS** |
| **T7.3** | Duplicate Settlement: Re-settling settled ledger entry | Blocked with already settled error | HTTP Status: 400. Error: `Invalid state transition: Ledger entry led-test-a-01 has already been settled (settlement reference: SETTLE_TXN_8849204)` | **PASS** |
| **T7.4** | Input Validation: Commission rate > 100% | Blocked with validation error | HTTP Status: 400. Error: `Invalid argument: p_commission_rate must be between 0.00 and 100.00` | **PASS** |
| **T7.5** | Input Validation: Blank settlement reference | Blocked with validation error | HTTP Status: 400. Error: `Invalid argument: p_settlement_ref must not be empty` | **PASS** |
| **T7.6** | Atomic Rollback: No phantom audit logs on failure | Exactly 1 audit log remains from legitimate settlement | Found 1 audit entries for `led-test-a-01`. SettlementRef: `SETTLE_TXN_8849204` | **PASS** |

---

## 5. Type-Check and Compilation Verification

Frontend and backend compilation verification was executed to ensure schema changes do not impact static typings:
- **`npm run type-check` (Frontend / Next.js):**
  ```
  > chalo-farva-frontend@1.0.0 type-check
  > tsc --noEmit
  Exit Code: 0 (Zero errors)
  ```

---

## 6. Synthetic Data Cleanup Audit

Following test execution, automated teardown purged all synthetic test fixtures:
- `SELECT COUNT(*) FROM travel_agencies WHERE id LIKE 'agy-test%';` $\rightarrow$ **0 rows**
- `SELECT COUNT(*) FROM travel_packages WHERE id LIKE 'pkg-test%';` $\rightarrow$ **0 rows**
- `SELECT COUNT(*) FROM travel_commission_ledger WHERE id LIKE 'led-test%';` $\rightarrow$ **0 rows**
- `SELECT COUNT(*) FROM travel_partner_agreements WHERE agency_id LIKE 'agy-test%';` $\rightarrow$ **0 rows**
- `SELECT COUNT(*) FROM agency_verification_documents WHERE agency_id LIKE 'agy-test%';` $\rightarrow$ **0 rows**
- `SELECT COUNT(*) FROM travel_partner_audit_logs WHERE agency_id LIKE 'agy-test%';` $\rightarrow$ **0 rows**
- `SELECT COUNT(*) FROM travel_partner_notifications WHERE agency_id LIKE 'agy-test%';` $\rightarrow$ **0 rows**

---

## 7. Final Status

```
PASS — RPC FIX VERIFIED LOCALLY
```

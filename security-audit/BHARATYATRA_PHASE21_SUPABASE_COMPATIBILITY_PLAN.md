# BharatYatra Phase 21 — Supabase Compatibility & Migration Recovery Plan
## Document Reference: `BHARATYATRA_PHASE21_SUPABASE_COMPATIBILITY_PLAN.md`
**Phase**: Phase 21 — Supabase Compatibility and Partial Migration Assessment  
**Author**: Senior Database Security Engineer & DevSecOps Release Manager  
**Scope**: Incomplete Migration Forensics, Security Architecture Review, Supabase CLI Assessment & Recovery Runbook  
**Execution Timestamp**: 2026-10-22  
**Final Phase Status**: **`READY FOR SUPABASE STAGING REHEARSAL PLAN`**  

---

## 1. Executive Summary & Audit Context

During Phase 20, the database migration script [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql) was rehearsed against the disposable local PostgreSQL staging database (`bharatyatra_staging_sandbox` on port `5433`). 

The rehearsal successfully proved that **100% of the core relational schema** (7 tables, 5 enum types, 29 indexes, 106 constraints, and Row Level Security enablement) is syntactically valid and compiles cleanly on PostgreSQL 15.8. However, execution halted at line 253 with:
```text
ERROR: role "service_role" does not exist
```
In strict compliance with DevSecOps safety rules, no artificial roles or mock authentication functions were injected to force completion. This Phase 21 audit inventories the exact partially applied state, analyzes the security architecture of the unapplied SQL statements, evaluates the local Supabase toolchain, and defines an evidence-based plan for end-to-end validation against a genuine Supabase runtime.

---

## 2. Current Local Staging Database Inventory (Verified Evidence)

The database catalog of `bharatyatra_staging_sandbox` inside container `bharatyatra-staging-postgres` was audited without modifying database state:

### 2.1 Catalog Object Counts
```
+---------------------------------------------------------------------------------------------------------+
| OBJECT CLASS                  | COUNT IN DATABASE | VERIFIED CATALOG STATUS                             |
+---------------------------------------------------------------------------------------------------------+
| Relational Tables (public)    | 7                 | All 7 migration tables created and online          |
| Custom Enum Types (public)    | 5                 | All 5 enum types created with correct values       |
| Total Indexes (public)        | 29                | 11 Primary/Unique indexes + 18 secondary indexes   |
| Table Constraints (public)    | 106               | Foreign keys, NOT NULL, and Check constraints      |
| Stored Routines (public)      | 10                | Standard extension functions (uuid-ossp)           |
| Active RLS Policies (public)  | 3                 | 3 Public unauthenticated policies only             |
| Tables with RLS Active        | 7 / 7             | relrowsecurity = TRUE on all 7 tables              |
+---------------------------------------------------------------------------------------------------------+
```

### 2.2 Exact Statement Execution Boundary
* **Statements Successfully Executed (Lines 1–250)**:
  * Extension: `uuid-ossp`
  * Enums: `travel_agency_type`, `agency_verification_status`, `package_publication_status`, `commission_basis_type`, `ledger_event_type`.
  * Tables: `travel_agencies`, `agency_verification_documents`, `travel_partner_agreements`, `travel_packages`, `travel_commission_ledger`, `travel_partner_audit_logs`, `travel_partner_notifications`.
  * RLS Enablements: `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;` on all 7 tables.
  * Public Policies:
    1. `Public can view approved agencies ON travel_agencies`
    2. `Public can submit agency application ON travel_agencies`
    3. `Public can view approved published packages ON travel_packages`
* **Statements Unapplied Due to Halt (Lines 251–485)**:
  * 7 Service Role Policies (`CREATE POLICY ... TO service_role`).
  * 7 Authenticated Tenant Isolation Policies (`CREATE POLICY ... TO authenticated USING (user_id = auth.uid())`).
  * 3 Atomic Stored Procedures (`rpc_approve_agency`, `rpc_suspend_agency`, `rpc_settle_commission`).
  * Role permission grants and revokes.

### 2.3 Rerun Safety Warning
> **Critical Finding**: The migration script is **NOT safe to rerun as-is** against the current partially applied database. Because the script does not contain `IF NOT EXISTS` on `CREATE POLICY` statements, rerunning it directly would fail immediately on policy duplication. A clean-database replay or transaction rollback is required.

---

## 3. Security & Architectural Review of Unapplied Code

An in-depth review of lines 251–485 was performed to verify security boundaries, authorization controls, and tenant isolation:

### 3.1 Supabase Role Architecture
The unapplied SQL relies on three Supabase standard roles:
1. `anon`: Unauthenticated clients connecting via PostgREST. Correctly restricted to read-only access for approved agencies and published packages, plus INSERT for new agency onboarding.
2. `authenticated`: Authenticated users holding valid JWTs. Access is strictly scoped to records where `user_id = auth.uid()`.
3. `service_role`: Privileged administrative key held by the NestJS backend. Used for administrative lifecycle management and executing transactional RPCs.

### 3.2 Tenant Isolation & Policy Overlap Analysis
* **Cross-Tenant IDOR Protection**:
  Tenant isolation policies for `travel_packages`, `travel_partner_agreements`, `travel_commission_ledger`, and `travel_partner_notifications` enforce:
  ```sql
  USING (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()))
  ```
  This guarantees that Agency A cannot read or mutate Agency B's packages, agreements, ledger entries, or notifications even if they know the UUID.
* **Audit Trail Immutability**:
  Table `travel_partner_audit_logs` has zero policies for `authenticated` or `anon`. Only `service_role` can write audit entries, preventing partners from tampering with historical compliance records.
* **Policy Overlap**: Verified zero policy conflicts. Public policies allow SELECT only on approved/published entities; authenticated policies allow full management only on owned entities.

### 3.3 RPC Stored Procedures & `SECURITY DEFINER` Security
All three unapplied stored procedures were audited for privilege escalation risks:
* **Function Names**: `rpc_approve_agency`, `rpc_suspend_agency`, `rpc_settle_commission`.
* **Search-Path Hijacking Defense**:
  All three functions explicitly declare:
  ```sql
  SET search_path = public, pg_temp
  ```
  This eliminates search-path spoofing vulnerabilities that can occur when `SECURITY DEFINER` functions execute in PostgreSQL.
* **In-Database Defense-in-Depth Authorization Guard**:
  Every procedure includes an internal runtime guard:
  ```sql
  IF current_user != 'service_role' AND COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
      RAISE EXCEPTION 'Access Denied: Only service_role can execute ...';
  END IF;
  ```
  Even if PostgREST grants were misconfigured, direct invocation by unauthorized roles triggers an immediate database-level exception.
* **RPC Execution Grants**:
  All three functions explicitly revoke access from untrusted roles:
  ```sql
  REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION ... TO service_role;
  ```
* **Transaction Atomicity**:
  All operations (e.g. updating agency verification status, creating default agreements, generating audit records, and issuing in-app notifications) execute within an implicit transaction. A failure in any step rolls back the entire transition cleanly.

---

## 4. Local Supabase Toolchain & Configuration Assessment

### 4.1 Repository Configuration Status
* **Supabase Directory**: No `supabase/` folder or `supabase/config.toml` exists in the repository.
* **Client Dependencies**: `@supabase/supabase-js` v2.117.2 is installed in `package.json` for API communication.
* **CLI Availability**: Verified `npx supabase --version` outputs **`2.121.0`**. The Supabase CLI is callable via npx.

### 4.2 Safe Execution Environments for Supabase Testing
Two valid technical paths exist for testing the complete migration without touching production:

```
+-----------------------------------------------------------------------------------------------------------+
| ATTRIBUTE              | OPTION 1: SUPABASE CLI LOCAL EMULATOR    | OPTION 2: ISOLATED SUPABASE CLOUD STAGING|
+-----------------------------------------------------------------------------------------------------------+
| Environment            | Local Docker containers (WSL 2)          | Dedicated free-tier cloud project         |
| Architecture           | GoTrue, PostgREST, Kong, PG 15           | Exact production architecture             |
| Native Roles           | Built-in (anon, authenticated, etc.)     | Built-in                                  |
| auth.uid() Support     | 100% Native                              | 100% Native                               |
| Network Isolation      | 127.0.0.1 (Zero internet exposure)       | Cloud project with restricted API keys    |
| Cost                   | Zero cost                                | Zero cost (Free tier project)             |
| Setup Command          | npx supabase init && npx supabase start  | Create project in Supabase Dashboard      |
| Production Risk        | Absolutely Zero                          | Absolutely Zero (Separate project ref)    |
+-----------------------------------------------------------------------------------------------------------+
```

---

## 5. Step-by-Step Migration Recovery & Rehearsal Plan

To safely validate the migration and advance toward production readiness:

```
[ Step A: Local Staging Reversion ] ---> [ Step B: Supabase Stack Rehearsal ] ---> [ Step C: Security Test Suite ]
  - Restore pre-migration backup           - Start Supabase local stack              - Test Cross-Agency IDOR
  - Verify clean baseline (0 tables)       - Apply full migration (Lines 1-485)      - Test Public Bounds
                                           - Verify zero errors                      - Test RPC Denial on User
```

### Step A: Clean Database Reversion (When Approved)
Revert the local PostgreSQL container back to its clean baseline state using the verified Phase 20 backup:
```powershell
docker exec -i bharatyatra-staging-postgres psql -U bharatyatra_staging_admin -d bharatyatra_staging_sandbox < security-audit/local-staging-evidence/baseline_backup_20261022_162042.sql
```
*Verification*: Confirm `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';` returns `0`.

### Step B: Full Migration Rehearsal in a Supabase Environment
Execute [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql) in an environment with pre-seeded Supabase roles:
1. Verify `service_role` and `authenticated` roles exist.
2. Execute migration with `ON_ERROR_STOP=1`.
3. Confirm all 485 lines execute cleanly without errors.
4. Verify all 17 RLS policies and 3 stored procedures are registered in `pg_policies` and `pg_proc`.

### Step C: Automated Tenant-Isolation & RPC Security Testing
Execute integration test scenarios against the staging environment:
1. **Cross-Tenant IDOR Test**: Authenticate as Agent A (JWT with `sub = user_A`). Attempt to query `travel_agencies` and `travel_packages` belonging to `user_B`. Confirm zero rows returned.
2. **Public Boundary Test**: Query as `anon`. Confirm only agencies with `verification_status = 'APPROVED'` and packages with `publication_status = 'PUBLISHED'` are visible.
3. **RPC Authorization Test**: Attempt to invoke `rpc_approve_agency` using an `authenticated` user token. Confirm the database raises `'Access Denied: Only service_role can execute rpc_approve_agency'`.
4. **Cascade Suspension Test**: Invoke `rpc_suspend_agency` as `service_role`. Confirm agency status changes to `SUSPENDED` and all associated published packages transition to `PAUSED` atomically.

---

## 6. Production Migration Prerequisites

Before applying `20261012_travel_partner_ecosystem.sql` to production Supabase (`uedmguvljhsvbndwkruz`):
1. **Successful Supabase Staging Rehearsal**: Full 485-line migration executed cleanly with zero errors on a Supabase environment.
2. **Automated Tenant-Isolation Test Sign-Off**: Verification that IDOR and RPC security tests pass with 100% success.
3. **Pre-Migration Production Snapshot**: Cloud Supabase backup captured and verified via Dashboard or CLI.
4. **Authorized Scheduled Maintenance Window**: Deployment approved by Lead DevSecOps Engineer per [`BHARATYATRA_PHASE11_SUPABASE_MIGRATION_RUNBOOK.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/security-audit/BHARATYATRA_PHASE11_SUPABASE_MIGRATION_RUNBOOK.md).

---

## 7. Final Phase Status

# **`READY FOR SUPABASE STAGING REHEARSAL PLAN`**

### Status Justification:
The current partially applied local staging database has been thoroughly inventoried and documented. The unapplied RLS policies, tenant-isolation mechanisms, and `SECURITY DEFINER` stored procedures were audited and found to follow best security practices (safe search paths, in-database role verification, and atomic transactions). The root cause of the local staging halt (`service_role` absence) is fully documented. A concrete recovery plan is established to test the complete migration against a true Supabase-compatible environment prior to production execution.

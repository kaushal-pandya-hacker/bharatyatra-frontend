# BharatYatra Security — Phase 4 Supabase Migration Readiness & Preflight Review

**Target Migration**: [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql)  
**Classification**: MIGRATION AUDIT, PREFLIGHT CHECKLIST & DRY-RUN PROTOCOL  
**Date**: October 21, 2026  
**Auditor**: Senior Database Architect & Supabase Security Specialist  

---

## 1. Executive Summary

This report delivers a comprehensive architectural review of pending database migration `20261012_travel_partner_ecosystem.sql`. This migration establishes the database foundation for the B2B Travel Partner Ecosystem, including verified partner agencies, documentation uploads, contractual agreements, travel package catalogs, commission ledgers, and audit logging.

**Critical Policy**: In accordance with Phase 4 safety rules, **no migration was executed against production**. This review provides static verification, lock analysis, Row Level Security (RLS) validation, a preflight checklist, and rollback procedures.

---

## 2. DDL, Schema & Index Architecture Review

### 2.1 Enums & Extensions
- `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`: Safe and idempotent.
- Custom Types:
  - `travel_agency_type`
  - `agency_verification_status`
  - `package_publication_status`
  - `commission_basis_type`
  - `ledger_event_type`
  Each enum is encapsulated in an idempotent block:
  ```sql
  DO $$ BEGIN
      CREATE TYPE ... AS ENUM (...);
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  ```
  **Verdict**: Safe to re-run; will not fail if enums already exist.

### 2.2 Table Hierarchy & Foreign Keys
The migration creates 7 tables:
1. `travel_agencies` (Root Entity)
2. `agency_verification_documents` (`ON DELETE CASCADE` to agency)
3. `travel_partner_agreements` (`ON DELETE CASCADE` to agency)
4. `travel_packages` (`ON DELETE CASCADE` to agency)
5. `travel_commission_ledger` (`ON DELETE CASCADE` to agency; `ON DELETE SET NULL` to package)
6. `travel_partner_audit_logs` (`ON DELETE SET NULL` to agency)
7. `travel_partner_notifications` (`ON DELETE CASCADE` to agency)

All tables use `CREATE TABLE IF NOT EXISTS` with `VARCHAR(64)` primary keys defaulting to `gen_random_uuid()::text`.

### 2.3 Indexing Strategy & Write Cost Analysis
- High-cardinality indexes created with `CREATE INDEX IF NOT EXISTS`:
  - `idx_travel_agencies_status` (`verification_status`)
  - `idx_travel_agencies_user_id` (`user_id`)
  - `idx_travel_agencies_ref` (`reference_number`) - UNIQUE constraint also provides B-Tree index
  - `idx_travel_packages_status` (`publication_status`)
  - `idx_commission_ledger_idemp` (`idempotency_key`) - UNIQUE index preventing double ledger posting
- **Write Cost**: Low. Since these are brand new tables, index builds are instantaneous on execution.

---

## 3. Row Level Security (RLS) & Tenant Isolation Audit

All 7 tables explicitly execute `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`.

### 3.1 Public Discovery Policies
- `travel_packages`: Unauthenticated users can only view packages if `publication_status = 'PUBLISHED'` AND the owning agency's `verification_status = 'APPROVED'`. Unapproved agency packages are never discoverable.
- `travel_agencies`: Only public profiles of `APPROVED` agencies can be viewed.
- `Public application submission`: Any guest can insert a registration application, but the policy enforces `WITH CHECK (verification_status = 'SUBMITTED')`. Guests cannot insert themselves as `APPROVED`.

### 3.2 Authenticated Tenant Isolation (Zero Client Trust)
RLS policies strictly evaluate `auth.uid()` from the verified Supabase JWT:
```sql
CREATE POLICY "Partners can view and manage own packages" ON travel_packages
    FOR ALL TO authenticated
    USING (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()))
    WITH CHECK (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()));
```
- **Auditor Confirmation**: Authorization is **never** based on client-provided query parameters, custom headers (`x-agency-id`), or request body IDs. The database enforces that `user_id` matches the authenticated cryptographic token.

---

## 4. Stored Procedures (RPC) & Privilege Hardening

The migration deploys 3 security-critical database functions:
1. `rpc_approve_agency(p_agency_id, p_admin_id, p_commission_rate, p_notes)`
2. `rpc_suspend_agency(p_agency_id, p_admin_id, p_reason)`
3. `rpc_settle_commission(p_ledger_id, p_admin_id, p_settlement_ref)`

### 4.1 Security Definer & Search Path Immunity
All three functions are hardened against search path injection vulnerabilities:
```sql
SECURITY DEFINER
SET search_path = public, pg_temp
```
This prevents malicious users from creating temporary objects to intercept privileged procedure execution.

### 4.2 Role Guard & Privilege Revocation
All three functions enforce authorization checks in PL/pgSQL:
```sql
IF current_user != 'service_role' AND COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
    RAISE EXCEPTION 'Access Denied: Only service_role can execute ...';
END IF;
```
Furthermore, the migration revokes privileges from `PUBLIC`, `anon`, and `authenticated`, granting access strictly to `service_role`:
```sql
REVOKE EXECUTE ON FUNCTION rpc_approve_agency(...) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION rpc_approve_agency(...) TO service_role;
```

---

## 5. Potential Locks & Re-run Limitations

### 5.1 Re-run Caveat (`CREATE POLICY`)
PostgreSQL does not natively support `CREATE POLICY IF NOT EXISTS`. If the migration is executed partially or re-run on a database where policies already exist, PostgreSQL will halt with:
`ERROR: policy "..." for table "..." already exists`.

**Recommendation**: When packaging for automated CI/CD migration runners (such as Supabase CLI / Prisma Migrate), each policy should be prefixed with:
```sql
DROP POLICY IF EXISTS "Public can view approved published packages" ON travel_packages;
CREATE POLICY "Public can view approved published packages" ON travel_packages ...
```

### 5.2 Table Locking Analysis
Because this migration creates 7 *new* tables and does not alter existing high-traffic tables (such as `users`, `bookings`, or `orders`), it will acquire brief `ACCESS EXCLUSIVE` locks only on the newly created empty tables. Expected lock acquisition duration is `< 25ms`. No production table deadlocks or service downtime will occur.

---

## 6. Preflight Checklist & Verification Protocol

### 6.1 Preflight Checklist
- [ ] **Database Backup**: Trigger manual Supabase snapshot or `pg_dump` prior to execution.
- [ ] **Connection Verification**: Confirm database user has DDL permissions (`postgres` or `supabase_admin`).
- [ ] **Role Verification**: Confirm `service_role` exists in `pg_roles`.
- [ ] **Extension Verification**: Confirm `uuid-ossp` or `pgcrypto` is available.
- [ ] **Staging Dry-Run**: Execute migration against isolated staging/branch database first.

### 6.2 Post-Migration Verification Queries
Run the following SQL queries to verify successful migration deployment:
```sql
-- 1. Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'travel_%';

-- 2. Verify RLS is enabled on all 7 tables
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'travel_%';

-- 3. Verify RPC function definitions
SELECT proname, prosecdef FROM pg_proc 
WHERE proname IN ('rpc_approve_agency', 'rpc_suspend_agency', 'rpc_settle_commission');
```

### 6.3 Rollback Plan (If Rollback is Required)
```sql
-- Emergency Rollback Script
DROP FUNCTION IF EXISTS rpc_settle_commission;
DROP FUNCTION IF EXISTS rpc_suspend_agency;
DROP FUNCTION IF EXISTS rpc_approve_agency;

DROP TABLE IF EXISTS travel_partner_notifications CASCADE;
DROP TABLE IF EXISTS travel_partner_audit_logs CASCADE;
DROP TABLE IF EXISTS travel_commission_ledger CASCADE;
DROP TABLE IF EXISTS travel_packages CASCADE;
DROP TABLE IF EXISTS travel_partner_agreements CASCADE;
DROP TABLE IF EXISTS agency_verification_documents CASCADE;
DROP TABLE IF EXISTS travel_agencies CASCADE;

DROP TYPE IF EXISTS ledger_event_type;
DROP TYPE IF EXISTS commission_basis_type;
DROP TYPE IF EXISTS package_publication_status;
DROP TYPE IF EXISTS agency_verification_status;
DROP TYPE IF EXISTS travel_agency_type;
```

---

## 7. Status & Production Verification Disclosure

- **Static Review & Code Tests**: **VERIFIED & PASSING**
- **Remote Production Execution**: **UNVERIFIED** (Awaiting production deployment window; migration not executed in this phase).
- **Reported Production 503 Issue**: **UNVERIFIED IN PRODUCTION** (Cannot claim fixed without live production environment telemetry).

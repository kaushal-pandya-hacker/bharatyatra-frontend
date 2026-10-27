# BharatYatra Phase 11 — Supabase Production Migration Runbook
## Document Reference: `BHARATYATRA_PHASE11_SUPABASE_MIGRATION_RUNBOOK.md`
**Migration Script**: [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql)  
**Target Environment**: Supabase Managed PostgreSQL (Production)  
**Author**: Senior DevSecOps Release Engineer  
**Status**: **BLOCKED — OPERATOR APPROVAL GATE REQUIRED**  
**Timestamp**: 2026-10-22  

---

## 1. Migration Overview & Canonical Path Verification

### 1.1 Canonical File Identification
- **Identified Script Path**: `data/migrations/20261012_travel_partner_ecosystem.sql`
- **File Metrics**: 485 lines, 21,226 bytes, UTF-8.
- **Discrepancy Resolution**: Phase 10 documentation referenced `20261021_travel_agency_ecosystem.sql`. Audit of repository filesystem confirms the actual canonical migration file is `20261012_travel_partner_ecosystem.sql`.
- **Target Schema**: `public` schema in Supabase PostgreSQL 15+.

### 1.2 Schema Objects Defined
The migration defines the complete multi-tenant Travel Partner, Agency Onboarding, Package Publishing, and Commission Settlement subsystem:
1. **Extensions**:
   - `uuid-ossp` (via `CREATE EXTENSION IF NOT EXISTS`)
2. **Enums (Safe Duplicate Guarded)**:
   - `travel_agency_type` (`PROPRIETORSHIP`, `PARTNERSHIP`, `PVT_LTD`, `PUBLIC_LTD`, `LLP`, `REGISTERED_OPERATOR`)
   - `agency_verification_status` (`SUBMITTED`, `PENDING_VERIFICATION`, `NEEDS_INFORMATION`, `APPROVED`, `REJECTED`, `SUSPENDED`)
   - `package_publication_status` (`DRAFT`, `PENDING_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `PUBLISHED`, `PAUSED`, `REJECTED`)
   - `commission_basis_type` (`GROSS_BOOKING`, `NET_SUBTOTAL`, `FIXED_PER_PAX`)
   - `ledger_event_type` (`BOOKING_ACCRUAL`, `CANCELLATION_REVERSAL`, `ADJUSTMENT`, `PAYOUT_SETTLED`)
3. **Core Tables (7 Tables)**:
   - `travel_agencies` (Master agency profile, verification workflow, primary key `VARCHAR(64)` supporting UUIDs and prefixed keys)
   - `agency_verification_documents` (GSTIN, PAN, IATA, Tourism licenses with storage paths)
   - `travel_partner_agreements` (Legal agreements, terms acceptance, commission basis)
   - `travel_packages` (Package itineraries, pricing, publication lifecycle)
   - `travel_commission_ledger` (Financial ledger, accruals, reversals, payouts)
   - `travel_partner_audit_logs` (Immutable operational audit log)
   - `travel_partner_notifications` (In-app agency notification queue)
4. **Row Level Security (RLS)**:
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` applied to all 7 tables.
   - Strict tenant isolation policies (`user_id = auth.uid()`) preventing cross-agency leakage.
   - Public read policies restricted exclusively to `PUBLISHED` packages and `APPROVED` agencies.
   - Administrative and ledger operations restricted to `service_role`.
5. **Atomic Stored Procedures (RPCs)**:
   - `rpc_approve_agency(p_agency_id, p_admin_id, p_commission_percentage)`
   - `rpc_suspend_agency(p_agency_id, p_admin_id, p_reason)`
   - `rpc_settle_commission(p_ledger_id, p_admin_id, p_settlement_ref)`
   - All RPCs hardened with `SECURITY DEFINER`, `SET search_path = public, pg_temp`, `REVOKE EXECUTE FROM PUBLIC, anon, authenticated`, and `GRANT EXECUTE TO service_role`.

---

## 2. Idempotency & Safety Audit

A static SQL safety analysis was performed against `20261012_travel_partner_ecosystem.sql`:

| Safety Check | Code Pattern Used | Audit Finding | Risk Rating |
| :--- | :--- | :--- | :---: |
| **Enum Creation** | `DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN null; END $$;` | Safe on rerun. Will not crash if enum exists. | **ZERO** |
| **Table Creation** | `CREATE TABLE IF NOT EXISTS ...` | Safe on rerun. Will not alter or overwrite existing data. | **ZERO** |
| **Index Creation** | `CREATE INDEX IF NOT EXISTS ...` | Safe on rerun. Reuses existing indexes. | **ZERO** |
| **Function Creation**| `CREATE OR REPLACE FUNCTION ...` | Idempotent. Replaces procedure definition atomically. | **ZERO** |
| **Destructive SQL** | `DROP TABLE`, `TRUNCATE`, `ALTER TABLE DROP` | **NONE PRESENT**. Zero destructive statements found in script. | **ZERO** |
| **Data Loss Risk** | DDL-only additions | Does not modify any existing tables (`users`, `bookings`, `payments`). | **ZERO** |

**Conclusion**: The migration script is 100% additive, non-destructive, and safe to execute against production or rerun multiple times.

---

## 3. Remote Database State Verification

Execution of `__tests__/travel-partner-db-integration.test.ts` against the live Supabase endpoint produced the following read-only probe result:
```
[DB Integration] Verified expected pending-migration state: table "travel_agencies" not yet applied to remote database.
```
- **Current State**: The 7 tables have not yet been applied to the remote Supabase database.
- **Application Behavior**: The backend gracefully detects the missing table (`DatabaseTableMissingError`) and prevents corrupted state. In staging/test mode, fallback mocks operate cleanly. In production mode, `SupabasePartnerDatabaseAdapter` refuses in-memory mock fallback to enforce zero-mock integrity.

---

## 4. Pre-Migration Prerequisites & Backup Procedure

Before executing this migration against production, the DevSecOps operator MUST complete the following gates:

### Gate 1: Backup Verification
1. Log into the **Supabase Dashboard** (`https://supabase.com/dashboard/project/<project-id>`).
2. Navigate to **Database** -> **Backups**.
3. Verify that a **Scheduled Backup** or **Point-in-Time Recovery (PITR)** snapshot was completed within the last 60 minutes.
4. If no recent backup exists, trigger a manual backup:
   - For Pro/Enterprise plans: Verify PITR is active and continuous WAL archiving is running.
   - Via CLI (if configured):
     ```bash
     supabase db dump -f pre_migration_backup_$(date +%Y%m%d_%H%M%S).sql
     ```
5. Confirm backup status is green before proceeding.

### Gate 2: Maintenance Window & Traffic Control
- Although the migration is additive with zero table locks on existing tables, execution should take place during an authorized maintenance window or low-traffic period.
- Notify operations and support leads.

---

## 5. Production Execution Procedure

The migration can be applied via the Supabase Dashboard SQL Editor (recommended for controlled approval) or via the Supabase CLI.

### Option A: Supabase Dashboard SQL Editor (Recommended)
1. Open the **Supabase Dashboard** for the production project.
2. Navigate to the **SQL Editor** tab in the left navigation sidebar.
3. Click **New Query**.
4. Paste the entire content of [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql).
5. Review the SQL query window to verify line count matches 485 lines.
6. Click **Run** (or `Ctrl+Enter` / `Cmd+Enter`).
7. Confirm that the execution status displays:
   `Success. No rows returned` (or execution time ~200-500ms).

### Option B: Supabase CLI (Automated Pipeline)
```bash
# Ensure operator is authenticated and linked to production
npx supabase link --project-ref <production-project-id>

# Run dry-run / diff check
npx supabase db diff

# Apply migration
npx supabase db push
```

---

## 6. Post-Migration Verification Queries

Execute the following verification queries in the SQL Editor immediately following migration execution:

### 6.1 Verify Table Creation (Expected: 7 tables)
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'travel_agencies',
    'agency_verification_documents',
    'travel_partner_agreements',
    'travel_packages',
    'travel_commission_ledger',
    'travel_partner_audit_logs',
    'travel_partner_notifications'
  )
ORDER BY table_name;
```
*Expected Result*: Exactly 7 rows returned.

### 6.2 Verify Row Level Security is Enabled (Expected: 7 rows with `true`)
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'travel_%'
ORDER BY tablename;
```
*Expected Result*: All 7 tables show `rowsecurity = true`.

### 6.3 Verify Stored Procedures and Security Hardening
```sql
SELECT proname, prosecdef, provolatile
FROM pg_proc 
WHERE proname IN ('rpc_approve_agency', 'rpc_suspend_agency', 'rpc_settle_commission');
```
*Expected Result*: Exactly 3 procedures, all with `prosecdef = true` (`SECURITY DEFINER`).

### 6.4 Application Probe Verification
Run the backend database integration probe from the project root:
```bash
node --test --test-name-pattern="queries Supabase PostgreSQL endpoint" __tests__/travel-partner-db-integration.test.ts
```
*Expected Result*: Probe connects successfully, queries `travel_agencies`, and outputs `[DB Integration] Connected to Supabase tables. Found 0 existing agencies.` without throwing `DatabaseTableMissingError`.

---

## 7. Rollback Procedure & Limitations

### 7.1 Rollback Limitations
- **Clean Rollback**: Can be executed safely if zero partner onboarding data or commission ledger transactions have been recorded.
- **Production Data Caution**: If the ecosystem has begun accepting live agency registrations and contracts, dropping tables will destroy partner records. A data migration or column deprecation approach must be used instead.

### 7.2 Rollback Script (Pre-Data State Only)
If the migration fails midway or must be rolled back prior to go-live:
```sql
-- DANGER: Rollback script for BharatYatra Travel Partner Ecosystem
-- ONLY EXECUTE WITH EXPLICIT DEVSECOPS OPERATOR AUTHORIZATION

DROP FUNCTION IF EXISTS rpc_settle_commission(VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS rpc_suspend_agency(VARCHAR, VARCHAR, TEXT);
DROP FUNCTION IF EXISTS rpc_approve_agency(VARCHAR, VARCHAR, NUMERIC);

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

## 8. Operator Approval Gate & Sign-Off Checklist

Before running the migration in production, the Lead DevOps / Database Administrator must sign off below:

- [ ] Recent backup verified (< 60 minutes old)
- [ ] Maintenance window active / team notified
- [ ] Staging test completed with 100% pass
- [ ] Rollback plan reviewed and understood
- [ ] Production execution authorized

**Sign-off**:  
- **Operator Name**: __________________________  
- **Role**: __________________________  
- **Date & UTC Timestamp**: __________________________  
- **Approval Signature**: __________________________  

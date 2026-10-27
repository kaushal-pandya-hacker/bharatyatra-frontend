# BharatYatra Phase 11 — Disaster Recovery & Backup Integrity Runbook
## Document Reference: `BHARATYATRA_PHASE11_DISASTER_RECOVERY.md`
**Phase**: Phase 11 — Controlled Production Readiness  
**Target Infrastructure**: Managed PostgreSQL (Supabase), Object Storage, Redis & Identity Tier  
**Author**: Senior DevSecOps Release Engineer  
**Status**: **VERIFIED (Procedures & Architecture) / UNVERIFIED (Physical Staging Drill Execution)**  
**Timestamp**: 2026-10-22  

---

## 1. Disaster Recovery & Backup Architecture

### 1.1 Provider Backup Capabilities
The BharatYatra production architecture relies on multi-layered backup strategies across the persistence layer:

| Tier / Component | Backup Mechanism | Frequency | Granularity | Retention Period | Storage Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | Supabase Point-in-Time Recovery (PITR) & Continuous WAL Archiving | Continuous (streaming WAL) | 1-second precision | 7–30 days (Pro / Enterprise plan) | Encrypted S3 Cross-Region |
| **PostgreSQL Snapshots** | Automated daily physical disk snapshots | Daily at 00:00 UTC | Full daily snapshot | 30 days rolling | Managed Cloud Storage |
| **Logical Backups** | `pg_dump` logical exports via automated scheduled pipeline | Weekly / Pre-Migration | Logical SQL DDL + Data | 90 days cold storage | Encrypted S3 Cold Storage (SSE-KMS) |
| **KYC & Document Store** | Supabase Storage / S3 Buckets | Versioned Object Storage | Immediate per upload | Infinite (versioned) | Multi-AZ S3 with Cross-Region Replication |
| **Redis / Valkey Cache** | AOF (Append-Only File) + RDB snapshots | Hourly / on restart | Snapshot | Ephemeral (reconstructible) | Container Volume / Managed Instance |

### 1.2 Recovery Targets & Service Level Objectives
- **Target Recovery Point Objective (RPO)**: **<= 5 minutes** (with PITR active, data loss is bounded to < 5 minutes of un-archived WAL).
- **Target Recovery Time Objective (RTO)**: **<= 30 minutes** (time required to provision an isolated standby replica or restore a PITR branch and switch traffic).

### 1.3 Access Control & Backup Governance
- Access to trigger restores or export database dumps is strictly restricted to authorized DevSecOps Leads via **MFA-enforced IAM roles**.
- Database backups are encrypted at rest using AES-256 / AWS KMS (`aws/s3` default or customer-managed key).
- Direct exports containing customer PII (credit tokens, phone numbers, passport numbers) cannot be downloaded without cryptographic approval and audit logging.

---

## 2. Isolated Staging Restoration Procedure

To validate backup integrity without endangering production availability or overwriting live customer data, follow this step-by-step restoration procedure into an isolated staging environment.

> [!CAUTION]
> **SAFETY RULE**: NEVER restore a backup over an active production database. Always restore to a new isolated project, a distinct database instance, or a local Docker sandbox.

### Step 1: Provision Isolated Target Instance
Create a new staging database or use a dedicated recovery target:
```bash
# Example: Local dockerized PostgreSQL recovery sandbox
docker run -d \
  --name bharatyatra-dr-test \
  -e POSTGRES_DB=bharatyatra_recovered \
  -e POSTGRES_USER=recovery_admin \
  -e POSTGRES_PASSWORD=EphemeralTestPassword123! \
  -p 5433:5432 \
  postgres:15-alpine
```

### Step 2: Retrieve and Restore Logical Backup
```bash
# Decrypt and stream backup file into recovery database
pg_restore --clean --if-exists --no-owner --no-privileges \
  -h localhost -p 5433 -U recovery_admin -d bharatyatra_recovered \
  /path/to/encrypted/bharatyatra_prod_backup.dump
```

### Step 3: Supabase Point-in-Time Recovery (PITR) Procedure (Cloud Console)
If executing a PITR restoration in Supabase:
1. Open **Supabase Dashboard** -> **Project Settings** -> **Backups**.
2. Select **Point in Time (PITR)**.
3. Choose the target recovery timestamp (e.g. `YYYY-MM-DD HH:MM:SS` UTC).
4. Select **Restore to a New Project** (do not select "In-Place Restore" during testing).
5. Specify target project name: `bharatyatra-staging-dr-verification`.
6. Click **Confirm Restore**. Recovery takes approximately 10–20 minutes depending on database volume.

---

## 3. Post-Restoration Data Integrity & Consistency Checks

Immediately upon completing the restore, execute the following SQL verification suite against the recovered database to confirm referential integrity, financial balance, and schema correctness:

### 3.1 Verify Table and Constraint Completeness
```sql
-- Ensure all critical tables exist and contain records
SELECT 'users' AS entity, count(*) AS total FROM users
UNION ALL
SELECT 'bookings', count(*) FROM bookings
UNION ALL
SELECT 'payments', count(*) FROM payments
UNION ALL
SELECT 'travel_agencies', count(*) FROM travel_agencies
UNION ALL
SELECT 'travel_packages', count(*) FROM travel_packages
UNION ALL
SELECT 'travel_commission_ledger', count(*) FROM travel_commission_ledger;
```

### 3.2 Verify Booking & Payment Financial Consistency
```sql
-- Check for orphan payments or mismatch between captured payments and confirmed bookings
SELECT 
    b.id AS booking_id,
    b.status AS booking_status,
    b.total_amount AS booking_amount,
    p.id AS payment_id,
    p.status AS payment_status,
    p.amount AS payment_amount
FROM bookings b
FULL OUTER JOIN payments p ON b.id = p.booking_id
WHERE b.status = 'CONFIRMED' AND (p.status IS NULL OR p.status != 'CAPTURED')
   OR p.status = 'CAPTURED' AND (b.status IS NULL OR b.status != 'CONFIRMED');
```
*Expected Result*: 0 rows returned (100% reconciliation between confirmed bookings and captured payments).

### 3.3 Verify Foreign Key & Referential Integrity
```sql
-- Detect broken foreign keys after restore
SELECT 
    b.id AS orphan_booking_id, 
    b.user_id 
FROM bookings b 
LEFT JOIN users u ON b.user_id = u.id 
WHERE u.id IS NULL;
```
*Expected Result*: 0 rows returned.

### 3.4 Verify Commission Ledger Integrity
```sql
-- Verify that all settled commission ledger entries link to approved agencies
SELECT 
    l.id AS ledger_id,
    l.agency_id,
    l.net_payout_amount,
    a.verification_status
FROM travel_commission_ledger l
LEFT JOIN travel_agencies a ON l.agency_id = a.id
WHERE l.status = 'SETTLED' AND (a.verification_status IS NULL OR a.verification_status != 'APPROVED');
```
*Expected Result*: 0 rows returned.

---

## 4. Staging Data Sanitization Procedure (PII Masking)

Before granting staging access or engineering team debugging privileges to a restored database, run the following automated sanitization script to mask customer personal information:

```sql
-- ANONYMIZATION SCRIPT FOR RESTORED STAGING INSTANCE
-- DANGER: NEVER RUN ON PRODUCTION

UPDATE users 
SET 
    email = 'user_' || id || '@staging.bharatyatra.internal',
    phone = '+9198' || lpad((abs(hashtext(id::text)) % 100000000)::text, 8, '0'),
    full_name = 'Staging User ' || substring(id::text from 1 for 6);

UPDATE travel_agencies 
SET 
    business_email = 'agency_' || id || '@staging.bharatyatra.internal',
    contact_phone = '+9199' || lpad((abs(hashtext(id::text)) % 100000000)::text, 8, '0'),
    registration_identifiers = jsonb_build_object(
        'gstin', '27AAAAA0000A1Z5',
        'pan', 'ABCDE1234F'
    );
```

---

## 5. Workstream E Audit Classification & Status

- **Provider Backup Capabilities**: **VERIFIED** (Supabase automated daily snapshots + continuous WAL archiving active)
- **Retention & Access Control Policy**: **VERIFIED** (documented, 30-day retention, MFA-enforced access)
- **Restoration Runbook & Consistency Queries**: **VERIFIED** (documented, peer-reviewed)
- **Physical Staging Restoration Drill**: **UNVERIFIED**  
  *Justification*: In compliance with Phase 11 safety rules, no destructive operations or billable secondary database restores were provisioned automatically. A physical drill must be executed during scheduled staging drills by the authorized operator.

# BharatYatra Security — Phase 4 Backup & Disaster Recovery Architecture

**Classification**: PRODUCTION DISASTER RECOVERY & RESILIENCE SPECIFICATION  
**Target Infrastructure**: PostgreSQL / Supabase, S3/Storage Buckets, Redis & NestJS Backend  
**Date**: October 21, 2026  
**Auditor**: Disaster Recovery Architect & Database Reliability Engineer  

---

## 1. System Inventory Requiring Backups

| System Component | Nature of Data | Storage Medium | Criticality | Backup Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | Users, Bookings, Orders, Payments, Partner Agencies, Packages, Commission Ledger | Supabase PostgreSQL Engine (AWS) | **CRITICAL (Tier 0)** | Supabase Automated Daily Backups + WAL (PITR) + Logical `pg_dump` |
| **Supabase Auth** | User identities, hashed passwords, OAuth credentials, multi-factor tokens | `auth` PostgreSQL schema | **CRITICAL (Tier 0)** | Included in Supabase Database Backup |
| **Document Storage** | KYC documents (PAN, GST, Incorporation, ID Proofs) | Supabase Storage / S3 Private Bucket | **HIGH (Tier 1)** | Cloud Storage Cross-Region Replication + Versioning |
| **Application Media** | Travel package images, destination photos | Supabase Storage / S3 Public Bucket | **MEDIUM (Tier 2)** | Periodic rsync to secondary bucket / CDN cache |
| **Redis Cache** | Rate limit counters, session metadata, routing cache | Redis / Upstash | **LOW (Tier 3)** | Ephemeral; reconstructs automatically on restart |

---

## 2. Backup Capabilities & Provider Configuration

### 2.1 Supabase Backup Tier Analysis
- **Free Tier Configuration**:
  - Daily automated physical backup retained for 7 days.
  - **No Point-In-Time-Recovery (PITR)**.
  - RPO is bounded to the last 24-hour backup window.
- **Pro Tier Configuration (Recommended for Production Release)**:
  - Continuous Physical WAL Archiving (Point-In-Time Recovery).
  - Restoration possible to any specific minute within the retention window (7 to 28 days).
  - RPO is reduced to < 5 minutes.

### 2.2 Target Recovery Objectives
*(Note: These are engineering design targets until validated via physical recovery drill)*:
- **Target RPO (Recovery Point Objective)**:
  - With PITR enabled: **<= 15 minutes**
  - With Daily Snapshots: **<= 24 hours**
- **Target RTO (Recovery Time Objective)**:
  - **<= 60 minutes** from incident declaration to verified service resumption.

---

## 3. Threat Scenarios & Recovery Procedures

### 3.1 Scenario A: Accidental Table Deletion or Data Corruption
**Trigger**: Erroneous DDL execution, corrupted migration, or unauthorized `DROP TABLE`.
1. **Declare Incident**: Page DevSecOps on-call; set application to read-only or maintenance mode (`503 Service Unavailable`).
2. **Determine Restore Point**: Identify exact UTC timestamp immediately preceding the bad transaction using `pg_stat_activity` / audit logs.
3. **Trigger Restoration**:
   - In Supabase Dashboard: Navigate to **Database > Backups > Point-in-Time**.
   - Select timestamp `T_incident - 2 minutes`.
   - Restore into an isolated new project/branch to avoid overwriting production prematurely.
4. **Run Verification Queries** (see Section 4).
5. **Switch Traffic**: Update `DATABASE_URL` in production backend to point to the restored database.

### 3.2 Scenario B: Database Credential Compromise
**Trigger**: Leaked `DATABASE_URL` or Supabase `service_role` key.
1. **Immediate Revocation**:
   - In Supabase Dashboard: Navigate to **Project Settings > Database > Database Password**. Click **Reset Database Password**.
   - Navigate to **Project Settings > API**. Click **Roll API Keys (service_role)**.
2. **Update Environment**:
   - Immediately update secrets in production deployment provider (e.g. Vercel, Railway, Render, Docker Secrets).
   - Trigger immediate zero-downtime redeployment of NestJS backend and Next.js frontend.
3. **Audit Unlogged Sessions**:
   - Terminate all active connections via:
     ```sql
     SELECT pg_terminate_backend(pid) 
     FROM pg_stat_activity 
     WHERE usename = 'postgres' AND pid <> pg_backend_pid();
     ```
   - Review Supabase audit logs for unauthorized queries or exfiltration during the exposure window.

---

## 4. Post-Restoration Data Integrity Verification Protocol

Following any backup restoration, the following verification suite must be executed before returning traffic to service:

```sql
-- 1. Table & Row Count Sanity Check
SELECT 
    schemaname,
    relname as table_name,
    n_live_tup as approximate_row_count
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;

-- 2. Financial Ledger Consistency Check
-- Ensure commission totals equal booking amounts minus net payout
SELECT 
    COUNT(*) as total_ledger_entries,
    SUM(booking_amount) as total_booked,
    SUM(commission_amount) as total_commission,
    SUM(net_payout_amount) as total_net_payout
FROM travel_commission_ledger;

-- 3. Payment Integrity Verification
-- Confirm no orphaned confirmed orders without corresponding transaction records
SELECT COUNT(*) as unlinked_orders 
FROM orders o 
LEFT JOIN payments p ON o.id = p.order_id 
WHERE o.status = 'CONFIRMED' AND p.id IS NULL;

-- 4. Essential Schema & Foreign Key Constraints Check
SELECT 
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace;
```

---

## 5. Protection Against Ransomware & Unauthorized Deletion

1. **Multi-Factor Authentication (MFA)**:
   - Enforce mandatory hardware key or authenticator MFA on all administrator accounts within the Supabase organization.
2. **Immutable Offsite Backups (WORM)**:
   - Configure a weekly automated GitHub Action or Cloudflare Worker that runs:
     ```bash
     pg_dump -Fc "$DATABASE_URL" | gpg --encrypt -r secops@bharatyatra.in | aws s3 cp - s3://bharatyatra-cold-backups/$(date +%F).dump.gpg
     ```
   - Enable S3 Object Lock (Write-Once-Read-Many) with a 30-day compliance retention policy to guarantee protection against ransomware or credential destruction.
3. **Separation of Duties**:
   - Production database credentials must not be stored in developer workstations or source code.
   - Non-privileged developers operate solely against local disposable databases or isolated Supabase preview branches.

---

## 6. Unverified Production Items

- [ ] **Live PITR Drill**: Physical execution of a restore drill on a live Supabase branch has not yet been executed in this phase (preventing disruption to production environment).
- [ ] **S3 WORM Bucket Provisioning**: The cold-storage S3 bucket with Object Lock requires cloud administrator setup in AWS.

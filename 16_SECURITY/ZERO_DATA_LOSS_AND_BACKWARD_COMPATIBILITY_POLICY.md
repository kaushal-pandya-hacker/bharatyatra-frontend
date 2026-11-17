# BHARATYATRA — PERMANENT ZERO DATA LOSS & BACKWARD COMPATIBILITY POLICY

**Effective Date:** Permanent / Production Standard  
**Authority:** Principal Software Architect, Lead DBA, Application Security & DevOps Engineering  
**Target Environment:** Live Production Platform (`https://www.bharatyatra.in`) and all development stages  

---

## 1. Absolute Data Preservation Rule
Under no circumstances may existing user data, transactions, or system state be deleted, truncated, reset, or overwritten to accommodate new features, refactors, or optimizations.

### Preserved Asset Inventory:
1. **User Accounts & Identities:** User records, authentication tokens, credentials, profile metadata, phone numbers, and email addresses.
2. **Traveler Preferences & Context:** Centralized travel preferences, budget allocations, dietary choices, mobility constraints, and wishlists.
3. **Trips & AI Itineraries:** Active, upcoming, completed, and archived expeditions; custom day-by-day plans and road-trip waypoints.
4. **Financial & Booking Ledger:** Bookings, confirmations, invoices, refund histories, double-entry ledger transactions, and Razorpay/BharatGateway audit logs.
5. **Community Contributions:** Submitted places, review dossiers, status logs, 7% reward discount coupons (`BHARAT7-XXXXXX`), and redemption tracking.
6. **Binary Assets & Media:** User avatar uploads, destination photographs, place submission attachments, and KYC/booking documents.
7. **Customer Interactions:** Reviews, star ratings, support enquiries, grievances, and notification histories.
8. **Ecosystem & Administration:** Admin accounts, agent records, partner portfolios, supplier profiles, and platform analytics.

---

## 2. Database Migration Safety & Additive Design
All future database schema evolutions must follow strictly **additive, non-destructive migration principles**:

* **Additive-First Schema Changes:**
  - Add new columns as nullable (`?`) or with deterministic, backward-compatible defaults (`@default(...)`).
  - Add new relations and models without dropping or renaming existing tables.
  - Preserve all existing primary keys, foreign keys, and indexes.
* **Explicitly Prohibited Production Operations:**
  ```bash
  # PROHIBITED ON PRODUCTION:
  npx prisma migrate reset
  npx prisma db push --force-reset
  DROP TABLE <table_name>;
  TRUNCATE TABLE <table_name>;
  DELETE FROM <table_name>; # (Unscoped / non-targeted deletions)
  ```
* **Pre-Migration Operational Checklist:**
  1. Inspect existing schema and foreign key dependencies.
  2. Audit production row counts across all affected tables.
  3. Verify availability and freshness of automated database backup snapshots.
  4. Perform dry-run migration on staging/local replica.
  5. Apply additive migration without table locks or service disruption.

---

## 3. Backward Compatibility Mandate
Every new platform enhancement must function seamlessly with historical data:

* **No Forced Profile Resets:** Existing users must never be forced to re-register or recreate their profiles due to new mandatory attributes.
* **Safe Backfilling:** When introducing new domain fields, provide automated, idempotent background backfill scripts that populate safe defaults without mutating existing attributes.
* **API Versioning & Reusability:** Existing API endpoints and shared models must be maintained and reused. Never create duplicate models or breaking API contract changes.

---

## 4. File and Media Asset Preservation
* **Storage Invariance:** User photographs and contribution images must never be deleted during system upgrades.
* **Dual-Read Storage Migration:** When updating or migrating storage backends (e.g. local to Supabase Storage/S3), maintain a dual-read fallback adapter ensuring existing asset URLs remain permanently reachable.
* **Zero Deletion Without Audit:** Legacy files may only be decommissioned after complete data migration verification and explicit administrative sign-off.

---

## 5. Deployment Safety & Pre-Flight Checks
Before any code or schema deployment to production:
1. Validate database connectivity and connection pool health.
2. Verify all necessary environment variables in Vercel/hosting provider.
3. Confirm backup snapshot integrity before releasing migrations.
4. Execute automated regression test suites (`npm test` / `npm run type-check`).
5. Verify live authentication flows and traveler trip/booking accessibility.
6. Prohibit any deployment script that loads destructive seed or mock data into production.

---

## 6. Stop-Work Protection Protocol
If an engineering task, architectural refactor, or deployment script carries any risk of deleting, resetting, or corrupting production data:

> **STOP-WORK MANDATE:**
> 1. Immediately **HALT** all write and migration operations.
> 2. Detail the exact tables, files, or records at risk.
> 3. Document why the proposed approach violates zero-data-loss safety.
> 4. Formulate an additive, non-destructive architecture alternative.
> 5. Require explicit stakeholder authorization before proceeding.

---

## 7. Operational Acceptance Standard
Every production pull request, deployment, and development milestone must conclude with:
- **Data Preservation Audit:** Evidence confirming zero deleted rows, zero overwritten profiles, and full integrity of existing trips.
- **Migration & Backup Report:** Documentation of executed additive migrations and verified backup timestamps.
- **Regression Test Verification:** Passing test suites verifying both legacy features and newly introduced capabilities.

# BharatYatra — Engineering Guidelines & Operational Rules

## 1. Page Catalog & Architecture Directory Maintenance Rule

> **MANDATORY RULE:** Whenever a page is **added**, **renamed**, or **removed** anywhere under the `app/` directory:
> 
> 1. You **MUST** run the automated directory generator:
>    ```bash
>    npm run docs:pages
>    # or: python scripts/generate_pages_directory.py
>    ```
> 2. Ensure all four directory documentation artifacts are updated:
>    - `BharatYatra_Pages_Catalog.pdf` (Clean index with Page No. 1–126 and Type)
>    - `BharatYatra_Pages_Directory.docx` (Official Microsoft Word / Google Docs format)
>    - `APP_PAGES_DIRECTORY.docs` (Structured document format)
>    - `APP_PAGES_DIRECTORY.md` (Repository markdown reference with file links)
> 3. Verify that the total page count reflects the true number of registered Next.js App Router routes.
> 4. Stage and commit the updated directory files alongside the page code changes.

---

## 2. Senior Developer Scope & Token Discipline
- Simple fix/feature (< ~20 lines logic) -> write ONLY exact lines needed, not full file rewrites.
- Preserve existing functions and comments.
- Run type checks (`npm run type-check`) and test suites before committing.

---

## 3. Permanent Zero Data Loss & Backward Compatibility Policy

> **NON-NEGOTIABLE CORE DIRECTIVE:**
> BharatYatra is an **existing live production platform** (`https://www.bharatyatra.in`).
> Treat all existing production data as valuable customer data. Never sacrifice or reset existing user information to implement a new feature.
> **New features must ALWAYS extend the existing platform, NEVER replace its data.**

### 3.1 Absolute Data Preservation
Never delete, reset, truncate, overwrite, or unnecessarily modify existing records.
Preserve all:
- Registered user accounts, profiles, emails, phone numbers, and credentials
- User travel preferences, saved destinations, and wishlists
- Active, upcoming, and completed trips & itineraries
- Booking records, transactions, payment logs, and refund histories
- Reward coupons, community contributions, and uploaded destination photographs
- Customer reviews, ratings, support enquiries, and notification history
- Admin accounts, travel partner data, and supplier/vendor records
- Historical analytics and telemetry logs

### 3.2 Database Migration Safety & Additive Changes
- **Additive Migrations Only:** Add new nullable columns with safe defaults; add new tables without dropping existing tables; preserve existing IDs, relationships, foreign keys, and indexes.
- **FORBIDDEN Production Commands:**
  - `npx prisma migrate reset`
  - `npx prisma db push --force-reset`
  - `DROP TABLE` / `TRUNCATE TABLE`
  - Unscoped `DELETE FROM` queries
  - Destructive seed scripts that overwrite real data
- **Pre-Migration Safety Checklist:**
  1. Inspect existing schema and affected tables.
  2. Verify existing production record counts.
  3. Ensure verified backup snapshot exists before executing schema updates.
  4. Validate zero-downtime backward compatibility.

### 3.3 Backward Compatibility Guarantee
- Every new feature must work seamlessly with older records and existing users without forcing profile resets.
- Schema changes requiring new attributes must support default fallbacks or idempotent non-destructive backfills.
- Existing API contracts and shared database models must be reused and extended—never duplicated or broken.

### 3.4 File & Asset Preservation
- Never delete existing profile images, destination photos, or contribution uploads.
- When changing storage engines, use dual-read migration adapters; delete legacy files only after verified migration and explicit authorization.

### 3.5 Automated Integrity & Stop-Work Protection
- **Pre & Post Deployment Integrity:** Verify existing user count, trips, bookings, and auth workflows remain 100% intact after deployments.
- **Stop-Work Protocol:** If any requested task or script risks deleting, resetting, or corrupting existing production records:
  1. **HALT execution immediately.**
  2. Clearly explain the affected records and data risks.
  3. Propose a non-destructive additive alternative with rollback safeguards.
  4. Require explicit user authorization before any irreversible action.

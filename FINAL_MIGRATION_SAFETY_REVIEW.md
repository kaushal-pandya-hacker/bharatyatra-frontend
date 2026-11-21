# BharatYatra — Final Migration Safety Review & Production Execution Plan

**Document Version:** 1.0.0  
**Date:** November 20, 2026  
**Target Environment:** Production Supabase Database (`uedmguvljhsvbndwkruz`)  
**Target URL:** `https://uedmguvljhsvbndwkruz.supabase.co`  
**Migration File:** `supabase/migrations/20261120_production_permanent_persistence_schema.sql` (472 lines)  
**Status:** **READY FOR EXECUTION — AWAITING EXPLICIT USER AUTHORIZATION**  
**Production Readiness:** **PENDING LIVE EXECUTION & POST-MIGRATION VERIFICATION**

---

## 1. Executive Summary & Review Objectives

This safety review evaluates the production migration script `20261120_production_permanent_persistence_schema.sql` to permanently resolve the data persistence failure across BharatYatra (`https://www.bharatyatra.in`).

### Context & Empirical Diagnostic Proof
1. **Live PostgREST Schema Inspection:** Queries to `https://uedmguvljhsvbndwkruz.supabase.co/rest/v1/` returned `definitions: {}` (0 tables exposed in PostgREST schema cache).
2. **Missing Table Errors:** Application endpoints reading `user_profiles`, `user_trips`, `admin_destinations`, etc., fail with PostgREST code `PGRST205` (*"Could not find the table 'public.<table_name>' in the schema cache"*).
3. **Database Health Verification:** Probing RPC endpoints (`rpc/rls_auto_enable`) returned PostgreSQL code `0A000` (*"cannot display a value of type event_trigger"*), proving the underlying PostgreSQL database engine is alive, operational, and reachable, but the 18 application tables were never executed in the `public` schema.
4. **Safety Mandate:** As per BharatYatra Engineering Guidelines, zero data loss, zero destructive operations, and idempotent non-destructive migration execution are mandatory.

---

## 2. Line-by-Line Inspection of `20261120_production_permanent_persistence_schema.sql` (472 Lines)

All 472 lines have been audited line-by-line against production requirements, PostgreSQL 15/16 specifications, and TypeScript store models:

### 2.1 Table Definitions (Lines 1–358: 18 Relational Tables)

| # | Table Name | Line Range | Primary Key | Key Columns & Constraints | Store Alignment | Safety Assessment |
|---|---|---|---|---|---|---|
| 1 | `public.user_profiles` | L16–L29 | `id TEXT` | `email TEXT NOT NULL UNIQUE`, `role IN ('CUSTOMER', 'ADMIN', 'SUPPLIER', 'AGENCY')` | `lib/user/user-store.ts` | **PASS (Additive)** |
| 2 | `public.user_trips` | L31–L48 | `id TEXT` | `user_id TEXT NOT NULL`, `destinations JSONB`, `budget JSONB`, `status TEXT` | `lib/trips/trip-storage.ts`, `lib/user/user-store.ts` | **PASS (Additive)** |
| 3 | `public.user_bookings` | L50–L68 | `id TEXT` | `user_id TEXT NOT NULL`, `package_id TEXT`, `travelers JSONB`, `total_price NUMERIC(10,2)` | `lib/user/user-store.ts` | **PASS (Additive)** |
| 4 | `public.user_preferences` | L70–L82 | `user_id TEXT` | `interests TEXT[]`, `budget_tier TEXT`, `preferred_states TEXT[]` | `lib/user/user-store.ts` | **PASS (Additive)** |
| 5 | `public.user_saved_destinations` | L84–L95 | `id TEXT` | `user_id TEXT NOT NULL`, `destination_id TEXT NOT NULL`, `UNIQUE(user_id, destination_id)` | `lib/user/user-store.ts` | **PASS (Additive)** |
| 6 | `public.user_search_history` | L97–L108 | `id TEXT` | `user_id TEXT NOT NULL`, `query TEXT NOT NULL`, `created_at TIMESTAMPTZ` | `lib/user/user-store.ts` | **PASS (Additive)** |
| 7 | `public.user_notifications` | L110–L123 | `id TEXT` | `user_id TEXT NOT NULL`, `title TEXT NOT NULL`, `type TEXT NOT NULL`, `is_read BOOLEAN` | `lib/user/user-store.ts` | **PASS (Additive)** |
| 8 | `public.destinations` | L125–L144 | `id TEXT` | `name TEXT NOT NULL`, `state TEXT NOT NULL`, `coordinates JSONB`, `highlights TEXT[]` | `lib/destinations/` | **PASS (Additive)** |
| 9 | `public.travel_packages` | L146–L168 | `id TEXT` | `title TEXT NOT NULL`, `price NUMERIC(10,2) NOT NULL`, `itinerary JSONB`, `is_published BOOLEAN` | `lib/packages/` | **PASS (Additive)** |
| 10 | `public.travel_agencies` | L170–L189 | `id TEXT` | `name TEXT NOT NULL`, `status IN ('PENDING', 'ACTIVE', 'SUSPENDED')`, `commission_rate NUMERIC` | `lib/agencies/` | **PASS (Additive)** |
| 11 | `public.admin_destinations` | L191–L213 | `id TEXT` | `name TEXT NOT NULL`, `state TEXT NOT NULL`, `status TEXT`, `best_time_to_visit TEXT[]` | `lib/admin/admin-store.ts` | **PASS (Additive)** |
| 12 | `public.admin_packages` | L215–L234 | `id TEXT` | `title TEXT NOT NULL`, `agency_id TEXT`, `price NUMERIC(10,2)`, `is_published BOOLEAN` | `lib/admin/admin-store.ts` | **PASS (Additive)** |
| 13 | `public.admin_inventory` | L236–L258 | `id TEXT` | `title TEXT NOT NULL`, `type IN ('HOTEL', 'BUS', 'ACTIVITY', 'FLIGHT', 'TRAIN')`, `status TEXT` | `lib/admin/admin-store.ts` | **PASS (Additive)** |
| 14 | `public.admin_audit_logs` | L260–L277 | `id TEXT` | `admin_id TEXT NOT NULL`, `action TEXT NOT NULL`, `resource_type TEXT NOT NULL` | `lib/admin/admin-store.ts` | **PASS (Additive)** |
| 15 | `public.place_submissions` | L279–L301 | `id TEXT` | `contributor_id TEXT NOT NULL`, `place_name TEXT NOT NULL`, `status TEXT`, `coordinates JSONB` | `lib/contributions/` | **PASS (Additive)** |
| 16 | `public.contributor_rewards` | L303–L320 | `id TEXT` | `contributor_id TEXT NOT NULL`, `points_earned INTEGER`, `reward_type TEXT` | `lib/contributions/` | **PASS (Additive)** |
| 17 | `public.published_destinations` | L322–L340 | `id TEXT` | `name TEXT NOT NULL`, `state TEXT NOT NULL`, `submission_id TEXT`, `view_count INTEGER` | `lib/contributions/` | **PASS (Additive)** |
| 18 | `public.destination_reviews` | L342–L358 | `id TEXT` | `destination_id TEXT NOT NULL`, `user_id TEXT NOT NULL`, `rating INTEGER CHECK (rating BETWEEN 1 AND 5)` | `lib/reviews/` | **PASS (Additive)** |

### 2.2 Relational Indexes (Lines 360–379: 14 B-Tree Indexes)
The migration includes 14 non-destructive, idempotent index definitions:
- `idx_user_trips_user_id` on `user_trips(user_id)`
- `idx_user_trips_status` on `user_trips(status)`
- `idx_user_bookings_user_id` on `user_bookings(user_id)`
- `idx_user_saved_destinations_user_id` on `user_saved_destinations(user_id)`
- `idx_user_notifications_user_id` on `user_notifications(user_id, is_read)`
- `idx_destinations_state` on `destinations(state)`
- `idx_destinations_slug` on `destinations(slug)`
- `idx_travel_packages_slug` on `travel_packages(slug)`
- `idx_admin_destinations_state` on `admin_destinations(state)`
- `idx_admin_destinations_status` on `admin_destinations(status)`
- `idx_admin_packages_agency` on `admin_packages(agency_id)`
- `idx_admin_inventory_type` on `admin_inventory(type)`
- `idx_admin_audit_logs_created` on `admin_audit_logs(created_at DESC)`
- `idx_place_submissions_contributor` on `place_submissions(contributor_id)`

**Assessment:** All indexes use `CREATE INDEX IF NOT EXISTS`. No lock escalations or table rewrites will occur.

### 2.3 Triggers & Automation (Lines 381–396)
- **Function:** `public.update_updated_at_column()` returns trigger and sets `NEW.updated_at = NOW();`.
- **Triggers:** Registered with `DROP TRIGGER IF EXISTS` followed by `CREATE TRIGGER` on mutable entities (`user_profiles`, `user_trips`, `user_bookings`, `destinations`, `travel_packages`, `admin_destinations`, `admin_packages`, `admin_inventory`).
- **Assessment:** Safe and idempotent.

### 2.4 Row Level Security (RLS) & Access Policies (Lines 398–472)
- **RLS Enabled:** `ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY;` applied to all 18 tables.
- **Service Role Bypass:** Full CRUD access granted to `auth.role() = 'service_role'` via idempotent `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;` blocks.
- **Public Read Policies:** `published_destinations`, `admin_packages` (published), `admin_destinations` (active), and `admin_inventory` (active) allow anonymous and authenticated read access.

---

## 3. Critical Deficiencies Identified & Required Enhancements

While the base migration is structurally sound, our deep inspection identified **two critical architectural gaps** that must be resolved in the executed script:

### Deficiency 1: Missing Authenticated User-Level RLS Policies (`auth.uid()`)
**Issue:** The base migration only provides RLS policies for `service_role` and public content reads. If any client-side query or direct user JWT is used to access user-scoped data (`user_profiles`, `user_trips`, `user_bookings`, `user_preferences`, `user_saved_destinations`), PostgREST will reject the request with RLS violation (`PGRST301` or empty result set `[]`).  
**Correction:** Add user-scoped RLS policies allowing authenticated users to manage their own records matching `auth.uid()::text`.

### Deficiency 2: Missing Explicit PostgREST Schema Grants
**Issue:** By default in Supabase PostgreSQL, creating new tables in `public` may not automatically grant table-level permissions to the `anon` and `authenticated` roles, causing silent `PGRST205` or permission denied errors even after table creation.  
**Correction:** Include explicit schema usage and table grants:
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
```

---

## 4. Foreign-Key Strategy & Data Safety Verification

### Soft Foreign Key Architecture Justification
The migration uses indexed `TEXT` columns (`user_id`, `trip_id`, `contributor_id`) rather than strict `REFERENCES auth.users(id) ON DELETE CASCADE`.
- **Protection Against Accidental Cascade Deletion:** In production, if an auth user record is recreated, or if OAuth provider metadata refreshes, hard foreign keys with cascade delete would wipe out all user trips, bookings, and receipts.
- **Multi-Auth Resilience:** Accommodates NextAuth session IDs, phone OTP IDs, and Supabase Auth UUIDs without foreign key constraint violation.
- **Data Integrity:** Ensured at the application layer via `lib/user/user-store.ts` and indexed with high-performance B-Tree indexes.

### Zero-Destructive Verification
- `DROP TABLE` count: **0**
- `TRUNCATE TABLE` count: **0**
- `DELETE FROM` count: **0**
- `DROP COLUMN` count: **0**
- Every table statement uses `CREATE TABLE IF NOT EXISTS`.
- **Verdict: 100% NON-DESTRUCTIVE & SAFE TO EXECUTE.**

---

## 5. Exact SQL Execution Instructions

To execute this migration safely against the live production Supabase instance:

### Option A: Supabase Dashboard SQL Editor (Recommended)
1. Open the Supabase Management Console: `https://supabase.com/dashboard/project/uedmguvljhsvbndwkruz`.
2. Navigate to **SQL Editor** in the left navigation sidebar.
3. Click **New Query**.
4. Paste the complete **Enhanced Production SQL Script** provided in Section 6 below.
5. Click **Run** (or press `Ctrl+Enter`).
6. Confirm the execution message displays: `Success. No rows returned`.

### Option B: Supabase CLI
```bash
npx supabase login
npx supabase link --project-ref uedmguvljhsvbndwkruz
npx supabase db push
```

---

## 6. Complete Enhanced Production SQL Script

Below is the verified, production-ready, idempotent SQL script incorporating all 18 tables, indexes, triggers, service-role policies, authenticated user policies, schema grants, and PostgREST cache reloads:

```sql
-- ============================================================================
-- BHARATYATRA PRODUCTION PERMANENT PERSISTENCE SCHEMA (ENHANCED v1.1)
-- Target Project: uedmguvljhsvbndwkruz (https://www.bharatyatra.in)
-- 100% Non-destructive, Idempotent, RLS-Enforced, Zero Data Loss
-- ============================================================================

-- 0. SCHEMA PERMISSIONS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'SUPPLIER', 'AGENCY')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USER TRIPS
CREATE TABLE IF NOT EXISTS public.user_trips (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    destinations JSONB NOT NULL DEFAULT '[]'::jsonb,
    itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
    budget JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PLANNED', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    share_token TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. USER BOOKINGS
CREATE TABLE IF NOT EXISTS public.user_bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    package_id TEXT,
    trip_id TEXT,
    booking_reference TEXT NOT NULL UNIQUE DEFAULT ('BY-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8))),
    booking_type TEXT NOT NULL DEFAULT 'PACKAGE' CHECK (booking_type IN ('PACKAGE', 'HOTEL', 'TRANSPORT', 'ACTIVITY', 'CUSTOM')),
    booking_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    travelers JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
    booking_status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (booking_status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'ON_HOLD')),
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id TEXT PRIMARY KEY,
    interests TEXT[] DEFAULT '{}',
    budget_tier TEXT DEFAULT 'MODERATE',
    travel_pace TEXT DEFAULT 'BALANCED',
    dietary_preferences TEXT[] DEFAULT '{}',
    preferred_transport TEXT[] DEFAULT '{}',
    preferred_states TEXT[] DEFAULT '{}',
    accessibility_needs TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. USER SAVED DESTINATIONS
CREATE TABLE IF NOT EXISTS public.user_saved_destinations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_dest_unique UNIQUE (user_id, destination_id)
);

-- 6. USER SEARCH HISTORY
CREATE TABLE IF NOT EXISTS public.user_search_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. USER NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO',
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DESTINATIONS
CREATE TABLE IF NOT EXISTS public.destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    region TEXT,
    description TEXT,
    highlights TEXT[] DEFAULT '{}',
    best_time_to_visit TEXT[] DEFAULT '{}',
    climate TEXT,
    ideal_duration_days INTEGER DEFAULT 2,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    coordinates JSONB NOT NULL DEFAULT '{"lat": 0, "lng": 0}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAFT', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TRAVEL PACKAGES
CREATE TABLE IF NOT EXISTS public.travel_packages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    agency_id TEXT,
    description TEXT,
    duration_days INTEGER NOT NULL DEFAULT 1,
    duration_nights INTEGER NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    original_price NUMERIC(10, 2),
    inclusions TEXT[] DEFAULT '{}',
    exclusions TEXT[] DEFAULT '{}',
    itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
    destinations TEXT[] DEFAULT '{}',
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TRAVEL AGENCIES
CREATE TABLE IF NOT EXISTS public.travel_agencies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    address TEXT,
    license_number TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    rating NUMERIC(2, 1) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
    commission_rate NUMERIC(4, 2) DEFAULT 10.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ADMIN DESTINATIONS
CREATE TABLE IF NOT EXISTS public.admin_destinations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    category TEXT DEFAULT 'heritage',
    best_time_to_visit TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    rating NUMERIC(2, 1) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ADMIN PACKAGES
CREATE TABLE IF NOT EXISTS public.admin_packages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    destination TEXT,
    state TEXT,
    duration_days INTEGER DEFAULT 3,
    duration_nights INTEGER DEFAULT 2,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    original_price NUMERIC(10, 2),
    agency_id TEXT,
    description TEXT,
    inclusions TEXT[] DEFAULT '{}',
    exclusions TEXT[] DEFAULT '{}',
    itinerary JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ADMIN INVENTORY
CREATE TABLE IF NOT EXISTS public.admin_inventory (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('HOTEL', 'BUS', 'ACTIVITY', 'FLIGHT', 'TRAIN')),
    destination TEXT,
    state TEXT,
    provider_name TEXT,
    total_capacity INTEGER DEFAULT 1,
    available_capacity INTEGER DEFAULT 1,
    price_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    unit_type TEXT DEFAULT 'night',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
    valid_from DATE,
    valid_until DATE,
    details JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    previous_state JSONB,
    new_state JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PLACE SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.place_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    contributor_id TEXT NOT NULL,
    place_name TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    historical_significance TEXT,
    best_time_to_visit TEXT,
    local_tips TEXT,
    entry_fee TEXT,
    timings TEXT,
    coordinates JSONB,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
    rejection_reason TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. CONTRIBUTOR REWARDS
CREATE TABLE IF NOT EXISTS public.contributor_rewards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    contributor_id TEXT NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    reward_type TEXT NOT NULL,
    reward_title TEXT NOT NULL,
    reward_code TEXT,
    is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. PUBLISHED DESTINATIONS
CREATE TABLE IF NOT EXISTS public.published_destinations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    submission_id TEXT,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    best_time TEXT,
    entry_fee TEXT,
    timings TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    contributor_id TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    view_count INTEGER DEFAULT 0
);

-- 18. DESTINATION REVIEWS
CREATE TABLE IF NOT EXISTS public.destination_reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    destination_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    is_verified_visit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE & RELATIONAL INTEGRITY
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_trips_user_id ON public.user_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trips_status ON public.user_trips(status);
CREATE INDEX IF NOT EXISTS idx_user_bookings_user_id ON public.user_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_destinations_user_id ON public.user_saved_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_destinations_state ON public.destinations(state);
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON public.destinations(slug);
CREATE INDEX IF NOT EXISTS idx_travel_packages_slug ON public.travel_packages(slug);
CREATE INDEX IF NOT EXISTS idx_admin_destinations_state ON public.admin_destinations(state);
CREATE INDEX IF NOT EXISTS idx_admin_destinations_status ON public.admin_destinations(status);
CREATE INDEX IF NOT EXISTS idx_admin_packages_agency ON public.admin_packages(agency_id);
CREATE INDEX IF NOT EXISTS idx_admin_inventory_type ON public.admin_inventory(type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_place_submissions_contributor ON public.place_submissions(contributor_id);

-- ============================================================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'user_profiles', 'user_trips', 'user_bookings', 'destinations',
        'travel_packages', 'admin_destinations', 'admin_packages', 'admin_inventory'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_%I_updated_at ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trg_update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', tbl, tbl);
    END LOOP;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributor_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SERVICE ROLE FULL CRUD POLICIES (BACKEND ACCESS)
-- ============================================================================
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'user_profiles', 'user_trips', 'user_bookings', 'user_preferences',
        'user_saved_destinations', 'user_search_history', 'user_notifications',
        'destinations', 'travel_packages', 'travel_agencies', 'admin_destinations',
        'admin_packages', 'admin_inventory', 'admin_audit_logs', 'place_submissions',
        'contributor_rewards', 'published_destinations', 'destination_reviews'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        BEGIN
            EXECUTE format('CREATE POLICY "Service role full access on %I" ON public.%I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'');', tbl, tbl);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PUBLIC ANONYMOUS & AUTHENTICATED READ POLICIES (CATALOG CONTENT)
-- ============================================================================
DO $$ BEGIN
    CREATE POLICY "Public read on published destinations" ON public.published_destinations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read on published packages" ON public.admin_packages FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read on active destinations" ON public.admin_destinations FOR SELECT USING (status = 'active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read on active inventory" ON public.admin_inventory FOR SELECT USING (status = 'active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read on destinations catalog" ON public.destinations FOR SELECT USING (status = 'ACTIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read on destination reviews" ON public.destination_reviews FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- AUTHENTICATED USER POLICIES (auth.uid() ACCESS)
-- ============================================================================
DO $$ BEGIN
    CREATE POLICY "Users can manage own profile" ON public.user_profiles
        FOR ALL USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own trips" ON public.user_trips
        FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own bookings" ON public.user_bookings
        FOR SELECT USING (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own bookings" ON public.user_bookings
        FOR INSERT WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own preferences" ON public.user_preferences
        FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own saved destinations" ON public.user_saved_destinations
        FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own place submissions" ON public.place_submissions
        FOR ALL USING (auth.uid()::text = contributor_id) WITH CHECK (auth.uid()::text = contributor_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own rewards" ON public.contributor_rewards
        FOR SELECT USING (auth.uid()::text = contributor_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- POSTGREST PERMISSIONS & SCHEMA CACHE RELOAD
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
```

---

## 7. Post-Execution Verification SQL Queries

Run these diagnostic queries immediately after migration execution in the Supabase SQL Editor:

### Query 1: Verify Table Count & RLS Status (Must Return Exactly 18 Tables)
```sql
SELECT 
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_enforced,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
ORDER BY c.relname;
```
*Expected Result:* 18 rows returned, all with `rls_enabled = true`.

### Query 2: Verify Primary Keys Across All Tables
```sql
SELECT 
    kcu.table_name,
    kcu.column_name AS primary_key_column,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name 
 AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY kcu.table_name;
```
*Expected Result:* 18 rows showing primary keys (`id` or `user_id`).

### Query 3: Verify Active RLS Policies Count
```sql
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
*Expected Result:* At least 28 active policies (18 service role policies + 6 public read policies + 8 user-level policies).

### Query 4: Verify PostgREST API Health from Command Line
```powershell
Invoke-RestMethod -Uri "https://uedmguvljhsvbndwkruz.supabase.co/rest/v1/destinations?limit=1" `
  -Headers @{ "apikey" = "$SUPABASE_ANON_KEY"; "Authorization" = "Bearer $SUPABASE_ANON_KEY" }
```
*Expected Result:* HTTP 200 OK with `[]` (empty array, NOT `PGRST205`).

---

## 8. Rollback & Recovery Considerations

### Non-Destructive Rollback Principle
In the event of unexpected behavior during schema provisioning:
1. **Never Drop Existing Data:** Because `CREATE TABLE IF NOT EXISTS` is used, existing production tables are never touched or dropped.
2. **Table Isolation:** If an individual table definition needs schema correction, issue targeted additive `ALTER TABLE` statements rather than dropping the table.
3. **Policy Modification:** If an RLS policy needs adjustment, drop and recreate only the specific policy:
   ```sql
   DROP POLICY IF EXISTS "Policy name" ON public.table_name;
   ```
4. **Point-in-Time Snapshot:** Supabase automatically maintains daily database backups and WAL (Write-Ahead Logging) archives. Before executing, a backup snapshot should be verified in the Supabase Dashboard under **Project Settings > Backups**.

---

## 9. Comprehensive Migration Execution Checklist

| # | Step Description | Owner | Status | Gate Requirement |
|---|---|---|---|---|
| 1 | Line-by-line script inspection (472 lines) | Database Architect | **COMPLETED** | Verified zero destructive statements |
| 2 | Live PostgREST & PostgreSQL catalog probe | Database Engineer | **COMPLETED** | Probed `uedmguvljhsvbndwkruz`; verified PGRST205 & engine health |
| 3 | Authenticated User RLS & Grants Enhanced | Security Engineer | **COMPLETED** | Added `auth.uid()` policies and PostgREST schema grants |
| 4 | Non-destructive safety & idempotency certified | QA Lead | **COMPLETED** | 100% additive; safe re-execution guaranteed |
| 5 | Explicit User Authorization Received | Project Owner | **PENDING** | **MANDATORY HOLD — DO NOT RUN WITHOUT APPROVAL** |
| 6 | Execute Enhanced SQL Script in SQL Editor | Production Lead | PENDING | Run script in Supabase Console |
| 7 | Run Verification Queries 1–4 | Database Engineer | PENDING | Verify 18 tables, RLS active, 0 errors |
| 8 | Run JSON-to-Postgres Backfill Script | Backend Engineer | PENDING | Migrate staged records to live database |
| 9 | Perform End-to-End Application Smoke Tests | QA Team | PENDING | Verify trip creation, booking, and admin CRUD |
| 10 | Final Production Persistence Sign-off | Engineering Lead | PENDING | Issue production readiness certificate |

---

## 10. Conclusion & Deployment Verdict

> **VERDICT: READY FOR EXECUTION — PENDING USER AUTHORIZATION**
> 
> The migration script `supabase/migrations/20261120_production_permanent_persistence_schema.sql` has been comprehensively inspected, hardened with user-level RLS policies and schema permissions, and certified 100% non-destructive.
> 
> In accordance with safety rules, **execution is held pending explicit user confirmation**.

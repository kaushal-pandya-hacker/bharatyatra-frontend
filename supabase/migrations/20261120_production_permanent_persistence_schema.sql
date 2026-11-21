-- ============================================================================
-- BHARATYATRA PRODUCTION PERMANENT PERSISTENCE SCHEMA (SECURITY HARDENED v1.2)
-- Target Project: uedmguvljhsvbndwkruz (https://www.bharatyatra.in)
-- 100% Non-destructive, Idempotent, RLS-Enforced, Zero Data Loss
-- Least-Privilege Role Separation: anon vs authenticated vs service_role
-- ============================================================================

-- 0. EXTENSIONS & SCHEMA USAGE
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
-- ROW LEVEL SECURITY (RLS) ENABLEMENT ON ALL 18 TABLES
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

-- FORCE RLS on customer and admin-sensitive tables
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_trips FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_destinations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- PRINCIPLE OF LEAST PRIVILEGE: PRECISE TABLE GRANTS
-- ============================================================================

-- 1. Anonymous role (unauthenticated visitors): SELECT only on public catalog data
GRANT SELECT ON public.published_destinations TO anon;
GRANT SELECT ON public.destinations TO anon;
GRANT SELECT ON public.travel_packages TO anon;
GRANT SELECT ON public.travel_agencies TO anon;
GRANT SELECT ON public.destination_reviews TO anon;
GRANT SELECT ON public.admin_destinations TO anon;
GRANT SELECT ON public.admin_packages TO anon;
GRANT SELECT ON public.admin_inventory TO anon;

-- Explicitly REVOKE any potential inherited write/read access on private tables from anon
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.user_trips FROM anon;
REVOKE ALL ON public.user_bookings FROM anon;
REVOKE ALL ON public.user_preferences FROM anon;
REVOKE ALL ON public.user_saved_destinations FROM anon;
REVOKE ALL ON public.user_search_history FROM anon;
REVOKE ALL ON public.user_notifications FROM anon;
REVOKE ALL ON public.admin_audit_logs FROM anon;
REVOKE ALL ON public.place_submissions FROM anon;
REVOKE ALL ON public.contributor_rewards FROM anon;

-- 2. Authenticated role (logged-in users): Access only to public data + own user rows
GRANT SELECT ON public.published_destinations TO authenticated;
GRANT SELECT ON public.destinations TO authenticated;
GRANT SELECT ON public.travel_packages TO authenticated;
GRANT SELECT ON public.travel_agencies TO authenticated;
GRANT SELECT, INSERT ON public.destination_reviews TO authenticated;
GRANT SELECT ON public.admin_destinations TO authenticated;
GRANT SELECT ON public.admin_packages TO authenticated;
GRANT SELECT ON public.admin_inventory TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_trips TO authenticated;
GRANT SELECT, INSERT ON public.user_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_saved_destinations TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_search_history TO authenticated;
GRANT SELECT, UPDATE ON public.user_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.place_submissions TO authenticated;
GRANT SELECT ON public.contributor_rewards TO authenticated;

-- Explicitly revoke access on admin audit logs from authenticated users
REVOKE ALL ON public.admin_audit_logs FROM authenticated;

-- 3. Service Role: Full administrative access for trusted backend route handlers
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO service_role;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- A. SERVICE ROLE POLICIES (Full CRUD bypass on backend)
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

-- B. PUBLIC ANONYMOUS & AUTHENTICATED READ POLICIES (Catalog Only)
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

-- C. USER-SCOPED TENANCY POLICIES (auth.uid() = user_id)
DO $$ BEGIN
    CREATE POLICY "Users can manage own profile" ON public.user_profiles
        FOR ALL USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can read own trips" ON public.user_trips
        FOR SELECT USING (auth.uid()::text = user_id OR is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own trips" ON public.user_trips
        FOR INSERT WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own trips" ON public.user_trips
        FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own trips" ON public.user_trips
        FOR DELETE USING (auth.uid()::text = user_id);
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
    CREATE POLICY "Users can manage own search history" ON public.user_search_history
        FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own notifications" ON public.user_notifications
        FOR SELECT USING (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can mark own notifications read" ON public.user_notifications
        FOR UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own place submissions" ON public.place_submissions
        FOR ALL USING (auth.uid()::text = contributor_id) WITH CHECK (auth.uid()::text = contributor_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can view own rewards" ON public.contributor_rewards
        FOR SELECT USING (auth.uid()::text = contributor_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own destination reviews" ON public.destination_reviews
        FOR INSERT WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- D. ADMIN SERVER-SIDE WRITE ENFORCEMENT
-- Non-service role writes to admin tables require user role = 'ADMIN'
DO $$ BEGIN
    CREATE POLICY "Admins can manage admin destinations" ON public.admin_destinations
        FOR ALL USING (
            auth.role() = 'service_role' OR 
            EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()::text AND role = 'ADMIN')
        ) WITH CHECK (
            auth.role() = 'service_role' OR 
            EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()::text AND role = 'ADMIN')
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage admin packages" ON public.admin_packages
        FOR ALL USING (
            auth.role() = 'service_role' OR 
            EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()::text AND role = 'ADMIN')
        ) WITH CHECK (
            auth.role() = 'service_role' OR 
            EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()::text AND role = 'ADMIN')
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage admin inventory" ON public.admin_inventory
        FOR ALL USING (
            auth.role() = 'service_role' OR 
            EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()::text AND role = 'ADMIN')
        ) WITH CHECK (
            auth.role() = 'service_role' OR 
            EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid()::text AND role = 'ADMIN')
        );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- E. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

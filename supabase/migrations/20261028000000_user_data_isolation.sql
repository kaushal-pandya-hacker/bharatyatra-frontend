-- ============================================================================
-- BHARATYATRA MULTI-USER DATA ISOLATION & USER MANAGEMENT
-- PostgreSQL Schema, Row Level Security (RLS) Policies, Indexes & Audit Trail
-- Migration: 20261028000000_user_data_isolation.sql
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE
-- Mirrors and extends auth.users for application-level profile data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    phone_number VARCHAR(50) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER', -- 'CUSTOMER', 'ADMIN', 'SUPPLIER', 'AGENCY'
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'
    is_phone_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- 3. USER TRIPS TABLE
-- Strict user-isolated travel itineraries and plans
CREATE TABLE IF NOT EXISTS user_trips (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    destination_city VARCHAR(100),
    origin_city VARCHAR(100),
    start_date DATE,
    end_date DATE,
    duration_days INTEGER NOT NULL DEFAULT 1,
    travelers INTEGER NOT NULL DEFAULT 2,
    budget_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'SAVED', -- 'DRAFT', 'PLANNING', 'SAVED', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'
    route_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    itinerary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    trip_context_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_trips_user_id ON user_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trips_status ON user_trips(status);
CREATE INDEX IF NOT EXISTS idx_user_trips_created_at ON user_trips(created_at DESC);

-- 4. USER BOOKINGS TABLE
-- Strict user-isolated hotel, transport, package, and activity reservations
CREATE TABLE IF NOT EXISTS user_bookings (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_type VARCHAR(50) NOT NULL DEFAULT 'HOTEL', -- 'HOTEL', 'PACKAGE', 'ACTIVITY', 'TRANSPORT'
    inventory_type VARCHAR(50),
    inventory_id VARCHAR(255),
    inventory_title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED', -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    adult_count INTEGER NOT NULL DEFAULT 1,
    child_count INTEGER NOT NULL DEFAULT 0,
    guest_count INTEGER NOT NULL DEFAULT 1,
    total_amount_inr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    hotel_detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_bookings_user_id ON user_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookings_reference ON user_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_user_bookings_status ON user_bookings(status);
CREATE INDEX IF NOT EXISTS idx_user_bookings_created_at ON user_bookings(created_at DESC);

-- 5. USER SAVED DESTINATIONS (WISHLIST) TABLE
CREATE TABLE IF NOT EXISTS user_saved_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destination_id VARCHAR(100) NOT NULL,
    destination_name VARCHAR(255),
    destination_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_saved_destination UNIQUE (user_id, destination_id)
);

CREATE INDEX IF NOT EXISTS idx_user_saved_destinations_user_id ON user_saved_destinations(user_id);

-- 6. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    dietary_preference VARCHAR(50),
    budget_tier VARCHAR(50) NOT NULL DEFAULT 'moderate',
    travel_pace VARCHAR(50) NOT NULL DEFAULT 'balanced',
    travel_style VARCHAR(50) NOT NULL DEFAULT 'balanced',
    transport JSONB NOT NULL DEFAULT '["train", "bus"]'::jsonb,
    interests JSONB NOT NULL DEFAULT '["heritage", "nature"]'::jsonb,
    origin_city VARCHAR(100) NOT NULL DEFAULT 'Ahmedabad',
    origin_state VARCHAR(100) NOT NULL DEFAULT 'Gujarat',
    origin_country VARCHAR(100) NOT NULL DEFAULT 'India',
    typical_travelers INTEGER NOT NULL DEFAULT 2,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. USER NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id, is_read);

-- 8. CENTRALIZED ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    admin_email VARCHAR(255),
    target_user_id UUID,
    action VARCHAR(100) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_user ON admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) ENFORCEMENT
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 9.1 Service Role Unrestricted Access (Backend Server-Side Operations)
DROP POLICY IF EXISTS "Service role full access on user_profiles" ON user_profiles;
CREATE POLICY "Service role full access on user_profiles" ON user_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on user_trips" ON user_trips;
CREATE POLICY "Service role full access on user_trips" ON user_trips
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on user_bookings" ON user_bookings;
CREATE POLICY "Service role full access on user_bookings" ON user_bookings
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on user_saved_destinations" ON user_saved_destinations;
CREATE POLICY "Service role full access on user_saved_destinations" ON user_saved_destinations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on user_preferences" ON user_preferences;
CREATE POLICY "Service role full access on user_preferences" ON user_preferences
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on user_notifications" ON user_notifications;
CREATE POLICY "Service role full access on user_notifications" ON user_notifications
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on admin_audit_logs" ON admin_audit_logs;
CREATE POLICY "Service role full access on admin_audit_logs" ON admin_audit_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9.2 USER PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

-- 9.3 USER TRIPS POLICIES
DROP POLICY IF EXISTS "Users can view own trips" ON user_trips;
CREATE POLICY "Users can view own trips" ON user_trips
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own trips" ON user_trips;
CREATE POLICY "Users can insert own trips" ON user_trips
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own trips" ON user_trips;
CREATE POLICY "Users can update own trips" ON user_trips
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own trips" ON user_trips;
CREATE POLICY "Users can delete own trips" ON user_trips
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- 9.4 USER BOOKINGS POLICIES
DROP POLICY IF EXISTS "Users can view own bookings" ON user_bookings;
CREATE POLICY "Users can view own bookings" ON user_bookings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own bookings" ON user_bookings;
CREATE POLICY "Users can insert own bookings" ON user_bookings
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own bookings" ON user_bookings;
CREATE POLICY "Users can update own bookings" ON user_bookings
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 9.5 USER SAVED DESTINATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own saved destinations" ON user_saved_destinations;
CREATE POLICY "Users can view own saved destinations" ON user_saved_destinations
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own saved destinations" ON user_saved_destinations;
CREATE POLICY "Users can insert own saved destinations" ON user_saved_destinations
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own saved destinations" ON user_saved_destinations;
CREATE POLICY "Users can delete own saved destinations" ON user_saved_destinations
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- 9.6 USER PREFERENCES POLICIES
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 9.7 USER NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
CREATE POLICY "Users can view own notifications" ON user_notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON user_notifications;
CREATE POLICY "Users can update own notifications" ON user_notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 9.8 ADMIN AUTHORIZATION POLICIES
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Admins can view all bookings" ON user_bookings;
CREATE POLICY "Admins can view all bookings" ON user_bookings
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'ADMIN'
        )
    );

-- ============================================================================
-- 10. PRIVILEGE ESCALATION PREVENTION TRIGGER
-- Guarantees that only platform administrators or service_role can alter role or status
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_user_profile_role()
RETURNS trigger AS $$
BEGIN
    IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.status IS DISTINCT FROM OLD.status) THEN
        IF auth.role() = 'service_role' THEN
            RETURN NEW;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Only platform administrators can change user roles or status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_user_profile_role ON user_profiles;
CREATE TRIGGER trg_protect_user_profile_role
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_profile_role();

-- ============================================================================
-- 11. AUTOMATIC PROFILE PROVISIONING TRIGGER ON SUPABASE AUTH.USERS
-- Always provisions role as CUSTOMER, never trusting client-supplied metadata
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, phone_number, role, status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.phone, new.raw_user_meta_data->>'phone', ''),
        'CUSTOMER', -- Strictly default to CUSTOMER; never trust client-provided role in signup metadata
        'ACTIVE'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_preferences (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================================
-- 12. IDEMPOTENT BACKFILL OF EXISTING AUTH.USERS
-- ============================================================================
INSERT INTO public.user_profiles (id, email, full_name, phone_number, role, status)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
    COALESCE(phone, raw_user_meta_data->>'phone', ''),
    'CUSTOMER',
    'ACTIVE'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

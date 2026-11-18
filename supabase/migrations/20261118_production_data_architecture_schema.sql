-- ============================================================================
-- BharatYatra — Production Data Architecture Schema
-- Migration: 20261118_production_data_architecture_schema.sql
-- Non-destructive, additive schema for persistent PostgreSQL storage
-- ============================================================================

-- 1. Table: user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    phone_number TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'SUPPLIER', 'AGENCY')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    is_phone_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: user_trips
CREATE TABLE IF NOT EXISTS public.user_trips (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    destination_city TEXT,
    origin_city TEXT,
    start_date DATE,
    end_date DATE,
    duration_days INTEGER NOT NULL DEFAULT 1,
    travelers INTEGER NOT NULL DEFAULT 1,
    budget_inr NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    route_json JSONB,
    itinerary_json JSONB,
    trip_context_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table: user_bookings
CREATE TABLE IF NOT EXISTS public.user_bookings (
    id TEXT PRIMARY KEY,
    booking_reference TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    booking_type TEXT NOT NULL,
    inventory_type TEXT,
    inventory_id TEXT,
    inventory_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    start_date DATE,
    end_date DATE,
    adult_count INTEGER NOT NULL DEFAULT 1,
    child_count INTEGER NOT NULL DEFAULT 0,
    guest_count INTEGER NOT NULL DEFAULT 1,
    total_amount_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    hotel_detail JSONB,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table: trip_expenses
CREATE TABLE IF NOT EXISTS public.trip_expenses (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount_inr NUMERIC(12, 2) NOT NULL,
    paid_by_member_id TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Food',
    split_type TEXT NOT NULL DEFAULT 'EQUAL',
    participants JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Table: place_submissions
CREATE TABLE IF NOT EXISTS public.place_submissions (
    id TEXT PRIMARY KEY,
    contributor_id TEXT NOT NULL,
    contributor_name TEXT NOT NULL,
    contributor_email TEXT NOT NULL,
    place_name TEXT NOT NULL,
    category TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL,
    district TEXT,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    short_description TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    photos TEXT[] NOT NULL DEFAULT '{}',
    best_time_to_visit TEXT,
    estimated_visit_duration TEXT,
    entry_fee TEXT,
    opening_hours TEXT,
    parking_available BOOLEAN DEFAULT false,
    facilities TEXT[] DEFAULT '{}',
    travel_tips TEXT[] DEFAULT '{}',
    nearby_attractions TEXT[] DEFAULT '{}',
    suitable_for TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED')),
    rejection_reason TEXT,
    admin_feedback TEXT,
    ai_verification JSONB,
    reward_coupon_code TEXT,
    destination_id TEXT,
    approved_at TIMESTAMPTZ,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Table: published_destinations
CREATE TABLE IF NOT EXISTS public.published_destinations (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL,
    district TEXT,
    city TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    primary_image_url TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    best_time_to_visit TEXT,
    estimated_visit_duration TEXT,
    entry_fee TEXT,
    opening_hours TEXT,
    facilities TEXT[] DEFAULT '{}',
    travel_tips TEXT[] DEFAULT '{}',
    is_community_contributed BOOLEAN DEFAULT true,
    contributed_by_name TEXT,
    contributed_by_id TEXT,
    submission_id TEXT UNIQUE,
    rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-performance slug queries without blocking duplicate legacy approvals
CREATE INDEX IF NOT EXISTS idx_published_dest_slug ON public.published_destinations(slug);

-- 7. Table: contributor_rewards
CREATE TABLE IF NOT EXISTS public.contributor_rewards (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    contributor_id TEXT NOT NULL,
    contributor_name TEXT NOT NULL,
    contributor_email TEXT NOT NULL,
    submission_id TEXT NOT NULL,
    place_name TEXT NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 7.00,
    max_discount_inr NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
    min_booking_inr NUMERIC(10, 2) NOT NULL DEFAULT 2500.00,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESERVED', 'REDEEMED', 'EXPIRED', 'REVOKED')),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    reserved_at TIMESTAMPTZ,
    reserved_booking_id TEXT,
    redeemed_at TIMESTAMPTZ,
    redeemed_booking_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Table: user_notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id TEXT PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    user_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'COMMUNITY',
    type TEXT NOT NULL,
    deep_link TEXT,
    read_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Table: support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    phone TEXT,
    category TEXT NOT NULL DEFAULT 'GENERAL',
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    assigned_staff TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    messages JSONB
);

-- 10. Table: contact_enquiries
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id TEXT PRIMARY KEY,
    enquiry_reference TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    inquiry_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    source TEXT NOT NULL DEFAULT 'WEBSITE',
    email_notification_status TEXT DEFAULT 'NOT_CONFIGURED',
    whatsapp_notification_status TEXT DEFAULT 'NOT_CONFIGURED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Table: trip_reviews
CREATE TABLE IF NOT EXISTS public.trip_reviews (
    id TEXT PRIMARY KEY,
    trip_id TEXT,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    destination TEXT NOT NULL,
    trip_dates JSONB,
    traveller_count INTEGER DEFAULT 1,
    overall_rating INTEGER NOT NULL DEFAULT 5,
    category_ratings JSONB,
    positive_highlights TEXT[],
    improvement_suggestions TEXT[],
    written_review TEXT,
    photos TEXT[],
    status TEXT NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributor_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_reviews ENABLE ROW LEVEL SECURITY;

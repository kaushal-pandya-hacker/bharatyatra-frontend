-- ============================================================================
-- BharatYatra — Community-Driven Destination Contribution System Migration
-- Migration: 20261113_community_destination_contributions.sql
-- ============================================================================

-- 1. Create Place Submissions Table
CREATE TABLE IF NOT EXISTS public.place_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contributor_id UUID NOT NULL,
    contributor_name VARCHAR(255) NOT NULL,
    contributor_email VARCHAR(255),
    place_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    city VARCHAR(100),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    short_description TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    photos JSONB DEFAULT '[]'::jsonb,
    best_time_to_visit VARCHAR(255),
    estimated_visit_duration VARCHAR(100),
    entry_fee VARCHAR(100),
    opening_hours VARCHAR(255),
    contact_info VARCHAR(255),
    website VARCHAR(255),
    accessibility VARCHAR(100),
    parking_available BOOLEAN DEFAULT FALSE,
    facilities JSONB DEFAULT '[]'::jsonb,
    travel_tips JSONB DEFAULT '[]'::jsonb,
    nearby_attractions JSONB DEFAULT '[]'::jsonb,
    suitable_for JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'WITHDRAWN')),
    admin_feedback TEXT,
    rejection_reason TEXT,
    approved_place_id UUID,
    reviewed_by VARCHAR(255),
    ai_verification JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ
);

-- 2. Create Place Submission Photos Table
CREATE TABLE IF NOT EXISTS public.place_submission_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.place_submissions(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Place Submission Reviews Audit Table
CREATE TABLE IF NOT EXISTS public.place_submission_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.place_submissions(id) ON DELETE CASCADE,
    admin_id VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('CLAIM_REVIEW', 'REQUEST_CHANGES', 'REJECT', 'APPROVE', 'EDIT')),
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    review_notes TEXT,
    modifications JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Contribution History Table
CREATE TABLE IF NOT EXISTS public.contribution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contributor_id VARCHAR(255) NOT NULL,
    submission_id UUID NOT NULL REFERENCES public.place_submissions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('SUBMITTED', 'UPDATED', 'CHANGES_REQUESTED', 'RESUBMITTED', 'APPROVED', 'REJECTED', 'WITHDRAWN')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Add Community Contribution fields to Destinations table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'contributed_by_id') THEN
        ALTER TABLE public.destinations ADD COLUMN contributed_by_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'contributed_by_name') THEN
        ALTER TABLE public.destinations ADD COLUMN contributed_by_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'is_community_contributed') THEN
        ALTER TABLE public.destinations ADD COLUMN is_community_contributed BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'submission_id') THEN
        ALTER TABLE public.destinations ADD COLUMN submission_id UUID;
    END IF;
END $$;

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_place_submissions_contributor_id ON public.place_submissions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_place_submissions_status ON public.place_submissions(status);
CREATE INDEX IF NOT EXISTS idx_place_submissions_state ON public.place_submissions(state);
CREATE INDEX IF NOT EXISTS idx_place_submissions_category ON public.place_submissions(category);
CREATE INDEX IF NOT EXISTS idx_place_submissions_created_at ON public.place_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_place_submission_photos_submission_id ON public.place_submission_photos(submission_id);
CREATE INDEX IF NOT EXISTS idx_place_submission_reviews_submission_id ON public.place_submission_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_contribution_history_contributor_id ON public.contribution_history(contributor_id);
CREATE INDEX IF NOT EXISTS idx_destinations_is_community_contributed ON public.destinations(is_community_contributed);

-- 7. Row Level Security (RLS) Configuration
ALTER TABLE public.place_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_submission_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_submission_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_history ENABLE ROW LEVEL SECURITY;

-- Policy: Contributors can view their own submissions
CREATE POLICY contributor_select_own_submissions
    ON public.place_submissions
    FOR SELECT
    USING (auth.uid() = contributor_id);

-- Policy: Contributors can insert their own submissions with initial PENDING status
CREATE POLICY contributor_insert_own_submissions
    ON public.place_submissions
    FOR INSERT
    WITH CHECK (auth.uid() = contributor_id AND status = 'PENDING');

-- Policy: Contributors can only update their own submissions when PENDING or CHANGES_REQUESTED
CREATE POLICY contributor_update_own_submissions
    ON public.place_submissions
    FOR UPDATE
    USING (
        auth.uid() = contributor_id 
        AND status IN ('PENDING', 'CHANGES_REQUESTED')
    )
    WITH CHECK (
        auth.uid() = contributor_id 
        AND status IN ('PENDING', 'WITHDRAWN')
    );

-- Policy: Service Role (Admin) has full access
CREATE POLICY service_role_full_access_submissions
    ON public.place_submissions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_role_full_access_reviews
    ON public.place_submission_reviews
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_role_full_access_photos
    ON public.place_submission_photos
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_role_full_access_history
    ON public.contribution_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


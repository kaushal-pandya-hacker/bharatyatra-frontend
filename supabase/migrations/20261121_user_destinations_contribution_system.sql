-- ============================================================================
-- BHARATYATRA — USER DESTINATION CONTRIBUTION & ADMIN APPROVAL SYSTEM MIGRATION
-- Migration Name: 20261121_user_destinations_contribution_system.sql
-- Strategy: Strictly Additive, Zero Data Loss, Backward Compatible
-- ============================================================================

-- 1. ADDITIVE COLUMNS ON PLACE_SUBMISSIONS
DO $$ BEGIN
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS slug TEXT;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public'));
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS accessibility TEXT;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT false;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS travel_tips JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS nearby_attractions JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS ai_verification JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS approved_place_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2. ADDITIVE COLUMNS ON DESTINATIONS & PUBLISHED_DESTINATIONS
DO $$ BEGIN
    ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS is_community_contributed BOOLEAN DEFAULT false;
    ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS contributed_by_id TEXT;
    ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS contributed_by_name TEXT;
    ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS submission_id TEXT;
    ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('private', 'public'));
    ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS accessibility TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE public.published_destinations ADD COLUMN IF NOT EXISTS accessibility TEXT;
    ALTER TABLE public.published_destinations ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 3. INDEXES FOR SMART SEARCH PERFORMANCE & PERSONAL DESTINATION ISOLATION
CREATE INDEX IF NOT EXISTS idx_place_submissions_contributor_status ON public.place_submissions(contributor_id, status);
CREATE INDEX IF NOT EXISTS idx_place_submissions_state_city ON public.place_submissions(state, city);
CREATE INDEX IF NOT EXISTS idx_destinations_community_contributed ON public.destinations(is_community_contributed);

-- 4. RLS POLICIES FOR SECURE PERSONAL DESTINATION ACCESS
ALTER TABLE public.place_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- Policy: Contributor can read own submissions regardless of status
    CREATE POLICY "Contributors can view own submissions" ON public.place_submissions
        FOR SELECT USING (auth.uid()::text = contributor_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    -- Policy: Public can read only approved submissions (if any direct query)
    CREATE POLICY "Public can view approved submissions" ON public.place_submissions
        FOR SELECT USING (status = 'APPROVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    -- Policy: Contributors can update their own submissions (e.g. resubmission on changes requested)
    CREATE POLICY "Contributors can update own submissions" ON public.place_submissions
        FOR UPDATE USING (auth.uid()::text = contributor_id) WITH CHECK (auth.uid()::text = contributor_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- BharatYatra — Supabase Storage Bucket Provisioning Migration
-- Migration: 20261117_create_contributions_storage_bucket.sql
-- ============================================================================

-- 1. Create 'contributions' bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'contributions',
    'contributions',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage Policies
DO $$
BEGIN
    -- Policy: Public read access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Contributions'
    ) THEN
        CREATE POLICY "Public Read Contributions"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'contributions');
    END IF;

    -- Policy: Authenticated users upload to contributions
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Contributions'
    ) THEN
        CREATE POLICY "Authenticated Upload Contributions"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'contributions');
    END IF;

    -- Policy: Service role full access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Service Role All Contributions'
    ) THEN
        CREATE POLICY "Service Role All Contributions"
            ON storage.objects FOR ALL
            TO service_role
            USING (bucket_id = 'contributions')
            WITH CHECK (bucket_id = 'contributions');
    END IF;
END $$;

-- ============================================================================
-- BharatYatra — Hardened Storage Security & Privacy Migration
-- Migration: 20261118_secure_contributions_storage_privacy.sql
-- ============================================================================

-- 1. Ensure 'contributions' bucket is private by default
UPDATE storage.buckets
SET public = false
WHERE id = 'contributions';

-- 2. Drop the overly permissive public read policy if exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Contributions'
    ) THEN
        DROP POLICY "Public Read Contributions" ON storage.objects;
    END IF;
END $$;

-- 3. Policy: Public can read ONLY approved/published images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read Approved Contributions'
    ) THEN
        CREATE POLICY "Public Read Approved Contributions"
            ON storage.objects FOR SELECT
            TO anon, authenticated
            USING (
                bucket_id = 'contributions' AND (
                    (storage.foldername(name))[1] = 'published'
                    OR name LIKE 'published/%'
                    OR name LIKE 'public/%'
                )
            );
    END IF;
END $$;

-- 4. Policy: Contributor can read their own pending/draft/rejected images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner Read Own Contribution Photos'
    ) THEN
        CREATE POLICY "Owner Read Own Contribution Photos"
            ON storage.objects FOR SELECT
            TO authenticated
            USING (
                bucket_id = 'contributions' AND (
                    (storage.foldername(name))[2] = auth.uid()::text
                    OR (storage.foldername(name))[1] = auth.uid()::text
                )
            );
    END IF;
END $$;

-- 5. Policy: Administrators can preview all photographs during moderation review
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admin Read All Contributions'
    ) THEN
        CREATE POLICY "Admin Read All Contributions"
            ON storage.objects FOR SELECT
            TO authenticated
            USING (
                bucket_id = 'contributions' AND (
                    auth.jwt()->>'role' = 'ADMIN'
                    OR auth.jwt()->'app_metadata'->>'role' = 'ADMIN'
                )
            );
    END IF;
END $$;

-- 6. Strictly restrict DELETE to service role (prevent unauthorized deletions)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Service Role Only Delete Contributions'
    ) THEN
        CREATE POLICY "Service Role Only Delete Contributions"
            ON storage.objects FOR DELETE
            TO service_role
            USING (bucket_id = 'contributions');
    END IF;
END $$;

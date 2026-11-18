-- ============================================================================
-- BharatYatra — Rollback Script: 20261118_rollback_production_schema.sql
-- Quarantined in supabase/rollbacks/ per Zero Data Loss Policy
-- FOR RECOVERY / TESTING ONLY — NEVER EXECUTE AGAINST LIVE PRODUCTION WITHOUT AUTHORIZATION
-- ============================================================================

-- Safely disable triggers and foreign keys if needed during rollback
-- Tables are dropped in reverse dependency order only in authorized testing environments

-- DROP TABLE IF EXISTS public.trip_reviews CASCADE;
-- DROP TABLE IF EXISTS public.contact_enquiries CASCADE;
-- DROP TABLE IF EXISTS public.support_tickets CASCADE;
-- DROP TABLE IF EXISTS public.user_notifications CASCADE;
-- DROP TABLE IF EXISTS public.contributor_rewards CASCADE;
-- DROP TABLE IF EXISTS public.published_destinations CASCADE;
-- DROP TABLE IF EXISTS public.place_submissions CASCADE;
-- DROP TABLE IF EXISTS public.trip_expenses CASCADE;
-- DROP TABLE IF EXISTS public.user_bookings CASCADE;
-- DROP TABLE IF EXISTS public.user_trips CASCADE;
-- DROP TABLE IF EXISTS public.user_profiles CASCADE;

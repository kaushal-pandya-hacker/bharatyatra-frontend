-- ============================================================================
-- ROLLBACK MIGRATION: 20261028000000_rollback_user_data_isolation.sql
-- Safely reverts multi-user data isolation tables, triggers, and functions
-- ============================================================================

-- 1. DROP TRIGGERS & FUNCTIONS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();

DROP TRIGGER IF EXISTS trg_protect_user_profile_role ON public.user_profiles;
DROP FUNCTION IF EXISTS public.protect_user_profile_role();

-- 2. DROP TABLES IN REVERSE DEPENDENCY ORDER
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.user_notifications CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.user_saved_destinations CASCADE;
DROP TABLE IF EXISTS public.user_bookings CASCADE;
DROP TABLE IF EXISTS public.user_trips CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;


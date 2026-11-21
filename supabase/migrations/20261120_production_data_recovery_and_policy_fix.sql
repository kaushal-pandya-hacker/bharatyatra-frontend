-- ============================================================================
-- BHARATYATRA PRODUCTION DATA RECOVERY & RLS SECURITY GAP REMEDIATION
-- Non-destructive, additive, idempotent UPSERT migration
-- ============================================================================

-- 1. SCHEMA COLUMN COMPATIBILITY PATCHES
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS adult_count INTEGER DEFAULT 1;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 0;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS total_amount_inr NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS hotel_detail JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.user_bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

ALTER TABLE public.place_submissions ADD COLUMN IF NOT EXISTS accessibility JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS destination_city TEXT;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS origin_city TEXT;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 1;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS travelers INTEGER DEFAULT 1;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS budget_inr NUMERIC(10,2);
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS route_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS itinerary_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_trips ADD COLUMN IF NOT EXISTS trip_context_json JSONB DEFAULT '{}'::jsonb;

-- 2. CREATE SECURITY DEFINER is_admin() FUNCTION & POLICY REVISION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  );
$$;

DROP POLICY IF EXISTS "Admins can manage admin destinations" ON public.admin_destinations;
CREATE POLICY "Admins can manage admin destinations" ON public.admin_destinations
    FOR ALL USING (
        auth.role() = 'service_role' OR public.is_admin()
    ) WITH CHECK (
        auth.role() = 'service_role' OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can manage admin packages" ON public.admin_packages;
CREATE POLICY "Admins can manage admin packages" ON public.admin_packages
    FOR ALL USING (
        auth.role() = 'service_role' OR public.is_admin()
    ) WITH CHECK (
        auth.role() = 'service_role' OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can manage admin inventory" ON public.admin_inventory;
CREATE POLICY "Admins can manage admin inventory" ON public.admin_inventory
    FOR ALL USING (
        auth.role() = 'service_role' OR public.is_admin()
    ) WITH CHECK (
        auth.role() = 'service_role' OR public.is_admin()
    );

-- 3. RECOVER HISTORICAL USER PROFILES (45 records)
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795016070968', 'usr_alpha_1795016070968@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-18T15:34:31.650Z', '2026-11-18T15:34:31.650Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_returning_30d_1795016073157', 'usr_returning_30d_1795016073157@bharatyatra.in', 'Vikramaditya Solanki', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-18T15:34:33.233Z', '2026-11-18T15:34:33.233Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795016175149', 'usr_alpha_1795016175149@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-18T15:36:15.810Z', '2026-11-18T15:36:15.810Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_returning_30d_1795016177208', 'usr_returning_30d_1795016177208@bharatyatra.in', 'Vikramaditya Solanki', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-18T15:36:17.294Z', '2026-11-18T15:36:17.294Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795016350396', 'usr_alpha_1795016350396@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-18T15:39:11.081Z', '2026-11-18T15:39:11.081Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_returning_30d_1795016352987', 'usr_returning_30d_1795016352987@bharatyatra.in', 'Vikramaditya Solanki', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-18T15:39:13.092Z', '2026-11-18T15:39:13.092Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795064567860', 'usr_alpha_1795064567860@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T05:02:48.874Z', '2026-11-19T05:02:48.874Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_returning_30d_1795064570565', 'usr_returning_30d_1795064570565@bharatyatra.in', 'Vikramaditya Solanki', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T05:02:50.670Z', '2026-11-19T05:02:50.670Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alice_101', 'alice@bharatyatra.in', 'Alice Test', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T05:03:29.952Z', '2026-11-19T05:03:29.952Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795076904686', 'usr_alpha_1795076904686@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T08:28:25.498Z', '2026-11-19T08:28:25.498Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_returning_30d_1795076907872', 'usr_returning_30d_1795076907872@bharatyatra.in', 'Vikramaditya Solanki', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T08:28:27.990Z', '2026-11-19T08:28:27.990Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795077112195', 'usr_alpha_1795077112195@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T08:31:52.652Z', '2026-11-19T08:31:52.652Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_returning_30d_1795077115166', 'usr_returning_30d_1795077115166@bharatyatra.in', 'Vikramaditya Solanki', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T08:31:55.256Z', '2026-11-19T08:31:55.256Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795077166227', 'usr_alpha_1795077166227@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T08:32:46.619Z', '2026-11-19T08:32:46.619Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_returning_30d_1795077169148', 'usr_returning_30d_1795077169148@bharatyatra.in', 'Vikramaditya Solanki', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T08:32:49.257Z', '2026-11-19T08:32:49.257Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795089196307', 'usr_test_1795089196307@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T11:53:17.177Z', '2026-11-19T11:53:17.177Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795089199439', 'usr_30d_1795089199439@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-19T11:53:19.520Z', '2026-11-19T11:53:19.520Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795149818510', 'usr_alpha_1795149818510@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T04:43:39.286Z', '2026-11-20T04:43:39.286Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_returning_30d_1795149821708', 'usr_returning_30d_1795149821708@bharatyatra.in', 'Vikramaditya Solanki', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T04:43:41.816Z', '2026-11-20T04:43:41.816Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_prod_test_1795150100021', 'usr_prod_test_1795150100021@bharatyatra.in', 'Aarav Sharma', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T04:48:20.923Z', '2026-11-20T04:48:20.923Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_prod_test_1795150134828', 'usr_prod_test_1795150134828@bharatyatra.in', 'Aarav Sharma', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T04:48:55.388Z', '2026-11-20T04:48:55.388Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_prod_test_1795150268074', 'usr_prod_test_1795150268074@bharatyatra.in', 'Aarav Sharma', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T04:51:08.720Z', '2026-11-20T04:51:08.720Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795151572392', 'usr_test_1795151572392@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:12:53.114Z', '2026-11-20T05:12:53.114Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795151575321', 'usr_30d_1795151575321@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:12:55.430Z', '2026-11-20T05:12:55.430Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795151867606', 'usr_test_1795151867606@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:17:48.042Z', '2026-11-20T05:17:48.042Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795151870320', 'usr_30d_1795151870320@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:17:50.392Z', '2026-11-20T05:17:50.392Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795151985567', 'usr_test_1795151985567@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:19:45.858Z', '2026-11-20T05:19:45.858Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795151988161', 'usr_30d_1795151988161@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:19:48.264Z', '2026-11-20T05:19:48.264Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_prod_test_1795152411800', 'usr_prod_test_1795152411800@bharatyatra.in', 'Aarav Sharma', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:26:52.617Z', '2026-11-20T05:26:52.617Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_prod_14_1795153149063', 'usr_prod_14_1795153149063@bharatyatra.in', 'Vikram Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:39:10.078Z', '2026-11-20T05:39:10.079Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_prod_14_1795153321560', 'usr_prod_14_1795153321560@bharatyatra.in', 'Vikram Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:42:02.924Z', '2026-11-20T05:42:02.924Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_prod_14_1795153338116', 'usr_prod_14_1795153338116@bharatyatra.in', 'Vikram Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:42:19.048Z', '2026-11-20T05:42:19.048Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795153376838', 'usr_30d_1795153376838@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:42:56.938Z', '2026-11-20T05:42:56.938Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795153441756', 'usr_test_1795153441756@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:44:02.150Z', '2026-11-20T05:44:02.150Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795153444184', 'usr_30d_1795153444184@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:44:04.250Z', '2026-11-20T05:44:04.250Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_prod_14_1795153455382', 'usr_prod_14_1795153455382@bharatyatra.in', 'Vikram Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:44:16.479Z', '2026-11-20T05:44:16.479Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795153967529', 'usr_test_1795153967529@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:52:48.297Z', '2026-11-20T05:52:48.297Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795153970869', 'usr_30d_1795153970869@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T05:52:50.967Z', '2026-11-20T05:52:50.967Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795154654995', 'usr_test_1795154654995@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T06:04:15.306Z', '2026-11-20T06:04:15.306Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795154657543', 'usr_30d_1795154657543@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T06:04:17.633Z', '2026-11-20T06:04:17.633Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795157287994', 'usr_test_1795157287994@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T06:48:08.179Z', '2026-11-20T06:48:08.179Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795157290133', 'usr_30d_1795157290133@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T06:48:10.199Z', '2026-11-20T06:48:10.199Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_test_1795159085115', 'usr_test_1795159085115@bharatyatra.in', 'Aarav Mehta', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T07:18:05.774Z', '2026-11-20T07:18:05.774Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_30d_1795159088261', 'usr_30d_1795159088261@bharatyatra.in', 'Vikramaditya', NULL, NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T07:18:08.323Z', '2026-11-20T07:18:08.323Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_profiles (id, email, full_name, phone, avatar_url, role, status, created_at, updated_at)
VALUES ('usr_alpha_1795159099469', 'usr_alpha_1795159099469@bharatyatra.in', 'Aarav Mehta', '+91 9876543210', NULL, 'CUSTOMER', 'ACTIVE', '2026-11-20T07:18:19.903Z', '2026-11-20T07:18:19.903Z')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
  updated_at = EXCLUDED.updated_at;

-- 4. RECOVER HISTORICAL USER TRIPS (421 records)
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795016071893', 'usr_alpha_1795016070968', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:34:31.994Z', '2026-11-18T15:34:31.994Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-legacy-v1-1795016072098', 'usr_alpha_1795016070968', 'Legacy Ahmedabad Heritage Walk', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 15000, 'COMPLETED', TRUE, '2026-11-18T15:34:32.195Z', '2026-11-18T15:34:32.195Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795016072276', 'usr_alpha_1795016070968', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-18T15:34:32.432Z', '2026-11-18T15:34:32.432Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-alpha-private-1795016072565', 'usr_alpha_1795016070968', 'Confidential Honeymoon in Udaipur', 'Trip to Udaipur', '2026-11-20', '2026-11-25', '["Udaipur"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:34:32.665Z', '2026-11-18T15:34:32.665Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-beta-private-1795016072666', 'usr_beta_1795016070968', 'Solo Trek in Himalayas', 'Trip to Manali', '2026-11-20', '2026-11-25', '["Manali"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:34:32.785Z', '2026-11-18T15:34:32.785Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795016176024-xtuyq', 'usr_alpha_1795016175149', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{"days": [{"day": 1, "title": "Arrival at Sasan Gir", "activity": "Jeep Safari Booking"}, {"day": 2, "title": "Asiatic Lion Trail", "activity": "Morning Wilderness Safari"}]}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-18T15:36:16.024Z', '2026-11-18T15:36:16.024Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795016176027', 'usr_alpha_1795016175149', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:36:16.114Z', '2026-11-18T15:36:16.114Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-legacy-v1-1795016176225', 'usr_alpha_1795016175149', 'Legacy Ahmedabad Heritage Walk', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 15000, 'COMPLETED', TRUE, '2026-11-18T15:36:16.314Z', '2026-11-18T15:36:16.314Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795016176387', 'usr_alpha_1795016175149', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-18T15:36:16.468Z', '2026-11-18T15:36:16.468Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-alpha-private-1795016176564', 'usr_alpha_1795016175149', 'Confidential Honeymoon in Udaipur', 'Trip to Udaipur', '2026-11-20', '2026-11-25', '["Udaipur"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:36:16.647Z', '2026-11-18T15:36:16.647Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-beta-private-1795016176648', 'usr_beta_1795016175149', 'Solo Trek in Himalayas', 'Trip to Manali', '2026-11-20', '2026-11-25', '["Manali"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:36:16.740Z', '2026-11-18T15:36:16.740Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795016351538-xdfgj', 'usr_alpha_1795016350396', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{"days": [{"day": 1, "title": "Arrival at Sasan Gir", "activity": "Jeep Safari Booking"}, {"day": 2, "title": "Asiatic Lion Trail", "activity": "Morning Wilderness Safari"}]}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-18T15:39:11.538Z', '2026-11-18T15:39:11.538Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795016351541', 'usr_alpha_1795016350396', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:39:11.666Z', '2026-11-18T15:39:11.666Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-legacy-v1-1795016351771', 'usr_alpha_1795016350396', 'Legacy Ahmedabad Heritage Walk', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 15000, 'COMPLETED', TRUE, '2026-11-18T15:39:11.907Z', '2026-11-18T15:39:11.907Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795016352044', 'usr_alpha_1795016350396', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-18T15:39:12.196Z', '2026-11-18T15:39:12.196Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-alpha-private-1795016352332', 'usr_alpha_1795016350396', 'Confidential Honeymoon in Udaipur', 'Trip to Udaipur', '2026-11-20', '2026-11-25', '["Udaipur"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:39:12.456Z', '2026-11-18T15:39:12.456Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-beta-private-1795016352459', 'usr_beta_1795016350396', 'Solo Trek in Himalayas', 'Trip to Manali', '2026-11-20', '2026-11-25', '["Manali"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-18T15:39:12.556Z', '2026-11-18T15:39:12.556Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795064568876', 'usr_alpha_1795064567860', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-19T05:02:49.001Z', '2026-11-19T05:02:49.001Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t2a-1795064569238', 'usr_alpha_1795064567860', 'Somnath Sunset Darshan', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T05:02:49.379Z', '2026-11-19T05:02:49.379Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t2b-1795064569238', 'usr_alpha_1795064567860', 'Dwarka VIP Aarti', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T05:02:49.486Z', '2026-11-19T05:02:49.486Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t2c-1795064569238', 'usr_alpha_1795064567860', 'Rann Utsav Full Moon', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T05:02:49.630Z', '2026-11-19T05:02:49.630Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795064569721', 'usr_alpha_1795064567860', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T05:02:49.867Z', '2026-11-19T05:02:49.867Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-restart-1795064569991', 'usr_alpha_1795064567860', 'Kevadia Statue of Unity Tour', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T05:02:50.128Z', '2026-11-19T05:02:50.128Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-db-restart-1795064570370', 'usr_alpha_1795064567860', 'Patan Stepwell & Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T05:02:50.471Z', '2026-11-19T05:02:50.471Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795064571150-e49zu', 'usr_returning_30d_1795064570565', 'Pawa Garh Ropeway & Temple', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T05:02:51.150Z', '2026-11-19T05:02:51.150Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795064571598', 'usr_alpha_1795064567860', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-19T05:02:51.742Z', '2026-11-19T05:02:51.742Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-a-1795064571829', 'usr_alpha_1795064567860', 'Updated Trip A: Polo Forest Luxury Glamping', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 16000, 'SAVED', TRUE, '2026-11-19T05:02:52.118Z', '2026-11-19T05:02:52.118Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-b-1795064571829', 'usr_alpha_1795064567860', 'Original Trip B: Mandvi Coastal Drive', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 22000, 'SAVED', TRUE, '2026-11-19T05:02:51.999Z', '2026-11-19T05:02:51.999Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795064773592-8g7dp', 'usr_alice_101', 'Alice Private Trip', 'Trip to Rann of Kutch', '2026-11-20', '2026-11-25', '["Rann of Kutch"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T05:06:13.592Z', '2026-11-19T05:06:13.592Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795076905499', 'usr_alpha_1795076904686', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-19T08:28:25.583Z', '2026-11-19T08:28:25.583Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-01-1795076905790', 'usr_alpha_1795076904686', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:25.879Z', '2026-11-19T08:28:25.879Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-02-1795076905790', 'usr_alpha_1795076904686', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:25.979Z', '2026-11-19T08:28:25.979Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-03-1795076905790', 'usr_alpha_1795076904686', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.049Z', '2026-11-19T08:28:26.049Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-04-1795076905790', 'usr_alpha_1795076904686', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.131Z', '2026-11-19T08:28:26.131Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-05-1795076905790', 'usr_alpha_1795076904686', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.233Z', '2026-11-19T08:28:26.233Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-06-1795076905790', 'usr_alpha_1795076904686', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.345Z', '2026-11-19T08:28:26.345Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-07-1795076905790', 'usr_alpha_1795076904686', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.452Z', '2026-11-19T08:28:26.452Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-08-1795076905790', 'usr_alpha_1795076904686', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.548Z', '2026-11-19T08:28:26.548Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-09-1795076905790', 'usr_alpha_1795076904686', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.623Z', '2026-11-19T08:28:26.623Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-10-1795076905790', 'usr_alpha_1795076904686', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.754Z', '2026-11-19T08:28:26.754Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795076906849', 'usr_alpha_1795076904686', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:26.955Z', '2026-11-19T08:28:26.955Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795076907099', 'usr_alpha_1795076904686', 'Backend Build Deployment Test', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-19T08:28:27.191Z', '2026-11-19T08:28:27.191Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-restart-1795076907289', 'usr_alpha_1795076904686', 'Kevadia Statue of Unity Tour', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:27.410Z', '2026-11-19T08:28:27.410Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-db-restart-1795076907624', 'usr_alpha_1795076904686', 'Patan Stepwell & Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:27.699Z', '2026-11-19T08:28:27.699Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795076908295-km0h6', 'usr_returning_30d_1795076907872', 'Pawa Garh Ropeway & Temple', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:28.295Z', '2026-11-19T08:28:28.295Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795076908690', 'usr_alpha_1795076904686', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-19T08:28:28.774Z', '2026-11-19T08:28:28.774Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-a-1795076908871', 'usr_alpha_1795076904686', 'Updated Trip A: Polo Forest Luxury Glamping', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 16000, 'SAVED', TRUE, '2026-11-19T08:28:29.203Z', '2026-11-19T08:28:29.203Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-b-1795076908871', 'usr_alpha_1795076904686', 'Original Trip B: Mandvi Coastal Drive', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 22000, 'SAVED', TRUE, '2026-11-19T08:28:29.122Z', '2026-11-19T08:28:29.122Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-alpha-priv-1795076909372', 'usr_alpha_1795076904686', 'Confidential Family Pilgrimage', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:29.449Z', '2026-11-19T08:28:29.449Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-beta-priv-1795076909450', 'usr_beta_1795076904686', 'Solo Exploration in Himalayas', 'Trip to Spiti', '2026-11-20', '2026-11-25', '["Spiti"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:28:29.534Z', '2026-11-19T08:28:29.534Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-legacy-v1-1795076910038', 'usr_alpha_1795076904686', 'Legacy Ahmedabad Heritage Walk', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 15000, 'COMPLETED', TRUE, '2026-11-19T08:28:30.130Z', '2026-11-19T08:28:30.130Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('1', 'usr_alice_101', 'My Bharat Journey', 'Trip to Gujarat Circuit', '2026-11-20', '2026-11-25', '["Gujarat Circuit"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:07.043Z', '2026-11-20T05:44:07.043Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795077112653', 'usr_alpha_1795077112195', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-19T08:31:52.748Z', '2026-11-19T08:31:52.748Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-01-1795077112994', 'usr_alpha_1795077112195', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:53.100Z', '2026-11-19T08:31:53.100Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-02-1795077112994', 'usr_alpha_1795077112195', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:53.257Z', '2026-11-19T08:31:53.257Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-03-1795077112994', 'usr_alpha_1795077112195', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:53.360Z', '2026-11-19T08:31:53.360Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-04-1795077112994', 'usr_alpha_1795077112195', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:53.502Z', '2026-11-19T08:31:53.502Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-05-1795077112994', 'usr_alpha_1795077112195', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:53.631Z', '2026-11-19T08:31:53.631Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-06-1795077112994', 'usr_alpha_1795077112195', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:53.759Z', '2026-11-19T08:31:53.759Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-07-1795077112994', 'usr_alpha_1795077112195', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:53.852Z', '2026-11-19T08:31:53.852Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-08-1795077112994', 'usr_alpha_1795077112195', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:53.963Z', '2026-11-19T08:31:53.963Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-09-1795077112994', 'usr_alpha_1795077112195', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:54.067Z', '2026-11-19T08:31:54.067Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-10-1795077112994', 'usr_alpha_1795077112195', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:54.189Z', '2026-11-19T08:31:54.189Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795077114313', 'usr_alpha_1795077112195', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:54.405Z', '2026-11-19T08:31:54.405Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795077114490', 'usr_alpha_1795077112195', 'Backend Build Deployment Test', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-19T08:31:54.587Z', '2026-11-19T08:31:54.587Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-restart-1795077114705', 'usr_alpha_1795077112195', 'Kevadia Statue of Unity Tour', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:54.807Z', '2026-11-19T08:31:54.807Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-db-restart-1795077114976', 'usr_alpha_1795077112195', 'Patan Stepwell & Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:55.056Z', '2026-11-19T08:31:55.056Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795077115535-f79kq', 'usr_returning_30d_1795077115166', 'Pawa Garh Ropeway & Temple', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:55.535Z', '2026-11-19T08:31:55.535Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795077115894', 'usr_alpha_1795077112195', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-19T08:31:55.963Z', '2026-11-19T08:31:55.963Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-a-1795077116086', 'usr_alpha_1795077112195', 'Updated Trip A: Polo Forest Luxury Glamping', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 16000, 'SAVED', TRUE, '2026-11-19T08:31:56.342Z', '2026-11-19T08:31:56.342Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-b-1795077116086', 'usr_alpha_1795077112195', 'Original Trip B: Mandvi Coastal Drive', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 22000, 'SAVED', TRUE, '2026-11-19T08:31:56.250Z', '2026-11-19T08:31:56.250Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-alpha-priv-1795077116563', 'usr_alpha_1795077112195', 'Confidential Family Pilgrimage', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:56.723Z', '2026-11-19T08:31:56.723Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-beta-priv-1795077116724', 'usr_beta_1795077112195', 'Solo Exploration in Himalayas', 'Trip to Spiti', '2026-11-20', '2026-11-25', '["Spiti"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:31:56.804Z', '2026-11-19T08:31:56.804Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-legacy-v1-1795077117313', 'usr_alpha_1795077112195', 'Legacy Ahmedabad Heritage Walk', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 15000, 'COMPLETED', TRUE, '2026-11-19T08:31:57.417Z', '2026-11-19T08:31:57.417Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795077166620', 'usr_alpha_1795077166227', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-19T08:32:46.705Z', '2026-11-19T08:32:46.705Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-01-1795077167053', 'usr_alpha_1795077166227', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:47.182Z', '2026-11-19T08:32:47.182Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-02-1795077167053', 'usr_alpha_1795077166227', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:47.321Z', '2026-11-19T08:32:47.321Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-03-1795077167053', 'usr_alpha_1795077166227', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:47.422Z', '2026-11-19T08:32:47.422Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-04-1795077167053', 'usr_alpha_1795077166227', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:47.577Z', '2026-11-19T08:32:47.577Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-05-1795077167053', 'usr_alpha_1795077166227', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:47.701Z', '2026-11-19T08:32:47.701Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-06-1795077167053', 'usr_alpha_1795077166227', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:47.795Z', '2026-11-19T08:32:47.795Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-07-1795077167053', 'usr_alpha_1795077166227', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:47.912Z', '2026-11-19T08:32:47.912Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-08-1795077167053', 'usr_alpha_1795077166227', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:48.022Z', '2026-11-19T08:32:48.022Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-09-1795077167053', 'usr_alpha_1795077166227', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:48.143Z', '2026-11-19T08:32:48.143Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-10-1795077167053', 'usr_alpha_1795077166227', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:48.241Z', '2026-11-19T08:32:48.241Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795077168347', 'usr_alpha_1795077166227', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:48.453Z', '2026-11-19T08:32:48.453Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795077168525', 'usr_alpha_1795077166227', 'Backend Build Deployment Test', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-19T08:32:48.635Z', '2026-11-19T08:32:48.635Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-restart-1795077168745', 'usr_alpha_1795077166227', 'Kevadia Statue of Unity Tour', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:48.821Z', '2026-11-19T08:32:48.821Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-db-restart-1795077168967', 'usr_alpha_1795077166227', 'Patan Stepwell & Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:49.056Z', '2026-11-19T08:32:49.056Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795077169588-64ke8', 'usr_returning_30d_1795077169148', 'Pawa Garh Ropeway & Temple', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:49.588Z', '2026-11-19T08:32:49.588Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795077169971', 'usr_alpha_1795077166227', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-19T08:32:50.061Z', '2026-11-19T08:32:50.061Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-a-1795077170129', 'usr_alpha_1795077166227', 'Updated Trip A: Polo Forest Luxury Glamping', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 16000, 'SAVED', TRUE, '2026-11-19T08:32:50.451Z', '2026-11-19T08:32:50.451Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-b-1795077170129', 'usr_alpha_1795077166227', 'Original Trip B: Mandvi Coastal Drive', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 22000, 'SAVED', TRUE, '2026-11-19T08:32:50.361Z', '2026-11-19T08:32:50.361Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-alpha-priv-1795077170693', 'usr_alpha_1795077166227', 'Confidential Family Pilgrimage', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:50.772Z', '2026-11-19T08:32:50.772Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-beta-priv-1795077170773', 'usr_beta_1795077166227', 'Solo Exploration in Himalayas', 'Trip to Spiti', '2026-11-20', '2026-11-25', '["Spiti"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T08:32:50.857Z', '2026-11-19T08:32:50.857Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-legacy-v1-1795077171189', 'usr_alpha_1795077166227', 'Legacy Ahmedabad Heritage Walk', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 15000, 'COMPLETED', TRUE, '2026-11-19T08:32:51.347Z', '2026-11-19T08:32:51.347Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dedup-1795077171529', 'usr_alpha_1795077166227', 'Retried Trip Submission (Same ID)', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-19T08:32:51.730Z', '2026-11-19T08:32:51.730Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795089197178', 'usr_test_1795089196307', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-19T11:53:17.292Z', '2026-11-19T11:53:17.292Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795089197405', 'usr_test_1795089196307', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:17.524Z', '2026-11-19T11:53:17.524Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795089197405', 'usr_test_1795089196307', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:17.627Z', '2026-11-19T11:53:17.627Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795089197405', 'usr_test_1795089196307', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:17.953Z', '2026-11-19T11:53:17.953Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795089197405', 'usr_test_1795089196307', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:18.034Z', '2026-11-19T11:53:18.034Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795089197405', 'usr_test_1795089196307', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:18.114Z', '2026-11-19T11:53:18.114Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795089197405', 'usr_test_1795089196307', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:18.264Z', '2026-11-19T11:53:18.264Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795089197405', 'usr_test_1795089196307', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:18.363Z', '2026-11-19T11:53:18.363Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795089197405', 'usr_test_1795089196307', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:18.454Z', '2026-11-19T11:53:18.454Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795089197405', 'usr_test_1795089196307', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:18.560Z', '2026-11-19T11:53:18.560Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795089197405', 'usr_test_1795089196307', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:18.643Z', '2026-11-19T11:53:18.643Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795089198755', 'usr_test_1795089196307', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:18.839Z', '2026-11-19T11:53:18.839Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795089198931', 'usr_test_1795089196307', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-19T11:53:19.027Z', '2026-11-19T11:53:19.027Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795089199119', 'usr_test_1795089196307', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:19.213Z', '2026-11-19T11:53:19.213Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795089199287', 'usr_test_1795089196307', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:19.364Z', '2026-11-19T11:53:19.364Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795089199972', 'usr_test_1795089196307', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-19T11:53:20.051Z', '2026-11-19T11:53:20.051Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795089200126', 'usr_test_1795089196307', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-19T11:53:20.383Z', '2026-11-19T11:53:20.383Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795089200126', 'usr_test_1795089196307', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-19T11:53:20.294Z', '2026-11-19T11:53:20.294Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795089200549', 'usr_test_1795089196307', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-19T11:53:20.627Z', '2026-11-19T11:53:20.627Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795149819287', 'usr_alpha_1795149818510', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T04:43:39.379Z', '2026-11-20T04:43:39.379Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-01-1795149819628', 'usr_alpha_1795149818510', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:39.785Z', '2026-11-20T04:43:39.785Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-02-1795149819628', 'usr_alpha_1795149818510', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:39.870Z', '2026-11-20T04:43:39.870Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-03-1795149819628', 'usr_alpha_1795149818510', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:39.965Z', '2026-11-20T04:43:39.965Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-04-1795149819628', 'usr_alpha_1795149818510', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:40.047Z', '2026-11-20T04:43:40.047Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-05-1795149819628', 'usr_alpha_1795149818510', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:40.151Z', '2026-11-20T04:43:40.151Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-06-1795149819628', 'usr_alpha_1795149818510', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:40.283Z', '2026-11-20T04:43:40.283Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-07-1795149819628', 'usr_alpha_1795149818510', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:40.396Z', '2026-11-20T04:43:40.396Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-08-1795149819628', 'usr_alpha_1795149818510', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:40.523Z', '2026-11-20T04:43:40.523Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-09-1795149819628', 'usr_alpha_1795149818510', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:40.635Z', '2026-11-20T04:43:40.635Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-10-1795149819628', 'usr_alpha_1795149818510', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:40.754Z', '2026-11-20T04:43:40.754Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795149820847', 'usr_alpha_1795149818510', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:40.926Z', '2026-11-20T04:43:40.926Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795149821017', 'usr_alpha_1795149818510', 'Backend Build Deployment Test', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T04:43:41.089Z', '2026-11-20T04:43:41.089Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-restart-1795149821191', 'usr_alpha_1795149818510', 'Kevadia Statue of Unity Tour', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:41.275Z', '2026-11-20T04:43:41.275Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-db-restart-1795149821515', 'usr_alpha_1795149818510', 'Patan Stepwell & Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:41.601Z', '2026-11-20T04:43:41.601Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795149822131-08f68', 'usr_returning_30d_1795149821708', 'Pawa Garh Ropeway & Temple', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:42.131Z', '2026-11-20T04:43:42.131Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795149822457', 'usr_alpha_1795149818510', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T04:43:42.566Z', '2026-11-20T04:43:42.566Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-a-1795149822651', 'usr_alpha_1795149818510', 'Updated Trip A: Polo Forest Luxury Glamping', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 16000, 'SAVED', TRUE, '2026-11-20T04:43:42.969Z', '2026-11-20T04:43:42.969Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-b-1795149822651', 'usr_alpha_1795149818510', 'Original Trip B: Mandvi Coastal Drive', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 22000, 'SAVED', TRUE, '2026-11-20T04:43:42.881Z', '2026-11-20T04:43:42.881Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-alpha-priv-1795149823146', 'usr_alpha_1795149818510', 'Confidential Family Pilgrimage', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:43.275Z', '2026-11-20T04:43:43.275Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-beta-priv-1795149823278', 'usr_beta_1795149818510', 'Solo Exploration in Himalayas', 'Trip to Spiti', '2026-11-20', '2026-11-25', '["Spiti"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T04:43:43.375Z', '2026-11-20T04:43:43.375Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-legacy-v1-1795149823751', 'usr_alpha_1795149818510', 'Legacy Ahmedabad Heritage Walk', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 15000, 'COMPLETED', TRUE, '2026-11-20T04:43:43.861Z', '2026-11-20T04:43:43.861Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dedup-1795149824070', 'usr_alpha_1795149818510', 'Retried Trip Submission (Same ID)', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-20T04:43:44.251Z', '2026-11-20T04:43:44.251Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150100691-estmc', 'usr_prod_test_1795150100021', 'Golden Triangle Exploration', 'Trip to Jaipur, Rajasthan', '2026-12-01', '2026-12-05', '["Jaipur, Rajasthan"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T04:48:20.691Z', '2026-11-20T04:48:20.691Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150101381-yvktf', 'usr_prod_test_1795150100021', 'Ladakh High Passes Roadtrip', 'Trip to Leh Ladakh', '2027-06-15', '2026-11-25', '["Leh Ladakh"]'::jsonb, '{}'::jsonb, 65000, 'PLANNING', TRUE, '2026-11-20T04:48:21.381Z', '2026-11-20T04:48:21.381Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150101624-ds6lt', 'usr_prod_test_1795150100021', 'Varanasi Spiritual Ghats Tour', 'Trip to Varanasi', '2026-11-28', '2026-11-25', '["Varanasi"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T04:48:21.624Z', '2026-11-20T04:48:21.624Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150102132-p0o1a', 'usr_prod_test_1795150100021', 'Shimla Snow Tour (Updated Budget)', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T04:48:22.759Z', '2026-11-20T04:48:22.759Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150102928-95yby', 'usr_tenant_beta_1795150102852', 'Beta Secret Retreat', 'Trip to Coorg', '2026-11-20', '2026-11-25', '["Coorg"]'::jsonb, '{}'::jsonb, 35000, 'SAVED', TRUE, '2026-11-20T04:48:22.928Z', '2026-11-20T04:48:22.928Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150135162-pye0p', 'usr_prod_test_1795150134828', 'Golden Triangle Exploration', 'Trip to Jaipur, Rajasthan', '2026-12-01', '2026-12-05', '["Jaipur, Rajasthan"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T04:48:55.162Z', '2026-11-20T04:48:55.162Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150135787-9vrrz', 'usr_prod_test_1795150134828', 'Ladakh High Passes Roadtrip', 'Trip to Leh Ladakh', '2027-06-15', '2026-11-25', '["Leh Ladakh"]'::jsonb, '{}'::jsonb, 65000, 'PLANNING', TRUE, '2026-11-20T04:48:55.787Z', '2026-11-20T04:48:55.787Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150136013-lb0pg', 'usr_prod_test_1795150134828', 'Varanasi Spiritual Ghats Tour', 'Trip to Varanasi', '2026-11-28', '2026-11-25', '["Varanasi"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T04:48:56.013Z', '2026-11-20T04:48:56.013Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150136473-w76hi', 'usr_prod_test_1795150134828', 'Shimla Snow Tour (Updated Budget)', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T04:48:56.771Z', '2026-11-20T04:48:56.771Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150136967-wm4jj', 'usr_tenant_beta_1795150136878', 'Beta Secret Retreat', 'Trip to Coorg', '2026-11-20', '2026-11-25', '["Coorg"]'::jsonb, '{}'::jsonb, 35000, 'SAVED', TRUE, '2026-11-20T04:48:56.967Z', '2026-11-20T04:48:56.967Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150268513-xugaw', 'usr_prod_test_1795150268074', 'Golden Triangle Exploration', 'Trip to Jaipur, Rajasthan', '2026-12-01', '2026-12-05', '["Jaipur, Rajasthan"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T04:51:08.513Z', '2026-11-20T04:51:08.513Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150269161-qgvp6', 'usr_prod_test_1795150268074', 'Ladakh High Passes Roadtrip', 'Trip to Leh Ladakh', '2027-06-15', '2026-11-25', '["Leh Ladakh"]'::jsonb, '{}'::jsonb, 65000, 'PLANNING', TRUE, '2026-11-20T04:51:09.161Z', '2026-11-20T04:51:09.161Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150269319-3d6y1', 'usr_prod_test_1795150268074', 'Varanasi Spiritual Ghats Tour', 'Trip to Varanasi', '2026-11-28', '2026-11-25', '["Varanasi"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T04:51:09.319Z', '2026-11-20T04:51:09.319Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150269853-0rccj', 'usr_prod_test_1795150268074', 'Shimla Snow Tour (Updated Budget)', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T04:51:10.450Z', '2026-11-20T04:51:10.450Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795150270638-zq1bp', 'usr_tenant_beta_1795150270533', 'Beta Secret Retreat', 'Trip to Coorg', '2026-11-20', '2026-11-25', '["Coorg"]'::jsonb, '{}'::jsonb, 35000, 'SAVED', TRUE, '2026-11-20T04:51:10.638Z', '2026-11-20T04:51:10.638Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795151573165', 'usr_test_1795151572392', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:12:53.288Z', '2026-11-20T05:12:53.288Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795151573413', 'usr_test_1795151572392', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:53.510Z', '2026-11-20T05:12:53.510Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795151573413', 'usr_test_1795151572392', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:53.637Z', '2026-11-20T05:12:53.637Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795151573413', 'usr_test_1795151572392', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:53.755Z', '2026-11-20T05:12:53.755Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795151573413', 'usr_test_1795151572392', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:53.886Z', '2026-11-20T05:12:53.886Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795151573413', 'usr_test_1795151572392', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:54.022Z', '2026-11-20T05:12:54.022Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795151573413', 'usr_test_1795151572392', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:54.140Z', '2026-11-20T05:12:54.140Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795151573413', 'usr_test_1795151572392', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:54.224Z', '2026-11-20T05:12:54.224Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795151573413', 'usr_test_1795151572392', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:54.339Z', '2026-11-20T05:12:54.339Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795151573413', 'usr_test_1795151572392', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:54.430Z', '2026-11-20T05:12:54.430Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795151573413', 'usr_test_1795151572392', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:54.532Z', '2026-11-20T05:12:54.532Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795151574623', 'usr_test_1795151572392', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:54.710Z', '2026-11-20T05:12:54.710Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795151574799', 'usr_test_1795151572392', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T05:12:54.879Z', '2026-11-20T05:12:54.879Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795151574957', 'usr_test_1795151572392', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:55.034Z', '2026-11-20T05:12:55.034Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795151575114', 'usr_test_1795151572392', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:55.208Z', '2026-11-20T05:12:55.208Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795151575906', 'usr_test_1795151572392', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T05:12:55.995Z', '2026-11-20T05:12:55.995Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795151576100', 'usr_test_1795151572392', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:12:56.463Z', '2026-11-20T05:12:56.463Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795151576100', 'usr_test_1795151572392', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T05:12:56.365Z', '2026-11-20T05:12:56.365Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795151576654', 'usr_test_1795151572392', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:12:56.750Z', '2026-11-20T05:12:56.750Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip_user_a_1795151652995', 'usr_cmd_alice_101', 'Private Expedition', 'Trip to Shimla', '2026-11-20', '2026-11-25', '["Shimla"]'::jsonb, '{}'::jsonb, 20000, 'PLANNING', TRUE, '2026-11-20T05:14:13.072Z', '2026-11-20T05:14:13.072Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795151868045', 'usr_test_1795151867606', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:17:48.146Z', '2026-11-20T05:17:48.146Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795151868252', 'usr_test_1795151867606', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:48.346Z', '2026-11-20T05:17:48.346Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795151868252', 'usr_test_1795151867606', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:48.441Z', '2026-11-20T05:17:48.441Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795151868252', 'usr_test_1795151867606', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:48.519Z', '2026-11-20T05:17:48.519Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795151868252', 'usr_test_1795151867606', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:48.623Z', '2026-11-20T05:17:48.623Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795151868252', 'usr_test_1795151867606', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:48.718Z', '2026-11-20T05:17:48.718Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795151868252', 'usr_test_1795151867606', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:48.808Z', '2026-11-20T05:17:48.808Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795151868252', 'usr_test_1795151867606', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:48.904Z', '2026-11-20T05:17:48.904Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795151868252', 'usr_test_1795151867606', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:48.995Z', '2026-11-20T05:17:48.995Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795151868252', 'usr_test_1795151867606', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:49.064Z', '2026-11-20T05:17:49.064Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795151868252', 'usr_test_1795151867606', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:49.166Z', '2026-11-20T05:17:49.166Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795151869257', 'usr_test_1795151867606', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:49.328Z', '2026-11-20T05:17:49.328Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795151869403', 'usr_test_1795151867606', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T05:17:49.503Z', '2026-11-20T05:17:49.503Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795151869586', 'usr_test_1795151867606', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:49.656Z', '2026-11-20T05:17:49.656Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795151869738', 'usr_test_1795151867606', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:49.826Z', '2026-11-20T05:17:49.826Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795151870922', 'usr_test_1795151867606', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T05:17:51.004Z', '2026-11-20T05:17:51.004Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795151871209', 'usr_test_1795151867606', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:17:51.516Z', '2026-11-20T05:17:51.516Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795151871209', 'usr_test_1795151867606', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T05:17:51.419Z', '2026-11-20T05:17:51.419Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795151871745', 'usr_test_1795151867606', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:17:51.817Z', '2026-11-20T05:17:51.817Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip_user_a_1795151923332', 'usr_cmd_alice_101', 'Private Expedition', 'Trip to Shimla', '2026-11-20', '2026-11-25', '["Shimla"]'::jsonb, '{}'::jsonb, 20000, 'PLANNING', TRUE, '2026-11-20T05:18:43.414Z', '2026-11-20T05:18:43.414Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795151985860', 'usr_test_1795151985567', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:19:45.976Z', '2026-11-20T05:19:45.976Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795151986313', 'usr_test_1795151985567', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:46.412Z', '2026-11-20T05:19:46.412Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795151986313', 'usr_test_1795151985567', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:46.499Z', '2026-11-20T05:19:46.499Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795151986313', 'usr_test_1795151985567', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:46.588Z', '2026-11-20T05:19:46.588Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795151986313', 'usr_test_1795151985567', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:46.673Z', '2026-11-20T05:19:46.673Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795151986313', 'usr_test_1795151985567', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:46.794Z', '2026-11-20T05:19:46.794Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795151986313', 'usr_test_1795151985567', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:46.879Z', '2026-11-20T05:19:46.879Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795151986313', 'usr_test_1795151985567', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:46.963Z', '2026-11-20T05:19:46.963Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795151986313', 'usr_test_1795151985567', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:47.066Z', '2026-11-20T05:19:47.066Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795151986313', 'usr_test_1795151985567', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:47.136Z', '2026-11-20T05:19:47.136Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795151986313', 'usr_test_1795151985567', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:47.230Z', '2026-11-20T05:19:47.230Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795151987351', 'usr_test_1795151985567', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:47.415Z', '2026-11-20T05:19:47.415Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795151987544', 'usr_test_1795151985567', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T05:19:47.666Z', '2026-11-20T05:19:47.666Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795151987746', 'usr_test_1795151985567', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:47.826Z', '2026-11-20T05:19:47.826Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795151987901', 'usr_test_1795151985567', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:48.055Z', '2026-11-20T05:19:48.055Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795151988671', 'usr_test_1795151985567', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T05:19:48.778Z', '2026-11-20T05:19:48.778Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795151988855', 'usr_test_1795151985567', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:19:49.121Z', '2026-11-20T05:19:49.121Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795151988855', 'usr_test_1795151985567', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T05:19:49.038Z', '2026-11-20T05:19:49.038Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795151989376', 'usr_test_1795151985567', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:19:49.449Z', '2026-11-20T05:19:49.449Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795152412440-rera9', 'usr_prod_test_1795152411800', 'Golden Triangle Exploration', 'Trip to Jaipur, Rajasthan', '2026-12-01', '2026-12-05', '["Jaipur, Rajasthan"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T05:26:52.440Z', '2026-11-20T05:26:52.440Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795152412930-m123b', 'usr_prod_test_1795152411800', 'Ladakh High Passes Roadtrip', 'Trip to Leh Ladakh', '2027-06-15', '2026-11-25', '["Leh Ladakh"]'::jsonb, '{}'::jsonb, 65000, 'PLANNING', TRUE, '2026-11-20T05:26:52.930Z', '2026-11-20T05:26:52.930Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795152413146-6rztg', 'usr_prod_test_1795152411800', 'Varanasi Spiritual Ghats Tour', 'Trip to Varanasi', '2026-11-28', '2026-11-25', '["Varanasi"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T05:26:53.146Z', '2026-11-20T05:26:53.146Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795152413700-6w6p4', 'usr_prod_test_1795152411800', 'Shimla Snow Tour (Updated Budget)', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T05:26:54.238Z', '2026-11-20T05:26:54.238Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795152414464-99u4r', 'usr_tenant_beta_1795152414383', 'Beta Secret Retreat', 'Trip to Coorg', '2026-11-20', '2026-11-25', '["Coorg"]'::jsonb, '{}'::jsonb, 35000, 'SAVED', TRUE, '2026-11-20T05:26:54.464Z', '2026-11-20T05:26:54.464Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153052546-jrlmr', 'usr_concurrent_1795153052452', 'Concurrent Itinerary #1', 'Trip to City 1', '2026-11-25', '2026-11-28', '["City 1"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-20T05:37:32.546Z', '2026-11-20T05:37:32.546Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153052651-igf1w', 'usr_concurrent_1795153052452', 'Concurrent Itinerary #4', 'Trip to City 4', '2026-11-25', '2026-11-28', '["City 4"]'::jsonb, '{}'::jsonb, 13000, 'SAVED', TRUE, '2026-11-20T05:37:32.651Z', '2026-11-20T05:37:32.651Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153052934-0awxk', 'usr_concurrent_1795153052452', 'Concurrent Itinerary #2', 'Trip to City 2', '2026-11-25', '2026-11-28', '["City 2"]'::jsonb, '{}'::jsonb, 11000, 'SAVED', TRUE, '2026-11-20T05:37:32.934Z', '2026-11-20T05:37:32.934Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153052957-2olw4', 'usr_concurrent_1795153052452', 'Concurrent Itinerary #3', 'Trip to City 3', '2026-11-25', '2026-11-28', '["City 3"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T05:37:32.957Z', '2026-11-20T05:37:32.957Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153052985-0tpj8', 'usr_concurrent_1795153052452', 'Concurrent Itinerary #5', 'Trip to City 5', '2026-11-25', '2026-11-28', '["City 5"]'::jsonb, '{}'::jsonb, 14000, 'SAVED', TRUE, '2026-11-20T05:37:32.985Z', '2026-11-20T05:37:32.985Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153053260-w0qp7', 'usr_tenant_beta_1795153053156', 'Confidential Business Trip to Surat Diamond Bourse', 'Trip to Surat, Gujarat', '2026-12-05', '2026-12-07', '["Surat, Gujarat"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:37:33.260Z', '2026-11-20T05:37:33.260Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153124094-2asgu', 'usr_concurrent_1795153124001', 'Concurrent Itinerary #1', 'Trip to City 1', '2026-11-25', '2026-11-28', '["City 1"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-20T05:38:44.094Z', '2026-11-20T05:38:44.094Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153124199-wm119', 'usr_concurrent_1795153124001', 'Concurrent Itinerary #3', 'Trip to City 3', '2026-11-25', '2026-11-28', '["City 3"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T05:38:44.199Z', '2026-11-20T05:38:44.199Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153124208-a1uvv', 'usr_concurrent_1795153124001', 'Concurrent Itinerary #5', 'Trip to City 5', '2026-11-25', '2026-11-28', '["City 5"]'::jsonb, '{}'::jsonb, 14000, 'SAVED', TRUE, '2026-11-20T05:38:44.208Z', '2026-11-20T05:38:44.208Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153124244-mznr0', 'usr_concurrent_1795153124001', 'Concurrent Itinerary #4', 'Trip to City 4', '2026-11-25', '2026-11-28', '["City 4"]'::jsonb, '{}'::jsonb, 13000, 'SAVED', TRUE, '2026-11-20T05:38:44.244Z', '2026-11-20T05:38:44.244Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153124515-coh46', 'usr_concurrent_1795153124001', 'Concurrent Itinerary #2', 'Trip to City 2', '2026-11-25', '2026-11-28', '["City 2"]'::jsonb, '{}'::jsonb, 11000, 'SAVED', TRUE, '2026-11-20T05:38:44.515Z', '2026-11-20T05:38:44.515Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153124845-sjkau', 'usr_tenant_beta_1795153124756', 'Confidential Business Trip to Surat Diamond Bourse', 'Trip to Surat, Gujarat', '2026-12-05', '2026-12-07', '["Surat, Gujarat"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:38:44.845Z', '2026-11-20T05:38:44.845Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153149837-82k0b', 'usr_prod_14_1795153149063', 'Kutch White Desert & Mandvi Coast', 'Trip to Bhuj, Gujarat', '2026-12-15', '2026-12-20', '["Bhuj, Gujarat"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:39:09.837Z', '2026-11-20T05:39:09.837Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153151447-ijcl8', 'usr_restart_1795153151351', 'Pre-Restart Wildlife Expedition', 'Trip to Gir, Gujarat', '2026-12-10', '2026-12-12', '["Gir, Gujarat"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:39:11.447Z', '2026-11-20T05:39:11.447Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153151658-yb29s', 'usr_concurrent_1795153151558', 'Concurrent Itinerary #1', 'Trip to City 1', '2026-11-25', '2026-11-28', '["City 1"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-20T05:39:11.658Z', '2026-11-20T05:39:11.658Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153151749-mdd2b', 'usr_concurrent_1795153151558', 'Concurrent Itinerary #2', 'Trip to City 2', '2026-11-25', '2026-11-28', '["City 2"]'::jsonb, '{}'::jsonb, 11000, 'SAVED', TRUE, '2026-11-20T05:39:11.749Z', '2026-11-20T05:39:11.749Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153151758-wt24h', 'usr_concurrent_1795153151558', 'Concurrent Itinerary #5', 'Trip to City 5', '2026-11-25', '2026-11-28', '["City 5"]'::jsonb, '{}'::jsonb, 14000, 'SAVED', TRUE, '2026-11-20T05:39:11.758Z', '2026-11-20T05:39:11.758Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153151759-l0ash', 'usr_concurrent_1795153151558', 'Concurrent Itinerary #3', 'Trip to City 3', '2026-11-25', '2026-11-28', '["City 3"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T05:39:11.759Z', '2026-11-20T05:39:11.759Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153151763-4y8r7', 'usr_concurrent_1795153151558', 'Concurrent Itinerary #4', 'Trip to City 4', '2026-11-25', '2026-11-28', '["City 4"]'::jsonb, '{}'::jsonb, 13000, 'SAVED', TRUE, '2026-11-20T05:39:11.763Z', '2026-11-20T05:39:11.763Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153152114-52xw7', 'usr_tenant_beta_1795153151937', 'Confidential Business Trip to Surat Diamond Bourse', 'Trip to Surat, Gujarat', '2026-12-05', '2026-12-07', '["Surat, Gujarat"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:39:12.114Z', '2026-11-20T05:39:12.114Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153322735-qd0ck', 'usr_prod_14_1795153321560', 'Kutch White Desert & Mandvi Coast', 'Trip to Bhuj, Gujarat', '2026-12-15', '2026-12-20', '["Bhuj, Gujarat"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:42:02.735Z', '2026-11-20T05:42:02.735Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153324246-ugi76', 'usr_restart_1795153324147', 'Pre-Restart Wildlife Expedition', 'Trip to Gir, Gujarat', '2026-12-10', '2026-12-12', '["Gir, Gujarat"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:04.246Z', '2026-11-20T05:42:04.246Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153324391-sdhsc', 'usr_concurrent_1795153324317', 'Concurrent Itinerary #1', 'Trip to City 1', '2026-11-25', '2026-11-28', '["City 1"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-20T05:42:04.391Z', '2026-11-20T05:42:04.391Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153324640-x4ru7', 'usr_concurrent_1795153324317', 'Concurrent Itinerary #3', 'Trip to City 3', '2026-11-25', '2026-11-28', '["City 3"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T05:42:04.640Z', '2026-11-20T05:42:04.640Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153324646-1ku84', 'usr_concurrent_1795153324317', 'Concurrent Itinerary #2', 'Trip to City 2', '2026-11-25', '2026-11-28', '["City 2"]'::jsonb, '{}'::jsonb, 11000, 'SAVED', TRUE, '2026-11-20T05:42:04.646Z', '2026-11-20T05:42:04.646Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153324660-dut07', 'usr_concurrent_1795153324317', 'Concurrent Itinerary #4', 'Trip to City 4', '2026-11-25', '2026-11-28', '["City 4"]'::jsonb, '{}'::jsonb, 13000, 'SAVED', TRUE, '2026-11-20T05:42:04.660Z', '2026-11-20T05:42:04.660Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153324799-ecefu', 'usr_concurrent_1795153324317', 'Concurrent Itinerary #5', 'Trip to City 5', '2026-11-25', '2026-11-28', '["City 5"]'::jsonb, '{}'::jsonb, 14000, 'SAVED', TRUE, '2026-11-20T05:42:04.799Z', '2026-11-20T05:42:04.799Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153325076-7v183', 'usr_tenant_beta_1795153324986', 'Confidential Business Trip to Surat Diamond Bourse', 'Trip to Surat, Gujarat', '2026-12-05', '2026-12-07', '["Surat, Gujarat"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:42:05.076Z', '2026-11-20T05:42:05.076Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153338834-eury6', 'usr_prod_14_1795153338116', 'Kutch White Desert & Mandvi Coast', 'Trip to Bhuj, Gujarat', '2026-12-15', '2026-12-20', '["Bhuj, Gujarat"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:42:18.834Z', '2026-11-20T05:42:18.834Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153340354-viveq', 'usr_restart_1795153340258', 'Pre-Restart Wildlife Expedition', 'Trip to Gir, Gujarat', '2026-12-10', '2026-12-12', '["Gir, Gujarat"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:20.354Z', '2026-11-20T05:42:20.354Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153340509-t4847', 'usr_concurrent_1795153340439', 'Concurrent Itinerary #1', 'Trip to City 1', '2026-11-25', '2026-11-28', '["City 1"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-20T05:42:20.509Z', '2026-11-20T05:42:20.509Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153340633-0jrok', 'usr_concurrent_1795153340439', 'Concurrent Itinerary #4', 'Trip to City 4', '2026-11-25', '2026-11-28', '["City 4"]'::jsonb, '{}'::jsonb, 13000, 'SAVED', TRUE, '2026-11-20T05:42:20.633Z', '2026-11-20T05:42:20.633Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153340645-yd4ql', 'usr_concurrent_1795153340439', 'Concurrent Itinerary #3', 'Trip to City 3', '2026-11-25', '2026-11-28', '["City 3"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T05:42:20.645Z', '2026-11-20T05:42:20.645Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153340814-29p3l', 'usr_concurrent_1795153340439', 'Concurrent Itinerary #2', 'Trip to City 2', '2026-11-25', '2026-11-28', '["City 2"]'::jsonb, '{}'::jsonb, 11000, 'SAVED', TRUE, '2026-11-20T05:42:20.814Z', '2026-11-20T05:42:20.814Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153340818-dxyk1', 'usr_concurrent_1795153340439', 'Concurrent Itinerary #5', 'Trip to City 5', '2026-11-25', '2026-11-28', '["City 5"]'::jsonb, '{}'::jsonb, 14000, 'SAVED', TRUE, '2026-11-20T05:42:20.818Z', '2026-11-20T05:42:20.818Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153341088-9a27d', 'usr_tenant_beta_1795153340987', 'Confidential Business Trip to Surat Diamond Bourse', 'Trip to Surat, Gujarat', '2026-12-05', '2026-12-07', '["Surat, Gujarat"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:42:21.088Z', '2026-11-20T05:42:21.088Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795153374750', 'usr_test_1795153374531', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:54.838Z', '2026-11-20T05:42:54.838Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795153374750', 'usr_test_1795153374531', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:54.946Z', '2026-11-20T05:42:54.946Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795153374750', 'usr_test_1795153374531', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:55.046Z', '2026-11-20T05:42:55.046Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795153374750', 'usr_test_1795153374531', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:55.221Z', '2026-11-20T05:42:55.221Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795153374750', 'usr_test_1795153374531', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:55.309Z', '2026-11-20T05:42:55.309Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795153374750', 'usr_test_1795153374531', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:55.520Z', '2026-11-20T05:42:55.520Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795153374750', 'usr_test_1795153374531', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:55.624Z', '2026-11-20T05:42:55.624Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795153374750', 'usr_test_1795153374531', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:55.720Z', '2026-11-20T05:42:55.720Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795153374750', 'usr_test_1795153374531', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:55.811Z', '2026-11-20T05:42:55.811Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795153374750', 'usr_test_1795153374531', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:55.944Z', '2026-11-20T05:42:55.944Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795153376026', 'usr_test_1795153374531', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:56.154Z', '2026-11-20T05:42:56.154Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795153376224', 'usr_test_1795153374531', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T05:42:56.451Z', '2026-11-20T05:42:56.451Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795153376517', 'usr_test_1795153374531', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:56.594Z', '2026-11-20T05:42:56.594Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795153376662', 'usr_test_1795153374531', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:56.763Z', '2026-11-20T05:42:56.763Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795153377393', 'usr_test_1795153374531', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T05:42:57.479Z', '2026-11-20T05:42:57.479Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795153377568', 'usr_test_1795153374531', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:42:57.881Z', '2026-11-20T05:42:57.881Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795153377568', 'usr_test_1795153374531', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T05:42:57.786Z', '2026-11-20T05:42:57.786Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795153378068', 'usr_test_1795153374531', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:42:58.169Z', '2026-11-20T05:42:58.169Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795153442152', 'usr_test_1795153441756', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:44:02.248Z', '2026-11-20T05:44:02.248Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795153442337', 'usr_test_1795153441756', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:02.457Z', '2026-11-20T05:44:02.457Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795153442337', 'usr_test_1795153441756', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:02.569Z', '2026-11-20T05:44:02.569Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795153442337', 'usr_test_1795153441756', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:02.659Z', '2026-11-20T05:44:02.659Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795153442337', 'usr_test_1795153441756', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:02.833Z', '2026-11-20T05:44:02.833Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795153442337', 'usr_test_1795153441756', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:02.921Z', '2026-11-20T05:44:02.921Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795153442337', 'usr_test_1795153441756', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:03.000Z', '2026-11-20T05:44:03.000Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795153442337', 'usr_test_1795153441756', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:03.088Z', '2026-11-20T05:44:03.088Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795153442337', 'usr_test_1795153441756', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:03.175Z', '2026-11-20T05:44:03.175Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795153442337', 'usr_test_1795153441756', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:03.262Z', '2026-11-20T05:44:03.262Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795153442337', 'usr_test_1795153441756', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:03.346Z', '2026-11-20T05:44:03.346Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795153443451', 'usr_test_1795153441756', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:03.547Z', '2026-11-20T05:44:03.547Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795153443643', 'usr_test_1795153441756', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T05:44:03.738Z', '2026-11-20T05:44:03.738Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795153443833', 'usr_test_1795153441756', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:03.906Z', '2026-11-20T05:44:03.906Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795153444005', 'usr_test_1795153441756', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:04.098Z', '2026-11-20T05:44:04.098Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795153444712', 'usr_test_1795153441756', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T05:44:04.773Z', '2026-11-20T05:44:04.773Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795153444839', 'usr_test_1795153441756', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:44:05.091Z', '2026-11-20T05:44:05.091Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795153444839', 'usr_test_1795153441756', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T05:44:05.014Z', '2026-11-20T05:44:05.014Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795153445289', 'usr_test_1795153441756', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:05.353Z', '2026-11-20T05:44:05.353Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153456275-pib5w', 'usr_prod_14_1795153455382', 'Kutch White Desert & Mandvi Coast', 'Trip to Bhuj, Gujarat', '2026-12-15', '2026-12-20', '["Bhuj, Gujarat"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:44:16.275Z', '2026-11-20T05:44:16.275Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153457744-tuvo1', 'usr_restart_1795153457672', 'Pre-Restart Wildlife Expedition', 'Trip to Gir, Gujarat', '2026-12-10', '2026-12-12', '["Gir, Gujarat"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:44:17.744Z', '2026-11-20T05:44:17.744Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153458032-if2iu', 'usr_concurrent_1795153457823', 'Concurrent Itinerary #1', 'Trip to City 1', '2026-11-25', '2026-11-28', '["City 1"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-20T05:44:18.032Z', '2026-11-20T05:44:18.032Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153458039-bmrja', 'usr_concurrent_1795153457823', 'Concurrent Itinerary #5', 'Trip to City 5', '2026-11-25', '2026-11-28', '["City 5"]'::jsonb, '{}'::jsonb, 14000, 'SAVED', TRUE, '2026-11-20T05:44:18.039Z', '2026-11-20T05:44:18.039Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153458050-axorl', 'usr_concurrent_1795153457823', 'Concurrent Itinerary #2', 'Trip to City 2', '2026-11-25', '2026-11-28', '["City 2"]'::jsonb, '{}'::jsonb, 11000, 'SAVED', TRUE, '2026-11-20T05:44:18.050Z', '2026-11-20T05:44:18.050Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153458053-g1vqe', 'usr_concurrent_1795153457823', 'Concurrent Itinerary #4', 'Trip to City 4', '2026-11-25', '2026-11-28', '["City 4"]'::jsonb, '{}'::jsonb, 13000, 'SAVED', TRUE, '2026-11-20T05:44:18.053Z', '2026-11-20T05:44:18.053Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153458185-hm5dl', 'usr_concurrent_1795153457823', 'Concurrent Itinerary #3', 'Trip to City 3', '2026-11-25', '2026-11-28', '["City 3"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T05:44:18.185Z', '2026-11-20T05:44:18.185Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795153458438-6yv6v', 'usr_tenant_beta_1795153458364', 'Confidential Business Trip to Surat Diamond Bourse', 'Trip to Surat, Gujarat', '2026-12-05', '2026-12-07', '["Surat, Gujarat"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:44:18.438Z', '2026-11-20T05:44:18.438Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795153968299', 'usr_test_1795153967529', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T05:52:48.412Z', '2026-11-20T05:52:48.412Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795153968526', 'usr_test_1795153967529', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:48.663Z', '2026-11-20T05:52:48.663Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795153968526', 'usr_test_1795153967529', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:48.803Z', '2026-11-20T05:52:48.803Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795153968526', 'usr_test_1795153967529', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:48.916Z', '2026-11-20T05:52:48.916Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795153968526', 'usr_test_1795153967529', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:49.067Z', '2026-11-20T05:52:49.067Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795153968526', 'usr_test_1795153967529', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:49.192Z', '2026-11-20T05:52:49.192Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795153968526', 'usr_test_1795153967529', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:49.330Z', '2026-11-20T05:52:49.330Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795153968526', 'usr_test_1795153967529', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:49.493Z', '2026-11-20T05:52:49.493Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795153968526', 'usr_test_1795153967529', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:49.582Z', '2026-11-20T05:52:49.582Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795153968526', 'usr_test_1795153967529', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:49.689Z', '2026-11-20T05:52:49.689Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795153968526', 'usr_test_1795153967529', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:49.786Z', '2026-11-20T05:52:49.786Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795153969906', 'usr_test_1795153967529', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:50.021Z', '2026-11-20T05:52:50.021Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795153970110', 'usr_test_1795153967529', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T05:52:50.255Z', '2026-11-20T05:52:50.255Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795153970350', 'usr_test_1795153967529', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:50.487Z', '2026-11-20T05:52:50.487Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795153970644', 'usr_test_1795153967529', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:50.746Z', '2026-11-20T05:52:50.746Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795153971634', 'usr_test_1795153967529', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T05:52:51.780Z', '2026-11-20T05:52:51.780Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795153971880', 'usr_test_1795153967529', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T05:52:52.194Z', '2026-11-20T05:52:52.194Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795153971880', 'usr_test_1795153967529', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T05:52:52.101Z', '2026-11-20T05:52:52.101Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795153972389', 'usr_test_1795153967529', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T05:52:52.462Z', '2026-11-20T05:52:52.462Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795154655309', 'usr_test_1795154654995', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T06:04:15.415Z', '2026-11-20T06:04:15.415Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795154655538', 'usr_test_1795154654995', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:15.634Z', '2026-11-20T06:04:15.634Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795154655538', 'usr_test_1795154654995', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:15.732Z', '2026-11-20T06:04:15.732Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795154655538', 'usr_test_1795154654995', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:15.825Z', '2026-11-20T06:04:15.825Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795154655538', 'usr_test_1795154654995', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:15.916Z', '2026-11-20T06:04:15.916Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795154655538', 'usr_test_1795154654995', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:16.043Z', '2026-11-20T06:04:16.043Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795154655538', 'usr_test_1795154654995', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:16.148Z', '2026-11-20T06:04:16.148Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795154655538', 'usr_test_1795154654995', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:16.258Z', '2026-11-20T06:04:16.258Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795154655538', 'usr_test_1795154654995', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:16.376Z', '2026-11-20T06:04:16.376Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795154655538', 'usr_test_1795154654995', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:16.500Z', '2026-11-20T06:04:16.500Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795154655538', 'usr_test_1795154654995', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:16.622Z', '2026-11-20T06:04:16.622Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795154656720', 'usr_test_1795154654995', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:16.822Z', '2026-11-20T06:04:16.822Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795154656927', 'usr_test_1795154654995', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T06:04:17.030Z', '2026-11-20T06:04:17.030Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795154657110', 'usr_test_1795154654995', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:17.190Z', '2026-11-20T06:04:17.190Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795154657307', 'usr_test_1795154654995', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:17.457Z', '2026-11-20T06:04:17.457Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795154658146', 'usr_test_1795154654995', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T06:04:18.244Z', '2026-11-20T06:04:18.244Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795154658345', 'usr_test_1795154654995', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T06:04:18.597Z', '2026-11-20T06:04:18.597Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795154658345', 'usr_test_1795154654995', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T06:04:18.518Z', '2026-11-20T06:04:18.518Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795154658803', 'usr_test_1795154654995', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:04:18.883Z', '2026-11-20T06:04:18.883Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795157288186', 'usr_test_1795157287994', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T06:48:08.259Z', '2026-11-20T06:48:08.259Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795157288338', 'usr_test_1795157287994', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:08.412Z', '2026-11-20T06:48:08.412Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795157288338', 'usr_test_1795157287994', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:08.503Z', '2026-11-20T06:48:08.503Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795157288338', 'usr_test_1795157287994', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:08.589Z', '2026-11-20T06:48:08.589Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795157288338', 'usr_test_1795157287994', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:08.665Z', '2026-11-20T06:48:08.665Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795157288338', 'usr_test_1795157287994', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:08.744Z', '2026-11-20T06:48:08.744Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795157288338', 'usr_test_1795157287994', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:08.795Z', '2026-11-20T06:48:08.795Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795157288338', 'usr_test_1795157287994', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:08.861Z', '2026-11-20T06:48:08.861Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795157288338', 'usr_test_1795157287994', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:08.931Z', '2026-11-20T06:48:08.931Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795157288338', 'usr_test_1795157287994', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:09.015Z', '2026-11-20T06:48:09.015Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795157288338', 'usr_test_1795157287994', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:09.078Z', '2026-11-20T06:48:09.078Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795157289136', 'usr_test_1795157287994', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:09.190Z', '2026-11-20T06:48:09.190Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795157289271', 'usr_test_1795157287994', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T06:48:09.330Z', '2026-11-20T06:48:09.330Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795157289854', 'usr_test_1795157287994', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:09.937Z', '2026-11-20T06:48:09.937Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795157290016', 'usr_test_1795157287994', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:10.076Z', '2026-11-20T06:48:10.076Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795157290562', 'usr_test_1795157287994', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T06:48:10.617Z', '2026-11-20T06:48:10.617Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795157290679', 'usr_test_1795157287994', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T06:48:10.872Z', '2026-11-20T06:48:10.872Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795157290679', 'usr_test_1795157287994', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T06:48:10.808Z', '2026-11-20T06:48:10.808Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795157290982', 'usr_test_1795157287994', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T06:48:11.030Z', '2026-11-20T06:48:11.030Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795159025474', 'usr_test_1795159025284', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:05.564Z', '2026-11-20T07:17:05.564Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795159025474', 'usr_test_1795159025284', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:05.647Z', '2026-11-20T07:17:05.647Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795159025474', 'usr_test_1795159025284', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:05.719Z', '2026-11-20T07:17:05.719Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795159025474', 'usr_test_1795159025284', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:05.814Z', '2026-11-20T07:17:05.814Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795159025474', 'usr_test_1795159025284', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:05.898Z', '2026-11-20T07:17:05.898Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795159025474', 'usr_test_1795159025284', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:05.955Z', '2026-11-20T07:17:05.955Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795159025474', 'usr_test_1795159025284', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:06.026Z', '2026-11-20T07:17:06.026Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795159025474', 'usr_test_1795159025284', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:06.088Z', '2026-11-20T07:17:06.088Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795159025474', 'usr_test_1795159025284', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:06.147Z', '2026-11-20T07:17:06.147Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795159025474', 'usr_test_1795159025284', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:06.247Z', '2026-11-20T07:17:06.247Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795159026319', 'usr_test_1795159025284', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:06.385Z', '2026-11-20T07:17:06.385Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795159026464', 'usr_test_1795159025284', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T07:17:06.536Z', '2026-11-20T07:17:06.536Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795159026626', 'usr_test_1795159025284', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:06.681Z', '2026-11-20T07:17:06.681Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795159026744', 'usr_test_1795159025284', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:06.827Z', '2026-11-20T07:17:06.827Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795159027461', 'usr_test_1795159025284', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T07:17:07.540Z', '2026-11-20T07:17:07.540Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795159027604', 'usr_test_1795159025284', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T07:17:07.825Z', '2026-11-20T07:17:07.825Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795159027604', 'usr_test_1795159025284', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T07:17:07.735Z', '2026-11-20T07:17:07.735Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795159027906', 'usr_test_1795159025284', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:17:08.007Z', '2026-11-20T07:17:08.007Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795159085776', 'usr_test_1795159085115', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T07:18:05.848Z', '2026-11-20T07:18:05.848Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-01-1795159085938', 'usr_test_1795159085115', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:06.015Z', '2026-11-20T07:18:06.015Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-02-1795159085938', 'usr_test_1795159085115', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:06.405Z', '2026-11-20T07:18:06.405Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-03-1795159085938', 'usr_test_1795159085115', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.218Z', '2026-11-20T07:18:07.218Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-04-1795159085938', 'usr_test_1795159085115', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.289Z', '2026-11-20T07:18:07.289Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-05-1795159085938', 'usr_test_1795159085115', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.356Z', '2026-11-20T07:18:07.356Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-06-1795159085938', 'usr_test_1795159085115', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.434Z', '2026-11-20T07:18:07.434Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-07-1795159085938', 'usr_test_1795159085115', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.492Z', '2026-11-20T07:18:07.492Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-08-1795159085938', 'usr_test_1795159085115', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.558Z', '2026-11-20T07:18:07.558Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-09-1795159085938', 'usr_test_1795159085115', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.631Z', '2026-11-20T07:18:07.631Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2u-10-1795159085938', 'usr_test_1795159085115', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.710Z', '2026-11-20T07:18:07.710Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795159087762', 'usr_test_1795159085115', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:07.825Z', '2026-11-20T07:18:07.825Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795159087919', 'usr_test_1795159085115', 'Backend Deployment Trip', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T07:18:07.976Z', '2026-11-20T07:18:07.976Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-1795159088041', 'usr_test_1795159085115', 'Statue of Unity Express', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:08.108Z', '2026-11-20T07:18:08.108Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dbrestart-1795159088165', 'usr_test_1795159085115', 'Patan Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:08.209Z', '2026-11-20T07:18:08.209Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-1795159088706', 'usr_test_1795159085115', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T07:18:08.792Z', '2026-11-20T07:18:08.792Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-a-1795159088873', 'usr_test_1795159085115', 'Trip A Updated', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 18000, 'SAVED', TRUE, '2026-11-20T07:18:09.061Z', '2026-11-20T07:18:09.061Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-mut-b-1795159088873', 'usr_test_1795159085115', 'Trip B Original', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T07:18:08.981Z', '2026-11-20T07:18:08.981Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-priv-1795159089190', 'usr_test_1795159085115', 'Confidential Journey', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:09.240Z', '2026-11-20T07:18:09.240Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dedup-u-1795159089476', 'usr_test_1795159085115', 'Retried Trip', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:09.599Z', '2026-11-20T07:18:09.599Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-t1-1795159099905', 'usr_alpha_1795159099469', 'Gir Lion Safari & Diu Beach', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 32000, 'SAVED', TRUE, '2026-11-20T07:18:19.949Z', '2026-11-20T07:18:19.949Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-01-1795159100006', 'usr_alpha_1795159099469', 'Somnath Sunset Aarti', 'Trip to Somnath', '2026-11-20', '2026-11-25', '["Somnath"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.066Z', '2026-11-20T07:18:20.066Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-02-1795159100006', 'usr_alpha_1795159099469', 'Dwarka Temple Darshan', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.147Z', '2026-11-20T07:18:20.147Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-03-1795159100006', 'usr_alpha_1795159099469', 'White Rann Salt Desert', 'Trip to Dhordo', '2026-11-20', '2026-11-25', '["Dhordo"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.224Z', '2026-11-20T07:18:20.224Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-04-1795159100006', 'usr_alpha_1795159099469', 'Gir Asiatic Lion Trail', 'Trip to Sasan Gir', '2026-11-20', '2026-11-25', '["Sasan Gir"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.302Z', '2026-11-20T07:18:20.302Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-05-1795159100006', 'usr_alpha_1795159099469', 'Palitana 863 Temples', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.358Z', '2026-11-20T07:18:20.358Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-06-1795159100006', 'usr_alpha_1795159099469', 'Saputara Hill Trek', 'Trip to Saputara', '2026-11-20', '2026-11-25', '["Saputara"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.443Z', '2026-11-20T07:18:20.443Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-07-1795159100006', 'usr_alpha_1795159099469', 'Modhera Sun Temple', 'Trip to Modhera', '2026-11-20', '2026-11-25', '["Modhera"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.501Z', '2026-11-20T07:18:20.501Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-08-1795159100006', 'usr_alpha_1795159099469', 'Statue of Unity Vista', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.562Z', '2026-11-20T07:18:20.562Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-09-1795159100006', 'usr_alpha_1795159099469', 'Mandvi Palace Beach', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.624Z', '2026-11-20T07:18:20.624Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-2-10-1795159100006', 'usr_alpha_1795159099469', 'Champaner Heritage Fort', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.726Z', '2026-11-20T07:18:20.726Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-deploy-1795159100783', 'usr_alpha_1795159099469', 'Pre-Deployment Pilgrimage', 'Trip to Palitana', '2026-11-20', '2026-11-25', '["Palitana"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:20.851Z', '2026-11-20T07:18:20.851Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-build-1795159100908', 'usr_alpha_1795159099469', 'Backend Build Deployment Test', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T07:18:20.992Z', '2026-11-20T07:18:20.992Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-backend-restart-1795159101080', 'usr_alpha_1795159099469', 'Kevadia Statue of Unity Tour', 'Trip to Kevadia', '2026-11-20', '2026-11-25', '["Kevadia"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:21.185Z', '2026-11-20T07:18:21.185Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-db-restart-1795159101239', 'usr_alpha_1795159099469', 'Patan Stepwell & Sun Temple', 'Trip to Patan', '2026-11-20', '2026-11-25', '["Patan"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:21.320Z', '2026-11-20T07:18:21.320Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-cross-dev-1795159101452', 'usr_alpha_1795159099469', 'Device A Created: Champaner UNESCO Tour', 'Trip to Champaner', '2026-11-20', '2026-11-25', '["Champaner"]'::jsonb, '{}'::jsonb, 9500, 'SAVED', TRUE, '2026-11-20T07:18:21.516Z', '2026-11-20T07:18:21.516Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-a-1795159101613', 'usr_alpha_1795159099469', 'Updated Trip A: Polo Forest Luxury Glamping', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 16000, 'SAVED', TRUE, '2026-11-20T07:18:21.806Z', '2026-11-20T07:18:21.806Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-isolate-b-1795159101613', 'usr_alpha_1795159099469', 'Original Trip B: Mandvi Coastal Drive', 'Trip to Mandvi', '2026-11-20', '2026-11-25', '["Mandvi"]'::jsonb, '{}'::jsonb, 22000, 'SAVED', TRUE, '2026-11-20T07:18:21.752Z', '2026-11-20T07:18:21.752Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-alpha-priv-1795159101855', 'usr_alpha_1795159099469', 'Confidential Family Pilgrimage', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:21.908Z', '2026-11-20T07:18:21.908Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-beta-priv-1795159101909', 'usr_beta_1795159099469', 'Solo Exploration in Himalayas', 'Trip to Spiti', '2026-11-20', '2026-11-25', '["Spiti"]'::jsonb, '{}'::jsonb, 15000, 'SAVED', TRUE, '2026-11-20T07:18:21.969Z', '2026-11-20T07:18:21.969Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-legacy-v1-1795159102045', 'usr_alpha_1795159099469', 'Legacy Ahmedabad Heritage Walk', 'Trip to Ahmedabad', '2026-11-20', '2026-11-25', '["Ahmedabad"]'::jsonb, '{}'::jsonb, 15000, 'COMPLETED', TRUE, '2026-11-20T07:18:22.088Z', '2026-11-20T07:18:22.088Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-dedup-1795159102220', 'usr_alpha_1795159099469', 'Retried Trip Submission (Same ID)', 'Trip to Dwarka', '2026-11-20', '2026-11-25', '["Dwarka"]'::jsonb, '{}'::jsonb, 10000, 'SAVED', TRUE, '2026-11-20T07:18:22.328Z', '2026-11-20T07:18:22.328Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795159105189-sc8u1', 'usr_prod_test_1795159105029', 'Golden Triangle Exploration', 'Trip to Jaipur, Rajasthan', '2026-12-01', '2026-12-05', '["Jaipur, Rajasthan"]'::jsonb, '{}'::jsonb, 25000, 'SAVED', TRUE, '2026-11-20T07:18:25.189Z', '2026-11-20T07:18:25.189Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795159105933-pfnyf', 'usr_prod_test_1795159105029', 'Ladakh High Passes Roadtrip', 'Trip to Leh Ladakh', '2027-06-15', '2026-11-25', '["Leh Ladakh"]'::jsonb, '{}'::jsonb, 65000, 'PLANNING', TRUE, '2026-11-20T07:18:25.933Z', '2026-11-20T07:18:25.933Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795159106061-nrsbv', 'usr_prod_test_1795159105029', 'Varanasi Spiritual Ghats Tour', 'Trip to Varanasi', '2026-11-28', '2026-11-25', '["Varanasi"]'::jsonb, '{}'::jsonb, 12000, 'SAVED', TRUE, '2026-11-20T07:18:26.061Z', '2026-11-20T07:18:26.061Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795159106371-mgj06', 'usr_prod_test_1795159105029', 'Shimla Snow Tour (Updated Budget)', 'Trip to India', '2026-11-20', '2026-11-25', '["India"]'::jsonb, '{}'::jsonb, 20000, 'SAVED', TRUE, '2026-11-20T07:18:26.529Z', '2026-11-20T07:18:26.529Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_trips (id, user_id, title, description, start_date, end_date, destinations, itinerary, budget, status, is_public, created_at, updated_at)
VALUES ('trip-1795159106639-3gqd8', 'usr_tenant_beta_1795159106587', 'Beta Secret Retreat', 'Trip to Coorg', '2026-11-20', '2026-11-25', '["Coorg"]'::jsonb, '{}'::jsonb, 35000, 'SAVED', TRUE, '2026-11-20T07:18:26.639Z', '2026-11-20T07:18:26.639Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  destinations = EXCLUDED.destinations,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;

-- 5. RECOVER HISTORICAL USER BOOKINGS (34 records)
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795016073433-ob73y', 'usr_returning_30d_1795016073157', NULL, NULL, 'BY-HTL-2026-52185', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795016073433-ob73y', '2026-11-18T15:34:33.433Z', '2026-11-18T15:34:33.433Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795016177464-xk87q', 'usr_returning_30d_1795016177208', NULL, NULL, 'BY-HTL-2026-98372', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795016177464-xk87q', '2026-11-18T15:36:17.465Z', '2026-11-18T15:36:17.465Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795016353307-dpkl1', 'usr_returning_30d_1795016352987', NULL, NULL, 'BY-HTL-2026-83357', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795016353307-dpkl1', '2026-11-18T15:39:13.307Z', '2026-11-18T15:39:13.307Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795064571008-pp4vf', 'usr_returning_30d_1795064570565', NULL, NULL, 'BY-HTL-2026-59812', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795064571008-pp4vf', '2026-11-19T05:02:51.008Z', '2026-11-19T05:02:51.008Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795076908185-oznm2', 'usr_returning_30d_1795076907872', NULL, NULL, 'BY-HTL-2026-94644', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795076908185-oznm2', '2026-11-19T08:28:28.185Z', '2026-11-19T08:28:28.185Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795077115452-yve6l', 'usr_returning_30d_1795077115166', NULL, NULL, 'BY-HTL-2026-94072', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795077115452-yve6l', '2026-11-19T08:31:55.452Z', '2026-11-19T08:31:55.452Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795077169464-wardo', 'usr_returning_30d_1795077169148', NULL, NULL, 'BY-HTL-2026-70992', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795077169464-wardo', '2026-11-19T08:32:49.464Z', '2026-11-19T08:32:49.464Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-dedup-1795077171529', 'usr_alpha_1795077166227', NULL, NULL, 'BY-HTL-DEDUP-1795077171529', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-dedup-1795077171529', '2026-11-19T08:32:52.003Z', '2026-11-19T08:32:52.003Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-atomic-1795077172291', 'usr_alpha_1795077166227', NULL, NULL, 'BY-HTL-ATOMIC-1795077172291', 'HOTEL', '{}'::jsonb, 2, 21000, 'INR', 'CONFIRMED', 'CANCELLED', 'PAY-bk-atomic-1795077172291', '2026-11-19T08:32:52.454Z', '2026-11-19T08:32:52.570Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795089199673-df9cx', 'usr_30d_1795089199439', NULL, NULL, 'BY-HTL-2026-32119', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795089199673-df9cx', '2026-11-19T11:53:19.674Z', '2026-11-19T11:53:19.674Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795149822019-ebm81', 'usr_returning_30d_1795149821708', NULL, NULL, 'BY-HTL-2026-10010', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795149822019-ebm81', '2026-11-20T04:43:42.019Z', '2026-11-20T04:43:42.019Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-dedup-1795149824070', 'usr_alpha_1795149818510', NULL, NULL, 'BY-HTL-DEDUP-1795149824070', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-dedup-1795149824070', '2026-11-20T04:43:44.409Z', '2026-11-20T04:43:44.409Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-atomic-1795149824709', 'usr_alpha_1795149818510', NULL, NULL, 'BY-HTL-ATOMIC-1795149824709', 'HOTEL', '{}'::jsonb, 2, 21000, 'INR', 'CONFIRMED', 'CANCELLED', 'PAY-bk-atomic-1795149824709', '2026-11-20T04:43:44.909Z', '2026-11-20T04:43:45.020Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795151575617-mpo5e', 'usr_30d_1795151575321', NULL, NULL, 'BY-HTL-2026-22445', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795151575617-mpo5e', '2026-11-20T05:12:55.617Z', '2026-11-20T05:12:55.617Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795151870578-iinfw', 'usr_30d_1795151870320', NULL, NULL, 'BY-HTL-2026-57984', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795151870578-iinfw', '2026-11-20T05:17:50.578Z', '2026-11-20T05:17:50.578Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795151984870-4zezr', 'usr_alice_101', NULL, NULL, 'BY-HTL-2026-98688', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795151984870-4zezr', '2026-11-20T05:19:44.870Z', '2026-11-20T05:19:44.870Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795151988438-xwfar', 'usr_30d_1795151988161', NULL, NULL, 'BY-HTL-2026-10177', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795151988438-xwfar', '2026-11-20T05:19:48.438Z', '2026-11-20T05:19:48.438Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153150662-zr53a', 'usr_prod_14_1795153149063', 'htl-gir-safari-resort', NULL, 'BY-HTL-2026-82502', 'HOTEL', '{}'::jsonb, 3, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153150662-zr53a', '2026-11-20T05:39:10.662Z', '2026-11-20T05:39:10.662Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153323531-udlmr', 'usr_prod_14_1795153321560', 'htl-gir-safari-resort', NULL, 'BY-HTL-2026-28111', 'HOTEL', '{}'::jsonb, 3, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153323531-udlmr', '2026-11-20T05:42:03.531Z', '2026-11-20T05:42:03.531Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153339577-s04ro', 'usr_prod_14_1795153338116', 'htl-gir-safari-resort', NULL, 'BY-HTL-2026-99403', 'HOTEL', '{}'::jsonb, 3, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153339577-s04ro', '2026-11-20T05:42:19.577Z', '2026-11-20T05:42:19.577Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153373807-9ono4', 'usr_alice_101', NULL, NULL, 'BY-HTL-2026-71460', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153373807-9ono4', '2026-11-20T05:42:53.807Z', '2026-11-20T05:42:53.807Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153377119-yve46', 'usr_30d_1795153376838', NULL, NULL, 'BY-HTL-2026-58148', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153377119-yve46', '2026-11-20T05:42:57.119Z', '2026-11-20T05:42:57.119Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153444432-cu3ti', 'usr_30d_1795153444184', NULL, NULL, 'BY-HTL-2026-23713', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153444432-cu3ti', '2026-11-20T05:44:04.432Z', '2026-11-20T05:44:04.432Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153457053-zievo', 'usr_prod_14_1795153455382', 'htl-gir-safari-resort', NULL, 'BY-HTL-2026-16584', 'HOTEL', '{}'::jsonb, 3, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153457053-zievo', '2026-11-20T05:44:17.053Z', '2026-11-20T05:44:17.053Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153966826-uk1pg', 'usr_alice_101', NULL, NULL, 'BY-HTL-2026-16452', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153966826-uk1pg', '2026-11-20T05:52:46.826Z', '2026-11-20T05:52:46.826Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795153971190-vxr2x', 'usr_30d_1795153970869', NULL, NULL, 'BY-HTL-2026-64398', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795153971190-vxr2x', '2026-11-20T05:52:51.190Z', '2026-11-20T05:52:51.190Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795154654221-0xxlr', 'usr_alice_101', NULL, NULL, 'BY-HTL-2026-41191', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795154654221-0xxlr', '2026-11-20T06:04:14.221Z', '2026-11-20T06:04:14.221Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795154657866-ncusw', 'usr_30d_1795154657543', NULL, NULL, 'BY-HTL-2026-97895', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795154657866-ncusw', '2026-11-20T06:04:17.866Z', '2026-11-20T06:04:17.866Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795157287254-i46qt', 'usr_alice_101', NULL, NULL, 'BY-HTL-2026-97681', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795157287254-i46qt', '2026-11-20T06:48:07.254Z', '2026-11-20T06:48:07.254Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795157290333-pi9sf', 'usr_30d_1795157290133', NULL, NULL, 'BY-HTL-2026-97790', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795157290333-pi9sf', '2026-11-20T06:48:10.333Z', '2026-11-20T06:48:10.333Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795159024675-pn45n', 'usr_alice_101', NULL, NULL, 'BY-HTL-2026-75270', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795159024675-pn45n', '2026-11-20T07:17:04.675Z', '2026-11-20T07:17:04.675Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-1795159088489-gsfal', 'usr_30d_1795159088261', NULL, NULL, 'BY-HTL-2026-63337', 'HOTEL', '{}'::jsonb, 2, 14500, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-1795159088489-gsfal', '2026-11-20T07:18:08.489Z', '2026-11-20T07:18:08.489Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-atomic-u-1795159089658', 'usr_test_1795159085115', NULL, NULL, 'BY-ATOMIC-U-1795159089658', 'HOTEL', '{}'::jsonb, 2, 15000, 'INR', 'CONFIRMED', 'CANCELLED', 'PAY-bk-atomic-u-1795159089658', '2026-11-20T07:18:09.794Z', '2026-11-20T07:18:09.874Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.user_bookings (id, user_id, package_id, trip_id, booking_reference, booking_type, booking_details, travelers, total_price, currency, payment_status, booking_status, payment_reference, created_at, updated_at)
VALUES ('bk-dedup-1795159102220', 'usr_alpha_1795159099469', NULL, NULL, 'BY-HTL-DEDUP-1795159102220', 'HOTEL', '{}'::jsonb, 2, 12000, 'INR', 'CONFIRMED', 'CONFIRMED', 'PAY-bk-dedup-1795159102220', '2026-11-20T07:18:22.483Z', '2026-11-20T07:18:22.483Z')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status,
  updated_at = EXCLUDED.updated_at;

-- 6. SEED & RECOVER TRAVEL AGENCIES
INSERT INTO public.travel_agencies (id, name, slug, contact_email, contact_phone, address, license_number, verified, rating, review_count, status, commission_rate, created_at, updated_at)
VALUES ('agency_gujarat_tourism', 'Gujarat Tourism Development Corporation', 'gujarat-tourism', 'info@gujarattourism.com', '+91-79-23977200', 'Udyog Bhavan, Block No. 16/17, 4th Floor, Sector-11, Gandhinagar - 382011', 'GTDC-GOV-001', TRUE, 4.8, 1420, 'ACTIVE', 5.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  rating = EXCLUDED.rating,
  status = EXCLUDED.status,
  updated_at = NOW();
INSERT INTO public.travel_agencies (id, name, slug, contact_email, contact_phone, address, license_number, verified, rating, review_count, status, commission_rate, created_at, updated_at)
VALUES ('agency_chalo_farva', 'BharatYatra Heritage Adventures', 'bharatyatra-heritage', 'partners@bharatyatra.in', '+91-9624282521', 'Ahmedabad, Gujarat, India', 'BY-GJ-2026-042', TRUE, 4.9, 532, 'ACTIVE', 8.0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  rating = EXCLUDED.rating,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 7. SEED & RECOVER CORE DESTINATIONS
INSERT INTO public.destinations (id, name, slug, state, region, description, highlights, best_time_to_visit, climate, ideal_duration_days, images, coordinates, tags, is_featured, status, created_at, updated_at)
VALUES ('dest_somnath', 'Somnath Temple', 'somnath', 'Gujarat', 'Saurashtra', 'First of the twelve holy Jyotirlingas of Lord Shiva standing on the shores of the Arabian Sea.', '["First Jyotirlinga", "Sound & Light Show", "Triveni Sangam"]'::jsonb, 'October to March', 'Coastal Tropical', 2, '["/destinations/somnath.jpg"]'::jsonb, '{"lat": 20.888, "lng": 70.4012}'::jsonb, '["Pilgrimage", "Jyotirlinga", "Heritage"]'::jsonb, TRUE, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  highlights = EXCLUDED.highlights,
  status = EXCLUDED.status,
  updated_at = NOW();
INSERT INTO public.destinations (id, name, slug, state, region, description, highlights, best_time_to_visit, climate, ideal_duration_days, images, coordinates, tags, is_featured, status, created_at, updated_at)
VALUES ('dest_dwarka', 'Dwarkadhish Temple', 'dwarka', 'Gujarat', 'Saurashtra', 'Ancient kingdom of Lord Krishna, one of the four sacred Char Dham pilgrimage sites of India.', '["Jagat Mandir", "Sudarshan Setu", "Bet Dwarka", "Nageshwar Jyotirlinga"]'::jsonb, 'October to March', 'Coastal', 2, '["/destinations/dwarka.jpg"]'::jsonb, '{"lat": 22.2442, "lng": 68.9685}'::jsonb, '["Char Dham", "Pilgrimage", "Krishna"]'::jsonb, TRUE, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  highlights = EXCLUDED.highlights,
  status = EXCLUDED.status,
  updated_at = NOW();
INSERT INTO public.destinations (id, name, slug, state, region, description, highlights, best_time_to_visit, climate, ideal_duration_days, images, coordinates, tags, is_featured, status, created_at, updated_at)
VALUES ('dest_gir', 'Gir National Park', 'gir-national-park', 'Gujarat', 'Saurashtra', 'The sole surviving natural habitat of the Asiatic Lion (Panthera leo persica) in the world.', '["Asiatic Lions", "Devalia Safari Park", "Kamleshwar Dam"]'::jsonb, 'December to March', 'Dry Deciduous', 3, '["/destinations/gir.jpg"]'::jsonb, '{"lat": 21.1243, "lng": 70.8242}'::jsonb, '["Wildlife", "National Park", "Safari"]'::jsonb, TRUE, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  highlights = EXCLUDED.highlights,
  status = EXCLUDED.status,
  updated_at = NOW();
INSERT INTO public.destinations (id, name, slug, state, region, description, highlights, best_time_to_visit, climate, ideal_duration_days, images, coordinates, tags, is_featured, status, created_at, updated_at)
VALUES ('dest_rann', 'White Rann of Kutch', 'rann-of-kutch', 'Gujarat', 'Kutch', 'Vast salt marsh in the Thar Desert hosting the world-famous Rann Utsav full moon festival.', '["White Salt Desert", "Full Moon Night", "Dhordo Tent City", "Kalo Dungar"]'::jsonb, 'November to February', 'Arid Desert', 3, '["/destinations/rann.jpg"]'::jsonb, '{"lat": 23.7844, "lng": 69.8475}'::jsonb, '["Desert", "Culture", "Festival"]'::jsonb, TRUE, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  highlights = EXCLUDED.highlights,
  status = EXCLUDED.status,
  updated_at = NOW();
INSERT INTO public.destinations (id, name, slug, state, region, description, highlights, best_time_to_visit, climate, ideal_duration_days, images, coordinates, tags, is_featured, status, created_at, updated_at)
VALUES ('dest_sou', 'Statue of Unity', 'statue-of-unity', 'Gujarat', 'Central Gujarat', 'The world tallest statue (182m) honoring Sardar Vallabhbhai Patel on the Narmada River.', '["182m Viewing Gallery", "Valley of Flowers", "Sardar Sarovar Dam", "Glow Garden"]'::jsonb, 'October to March', 'River Valley', 2, '["/destinations/sou.jpg"]'::jsonb, '{"lat": 21.838, "lng": 73.7191}'::jsonb, '["Monument", "Modern", "Sardar Patel"]'::jsonb, TRUE, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  highlights = EXCLUDED.highlights,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 8. SEED & RECOVER TRAVEL PACKAGES
INSERT INTO public.travel_packages (id, title, slug, agency_id, description, duration_days, duration_nights, price, original_price, inclusions, exclusions, itinerary, destinations, images, tags, is_featured, is_published, created_at, updated_at)
VALUES ('pkg_gujarat_heritage', 'Grand Gujarat Heritage & Temple Trail', 'gujarat-heritage-tour', 'agency_gujarat_tourism', 'Complete 7-day circuit covering Somnath, Dwarka, Gir Forest and Ahmedabad.', 7, 6, 24999, 29999, '["Hotel Stay", "AC Gypsy Safari", "Temple VIP Darshan Passes", "Daily Breakfast"]'::jsonb, '["Flight/Train Tickets", "Personal Expenses"]'::jsonb, '[{"day": 1, "title": "Arrival Ahmedabad"}, {"day": 2, "title": "Somnath Darshan"}]'::jsonb, '["Ahmedabad", "Somnath", "Dwarka", "Gir"]'::jsonb, '["/packages/gujarat-heritage.jpg"]'::jsonb, '["Heritage", "Pilgrimage"]'::jsonb, TRUE, TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
INSERT INTO public.travel_packages (id, title, slug, agency_id, description, duration_days, duration_nights, price, original_price, inclusions, exclusions, itinerary, destinations, images, tags, is_featured, is_published, created_at, updated_at)
VALUES ('pkg_somnath_dwarka', 'Somnath & Dwarka Spiritual Pilgrimage', 'somnath-dwarka-spiritual', 'agency_chalo_farva', 'Sacred 4-day pilgrimage to Somnath Jyotirlinga and Dwarkadhish Jagat Mandir.', 4, 3, 14999, 18999, '["Deluxe AC Stay", "Private AC Sedan", "Special Aarti Pass", "All Meals"]'::jsonb, '["Camera Tickets"]'::jsonb, '[{"day": 1, "title": "Dwarka Darshan"}, {"day": 2, "title": "Bet Dwarka via Sudarshan Setu"}]'::jsonb, '["Dwarka", "Somnath", "Porbandar"]'::jsonb, '["/packages/somnath-dwarka.jpg"]'::jsonb, '["Spiritual", "Jyotirlinga"]'::jsonb, TRUE, TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
INSERT INTO public.travel_packages (id, title, slug, agency_id, description, duration_days, duration_nights, price, original_price, inclusions, exclusions, itinerary, destinations, images, tags, is_featured, is_published, created_at, updated_at)
VALUES ('pkg_gir_wildlife', 'Gir Asiatic Lion Wildlife Safari Expedition', 'gir-wildlife-safari', 'agency_gujarat_tourism', 'Exclusive 3-day wildlife photography tour inside Gir National Park with registered naturalists.', 3, 2, 18499, 22499, '["Forest Lodge Stay", "3 Jungle Gypsies", "Certified Naturalist Guide", "All Forest Permits"]'::jsonb, '["Personal Tips"]'::jsonb, '[{"day": 1, "title": "Check-in Sasan Gir"}, {"day": 2, "title": "Morning & Evening Lion Safaris"}]'::jsonb, '["Gir National Park", "Devalia"]'::jsonb, '["/packages/gir-safari.jpg"]'::jsonb, '["Wildlife", "Safari"]'::jsonb, TRUE, TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
INSERT INTO public.travel_packages (id, title, slug, agency_id, description, duration_days, duration_nights, price, original_price, inclusions, exclusions, itinerary, destinations, images, tags, is_featured, is_published, created_at, updated_at)
VALUES ('pkg_rann_utsav', 'Rann of Kutch Full Moon Experience', 'rann-of-kutch-experience', 'agency_chalo_farva', 'Magical 4-day full moon tour staying in Dhordo Tent City with Bhirandiyara permit clearances.', 4, 3, 21999, 26999, '["AC Swiss Tent Stay", "Bhirandiyara Police Permit", "Cultural Performances", "Kutch Sightseeing"]'::jsonb, '["Airfare"]'::jsonb, '[{"day": 1, "title": "Bhuj to Dhordo"}, {"day": 2, "title": "White Desert Full Moon Night"}]'::jsonb, '["Bhuj", "Dhordo", "White Rann"]'::jsonb, '["/packages/rann-utsav.jpg"]'::jsonb, '["Culture", "Desert"]'::jsonb, TRUE, TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- 9. RECOVER COMMUNITY PUBLISHED DESTINATIONS
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('ce1901f5-c297-44a3-af75-cd14fc35ca77', 'test-sub-101', 'Gadhvi Hidden Falls', 'Gujarat', 'Ahwa', 'Waterfalls', 'Gadhvi Hidden Falls is a scenic natural cascade nestled inside the dense teak forests of Dang. Accessible via a 2km trek through tribal hamlets, it features crystal clear pools and lush monsoon flora.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('dfbd7083-6b71-4af5-8410-d5a4db4ad72e', 'aa0aaaaa-c95a-45f4-b01b-5757c1b9b72b', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('e750fccc-c88e-490c-9917-7105288dac66', 'aaefec39-a3d9-4714-aad5-d34143e95297', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('0cad1c8c-e1e5-4f9c-b139-dc4c56f0c19b', '3a0a0d73-a0f4-4e97-9db7-9c2e2f789785', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('df80ea8f-a280-445e-a93c-3eb48fabebba', '4b17fdbc-5704-456e-88f3-103780ef1604', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('23a83631-6c37-4c1d-bd93-c5e8ac1c2151', 'eba64522-7883-4890-9fc5-585d9b081ce7', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('1cef5d90-efbd-4fbd-a7cf-8009138a0884', 'a1185f7f-c86e-40c6-80dd-37993897bc85', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('f0c82022-b9ac-409b-a914-c37539f1b415', 'fdf0929d-b09a-4d54-ac54-9c6ff8f527d0', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('4add36f8-eab0-4782-9ec6-0fac60e2e8ba', '74933568-6023-48d7-ae11-4e7c719e4ca1', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('c7d257a9-d103-4dfd-855f-b6f4ba7a412a', 'b70194b1-99cc-4cf5-86cc-1ac69bb8abab', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('78110b34-4c39-4f35-9861-a3855369dcec', '659f61ba-e328-409b-a187-4e4b8c234686', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('e7890910-b0fd-4800-8d8a-a107021c0511', '5cc1644f-8e1a-4f2c-967e-dff4f512ec73', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('ecbc22d3-e2c8-4389-a23f-01b5c3933aab', 'b0e5545d-432e-4bd9-abd2-0c97230136e0', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('3e88bb47-c8fc-4ccb-8c98-dbd65b93ea1e', '2c291ec4-db6c-4f3b-9136-0f04b7daae8b', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('c9164eaa-9ac3-4583-84ce-5f8cc9c588d8', '25d4fa6e-0024-445c-9e99-a7149a4d4375', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('e7eb89f0-934a-464d-bf81-3f188fec4410', 'e4bfb231-daae-41cd-9f91-88e687d91686', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('75223c68-f286-4af7-98c0-3c5b5bcbb8d3', 'a6e2feb0-b056-4f54-bc04-37dc99aa00d4', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('fd7523b3-52aa-4ed1-a4de-400fcc225197', '9e96ed4c-541a-4daf-9509-91eca7428b7d', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('5cf6c453-eba5-458e-9f64-f59988836fb4', '816d700e-9d07-4a02-9b1a-b8a0d7a6f5f7', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('8912fc0c-96a9-40b4-b6f7-00c1e5a6517c', '8e55918b-ad80-48db-a4c2-ca31564aa977', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('39065df0-2cf7-4eb8-a8ac-8b125d2a571d', 'd2f488d6-af9b-4ffc-9948-9a602bc2fc39', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('09398204-d384-4d0e-a28b-0ff7845c01fc', '759a69aa-4d9f-4e5f-8016-c2e330d41805', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('fd4a988a-a418-4e6c-9f94-1973d03751c3', 'b198a9c8-45c1-48bd-a30d-56d19d94c0b1', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('7782af6a-dd2b-4771-af93-3409ed0782d4', '6844025e-a691-4420-afaa-27e857fe9b1d', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('ea600fcd-9e1f-4f36-ae04-3c3a88295ce9', '4f4d6c9b-0992-4c28-be8f-295121c7061c', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('c422063d-f30b-4232-84cd-714e1c0e8418', '9ad4f633-1eb1-4f9a-bb82-25eb02c959cb', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('756aad80-7e24-478f-9726-79d548c193df', 'ddf2863a-9189-40c5-be38-24fb6bd92e6c', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('5d9b39aa-2810-450e-97c1-71b170d0e7c3', 'bdb6f38e-0028-4270-981c-08662d8cd526', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('e4e9a1c3-4428-46fe-9636-2d9467fa9632', '12b4f952-e50b-4ade-90a8-93ecf1a82a3c', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('312c73f9-3e59-44d9-bfb4-653ef6f543f8', '9aae31b1-0f52-4c6f-9caa-2c0d68fa8999', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('21e87ec9-d916-4671-b316-0ff973ecc4f0', 'f6a0419e-32f1-4073-8f6a-1fd652875043', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('f1c0caf4-1243-49a9-9e44-de78e19c9b17', '9d918bd6-ab51-4393-8613-0f0245caabbb', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('d208e19f-0534-4f95-8cfc-671051eca8da', '9275ee62-caf5-49bd-aeef-4308c9b457d3', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('6b7616a2-f93d-4d0f-9118-51de040830a8', 'f61b4b05-e7a9-44b4-a6c4-2edb62731460', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Saragwala', 'Historical Places', 'Discovered in 1954, Lothal holds the world oldest known port basin connecting the city to an ancient course of the Sabarmati river. Features bead-making factory and drainage system.', '[]'::jsonb, 'Anytime', '₹25 for Indian Citizens, ₹300 for Foreigners', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('8f3e29c1-65e5-4604-bb6f-56330fd0a907', 'f19a8e47-b16b-42e1-906a-21db2938478b', 'Polo Forest Ancient Ruins', 'Gujarat', 'Idar', 'Historical Places', 'The ancient Polo forest is spread over 400 square kilometers near Vijayanagar. It was established around the 10th century by the Parihar kings of Idar and subsequently conquered by the Rathod Rajputs. The site features ruins of intricately carved 15th century Jain and Shiva shrines along the Harnav River.', '[]'::jsonb, 'Anytime', 'Free', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
INSERT INTO public.published_destinations (id, submission_id, name, state, city, category, description, highlights, best_time, entry_fee, timings, photos, contributor_id, published_at, view_count)
VALUES ('034f407d-2851-4469-b201-080203d9efe4', '65109c00-0538-4fa0-aa41-b30bd0d0a9c5', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Saputara', 'Mountains', 'Perched on the highest plateau of Saputara hill station in the Western Ghats Sahyadri range. Popular for panoramic twilight views, pleasant monsoon clouds, and camel rides.', '[]'::jsonb, 'Anytime', 'Free entry', 'Sunrise to Sunset', '[]'::jsonb, 'explorer', '2026-11-19T00:00:00Z', 100)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 10. RECOVER COMMUNITY PLACE SUBMISSIONS
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('0eb68004-d36a-4005-88ee-8ff5ad35a344', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-13T14:30:46.187Z', '2026-11-13T14:30:46.187Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('6a7b50c8-6ae2-478c-8de4-8976a41c6ee5', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-13T14:31:55.023Z', '2026-11-13T14:31:55.023Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('0619f412-8a20-481e-a6d0-bc17edef3b8d', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'CHANGES_REQUESTED', 50, '2026-11-13T14:32:51.497Z', '2026-11-13T14:32:51.602Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('aa0aaaaa-c95a-45f4-b01b-5757c1b9b72b', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-13T14:33:08.924Z', '2026-11-13T14:33:09.177Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('aaefec39-a3d9-4714-aad5-d34143e95297', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-13T14:35:22.979Z', '2026-11-13T14:35:23.185Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('3a0a0d73-a0f4-4e97-9db7-9c2e2f789785', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-16T05:59:13.821Z', '2026-11-16T05:59:13.979Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('4b17fdbc-5704-456e-88f3-103780ef1604', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-17T06:23:04.043Z', '2026-11-17T06:23:04.324Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('eba64522-7883-4890-9fc5-585d9b081ce7', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-17T06:49:33.793Z', '2026-11-17T06:49:33.970Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('a1185f7f-c86e-40c6-80dd-37993897bc85', 'qa_user_1794898413933', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-17T06:53:33.954Z', '2026-11-17T06:53:34.368Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('fdf0929d-b09a-4d54-ac54-9c6ff8f527d0', 'qa_user_1794898458712', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-17T06:54:18.720Z', '2026-11-17T06:54:19.120Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('74933568-6023-48d7-ae11-4e7c719e4ca1', 'qa_user_1794898473513', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-17T06:54:33.517Z', '2026-11-17T06:54:34.048Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b70194b1-99cc-4cf5-86cc-1ac69bb8abab', 'qa_user_1794898480300', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-17T06:54:40.305Z', '2026-11-17T06:54:40.665Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('659f61ba-e328-409b-a187-4e4b8c234686', 'qa_user_1794899813486', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-17T07:16:53.493Z', '2026-11-17T07:16:53.682Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('5cc1644f-8e1a-4f2c-967e-dff4f512ec73', 'usr_contributor_a_1795095218457', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-19T13:33:38.464Z', '2026-11-19T13:33:39.781Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('329acd84-b8af-4951-aab7-fa209e491d3d', 'usr_contributor_a_1795095218457', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-19T13:33:40.330Z', '2026-11-19T13:33:40.445Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('5ede68ec-affe-47cf-84b8-786539b489fc', 'usr_contributor_a_1795095218457', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:33:40.810Z', '2026-11-19T13:33:41.112Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('f3142e9c-7479-46be-a74c-b7a5e4dbabdb', 'usr_contributor_a_1795095218457', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:33:41.184Z', '2026-11-19T13:33:41.184Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('1a782344-a202-48a2-b951-d072b5d304a8', 'usr_contributor_a_1795095218457', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:33:41.309Z', '2026-11-19T13:33:41.309Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b0bf492c-08fc-4d22-8181-71ef74f70c3b', 'usr_contributor_b_1795095218457', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:33:41.529Z', '2026-11-19T13:33:41.529Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('4610abb3-46e3-4680-a065-e1a9993ba3eb', 'qa_user_1795095230101', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:33:50.109Z', '2026-11-19T13:33:50.109Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b0e5545d-432e-4bd9-abd2-0c97230136e0', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-19T13:33:50.886Z', '2026-11-19T13:33:51.738Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('2c291ec4-db6c-4f3b-9136-0f04b7daae8b', 'usr_contributor_a_1795095380241', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-19T13:36:20.251Z', '2026-11-19T13:36:21.125Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('c96e7b51-9793-4d19-8b8e-3c5a4a0ff0aa', 'usr_contributor_a_1795095380241', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-19T13:36:21.818Z', '2026-11-19T13:36:22.099Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('ee60061c-18c4-4b80-b0c8-4d2049545e1e', 'usr_contributor_a_1795095380241', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:36:22.819Z', '2026-11-19T13:36:23.445Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b858f363-e530-4add-b04b-5a228657750c', 'usr_contributor_a_1795095380241', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:36:23.491Z', '2026-11-19T13:36:23.491Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('f15e26e7-150e-40f2-b042-dd476843d299', 'usr_contributor_a_1795095380241', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:36:23.837Z', '2026-11-19T13:36:23.837Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('4b678f37-1f77-4c0d-a9a1-19e759e96b1c', 'usr_contributor_b_1795095380241', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-19T13:36:24.039Z', '2026-11-19T13:36:24.039Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('25d4fa6e-0024-445c-9e99-a7149a4d4375', 'usr_contributor_a_1795151572291', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:12:52.321Z', '2026-11-20T05:12:53.694Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b5229739-3fe5-4d74-96df-816ed2ecaa1e', 'usr_contributor_a_1795151572291', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T05:12:54.235Z', '2026-11-20T05:12:54.385Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('9a92d5a3-7e8e-416b-b957-b10463b8f9a0', 'usr_contributor_a_1795151572291', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:12:54.798Z', '2026-11-20T05:12:55.292Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('2ff1266b-05b0-40dc-81e1-0b746f5fa4a6', 'usr_contributor_a_1795151572291', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:12:55.378Z', '2026-11-20T05:12:55.378Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('3cc8fc97-039d-4d9c-b632-6af4c1537e37', 'usr_contributor_a_1795151572291', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:12:55.577Z', '2026-11-20T05:12:55.577Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('1cf1f38c-d9da-46d7-907c-13e1f2b4fe6f', 'usr_contributor_b_1795151572291', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:12:55.912Z', '2026-11-20T05:12:55.912Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('57695dc8-5af2-4ca2-b383-da1709b646da', 'qa_user_1795151649380', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:14:09.417Z', '2026-11-20T05:14:09.417Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('e4bfb231-daae-41cd-9f91-88e687d91686', 'usr_contributor_a_1795151649551', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:14:09.577Z', '2026-11-20T05:14:10.353Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('0d082dd7-0ed3-4c3a-9569-1ba5dd12dfc4', 'usr_contributor_a_1795151649551', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T05:14:11.005Z', '2026-11-20T05:14:11.196Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('795f0d7f-a234-42eb-b408-99dc619a42d1', 'usr_contributor_a_1795151649551', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:14:11.641Z', '2026-11-20T05:14:12.201Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('bffdd25c-d349-4e70-a299-61d666fecf70', 'usr_contributor_a_1795151649551', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:14:12.283Z', '2026-11-20T05:14:12.283Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('be1666ad-e967-428f-bc12-7ab61b8c3dac', 'usr_contributor_a_1795151649551', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:14:12.449Z', '2026-11-20T05:14:12.449Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('f12f354f-12a9-448e-b750-d4f8df2ab16e', 'usr_contributor_b_1795151649551', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:14:12.830Z', '2026-11-20T05:14:12.830Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('c4547f10-2e3e-4d99-b50f-c64e38ce5c4c', 'qa_user_1795151867270', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:17:47.291Z', '2026-11-20T05:17:47.291Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('a6e2feb0-b056-4f54-bc04-37dc99aa00d4', 'usr_contributor_a_1795151867284', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:17:47.325Z', '2026-11-20T05:17:48.224Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('144a889a-7f5a-4eb2-a018-2fcdf96d93d1', 'usr_contributor_a_1795151867284', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T05:17:48.811Z', '2026-11-20T05:17:48.985Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('7d82cf21-94ea-49d4-8a63-7fe86448e69d', 'usr_contributor_a_1795151867284', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:17:49.482Z', '2026-11-20T05:17:50.400Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('df61ef06-cafd-4075-87e9-e4f2fd06245a', 'usr_contributor_a_1795151867284', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:17:50.486Z', '2026-11-20T05:17:50.486Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('df73e66a-ec83-44a4-8636-9f6855e4b073', 'usr_contributor_a_1795151867284', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:17:50.654Z', '2026-11-20T05:17:50.654Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('433b30d5-43cc-4127-bf4f-8c6028ff9f84', 'usr_contributor_b_1795151867284', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:17:51.108Z', '2026-11-20T05:17:51.108Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('9e96ed4c-541a-4daf-9509-91eca7428b7d', 'usr_contributor_a_1795151919388', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:18:39.438Z', '2026-11-20T05:18:40.254Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('6438b8de-ca37-4d2b-8620-8443dcd9f977', 'usr_contributor_a_1795151919388', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T05:18:40.847Z', '2026-11-20T05:18:41.036Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('c32ef567-5817-4f99-9612-7af18453196d', 'usr_contributor_a_1795151919388', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:18:41.411Z', '2026-11-20T05:18:41.902Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('5cbdfcb4-cd30-4575-a946-34b46afe0f51', 'usr_contributor_a_1795151919388', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:18:42.003Z', '2026-11-20T05:18:42.003Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('0f807637-2918-46cd-a9f0-552af833a9d1', 'usr_contributor_a_1795151919388', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:18:42.182Z', '2026-11-20T05:18:42.182Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('79687951-ec95-4f99-82e0-2dfe4f685aff', 'usr_contributor_b_1795151919388', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:18:42.521Z', '2026-11-20T05:18:42.521Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('816d700e-9d07-4a02-9b1a-b8a0d7a6f5f7', 'qa_user_1795151964381', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:19:24.388Z', '2026-11-20T05:19:24.774Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('8e55918b-ad80-48db-a4c2-ca31564aa977', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:19:26.269Z', '2026-11-20T05:19:27.343Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('d2f488d6-af9b-4ffc-9948-9a602bc2fc39', 'usr_contributor_a_1795151969154', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:19:29.163Z', '2026-11-20T05:19:30.100Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('6bbdec90-5817-476d-b5c3-5b9d0325d694', 'usr_contributor_a_1795151969154', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T05:19:30.738Z', '2026-11-20T05:19:30.923Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('44a463db-8118-464e-a23a-89b0f76d4ac3', 'usr_contributor_a_1795151969154', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:19:31.465Z', '2026-11-20T05:19:32.086Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('4f089629-f89e-45d2-8f15-7127942a638b', 'usr_contributor_a_1795151969154', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:19:32.198Z', '2026-11-20T05:19:32.198Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b13d8665-41a7-4516-b17a-a3acb90d78d8', 'usr_contributor_a_1795151969154', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:19:32.406Z', '2026-11-20T05:19:32.406Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('611ac52c-f2cf-4d74-ad85-c1f2595860be', 'usr_contributor_b_1795151969154', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:19:32.872Z', '2026-11-20T05:19:32.872Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('759a69aa-4d9f-4e5f-8016-c2e330d41805', 'qa_user_1795153353260', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:42:33.268Z', '2026-11-20T05:42:34.001Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b198a9c8-45c1-48bd-a30d-56d19d94c0b1', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:42:35.591Z', '2026-11-20T05:42:36.779Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('6844025e-a691-4420-afaa-27e857fe9b1d', 'usr_contributor_a_1795153358607', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:42:38.616Z', '2026-11-20T05:42:39.718Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('1f506d11-0149-4387-aafe-e5fa74b4537f', 'usr_contributor_a_1795153358607', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T05:42:40.344Z', '2026-11-20T05:42:40.510Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('84b6ab93-8989-4164-972f-28e4fadbeb64', 'usr_contributor_a_1795153358607', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:42:40.991Z', '2026-11-20T05:42:41.572Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('30a02fb3-04cc-4ec0-b6e9-dc544735a622', 'usr_contributor_a_1795153358607', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:42:41.665Z', '2026-11-20T05:42:41.665Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b5a6a7ce-0cce-482b-9051-85056d447805', 'usr_contributor_a_1795153358607', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:42:41.848Z', '2026-11-20T05:42:41.848Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('990133f1-003f-4b9e-85a7-d8ee8ea9a1f1', 'usr_contributor_b_1795153358607', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:42:42.187Z', '2026-11-20T05:42:42.187Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('4f4d6c9b-0992-4c28-be8f-295121c7061c', 'qa_user_1795153941873', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:52:21.883Z', '2026-11-20T05:52:22.903Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('9ad4f633-1eb1-4f9a-bb82-25eb02c959cb', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:52:25.173Z', '2026-11-20T05:52:26.347Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('ddf2863a-9189-40c5-be38-24fb6bd92e6c', 'usr_contributor_a_1795153948644', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T05:52:28.655Z', '2026-11-20T05:52:29.569Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('c0a9bce9-e234-4f45-bb6c-0f942b824d5a', 'usr_contributor_a_1795153948644', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T05:52:30.258Z', '2026-11-20T05:52:30.461Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('258cf05f-dd5d-4fa9-a253-8bb366517030', 'usr_contributor_a_1795153948644', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:52:30.990Z', '2026-11-20T05:52:31.702Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('8239265f-dea4-49bc-84c7-2f5c5ff21113', 'usr_contributor_a_1795153948644', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:52:31.838Z', '2026-11-20T05:52:31.838Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('bdb1dd6b-cf7c-4587-88dd-c30d280aaf6b', 'usr_contributor_a_1795153948644', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:52:32.058Z', '2026-11-20T05:52:32.058Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('5e9af96d-b893-4327-8897-8e891ee6e673', 'usr_contributor_b_1795153948644', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T05:52:32.601Z', '2026-11-20T05:52:32.601Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('bdb6f38e-0028-4270-981c-08662d8cd526', 'qa_user_1795154627942', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T06:03:47.951Z', '2026-11-20T06:03:48.940Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('12b4f952-e50b-4ade-90a8-93ecf1a82a3c', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T06:03:51.060Z', '2026-11-20T06:03:52.468Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('9aae31b1-0f52-4c6f-9caa-2c0d68fa8999', 'usr_contributor_a_1795154635213', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T06:03:55.227Z', '2026-11-20T06:03:57.027Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('6eb9f5ff-e3e0-4f37-ba23-88d6c19fb90c', 'usr_contributor_a_1795154635213', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T06:03:57.785Z', '2026-11-20T06:03:58.007Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('d3c4c68e-d36d-4310-8112-42a7de1ae78a', 'usr_contributor_a_1795154635213', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T06:03:58.750Z', '2026-11-20T06:03:59.428Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('761029ca-a402-43a4-b068-d955b6cd27ca', 'usr_contributor_a_1795154635213', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T06:03:59.539Z', '2026-11-20T06:03:59.539Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('e440ed4a-3443-4c88-9aa8-9c2313cb7816', 'usr_contributor_a_1795154635213', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T06:03:59.759Z', '2026-11-20T06:03:59.759Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('4c912a84-8081-4211-84c2-de93d8137c6e', 'usr_contributor_b_1795154635213', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T06:04:00.248Z', '2026-11-20T06:04:00.248Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('f6a0419e-32f1-4073-8f6a-1fd652875043', 'qa_user_1795157264633', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T06:47:44.640Z', '2026-11-20T06:47:45.382Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('9d918bd6-ab51-4393-8613-0f0245caabbb', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T06:47:46.984Z', '2026-11-20T06:47:47.971Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('9275ee62-caf5-49bd-aeef-4308c9b457d3', 'usr_contributor_a_1795157270811', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T06:47:50.821Z', '2026-11-20T06:47:51.386Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('b2f7cbc8-3d25-44bf-9197-fec4c27f7885', 'usr_contributor_a_1795157270811', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T06:47:51.788Z', '2026-11-20T06:47:51.946Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('e8193875-d225-4f6c-b665-0e84a32e839c', 'usr_contributor_a_1795157270811', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T06:47:52.230Z', '2026-11-20T06:47:52.623Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('c54adea0-a8dc-4b75-a320-d380fc8d371f', 'usr_contributor_a_1795157270811', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T06:47:52.700Z', '2026-11-20T06:47:52.700Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('ed3202fa-8526-4528-98c7-16f0181fb77c', 'usr_contributor_a_1795157270811', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T06:47:52.814Z', '2026-11-20T06:47:52.814Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('e2021cbd-ef72-437f-8509-8d5d8b6e1a8b', 'usr_contributor_b_1795157270811', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T06:47:53.026Z', '2026-11-20T06:47:53.026Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('f61b4b05-e7a9-44b4-a6c4-2edb62731460', 'qa_user_1795159004043', '[QA TEST] Lothal Ancient Dockyard Heritage', 'Gujarat', 'Ahmedabad', 'Historical Places', NULL, NULL, 'October to March', NULL, '₹25 for Indian Citizens, ₹300 for Foreigners', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T07:16:44.052Z', '2026-11-20T07:16:44.962Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('f19a8e47-b16b-42e1-906a-21db2938478b', 'user-test-777', 'Polo Forest Ancient Ruins', 'Gujarat', 'Sabarkantha', 'Historical Places', NULL, NULL, 'September to February', NULL, 'Free', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T07:16:46.555Z', '2026-11-20T07:16:47.578Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('65109c00-0538-4fa0-aa41-b30bd0d0a9c5', 'usr_contributor_a_1795159010467', 'Saputara Sunset Point and Valley Vista', 'Gujarat', 'Dang', 'Mountains', NULL, NULL, 'October to February and Monsoon (July to September)', NULL, 'Free entry', '09:00 - 18:00', NULL, 'APPROVED', 50, '2026-11-20T07:16:50.478Z', '2026-11-20T07:16:51.297Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('14a6e0bb-6886-46cd-bd8f-1d0fab2a3386', 'usr_contributor_a_1795159010467', 'Unverifiable Private Backyard Lawn', 'Rajasthan', NULL, 'Other Attractions', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'REJECTED', 50, '2026-11-20T07:16:51.812Z', '2026-11-20T07:16:51.990Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('0d9fcee5-cebc-4b1c-8183-64467bacd406', 'usr_contributor_a_1795159010467', 'Munser Lake (Mansar Talav Heritage Solanki Era)', 'Gujarat', NULL, 'Lakes', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T07:16:52.349Z', '2026-11-20T07:16:52.836Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('9c90cd9d-52b5-4d7d-aeef-c9e07254bf09', 'usr_contributor_a_1795159010467', 'Dholavira Ancient Harappan Citadel', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T07:16:52.903Z', '2026-11-20T07:16:52.903Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('a36ab9fb-6abc-4172-99eb-e9667ab9f426', 'usr_contributor_a_1795159010467', 'Kodaikanal Pillar Rocks Scenic Viewpoint', 'Tamil Nadu', NULL, 'Mountains', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T07:16:53.509Z', '2026-11-20T07:16:53.509Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.place_submissions (id, contributor_id, place_name, state, city, category, description, historical_significance, best_time_to_visit, local_tips, entry_fee, timings, coordinates, status, points_awarded, created_at, updated_at)
VALUES ('855cf9cb-78fe-4f39-ac8c-332b94d618a0', 'usr_contributor_b_1795159010467', 'Patan Rani Ki Vav Stepwell', 'Gujarat', NULL, 'Historical Places', NULL, NULL, 'October to March', NULL, 'Free', '09:00 - 18:00', NULL, 'PENDING', 50, '2026-11-20T07:16:53.831Z', '2026-11-20T07:16:53.831Z')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;
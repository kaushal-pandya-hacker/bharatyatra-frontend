-- ============================================================================
-- BHARATYATRA TRAVEL PARTNER & PACKAGE MANAGEMENT ECOSYSTEM
-- PostgreSQL Schema, Supabase RLS Policies & Atomic Stored Procedures
-- Migration: 20261012_travel_partner_ecosystem.sql
-- ============================================================================

-- 1. ENUM TYPES & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE travel_agency_type AS ENUM (
        'PROPRIETORSHIP', 'PARTNERSHIP', 'PVT_LTD', 'PUBLIC_LTD', 'LLP', 'REGISTERED_OPERATOR'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE agency_verification_status AS ENUM (
        'SUBMITTED', 'PENDING_VERIFICATION', 'NEEDS_INFORMATION', 'APPROVED', 'REJECTED', 'SUSPENDED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE package_publication_status AS ENUM (
        'DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'PAUSED', 'REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE commission_basis_type AS ENUM (
        'GROSS_BOOKING', 'NET_SUBTOTAL', 'FIXED_PER_PAX'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ledger_event_type AS ENUM (
        'BOOKING_ACCRUAL', 'CANCELLATION_REVERSAL', 'ADJUSTMENT', 'PAYOUT_SETTLED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TRAVEL AGENCIES
-- Primary key supports both prefixed string identifiers ('agy-...') and standard UUIDs
CREATE TABLE IF NOT EXISTS travel_agencies (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID, -- Links to auth.users / app user
    reference_number VARCHAR(32) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_slug VARCHAR(255) UNIQUE NOT NULL,
    business_type travel_agency_type NOT NULL DEFAULT 'REGISTERED_OPERATOR',
    representative_name VARCHAR(150) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(32) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_code VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    website_url VARCHAR(255),
    years_in_operation INTEGER DEFAULT 0,
    registration_identifiers JSONB DEFAULT '{}'::jsonb, -- {"gstin": "...", "pan": "...", "tourism_reg": "..."}
    business_description TEXT NOT NULL,
    service_coverage JSONB DEFAULT '{}'::jsonb, -- {"states": ["Gujarat"], "categories": ["Heritage"], "languages": ["Hindi"]}
    commercial_preferences JSONB DEFAULT '{}'::jsonb, -- {"tour_types": ["Group", "Private"], "capacity_per_month": 50}
    verification_status agency_verification_status NOT NULL DEFAULT 'SUBMITTED',
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(64),
    rejection_reason TEXT,
    information_request_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_travel_agencies_status ON travel_agencies(verification_status);
CREATE INDEX IF NOT EXISTS idx_travel_agencies_user_id ON travel_agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_agencies_ref ON travel_agencies(reference_number);
CREATE INDEX IF NOT EXISTS idx_travel_agencies_email ON travel_agencies(business_email);

-- 3. AGENCY VERIFICATION DOCUMENTS
CREATE TABLE IF NOT EXISTS agency_verification_documents (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agency_id VARCHAR(64) NOT NULL REFERENCES travel_agencies(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- 'GST_CERTIFICATE', 'INCORPORATION_PROOF', 'REP_ID_PROOF', 'TOURISM_LICENSE'
    private_storage_key VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reviewed_by VARCHAR(64),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_docs_agency ON agency_verification_documents(agency_id);

-- 4. TRAVEL PARTNER AGREEMENTS
CREATE TABLE IF NOT EXISTS travel_partner_agreements (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agency_id VARCHAR(64) NOT NULL REFERENCES travel_agencies(id) ON DELETE CASCADE,
    agreement_version VARCHAR(50) NOT NULL DEFAULT '2026-STANDARD-V1',
    commission_type VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE', -- 'PERCENTAGE', 'FIXED'
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00, -- e.g. 10.00%
    commission_basis commission_basis_type NOT NULL DEFAULT 'GROSS_BOOKING',
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,
    agreement_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_by VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_agreements_agency ON travel_partner_agreements(agency_id);

-- 5. TRAVEL PACKAGES
CREATE TABLE IF NOT EXISTS travel_packages (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agency_id VARCHAR(64) NOT NULL REFERENCES travel_agencies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Heritage & Pilgrimage', 'Wildlife Safari', etc.
    tour_type VARCHAR(50) NOT NULL DEFAULT 'BOTH', -- 'GROUP', 'PRIVATE', 'BOTH'
    origin VARCHAR(100) NOT NULL,
    destination_summary VARCHAR(255) NOT NULL,
    destinations JSONB NOT NULL DEFAULT '[]'::jsonb,
    state_or_region VARCHAR(100) NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days >= 1),
    duration_nights INTEGER NOT NULL CHECK (duration_nights >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    discounted_price NUMERIC(12, 2) CHECK (discounted_price >= 0),
    min_travellers INTEGER NOT NULL DEFAULT 1,
    max_travellers INTEGER NOT NULL DEFAULT 30,
    cover_image_url TEXT,
    gallery_image_urls JSONB DEFAULT '[]'::jsonb,
    inclusions JSONB DEFAULT '[]'::jsonb,
    exclusions JSONB DEFAULT '[]'::jsonb,
    cancellation_policy TEXT,
    booking_notice_days INTEGER DEFAULT 2,
    itinerary JSONB NOT NULL DEFAULT '[]'::jsonb, -- Multi-day itinerary details directly structured
    publication_status package_publication_status NOT NULL DEFAULT 'DRAFT',
    availability_status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(64),
    published_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    admin_review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_travel_packages_agency ON travel_packages(agency_id);
CREATE INDEX IF NOT EXISTS idx_travel_packages_status ON travel_packages(publication_status);
CREATE INDEX IF NOT EXISTS idx_travel_packages_state ON travel_packages(state_or_region);
CREATE INDEX IF NOT EXISTS idx_travel_packages_category ON travel_packages(category);
CREATE INDEX IF NOT EXISTS idx_travel_packages_price ON travel_packages(base_price);

-- 6. TRAVEL COMMISSION LEDGER
CREATE TABLE IF NOT EXISTS travel_commission_ledger (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agency_id VARCHAR(64) NOT NULL REFERENCES travel_agencies(id) ON DELETE CASCADE,
    booking_id VARCHAR(100) NOT NULL,
    package_id VARCHAR(64) REFERENCES travel_packages(id) ON DELETE SET NULL,
    package_title VARCHAR(255),
    agreement_id VARCHAR(64) REFERENCES travel_partner_agreements(id),
    event_type ledger_event_type NOT NULL DEFAULT 'BOOKING_ACCRUAL',
    booking_amount NUMERIC(12, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    commission_amount NUMERIC(12, 2) NOT NULL,
    net_payout_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_SETTLEMENT', -- 'PENDING_SETTLEMENT', 'SETTLED', 'REVERSED'
    idempotency_key VARCHAR(150) UNIQUE NOT NULL,
    settlement_reference VARCHAR(100),
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_ledger_agency ON travel_commission_ledger(agency_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_booking ON travel_commission_ledger(booking_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_status ON travel_commission_ledger(status);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_idemp ON travel_commission_ledger(idempotency_key);

-- 7. TRAVEL PARTNER AUDIT LOGS
CREATE TABLE IF NOT EXISTS travel_partner_audit_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    actor_user_id VARCHAR(100),
    actor_role VARCHAR(50) NOT NULL, -- 'ADMIN', 'PARTNER', 'SYSTEM'
    agency_id VARCHAR(64) REFERENCES travel_agencies(id) ON DELETE SET NULL,
    entity_type VARCHAR(100) NOT NULL, -- 'AGENCY', 'PACKAGE', 'AGREEMENT', 'COMMISSION'
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_audit_agency ON travel_partner_audit_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_partner_audit_created ON travel_partner_audit_logs(created_at);

-- 8. TRAVEL PARTNER NOTIFICATIONS
CREATE TABLE IF NOT EXISTS travel_partner_notifications (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agency_id VARCHAR(64) NOT NULL REFERENCES travel_agencies(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_notifs_agency ON travel_partner_notifications(agency_id);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE travel_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_partner_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_partner_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_partner_notifications ENABLE ROW LEVEL SECURITY;

-- 9.1 Public Package Discovery Policy:
-- Anyone (anonymous or authenticated) may select packages ONLY IF published and owning agency is approved
CREATE POLICY "Public can view approved published packages" ON travel_packages
    FOR SELECT
    USING (
        publication_status = 'PUBLISHED'
        AND EXISTS (
            SELECT 1 FROM travel_agencies a
            WHERE a.id = travel_packages.agency_id
            AND a.verification_status = 'APPROVED'
        )
    );

-- 9.2 Public Agency Profile Policy:
-- Public can view approved agency public information
CREATE POLICY "Public can view approved agencies" ON travel_agencies
    FOR SELECT
    USING (verification_status = 'APPROVED');

-- 9.3 Public Agency Application Submission:
-- Anyone can submit a new agency application
CREATE POLICY "Public can submit agency application" ON travel_agencies
    FOR INSERT
    WITH CHECK (verification_status = 'SUBMITTED');

-- 9.4 Service Role Full Access (Server-side API routes & RPCs):
-- Service role key has unconstrained access to maintain platform operations
CREATE POLICY "Service role full access on travel_agencies" ON travel_agencies
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on agency_verification_documents" ON agency_verification_documents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on travel_partner_agreements" ON travel_partner_agreements
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on travel_packages" ON travel_packages
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on travel_commission_ledger" ON travel_commission_ledger
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on travel_partner_audit_logs" ON travel_partner_audit_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on travel_partner_notifications" ON travel_partner_notifications
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 9.5 Authenticated Partner Tenant Isolation Policies:
-- Authenticated users (via Supabase Auth) can only access their linked agency data
CREATE POLICY "Partners can view own agency" ON travel_agencies
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Partners can update own agency profile" ON travel_agencies
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Partners can view and manage own packages" ON travel_packages
    FOR ALL TO authenticated
    USING (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()))
    WITH CHECK (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()));

CREATE POLICY "Partners can view own agreements" ON travel_partner_agreements
    FOR SELECT TO authenticated
    USING (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()));

CREATE POLICY "Partners can view own commission ledger" ON travel_commission_ledger
    FOR SELECT TO authenticated
    USING (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()));

CREATE POLICY "Partners can view own notifications" ON travel_partner_notifications
    FOR SELECT TO authenticated
    USING (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()));

CREATE POLICY "Partners can view and upload own verification documents" ON agency_verification_documents
    FOR ALL TO authenticated
    USING (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()))
    WITH CHECK (agency_id IN (SELECT id FROM travel_agencies WHERE user_id = auth.uid()));

-- ============================================================================
-- 10. ATOMIC TRANSACTIONAL DATABASE FUNCTIONS (RPC)
-- Hardened with explicit search_path and execution restricted to service_role
-- ============================================================================

-- 10.1 Atomic Agency Approval Function
CREATE OR REPLACE FUNCTION rpc_approve_agency(
    p_agency_id VARCHAR,
    p_admin_id VARCHAR,
    p_commission_rate NUMERIC DEFAULT 10.00,
    p_notes TEXT DEFAULT 'Verified and approved'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_agency travel_agencies%ROWTYPE;
    v_agreement_id VARCHAR;
BEGIN
    -- Authorization guard: only privileged service_role can approve agencies
    IF current_user != 'service_role' AND COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
        RAISE EXCEPTION 'Access Denied: Only service_role can execute rpc_approve_agency';
    END IF;

    -- 1. Update agency verification status
    UPDATE travel_agencies
    SET verification_status = 'APPROVED',
        verified_at = NOW(),
        verified_by = p_admin_id,
        rejection_reason = NULL,
        information_request_notes = NULL,
        updated_at = NOW()
    WHERE id = p_agency_id
    RETURNING * INTO v_agency;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agency % not found', p_agency_id;
    END IF;

    -- 2. Upsert default partner agreement
    v_agreement_id := 'agr-' || EXTRACT(EPOCH FROM NOW())::bigint;
    INSERT INTO travel_partner_agreements (
        id, agency_id, agreement_version, commission_type, commission_rate,
        commission_basis, effective_from, agreement_status, accepted_at, approved_by
    ) VALUES (
        v_agreement_id, p_agency_id, '2026-STANDARD-V1', 'PERCENTAGE', p_commission_rate,
        'GROSS_BOOKING', CURRENT_DATE, 'ACTIVE', NOW(), p_admin_id
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Write immutable audit log
    INSERT INTO travel_partner_audit_logs (
        actor_user_id, actor_role, agency_id, entity_type, entity_id, action, metadata
    ) VALUES (
        p_admin_id, 'ADMIN', p_agency_id, 'AGENCY', p_agency_id, 'STATUS_CHANGED_TO_APPROVED',
        jsonb_build_object('commissionRate', p_commission_rate, 'notes', p_notes)
    );

    -- 4. Create in-app notification
    INSERT INTO travel_partner_notifications (
        agency_id, notification_type, title, message, action_url
    ) VALUES (
        p_agency_id, 'AGENCY_APPROVED', 'Agency Application Approved',
        'Your registration has been approved. Partner dashboard access activated.',
        '/partner/dashboard'
    );

    RETURN to_jsonb(v_agency);
END;
$$;

REVOKE EXECUTE ON FUNCTION rpc_approve_agency(VARCHAR, VARCHAR, NUMERIC, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION rpc_approve_agency(VARCHAR, VARCHAR, NUMERIC, TEXT) TO service_role;

-- 10.2 Atomic Agency Suspension Cascade Function
CREATE OR REPLACE FUNCTION rpc_suspend_agency(
    p_agency_id VARCHAR,
    p_admin_id VARCHAR,
    p_reason TEXT DEFAULT 'Suspended by admin'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_agency travel_agencies%ROWTYPE;
BEGIN
    -- Authorization guard: only privileged service_role can suspend agencies
    IF current_user != 'service_role' AND COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
        RAISE EXCEPTION 'Access Denied: Only service_role can execute rpc_suspend_agency';
    END IF;

    -- 1. Suspend agency
    UPDATE travel_agencies
    SET verification_status = 'SUSPENDED',
        rejection_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_agency_id
    RETURNING * INTO v_agency;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agency % not found', p_agency_id;
    END IF;

    -- 2. Pause and suppress all published packages of this agency immediately
    UPDATE travel_packages
    SET publication_status = 'PAUSED',
        paused_at = NOW(),
        updated_at = NOW()
    WHERE agency_id = p_agency_id AND publication_status = 'PUBLISHED';

    -- 3. Write immutable audit log
    INSERT INTO travel_partner_audit_logs (
        actor_user_id, actor_role, agency_id, entity_type, entity_id, action, metadata
    ) VALUES (
        p_admin_id, 'ADMIN', p_agency_id, 'AGENCY', p_agency_id, 'STATUS_CHANGED_TO_SUSPENDED',
        jsonb_build_object('reason', p_reason)
    );

    -- 4. Create in-app notification
    INSERT INTO travel_partner_notifications (
        agency_id, notification_type, title, message, action_url
    ) VALUES (
        p_agency_id, 'AGENCY_SUSPENDED', 'Agency Account Suspended',
        'Your agency has been suspended: ' || p_reason,
        '/partners/application-status'
    );

    RETURN to_jsonb(v_agency);
END;
$$;

REVOKE EXECUTE ON FUNCTION rpc_suspend_agency(VARCHAR, VARCHAR, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION rpc_suspend_agency(VARCHAR, VARCHAR, TEXT) TO service_role;

-- 10.3 Atomic Commission Settlement Function
CREATE OR REPLACE FUNCTION rpc_settle_commission(
    p_ledger_id VARCHAR,
    p_admin_id VARCHAR,
    p_settlement_ref VARCHAR
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_entry travel_commission_ledger%ROWTYPE;
BEGIN
    -- Authorization guard: only privileged service_role can settle payouts
    IF current_user != 'service_role' AND COALESCE(current_setting('request.jwt.claim.role', true), '') != 'service_role' THEN
        RAISE EXCEPTION 'Access Denied: Only service_role can execute rpc_settle_commission';
    END IF;

    UPDATE travel_commission_ledger
    SET status = 'SETTLED',
        settlement_reference = p_settlement_ref,
        settled_at = NOW()
    WHERE id = p_ledger_id
    RETURNING * INTO v_entry;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ledger entry % not found', p_ledger_id;
    END IF;

    INSERT INTO travel_partner_audit_logs (
        actor_user_id, actor_role, agency_id, entity_type, entity_id, action, metadata
    ) VALUES (
        p_admin_id, 'ADMIN', v_entry.agency_id, 'COMMISSION', p_ledger_id, 'COMMISSION_PAYOUT_SETTLED',
        jsonb_build_object('settlementRef', p_settlement_ref, 'netPayout', v_entry.net_payout_amount)
    );

    RETURN to_jsonb(v_entry);
END;
$$;

REVOKE EXECUTE ON FUNCTION rpc_settle_commission(VARCHAR, VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION rpc_settle_commission(VARCHAR, VARCHAR, VARCHAR) TO service_role;


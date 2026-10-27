-- ============================================================================
-- BHARATYATRA TRAVEL PARTNER & PACKAGE MANAGEMENT ECOSYSTEM
-- Migration: 20261022132210_rpc_authorization_remediation.sql
-- Forward-only remediation for RPC Authorization Guards, Input Validation,
-- Permitted State Transitions, and Duplicate Settlement Prevention.
-- ============================================================================

-- 1. Atomic Agency Approval Function (Remediated)
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
    -- 1. Authorization Guard:
    -- In modern PostgREST / Supabase, auth.role() resolves the caller's JWT role ('service_role').
    -- Inside SECURITY DEFINER, current_user is the owner ('postgres').
    -- We enforce that the caller role is strictly 'service_role' (or superuser/direct admin).
    IF COALESCE(auth.role(), '') != 'service_role' 
       AND current_user != 'service_role' 
       AND session_user NOT IN ('postgres', 'service_role') THEN
        RAISE EXCEPTION 'Access Denied: Only service_role can execute rpc_approve_agency';
    END IF;

    -- 2. Input Argument Validation
    IF p_agency_id IS NULL OR btrim(p_agency_id) = '' THEN
        RAISE EXCEPTION 'Invalid argument: p_agency_id must not be empty';
    END IF;

    IF p_admin_id IS NULL OR btrim(p_admin_id) = '' THEN
        RAISE EXCEPTION 'Invalid argument: p_admin_id must not be empty';
    END IF;

    IF p_commission_rate IS NULL OR p_commission_rate < 0.00 OR p_commission_rate > 100.00 THEN
        RAISE EXCEPTION 'Invalid argument: p_commission_rate must be between 0.00 and 100.00';
    END IF;

    -- 3. Target Verification & Row Locking
    SELECT * INTO v_agency 
    FROM travel_agencies 
    WHERE id = p_agency_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agency % not found', p_agency_id;
    END IF;

    -- 4. Permitted State Transition Validation
    IF v_agency.verification_status = 'APPROVED' THEN
        RAISE EXCEPTION 'Invalid state transition: Agency % is already APPROVED', p_agency_id;
    END IF;

    IF v_agency.verification_status = 'SUSPENDED' THEN
        RAISE EXCEPTION 'Invalid state transition: Cannot approve SUSPENDED agency % directly', p_agency_id;
    END IF;

    -- 5. Atomic State Transition
    UPDATE travel_agencies
    SET verification_status = 'APPROVED',
        verified_at = NOW(),
        verified_by = p_admin_id,
        rejection_reason = NULL,
        information_request_notes = NULL,
        updated_at = NOW()
    WHERE id = p_agency_id
    RETURNING * INTO v_agency;

    -- 6. Upsert Default Partner Agreement
    v_agreement_id := 'agr-' || gen_random_uuid()::text;
    INSERT INTO travel_partner_agreements (
        id, agency_id, agreement_version, commission_type, commission_rate,
        commission_basis, effective_from, agreement_status, accepted_at, approved_by
    ) VALUES (
        v_agreement_id, p_agency_id, '2026-STANDARD-V1', 'PERCENTAGE', p_commission_rate,
        'GROSS_BOOKING', CURRENT_DATE, 'ACTIVE', NOW(), p_admin_id
    ) ON CONFLICT (id) DO NOTHING;

    -- 7. Write Immutable Audit Trail
    INSERT INTO travel_partner_audit_logs (
        actor_user_id, actor_role, agency_id, entity_type, entity_id, action, metadata
    ) VALUES (
        p_admin_id, 'ADMIN', p_agency_id, 'AGENCY', p_agency_id, 'STATUS_CHANGED_TO_APPROVED',
        jsonb_build_object('commissionRate', p_commission_rate, 'notes', p_notes)
    );

    -- 8. Create In-App Notification
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


-- 2. Atomic Agency Suspension Cascade Function (Remediated)
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
    -- 1. Authorization Guard
    IF COALESCE(auth.role(), '') != 'service_role' 
       AND current_user != 'service_role' 
       AND session_user NOT IN ('postgres', 'service_role') THEN
        RAISE EXCEPTION 'Access Denied: Only service_role can execute rpc_suspend_agency';
    END IF;

    -- 2. Input Argument Validation
    IF p_agency_id IS NULL OR btrim(p_agency_id) = '' THEN
        RAISE EXCEPTION 'Invalid argument: p_agency_id must not be empty';
    END IF;

    IF p_admin_id IS NULL OR btrim(p_admin_id) = '' THEN
        RAISE EXCEPTION 'Invalid argument: p_admin_id must not be empty';
    END IF;

    -- 3. Target Verification & Row Locking
    SELECT * INTO v_agency 
    FROM travel_agencies 
    WHERE id = p_agency_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agency % not found', p_agency_id;
    END IF;

    -- 4. Permitted State Transition Validation
    IF v_agency.verification_status = 'SUSPENDED' THEN
        RAISE EXCEPTION 'Invalid state transition: Agency % is already SUSPENDED', p_agency_id;
    END IF;

    -- 5. Suspend Agency
    UPDATE travel_agencies
    SET verification_status = 'SUSPENDED',
        rejection_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_agency_id
    RETURNING * INTO v_agency;

    -- 6. Pause & Suppress all Published Packages of this Agency Immediately
    UPDATE travel_packages
    SET publication_status = 'PAUSED',
        paused_at = NOW(),
        updated_at = NOW()
    WHERE agency_id = p_agency_id AND publication_status = 'PUBLISHED';

    -- 7. Write Immutable Audit Trail
    INSERT INTO travel_partner_audit_logs (
        actor_user_id, actor_role, agency_id, entity_type, entity_id, action, metadata
    ) VALUES (
        p_admin_id, 'ADMIN', p_agency_id, 'AGENCY', p_agency_id, 'STATUS_CHANGED_TO_SUSPENDED',
        jsonb_build_object('reason', p_reason)
    );

    -- 8. Create In-App Notification
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


-- 3. Atomic Commission Settlement Function (Remediated)
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
    -- 1. Authorization Guard
    IF COALESCE(auth.role(), '') != 'service_role' 
       AND current_user != 'service_role' 
       AND session_user NOT IN ('postgres', 'service_role') THEN
        RAISE EXCEPTION 'Access Denied: Only service_role can execute rpc_settle_commission';
    END IF;

    -- 2. Input Argument Validation
    IF p_ledger_id IS NULL OR btrim(p_ledger_id) = '' THEN
        RAISE EXCEPTION 'Invalid argument: p_ledger_id must not be empty';
    END IF;

    IF p_admin_id IS NULL OR btrim(p_admin_id) = '' THEN
        RAISE EXCEPTION 'Invalid argument: p_admin_id must not be empty';
    END IF;

    IF p_settlement_ref IS NULL OR btrim(p_settlement_ref) = '' THEN
        RAISE EXCEPTION 'Invalid argument: p_settlement_ref must not be empty';
    END IF;

    -- 3. Target Verification & Row Locking
    SELECT * INTO v_entry 
    FROM travel_commission_ledger 
    WHERE id = p_ledger_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ledger entry % not found', p_ledger_id;
    END IF;

    -- 4. Duplicate Settlement Protection & State Transition Validation
    IF v_entry.status = 'SETTLED' THEN
        RAISE EXCEPTION 'Invalid state transition: Ledger entry % has already been settled (settlement reference: %)',
            p_ledger_id, v_entry.settlement_reference;
    END IF;

    IF v_entry.status = 'REVERSED' THEN
        RAISE EXCEPTION 'Invalid state transition: Cannot settle REVERSED ledger entry %', p_ledger_id;
    END IF;

    -- 5. Atomic Settlement
    UPDATE travel_commission_ledger
    SET status = 'SETTLED',
        settlement_reference = p_settlement_ref,
        settled_at = NOW()
    WHERE id = p_ledger_id
    RETURNING * INTO v_entry;

    -- 6. Write Immutable Audit Trail
    INSERT INTO travel_partner_audit_logs (
        actor_user_id, actor_role, agency_id, entity_type, entity_id, action, metadata
    ) VALUES (
        p_admin_id, 'ADMIN', v_entry.agency_id, 'COMMISSION', p_ledger_id, 'COMMISSION_PAYOUT_SETTLED',
        jsonb_build_object('settlementRef', p_settlement_ref, 'netPayout', v_entry.net_payout_amount)
    );

    -- 7. In-App Notification
    INSERT INTO travel_partner_notifications (
        agency_id, notification_type, title, message, action_url
    ) VALUES (
        v_entry.agency_id, 'COMMISSION_SETTLED', 'Commission Payout Settled',
        'Payout for ledger entry ' || p_ledger_id || ' settled with ref: ' || p_settlement_ref,
        '/partner/commissions'
    );

    RETURN to_jsonb(v_entry);
END;
$$;

REVOKE EXECUTE ON FUNCTION rpc_settle_commission(VARCHAR, VARCHAR, VARCHAR) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION rpc_settle_commission(VARCHAR, VARCHAR, VARCHAR) TO service_role;

-- ==============================================================================
-- BHARATGATEWAY™ — PHASE 2 MIGRATION (002): CORE ENGINE RELIABILITY & ATOMICITY
-- Standards: Database-Backed Idempotency, Row-Level Locking, Audit State Transitions
-- ==============================================================================

-- 1. Seed Default Simulator Merchants
INSERT INTO bg_merchants (id, merchant_code, business_name, legal_entity_name, contact_email, contact_phone)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'merch_default_bharat_001', 'BharatYatra Default Merchant', 'BharatYatra Platform Pvt Ltd', 'merchant@bharatyatra.in', '+919876543210'),
    ('00000000-0000-0000-0000-000000000002', 'merch_phase2_pg_test', 'Phase 2 Test Logistics', 'Phase 2 Test Logistics Pvt Ltd', 'phase2_test@bharatyatra.in', '+919988776655')
ON CONFLICT (merchant_code) DO NOTHING;

-- 2. Relax merchant_id columns to VARCHAR(64) to support both UUIDs and Human-Readable Merchant Codes
ALTER TABLE bg_idempotency_locks DROP CONSTRAINT IF EXISTS bg_idempotency_locks_merchant_id_fkey;
ALTER TABLE bg_idempotency_locks ALTER COLUMN merchant_id TYPE VARCHAR(64);
ALTER TABLE bg_idempotency_locks DROP CONSTRAINT IF EXISTS bg_idempotency_locks_idempotency_key_key;
ALTER TABLE bg_idempotency_locks DROP CONSTRAINT IF EXISTS uq_merchant_idemp_path;
ALTER TABLE bg_idempotency_locks ADD CONSTRAINT uq_merchant_idemp_path UNIQUE (merchant_id, idempotency_key, request_path);

CREATE INDEX IF NOT EXISTS idx_bg_idempotency_lookup 
ON bg_idempotency_locks(merchant_id, idempotency_key, request_path);

ALTER TABLE bg_payment_orders DROP CONSTRAINT IF EXISTS bg_payment_orders_merchant_id_fkey;
ALTER TABLE bg_payment_orders ALTER COLUMN merchant_id TYPE VARCHAR(64);

ALTER TABLE bg_payment_attempts DROP CONSTRAINT IF EXISTS bg_payment_attempts_merchant_id_fkey;
ALTER TABLE bg_payment_attempts ALTER COLUMN merchant_id TYPE VARCHAR(64);

ALTER TABLE bg_refunds DROP CONSTRAINT IF EXISTS bg_refunds_merchant_id_fkey;
ALTER TABLE bg_refunds ALTER COLUMN merchant_id TYPE VARCHAR(64);

-- 3. State Transition History Log (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS bg_order_state_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(64) NOT NULL,
    merchant_id VARCHAR(64) NOT NULL,
    from_status VARCHAR(32) NOT NULL,
    to_status VARCHAR(32) NOT NULL,
    reason VARCHAR(255),
    actor VARCHAR(255) NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_state_transitions_order ON bg_order_state_transitions(order_id);
CREATE INDEX IF NOT EXISTS idx_bg_state_transitions_created ON bg_order_state_transitions(created_at DESC);

-- 4. Fast State Transition & Order Lookup Index
CREATE INDEX IF NOT EXISTS idx_bg_orders_status_trans ON bg_payment_orders(order_id, status);

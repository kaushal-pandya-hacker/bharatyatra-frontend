-- ==============================================================================
-- BHARATGATEWAY™ — MIGRATION 004: PHASE 5 RELIABILITY, CONCURRENCY & FAILURE RECOVERY
-- Standards: Cross-Process Distributed Locks, Durable Two-Phase Refund Lifecycle,
-- Strict Balance Bounds Constraints, Multi-Worker Reconciliation Isolation
-- ==============================================================================

-- 1. Distributed Multi-Process Lock Table
-- Allows multiple application processes / cluster pods to coordinate mutex locks
-- with lease TTL expiration, preventing in-memory lock divergence.
CREATE TABLE IF NOT EXISTS bg_distributed_locks (
    lock_key VARCHAR(128) PRIMARY KEY,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    owner_id VARCHAR(128) NOT NULL, -- e.g. process_pid or worker_uuid
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bg_dist_locks_expires ON bg_distributed_locks(expires_at);

-- 2. Extend bg_refunds for Two-Phase Provider Execution & Uncertain Recovery
ALTER TABLE bg_refunds
    ADD COLUMN IF NOT EXISTS provider_refund_id VARCHAR(128),
    ADD COLUMN IF NOT EXISTS failure_reason TEXT,
    ADD COLUMN IF NOT EXISTS is_uncertain BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS state_phase VARCHAR(32) NOT NULL DEFAULT 'COMMITTED'; -- 'RESERVED', 'COMMITTED', 'RELEASED'

CREATE INDEX IF NOT EXISTS idx_bg_refunds_uncertain ON bg_refunds(is_uncertain, status);
CREATE INDEX IF NOT EXISTS idx_bg_refunds_idemp ON bg_refunds(merchant_id, idempotency_key);

-- 3. Strict Balance Bounds Constraint on Orders
-- Enforces database-level invariant that amount_refunded_minor can never exceed amount_minor
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_bg_orders_refund_bound'
    ) THEN
        ALTER TABLE bg_payment_orders
            ADD CONSTRAINT chk_bg_orders_refund_bound
            CHECK (amount_refunded_minor >= 0 AND amount_refunded_minor <= amount_minor);
    END IF;
END $$;

-- 4. Multi-Worker Reconciliation Execution Guard
-- Tracks active worker ownership and prevents duplicate reconciliation batches
ALTER TABLE bg_reconciliation_batches
    ADD COLUMN IF NOT EXISTS worker_id VARCHAR(128),
    ADD COLUMN IF NOT EXISTS statement_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bg_recon_worker ON bg_reconciliation_batches(worker_id, status);

-- 5. Audit Logging for Cross-Process Concurrency & Recovery
CREATE TABLE IF NOT EXISTS bg_recovery_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(64) NOT NULL,
    order_id VARCHAR(64),
    refund_id VARCHAR(64),
    worker_id VARCHAR(128) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_recovery_audit_type ON bg_recovery_audit_log(event_type, created_at DESC);

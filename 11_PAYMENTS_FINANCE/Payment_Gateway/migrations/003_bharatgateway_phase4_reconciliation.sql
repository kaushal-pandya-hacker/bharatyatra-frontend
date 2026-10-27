-- BHARATGATEWAY™ — MIGRATION 003: PHASE 4 RECONCILIATION, REFUND INTEGRITY & WEBHOOK RELIABILITY
-- Enforces provider statement persistence, enhanced discrepancy classifications, and resilient webhook retries.

-- 1. Webhook deliveries: add failure classification and retry scheduling columns if missing
ALTER TABLE bg_webhook_deliveries 
  ADD COLUMN IF NOT EXISTS error_category VARCHAR(32) DEFAULT 'RETRYABLE', -- 'RETRYABLE', 'PERMANENT', 'TIMEOUT'
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS is_redelivery BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_bg_webhook_next_retry ON bg_webhook_deliveries(next_retry_at, status);

-- 2. Reconciliation statement records table: to store external simulated provider statements
CREATE TABLE IF NOT EXISTS bg_reconciliation_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id VARCHAR(64) UNIQUE NOT NULL, -- 'stmt_sim_...'
    provider_name VARCHAR(50) NOT NULL DEFAULT 'BHARATGATEWAY_SIMULATOR',
    merchant_id VARCHAR(64) NOT NULL,
    statement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_records INT NOT NULL DEFAULT 0,
    total_volume_minor BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    raw_statement JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_recon_stmt_merch ON bg_reconciliation_statements(merchant_id);

-- 3. Detailed reconciliation batch discrepancies table (auditable evidence store)
CREATE TABLE IF NOT EXISTS bg_reconciliation_discrepancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id VARCHAR(64) NOT NULL,
    merchant_id VARCHAR(64) NOT NULL,
    order_id VARCHAR(64),
    provider_reference VARCHAR(64),
    discrepancy_type VARCHAR(64) NOT NULL, -- 'MISSING_INTERNAL', 'MISSING_PROVIDER', 'AMOUNT_MISMATCH', etc.
    evidence_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_recon_disc_batch ON bg_reconciliation_discrepancies(batch_id);
CREATE INDEX IF NOT EXISTS idx_bg_recon_disc_merch ON bg_reconciliation_discrepancies(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bg_recon_disc_type ON bg_reconciliation_discrepancies(discrepancy_type);

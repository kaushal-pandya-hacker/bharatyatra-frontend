-- ==============================================================================
-- BHARATGATEWAY™ — PRODUCTION-GRADE POSTGRESQL DATABASE SCHEMA MIGRATION (001)
-- Standards: Strict Foreign Keys, Check Constraints, Append-Only Ledgers,
-- Minor Integer Currency Units (Paise/Cents), Idempotency Keys, Audit Trails
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES
-- ------------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE merchant_kyc_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE merchant_role_type AS ENUM ('OWNER', 'ADMIN', 'DEVELOPER', 'FINANCE', 'SUPPORT_VIEWER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_order_status AS ENUM ('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_attempt_status AS ENUM ('INITIATED', 'PENDING_OTP', 'PROCESSING', 'SUCCESS', 'FAILED', 'TIMEOUT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE ledger_account_type AS ENUM (
        'CUSTOMER_RECEIVABLE',
        'GATEWAY_CLEARING',
        'MERCHANT_SETTLEMENT_PAYABLE',
        'PLATFORM_FEE_INCOME',
        'TAX_GST_PAYABLE',
        'REFUND_CLEARING',
        'SUSPENSE_DISCREPANCY'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE ledger_direction AS ENUM ('DEBIT', 'CREDIT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE refund_status AS ENUM ('REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE webhook_status AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'RETRYING');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE recon_status AS ENUM ('RUNNING', 'COMPLETED_MATCHED', 'DISCREPANCIES_FOUND', 'MANUAL_REVIEW');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. MERCHANTS & MEMBERSHIPS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. 'MERCH_948271'
    business_name VARCHAR(255) NOT NULL,
    legal_entity_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL DEFAULT 'PRIVATE_LIMITED', -- PROPRIETORSHIP, LLP, PVT_LTD
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    website_url VARCHAR(500),
    gstin VARCHAR(15),
    pan_number VARCHAR(10),
    kyc_status merchant_kyc_status NOT NULL DEFAULT 'APPROVED', -- Simulator default is approved
    settlement_account_number VARCHAR(34),
    settlement_ifsc VARCHAR(11),
    default_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_merchants_code ON bg_merchants(merchant_code);
CREATE INDEX IF NOT EXISTS idx_bg_merchants_email ON bg_merchants(contact_email);

CREATE TABLE IF NOT EXISTS bg_merchant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES bg_merchants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role merchant_role_type NOT NULL DEFAULT 'ADMIN',
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_merchant_user_email UNIQUE (merchant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_bg_merchant_users_lookup ON bg_merchant_users(email);

-- ------------------------------------------------------------------------------
-- 3. API CREDENTIALS & PERMISSIONS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_api_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES bg_merchants(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL DEFAULT 'Default API Key',
    publishable_key VARCHAR(100) UNIQUE NOT NULL, -- pk_test_xxxx
    secret_key_hash VARCHAR(255) NOT NULL,        -- SHA-256 hash of sk_test_xxxx
    secret_key_prefix VARCHAR(16) NOT NULL,       -- sk_test_... (first 10 chars for display)
    environment VARCHAR(20) NOT NULL DEFAULT 'SIMULATED', -- 'SIMULATED' or 'LIVE' (live requires regulatory authorization)
    permissions JSONB NOT NULL DEFAULT '["orders:create", "orders:read", "refunds:create", "webhooks:manage"]'::jsonb,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_api_credentials_pub ON bg_api_credentials(publishable_key);
CREATE INDEX IF NOT EXISTS idx_bg_api_credentials_merch ON bg_api_credentials(merchant_id);

-- ------------------------------------------------------------------------------
-- 4. PAYMENT ORDERS (Integer Minor Units: Paise / Cents)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(64) UNIQUE NOT NULL, -- 'order_bg_...'
    merchant_id UUID NOT NULL REFERENCES bg_merchants(id) ON DELETE RESTRICT,
    amount_minor BIGINT NOT NULL,          -- Integer minor unit: ₹100.00 = 10000 paise
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    receipt_reference VARCHAR(128),
    status payment_order_status NOT NULL DEFAULT 'CREATED',
    idempotency_key VARCHAR(255),
    customer_id VARCHAR(100),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    description TEXT,
    return_url VARCHAR(1000),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes JSONB NOT NULL DEFAULT '{}'::jsonb,
    attempts_count INT NOT NULL DEFAULT 0,
    amount_refunded_minor BIGINT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_positive_order_amount CHECK (amount_minor > 0),
    CONSTRAINT chk_valid_refunded_amount CHECK (amount_refunded_minor >= 0 AND amount_refunded_minor <= amount_minor),
    CONSTRAINT uq_merchant_order_idempotency UNIQUE (merchant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_bg_payment_orders_merchant ON bg_payment_orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bg_payment_orders_status ON bg_payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_bg_payment_orders_created ON bg_payment_orders(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. PAYMENT ATTEMPTS & TRANSACTIONS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id VARCHAR(64) UNIQUE NOT NULL, -- 'pay_bg_...'
    order_id UUID NOT NULL REFERENCES bg_payment_orders(id) ON DELETE RESTRICT,
    merchant_id UUID NOT NULL REFERENCES bg_merchants(id) ON DELETE RESTRICT,
    payment_method VARCHAR(50) NOT NULL,    -- 'UPI', 'CARD', 'NETBANKING', 'WALLET'
    payment_provider VARCHAR(50) NOT NULL DEFAULT 'BHARATGATEWAY_SIMULATOR',
    amount_minor BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status payment_attempt_status NOT NULL DEFAULT 'INITIATED',
    -- Strictly PCI-safe: Masked card or VPA identifier only. Never real PAN or PIN.
    method_details JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. { "maskedVpa": "user@okaxis", "cardLast4": "4242", "bankCode": "HDFC" }
    error_code VARCHAR(64),
    error_description TEXT,
    risk_score INT NOT NULL DEFAULT 0, -- 0 (Safe) to 100 (Critical Fraud)
    ip_address VARCHAR(45),
    user_agent TEXT,
    gateway_signature VARCHAR(255),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_attempt_positive_amount CHECK (amount_minor > 0)
);

CREATE INDEX IF NOT EXISTS idx_bg_payment_attempts_order ON bg_payment_attempts(order_id);
CREATE INDEX IF NOT EXISTS idx_bg_payment_attempts_merchant ON bg_payment_attempts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bg_payment_attempts_status ON bg_payment_attempts(status);

-- ------------------------------------------------------------------------------
-- 6. APPEND-ONLY DOUBLE-ENTRY FINANCIAL LEDGER
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_ledger_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(64) UNIQUE NOT NULL, -- e.g. 'MERCHANT:uuid:PAYABLE' or 'GATEWAY:CLEARING'
    account_type ledger_account_type NOT NULL,
    merchant_id UUID REFERENCES bg_merchants(id) ON DELETE RESTRICT,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    current_balance_minor BIGINT NOT NULL DEFAULT 0, -- Denormalized cached balance
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_ledger_accounts_lookup ON bg_ledger_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_bg_ledger_accounts_merch ON bg_ledger_accounts(merchant_id);

CREATE TABLE IF NOT EXISTS bg_ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_reference VARCHAR(64) UNIQUE NOT NULL, -- 'tx_ledg_...'
    reference_type VARCHAR(32) NOT NULL,              -- 'PAYMENT', 'REFUND', 'SETTLEMENT', 'ADJUSTMENT'
    reference_id VARCHAR(64) NOT NULL,                -- order_id or refund_id
    merchant_id UUID REFERENCES bg_merchants(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    is_balanced BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_ledger_tx_ref ON bg_ledger_transactions(reference_id);

CREATE TABLE IF NOT EXISTS bg_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES bg_ledger_transactions(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES bg_ledger_accounts(id) ON DELETE RESTRICT,
    direction ledger_direction NOT NULL,
    amount_minor BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    description TEXT NOT NULL,
    running_balance_minor BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ledger_positive_amount CHECK (amount_minor > 0)
);

CREATE INDEX IF NOT EXISTS idx_bg_ledger_entries_account ON bg_ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_bg_ledger_entries_tx ON bg_ledger_entries(transaction_id);

-- ------------------------------------------------------------------------------
-- 7. REFUNDS MODULE (Integer Minor Units)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_id VARCHAR(64) UNIQUE NOT NULL, -- 'ref_bg_...'
    order_id UUID NOT NULL REFERENCES bg_payment_orders(id) ON DELETE RESTRICT,
    payment_attempt_id UUID REFERENCES bg_payment_attempts(id) ON DELETE RESTRICT,
    merchant_id UUID NOT NULL REFERENCES bg_merchants(id) ON DELETE RESTRICT,
    amount_minor BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    reason TEXT NOT NULL,
    status refund_status NOT NULL DEFAULT 'REQUESTED',
    speed VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- 'NORMAL', 'INSTANT'
    idempotency_key VARCHAR(255),
    error_code VARCHAR(64),
    error_message TEXT,
    settlement_adjusted BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_positive_refund_amount CHECK (amount_minor > 0),
    CONSTRAINT uq_merchant_refund_idempotency UNIQUE (merchant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_bg_refunds_order ON bg_refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_bg_refunds_merchant ON bg_refunds(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bg_refunds_status ON bg_refunds(status);

-- ------------------------------------------------------------------------------
-- 8. WEBHOOKS & EVENT DISPATCHING
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES bg_merchants(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    secret_hash VARCHAR(255) NOT NULL, -- HMAC-SHA256 signing secret
    secret_prefix VARCHAR(16) NOT NULL, -- whsec_...
    enabled_events JSONB NOT NULL DEFAULT '["payment.captured", "payment.failed", "refund.completed"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_webhook_endpoints_merch ON bg_webhook_endpoints(merchant_id);

CREATE TABLE IF NOT EXISTS bg_webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id VARCHAR(64) UNIQUE NOT NULL, -- 'evt_bg_...'
    endpoint_id UUID NOT NULL REFERENCES bg_webhook_endpoints(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES bg_merchants(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    signature_header VARCHAR(500) NOT NULL,
    status webhook_status NOT NULL DEFAULT 'PENDING',
    attempt_count INT NOT NULL DEFAULT 0,
    http_status_code INT,
    response_body TEXT,
    next_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_webhook_deliveries_status ON bg_webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_bg_webhook_deliveries_merch ON bg_webhook_deliveries(merchant_id);

-- ------------------------------------------------------------------------------
-- 9. FRAUD ALERTS & RISK RULES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID REFERENCES bg_merchants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES bg_payment_orders(id) ON DELETE SET NULL,
    attempt_id UUID REFERENCES bg_payment_attempts(id) ON DELETE SET NULL,
    rule_name VARCHAR(100) NOT NULL,
    risk_score INT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    trigger_details JSONB NOT NULL,
    action_taken VARCHAR(50) NOT NULL, -- 'FLAGGED', 'BLOCKED', 'CHALLENGED_OTP'
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by VARCHAR(255),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_fraud_alerts_merch ON bg_fraud_alerts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bg_fraud_alerts_severity ON bg_fraud_alerts(severity);

-- ------------------------------------------------------------------------------
-- 10. RECONCILIATION BATCHES & DISCREPANCIES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_reconciliation_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id VARCHAR(64) UNIQUE NOT NULL, -- 'rec_batch_...'
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    status recon_status NOT NULL DEFAULT 'RUNNING',
    total_orders_scanned INT NOT NULL DEFAULT 0,
    total_captured_amount_minor BIGINT NOT NULL DEFAULT 0,
    total_ledger_amount_minor BIGINT NOT NULL DEFAULT 0,
    matched_count INT NOT NULL DEFAULT 0,
    discrepancy_count INT NOT NULL DEFAULT 0,
    discrepancy_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    executed_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM_CRON',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_recon_batches_status ON bg_reconciliation_batches(status);

-- ------------------------------------------------------------------------------
-- 11. AUDIT LOGS (Immutable Security Log)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(64) UNIQUE NOT NULL,
    actor_id VARCHAR(255) NOT NULL,      -- Merchant user email or system service name
    actor_role VARCHAR(50) NOT NULL,     -- 'ADMIN', 'MERCHANT', 'SYSTEM'
    merchant_id UUID REFERENCES bg_merchants(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,        -- 'ORDER_CREATED', 'PAYMENT_CAPTURED', 'REFUND_APPROVED', 'KEY_ROTATED'
    resource_type VARCHAR(50) NOT NULL,  -- 'ORDER', 'PAYMENT', 'CREDENTIAL', 'LEDGER'
    resource_id VARCHAR(100) NOT NULL,
    sanitized_metadata JSONB NOT NULL,   -- Sensitive values strictly redacted
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bg_audit_events_merch ON bg_audit_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bg_audit_events_created ON bg_audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bg_audit_events_action ON bg_audit_events(action);

-- ------------------------------------------------------------------------------
-- 12. IDEMPOTENCY LOCKS & CACHE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bg_idempotency_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES bg_merchants(id) ON DELETE CASCADE,
    request_path VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of payload
    response_code INT,
    response_body JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_FLIGHT', -- 'IN_FLIGHT', 'COMPLETED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bg_idempotency_key ON bg_idempotency_locks(idempotency_key);

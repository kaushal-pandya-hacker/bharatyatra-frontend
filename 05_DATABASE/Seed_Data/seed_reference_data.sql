-- =============================================================================
-- CHALO FARVA — REFERENCE SYSTEM SEED DATA (DEVELOPMENT ONLY)
-- Description: System roles, permissions, providers, and templates.
-- =============================================================================

INSERT INTO roles (role_id, role_name, description) VALUES
('r1111111-1111-1111-1111-111111111111', 'TRAVELLER', 'End-user customer traveller account'),
('r2222222-2222-2222-2222-222222222222', 'SUPPLIER_ADMIN', 'Hotel, bus operator or activity vendor owner'),
('r3333333-3333-3333-3333-333333333333', 'PLATFORM_ADMIN', 'Chalo Farva operations superuser');

INSERT INTO providers (provider_id, provider_name, provider_code, is_active) VALUES
('p1111111-1111-1111-1111-111111111111', 'GSRTC Official API', 'GSRTC_API', TRUE),
('p2222222-2222-2222-2222-222222222222', 'Razorpay Payment Gateway', 'RAZORPAY', TRUE);

-- =============================================================================
-- CHALO FARVA — CONSTRAINTS & BUSINESS RULES
-- Version: v1.0.0
-- Description: Explicit CHECK constraints and relational data rules.
-- =============================================================================

ALTER TABLE users ADD CONSTRAINT chk_users_email_format CHECK (email LIKE '%@%.%');
ALTER TABLE trips ADD CONSTRAINT chk_trips_date_validity CHECK (end_date >= start_date);
ALTER TABLE trips ADD CONSTRAINT chk_trips_budget_positive CHECK (total_budget_inr >= 0);
ALTER TABLE bookings ADD CONSTRAINT chk_bookings_amount_positive CHECK (net_payable_amount >= 0);
ALTER TABLE payments ADD CONSTRAINT chk_payments_amount_positive CHECK (amount > 0);
ALTER TABLE attractions ADD CONSTRAINT chk_attractions_ticket_positive CHECK (ticket_price_inr >= 0);

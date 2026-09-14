-- =============================================================================
-- CHALO FARVA — ANALYTICAL & REPORTING VIEWS
-- Version: v1.0.0
-- Description: Business views for active trips, booking summaries, and revenue analytics.
-- =============================================================================

CREATE OR REPLACE VIEW view_active_trips_summary AS
SELECT 
    t.trip_id,
    t.user_id,
    u.full_name AS user_name,
    t.title AS trip_title,
    t.start_date,
    t.end_date,
    t.trip_status,
    t.estimated_cost_inr,
    COUNT(b.booking_id) AS total_bookings
FROM trips t
JOIN users u ON t.user_id = u.user_id
LEFT JOIN bookings b ON t.trip_id = b.trip_id
WHERE t.trip_status IN ('BOOKED', 'ACTIVE')
GROUP BY t.trip_id, u.full_name;

CREATE OR REPLACE VIEW view_daily_revenue_analytics AS
SELECT 
    DATE(paid_at) AS payment_date,
    gateway_name,
    COUNT(payment_id) AS successful_transactions,
    SUM(amount) AS gross_revenue_inr
FROM payments
WHERE payment_status = 'CAPTURED'
GROUP BY DATE(paid_at), gateway_name;

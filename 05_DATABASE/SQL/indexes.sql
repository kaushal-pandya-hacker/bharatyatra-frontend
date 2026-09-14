-- =============================================================================
-- CHALO FARVA — INDEXES & PERFORMANCE OPTIMIZATION
-- Version: v1.0.0
-- Description: Composite and targeted single-column indexes for search, FKs, and range queries.
-- =============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_destinations_region ON destinations(region);
CREATE INDEX idx_attractions_destination ON attractions(destination_id);
CREATE INDEX idx_hotels_destination ON hotels(destination_id);
CREATE INDEX idx_room_inventory_lookup ON room_inventory(room_type_id, date);
CREATE INDEX idx_bus_trips_schedule ON bus_trips(route_id, departure_time);
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(trip_status);
CREATE INDEX idx_itinerary_items_day ON itinerary_items(day_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_events_trip ON trip_events(trip_id);
CREATE INDEX idx_proposals_trip ON ai_adaptation_proposals(trip_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);

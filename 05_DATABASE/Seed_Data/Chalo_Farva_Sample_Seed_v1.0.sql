-- =============================================================================
-- CHALO FARVA — SAMPLE DEMO SEED DATA (DEVELOPMENT & DEMO PURPOSES ONLY)
-- Version: v1.0.0
-- Date: September 13, 2026
-- Notice: ALL ENTRIES ARE CLEARLY MARKED AS DEMO / NON-PRODUCTION.
-- =============================================================================

-- 1. DEMO DATA SOURCES
INSERT INTO data_sources (source_id, source_name, source_url, trust_score) VALUES
('11111111-1111-1111-1111-111111111111', 'DEMO_Gujarat_Tourism_Board_API', 'https://gujarattourism.gov.in', 1.00);

-- 2. DEMO DESTINATIONS (GUJARAT REGIONS)
INSERT INTO destinations (destination_id, source_id, name, slug, state, district, region, latitude, longitude, description, best_season, recommended_duration_hours) VALUES
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Bhuj', 'bhuj', 'Gujarat', 'Kutch', 'Kutch', 23.2420, 69.6669, 'Cultural heart of Kutch, gateway to White Rann.', 'October to March', 48),
('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Sasan Gir', 'sasan-gir', 'Gujarat', 'Junagadh', 'Saurashtra', 21.1243, 70.8242, 'Home of the Asiatic Lion in Gir National Park.', 'November to April', 36),
('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Somnath', 'somnath', 'Gujarat', 'Gir Somnath', 'Saurashtra', 20.8880, 70.4012, 'First among the twelve Jyotirlinga shrines of Shiva.', 'All Year', 24),
('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Dwarka', 'dwarka', 'Gujarat', 'Devbhumi Dwarka', 'Saurashtra', 22.2442, 68.9685, 'Ancient kingdom of Lord Krishna, sacred pilgrimage site.', 'October to March', 36);

-- 3. DEMO ATTRACTIONS
INSERT INTO attractions (attraction_id, destination_id, name, slug, latitude, longitude, description, opening_time, closing_time, ticket_price_inr, weather_sensitive) VALUES
('a1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'White Rann of Kutch', 'white-rann-kutch', 23.8291, 69.8540, 'Vast salt marsh in the Thar Desert.', '06:00:00', '20:00:00', 100.00, TRUE),
('a2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Gir Jungle Safari Park', 'gir-jungle-safari', 21.1243, 70.8242, 'Jeep safari through the protected forest reserve.', '06:00:00', '17:00:00', 800.00, TRUE),
('a3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Somnath Temple', 'somnath-temple', 20.8880, 70.4012, 'Iconic seashore temple dedicated to Lord Shiva.', '06:00:00', '21:00:00', 0.00, FALSE);

-- 4. DEMO SUPPLIERS & HOTELS
INSERT INTO suppliers (supplier_id, company_name, supplier_type, business_registration_number, contact_email, contact_phone, verification_status) VALUES
('s1111111-1111-1111-1111-111111111111', 'DEMO_Kutch_Heritage_Resorts_Pvt_Ltd', 'HOTEL', 'REG-DEMO-2026-01', 'hotel_demo@chalofarva.com', '+919800000001', 'VERIFIED'),
('s2222222-2222-2222-2222-222222222222', 'DEMO_GSRTC_Express_Operator', 'BUS_OPERATOR', 'REG-GSRTC-2026-02', 'bus_demo@chalofarva.com', '+919800000002', 'VERIFIED');

INSERT INTO hotels (hotel_id, supplier_id, destination_id, name, slug, star_rating, address, latitude, longitude) VALUES
('h1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'DEMO Rann Heritage Resort', 'demo-rann-heritage-resort', 4, 'Dhordo Village, Kutch', 23.8200, 69.8500);

-- 5. DEMO BUS OPERATOR & BUSES
INSERT INTO bus_operators (operator_id, supplier_id, operator_name, operator_code) VALUES
('b1111111-1111-1111-1111-111111111111', 's2222222-2222-2222-2222-222222222222', 'GSRTC Volvo Express', 'GSRTC_DEMO');

INSERT INTO buses (bus_id, operator_id, bus_number, bus_type, total_seats) VALUES
('bus11111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'GJ-18-Z-9999', 'GSRTC AC Volvo Seater 2+2', 40);

-- 6. DEMO PACKAGES
INSERT INTO packages (package_id, package_name, slug, description, duration_days, duration_nights, base_price_per_person, package_category) VALUES
('pkg11111-1111-1111-1111-111111111111', 'Kutch Rann Utsav & Handicrafts Special', 'kutch-rann-utsav-special', '3 Days / 2 Nights magical trip to White Rann, Bhuj Fort, and local artisan villages.', 3, 2, 8500.00, 'Kutch Rann Utsav'),
('pkg22222-2222-2222-2222-222222222222', 'Saurashtra Sacred Circuit (Somnath & Dwarka)', 'saurashtra-sacred-circuit', '4 Days / 3 Nights spiritual pilgrimage visiting Somnath, Dwarka, and Nageshwar.', 4, 3, 10500.00, 'Religious');

-- END OF SAMPLE DEMO SEED DATA

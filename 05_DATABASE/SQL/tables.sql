-- =============================================================================
-- CHALO FARVA — PRODUCTION TABLES DDL (52+ TABLES)
-- Version: v1.0.0
-- Description: Core table DDL structures for all 22 domain modules.
-- =============================================================================

-- MODULE 1: IDENTITY & RBAC
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_status user_account_status DEFAULT 'ACTIVE',
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    profile_image_url TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    bio TEXT,
    home_city VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    travel_pace VARCHAR(20) DEFAULT 'BALANCED',
    budget_category VARCHAR(20) DEFAULT 'MID_RANGE',
    preferred_categories TEXT[],
    dietary_preference VARCHAR(30) DEFAULT 'VEGETARIAN',
    accessibility_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE travellers (
    traveller_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(10),
    id_proof_type VARCHAR(30),
    id_proof_number_hash VARCHAR(255),
    relationship VARCHAR(30) DEFAULT 'SELF',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    login_status VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consents (
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    terms_version VARCHAR(20) NOT NULL,
    privacy_policy_version VARCHAR(20) NOT NULL,
    agreed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- MODULE 2: TRAVEL KNOWLEDGE BASE
CREATE TABLE travel_sources (
    source_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100) NOT NULL,
    source_url TEXT,
    trust_score NUMERIC(3,2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destinations (
    destination_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES travel_sources(source_id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(50) DEFAULT 'Gujarat',
    district VARCHAR(100) NOT NULL,
    region gujarat_region NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    description TEXT,
    best_season VARCHAR(100),
    recommended_duration_hours INT DEFAULT 24,
    verification_status verification_status_type DEFAULT 'VERIFIED',
    verified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE places (
    place_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    place_name VARCHAR(150) NOT NULL,
    place_type VARCHAR(50) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL
);

CREATE TABLE attractions (
    attraction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    source_id UUID REFERENCES travel_sources(source_id),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    description TEXT,
    opening_time TIME,
    closing_time TIME,
    weekly_off_day VARCHAR(15),
    ticket_price_inr NUMERIC(10, 2) DEFAULT 0.00,
    average_visit_duration_mins INT DEFAULT 90,
    weather_sensitive BOOLEAN DEFAULT FALSE,
    family_suitable BOOLEAN DEFAULT TRUE,
    accessibility_available BOOLEAN DEFAULT FALSE,
    verification_status verification_status_type DEFAULT 'VERIFIED',
    verified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurants (
    restaurant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    cuisine_type TEXT[],
    is_pure_veg BOOLEAN DEFAULT TRUE,
    is_jain_available BOOLEAN DEFAULT TRUE,
    price_rating VARCHAR(10),
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    opening_time TIME,
    closing_time TIME,
    rating NUMERIC(3, 2) DEFAULT 4.0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routes (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    destination_destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    distance_km NUMERIC(8, 2) NOT NULL,
    estimated_duration_mins INT NOT NULL,
    route_type VARCHAR(30) DEFAULT 'HIGHWAY'
);

CREATE TABLE content_updates (
    update_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    editor_user_id UUID REFERENCES users(user_id),
    change_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- MODULE 3: SUPPLIERS & HOTEL DOMAIN
CREATE TABLE suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(150) NOT NULL,
    supplier_type VARCHAR(30) NOT NULL,
    business_registration_number VARCHAR(50) UNIQUE NOT NULL,
    gstin VARCHAR(20) UNIQUE,
    contact_email VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    verification_status verification_status_type DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
    hotel_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    destination_id UUID NOT NULL REFERENCES destinations(destination_id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    star_rating INT,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_types (
    room_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    room_type_name VARCHAR(50) NOT NULL,
    capacity_adults INT NOT NULL DEFAULT 2,
    capacity_children INT NOT NULL DEFAULT 1,
    base_price_per_night NUMERIC(10, 2) NOT NULL,
    total_inventory INT NOT NULL DEFAULT 1
);

CREATE TABLE room_inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES room_types(room_type_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_count INT NOT NULL,
    blocked_count INT DEFAULT 0,
    UNIQUE (room_type_id, date)
);

CREATE TABLE room_rates (
    rate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES room_types(room_type_id) ON DELETE CASCADE,
    effective_date DATE NOT NULL,
    nightly_rate NUMERIC(10, 2) NOT NULL,
    UNIQUE (room_type_id, effective_date)
);

-- MODULE 4: BUS DOMAIN
CREATE TABLE bus_operators (
    operator_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    operator_name VARCHAR(150) NOT NULL,
    operator_code VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE buses (
    bus_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES bus_operators(operator_id) ON DELETE CASCADE,
    bus_number VARCHAR(30) NOT NULL,
    bus_type VARCHAR(50) NOT NULL,
    total_seats INT NOT NULL
);

CREATE TABLE bus_routes (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    destination_destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    distance_km NUMERIC(8, 2) NOT NULL,
    estimated_duration_mins INT NOT NULL
);

CREATE TABLE bus_trips (
    trip_schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(bus_id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES bus_routes(route_id) ON DELETE CASCADE,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    fare_amount NUMERIC(10, 2) NOT NULL,
    available_seats INT NOT NULL
);

CREATE TABLE bus_seats (
    seat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(bus_id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    deck_level VARCHAR(10) DEFAULT 'LOWER',
    seat_type VARCHAR(20) DEFAULT 'SEATER'
);

CREATE TABLE bus_inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_schedule_id UUID NOT NULL REFERENCES bus_trips(trip_schedule_id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES bus_seats(seat_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    lock_expires_at TIMESTAMPTZ,
    UNIQUE (trip_schedule_id, seat_id)
);

-- MODULE 5: TRIP DOMAIN MODEL (CENTRAL ENTITY)
CREATE TABLE trips (
    trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    origin_city VARCHAR(100) NOT NULL,
    primary_destination_id UUID REFERENCES destinations(destination_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget_inr NUMERIC(10, 2),
    estimated_cost_inr NUMERIC(10, 2) DEFAULT 0.00,
    traveller_count INT DEFAULT 1,
    trip_status trip_lifecycle_status DEFAULT 'DRAFT',
    planning_status trip_planning_status DEFAULT 'AI_DRAFT',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_members (
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    traveller_id UUID NOT NULL REFERENCES travellers(traveller_id) ON DELETE CASCADE,
    PRIMARY KEY (trip_id, traveller_id)
);

-- MODULE 6: ITINERARY VERSIONING
CREATE TABLE itineraries (
    itinerary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    active_version_number INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itinerary_versions (
    version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    parent_version_id UUID REFERENCES itinerary_versions(version_id),
    change_summary TEXT,
    created_by VARCHAR(50) DEFAULT 'AI_PLANNER',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (itinerary_id, version_number)
);

CREATE TABLE itinerary_days (
    day_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES itinerary_versions(version_id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date DATE NOT NULL,
    overnight_destination_id UUID REFERENCES destinations(destination_id),
    UNIQUE (version_id, day_number)
);

CREATE TABLE itinerary_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID NOT NULL REFERENCES itinerary_days(day_id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    item_type item_type_enum NOT NULL,
    attraction_id UUID REFERENCES attractions(attraction_id),
    hotel_id UUID REFERENCES hotels(hotel_id),
    trip_schedule_id UUID REFERENCES bus_trips(trip_schedule_id),
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    estimated_cost NUMERIC(10,2) DEFAULT 0.00,
    locked_by_user BOOLEAN DEFAULT FALSE
);

-- MODULE 7: TRIP EVENTS & ADAPTIVE AI
CREATE TABLE trip_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity event_severity_enum DEFAULT 'MEDIUM',
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    affected_date DATE NOT NULL,
    payload_json JSONB
);

CREATE TABLE ai_adaptation_runs (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES trip_events(event_id) ON DELETE CASCADE,
    model_version VARCHAR(50) DEFAULT 'gemini-3.5-pro',
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE TABLE ai_adaptation_proposals (
    proposal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES ai_adaptation_runs(run_id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    trigger_description TEXT NOT NULL,
    proposed_changes_json JSONB NOT NULL,
    status proposal_status_enum DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_decisions (
    decision_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID UNIQUE NOT NULL REFERENCES ai_adaptation_proposals(proposal_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id),
    decision VARCHAR(20) NOT NULL,
    applied_version_id UUID REFERENCES itinerary_versions(version_id),
    decided_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- MODULE 8: PROVIDER ABSTRACTION & BOOKINGS
CREATE TABLE providers (
    provider_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(100) UNIQUE NOT NULL,
    provider_code VARCHAR(30) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(30) UNIQUE NOT NULL,
    trip_id UUID REFERENCES trips(trip_id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(user_id),
    total_amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,
    net_payable_amount NUMERIC(10, 2) NOT NULL,
    booking_status booking_lifecycle_status DEFAULT 'SEARCHED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_entity_mappings (
    mapping_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(provider_id),
    external_provider_id VARCHAR(100) NOT NULL,
    external_pnr VARCHAR(50),
    raw_response JSONB
);

-- MODULE 9: PAYMENTS & FINANCIAL LEDGER
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id),
    gateway_name VARCHAR(50) DEFAULT 'RAZORPAY',
    gateway_transaction_id VARCHAR(100) UNIQUE,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status payment_lifecycle_status DEFAULT 'CREATED',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refunds (
    refund_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(payment_id),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id),
    refund_reference VARCHAR(30) UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    refund_status VARCHAR(20) DEFAULT 'REQUESTED',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(booking_id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    billing_name VARCHAR(100) NOT NULL,
    billing_email VARCHAR(150) NOT NULL,
    taxable_amount NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ledger_accounts (
    account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name VARCHAR(100) UNIQUE NOT NULL,
    account_type VARCHAR(50) NOT NULL
);

CREATE TABLE ledger_entries (
    entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES ledger_accounts(account_id),
    booking_id UUID REFERENCES bookings(booking_id),
    debit_amount NUMERIC(10, 2) DEFAULT 0.00,
    credit_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- MODULE 10: NOTIFICATIONS, REVIEWS & AUDIT
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- CHALO FARVA — MASTER PRODUCTION RELATIONAL DATABASE SCHEMA (54+ TABLES)
-- Version: v1.0.0
-- Database Engine: PostgreSQL 15+ Compatible
-- Description: Complete production schema covering Identity, Gujarat Tourism, 
--              Hotels, Buses, Activities, Packages, Trips, Itineraries, AI Logs, 
--              Trip Events, Adaptive AI, Bookings, Payments, GST Invoicing, 
--              Commissions, Suppliers, Notifications, Reviews, Support & Auditing.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- MODULE 1: IDENTITY & RBAC
-- =============================================================================

CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL, -- TRAVELLER, SUPPLIER_ADMIN, SUPPLIER_STAFF, PLATFORM_ADMIN, SUPPORT_AGENT
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., trip:create, booking:cancel, supplier:payout
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'gu', 'hi')),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    profile_image_url TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    travel_pace VARCHAR(20) DEFAULT 'BALANCED' CHECK (travel_pace IN ('RELAXED', 'BALANCED', 'FAST_PACED')),
    budget_category VARCHAR(20) DEFAULT 'MID_RANGE' CHECK (budget_category IN ('BUDGET', 'MID_RANGE', 'LUXURY')),
    preferred_categories TEXT[],
    dietary_preference VARCHAR(30) DEFAULT 'VEGETARIAN' CHECK (dietary_preference IN ('VEGETARIAN', 'JAIN', 'NON_VEGETARIAN', 'EGGITARIAN', 'VEGAN')),
    accessibility_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE travellers (
    traveller_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    age INT CHECK (age >= 0 AND age <= 120),
    gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    id_proof_type VARCHAR(30) CHECK (id_proof_type IN ('AADHAAR', 'PASSPORT', 'PAN', 'DRIVING_LICENSE')),
    id_proof_number_hash VARCHAR(255),
    relationship VARCHAR(30) DEFAULT 'SELF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 2: DESTINATION & GUJARAT TOURISM DATA
-- =============================================================================

CREATE TABLE data_sources (
    source_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100) NOT NULL, -- Gujarat Tourism Board, Official Heritage Register, Verified Field Survey
    source_url TEXT,
    trust_score NUMERIC(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destination_categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(50) UNIQUE NOT NULL, -- Heritage, Wildlife, Spiritual, Beach, Culture, Nature
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE destinations (
    destination_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES data_sources(source_id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(50) DEFAULT 'Gujarat',
    district VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL CHECK (region IN ('Kutch', 'Saurashtra', 'South_Gujarat', 'Central_Gujarat', 'North_Gujarat')),
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    description TEXT,
    best_season VARCHAR(100),
    recommended_duration_hours INT DEFAULT 24,
    verification_status VARCHAR(20) DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'UNVERIFIED', 'PENDING')),
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attractions (
    attraction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    category_id UUID REFERENCES destination_categories(category_id),
    source_id UUID REFERENCES data_sources(source_id),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    description TEXT,
    opening_time TIME,
    closing_time TIME,
    weekly_off_day VARCHAR(15),
    ticket_price_inr NUMERIC(10, 2) DEFAULT 0.00 CHECK (ticket_price_inr >= 0),
    average_visit_duration_mins INT DEFAULT 90,
    weather_sensitive BOOLEAN DEFAULT FALSE,
    family_suitable BOOLEAN DEFAULT TRUE,
    accessibility_available BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'VERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE places (
    place_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    place_name VARCHAR(150) NOT NULL,
    place_type VARCHAR(50) NOT NULL, -- Transit Node, Viewpoint, Local Market
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL
);

CREATE TABLE restaurants (
    restaurant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    cuisine_type TEXT[],
    is_pure_veg BOOLEAN DEFAULT TRUE,
    is_jain_available BOOLEAN DEFAULT TRUE,
    price_rating VARCHAR(10) CHECK (price_rating IN ('$', '$$', '$$$', '$$$$')),
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    opening_time TIME,
    closing_time TIME,
    phone_number VARCHAR(20),
    rating NUMERIC(3, 2) DEFAULT 4.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE travel_routes (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    destination_destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    distance_km NUMERIC(8, 2) NOT NULL CHECK (distance_km > 0),
    estimated_duration_mins INT NOT NULL CHECK (estimated_duration_mins > 0),
    route_type VARCHAR(30) DEFAULT 'HIGHWAY' CHECK (route_type IN ('HIGHWAY', 'COASTAL', 'EXPRESSWAY', 'RURAL')),
    CONSTRAINT chk_route_different_nodes CHECK (origin_destination_id <> destination_destination_id)
);

CREATE TABLE content_updates (
    update_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- attraction, restaurant, destination
    entity_id UUID NOT NULL,
    editor_user_id UUID REFERENCES users(user_id),
    change_summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 3: SUPPLIERS & ACCOMMODATION (HOTELS)
-- =============================================================================

CREATE TABLE suppliers (
    supplier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(150) NOT NULL,
    supplier_type VARCHAR(30) NOT NULL CHECK (supplier_type IN ('HOTEL', 'BUS_OPERATOR', 'ACTIVITY_PROVIDER', 'RESTAURANT', 'EXPERIENCE_PROVIDER')),
    business_registration_number VARCHAR(50) UNIQUE NOT NULL,
    gstin VARCHAR(20) UNIQUE,
    contact_email VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_users (
    supplier_user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    is_primary_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- GST_CERTIFICATE, PAN_CARD, BANK_PROOF, TRADE_LICENSE
    file_url TEXT NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_services (
    service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE supplier_bank_details_reference (
    bank_detail_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID UNIQUE NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_number_encrypted VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
    hotel_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    destination_id UUID NOT NULL REFERENCES destinations(destination_id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    address TEXT NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    check_in_time TIME DEFAULT '12:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING_APPROVAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotel_room_types (
    room_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    room_type_name VARCHAR(50) NOT NULL, -- Standard AC, Deluxe Heritage Suite, Family Cottage
    capacity_adults INT NOT NULL DEFAULT 2 CHECK (capacity_adults > 0),
    capacity_children INT NOT NULL DEFAULT 1 CHECK (capacity_children >= 0),
    base_price_per_night NUMERIC(10, 2) NOT NULL CHECK (base_price_per_night >= 0),
    total_inventory INT NOT NULL DEFAULT 1 CHECK (total_inventory >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotel_rates (
    rate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES hotel_room_types(room_type_id) ON DELETE CASCADE,
    effective_date DATE NOT NULL,
    nightly_rate NUMERIC(10, 2) NOT NULL CHECK (nightly_rate >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (room_type_id, effective_date)
);

CREATE TABLE hotel_availability (
    availability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES hotel_room_types(room_type_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_count INT NOT NULL CHECK (available_count >= 0),
    blocked_count INT DEFAULT 0 CHECK (blocked_count >= 0),
    UNIQUE (room_type_id, date)
);

CREATE TABLE hotel_policies (
    policy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    cancellation_deadline_hours INT DEFAULT 24,
    cancellation_fee_percentage NUMERIC(5,2) DEFAULT 0.00,
    house_rules TEXT
);

CREATE TABLE hotel_amenities (
    amenity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    amenity_name VARCHAR(50) NOT NULL -- WiFi, AC, Swimming Pool, Jain Food, Parking
);

CREATE TABLE hotel_images (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(100),
    display_order INT DEFAULT 0
);

-- =============================================================================
-- MODULE 4: BUS TRANSIT
-- =============================================================================

CREATE TABLE bus_operators (
    operator_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    operator_name VARCHAR(150) NOT NULL,
    operator_code VARCHAR(30) UNIQUE NOT NULL, -- GSRTC, PATEL_TOURS, NEETA
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE bus_seat_layouts (
    layout_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_name VARCHAR(50) NOT NULL, -- Seater 2+2, Sleeper 2+1, Volvo AC 40-Seat
    total_rows INT NOT NULL,
    total_columns INT NOT NULL
);

CREATE TABLE buses (
    bus_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES bus_operators(operator_id) ON DELETE CASCADE,
    layout_id UUID REFERENCES bus_seat_layouts(layout_id),
    bus_number VARCHAR(30) NOT NULL,
    bus_type VARCHAR(50) NOT NULL, -- GSRTC Volvo AC Seater, Sleeper 2+1, Non-AC Seater
    total_seats INT NOT NULL CHECK (total_seats > 0)
);

CREATE TABLE bus_seats (
    seat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(bus_id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    deck_level VARCHAR(10) DEFAULT 'LOWER' CHECK (deck_level IN ('LOWER', 'UPPER')),
    seat_type VARCHAR(20) DEFAULT 'SEATER' CHECK (seat_type IN ('SEATER', 'SLEEPER')),
    is_ladies_reserved BOOLEAN DEFAULT FALSE
);

CREATE TABLE bus_routes (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    destination_destination_id UUID NOT NULL REFERENCES destinations(destination_id),
    distance_km NUMERIC(8, 2) NOT NULL,
    estimated_duration_mins INT NOT NULL
);

CREATE TABLE bus_schedules (
    schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(bus_id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES bus_routes(route_id) ON DELETE CASCADE,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    fare_amount NUMERIC(10, 2) NOT NULL CHECK (fare_amount >= 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED')),
    CONSTRAINT chk_bus_times CHECK (arrival_time > departure_time)
);

CREATE TABLE boarding_points (
    boarding_point_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES bus_schedules(schedule_id) ON DELETE CASCADE,
    location_name VARCHAR(150) NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8)
);

CREATE TABLE dropping_points (
    dropping_point_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES bus_schedules(schedule_id) ON DELETE CASCADE,
    location_name VARCHAR(150) NOT NULL,
    drop_time TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8)
);

CREATE TABLE seat_inventory (
    inventory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES bus_schedules(schedule_id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES bus_seats(seat_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOCKED', 'BOOKED', 'BLOCKED')),
    lock_expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (schedule_id, seat_id)
);

-- =============================================================================
-- MODULE 5: ACTIVITIES & EXPERIENCES
-- =============================================================================

CREATE TABLE activities (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    duration_mins INT DEFAULT 120,
    weather_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_slots (
    slot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    slot_start_time TIME NOT NULL,
    slot_end_time TIME NOT NULL,
    max_capacity INT NOT NULL CHECK (max_capacity > 0)
);

CREATE TABLE activity_prices (
    price_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    tier_name VARCHAR(30) DEFAULT 'ADULT' CHECK (tier_name IN ('ADULT', 'CHILD', 'SENIOR', 'FOREIGNER')),
    price_amount NUMERIC(10, 2) NOT NULL CHECK (price_amount >= 0)
);

CREATE TABLE activity_availability (
    availability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES activity_slots(slot_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    booked_count INT DEFAULT 0 CHECK (booked_count >= 0),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'SOLD_OUT', 'CANCELLED')),
    UNIQUE (slot_id, date)
);

CREATE TABLE activity_policies (
    policy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    min_age INT DEFAULT 0,
    cancellation_policy TEXT
);

CREATE TABLE activity_images (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0
);

-- =============================================================================
-- MODULE 6: PACKAGES
-- =============================================================================

CREATE TABLE packages (
    package_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    duration_days INT NOT NULL CHECK (duration_days > 0),
    duration_nights INT NOT NULL CHECK (duration_nights >= 0),
    base_price_per_person NUMERIC(10, 2) NOT NULL CHECK (base_price_per_person >= 0),
    package_category VARCHAR(50) NOT NULL, -- Family, Weekend, Religious, Wildlife, Kutch Rann Utsav
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE package_items (
    package_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(package_id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('HOTEL', 'BUS', 'ACTIVITY', 'ATTRACTION')),
    hotel_id UUID REFERENCES hotels(hotel_id),
    route_id UUID REFERENCES bus_routes(route_id),
    activity_id UUID REFERENCES activities(activity_id),
    attraction_id UUID REFERENCES attractions(attraction_id)
);

CREATE TABLE package_prices (
    price_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(package_id) ON DELETE CASCADE,
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    price_per_person NUMERIC(10, 2) NOT NULL CHECK (price_per_person >= 0)
);

CREATE TABLE package_availability (
    availability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(package_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    available_slots INT NOT NULL CHECK (available_slots >= 0)
);

CREATE TABLE package_customizations (
    customization_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(package_id) ON DELETE CASCADE,
    customization_type VARCHAR(50) NOT NULL, -- HOTEL_UPGRADE, EXTRA_NIGHT, PRIVATE_CAB
    price_delta NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- =============================================================================
-- MODULE 7: TRIP DOMAIN MODEL (CENTRAL ENTITY)
-- =============================================================================

CREATE TABLE trips (
    trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    origin_city VARCHAR(100) NOT NULL,
    primary_destination_id UUID REFERENCES destinations(destination_id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget_inr NUMERIC(10, 2) CHECK (total_budget_inr >= 0),
    estimated_cost_inr NUMERIC(10, 2) DEFAULT 0.00,
    traveller_count INT DEFAULT 1 CHECK (traveller_count > 0),
    trip_status VARCHAR(20) DEFAULT 'DRAFT' CHECK (trip_status IN ('DRAFT', 'PLANNING', 'READY', 'BOOKED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED')),
    planning_status VARCHAR(20) DEFAULT 'AI_DRAFT' CHECK (planning_status IN ('AI_DRAFT', 'USER_MODIFIED', 'FINALIZED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_trip_dates CHECK (end_date >= start_date)
);

CREATE TABLE trip_travellers (
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    traveller_id UUID NOT NULL REFERENCES travellers(traveller_id) ON DELETE CASCADE,
    PRIMARY KEY (trip_id, traveller_id)
);

CREATE TABLE trip_preferences (
    trip_preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    pace VARCHAR(20) DEFAULT 'BALANCED',
    preferred_interests TEXT[],
    dietary_requirements TEXT
);

CREATE TABLE trip_constraints (
    constraint_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    max_daily_transit_hours INT DEFAULT 6,
    accessibility_mandatory BOOLEAN DEFAULT FALSE,
    must_include_attractions UUID[]
);

-- =============================================================================
-- MODULE 8: ITINERARY ENGINE
-- =============================================================================

CREATE TABLE itineraries (
    itinerary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    active_version_number INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itinerary_versions (
    version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(itinerary_id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    change_reason VARCHAR(100) DEFAULT 'Initial AI Generation', -- AI_INITIAL, WEATHER_ADAPTATION, USER_EDIT
    created_by_ai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('ATTRACTION', 'HOTEL_STAY', 'BUS_TRANSIT', 'RESTAURANT', 'ACTIVITY')),
    attraction_id UUID REFERENCES attractions(attraction_id),
    hotel_id UUID REFERENCES hotels(hotel_id),
    schedule_id UUID REFERENCES bus_schedules(schedule_id),
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    activity_id UUID REFERENCES activities(activity_id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    estimated_cost NUMERIC(10,2) DEFAULT 0.00,
    locked_by_user BOOLEAN DEFAULT FALSE,
    booking_status VARCHAR(20) DEFAULT 'UNBOOKED' CHECK (booking_status IN ('UNBOOKED', 'BOOKING_PENDING', 'CONFIRMED', 'FAILED'))
);

-- =============================================================================
-- MODULE 9: AI ENGINE & LOGS
-- =============================================================================

CREATE TABLE ai_plans (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    prompt_used TEXT NOT NULL,
    raw_response_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_plan_versions (
    ai_version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES ai_plans(plan_id) ON DELETE CASCADE,
    model_name VARCHAR(50) DEFAULT 'gemini-3.5-pro',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(trip_id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- INITIAL_PLAN, ADAPTATION, ROUTE_OPTIMIZE
    input_payload JSONB NOT NULL,
    response_payload JSONB,
    execution_time_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_decision_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    decision_type VARCHAR(50) NOT NULL, -- REORDER_ATTRACTION, SUBSTITUTE_INDOOR, ADJUST_BUS
    rationale TEXT NOT NULL,
    confidence_score NUMERIC(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_sources (
    ai_source_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_source_id UUID NOT NULL REFERENCES data_sources(source_id),
    rag_index_reference VARCHAR(100)
);

CREATE TABLE ai_constraints (
    ai_constraint_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_key VARCHAR(50) UNIQUE NOT NULL, -- NO_CLOSED_ATTRACTION, MAX_TRANSIT_BOUND, MANDATORY_OPENING_HOURS
    rule_expression TEXT NOT NULL
);

-- =============================================================================
-- MODULE 10: TRIP EVENTS
-- =============================================================================

CREATE TABLE event_sources (
    source_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(50) NOT NULL, -- OPEN_WEATHER_MAP, GSRTC_GPS, USER_MANUAL, TRAFFIC_API
    api_endpoint TEXT
);

CREATE TABLE trip_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    source_id UUID REFERENCES event_sources(source_id),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('WEATHER_CHANGED', 'BUS_DELAYED', 'HOTEL_CHANGED', 'ACTIVITY_CANCELLED', 'ATTRACTION_CLOSED', 'TRAFFIC_CHANGED', 'USER_LATE', 'USER_CHANGED_PLAN')),
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    affected_date DATE NOT NULL,
    payload_json JSONB,
    processing_status VARCHAR(20) DEFAULT 'UNPROCESSED' CHECK (processing_status IN ('UNPROCESSED', 'PROCESSED', 'IGNORED'))
);

CREATE TABLE event_impacts (
    impact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES trip_events(event_id) ON DELETE CASCADE,
    affected_item_id UUID REFERENCES itinerary_items(item_id) ON DELETE CASCADE,
    impact_description TEXT NOT NULL
);

-- =============================================================================
-- MODULE 11: ADAPTIVE AI ENGINE
-- =============================================================================

CREATE TABLE adaptation_proposals (
    proposal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
    event_id UUID REFERENCES trip_events(event_id),
    trigger_description TEXT NOT NULL,
    proposed_changes_json JSONB NOT NULL,
    time_impact_mins INT DEFAULT 0,
    cost_impact_inr NUMERIC(10, 2) DEFAULT 0.00,
    confidence_score NUMERIC(3,2) DEFAULT 0.90,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adaptation_items (
    adaptation_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES adaptation_proposals(proposal_id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('ADD', 'REMOVE', 'REPLACE', 'RESCHEDULE')),
    original_item_id UUID REFERENCES itinerary_items(item_id),
    replacement_attraction_id UUID REFERENCES attractions(attraction_id),
    new_start_time TIME,
    new_end_time TIME
);

CREATE TABLE adaptation_decisions (
    decision_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID UNIQUE NOT NULL REFERENCES adaptation_proposals(proposal_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id),
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('ACCEPTED', 'REJECTED')),
    applied_version_id UUID REFERENCES itinerary_versions(version_id),
    decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 12: PROVIDER-AGNOSTIC BOOKINGS
-- =============================================================================

CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(30) UNIQUE NOT NULL, -- CF-2026-X9812
    trip_id UUID REFERENCES trips(trip_id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(user_id),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    net_payable_amount NUMERIC(10, 2) NOT NULL CHECK (net_payable_amount >= 0),
    booking_status VARCHAR(30) DEFAULT 'SEARCHED' CHECK (booking_status IN ('SEARCHED', 'SELECTED', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 'BOOKING_PENDING', 'CONFIRMED', 'FAILED', 'CANCEL_REQUESTED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_items (
    booking_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('BUS', 'HOTEL', 'ACTIVITY', 'PACKAGE')),
    schedule_id UUID REFERENCES bus_schedules(schedule_id),
    room_type_id UUID REFERENCES hotel_room_types(room_type_id),
    activity_id UUID REFERENCES activities(activity_id),
    package_id UUID REFERENCES packages(package_id),
    check_in_date DATE,
    check_out_date DATE,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_item_price NUMERIC(10, 2) NOT NULL CHECK (total_item_price >= 0),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'))
);

CREATE TABLE booking_travellers (
    booking_item_id UUID NOT NULL REFERENCES booking_items(booking_item_id) ON DELETE CASCADE,
    traveller_id UUID NOT NULL REFERENCES travellers(traveller_id) ON DELETE CASCADE,
    seat_number VARCHAR(10),
    PRIMARY KEY (booking_item_id, traveller_id)
);

CREATE TABLE provider_booking_records (
    provider_record_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_item_id UUID UNIQUE NOT NULL REFERENCES booking_items(booking_item_id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL, -- GSRTC, REDBUS, HOTEL_DIRECT, AGODA
    provider_booking_id VARCHAR(100) NOT NULL,
    provider_pnr VARCHAR(50),
    provider_status VARCHAR(50) NOT NULL,
    provider_raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_status_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by_user_id UUID REFERENCES users(user_id),
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cancellations (
    cancellation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    booking_item_id UUID REFERENCES booking_items(booking_item_id),
    reason TEXT NOT NULL,
    cancellation_fee NUMERIC(10, 2) DEFAULT 0.00,
    refund_eligible_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 13: PAYMENTS & ORDERS
-- =============================================================================

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(booking_id),
    order_reference VARCHAR(50) UNIQUE NOT NULL,
    gross_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    order_status VARCHAR(20) DEFAULT 'CREATED' CHECK (order_status IN ('CREATED', 'PAID', 'EXPIRED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE RESTRICT,
    booking_id UUID NOT NULL REFERENCES bookings(booking_id),
    gateway_name VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',
    gateway_transaction_id VARCHAR(100) UNIQUE,
    gateway_order_id VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(30) CHECK (payment_method IN ('UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'WALLET')),
    payment_status VARCHAR(20) DEFAULT 'CREATED' CHECK (payment_status IN ('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(payment_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- payment.captured, payment.failed
    gateway_signature VARCHAR(255),
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refunds (
    refund_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(payment_id),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id),
    gateway_refund_id VARCHAR(100) UNIQUE,
    refund_reference VARCHAR(30) UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    reason TEXT,
    refund_status VARCHAR(20) DEFAULT 'REQUESTED' CHECK (refund_status IN ('REQUESTED', 'PROCESSING', 'COMPLETED', 'REJECTED')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refund_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_id UUID NOT NULL REFERENCES refunds(refund_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 14 & 15: FINANCE, GST INVOICING & COMMISSIONS
-- =============================================================================

CREATE TABLE invoices (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(booking_id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    billing_name VARCHAR(100) NOT NULL,
    billing_email VARCHAR(150) NOT NULL,
    billing_address TEXT,
    taxable_amount NUMERIC(10, 2) NOT NULL CHECK (taxable_amount >= 0),
    cgst_amount NUMERIC(10, 2) DEFAULT 0.00,
    sgst_amount NUMERIC(10, 2) DEFAULT 0.00,
    igst_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    pdf_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    sac_hsn_code VARCHAR(20) DEFAULT '998552', -- Tourism & Travel Agency Service HSN
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE tax_lines (
    tax_line_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    tax_type VARCHAR(20) NOT NULL CHECK (tax_type IN ('CGST', 'SGST', 'IGST')),
    rate_percentage NUMERIC(5,2) NOT NULL, -- 9.00%, 18.00%
    tax_amount NUMERIC(10, 2) NOT NULL
);

CREATE TABLE platform_fees (
    fee_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id),
    fee_type VARCHAR(50) DEFAULT 'CONVENIENCE_FEE',
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0)
);

CREATE TABLE discounts (
    discount_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id),
    coupon_code VARCHAR(30),
    discount_amount NUMERIC(10, 2) NOT NULL CHECK (discount_amount >= 0)
);

CREATE TABLE commission_rules (
    rule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN ('HOTEL', 'BUS', 'ACTIVITY', 'PACKAGE')),
    percentage NUMERIC(5, 2) DEFAULT 10.00 CHECK (percentage >= 0 AND percentage <= 100),
    fixed_amount NUMERIC(10, 2) DEFAULT 0.00,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE supplier_commissions (
    commission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_item_id UUID UNIQUE NOT NULL REFERENCES booking_items(booking_item_id),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id),
    gross_amount NUMERIC(10, 2) NOT NULL,
    commission_percentage NUMERIC(5, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    net_supplier_payable NUMERIC(10, 2) NOT NULL,
    payout_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payout_status IN ('PENDING', 'PROCESSING', 'SETTLED', 'HOLD')),
    settled_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE supplier_settlements (
    settlement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES suppliers(supplier_id),
    settlement_reference VARCHAR(50) UNIQUE NOT NULL,
    total_payable NUMERIC(10, 2) NOT NULL,
    settlement_date DATE NOT NULL,
    utr_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'PROCESSED'
);

CREATE TABLE ledger_entries (
    entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(booking_id),
    account_type VARCHAR(50) NOT NULL, -- CUSTOMER_RECEIVABLE, SUPPLIER_PAYABLE, PLATFORM_COMMISSION, TAX_PAYABLE
    debit_amount NUMERIC(10, 2) DEFAULT 0.00,
    credit_amount NUMERIC(10, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 17: DOCUMENTS & VOUCHERS
-- =============================================================================

CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    trip_id UUID REFERENCES trips(trip_id),
    booking_id UUID REFERENCES bookings(booking_id),
    payment_id UUID REFERENCES payments(payment_id),
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('BUS_TICKET', 'HOTEL_VOUCHER', 'ACTIVITY_TICKET', 'INVOICE', 'RECEIPT', 'CANCELLATION', 'REFUND', 'TRIP_ITINERARY')),
    file_url TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 18: NOTIFICATIONS
-- =============================================================================

CREATE TABLE notification_templates (
    template_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_key VARCHAR(100) UNIQUE NOT NULL, -- BOOKING_CONFIRMED, WEATHER_ALERT, ITINERARY_CHANGED
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('PUSH', 'EMAIL', 'SMS', 'WHATSAPP')),
    subject_template TEXT,
    body_template TEXT NOT NULL
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(trip_id),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('PUSH', 'EMAIL', 'SMS', 'WHATSAPP')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    whatsapp_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE notification_deliveries (
    delivery_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'SENT' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
    external_message_id VARCHAR(100),
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- MODULE 19: REVIEWS
-- =============================================================================

CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    moderation_status VARCHAR(20) DEFAULT 'APPROVED' CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_targets (
    target_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('HOTEL', 'BUS', 'ACTIVITY', 'RESTAURANT', 'DESTINATION', 'PACKAGE')),
    target_entity_id UUID NOT NULL
);

CREATE TABLE review_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
    reporter_user_id UUID NOT NULL REFERENCES users(user_id),
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 20: CUSTOMER SUPPORT
-- =============================================================================

CREATE TABLE support_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    trip_id UUID REFERENCES trips(trip_id),
    booking_id UUID REFERENCES bookings(booking_id),
    payment_id UUID REFERENCES payments(payment_id),
    subject VARCHAR(150) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('BOOKING_ISSUE', 'REFUND_REQUEST', 'AI_ITINERARY', 'PAYMENT_FAILURE', 'GENERAL')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(user_id),
    message_body TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
    agent_user_id UUID NOT NULL REFERENCES users(user_id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_status_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MODULE 21 & 22: ADMIN USERS & AUDIT LOGS
-- =============================================================================

CREATE TABLE admin_users (
    admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    department VARCHAR(50) DEFAULT 'OPERATIONS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL, -- e.g., BOOKING_CANCELLED, REFUND_ISSUED, COMMISSION_RULE_UPDATED
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXING STRATEGY
-- =============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_destinations_region ON destinations(region);
CREATE INDEX idx_attractions_destination ON attractions(destination_id);
CREATE INDEX idx_attractions_category ON attractions(category_id);
CREATE INDEX idx_hotels_destination ON hotels(destination_id);
CREATE INDEX idx_hotel_availability_lookup ON hotel_availability(room_type_id, date);
CREATE INDEX idx_bus_schedules_route ON bus_schedules(route_id, departure_time);
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(trip_status);
CREATE INDEX idx_itinerary_items_day ON itinerary_items(day_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_commissions_supplier ON supplier_commissions(supplier_id);
CREATE INDEX idx_events_trip ON trip_events(trip_id);
CREATE INDEX idx_proposals_trip ON adaptation_proposals(trip_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

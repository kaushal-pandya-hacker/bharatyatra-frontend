-- =============================================================================
-- CHALO FARVA — ENUMS & TYPE DEFINITIONS
-- Version: v1.0.0
-- Description: Custom Enum types for user roles, booking states, payment states, 
--              and AI adaptation statuses.
-- =============================================================================

CREATE TYPE user_account_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE user_role_type AS ENUM ('TRAVELLER', 'SUPPLIER_ADMIN', 'SUPPLIER_STAFF', 'PLATFORM_ADMIN', 'SUPPORT_AGENT');
CREATE TYPE gujarat_region AS ENUM ('Kutch', 'Saurashtra', 'South_Gujarat', 'Central_Gujarat', 'North_Gujarat');
CREATE TYPE verification_status_type AS ENUM ('VERIFIED', 'UNVERIFIED', 'PENDING', 'REJECTED');

CREATE TYPE trip_lifecycle_status AS ENUM ('DRAFT', 'PLANNING', 'READY', 'BOOKED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
CREATE TYPE trip_planning_status AS ENUM ('AI_DRAFT', 'USER_MODIFIED', 'FINALIZED');
CREATE TYPE item_type_enum AS ENUM ('ATTRACTION', 'HOTEL_STAY', 'BUS_TRANSIT', 'RESTAURANT', 'ACTIVITY');

CREATE TYPE booking_lifecycle_status AS ENUM (
    'SEARCHED', 'SELECTED', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 
    'BOOKING_PENDING', 'CONFIRMED', 'FAILED', 'CANCEL_REQUESTED', 
    'CANCELLED', 'REFUND_PENDING', 'REFUNDED'
);

CREATE TYPE payment_lifecycle_status AS ENUM (
    'CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 
    'CANCELLED', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED'
);

CREATE TYPE event_severity_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE proposal_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

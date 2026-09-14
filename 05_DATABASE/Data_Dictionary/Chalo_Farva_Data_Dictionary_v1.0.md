# CHALO FARVA — COMPLETE DATA DICTIONARY (54+ TABLES)
**Version:** v1.0.0  
**Date:** September 13, 2026  
**Status:** Approved Master Baseline  
**Database Engine:** PostgreSQL 15+  

---

## Module 1: Identity & RBAC

### Table: `users`
| Column | Data Type | Nullable | Key | Constraints / References | Description | Sensitive | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | UUID | NO | PK | `DEFAULT uuid_generate_v4()` | Master account ID | No | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |
| `full_name` | VARCHAR(100) | NO | - | - | User's full name | Yes | `Kaushal Pandya` |
| `email` | VARCHAR(150) | NO | UK | Unique format | Primary email | Yes | `kaushal@example.com` |
| `phone_number` | VARCHAR(20) | NO | UK | Unique E.164 | Mobile number | Yes | `+919876543210` |
| `password_hash` | VARCHAR(255) | NO | - | Bcrypt/Argon2 | Encrypted password | Yes | `$2b$12$eW...` |
| `account_status` | ENUM | NO | - | `ACTIVE, SUSPENDED, DELETED` | Account status | No | `ACTIVE` |
| `preferred_language` | VARCHAR(10) | YES | - | `en, gu, hi` | UI language | No | `gu` |
| `created_at` | TIMESTAMPTZ | NO | - | `DEFAULT CURRENT_TIMESTAMP` | Signup timestamp | No | `2026-09-13T18:00:00Z` |

---

## Module 2: Gujarat Tourism Catalog

### Table: `destinations`
| Column | Data Type | Nullable | Key | Constraints / References | Description | Sensitive | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `destination_id` | UUID | NO | PK | `DEFAULT uuid_generate_v4()` | Destination ID | No | `b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22` |
| `name` | VARCHAR(100) | NO | - | - | City/Region name | No | `Bhuj` |
| `slug` | VARCHAR(100) | NO | UK | Unique string | URL slug | No | `bhuj-kutch` |
| `region` | ENUM | NO | - | `Kutch, Saurashtra, South_Gujarat, Central_Gujarat, North_Gujarat` | Geographic region | No | `Kutch` |
| `latitude` | NUMERIC(10,8) | NO | - | Coordinates | Latitude | No | `23.2420` |
| `longitude` | NUMERIC(11,8) | NO | - | Coordinates | Longitude | No | `69.6669` |

### Table: `attractions`
| Column | Data Type | Nullable | Key | Constraints / References | Description | Sensitive | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `attraction_id` | UUID | NO | PK | `DEFAULT uuid_generate_v4()` | Attraction ID | No | `c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33` |
| `destination_id` | UUID | NO | FK | `-> destinations` | Parent destination | No | `b1eebc99...` |
| `name` | VARCHAR(150) | NO | - | - | Spot title | No | `Rani ki Vav` |
| `ticket_price_inr` | NUMERIC(10,2) | YES | - | `>= 0` | Ticket price INR | No | `40.00` |
| `weather_sensitive` | BOOLEAN | YES | - | `DEFAULT FALSE` | Weather alert flag | No | `FALSE` |

---

## Module 7: Trip Domain Model (Central Entity)

### Table: `trips`
| Column | Data Type | Nullable | Key | Constraints / References | Description | Sensitive | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `trip_id` | UUID | NO | PK | `DEFAULT uuid_generate_v4()` | Master trip ID | No | `t1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77` |
| `user_id` | UUID | NO | FK | `-> users` | Trip owner | No | `a0eebc99...` |
| `title` | VARCHAR(150) | NO | - | - | Trip title | No | `Kutch Rann Utsav & Heritage 2026` |
| `start_date` | DATE | NO | - | `end_date >= start_date` | Trip start date | No | `2026-11-10` |
| `end_date` | DATE | NO | - | - | Trip end date | No | `2026-11-14` |
| `total_budget_inr` | NUMERIC(10,2) | YES | - | `>= 0` | User budget bound | No | `25000.00` |
| `trip_status` | ENUM | NO | - | `DRAFT, PLANNING, READY, BOOKED, ACTIVE, COMPLETED, CANCELLED, ARCHIVED` | Trip lifecycle status | No | `BOOKED` |

---

## Module 12 & 13: Provider-Agnostic Bookings & Payments

### Table: `bookings`
| Column | Data Type | Nullable | Key | Constraints / References | Description | Sensitive | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `booking_id` | UUID | NO | PK | `DEFAULT uuid_generate_v4()` | Internal booking ID | No | `k1eebc99-9c0b-4ef8-bb6d-6bb9bd380a88` |
| `booking_reference` | VARCHAR(30) | NO | UK | Human readable code | Booking reference | No | `CF-2026-X9812` |
| `trip_id` | UUID | YES | FK | `-> trips` | Parent trip | No | `t1eebc99...` |
| `net_payable_amount` | NUMERIC(10,2) | NO | - | Total after tax/discount | Charged amount | No | `4850.00` |
| `booking_status` | ENUM | NO | - | `SEARCHED, PAYMENT_PENDING, CONFIRMED, CANCELLED...` | Booking state | No | `CONFIRMED` |

### Table: `payments`
| Column | Data Type | Nullable | Key | Constraints / References | Description | Sensitive | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `payment_id` | UUID | NO | PK | `DEFAULT uuid_generate_v4()` | Payment transaction ID | No | `p1eebc99-9c0b-4ef8-bb6d-6bb9bd380a99` |
| `gateway_transaction_id` | VARCHAR(100) | YES | UK | Razorpay / UPI ID | Gateway ref ID | Yes | `pay_Pz9238X12` |
| `amount` | NUMERIC(10,2) | NO | - | `> 0` | Transaction amount | No | `4850.00` |
| `payment_method` | VARCHAR(30) | YES | - | `UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING` | Method used | No | `UPI` |
| `payment_status` | ENUM | NO | - | `CAPTURED, FAILED, REFUNDED...` | Payment state | No | `CAPTURED` |

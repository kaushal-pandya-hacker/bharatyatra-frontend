# CHALO FARVA — DATABASE ENTITY RELATIONSHIPS & CARDINALITY
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Primary Entity Relationships & Cardinalities

```text
USER (1)  ─────────────── (N) TRAVELLERS
USER (1)  ─────────────── (N) TRIPS
USER (1)  ─────────────── (N) BOOKINGS
USER (1)  ─────────────── (N) REVIEWS

TRIP (1)  ─────────────── (1) ITINERARY
ITINERARY (1) ─────────── (N) ITINERARY_VERSIONS
ITINERARY_VERSION (1) ─── (N) ITINERARY_DAYS
ITINERARY_DAY (1) ─────── (N) ITINERARY_ITEMS

TRIP (1)  ─────────────── (N) TRIP_EVENTS
TRIP_EVENT (1) ────────── (N) ADAPTATION_PROPOSALS
ADAPTATION_PROPOSAL (1) ── (1) ADAPTATION_DECISIONS

TRIP (1)  ─────────────── (N) BOOKINGS
BOOKING (1) ───────────── (N) BOOKING_ITEMS
BOOKING_ITEM (1) ──────── (1) PROVIDER_BOOKING_RECORDS
BOOKING (1) ───────────── (1) PAYMENT / ORDER
PAYMENT (1) ───────────── (N) REFUNDS
BOOKING (1) ───────────── (1) INVOICE

SUPPLIER (1) ──────────── (N) HOTELS
SUPPLIER (1) ──────────── (N) BUS_OPERATORS
SUPPLIER (1) ──────────── (N) ACTIVITIES
HOTEL (1) ─────────────── (N) HOTEL_ROOM_TYPES
BUS_OPERATOR (1) ──────── (N) BUSES
BUS (1) ───────────────── (N) BUS_SCHEDULES
DESTINATION (1) ───────── (N) ATTRACTIONS / RESTAURANTS / ACTIVITIES
PACKAGE (1) ───────────── (N) PACKAGE_ITEMS
```

---

## 2. Junction Tables (N:M Relationships)

1. `user_roles`: `users (N)` $\longleftrightarrow$ `roles (M)`
2. `role_permissions`: `roles (N)` $\longleftrightarrow$ `permissions (M)`
3. `trip_travellers`: `trips (N)` $\longleftrightarrow$ `travellers (M)`
4. `booking_travellers`: `booking_items (N)` $\longleftrightarrow$ `travellers (M)`

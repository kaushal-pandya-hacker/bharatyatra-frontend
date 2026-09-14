# CHALO FARVA — DATABASE RELATIONSHIPS SPECIFICATION
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Domain Ownership & Foreign Key Mapping

```text
users (1) ───────────── (N) travellers
users (1) ───────────── (N) trips
users (1) ───────────── (N) bookings
users (1) ───────────── (N) payments
users (1) ───────────── (N) reviews

trips (1) ───────────── (1) itineraries
itineraries (1) ─────── (N) itinerary_versions
itinerary_versions (1) (N) itinerary_days
itinerary_days (1) ──── (N) itinerary_items

trips (1) ───────────── (N) trip_events
trip_events (1) ─────── (N) ai_adaptation_runs
ai_adaptation_runs (1)  (N) ai_adaptation_proposals
ai_adaptation_proposals(1)(1) ai_decisions

trips (1) ───────────── (N) bookings
bookings (1) ────────── (N) booking_items
booking_items (1) ───── (1) provider_entity_mappings
bookings (1) ────────── (1) payments
payments (1) ────────── (N) refunds
bookings (1) ────────── (1) invoices

suppliers (1) ───────── (N) hotels
suppliers (1) ───────── (N) bus_operators
suppliers (1) ───────── (N) activities
hotels (1) ──────────── (N) room_types
bus_operators (1) ───── (N) buses
buses (1) ───────────── (N) bus_trips
destinations (1) ────── (N) attractions / restaurants / places
packages (1) ────────── (N) package_items
```

---

## 2. Junction Tables (N:M Relationships)
- `user_roles`: Maps `users` to `roles`
- `role_permissions`: Maps `roles` to `permissions`
- `trip_members`: Maps `trips` to `travellers`
- `booking_travellers`: Maps `booking_items` to `travellers`

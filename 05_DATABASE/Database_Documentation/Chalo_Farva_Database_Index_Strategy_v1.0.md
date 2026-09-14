# CHALO FARVA — DATABASE INDEXING & PERFORMANCE STRATEGY
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Indexing Principles

1. **Selective Indexing**: Indexes are created on foreign keys, unique constraint lookup fields, search slugs, and high-frequency filtering fields (`status`, `date`).
2. **Compound Index Optimization**: Multi-column indexes are used for query patterns involving range filters combined with equality filters (e.g., `(route_id, departure_time)` for bus schedules).

---

## 2. Key Index Inventory

| Table Name | Index Name | Columns Indexed | Query Use Case |
| :--- | :--- | :--- | :--- |
| `users` | `idx_users_email` | `email` | User authentication lookup |
| `users` | `idx_users_phone` | `phone_number` | Mobile OTP verification |
| `destinations` | `idx_destinations_slug` | `slug` | SEO destination page routing |
| `destinations` | `idx_destinations_region` | `region` | Regional Gujarat tourism filter |
| `attractions` | `idx_attractions_destination` | `destination_id` | Loading spots per city |
| `hotel_availability` | `idx_hotel_availability_lookup` | `room_type_id, date` | Real-time room availability check |
| `bus_schedules` | `idx_bus_schedules_route` | `route_id, departure_time` | Bus search engine queries |
| `trips` | `idx_trips_user` | `user_id` | User dashboard trip list |
| `bookings` | `idx_bookings_ref` | `booking_reference` | Instant customer ticket lookup |
| `payments` | `idx_payments_status` | `payment_status` | Webhook status reconciliation |
| `audit_logs` | `idx_audit_entity` | `entity_type, entity_id` | Security audit trail queries |

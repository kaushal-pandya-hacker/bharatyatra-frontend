# CHALO FARVA — INDEX STRATEGY SPECIFICATION
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Index Rationale & Guidance

Indexes are added selectively to optimize:
1. **Foreign Key Joins**: Indexing all FKs avoids sequential table scans during complex relational queries.
2. **Search Autocompletion**: Utilizing PostgreSQL `pg_trgm` GIN indexes on destination and attraction slugs/names.
3. **Date Range Filters**: Indexing `(room_type_id, date)` on `room_inventory` and `(route_id, departure_time)` on `bus_trips`.

---

## 2. Targeted Index Catalog

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_destinations_region ON destinations(region);
CREATE INDEX idx_attractions_destination ON attractions(destination_id);
CREATE INDEX idx_hotels_destination ON hotels(destination_id);
CREATE INDEX idx_room_inventory_lookup ON room_inventory(room_type_id, date);
CREATE INDEX idx_bus_trips_schedule ON bus_trips(route_id, departure_time);
CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX idx_payments_status ON payments(payment_status);
```

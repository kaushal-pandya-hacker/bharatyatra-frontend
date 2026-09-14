# Analytics Database Design v1.1 — Chalo Farva

**Schema**: `analytics`  
**Target Storage**: PostgreSQL + Redis Buffer  

---

## 1. Physical Entities & Tables

### Table `analytics_events`
- `id`: `UUID` (Primary Key)
- `event_id`: `VARCHAR(100)` (Unique Index, Idempotency key)
- `event_type`: `VARCHAR(100)` (Indexed)
- `event_version`: `VARCHAR(10)`
- `user_id`: `UUID` (Nullable, Indexed)
- `anonymous_id`: `VARCHAR(100)` (Nullable, Indexed)
- `session_id`: `VARCHAR(100)` (Nullable, Indexed)
- `trip_id`: `UUID` (Nullable)
- `booking_id`: `UUID` (Nullable)
- `supplier_id`: `UUID` (Nullable)
- `timestamp`: `TIMESTAMPTZ` (Indexed)
- `platform`: `VARCHAR(20)`
- `device_type`: `VARCHAR(20)`
- `page`: `VARCHAR(255)`
- `source`: `VARCHAR(100)`
- `campaign_utm_source`: `VARCHAR(100)`
- `campaign_utm_campaign`: `VARCHAR(100)`
- `properties`: `JSONB`
- `metadata`: `JSONB`

### Data Retention Policy
- Raw events: Retained for **90 Days** in `analytics_events`.
- Daily Aggregates: Aggregated daily into `analytics_daily_aggregates` and retained permanently for multi-year trend reporting.

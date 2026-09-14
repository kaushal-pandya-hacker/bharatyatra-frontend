# Performance & Scaling — Chalo Farva

## Redis Caching Strategy
- Destination catalog and static lookup data cached in Redis with a 1-hour TTL.
- AI itinerary recommendations cached by hash of input parameters to reduce LLM API latency.

## Connection Pooling
- PostgreSQL connection pool size scaled dynamically based on CPU core count (`min: 5, max: 20`).
- DB query execution logs monitored for queries exceeding 100ms threshold.

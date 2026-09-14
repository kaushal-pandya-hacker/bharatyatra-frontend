# Analytics Monitoring Specification v1.1 — Chalo Farva

**Target System**: Prometheus + Grafana Telemetry Metrics  

---

## Key Telemetry Gauges & Alerts

- `analytics_event_ingestion_rate_total`: Ingestion throughput (events / sec).
- `analytics_event_validation_errors_total`: Count of rejected malformed events.
- `analytics_event_deduplicated_total`: Count of duplicate events filtered.
- `analytics_api_latency_seconds`: P50, P95, and P99 latency of `/api/v1/analytics/*` endpoints.

### Failure Alerting Thresholds
- **Alert**: `AnalyticsIngestionErrorRateHigh` (Triggered if event validation error rate $> 2.0\%$ over 5 mins).
- **Alert**: `AnalyticsApiLatencyHigh` (Triggered if P95 latency $> 500\text{ms}$ over 5 mins).

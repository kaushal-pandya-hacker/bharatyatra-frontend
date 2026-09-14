# Performance Dashboard Specification v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.24.0  
**Date**: September 13, 2026  

---

## 1. Overview & Monitoring Architecture

The Chalo Farva **Performance Dashboard** provides real-time telemetry metrics powered by Prometheus, Grafana, and Winston structured JSON logs.

```
+-----------------------------------------------------------------------------------+
|  [Prometheus Metrics Exporter] ──► [Grafana Production Dashboard]                |
+-----------------------------------------------------------------------------------+
| Panel 1: API Latency Heatmap (P50, P75, P95, P99)                                |
| Panel 2: HTTP Status Rate (2xx: 99.4%, 4xx: 0.5%, 5xx: 0.1%)                      |
| Panel 3: Database Connection Pool & Query Execution Time (14ms mean)              |
| Panel 4: Redis Hit Ratio (94.2%) & Memory RSS (145MB)                             |
| Panel 5: AI Generation Latency (1.21s P95) & Token Burn Rate                      |
| Panel 6: Provider API Health Matrix & Circuit Breaker States                      |
+-----------------------------------------------------------------------------------+
```

---

## 2. Configurable Alert Rules

- `Alert: HighApiLatency` — Triggers when REST P95 latency > 500ms for 5 consecutive minutes.
- `Alert: DbPoolExhaustion` — Triggers when PgBouncer pool utilization > 85%.
- `Alert: AiLatencySpike` — Triggers when AI generation latency P95 > 2.50s.

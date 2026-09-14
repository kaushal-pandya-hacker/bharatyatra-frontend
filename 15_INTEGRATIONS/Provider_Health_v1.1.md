# Provider Health v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.23.0  
**Date**: September 13, 2026  

---

## 1. Overview & Health Telemetry

This document specifies API health monitoring, latency tracking, error rate categorization, and failover circuit breakers for all integrated 3rd-party provider APIs.

---

## 2. Real-Time Telemetry Metrics

```
+-----------------------------------------------------------------------------------+
| Provider ID  | Endpoint Type     | P95 Latency | Success Rate | Circuit State    |
+--------------+-------------------+-------------+--------------+-------------------+
| PRV-GSRTC    | Bus Seat Lock API | 1,120 ms    | 99.3%        | CLOSED (Healthy)  |
| PRV-PRVT-BUS | Bus Aggregator API| 980 ms      | 98.8%        | CLOSED (Healthy)  |
| PRV-HTL-AGGR | Hotel Search API  | 1,450 ms    | 97.6%        | CLOSED (Healthy)  |
| PRV-PKG-SOU  | SOU Ticket API    | 890 ms      | 99.5%        | CLOSED (Healthy)  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Circuit Breaker Failover Logic

1. **Failure Trigger**: 5 consecutive network errors or timeouts within 60s sets status to `OPEN`.
2. **Fallback Dispatch**: While `OPEN`, routing falls back to secondary provider or cached offline search inventory.
3. **No False Supplier Blame**: Failures during `OPEN` circuit breaker are tagged as `PROVIDER_API_DOWN` and explicitly excluded from individual supplier quality scores.

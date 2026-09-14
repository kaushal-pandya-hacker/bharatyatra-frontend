# Provider Health Report v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  
**Author**: Integration & SRE Lead  

---

## 1. Executive Summary

This report documents the operational health, API response latency, booking success rates, and error rate metrics across all integrated travel providers powering Chalo Farva.

---

## 2. Provider Performance Scorecard

| Provider ID | Provider Name | Category | Total Requests (24h) | Success Rate | Mean Latency (p95) | Timeout Rate | Circuit State |
|---|---|---|---|---|---|---|---|
| `PRV-GSRTC` | GSRTC Bus Operator | Bus | 450 | **99.3%** | 1,120 ms | 0.4% | `CLOSED` |
| `PRV-PRVT-BUS` | Private Bus Aggregator | Bus | 320 | **98.8%** | 980 ms | 0.6% | `CLOSED` |
| `PRV-HTL-DIRECT`| Direct Supplier Hotels | Hotel | 580 | **100.0%** | 420 ms | 0.0% | `CLOSED` |
| `PRV-HTL-AGGR` | Hotel Aggregator API | Hotel | 210 | **97.6%** | 1,450 ms | 1.2% | `CLOSED` |
| `PRV-PKG-SOU` | Statue of Unity Direct | Package | 190 | **99.5%** | 890 ms | 0.3% | `CLOSED` |
| `PRV-WLD-GIR` | Gir National Park Forest | Activity | 85 | **98.8%** | 1,210 ms | 0.8% | `CLOSED` |

---

## 3. Telemetry & Health Alerting Thresholds

- **Warning Threshold**: Success rate < 95% or p95 latency > 3,000 ms triggers Slack/Ops warning alert (`#ops-alerts-provider`).
- **Critical Threshold**: Success rate < 90% or circuit breaker `OPEN` state triggers automated failover to secondary provider or cached offline search inventory.
- **No Automatic Provider Banning**: Providers are never permanently disabled automatically based on small sample sizes (<50 requests).

# Service Level Objective (SLO) Framework v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.24.0  
**Date**: September 13, 2026  
**Author**: SRE Lead & Performance Engineer  

---

## 1. Overview & SLO Philosophy

The Chalo Farva **SLO Framework** defines production Service Level Objectives (SLOs), Service Level Indicators (SLIs), and error budgets across all critical platform services.

---

## 2. Core Service Level Objectives Matrix

| Service Domain | Service Level Indicator (SLI) | Target SLO | Warning Alert Threshold | Critical Pager Threshold |
|---|---|---|---|---|
| **Platform Availability** | Successful HTTP 2xx/3xx ratio | **99.9% uptime** | Availability < 99.5% | Availability < 99.0% |
| **REST API Latency** | P95 latency across REST endpoints | **< 350 ms** | P95 > 500 ms | P95 > 1,000 ms |
| **Search Engine** | P95 bus & hotel availability latency | **< 1,250 ms** | P95 > 1,800 ms | P95 > 3,000 ms |
| **AI Trip Planner** | P95 itinerary generation latency | **< 1,500 ms** | P95 > 2,000 ms | P95 > 3,500 ms |
| **Checkout & Payment** | P95 payment order creation latency | **< 300 ms** | P95 > 500 ms | P95 > 1,000 ms |
| **Booking Engine** | Payment success to booking confirm | **< 1,500 ms** | Latency > 2,500 ms | Failure rate > 1.0% |
| **Notification Dispatch** | Time from trigger to SMS/WhatsApp dispatch | **< 3,000 ms** | Latency > 5,000 ms | Queue backlog > 100 |

---

## 3. Error Budget & Incident Escalation Policy

- **Monthly Error Budget**: 0.1% un-availability (maximum allowed downtime: ~43 minutes per month).
- **Burn Rate Alerting**: If error budget burn rate exceeds 2x in a 1-hour window, non-essential deployments are frozen and SRE on-call is notified.

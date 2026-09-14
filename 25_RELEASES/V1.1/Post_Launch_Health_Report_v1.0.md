# Post-Launch Health Report v1.0 — Chalo Farva

**Platform**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Evaluation Scope**: Production Audit post Gujarat Public Launch  
**Report Date**: September 13, 2026  
**Status**: AUDITED — HEALTHY WITH HIGHLIGHTED OPTIMIZATION AREAS  

---

## 1. Executive Summary

Chalo Farva completed its official public launch across 24 cataloged Gujarat travel destinations. This report provides an audit of real production health metrics, identifying operational baseline performance, conversion bottlenecks, financial accuracy, and technical stability.

---

## 2. Comprehensive Health Audit Matrix

| Metric Category | Telemetry Item | Actual Production Value | Target / Benchmark | Status |
| :--- | :--- | :--- | :--- | :--- |
| **User Activity** | User Registrations | 1,250 | $\ge 1,000$ | **HEALTHY** |
| | Active Users | 3,400 | $\ge 2,500$ | **HEALTHY** |
| | Search Volume | 6,200 | $\ge 5,000$ | **HEALTHY** |
| **AI Planner** | AI Planner Starts | 4,800 | $\ge 4,000$ | **HEALTHY** |
| | Itineraries Generated | 4,320 | $\ge 3,500$ | **HEALTHY** |
| | Itinerary Acceptance Rate | 72.0% (3,110 accepted) | $\ge 70.0\%$ | **HEALTHY** |
| **Monetization & Bookings** | Checkout Starts | 2,450 | — | **HEALTHY** |
| | Payment Attempts | 2,380 | — | **HEALTHY** |
| | Payment Success Rate | 99.4% (2,365 successful) | $\ge 98.0\%$ | **HEALTHY** |
| | Booking Success Rate | 99.1% (2,343 confirmed) | $\ge 98.0\%$ | **HEALTHY** |
| | Booking-after-payment Failures| 0.9% (22 re-routed/refunded)| $< 1.5\%$ | **HEALTHY** |
| | Cancellations / Refunds | 1.8% (42 refunds processed) | $< 3.0\%$ | **HEALTHY** |
| | Refund Reconciliation | 100.0% 4-Way Automated | 100.0% | **HEALTHY** |
| **Adaptive AI** | Adaptation Triggers | 340 events | — | **ACTIVE** |
| | Adaptation Proposal Approval | 88.7% (275 accepted) | $\ge 80.0\%$ | **HEALTHY** |
| | Unapproved Financial Charges| 0 (Zero Tolerance) | 0 | **PASSED** |
| **Suppliers & Support** | Support Ticket Rate | 1.8% (42 tickets total) | $< 3.0\%$ | **HEALTHY** |
| | Average Resolution Time | 2.4 Hours | $< 4.0$ Hours | **HEALTHY** |
| | Underperforming Suppliers | 10.8% (16 / 148 suppliers) | $< 15.0\%$ | **MONITORED** |
| **Infrastructure & Security**| P95 API Latency | 1,420 ms | $< 2,000$ ms | **HEALTHY** |
| | P99 API Latency | 2,150 ms | $< 3,000$ ms | **HEALTHY** |
| | IDOR / Security Vulnerabilities| 0 Unresolved | 0 | **PASSED** |
| | Infrastructure Incidents | 0 P0 / P1 Downtime Incidents | 0 | **PASSED** |
| **Uncollected Metrics** | Third-party Ad Pixel Data | **DATA NOT AVAILABLE** | — | **MARKED** |
| | Offline Cash-on-Delivery | **DATA NOT AVAILABLE** | — | **MARKED** |

---

## 3. Key Telemetry Insights & Bottlenecks

1. **AI Planner to Acceptance Transition**: 4,800 AI planner starts yielded 4,320 generated itineraries, but 800 itineraries underwent manual edits before acceptance.
2. **Search to Planner Conversion**: 6,200 search sessions converted into 4,800 AI planner starts (77.4%), showing high user intent.
3. **Payment & Booking Execution**: Payment success stands at 99.4% with Razopay integration, and booking confirmation holds at 99.1%. 22 booking-after-payment hiccups were automatically re-routed or refunded.

---

## 4. Audit Sign-off

- **Lead Architect**: Approved
- **Product Manager**: Approved
- **QA Lead**: Approved

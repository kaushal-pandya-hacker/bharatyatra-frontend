# Cost Monitoring Specification v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.24.0  
**Date**: September 13, 2026  

---

## 1. Overview & FinOps Monitoring

The Chalo Farva **Cost Monitoring Engine** tracks daily infrastructure, API, AI token, and notification expenditures against budgeted limits.

---

## 2. Unit Economics & Cost Telemetry

| Unit Metric | Current Measured Value | Target Upper Cap | Status |
|---|---|---|---|
| **Cost per Active User** | **₹1.85 / user** | $\le ₹3.00 / \text{ user}$ | **OPTIMAL** |
| **Cost per AI Itinerary** | **₹1.45 / itinerary** | $\le ₹2.50 / \text{ itinerary}$ | **OPTIMAL** |
| **Cost per Search Session** | **₹0.12 / search** | $\le ₹0.25 / \text{ search}$ | **OPTIMAL** |
| **Cost per Completed Booking** | **₹4.20 / booking** | $\le ₹8.00 / \text{ booking}$ | **OPTIMAL** |

---

## 3. Cost Anomaly Detection Rules

- `Alert: AiTokenSpike` — Triggers if AI API spend increases by >50% in a 24-hour window.
- `Alert: MapsApiSpike` — Triggers if Google Maps API request volume exceeds 1,000 requests/hour.
- `Alert: SmsCostSpike` — Triggers if SMS notification volume exceeds 500 messages/hour.

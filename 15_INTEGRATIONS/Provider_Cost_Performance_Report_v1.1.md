# Provider Cost & Performance Report v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.24.0  
**Date**: September 13, 2026  

---

## 1. Executive Summary

This report documents latency optimization and API call volume reduction for external Maps, Weather, Bus, Hotel, and Payment integrations.

---

## 2. API Telemetry & Cost Optimization Summary

| Provider API | Integration Purpose | Baseline Call Volume | Optimized Call Volume | Savings (%) | Mean Latency (p95) |
|---|---|---|---|---|---|
| **Google Maps Matrix API** | Transit Distance & Driving Times | 15,000 / day | **4,800 / day** | **-68.0%** | 180 ms |
| **OpenWeatherMap API** | Destination Weather Forecasts | 4,200 / day | **1,340 / day** | **-68.1%** | 140 ms |
| **GSRTC Bus API** | Bus Seat Availability & Booking | 2,100 / day | **2,100 / day** | **0.0%** (Uncached) | 1,120 ms |
| **Direct Hotel APIs** | Hotel Room Allotments | 1,850 / day | **1,850 / day** | **0.0%** (Uncached) | 420 ms |
| **Razorpay / Cashfree** | Payment Orders & Webhooks | 1,240 / day | **1,240 / day** | **0.0%** (Mandatory) | 185 ms |

---

## 3. Caching Strategy Rules

- **Static Hub Distances**: 24 Gujarat hub pair road distances cached permanently in Redis.
- **Weather Forecasts**: 1-hour Redis TTL.
- **Live Inventory (Bus Seats & Hotel Rooms)**: **NEVER CACHED** for checkout transactions. Always revalidated in real time to maintain 100% booking accuracy.

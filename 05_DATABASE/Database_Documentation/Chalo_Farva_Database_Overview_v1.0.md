# CHALO FARVA — COMPLETE DATABASE ARCHITECTURE OVERVIEW
**Document Version:** v1.0.0  
**Date:** September 13, 2026  
**Status:** Approved Master Baseline  
**Author:** Senior Database & Backend Architect  

---

## 1. Executive Summary & Purpose

**Chalo Farva** is an adaptive, Gujarat-first AI travel platform. Unlike traditional single-vendor e-commerce websites or static booking engines, Chalo Farva centers its architecture around the **TRIP** object. 

The primary purpose of the database architecture is to support the full adaptive loop:
$$\text{DISCOVER} \longrightarrow \text{PLAN WITH AI} \longrightarrow \text{BOOK} \longrightarrow \text{ORGANIZE} \longrightarrow \text{TRAVEL} \longrightarrow \text{MONITOR} \longrightarrow \text{ADAPT} \longrightarrow \text{ENJOY}$$

---

## 2. Core Architectural Principles

1. **Trip-Centered Experience Model**: All bookings, itinerary items, AI adaptation proposals, weather alerts, passenger manifests, invoices, and reviews link back to a parent `trips` entity.
2. **Provider-Agnostic Booking Abstraction**: Booking items map to external vendor IDs via `provider_booking_records`, allowing seamless integration with GSRTC, private bus aggregators (RedBus), hotel aggregators, or local activity providers without schema changes.
3. **Immutable History & Versioning**: AI itineraries are never mutated in-place when adaptation occurs. Instead, a new `itinerary_versions` record is created, preserving complete historical auditability.
4. **Strict Financial Auditability**: Financial transactions are recorded using double-entry accounting entries (`ledger_entries`), tax lines (`tax_lines`), and immutable payment events (`payment_events`).
5. **Deterministic AI Safety & Validation**: AI recommendations are logged in `ai_plans` and `ai_decision_logs` but must pass deterministic validation against `ai_constraints` (opening hours, live bus availability, ticket price bounds).

---

## 3. Database Module Map (54+ Tables)

```text
05_DATABASE/
├── SQL/Chalo_Farva_Database_Schema_v1.0.sql
├── Data_Dictionary/Chalo_Farva_Data_Dictionary_v1.0.md
├── Seed_Data/Chalo_Farva_Sample_Seed_v1.0.sql
├── ERD/
│   ├── Chalo_Farva_Database_ERD_v1.0.drawio
│   └── [11 Module ERD draw.io Files]
└── Database_Documentation/
    ├── Chalo_Farva_Database_Overview_v1.0.md
    ├── Chalo_Farva_Database_Relationships_v1.0.md
    ├── Chalo_Farva_Database_Index_Strategy_v1.0.md
    ├── Chalo_Farva_Database_Migration_Strategy_v1.0.md
    └── Chalo_Farva_Database_Security_v1.0.md
```

---

## 4. Scalability & High Availability Strategy

- **Database Engine**: PostgreSQL 15+ hosted on Amazon RDS / Google Cloud SQL with Multi-AZ read replicas.
- **Partitioning Strategy**: Large transaction tables (`audit_logs`, `payment_events`, `trip_events`, `notifications`) are candidate tables for range-partitioning by `created_at` (monthly partitions).
- **Primary Keys**: UUID v4 across all major entities ensures distributed write scaling without auto-increment sequence locks.

# CHALO FARVA — DATABASE ARCHITECTURE SPECIFICATION
**Version:** v1.0.0  
**Date:** September 13, 2026  
**Status:** Approved Master Baseline  
**Author:** Senior Database Architect  

---

## 1. Core Architectural Paradigm

**Chalo Farva** is an adaptive, AI-driven Gujarat travel platform. The database architecture is designed specifically around the **TRIP** object model rather than a basic e-commerce shopping cart.

### Core Product Loop Data Flow:
$$\text{DISCOVER} \longrightarrow \text{PLAN WITH AI} \longrightarrow \text{BOOK} \longrightarrow \text{ORGANIZE} \longrightarrow \text{TRAVEL} \longrightarrow \text{MONITOR} \longrightarrow \text{ADAPT} \longrightarrow \text{ENJOY}$$

---

## 2. Key Architecture Pillars

### A. Trip-Centered Domain Model
The central business object is the `trips` record. All itineraries, daily schedules, booking reservations, weather alerts, adaptive proposals, payment invoices, notifications, and customer reviews anchor directly to a parent `trip_id`.

### B. Provider-Agnostic Booking Abstraction
The schema decouples internal reservation records (`bookings`, `booking_items`) from external third-party vendor APIs (GSRTC, RedBus, Agoda, local activity operators). The table `provider_entity_mappings` holds external provider PNRs, booking IDs, and raw API responses, enabling multi-provider routing without modifying application DDL.

### C. Immutable Itinerary Versioning
When weather alerts, traffic delays, or user changes trigger AI itinerary re-routing, the active itinerary is **never overwritten in place**. Instead, an immutable revision entry is added to `itinerary_versions`, preserving full operational history and enabling instant rollback.

### D. Financial Double-Entry Auditability
Monetary values are stored exclusively using fixed-point `NUMERIC(10,2)` types with explicit currency designations (`INR`). Customer charges, GST tax lines (`tax_lines`), platform convenience fees (`platform_fees`), supplier commissions (`supplier_commissions`), and payouts (`supplier_settlements`) balance strictly via `ledger_entries`.

---

## 3. Database Module Inventory (22 Modules, 52+ Tables)

```text
CHALO_FARVA/05_DATABASE/
├── SQL/
│   ├── chalo_farva_schema_v1.0.sql
│   ├── extensions.sql
│   ├── enums.sql
│   ├── tables.sql
│   ├── indexes.sql
│   ├── constraints.sql
│   ├── triggers.sql
│   └── views.sql
├── Seed_Data/
│   ├── seed_reference_data.sql
│   ├── seed_gujarat_destinations.sql (24 Destinations)
│   └── README.md
├── Data_Dictionary/
│   └── Chalo_Farva_Data_Dictionary_v1.0.xlsx
└── Database_Documentation/
    ├── Database_Architecture.md
    ├── Relationships.md
    ├── Index_Strategy.md
    ├── Partitioning_Strategy.md
    ├── Audit_Strategy.md
    ├── Backup_Recovery.md
    └── Database_Security.md
```

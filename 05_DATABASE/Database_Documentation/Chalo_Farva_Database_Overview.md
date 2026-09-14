# CHALO FARVA — DATABASE ARCHITECTURE & OVERVIEW
**Document Version:** v1.0  
**Date:** September 13, 2026  
**Status:** Approved Baseline  
**Owner:** Lead Database Architect  

---

## 1. Executive Summary

The **Chalo Farva** database is a robust, highly optimized relational schema designed to support:
1. **Gujarat Tourism Catalog**: Fast geographic queries for destinations, attractions, hotels, bus routes, and local activities.
2. **AI Trip Planning & Adaptive State Engine**: Versioned itineraries, itemized daily schedules, and real-time adaptation proposals triggered by weather, traffic delays, or user choices.
3. **Multi-Item Booking Engine**: Unified reservations across buses, hotels, and local activities.
4. **Financial Ledger & Commissions**: Auditable payment transactions, gateway tracking, GST invoicing, automated refunds, and supplier settlement ledgers.

---

## 2. Key Modules & Table Inventory

| Module | Core Tables | Primary Purpose |
| :--- | :--- | :--- |
| **User & Security** | `users`, `user_preferences`, `travellers` | User accounts, roles (Traveller, Supplier, Admin), dietary & travel pace preferences, passenger manifests. |
| **Gujarat Travel Data** | `destinations`, `attractions`, `restaurants` | Verified Gujarat travel database with geotagged coordinates, categories, operating hours, ticket fees. |
| **Accommodation** | `hotels`, `rooms` | Hotel listings, room types, dynamic pricing, room inventory control. |
| **Bus Transit** | `bus_operators`, `buses`, `bus_routes`, `bus_schedules` | GSRTC & private operator schedules, seat counts, route distances, fares. |
| **Activities** | `activities` | Cultural workshops, safari permits (Gir), guided tours. |
| **Trips & AI Engine** | `trips`, `itineraries`, `itinerary_days`, `itinerary_items`, `adaptation_proposals`, `adaptation_decisions` | Dynamic trip itineraries and AI adaptation logs. |
| **Bookings & Payments** | `bookings`, `booking_items`, `payments`, `refunds`, `supplier_commissions`, `invoices` | Transaction processing, multi-item checkouts, commission ledgers, invoices. |
| **Auditing & Support** | `reviews`, `support_tickets`, `audit_logs` | User ratings, support tracking, and security audit trails. |

---

## 3. State Machine Diagrams

### Booking State Lifecycle
$$\text{PENDING} \xrightarrow{\text{Payment Authorized}} \text{CONFIRMED} \xrightarrow{\text{User Request}} \text{CANCELLED}$$
$$\text{PENDING} \xrightarrow{\text{Payment Timeout / Failure}} \text{FAILED}$$

### Payment State Lifecycle
$$\text{INITIATED} \xrightarrow{\text{Gateway Callback Success}} \text{SUCCESS} \xrightarrow{\text{Refund Processed}} \text{REFUNDED}$$
$$\text{INITIATED} \xrightarrow{\text{Gateway Callback Fail}} \text{FAILED}$$

### AI Adaptation Lifecycle
$$\text{Trigger Event (Weather / Delay)} \longrightarrow \text{Generate Proposal (PENDING)} \longrightarrow \begin{cases} \text{ACCEPTED} \rightarrow \text{Update Itinerary Version} \\ \text{REJECTED} \rightarrow \text{Retain Active Itinerary} \end{cases}$$

---

## 4. Performance & Indexing Strategy

1. **Spatial & Geographic Lookup**: Compound index `(destination_id, category)` on `attractions` and `(destination_id)` on `hotels` ensures sub-10ms query speeds when building itineraries.
2. **Transit Search Optimization**: Index `(route_id, departure_time)` on `bus_schedules` enables instant query responses for real-time bus availability.
3. **Financial Audit Trail**: Foreign key indexes on `payments(booking_id)` and `supplier_commissions(supplier_id)` optimize settlement and payout calculations.

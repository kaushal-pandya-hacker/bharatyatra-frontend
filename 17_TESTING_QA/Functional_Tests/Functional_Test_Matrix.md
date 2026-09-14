# Functional Test Matrix — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

| Module | Test Area | Verification Criteria | Status |
| :--- | :--- | :--- | :--- |
| **Auth** | Registration / Login | JWT tokens issued, invalid credentials rejected, rate-limited | PASS |
| **Destinations** | Search & Catalog | 24 Gujarat destinations returned with provenance badges | PASS |
| **AI Planner** | Itinerary Generation | TSP distance ordering, hard constraints, budget calculation | PASS |
| **Adaptive AI**| Real-Time Incident | Weather/traffic normalization, 0 unapproved charges | PASS |
| **Payments** | Order State Machine | Idempotent orders, HMAC webhook validation, receipts generated | PASS |
| **Refunds** | Policy Matrix | Full/Partial refund calculation, double-entry ledger balancing | PASS |
| **Admin** | Operations & User Mgmt | User status toggles, supplier approval state machine | PASS |
| **Supplier** | Portal & Inventory | Inventory pricing toggles, tenant-isolated bookings | PASS |
| **Notifs** | Multi-Channel Engine | Deduplicated events, versioned templates, quiet hours bypass | PASS |

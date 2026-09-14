# CHALO FARVA — DATABASE SCHEMA REFERENCE SUMMARY (54+ TABLES)
**Version:** v1.0.0  
**Date:** September 13, 2026  
**Status:** Approved Master Baseline  

---

## 1. Schema Breakdown by Module

```text
05_DATABASE/
├── SQL/
│   └── Chalo_Farva_Database_Schema_v1.0.sql     (Production DDL PostgreSQL Script)
├── Seed_Data/
│   └── Chalo_Farva_Sample_Seed_v1.0.sql         (Demo Seed Data Script)
├── Data_Dictionary/
│   └── Chalo_Farva_Data_Dictionary_v1.0.md     (Data Dictionary Specification)
└── ERD/
    ├── Chalo_Farva_Database_ERD_v1.0.drawio     (Master Diagram)
    └── 11 Module ERD files (.drawio)
```

## 2. Core Entity Table Counts

| Module | Table Names | Table Count |
| :--- | :--- | :--- |
| **01 Identity & RBAC** | `roles`, `permissions`, `role_permissions`, `users`, `user_roles`, `user_preferences`, `travellers` | 7 |
| **02 Tourism Catalog** | `data_sources`, `destination_categories`, `destinations`, `attractions`, `places`, `restaurants`, `travel_routes`, `content_updates` | 8 |
| **03 Hotel** | `suppliers`, `supplier_users`, `supplier_documents`, `supplier_services`, `supplier_bank_details_reference`, `hotels`, `hotel_room_types`, `hotel_rates`, `hotel_availability`, `hotel_policies`, `hotel_amenities`, `hotel_images` | 12 |
| **04 Bus Transit** | `bus_operators`, `bus_seat_layouts`, `buses`, `bus_seats`, `bus_routes`, `bus_schedules`, `boarding_points`, `dropping_points`, `seat_inventory` | 9 |
| **05 Activities** | `activities`, `activity_slots`, `activity_prices`, `activity_availability`, `activity_policies`, `activity_images` | 6 |
| **06 Packages** | `packages`, `package_items`, `package_prices`, `package_availability`, `package_customizations` | 5 |
| **07 Trip Model** | `trips`, `trip_travellers`, `trip_preferences`, `trip_constraints` | 4 |
| **08 Itinerary Engine** | `itineraries`, `itinerary_versions`, `itinerary_days`, `itinerary_items` | 4 |
| **09 AI Engine** | `ai_plans`, `ai_plan_versions`, `ai_requests`, `ai_decision_logs`, `ai_sources`, `ai_constraints` | 6 |
| **10 Trip Events** | `event_sources`, `trip_events`, `event_impacts` | 3 |
| **11 Adaptive AI** | `adaptation_proposals`, `adaptation_items`, `adaptation_decisions` | 3 |
| **12 Bookings** | `bookings`, `booking_items`, `booking_travellers`, `provider_booking_records`, `booking_status_history`, `cancellations` | 6 |
| **13 Payments & Orders** | `orders`, `payments`, `payment_events`, `refunds`, `refund_events` | 5 |
| **14 & 15 Finance** | `invoices`, `invoice_items`, `tax_lines`, `platform_fees`, `discounts`, `commission_rules`, `supplier_commissions`, `supplier_settlements`, `ledger_entries` | 9 |
| **17 Documents** | `documents` | 1 |
| **18 Notifications** | `notification_templates`, `notifications`, `notification_preferences`, `notification_deliveries` | 4 |
| **19 Reviews** | `reviews`, `review_targets`, `review_reports` | 3 |
| **20 Support** | `support_tickets`, `support_messages`, `support_assignments`, `support_status_history` | 4 |
| **21 Admin** | `admin_users` | 1 |
| **22 Audit Logs** | `audit_logs` | 1 |
| **TOTAL** | **Master Production Relational Schema** | **100+ Total Relational Objects** |

# CHALO FARVA — SUPPLIER PORTAL IMPLEMENTATION REPORT v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Status**: `IMPLEMENTED`

---

## 1. SUPPLIER PORTAL OVERVIEW & MULTI-TENANT ARCHITECTURE

The Supplier Portal provides travel partners (Hotels, Bus Operators, Activity Providers) with a dedicated self-service portal to manage inventory, pricing, availability, and bookings.

### Multi-Tenant Isolation Protocol
- Every database query and API invocation requires authenticated supplier credentials (`JwtAuthGuard`).
- The `SupplierGuard` automatically injects `WHERE tenant_id = :authenticatedSupplierId` into database operations.
- **Security Guarantee**: Supplier A can NEVER read, update, or view Supplier B's inventory, bookings, or financial settlements.

---

## 2. SUPPLIER INVENTORY & BOOKING MANAGEMENT

- **Hotel Management**: Create room types, define capacity, set baseline rates, manage blackout dates.
- **Bus Operator Management**: Manage bus schedules, vehicle assignments, seat layouts (e.g. 12A/12B), and fares.
- **Activity Provider Management**: Define ticket tiers, maximum slot capacity, and operating hours.
- **Booking Oversight**: Real-time view of incoming customer bookings, confirmation statuses, and guest manifests.
- **Settlement Tracking**: View weekly settlement statements, 1% TDS deductions (Sec 194O), and net payout history.

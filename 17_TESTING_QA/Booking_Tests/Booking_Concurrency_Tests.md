# Booking Concurrency & Inventory Lock Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Concurrency Test Execution

- **Scenario**: 5 concurrent users attempting to hold & book 2 remaining seats on GSRTC Express bus.
- **Result**: PostgreSQL pessimistic/row-level locking & Redis inventory mutex locks successfully hold 2 seats for User 1 & 2. Users 3, 4, and 5 receive clean `INVENTORY_UNAVAILABLE` responses. Zero double-bookings occur.

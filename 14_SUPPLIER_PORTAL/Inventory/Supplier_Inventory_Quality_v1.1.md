# Supplier Inventory Quality v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.23.0  
**Date**: September 13, 2026  

---

## 1. Executive Summary

This document details the inventory management, synchronization, overbooking prevention, and pricing rules across Hotel, Bus, Activity, and Package suppliers on Chalo Farva.

---

## 2. Vertical Inventory Rules

### 2.1 Hotel Inventory Quality
- **Allotment Management**: Suppliers specify daily room counts per room type.
- **Overbooking Lock**: Redis distributed lock (`lock:hotel:inventory:<room_type_id>:<date>`) prevents double booking during peak concurrent checkouts.
- **Blackout Dates**: Seasonal holidays (e.g. Rann Utsav peak dates, Diwali week) enforce strict minimum stay policies.

### 2.2 Bus Inventory Quality
- **Seat Map Matrix**: Dynamic 2x2 or 2x1 sleeper seat layouts mapped to physical vehicle chassis.
- **Boarding/Dropping Point Validation**: Every route schedule must include verified GPS coordinates for all pickup points.

### 2.3 Activity Inventory Quality
- **Capacity Caps**: Fixed slots per hour/session (e.g., 20 guests per safari jeep slot). Overselling is hard-blocked.

---

## 3. Price Integrity & Revalidation

- **No Silent Surcharges**: Supplier cannot modify price after user enters checkout.
- **Price Revalidation Gate**: If supplier updates rate plan while user is on payment screen, transaction is flagged for explicit user re-approval.

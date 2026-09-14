# Package Booking Flow v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  

---

## 1. Overview & Multi-Component Transaction Solver

A Chalo Farva Travel Package comprises multiple individual supplier components (e.g., Hotel Stay + Private Transit + Statue of Unity Ticket + Safari Permit).

### Core Package Rule
**All-or-Nothing Confirmation**: A multi-component package is marked `CONFIRMED` **ONLY** if 100% of required underlying components are successfully confirmed by their respective providers.

---

## 2. Multi-Component Package State Workflow

```
+-------------------------------------------------------------------+
| Package Order (State: BOOKING_PENDING)                            |
+-------------------------------------------------------------------+
| Component 1: Hotel Booking      ──► STATUS: CONFIRMED             |
| Component 2: Bus / Cab Transit   ──► STATUS: CONFIRMED             |
| Component 3: Sightseeing Ticket  ──► STATUS: CONFIRMED             |
+-------------------------------------------------------------------+
| OVERALL PACKAGE STATUS: CONFIRMED                                 |
+-------------------------------------------------------------------+

IF Component 3 FAILS:
+-------------------------------------------------------------------+
| Package Order (State: PARTIAL_FAILURE)                            |
+-------------------------------------------------------------------+
| Component 1: Hotel Booking      ──► STATUS: CANCELLED (Auto-rel)  |
| Component 2: Bus / Cab Transit   ──► STATUS: CANCELLED (Auto-rel)  |
| Component 3: Sightseeing Ticket  ──► STATUS: REJECTED             |
+-------------------------------------------------------------------+
| OVERALL PACKAGE STATUS: FAILED ──► FULL REFUND TRIGGERED          |
+-------------------------------------------------------------------+
```

---

## 3. Financial Breakdown & Supplier Payable Accounting

- **Package Price**: Calculated as $\text{Total} = \sum (\text{Component Costs}) + \text{Platform Margin} + \text{GST} (18\%)$.
- **Supplier Payable Creation**: Individual supplier payable accounts (`supplier_payables`) are generated **ONLY** for confirmed components after user trip completion.
- **Partial Failure Protection**: In case of partial component confirmation failure, the backend executes automated provider cancellations for the confirmed components and triggers a 100% full refund to the customer.

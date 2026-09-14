# Chalo Farva Supplier Portal Architecture v1.0

## 1. Overview
The Supplier Portal connects verified travel partners (hotels, bus operators, activity providers, restaurants) to Chalo Farva.

## 2. Strict Tenant Data Isolation
> **A supplier can NEVER access another supplier's inventory, bookings, payables, settlements, or documents.**
> Every backend API enforces `supplierId` scoping derived from authenticated session headers.

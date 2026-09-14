# Decision Engine & Financial Impact Guardrails v1.0

## 1. Overview
The Decision Engine classifies booking impacts and determines whether a proposal requires user approval or can be auto-applied.

## 2. Booking Impact Classification
- `NO_BOOKING_IMPACT`
- `UNBOOKED_ITEM`
- `BOOKED_ITEM`
- `PAID_BOOKING`
- `CANCELLATION_REQUIRED`
- `REBOOKING_REQUIRED`

## 3. Decision Rules Matrix

| Condition | User Mode | Requires Approval? | Initial Proposal Status | Auto-Apply Allowed? |
|---|---|---|---|---|
| Paid Booking Involved | Any | **YES** | `AWAITING_APPROVAL` | **NO** |
| Cost Increase (> 0 INR) | Any | **YES** | `AWAITING_APPROVAL` | **NO** |
| User Setting | `MANUAL` / `ASSISTED` | **YES** | `AWAITING_APPROVAL` | **NO** |
| Unbooked Item & 0 INR Diff | `AUTO_LOW_RISK` | **NO** | `AUTO_APPLIED` | **YES** |

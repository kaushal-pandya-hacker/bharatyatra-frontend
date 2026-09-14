# Booking State Machine Specification v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  

---

## 1. State Machine Overview & Decoupling Philosophy

The Chalo Farva Booking State Machine governs all lifecycle transitions for travel bookings (buses, hotels, packages, activities).

### Fundamental Principle
**`PAYMENT_SUCCESS != BOOKING_CONFIRMED`**

Payment capture authorizes funds, but a booking is **ONLY** marked `CONFIRMED` when the travel provider (GSRTC, hotel API, supplier portal) returns a verified provider confirmation reference.

---

## 2. Complete State Inventory

```
+-----------------------------------------------------------------------------------+
| State Name               | Description                                           |
+--------------------------+-------------------------------------------------------+
| SEARCHED                 | User searched catalog; temporary itinerary active.     |
| SELECTED                 | User selected items; inventory temporary lock set.    |
| PAYMENT_PENDING          | Payment order generated; waiting for gateway callback.|
| PAYMENT_CONFIRMED        | Gateway confirmed payment; funds captured in gateway. |
| BOOKING_PENDING          | Provider API invoked; waiting for confirmation.       |
| PROVIDER_UNKNOWN         | Provider timed out; status check worker active.       |
| CONFIRMED                | Provider returned confirmation ref; voucher issued.    |
| FAILED                   | Provider rejected or payment failed; refund queued.   |
| CANCEL_REQUESTED         | User or admin initiated cancellation request.         |
| CANCELLED                | Provider cancelled inventory booking.                 |
| REFUND_PENDING           | Refund payload sent to payment gateway.              |
| REFUNDED                 | Payment gateway confirmed refund back to customer.    |
+-----------------------------------------------------------------------------------+
```

---

## 3. State Transition Matrix & Legal Rules

```
SEARCHED → SELECTED → PAYMENT_PENDING → PAYMENT_CONFIRMED → BOOKING_PENDING → CONFIRMED
                                                  │                  │
                                                  ├─(Timeout)────────┼─► PROVIDER_UNKNOWN ─► CONFIRMED / FAILED
                                                  │                  │
                                                  └─(Rejection)──────┴─► FAILED ─► REFUND_PENDING ─► REFUNDED
```

| Current State | Target State | Trigger / Event | Verification Required |
|---|---|---|---|
| `SEARCHED` | `SELECTED` | User selects room/seat | Inventory availability check |
| `SELECTED` | `PAYMENT_PENDING` | User initiates checkout | Price revalidation & Redis lock |
| `PAYMENT_PENDING` | `PAYMENT_CONFIRMED` | Gateway webhook `payment.captured` | Razorpay HMAC signature check |
| `PAYMENT_PENDING` | `FAILED` | Gateway webhook `payment.failed` | Gateway failure payload |
| `PAYMENT_CONFIRMED` | `BOOKING_PENDING` | System dispatches provider API | Idempotency key attached |
| `BOOKING_PENDING` | `CONFIRMED` | Provider API returns success | Provider PNR / Voucher ID present |
| `BOOKING_PENDING` | `PROVIDER_UNKNOWN` | Provider API times out (>10s) | Launch background status polling |
| `PROVIDER_UNKNOWN` | `CONFIRMED` | Status check API confirms PNR | Verified provider PNR |
| `PROVIDER_UNKNOWN` | `FAILED` | Status check API returns fail | Queue auto-refund |
| `BOOKING_PENDING` | `FAILED` | Provider API rejects booking | Queue auto-refund |
| `CONFIRMED` | `CANCEL_REQUESTED` | Customer/Admin requests cancel | Check policy eligibility |
| `CANCEL_REQUESTED` | `CANCELLED` | Provider confirms cancellation | Provider cancellation ref |
| `CANCELLED` | `REFUND_PENDING` | Refund engine calculates amount | Ledger debit entry |
| `REFUND_PENDING` | `REFUNDED` | Gateway webhook `refund.processed` | Gateway refund ID verified |

---

## 4. Invalid & Blocked Transitions

The server-side state machine strictly rejects the following illegal transitions (HTTP 409 Conflict):
- `REFUNDED` → `CONFIRMED` (Cannot confirm a refunded booking)
- `CANCELLED` → `CONFIRMED` (Cannot confirm a cancelled booking)
- `FAILED` → `CONFIRMED` (Cannot confirm a failed booking without new payment)
- `CONFIRMED` → `PAYMENT_PENDING` (Cannot regress to payment pending)
- `CONFIRMED` → `SEARCHED` (Cannot regress to search)
- `FAILED` → `REFUNDED` (Cannot issue refund without explicit `PAYMENT_CONFIRMED` record)

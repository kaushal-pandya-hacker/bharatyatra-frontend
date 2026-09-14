# BOOKING USER FLOWS — CHALO FARVA

## Flow 1: Unified Multi-Item Checkout Flow
```text
Item Selection (Bus Seat / Hotel Room / Activity Pass)
  ↓
Review Selection & Add Passengers / Guests
  ↓
Itemized Price Breakdown (Base + Tax + Fee - Discount = Net Amount)
  ↓
Initiate Order (/api/v1/orders)
  ↓
Payment Gateway Modal (Razorpay / UPI)
  ↓
Payment Authorized (/api/v1/payments)
  ↓
Provider Confirmation Verification (/api/v1/bookings/{id}/confirm)
  ↓
Booking Confirmed & Downloadable Ticket / Voucher Generated
```

## Flow 2: Booking Failure Handling
- **Scenario**: Payment captured successfully, but external bus operator API returns sold-out/failed status.
- **UX Sequence**:
  1. System transitions status to `BOOKING_PENDING` / `FAILED`.
  2. UI displays clear alert: *"Payment received, but bus seat is no longer available."*
  3. Provides 2 immediate recovery CTAs:
     - **Option A**: Auto-rebook next available bus schedule (same operator/route).
     - **Option B**: One-click instant refund initiation to original payment method.

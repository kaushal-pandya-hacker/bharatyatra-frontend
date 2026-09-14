# Deterministic Refund Engine Flow v1.0

## 1. Rules & Policies
- **Provider Booking Failure Edge Case**: If payment succeeds but provider booking fails, 100% full refund (`FULL_REFUND`) is triggered automatically with zero cancellation fee.
- **Customer Cancellation**: Calculated deterministically via `CancellationPolicy`:
  - `FREE_CANCELLATION` (>= 24h before travel): 100% refund.
  - `MODERATE` (>= 48h before travel): 100% refund; (< 48h): 50% refund.
  - `STRICT` (>= 72h before travel): 75% refund; (< 72h): 0% refund.
  - `NON_REFUNDABLE`: 0% refund.

## 2. Refund State Machine
```text
REFUND_REQUESTED -> REFUND_PENDING -> REFUND_PROCESSING -> REFUNDED
                                                          -> REFUND_FAILED
```

# Payment State Machine Specification v1.0

## 1. Valid Payment Order State Transitions
```text
CREATED -> PENDING -> PROCESSING -> SUCCESS
                  -> FAILED     -> PENDING (Retry)
                  -> CANCELLED
                  -> EXPIRED
```

## 2. Separate Booking State Transitions
```text
SEARCHED -> SELECTED -> PAYMENT_PENDING -> PAYMENT_CONFIRMED -> BOOKING_PENDING -> CONFIRMED
                                                                                 -> FAILED -> REFUND_PENDING -> REFUNDED
```
- Strict isolation prevents displaying `CONFIRMED` to the user before provider verification.

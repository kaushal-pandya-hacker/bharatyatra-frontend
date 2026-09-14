# Booking State Machine — Chalo Farva

## Finite State Machine Matrix

```text
SEARCHED ────────► SELECTED ────────► PAYMENT_PENDING
                                            │
                                            ├────────► PAYMENT_CONFIRMED ──────► BOOKING_PENDING ──────► CONFIRMED
                                            │                                                                │
                                            ▼                                                                ▼
                                          FAILED                                                      CANCEL_REQUESTED
                                                                                                             │
                                                                                                             ▼
                                                                                                         CANCELLED
                                                                                                             │
                                                                                                             ▼
                                                                                                      REFUND_PENDING
                                                                                                             │
                                                                                                             ▼
                                                                                                          REFUNDED
```

## State Machine Rules
1. Payment success (`PAYMENT_CONFIRMED`) transitions to `BOOKING_PENDING`, not direct confirmation, until provider confirms.
2. Invalid state transitions (e.g. `PAYMENT_PENDING` -> `CONFIRMED`) throw an HTTP 400 `BadRequestException`.

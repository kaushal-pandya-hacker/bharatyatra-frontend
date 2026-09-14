# Supplier Settlement Engine & Statements v1.0

## 1. Settlement Cycle States
```text
PENDING -> ELIGIBLE -> CALCULATED -> APPROVED -> PROCESSING -> PAID
                                              -> ON_HOLD
                                              -> RECONCILIATION_REQUIRED
```

## 2. Settlement Holding Period
- Standard holding period: 24 hours after successful completion of travel service (e.g. hotel check-out date or bus travel completion) to account for disputes or instant cancellation requests.

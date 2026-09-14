# Proposal Approval & User Governance Model v1.0

## 1. Adaptation Proposal Life Cycle

```text
DETECTED -> ANALYZING -> PROPOSED -> AWAITING_APPROVAL -> APPROVED -> COMPLETED
                                    -> REJECTED
                                    -> EXPIRED
```

## 2. User Modes
- **`MANUAL`**: User must review and approve all proposed changes manually.
- **`ASSISTED`** (Default): System generates high-confidence proposal, alerts user, and waits for 1-click approval.
- **`AUTO_LOW_RISK`**: System auto-applies non-financial, unbooked schedule shifts (0 INR difference) while still requiring approval for paid bookings or cost increases.

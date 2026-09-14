# Supplier Health Model v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.23.0  
**Date**: September 13, 2026  

---

## 1. Overview & Health Classification Framework

The Chalo Farva **Supplier Health Model** classifies every active supplier into 4 distinct operational health categories based on real-time operational telemetry.

```
                  +-----------------------------------+
                  | Operational Telemetry Evaluator   |
                  +-----------------┬-----------------+
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
  +--------------+           +--------------+           +--------------+
  |   HEALTHY    |           |    WATCH     |           |   DEGRADED   |
  | (Normal Ops) |           | (Minor Risk) |           | (High Risk)  |
  +--------------+           +--------------+           +--------------+
                                                               │
                                                               ▼
                                                        +--------------+
                                                        |  SUSPENDED   |
                                                        | (Off-market) |
                                                        +--------------+
```

---

## 2. Health Tier Criteria Matrix

| Health State | Qualification Criteria | System Action | Admin Intervention |
|---|---|---|---|
| **HEALTHY** | $SQS \ge 80.0$, Booking Failure $< 2.0\%$, Cancellation $< 2.0\%$, Zero P0 complaints. | Full active search listing; automated payout generation. | None. |
| **WATCH** | $65.0 \le SQS < 80.0$ OR 1 out-of-stock failure in 24h. | Soft warning banner in Supplier Portal. Weekly monitoring. | Ops notification logged. |
| **DEGRADED** | $50.0 \le SQS < 65.0$ OR Booking Failure $\ge 5.0\%$ OR $>2$ customer complaints. | Search placement demoted by 50%. Instant SMS alert to supplier. | Mandatory admin review within 24 hrs. |
| **SUSPENDED** | $SQS < 50.0$ OR Unresolved Fraud Alert OR Verification Revoked. | Inventory auto-hidden from search. New bookings hard-blocked. | Admin review required for reactivation. |

---

## 3. Isolation of External Provider Failure vs Supplier Failure

> [!CAUTION]
> If a booking fails due to a global payment gateway outage or third-party aggregator infrastructure downtime (`PRV-GSRTC` API 504 Gateway Timeout), the system logs the failure under `PROVIDER_INFRASTRUCTURE_ERROR` and **EXCLUDES** it from the individual supplier's $SQS$ and Health metrics.

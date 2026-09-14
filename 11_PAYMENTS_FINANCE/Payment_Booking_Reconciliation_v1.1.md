# Payment Booking Reconciliation v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.22.0  
**Date**: September 13, 2026  
**Author**: Lead Financial Architect & Payment Engineer  

---

## 1. Executive Summary & 4-Way Reconciliation Protocol

The Chalo Farva Reconciliation Engine enforces a daily **4-Way Automated Reconciliation Audit** to detect and resolve any discrepancy between payment gateway logs, internal database records, double-entry financial ledger entries, and external provider statements.

---

## 2. 4-Way Reconciliation Matrix

```
                      +-----------------------------+
                      | 1. Payment Gateway API Logs |
                      +--------------┬--------------+
                                     │
                                     ▼
+-------------------------+   RECONCILIATION   +--------------------------+
| 2. Internal DB Bookings | ◄────────────────► | 3. Double-Entry Ledger   |
+-------------------------+       ENGINE       +--------------------------+
                                     ▲
                                     │
                      +--------------┴--------------+
                      | 4. External Provider Statements
                      +-----------------------------+
```

---

## 3. Discrepancy Detection & Automated Resolution Rules

| Discrepancy Case | Identified Condition | Root Cause | Automated Resolution Action |
|---|---|---|---|
| **Discrepancy 1** | Payment Captured in Gateway, but Booking status `PAYMENT_PENDING` | Webhook dropped by network | Fetch gateway status via REST API; transition booking to `PAYMENT_CONFIRMED` and trigger provider booking API. |
| **Discrepancy 2** | Payment Captured, Provider Rejected, but Booking `BOOKING_PENDING` | Provider timeout during checkout | Flag as `FAILED`; initiate 100% automated refund to customer; debit Escrow Ledger. |
| **Discrepancy 3** | Booking `CONFIRMED`, but Provider Statement missing entry | Delayed provider batch report | Trigger provider reference query API; verify PNR validity. |
| **Discrepancy 4** | Refund Processed in Gateway, but Ledger `CANCELLED` without refund record | Gateway webhook delay | Sync refund ID; insert `CREDIT` entry in ledger; notify user. |

---

## 4. Daily Reconciliation Audit Report

- **Run Frequency**: Daily at 02:00 IST via BullMQ scheduled cron job.
- **Alerting Threshold**: Any unresolved financial mismatch > ₹0.00 generates a P0 PagerDuty & Slack alert (`#fin-ops-alerts`).
- **Audit Compliance**: Every discrepancy resolution generates a cryptographically signed entry in `financial_audit_trail`.

# Supplier Settlement Quality v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.23.0  
**Date**: September 13, 2026  
**Author**: Supplier Finance & Payout Architect  

---

## 1. Executive Summary & Settlement Principles

The Chalo Farva Supplier Settlement Engine processes weekly automated bank transfers for completed travel bookings.

### Core Financial Rules
1. **Post-Service Payout**: Payouts are generated **ONLY** after customer check-in / travel completion date.
2. **Authoritative Calculation**: Payable amounts are computed server-side using double-entry ledger entries. Untrusted frontend payloads are completely ignored.
3. **Automated Tax Deduction (TDS)**: Deducts 1% TDS under Section 194O of Indian Income Tax Act where applicable.

---

## 2. Settlement Calculation Formula

$$\text{Net Payout} = \text{Gross Booking Amount} - \text{Platform Commission} - \text{Payment Gateway Fee} - \text{TDS} (1\%) - \text{Customer Refunds}$$

All values are stored as **integers in paise** to maintain 0-drift financial accuracy.

---

## 3. Settlement Cycle & Payout Workflow

```
[Booking Completed] ──► [Trip Date Passed] ──► [Weekly Batch Ledger Lock]
                                                        │
                                                        ▼
[RazorpayX / Cashfree Payout API] ◄── [Calculate Net Payout + TDS]
               │
               ├─► Success: Payout ARN Generated ──► [SETTLED] (Email Alert)
               └─► Fail: Re-queued for Ops Review ──► [SETTLEMENT_PENDING]
```

---

## 4. Security & Audit Trail

- **Bank Account Change Protection**: Updating bank account details requires 2FA OTP verification and triggers a 48-hour payout hold.
- **Audit Records**: Every payout transaction generates an immutable audit record linking supplier ID, booking IDs, transaction ARN, and TDS certificate reference.

# CHALO FARVA — ADMIN OPERATIONS & RUNBOOK GUIDE v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Target Audience**: Platform Operators & Admin Personnel

---

## 1. SUPPLIER VERIFICATION WORKFLOW RUNBOOK

1. Navigate to `Admin Dashboard` -> `Supplier Management` -> `Pending Verifications`.
2. Review submitted business details: GSTIN, PAN, Bank Account Number & IFSC code.
3. Verify uploaded business registration documents.
4. Execute automated bank penny drop check.
5. Click `APPROVE SUPPLIER` to publish supplier inventory to the live marketplace, or `REJECT SUPPLIER` with feedback comments.

---

## 2. REFUND & FINANCIAL RECONCILIATION RUNBOOK

1. Navigate to `Finance Dashboard` -> `Refund Requests`.
2. Inspect the booking ID, customer payment transaction reference, and booking state machine log.
3. Confirm that the booking state is `CANCELLED` or `FAILED`.
4. Verify eligible refund amount calculated by the deterministic refund engine.
5. Click `AUTHORIZE REFUND`. The system submits the refund command to Razorpay Sandbox/Payment Gateway and logs the double-entry ledger adjustment.

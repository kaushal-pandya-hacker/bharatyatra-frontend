# Payment Reconciliation & Financial Integrity Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Automated Reconciliation Verification

- **Edge Case**: Razorpay payment succeeds, but hotel reservation fails due to transient API outage.
- **Workflow Verified**:
  1. `PaymentWebhookService` receives `payment.captured`. Order status -> `SUCCESS`.
  2. `ProviderNormalizerService` attempts hotel booking -> returns `FAILED`.
  3. `FinancialReconciliationService` detects mismatch. Booking status set to `RECONCILIATION_NEEDED`.
  4. Automated `FULL_REFUND` (100% refund) triggered with 0 cancellation fee.
  5. Balanced accounting ledger entries recorded (`REFUND_PAYABLE`).
  6. Customer notified of refund processing via Email & Push.

# Reconciliation Engine Specification — Chalo Farva

## Payment Success + Booking Failure Workflow
If payment captures successfully but vendor booking fails:
1. Payment marked `CAPTURED`.
2. Booking marked `FAILED_PENDING_RECONCILIATION`.
3. Financial reconciliation record created (`mismatchType: PAYMENT_SUCCESS_BOOKING_FAILURE`).
4. Automated 100% refund initiated (`status: PROCESSING`).
5. Audit log recorded and customer notified.

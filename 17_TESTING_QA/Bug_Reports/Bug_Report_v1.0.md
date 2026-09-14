# Bug Report v1.0 — Chalo Farva

**Triaged Defect Log & Fix Verification**

---

## Triaged Defect Summary

- **Total P0 (Critical) Defects**: 0 Unresolved
- **Total P1 (High) Defects**: 0 Unresolved
- **Total P2 (Medium) Defects**: 0 Unresolved (2 Triaged Product Enhancements in Backlog)
- **Total P3 (Low) Defects**: 0 Unresolved

---

## Resolved Defect Log

### BUG-001 (Resolved): Payment Capture Without Booking Confirmation State Machine
- **Severity**: P0 Critical
- **Module**: Payments & Bookings Integration
- **Preconditions**: Third-party provider API times out after payment authorization.
- **Steps to Reproduce**: Capture payment in Razorpay when provider API is in `OPEN` circuit breaker state.
- **Expected Result**: System isolates payment capture from booking confirmation and triggers automated refund if confirmation fails.
- **Actual Result**: Previously risk of false confirmation issuing.
- **Fix Verification**: Decoupled state machines; added automated 4-way reconciliation triggering 100% refund (`FULL_REFUND`) with 0 cancellation fee. Verified by `test_payment_tampering_reconciliation.py`.

### BUG-002 (Resolved): Adaptive AI Autonomous Financial Charge Risk
- **Severity**: P0 Critical
- **Module**: Adaptive AI Rerouting Engine
- **Preconditions**: Weather delay event triggers alternative hotel recommendation with ₹300 price difference.
- **Steps to Reproduce**: Trigger rain alert evaluation for active trip.
- **Expected Result**: System requires explicit 1-click user authorization before initiating paid rebooking.
- **Actual Result**: System enforces mandatory user authorization. Zero unapproved charges permit.
- **Fix Verification**: Enforced safety hierarchy in `adaptive-ai.service.ts`. Verified by `test_adaptive.py`.

### BUG-003 (Resolved): Analytics Event ID Idempotency Retries
- **Severity**: P1 High
- **Module**: Analytics Telemetry Ingestion
- **Preconditions**: Network retry sends duplicate `BOOKING_CONFIRMED` event.
- **Steps to Reproduce**: POST duplicate `eventId` payload to `/api/v1/analytics/events`.
- **Expected Result**: System deduplicates by hash and returns `DUPLICATE_IGNORED`.
- **Fix Verification**: Added `processedEventIds` hash check in `AnalyticsService`. Verified by `test_analytics_event_tracking.py`.

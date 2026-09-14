# Production Issue Test Cases — Chalo Farva v1.1

**Purpose**: Test cases covering real production edge cases and error scenarios.

---

## Key Test Scenarios

- **TC-PROD-01: Booking-After-Payment Timeout Retry**: Verify that when a provider API times out during confirmation, `BookingsService` automatically retries 3 times before issuing a full automated refund.
- **TC-PROD-02: Payment Webhook Re-delivery**: Verify webhook idempotency when Razorpay delivers duplicate `payment.captured` webhooks.
- **TC-PROD-03: Supplier Quality Score Degraded Payout**: Verify that suppliers scoring below 75.0 are flagged in admin dashboard and excluded from top recommendations.

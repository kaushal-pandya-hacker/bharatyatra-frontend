# Webhook Architecture Specification — Chalo Farva

## Endpoint & Security Standard
- Endpoint format: `/api/v1/webhooks/:provider/:event`
- Signature Verification: HMAC-SHA256 signature checked against `RAZORPAY_WEBHOOK_SECRET`.
- Replay Protection: Rejects webhook timestamps older than 300 seconds (5 minutes).
- Idempotency Registry: Deduplicates events by event ID (`processedEventIds`).

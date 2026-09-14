# Concurrency & Idempotency Handling v1.0

## 1. Idempotency & Deduplication
- Key pattern: `provider:external_event_id:event_type:location`.
- Duplicate event payloads arriving within 24 hours are safely logged and ignored.

## 2. Optimistic Concurrency Control
- Users manually editing an itinerary while an adaptive proposal is pending will lock the base `Itinerary.versionNumber`.
- Proposals generated against stale itinerary versions are invalidated (`status: EXPIRED`) and re-evaluated.

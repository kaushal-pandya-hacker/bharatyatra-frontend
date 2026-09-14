# Analytics Test Plan v1.1 — Chalo Farva

**Test Suite**: [`test_analytics_event_tracking.py`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/AI_Service/tests/test_analytics_event_tracking.py)  

---

## Test Execution Matrix

- **Taxonomy Naming Validation**: Validates `OBJECT_ACTION` format; throws `BadRequestException` for invalid formats (`hotelView`, `hotel_view`).
- **Idempotency & Deduplication**: Prevents duplicate counting of `event_id` hashes.
- **Session Identity Merging**: Merges anonymous session events with user ID upon login without data corruption.
- **Funnel Drop-Off Accuracy**: Computes step-by-step conversion across all 13 funnel stages.
- **Sensitive Data Exclusion**: Asserts that passwords, CVV, raw card numbers, and secret tokens are scrubbed prior to ingestion.

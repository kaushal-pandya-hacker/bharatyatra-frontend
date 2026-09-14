# Error & Retry Strategy Specification — Chalo Farva

## Controlled Retry Policy
- Idempotent operations (search, geocoding, weather forecasts): Retry up to 3 times with 2000ms exponential backoff.
- Non-idempotent operations (payment creation, booking creation): **Never blindly retry**. Move directly to reconciliation state.

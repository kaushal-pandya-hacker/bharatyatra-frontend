# Queue Architecture — Chalo Farva

## BullMQ & Redis Job Queues
Supported Queues:
- `notifications`: Email, SMS, WhatsApp dispatch.
- `weather_processing`: External condition monitoring.
- `ai_processing`: Asynchronous itinerary candidate evaluation.
- `reconciliation`: Daily booking and payment ledger reconciliation.

Job retries configured with exponential backoff (`attempts: 3, backoff: 5000ms`).

# Event & Outbox Architecture — Chalo Farva

## Transactional Outbox Pattern
1. State mutation written to PostgreSQL inside DB transaction.
2. Event record emitted to outbox table.
3. Queue consumer processes outbox event and dispatches notifications/AI adapt runs asynchronously.

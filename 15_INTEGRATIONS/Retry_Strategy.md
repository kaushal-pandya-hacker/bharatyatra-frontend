# Retry Strategy & Failure Handling Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Controlled Retry Lifecycle

When a provider delivery fails, `NotificationService` transitions the message status to `RETRYING` and schedules exponential backoff retries:

- **Attempt 1**: Immediate dispatch
- **Attempt 2**: Retry after 15 seconds
- **Attempt 3**: Retry after 60 seconds
- **Max Attempts (3)**: Route to **Dead Letter Queue (DLQ)** and flag in `getFailuresAndRetries()`.

## 2. Provider Outage Handling

During provider outages (e.g. Email gateway downtime), notifications remain in `RETRYING` state or trigger fallback channel delivery if policy permits. Outages never result in premature `DELIVERED` status assertions.

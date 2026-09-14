# Travel Provider Outage & Circuit Breaker Runbook v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## Provider Outage Protocol
1. Monitor provider status in Admin Panel (`GET /api/v1/admin/providers`).
2. When provider error rate > 5.0%, `CircuitBreakerService` transitions state from `CLOSED` to `OPEN`.
3. Requests to affected provider are automatically queued or routed to alternative suppliers.
4. When provider returns to `HALF_OPEN` state, canary probe requests verify API stability before full transition to `CLOSED`.

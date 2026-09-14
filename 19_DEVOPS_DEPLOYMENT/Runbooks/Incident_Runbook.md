# Incident Response & Management Runbook v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Incident Lifecycle

```
[Detection] -> [Triage & Severity Assignment] -> [Containment] -> [Recovery] -> [Verification] -> [Post-Mortem]
```

- **P0 Severity**: System outage, unauthorized financial transaction, customer data breach.
- **P1 Severity**: Payment gateway outage, booking confirmation failure spike, AI planner service down.

## 2. Containment Actions
- If payment gateway compromised: Trip circuit breaker (`OPEN`) to route payments to secondary gateway.
- If AI Microservice unavailable: Enable fallback `DevelopmentMockLLMProvider` or static itinerary response mode.

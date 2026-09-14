# Master Test Plan v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Status:** Approved Specification  

---

## 1. Objectives & Scope

This Master Test Plan governs quality assurance, security hardening, performance benchmarking, and production readiness for Chalo Farva. The scope covers:
- Core Traveler Journey (`Discover` → `Plan` → `Book` → `Organize` → `Monitor` → `Adapt` → `Enjoy`)
- AI Trip Planner & Adaptive AI Engines
- Payments, Billing, Refunds, Commission & Supplier Settlements
- Admin Operations & Supplier Portal Tenant Data Isolation
- Centralized Multi-Channel Notification System

---

## 2. Testing Pyramid & Strategy

```
           / \
          /   \     E2E User Journey & Security Audit (Pytest & Jest)
         /-----\
        /  API  \    REST API Security & Payment Reconciliation
       /---------\
      / Integration\  Provider Adapters & Ledger Balancing
     /-------------\
    /   Unit Tests  \ Pydantic Schemas, TSP Optimizer, Constraints
   /-----------------\
```

- **Unit Tests**: 100% logic coverage on TSP optimization, hard constraints, budget engine, and template rendering.
- **Integration Tests**: Provider adapter circuit breakers, webhook HMAC signature validation, 4-way financial reconciliation, and multi-channel notifications.
- **Security & IDOR Tests**: Tenant data isolation, RBAC role permissions, parameter tampering defense, and prompt injection neutralization.
- **Performance & Concurrency**: Inventory lock race condition testing, rate limiting, and cache invalidation consistency.

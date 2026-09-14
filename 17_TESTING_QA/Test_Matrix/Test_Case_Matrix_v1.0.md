# Test Case Matrix v1.0 — Chalo Farva

**Master Inventory of Test Cases Across All Modules**

---

## Master Test Case Inventory (50 Automated + 150 Manual Checks)

| Test ID | Module / Feature | Component / Endpoint | User Role | Test Type | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | User Authentication | `POST /api/v1/auth/register` | Customer | Functional / Integration | **PASS** |
| **TC-AUTH-02** | User Authentication | `POST /api/v1/auth/login` | Customer | Functional / Security | **PASS** |
| **TC-AUTH-03** | RBAC Guards | `GET /api/v1/admin/*` | Customer | Security / Authorization | **PASS** |
| **TC-AUTH-04** | Supplier Isolation | `GET /api/v1/suppliers/settlements` | Supplier | Security / IDOR | **PASS** |
| **TC-SRCH-01** | Search Engine | `GET /api/v1/search` | Customer | Functional / Performance | **PASS** |
| **TC-PLAN-01** | AI Trip Planner | `POST /api/v1/ai/trip-plan` | Customer | Functional / AI Quality | **PASS** |
| **TC-PLAN-02** | Prompt Injection Immunity | `POST /api/v1/ai/trip-plan` | Customer | Security / Adversarial | **PASS** |
| **TC-ADPT-01** | Adaptive AI Disruption | `POST /api/v1/adaptive-ai/evaluate` | Customer | Functional / Safety | **PASS** |
| **TC-ADPT-02** | Unapproved Charge Guard | `POST /api/v1/adaptive-ai/apply` | Customer | Safety / Financial | **PASS** |
| **TC-BOOK-01** | Hotel Booking Request | `POST /api/v1/bookings` | Customer | Functional / Booking | **PASS** |
| **TC-BOOK-02** | Provider Timeout Fallback | `BookingsService` Retry Backoff | Customer | Reliability / Concurrency | **PASS** |
| **TC-PAYM-01** | Payment Order Capture | `POST /api/v1/payments/create-order` | Customer | Financial / Integration | **PASS** |
| **TC-PAYM-02** | Webhook HMAC Validation | `POST /api/v1/payments/webhook` | System | Security / Integrity | **PASS** |
| **TC-PAYM-03** | Double-Entry Balancing | `FinancialLedgerService` | System | Accounting / Compliance | **PASS** |
| **TC-RECN-01** | 4-Way Reconciliation | `ReconciliationService` | System | Financial / Automated Refund | **PASS** |
| **TC-NOTF-01** | Multi-Channel Alert | `NotificationService` | All Roles | Integration / Reliability | **PASS** |
| **TC-ANLY-01** | Analytics Ingestion | `POST /api/v1/analytics/events` | All Roles | Telemetry / Validation | **PASS** |
| **TC-ANLY-02** | Event Idempotency | `AnalyticsService` | System | Telemetry / Deduplication | **PASS** |

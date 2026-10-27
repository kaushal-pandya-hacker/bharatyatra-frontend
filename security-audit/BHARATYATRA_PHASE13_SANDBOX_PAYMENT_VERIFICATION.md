# BharatYatra Phase 13 — Razorpay Payment Sandbox & Route Resolution
## Document Reference: `BHARATYATRA_PHASE13_SANDBOX_PAYMENT_VERIFICATION.md`
**Phase**: Phase 13 — Staging Infrastructure Provisioning & Verification  
**Author**: Senior DevSecOps Engineer & Application Security Assessor  
**Target Subsystem**: Razorpay Webhook Ingestion & Cryptographic Verification  
**Status**: **CODE-VERIFIED (Cryptographic Unit Baselines) / UNVERIFIED (Live Dashboard Registration)**  
**Timestamp**: 2026-10-22  

---

## 1. Routing Discrepancy Resolution & Runtime Analysis

A critical objective of Phase 13 is to resolve the discrepancy between previously reported webhook paths:
- Previously reported in Phase 10: `/api/v1/providers/webhooks/razorpay`
- Previously reported in Phase 11: `/webhooks/razorpay/events`

### 1.1 Codebase & Runtime Inspection
An inspection of the NestJS application routing architecture was conducted across:
1. **Global Prefix Setup** ([`src/main.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/main.ts#L96-L98)):
   ```typescript
   const apiPrefix = process.env.API_PREFIX || '/api/v1';
   app.setGlobalPrefix(apiPrefix);
   ```
   **Effect**: Every registered NestJS controller route is automatically prepended with `/api/v1`. Any request directed to `/webhooks/...` without `/api/v1` receives HTTP `404 Not Found`.

2. **Primary Cryptographic Gateway** ([`WebhooksController`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.controller.ts#L17-L24)):
   - `@Controller('webhooks')`
   - `@Post(':provider/:event')`
   - **Effective Runtime URL**: `POST /api/v1/webhooks/:provider/:event`
   - For Razorpay generic events: `POST /api/v1/webhooks/razorpay/events`
   - For specific events: `POST /api/v1/webhooks/razorpay/payment.captured`
   - **Features**: Preserves bit-exact `req.rawBody` buffer, enforces constant-time HMAC-SHA256 comparison, handles concurrent duplicate deliveries, protects against replay attacks.

3. **Legacy Payments Controller** ([`PaymentsController`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/payments/payments.controller.ts#L29-L82)):
   - `@Controller('payments')`
   - `@Post('webhooks/:provider')`
   - **Effective Runtime URL**: `POST /api/v1/payments/webhooks/:provider`
   - For Razorpay: `POST /api/v1/payments/webhooks/razorpay`

### 1.2 Discrepancy Resolution Summary
| Documented Path | Origin of Path in Prior Reports | Architectural Reality | Actionable Verdict |
| :--- | :--- | :--- | :--- |
| `/webhooks/razorpay/events` | Phase 11 report | Omitted `app.setGlobalPrefix('/api/v1')` | **INCORRECT ROUTE (Would 404)** |
| `/api/v1/providers/webhooks/razorpay` | Phase 10 report | Assumed filesystem folder (`providers/`) was in route path | **INCORRECT ROUTE (Would 404)** |
| **`/api/v1/webhooks/razorpay/events`** | **Actual `main.ts` + `webhooks.controller.ts`** | **Global prefix (`/api/v1`) + controller path (`/webhooks/razorpay/events`)** | **CANONICAL PRODUCTION ENDPOINT** |

---

## 2. Test Evidence Categorization (Unit Test vs Live Sandbox)

In strict accordance with Phase 13 requirements:
> *"Label unit-test evidence separately from real sandbox delivery evidence. Do not register or modify live webhooks."*

### 2.1 Category 1: Automated Cryptographic Test Evidence (CODE-VERIFIED)
Executed via [`18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.spec.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.spec.ts) (100% passing across 10 test scenarios):

| Test Assertion | Input Vector | Enforcement Logic | Test Outcome | Classification |
| :--- | :--- | :--- | :---: | :---: |
| **Valid Signature Accepted** | Valid synthetic `payment.captured` signed with shared secret. | `crypto.timingSafeEqual` over `rawBody` Buffer. | **PASS (200 OK)** | **CODE-VERIFIED** |
| **Forged Signature Rejected** | Attacker transmits arbitrary 64-char hex string. | HMAC digest mismatch; throws `UnauthorizedException`. | **PASS (401)** | **CODE-VERIFIED** |
| **Tampered Body Rejected** | Payload altered after signing (`amount` 150000 -> 99999). | Buffer digest mismatch on `req.rawBody`. | **PASS (401)** | **CODE-VERIFIED** |
| **Missing Signature Rejected** | Request without `x-razorpay-signature` header. | Controller/Service rejects before processing. | **PASS (400/401)** | **CODE-VERIFIED** |
| **Missing Secret Fail-Closed** | `NODE_ENV=production` with `RAZORPAY_WEBHOOK_SECRET` unset. | `resolveWebhookSecret()` halts with fatal error. | **PASS (Fatal Halt)** | **CODE-VERIFIED** |
| **Placeholder Secret Rejected** | `NODE_ENV=production` with placeholder string. | `resolveWebhookSecret()` detects and halts. | **PASS (Fatal Halt)** | **CODE-VERIFIED** |
| **Duplicate Delivery Handled** | Identical event ID delivered twice (webhook retry). | Event cache skips execution; returns `SKIPPED_DUPLICATE`. | **PASS (200 OK)** | **CODE-VERIFIED** |
| **Concurrent Race Condition** | 5 identical concurrent webhook requests fired at once. | Atomic cache guard executes 1, skips 4. | **PASS (1 Proc, 4 Skip)**| **CODE-VERIFIED** |
| **Replay Protection Window** | Timestamp header > 300 seconds old. | Compares `Math.abs(currentTime - eventTime) > 300`. | **PASS (401)** | **CODE-VERIFIED** |
| **Negative Amount Manipulation**| Webhook payload specifies negative `amount: -500`. | Validation requires `amount >= 0`; flags tamper alert. | **PASS (400)** | **CODE-VERIFIED** |

### 2.2 Category 2: Live Sandbox / Dashboard Delivery Evidence (UNVERIFIED)
- **Live Razorpay Webhook Configuration**: **UNVERIFIED**.
  In accordance with safety rule 4 (*"Do not enable live payments, modify production DNS, or change production Cloudflare settings"*), no live webhooks were registered on Razorpay servers during Phase 13.
- **Pre-Live Requirement**: An authorized merchant administrator must register the canonical endpoint `https://api.bharatyatra.in/api/v1/webhooks/razorpay/events` in the Razorpay Merchant Dashboard using a freshly generated secret.

---

## 3. Server-Side Financial & State Validation

Before any booking state is updated upon receiving a verified webhook:
1. **Amount Verification**: Webhook `amount` (in paise/cents) is reconciled against `booking.total_amount`. A discrepancy triggers `PRICE_MANIPULATION_ATTEMPT` and blocks voucher issuance.
2. **Currency Verification**: Must equal `INR` (or approved foreign currency).
3. **State Transition**: State only transitions from `PENDING_PAYMENT` to `CONFIRMED`. If already `CONFIRMED` or `CANCELLED`, the state remains protected.

---

## 4. Workstream Conclusion

- **Canonical Webhook Endpoint Resolved**: **`/api/v1/webhooks/razorpay/events`** (Resolved discrepancy).
- **Cryptographic & Idempotency Pipeline**: **CODE-VERIFIED (10/10 automated tests passing)**.
- **Live Razorpay Dashboard Registration**: **UNVERIFIED (Requires operator manual action in merchant dashboard)**.

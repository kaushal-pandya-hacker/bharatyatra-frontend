# BharatYatra Phase 12 — Payment Sandbox & Razorpay Webhook Verification
## Document Reference: `BHARATYATRA_PHASE12_PAYMENT_SANDBOX_RESULTS.md`
**Phase**: Phase 12 — Staging Verification & Production Go/No-Go  
**Target Provider**: Razorpay Payment Gateway (Test Mode / Sandbox Fixtures)  
**Author**: Senior Release Engineer & Application Security Assessor  
**Status**: **VERIFIED (Cryptographic Sandbox Pipeline) / UNVERIFIED (Live Dashboard Registration)**  
**Timestamp**: 2026-10-22  

---

## 1. Sandbox Verification Strategy & Safety Controls

In accordance with Phase 12 safety requirements:
> *"Use the official provider sandbox or mocked test fixtures. The test workflow must never touch live payment credentials or real customer records. Do not register or modify live webhooks."*

- **Zero-Live-Traffic Guarantee**: All tests were executed against cryptographic test fixtures and isolated mock payment provider adapters (`MockPaymentProvider`, `WebhooksService`).
- **No External Network Calls to Live Banking APIs**: Real merchant keys (`rzp_live_...`) were never queried or instantiated.
- **Synthesized Payloads**: All webhook testing utilized deterministic synthetic orders (`CF-ORD-20261022-...`), synthetic payment identifiers (`pay_test_...`), and isolated test signing secrets.

---

## 2. Test Execution & Evidence Matrix

The payment pipeline was evaluated across 8 critical test categories within [`18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.spec.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.spec.ts) and [`__tests__/security-db-webhook-phase4.test.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/__tests__/security-db-webhook-phase4.test.ts) (100% passing):

| Test ID | Test Scenario | Attack / Failure Vector Tested | Enforcement Mechanism | Result |
| :---: | :--- | :--- | :--- | :---: |
| **PAY-01** | **Valid Sandbox Signature Acceptance** | Standard `payment.captured` event signed with matching HMAC-SHA256 key. | `crypto.timingSafeEqual` over `req.rawBody`. Parses `paymentId`, `orderId`, `amount`, `currency`. | **PASS (200 OK, PROCESSED)** |
| **PAY-02** | **Missing Signature Rejection** | Inbound request lacking `x-razorpay-signature` or containing empty string. | WebhooksController & Service reject before payload parsing. | **PASS (400 Bad Request / 401)** |
| **PAY-03** | **Forged / Invalid Signature Rejection** | Attacker transmits arbitrary 64-character hex signature. | Signature digest mismatch triggers `UnauthorizedException`. Logs `WEBHOOK_SIGNATURE_FAILURE`. | **PASS (401 Unauthorized)** |
| **PAY-04** | **Altered Raw Request Body Rejection** | Payload altered after signing (`amount` changed from 150000 to 99999). | Bit-exact HMAC calculation over `rawBody` fails digest check. | **PASS (401 Unauthorized)** |
| **PAY-05** | **Negative Amount / Price Manipulation** | Webhook payload specifies `amount: -500` or invalid currency. | Validation checks `amount >= 0` and valid currency; records `PRICE_MANIPULATION_ATTEMPT`. | **PASS (400 Bad Request)** |
| **PAY-06** | **Idempotent Duplicate Delivery** | Provider delivers identical `event_id` twice (retry storm simulation). | Memory/cache event registry detects existing ID; skips duplicate execution. | **PASS (200 OK, SKIPPED_DUPLICATE)** |
| **PAY-07** | **Concurrent Delivery Race Condition** | 5 identical webhook deliveries fired simultaneously. | Atomic check-and-insert processes exactly 1 delivery and cleanly skips 4. | **PASS (1 Processed, 4 Skipped)** |
| **PAY-08** | **Replay Protection (Timestamp Delta)** | Webhook transmitted with expired timestamp header (> 300s old). | Timestamp drift validated against `currentTime`; rejected if delta > 300s. | **PASS (401 Unauthorized)** |

---

## 3. Server-Side Booking & Financial Validation

Beyond cryptographic signature validation, booking settlement requires server-side reconciliation:

```
[Inbound Webhook] -> [HMAC-SHA256 on rawBody] -> [Idempotency Filter]
                           |
                     (Valid & Unique)
                           v
               [Server-Side State Audit]
     - Amount Matches Booking Total Exactly?
     - Currency Matches System Allowed (INR)?
     - Booking Current Status == 'PENDING_PAYMENT'?
                           |
                     (All Checks Pass)
                           v
          [Booking Status -> 'CONFIRMED']
          [Supplier Booking Orchestration]
          [Immutable Audit Log Emitted]
```

1. **Amount Verification**: If the webhook reports a paid amount lower than the booking total, the transaction is flagged as a price tampering violation, remaining unconfirmed.
2. **State Guard**: Completed or cancelled bookings refuse repeated status updates, preventing duplicate voucher issuance.
3. **Currency Guard**: Non-INR transactions are rejected unless explicit multi-currency rules apply.

---

## 4. Production Registration Gate for Authorized Operator

Live webhook processing cannot begin until the operator configures the Razorpay Dashboard. Live configuration steps remain **UNVERIFIED** pending operator action:

1. **Secret Generation**: Generate high-entropy secret (`openssl rand -hex 32`).
2. **Dashboard Setup**: In Razorpay Live Mode, register `https://api.bharatyatra.in/webhooks/razorpay/events`.
3. **Events Selected**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.processed`
4. **Environment Secret Injection**: Inject `RAZORPAY_WEBHOOK_SECRET` into production container environment variables.

---

## 5. Workstream Conclusion

- **Cryptographic Signature Verification**: **VERIFIED**
- **Tamper & Replay Protection**: **VERIFIED**
- **Idempotency & Concurrent Handling**: **VERIFIED**
- **Live Provider Dashboard Webhook**: **UNVERIFIED (Awaiting Operator Registration)**

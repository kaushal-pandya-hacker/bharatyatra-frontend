# BharatYatra Phase 11 — Razorpay Sandbox Webhook Verification & Cryptographic Integrity
## Document Reference: `BHARATYATRA_PHASE11_RAZORPAY_SANDBOX_VERIFICATION.md`
**Phase**: Phase 11 — Controlled Production Readiness  
**Target Integration**: Razorpay Payment Gateway Webhooks  
**Author**: Senior DevSecOps Release Engineer  
**Status**: **VERIFIED (Cryptographic Core) / PENDING OPERATOR REGISTRATION (Razorpay Dashboard)**  
**Timestamp**: 2026-10-22  

---

## 1. Webhook Architecture & Cryptographic Verification

### 1.1 Inbound Route & Raw Body Preservation
- **Webhook Endpoint**: `POST /webhooks/:provider/:event`  
  (Production canonical URL: `https://api.bharatyatra.in/webhooks/razorpay/payment.captured`)
- **Raw Request Buffer Capture**:
  In [`18_DEVELOPMENT/Backend/src/main.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/main.ts#L23-L30), Express JSON body parsing is configured with an explicit verify function:
  ```typescript
  app.use(
    json({
      limit: maxBodyLimit,
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  ```
  This preserves the exact raw unparsed bytes (`req.rawBody`) transmitted by Razorpay, preventing signature invalidation caused by JSON re-serialization, whitespace trimming, or key reordering.

### 1.2 Constant-Time HMAC-SHA256 Verification
In [`WebhooksService.verifyHmacSignature()`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.ts#L170-L214):
1. Derives expected HMAC hex digest:
   ```typescript
   const expectedSignature = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');
   ```
2. Compares signatures in constant-time using Node.js `crypto.timingSafeEqual`:
   ```typescript
   const signatureBuffer = Buffer.from(signature.trim(), 'utf8');
   const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

   if (
     signatureBuffer.length !== expectedBuffer.length ||
     !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
   ) {
     throw new UnauthorizedException('Invalid cryptographic webhook signature.');
   }
   ```
   **Security Benefit**: Eliminates timing side-channel attacks where an attacker could deduce bytes of the signature based on string comparison latency.

---

## 2. Security Controls & Test Evidence Matrix

The webhook pipeline was evaluated across 9 rigorous security test scenarios in [`webhooks.service.spec.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.spec.ts) and [`security-db-webhook-phase4.test.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/__tests__/security-db-webhook-phase4.test.ts):

| Test Scenario | Input & Attack Vector | Code Defense | Result |
| :--- | :--- | :--- | :---: |
| **Valid Sandbox Event** | Legitimate `payment.captured` signed with shared secret. | HMAC passes; extracts `paymentId`, `orderId`, `amount`, `currency`. | **PASS (PROCESSED)** |
| **Forged Signature** | Attacker transmits arbitrary 64-char hex signature. | `timingSafeEqual` fails; logs warning; records `WEBHOOK_SIGNATURE_FAILURE`. | **PASS (401 Unauthorized)** |
| **Tampered Body** | Payload altered after signing (`amount` changed 1000 -> 99999). | HMAC digest mismatch on `rawBody`. | **PASS (401 Unauthorized)** |
| **Missing Signature** | No `x-razorpay-signature` or empty string. | Controller/service throws `BadRequestException` / `UnauthorizedException`. | **PASS (400/401)** |
| **Production Secret Missing**| `NODE_ENV=production` with `RAZORPAY_WEBHOOK_SECRET` unset. | `resolveWebhookSecret()` fails closed with fatal error. | **PASS (Fatal Halted)** |
| **Production Placeholder** | `NODE_ENV=production` with placeholder string. | `resolveWebhookSecret()` rejects placeholder. | **PASS (Fatal Halted)** |
| **Duplicate Delivery** | Provider delivers identical `event_id` twice. | Idempotency set detects event ID; returns `SKIPPED_DUPLICATE` (HTTP 200). | **PASS (Zero Double-Credit)** |
| **Concurrent Storm** | 5 identical concurrent deliveries simultaneously. | Atomic memory/cache guard processes 1 event, skips remaining 4. | **PASS (1 Processed, 4 Skipped)** |
| **Replay Attack** | Webhook with expired timestamp header (> 300s old). | Timestamp delta validated; expired requests rejected. | **PASS (401 Unauthorized)** |
| **Price Manipulation** | Negative payment amount (`amount: -500`). | Service validates `amount >= 0`; records `PRICE_MANIPULATION_ATTEMPT`. | **PASS (400 Bad Request)** |

---

## 3. Server-Side Financial & State Verification

In addition to cryptographic signature validation, `WebhooksService` and booking handlers enforce server-side business rules before any booking transitions to `CONFIRMED`:
1. **Amount Matching**: Webhook `amount` (in paise/cents) must match the expected `total_amount` recorded in the database `bookings` record.
2. **Currency Consistency**: Verified against allowed currency (default `INR`).
3. **State Transition Guard**: Only bookings in `PENDING_PAYMENT` state can transition to `CONFIRMED`. If a booking is already `CANCELLED` or `CONFIRMED`, the event is logged without duplicate state corruption.
4. **Zero-Mock Enforcement**: In production (`NODE_ENV === 'production'`), mock payment handlers and test adapters are strictly deactivated.

---

## 4. Production Razorpay Webhook Configuration Procedure

To activate live webhook delivery, an authorized merchant administrator must perform the following actions in the Razorpay Dashboard:

### Step 1: Generate High-Entropy Webhook Secret
Execute on secure terminal:
```bash
openssl rand -hex 32
```
Save this secret securely in the production Secret Manager as `RAZORPAY_WEBHOOK_SECRET`.

### Step 2: Configure Webhook in Razorpay Dashboard
1. Log into **Razorpay Dashboard** (`https://dashboard.razorpay.com/`).
2. Switch to **Live Mode** (or **Test Mode** for staging verification).
3. In the left navigation, go to **Settings** -> **Webhooks**.
4. Click **+ Add New Webhook**.
5. Configure the following fields:
   - **Webhook URL**: `https://api.bharatyatra.in/webhooks/razorpay/events`  
     *(or specific event routes if configured: `https://api.bharatyatra.in/webhooks/razorpay/payment.captured`)*
   - **Secret**: Paste the 64-character hex secret generated in Step 1.
   - **Alert Email**: `devops-alerts@bharatyatra.in`
6. Under **Active Events**, select ONLY the following required events:
   - [x] `payment.captured`
   - [x] `payment.failed`
   - [x] `order.paid`
   - [x] `refund.processed`
   - [x] `refund.failed`
7. Click **Create Webhook**.

### Step 3: Sandbox Verification Drill (Pre-Live Test)
1. In Razorpay Test Mode, create a test order of INR 100 via the staging checkout.
2. Complete test payment using Razorpay Test Card (e.g., standard success credentials).
3. Observe Razorpay Webhook Delivery Log:
   - Verify HTTP Status `200 OK` received from BharatYatra backend.
   - Response body: `{"success": true, "status": "PROCESSED", ...}`
4. Trigger manual resend of the same event:
   - Verify HTTP Status `200 OK` received.
   - Response body: `{"success": true, "status": "SKIPPED_DUPLICATE", ...}`
5. Confirm booking status in database updated to `CONFIRMED`.

---

## 5. Workstream D Audit Conclusion

- **Cryptographic HMAC-SHA256 Implementation**: **VERIFIED**
- **Raw Body Buffer Preservation**: **VERIFIED**
- **Constant-Time Verification**: **VERIFIED**
- **Replay Protection & Idempotency**: **VERIFIED**
- **Server-Side Price Validation**: **VERIFIED**
- **Live Razorpay Webhook Registration**: **UNVERIFIED (Requires Operator Dashboard Setup)**

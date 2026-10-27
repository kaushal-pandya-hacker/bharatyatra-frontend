# BharatYatra Security — Phase 4 Payment Webhook Integrity & Idempotency Report

**Classification**: CRITICAL PAYMENT SECURITY SPECIFICATION & VERIFICATION AUDIT  
**Provider**: Razorpay Payment Gateway & Partner Integrations  
**Date**: October 21, 2026  
**Auditor**: Payment Integrations Specialist & Senior Application Security Engineer  

---

## 1. Executive Summary

Payment webhooks are the authoritative source of truth for offline or asynchronous payment confirmations. Flaws in webhook signature validation or idempotency can lead to:
1. **Financial Fraud / Free Bookings**: An attacker injecting forged `payment.captured` webhooks to activate bookings without transferring funds.
2. **Double Booking / Duplicate Settlements**: Replayed webhook events triggering duplicate inventory allocations or commission ledger payouts.
3. **Timing Side-Channel Attacks**: Non-constant-time string comparison leaking signature characters byte-by-byte.

In Phase 4, we systematically eliminated mock signature bypasses, implemented exact raw-body cryptographic verification, enforced constant-time comparison, added replay protection, and guaranteed idempotent event handling.

---

## 2. Mock Signature Elimination

### 2.1 Audit Findings
Previous iterations contained legacy mock acceptance pathways in [`WebhooksController`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.controller.ts) and [`WebhooksService`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.ts), including:
- Acceptance of `'mock_signature_valid'` or `'mock_sig_valid'`.
- Missing secret fallbacks that allowed signature checks to pass if the secret was empty.

### 2.2 Purged & Replaced
All mock bypass strings have been eradicated. In [`webhooks.controller.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.controller.ts):
```typescript
const signature = razorpaySignature || providerSignature;
if (!signature || signature.trim().length === 0) {
  throw new BadRequestException('Missing required cryptographic webhook signature.');
}
```
Any incoming webhook lacking a signature is immediately rejected with HTTP 400 Bad Request.

---

## 3. Cryptographic Signature Verification (HMAC-SHA256)

### 3.1 Raw Body Capture Architecture
Razorpay creates HMAC signatures over the exact byte stream transmitted over HTTP. Re-serializing a parsed JavaScript object (`JSON.stringify(req.body)`) will fail signature verification whenever whitespace, newline formatting, floating point formatting, or JSON key order differs from the raw wire bytes.

To guarantee bit-exact verification without breaking other JSON API endpoints, we augmented Express body-parser in [`18_DEVELOPMENT/Backend/src/main.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/main.ts):

```typescript
app.use(
  json({
    limit: '2mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
```

### 3.2 Constant-Time Timing Attack Defense
String comparison (`sig === expectedSig`) leaks timing information based on how many leading characters match. We enforced cryptographic constant-time comparison via Node.js `crypto.timingSafeEqual`:

```typescript
private verifyHmacSignature(
  provider: string,
  signature: string,
  rawBody: Buffer | string | undefined,
  payload: any,
  secret: string,
): void {
  let bodyBuffer: Buffer;
  if (Buffer.isBuffer(rawBody)) {
    bodyBuffer = rawBody;
  } else if (typeof rawBody === 'string') {
    bodyBuffer = Buffer.from(rawBody, 'utf8');
  } else {
    bodyBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');
  const signatureBuffer = Buffer.from(signature.trim(), 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    this.logger.warn(`[WEBHOOK REJECTED] Cryptographic signature mismatch for provider '${provider}'.`);
    throw new UnauthorizedException('Invalid cryptographic webhook signature.');
  }
}
```

---

## 4. Fail-Closed Production Secret Policy

If `RAZORPAY_WEBHOOK_SECRET` is unset or contains a placeholder value in production, the application **fails closed** immediately and logs a `[FATAL]` error:

```typescript
if (isProduction) {
  if (
    !configuredSecret ||
    configuredSecret.trim().length === 0 ||
    configuredSecret.includes('placeholder')
  ) {
    this.logger.error(`[FATAL] Webhook secret for '${provider}' is not configured in production.`);
    throw new Error(`CRITICAL: RAZORPAY_WEBHOOK_SECRET must be configured in production environment.`);
  }
  return configuredSecret;
}
```

---

## 5. Webhook Idempotency & Replay Protection

### 5.1 Deduplication Cache
Payment providers frequently deliver the same webhook multiple times due to network retries, timeouts, or transient network delays.
- `WebhooksService` maintains an in-memory Set of processed event IDs bounded to 10,000 entries.
- When an identical `eventId` is received, the service logs `[WEBHOOK IDEMPOTENT]`, skips duplicate business processing, and returns `status: 'SKIPPED_DUPLICATE'` with HTTP 200 OK.
- Returning HTTP 200 OK acknowledges receipt to Razorpay, preventing persistent retry storms.

### 5.2 Replay Protection (Timestamp Check)
When the `x-webhook-timestamp` header is present, the service verifies that the event timestamp is within 300 seconds (5 minutes) of current epoch time. Stale or replayed webhooks are rejected with `UnauthorizedException`.

### 5.3 Financial Sanity Validation
For `payment` and `order` events, payloads are verified:
- `amount` must be non-negative and not `NaN`.
- Currency defaults to `INR` and is logged safely.
- Sensitive payment tokens and full customer identifiers are redacted in audit logs.

---

## 6. Test Suite & Verification Results

### 6.1 Backend Webhook Suite
Executed [`18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.spec.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.service.spec.ts):
- `✔ successfully processes a valid webhook with matching raw body and HMAC signature`
- `✔ rejects an invalid / forged cryptographic signature with UnauthorizedException`
- `✔ rejects when payload is tampered after signature calculation (altered raw body)`
- `✔ rejects missing or empty signatures`
- `✔ throws fatal Error in production if RAZORPAY_WEBHOOK_SECRET is missing or empty`
- `✔ throws fatal Error in production if RAZORPAY_WEBHOOK_SECRET is a placeholder`
- `✔ returns SKIPPED_DUPLICATE on second delivery of identical event without duplicate processing`
- `✔ handles concurrent duplicate webhook processing safely`
- `✔ accepts webhooks with timestamp within 300 seconds window`
- `✔ rejects webhooks with expired timestamp (> 300s old)`
- `✔ rejects payment events with negative amount`

**Results**: 11/11 tests PASS (Jest).

### 6.2 Root Integration Suite
Executed [`__tests__/security-db-webhook-phase4.test.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/__tests__/security-db-webhook-phase4.test.ts):
- `✔ Purges all mock signature acceptance pathways from production code`
- `✔ WebhooksController extracts exact raw body and requires cryptographic signature`
- `✔ WebhooksService uses crypto.timingSafeEqual to prevent side-channel timing attacks`
- `✔ WebhooksService fails closed if RAZORPAY_WEBHOOK_SECRET is unconfigured or placeholder in production`
- `✔ HMAC verification validates identical payload and rejects tampered bytes`

**Results**: 5/5 tests PASS (node:test).

**Final Webhook Status**: **FIXED & SECURE**

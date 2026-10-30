# BHARATYATRA AI 2.0 — PHASE 10
# Payment Integration & Financial Security Specification

**System:** BharatGateway™ Commercial Integration Client  
**Module:** `lib/gateway/gateway-client.ts` & `lib/booking/unified-booking-orchestrator.ts`  
**Security Standard:** PCI-DSS Level 1 Standards & Reserve Bank of India (RBI) Tokenization Directives  

---

## 1. Gateway Overview & Architecture

BharatGateway™ is BharatYatra's centralized internal payment infrastructure. It supports all domestic payment modes:
- **Unified Payments Interface (UPI):** Virtual Payment Address (VPA) and QR-code intent flow (GPay, PhonePe, Paytm, BHIM).
- **Cards (RuPay, Visa, Mastercard):** Tokenized processing with multi-factor authentication (OTP / 3DS2).
- **NetBanking:** Direct integration across all scheduled commercial Indian banks (SBI, HDFC, ICICI, Axis, PNB).

---

## 2. Cryptographic Security & Signatures

### 2.1 Order & Payment Verification (HMAC-SHA256)
Every payment transaction is signed and verified using keyed-hash message authentication codes (HMAC-SHA256):

$$\text{Signature} = \text{HMAC-SHA256}\Big(\text{orderId} + \text{"\|"} + \text{gatewayTransactionId}, \text{ MerchantSecretKey}\Big)$$

When a callback or webhook arrives:
1. The server reconstructs the signature using the stored merchant secret.
2. Timing-safe string comparison (`crypto.timingSafeEqual`) is utilized to prevent timing attacks:
   ```typescript
   function verifySignature(expected: string, actual: string): boolean {
     const bufA = Buffer.from(expected, 'hex');
     const bufB = Buffer.from(actual, 'hex');
     return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
   }
   ```

### 2.2 Webhook Header Signature Verification
Inbound webhooks include a signature header:
`t=1729621000,v1=98418928491823918249128`
1. Extract timestamp $t$ and signature $v1$.
2. Enforce timestamp validity ($\le 300\text{ seconds}$ drift allowed) to prevent replay attacks.
3. Compute expected hash over $t + \text{"."} + \text{rawBody}$.
4. Validate signature before parsing or processing the webhook payload.

---

## 3. Strict Decoupling of Payment from Supplier Fulfillment

Under BharatYatra AI 2.0, **a successful payment NEVER equals an instant booking confirmation**.

```
[DECOUPLED TRANSACTION WORKFLOW]:
Traveler Authorizes Payment
            │
            ▼
┌─────────────────────────┐
│ BharatGateway Payment   │ ===> Status: PAYMENT_CONFIRMED
│ Funds held in clearing  │      Trip State: BOOKING_PENDING
└─────────────────────────┘
            │
            ├─► Sequential Supplier Dispatch (Transport -> Hotel -> Activity)
            │
     ┌──────┴──────┐
     ▼             ▼
[ALL SUCCEED]    [ANY COMPONENT FAILS]
     │             │
     ▼             ▼
Trip State:      Trip State: PARTIALLY_CONFIRMED
CONFIRMED        • Retain successful vouchers
                 • Trigger automated BharatGateway refund for failed item
```

---

## 4. Idempotency Key Design

Network retries must never result in duplicate debit transactions.
All payment creation requests require an `Idempotency-Key` header:
$$\text{IdempotencyKey} = \text{"idem\_ord\_"} + \text{tripBookingId} + \text{"\_"} + \text{timestamp}$$

- BharatGateway caches idempotency keys for 24 hours.
- If an order creation call is repeated with the same idempotency key, BharatGateway returns the previously generated order without creating a new record or charging the user twice.

---

## 5. Regulatory & Regulatory Data Protection

1. **No Raw Cardholder Data:** Card Primary Account Numbers (PAN), expiry dates, and CVVs are strictly handled within sandbox simulators or direct tokenization iFrames. Neither the frontend state nor application database persists unmasked PANs or CVVs.
2. **PII Sanitization:** Traveler Aadhaar numbers and Passport IDs are masked in database logs (e.g. `XXXX-XXXX-9821`) to comply with the Digital Personal Data Protection (DPDP) Act 2023.
3. **Double-Entry Clearing Ledger:** Every payment captured creates balanced double-entry accounting records (`GATEWAY_CLEARING` DEBIT vs `MERCHANT_SETTLEMENT_PAYABLE` CREDIT).

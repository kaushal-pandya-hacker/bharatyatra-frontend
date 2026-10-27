# BHARATGATEWAY™ — FINTECH CYBERSECURITY & COMPLIANCE CHECKLIST
**Version:** 1.0.0  
**Classification:** Information Security Standard (PCI DSS, CERT-In, RBI IT Governance)  

---

## 1. Authentication & Tenant Isolation
- [x] **API Key Architecture**: Publishable key (`pk_test_...`) for client SDKs; Secret key (`sk_test_...`) for server-to-server calls.
- [x] **Zero Plaintext Secrets**: Secret keys are strictly hashed with SHA-256 before database persistence. Plaintext keys are presented only once at creation.
- [x] **Tenant Scoping Guard**: Every request to merchant orders, transactions, credentials, and webhooks enforces strict tenant ownership checks. Cross-tenant leakage is strictly blocked.

---

## 2. Monetary & Ledger Integrity
- [x] **Integer Minor Units Only**: All monetary values are validated and persisted as integer minor units (paise/cents). Floating-point values and negative numbers are rejected at DTO boundary.
- [x] **Append-Only Double-Entry Ledger**: Every payment capture and refund creates balanced double-entry records ($\sum \text{Debit} = \sum \text{Credit}$). Financial history is immutable; corrections use compensating journal entries.
- [x] **Server-Authoritative Amounts**: Order amount is locked server-side at creation; client-side payment requests cannot mutate payable sums.
- [x] **Idempotency Keys**: Payment creation and refund requests enforce unique idempotency constraints to eliminate duplicate charge risks.

---

## 3. Cryptographic Webhook Security
- [x] **HMAC-SHA256 Signatures**: Webhooks dispatched with `X-BharatGateway-Signature: t=${timestamp},v1=${signature}`.
- [x] **Replay Attack Defense**: Verification algorithm validates that $| \text{now} - \text{timestamp} | \le 300\text{ seconds}$. Stale requests are rejected.
- [x] **Constant-Time Comparison**: Signature verification uses `crypto.timingSafeEqual` to neutralize timing side-channel attacks.

---

## 4. PCI DSS Card Data Protection
- [x] **Zero Card Storage**: Primary Account Numbers (PANs), CVVs, and ATM/UPI PINs are never persisted in plaintext.
- [x] **Simulation Isolation**: Simulator engine uses test card numbers only and clearly asserts `isSimulated === true`.
- [x] **Tokenization Strategy**: Direct live card processing requires PCI DSS SAQ-A tokenization proxy before bank rails activation.

---

## 5. Fraud Defense & Abuse Protection
- [x] **IP Velocity Controls**: Rolling 60-second window limiting transactions per IP address.
- [x] **High-Value Order Alerts**: Automated flagging of anomalous transaction sizes (> ₹100,000).
- [x] **Automated Risk Scoring**: 0–100 risk score engine blocking known malicious or card-testing patterns.

---

## 6. Audit Logging & CERT-In Compliance
- [x] **Automated Redaction**: PCI credentials (card numbers, CVVs, API secrets, tokens) are recursively redacted from audit logs.
- [x] **Log Retention Architecture**: Infrastructure supports 5-year tamper-evident log retention within Indian territorial jurisdiction as required by CERT-In Directions (April 2022).
- [x] **Incident Response Runbook**: Protocol established for mandatory 6-hour security incident reporting to CERT-In.

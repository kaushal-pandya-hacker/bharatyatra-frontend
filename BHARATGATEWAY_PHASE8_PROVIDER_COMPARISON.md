# BHARATGATEWAY™ — PHASE 8 PAYMENT PROVIDER PARTNER COMPARISON
## Institutional Analysis of Candidate Payment Aggregators for Hybrid Integration

- **Document ID:** `BG-PHASE8-PROV-001`
- **Classification:** Partner Due Diligence, Market Research & Integration Feasibility
- **Environment Status:** `ENVIRONMENT=SIMULATED` | `ENABLE_LIVE_PAYMENTS=false`
- **Jurisdiction:** Republic of India (Domestic INR & Cross-Border Invoicing)
- **Status:** Phase 8 Final — Technical & Commercial Provider Assessment

---

## 1. Executive Overview & Partner Selection Framework

Under the **Model C (Hybrid / Co-Branded Merchant Facilitator)** architecture selected in Phase 7, BharatGateway operates as a specialized travel-commerce technology and merchant software provider. It relies on an authorized Payment Aggregator (PA) holding a Certificate of Authorization under the Payment and Settlement Systems Act, 2007 (PSS Act) to receive, pool, and settle customer funds via an RBI-compliant bank escrow account.

To establish a viable technical and commercial integration in Phase 8, we conducted an objective, evidence-based comparative evaluation of leading Indian payment aggregator platforms:
1. **Razorpay** (Razorpay Software Private Limited / Razorpay Payments System)
2. **Cashfree Payments** (Cashfree Payments India Private Limited)
3. **Plural by Pine Labs** (Pine Labs Private Limited)
4. **PayU** (PayU Payments Private Limited)

This analysis strictly separates **publicly documented facts** (from official API documentation and partnership collateral) from **assumptions and commercial terms requiring bilateral partner confirmation**.

---

## 2. Multi-Dimensional Provider Comparison Matrix

```
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                                 PAYMENT PROVIDER EVALUATION MATRIX                                                                                    |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| Evaluation Dimension     | Razorpay                            | Cashfree Payments                   | Plural by Pine Labs                 | PayU Payments                            |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 1. Formal Partner Program| "Razorpay Partner Program"          | "Cashfree Partner / Channel Partner"| "Plural Enterprise Platform Partner"| "PayU Partner / Reseller Program"         |
|                          | (Tech Partner / Reseller / Platform)| (Referral / White-label Platform)   | (Enterprise API / Aggregator)       | (Affiliate / Platform Partner)           |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 2. Direct Merchant       | Supported. Merchant creates own RZP | Supported. Merchant signs direct    | Supported. Merchant executes direct | Supported. Merchant signs direct         |
|    Contract with Provider| account; links to BharatGateway app.| merchant agreement with Cashfree.   | merchant agreement with Pine Labs.  | agreement with PayU.                     |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 3. Sub-Merchant /        | Supported via **Razorpay Route** &  | Supported via **Cashfree Easy Split**| Supported via Enterprise Merchant   | Supported via **PayU Split Payments**    |
|    Platform Onboarding   | OAuth Partner App linking.          | & Marketplace Account APIs.         | Onboarding APIs.                    | & Marketplace APIs.                      |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 4. KYC & Merchant        | Owned 100% by Razorpay. BharatGateway| Owned 100% by Cashfree. Partner     | Owned 100% by Pine Labs compliance  | Owned 100% by PayU risk team. Partner    |
|    Underwriting Ownership| can pre-fill via Partner API.       | can submit merchant docs via API.   | team. Standard PMLA/RBI guidelines. | can assist document collection.          |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 5. Custody & Settlement  | Razorpay Nodal/Escrow Account. Settle| Cashfree Escrow Account. Direct T+1 | Pine Labs Escrow. Settle to merchant| PayU Escrow Account. Settle to merchant  |
|    of Customer Funds     | directly to merchant bank account.  | / instant settlement to merchant.   | bank account.                       | bank account.                            |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 6. Split Settlements /   | Supported via Razorpay Route        | Supported via Cashfree Easy Split   | Supported via Custom Enterprise     | Supported via PayU Split API. Configurable|
|    Marketplace Flows     | (Configurable vendor commissions).  | (Vendor split & platform fee split).| Routing & Payout Rules.             | vendor percentages & deductions.         |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 7. API Capabilities:     |                                     |                                     |                                     |                                          |
|    - Order Creation      | `POST /v1/orders`                   | `POST /pg/orders`                   | `POST /api/v1/orders`               | `POST /payment/post_payment`             |
|    - Status Verification | `GET /v1/payments/{id}`             | `GET /pg/orders/{order_id}`         | `GET /api/v1/orders/{id}`           | `POST /merchant/postservice?form=2`      |
|    - Refunds             | `POST /v1/payments/{id}/refund`     | `POST /pg/orders/{order_id}/refunds`| `POST /api/v1/refunds`              | `POST /merchant/postservice (cancel_ref)`|
|    - Webhooks            | HMAC-SHA256 (`X-Razorpay-Signature`)| HMAC-SHA256 (`x-webhook-signature`) | HMAC-SHA256 (Signature Header)      | Reverse Hash SHA-512 Verification        |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 8. Sandbox & Evidence    | Comprehensive Sandbox API. Test keys| Comprehensive Sandbox (gamma env).  | Sandbox available upon partner NDA  | Test environment available on merchant   |
|    Requirements          | generated instantly via dashboard.  | Self-serve test credentials.        | and partner account provisioning.   | registration.                            |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 9. Published Commercial  | Standard Base: 2.0% + GST on cards; | Standard Base: 1.90% - 2.0% + GST;  | Custom Enterprise Pricing.          | Standard Base: 2.0% + GST on cards;      |
|    Pricing & Commissions | 0% on UPI (P2M). Partner commission | UPI 0%. Partner revenue share       | Quotation required per merchant     | UPI 0%. Referral commission negotiable   |
|                          | negotiated via partner agreement.   | negotiable (typically 10-30 bps).   | volume commitment.                  | based on monthly volume.                 |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 10. Chargeback & Dispute | Handled via Razorpay Dashboard API. | Handled via Cashfree Dispute APIs.  | Handled via Pine Labs merchant portal| Handled via PayU Dispute Management UI.  |
|     Management           | Auto-deducted from merchant payout. | Deducted from merchant balance.     | Chargeback liaison with acquirers.  | Merchant provides proof within 3-5 days. |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
| 11. Branding & Resale    | White-label checkout supported via  | Seamless custom checkout SDK        | Full white-label and headless API   | White-label checkout allowed with partner|
|     Restrictions         | Custom Checkout / Hosted Fields.    | supported. "Powered by Cashfree"    | supported. Subject to branding      | agreement. PayU logo displayed on        |
|                          | Strict guidelines on card brand logo| required unless enterprise waiver.  | guidelines.                         | non-custom redirects.                    |
+--------------------------+-------------------------------------+-------------------------------------+-------------------------------------+------------------------------------------+
```

---

## 3. Provider Deep-Dives

### 3.1. Razorpay (Primary Candidate)

- **Official Developer Documentation:** [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Partner Program Portal:** [https://razorpay.com/partners/](https://razorpay.com/partners/)
- **API Version:** v1 REST API (`https://api.razorpay.com/v1`)
- **Key Offerings for Hybrid Platforms:**
  - **Razorpay Partner App / OAuth:** Allows merchants to authorize BharatGateway to create orders and read payment statuses on their behalf using OAuth 2.0 access tokens.
  - **Razorpay Route:** Enables automated split payments between BharatGateway (platform fee) and the travel merchant/supplier (booking amount).
  - **Custom Checkout / Standard Checkout:** Secure JavaScript SDK (`checkout.js`) that handles card tokenization directly against Razorpay's PCI DSS Level 1 Cardholder Data Environment.
- **Verified Technical Strengths:**
  - Mature sandbox with predictable test card numbers, simulated UPI VPA addresses, and failure testing headers (`x-mock-status`).
  - Webhooks support granular events (`payment.captured`, `payment.failed`, `refund.processed`, `settlement.processed`).
- **Assumptions Requiring Bilateral Confirmation:**
  - Whether Razorpay permits programmatic sub-merchant KYC document upload via API without redirecting the merchant to the Razorpay native dashboard.
  - The exact commercial revenue-share split (e.g. 20 bps vs 35 bps) on BharatGateway-referred travel merchants.
  - Specific rolling reserve requirements for high-ticket travel itineraries (e.g. tour packages > ₹50,000).

---

### 3.2. Cashfree Payments (Strong Alternative)

- **Official Developer Documentation:** [https://www.cashfree.com/docs/](https://www.cashfree.com/docs/)
- **Partner Program Portal:** [https://www.cashfree.com/partners/](https://www.cashfree.com/partners/)
- **API Version:** 2023-08-01 / PG v2 REST API (`https://sandbox.cashfree.com/pg`)
- **Key Offerings for Hybrid Platforms:**
  - **Cashfree Easy Split / Marketplace:** Highly optimized for travel platforms and multi-vendor marketplaces. Automatically splits booking revenue between tour operators, hotels, and platform commissions.
  - **Partner Onboarding API:** Fully documented REST APIs to onboard sub-merchants, upload PAN/GSTIN, and track verification status programmatically.
  - **Cashfree Verification Suite:** Native integration with Bank Account Verification (Penny Drop), PAN, and GSTIN APIs.
- **Verified Technical Strengths:**
  - Superior programmatic merchant onboarding and split-settlement API design compared to competitors.
  - Dedicated sandbox environment (`sandbox.cashfree.com`) with instant API keys.
- **Assumptions Requiring Bilateral Confirmation:**
  - Approval for high-risk travel merchant onboarding and specific flight/cancellation refund policies.
  - Partner revenue-share payout frequency (monthly vs per-settlement credit).
  - Formal contractual requirements for platform indemnity against merchant chargebacks.

---

### 3.3. Plural by Pine Labs & PayU Payments (Enterprise Options)

- **Plural by Pine Labs:**
  - *Documentation:* [https://pluralonline.com/docs/](https://pluralonline.com/docs/)
  - *Positioning:* Best suited for large enterprise merchants and omnichannel retail/travel chains requiring deep POS and online integration.
  - *Assessment:* Less self-serve for early-stage platforms; requires bilateral enterprise sales engagement and customized contractual agreements.
- **PayU Payments:**
  - *Documentation:* [https://devguide.payu.in/](https://devguide.payu.in/)
  - *Positioning:* Massive scale across Indian e-commerce, strong success rates on domestic card networks.
  - *Assessment:* API design uses legacy reverse-hash verification algorithms for certain endpoints alongside newer REST APIs, requiring additional cryptographic adapter logic.

---

## 4. Separation of Public Facts vs. Unverified Commercial Assumptions

```
+---------------------------------------------------------------------------------------------------------+
|                               FACTUAL DISCLOSURE & ASSUMPTION REGISTRATION                              |
+----------------------------------------------------+----------------------------------------------------+
| Publicly Documented & Verified Facts               | Unconfirmed Assumptions (Requiring Partner Terms)  |
+----------------------------------------------------+----------------------------------------------------+
| 1. Razorpay and Cashfree provide dedicated sandbox | 1. Specific partner revenue-share commission rates |
|    APIs and instant test key generation.           |    (assumed between 0.15% and 0.40%).              |
| 2. Both providers support split settlement         | 2. Pre-approval of BharatGateway's travel agency   |
|    (Razorpay Route, Cashfree Easy Split).          |    sub-merchant risk profile.                      |
| 3. Customer funds settle directly into provider-   | 3. Waiver of provider branding on custom white-    |
|    operated escrow accounts, not platform accounts.|    label travel checkout iframes.                  |
| 4. Providers are authorized by RBI as Payment      | 4. Contractual liability split in the event of an  |
|    Aggregators under the PSS Act, 2007.            |    insolvent merchant travel cancellation cascade. |
| 5. APIs use standard HMAC-SHA256 webhook signatures| 5. Programmatic KYC document upload without direct |
|    and idempotency request headers.                |    merchant login to provider portal.              |
+----------------------------------------------------+----------------------------------------------------+
```

---

## 5. Strategic Selection & Phase 8 Priority

1. **Primary Integration Target: Razorpay**
   - The current codebase already includes a deterministic `RazorpaySandboxAdapter` with authoritative signature verification implemented in Phase 6. Completing a real sandbox connection requires only real sandbox API keys (`rzp_test_...`) without architectural rework.
2. **Secondary Fallback & Marketplace Target: Cashfree Payments**
   - Cashfree’s Easy Split API represents the cleanest architectural match for travel package splitting between tour operators and platform commissions. Designing the Phase 8 adapter layer to be provider-agnostic preserves optionality for Cashfree integration.

*Report Prepared By: Senior Fintech Architect & Payment Partner Systems Specialist*  
*Approved For: BharatGateway Phase 8 Due Diligence Archive*

# BHARATGATEWAY™ — PHASE 7 REGULATORY ASSESSMENT REPORT
## Indian Payments Regulatory Landscape, Statutory Mandates & Compliance Taxonomy

- **Document ID:** `BG-PHASE7-REG-001`
- **Classification:** Regulatory Intelligence & Legal Feasibility Study
- **Environment:** `ENVIRONMENT=SIMULATED` | `ENABLE_LIVE_PAYMENTS=false`
- **Target Jurisdiction:** Republic of India (Reserve Bank of India & Ministry of Finance)
- **Status:** Phase 7 Final — Architecture & Legal Risk Review

---

## 1. Executive Summary

This report provides an authoritative assessment of the Indian payments regulatory framework applicable to the **BharatGateway™** payment platform. 

The BharatGateway codebase currently implements core payment gateway software capabilities:
- Cryptographic merchant authentication and API key lifecycle management
- Multi-tenant order creation, payment capture, and double-entry bookkeeping ledger
- Distributed locking (`bg_distributed_locks`) and optimistic concurrency controls
- Two-tier balance-safe refund processing with state machine integrity
- Automated four-way financial reconciliation (`gateway-reconciliation.service.ts`)
- Idempotent webhook delivery with HMAC-SHA256 signature generation and replay prevention
- Deterministic sandbox provider abstraction (`RazorpaySandboxAdapter`)

**Crucial Finding:** Owning production-grade payment gateway software, possessing automated unit and integration tests, and incorporating a business entity in India **do not** confer legal authorization to collect, pool, handle, or settle funds originating from customers on behalf of merchants. 

In India, payment aggregation is a strictly regulated financial activity governed by the **Payment and Settlement Systems Act, 2007 (PSS Act 2007)** under the statutory oversight of the **Reserve Bank of India (RBI)**. Operating an unlicensed payment aggregation service constitutes a non-bailable statutory offense under Section 25 and Section 26 of the PSS Act.

Therefore, this regulatory assessment categorizes all applicable legal, technical, and operational mandates into three unambiguous tiers:
1. **Confirmed Legal Mandates (Supported by Primary Regulatory Sources)**
2. **Potentially Applicable Requirements (Subject to Business Model & Legal Counsel Review)**
3. **Industry Best Practices & Commercial Recommendations (Non-Statutory)**

---

## 2. Regulatory Taxonomy & Primary Source Citations

The table below outlines the primary statutory instruments, RBI circulars, government directions, and security standards governing digital payment systems in India.

| Ref # | Issuing Authority | Instrument / Circular Number | Date / Version | Title / Subject Matter | Statutory Basis |
|---|---|---|---|---|---|
| **PS-01** | Parliament of India | Act No. 51 of 2007 | Dec 20, 2007 (Enacted Aug 12, 2008) | **Payment and Settlement Systems Act, 2007 (PSS Act)** | Union List Entry 46 (Banking), Entry 36 |
| **PS-02** | Reserve Bank of India (DPSS) | `DPSS.CO.PD.No.1810/02.14.008/2019-20` | March 17, 2020 (Updated March 31, 2021) | **Guidelines on Regulation of Payment Aggregators and Payment Gateways** | Section 10(2) read with Section 18, PSS Act 2007 |
| **PS-03** | Reserve Bank of India (DPSS) | `CO.DPSS.POLC.No.S-106/02-14-008/2024-25` | April 16, 2024 | **Draft Directions on Regulation of Payment Aggregators (PA-P and PA-O)** | Sections 10(2) and 18, PSS Act 2007 |
| **PS-04** | Reserve Bank of India (DPSS) | `DPSS.CO.OD.No.2785/06.08.005/2017-18` | April 6, 2018 | **Storage of Payment System Data (Data Localization)** | Section 10(2) read with Section 18, PSS Act 2007 |
| **PS-05** | Reserve Bank of India (DPSS) | `DPSS.CO.PD No.S-516/02-14-003/2021-22` & `CO.DPSS.POLC.No.S-518/02-14-003/2022-23` | Sept 7, 2021 & July 28, 2022 | **Card-on-File Tokenization (COFT) & Device-Based Tokenization** | Section 10(2) read with Section 18, PSS Act 2007 |
| **PS-06** | Reserve Bank of India (DPSS) | `DPSS.CO.PD No.629/02.01.014/2019-20` | September 20, 2019 | **Harmonisation of Turn Around Time (TAT) and Customer Compensation for Failed Transactions** | Section 18, PSS Act 2007 |
| **PS-07** | Reserve Bank of India (DBR/DOR) | `DBR.AML.BC.No.81/14.01.001/2015-16` (Regularly Updated) | Feb 25, 2016 (Updated Nov 2023) | **Master Direction – Know Your Customer (KYC) Direction, 2016** | Prevention of Money Laundering Act, 2002 (PMLA) |
| **PS-08** | Ministry of Law & Justice, GoI | Act No. 22 of 2023 | August 11, 2023 | **Digital Personal Data Protection Act, 2023 (DPDP Act)** | Constitution of India (Right to Privacy - Puttaswamy) |
| **PS-09** | MeitY / CERT-In | `No. 20(3)/2022-CERT-In` | April 28, 2022 | **Cybersecurity Directions on Information Security Practices & Incident Reporting** | Section 70B(6), Information Technology Act, 2000 |
| **PS-10** | PCI Security Standards Council | PCI DSS v4.0.1 | June 2024 (Mandatory March 31, 2025) | **Payment Card Industry Data Security Standard (PCI DSS)** | Card Network Operating Regulations (Visa, Mastercard, RuPay) |

---

## 3. Detailed Regulatory Deep-Dive

### 3.1. Payment Aggregator (PA) vs. Payment Gateway (PG) Legal Boundary

The RBI Guidelines of March 17, 2020 explicitly draw a structural and legal distinction between **Payment Aggregators (PAs)** and **Payment Gateways (PGs)**:

```
+---------------------------------------------------------------------------------------+
|                                    RESERVE BANK OF INDIA                              |
|                                    (Regulatory Umbrella)                               |
+---------------------------------------------------------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
+--------------------------------------+       +--------------------------------------+
|       PAYMENT AGGREGATOR (PA)        |       |        PAYMENT GATEWAY (PG)          |
|         (Regulated Entity)           |       |      (Technology Service Provider)   |
+--------------------------------------+       +--------------------------------------+
| 1. Directly onboards merchants.      |       | 1. Pure technology infrastructure.   |
| 2. Receives and pools customer funds.|       | 2. Never handles, touches, or pools  |
| 3. Operates nodal/escrow accounts.   |       |    customer or merchant funds.       |
| 4. Executes payouts/settlements.     |       | 3. Routes encrypted messages between |
| 5. Requires RBI PSS Act License.     |       |    merchants, banks, and PAs.        |
| 6. Net worth: ₹15 Cr -> ₹25 Cr.      |       | 4. Recommended IT & baseline security|
+--------------------------------------+       +--------------------------------------+
```

#### Detailed Breakdown:
- **Payment Aggregator (PA):** Defined under Paragraph 1.1 as entities that facilitate e-commerce sites and merchants to accept various payment instruments from the customers for completion of their payment obligations without the need for merchants to create a separate payment integration system of their own. PAs facilitate merchants to connect with acquirers. In the process, they **receive payments from customers, pool and transfer them on to the merchants** after a time period.
  - *Statutory Requirement:* Non-bank PAs **must** obtain prior authorization from RBI under Section 4 of the PSS Act, 2007.
  - *Capital Requirements:* Minimum net worth of **₹15 Crore** at the time of application, stepping up to **₹25 Crore** by the end of the third financial year of authorization, maintained perpetually thereafter.
  - *Foreign Direct Investment (FDI):* Governed by Consolidated FDI Policy and FEMA regulations for NBFC/financial services.
- **Payment Gateway (PG):** Defined under Paragraph 1.2 as entities that provide technology infrastructure to route and facilitate processing of an online payment transaction without any handling of funds.
  - *Statutory Requirement:* PGs are considered **Technology Service Providers (TSPs)**. They do **not** require a direct PSS Act Section 4 authorization license, provided they **never** hold, control, pool, or direct customer money.
  - *Compliance Obligations:* They must comply with baseline technology and security recommendations prescribed in Annex 2 of the March 17, 2020 Guidelines (e.g., encryption, vulnerability management, audit trails, and data storage limits).

### 3.2. Escrow & Settlement Mechanics (Paragraph 8, March 17, 2020 Guidelines & April 2024 Draft)

If BharatGateway were to operate as a licensed PA, funds collected from customers must follow rigid statutory ring-fencing:
1. **Designated Escrow Account:** All customer payments must be routed directly into an Escrow Account maintained with a Scheduled Commercial Bank (SCB).
2. **Permissible Credits:**
   - Customer payments towards purchase of goods/services.
   - Pre-funding by merchants.
   - Transfer from an escrow account of another PA for refunds/inter-PA transfers.
3. **Permissible Debits:**
   - Payment to merchants towards goods/services sold.
   - Payment to settlement partners (acquirers, card networks, payment aggregators).
   - Refunds to customers for cancelled or failed transactions.
   - Charges/commissions payable to PA (only when backed by transparent merchant agreements).
4. **Prohibited Actions:** No interest can be earned on escrow balances (unless converted into Core Banking sweep accounts under strict RBI conditions). No advances or lending may be extended from escrow funds.
5. **Settlement Timelines:**
   - Credit to merchant settlement account must occur within **T + 1** or **T + 2** business days (where `T` is the date of intimation of completion of transaction/delivery of goods, as contractually defined).
   - In no circumstance may funds remain in intermediate accounts beyond statutory settlement windows.

### 3.3. Merchant Onboarding, KYC & Underwriting (Paragraph 6, Guidelines)

Under Paragraph 6 of the March 2020 Guidelines and Section 7 of the April 2024 Draft Directions:
- Every PA must have a **Board-Approved Merchant Onboarding and Due Diligence Policy**.
- PAs must perform comprehensive background and KYC checks on merchants in accordance with the **RBI Master Direction on Know Your Customer (KYC), 2016** and the **Prevention of Money Laundering Act, 2002 (PMLA)**.
- Specific checks include:
  - Verification of entity legal existence (MCA registration, GSTIN verification, PAN validation).
  - Identification and screening of Beneficial Owners (BOs) against domestic and international sanctions lists (UN Sanctions, UAPA, OFAC, INTERPOL).
  - Physical or digital site verification of merchant's operating website/app to ensure no sale of fake goods, illegal services, prohibited substances, unlicensed lottery/gambling, or adult content.
  - Assessment of merchant's financial standing, chargeback history, and business risk profile.

### 3.4. Payment Data Storage & Localization (DPSS Circular April 6, 2018)

Under RBI Circular `DPSS.CO.OD.No.2785/06.08.005/2017-18`:
1. **Unconditional 100% Data Localization:** The entire payment system data relating to payment transactions operated by payment system operators (and their service providers/vendors) **must be stored in a system only in India**.
2. **Data Scope:** Includes end-to-end transaction details, customer data (Name, Mobile, Email, Aadhaar/PAN where collected), payment credentials, order details, ledger records, audit logs, and timestamps.
3. **Cross-Border Processing Restriction:** If a payment transaction involves a foreign component (e.g., international cards), data may be processed offshore if necessary, but must be transferred back to India within **24 hours** and completely erased from overseas servers.

### 3.5. Card-on-File Tokenization (COFT) & Card Data Handling

Under RBI Circulars `DPSS.CO.PD No.S-516/02-14-003/2021-22` (Sept 7, 2021) and `CO.DPSS.POLC.No.S-518/02-14-003/2022-23` (July 28, 2022):
1. **Card Data Storage Ban:** With effect from October 1, 2022, **no entity in the card transaction/payment chain, other than the card networks and card issuing banks, shall store the actual card number (Primary Account Number - PAN), Card Verification Value (CVV), or card expiry date**.
2. **Permissible Limited Storage:** Merchants and PAs may only store:
   - The token reference / tokenized card surrogate issued by an authorized token service provider (card network).
   - The last 4 digits of the card number and the card issuer bank name (strictly for customer transaction identification and dispute tracking).
3. **Implication for BharatGateway:** BharatGateway must **never** store raw 16-digit PANs or CVVs in its PostgreSQL database (`bg_orders`, `bg_payments`, or audit logs). Any checkout interface must use client-side iframe tokenization or redirect to authorized banking/tokenization gateways.

### 3.6. Turn Around Time (TAT) and Failed Transaction Compensation (Circular Sept 20, 2019)

Under RBI Circular `DPSS.CO.PD No.629/02.01.014/2019-20`:
1. **Harmonized TAT Framework:** Strict timelines apply to auto-reversals and refund credits for failed electronic transactions.
2. **UPI / IMPS / E-Commerce Card Transactions:**
   - If customer account is debited but merchant does not receive confirmation (dropped/timed out): Auto-reversal must be initiated within **T + 1 business day**.
   - If reversal is not credited to the customer within `T + 1`: The responsible entity must pay compensation to the customer at the rate of **₹100 per day of delay** beyond `T + 1`, directly to the customer's account without requiring a formal customer complaint.
3. **Technical Implication:** The reconciliation engine (`gateway-reconciliation.service.ts`) and refund engine (`gateway-refund.service.ts`) built in Phase 4 & Phase 5 must execute daily at midnight to detect uncaptured debits and issue automated reverse requests within 24 hours.

### 3.7. Digital Personal Data Protection Act, 2023 (DPDP Act 2023)

Enacted on August 11, 2023 (Act No. 22 of 2023):
- **Data Fiduciary Responsibilities:** BharatGateway operates as a Data Fiduciary for merchant data and a Data Processor/Fiduciary for customer payment information.
- **Notice and Consent:** Explicit, clear, and itemized consent notices must accompany checkout interfaces.
- **Data Minimization:** Processing is strictly limited to transaction execution, fraud detection, and regulatory record keeping.
- **Breach Notification:** Mandatory notification of any personal data breach to the Data Protection Board of India and impacted Data Principals (penalties up to ₹250 Crore per incident).

### 3.8. CERT-In Incident Reporting & Log Retention (April 28, 2022)

Under Directions `No. 20(3)/2022-CERT-In`:
1. **6-Hour Reporting Window:** Any cybersecurity incident (including ransomware attacks, API key exposure, unauthorized database access, DDoS, or payment tampering) must be reported to the Indian Computer Emergency Response Team (CERT-In) within **6 hours** of detection.
2. **5-Year Log Retention:** System, security, and transaction logs must be stored within Indian jurisdiction for a rolling window of **5 consecutive years**.
3. **NTP Synchronization:** All system clocks across application servers, database instances, and load balancers must synchronize with the National Physical Laboratory (NPL) or NIC standard time servers.

### 3.9. PCI DSS v4.0.1 Compliance

Under Card Network rules (RuPay, Visa, Mastercard):
- **Scope Definition:** Any system storing, processing, or transmitting Cardholder Data (CHD) or Sensitive Authentication Data (SAD), or that can affect the security of the Cardholder Data Environment (CDE).
- **Self-Assessment Questionnaires (SAQ):**
  - *SAQ A:* If BharatGateway completely offloads card input to an authorized third-party iframe or hosted checkout page (no card data touches BharatGateway servers).
  - *SAQ D-SP:* If BharatGateway directly accepts, inspects, or routes raw card data (requires full on-site audit by a Qualified Security Assessor / QSA, penetration testing, ASV scans, and formal Attestation of Compliance - AoC).

---

## 4. Confirmed vs. Interpreted vs. Commercial Requirements

To guide legal counsel and management, the table below partitions all requirements into three actionable tiers.

### Tier 1: Confirmed Statutory Mandates (Non-Negotiable Indian Law)
These requirements are codified in gazetted statutes, RBI circulars, or statutory rules. Failure to comply brings criminal prosecution, severe monetary fines, or mandatory business shutdown.

```
+---------------------------------------------------------------------------------------------------------+
|                                  TIER 1: CONFIRMED STATUTORY MANDATES                                   |
+---------------------------------------------------------------------------------------------------------+
| 1. Section 4 PSS Act License: No entity may pool/settle merchant funds without RBI PA Authorization.     |
| 2. Net Worth Barrier: Non-bank PAs must possess ₹15 Cr net worth (application) -> ₹25 Cr (year 3).     |
| 3. Mandatory Escrow Account: All merchant funds must sit in an SCB Escrow; zero proprietary commingling.|
| 4. Card-on-File Storage Ban: Absolute prohibition against storing raw PAN, CVV, or expiry dates.       |
| 5. 100% Data Localization: All payment system, ledger, and customer data must be stored in India.       |
| 6. TAT Harmonization: Auto-reversals must occur within T+1; ₹100/day penalty for delayed customer refund|
| 7. CERT-In Incident Notification: 6-hour mandatory reporting window for any security breach.            |
| 8. 5-Year Log Retention: Financial and audit logs must be retained inside India for 5 years.           |
+---------------------------------------------------------------------------------------------------------+
```

### Tier 2: Potentially Applicable Requirements (Subject to Legal & Structural Interpretation)
These requirements depend entirely on the chosen operating model (Model A vs. Model B vs. Model C) and require formal written legal opinions from qualified Indian payments counsel:

```
+---------------------------------------------------------------------------------------------------------+
|                                TIER 2: STRUCTURAL / INTERPRETIVE MATTERS                                |
+---------------------------------------------------------------------------------------------------------+
| 1. Technology Service Provider (TSP) Exemption: Operating as a pure PG under Model A does not require    |
|    a PSS Act license, provided BharatGateway never appears in the fund settlement flow.                 |
| 2. White-Label Aggregation / Reseller Framework: Under Model C, can BharatGateway contractually onboard|
|    merchants on behalf of a licensed PA (e.g. Razorpay/Cashfree) without being deemed an unlicensed PA?|
| 3. Sub-Merchant Classification: Under RBI guidelines, does BharatGateway's travel supplier portal       |
|    constitute a marketplace operator, or does it trigger PA regulations for marketplace settlement?     |
| 4. GST Treatment on Technical Platform Fees vs. MDR: GST applicability (18%) on software SaaS licensing |
|    versus MDR commission deduction under Section 194S / 194-O Income Tax Act.                            |
| 5. Grievance Nodal Officer Mandate: Whether a TSP must appoint an RBI Integrated Ombudsman Scheme     |
|    Principal Nodal Officer if it does not directly operate the settlement escrow account.               |
+---------------------------------------------------------------------------------------------------------+
```

### Tier 3: Commercial & Operational Recommendations (Best Practices)
These are not statutory requirements under Indian law, but are required by enterprise merchants, acquiring banks, or insurance underwriters:

```
+---------------------------------------------------------------------------------------------------------+
|                             TIER 3: COMMERCIAL & OPERATIONAL RECOMMENDATIONS                            |
+---------------------------------------------------------------------------------------------------------+
| 1. Cyber Insurance Coverage: Maintaining a ₹10 Cr - ₹25 Cr commercial cyber liability policy.          |
| 2. ISO/IEC 27001:2022 Certification: International Information Security Management System certification.|
| 3. SOC 2 Type II Compliance: Trust Services Criteria audit for security, availability, and privacy.     |
| 4. Redundant Cloud Disaster Recovery (DR): Active-active or hot-standby multi-region architecture      |
|    with Recovery Time Objective (RTO) < 15 minutes and Recovery Point Objective (RPO) < 1 minute.      |
| 5. Automated Fraud Machine Learning: Real-time velocity rules and device fingerprinting to minimize     |
|    merchant chargebacks below card network thresholds (0.9% transaction count / 1.0% volume).           |
+---------------------------------------------------------------------------------------------------------+
```

---

## 5. Technical Architecture Implications on Existing Codebase

The regulatory mandates directly inform how the current BharatGateway codebase must be operated and constrained:

1. **`bg_payments` & `bg_orders` Tables:**
   - Must strictly verify that no card numbers, CVVs, or bank account passwords are saved in plaintext or ciphertext. 
   - Existing schema stores only `order_id`, `amount_in_cents`, `currency`, `provider_ref`, and status tokens. This complies with RBI COFT storage guidelines.
2. **`gateway-reconciliation.service.ts`:**
   - Must be configured to execute at `T+1` (daily automated cron) to fulfill RBI's TAT Harmonization mandate for failed transaction auto-reversal.
3. **`bg_distributed_locks` & Concurrency:**
   - The PostgreSQL distributed locking implemented in Phase 5 protects against double-payouts and duplicate refund race conditions, directly fulfilling the financial audit trail integrity required by RBI baseline security standards.
4. **Data Localization Deployment:**
   - In Phase 8/9 deployment planning, all Docker containers, Supabase/PostgreSQL instances, Redis instances, and object storage buckets **must be hosted strictly in Indian AWS/GCP regions** (e.g., `ap-south-1` Mumbai or `ap-south-2` Hyderabad).

---

## 6. Regulatory Risk Analysis & Strategic Conclusion

| Strategic Question | Regulatory Reality | Recommended BharatGateway Position |
|---|---|---|
| Can BharatGateway legally collect customer payments today? | **NO.** BharatGateway possesses neither an RBI PA authorization nor a bank escrow account. | Maintain `ENABLE_LIVE_PAYMENTS=false` and `ENVIRONMENT=SIMULATED`. |
| Can BharatGateway market itself as an RBI-regulated Payment Aggregator? | **NO.** Representing an unlicensed entity as authorized violates Section 25, PSS Act. | Market strictly as a specialized travel commerce & checkout technology software suite. |
| What is the viable immediate path to commercial operations? | **Model A (TSP) or Model C (Hybrid Partner).** Partner with an RBI-licensed PA (e.g., Razorpay, Cashfree, BillDesk) or acquiring bank. | Pursue Model A/C in Phase 8; defer direct Model B PA licensing until ₹25 Cr capital is secured. |

*Report Prepared By: Senior Fintech Compliance & Payments Architecture Team*  
*Approved For: Phase 7 Architecture & Regulatory Audit*

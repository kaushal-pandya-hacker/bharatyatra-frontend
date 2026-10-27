# BHARATGATEWAY™ — REGULATORY & COMPLIANCE FRAMEWORK (INDIA)
**Document Ref:** BG-LEGAL-2026-V1  
**Jurisdiction:** Republic of India  
**Target Entities:** Reserve Bank of India (RBI), National Payments Corporation of India (NPCI), CERT-In, Financial Intelligence Unit (FIU-IND)  
**Classification:** Fintech Legal, Governance & Regulatory Compliance Blueprint  

> [!CAUTION]
> **LEGAL & REGULATORY DISCLAIMER:**
> This document is an architectural and compliance engineering research reference prepared for software design purposes. It does **not** constitute formal legal advice or regulatory authorization. Operating a live payment aggregation or clearing business in India requires formal approval/in-principle authorization from the Reserve Bank of India under Section 4 of the Payment and Settlement Systems Act, 2007, formal commercial arrangements with Scheduled Commercial Banks, and execution of merchant agreements under the guidance of qualified Indian fintech legal counsel.

---

## 1. Statutory Foundations & The Technical Gateway vs. Payment Aggregator Demarcation

In India, payment intermediary activities are regulated primarily under the **Payment and Settlement Systems Act, 2007 (PSSA)** and the **RBI Guidelines on Regulation of Payment Aggregators and Payment Gateways** (Circular DPSS.CO.PD.No.1810/02.14.008/2019-20 dated March 17, 2020, and subsequent updates including the Draft Directions for PAs dated April 2024).

### Key Legal Demarcation:

| Attribute | Technical Payment Gateway (PG) | Payment Aggregator (PA) |
| :--- | :--- | :--- |
| **Primary Definition** | Technology infrastructure provider facilitating the routing of digital transaction data without handling merchant funds. | Intermediary that collects funds from customers on behalf of merchants, pools them, and settles them into merchant accounts. |
| **Handling of Funds** | **Zero fund handling.** Monies flow directly from acquiring bank to merchant. | **Active fund pooling.** Funds must flow through a designated **Escrow Account** maintained with a Scheduled Commercial Bank (SCB). |
| **RBI Authorization** | Does **not** require direct authorization under Section 4 of PSSA 2007, but must adhere to baseline IT and cybersecurity mandates (Appendix 2 of RBI PA/PG Guidelines). | **Mandatory Authorization** under Section 4 of PSSA 2007. Operating without RBI authorization is a non-bailable statutory offense. |
| **Net Worth Requirement** | Not statutorily prescribed by RBI (subject to commercial bank vendor due diligence). | **₹15 Crore** at time of application; must increase to **₹25 Crore** by the end of the third financial year, maintained continuously. |
| **BharatGateway Posture** | **Current Stage (Stage 1):** Independent software infrastructure & simulation engine. Can be deployed as a pure technology routing gateway.<br>**Future Stage (Stage 2):** To operate as a direct aggregator, formal RBI authorization and escrow banking are legally mandatory. |

---

## 2. RBI Payment Aggregator (PA) Authorization & Capital Requirements

If BharatGateway transitions from a software engine to a full commercial payment aggregator handling funds:

1. **Corporate Vehicle**: Must be an Indian company incorporated under the Companies Act, 2013. The Memorandum of Association (MoA) must specifically identify payment aggregation as a primary business activity.
2. **Net Worth Proof**:
   - Certificate from Statutory Auditor certifying net worth of $\ge ₹15\text{ Crore}$ at application.
   - Escalation to $\ge ₹25\text{ Crore}$ within 3 financial years.
   - Net worth calculation: Paid-up equity capital + Free reserves + Preference shares (convertible) - Accumulated losses - Intangible assets.
3. **Governance & Fit-and-Proper Criteria**:
   - Directors and key management personnel must meet RBI's "Fit and Proper" norms (clean CIBIL/credit record, no ongoing criminal or economic offense investigations by ED/EOW/CBI).
   - Foreign Direct Investment (FDI) must comply with consolidated FDI Policy and FEMA regulations.

---

## 3. Escrow Account Operations & Settlement Timelines (PSSA Section 23A)

Under RBI regulations, a Payment Aggregator is strictly prohibited from holding customer funds in an ordinary current account.

1. **Designated Escrow Account**:
   - Must be opened with one Scheduled Commercial Bank (SCB) under Section 23A of the PSSA.
   - Permitted Credits: Customer payments, refunds from merchants, transfer between internal escrows.
   - Permitted Debits: Settlements to merchants, payment of commission/fees to PG/banks, refunds to customers.
   - Non-permissible Debits: Operational expenses of the aggregator, salaries, dividends, or interest.
2. **Settlement Windows**:
   - Customer payment receipt: Day $T$.
   - Credit to Aggregator Escrow: Day $T+1$ (maximum).
   - Final Settlement to Merchant: Day $T+2$ (or maximum $T+3$ as contractually agreed).
   - Escrow accounts cannot earn interest unless a core-banking auto-sweep arrangement with specific SCB conditions is established under RBI guidance.

---

## 4. NPCI & Unified Payments Interface (UPI) Framework

To offer direct UPI payment acceptance without commercial intermediaries:

1. **TPAP vs. Direct Member Bank Participant**:
   - An independent gateway cannot connect directly to NPCI's core network unless it is a recognized bank or operates under a **Third Party Application Provider (TPAP)** agreement sponsored by a **PSP (Payment Service Provider) Bank** (e.g., ICICI, HDFC, Axis, SBI).
2. **UPI AutoPay & Intent Architecture**:
   - Integration requires compliance with NPCI UPI Procedural Guidelines.
   - Strict checksum verification using SHA-256 with the PSP bank's secret key.
   - Replay protection: Transaction references (`txnRefId`) must be globally unique across a 180-day window.
3. **Zero MDR Rule (Payment and Settlement Systems Act Amendment 2019)**:
   - Section 10A of PSSA mandates that no Merchant Discount Rate (MDR) can be charged to customers or merchants for transactions conducted via UPI or RuPay debit cards.
   - Revenue must be generated through value-added merchant SaaS, enterprise analytics, invoicing software, and customized reconciliation services.

---

## 5. PCI DSS v4.0 Scoping & Card Data Security

Under RBI guidelines, **no entity in the transaction chain other than card networks and issuing/acquiring banks may store customer card credentials (PAN, CVV, PIN, Expiry).**

1. **Card-on-File Tokenization (CoFT)**:
   - Merchant or gateway must integrate with RBI-authorized Token Requestors (Visa, Mastercard, RuPay, or issuing banks).
   - Only authorized network tokens and cryptograms may be stored; plaintext 16-digit Primary Account Numbers (PANs) are strictly prohibited.
2. **Scoping Under BharatGateway Architecture**:
   - **Checkout Simulator:** Operates strictly with test card ranges (e.g. `4000-0000-0000-XXXX`) and zero real PAN ingestion.
   - **Production Card Routing:** Requires deployment of an isolated Tokenization Proxy or use of client-side Iframe / hosted field SDKs that achieve **PCI DSS SAQ-A** compliance (outsourcing PAN capture directly to the tokenizing vault).

---

## 6. Data Protection, Cybersecurity & CERT-In Directives

1. **CERT-In Cyber Security Directions (April 28, 2022)**:
   - **6-Hour Mandatory Incident Reporting**: Any security compromise, unauthorized data access, DDoS, or payment tampering must be reported to the Indian Computer Emergency Response Team (CERT-In) within 6 hours of discovery.
   - **Log Retention**: Transaction logs, API access logs, audit trails, and system access history must be securely maintained within Indian jurisdiction for a minimum of **5 years**.
   - **NTP Synchronization**: All server clocks (database, API instances, background workers) must synchronize via approved National Physical Laboratory (NPL) or NIC NTP servers.
2. **Digital Personal Data Protection Act, 2023 (DPDP Act)**:
   - Customer and merchant user consent must be explicitly recorded before collecting personal identifiers (email, phone, PAN card for KYC).
   - Purpose limitation: Payment data cannot be cross-monetized for advertising without separate, granular opt-in consent.
   - Data Principal rights: Mechanisms for data erasure, correction, and grievance redressal must be exposed.

---

## 7. Merchant Due Diligence, KYC & Anti-Money Laundering (AML)

1. **Know Your Merchant (KYM)**:
   - Verification of Certificate of Incorporation, GSTIN registration, PAN of business and promoters.
   - Verification of merchant bank account via Penny-Drop API before initiating settlements.
   - Website/App Audit: Merchant must have active terms of service, refund policy, grievance officer details, and customer support contacts publicly accessible.
2. **PMLA (Prevention of Money Laundering Act, 2002)**:
   - Transaction monitoring rules to detect structured layering (smurfing: multiple transactions just below ₹50,000 reporting thresholds).
   - Reporting of Suspicious Transaction Reports (STRs) and Cash Transaction Reports (CTRs) to FIU-IND.

---

## 8. Authoritative References & Source Citations

| Governing Body | Document Title | Official Citation | Key Subject Matter |
| :--- | :--- | :--- | :--- |
| **Reserve Bank of India** | Guidelines on Regulation of Payment Aggregators and Payment Gateways | RBI/DPSS/2019-20/174 | Net worth, Escrow, Merchant KYC, IT Governance |
| **Reserve Bank of India** | Draft Directions for Regulation of Payment Aggregators | RBI/2023-24/Draft (Apr 2024) | Physical POS aggregators, tightened board oversight |
| **Parliament of India** | Payment and Settlement Systems Act, 2007 | Act No. 51 of 2007 | Section 4 (Authorization), Section 23A (Escrow) |
| **NPCI** | Unified Payments Interface (UPI) Procedural Guidelines | NPCI/UPI/OC-87/2020-21 | TPAP specs, zero MDR, intent flow standards |
| **PCI SSC** | Payment Card Industry Data Security Standard v4.0 | PCI-DSS v4.0 (2024) | Encryption, key management, SAQ A scoping |
| **CERT-In** | Directions under sub-section (6) of section 70B of the IT Act, 2000 | No. 20(3)/2022-CERT-In | 6-hour incident report, 5-year log retention |
| **Parliament of India** | Digital Personal Data Protection Act, 2023 | Act No. 22 of 2023 | Consent architecture, privacy rights, penalties |

---

## 9. Concrete Roadmap to Commercial Authorization

```
[Phase 1: Software & Simulator Engine] ──(Current Milestone: Functional, Audited, Zero Money Moved)
                  │
                  ▼
[Phase 2: Entity Incorporation & Capitalization]
  - Form Fintech Private Limited Company
  - Infuse minimum ₹15 Crore net worth verified by Statutory Auditor
                  │
                  ▼
[Phase 3: Formal SCB Escrow Partnership]
  - Open Section 23A Escrow Account with an authorized Scheduled Commercial Bank (e.g. HDFC/ICICI)
  - Execute Tripartite Escrow Agreement
                  │
                  ▼
[Phase 4: RBI Authorization Application]
  - Submit Form A under Section 5(1) of PSSA 2007 to RBI DPSS Mumbai
  - Undergo RBI System Audit & Cybersecurity Vulnerability Assessment (VAPT)
                  │
                  ▼
[Phase 5: In-Principle Approval & Commercial Launch]
  - Obtain In-Principle Letter from RBI
  - Pilot testing with merchant cohort
  - Final License Certificate
```

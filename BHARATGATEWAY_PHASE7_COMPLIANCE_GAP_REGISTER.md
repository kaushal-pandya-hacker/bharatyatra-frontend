# BHARATGATEWAY™ — PHASE 7 COMPLIANCE & OPERATIONAL GAP REGISTER
## Granular Audit of Statutory, Technical, Contractual, and Organizational Readiness

- **Document ID:** `BG-PHASE7-GAP-003`
- **Classification:** Regulatory Compliance Register, Operational Gap Analysis & Risk Ledger
- **Environment Status:** `ENVIRONMENT=SIMULATED` | `ENABLE_LIVE_PAYMENTS=false`
- **Audit Target:** BharatGateway Core Engine, Merchant Dashboard, Persistence Layer, and Operating Structure
- **Status:** Phase 7 Final — Executive Compliance Review

---

## 1. Compliance Assessment Methodology

This gap register conducts a rigorous, multi-dimensional assessment of BharatGateway's readiness for live payment operations under Indian law.

### Distinction Between Software Capability and Regulatory Compliance:
A software engine may have 100% test coverage, double-entry ledger persistence, distributed locks, and automated reconciliation; however, **software code alone does not constitute legal or regulatory compliance**. 
True regulatory authorization requires:
1. **Organizational Standing:** Certificate of Incorporation, Capital adequacy, Board-approved policies, and Principal Officers.
2. **Contractual Instruments:** Tripartite banking agreements, escrow agreements, Merchant Terms of Service, and service level agreements (SLAs).
3. **Independent Certifications:** Formal System Audit Reports (SAR) by CERT-In empanelled auditors, and PCI DSS Attestations of Compliance (AoC) by Qualified Security Assessors (QSA).
4. **Statutory Authorization:** Direct in-principle/final approval under Section 4 of the Payment and Settlement Systems Act, 2007 (PSS Act) from the Reserve Bank of India (RBI).

---

## 2. Comprehensive Compliance & Operational Gap Register

| # | Requirement / Statutory Question | Official Primary Source | Model Applicability (A / B / C) | Existing BharatGateway Software Capability / Code Evidence | Missing Evidence, Controls & Organizational Gaps | Responsible Party | Risk Level | Required Next Action | Live Blocker? |
|---|---|---|---|---|---|---|---|---|---|
| **GAP-01** | **RBI Payment Aggregator License / Authorization** | Section 4, Payment and Settlement Systems Act, 2007 (Act 51 of 2007) | • Model A: Not Applicable<br>• **Model B: Mandatory**<br>• Model C: Delegated to Partner PA | None. System is strictly software. | Formal application to RBI DPSS, In-Principle Approval letter, Certificate of Authorization. | • Model B: BharatGateway<br>• Model C: Partner PA | **CRITICAL** | If pursuing Model B, submit Form A to RBI. If pursuing Model C, verify partner PA's active RBI authorization. | **YES (Blocks Model B Live)** |
| **GAP-02** | **Capital Adequacy & Net Worth (₹15 Cr -> ₹25 Cr)** | RBI Guidelines DPSS.CO.PD.No.1810/02.14.008/2019-20 (Para 2) | • Model A: None<br>• **Model B: Mandatory**<br>• Model C: None (Partner PA maintains) | None. | Audited Net Worth Certificate from a practicing Chartered Accountant demonstrating ₹15 Cr liquid net worth. | BharatGateway Board / Investors | **CRITICAL** | Formally establish paid-up capital and statutory reserves if pursuing Model B; otherwise adopt Model A or C. | **YES (Blocks Model B Live)** |
| **GAP-03** | **Designated Escrow Account with Scheduled Commercial Bank** | RBI Guidelines March 17, 2020 (Para 8) & April 16, 2024 Draft Directions | • Model A: Not Applicable<br>• **Model B: Mandatory (Direct)**<br>• Model C: Uses Partner's Escrow | In-memory & DB double-entry ledger (`bg_ledger_entries`, `gateway-ledger.service.ts`). | Tripartite Escrow Agreement executed with an authorized Scheduled Commercial Bank (e.g. HDFC, ICICI, Axis). | • Model B: BharatGateway & Partner Bank<br>• Model C: Partner PA | **CRITICAL** | Execute formal banking escrow mandate or enter Model C partner agreement. | **YES (Blocks Model B Live)** |
| **GAP-04** | **Card-on-File Tokenization (COFT) & Storage Ban** | RBI Circulars DPSS.CO.PD No.S-516/02-14-003/2021-22 & July 28, 2022 | • **Model A: Mandatory**<br>• **Model B: Mandatory**<br>• **Model C: Mandatory** | Codebase stores NO raw PAN, CVV, or card expiry (`bg_payments`, `bg_orders`). Only provider tokens and last 4 digits stored. | Formal PCI DSS SAQ A or SAQ A-EP Attestation of Compliance (AoC) confirming card data isolation. | BharatGateway & External QSA | **HIGH** | Commission third-party PCI Qualified Security Assessor (QSA) audit of checkout frontend and token flow. | **YES (Blocks Direct Card Checkout)** |
| **GAP-05** | **100% Domestic Payment Data Localization** | RBI Circular DPSS.CO.OD.No.2785/06.08.005/2017-18 (April 6, 2018) | • **Model A: Mandatory**<br>• **Model B: Mandatory**<br>• **Model C: Mandatory** | Supabase/PostgreSQL schema, database migrations (`bg_orders`, `bg_payments`, `bg_ledger_entries`). | Hosting deployment architecture certificate proving all databases, backups, and caches reside in Indian data centers. | DevOps / Cloud Architect | **CRITICAL** | Ensure cloud infrastructure is provisioned strictly in AWS Mumbai (`ap-south-1`) or GCP Mumbai (`asia-south1`). | **YES (Blocks Live Cloud Deployment)** |
| **GAP-06** | **Merchant Onboarding, Due Diligence & KYC Verification** | RBI Guidelines March 17, 2020 (Para 6) & RBI Master Direction - KYC 2016 | • Model A: Handled by Acquirer<br>• **Model B: Mandatory**<br>• Model C: Shared with Partner PA | Merchant registration UI, API key generation (`crypto.randomBytes(32)`), tenant scoping in `gateway-merchant.service.ts`. | Documented Board-Approved Merchant Onboarding Policy, Video KYC workflow, PAN/GSTIN automated API validation, AML sanctions screening. | Compliance Officer & Verification Vendor | **HIGH** | Author Merchant Due Diligence Policy; integrate automated verification APIs (e.g. Karza/Signzy/IDfy). | **YES (Blocks Model B Live)** |
| **GAP-07** | **Turn Around Time (TAT) & Auto-Reversal Compensation** | RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20 (Sept 20, 2019) | • Model A: Acquirer executes<br>• **Model B: Mandatory**<br>• Model C: Partner PA executes | Daily automated 4-way reconciliation engine (`gateway-reconciliation.service.ts`) detects uncaptured/discrepant states. | Automated mechanism to compute and credit ₹100/day customer compensation directly if reversal exceeds T+1. | Core Engineering & Banking Ops | **MEDIUM** | Implement automated T+1 compensation calculation cron and escrow debit instruction trigger. | **NO (Manageable in Pilot)** |
| **GAP-08** | **Double-Entry Ledger Integrity & Concurrency Locks** | RBI Baseline Technology Standards (Annex 2) & Companies Act 2013 | • **Model A: Recommended**<br>• **Model B: Mandatory**<br>• **Model C: Mandatory** | Implemented in Phase 4 & Phase 5: `bg_ledger_entries`, zero-sum balance assertion, `bg_distributed_locks` row locking. | Independent statutory audit report verifying ledger immutability and lack of administrative back-door balance overrides. | External Forensic IT Auditor | **MEDIUM** | Obtain IT General Controls (ITGC) audit sign-off on database ledger and migration scripts. | **NO (Technical Foundation Proven)** |
| **GAP-09** | **Refund Balance Safety & State Machine Integrity** | RBI Guidelines March 17, 2020 & Contract Act, 1872 | • **Model A: Recommended**<br>• **Model B: Mandatory**<br>• **Model C: Mandatory** | Implemented in Phase 5: Two-tier validation (order captured amount + ledger available balance), UNCERTAIN state lockouts. | Operational SOP for manual financial dispute resolution when refund reaches UNCERTAIN state and API recovers later. | Financial Operations Team | **MEDIUM** | Publish Merchant Operational Runbook for reconciling UNCERTAIN refund timeouts. | **NO (Technical Safety Verified)** |
| **GAP-10** | **Webhook Security, Idempotency & Replay Protection** | RBI Guidelines Annex 2 & Information Technology Act, 2000 | • **Model A: Mandatory**<br>• **Model B: Mandatory**<br>• **Model C: Mandatory** | Implemented in Phase 4: HMAC-SHA256 signature (`bg_webhook_endpoints.secret`), delivery tracking (`bg_webhook_deliveries`), exponential backoff. | Customer/Merchant-facing developer documentation, automated secret rotation interface, and webhook SSL verification. | Developer Relations & Frontend Team | **LOW** | Add webhook replay test suite to public merchant documentation portal. | **NO (Production Ready)** |
| **GAP-11** | **Customer Dispute & Grievance Redressal Mechanism** | RBI Ombudsman Scheme 2021 & March 17, 2020 Guidelines (Para 9) | • Model A: Acquirer operates<br>• **Model B: Mandatory**<br>• Model C: Shared / Partner operates | Merchant dashboard dispute viewing interface. | Appointment of Principal Nodal Officer (PNO), toll-free customer grievance number, 30-day escalation matrix, integration with RBI CMS. | Head of Customer Operations / Legal | **HIGH** | Designate Principal Nodal Officer; publish Customer Grievance Policy on public domain. | **YES (Blocks Model B Live)** |
| **GAP-12** | **Cybersecurity 6-Hour Incident Reporting & 5-Year Logs** | CERT-In Directions No. 20(3)/2022-CERT-In (April 28, 2022) | • **Model A: Mandatory**<br>• **Model B: Mandatory**<br>• **Model C: Mandatory** | Structured JSON logs across controllers and services. | Formal Incident Response Plan (IRP), designated Point of Contact (PoC) registered with CERT-In, 5-year cold storage log archival. | Chief Information Security Officer (CISO) | **HIGH** | Register entity PoC on CERT-In incident portal; configure AWS S3 Glacier log lifecycle retention policy (5 years). | **YES (Statutory Requirement)** |
| **GAP-13** | **Digital Personal Data Protection Act Compliance** | DPDP Act, 2023 (Act No. 22 of 2023) | • **Model A: Mandatory**<br>• **Model B: Mandatory**<br>• **Model C: Mandatory** | Multi-tenant merchant isolation (`merchant_id` foreign keys and PostgreSQL query scoping). | Privacy Notice, Data Principal Consent Manager, Right to Erasure / Rectification workflow, Data Protection Officer (DPO). | Data Protection Officer & Legal Counsel | **HIGH** | Draft DPDP-compliant Privacy Policy; implement data deletion/anonymization API for non-financial customer records. | **YES (Legal Prerequisite)** |
| **GAP-14** | **System Audit Report (SAR) by CERT-In Empanelled Auditor** | RBI Guidelines March 17, 2020 (Para 5.3 & Annex 2) | • Model A: Recommended<br>• **Model B: Mandatory**<br>• Model C: Partner PA possesses | Internal test suites (unit, integration, load tests). | Independent VAPT report and System Audit Report (SAR) completed within 6 months of commencing operations. | CERT-In Empanelled External Auditor | **HIGH** | Solicit proposals from CERT-In empanelled auditing firms for Phase 8 pre-production audit. | **YES (Blocks Model B Authorization)** |
| **GAP-15** | **Authoritative Payment Provider Agreement & Production Keys** | Acquirer & Card Network Commercial Operating Regulations | • Model A: Merchant provides<br>• **Model B: Bank Direct**<br>• **Model C: Partner Agreement** | Adapter interface (`PaymentProvider`), Sandbox adapter (`RazorpaySandboxAdapter`) verified in Phase 6. | Fully executed Commercial Partnership Agreement, Production API credentials, signed NDA, and bank settlement SLA. | Corporate Business Development / CEO | **CRITICAL** | Negotiate and sign Model C Strategic Aggregator Partner Agreement with Razorpay / Cashfree / Axis Bank. | **YES (Blocks Live Processing)** |

---

## 3. High-Priority Risk Categorization

```
+---------------------------------------------------------------------------------------------------------+
|                                    RISK SUMMARY & BLOCKER HEATMAP                                       |
+--------------------------+--------------------+---------------------------------------------------------+
| Risk Tier                | Total Identified   | Key Items Included                                      |
+--------------------------+--------------------+---------------------------------------------------------+
| **CRITICAL (Showstoppers)**| 4 Gaps             | GAP-01 (RBI License), GAP-02 (₹15 Cr Net Worth),         |
|                          |                    | GAP-03 (Bank Escrow Account), GAP-15 (Provider Contract)|
| **HIGH (Mandatory Legal)** | 6 Gaps             | GAP-04 (PCI DSS AoC), GAP-05 (Data Localization India), |
|                          |                    | GAP-06 (Merchant Due Diligence), GAP-11 (Grievance PNO),|
|                          |                    | GAP-12 (CERT-In 6hr Reporting), GAP-13 (DPDP Act 2023)  |
| **MEDIUM (Operational)**   | 4 Gaps             | GAP-07 (TAT Compensation), GAP-08 (ITGC Audit),         |
|                          |                    | GAP-09 (Refund SOP), GAP-14 (CERT-In SAR Audit)         |
| **LOW (Incremental)**      | 1 Gap              | GAP-10 (Developer Documentation Portal)                 |
+--------------------------+--------------------+---------------------------------------------------------+
```

---

## 4. Key Remediation Path to Enable Live Operations

To transition BharatGateway from a simulated sandbox environment to live merchant operations without regulatory infringement:

1. **Adopt Model C (Hybrid Facilitator) to Clear All 4 Critical Blockers:**
   - Under Model C, BharatGateway **does not require an independent RBI license (GAP-01)**, does not need **₹15 Crore paid-up capital (GAP-02)**, and does not operate an independent bank escrow (GAP-03).
   - The licensed partner PA handles these statutory burdens.
2. **Execute GAP-15 (Partner Commercial Agreement):**
   - The immediate critical path is executing a formal commercial aggregator partnership with an authorized entity (e.g. Razorpay Partner Program, Cashfree Co-Branded Onboarding, or Axis Bank).
3. **Execute High-Priority Data and Security Governance:**
   - Deploy production instances strictly in AWS Mumbai (`ap-south-1`) to satisfy **GAP-05 (Data Localization)**.
   - Publish the DPDP Privacy Notice (**GAP-13**) and register the CERT-In incident point of contact (**GAP-12**).
   - Undergo PCI DSS SAQ A verification (**GAP-04**) for the checkout frontend.

*Report Prepared By: Lead Regulatory Auditor & Payment Security Engineering Specialist*  
*Approved For: BharatGateway Phase 7 Executive Deliverables*

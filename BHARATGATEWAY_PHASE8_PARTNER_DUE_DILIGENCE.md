# BHARATGATEWAY™ — PHASE 8 PARTNER DUE-DILIGENCE & QUESTION PACK
## Corporate Readiness Audit, Evidence Gap Register & Institutional Partner Inquiry Toolkit

- **Document ID:** `BG-PHASE8-DILIGENCE-003`
- **Classification:** Partner Due Diligence, Organizational Readiness & Bilateral Negotiation Pack
- **Environment Status:** `ENVIRONMENT=SIMULATED` | `ENABLE_LIVE_PAYMENTS=false`
- **Target Institutions:** Razorpay Partner Team, Cashfree Channel Partnerships, Bank Acquirer Alliances
- **Status:** Phase 8 Final — Due Diligence Package & Institutional Questionnaire

---

## 1. Executive Summary & Purpose

When entering institutional partnership discussions with authorized Payment Aggregators (e.g., Razorpay, Cashfree) or acquiring banks (e.g., HDFC, Axis), candidate platforms must present a rigorous **Due Diligence Package**. 

Regulated payment institutions are mandated by the Reserve Bank of India (RBI) under the **Master Direction on Payment Aggregators, 2025** to conduct thorough **Third-Party Risk Management (TPRM)** and underwriting on all technology partners, merchant aggregators, and software platforms connecting to their escrow and settlement systems.

This document serves two primary objectives:
1. **Organizational Readiness & Evidence Checklist:** Audits the current state of BharatGateway's corporate, legal, technical, and operational artifacts, transparently categorizing each as `AVAILABLE`, `MISSING`, or `REQUIRING PROFESSIONAL REVIEW`.
2. **Provider Partnership Question Pack:** Provides an exhaustive, professionally structured questionnaire for BharatGateway’s business development and legal representatives to submit during formal partnership negotiations.

> [!CRITICAL]
> **Operational Boundary Reminder:** 
> In strict compliance with system rules, AI agents will **not** contact external entities, transmit emails, submit web forms, sign contracts, or make legal declarations on behalf of the user or BharatGateway. This document is an executive artifact prepared for human execution.

---

## 2. Partner Due-Diligence Evidence Checklist

The table below catalogs the documentary and evidentiary requirements typically demanded by Tier-1 payment aggregators prior to executing a Platform / Technology Partnership Agreement.

```
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                            PARTNER DUE DILIGENCE EVIDENCE AUDIT                                                                     |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| Ref | Due Diligence Item / Evidence Requirement   | Document Description & Scope                       | Current Status in BharatGateway    | Remediation Action    |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-01** | **Certificate of Incorporation (MCA)**      | Ministry of Corporate Affairs (MCA) certificate of | **MISSING**                        | User / Promoters must |
|     |                                             | incorporation as a Private Limited Company.        | (Project is code repository)       | incorporate legal Co. |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-02** | **Memorandum & Articles of Association**    | MOA & AOA with object clauses authorizing software | **MISSING**                        | Drafted by Practicing |
|     |                                             | development, e-commerce, and data processing.      | (Corporate artifact)               | Company Secretary.    |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-03** | **PAN, GSTIN & Corporate Bank Account Proof**| Company PAN card, GST registration certificate, and| **MISSING**                        | Post-incorporation tax|
|     |                                             | cancelled cheque for corporate operating account.  | (Corporate artifact)               | registrations.        |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-04** | **Beneficial Ownership (UBO) Declarations** | Disclosure of shareholders holding >10% equity, PEP| **MISSING**                        | Prepared for KYC by   |
|     |                                             | screening, and director KYC under PMLA rules.      | (Corporate artifact)               | Company Secretary.    |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-05** | **Business Description & Product Specs**    | Detailed functional architecture of BharatGateway  | **AVAILABLE**                      | Architecture blueprint|
|     |                                             | travel checkout, dashboard, and API capabilities.  | (`BHARATGATEWAY_ARCHITECTURE_...`) | complete & verified.  |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-06** | **Hybrid Fund-Flow Diagram & Policy**       | End-to-end Mermaid diagram showing zero fund       | **AVAILABLE**                      | Blueprint finalized in|
|     |                                             | custody, escrow separation, and T+1 settlements.   | (`BHARATGATEWAY_PHASE8_FLOW_...`)  | Phase 8.              |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-07** | **Merchant Onboarding & Underwriting Policy**| Board-approved risk policy detailing merchant vetting,| **REQUIRING PROFESSIONAL REVIEW**  | Compliance draft needs|
|     |                                             | travel agency verification, and prohibited lists.  | (Technical schema exists; policy pending)| legal counsel review. |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-08** | **Privacy, Data Handling & DPDP Policy**    | Customer data protection policy adhering to the    | **REQUIRING PROFESSIONAL REVIEW**  | Needs Data Protection |
|     |                                             | Digital Personal Data Protection Act, 2023 (DPDP). | (Tenant isolation in code; policy pending)| Officer (DPO) sign-off|
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-09** | **Information Security Policy & Incident BCP**| Comprehensive ISMS, 6-hour CERT-In incident        | **REQUIRING PROFESSIONAL REVIEW**  | Security runbook exists|
|     |                                             | escalation procedure, and Business Continuity Plan.| (`BHARATYATRA_SECURITY_RUNBOOK...`)| needs CISO sign-off.  |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-10** | **Refund, Dispute & Customer Support SOP**  | Merchant SOP for handling customer cancellations,  | **AVAILABLE**                      | Code handles 2-tier   |
|     |                                             | failed transactions, and chargeback representments.| (`BHARATGATEWAY_PHASE5_SECURITY...`)| refund balance safety.|
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-11** | **Data Retention & Audit Controls**         | 5-year log retention policy in compliance with     | **AVAILABLE**                      | Implemented in logging|
|     |                                             | CERT-In April 2022 directions and RBI guidelines.  | (`SecurityMonitoringService` / DB) | & database schema.    |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-12** | **Commercial Financial Projections**        | 3-year financial model covering low, medium, and   | **AVAILABLE**                      | Full P&L modeled in   |
|     |                                             | high GTV scenarios, MDR spreads, and opex costs.   | (`BHARATGATEWAY_PHASE7_BIZ...`)    | Phase 7.              |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-13** | **Technical Integration & Sandbox Evidence**| Test suite execution logs, deterministic mock test | **AVAILABLE**                      | 166 root tests & 282  |
|     |                                             | reports, and sandbox adapter architecture records. | (`BHARATGATEWAY_PHASE6_SANDBOX...`)| backend tests passing.|
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-14** | **Independent Security Audit Report (VAPT)**| Third-party CERT-In empanelled auditor VAPT report | **MISSING**                        | Retain external QSA / |
|     |                                             | and PCI DSS Attestation of Compliance (AoC).       | (Pre-production external gate)     | auditor in Phase 9.   |
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
| **DD-15** | **Written Legal Opinion on Operating Model**| Formal legal opinion from Indian payments counsel  | **MISSING**                        | Retain fintech law    |
|     |                                             | confirming Model C TSP compliance under PSS Act.   | (Requires independent advocate)    | firm for formal review|
+-----+---------------------------------------------+----------------------------------------------------+------------------------------------+-----------------------+
```

---

## 3. Provider Partnership Question Pack

The following questionnaire is structured across eight core categories for presentation to candidate payment aggregator partnership alliances (e.g. Razorpay Partner Alliances or Cashfree Channel Alliances).

```
+---------------------------------------------------------------------------------------------------------+
|                                    INSTITUTIONAL PARTNER QUESTIONNAIRE                                  |
+---------------------------------------------------------------------------------------------------------+
```

### Category 1: Partnership Structure & Legal Framework
1. **Appropriate Partner Category:** Based on our architecture where BharatGateway provides the travel-commerce frontend, merchant dashboard, and automated reconciliation software while never holding customer money, which specific partnership program is appropriate: *Platform Partner*, *Technology Service Provider (TSP)*, *Authorized Reseller*, or *Enterprise Aggregator*?
2. **Contractual Relationship:** Does each onboarded travel agency execute a direct Master Merchant Agreement (MMA) with your payment aggregator entity, or does the contract take the form of a tripartite agreement between Merchant, BharatGateway, and the Aggregator?
3. **Regulatory Boundary:** Does your legal team provide a standard letter or contractual clause confirming that BharatGateway operates as a technology and referral partner without triggering independent Payment Aggregator licensing under the RBI Master Directions of 2025?

### Category 2: Merchant Onboarding, KYC & Underwriting
4. **Programmatic Onboarding APIs:** Can BharatGateway collect merchant identification documents (Certificate of Incorporation, PAN, GSTIN, Bank Proof, Director KYC) through our custom dashboard and push them to your underwriting engine via API, or must merchants be redirected to your native portal?
5. **Turnaround Time (TAT) for Merchant Approval:** What is the average underwriting TAT for travel agency merchants, and what additional underwriting requirements apply to travel/hospitality merchants (e.g. proof of IATA membership, physical travel agency verification)?
6. **Sub-Merchant Account Architecture:** Does your platform provision unique sub-merchant account IDs (`sub_merchant_id` / `account_id`) to enable multi-tenant isolation and per-merchant transaction routing?

### Category 3: Fund Custody, Escrow & Settlement Mechanics
7. **Settlement Routing:** Confirm that 100% of customer funds debited at checkout will flow directly into your RBI-regulated Escrow Account maintained with a Scheduled Commercial Bank, with zero funds passing through any intermediary account.
8. **Settlement Schedules:** What settlement options are supported for our travel merchants (e.g., standard T+1, T+2, or delivery-linked settlement based on tour completion date)?
9. **Platform Commission Splitting:** How does your platform remit BharatGateway's platform software fee or agreed revenue share? Can commissions be automatically deducted from settlement credits and disbursed directly to BharatGateway's corporate account, and what GST invoicing documents are provided?

### Category 4: Pricing, Commercial Terms & Rolling Reserves
10. **Buy-Rate Structure:** What is the wholesale buy-rate offered to BharatGateway for:
    - UPI (P2M transactions)?
    - Domestic RuPay Debit Cards?
    - Domestic Visa & Mastercard Debit/Credit Cards?
    - Corporate and Commercial Credit Cards?
    - International Cards (USD/EUR/GBP)?
11. **Revenue Share / Markup:** What is the maximum permitted markup BharatGateway may charge merchants over your base buy-rate, and what is the net partner revenue-share split (e.g., 20 bps vs 35 bps)?
12. **Rolling Reserves for Travel:** Given the chargeback profile of travel bookings (e.g. airline cancellations, tour rescheduling), what rolling reserve percentage (e.g., 5% held for 30–60 days) is mandated for newly onboarded travel agencies?

### Category 5: Customer Refunds, Failed Transactions & TAT Auto-Compensation
13. **Refund APIs:** Are refunds executed instantaneously via API (`POST /refunds`), and how are refunds funded when a merchant has zero pending settlement balance (e.g., merchant pre-funding account vs deduction from next settlement)?
14. **RBI TAT Compliance:** In the event of a failed electronic transaction where customer funds are debited but dropped by the gateway, does your system automatically execute the T+1 reversal and credit the statutory ₹100/day compensation directly, or is that responsibility delegated to the platform?

### Category 6: Dispute & Chargeback Management
15. **Dispute Notification Workflows:** How are customer chargebacks and disputes communicated to BharatGateway (e.g. real-time webhooks, dashboard alert, email)?
16. **Evidence Representment:** What is the timeline for submitting travel dispute evidence (air ticket PNRs, hotel vouchers, tour delivery acknowledgments), and does your platform provide an API for programmatic dispute representment?
17. **Financial Loss Indemnity:** Confirm that in the event an onboarded merchant defaults or goes bankrupt, chargeback liabilities are contained to the merchant and their rolling reserve, and do not cross-default against BharatGateway's corporate entity.

### Category 7: Sandbox Availability & Technical Verification
18. **Real Sandbox Provisioning:** What specific corporate documentation or partner NDA is required to issue active sandbox API credentials (`key_id` and `key_secret`) connected to your test banking simulator?
19. **Test Scenario Coverage:** Does your sandbox support testing edge cases such as UPI timeout simulations, 3D Secure OTP failure drops, partial refunds, chargeback lifecycle simulations, and settlement reconciliation file downloads?

### Category 8: Termination, Portability & Business Continuity
20. **Token Portability:** In the event of partnership renegotiation or migration, what is the protocol for porting tokenized customer card identifiers (COFT tokens) to another authorized token service provider or acquirer in compliance with RBI regulations?
21. **Exit SLA:** What notice period is required for contract termination, and how are open merchant settlements and active dispute reserves wound down post-termination?

---

## 4. Next Actions for Corporate Leadership

1. **Incorporate Legal Entity:** Execute MCA incorporation of a Private Limited entity to resolve items **DD-01** through **DD-04**.
2. **Engage Fintech Legal Counsel:** Obtain formal written legal review on the Model C hybrid agreement structure (**DD-15**).
3. **Submit Question Pack to Partner Alliances:** Present Section 3 questions to candidate partner teams at Razorpay and Cashfree.

*Report Prepared By: Senior Fintech Commercial Strategist & Payment Systems Specialist*  
*Approved For: Phase 8 Partner Negotiation Records*

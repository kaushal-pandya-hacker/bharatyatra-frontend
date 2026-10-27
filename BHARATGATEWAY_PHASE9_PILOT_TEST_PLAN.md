# BHARATGATEWAY™ — PHASE 9 CONTROLLED PILOT TEST PLAN
## Prerequisites Checklist, 12-Stage End-to-End Test Matrix & Verification Protocols

- **Document ID:** `BG-PHASE9-PLAN-001`
- **Classification:** Controlled Pilot Verification & Test Specification
- **Environment Status:** `ENVIRONMENT=SIMULATED` | `ENABLE_LIVE_PAYMENTS=false`
- **Statutory Authority:** Reserve Bank of India (Regulation of Payment Aggregators) Directions, 2025 & PSS Act 2007
- **Target Gate:** Phase 9 Pilot Verification -> Non-Live Readiness Assessment
- **Status:** Phase 9 Final — Test Engineering Blueprint

---

## 1. Executive Summary & Test Philosophy

Phase 9 establishes the **Controlled Pilot Test Plan** for BharatGateway™.

A controlled pilot in financial software is the bridge between internal component testing and real-world merchant operations. However, in accordance with the regulatory assessment completed in Phase 7 and the provider due diligence completed in Phase 8:
- **Live payments remain strictly disabled** (`ENABLE_LIVE_PAYMENTS=false`, `ENVIRONMENT=SIMULATED`).
- No real customer money will be debited or credited.
- No live banking networks will be connected.
- Tests will be executed across deterministic mocks and official sandbox test environments without processing live funds.

This test plan defines:
1. An empirical **Pilot Prerequisite Checklist** evaluating corporate, legal, and contractual standing.
2. An exhaustive **12-Stage End-to-End Test Matrix** covering the complete merchant and customer payment lifecycle.
3. Explicit boundary demarcations separating **deterministic contract mocks**, **simulated test transactions**, and **external sandbox network calls**.

---

## 2. Pilot Prerequisite Audit Checklist

Before any live or external merchant pilot can be authorized, each of the following statutory, organizational, contractual, and technical prerequisites must be satisfied. 

> [!CRITICAL]
> **Integrity Rule:** In strict compliance with instructions, no approvals, contracts, credentials, or corporate filings have been assumed or invented. Missing items are candidly marked `PENDING`.

```
+-------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                      PILOT PREREQUISITE AUDIT MATRIX                                                                  |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| Ref | Prerequisite Requirement                    | Audit Status  | Documentary Evidence / State        | Detail & Blocking Condition                 |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-01** | **Corporate Entity Incorporation (MCA)**    | **PENDING**   | None. (Codebase repository only).   | Promoters must complete MCA incorporation   |
|     |                                             |               |                                     | of a Private Limited entity in India.       |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-02** | **Corporate PAN, GSTIN & Bank Account**     | **PENDING**   | None. (Awaiting incorporation).     | Required for commercial merchant contracting|
|     |                                             |               |                                     | and tax invoicing under Indian law.         |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-03** | **Written Legal Opinion on Operating Model**| **PENDING**   | None. (Phase 7 assessment complete; | Formal review by practicing Indian payments |
|     |                                             |               | legal counsel retainer pending).    | counsel confirming Model C TSP compliance.  |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-04** | **Written Provider Confirmation & Terms**   | **PENDING**   | None. (Due diligence pack prepared; | Formal approval letter from Razorpay or     |
|     |                                             |               | provider submission pending).       | Cashfree authorizing hybrid TSP integration.|
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-05** | **Tripartite Merchant Terms of Service**    | **PENDING**   | Drafted in technical specifications;| Legal counsel must draft formal Merchant    |
|     |                                             |               | legal contract document pending.    | Agreement with indemnity & clawback terms.  |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-06** | **Active Provider Sandbox Credentials**     | **PENDING**   | Placeholder keys in adapter;        | Real `rzp_test_...` sandbox keys required   |
|     |                                             |               | deterministic contract mock active. | for live HTTP sandbox test execution.       |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-07** | **Zero-Custody Fund Flow Architecture**     | **VERIFIED**  | Documented in Phase 8 blueprint:    | Customer funds flow directly to partner     |
|     |                                             |               | `BHARATGATEWAY_PHASE8_FLOW_...`     | escrow; zero custody on BharatGateway.      |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-08** | **Documented Refund & Dispute SOPs**        | **VERIFIED**  | Documented in Phase 5 & 8 reports;   | Two-tier balance check, UNCERTAIN lockout,  |
|     |                                             |               | implemented in `GatewayRefundService`.| and representment workflows verified.       |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-09** | **Data Localization Compliance (India)**    | **VERIFIED**  | Database configuration configured   | Schema and deployment specs pinned to AWS   |
|     |                                             |               | for domestic Mumbai cloud regions.  | Mumbai (`ap-south-1`) data centers.         |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-10** | **Card-on-File Tokenization (COFT) Ban**    | **VERIFIED**  | Codebase audit confirms zero storage| No raw PAN, CVV, or card expiry stored in   |
|     |                                             |               | of raw card credentials in DB.      | `bg_orders`, `bg_payments`, or audit logs.  |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-11** | **Double-Entry Ledger & Concurrency Locks** | **VERIFIED**  | Codebase verified in Phase 4 & 5;   | Mathematical zero-sum assertion and row-    |
|     |                                             |               | `bg_ledger_entries` & locks tested. | locking prevent double-payouts & race conds.|
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
| **PR-12** | **Security Monitoring & CERT-In Reporting** | **VERIFIED**  | `SecurityMonitoringService` with    | 14-event taxonomy, CRLF sanitization, and   |
|     |                                             |               | 6-hour incident signal triggers.    | 5-year log schema implemented and tested.   |
+-----+---------------------------------------------+---------------+-------------------------------------+---------------------------------------------+
```

---

## 3. Strict Non-Live Operational Boundary

```
+---------------------------------------------------------------------------------------------------------+
|                                    NON-LIVE ENFORCEMENT CONFIGURATION                                   |
+----------------------------------------------------+----------------------------------------------------+
| Configuration Setting                              | Active Enforced State                              |
+----------------------------------------------------+----------------------------------------------------+
| `ENABLE_LIVE_PAYMENTS`                             | `false` (Strictly Enforced across all modules)     |
| `ENVIRONMENT`                                      | `SIMULATED`                                        |
| Banking Network Connections                        | None (Zero real clearing rails connected)          |
| Custodial Money Ingestion                          | Prohibited (No real fiat customer funds accepted)  |
| Live Production Credentials                        | Strictly Blocked (Startup validation throws error) |
+----------------------------------------------------+----------------------------------------------------+
```

---

## 4. The 12-Stage Controlled Pilot Test Matrix

The matrix below defines the end-to-end test journey executed during Phase 9 to validate the platform's functional integrity, failure modes, and recovery mechanisms.

```
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                            12-STAGE CONTROLLED PILOT TEST MATRIX                                                                    |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| Stg | Test Stage / Lifecycle Phase      | Test Objective & Method            | Input Parameters & Simulated Scenarios              | Expected Pass Criteria         |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 1   | **Merchant Onboarding**           | Verify programmatic registration & | Valid business name, legal entity, contact info;    | Provisioned merchant record,   |
|     |                                   | API key generation in test env.    | `createMerchant()` in `GatewayMerchantService`.     | scoped keys, active status.    |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 2   | **Order Creation & Tamper Check** | Verify order creation and immutability| Order amount: ₹4,500.00 (`amountMinor: 450000`);    | Order status CREATED; no       |
|     |                                   | of currency/amount by client.      | client-side amount alteration attempts.             | client mutation API permitted. |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 3   | **Payment Execution (Success)**   | Execute successful UPI/Card payment| UPI VPA: `tourist@okhdfcbank`;                      | Authoritative capture, status  |
|     |                                   | via sandbox provider adapter.      | `executePayment()` with `SUCCESS` scenario.         | CAPTURED, order marked PAID.   |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 4   | **Payment Execution (Failure)**   | Execute declining card transaction | Card declined scenario:                             | Payment status FAILED; order   |
|     |                                   | and verify error classification.   | `INSUFFICIENT_FUNDS` / `ERR_INSUFFICIENT_FUNDS`.    | not marked captured.           |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 5   | **Duplicate Request / Idempotency**| Replay identical payment request   | Duplicate `verifyAndCapturePayment()` call with     | Returns existing payment; no   |
|     |                                   | with same transaction reference.   | identical gateway transaction ID and signature.     | redundant ledger credit.       |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 6   | **Webhook HMAC & Deduplication**  | Verify HMAC-SHA256 signature and   | Ingest valid signed webhook; replay forged payload; | Valid accepted; forged dropped;|
|     |                                   | deduplicate identical event IDs.   | replay identical stable `eventId` to test dedup.    | duplicate ignored idempotently.|
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 7   | **Two-Tier Partial Refunds**      | Process multiple partial refunds & | Capture ₹1,000; refund ₹400; refund ₹600;           | Both succeed; 3rd attempt      |
|     |                                   | verify remaining balance caps.     | attempt 3rd refund of ₹100 against exhausted bal.   | rejected: fully refunded.      |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 8   | **Uncertain Outcome Recovery**    | Simulate provider network timeout  | Execute payment with `BANK_TIMEOUT` scenario;       | Status PENDING; order not      |
|     |                                   | during payment/refund execution.   | verify status query recovers outcome safely.        | prematurely failed.            |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 9   | **Reconciliation Matching**       | Ingest provider settlement batches | Simulated statement items matching captured orders; | Status MATCHED; 0 discrepancies|
|     |                                   | and detect matched transactions.   | execute `runReconciliationBatch()`.                 | reported in batch report.      |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 10  | **Double-Entry Ledger Balance**   | Assert mathematical equality of all| Query all `bg_ledger_entries` for merchant across   | Total Debits == Total Credits; |
|     |                                   | debits and credits in the ledger.  | payments, fees, and refund reversals.               | zero-sum invariant preserved.  |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 11  | **Multi-Tenant Isolation (IDOR)** | Attempt cross-merchant data access | Merchant B attempts to fetch or refund              | Access denied (undefined /     |
|     |                                   | and unauthorized refund initiation.| Merchant A's order (`merch_pilot_kerala_resorts_002`)| unauthorized exception).       |
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
| 12  | **Secret Masking & Non-Live Gate**| Verify that API secrets and keys   | Inspect adapter config and public response objects  | Zero plaintext secrets exposed;|
|     |                                   | are never leaked in API or logs.   | to ensure `rzp_live` is absent and keys redacted.   | `isLiveAuthorized() === false`.|
+-----+-----------------------------------+------------------------------------+-----------------------------------------------------+--------------------------------+
```

---

## 5. Distinction Between Test Environments

To ensure zero ambiguity during audit evaluations:

1. **Deterministic Contract Mock (`isSimulation() === true`, Local Maps):**
   - In-memory mock engine utilized when external network access is offline or sandbox API keys are absent.
   - Accurately models provider request/response contracts, cryptographic HMAC calculations, and state machines.
2. **Simulated Transaction Engine:**
   - Internal state machine simulation in `SimulatedPaymentAdapter` and `MockBankAdapter` providing controllable failure injections (e.g. `BANK_TIMEOUT`, `BANK_DECLINED`, `RETRYABLE_503`).
3. **External Provider Sandbox (Live Network HTTPS):**
   - Official test environment hosted by an authorized provider (e.g., `https://api.razorpay.com/v1` with `rzp_test_...` credentials).
   - Incurs real external HTTPS latency and tests real network socket handling.
   - **Status in Phase 9:** Prepared and supported by `RazorpaySandboxAdapter`, pending injection of real partner credentials following contract execution.

*Report Prepared By: Senior Fintech QA Architect & Payment Systems Reliability Specialist*  
*Approved For: Phase 9 Pilot Verification Deliverables*

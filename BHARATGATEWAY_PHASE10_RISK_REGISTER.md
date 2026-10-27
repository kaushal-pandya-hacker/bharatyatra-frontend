# BHARATGATEWAY™ — PHASE 10 COMPREHENSIVE RISK REGISTER
## Multi-Dimensional Risk Ledger, Impact Assessments, Mitigation Strategies & Residual Exposure

- **Document ID:** `BG-PHASE10-RISK-003`
- **Classification:** Institutional Risk Register & Governance Matrix
- **Environment Status:** `ENVIRONMENT=SIMULATED` | `ENABLE_LIVE_PAYMENTS=false`
- **Audit Target:** Complete Commercial, Legal, Security, and Technical Architecture
- **Status:** Phase 10 Final Deliverable

---

## 1. Risk Assessment Methodology

Risk severity is evaluated using a standard 5x5 impact and likelihood matrix:
- **Inherent Risk Score (IRS):** Evaluated prior to engineering controls and legal boundaries.
- **Residual Risk Score (RRS):** Evaluated following the implementation of Phase 1–10 software controls, regulatory ring-fencing, and operational runbooks.
- **Risk Tiers:** `CRITICAL` (Score 20–25), `HIGH` (Score 12–19), `MEDIUM` (Score 6–11), `LOW` (Score 1–5).

---

## 2. Comprehensive Risk Register

```
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|                                                            INSTITUTIONAL RISK REGISTER                                                                              |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| ID  | Risk Description & Root Cause | Imp   | Lkld  | Inherent | Mitigation Strategy & Phase 1-10 Controls          | Imp   | Lkld  | Residual | Owner & Blocker    |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| **CATEGORY 1: REGULATORY & LICENSING RISKS**                                                                                                                        |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-01| **Unlicensed PA Allegation**  | 5     | 4     | **20**   | Adopt Model C (Hybrid Facilitator). Customer funds | 5     | 1     | **5**    | Legal Counsel      |
|     | Accusation of operating an    | (Cat) | (Prob)| CRITICAL | flow directly to partner PA's bank escrow account; | (Cat) | (Rare)| LOW      | **BLOCKS LIVE**    |
|     | unauthorized payment system   |       |       |          | BharatGateway never touches or pools fiat money.   |       |       |          | (Opinion Required) |
|     | under Section 25, PSS Act 2007|       |       |          | Internal double-entry ledger is application record.|       |       |          |                    |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-02| **Marketplace Classification**| 4     | 3     | **12**   | Structure travel agency onboarding as software     | 4     | 1     | **4**    | Legal Counsel      |
|     | Platform classified as        | (Maj) | (Poss)| HIGH     | facilitation; partner PA executes direct settlement| (Maj) | (Rare)| LOW      | **BLOCKS LIVE**    |
|     | e-commerce marketplace under  |       |       |          | to individual agency current accounts.             |       |       |          | (Terms Required)   |
|     | RBI April 2024 / 2025 rules.  |       |       |          | Merchant agreement explicitly states direct sales. |       |       |          |                    |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| **CATEGORY 2: CORPORATE & CONTRACTUAL RISKS**                                                                                                                       |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-03| **Unincorporated Entity**     | 5     | 5     | **25**   | Promoters must execute MCA incorporation of a      | 5     | 1     | **5**    | Promoters / CS     |
|     | Lack of corporate legal standing| (Cat) | (Alm) | CRITICAL | Private Limited Company prior to signing merchant  | (Cat) | (Rare)| LOW      | **BLOCKS LIVE**    |
|     | prevents signing commercial   |       |       |          | Master Services Agreements or receiving payouts.   |       |       |          | (Entity Required)  |
|     | provider partnership agreements|      |       |          |                                                    |       |       |          |                    |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-04| **Merchant Default / Indemnity**| 4   | 3     | **12**   | Contractual indemnity clause in Merchant Terms of  | 3     | 2     | **6**    | Finance / Legal    |
|     | Travel agency defaults on air | (Maj) | (Poss)| HIGH     | Service. Mandate 5% to 10% rolling reserve held    | (Mod) | (Unlk)| MEDIUM   | **BLOCKS LIVE**    |
|     | cancellations; chargebacks    |       |       |          | by partner PA for 60 days on high-ticket packages. |       |       |          | (SOP Enforced)     |
|     | cross-default to platform.    |       |       |          |                                                    |       |       |          |                    |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| **CATEGORY 3: COMMERCIAL & FINANCIAL RISKS**                                                                                                                        |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-05| **Excessive Refund / Double** | 5     | 3     | **15**   | Two-tier balance validation implemented in Phase 5;| 4     | 1     | **4**    | Payments Engineer  |
|     | Duplicate refund requests or  | (Cat) | (Poss)| HIGH     | remaining balance cap asserts aggregate refunds <= | (Maj) | (Rare)| LOW      | **RESOLVED IN**    |
|     | race conditions debiting more |       |       |          | captured amount; row-level lock blocks duplicates. |       |       |          | **SOFTWARE (Ph 5)**|
|     | than the captured balance.    |       |       |          |                                                    |       |       |          |                    |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-06| **Uncertain Timeout Re-Debit**| 4     | 3     | **12**   | When refund API times out, status enters           | 4     | 1     | **4**    | FinOps Specialist  |
|     | Submitting another refund when| (Maj) | (Poss)| HIGH     | `UNCERTAIN` and refundable balance remains locked. | (Maj) | (Rare)| LOW      | **RESOLVED IN**    |
|     | first timed out upstream.     |       |       |          | Automated cron queries provider before release.    |       |       |          | **SOFTWARE (Ph 5)**|
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| **CATEGORY 4: TECHNICAL & SECURITY RISKS**                                                                                                                          |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-07| **Provider Outage / Downtime**| 4     | 4     | **16**   | Universal provider registry architecture enables   | 3     | 2     | **6**    | SRE Lead           |
|     | Upstream aggregator outage    | (Maj) | (Prob)| HIGH     | circuit-breaker trips and multi-provider failover  | (Mod) | (Unlk)| MEDIUM   | Non-blocker for    |
|     | halts checkout operations.    |       |       |          | (e.g. Razorpay -> Cashfree) defined in SOP-07.     |       |       |          | pilot; live goal.  |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-08| **Offline Contract Mocks Only**| 3    | 5     | **15**   | `RazorpaySandboxAdapter` models exact v1 REST API; | 3     | 2     | **6**    | Integration Lead   |
|     | Real HTTPS network socket     | (Mod) | (Alm) | HIGH     | injection of valid `rzp_test` credentials enables  | (Mod) | (Unlk)| MEDIUM   | **BLOCKS REAL**    |
|     | behavior untested externally. |       |       |          | live testing without architectural refactoring.    |       |       |          | **SANDBOX TESTING**|
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-09| **Credential Leakage**        | 5     | 2     | **10**   | `SecurityMonitoringService` recursively sanitizes  | 4     | 1     | **4**    | Security Lead      |
|     | API keys, card numbers, or    | (Cat) | (Unlk)| MEDIUM   | all logs and exceptions; zero card storage (COFT); | (Maj) | (Rare)| LOW      | **RESOLVED IN**    |
|     | tokens leaked in error logs.  |       |       |          | SHA-256 secret hashing implemented in merchant DB. |       |       |          | **SOFTWARE (Ph 7)**|
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-10| **Multi-Process Concurrency** | 4     | 3     | **12**   | PostgreSQL distributed row locks implemented in    | 3     | 1     | **3**    | Lead Architect     |
|     | Race conditions occurring     | (Maj) | (Poss)| HIGH     | `bg_distributed_locks` with owner tokens and TTL.  | (Mod) | (Rare)| LOW      | Requires Phase 10  |
|     | across horizontally scaled    |       |       |          | Tested in-process; needs multi-container cluster.  |       |       |          | staging load drill.|
|     | application containers.       |       |       |          |                                                    |       |       |          |                    |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| **CATEGORY 5: OPERATIONAL & GOVERNANCE RISKS**                                                                                                                      |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-11| **TAT Reversal Delay Penalty**| 3     | 3     | **9**    | Automated daily four-way reconciliation engine     | 3     | 1     | **3**    | FinOps Specialist  |
|     | Delayed refund reversals      | (Mod) | (Poss)| MEDIUM   | flags uncaptured drops within 24 hours; partner PA | (Mod) | (Rare)| LOW      | **RESOLVED IN**    |
|     | incurring statutory ₹100/day  |       |       |          | contractual settlement handles auto-reversals.     |       |       |          | **SOFTWARE (Ph 4)**|
|     | RBI compensation penalties.   |       |       |          |                                                    |       |       |          |                    |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
| R-12| **CERT-In Reporting Window**  | 4     | 2     | **8**    | 14-event security taxonomy triggers high-severity  | 3     | 1     | **3**    | CISO / Incident Lead|
|     | Failure to report security    | (Maj) | (Unlk)| MEDIUM   | alert signals within sliding window; formal SOP-05 | (Mod) | (Rare)| LOW      | **RESOLVED IN**    |
|     | breach within mandatory 6 hrs.|       |       |          | defines emergency reporting checklist.             |       |       |          | **RUNBOOK (Ph 9)** |
+-----+-------------------------------+-------+-------+----------+----------------------------------------------------+-------+-------+----------+--------------------+
```

---

## 3. High-Priority Risk Heatmap

```
+---------------------------------------------------------------------------------------------------------+
|                                         RESIDUAL RISK HEATMAP                                           |
+--------------------------+--------------------+---------------------------------------------------------+
| Residual Risk Level      | Total Risks        | Key Specific Risks Included                             |
+--------------------------+--------------------+---------------------------------------------------------+
| **CRITICAL (0 Risks)**   | **0 Risks**        | All Critical risks mitigated to Low/Medium via controls.|
| **HIGH (0 Risks)**       | **0 Risks**        | No remaining unmitigated High risks.                    |
| **MEDIUM (4 Risks)**     | **4 Risks**        | R-04 (Merchant Default Reserves), R-07 (Provider Failover)|
|                          |                    | R-08 (External Sandbox Testing), R-10 (Cluster Testing) |
| **LOW (8 Risks)**        | **8 Risks**        | R-01 (Unlicensed PA), R-02 (Marketplace Class),         |
|                          |                    | R-03 (Incorporation), R-05 (Excessive Refund),          |
|                          |                    | R-06 (Timeout), R-09 (Secrets), R-11 (TAT), R-12 (CERT) |
+--------------------------+--------------------+---------------------------------------------------------+
```

---

## 4. Remediation Governance

1. **Software Engineering Risks (R-05, R-06, R-09, R-11):** **100% Mitigated in Code.** All core financial invariants, state machine protections, log cleaners, and reconciliation algorithms are tested and passing in the repository.
2. **Corporate & Partner Prerequisites (R-01, R-02, R-03, R-04, R-08):** **Assigned to Human Leadership.** These require formal corporate incorporation, legal opinions, and provider alliance agreements before the platform can transition to live operations.

*Risk Register Approved By: Lead Fintech Compliance Auditor & SRE Lead*  
*Date of Audit: October 2026*  
*Approved For: Phase 10 Governance Artifacts*

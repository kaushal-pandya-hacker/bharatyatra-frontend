# BHARATGATEWAY™ — PHASE 9 OPERATIONAL RUNBOOK & INCIDENT RECOVERY SOPS
## Production-Grade Standard Operating Procedures for Payment Operations, Reconciliation & Incident Response

- **Document ID:** `BG-PHASE9-SOP-003`
- **Classification:** Standard Operating Procedures (SOPs) & Incident Response Playbook
- **Environment Status:** `ENVIRONMENT=SIMULATED` | `ENABLE_LIVE_PAYMENTS=false`
- **Target Audience:** Payment Operations Engineers, Site Reliability Engineers (SRE), Compliance Officers, Tier-2 Support
- **Status:** Phase 9 Final — Operational Governance Blueprint

---

## 1. Operational Overview & Governance Principles

This runbook establishes formal, production-grade **Standard Operating Procedures (SOPs)** for managing the operational, financial, and security lifecycle of **BharatGateway™**.

### Core Operational Principles:
1. **Safety First:** When a financial transaction reaches an uncertain state, **reserve balances and lock state** rather than issuing speculative retries or double credits.
2. **Deterministic Audit Trails:** Every administrative manual action, status override, or credential rotation must be logged with a unique `correlationId` and signed operator ID.
3. **Regulatory Timelines:** Indian payments regulations (specifically RBI’s **TAT Harmonization Circular** and CERT-In’s **Cybersecurity Directions**) mandate strict response clocks:
   - **T+1 Auto-Reversal:** Failed dropped transactions must be reversed within 24 hours to prevent statutory ₹100/day penalties.
   - **6-Hour Incident Reporting:** Security incidents and unauthorized access must be reported to CERT-In within 6 hours.

> [!CAUTION]
> **Operational Reality Disclaimer:** 
> These SOPs are drafted based on verified software state machines and regulatory specifications. They have **not** been tested in an active live banking production environment with real consumer funds. Production operational drills must be executed during Phase 10 staging.

---

## 2. Standard Operating Procedures (SOPs)

### SOP-01: Payment Failure Investigation
- **Trigger:** Merchant or customer reports payment failure or high drop-off rate on checkout.
- **Responsible Role:** Payment Operations Specialist / Tier-2 Support
- **Diagnostic Procedure:**
  1. Locate the transaction using the `orderId` or `paymentId` in `bg_payments`.
  2. Inspect the `error_code` and `failure_reason`:
     - `ERR_CARD_DECLINED` / `BAD_REQUEST_PAYMENT_PIN_INCORRECT`: Customer-side authentication failure (declined by issuing bank). Direct customer to re-attempt with alternate payment method.
     - `ERR_INSUFFICIENT_FUNDS`: Customer issuing bank account balance exhausted.
     - `ERR_PROVIDER_TIMEOUT`: Upstream acquiring bank or network switch timeout. Proceed immediately to **SOP-02**.
  3. Verify whether customer account was debited via the partner PA’s authoritative portal.
- **Unresolved Dependency:** Access to the partner PA's real-time banking switch dashboard.

---

### SOP-02: Uncertain Payment and Refund Recovery
- **Trigger:** Payment attempt or refund enters status `UNCERTAIN` or `PENDING` due to an HTTP 504 / connection drop.
- **Responsible Role:** Financial Systems Engineer & Automated Reconciliation Cron
- **Recovery Procedure:**
  1. **Do NOT Issue Immediate Duplicate Refund/Payment:** The engine’s two-tier lock reserves the balance. Submitting a duplicate request risks double-debiting.
  2. **Automated Poll (First 15 Minutes):** Allow `fetchRefundStatus()` or `verifyPaymentStatus()` background cron to query the provider REST API at 1-minute, 5-minute, and 15-minute intervals.
  3. **Authoritative Status Resolution:**
     - If provider confirms `CAPTURED` / `PROCESSED`: Transition order to `CAPTURED` or refund to `COMPLETED`; update `bg_ledger_entries`.
     - If provider confirms `FAILED`: Release the reserved balance; transition status to `FAILED`.
  4. **Manual Intervention (After 60 Minutes):** If status remains unresolved after 1 hour, operator must cross-check the partner PA’s web portal using `provider_ref` and execute administrative reconciliation.
- **Unresolved Dependency:** Active provider sandbox or production API keys supporting programmatic status queries.

---

### SOP-03: Reconciliation Discrepancy Resolution
- **Trigger:** Daily midnight automated reconciliation batch returns `DISCREPANCIES_DETECTED`.
- **Responsible Role:** Lead Financial Reconciliation Specialist
- **Resolution Procedure:**
  1. Ingest batch report via `reconService.getReport(batchId, merchantId)`.
  2. Classify discrepancies into three standard buckets:
     - **Timing Mismatch (T+1 Cut-off):** Transaction occurred near 23:59 IST and was cleared in the next day’s settlement file. Defer resolution to next batch.
     - **Amount Discrepancy (MDR / Fee Mismatch):** Provider deducted higher interchange or processing fee than configured. Flag for commercial contract audit.
     - **Missing Transaction (Phantom Debit):** Provider statement contains a debit not present in `bg_payments`. Check webhook dead-letter queue for dropped notifications.
  3. Generate manual balancing adjustment entry in `bg_ledger_entries` with type `ADJUSTMENT` and operator reference.
- **Unresolved Dependency:** Automated ingestion of provider MIS CSV settlement reports from Razorpay/Cashfree.

---

### SOP-04: Webhook Backlog and Delivery Failures
- **Trigger:** Alerts indicate growing queue of undelivered webhooks or high retry failure rate in `bg_webhook_deliveries`.
- **Responsible Role:** SRE & Integration Support Engineer
- **Diagnostic & Recovery Procedure:**
  1. Inspect `bg_webhook_deliveries` where `status = 'RETRYING'` or `status = 'PERMANENTLY_FAILED'`.
  2. Differentiate between platform failure and merchant endpoint failure:
     - If all merchants are failing: Verify egress network connectivity, DNS resolution, and Redis queue health.
     - If a specific merchant endpoint is returning HTTP 500 / 503: The exponential backoff engine will attempt retries at 5s, 15s, 45s, 135s.
  3. If merchant endpoint remains down for > 4 hours, mark endpoint `DEGRADED`, notify merchant technical contact, and provide manual webhook redelivery via merchant dashboard.
- **Unresolved Dependency:** Dedicated Redis/BullMQ background queue worker deployment.

---

### SOP-05: Security Incident Response & Credential Rotation
- **Trigger:** Suspected API key leak, unauthorized admin login, or CERT-In severity-1 alert.
- **Responsible Role:** Chief Information Security Officer (CISO) & Security Incident Team
- **Emergency Action Checklist (6-Hour Window):**
  1. **T + 00:15 - Key Revocation:** Instantly revoke compromised API key via `merchantService.revokeApiKey(credentialId)`.
  2. **T + 00:30 - Dual-Key Rotation:** Issue new credential pair (`pk_test_...`, `sk_test_...`) and update encrypted vault secrets.
  3. **T + 01:00 - Audit Log Forensics:** Query `bg_audit_logs` using `correlationId` and IP addresses to isolate the attack vector.
  4. **T + 04:00 - Incident Report Draft:** Compile incident timeline, impacted merchant IDs, and remedial actions taken.
  5. **T + 05:30 - CERT-In Submission:** Submit mandatory incident notification to `incident@cert-in.org.in` in compliance with April 28, 2022 Directions.
- **Unresolved Dependency:** Formal designation and registration of BharatGateway Incident Point of Contact on CERT-In portal.

---

### SOP-06: Merchant Complaints & Chargeback Representment
- **Trigger:** Customer initiates chargeback dispute with card issuing bank; partner PA fires `dispute.created` webhook.
- **Responsible Role:** Merchant Risk & Dispute Operations Analyst
- **Representment Protocol:**
  1. Capture dispute record in `bg_disputes` with response deadline (typically 3–5 business days).
  2. Notify travel merchant via dashboard alert and email requesting fulfillment evidence:
     - Passenger PNR & E-Ticket delivery confirmation.
     - Hotel check-in voucher or GPS tour boarding log.
     - Merchant Terms of Service acceptance log with customer IP and timestamp.
  3. Bundle evidence and submit representment to partner PA via dispute management API.
  4. If dispute is lost, enforce deduction from merchant’s rolling reserve; record debit in `bg_ledger_entries`.
- **Unresolved Dependency:** Automated dispute representment API integration with partner PA.

---

### SOP-07: Provider Outages & Failover Routing
- **Trigger:** Upstream partner PA error rate exceeds 5% over a 5-minute sliding window; circuit breaker trips.
- **Responsible Role:** SRE On-Call & Payment Routing Architect
- **Failover Procedure:**
  1. Health monitor alerts on `RAZORPAY_SANDBOX` latency > 5000ms or HTTP 5xx errors.
  2. Circuit breaker enters `OPEN` state.
  3. Automatic smart-router redirects new checkout payment sessions to secondary provider (e.g., `CASHFREE_SANDBOX`).
  4. Inbound webhooks for in-flight transactions continue processing against primary provider.
  5. Once primary provider returns HTTP 200 on health checks for 3 consecutive minutes, circuit enters `HALF-OPEN` and gradually restores traffic.
- **Unresolved Dependency:** Secondary provider adapter implementation and live multi-acquirer agreement.

---

### SOP-08: Database Backup, Restoration & Point-in-Time Recovery (PITR)
- **Trigger:** Scheduled weekly backup drill, data corruption event, or disaster recovery test.
- **Responsible Role:** Lead Database Administrator (DBA) & Infrastructure Architect
- **Restoration Drill Protocol:**
  1. **Continuous WAL Archiving:** Ensure PostgreSQL Write-Ahead Logs (WAL) are streamed continuously to an encrypted AWS S3 bucket in Mumbai (`ap-south-1`).
  2. **Automated Daily Snapshots:** Verify that RDS Multi-AZ daily automated snapshots succeed at 02:00 IST.
  3. **Restoration Drill (Monthly):**
     - Spin up isolated staging RDS instance from snapshot.
     - Replay WAL logs to target timestamp: `recovery_target_time = '2026-10-23 12:00:00+05:30'`.
     - Execute automated integrity script: assert that `bg_orders`, `bg_payments`, and `bg_ledger_entries` pass zero-sum validation.
  4. Destroy test instance and log recovery time (Target: RTO < 30 minutes, RPO < 5 minutes).
- **Unresolved Dependency:** AWS RDS PostgreSQL production cluster provisioning.

---

## 3. Operational Escalation Matrix

```
+---------------------------------------------------------------------------------------------------------+
|                                    OPERATIONAL ESCALATION DIRECTORY                                     |
+--------------------------+-----------------------+---------------------+--------------------------------+
| Severity Level           | Escalation Target     | Response SLA        | Notification Channels          |
+--------------------------+-----------------------+---------------------+--------------------------------+
| **P1 - Critical Outage** | SRE Lead + CISO + CEO | 15 Minutes          | PagerDuty, SMS, Critical Call  |
| **P2 - Degraded Recon**  | Recon Lead + DBA      | 1 Hour              | Slack `#finops-alerts`, Email  |
| **P3 - Merchant Dispute**| Dispute Ops Specialist| 4 Hours             | Jira Service Desk, Dashboard   |
| **P4 - Minor Support**   | Tier-1 Support Agent  | 24 Hours            | Email Ticket Queue             |
+--------------------------+-----------------------+---------------------+--------------------------------+
```

*Runbook Authored By: Senior Fintech Operations Architect & SRE Lead*  
*Approved For: Phase 9 Operational Governance Documentation*

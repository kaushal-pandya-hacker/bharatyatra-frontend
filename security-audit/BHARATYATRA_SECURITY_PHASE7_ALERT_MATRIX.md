# BharatYatra Security Alert Matrix & Threat Thresholds
## Document Reference: `BHARATYATRA_SECURITY_PHASE7_ALERT_MATRIX.md`
**Phase**: Phase 7 — Security Monitoring, Threat Detection, Alerting & Incident Response  
**Service Engine**: BharatYatra NestJS Backend & Monitoring Ingestion  
**Status**: CODE CHECKS PASS, MONITORING DEPLOYMENT VERIFICATION REQUIRED  
**Timestamp**: 2026-10-21  

---

## 1. Alerting Strategy & Alert Storm Suppression

In high-concurrency production systems, generating one notification per security anomaly leads to alert saturation, operational fatigue, and system unresponsiveness.

BharatYatra implements a two-stage sliding window and cooldown deduplication mechanism:
1. **Sliding Window Accumulator**: Events are tracked per `[EventType + ActorKey]` tuple over a configurable time window (e.g. 10–120 seconds).
2. **Threshold Trigger**: When cumulative events hit the predefined threshold within the window, a single high-priority alert is emitted.
3. **Active Cooldown Window**: A cooldown timer (300–600 seconds) is immediately registered. Any subsequent matching events increment the alert's internal `triggerCount` and update `lastObservedAt` without spamming notification channels.

---

## 2. Threat Detection & Alert Threshold Matrix

| Alert ID | Event Type | Severity | Signal & Source | Threshold Rule (Window / Threshold) | Cooldown Window | Alert Target & Notification Channel | Immediate Operational Response | Deployed Verification |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| `SEC-ALT-001` | `AUTH_FAILURE` | `HIGH` | Repeated 401s on `/auth/login`, `/auth/refresh` | **5 failures** in **60s** per IP/User | 300s (5m) | `#security-alerts` (Slack) / Security On-Call | Temporarily throttle offending IP at WAF level; inspect for credential stuffing. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-002` | `AUTH_TOKEN_INVALID` | `WARN` | Malformed / Expired JWT validation failures | **10 failures** in **60s** per IP | 300s (5m) | `#ops-warnings` (Slack) | Inspect frontend token refresh loops or expired Supabase sessions. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-003` | `ACCESS_DENIED_IDOR` | `HIGH` | 403 Forbidden on Orders, Refunds, Packages | **3 violations** in **60s** per User/IP | 600s (10m) | `#security-incident` (Slack) / Security On-Call | Review target resource IDs. Investigate authenticated account for BOLA/IDOR exploit attempts. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-004` | `RATE_LIMIT_TRIGGERED` | `WARN` | 429 Too Many Requests | **20 triggers** in **60s** per IP | 300s (5m) | Ops Dashboard / Cloudflare Telemetry | Evaluate whether legitimate user spike or scraping bot; adapt rate limit tier if required. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-005` | `PRIVILEGE_CHANGE` | `CRITICAL` | Agency status approval or Admin role modification | **1 change** in **10s** | 300s (5m) | `#admin-audit` (Slack) + SMS Pager | Cross-verify change against internal administrative change ticket; revoke session if unapproved. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-006` | `WEBHOOK_SIGNATURE_FAILURE`| `CRITICAL`| Razorpay HMAC signature mismatch | **3 failures** in **120s** | 600s (10m) | `#payment-critical` (Slack) + PagerDuty P1 | Block calling IP at Cloudflare WAF; verify `RAZORPAY_WEBHOOK_SECRET` environment variable validity. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-007` | `WEBHOOK_DUPLICATE_DELIVERY`| `WARN`| Redelivery of processed event ID | **15 events** in **60s** | 300s (5m) | `#payment-ops` (Slack) | Review Razorpay webhook delivery status dashboard; check webhook response latencies. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-008` | `BOOKING_STATE_INVALID`| `HIGH` | Illegal booking state machine transition | **2 transitions** in **60s** | 600s (10m) | `#booking-integrity` (Slack) | Inspect concurrent payment checkout races or tampered frontend payloads. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-009` | `PRICE_MANIPULATION_ATTEMPT`| `CRITICAL`| Negative price or client cart mismatch | **1 attempt** in **10s** | 600s (10m) | `#security-incident` (Slack) + PagerDuty P1 | Freeze checkout session; log actor IP and session; inspect request payload for tampering. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-010` | `DB_CONNECTION_FAILURE`| `CRITICAL`| Database pool exhaustion or connection drop | **3 failures** in **30s** | 300s (5m) | `#database-ops` + PagerDuty P1 | Check PostgreSQL active connections (`pg_stat_activity`); inspect slow queries or Supabase pooler. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-011` | `REDIS_FALLBACK_ACTIVATED`| `WARN` | Redis disconnect; local cache fallback | **5 fallback events** in **60s** | 300s (5m) | `#ops-warnings` (Slack) | Restart Redis container/cluster; verify Redis memory and network connectivity. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-012` | `NEXI_TOOL_AUTH_DENIAL`| `HIGH` | AI customer support denied tool execution | **3 denials** in **60s** | 600s (10m) | `#ai-ops` (Slack) | Check for prompt injection attempts trying to force NEXI to call administrative actions. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-013` | `SECRET_VALIDATION_FAILURE`| `CRITICAL`| Missing production secret or placeholder | **1 occurrence** in **10s** | 600s (10m) | PagerDuty P1 + Deploy Blocker | Abort deployment pipeline immediately; inject valid vault secrets into container environment. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |
| `SEC-ALT-014` | `SUSPICIOUS_PAYMENT_ACTIVITY`| `CRITICAL`| Currency mismatch or refund hijack | **2 events** in **60s** | 600s (10m) | `#payment-critical` + PagerDuty P1 | Halt automated refund pipeline; review transaction IDs against Razorpay dashboard. | `IMPLEMENTED AND TESTED` (Code) / `UNVERIFIED` (Channel) |

---

## 3. Infrastructure & Platform Alerts (Cloud / Host Telemetry)

These metrics originate from the hosting environment and reverse proxy. Where an external monitoring SaaS (Datadog, New Relic, CloudWatch) is not yet attached, these alert rules must be imported into the cloud provider's monitoring configuration.

| Alert Metric | Signal | Threshold Rule | Evaluation Window | Operational Destination | Response Runbook | Verification Status |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **Sustained 5xx Spike** | HTTP 500/502/503 responses | > 2% of total traffic | 3 minutes | PagerDuty P1 | Inspect error logs via correlation ID; scale backend pods if OOM. | `UNVERIFIED` (Cloud Metric) |
| **Process Memory Saturation** | `system.memory.heapUsedMb` | > 85% of Node.js heap limit (1.4GB) | 5 minutes | `#ops-warnings` | Check for memory leaks in large data queries; trigger graceful rolling restart. | `IMPLEMENTED AND TESTED` (Exposed in `/health/metrics`) |
| **CPU Saturation** | Backend container CPU | > 85% utilization | 5 minutes | Auto-scaling Group | Scale out container replicas; analyze hot loops or AI parsing routines. | `UNVERIFIED` (Cloud Metric) |
| **Database Pool Saturation** | Active connections / Max Pool (20) | > 90% pool utilization (18+ connections) | 2 minutes | `#database-ops` | Terminate idle connections; scale Supabase transaction pooler. | `UNVERIFIED` (Cloud Metric) |
| **Automated Backup Failure** | Supabase automated backup event | Missed scheduled daily backup (> 26h) | Daily | `#infrastructure-critical` | Execute manual Supabase logical backup via `pg_dump`; inspect storage quota. | `UNVERIFIED` (Cloud Metric) |

---

## 4. Alert Routing & Notification Setup Guide

To link BharatYatra's in-memory alerts to live messaging channels:
1. **Slack Webhook Integration**: Set `SECURITY_ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/...` in backend environment.
2. **PagerDuty Incident Integration**: Set `PAGERDUTY_ROUTING_KEY=...` for P1 severity alerts (`WEBHOOK_SIGNATURE_FAILURE`, `PRICE_MANIPULATION_ATTEMPT`, `DB_CONNECTION_FAILURE`).
3. **Log Shipper Filter**: If using Datadog or AWS CloudWatch, create a metric filter on JSON log stream where `eventType` is defined and `severity IN ["HIGH", "CRITICAL"]`.

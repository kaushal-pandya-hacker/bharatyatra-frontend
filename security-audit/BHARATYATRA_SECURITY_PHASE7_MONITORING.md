# BharatYatra Security Monitoring & Threat Detection Architecture
## Document Reference: `BHARATYATRA_SECURITY_PHASE7_MONITORING.md`
**Phase**: Phase 7 — Security Monitoring, Threat Detection, Alerting & Incident Response  
**Service Engine**: BharatYatra NestJS Backend (`18_DEVELOPMENT/Backend`) & Next.js Frontend  
**Status**: CODE CHECKS PASS, MONITORING DEPLOYMENT VERIFICATION REQUIRED  
**Timestamp**: 2026-10-21  

---

## 1. Executive Summary

Phase 7 establishes a production-grade, privacy-first security monitoring and threat detection framework for the BharatYatra travel platform. The architecture provides:
1. A **14-event standardized security taxonomy** covering authentication abuse, BOLA/IDOR attempts, payment tampering, rate-limit spikes, and database pool saturation.
2. A **hardened centralized logging pipeline** that enforces recursive redaction of credentials, payment cards, and JWT tokens, alongside strict CRLF sanitization to eliminate log-injection / log-forgery attacks.
3. An **in-memory sliding-window threat evaluator** that identifies brute-force and attack patterns in real time while suppressing alert storms using active cooldown deduplication.
4. **Decoupled liveness, readiness, and metrics endpoints** (`/health/liveness`, `/health/readiness`, `/health/metrics`) providing low-cardinality system telemetry without leaking secrets or causing restart loops during optional dependency blips.

---

## 2. Standardized Security Event Taxonomy

All security-relevant operations throughout the application emit structured events following a uniform 4-tier severity model:
- `INFO`: Normal audited security checkpoints (e.g., successful privileged action verification).
- `WARN`: Degradations or suspicious traffic patterns requiring operational tracking (e.g., rate limits hit, duplicate webhook retries, Redis fallback active).
- `HIGH`: Definite unauthorized operations or suspicious brute-force activity (e.g., 401 login failures, 403 BOLA/IDOR access violations, AI tool authorization denials).
- `CRITICAL`: Severe security threats, data tampering, or platform outages (e.g., webhook signature failures, price tampering, database connection drops, missing production secrets).

### Defined Event Catalog

| Event Type Enum | Default Severity | Description & Security Boundary |
| :--- | :---: | :--- |
| `AUTH_FAILURE` | `HIGH` | Repeated login failures, bad passwords, or non-existent account attempts |
| `AUTH_TOKEN_INVALID` | `WARN` | Malformed, expired, or untrusted JWT / Supabase tokens submitted to API |
| `ACCESS_DENIED_IDOR` | `HIGH` | Cross-user or cross-agency access attempts to orders, refunds, or carts (BOLA/IDOR) |
| `RATE_LIMIT_TRIGGERED` | `WARN` | IP or client exceeding tier limits on sensitive routes (`/auth/*`, `/cart/*`, `/checkout/*`) |
| `PRIVILEGE_CHANGE` | `CRITICAL` | Administrative role escalation, permission updates, or agency approval status changes |
| `WEBHOOK_SIGNATURE_FAILURE`| `CRITICAL` | HMAC-SHA256 signature verification failure on payment callbacks (tampering/spoofing) |
| `WEBHOOK_DUPLICATE_DELIVERY`| `WARN` | Repeated inbound webhook delivery for an already processed event ID (retry storm) |
| `BOOKING_STATE_INVALID` | `HIGH` | Illegal booking state machine transition attempt (e.g., paying for cancelled booking) |
| `PRICE_MANIPULATION_ATTEMPT`| `CRITICAL` | Negative price, price mismatch, or modified client total passed to payment engine |
| `DB_CONNECTION_FAILURE` | `CRITICAL` | Database connection drop, query timeout, or pool saturation |
| `REDIS_FALLBACK_ACTIVATED` | `WARN` | Redis cache connectivity lost; automatic in-memory rate-limiting fallback engaged |
| `NEXI_TOOL_AUTH_DENIAL` | `HIGH` | AI customer support attempted unverified tool execution or unauthorized access |
| `SECRET_VALIDATION_FAILURE`| `CRITICAL` | Production environment detected placeholder secrets or unconfigured signing keys |
| `SUSPICIOUS_PAYMENT_ACTIVITY`| `CRITICAL` | Mismatched currency, unexpected refund initiation, or payment ID reuse |

---

## 3. Structured Logging & Redaction Engine

### Log Schema Definition (`v1.0`)

All security events generated via `SecurityMonitoringService.recordEvent()` conform to the following bit-exact JSON schema:

```json
{
  "timestamp": "2026-10-21T12:00:03.007Z",
  "schemaVersion": "1.0",
  "eventType": "AUTH_FAILURE",
  "severity": "HIGH",
  "message": "Invalid credentials provided for user login",
  "correlationId": "sec_1792584003007_f0cccf",
  "actor": {
    "userId": "usr_948194",
    "ip": "203.0.113.195",
    "userAgent": "Mozilla/5.0 Synthetic Test Agent",
    "role": "CUSTOMER"
  },
  "resource": {
    "entityType": "AUTH_SESSION",
    "entityId": "sess_999"
  },
  "metadata": {
    "attemptCount": 3
  }
}
```

### Log Injection Defense (CRLF Stripping)
Attackers frequently inject carriage returns (`\r\n`) into unvalidated inputs (such as usernames or headers) to forge log entries or poison log indexers (ELK/Datadog).
- `SecurityMonitoringService.sanitizeForLogging()` systematically strips carriage returns (`\r`), newlines (`\n`), tab characters (`\t`), and non-printable control characters (`\u0000-\u001f\u007f-\u009f`), collapsing consecutive whitespace to safe single spaces.

### Recursive Secret & PII Redaction
The engine sanitizes strings, arrays, and arbitrarily nested objects prior to writing to the log stream:
1. **Bearer Tokens**: `Bearer [REDACTED_TOKEN]`
2. **JWT Tokens**: Pattern `ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?...` -> `[REDACTED_JWT]`
3. **Credit Cards**: 13–19 digit sequences matching Luhn candidates -> `[REDACTED_CARD]`
4. **Key-Value Matchers**: Any key containing `password`, `secret`, `token`, `key`, `card`, `cvv`, `cvc`, `jwt`, `authorization`, or `signature` is masked with `[REDACTED]`.

---

## 4. Telemetry & Health Monitoring Architecture

### Liveness Probe (`GET /api/v1/health/liveness`)
- **Purpose**: Informs Kubernetes or container orchestrator that the Node.js process is executing and event loop is healthy.
- **Independence**: Never blocks on external infrastructure (PostgreSQL, Supabase, Redis).
- **Restart Loop Prevention**: If the database suffers a temporary blip, the liveness probe remains `UP`, preventing cascading container restart thrashing.

### Readiness Probe (`GET /api/v1/health/readiness` & `GET /api/v1/health`)
- **Purpose**: Informs ingress reverse proxies (Cloudflare, AWS ALB, Nginx) whether the instance can safely accept live user traffic.
- **Database Dependency**: Executes bounded health probe (`SELECT 1`). Returns `503 Service Unavailable` if database is down.
- **Cache Resilience**: Redis degradation marks `dependencies.redis = "UNHEALTHY"`, but keeps status `UP` because in-memory rate limiting and caching fallbacks allow service continuation.

### Low-Cardinality Telemetry Metrics (`GET /api/v1/health/metrics`)
Provides Prometheus / Datadog-scrapeable system telemetry without personal data:
- `system.uptimeSeconds`: Continuous process uptime.
- `system.memory`: `rssMb`, `heapTotalMb`, `heapUsedMb`, `externalMb`.
- `system.cpu`: User and system CPU microseconds.
- `monitoring.activeAlertsInCooldown`: Number of active threat incidents currently in deduplication cooldown.
- `monitoring.totalHistoricalAlerts`: Total alerts recorded since service startup.
- **Zero PII Guarantee**: Strictly excludes email addresses, user IDs, booking IDs, session tokens, or transaction amounts.

---

## 5. Verification & Deployment Requirements

| Component | Code Implementation | Deployed Infrastructure Status | Action Required For Production |
| :--- | :---: | :---: | :--- |
| Structured Security Logger | `IMPLEMENTED AND TESTED` | `UNVERIFIED` | Configure stdout log shipper (FluentBit / Datadog Agent) |
| In-Memory Threat Detection | `IMPLEMENTED AND TESTED` | `IMPLEMENTED BUT NOT DEPLOYED` | Verified in unit test harness; runs in process |
| Centralized Alert Dispatch | `IMPLEMENTED AND TESTED` | `UNVERIFIED` | Configure Slack/PagerDuty webhook URLs in environment |
| PII & Secret Redaction | `IMPLEMENTED AND TESTED` | `IMPLEMENTED BUT NOT DEPLOYED` | Active on all `recordEvent` invocations |
| Liveness/Readiness Separation| `IMPLEMENTED AND TESTED` | `UNVERIFIED` | Point K8s probes to `/health/liveness` and `/health/readiness` |
| Metrics Endpoint | `IMPLEMENTED AND TESTED` | `UNVERIFIED` | Add Prometheus / Datadog scrape job for `/health/metrics` |

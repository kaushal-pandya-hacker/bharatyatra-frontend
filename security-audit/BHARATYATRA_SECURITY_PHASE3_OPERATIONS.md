# BHARATYATRA SECURITY PHASE 3 — OPERATIONAL RUNBOOK
## Traffic Investigation, Limit Tuning, Incident Response & Rollback Procedures

- **Target Audience**: SREs, DevOps Engineers, and Security Incident Responders
- **Classification**: Operational Runbook
- **Date**: October 21, 2026

---

## 1. How to Investigate Traffic Spikes & Anomalies

### 1.1 Identifying the Attack Vector
When alerted to an increase in HTTP 429, 401, or 5xx responses:
1. **Filter Application Logs**:
   Search for structured security audit logs in CloudWatch / Datadog / Elasticsearch:
   ```bash
   grep "\[SECURITY_AUDIT\] Rate limit exceeded" app.log
   ```
   Example log output:
   `[RateLimitGuard] [SECURITY_AUDIT] Rate limit exceeded by IP: 203.0.113.50 on POST /api/v1/auth/login | RetryAfter: 60s`
   `[RateLimitGuard] [SECURITY_AUDIT] Rate limit exceeded for Account: victim@example.com from IP: 198.51.100.22 on POST /api/v1/auth/login`

2. **Categorize the Spike**:
   - **Single IP, Multiple Endpoints**: Layer 7 crawler or scraper -> Block at Cloudflare Edge.
   - **Distributed IPs, Single Account Target**: Credential stuffing attack -> Multi-dimensional account limiter will throttle; investigate target accounts.
   - **Distributed IPs, Search/Catalog Endpoints**: Content scraping botnet -> Enable Cloudflare Under Attack Mode or Super Bot Fight Mode.
   - **High Volume to Origin Directly**: Origin bypass attack -> Verify `ORIGIN_VERIFY_SECRET` is active and security group drops non-Cloudflare traffic.

---

## 2. How to Tune Rate Limits Safely

All default rate limits are deliberately defined with high resilience, but can be customized via environment variables without requiring code changes:

| Environment Variable | Default Value | Description | Recommended Tuning Guidance |
| :--- | :--- | :--- | :--- |
| `RATE_LIMIT_NEXI_POINTS` | `30` | Max NEXI AI messages per minute per IP/user | Decrease to `15` during Gemini API quota constraints; increase to `60` during peak tourism festivals. |
| `MAX_REQUEST_BODY_SIZE` | `1mb` | Max inbound JSON/URL-encoded payload size | Increase to `5mb` only if bulk package batch import is enabled. Never allow `>10mb` on public endpoints. |
| `HEADERS_TIMEOUT_MS` | `20000` (20s) | Max time allowed to receive HTTP headers | Decrease to `10000` (10s) during slowloris attack surges. |
| `REQUEST_TIMEOUT_MS` | `30000` (30s) | Max duration for complete request execution | Decrease to `15000` (15s) if backend is struggling with queue backlog. |
| `RATE_LIMIT_DISABLED` | `false` | Emergency bypass switch | **EMERGENCY ONLY**: Set to `true` if a critical misconfiguration causes mass false positives for real users. |

### Tuning Procedure:
1. Update the environment variable in your deployment platform (e.g. AWS ECS Task Definition or Kubernetes ConfigMap).
2. Execute a rolling restart of the backend service pods.
3. Monitor 429 response metrics for 15 minutes to verify that false positive rates normalize while attack traffic remains constrained.

---

## 3. Incident Response: Outage Scenarios

### Scenario A: Redis Outage / Connection Drop
- **Symptoms**: Redis service reports timeout; application logs display:
  `[RateLimiterService] Redis rate limit error, falling back to in-memory: Connection dropped`
- **Impact**: Backend automatically falls back to in-memory sliding bucket rate limiting. Individual instances throttle locally. Rate limits are **NOT** disabled.
- **Action Plan**:
  1. Check Redis CPU and memory saturation (`INFO memory` in redis-cli).
  2. If using AWS ElastiCache / Upstash, verify VPC peering and security group port 6379 connectivity.
  3. Once Redis connectivity is restored, the `RedisService` automatically re-establishes connections and `RateLimiterService` resumes distributed counting without restarting the backend.

### Scenario B: Cloudflare / Edge Provider Outage
- **Symptoms**: DNS resolution failures or HTTP 52x errors from edge nodes.
- **Action Plan**:
  1. Check Cloudflare Status (`www.cloudflarestatus.com`).
  2. If edge disruption is severe and prolonged:
     - Temporarily update DNS to point directly to the origin Application Load Balancer (ALB).
     - Temporarily remove `ORIGIN_VERIFY_SECRET` from the backend environment so requests without the edge header are accepted.
     - Note: Local `RateLimitGuard` will continue enforcing all rate limits at the origin!

---

## 4. Rollback Instructions

If a Phase 3 change causes unexpected issues in production:

### 1. Emergency Rate Limit Disable:
Set `RATE_LIMIT_DISABLED=true` in the environment configuration and restart the container. This bypasses the guard entirely while keeping all other application services operational.

### 2. Origin Shielding Disable:
If edge proxies fail to pass the `X-Origin-Verify` header and legitimate requests are receiving HTTP 403 Forbidden:
- Remove `ORIGIN_VERIFY_SECRET` from the environment or set it to an empty string.
- Backend will immediately resume accepting direct requests without the header.

### 3. Git Code Rollback:
If code rollback is required, revert the Phase 3 commits while preserving Phase 2:
```bash
git log --oneline -n 5
git revert <PHASE_3_COMMIT_HASH>
npm test
```
All Phase 2 authentication and account security protections will remain intact.

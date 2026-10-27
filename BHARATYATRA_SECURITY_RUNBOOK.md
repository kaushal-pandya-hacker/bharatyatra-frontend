# BharatYatra Production Security & Incident Response Runbook
**System**: BharatYatra Core Travel Platform  
**Target Roles**: DevSecOps Engineers, Site Reliability Engineers (SRE), Security Operations Center (SOC)  
**Revision Date**: 2026-10-21  

---

## 1. Edge & DDoS Protection Architecture (Cloudflare / CDN)

In a production cloud deployment, defense-in-depth requires protection at both the network edge (Cloudflare) and application runtime (NestJS).

### A. Edge WAF & Bot Management Rules
1. **DDoS & Managed Rules**:
   - Enable Cloudflare Managed Rulesets: OWASP Core Ruleset (Block on Paranoia Level 2, Anomaly Score $\ge 25$).
   - Enable Bot Fight Mode / Super Bot Fight Mode: Challenge automated bots accessing `/api/v1/auth/*` and `/api/v1/checkout/*`.
2. **Edge Rate Limiting Rules**:
   - Rule 1 (Login Defense): `/api/v1/auth/login` — 10 requests / 1 minute per IP $\rightarrow$ Managed Challenge.
   - Rule 2 (OTP Defense): `/api/v1/auth/otp/*` — 5 requests / 1 minute per IP $\rightarrow$ Block (1 hour).
   - Rule 3 (AI Protection): `/api/v1/nexi/chat` — 30 requests / 1 minute per IP $\rightarrow$ HTTP 429.
3. **Origin Lockdown & Mutual TLS (mTLS)**:
   - Ensure the origin server (AWS ALB / GCP Ingress) ONLY accepts traffic originating from Cloudflare IP ranges.
   - Use Cloudflare Authenticated Origin Pulls (AOP) with an origin SSL certificate to prevent attackers from bypassing the edge CDN and hitting the origin IP directly.

### B. Client IP Derivation & Proxy Trust
- In the NestJS backend, ensure `TRUST_PROXY=1` is set when behind Cloudflare or ALB.
- `RateLimitGuard` automatically extracts the verified client IP from `cf-connecting-ip`.

---

## 2. Security Incident Response Checklist

When abusive traffic, unauthorized spikes, or security alerts are detected, execute this triage workflow:

### Phase 1: Detection & Immediate Assessment (0–15 Minutes)
- [ ] Check Cloudflare Analytics / Ingress logs for traffic anomalies (e.g. 10x surge on `/auth/login` or `/auth/otp/send`).
- [ ] Inspect application structured security logs:
  ```bash
  # Filter security events in production logs
  grep "\[SECURITY_AUDIT\]" /var/log/bharatyatra/app.log
  ```
- [ ] Identify attack vectors:
  - Is it a distributed credential stuffing attack? (Surge of 401/429 with varied IPs targeting common email patterns).
  - Is it an SMS OTP gateway exhaustion attack? (Surge on `/auth/otp/send`).
  - Is it an application DDoS / slowloris flood? (Surge of open sockets without completing HTTP headers).

### Phase 2: Containment & Edge Mitigation (15–30 Minutes)
- [ ] **Activate "Under Attack Mode"** on Cloudflare dashboard for immediate JS/CAPTCHA challenges across all incoming web traffic.
- [ ] **Apply Temporary IP Block Rule**:
  - In Cloudflare Security $\rightarrow$ WAF $\rightarrow$ Custom Rules $\rightarrow$ Add IP Block for malicious ASNs or IP subnets.
- [ ] **Tighten Application Rate Limiting**:
  - If Redis is connected, adjust rate limits on the fly via environment variable `RATE_LIMIT_NEXI_POINTS=15` or container configuration without code redeployment.

### Phase 3: Eradication & System Recovery (30–60 Minutes)
- [ ] Inspect PostgreSQL connection metrics:
  ```sql
  SELECT count(*), state FROM pg_stat_activity GROUP BY state;
  ```
  Terminate any abandoned or blocked queries exceeding 30 seconds:
  ```sql
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND now() - state_change > interval '30 seconds';
  ```
- [ ] Verify Redis memory usage:
  ```bash
  redis-cli info memory
  ```
- [ ] Ensure `health/liveness` returns 200 OK and steady-state latency is $<50\text{ms}$.

---

## 3. Monitoring & Alerting Configuration

Configure alerts in Datadog, Prometheus, or AWS CloudWatch against these baseline thresholds:

| Metric Name | Threshold | Severity | Immediate Action |
| :--- | :--- | :--- | :--- |
| `auth_failures_per_min` | $> 50$ / min | Warning | Investigate potential credential stuffing against `/auth/login`. |
| `rate_limit_triggers_per_min` | $> 100$ / min | Warning | Inspect source IPs for automated scraping or brute force. |
| `http_5xx_rate` | $> 2\%$ of traffic | Critical | Check database connectivity and backend heap memory. |
| `db_pool_active_connections` | $\ge 90\%$ of `DB_POOL_MAX` | Critical | Inspect long-running transactions; verify statement timeouts. |
| `server_p95_latency` | $> 1500\text{ms}$ | High | Investigate CPU starvation or slow third-party provider calls. |

---

## 4. Secret & Credential Rotation Procedures

### A. JWT Signing Key Rotation
1. Generate a new cryptographically secure 256-bit secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update `JWT_SECRET` in the production secret manager.
3. Perform a zero-downtime rolling restart of backend containers.
4. Existing users will be prompted to re-authenticate with mobile OTP upon token expiration.

### B. Admin Bootstrap & Service Secrets
1. Update `ADMIN_SECRET_KEY` and `ADMIN_BOOTSTRAP_PASSWORD`.
2. Existing active admin sessions (`AdminSession`) are automatically invalidated if stored session tokens are purged from the database:
   ```sql
   DELETE FROM "AdminSession" WHERE "createdAt" < NOW();
   ```

### C. Database Credentials Rotation
1. In PostgreSQL / Supabase, create a secondary application user with identical least-privilege permissions.
2. Update `DATABASE_URL` in container environment.
3. Deploy new containers and verify connection pool health.
4. Revoke and drop old database user credentials.

---

## 5. Safe Rollback & Emergency Recovery Steps

If a deployment or configuration change introduces availability regressions:
1. **Container Rollback**:
   ```bash
   # Roll back to the previous stable Docker image / release tag
   docker service update --image bharatyatra-backend:v1.0.0-stable bharatyatra_api
   ```
2. **Emergency Rate-Limit Bypass**:
   - In the event of an erroneous configuration locking out legitimate traffic during a marketing campaign, temporarily set:
     `RATE_LIMIT_DISABLED=true`
     in the environment variables to bypass the guard without application code modification.
3. **Database Health Reset**:
   - If PostgreSQL connections become deadlocked:
     Restart container instances with graceful connection draining (`app.enableShutdownHooks()` handles in-flight requests within 10s).

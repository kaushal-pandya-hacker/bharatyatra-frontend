# BharatYatra Phase 13 — Infrastructure Evidence & Edge Shielding Plan
## Document Reference: `BHARATYATRA_PHASE13_INFRASTRUCTURE_EVIDENCE.md`
**Phase**: Phase 13 — Staging Infrastructure Provisioning & Verification  
**Author**: Senior DevSecOps Engineer & Cloud Security Architect  
**Scope**: Production Edge Architecture, Network-Level Origin Shielding, Redis Failover & Recovery Evidence Plan  
**Status**: **CODE-VERIFIED (Application Handlers) / UNVERIFIED (Live Cloud & Network Controls)**  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Safety Policy

Phase 13 establishes the precise, non-destructive evidence standards required to verify edge security, network-level origin restrictions, trusted-proxy topologies, and failover resilience without modifying production infrastructure.

In strict adherence to the mandate:
> *"Do not treat a custom origin-verification header as a substitute for network-level origin restrictions. Mark cloud-dashboard-only controls UNVERIFIED if evidence is unavailable."*

---

## 2. Infrastructure Evidence & Verification Standards

| Security Domain | Specific Control | Required Verifiable Evidence (Without Modifying Production) | Observed Current Evidence | Status |
| :--- | :--- | :--- | :--- | :---: |
| **HTTPS & TLS** | Edge TLS 1.3 & Certificate Validity | `curl -Iv https://api.bharatyatra.in` output showing valid TLS 1.3 handshake, cipher suite (`TLS_AES_256_GCM_SHA384`), and Certificate Authority issuer (e.g., Let's Encrypt / Cloudflare). | External domain DNS pointing to production; certificate expiration and cipher verification requires external network query. | **UNVERIFIED (Cloud Edge)** |
| **Edge Protection** | Cloudflare Authenticated Origin Pulls (AOP) | Cloudflare Dashboard screenshot / API verification confirming: (1) Zone-level Authenticated Origin Pulls enabled, (2) Origin web server TLS client-certificate authentication (`ssl_client_certificate` in Nginx / Cloudflare CA pem in Caddy/Traefik). | Code checks `x-origin-verify` in `main.ts`, but network-level mTLS client certificate validation is managed at edge/load-balancer level. | **UNVERIFIED (Cloud Edge)** |
| **Origin Shielding** | Network-Level Origin Restrictions | Security Group / Firewall rules (e.g., AWS Security Group / iptables / UFW) on backend container host restricting inbound traffic on ports 80/443 exclusively to published Cloudflare IP address ranges (`https://www.cloudflare.com/ips/`). | Code contains custom header check `x-origin-verify`, which is **NOT a substitute for network-level origin restrictions**. Firewall rules require cloud provider console inspection. | **UNVERIFIED (Cloud Network)** |
| **Trusted Proxy** | Client IP Derivation Topology | Inspection of Express `trust proxy` setting against the actual container/reverse-proxy hop count. | Line 14 of `main.ts` configures `expressApp.set('trust proxy', 'loopback, linklocal, uniquelocal')`. Strictly prevents client spoofing of `X-Forwarded-For`. | **CODE-VERIFIED** |
| **Rate Limiting** | Distributed Rate Limiting & Failover | Test execution verifying: (1) Sliding window rate limiting across distributed requests, (2) Seamless fallback to bounded in-memory rate limiter when Redis throws an error or disconnects. | Automated test [`Phase 8: Redis Failure Injection`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/__tests__/security-phase8-resilience.test.ts) passes. Confirms in-memory fallback engages within < 2ms without dropping legitimate traffic. | **CODE-VERIFIED** |
| **Secrets Manager** | Cloud Vault Secret Injection | Configuration in container orchestrator (e.g. AWS ECS / Render / Fly.io) showing environment variables bound to an encrypted KMS-backed vault rather than committed files. | Code-level fail-closed startup verified in `auth-secret.util.spec.ts`. Live cloud vault bindings require provider dashboard audit. | **UNVERIFIED (Cloud Vault)** |
| **Disaster Recovery**| Physical Isolated Backup Restore Drill | Execution log showing successful restore of a PostgreSQL physical or logical backup into an isolated staging target database, followed by zero constraint/reconciliation errors. | Runbook and SQL consistency queries formulated in [`BHARATYATRA_PHASE11_DISASTER_RECOVERY.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/security-audit/BHARATYATRA_PHASE11_DISASTER_RECOVERY.md). Physical drill halted due to unavailable staging database. | **UNVERIFIED (Restore Drill)** |

---

## 3. Detailed Network-Level Origin Shielding Architecture

To satisfy enterprise DevSecOps standards, the operator must implement **network-level origin shielding** prior to production traffic cutover:

```
[Public Internet]
       |
       v
[Cloudflare Edge Network] (WAF, DDoS Shield, AOP Client Cert)
       |
       |  (Strict TLS 1.3 with Cloudflare Authenticated Origin Pulls)
       v
[Backend Origin Firewall / Security Group]
       |
       +---> [RULE 1]: Allow Ports 80/443 ONLY from Cloudflare IPs
       +---> [RULE 2]: DROP all direct public IP requests (Bypass Prevention)
       v
[NestJS Application Server]
       |
       +---> Enforces Express `trust proxy: loopback`
       +---> Emits `Cache-Control: no-store` on private dynamic APIs
       +---> Validates `x-origin-verify` application defense-in-depth header
```

### Required Operator Firewall Configuration (AWS Security Group Example)
```bash
# Ingress Rule: Restrict HTTP/HTTPS traffic to Cloudflare IP ranges only
# Cloudflare IPv4 ranges: https://www.cloudflare.com/ips-v4
# Cloudflare IPv6 ranges: https://www.cloudflare.com/ips-v6
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  aws ec2 authorize-security-group-ingress \
    --group-id sg-0123456789abcdef0 \
    --protocol tcp --port 443 --cidr $ip
done
```

---

## 4. Workstream Conclusion

- **Application Defense-in-Depth Handlers**: **CODE-VERIFIED** (Trusted proxy, anti-caching, Redis failover verified in tests).
- **Network-Level Origin Restrictions**: **UNVERIFIED (Requires operator cloud security group configuration)**.
- **Cloudflare Edge AOP & Client Certs**: **UNVERIFIED (Requires operator edge dashboard configuration)**.
- **Physical Backup Restoration Drill**: **UNVERIFIED (Requires operator disposable staging database)**.

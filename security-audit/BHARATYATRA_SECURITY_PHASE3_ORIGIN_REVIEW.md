# BHARATYATRA SECURITY PHASE 3 — ORIGIN REVIEW & EDGE TOPOLOGY
## Network Architecture, Origin Shielding & Hosting Infrastructure Verification

- **System**: BharatYatra Production Infrastructure
- **Evaluator**: Senior DevSecOps Engineer & Application Security Architect
- **Date**: October 21, 2026
- **Status**: **INFRASTRUCTURE ACTIONS REQUIRED**

---

## 1. Verified Architecture & Component Discovery

Based on configuration and code evidence across the repository:

| Component | Repository Evidence | Discovered Configuration | Hosting / Provider Architecture |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | `package.json`, `next.config.mjs`, `lib/auth/auth-context.tsx` | Next.js 14.2.5 (App Router & Dynamic API Routes) | Vercel Edge Network / Node SSR Container |
| **Backend API Engine** | `18_DEVELOPMENT/Backend/src/main.ts` | NestJS 10.x, Express HTTP adapter, port 4000/5000 | Containerized Node.js Service (AWS ECS / EC2 / Render) |
| **Relational Database** | `prisma/schema.prisma`, `data/migrations/` | PostgreSQL via Supabase Pooler (`aws-0-ap-south-1.pooler.supabase.com`) | Managed Supabase PostgreSQL (AWS Mumbai Region) |
| **Distributed Cache / Rate Limiter** | `src/redis/redis.service.ts` | ioredis client (`REDIS_URL`) | Redis Cluster / Upstash / AWS ElastiCache |
| **AI LLM Provider** | `src/nexi/llm/nexi-gemini.provider.ts` | Google Gemini API (`GEMINI_API_KEY`) | Google AI Studio REST Endpoint |
| **Third-Party Suppliers** | `src/hotels/hotelbeds-client.service.ts` | Hotelbeds HBX API (SHA256 HMAC headers) | Hotelbeds Live / Sandbox API |

---

## 2. Direct Origin Bypass Analysis

### 2.1 The Vulnerability
In traditional deployments where an edge CDN (Cloudflare or Fastly) terminates SSL and proxies traffic to an origin server, attackers often locate the origin IP (via historical DNS records, certificates, server-generated outbound traffic, or IP scanning).

If port 4000 or 5000 is open to the public internet:
1. Attackers can bypass Cloudflare WAF, Bot Fight Mode, and edge rate limiting completely.
2. Attackers can flood the backend directly, causing CPU, memory, and PostgreSQL connection pool exhaustion.

### 2.2 Application-Layer Shield (Implemented in Code)
To prevent bypass even if network firewalls are misconfigured, `18_DEVELOPMENT/Backend/src/main.ts` now enforces:
```typescript
const originVerifySecret = process.env.ORIGIN_VERIFY_SECRET;
if (originVerifySecret) {
  const headerSecret = req.headers['x-origin-verify'] || req.headers['cf-origin-token'];
  if (headerSecret !== originVerifySecret) {
    return res.status(403).json({ error: 'Forbidden', message: 'Direct origin access prohibited.' });
  }
}
```
Direct origin requests lack this header and are immediately rejected before executing business logic.

---

## 3. Required Hosting-Dashboard Actions (Step-by-Step Operator Guide)

To activate complete edge protection, authorized platform operators must perform the following actions:

### Step 1: Cloudflare Edge Configuration
1. **Enable DNS Proxy**:
   - Ensure the `A` / `CNAME` records for `bharatyatra.in` and `api.bharatyatra.in` are set to **Proxied** (Orange Cloud icon) in the Cloudflare DNS dashboard.
2. **Inject Origin Verification Header**:
   - Navigate to **Rules -> Transform Rules -> Modify Request Header**.
   - Rule Name: `Inject BharatYatra Origin Shield Token`.
   - When incoming request matches: `All incoming requests`.
   - Action: `Set static header`.
   - Header Name: `X-Origin-Verify`.
   - Header Value: `<GENERATE_HIGH_ENTROPY_TOKEN_64_CHARS>`.
3. **Configure Environment Variable**:
   - Set `ORIGIN_VERIFY_SECRET=<GENERATE_HIGH_ENTROPY_TOKEN_64_CHARS>` in the backend hosting environment (e.g. AWS ECS Task Definition or Kubernetes Secret).
4. **Enable Bot Management**:
   - Under **Security -> Bots**, enable **Bot Fight Mode** (Free/Pro) or **Super Bot Fight Mode** (Business/Enterprise).
   - Set Action for definitely automated bots to **Block** or **Managed Challenge**.

### Step 2: Origin Cloud Firewall Rules (AWS Security Groups / Cloud Firewalls)
1. **Inbound HTTP/HTTPS Restrictions**:
   - Restrict inbound TCP traffic on ports 80 and 443 exclusively to Cloudflare's published IP ranges ([cloudflare.com/ips](https://www.cloudflare.com/ips/)).
2. **Management & Database Ports Isolation**:
   - **Port 22 (SSH)**: Strictly restricted to bastion host / corporate VPN IP.
   - **Port 5432 / 6543 (PostgreSQL)**: Must **NEVER** be open to `0.0.0.0/0`. Only backend container private IPs or AWS VPC security groups should be permitted.
   - **Port 6379 (Redis)**: Must be completely private within VPC; no public access permitted.

---

## 4. Unsupported or Unverified Protections

| Protection Mechanism | Current Status | Limiting Factor / Explanation |
| :--- | :--- | :--- |
| **Cloudflare Authenticated Origin Pulls (mTLS)** | **UNVERIFIED** | Requires uploading Cloudflare origin CA certificate to origin web server (Nginx/Traefik). Can be enabled when custom ingress is deployed. |
| **Cloudflare Magic Transit (L3/L4 DDoS)** | **UNSUPPORTED on Free/Pro** | Requires Cloudflare Enterprise plan ($3,000+/mo) with BGP route announcement. Application-level and HTTP-layer defenses are used instead. |
| **Direct Origin IP Isolation** | **UNVERIFIED (Requires Cloud Console)** | Must be verified in the live AWS/GCP/Vercel console by the infrastructure team. |
| **Automatic Edge SSL Strict Mode** | **UNVERIFIED** | Ensure SSL mode in Cloudflare is set to **Full (Strict)** with a valid origin certificate (e.g. Let's Encrypt or Cloudflare Origin CA) to prevent man-in-the-middle attacks between Cloudflare and the origin. |

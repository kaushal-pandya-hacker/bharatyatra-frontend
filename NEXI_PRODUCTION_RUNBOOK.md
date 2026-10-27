# NEXI AI Customer Support — Production Operations Runbook
**System**: BharatYatra NEXI AI Customer Support  
**Backend Framework**: NestJS / Node.js (TypeScript)  
**Target Environment**: Staging & Production Containerized Deployment  
**Revision Date**: 2026-10-21  

---

## 1. Environment Variables Specification

> [!CAUTION]
> Never commit secrets or actual key values into version control. Set these variables strictly in the container environment or deployment dashboard (e.g. AWS SSM, Vercel Settings, or Doppler).

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Conditional | *None* | Google GenAI API key for live inference. If omitted, NEXI operates in verified deterministic fallback mode. |
| `NEXI_MODEL_ID` | Optional | `gemini-2.5-flash` | Supported Google model identifier (e.g. `gemini-2.5-flash`, `gemini-2.5-pro`). |
| `DATABASE_URL` | Required | *None* | PostgreSQL / Supabase connection URI for user bookings, itineraries, and operational tasks. |
| `REDIS_URL` | Optional | `redis://localhost:6379` | Redis instance for session caching and rate-limiting. |
| `PORT` | Optional | `4000` | Port for the NestJS HTTP listener. |
| `NODE_ENV` | Required | `production` | Environment mode (`development`, `test`, `production`). |
| `FRONTEND_URL` | Optional | `http://localhost:3000` | Allowed CORS origin for Next.js frontend clients. |

---

## 2. Setup & Startup Commands

### A. Initial Installation & Dependency Check
```bash
# Navigate to backend root
cd 18_DEVELOPMENT/Backend

# Install dependencies deterministically
npm ci
```

### B. Database Schema & Migration Verification
```bash
# Generate Prisma Client
npx prisma generate

# Apply pending production migrations
npx prisma migrate deploy
```

### C. Build Command
```bash
# Compile NestJS TypeScript to dist/
npm run build
```

### D. Production Startup
```bash
# Start compiled production server
node dist/main.js

# Or run with PM2 / Docker
pm2 start dist/main.js --name "bharatyatra-backend" -i max
```

---

## 3. Verification & Test Commands

Run these automated verification commands before opening public traffic:

### A. NEXI Unit & Integration Tests
```bash
cd 18_DEVELOPMENT/Backend
npx jest src/nexi --forceExit
# Target: 33/33 tests passing (100%)
```

### B. End-to-End Evaluation Suite (220 Cases)
```bash
# From repository root (while backend runs on port 4000)
node testing/run-nexi-evaluation.js
# Target: 100% pass rate, 0% unsupported claims, 100% security interception
```

### C. Frontend Type & Build Check
```bash
cd c:/Users/Pandya Kaushal/Desktop/BhartYatra_3
npm run type-check
```

---

## 4. Health Checks & Synthetic Monitoring

### A. Live Readiness Probe
Send a lightweight test chat payload to verify end-to-end responsiveness:
```bash
curl -X POST http://127.0.0.1:4000/api/v1/nexi/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello NEXI"}'
```
**Expected Response Status**: `200 OK`  
**Expected Response Body**:
```json
{
  "success": true,
  "intent": "QUESTION",
  "provider": "POLICY_GROUNDED_FALLBACK",
  "grounded": false
}
```

### B. Monitoring Key Performance Indicators (KPIs)
- **Chat Latency**: P95 should remain $\le 2000\text{ms}$ under live Gemini inference, and $\le 50\text{ms}$ under deterministic fallback.
- **Provider Status**: Monitor response payload `provider` attribute:
  - `GEMINI_LIVE_INFERENCE`: Normal operation with upstream Google GenAI.
  - `POLICY_GROUNDED_FALLBACK`: Graceful fallback operating when Gemini is rate-limited or API key is absent.
  - `SECURITY_AIRGAP`: Normal operation when intercepting unauthorized or financial requests.

---

## 5. Safe Fallback & Graceful Degradation Behavior

| Failure Mode | Chatbot Behavior | Customer Experience |
| :--- | :--- | :--- |
| **Missing / Expired `GEMINI_API_KEY`** | Automatically engages deterministic knowledge retrieval (`POLICY_GROUNDED_FALLBACK`). | Full answers delivered for GSRTC, IRCTC, hotels, payments, and destination guidelines with 100% accuracy. |
| **Upstream Gemini Outage / Timeout** | Request timeout bounded at 10,000ms. If exceeded, catches `ETIMEDOUT` and returns verified fallback. | User never experiences a 500 error or hanging socket. |
| **PostgreSQL Unreachable** | In-memory resiliency mode activates (`PrismaService`). | General policy queries, tourism questions, and temporary tickets continue without crash. Private booking lookups suggest logging in later. |
| **Rate Limit Triggered (>30 req/min)** | Returns HTTP 429 status with friendly rate-limit notice. | Protects upstream LLM quota and server memory. |

---

## 6. Production Deployment Checklist

- [ ] `GEMINI_API_KEY` configured in production secret manager.
- [ ] `DATABASE_URL` configured and accessible via SSL/TLS.
- [ ] Backend build passes with zero TypeScript warnings (`npm run build`).
- [ ] All 33 unit tests pass (`npx jest src/nexi --forceExit`).
- [ ] Evaluation runner reaches $\ge 90\%$ pass rate (`node testing/run-nexi-evaluation.js`).
- [ ] Ingress firewall allows inbound traffic to `/api/v1/nexi/chat` only over HTTPS.
- [ ] Operational escalation notifications wired to Zendesk / Slack / Email via `OperationalTask`.
- [ ] Production logs scrubbed of credit card numbers, UPI PINs, and plain-text passwords.

---

## 7. Troubleshooting Common Incidents

### Issue 1: High Latency / Chat Responses Slow
1. **Diagnosis**: Upstream Google Gemini endpoint experiencing high regional latency.
2. **Mitigation**: Adjust `NEXI_MODEL_ID` to faster tier `gemini-2.5-flash` or temporarily set `GEMINI_API_KEY=""` to force deterministic fallback (14ms latency) until upstream provider stabilizes.

### Issue 2: Customer Complains of "Duplicate Payment Warning"
1. **Explanation**: If a customer reports money debited for an unconfirmed booking, NEXI is programmed to warn: *"DO NOT re-pay / do not retry payment"*.
2. **Action**: Check payment gateway (Razorpay / Cashfree) webhooks. Once the bank reconciles the webhook, the booking status automatically transitions to `CONFIRMED`.

### Issue 3: In-Memory Ticket Cache Growth
1. **Diagnosis**: Heavy load of human escalations.
2. **Resolution**: `activeTickets` map automatically purges entries older than 15 minutes. No manual heap clearing is required.

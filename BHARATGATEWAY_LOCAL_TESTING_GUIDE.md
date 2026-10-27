# BharatGateway™ — Local Testing & Operations Guide

**Platform:** BharatGateway™ Independent Fintech & Payment Platform  
**Target Environment:** Local Simulated & Local PostgreSQL Test Environment  
**Base URL (Backend):** `http://localhost:4000/api/v1/gateway`  
**Base URL (Frontend):** `http://localhost:3000`  

---

## 1. Safety Rules & Operational Constraints

Before executing any commands:
1. `ENABLE_LIVE_PAYMENTS=false` is enforced at all times.
2. All payment transactions are executed either via the built-in deterministic simulator or the safe contract-mock sandbox adapter.
3. Never use production credit cards, bank credentials, or live UPI VPAs.
4. Never delete, drop, or truncate the shared Docker volume `gateway_pgdata`.

---

## 2. Quick-Start Commands

### Step 2.1: Run All Independent Simulated Tests (Zero Prerequisites)
The following commands execute without requiring Docker, PostgreSQL, or external network connectivity:

```powershell
# Core fintech engine (22 tests)
npx tsx --test __tests__/bharatgateway-fintech-engine.test.ts

# Phase 3 checkout & dashboard integration (7 tests)
npx tsx --test __tests__/bharatgateway-phase3-integration.test.ts

# Phase 4 reconciliation & webhooks (13 tests)
npx tsx --test __tests__/bharatgateway-phase4-reconciliation.test.ts

# Phase 5 reliability & cross-process locks (10 tests)
npx tsx --test __tests__/bharatgateway-phase5-reliability.test.ts

# Phase 6 provider adapters & sandbox contracts (15 tests)
npx tsx --test __tests__/bharatgateway-phase6-sandbox.test.ts

# Phase 9 controlled pilot e2e journey (12 tests)
npx tsx --test __tests__/bharatgateway-phase9-pilot-e2e.test.ts
```

### Step 2.2: Run Master Backend Tests & Builds
```powershell
# Run backend Jest suites (282 tests across 46 suites)
cd 18_DEVELOPMENT/Backend
npm test
npm run build
cd ../..

# Run frontend type-check and linting
npx tsc --noEmit
npm run lint
```

---

## 3. How to Enable & Run Live PostgreSQL Tests (When Ready)

To execute the database-backed reliability suite (`__tests__/bharatgateway-phase2-postgres.test.ts`):

### Step 3.1: Start Docker Desktop
Launch Docker Desktop from your Start Menu, or in PowerShell:
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```
Wait approximately 30–45 seconds until `docker ps` returns successfully.

### Step 3.2: Start the Gateway PostgreSQL Container
```powershell
# Start only the isolated gateway postgres service on port 5432
docker compose -f docker-compose.gateway.yml up -d gateway-postgres
```

### Step 3.3: Verify Container Health
```powershell
docker ps --filter "name=bharatgateway-postgres"
```
The container will report `healthy` once `pg_isready` verifies the database `bharatgateway_dev`.

### Step 3.4: Run the PostgreSQL Integration Suite
```powershell
npx tsx --test __tests__/bharatgateway-phase2-postgres.test.ts
```
Expected output: 12 tests passed, confirming live SQL transactions, durable idempotency locks, atomic state transitions, balanced double-entry ledger postings, and scoped record cleanup.

---

## 4. Manual Simulated Checkout Walkthrough

### 4.1 Launch Local Servers
Open two terminal windows:

**Terminal 1 — Backend:**
```powershell
cd 18_DEVELOPMENT/Backend
npm run start:dev
```
Backend will listen on `http://localhost:4000` with global API prefix `/api/v1`.

**Terminal 2 — Frontend:**
```powershell
npm run dev
```
Frontend will listen on `http://localhost:3000`.

---

### 4.2 Test Merchant Authentication & API Endpoints

#### Check Engine Health
```bash
curl -s http://localhost:4000/api/v1/gateway/health
```
Response:
```json
{
  "status": "HEALTHY",
  "platform": "BharatGateway™ Independent Fintech Platform",
  "engineMode": "SAFE_SIMULATOR",
  "features": {
    "integerMinorUnits": true,
    "doubleEntryLedger": true,
    "hmacWebhooks": true,
    "fourWayReconciliation": true,
    "fraudDefense": true
  }
}
```

#### Create a Test Payment Order
```bash
curl -X POST http://localhost:4000/api/v1/gateway/orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_test_bharat_sim_secret_key_84918294819284" \
  -H "x-idempotency-key: idemp_manual_demo_001" \
  -d '{
    "amountMinor": 249900,
    "currency": "INR",
    "receipt": "RCPT_TEST_001",
    "customerEmail": "guest@bharatyatra.in",
    "description": "Somnath Temple Pilgrimage Tour Package"
  }'
```
Response: Returns `orderId` (e.g. `order_bg_...`) in state `CREATED`.

#### Visit Customer Checkout Page
Navigate your browser to:
`http://localhost:3000/payment-gateway/checkout/<ORDER_ID>`  
*(Or visit the pre-seeded demo order: `http://localhost:3000/payment-gateway/checkout/order_bg_demo_101`)*

#### Test Simulation Scenarios on Checkout
The checkout UI includes a scenario selector:
- **`SUCCESS`**: Payment captures immediately, ledger is credited, HMAC signature generated.
- **`INSUFFICIENT_FUNDS`**: Returns bank error, order remains uncaptured.
- **`INCORRECT_PIN`**: Rejects customer PIN entry.
- **`BANK_TIMEOUT`**: Simulates bank network timeout with recovery runbook.
- **`CARD_EXPIRED`**: Simulates expired card validation failure.
- **`FRAUD_BLOCKED`**: Triggers fraud risk engine rejection.

---

## 5. Webhook Validation Testing

To verify webhook HMAC-SHA256 signature calculation manually:

```typescript
import * as crypto from 'crypto';

const webhookSecret = 'dev_webhook_salt_secure_2026';
const timestamp = Math.floor(Date.now() / 1000).toString();
const payload = JSON.stringify({ event: 'payment.captured', orderId: 'order_123' });

const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(`${timestamp}.${payload}`)
  .digest('hex');

const header = `t=${timestamp},v1=${signature}`;
```

When sent to the webhook receiver, requests with timestamp drift exceeding 300 seconds are rejected with HTTP 400.

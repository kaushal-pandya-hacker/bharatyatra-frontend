# BHARATGATEWAY™ — SETUP & DEPLOYMENT RUNBOOK
**Version:** 1.0.0 (Production-Ready Architecture)  
**System:** Autonomous Sovereign Payment Gateway Platform  

---

## 1. Prerequisites & Environment

- **Node.js:** v20.x or higher
- **PostgreSQL:** v15 or v16
- **Redis:** v7.x
- **Docker & Docker Compose:** v2.20+

---

## 2. Environment Configuration

Copy the sample environment variables:
```bash
# Gateway Backend (.env in 18_DEVELOPMENT/Backend)
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://gateway_user:gateway_secure_password_2026@localhost:5432/bharatgateway_dev
REDIS_URL=redis://localhost:6379
GATEWAY_SIMULATOR_MODE=true
GATEWAY_SIMULATOR_SECRET=bharatgateway_safe_simulation_secret_2026
JWT_SECRET=dev_jwt_gateway_secret_minimum_32_characters_long_2026

# Next.js Frontend (.env.local in root)
NEXT_PUBLIC_GATEWAY_API_URL=http://localhost:3001
```

---

## 3. Database Initialization & Migrations

Execute the PostgreSQL migration schema located at:
`11_PAYMENTS_FINANCE/Payment_Gateway/migrations/001_bharatgateway_schema.sql`

```bash
# Using psql
psql -U gateway_user -d bharatgateway_dev -f 11_PAYMENTS_FINANCE/Payment_Gateway/migrations/001_bharatgateway_schema.sql
```

The migration sets up:
- Custom domain types and enums (`merchant_kyc_status`, `payment_order_status`, `ledger_account_type`, `ledger_direction`, `refund_status`).
- Tables for merchants, API credentials, payment orders, payment attempts, double-entry ledger accounts/entries, refunds, webhooks, fraud alerts, and audit logs.
- Strict foreign key constraints and `CHECK` constraints enforcing positive integer minor units (`amount_minor > 0`).

---

## 4. Running the Platform Locally

### Option A: Via Docker Compose
```bash
docker compose -f docker-compose.gateway.yml up --build
```
Services exposed:
- **Frontend & Checkout Simulator:** `http://localhost:3000/payment-gateway`
- **Merchant Dashboard:** `http://localhost:3000/payment-gateway/merchant`
- **Admin Control Center:** `http://localhost:3000/payment-gateway/admin`
- **Backend API & OpenAPI Swagger:** `http://localhost:3001/api/docs`

### Option B: Local Node.js Development
```bash
# 1. Run Backend
cd 18_DEVELOPMENT/Backend
npm install
npm run build
npm run start:dev

# 2. Run Frontend (in root)
npm run dev
```

---

## 5. Verification & Testing

Execute the comprehensive automated test suite:
```bash
# Run root fintech test suite
npx tsx --test __tests__/bharatgateway-fintech-engine.test.ts

# Run all 107 platform integration tests
npm test
```

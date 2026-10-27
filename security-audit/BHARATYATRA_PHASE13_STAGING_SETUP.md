# BharatYatra Phase 13 — Staging Infrastructure Setup & Environment Discovery
## Document Reference: `BHARATYATRA_PHASE13_STAGING_SETUP.md`
**Phase**: Phase 13 — Staging Infrastructure Provisioning & Verification  
**Author**: Senior DevSecOps Engineer & Database Reliability Engineer  
**Scope**: Environment Identity Discovery, Docker Daemon Audit, Connection Topologies & Operator Setup Runbook  
**Status**: **BLOCKED — DOCKER DAEMON INACTIVE & ISOLATED DATABASE UNAVAILABLE**  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Safety Compliance

In compliance with Phase 13 Absolute Safety Rules:
1. **Zero Database Writes on Unconfirmed Targets**: No SQL migrations, table creations, or DDL commands were run against the primary remote Supabase project (`uedmguvljhsvbndwkruz`).
2. **Zero Secret Printing**: No database passwords, JWT signing keys, service role credentials, or API tokens are printed in this document or committed to the repository.
3. **No Automatic Infrastructure Mutation**: No cloud resources were provisioned, and no containers or software were downloaded or launched automatically.

A complete discovery audit was performed against the local host environment, repository configuration, and container tooling.

---

## 2. Environment Discovery & Infrastructure Audit

### 2.1 Backend Database Configuration & Connection Topologies
- **ORM / Query Engine**: Prisma ORM v5 (`PrismaService` in [`src/prisma/prisma.service.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/prisma/prisma.service.ts)).
- **Connection String Key**: `DATABASE_URL`.
- **Production Hardening**: Enforces `sslmode=require`, bounded connection pooling (`connection_limit=10`), and pool timeouts (`pool_timeout=15`).
- **Development/Local Fallback**: Configured to `postgresql://postgres:***@localhost:5432/chalo_farva_db`.
- **Port 5432 Probe**: Direct socket test to `localhost:5432` resulted in `ECONNREFUSED`. No local database daemon is active.

### 2.2 Supabase Client & Migration Tooling
- **Client Library**: `@supabase/supabase-js` v2 (`lib/supabase/client.ts`).
- **Client Topologies**:
  - `getSupabaseClient()`: Public client utilizing publishable anon key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) with client-side PKCE auth flow.
  - `getSupabaseServerClient()`: Backend server-only client utilizing `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security exclusively for backend administrative tasks.
- **Migration Source**: Directory [`data/migrations/`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/).
- **Canonical Ecosystem Migration**: `20261012_travel_partner_ecosystem.sql` (485 lines).

### 2.3 Docker CLI & Daemon Status Inspection
An active host diagnostic was performed using `docker --version` and `docker info`:
- **Docker CLI**: Installed (`Docker version 29.7.2, build a7dcaa6`).
- **Docker Engine / Daemon**: **INACTIVE / NOT RUNNING**.
  ```
  failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; 
  open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
  ```
- **Finding**: Docker Desktop is installed on the operator's machine, but the Linux Engine backend is not running.
- **Enforcement**: Per safety instruction *"Do not download or launch containers, install software, or create resources without authorization"*, container launch was halted.

### 2.4 Required Environment Variable Inventory (Names Only)
Below is the definitive catalog of configuration variable names required by the BharatYatra staging stack. Zero secret values or real credentials are shown:

#### Backend Core & Security
- `NODE_ENV`
- `PORT`
- `API_PREFIX`
- `FRONTEND_URL`
- `CORS_ORIGIN`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`
- `ORIGIN_VERIFY_SECRET`

#### Provider & External Integrations
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `GEMINI_API_KEY`
- `HBX_API_KEY`
- `HBX_API_SECRET`
- `HBX_BASE_URL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

#### Frontend Client Configuration
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_MAP_TILE_URL`

---

## 3. Proposed Disposable Staging Architecture

To allow safe database migration rehearsals, tenant isolation verification, and end-to-end integration tests without touching the primary Supabase project or spending cloud budget, a disposable local staging stack is specified below.

### 3.1 Disposable Staging Manifest: `docker-compose.staging.yml`
*(Template for Operator Authorization)*:

```yaml
version: '3.8'

services:
  staging-postgres:
    image: postgres:15-alpine
    container_name: bharatyatra-staging-db
    environment:
      POSTGRES_DB: bharatyatra_staging
      POSTGRES_USER: staging_operator
      POSTGRES_PASSWORD: ephemeral_staging_password_only
    ports:
      - "5433:5432" # Uses port 5433 to avoid conflicts
    volumes:
      - staging_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U staging_operator -d bharatyatra_staging"]
      interval: 5s
      timeout: 5s
      retries: 5

  staging-redis:
    image: redis:7-alpine
    container_name: bharatyatra-staging-redis
    ports:
      - "6380:6379" # Uses port 6380 to avoid conflicts
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  staging_pg_data:
```

### 3.2 Staging Database Sanitized Identity
When launched by the operator, the staging database will have the following verified identity:
- **Project Label**: `BHARATYATRA-LOCAL-STAGING-SANDBOX`
- **Sanitized Endpoint**: `localhost:5433/bharatyatra_staging`
- **Isolation Guarantee**: Physical process isolation on local loopback; strictly decoupled from remote cloud project `uedmguvljhsvbndwkruz`.

---

## 4. Operator Setup & Provisioning Checklist

To enable live staging rehearsal in Phase 13 or Phase 14, the DevSecOps operator should execute these exact steps:

- [ ] **Step 1**: Start Docker Desktop on Windows. Wait until Docker Desktop reports "Engine running".
- [ ] **Step 2**: Create `docker-compose.staging.yml` using the manifest in Section 3.1.
- [ ] **Step 3**: Launch staging containers:
      ```bash
      docker compose -f docker-compose.staging.yml up -d
      ```
- [ ] **Step 4**: Verify database readiness:
      ```bash
      docker exec -it bharatyatra-staging-db pg_isready -U staging_operator -d bharatyatra_staging
      ```
- [ ] **Step 5**: Create staging environment file `18_DEVELOPMENT/Backend/.env.staging` pointing to `postgresql://staging_operator:ephemeral_staging_password_only@localhost:5433/bharatyatra_staging`.
- [ ] **Step 6**: Provide explicit authorization to run migration rehearsal against `localhost:5433`.

---

## 5. Workstream Status Classification

| Infrastructure Component | Status | Evidence & Enforcement |
| :--- | :---: | :--- |
| **Backend Database Config Discovery** | **VERIFIED** | Prisma ORM, `DATABASE_URL`, connection pooling verified in code. |
| **Supabase Client Topology Discovery** | **VERIFIED** | Public/Server client segregation verified in `client.ts`. |
| **Environment Variable Name Catalog** | **VERIFIED** | Cataloged without exposing secrets. |
| **Host Docker Engine Availability** | **FAILED** | Docker CLI present; Docker Linux Engine not running. |
| **Local Database Port Probe (5432)** | **FAILED** | Connection refused; no active PostgreSQL daemon. |
| **Isolated Staging Database Target** | **BLOCKED** | Staging target not running; writes halted per safety rules. |

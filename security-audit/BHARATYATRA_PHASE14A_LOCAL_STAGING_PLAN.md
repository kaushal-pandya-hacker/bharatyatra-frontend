# BharatYatra Phase 14A — Safe Local Staging Preparation Plan
## Document Reference: `BHARATYATRA_PHASE14A_LOCAL_STAGING_PLAN.md`
**Phase**: Phase 14A — Safe Local Staging Preparation  
**Author**: Senior DevSecOps Engineer & Database Reliability Engineer  
**Scope**: Isolated Local Staging Compose Specification, Route Re-Verification & Safety Gates  
**Status**: **BLOCKED — DOCKER ENGINE UNAVAILABLE**  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Verification of Prior State

### 1.1 Existence Check for `docker-compose.staging.yml`
In strict compliance with instruction 1 (*"Check whether docker-compose.staging.yml actually exists. If missing, do not pretend it was created"*):
- A filesystem search across the repository root and subdirectories confirmed that **`docker-compose.staging.yml` was NOT previously present on disk** (verified via `Test-Path docker-compose.staging.yml` -> `False`).
- The configuration has now been drafted cleanly into [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml) strictly for operator review.
- **Zero Containers Launched**: No `docker compose up`, image pulls, package installations, or cloud resource modifications were performed.

### 1.2 Docker Host Engine Status
Active host diagnosis via `docker info` produced:
```
Server:
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; 
check if the path is correct and if the daemon is running: 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```
- **Finding**: Docker Desktop client is installed (v29.7.2), but the Docker Desktop Linux Engine daemon is **INACTIVE**.
- **Impact**: Container instantiation cannot proceed until the operator starts Docker Desktop.

---

## 2. Files Inspected & Created

### 2.1 Files Inspected
1. [`18_DEVELOPMENT/Backend/src/main.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/main.ts): Verified global prefix `app.setGlobalPrefix('/api/v1')` and `rawBody` capture.
2. [`18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.controller.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.controller.ts): Verified `@Controller('webhooks')` and `@Post(':provider/:event')`.
3. [`18_DEVELOPMENT/Backend/src/payments/payments.controller.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/payments/payments.controller.ts): Verified secondary `@Controller('payments')` route.
4. [`18_DEVELOPMENT/Backend/.env`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/.env): Inspected local database fallback (`localhost:5432/chalo_farva_db`).
5. [`.env.local`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/.env.local): Inspected remote Supabase project URL (`uedmguvljhsvbndwkruz.supabase.co`).
6. [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql): Inspected canonical 485-line migration script.

### 2.2 Files Created
1. [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml): Drafted isolated local staging manifest for review.
2. [`security-audit/BHARATYATRA_PHASE14A_LOCAL_STAGING_PLAN.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/security-audit/BHARATYATRA_PHASE14A_LOCAL_STAGING_PLAN.md): This report.

---

## 3. Proposed Compose Configuration & Strict Isolation Boundaries

The drafted file [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml) enforces the following hardening and isolation controls:

```yaml
version: '3.8'

services:
  staging-postgres:
    image: postgres:15.8-alpine3.20
    container_name: bharatyatra-staging-postgres
    restart: "no"
    privileged: false
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
    environment:
      POSTGRES_DB: bharatyatra_staging_sandbox
      POSTGRES_USER: bharatyatra_staging_admin
      POSTGRES_PASSWORD: ${STAGING_DB_PASSWORD:-StagingEphemeralPass2026!}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      # Bound strictly to IPv4 loopback (127.0.0.1)
      - "127.0.0.1:5433:5432"
    volumes:
      - staging_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bharatyatra_staging_admin -d bharatyatra_staging_sandbox -h 127.0.0.1"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
    networks:
      - staging-isolated-net
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1024M

  staging-redis:
    image: redis:7.2.5-alpine3.20
    container_name: bharatyatra-staging-redis
    restart: "no"
    privileged: false
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    command: >
      redis-server 
      --save "" 
      --appendonly no 
      --requirepass ${STAGING_REDIS_PASSWORD:-StagingRedisPass2026!}
    ports:
      # Bound strictly to IPv4 loopback (127.0.0.1)
      - "127.0.0.1:6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${STAGING_REDIS_PASSWORD:-StagingRedisPass2026!}", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 5s
    networks:
      - staging-isolated-net
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

networks:
  staging-isolated-net:
    driver: bridge
    internal: false

volumes:
  staging_postgres_data:
    name: bharatyatra_staging_pgdata
```

### 3.1 Isolation Boundary Safeguards
1. **Loopback Binding (`127.0.0.1`)**: Ports are explicitly bound to `127.0.0.1:5433` and `127.0.0.1:6380`. They cannot be accessed over LAN, Wi-Fi, or public network interfaces.
2. **Dedicated Database Name**: `bharatyatra_staging_sandbox`. Disconnected from production database names (`postgres` / `chalo_farva_db`).
3. **Dedicated Credentials**: `bharatyatra_staging_admin` with transient staging password placeholder.
4. **Separate Volume**: `bharatyatra_staging_pgdata`. Completely isolated from host files and existing databases.
5. **Least-Privilege Security**: `privileged: false`, `security_opt: [no-new-privileges:true]`, all capabilities dropped except basic process requirements (`CHOWN`, `SETUID`, `SETGID`, `DAC_OVERRIDE`).
6. **Zero Host Socket Exposure**: `/var/run/docker.sock` is NOT mounted into any container.
7. **Pinned Versions**: Pinned to minimal Alpine builds (`postgres:15.8-alpine3.20`, `redis:7.2.5-alpine3.20`).
8. **Resource Limits**: CPU and memory bounded (Postgres: 1.5 CPU, 1GB RAM; Redis: 0.5 CPU, 256MB RAM) to prevent host resource starvation.

---

## 4. Required Staging Environment Variables (Names Only)

When configuring the staging backend runtime, the operator will supply the following variables via a dedicated `.env.staging` file. Zero secret values or production tokens are included:

- `NODE_ENV` (value: `test` or `staging`)
- `PORT` (value: `4001`)
- `API_PREFIX` (value: `/api/v1`)
- `DATABASE_URL` (format: `postgresql://bharatyatra_staging_admin:<PLACEHOLDER>@127.0.0.1:5433/bharatyatra_staging_sandbox?sslmode=disable`)
- `REDIS_URL` (format: `redis://:<PLACEHOLDER>@127.0.0.1:6380`)
- `JWT_SECRET` (format: `<64_HEX_RANDOM_STAGING_KEY>`)
- `ORIGIN_VERIFY_SECRET` (format: `<32_HEX_RANDOM_STAGING_TOKEN>`)
- `RAZORPAY_KEY_ID` (format: `rzp_test_<PLACEHOLDER>`)
- `RAZORPAY_KEY_SECRET` (format: `<PLACEHOLDER>`)
- `RAZORPAY_WEBHOOK_SECRET` (format: `<32_HEX_RANDOM_WEBHOOK_KEY>`)
- `FRONTEND_URL` (value: `http://127.0.0.1:3000`)
- `CORS_ORIGIN` (value: `http://127.0.0.1:3000`)

---

## 5. NestJS Effective Webhook Route Verification

### 5.1 Source Code Verification
- In [`src/main.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/main.ts#L97-L98):
  `const apiPrefix = process.env.API_PREFIX || '/api/v1';`  
  `app.setGlobalPrefix(apiPrefix);`
- In [`src/providers/webhooks/webhooks.controller.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/18_DEVELOPMENT/Backend/src/providers/webhooks/webhooks.controller.ts#L17-L22):
  `@Controller('webhooks')`  
  `@Post(':provider/:event')`
- **Effective Runtime Endpoint**:
  `POST /api/v1/webhooks/:provider/:event`
  For Razorpay webhook payloads: **`POST /api/v1/webhooks/razorpay/events`** (or specific event routes like `POST /api/v1/webhooks/razorpay/payment.captured`).

### 5.2 Runtime Confirmation Procedure (Post-Startup Probe)
Once the staging backend is started, the route will be confirmed via non-destructive probes:
1. **Probe 1 — Route Exists Test (Invalid Signature)**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X POST \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: 0000000000000000000000000000000000000000000000000000000000000000" \
     http://127.0.0.1:4001/api/v1/webhooks/razorpay/events \
     -d '{"event":"ping"}'
   ```
   - **Expected HTTP Status**: `401 Unauthorized` (Cryptographic verification failed).
   - **Verification Meaning**: Confirms the route is mounted and that the cryptographic signature verification filter is actively protecting the endpoint.
2. **Probe 2 — Invalid Path Test**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X POST \
     http://127.0.0.1:4001/webhooks/razorpay/events \
     -d '{"event":"ping"}'
   ```
   - **Expected HTTP Status**: `404 Not Found` (Proves that paths lacking `/api/v1` are rejected by routing).

---

## 6. Startup, Health-Check & Disposable Cleanup Procedures

### 6.1 Startup Procedure (Awaiting Operator Execution)
```bash
# 1. Start Docker Desktop (Ensure Engine is Running)
# 2. Launch staging services in background
docker compose -f docker-compose.staging.yml up -d
```

### 6.2 Health-Check Procedure
```bash
# Inspect container health states
docker compose -f docker-compose.staging.yml ps

# Verify PostgreSQL connection on 127.0.0.1:5433
docker exec -it bharatyatra-staging-postgres pg_isready -U bharatyatra_staging_admin -d bharatyatra_staging_sandbox -h 127.0.0.1

# Verify Redis connection on 127.0.0.1:6380
docker exec -it bharatyatra-staging-redis redis-cli -a StagingRedisPass2026! ping
```
*Expected Result*: Postgres reports `accepting connections`, Redis reports `PONG`.

### 6.3 Cleanup & Disposable Volume Purge Procedure
The operator can stop or permanently purge the staging environment using standard Compose commands:

- **Graceful Stop (Preserves Data Volume)**:
  ```bash
  docker compose -f docker-compose.staging.yml stop
  ```
- **Tear Down Containers (Preserves Data Volume)**:
  ```bash
  docker compose -f docker-compose.staging.yml down
  ```
- **PERMANENT PURGE (DELETES DISPOSABLE DATABASE VOLUME)**:
  ```bash
  docker compose -f docker-compose.staging.yml down -v
  ```
  > [!WARNING]
  > **VOLUME PURGE WARNING**: The `-v` (or `--volumes`) flag instructs Docker to **completely delete the named volume `bharatyatra_staging_pgdata`**. This permanently removes all staged tables, schema objects, and test records, ensuring a completely clean state without lingering host artifacts.

---

## 7. Risks, Limitations & Required Operator Approval

### 7.1 Risks & Mitigations
- **Port Conflicts**: Mapped to `5433` and `6380` instead of standard `5432`/`6379` to avoid any running local services.
- **Data Contamination**: Bounded to loopback (`127.0.0.1`) and separate volume; zero overlap with production Supabase.
- **Resource Exhaustion**: Bounded by Compose deploy resource limits.

### 7.2 Explicit Operator Approval Gate
Before any containers are launched:
- [ ] Review proposed [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml).
- [ ] Verify Docker Desktop is started and responsive.
- [ ] Authorize container launch and migration rehearsal.

---

## 8. Final Decision

# **BLOCKED — DOCKER ENGINE UNAVAILABLE**

*(The staging Compose configuration and isolation plan are **READY FOR OPERATOR REVIEW**, but container instantiation cannot proceed until Docker Desktop is started).*

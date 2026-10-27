# BharatYatra Phase 14C — Local Staging Service Health Checks & Diagnostic Runbook
## Document Reference: `BHARATYATRA_PHASE14C_HEALTH_CHECKS.md`
**Phase**: Phase 14C — Local Staging Startup & Health Verification  
**Author**: Senior DevSecOps Engineer & Database Reliability Engineer  
**Scope**: Container Health Verification Procedures, Network Socket Probes & Topology Auditing  
**Final Decision**: **BLOCKED — DOCKER ENGINE OR CREDENTIALS UNAVAILABLE**  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Current Health State

In compliance with Phase 14C Safety Directives:
> *"Never claim staging is operational while Docker is unavailable. Record service health and sanitized errors only. Do not delete Docker volumes or run `docker compose down -v`. Do not apply database migrations in this phase."*

### 1.1 Observed Host Health State
- **Container Health Status**: **UNAVAILABLE / NOT RUNNING**.
- **Underlying Cause**: Docker Desktop Linux Engine backend pipe is not connectible (`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`).
- **PostgreSQL Socket (127.0.0.1:5433)**: Closed (`ECONNREFUSED`).
- **Redis Socket (127.0.0.1:6380)**: Closed (`ECONNREFUSED`).
- **Safety Boundary Preserved**: Zero containers were launched in an unconfirmed environment.

---

## 2. Health Verification Runbook (Post-Startup Procedures)

Once the operator starts Docker Desktop and supplies `.env.staging`, the following health verification suite must be executed:

### 2.1 Check 1 — Container Process & Health State Inspection
```bash
docker compose -f docker-compose.staging.yml ps
```
*Expected Healthy Output*:
- `bharatyatra-staging-postgres`: Status `Up (healthy)`.
- `bharatyatra-staging-redis`: Status `Up (healthy)`.
- Published Ports:
  - `127.0.0.1:5433->5432/tcp`
  - `127.0.0.1:6380->6379/tcp`

### 2.2 Check 2 — PostgreSQL Database Acceptance Probe
Verify that PostgreSQL has finished initialization and is accepting SQL connections on IPv4 loopback:
```bash
# Internal Container Probe
docker exec -it bharatyatra-staging-postgres \
  pg_isready -U bharatyatra_staging_admin -d bharatyatra_staging_sandbox -h 127.0.0.1
```
*Expected Response*: `127.0.0.1:5432 - accepting connections`.

Verify host loopback port access via Node.js:
```bash
node -e "
  const net = require('net');
  const client = net.createConnection(5433, '127.0.0.1', () => {
    console.log('[STAGING HEALTH] PostgreSQL port 5433 is OPEN and accepting loopback connections.');
    client.end();
  });
  client.on('error', (err) => console.error('[STAGING HEALTH FAILED] Port 5433 error:', err.message));
"
```

### 2.3 Check 3 — Redis Authentication & Command Processing Probe
Verify that Redis is password-protected and accepting commands via `REDISCLI_AUTH`:
```bash
# Authenticated Ping Probe (uses REDISCLI_AUTH from container environment)
docker exec -it bharatyatra-staging-redis redis-cli ping
```
*Expected Response*: `PONG`.

Verify unauthenticated connection rejection (Anti-Bypass Guard):
```bash
docker exec -it -e REDISCLI_AUTH="" bharatyatra-staging-redis redis-cli ping
```
*Expected Response*: `(error) NOAUTH Authentication required.`.

### 2.4 Check 4 — Backend Connection Topology Validation
Verify that the NestJS backend configuration connects strictly to the local staging endpoints without referencing production:

| Configuration Variable | Required Staging Target | Verification Check |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://bharatyatra_staging_admin:<PW>@127.0.0.1:5433/bharatyatra_staging_sandbox?sslmode=disable` | Validates host is `127.0.0.1`, port is `5433`, db name is `bharatyatra_staging_sandbox`. |
| `REDIS_URL` | `redis://:<PW>@127.0.0.1:6380` | Validates host is `127.0.0.1`, port is `6380`. |
| `NEXT_PUBLIC_SUPABASE_URL` | None / Ephemeral Staging URL | **Zero queries directed to `uedmguvljhsvbndwkruz.supabase.co`**. |

---

## 3. Detailed Diagnostics & Error Logs

### 3.1 Docker Host Daemon Diagnostic
- **Execution Date**: 2026-10-22
- **Command**: `docker info`
- **Exit Code**: `1`
- **Sanitized Error Output**:
  ```
  failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; 
  check if the path is correct and if the daemon is running: 
  open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
  ```

### 3.2 Host Port Availability Diagnostic
- **Execution Date**: 2026-10-22
- **Target Ports**: `127.0.0.1:5433`, `127.0.0.1:6380`
- **Result**: Both ports are currently clear and available on the host interface. No port collisions will occur once Docker starts.

---

## 4. Status Classification Matrix

| Health Domain | Specific Check | Classification | Observed Evidence |
| :--- | :--- | :---: | :--- |
| **Docker Daemon Engine** | Host Daemon Connectivity | **FAILED** | Pipe `dockerDesktopLinuxEngine` not found; engine inactive. |
| **Compose Configuration** | Parameter Syntax & Validation | **VERIFIED** | `docker compose config --quiet` passed with 0 errors and 0 warnings. |
| **Credential Fail-Closed** | Parameter Expansion Abort | **VERIFIED** | Missing credentials halt Compose with exit code 1. |
| **PostgreSQL Loopback Binding** | Port 5433 Loopback Binding | **CODE-VERIFIED** | Explicit `127.0.0.1:5433:5432` in Compose manifest. |
| **PostgreSQL Health Probe** | `pg_isready` Execution | **BLOCKED** | Awaiting Docker engine startup. |
| **Redis CLI Auth Masking** | `REDISCLI_AUTH` Verification | **CODE-VERIFIED** | Documented in Compose manifest; password not passed on CLI. |
| **Redis Health Probe** | `redis-cli ping` Execution | **BLOCKED** | Awaiting Docker engine startup. |
| **Volume Disposable Isolation**| Named Volume Separation | **VERIFIED** | Uses dedicated `bharatyatra_staging_pgdata` volume. |
| **Zero Production Data Leak** | Absence of Production Mounts | **VERIFIED** | Verified no host directories or production `.env` mounted. |

---

## 5. Final Decision

# **BLOCKED — DOCKER ENGINE OR CREDENTIALS UNAVAILABLE**

### Operator Action Required:
1. Start Docker Desktop on Windows.
2. Create `.env.staging` with isolated passwords:
   ```bash
   STAGING_DB_PASSWORD=<Generate_Random_Password_1>
   STAGING_REDIS_PASSWORD=<Generate_Random_Password_2>
   ```
3. Run `docker compose -f docker-compose.staging.yml up -d`.
4. Run health verification commands from Section 2.

# BharatYatra Phase 14D — Local Staging Services Startup Assessment
## Document Reference: `BHARATYATRA_PHASE14D_STAGING_SERVICES.md`
**Phase**: Phase 14D — Local Staging Startup & Service Verification  
**Author**: Senior DevSecOps Engineer & Database Reliability Engineer  
**Scope**: Docker Daemon Live Check, Compose Manifest Audit, Service Topology & Execution Blocker Report  
**Final Status**: **BLOCKED — DOCKER ENGINE UNAVAILABLE**  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Safety Policy

In strict accordance with Phase 14D Directives:
> *"The Phase 14C report says Docker Desktop's Linux engine was unavailable. First run `docker info`. If it fails, stop and report the error."*  
> *"Do not invent results or claim that services are healthy without live evidence. Do not apply migrations, connect to production Supabase, run live payment tests, or delete volumes."*

A direct diagnostic invocation of `docker info` was executed. The Docker Linux Engine daemon was confirmed to be **unavailable**. In adherence to safety protocols, execution was stopped immediately. Zero containers were launched, zero images were pulled, zero database migrations were applied, and zero production endpoints were contacted.

---

## 2. Docker Engine Live Check & Error Diagnostic

### 2.1 Command Execution Evidence
- **Command**: `docker info`
- **Execution Timestamp**: 2026-10-22
- **Exit Code**: `1`
- **Client Version**: `29.7.2` (Context: `desktop-linux`)
- **Docker Compose Version**: `v5.5.0`
- **Server Error Output**:
  ```
  failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; 
  check if the path is correct and if the daemon is running: 
  open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
  ```

### 2.2 Root Cause & Operator Action Needed
- **Root Cause**: The Docker Desktop client CLI is installed on Windows, but the Docker Desktop Linux Engine background daemon is not running.
- **Required Operator Action**:
  1. Open the **Docker Desktop** application from the Windows Start menu or Taskbar.
  2. Wait for Docker Desktop to finish booting until the bottom-left status indicator turns green with "Engine running".
  3. Verify daemon connectivity by running `docker info` from a command prompt (it should return server details and container counts with exit code 0).
- **Classification**: **FAILED (Host Engine State)**.

---

## 3. Review & Static Validation of `docker-compose.staging.yml`

The Compose manifest [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml) was inspected in its current form on disk:

### 3.1 Hardening & Safety Controls Verified
1. **Zero Default Passwords / Strict Fail-Closed Interpolation**:
   - PostgreSQL Password: `POSTGRES_PASSWORD: "${STAGING_DB_PASSWORD:?Error: STAGING_DB_PASSWORD must be supplied in .env.staging}"`
   - Redis Password: `REDIS_PASSWORD: "${STAGING_REDIS_PASSWORD:?Error: STAGING_REDIS_PASSWORD must be supplied in .env.staging}"`
   - Redis CLI Auth: `REDISCLI_AUTH: "${STAGING_REDIS_PASSWORD:?Error: STAGING_REDIS_PASSWORD must be supplied in .env.staging}"`
   - **Verification**: If credentials are unset, Docker Compose immediately halts parsing with exit code 1 and outputs the missing variable names.
2. **Loopback-Only Published Ports**:
   - `staging-postgres`: `- "127.0.0.1:5433:5432"` (strictly bound to IPv4 loopback; unroutable from LAN/WAN).
   - `staging-redis`: `- "127.0.0.1:6380:6379"` (strictly bound to IPv4 loopback; unroutable from LAN/WAN).
3. **Volume & Isolation Guarantees**:
   - Uses dedicated named volume: `staging_postgres_data` (underlying volume name: `bharatyatra_staging_pgdata`).
   - Zero mounts of host project directories, zero mounts of production `.env` files.
   - Redis is configured purely in-memory (`--save "" --appendonly no`); zero disk volume mounted.
4. **Least-Privilege Security**:
   - `privileged: false` on all services.
   - `security_opt: [no-new-privileges:true]`.
   - `cap_drop: [ALL]` with minimal standard execution capabilities (`CHOWN`, `DAC_OVERRIDE`, `FOWNER`, `SETGID`, `SETUID`).
   - Zero Docker socket mounts (`/var/run/docker.sock` is absent).
5. **Pinned Minimal Alpine Images**:
   - `postgres:15.8-alpine3.20`
   - `redis:7.2.5-alpine3.20`
6. **Resource Throttling**:
   - Dual-specification compatibility: Both `mem_limit`/`cpus` and `deploy.resources.limits` are configured.

---

## 4. Staging Credentials & Environment Isolation Status

- **`.env.staging` File Existence**: Checked via `Test-Path .env.staging` -> `False`.
- **Git Exclusion Status**: Confirmed line 30 of root `.gitignore` (`.env.*`) excludes all `.env.staging` files.
- **Production Isolation**: Zero production environment files (`.env`, `.env.production`), zero production Supabase URLs, and zero production database volumes are referenced.
- **Operator Credential Provisioning**: Once Docker Desktop is running, the operator must populate `.env.staging` with isolated random passwords:
  ```bash
  STAGING_DB_PASSWORD=<Generate_Random_Password_1>
  STAGING_REDIS_PASSWORD=<Generate_Random_Password_2>
  ```

---

## 5. Specification of Services Ready for Operator Authorization

The table below lists the exact specifications ready for execution upon operator approval and Docker startup:

| Service Identifier | Pinned Image | Container Name | Published Port (Loopback) | Dedicated Volume | Memory Limit | CPU Limit | Security Hardening |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **`staging-postgres`** | `postgres:15.8-alpine3.20` | `bharatyatra-staging-postgres` | `127.0.0.1:5433:5432` | `bharatyatra_staging_pgdata` | 1024 MB | 1.5 CPUs | `no-new-privileges`, `cap_drop: ALL` |
| **`staging-redis`** | `redis:7.2.5-alpine3.20` | `bharatyatra-staging-redis` | `127.0.0.1:6380:6379` | None (Ephemeral In-Memory) | 256 MB | 0.5 CPUs | `no-new-privileges`, `cap_drop: ALL`, `REDISCLI_AUTH` |

---

## 6. Service Startup & Health Probes (Status: BLOCKED)

In adherence to Step 4 (*"Do not start containers until explicitly authorized"*):
- **Container Startup**: **NOT EXECUTED (BLOCKED)**.
- **PostgreSQL Health Probe (`pg_isready`)**: **BLOCKED (Engine Down)**.
- **Redis Health Probe (`redis-cli ping`)**: **BLOCKED (Engine Down)**.
- **Database Migrations**: **NOT APPLIED**.
- **Live Payments / Production Supabase**: **NOT CONNECTED**.
- **Volumes**: **ZERO VOLUMES CREATED OR DELETED**.

---

## 7. Status Classification Matrix

| Audit Check / Prerequisite | Classification | Observed Status & Source |
| :--- | :---: | :--- |
| **Docker Daemon Connectivity (`docker info`)** | **FAILED** | Pipe `dockerDesktopLinuxEngine` not found; engine inactive. |
| **Docker Compose Tooling (`compose version`)** | **VERIFIED** | Compose v5.5.0 installed and responsive. |
| **Compose Syntax & Parameter Validation** | **VERIFIED** | Passed `docker compose config --quiet` (0 errors, 0 warnings). |
| **Credential Fail-Closed Parameter Guard** | **VERIFIED** | Missing credentials halt Compose with exit code 1. |
| **Loopback Network Isolation (`127.0.0.1`)** | **VERIFIED** | Ports bound strictly to `127.0.0.1:5433` and `127.0.0.1:6380`. |
| **Volume Disposable Isolation** | **VERIFIED** | Dedicated named volume `bharatyatra_staging_pgdata` only. |
| **Absence of Production References** | **VERIFIED** | Zero mounts of production `.env` or host directories. |
| **Least-Privilege Security** | **VERIFIED** | Capabilities dropped (`cap_drop: ALL`), no Docker socket mounts. |
| **Staging Credentials (`.env.staging`)** | **BLOCKED** | Staging credentials file not yet created on disk. |
| **Service Startup & Live Health Checks** | **BLOCKED** | Halted due to inactive Docker engine and awaiting operator approval. |

---

## 8. Final Decision

# **BLOCKED — DOCKER ENGINE UNAVAILABLE**

### Actionable Operator Steps to Proceed:
1. **Start Docker Desktop**: Launch Docker Desktop on Windows. Wait until the indicator reports "Engine running".
2. **Create `.env.staging`**: Add the two staging passwords to `.env.staging`:
   ```bash
   STAGING_DB_PASSWORD=<Generate_Random_Password_1>
   STAGING_REDIS_PASSWORD=<Generate_Random_Password_2>
   ```
3. **Authorize Container Launch**: Explicitly authorize running `docker compose -f docker-compose.staging.yml up -d`.

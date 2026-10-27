# BharatYatra Phase 19 — Local Staging Startup & Health Verification Report
## Document Reference: `BHARATYATRA_PHASE19_STAGING_STARTUP.md`
**Phase**: Phase 19 — Local Staging Startup & Health Verification  
**Author**: Senior DevSecOps Engineer & Release Manager  
**Scope**: Container Activation, Loopback Binding Verification & Live Health Inspections  
**Execution Timestamp**: 2026-10-22  
**Final Phase Status**: **`PASS — BOTH LOCAL STAGING SERVICES HEALTHY`**  

---

## 1. Executive Summary & Authorization Baseline

* **Authorization**: Explicit operator approval received for launching strictly the two isolated local staging services (`bharatyatra-staging-postgres` and `bharatyatra-staging-redis`).
* **Isolation Standard**: Zero application backend, frontend, or cloud services were started.
* **Zero Secret Disclosure**: Passwords, tokens, and connection strings are strictly omitted from command arguments, output logs, and this report.
* **Zero Migration Execution**: No SQL migrations, DDL scripts, or bootstrap routines were executed in this phase.
* **Zero Production Mutation**: Cloud Supabase, live Razorpay, Cloudflare, production DNS, and firewalls were not contacted.

---

## 2. Preflight Verification Results

Prior to issuing container startup commands, all mandatory preflight checks were executed and verified:

| Check # | Preflight Verification Item | Command / Probe Executed | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **P-01** | Working Directory | `(Get-Location).Path` | `C:\Users\Pandya Kaushal\Desktop\BhartYatra_3` | **PASS** |
| **P-02** | Staging Credentials Supply | `Test-Path .env.staging` | `True` (File present, 176 bytes) | **PASS** |
| **P-03** | Git Ignore & Untracked Audit | `git ls-files .env.staging` & `git check-ignore` | `Tracked: False`, `Ignored: True` (`.gitignore:30:.env.*`) | **PASS** |
| **P-04** | Docker Engine Availability | `docker info --format '{{.ServerVersion}}'` | `29.7.2` (WSL 2 Linux engine active) | **PASS** |
| **P-05** | Service Scope Restriction | `docker compose ... config --services` | Strictly `staging-postgres` and `staging-redis` | **PASS** |
| **P-06** | Published Port Mapping Audit | Manifest inspection | `127.0.0.1:5433:5432` and `127.0.0.1:6380:6379` | **PASS** |
| **P-07** | Existing Container Conflict | `docker ps -a --filter "name=bharatyatra-staging"` | Zero existing containers found | **PASS** |
| **P-08** | Compose Syntax Validation | `docker compose --env-file .env.staging -f ... config -q` | **Exit Code: `0`** (Clean, valid syntax) | **PASS** |

---

## 3. Container Startup Execution

Upon successful validation of all preflight checks, the approved services were launched without recreation or volume reset flags:

* **Command Executed**:
  ```powershell
  docker compose --env-file .env.staging -f docker-compose.staging.yml up -d staging-postgres staging-redis
  ```
* **Execution Exit Code**: `0`
* **Artifacts Created**:
  * Pinned Image Pulled: `postgres:15.8-alpine3.20`
  * Pinned Image Pulled: `redis:7.2.5-alpine3.20`
  * Isolated Bridge Network Created: `bhartyatra_3_staging-isolated-net`
  * Disposable Named Volume Created: `bharatyatra_staging_pgdata`
  * Container Created & Started: `bharatyatra-staging-postgres`
  * Container Created & Started: `bharatyatra-staging-redis`

---

## 4. Live Health Check & Readiness Verification

### 4.1 Container Process & Health Status
* **Command Executed**:
  ```powershell
  docker compose --env-file .env.staging -f docker-compose.staging.yml ps
  ```
* **Live Output**:
  ```text
  NAME                           IMAGE                      COMMAND                  SERVICE            CREATED          STATUS                   PORTS
  bharatyatra-staging-postgres   postgres:15.8-alpine3.20   "docker-entrypoint.s…"   staging-postgres   15 seconds ago   Up 14 seconds (healthy)   127.0.0.1:5433->5432/tcp
  bharatyatra-staging-redis      redis:7.2.5-alpine3.20     "docker-entrypoint.s…"   staging-redis      15 seconds ago   Up 14 seconds (healthy)   127.0.0.1:6380->6379/tcp
  ```

### 4.2 In-Container Health Inspection (PostgreSQL)
* **Command Executed**:
  ```powershell
  docker exec bharatyatra-staging-postgres pg_isready -U bharatyatra_staging_admin -d bharatyatra_staging_sandbox -h 127.0.0.1
  ```
* **Exit Code**: `0`
* **Output**: `127.0.0.1:5432 - accepting connections`
* **Detailed State**: `Status: running`, `Health: healthy`, `FailingStreak: 0`

### 4.3 In-Container Health Inspection (Redis)
* **Command Executed**:
  ```powershell
  docker exec bharatyatra-staging-redis redis-cli ping
  ```
  *(Authenticated securely via container environment variable `REDISCLI_AUTH`; zero passwords in command arguments).*
* **Exit Code**: `0`
* **Output**: `PONG`
* **Detailed State**: `Status: running`, `Health: healthy`, `FailingStreak: 0`

### 4.4 Host Loopback Network Binding Verification
* **Command Executed**:
  ```powershell
  Get-NetTCPConnection -LocalPort 5433, 6380 | Select-Object LocalAddress, LocalPort, State
  ```
* **Host Port Bindings**:
  ```text
  LocalAddress LocalPort  State
  ------------ ---------  -----
  127.0.0.1         6380 Listen
  127.0.0.1         5433 Listen
  ```
* **Active TCP Socket Verification**:
  * `Test-NetConnection -ComputerName 127.0.0.1 -Port 5433` $\rightarrow$ **`TcpTestSucceeded: True`**
  * `Test-NetConnection -ComputerName 127.0.0.1 -Port 6380` $\rightarrow$ **`TcpTestSucceeded: True`**

**Network Security Guarantee**: Both services listen strictly on IPv4 loopback (`127.0.0.1`). Neither service is bound to `0.0.0.0` or exposed to the external network or LAN.

---

## 5. Strict Boundaries & Operational Prohibitions Compliance

* [x] **Zero SQL Migrations**: Database schema is empty; migration `20261012_travel_partner_ecosystem.sql` was **not** applied.
* [x] **Zero Production Database Connection**: Primary Supabase project was not contacted or queried.
* [x] **Zero Live Payment / Cloud Configuration**: Razorpay Live Dashboard, Cloudflare AOP, production DNS, and hosting firewalls remain untouched.
* [x] **Application Services Offline**: Backend NestJS engine and Next.js frontend were **not** started.
* [x] **Credentials Protected**: No secret values or passwords exist in command logs or this document.
* [x] **Data Integrity Preserved**: Zero volumes or existing project files were deleted or reset.

---

## 6. Staging Infrastructure Status Matrix

```
+---------------------------------------------------------------------------------------------------------+
| SERVICE / COMPONENT         | STATUS    | BINDING ADDRESS     | INTERNAL ENGINE STATUS | FAILING STREAK |
+---------------------------------------------------------------------------------------------------------+
| PostgreSQL 15.8 (Alpine)    | HEALTHY   | 127.0.0.1:5433:5432 | Accepting connections  | 0              |
| Redis 7.2.5 (Alpine)        | HEALTHY   | 127.0.0.1:6380:6379 | Responding (PONG)      | 0              |
| Docker Bridge Network       | ACTIVE    | staging-isolated-net| Isolated bridge        | N/A            |
| Persistent Named Volume     | MOUNTED   | staging_postgres_data (bharatyatra_staging_pgdata)            |
+---------------------------------------------------------------------------------------------------------+
```

---

## 7. Final Phase Status

# **`PASS — BOTH LOCAL STAGING SERVICES HEALTHY`**

### Status Justification:
Both approved local staging containers (`bharatyatra-staging-postgres` and `bharatyatra-staging-redis`) have been successfully started and verified. Both containers report status `Up (healthy)` with zero failing streaks. In-container probes (`pg_isready` and authenticated `redis-cli ping`) confirmed functional readiness. Host TCP connections succeeded on the strict loopback ports `127.0.0.1:5433` and `127.0.0.1:6380`. Zero migrations have been executed, and no production infrastructure was touched.

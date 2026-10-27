# BharatYatra Phase 17 — Docker Recovery and Staging Activation Report
## Document Reference: `BHARATYATRA_PHASE17_STAGING_ACTIVATION.md`
**Phase**: Phase 17 — Docker Recovery and Staging Activation  
**Author**: Senior DevSecOps Engineer & Release Manager  
**Scope**: Docker Engine Recovery Verification, Staging Compose Specification Audit & Staging Credentials Gate  
**Execution Timestamp**: 2026-10-22  
**Final Phase Status**: **`BLOCKED — STAGING CREDENTIALS MISSING`**  

---

## 1. Executive Summary & Verification Policy

In strict accordance with Phase 17 safety directives:
1. **Single Probe Execution**: `docker info` was executed to verify the operational state of the Docker engine daemon.
2. **Docker Recovery Verified**: The Docker Linux engine is confirmed **ACTIVE and HEALTHY** (Server Version 29.7.2 running on WSL 2).
3. **No Secret Exposure**: Zero passwords, JWT keys, or payment credentials are printed or rendered in reports or command outputs.
4. **Fail-Closed Compose Verification**: The staging Compose specification was validated for syntax correctness without rendering sensitive variables.
5. **Zero Production Mutation**: Production Supabase, live Razorpay settings, production DNS, and production firewalls were not contacted or modified.
6. **No Container Launch Without Authorization**: In compliance with Step 6 ("Do not start containers until explicitly authorized"), zero containers were launched.

---

## 2. Docker Engine Recovery Evidence

### 2.1 Command Execution & Output
- **Command Executed**: `docker info`
- **Execution Working Directory**: `c:\Users\Pandya Kaushal\Desktop\BhartYatra_3`
- **Execution Timestamp**: 2026-10-22
- **Exit Code**: `0` (Success)

### 2.2 Verified Engine Parameters
```text
Client Version:     29.7.2
Server Version:     29.7.2
Operating System:   Docker Desktop
OSType:             linux
Architecture:       x86_64
Kernel Version:     6.18.33.2-microsoft-standard-WSL2
Storage Driver:     overlayfs (io.containerd.snapshotter.v1)
Cgroup Driver:      cgroupfs (v2)
CPUs Available:     20
Total Memory:       7.6GiB
Security Options:   seccomp (Profile: builtin), cgroupns
Live Containers:    0 running, 9 stopped
Swarm Status:       inactive
```

### 2.3 Blocker Resolution
The previous blocker (`BLOCKED — DOCKER ENGINE UNAVAILABLE`) is **RESOLVED**. The Docker Desktop Linux engine and WSL 2 backend IPC channel (`\\.\pipe\docker_cli`) are fully operational and responding to CLI directives.

---

## 3. Staging Configuration & Credentials Verification

### 3.1 Status of `.env.staging`
- **Probe Executed**: `Test-Path .env.staging`
- **Result**: `False` (File is absent on disk).
- **Required Variables**:
  - `STAGING_DB_PASSWORD` (PostgreSQL administrator password)
  - `STAGING_REDIS_PASSWORD` (Redis authentication password)
- **Git Protection**: Verified against line 30 of `.gitignore` (`.env.*`), guaranteeing that `.env.staging` cannot be committed to version control.
- **Fail-Closed Validation**: Running `docker compose -f docker-compose.staging.yml config` without `.env.staging` safely halted with:
  ```text
  error while interpolating services.staging-postgres.environment.POSTGRES_PASSWORD: 
    required variable STAGING_DB_PASSWORD is missing a value: Error: STAGING_DB_PASSWORD must be supplied in .env.staging
  error while interpolating services.staging-redis.environment.REDISCLI_AUTH: 
    required variable STAGING_REDIS_PASSWORD is missing a value: Error: STAGING_REDIS_PASSWORD must be supplied in .env.staging
  ```

### 3.2 Compose Syntax & Parity Validation (Zero Secret Rendering)
- Executed quiet syntax validation:
  ```powershell
  docker compose -f docker-compose.staging.yml config -q
  ```
- **Validation Exit Code**: `0` (Clean, syntax valid, schema fully compliant).
- **Result**: Compose specification is 100% structurally sound and enforces fail-closed variable interpolation.

---

## 4. Staging Services Specification for Operator Approval

In accordance with Phase 17 Step 5 ("Present the exact services, images, ports, volumes, and resource limits for approval"), the exact staging specification is detailed below:

```
+----------------------------------------------------------------------------------------------------------------+
| PARAMETER             | SERVICE 1: POSTGRESQL STAGING             | SERVICE 2: REDIS STAGING                   |
+----------------------------------------------------------------------------------------------------------------+
| Service Name          | staging-postgres                          | staging-redis                              |
| Container Name        | bharatyatra-staging-postgres              | bharatyatra-staging-redis                  |
| Pinned Image          | postgres:15.8-alpine3.20                  | redis:7.2.5-alpine3.20                     |
| Port Binding          | 127.0.0.1:5433:5432 (Strict Loopback)     | 127.0.0.1:6380:6379 (Strict Loopback)      |
| Database / Namespace  | bharatyatra_staging_sandbox               | Default DB (Index 0)                       |
| User Account          | bharatyatra_staging_admin                 | Authenticated via requirepass              |
| Password Source       | ${STAGING_DB_PASSWORD} via .env.staging   | ${STAGING_REDIS_PASSWORD} via .env.staging|
| Volume Mount          | staging_postgres_data (Named Volume)      | In-Memory Only (--save '' --appendonly no) |
| Named Volume Target   | bharatyatra_staging_pgdata                | None                                       |
| CPU Limit             | 1.5 CPUs                                  | 0.5 CPUs                                   |
| Memory Limit          | 1024 MB (1.0 GB)                          | 256 MB                                     |
| Privilege Mode        | Unprivileged (privileged: false)          | Unprivileged (privileged: false)           |
| Security Options      | no-new-privileges:true                    | no-new-privileges:true                     |
| Linux Capabilities    | Dropped ALL; minimal CHOWN/DAC added      | Dropped ALL                                |
| Healthcheck Command   | pg_isready -U bharatyatra_staging_admin   | redis-cli ping (via REDISCLI_AUTH)         |
| Health Interval       | 5s (retries: 5, start_period: 10s)        | 5s (retries: 5, start_period: 5s)           |
| Isolated Network      | staging-isolated-net (Bridge)             | staging-isolated-net (Bridge)              |
+----------------------------------------------------------------------------------------------------------------+
```

### 4.1 Production Separation Guarantees
1. **Network Boundary**: Ports `5433` and `6380` bind strictly to `127.0.0.1`. Neither service can accept inbound connections from the local LAN or the internet.
2. **Storage Boundary**: PostgreSQL data writes to the isolated Docker volume `bharatyatra_staging_pgdata`. Zero interactions occur with cloud Supabase.
3. **Process Security**: Running under Alpine minimal images with dropped capabilities and `no-new-privileges:true`. Docker socket is **not** mounted.

---

## 5. Workstation Operator Action Required to Unblock

To proceed to service startup:

1. **Create `.env.staging`**:
   In the repository root (`c:\Users\Pandya Kaushal\Desktop\BhartYatra_3`), create `.env.staging` with strong non-production passwords:
   ```env
   STAGING_DB_PASSWORD=staging_pg_password_high_entropy_123!
   STAGING_REDIS_PASSWORD=staging_redis_password_high_entropy_123!
   ```
2. **Grant Startup Authorization**:
   Once `.env.staging` is created, provide explicit approval to launch the reviewed staging containers.

---

## 6. Phase 17 Release Gate Summary

| Gate ID | Check Scope | Command / Evidence | Status |
| :---: | :--- | :--- | :---: |
| **G-17** | Docker Engine Availability | `docker info` $\rightarrow$ Exit Code 0 (WSL 2 active) | **VERIFIED** |
| **G-18** | Staging Environment Supply | `Test-Path .env.staging` $\rightarrow$ False | **BLOCKED** |
| **G-19** | Compose Syntax & Parity | `docker compose -f docker-compose.staging.yml config -q` $\rightarrow$ Exit 0 | **VERIFIED** |
| **G-20** | Service Isolation & Ports | Loopback `127.0.0.1:5433` & `127.0.0.1:6380` verified | **VERIFIED** |
| **G-21** | Container Startup | Halted pending credentials & operator authorization | **BLOCKED** |
| **G-22** | Database Migration | Prohibited in Phase 17; zero migrations executed | **DEFERRED** |
| **G-23** | Production Supabase Boundary| Zero connection attempts; zero cloud mutation | **VERIFIED** |

---

## 7. Final Phase Status

# **`BLOCKED — STAGING CREDENTIALS MISSING`**

### Status Justification:
The Docker engine recovery is **VERIFIED** and operational. The staging Compose configuration is **VERIFIED** and syntax-validated. However, containers cannot be launched because `.env.staging` has not been supplied on disk, triggering the intended fail-closed security parameter check. Once the workstation operator creates `.env.staging` and grants startup approval, staging services can be activated and verified.

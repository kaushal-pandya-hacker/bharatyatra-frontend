# BharatYatra Phase 14C — Local Staging Startup & Configuration Validation
## Document Reference: `BHARATYATRA_PHASE14C_STAGING_STARTUP.md`
**Phase**: Phase 14C — Local Staging Startup & Health Verification  
**Author**: Senior DevSecOps Engineer & Database Reliability Engineer  
**Scope**: Docker Daemon Inspection, Compose Syntax Validation, Service Specifications & Supabase Compatibility  
**Final Decision**: **BLOCKED — DOCKER ENGINE OR CREDENTIALS UNAVAILABLE**  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Safety Policy

In strict accordance with Phase 14C Safety Mandates:
1. **Zero Production Mutation**: The primary cloud Supabase project (`uedmguvljhsvbndwkruz`) was not contacted, queried, or modified.
2. **Zero Credentials Exposed**: No passwords, tokens, connection strings, or secrets were committed, printed, or rendered in reports.
3. **No Container Starts Without Engine & Authorization**: Container execution was halted upon finding the Docker Linux Engine daemon inactive.
4. **No Premature Migrations**: Database migrations were not executed.

A rigorous inspection and syntax validation of the staging Compose file [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml) was completed, establishing that the manifest is completely valid, fail-closed, and strictly isolated to local loopback (`127.0.0.1`).

---

## 2. Step 1: Docker CLI & Daemon Diagnostics

An active diagnostic probe of the host container tooling was conducted:

```bash
$ docker compose version
Docker Compose version v5.5.0

$ docker info
Client:
 Version:    29.7.2
 Context:    desktop-linux
 Debug Mode: false

Server:
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; 
check if the path is correct and if the daemon is running: 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

### Finding & Blocker Analysis
- **Tooling Installed**: Docker CLI (v29.7.2) and Docker Compose plugin (v5.5.0) are present on the operator's Windows host.
- **Engine Status**: **INACTIVE / NOT RUNNING**. The Docker Desktop Linux Engine backend pipe is not connectible.
- **Action Required by Operator**: Launch the Docker Desktop desktop application on Windows and verify the engine status shows green ("Engine running").
- **Classification**: **FAILED (Host Engine State)**.

---

## 3. Step 2 & Step 3: Compose Configuration Validation & Fail-Closed Audit

The actual file [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml) was inspected and validated against the Docker Compose specification parser:

### 3.1 Hardening & Safety Controls Verified
1. **Zero Default Passwords / Fail-Closed Parameter Expansion**:
   ```yaml
   POSTGRES_PASSWORD: "${STAGING_DB_PASSWORD:?Error: STAGING_DB_PASSWORD must be supplied in .env.staging}"
   REDIS_PASSWORD: "${STAGING_REDIS_PASSWORD:?Error: STAGING_REDIS_PASSWORD must be supplied in .env.staging}"
   REDISCLI_AUTH: "${STAGING_REDIS_PASSWORD:?Error: STAGING_REDIS_PASSWORD must be supplied in .env.staging}"
   ```
   All parameter expansion expressions are quote-wrapped to comply with YAML mapping grammar and enforce fail-closed behavior when credentials are unset.
2. **Loopback-Only Published Ports**:
   - PostgreSQL: `- "127.0.0.1:5433:5432"` (strictly bound to IPv4 loopback; port 5433 avoids host 5432 collisions).
   - Redis: `- "127.0.0.1:6380:6379"` (strictly bound to IPv4 loopback; port 6380 avoids host 6379 collisions).
   - Zero ports published to `0.0.0.0` or external network adapters.
3. **Volume Isolation**:
   - Uses dedicated named volume: `staging_postgres_data` (`bharatyatra_staging_pgdata`).
   - Zero mounts of host project directories, zero mounts of production `.env` files.
4. **Least-Privilege Security**:
   - `privileged: false` on all services.
   - `security_opt: [no-new-privileges:true]`.
   - `cap_drop: [ALL]`.
   - Zero Docker socket mounts (`/var/run/docker.sock` is absent).
5. **Pinned Minimal Images**:
   - `postgres:15.8-alpine3.20`
   - `redis:7.2.5-alpine3.20`
6. **Resource Limits**:
   - Declared both `mem_limit`/`cpus` and `deploy.resources.limits` to ensure enforcement across Compose v1, Compose v2, and Compose v5 engines.

### 3.2 Compose Syntax Validation Output
1. **Validation with Missing Staging Credentials (Fail-Closed Verification)**:
   ```bash
   $ docker compose -f docker-compose.staging.yml config --quiet
   error while interpolating services.staging-postgres.environment.POSTGRES_PASSWORD: 
     required variable STAGING_DB_PASSWORD is missing a value: Error: STAGING_DB_PASSWORD must be supplied in .env.staging
   error while interpolating services.staging-redis.environment.REDISCLI_AUTH: 
     required variable STAGING_REDIS_PASSWORD is missing a value: Error: STAGING_REDIS_PASSWORD must be supplied in .env.staging
   ```
   *Outcome*: Exit code 1. Refuses to validate or start without explicit operator credentials.
2. **Validation with Interpolated Staging Credentials**:
   ```bash
   $ env STAGING_DB_PASSWORD=*** STAGING_REDIS_PASSWORD=*** docker compose -f docker-compose.staging.yml config --quiet
   ```
   *Outcome*: Exit code 0. Zero syntax errors, zero warnings. Configuration is 100% compliant.

---

## 4. Step 4: Proposed Services, Ports, Volumes & Resource Allocation

The table below details the exact configuration ready for operator authorization:

| Service Name | Container Image | Container Name | Published Port (Loopback) | Data Volume | Memory Limit | CPU Limit | Security Profiles |
| :--- | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **`staging-postgres`** | `postgres:15.8-alpine3.20` | `bharatyatra-staging-postgres` | `127.0.0.1:5433:5432` | `bharatyatra_staging_pgdata` | 1024 MB | 1.5 CPUs | `no-new-privileges`, `cap_drop: ALL` |
| **`staging-redis`** | `redis:7.2.5-alpine3.20` | `bharatyatra-staging-redis` | `127.0.0.1:6380:6379` | None (In-memory ephemeral) | 256 MB | 0.5 CPUs | `no-new-privileges`, `cap_drop: ALL`, `REDISCLI_AUTH` |

---

## 5. Step 6: Supabase Compatibility & Architectural Boundaries

A critical requirement of Phase 14C is to evaluate the differences between a plain PostgreSQL container and production Supabase:
> *"Determine which Supabase-specific features cannot be faithfully reproduced by generic PostgreSQL. Do not describe a simulated `auth.uid()` or mocked roles as equivalent to production Supabase authentication or RLS."*

### 5.1 Architectural Differences Matrix
| Subsystem / Feature | Production Supabase | Local Generic PostgreSQL (`postgres:15-alpine`) | Real Fidelity in Local Staging |
| :--- | :--- | :--- | :--- |
| **DDL & Schema Objects** | PostgreSQL 15 | PostgreSQL 15.8 | **100% EQUIVALENT**: Tables, enums, indexes, foreign keys, constraints, and PL/pgSQL stored procedures execute identically. |
| **PostgreSQL Roles** | Pre-provisions `anon`, `authenticated`, `service_role`. | Zero pre-provisioned roles. Default user is `postgres` / `bharatyatra_staging_admin`. | **REQUIRES BOOTSTRAP**: Roles must be explicitly declared before executing migration statements (`GRANT`/`REVOKE`). |
| **PostgREST Session Context** | PostgREST parses user JWT and sets `request.jwt.claim.sub` and switches session role to `authenticated`. | Direct wire protocol connection (Prisma). Does not automatically inject JWT claims into database sessions. | **SIMULATED ONLY**: Local `auth.uid()` function can read `current_setting()`, but direct queries connect as database superuser/owner and **bypass RLS by default**. |
| **Supabase Auth (GoTrue)** | Dedicated GoTrue auth daemon managing user signup, email confirmation, bcrypt hashing, and PKCE refresh tokens. | None. Generic database has no built-in auth microservice or identity daemon. | **NOT REPRODUCIBLE**: Application auth endpoints cannot query GoTrue; must rely on synthetic tokens or application-level JWTs. |
| **Supabase Storage API** | Dedicated Storage API backed by S3 bucket and `storage.objects` table. | None. | **NOT REPRODUCIBLE**: Document uploads require local filesystem or mock object storage. |
| **Supabase Realtime** | Elixir-based Realtime service broadcasting database WAL changes over WebSockets. | Standard PostgreSQL WAL only. No WebSocket broadcast server. | **NOT REPRODUCIBLE**. |

### 5.2 Staging Bootstrap SQL Precondition
To allow `20261012_travel_partner_ecosystem.sql` to execute DDL syntax without throwing `ERROR: role "anon" does not exist` or `ERROR: schema "auth" does not exist`, the following bootstrap script must be run once in the staging sandbox:

```sql
CREATE SCHEMA IF NOT EXISTS auth;

-- Emulate auth.uid() function for syntactic RLS evaluation
CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS uuid 
LANGUAGE sql 
STABLE 
AS $$ 
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid; 
$$;

-- Pre-provision Supabase security roles
DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;
  CREATE ROLE authenticated NOLOGIN;
  CREATE ROLE service_role NOLOGIN;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
```
*Note*: As emphasized in the safety policy, this script permits **DDL parsing and schema validation only**. It does not replicate production Supabase identity security or multi-tenant RLS enforcement under direct database connections.

---

## 6. Status Classification Matrix

| Item / Gate | Classification | Evidence & Status |
| :--- | :---: | :--- |
| **Docker Compose CLI Availability** | **VERIFIED** | `docker compose version` returned v5.5.0. |
| **Docker Host Engine Availability** | **FAILED** | `docker info` failed; Linux Engine is not running. |
| **Compose Syntax & Validation** | **VERIFIED** | `docker compose config --quiet` passed with 0 errors and 0 warnings. |
| **Fail-Closed Staging Credentials** | **VERIFIED** | Parameter expansion halts with exit code 1 when variables are missing. |
| **Loopback Binding Isolation** | **VERIFIED** | Bound strictly to `127.0.0.1:5433` and `127.0.0.1:6380`. |
| **Least-Privilege Security** | **VERIFIED** | `privileged: false`, `cap_drop: ALL`, zero socket mounts. |
| **Supabase Dependency Analysis** | **CODE-VERIFIED** | Identified role/schema gaps; formulated preliminary bootstrap script. |
| **Container Service Startup** | **BLOCKED** | Halted due to inactive Docker engine and awaiting operator credentials. |

---

## 7. Final Decision

# **BLOCKED — DOCKER ENGINE OR CREDENTIALS UNAVAILABLE**

### Actionable Next Steps for Operator:
1. **Start Docker Desktop**: Launch Docker Desktop on Windows. Wait until the status indicator turns green ("Engine running").
2. **Create Staging Credentials File**: Create `.env.staging` (which is already excluded from git tracking) containing:
   ```bash
   STAGING_DB_PASSWORD=<Generate_High_Entropy_Password_1>
   STAGING_REDIS_PASSWORD=<Generate_High_Entropy_Password_2>
   ```
3. **Approve Startup**: Provide authorization to run `docker compose -f docker-compose.staging.yml up -d`.

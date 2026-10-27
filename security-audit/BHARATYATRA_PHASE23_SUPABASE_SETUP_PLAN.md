# BharatYatra Phase 23 — Local Supabase Setup & Migration Preparation Plan
## Document Reference: `BHARATYATRA_PHASE23_SUPABASE_SETUP_PLAN.md`
**Phase**: Phase 23 — Local Supabase Setup and Migration Preparation  
**Author**: Senior DevSecOps Engineer & Release Manager  
**Scope**: Supabase Project Initialization, Port Binding Audit, Migration Preparation & Execution Runbook  
**Execution Timestamp**: 2026-10-22  
**Final Phase Status**: **`READY FOR OPERATOR APPROVAL`**  

---

## 1. Executive Summary & Safety Preflight

* **Objective**: Prepare an isolated, local-only Supabase stack to validate [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql) without altering existing staging services or contacting production.
* **Preservation Status**:
  * `bharatyatra-staging-postgres` (Port `5433`): **Running and Healthy**
  * `bharatyatra-staging-redis` (Port `6380`): **Running and Healthy**
  * Volume `bharatyatra_staging_pgdata`: **Untouched**
  * Baseline backups under `security-audit/local-staging-evidence/`: **Preserved**
* **Zero Production Access**: Zero connection attempts were made to cloud Supabase (`uedmguvljhsvbndwkruz`), live Razorpay, or production DNS.
* **Zero Premature Container Startup**: In strict accordance with Phase 23 directives, zero containers were launched and zero migrations were executed.

---

## 2. Environment Revalidation & Toolchain Status

### 2.1 Docker Daemon & Staging Container Status
* **Docker Engine**: `29.7.2 (linux/x86_64)` on WSL 2 kernel `6.18.33.2`.
* **Staging Containers**:
  ```text
  bharatyatra-staging-postgres   postgres:15.8-alpine3.20   Up (healthy)   127.0.0.1:5433->5432/tcp
  bharatyatra-staging-redis      redis:7.2.5-alpine3.20     Up (healthy)   127.0.0.1:6380->6379/tcp
  ```

### 2.2 Supabase CLI Toolchain
* **Version**: `supabase@2.121.0` (via `npx`).
* **Subcommands Inspected**:
  * `init`: Initialized local configuration non-destructively.
  * `start`: Supports `--exclude, -x` flag for: `gotrue`, `realtime`, `storage-api`, `imgproxy`, `kong`, `mailpit`, `postgrest`, `postgres-meta`, `studio`, `edge-runtime`, `logflare`, `vector`, `supavisor`.
  * `status`: Outputs endpoint URLs and synthetic test keys.
  * `db reset`: Resets database and reapplies migrations in alphabetical timestamp order.

---

## 3. Configuration Initialization & Audit (`supabase/config.toml`)

Prior to initialization, `Test-Path supabase` confirmed `False`. `npx supabase init` was executed cleanly without overwriting any existing workspace files:

### 3.1 Generated Files Inventory
```
supabase/
├── .gitignore          (Ignores .temp, .branches, .env.*.local)
├── config.toml         (Master local stack configuration - 416 lines)
└── migrations/         (Created for staging migration scripts)
```

### 3.2 Hardened Adjustments in `supabase/config.toml`
The generated configuration was adjusted to enforce strict compatibility and isolation:
1. **PostgreSQL Version Parity**:
   * Changed `major_version = 17` $\rightarrow$ `major_version = 15` (Line 41) to match our verified staging PostgreSQL 15.8 container and production Supabase architecture.
2. **Seed Script Exemption**:
   * Set `[db.seed] enabled = false` (Line 68) to prevent failure on missing `seed.sql`.
3. **Loopback Binding Verification**:
   * All endpoints bind strictly to `127.0.0.1`:
     * API Gateway (`[api]`): `127.0.0.1:54321`
     * Database (`[db]`): `127.0.0.1:54322`
     * Shadow Database (`[db]`): `127.0.0.1:54320`
     * Studio Dashboard (`[studio]`): `127.0.0.1:54323` (External API URL: `http://127.0.0.1`)
     * Local SMTP (`[local_smtp]`): `127.0.0.1:54324`
     * Auth Site URL (`[auth]`): `http://127.0.0.1:3000`

---

## 4. Migration Preparation & Dependency Analysis

### 4.1 Migration File Ordering
* Workspace audit confirmed exactly **one** application migration exists:
  [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql) (21,226 bytes).
* The original file was **not edited or moved**.
* Copied to:
  `supabase/migrations/20261012000000_travel_partner_ecosystem.sql` (21,226 bytes).
* Uses standard Supabase 14-digit timestamp ordering (`20261012000000_...`), ensuring deterministic execution during `supabase db reset`.

### 4.2 Migration Dependency & Assumption Verification
* **Extension**: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` $\rightarrow$ Natively supported in Supabase PG 15.
* **Pre-Seeded Roles**:
  * `anon`, `authenticated`, `service_role` $\rightarrow$ Natively created during Supabase container initialization.
  * Line 253 (`CREATE POLICY ... TO service_role`), which halted Phase 20, will succeed natively.
* **Authentication Context**:
  * `auth.uid()` and `request.jwt.claim.role` $\rightarrow$ Supported via GoTrue and PostgREST.
* **Table Self-Containment**:
  * `travel_agencies.user_id` is a standard `UUID` column. It does not enforce a hard foreign key on `auth.users`, avoiding circular dependencies. All other 6 tables reference `travel_agencies(id)`.

---

## 5. Startup Plan & Port Conflict Audit

### 5.1 Host Port Allocation Audit
A live TCP socket scan verified that all proposed Supabase ports are completely free:

```
+-----------------------------------------------------------------------------------------------------------+
| SERVICE / DAEMON          | BINDING ADDRESS     | CURRENT TCP STATE    | CONFLICT ASSESSMENT              |
+-----------------------------------------------------------------------------------------------------------+
| Staging PostgreSQL        | 127.0.0.1:5433      | LISTENING (PID 22508)| PRESERVED (No overlap)           |
| Staging Redis             | 127.0.0.1:6380      | LISTENING (PID 22508)| PRESERVED (No overlap)           |
| Supabase Kong Gateway     | 127.0.0.1:54321     | FREE                 | Available                        |
| Supabase PostgreSQL DB    | 127.0.0.1:54322     | FREE                 | Available                        |
| Supabase Studio           | 127.0.0.1:54323     | FREE                 | Available                        |
| Supabase Mailpit          | 127.0.0.1:54324     | FREE                 | Available                        |
| Supabase Shadow DB        | 127.0.0.1:54320     | FREE                 | Available                        |
+-----------------------------------------------------------------------------------------------------------+
```

### 5.2 Expected Containers & Resource Profiles

The Supabase CLI launches the following container profiles:

#### Profile A: Resource-Constrained Stack (Recommended for Migration Testing)
Excludes non-essential daemons (`realtime`, `imgproxy`, `mailpit`, `edge-runtime`, `logflare`, `vector`, `supavisor`):
* `supabase_db_BhartYatra_3`: PostgreSQL 15 (Roles, RLS, DDL)
* `supabase_auth_BhartYatra_3`: GoTrue (JWT Authentication)
* `supabase_rest_BhartYatra_3`: PostgREST (RLS Evaluation)
* `supabase_kong_BhartYatra_3`: Kong API Gateway (Port 54321)
* `supabase_meta_BhartYatra_3`: Schema Metadata
* `supabase_storage_BhartYatra_3`: Storage API
* `supabase_studio_BhartYatra_3`: Studio UI (Port 54323)
* **Total Containers**: **7 containers** (~1.2 GB RAM).

#### Profile B: Full Default Stack
Launches all 13 standard containers (~2.4 GB RAM).

---

## 6. Execution Runbook for Operator Approval

Upon receiving operator authorization to proceed to Phase 24, the following exact commands will be executed:

1. **Start the Resource-Constrained Local Supabase Stack**:
   ```powershell
   npx supabase start -x realtime,imgproxy,mailpit,edge-runtime,logflare,vector,supavisor
   ```
2. **Verify Container Health & Loopback Bindings**:
   ```powershell
   npx supabase status
   Get-NetTCPConnection -LocalPort 54321, 54322 | Select-Object LocalAddress, LocalPort, State
   ```
3. **Execute Full Migration Rehearsal**:
   ```powershell
   npx supabase db reset
   ```
4. **Verify Schema & RLS Policy Application**:
   * Query `pg_tables`, `pg_policies`, and `pg_proc` inside `supabase_db_BhartYatra_3`.
   * Confirm all 17 RLS policies and 3 stored procedures are registered without error.

---

## 7. Strict Boundaries Compliance

* [x] **Zero Containers Started / Stopped**: Local Supabase stack has not been started.
* [x] **Existing Staging Undisturbed**: Containers `bharatyatra-staging-postgres` and `bharatyatra-staging-redis` remain online and untouched.
* [x] **Zero Migrations Executed**: `supabase/migrations/` holds the file for review; no SQL was run.
* [x] **Zero Production Access**: Production Supabase, live Razorpay, and production secrets were not touched.
* [x] **Zero Git Commits**: Configuration files remain local and uncommitted.

---

## 8. Final Phase Status

# **`READY FOR OPERATOR APPROVAL`**

### Status Justification:
The local Supabase configuration (`supabase/config.toml`) has been initialized safely and hardened to PostgreSQL 15 with strict loopback bindings. The migration `20261012000000_travel_partner_ecosystem.sql` is staged in `supabase/migrations/` without modifying the original source file. All required ports (`54321`, `54322`) are verified free with zero conflicts against existing staging services. In strict accordance with safety directives, containers have not been launched pending explicit operator authorization.

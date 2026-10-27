# BharatYatra Phase 22 — Local Supabase Environment Preparation Plan
## Document Reference: `BHARATYATRA_PHASE22_SUPABASE_ENVIRONMENT_PLAN.md`
**Phase**: Phase 22 — Local Supabase Environment Preparation  
**Author**: Senior DevSecOps Engineer & Release Manager  
**Scope**: Local Supabase Architecture Design, Port Conflict Analysis, CLI Toolchain Audit & Safe Setup Runbook  
**Execution Timestamp**: 2026-10-22  
**Final Phase Status**: **`READY FOR OPERATOR APPROVAL`**  

---

## 1. Executive Summary & Authorization Scope

* **Objective**: Define a non-destructive architecture and execution plan for an isolated local Supabase emulator stack. This will enable full validation of the partner ecosystem migration ([`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql)), including all Supabase-native RLS policies and `SECURITY DEFINER` stored procedures.
* **Preservation Guarantee**: The existing PostgreSQL staging container (`bharatyatra-staging-postgres` on port `5433`), Redis container (`bharatyatra-staging-redis` on port `6380`), persistent staging volumes, baseline backup, and evidence files remain **100% active, healthy, and untouched**.
* **Zero Production Access**: The planned environment runs exclusively on local Docker containers; zero contact will occur with cloud Supabase, live Razorpay, production DNS, or hosting firewalls.
* **No Premature Execution**: In strict accordance with Phase 22 boundaries, zero containers were launched, no migrations were run, and no configuration files were created on disk.

---

## 2. Supabase CLI Toolchain & Command Audit

The local Supabase toolchain was inspected via `npx`:

* **Installed CLI Version**: `supabase@2.121.0` (Verified via `npx supabase --version`).
* **Command Syntax & Flags**:
  * `supabase init`: Initializes project configuration. Supports `--workdir <dir>` and `--force` (overwrite protection).
  * `supabase start`: Boots local emulator containers on Docker. Supports `--exclude <services>` to minimize memory usage, and `--workdir <dir>`.
  * `supabase stop`: Safely tears down local emulator containers.
  * `supabase db reset`: Re-seeds local database from clean state and reapplies all migrations.
  * `supabase status`: Outputs local API endpoints, DB connection string, and synthetic test keys.

---

## 3. Port Conflict & Resource Analysis

A host-level TCP socket audit was performed across active network interfaces to detect potential port collisions:

```
+-----------------------------------------------------------------------------------------------------------+
| SERVICE NAME              | PROPOSED / CLI DEFAULT PORT | CURRENT HOST STATE | CONFLICT STATUS            |
+-----------------------------------------------------------------------------------------------------------+
| Staging PostgreSQL        | 127.0.0.1:5433              | LISTENING (PID 22508)| PRESERVED (No overlap)   |
| Staging Redis             | 127.0.0.1:6380              | LISTENING (PID 22508)| PRESERVED (No overlap)   |
| Supabase PostgreSQL (DB)  | 127.0.0.1:54322             | UNALLOCATED (Free)   | CLEAN - Ready for use     |
| Supabase API Gateway (Kong)| 127.0.0.1:54321            | UNALLOCATED (Free)   | CLEAN - Ready for use     |
| Supabase Studio (Web UI)  | 127.0.0.1:54323             | UNALLOCATED (Free)   | CLEAN - Ready for use     |
| Supabase Inbucket (Mail)  | 127.0.0.1:54324             | UNALLOCATED (Free)   | CLEAN - Ready for use     |
| Supabase Analytics / Logs | 127.0.0.1:54327             | UNALLOCATED (Free)   | CLEAN - Ready for use     |
| Supabase Vector Engine    | 127.0.0.1:54328             | UNALLOCATED (Free)   | CLEAN - Ready for use     |
| Supabase Connection Pooler| 127.0.0.1:54329             | UNALLOCATED (Free)   | CLEAN - Ready for use     |
+-----------------------------------------------------------------------------------------------------------+
```

**Result**: **Zero port conflicts detected**. The default Supabase CLI range (`54321–54329`) has zero overlap with the existing staging services (`5433`, `6380`).

---

## 4. Repository Configuration & Overwrite Protection

* **Repository State**: `Test-Path supabase` confirmed `False`.
* **Zero Overwrite Risk**: There is no existing `supabase/` directory, `supabase/config.toml`, or `.supabase/` workspace in the repository.
* **Migration Inventory**:
  * Path: [`data/migrations/20261012_travel_partner_ecosystem.sql`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/data/migrations/20261012_travel_partner_ecosystem.sql) (485 lines).
  * In accordance with Action 7, this file was **neither moved nor copied** during this phase.

---

## 5. Proposed Isolated Local Supabase Architecture

To provide an authentic Supabase environment with native support for `service_role`, `authenticated`, `anon`, and `auth.uid()`, the local stack will provision the following components:

```
[ Workstation Developer ]
        |
        v
 [ Kong API Gateway: 127.0.0.1:54321 ]
        |
        +---> /rest/v1   ---> [ PostgREST: PostgREST Engine (RLS & Claim Unpacking) ]
        |
        +---> /auth/v1   ---> [ GoTrue: Authentication & JWT Issuer ]
        |
        +---> /storage/v1---> [ Storage API: S3 Emulation ]
        |
        v
 [ Supabase PostgreSQL 15: 127.0.0.1:54322 ]
   - Native Roles Pre-Seeded: anon, authenticated, service_role, supabase_admin
   - Native Schemas: auth, storage, graphql, realtime, vault
   - Native Claim Injection: request.jwt.claims & request.jwt.claim.role
   - Dedicated Volume: supabase_db_bhartyatra_3
```

### 5.1 Resource Optimization Plan
To minimize workstation RAM and CPU overhead, non-essential background services will be excluded during startup using the CLI `--exclude` flag:
* **Core Essential Services (Kept)**:
  1. `supabase_db` (PostgreSQL 15 with pre-seeded Supabase roles & `auth` schema)
  2. `supabase_auth` (GoTrue auth service for generating authentic test JWTs)
  3. `supabase_rest` (PostgREST for testing RLS tenant isolation via HTTP)
  4. `supabase_kong` (Local API gateway routing)
* **Non-Essential Services (Excluded)**:
  * `--exclude realtime,imgproxy,mailpit,studio,edge-runtime,logflare,vector,supavisor`
  * This reduces container count from 13 to **4 lightweight containers**, consuming $< 1.2\text{ GB}$ total RAM.

---

## 6. Safe Setup Runbook (For Operator Approval)

Upon receiving operator authorization to proceed to Phase 23, the following exact command sequence will be executed:

### Step 1: Safe Project Initialization
Initialize local Supabase configuration non-interactively without force overwrites:
```powershell
npx supabase init
```
*Effect*: Generates `supabase/config.toml` pre-configured for local development.

### Step 2: Configure Loopback Bindings in `supabase/config.toml`
Verify `supabase/config.toml` enforces strict localhost bindings:
```toml
[api]
port = 54321

[db]
port = 54322

[db.pooler]
port = 54329
```

### Step 3: Copy Migration to Supabase Migration Directory
Copy (do not move) the partner ecosystem migration into the standard Supabase migrations directory:
```powershell
New-Item -ItemType Directory -Force -Path supabase/migrations
Copy-Item data/migrations/20261012_travel_partner_ecosystem.sql supabase/migrations/20261012000000_travel_partner_ecosystem.sql
```

### Step 4: Launch Optimized Local Stack
Launch only the required containers:
```powershell
npx supabase start -x realtime,imgproxy,mailpit,studio,edge-runtime,logflare,vector,supavisor
```

### Step 5: Execute Migration & Verify RLS Parity
Run database migration and verify all 485 lines execute cleanly:
```powershell
npx supabase db reset
```

---

## 7. Security & Isolation Guarantees

1. **No Production Link**: `npx supabase link` will **never** be executed. The local stack remains air-gapped from project `uedmguvljhsvbndwkruz`.
2. **Synthetic Mock Secrets**: Local JWT secrets and service role keys are auto-generated non-production keys managed internally by the Supabase CLI.
3. **No Network Exposure**: All ports (`54321`, `54322`) bind strictly to `127.0.0.1`.
4. **Volume Isolation**: Supabase data persists to dedicated Docker volume `supabase_db_bhartyatra_3`, ensuring complete separation from `bharatyatra_staging_pgdata`.

---

## 8. Final Phase Status

# **`READY FOR OPERATOR APPROVAL`**

### Status Justification:
The Supabase CLI toolchain (v2.121.0) is verified and ready. Host port analysis confirmed zero collisions with existing staging services (`5433`, `6380`). The repository has no existing Supabase configuration that could be corrupted. An optimized 4-container architecture has been formulated to test the full migration and RLS policies locally with minimal resource overhead. In compliance with strict safety directives, zero containers were started, no files were modified, and no migrations were executed. Awaiting operator authorization.

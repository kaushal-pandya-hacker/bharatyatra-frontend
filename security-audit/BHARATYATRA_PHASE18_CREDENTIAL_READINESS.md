# BharatYatra Phase 18 — Secure Staging Credential Preparation & Readiness Report
## Document Reference: `BHARATYATRA_PHASE18_CREDENTIAL_READINESS.md`
**Phase**: Phase 18 — Secure Staging Credential Preparation  
**Author**: Senior DevSecOps Engineer & Release Manager  
**Scope**: Staging Credential Provisioning, File Security ACLs, Git Ignore Audit & Compose Validation  
**Execution Timestamp**: 2026-10-22  
**Final Phase Status**: **`READY FOR OPERATOR APPROVAL`**  

---

## 1. Executive Summary & Safety Directives

In accordance with Phase 18 requirements:
1. **Zero Secret Leakage**: No passwords, tokens, API keys, or connection strings are rendered in this document or logged to terminal output.
2. **Cryptographic Randomness**: Passwords were generated using Windows OS-level cryptographically secure pseudo-random number generator (`System.Security.Cryptography.RandomNumberGenerator`).
3. **Strict Isolation**: No production environment files, Supabase cloud endpoints, or live payment credentials were read, queried, or modified.
4. **No Container Operations**: Zero containers were started, stopped, or deleted during this phase.
5. **No Database Migrations**: Schema migrations were not executed.

---

## 2. Action 1 — Staging Compose Variable Audit

The manifest [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml) was inspected for mandatory environment variable references:

* **PostgreSQL Service (`staging-postgres`)**:
  * Line 35: `POSTGRES_PASSWORD: "${STAGING_DB_PASSWORD:?Error: STAGING_DB_PASSWORD must be supplied in .env.staging}"`
  * Variable Name: `STAGING_DB_PASSWORD`
* **Redis Service (`staging-redis`)**:
  * Line 69: `REDIS_PASSWORD: "${STAGING_REDIS_PASSWORD:?Error: STAGING_REDIS_PASSWORD must be supplied in .env.staging}"`
  * Line 71: `REDISCLI_AUTH: "${STAGING_REDIS_PASSWORD:?Error: STAGING_REDIS_PASSWORD must be supplied in .env.staging}"`
  * Variable Name: `STAGING_REDIS_PASSWORD`

**Confirmed Required Variables**: Exactly two (`STAGING_DB_PASSWORD`, `STAGING_REDIS_PASSWORD`).

---

## 3. Action 2 & 3 — Secure Staging Credential Generation & ACL Hardening

### 3.1 Initial State Check
* **Probe Executed**: `Test-Path .env.staging`
* **Pre-Execution State**: `False` (File was absent).

### 3.2 Cryptographic Key Generation
* **Entropy Source**: `System.Security.Cryptography.RandomNumberGenerator`
* **Key Length**: 32 bytes (256 bits) per credential, encoded as 64-character lowercase hexadecimal strings.
* **Independence**: `STAGING_DB_PASSWORD` and `STAGING_REDIS_PASSWORD` were generated through separate, independent random byte arrays.
* **Separation**: Zero reuse of development placeholders, dictionary words, or production secrets.

### 3.3 File Creation & Windows Access Control (ACL) Hardening
* **File Path**: `C:\Users\Pandya Kaushal\Desktop\BhartYatra_3\.env.staging`
* **Encoding**: UTF-8 without BOM
* **Size**: 176 bytes
* **Windows ACL Command Executed**:
  ```powershell
  icacls .env.staging /inheritance:r /grant:r "${currentUser}:(R,W)"
  ```
* **Security Result**: Inheritance removed; all access stripped except Read/Write granted exclusively to the active Windows workstation user account.

---

## 4. Action 4 & 5 — Git Tracking & Ignore Verification

The newly created `.env.staging` file was audited against Git source control to verify non-trackability:

| Check Scope | Command Executed | Actual Result | Status |
| :--- | :--- | :--- | :---: |
| **Tracked Files Check** | `git ls-files .env.staging` | *(Empty output - 0 bytes)* | **VERIFIED UNTRACKED** |
| **Git Status Check** | `git status --porcelain .env.staging`| *(Empty output - Clean)* | **VERIFIED CLEAN** |
| **Git Ignore Match** | `git check-ignore -v .env.staging` | `.gitignore:30:.env.* .env.staging` | **VERIFIED IGNORED** |

**Confirmation**: `.env.staging` matches rule `.env.*` on line 30 of `.gitignore`. It cannot be inadvertently staged, committed, or pushed to any Git remote.

---

## 5. Action 6 — Compose Validation & Exit Codes

The Compose configuration was validated using Docker Compose v2:

| Validation Command | Scope / Context | Exit Code | Diagnostic Result |
| :--- | :--- | :---: | :--- |
| `docker compose -f docker-compose.staging.yml config -q` | Default invocation (checks default `.env`) | `1` | Fails closed with required variable error (proves fail-closed security). |
| `docker compose --env-file .env.staging -f docker-compose.staging.yml config -q` | Explicit staging environment invocation | **`0`** | **Clean success**. All variables interpolate without error. Zero secrets printed. |
| `COMPOSE_ENV_FILES=.env.staging docker compose -f ... config -q` | Environment variable profile invocation | **`0`** | **Clean success**. |

---

## 6. Action 7 — Manifest Isolation & Production Separation Audit

A comprehensive verification of [`docker-compose.staging.yml`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_3/docker-compose.staging.yml) confirmed zero overlap with production:

```
+---------------------------------------------------------------------------------------------------------+
| RESOURCE ATTRIBUTE          | VERIFIED VALUE IN MANIFEST            | PRODUCTION SEPARATION VERIFICATION |
+---------------------------------------------------------------------------------------------------------+
| PostgreSQL Container Name   | bharatyatra-staging-postgres          | Isolated from production naming   |
| PostgreSQL Image            | postgres:15.8-alpine3.20 (Pinned)     | Local minimal container           |
| PostgreSQL Published Port   | 127.0.0.1:5433:5432                   | Strict loopback; non-standard port|
| PostgreSQL Database Name    | bharatyatra_staging_sandbox           | Isolated disposable database      |
| PostgreSQL Database User    | bharatyatra_staging_admin             | Isolated disposable username      |
| PostgreSQL Named Volume     | bharatyatra_staging_pgdata            | Isolated local Docker volume      |
| PostgreSQL CPU / Memory     | 1.5 CPUs / 1024 MB                    | Bounded resource allocation       |
+---------------------------------------------------------------------------------------------------------+
| Redis Container Name        | bharatyatra-staging-redis             | Isolated from production naming   |
| Redis Image                 | redis:7.2.5-alpine3.20 (Pinned)       | Local minimal container           |
| Redis Published Port        | 127.0.0.1:6380:6379                   | Strict loopback; non-standard port|
| Redis Storage Mode          | Ephemeral in-memory (--save '')       | Zero disk persistence             |
| Redis CPU / Memory          | 0.5 CPUs / 256 MB                     | Bounded resource allocation       |
+---------------------------------------------------------------------------------------------------------+
| Cloud Supabase Reference    | NONE (Zero references)                | No queries to cloud project       |
| Live Razorpay Reference     | NONE (Zero references)                | No payment gateway interaction    |
| Production Volumes          | NONE (Zero references)                | Disposable staging volume only    |
+---------------------------------------------------------------------------------------------------------+
```

---

## 7. Action 8 — Docker Engine Availability Recheck

* **Command Executed**: `docker info --format '{{.ServerVersion}} ({{.OSType}}/{{.Architecture}})'`
* **Exit Code**: `0` (Success)
* **Live Engine Output**: `29.7.2 (linux/x86_64)`
* **Status**: Docker Desktop Linux Engine is active, healthy, and communicating over the WSL 2 backend named pipe.

---

## 8. Summary of Completed Prerequisites

```
[ Phase 16: Blocker Resolution ]  ---> [ Phase 17: Engine Recovery ] ---> [ Phase 18: Credential Readiness ]
  - Docker service stopped               - Docker Desktop launched           - .env.staging generated (256-bit)
  - Code-level risks audited             - Engine verified (v29.7.2)         - Windows ACLs restricted
  - Supabase parity evaluated            - Compose syntax validated          - Git untracked & ignored verified
  - Blocker reported                     - Staging credentials blocked       - Compose validated (Exit Code: 0)
                                                                             - Status: READY FOR APPROVAL
```

---

## 9. Final Phase Status

# **`READY FOR OPERATOR APPROVAL`**

### Status Justification:
All prerequisites for staging infrastructure activation are complete:
1. Docker Desktop Linux engine is verified active (v29.7.2).
2. Local staging credentials (`STAGING_DB_PASSWORD`, `STAGING_REDIS_PASSWORD`) are generated with 256-bit cryptographic entropy and saved to `.env.staging`.
3. File permissions are locked down via Windows ACLs.
4. Git ignore status is confirmed (`.gitignore` line 30 excludes `.env.*`; zero tracking).
5. Compose configuration validation passes cleanly (`exit code 0` via `--env-file .env.staging`).
6. Production separation is 100% verified (strict loopback `127.0.0.1` bindings, disposable volumes, zero Supabase cloud contact).

In strict adherence to safety directives, containers will not be launched until explicit operator authorization is received.

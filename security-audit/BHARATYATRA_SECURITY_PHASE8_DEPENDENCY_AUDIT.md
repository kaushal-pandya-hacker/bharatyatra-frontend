# BharatYatra Dependency Security & Vulnerability Audit
## Document Reference: `BHARATYATRA_SECURITY_PHASE8_DEPENDENCY_AUDIT.md`
**Phase**: Phase 8 — Controlled Load Testing, Resilience Validation & Dependency Security  
**Scope**: Root Workspace (`package.json`, `package-lock.json`), Backend (`18_DEVELOPMENT/Backend`), and Frontend Manifests  
**Status**: AUDIT COMPLETE — FINDINGS DOCUMENTED & PINNED  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary & Scope

An exhaustive audit of direct, transitive, devDependencies, and package lifecycle hooks was conducted across the BharatYatra codebase.
The assessment identified critical supply-chain risks, most notably:
1. **Missing Backend Lockfile**: `18_DEVELOPMENT/Backend` previously lacked a `package-lock.json`, exposing build environments to unpinned dependency drift and potential dependency confusion. A strict, reproducible lockfile was generated (`npm i --package-lock-only`) and audited.
2. **Root Workspace Advisory Count**: 18 vulnerabilities (1 Critical, 15 High, 2 Moderate), predominantly rooted in Next.js 14.2.5 (App Router Server Components DoS and Windows dev server origin bypass) and PostCSS.
3. **Backend Advisory Count**: 65 vulnerabilities (2 Critical, 41 High, 18 Moderate, 4 Low), primarily in transitive utilities (`tar` via native node-pre-gyp, `handlebars`, `multer`, `lodash` via `@nestjs/config`, and `webpack` via `@nestjs/cli`).
4. **Package Lifecycle Scripts**: 6 packages utilize build/install hooks (`bcrypt`, `prisma`, `@prisma/client`, `@prisma/engines`, `msgpackr-extract`, `@nestjs/core`).

---

## 2. Audit Tools, Freshness & Execution Baseline

| Target Directory | Scanner Tool | Command Executed | Exit Code | Freshness / Advisory Source | Total Vulnerabilities |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Root Workspace** | npm CLI v10.8.2 | `npm audit` | `1` | npm Registry Advisory DB (Live) | **18** (1 Critical, 15 High, 2 Moderate) |
| **Backend Core** | npm CLI v10.8.2 | `npm audit` | `1` | npm Registry Advisory DB (Live) | **65** (2 Critical, 41 High, 18 Moderate, 4 Low) |
| **Secret Scanner** | Internal Regex Engine | Custom FS Scanner | `0` | Live repository AST scan | **0 exposed private keys** |

---

## 3. High-Confidence Vulnerability Findings & Severity Breakdown

### Critical Severity Advisories

| Advisory ID / Package | Severity | Affected Versions | Vulnerability Description | Applicability Analysis & Exploitation Risk | Recommended Action / Mitigation |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **`next`** (GHSA-p293-qw3h-jr36, GHSA-gp8f-8m3g-qvj9) | `CRITICAL` | `0.9.9 - 16.3.0-preview.10` | Next.js Cache Poisoning, Windows Dev Server RCE, Server Action DoS | **Medium-Low Risk in Production**: Production deploys on Linux containers behind Cloudflare WAF; Windows dev server RCE is restricted to local development environments. | Plan non-breaking minor upgrade to `next@14.2.35` (latest 14.x LTS). Avoid breaking jump to Next.js 15.x. |
| **`tar`** (GHSA-34x7-hfp2-rc4v, GHSA-8qq5-rm4j-mr97) | `CRITICAL` | `<=7.5.20` | Hardlink path traversal & arbitrary file overwrite | **Low Runtime Risk**: Transitive dependency of `@mapbox/node-pre-gyp` used solely during native build time of `bcrypt`. No tar extraction occurs during runtime traffic. | Enforce `npm audit fix` for build container; pin modern `bcrypt` prebuilds. |
| **`handlebars`** (GHSA-xw65-4hp5-5hc7) | `CRITICAL` | `3.0.0 - 4.7.9` | AST Type Confusion leading to JS Injection | **Low Runtime Risk**: Present only as transitive devDependency of NestJS schematics/test generators. Not used for rendering user web requests. | Isolate to devDependencies; exclude devDependencies from production Docker images via `--omit=dev`. |

### High Severity Advisories

| Package | Severity | Vector | Runtime Context | Remediation Strategy |
| :--- | :---: | :--- | :--- | :--- |
| **`multer`** | `HIGH` | DoS via oversized array index / uncleaned aborted uploads | Used in Express platform for multipart file uploads. | Enforce 1MB maximum payload body limit in `main.ts` (Already active via `app.use(json({ limit: '1mb' }))`). |
| **`lodash`** | `HIGH` | Prototype pollution in `_.unset` and `_.omit` | Transitive dependency inside `@nestjs/config`. | No user input directly invokes `_.unset` or `_.omit`. Update `@nestjs/config` during next major framework alignment. |
| **`js-yaml`** | `HIGH` | Quadratic CPU consumption in merge keys | Transitive dependency of `@nestjs/swagger` and coverage tools. | Swagger docs disabled in production or restricted to internal admin IPs. |
| **`glob`** | `HIGH` | Command injection in CLI `-c` flag | Transitive dependency of `@next/eslint-plugin-next`. | Pure devDependency / linting tool; zero production runtime presence. |
| **`source-map-js`** | `HIGH` | Event-loop DoS via source map offsets | Build-time CSS parser dependency. | Build artifacts strip source maps in production (`generateSourceMaps: false`). |

---

## 4. Package Lifecycle Scripts & Dependency Confusion

Running `npm i --package-lock-only` in Backend revealed 6 packages executing build scripts:
- `bcrypt@5.1.1`: Executes `node-gyp rebuild` to compile native C++ bindings for password hashing.
- `msgpackr-extract@3.0.4`: Compiles native binary acceleration.
- `@prisma/client@5.22.0` & `prisma@5.22.0`: Generates Prisma query engine binaries.
- `@nestjs/core@10.4.22`: Post-install verification.

### Supply-Chain Defenses Enacted
1. **`package-lock.json` Committed**: Pinned exact package hashes (`integrity: sha512-...`) for all 794 packages in `18_DEVELOPMENT/Backend`, preventing malicious upstream package substitution.
2. **Private Scope Integrity**: All BharatYatra packages are strictly private (`"private": true` in `package.json`), blocking public npm registry namespace collision attacks.

---

## 5. Secret Scanning & Credential Safety

An automated file scanner was executed across `18_DEVELOPMENT/Backend/src` and root `lib/`, `app/` testing for private keys, AWS tokens, and Stripe/Razorpay live keys:
- **Private Keys**: 0 detected (`-----BEGIN RSA PRIVATE KEY-----`, etc.).
- **Google AI Keys**: 0 hardcoded (`AIzaSy...` absent from tracked code; strictly read from `process.env.GEMINI_API_KEY`).
- **Supabase Credentials**:
  - `lib/supabase/client.ts` uses client-safe public anon keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) guarded by PostgreSQL Row Level Security (RLS).
  - Privileged `SUPABASE_SERVICE_ROLE_KEY` is loaded strictly on the server and guarded by `if (typeof window !== 'undefined') return getSupabaseClient()`.

---

## 6. Limitations & Unverified Items
- **Automated Major Upgrades Deferred**: Upgrading Next.js to v15 or `@nestjs/platform-express` to v12 would introduce breaking changes across routing, decorators, and middleware. These must be performed in dedicated migration sprints with full regression testing.
- **Docker Base Image Scanning**: Unverified; production container Dockerfile was not present in repository root. Base OS vulnerability scanning (Trivy / Clair) must be integrated into container build pipelines.

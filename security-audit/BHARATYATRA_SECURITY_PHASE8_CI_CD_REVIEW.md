# BharatYatra CI/CD Pipeline & Supply-Chain Security Review
## Document Reference: `BHARATYATRA_SECURITY_PHASE8_CI_CD_REVIEW.md`
**Phase**: Phase 8 — Controlled Load Testing, Resilience Validation & Dependency Security  
**Scope**: Continuous Integration Workflows, Build Gates, Secret Isolation & Deployment Security  
**Status**: REVIEW COMPLETE — GAPS IDENTIFIED & HARDENED WORKFLOW PREPARED  
**Timestamp**: 2026-10-22  

---

## 1. Executive Summary

An audit of the repository's automation and deployment pipeline revealed that:
1. **No Automated CI/CD Workflows Were Configured**: The repository lacked a `.github/workflows` directory, meaning pull requests and commits are currently not automatically subjected to lockfile integrity checks, type checks, unit tests, or vulnerability scanning.
2. **Missing Backend Lockfile Remediated**: `18_DEVELOPMENT/Backend` was operating without `package-lock.json`. This was resolved in Phase 8 by generating and verifying a pinned lockfile (`package-lock.json`), ensuring `npm ci` can execute reproducibly.
3. **Recommended CI/CD Architecture**: An industry-standard, multi-stage GitHub Actions workflow was designed to enforce 5 mandatory security gates prior to any deployment.

---

## 2. Supply-Chain Security Controls & Current Gap Analysis

| Supply-Chain Control | Production Standard | Current Repository Status | Gap / Risk Analysis | Recommended Remediation |
| :--- | :--- | :---: | :--- | :--- |
| **Reproducible Installs** | `npm ci` strictly enforced using lockfile | `IMPLEMENTED` (Both Root & Backend) | Previously missing Backend lockfile; now committed. | Require `npm ci` in all Dockerfiles and CI runners. |
| **Automated Dependency Audit** | Fail PR on critical/high direct vulnerabilities | `NOT CONFIGURED` in CI | Vulnerable packages can be merged unnoticed. | Add `npm audit --audit-level=critical` step to CI. |
| **Secret Scanning Gate** | Automated scan for API keys before merge | `NOT CONFIGURED` in CI | Risk of developer accidentally committing secrets. | Add Gitleaks / Trufflehog action to CI pipeline. |
| **Static Type & Lint Gate** | Strict typecheck and zero compiler errors | `IMPLEMENTED` via npm scripts | Must be run manually by developer. | Enforce `npm run type-check` as required status check. |
| **Test Suite Gate** | 100% passing unit and security tests | `IMPLEMENTED` via npm scripts | Must be run manually by developer. | Require root `npm test` and backend `npm test` in CI. |
| **Environment Secret Separation** | Staging and Production secrets isolated | `UNVERIFIED` | Local `.env` files must never be reused across environments. | Store production secrets in AWS Secrets Manager / Vault. |
| **Manual Deployment Approval** | Protected branches require peer review & manual signoff | `UNVERIFIED` | Production pushes must require approval. | Enable GitHub Environment protection rules with manual approvals. |

---

## 3. Production CI/CD Security Workflow Design

The following workflow definition provides an automated, least-privilege CI pipeline ready to be added to `.github/workflows/security-ci.yml`:

```yaml
name: BharatYatra Security & Quality Gate

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  security-events: write

jobs:
  security-and-test:
    name: Lint, Audit, Typecheck & Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      # Gate 1: Secret Scanning
      - name: Automated Secret Detection
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # Gate 2: Reproducible Dependency Installation
      - name: Install Root Dependencies
        run: npm ci

      - name: Install Backend Dependencies
        working-directory: 18_DEVELOPMENT/Backend
        run: npm ci

      # Gate 3: Dependency Security Audit
      - name: Audit Backend Dependencies
        working-directory: 18_DEVELOPMENT/Backend
        run: npm audit --audit-level=critical
        continue-on-error: true # Flag for security review without blocking hotfixes

      # Gate 4: Strict Static Type Checking
      - name: Root TypeScript Verification
        run: npm run type-check

      # Gate 5: Security & Unit Test Execution
      - name: Execute Root Security & Partner Suites
        run: npm test

      - name: Execute Backend Core Test Suites
        working-directory: 18_DEVELOPMENT/Backend
        run: npm test

      - name: Verify Backend Build Artifact
        working-directory: 18_DEVELOPMENT/Backend
        run: npm run build
```

---

## 4. Least-Privilege Deployment Recommendations

1. **Deploy Keys & Service Principals**: Never use root/administrator cloud credentials in CI. Generate tightly scoped IAM roles using GitHub OpenID Connect (OIDC) rather than storing long-lived AWS or GCP access keys in GitHub Secrets.
2. **Container Artifact Verification**: Build Docker images with `--omit=dev` to prevent build tools, compilers, and test frameworks from entering production images.
3. **Artifact Hash Signing**: Sign container images with Cosign to ensure that only images built and passed by the official CI pipeline can be deployed to Kubernetes / ECS.
4. **Environment Isolation**: Maintain separate Supabase project instances and database connection strings for `development`, `staging`, and `production`. Never run load tests or migrations against production databases.

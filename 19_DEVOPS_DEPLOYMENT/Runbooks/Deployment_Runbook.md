# Deployment Runbook v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## Pre-Deployment Checklist
1. All automated unit, integration, and security tests passing 100% in CI (`pytest tests`).
2. Release version tag created (e.g. `v1.14.0`).
3. Database migrations validated against staging environment.
4. Backup snapshot confirmed active.

## Execution Steps
1. Push release tag to GitHub repository:
   ```bash
   git tag -a v1.14.0 -m "Release v1.14.0"
   git push origin v1.14.0
   ```
2. CI pipeline builds container images, scans for vulnerabilities, and deploys to Staging.
3. Automated staging smoke tests execute (`curl /api/v1/health`).
4. Operations team reviews staging metrics and approves Production release gate in GitHub.
5. Production containers update via zero-downtime rolling update.

# Rollback Runbook v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## Rollback Trigger Conditions
- Production HTTP 5xx error rate exceeds 1.0% over a 5-minute window.
- Core booking or payment gateway integration failure spike.

## Rollback Procedure
1. Identify last stable release container image tag (e.g. `v1.13.0` / SHA `a1b2c3d`).
2. Redeploy previous container image tag:
   ```bash
   IMAGE_TAG=v1.13.0 docker-compose -f 19_DEVOPS_DEPLOYMENT/Production/docker-compose.prod.yml up -d --no-deps backend frontend ai_service
   ```
3. Verify application health check (`/api/v1/health`).
4. Note: Database migrations MUST use backward-compatible schema changes ("Expand-and-Contract" pattern). Never blindly roll back destructive migrations.

# Database Migration & Maintenance Runbook v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## Controlled Schema Migrations
1. Develop Prisma schema modification in `18_DEVELOPMENT/Backend/prisma/schema.prisma`.
2. Generate migration file locally:
   ```bash
   npx prisma migrate dev --name <migration_description>
   ```
3. Test migration forward and backward compatibility against local/staging database.
4. Production migration runs as a pre-deploy step prior to rolling container update:
   ```bash
   npx prisma migrate deploy
   ```

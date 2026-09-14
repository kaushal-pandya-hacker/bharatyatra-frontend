# CHALO FARVA — DATABASE MIGRATION & DEPLOYMENT STRATEGY
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Migration Protocol & Governance

1. **Zero Direct DDL in Production**: Production database schema modifications must be executed via versioned migration scripts stored in `05_DATABASE/Migrations/`.
2. **Backward-Compatible Migrations**: Schema alterations must be multi-phased to avoid downtime:
   - Phase A: Add new columns as NULLABLE or with DEFAULT values.
   - Phase B: Deploy dual-writing application code.
   - Phase C: Backfill historical records via background worker.
   - Phase D: Add NOT NULL constraints and remove legacy columns.

---

## 2. Tooling & Environment Management

- **Migration Framework**: `Flyway` / `Prisma Migrations` / `Golang-Migrate` / `Knex.js`.
- **Naming Convention**: `V{YYYYMMDDHHMMSS}__{description}.sql` (e.g. `V20260913180000__create_initial_schema.sql`).
- **Rollback Policy**: Every migration file `V...` must have a corresponding rollback file `U...` (Undo migration).

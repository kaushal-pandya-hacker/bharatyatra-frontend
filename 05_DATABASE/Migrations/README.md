# Database Migrations Protocol — Chalo Farva

## Flyway / Migration Standards
1. Every schema change must be submitted as a versioned migration file under `05_DATABASE/Migrations/`.
2. Format: `V{Version}__{Description}.sql` (e.g. `V1.0.1__add_loyalty_points.sql`).
3. Never edit existing applied migration files in staging or production.

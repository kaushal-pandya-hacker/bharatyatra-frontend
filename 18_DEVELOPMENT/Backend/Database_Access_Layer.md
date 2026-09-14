# Database Access Layer — Chalo Farva

## PostgreSQL Pool Management
The backend connects to PostgreSQL via `pg.Pool` with connection pooling limits:
- Max Connections: 20
- Idle Timeout: 30,000 ms
- Connection Timeout: 2,000 ms

## Parameterized SQL Safety
To prevent SQL injection attack vectors, all database operations utilize positional parameters (`$1`, `$2`, `$3`).

```typescript
const result = await db.query(
  'SELECT * FROM destinations WHERE category = $1 AND is_active = $2',
  ['Heritage', true]
);
```

## Schema Integration
Database queries interface with the 54+ PostgreSQL tables defined under `05_DATABASE/SQL/tables.sql`.

# Backend Architecture v1.0 — Chalo Farva NestJS Foundation

## 1. Modular Layering Architecture
The backend is structured around NestJS Controllers, Services, and Repositories via Prisma ORM:

```text
[ Client Requests / Frontends ]
               │
               ▼
┌─────────────────────────────┐
│  NestJS Controller / Pipe   │ (ValidationPipe, JwtAuthGuard, RolesGuard, Swagger)
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    Domain Service Layer     │ (Business logic, Finite State Machine, Audit)
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    Prisma ORM / Database    │ (PostgreSQL 54+ Tables DB, Connection Pooling)
└─────────────────────────────┘
```

## 2. Global Services
- `PrismaService`: Database pool & transaction manager.
- `RedisService`: Caching, rate limiting, and distributed locks.
- `QueueService`: Asynchronous job processing with exponential retries and backoff.
- `AuditService`: Centralized auditable event logging with automatic PII redaction.

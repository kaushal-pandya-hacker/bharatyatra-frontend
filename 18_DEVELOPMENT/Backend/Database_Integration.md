# Database Integration — Chalo Farva

## 1. Prisma ORM & PostgreSQL Schema
Mapped via [`prisma/schema.prisma`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/Backend/prisma/schema.prisma) matching the 54+ PostgreSQL tables across 22 modules:
- Typed Prisma Client generated via `npx prisma generate`.
- Seed data for 24 Gujarat destinations executed via `npm run prisma:seed`.

## 2. Connection Management & Transactions
- Handled through `PrismaService` extending `PrismaClient` with automatic `$connect` and `$disconnect` lifecycle hooks.
- Money fields defined as `@db.Decimal(10, 2)` or `@db.Decimal(12, 2)` preventing floating-point rounding errors.

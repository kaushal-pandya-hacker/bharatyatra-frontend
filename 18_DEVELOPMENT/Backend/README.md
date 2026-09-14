# Chalo Farva — Production NestJS Backend & Core Services v1.0

Production NestJS + Prisma + PostgreSQL + Redis backend application powering Gujarat's first AI travel platform.

## Architecture Highlights
- **Framework**: NestJS 10 (TypeScript 5.4)
- **ORM & DB**: Prisma ORM with PostgreSQL (54+ tables across 22 modules)
- **Caching & Queues**: Redis & BullMQ
- **API Documentation**: OpenAPI / Swagger live UI at `/api/v1/docs`
- **Finite State Machine**: Explicit booking transitions (`SEARCHED` -> `SELECTED` -> `PAYMENT_PENDING` -> `PAYMENT_CONFIRMED` -> `BOOKING_PENDING` -> `CONFIRMED`)
- **Immutable Itinerary Versioning**: Every adaptive re-route creates a new itinerary version (`versionNumber`, `changeReason`, `parentVersionId`) without overwriting history.
- **Provider Mock Safety**: External integrations operate behind clean TypeScript interfaces with explicit `DEVELOPMENT MOCK` adapters.

## Quickstart Setup
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client & Run Seed
npx prisma generate
npm run prisma:seed

# 3. Start local development server with hot-reload
npm run start:dev
```
Access server at `http://localhost:5000/api/v1` and Swagger docs at `http://localhost:5000/api/v1/docs`.

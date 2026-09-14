# Chalo Farva Admin Panel Architecture v1.0

## 1. Overview
The Admin Panel is Chalo Farva's internal operational console for marketplace governance, user administration, supplier verification, inventory approval, payment/refund oversight, double-entry ledger monitoring, AI adaptation monitoring, and support ticket resolution.

## 2. Core Architecture Pipeline

```mermaid
graph TD
    A[Admin User Browser] --> B[Next.js 14 Admin Frontend app/admin]
    B --> C[NestJS Backend API Gateway]
    C --> D[RBAC Auth Guard]
    D --> E[AdminService]
    E --> F[Users / Suppliers / Bookings / Payments / AI / Support Subservices]
    F --> G[PostgreSQL & Redis Cache]
    F --> H[Immutable Audit Log Manager]
```

## 3. Core Principles
- **Server-Side Authorization**: Every protected API validates user identity, role, and granular permission. Frontend route hiding alone is never trusted.
- **Audit Traceability**: Sensitive administrative state changes (supplier approvals, account suspensions, refund interventions) create an audit record.

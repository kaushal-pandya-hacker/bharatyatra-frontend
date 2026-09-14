# Backend Architecture Specification — Chalo Farva

## 1. Core Stack
- **Runtime**: Node.js 18+ LTS / Express
- **Language**: TypeScript 5.4+ (Strict Mode)
- **Database**: PostgreSQL 15+ (54+ Tables across 22 Modules)
- **Caching**: Redis 7+
- **Validation**: Zod schema validation
- **Auth**: JWT stateless tokens with role-based access control (RBAC)

## 2. API Micro-Modules
- `Auth`: User authentication, session management, password hashing.
- `Destinations`: Gujarat travel discovery catalog (Statue of Unity, Somnath, Rann of Kutch, Gir, etc.).
- `AI Engine`: Multi-day itinerary generation and deterministic re-routing engine.
- `Bookings`: Multi-vendor travel booking engine (Bus, Hotel, Activity, Package).
- `Payments`: Razorpay & UPI checkout sessions and webhooks.

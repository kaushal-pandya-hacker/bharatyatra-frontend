# CHALO FARVA — SYSTEM IMPLEMENTATION ARCHITECTURE v1.0
**Master Technical Design & System Blueprint**  
**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Status**: `IMPLEMENTED & AUDITED`

---

## 1. SYSTEM OVERVIEW & TOPOLOGY

Chalo Farva is built as a highly decoupled, modular microservice system optimized for high concurrency, low latency, deterministic itinerary planning, and enterprise booking reliability.

```
                                  [ CLIENT USER ]
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
            [ NEXT.JS FRONTEND ]                     [ MOBILE / PWA App ]
         (React 18 / TypeScript)                    (React Native / PWA)
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         │ REST API / WebSocket
                                         ▼
                             [ NESTJS BACKEND API ]
                         (TypeScript / Express Engine)
                                         │
       ┌───────────────────┬─────────────┼─────────────┬───────────────────┐
       ▼                   ▼             ▼             ▼                   ▼
[ AUTH & USER ]     [ BOOKING ENGINE ] [ FINANCIAL ] [ SUPPLIER PORTAL ] [ ADAPTIVE AI ]
 (JWT/RBAC)        (State Machine)    (Ledger/TDS) (Multi-Tenant)      (Disruption)
       │                   │             │             │                   │
       └───────────────────┴─────────────┼─────────────┴───────────────────┘
                                         │ HTTP / gRPC / Queue
                                         ▼
                             [ FASTAPI AI SERVICE ]
                       (Python 3.12 / Pydantic / RAG)
                                         │
                ┌────────────────────────┴────────────────────────┐
                ▼                                                 ▼
     [ DETERMINISTIC IQS ENGINE ]                   [ RAG VECTOR KNOWLEDGE BASE ]
   (Time / Cost / Route Math)                     (24 Gujarat Hubs / Verified POIs)
```

---

## 2. COMPONENT & REPOSITORY STRUCTURE (`18_DEVELOPMENT/`)

```
18_DEVELOPMENT/
├── Frontend/                 # Next.js 14 Web Application (App Router, Tailwind CSS, TypeScript)
├── Backend/                  # NestJS 10 REST API Server (TypeScript, Prisma ORM, JWT, Redis)
├── AI_Service/               # Python 3.12 FastAPI Service (Deterministic IQS, RAG, Pytest)
├── Admin/                    # Admin Dashboard UI & Operations Control Center
├── Supplier_Portal/          # Multi-tenant Supplier Management Portal
├── Mobile/                   # React Native / PWA Mobile Client
├── Shared/                   # Shared TypeScript Interfaces, Enums & DTO Schemas
└── Scripts/                  # Database Migration & Development Utility Scripts
```

---

## 3. CORE SUBSYSTEM SPECIFICATIONS

### A. Frontend Subsystem (Next.js 14)
- **Framework**: Next.js 14 with App Router (`app/`)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS & Reusable Glassmorphism Component Library
- **Key Modules**:
  - `app/page.tsx`: Homepage with hero banner and "PLAN MY TRIP WITH AI" primary CTA.
  - `app/explore/page.tsx`: Gujarat Destination Discovery (24 verified hubs).
  - `app/planner/page.tsx`: AI Trip Planner input form & interactive parameter controls.
  - `app/itinerary/[id]/page.tsx`: Interactive day-by-day itinerary timeline with GIS route map.
  - `app/mytrip/page.tsx`: Central traveler control dashboard holding vouchers, bus seats, and alerts.

### B. Backend Subsystem (NestJS 10)
- **Framework**: NestJS 10 with Express core
- **ORM**: Prisma ORM with PostgreSQL database integration
- **Caching & Queues**: Redis & BullMQ async job processing
- **Core Modules**: `auth`, `users`, `destinations`, `trips`, `itinerary`, `hotels`, `buses`, `activities`, `bookings`, `payments`, `adaptive-ai`, `suppliers`, `admin`.
- **Health Check API**: `GET /api/v1/health` returning database, Redis, and AI service readiness metrics.

### C. AI Service Subsystem (Python FastAPI)
- **Framework**: Python 3.12 + FastAPI
- **Engine**: Hybrid Deterministic Itinerary Quality System (IQS) + RAG Knowledge Base.
- **Rules & Constraints**:
  - 100% Opening-hour verification (e.g., Sabarmati Ashram 08:30–18:30).
  - Multi-hub Traveling Salesperson (TSP) geographical route optimization.
  - Monsoon closure rules (Gir National Park closed July 16 – Oct 15).
  - Budget capping & single-coupon margin safety.
- **Core API Endpoint**: `POST /api/v1/ai/plan-trip`

---

## 4. DATABASE & DATA SCHEMAS (PostgreSQL + Prisma)

Key foundational database models include:
- `User` & `UserProfile`: Authentication, RBAC roles (`CUSTOMER`, `SUPPLIER_ADMIN`, `PLATFORM_ADMIN`), preferences.
- `Destination` & `Attraction`: 24 Gujarat hubs, geotagged POIs, opening hours, ticket costs.
- `Hotel` & `RoomType`: Verified hotel inventory, amenity tags, baseline rates.
- `BusOperator` & `BusRoute`: GSRTC & private operator schedules, seat layout configurations.
- `Trip` & `ItineraryDay`: Master trip container, versioning (`v1.0` -> `v2.0`), day-by-day activity slots.
- `Booking` & `PaymentTransaction`: Decoupled server-side booking state machine (`PAYMENT_PENDING` -> `PAYMENT_CONFIRMED` -> `CONFIRMED`).

---

## 5. SECURITY & HARDENING ARCHITECTURE

1. **Authentication**: JWT stateless authentication with bcrypt password hashing ($12$ rounds).
2. **Authorization & Tenant Isolation**: `SupplierGuard` middleware enforcing strict `tenant_id` database context filtering (0 cross-tenant data leakage).
3. **Payment Security**: Sandbox payment abstraction interface with zero raw credit card handling.
4. **Environment Security**: Zero committed secrets policy using `.env.example` templates.

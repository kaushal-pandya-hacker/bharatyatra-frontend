# BharatYatra — Complete Project Structure & Directory Catalog

> **Audit Phase:** Phase 1 Technical Architecture Audit  
> **Status:** Production Verified Directory Tree  
> **Target Audience:** Independent Technical Auditors, System Architects  

---

## 1. Top-Level Repository Architecture

The workspace contains the full enterprise stack of the BharatYatra platform. Below is the structural layout of top-level directories:

```
c:\Users\Pandya Kaushal\Desktop\BhartYatra_6\
├── app/                              # Next.js 14 App Router: 157 registered pages + 159 API routes
├── components/                       # 87 Reusable React UI & Domain Components
├── lib/                              # 96 Modular TypeScript services (AI, Booking, FinTech, Auth)
├── data/                             # 26 Static geographical, cultural, and tourism datasets
├── public/                           # 1,435 Public web assets, tourism imagery, brand logos, sounds
├── styles/                           # Global CSS and Tailwind directives
├── types/                            # TypeScript type definitions and ambient declarations
├── supabase/                         # Supabase configuration, RLS policies, and SQL migrations
├── 18_DEVELOPMENT/                   # Full-Stack Engineering Workspace
│   ├── Backend/                      # Standalone NestJS 10 enterprise microservices engine
│   ├── AI_Service/                   # AI services workspace (Python cache artifacts)
│   ├── Frontend/                     # Upstream frontend workspace
│   ├── Admin/                        # Admin application scaffolding
│   ├── Mobile/                       # Mobile transformation workspace
│   ├── Shared/                       # Cross-platform shared types and schemas
│   └── Supplier_Portal/              # Dedicated vendor portal workspace
├── testing/                          # Adversarial test suites, load test runners, and datasets
├── __tests__/                        # 26 Node.js / TSX automated test files
├── scripts/                          # Build automation and documentation generation scripts
├── security-audit/                   # Vulnerability assessments and historical security reports
├── 00_PROJECT_MANAGEMENT/            # Architecture roadmaps and sprint specifications
├── 01_PRD_REQUIREMENTS/              # Product Requirement Documents (PRDs)
├── 02_BRAND_IDENTITY/                # Brand guidelines, typography, and color tokens
├── 06_API/                           # API contract documentation and endpoint manifests
├── 07_AI/                            # AI prompt templates and Nexi system instructions
├── 09_BOOKING/                       # Booking state machine specifications
├── 11_PAYMENTS_FINANCE/              # BharatGateway settlement and finance specifications
├── 13_ADMIN_PANEL/                   # Master administrative panel requirements
├── 14_SUPPLIER_PORTAL/               # Supplier onboarding and inventory schemas
├── 15_INTEGRATIONS/                  # Third-party supplier integration documentation
├── 16_SECURITY/                      # Security audit runbooks and incident response protocols
├── 18_DEVELOPMENT/                   # Monorepo development branches
├── 20_LEGAL_COMPLIANCE/              # DPDP Act 2023, IT Rules, and terms documentation
├── 25_RELEASES/                      # Release runbooks and version changelogs
├── middleware.ts                     # Edge security and routing middleware
├── next.config.mjs                   # Next.js production configuration & security headers
├── tailwind.config.ts                # Tailwind design tokens, responsive breakpoints, colors
├── package.json                      # Frontend dependencies, scripts, and build tasks
├── package-lock.json                 # Pinned frontend dependency lockfile
├── tsconfig.json                     # TypeScript compiler configuration
├── Dockerfile                        # Multi-stage production container build
├── docker-compose.staging.yml        # Disposable local staging PostgreSQL & Redis setup
└── APP_PAGES_DIRECTORY.md            # 157-page catalog with links and access levels
```

---

## 2. Deep Dive: Major Directory Breakdown

### 2.1 `app/` — Next.js 14 App Router (157 Pages, 159 API Routes)
The Next.js 14 App Router represents the entire web presentation and backend-for-frontend (BFF) tier.

| Subdirectory | Page Count | Purpose & Domain |
| :--- | :--- | :--- |
| `app/(customer)` | 53 pages | Primary traveler customer journey: `/activities`, `/ai-planner`, `/buses`, `/trains`, `/destinations`, `/packages`, `/checkout`, `/booking/confirmation`. |
| `app/admin` | 35 pages | Platform Super-Admin operations: dashboard, bookings, finance, CMS, destinations, inventory, refunds, reviews, settlements, staff, suppliers, and travel partner audits. |
| `app/supplier` & `app/partner` | 12 pages | Travel partner and vendor portal: package creation wizard, commission tracking, inventory management, bookings reconciliation. |
| `app/bharatyatra-ops` | 11 pages | Operations control room: live ground telemetry, flight radar, incident logs, driver dispatch. |
| `app/trips` | 10 pages | Trip Command Center: group expense splitter (`/trips/[id]/split`), itinerary navigator, offline vouchers, live emergency radar. |
| `app/bharatgateway` | 6 pages | FinTech payment portal: merchant onboarding, sandbox testing, API keys, webhook testbed, transaction ledger. |
| `app/auth` & `app/login` | 8 pages | Authentication, role elevation, OTP verification, password reset, DPDP onboarding consent. |
| `app/api` | 159 routes | Serverless route handlers implementing administrative actions, AI planning, booking orchestration, WebPush notifications, and BharatGateway endpoints. |

### 2.2 `components/` — Reusable React UI Components (87 Files)
Organized into modular domain-specific folders:
- `components/accessibility/`: Accessibility floating controls, font scaling, high-contrast toggle, voice search modal.
- `components/admin/`: Master booking operations dashboard, pricing accuracy telemetry, admin notification dropdowns.
- `components/ai/`: Dynamic itinerary planner UI, AI planner wizard, duration recommendation controls, Farva/Nexi chat drawer.
- `components/booking/`: Booking guard provider, booking card, smart flow wizard, unavailability fallback modal.
- `components/maps/`: Leaflet map wrappers, destination map sections, interactive route graph renderers.
- `components/nexi/`: Floating bilingual Nexi AI travel assistant drawer with contextual prompts.
- `components/notifications/`: Notification center dropdown, permission banner, settings panel, push explainer modal.
- `components/travel/`: Bus card, class selector, circuit card, destination card, package editor wizard.
- `components/ui/`: Atomic design primitives: buttons, badges, inputs, error states, empty states, modals.

### 2.3 `lib/` — Business Logic & Platform Infrastructure (96 Files)
The foundational core of the application:
- `lib/ai-planner/` (34 modules): Dynamic itinerary generator, Indian geo registry (65KB), hybrid pricing engine (49KB), duration calculation engine, seasonal accessibility intelligence, multimodal route engine.
- `lib/auth/`: Server-side authentication (`server-auth.ts`), JWT verification, session cookie management.
- `lib/booking/`: Unified booking orchestrator (`unified-booking-orchestrator.ts`), booking context state machine.
- `lib/gateway/`: BharatGateway FinTech SDK (`gateway-client.ts`), payment intent creation, webhook HMAC verification.
- `lib/hotels/`: Hotelbeds (HBX) provider adapter (`hbx-hotel-provider.ts`), HMAC signature generation (`hbx-auth.ts`), fallback data.
- `lib/notifications/`: VAPID Web Push engine (`web-push-engine.ts`), SendGrid/Resend email service, Twilio/Meta WhatsApp service.
- `lib/partners/`: Travel partner database adapter (`partner-db-adapter.ts`), partner authentication, package curation.
- `lib/supabase/`: Supabase client initialization (`client.ts`), token refresh logic, server-side client factory.
- `lib/trips/`: Group expense calculation engine (`group-expense-engine.ts`), trip storage, completion notifier.
- `lib/user/`: High-performance user state store (`user-store.ts`, 77KB) with automatic dual-mode persistence (Supabase DB + local fallback).

### 2.4 `18_DEVELOPMENT/Backend/` — Standalone NestJS 10 Enterprise Microservice
A standalone microservice providing heavy enterprise functionality:
- `src/main.ts`: Enterprise bootstrap with Helmet, origin shielding, body parsing limiters, Swagger OpenAPI documentation.
- `src/app.module.ts`: Root module wiring 45 domain sub-modules.
- `src/prisma/`: Prisma service wrapping 73 database models defined in `prisma/schema.prisma`.
- `src/queue/`: BullMQ queue orchestrator managing background job queues over Redis 7.2.
- `src/providers/`: Third-party supplier integration adapters (Hotelbeds, eTravelSmart buses, IRCTC trains, TBO flights).
- `src/gateway/`: Full BharatGateway payment ledger, merchant management, refund reconciliation, and fraud prevention.
- `src/nexi/`: Nexi AI conversation memory, Gemini LLM connector, prompt engineering, and grounding index.

### 2.5 `supabase/` — Database Migrations & Security Policies
Contains the production-grade PostgreSQL migration scripts:
- `supabase/migrations/20261012000000_travel_partner_ecosystem.sql`: Schema and tables for verified travel partners, packages, and commissions.
- `supabase/migrations/20261022132210_rpc_authorization_remediation.sql`: Hardened remote procedure calls with explicit role checks.
- `supabase/migrations/20261022133800_rpc_strict_service_role_guard.sql`: Guard preventing privilege escalation on internal functions.
- `supabase/migrations/20261028000000_user_data_isolation.sql`: Enterprise multi-tenant Row-Level Security (RLS) enforcement across all traveler tables.
- `supabase/migrations/20261101_contact_enquiries.sql`: Schema for encrypted contact and supplier enquiry forms.

### 2.6 `__tests__/` & `testing/` — Verification & Quality Assurance
- `__tests__/`: 26 automated TypeScript test suites executed via Node.js native test runner (`npx tsx --test`).
- `testing/`: Adversarial AI evaluation suites, Nexi benchmark dataset (200 ground-truth prompts), security load testers.

---

## 3. Important Root Files Catalog

| File | Size | Function & Role |
| :--- | :--- | :--- |
| `middleware.ts` | 3.9 KB | Edge routing, domain canonicalization, security headers, admin & customer edge auth guards. |
| `next.config.mjs` | 4.5 KB | Next.js configuration: image domains, cache control policies, strict Content Security Policy (CSP). |
| `tailwind.config.ts` | 6.6 KB | Design tokens, responsive breakpoints, Indian cultural color palette, touch-target tokens. |
| `package.json` | 1.2 KB | Frontend dependency definitions, build scripts, and test commands. |
| `package-lock.json` | 282 KB | Deterministic dependency tree lockfile. |
| `tsconfig.json` | 0.8 KB | TypeScript strict compilation rules and path alias mappings (`@/*`). |
| `Dockerfile` | 0.5 KB | Alpine-based multi-stage production container build for Next.js. |
| `docker-compose.staging.yml` | 3.4 KB | Hardened local staging PostgreSQL 15.8 and Redis 7.2.5 infrastructure. |
| `APP_PAGES_DIRECTORY.md` | 46 KB | Complete registered catalog of all 157 App Router routes. |


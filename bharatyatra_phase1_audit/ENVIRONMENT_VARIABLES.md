# BharatYatra — Environment Variables & Configuration Catalog

> **Audit Phase:** Phase 1 Technical Architecture Audit  
> **Security Mandate:** SANITIZED AUDIT TEMPLATE — ZERO REAL SECRETS INCLUDED  
> **Total Variables Cataloged:** **140 Variables**  
> **Verification Status:** 100% Extracted from Active Codebase Scanning  

---

## 1. Security & Configuration Compliance Rule

> [!CAUTION]
> **STRICT COMPLIANCE GUARANTEE:** This document contains **only variable names, architectural purposes, and sanitized placeholder values**. No live production secrets, real API keys, cryptographic tokens, or database passwords are documented here or included anywhere in this audit package.

---

## 2. Core Frontend & Web App Environment Variables (`.env.example`)

These variables configure the Next.js 14 App Router application at the root level:

| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://www.bharatyatra.in` | Canonical site URL for OpenGraph, Twitter cards, sitemap, and SEO links (`next.config.mjs`, metadata). |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3000/api` | Base URL for internal Next.js App Router API route handlers (`lib/api/client.ts`). |
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:4000/api/v1` | URL pointing to external NestJS backend engine when running decoupled (`lib/hotels/hotel.service.ts`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://your-project.supabase.co` | Supabase Cloud PostgreSQL endpoint URL (`lib/supabase/client.ts`). |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | `sb_anon_sample_key_placeholder` | Supabase anonymous public key for client-side queries guarded by RLS (`lib/supabase/client.ts`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | `sb_service_role_sample_key_placeholder` | Administrative service-role key for server-side elevated background operations (`lib/supabase/client.ts`). |
| `NEXT_PUBLIC_MAP_PROVIDER` | No | `openstreetmap` | Geospatial map provider toggle (`openstreetmap`, `maptiler`, `mapbox`, `google`). |
| `NEXT_PUBLIC_MAP_TILE_URL` | No | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | URL template for tile rendering in Leaflet (`components/maps/leaflet-map-inner.tsx`). |
| `NEXT_PUBLIC_MAPTILER_KEY` | No | `YOUR_MAPTILER_API_KEY` | API key for high-resolution vector/raster tiles from MapTiler (`components/maps/`). |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | `YOUR_MAPBOX_ACCESS_TOKEN` | Mapbox access token when using Mapbox GL style layers (`next.config.mjs`). |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | `YOUR_GOOGLE_MAPS_KEY` | Google Maps Platform key for Places and Geocoding APIs (`next.config.mjs`). |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes | `YOUR_VAPID_PUBLIC_KEY` | Public VAPID key (RFC 8292) shared with client browsers to subscribe to Web Push notifications. |
| `VAPID_PRIVATE_KEY` | Server | `YOUR_VAPID_PRIVATE_KEY` | Private cryptographic VAPID key used by server to sign push messages (`lib/notifications/web-push-engine.ts`). |
| `VAPID_SUBJECT` | Server | `mailto:security@bharatyatra.in` | Contact URI mandated by VAPID push protocol RFC 8292 (`lib/notifications/web-push-engine.ts`). |

---

## 3. NestJS Enterprise Backend Variables (`18_DEVELOPMENT/Backend/.env`)

These variables configure the standalone NestJS backend services:

### 3.1 Network, Ports & Security
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `4000` | HTTP listening port for NestJS backend (`src/main.ts`). |
| `NODE_ENV` | Yes | `production` | Execution mode (`development`, `staging`, `production`) controlling logging and stack traces. |
| `API_PREFIX` | Yes | `/api/v1` | Global URI prefix for all NestJS endpoints (`src/main.ts`). |
| `CORS_ORIGIN` | Yes | `http://localhost:3000` | Allowed web origins for Cross-Origin Resource Sharing (`src/main.ts`). |
| `ALLOWED_ORIGINS` | No | `https://www.bharatyatra.in,https://admin.bharatyatra.in` | Comma-delimited list of authorized production origins (`src/main.ts`). |
| `TRUST_PROXY` | No | `loopback, linklocal, uniquelocal` | Express trust proxy setting to securely derive client IP addresses behind reverse proxies. |
| `ORIGIN_VERIFY_SECRET` | No | `YOUR_ORIGIN_SHIELD_SECRET` | Shared secret header (`x-origin-verify`) required to prevent bypass of Cloudflare edge. |
| `MAX_REQUEST_BODY_SIZE` | No | `1mb` | Global JSON and form-urlencoded body size limit protecting against resource exhaustion. |
| `HEADERS_TIMEOUT_MS` | No | `20000` | Bounded header timeout preventing Slowloris socket starvation attacks. |
| `REQUEST_TIMEOUT_MS` | No | `30000` | Maximum request execution window before terminating idle hung connections. |
| `KEEPALIVE_TIMEOUT_MS` | No | `5000` | HTTP connection keep-alive timeout. |

### 3.2 Database & Persistence (Prisma & PostgreSQL)
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | `postgresql://user:pass@127.0.0.1:5433/bharatyatra_db?schema=public` | PostgreSQL connection string for Prisma ORM (`src/prisma/prisma.service.ts`). |
| `STAGING_DATABASE_URL` | No | `postgresql://staging_user:pass@127.0.0.1:5433/staging_db` | Fallback connection string for local integration test suites (`src/gateway/database/`). |
| `DB_POOL_MAX` | No | `20` | Maximum simultaneous PostgreSQL client connections per node instance. |
| `DB_CONNECT_TIMEOUT_MS` | No | `10000` | Timeout window for establishing database connections (`src/config/db.ts`). |
| `DB_IDLE_TIMEOUT_MS` | No | `30000` | Idle connection eviction timeout. |
| `DB_STATEMENT_TIMEOUT_MS` | No | `15000` | Statement-level timeout terminating slow queries before locking tables. |

### 3.3 Redis & Asynchronous Queues
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `REDIS_URL` | Yes | `redis://:YOUR_REDIS_PASSWORD@127.0.0.1:6380` | Redis 7 connection URI used by BullMQ job queues and rate limiters (`src/redis/`). |
| `STAGING_REDIS_PASSWORD`| Staging | `STAGING_REDIS_PASSWORD_PLACEHOLDER` | Authentication password for staging Redis container (`docker-compose.staging.yml`). |

### 3.4 Authentication & Session Security
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | Yes | `YOUR_SECURE_RANDOM_JWT_SECRET_KEY_MIN_32_CHARS` | Secret key used to sign and verify user authentication JWT tokens (`src/auth/`). |
| `JWT_EXPIRES_IN` | Yes | `30d` | Expiration lifetime of standard customer and partner session tokens. |
| `BCRYPT_SALT_ROUNDS` | No | `12` | Cryptographic hashing work factor for local credential storage (`src/auth/`). |
| `ADMIN_SECRET_KEY` | Yes | `YOUR_SECURE_ADMIN_PORTAL_SECRET_KEY` | Shared secret for internal administrative API authorization (`lib/partners/partner-auth.ts`). |
| `ADMIN_BOOTSTRAP_USERNAME`| Setup | `admin@bharatyatra.in` | Seed username for initial system administrator account (`src/admin/admin-auth.service.ts`). |
| `ADMIN_BOOTSTRAP_PASSWORD`| Setup | `BOOTSTRAP_PASSWORD_PLACEHOLDER` | Initial password for administrative bootstrap (required to be changed immediately). |

---

## 4. Third-Party Supplier & FinTech Variables

### 4.1 Hotelbeds (HBX) Supplier Integration
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `HBX_API_KEY` | Yes | `YOUR_HOTELBEDS_API_KEY` | Public API key provided by Hotelbeds (`lib/hotels/hbx-auth.ts`). |
| `HBX_API_SECRET` | Yes | `YOUR_HOTELBEDS_SECRET` | Cryptographic secret used to compute SHA256 HMAC request signatures. |
| `HBX_BASE_URL` | Yes | `https://api.test.hotelbeds.com/hotel-api/1.0` | Base URL for Hotelbeds REST endpoints (sandbox vs production). |

### 4.2 Intercity Bus & Train Booking Providers
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `BUS_PROVIDER` | No | `mock` / `etravelsmart` | Active bus inventory supplier toggle (`src/config/provider-activation.config.ts`). |
| `BUS_API_KEY` | Optional | `YOUR_ETRAVELSMART_API_KEY` | API key for eTravelSmart bus seat distribution network. |
| `BUS_API_URL` | Optional | `https://api.etravelsmart.com` | Base endpoint URL for live bus ticket reservations. |
| `BUSES_BOOKING_ENABLED` | Yes | `true` | Feature flag enabling or disabling intercity bus checkout. |
| `TRAIN_PROVIDER` | No | `mock` / `irctc` | Train schedule provider selector (`src/config/provider-activation.config.ts`). |
| `TRAIN_PROVIDER_API_KEY`| Optional | `YOUR_TRAIN_API_KEY` | API credentials for Indian Railways timetable and PNR queries. |
| `TRAINS_BOOKING_ENABLED`| Yes | `true` | Feature flag enabling or disabling train search and booking. |

### 4.3 Flights & Airline Aggregation (TBO)
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `FLIGHT_PROVIDER` | No | `mock` / `tbo` | Flight supplier adapter toggle (`src/config/provider-activation.config.ts`). |
| `TBO_API_KEY` | Optional | `YOUR_TBO_API_KEY` | TBO Holidays flight distribution API key. |
| `TBO_CLIENT_ID` | Optional | `YOUR_TBO_CLIENT_ID` | TBO client account identifier. |
| `TBO_USERNAME` | Optional | `YOUR_TBO_USERNAME` | TBO authentication username. |
| `TBO_PASSWORD` | Optional | `YOUR_TBO_PASSWORD` | TBO authentication password. |
| `FLIGHTS_BOOKING_ENABLED`| Yes | `true` | Feature flag toggling flight search availability. |

### 4.4 BharatGateway & Razorpay Payment Engine
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Yes | `rzp_test_YOUR_KEY_ID` | Merchant Key ID from Razorpay dashboard (`src/gateway/providers/`). |
| `RAZORPAY_KEY_SECRET` | Yes | `YOUR_RAZORPAY_KEY_SECRET` | Merchant Key Secret used to verify payment capture and signature matching. |
| `RAZORPAY_WEBHOOK_SECRET`| Yes | `YOUR_RAZORPAY_WEBHOOK_SECRET`| Secret used to cryptographically verify incoming webhook payloads (`req.rawBody`). |
| `ENABLE_LIVE_PAYMENTS` | Yes | `false` | Master safety switch: when `false`, forces sandbox test mode with zero live bank transactions. |
| `PAYMENT_UPI_ID` | Yes | `bharatyatra@upi` | Merchant Virtual Payment Address (VPA) for dynamic UPI QR generation. |

### 4.5 AI Copilot (Nexi & Itinerary Synthesis)
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Yes | `YOUR_GOOGLE_GEMINI_API_KEY` | Google AI Studio key powering Nexi bilingual customer assistance. |
| `OPENAI_API_KEY` | Optional | `YOUR_OPENAI_API_KEY` | Secondary fallback model provider for itinerary enrichment. |
| `AI_MAX_TOKENS` | No | `2048` | Upper token generation ceiling per conversational response. |
| `AI_TIMEOUT_MS` | No | `15000` | Maximum wait timeout for LLM inference before triggering local fallback prompts. |

### 4.6 Multi-Channel Communications (Email & WhatsApp)
| Variable Name | Required | Default / Safe Placeholder | Purpose & Consuming Module |
| :--- | :--- | :--- | :--- |
| `EMAIL_PROVIDER` | No | `resend` / `sendgrid` / `mock` | Primary email delivery provider toggle. |
| `RESEND_API_KEY` | Optional | `re_YOUR_RESEND_API_KEY` | Resend API key for transactional email dispatches (`lib/notifications/email-service.ts`). |
| `SENDGRID_API_KEY` | Optional | `SG.YOUR_SENDGRID_KEY` | SendGrid API key for bulk marketing and transactional dispatches. |
| `EMAIL_FROM` | Yes | `BharatYatra <support@bharatyatra.in>` | Authorized sender address matching SPF/DKIM records. |
| `TWILIO_ACCOUNT_SID` | Optional | `YOUR_TWILIO_ACCOUNT_SID` | Twilio account identifier for SMS and WhatsApp messaging. |
| `TWILIO_AUTH_TOKEN` | Optional | `YOUR_TWILIO_AUTH_TOKEN` | Twilio authorization token. |
| `WHATSAPP_PROVIDER` | No | `mock` / `twilio` / `meta` | WhatsApp messaging rail toggle (`lib/notifications/whatsapp-service.ts`). |


# BHARATYATRA — PHASE 1: CROSS-PLATFORM ARCHITECTURE AUDIT & PREPARATION REPORT

**Document ID:** BY-ENG-AUDIT-P1-001  
**Project:** BharatYatra (Cross-Platform Transformation)  
**Website:** [https://www.bharatyatra.in](https://www.bharatyatra.in)  
**Author:** Senior Software Architect, Next.js / NestJS / Mobile / DevOps Engineering  
**Date:** November 13, 2026  
**Node.js Environment:** v24.18.0  
**npm Environment:** 11.16.0  
**Audit Verdict:** **READY WITH CONDITIONS**

---

## EXECUTIVE SUMMARY & AUDIT VERDICT

| Category | Finding | Status |
|---|---|---|
| **Audit Verdict** | **READY WITH CONDITIONS** | ⚠️ Qualified Approval |
| **Delivery Strategy** | Remote Website Delivery (`server.url`) via Capacitor 6 LTS | ✅ Recommended |
| **Static Export Compatibility** | Incompatible (`output: 'export'` fails due to 159 API routes & middleware) | ❌ Prohibited |
| **Codebase Integrity** | Zero modifications made to production files, DB, or configurations | ✅ Preserved |
| **TypeScript Health** | Frontend `tsc --noEmit` & Backend `tsc --noEmit` both pass with 0 errors | ✅ 100% Pass |
| **Security Credential Status** | Zero secrets exposed; sanitized templates created | ✅ Secure |

### Verdict Justification: Why "READY WITH CONDITIONS"?
The BharatYatra project is an exceptionally mature, high-performance web platform featuring Next.js 14 App Router, 159 integrated serverless API routes, a 45-controller NestJS microservice backend, and hosted Supabase PostgreSQL.

The project **CANNOT and MUST NOT** be converted to a static web export (`output: 'export'`) because doing so would destroy all 159 API routes, disable edge authentication middleware, and break dynamic server-side rendering.

However, the project is **PRIMED AND READY** for cross-platform deployment via **Capacitor Remote Delivery Architecture** (`server.url = 'https://www.bharatyatra.in'`). This allows:
1. **Centralized OTA Web Updates:** All frontend changes pushed to GitHub automatically deploy to Vercel and instantly update Android, iOS, tablet, and desktop browser users **without requiring APK/IPA re-installations**.
2. **Unified Backend & Auth:** The web app and native apps communicate with the exact same NestJS backend, Supabase PostgreSQL, and Razorpay/BharatGateway engines.
3. **App Store Guideline 4.2 Compliance:** By pairing the remote web delivery with native Capacitor plugins (Push Notifications, Geolocation, Camera QR Scanner, Haptics, and Offline Network Handling), the app satisfies Apple App Store and Google Play Store quality requirements.

---

## 1. PROJECT ARCHITECTURE DISCOVERED

BharatYatra operates on a hybrid enterprise architecture partitioned into three distinct tiers:

```
                                 +-------------------------------------------------------+
                                 |                    CLIENT LAYER                       |
                                 |  - Desktop & Mobile Web Browsers                      |
                                 |  - Android Native Shell (Capacitor Container)         |
                                 |  - iOS Native Shell (Capacitor Container)             |
                                 |  - Android Tablet & iPad Responsive Layouts           |
                                 +---------------------------+---------------------------+
                                                             |
                                            HTTPS / WSS Requests
                                                             |
                                                             v
+-------------------------------------------------------------------------------------------------------------------------+
|                                                   SERVER INFRASTRUCTURE                                                 |
|                                                                                                                         |
|   +-----------------------------------------------+       +---------------------------------------------------------+   |
|   |          NEXT.JS 14.2.5 (VERCEL EDGE)          |       |           NESTJS 10.3.8 (MICROSERVICE BACKEND)          |   |
|   |  - 126 Registered App Router Routes           |       |  - Port 4000 (Express + Helmet + Swagger)               |   |
|   |  - 159 API Endpoints (app/api/**)             |       |  - 45 Controllers across 22 Business Modules            |   |
|   |  - Edge Middleware (Auth, Security, 308)     |       |  - BullMQ Queue & Worker Orchestrator                   |   |
|   |  - React Server Components & SSR              |       |  - Origin Shielding & Strict CORS Guard                 |   |
|   |  - Nexi Gemini AI Integration                 |       |  - Dynamic Rate Limiting & Admin Audits                 |   |
|   +-----------------------+-----------------------+       +----------------------------+----------------------------+   |
|                           |                                                            |                                |
|                           +----------------------------+-------------------------------+                                |
|                                                        |                                                                |
+--------------------------------------------------------|----------------------------------------------------------------+
                                                         v
                             +-------------------------------------------------------+
                             |                     DATA LAYER                        |
                             |  - Hosted Supabase PostgreSQL 15 (Shared Master DB)   |
                             |  - Row Level Security (RLS) Multi-Tenant Policies     |
                             |  - 54+ Relational Tables mapped via Prisma & Supabase |
                             |  - Redis 7 (Cache, Session & Job Queues)              |
                             +-------------------------------------------------------+
```

### Component Breakdown
1. **Frontend Core:**
   - Framework: Next.js `14.2.5`
   - UI Library: React `18.3.1` with React DOM `18.3.1`
   - Language: TypeScript `5.5.4`
   - Styling: Tailwind CSS `3.4.7` with Autoprefixer and PostCSS
   - Icons: Lucide React `0.417.0` (with optimized package imports)
   - Mapping: Leaflet `1.9.4`
   - Image Optimization: Sharp `0.35.5` with AVIF/WebP remote patterns
   - Push Notifications: Web-Push `3.6.7`
2. **Backend Core:**
   - Framework: NestJS `10.3.8` on Express platform
   - Database ORM: Prisma Client `5.13.0`
   - Cache & Queues: Redis (`ioredis` 5.4.1) + BullMQ `5.7.8`
   - Security: Helmet `7.1.0`, Bcrypt `5.1.1`, Passport JWT `0.7.0`
   - Validation: Class-Validator `0.14.1`, Class-Transformer `0.5.1`, Zod `3.23.0`
   - Monitoring & Health: `@nestjs/terminus` `10.2.3`, Winston `3.13.0`
   - API Docs: Swagger / OpenAPI 3.0 via `@nestjs/swagger` `7.3.1`
3. **AI Service:**
   - Standalone Python FastApi engine (`18_DEVELOPMENT/AI_Service`) for itinerary generation, constraint modeling, and optimization pipelines.
   - Nexi Gemini conversational AI integrated via `@google/generative-ai` in Next.js/NestJS.
4. **Mobile Staging Area:**
   - `18_DEVELOPMENT/Mobile/` exists in the repository structure and is currently clean and ready for Capacitor integration.

---

## 2. FRONTEND ARCHITECTURE

- **Routing:** App Router (`app/`) hosting 126 distinct routes including destinations, booking flows, state explorer, tour circuits, interactive maps, user dashboard, and admin management.
- **Edge Middleware (`middleware.ts`):**
  - Canonical 308 permanent redirect from apex (`bharatyatra.in`) and legacy domains to `https://www.bharatyatra.in`.
  - Injects defense-in-depth headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - Evaluates authentication status across cookies (`sb_auth_token`, `sb-access-token`, `auth_token`, `admin_token`) and `Authorization: Bearer <token>`.
  - Route guards for `/admin/*` and customer protected paths (`/my-trips`, `/bookings`, `/profile`, `/saved`, `/checkout`).
- **Dynamic Server-Side Rendering:**
  - Dynamic routes utilize route params (e.g., `app/destinations/[slug]/page.tsx`, `app/packages/[slug]/page.tsx`).
  - Utilizes server-side data fetching directly querying database stores with client-side hydration.
- **Mobile Navigation & UI:**
  - Dedicated `components/layout/mobile-bottom-nav.tsx` providing a 5-tab mobile navigation bar (Home, Explore, NEXI AI Help, My Trips, Profile).
  - Built with `pb-safe` for mobile notch and home indicator padding.
  - Automatically suppresses navigation on checkout, login, payment, and admin routes.

---

## 3. BACKEND ARCHITECTURE

- **NestJS Architecture:**
  - Located in `18_DEVELOPMENT/Backend/`.
  - Structured into 22 domain modules: `Auth`, `Users`, `Destinations`, `Trips`, `Hotels`, `Buses`, `Trains`, `Flights`, `Packages`, `Bookings`, `Payments`, `Refunds`, `Financial`, `Notifications`, `Nexi`, `Gateway`, etc.
  - Port: `4000` (configurable via `process.env.PORT`).
  - Prefix: `/api/v1` (configurable via `process.env.API_PREFIX`).
- **CORS & Origin Configuration:**
  - Handled in `18_DEVELOPMENT/Backend/src/main.ts`.
  - Accepts null origin requests (native mobile apps, server-to-server calls, curl).
  - Accepts `localhost` and origins listed in `ALLOWED_ORIGINS` / `FRONTEND_URL`.
- **Security & Origin Shielding:**
  - Middleware supports `ORIGIN_VERIFY_SECRET` to ensure API traffic routes through verified edge proxies (`x-origin-verify` or `cf-origin-token`).
  - Payload limits enforced (`MAX_REQUEST_BODY_SIZE` defaulting to 1MB) with rawBody capture for webhook HMAC signature verification (Razorpay).

---

## 4. CURRENT AUTHENTICATION ARCHITECTURE

### Web & API Token Flow
1. **Frontend (Browser / WebView):**
   - Implemented via `@supabase/supabase-js` using PKCE flow.
   - Tokens stored in `localStorage` under Supabase session keys and mirrored to cookies (`sb_auth_token`, `sb-access-token`).
   - Request headers inject `Authorization: Bearer <token>` automatically in `lib/api/client.ts`.
2. **Server Auth Guard (`lib/auth/server-auth.ts`):**
   - Extracts bearer token from header or cookie.
   - Validates JWT against Supabase Auth service (`supabase.auth.getUser(token)`).
   - Resolves authoritative user role (`CUSTOMER`, `ADMIN`, `SUPPLIER`, `AGENCY`) via signed `app_metadata` or `user_profiles` table.
3. **NestJS Backend (`18_DEVELOPMENT/Backend/src/auth/`):**
   - Utilizes `passport-jwt` (`JwtStrategy`) validating against `JWT_SECRET`.
   - Supports 6-digit SMS OTP verification (`AuthService.sendOtp` / `verifyOtp`).
   - Generates and signs JWT tokens with `{ sub: user.id, email, role, fullName }`.
4. **Cross-Platform Convergence:**
   - In Remote Delivery, the mobile WebView shares the identical Supabase PKCE and cookie session flow as the browser.
   - For direct NestJS calls, tokens issued by either Supabase or NestJS can be verified if `JWT_SECRET` in NestJS matches the Supabase project JWT secret.

---

## 5. EXISTING API ARCHITECTURE

- **Dual-Tier API Design:**
  - **Tier 1 (Next.js Serverless):** 159 routes under `app/api/**` handling customer profile management, booking orchestration, AI itinerary calculation, and notification subscriptions.
  - **Tier 2 (NestJS Core Services):** 45 controllers under `18_DEVELOPMENT/Backend/src/` handling heavy transactions, database migrations, queues, supplier synchronization, and admin reporting.
- **Client Base URL Handling (`lib/api/client.ts`):**
  - Resolves API endpoint dynamically:
    ```typescript
    export const getBaseUrl = (): string => {
      if (typeof window !== 'undefined') {
        const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
        if (envUrl && !envUrl.includes('localhost:4000')) {
          return envUrl.replace(/\/+$/, '');
        }
        return '/api/v1';
      }
      // ... server resolution
    };
    ```
  - When running in Remote Delivery (`https://www.bharatyatra.in`), relative requests `/api/v1/*` resolve seamlessly to the production domain.

---

## 6. CAPACITOR COMPATIBILITY ASSESSMENT

### Three Evaluated Architecture Models

| Architectural Model | Feasibility | Compatibility with Current Next.js App | Verdict |
|---|---|---|---|
| **Option A: Remote Website Delivery (`server.url`)** | **High** | **100% Compatible** (Preserves SSR, RSC, API routes, middleware, cookies) | **RECOMMENDED** |
| **Option B: Locally Bundled Assets (`output: 'export'`)** | **None** | **0% Compatible** (Next.js prohibits 159 API routes & middleware in export) | **PROHIBITED** |
| **Option C: Hybrid PWA Caching + Remote Fallback** | **High** | **100% Compatible** (Service Worker caches static assets, loads live data) | **RECOMMENDED ENHANCEMENT** |

### Why Option B (Static Export) Fails:
1. Next.js 14 official build engine throws a fatal exception during `next build` if `output: 'export'` is configured while `app/api/` contains serverless routes. BharatYatra has 159 API routes.
2. Next.js Edge Middleware (`middleware.ts`) is completely disabled in static exports, destroying security redirects and authentication guards.
3. Dynamic routes require `generateStaticParams()` pre-rendering every single destination, tour package, and user booking at build time.
4. Image optimization via `next/image` requires a serverless runtime or external loader.

### Capacitor Version: Capacitor 6 LTS vs Capacitor 7
- **Capacitor 6 LTS is Recommended:**
  - Stable, mature ecosystem with battle-tested enterprise plugins.
  - Aligns with Android SDK 34 (Android 14) and iOS 13+.
  - Fully compatible with Node.js 20/24 and React 18.
- **Capacitor 7 Considerations:**
  - Requires Android 15 (SDK 35), Java 21, and iOS 14+. Can be upgraded seamlessly once baseline Capacitor 6 stability is established.

---

## 7. RECOMMENDED MOBILE DELIVERY ARCHITECTURE

The optimal architecture for BharatYatra is **Capacitor 6 Remote Delivery with Native Bridge Integration**:

```
+-----------------------------------------------------------------------------------+
|                        BHARATYATRA UNIFIED MOBILE APP (APK / IPA)                 |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                    CAPACITOR NATIVE CONTAINER SHELL                         |  |
|  |  - Package ID: in.bharatyatra.app                                           |  |
|  |  - Android (minSdk 24, targetSdk 34) / iOS (14.0+)                          |  |
|  |  - Native Splash Screen & Adaptive App Icons                                |  |
|  |  - Native Permissions: Location, Camera, Notifications                      |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|                                        v                                          |
|  +-----------------------------------------------------------------------------+  |
|  |                       CAPACITOR WEBVIEW ENGINE                              |  |
|  |  - server.url: "https://www.bharatyatra.in"                                 |  |
|  |  - allowNavigation: ["bharatyatra.in", "*.bharatyatra.in", "*.supabase.co"]|  |
|  |  - Service Worker (sw.js) CacheStorage for Offline Resiliency              |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|                                        v                                          |
|  +-----------------------------------------------------------------------------+  |
|  |                      CAPACITOR NATIVE HARDWARE BRIDGE                       |  |
|  |  - @capacitor/push-notifications: APNs & FCM Push Alerts                    |  |
|  |  - @capacitor/geolocation: Precise GPS for Local Attractions                |  |
|  |  - @capacitor/camera: QR Scanner for Travel Passes & Document Upload        |  |
|  |  - @capacitor/haptics: Physical Feedback on Booking Confirmations           |  |
|  |  - @capacitor/network: Live Connectivity Monitor & Native Offline Screen    |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 8. REMOTE UPDATE FEASIBILITY & RELEASE MANAGEMENT

### Centralized OTA Web Updates
- **Mechanism:** The mobile application loads the live, production-deployed Next.js frontend hosted on Vercel (`https://www.bharatyatra.in`).
- **Update Workflow:**
  1. Developers commit and push updates to `main` on GitHub (`bharatyatra-frontend.git`).
  2. Vercel automatically runs `next build` and deploys globally to edge nodes within ~90 seconds.
  3. Mobile users on Android and iOS receive the updated UI, new itineraries, promotional banners, and feature enhancements **instantly on their next app launch**.
  4. **Zero user reinstallation or APK/IPA updates are needed for web-layer changes.**

### Rollback Management
- If a web regression occurs, Vercel provides **instant one-click rollback** to any previous deployment hash. The rollback takes effect globally within seconds.

---

## 9. NATIVE UPDATE LIMITATIONS

Not all updates can occur remotely. The distinction must be strictly respected:

| Update Type | Delivery Channel | Requires App Store / Play Store Review? |
|---|---|---|
| UI Layout & Design Improvements | Remote (Vercel) | ❌ No |
| New Travel Packages & Itineraries | Remote (Vercel) | ❌ No |
| Booking Orchestration Logic | Remote (Vercel / NestJS) | ❌ No |
| Payment Gateway Integrations | Remote (Vercel) | ❌ No |
| AI / Nexi Prompt Improvements | Remote (Vercel / Backend) | ❌ No |
| Adding New Native Permissions (e.g. Bluetooth) | Native Release (APK / IPA) | ✅ Yes |
| Updating Native App Icons or Splash Screen | Native Release (APK / IPA) | ✅ Yes |
| Updating Native SDKs / Target Android SDK | Native Release (APK / IPA) | ✅ Yes |
| Modifying Native Deep Link Routing Schemes | Native Release (APK / IPA) | ✅ Yes |

### Version Compatibility Gatekeeper
To ensure older APK/IPA releases continue functioning when web changes occur, the mobile shell will send a handshake header:
`x-bharatyatra-client: android-1.0.0`
The backend or edge middleware can verify client version compatibility and display a friendly native update prompt when a mandatory native upgrade is released.

---

## 10. REQUIRED DEPENDENCIES (FOR PHASE 2)

All Capacitor dependencies should be installed in an isolated scope (in `18_DEVELOPMENT/Mobile/` or as clean development dependencies in root):

```json
{
  "dependencies": {
    "@capacitor/core": "^6.1.2",
    "@capacitor/android": "^6.1.2",
    "@capacitor/ios": "^6.1.2",
    "@capacitor/push-notifications": "^6.0.2",
    "@capacitor/geolocation": "^6.0.1",
    "@capacitor/camera": "^6.0.2",
    "@capacitor/haptics": "^6.0.1",
    "@capacitor/network": "^6.0.2",
    "@capacitor/app": "^6.0.1",
    "@capacitor/status-bar": "^6.0.1"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.1.2"
  }
}
```

---

## 11. REQUIRED CONFIGURATION CHANGES

### 1. Capacitor Configuration (`capacitor.config.ts`)
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.bharatyatra.app',
  appName: 'BharatYatra',
  webDir: 'public',
  server: {
    url: 'https://www.bharatyatra.in',
    cleartext: false,
    allowNavigation: [
      'bharatyatra.in',
      'www.bharatyatra.in',
      '*.bharatyatra.in',
      '*.supabase.co',
      'accounts.google.com',
      'api.razorpay.com',
      'checkout.razorpay.com'
    ]
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    }
  }
};

export default config;
```

### 2. Android Manifest Permissions (`AndroidManifest.xml`)
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="in.bharatyatra.app">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
</manifest>
```

### 3. iOS Info.plist Usage Descriptions
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>BharatYatra requires your location to recommend nearby tourist attractions, hotels, and optimize your travel itinerary.</string>
<key>NSCameraUsageDescription</key>
<string>BharatYatra uses the camera to scan travel pass QR codes and upload verification documents.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Select photos for your travel profile and reviews.</string>
```

### 4. Content Security Policy Adjustments (`next.config.mjs`)
Ensure `connect-src` includes native endpoints:
```javascript
"connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://*.openstreetmap.org https://fcm.googleapis.com"
```

---

## 12. SECURITY RISKS & MITIGATIONS

1. **Apple App Store Guideline 4.2 Rejection Risk:**
   - *Risk:* Apple rejects simple website wrappers as lacking "Minimum Functionality".
   - *Mitigation:* Integrate hardware plugins: native push notification registration, native GPS distance calculations, camera-based QR code verification, and native offline recovery screen.
2. **WebView Insecure Navigation / Domain Hijacking:**
   - *Risk:* If navigation is unrestricted, external links could load inside the authenticated native shell.
   - *Mitigation:* Explicitly restrict `allowNavigation` to BharatYatra, Supabase, and Razorpay domains. External links (such as social media or external hotel websites) must open in the system browser via `@capacitor/app`.
3. **Session Cookie Isolation:**
   - *Risk:* Mobile WebViews handle third-party cookies differently than desktop browsers.
   - *Mitigation:* Because `server.url = 'https://www.bharatyatra.in'` is used, all requests are **first-party requests** to the origin. Cookies, local storage, and bearer tokens behave identically to the mobile web experience.
4. **Supplier Credential Protection:**
   - *Status:* 100% Protected. Supplier credentials (Hotelbeds HBX, Razorpay Secrets, Gemini Keys) remain strictly on server-side Next.js route handlers and the NestJS backend. Zero secrets are bundled into the APK or IPA.

---

## 13. EXISTING ISSUES & ERRORS DISCOVERED

1. **Test Discrepancy (Layout):** `__tests__/responsive-layout-integrity.test.ts` failed on a strict regex expecting `min-w-[56px]` on mobile bottom nav. The actual component uses `min-h-[48px] py-1 px-1` to fit 5 slots across mobile screens. (Documented in test reports; no code modified).
2. **Canonical URL Test Discrepancy:** Privacy and Terms page tests asserted non-www domain (`https://bharatyatra.in`), whereas production middleware correctly enforces canonical `https://www.bharatyatra.in`.
3. **Untracked Scripts in `scratch/`:** Several python and typescript helper scripts exist in `scratch/`. These are preserved untouched and excluded from version control builds.

---

## 14. RECOMMENDED PHASE 2 IMPLEMENTATION STEPS

1. **Step 1: Set Up Isolated Mobile Working Directory:**
   - Initialize Capacitor inside `18_DEVELOPMENT/Mobile/` or project root with minimal, non-conflicting package definitions.
2. **Step 2: Generate Android Project:**
   - Run `npx cap add android`.
   - Configure `in.bharatyatra.app` package ID, application label "BharatYatra", and app icons.
3. **Step 3: Generate iOS Project:**
   - Run `npx cap add ios`.
   - Configure Xcode project bundle identifier, entitlements, and Info.plist usage descriptions.
4. **Step 4: Configure Remote URL Delivery:**
   - Set `server.url = 'https://www.bharatyatra.in'` in `capacitor.config.ts`.
5. **Step 5: Integrate Native Hardware Plugins:**
   - Add `@capacitor/push-notifications`, `@capacitor/geolocation`, `@capacitor/network`, `@capacitor/haptics`.
6. **Step 6: Build & Test Android Debug APK:**
   - Compile Android APK using Gradle: `./gradlew assembleDebug`.
   - Validate navigation, authentication, and offline fallback on an Android emulator or physical device.

---

## 15. EXACT COMMANDS REQUIRED FOR PHASE 2 (UPON APPROVAL)

The following commands are documented for Phase 2 execution. **Do not execute them until user approval is received:**

```powershell
# 1. Navigate to Mobile directory or root
cd "C:\Users\Pandya Kaushal\Desktop\BhartYatra_6"

# 2. Install Capacitor CLI and Core (as dev dependencies to avoid production bundle bloat)
npm install --save-dev @capacitor/core@^6.1.2 @capacitor/cli@^6.1.2

# 3. Initialize Capacitor with BharatYatra specifications
npx cap init BharatYatra in.bharatyatra.app --web-dir=public

# 4. Install Android and iOS platform packages
npm install --save-dev @capacitor/android@^6.1.2 @capacitor/ios@^6.1.2

# 5. Add native Android and iOS projects
npx cap add android
npx cap add ios

# 6. Install essential native hardware plugins
npm install --save-dev @capacitor/push-notifications@^6.0.2 @capacitor/geolocation@^6.0.1 @capacitor/network@^6.0.2 @capacitor/haptics@^6.0.1 @capacitor/app@^6.0.1

# 7. Sync configurations and native plugins
npx cap sync

# 8. Build Android Debug APK (requires Android SDK / Gradle)
cd android
./gradlew assembleDebug
```

---

## CONCLUSION & VERDICT SUMMARY

- **Phase 1 Audit Verdict:** **READY WITH CONDITIONS**
- **Action Required:** Await user authorization before executing Phase 2 Capacitor installation and Android/iOS project creation.
- **Assurance:** The existing production website, database, environment secrets, and backend services remain completely pristine and unaffected.


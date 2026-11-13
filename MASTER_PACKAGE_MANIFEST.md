# BharatYatra — Master Package Manifest & Multi-Part Audit Catalog

> **Project Name:** BharatYatra — Cross-Platform Transformation  
> **Production Domain:** https://www.bharatyatra.in  
> **Target Environment:** Independent Technical Architecture Audit (ChatGPT 512MB Compliant)  
> **Date:** November 13, 2026  
> **Upload Directory:** `Desktop/BharatYatra_Audit_Upload_Parts/`  
> **Compliance Guarantee:** Every individual ZIP archive is strictly below 450 MB  

---

## 1. Executive Summary & Multi-Part Architecture

To satisfy ChatGPT and external security auditor upload constraints (strictly under 512 MB per archive), the complete production codebase of BharatYatra has been divided into **6 logical, self-contained, independent ZIP packages**.

Each archive preserves the exact original relative directory paths and includes an internal `PACKAGE_MANIFEST.md`. When extracted together, the archives deterministically reconstruct the complete unified workspace without path collisions.

---

## 2. Master Archive Catalog & Integrity Matrix

| Part # | Archive Filename | Architectural Tier | File Count | Compressed Size | CRC Integrity | SHA-256 Checksum |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **Part 1** | `BharatYatra_Part1_Frontend.zip` | Frontend Presentation & BFF Tier | **573** | **2.54 MB** | `PASSED (0 CRC Errors)` | `18b6d2114fbdcf276939e5f87eed64ac4024b322e0d882af56d397c01411022a` |
| **Part 2** | `BharatYatra_Part2_Backend.zip` | Backend Domain Services Tier | **823** | **3.15 MB** | `PASSED (0 CRC Errors)` | `a7882890826c2b702db14b825a6063afc2c69c584d1ad516ee1e57a548f2e49e` |
| **Part 3** | `BharatYatra_Part3_Database_Integrations.zip` | Database Schemas & Supplier Integrations | **23** | **0.05 MB** | `PASSED (0 CRC Errors)` | `41893a8a7d478c92291b8a01d60fdb8bb1695f1d638cfe10d7c548cac0f99752` |
| **Part 4** | `BharatYatra_Part4_Documentation_Testing.zip` | Technical Documentation & QA Test Suites | **256** | **0.95 MB** | `PASSED (0 CRC Errors)` | `3d3ef9a0785217341645ca43bb81da68aabb86efc93112f1783e9bff4c76e978` |
| **Part 5** | `BharatYatra_Part5_Static_Assets_Media.zip` | Static Assets — UI Media, Icons & Landmarks | **257** | **78.63 MB** | `PASSED (0 CRC Errors)` | `047eafabee047b969c0bae952a3ed5694218258bd6191c79b6a884ed4e2e6466` |
| **Part 6** | `BharatYatra_Part6_Static_Assets_State_Images.zip` | Static Assets — Indian State Tourism Photography | **1,226** | **356.75 MB** | `PASSED (0 CRC Errors)` | `36d4d6ac93f88d7d3b26a052452b672ead023f9af680798edfcb3e38718c3791` |

---

## 3. Logical Division Breakdown

### Part 1: `BharatYatra_Part1_Frontend.zip` (Frontend Presentation & BFF)
- **Scope:** Complete Next.js 14 App Router presentation tier.
- **Key Modules:**
  - `app/`: 157 registered pages + 159 serverless API route handlers.
  - `components/`: 87 reusable React UI components, interactive modals, Leaflet map wrappers.
  - `lib/`: 96 TypeScript business services (34 AI planner modules, BharatGateway SDK, Hotelbeds adapter).
  - `data/`: 26 static geographic and cultural datasets.
  - `styles/` & `types/`: Global Tailwind directives and TypeScript ambient declarations.
  - Root configuration files: `package.json`, `package-lock.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `middleware.ts`, `Dockerfile`, `vercel.json`, `.env.example`.

### Part 2: `BharatYatra_Part2_Backend.zip` (Backend Domain Services)
- **Scope:** Standalone NestJS 10 enterprise microservices engine.
- **Key Modules:**
  - `18_DEVELOPMENT/Backend/src/`: 45 domain modules (bookings, payments, hotels, buses, trains, nexi, queues).
  - `18_DEVELOPMENT/Backend/prisma/`: 73 relational database models in `schema.prisma`.
  - Backend configuration: `package.json`, `package-lock.json`, `nest-cli.json`, `tsconfig.json`, `Dockerfile`, `.env.example`.
  - Monorepo workspaces: `Admin/`, `AI_Service/`, `Mobile/`, `Shared/`, `Supplier_Portal/`, `Frontend/`.

### Part 3: `BharatYatra_Part3_Database_Integrations.zip` (Database & Integrations)
- **Scope:** Database schemas, staging Docker infrastructure, and supplier specifications.
- **Key Modules:**
  - `supabase/`: 6 production PostgreSQL migration suites (`supabase/migrations/`), RLS security policies.
  - `docker-compose.staging.yml` & `docker-compose.gateway.yml`: Hardened PostgreSQL 15.8 and Redis 7.2.5 local staging stacks.
  - `AI_Service/`: AI service runtime models.
  - Supplier & domain specifications: `06_API/`, `07_AI/`, `08_TRAVEL_DATA/`, `09_BOOKING/`, `10_PACKAGES/`, `11_PAYMENTS_FINANCE/`, `14_SUPPLIER_PORTAL/`, `15_INTEGRATIONS/`.

### Part 4: `BharatYatra_Part4_Documentation_Testing.zip` (Documentation & QA Testing)
- **Scope:** Complete architectural documentation, test automation suites, and PRDs.
- **Key Modules:**
  - `documentation/` and `bharatyatra_phase1_audit/`: All 12 Phase 1 audit reports.
  - `__tests__/`: 26 automated TypeScript test suites.
  - `testing/`: Adversarial AI evaluation harness, Nexi 200-question benchmark dataset, security load testers.
  - `security-audit/`: Security audit reports and penetration logs.
  - `scripts/`: Page directory catalog and Smart QR automation scripts.
  - Enterprise PRD & architecture specifications: `00_PROJECT_MANAGEMENT` through `25_RELEASES`.
  - Root documentation: `APP_PAGES_DIRECTORY.*`, `BHARATYATRA_*.md`, `BHARATGATEWAY_*.md`, `NEXI_*.md`.

### Part 5: `BharatYatra_Part5_Static_Assets_Media.zip` (Core UI Media & Landmarks)
- **Scope:** Branding assets, sound effects, landmark photography, and vector icons.
- **Key Modules:**
  - `public/landmarks/` & `public/places/`: High-resolution heritage monuments and tourist attractions.
  - `public/icons/`, `public/images/`, `public/sound/`: UI sound effects, PWA manifests, Ashoka Chakra vector icons.
  - `Chalo_Farva_Images/`: Brand identity and festival visual assets.

### Part 6: `BharatYatra_Part6_Static_Assets_State_Images.zip` (State Tourism Photography)
- **Scope:** High-resolution destination photography across all Indian States and Union Territories.
- **Key Modules:**
  - `public/state-images/`: Curated imagery for Gujarat, Rajasthan, Kerala, Himachal Pradesh, Kashmir, Uttar Pradesh, and all remaining regions.

---

## 4. Reassembly & Extraction Instructions

To reconstruct the full unified repository for audit or execution:
1. Download all 6 ZIP archives into a single working directory:
   ```bash
   mkdir BharatYatra_Complete_Audit_Source
   cd BharatYatra_Complete_Audit_Source
   ```
2. Unzip all 6 archives into this folder:
   ```bash
   # Linux / macOS / Git Bash
   unzip -o ../BharatYatra_Part1_Frontend.zip
   unzip -o ../BharatYatra_Part2_Backend.zip
   unzip -o ../BharatYatra_Part3_Database_Integrations.zip
   unzip -o ../BharatYatra_Part4_Documentation_Testing.zip
   unzip -o ../BharatYatra_Part5_Static_Assets_Media.zip
   unzip -o ../BharatYatra_Part6_Static_Assets_State_Images.zip

   # Windows PowerShell
   Expand-Archive -Path ..\BharatYatra_Part1_Frontend.zip -DestinationPath . -Force
   Expand-Archive -Path ..\BharatYatra_Part2_Backend.zip -DestinationPath . -Force
   Expand-Archive -Path ..\BharatYatra_Part3_Database_Integrations.zip -DestinationPath . -Force
   Expand-Archive -Path ..\BharatYatra_Part4_Documentation_Testing.zip -DestinationPath . -Force
   Expand-Archive -Path ..\BharatYatra_Part5_Static_Assets_Media.zip -DestinationPath . -Force
   Expand-Archive -Path ..\BharatYatra_Part6_Static_Assets_State_Images.zip -DestinationPath . -Force
   ```
3. Run `npm ci` in root and `18_DEVELOPMENT/Backend` to deterministically install clean dependencies.

---

## 5. Security & Quarantine Audit Sign-Off
- **Total Excluded Directories:** `node_modules/`, `.git/`, `.next/`, `dist/`, `build/`, `out/`, `coverage/`, `.pytest_cache/`, `__pycache__/`, `scratch/`.
- **Total Real Secrets Packaged:** **0 (ZERO)**. All environment files are sanitized `.env.example` templates.
- **CRC Validation:** **100% Passed across all 6 archives.**

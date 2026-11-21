# BharatYatra — Generative Engine Optimization (GEO) & Technical SEO Audit Report

**Platform:** BharatYatra (`https://www.bharatyatra.in`)  
**Audit Date:** 20 November 2026  
**Auditor:** Senior Technical SEO Engineer, Generative Engine Optimization (GEO) Specialist & Next.js Architect  
**Evaluation Scope:** Framework Architecture, Robots Configuration, XML Sitemap, Metadata, Structured Data, SSR/SSG Rendering, Indexability, and LLM/AI Search Bot Accessibility.

---

## 1. Framework & Routing Architecture

- **Framework:** Next.js 14.2.5 with React 18.3.1.
- **Routing Engine:** Next.js App Router (`app/` directory).
- **Rendering Modes:**
  - Dynamic SSR with React Server Components (`app/layout.tsx`, `app/(customer)/destinations/[id]/page.tsx`, `app/(customer)/states/[slug]/page.tsx`).
  - SSG with `generateStaticParams` (`/packages/[slug]`, `/circuits/[id]`, `/states/[slug]`).
  - Client-side interactive islands (`'use client'`) for trip generation, search filtering, and booking wizards.
- **Domain & Canonical Baseline:** Primary canonical domain is `https://www.bharatyatra.in` with apex `https://bharatyatra.in` redirecting via HTTP 308 permanent redirect.

---

## 2. Existing SEO & Crawler Configuration Audit

### 2.1 Robots Configuration (`app/robots.ts`)
- **Current State:**
  ```typescript
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/supplier/', '/api/', '/my-trips/'],
    }
  ]
  ```
- **Deficiencies:**
  1. No explicit crawler rules for **OAI-SearchBot** (OpenAI's ChatGPT Search crawler), which operates under its own user agent distinct from GPTBot.
  2. No explicit crawler rules for **Googlebot**, **Bingbot**, or **PerplexityBot**.
  3. Insufficient protection of private / authenticated user paths: missing disallows for `/bharatyatra-ops/`, `/cart/`, `/checkout/`, `/auth/`, `/dashboard/`, `/profile/`, `/expenses/`, and `/saved/`.
  4. Missing `host` directive.

### 2.2 XML Sitemap (`app/sitemap.ts`)
- **Current State:**
  - Hardcoded list of 24 Gujarat destinations and 14 main pages (Total: 38 URLs).
- **Critical Deficiencies:**
  1. **Missing 36 States & Union Territories:** None of the `/states/${slug}` pages (e.g. `/states/kashmir`, `/states/kerala`, `/states/rajasthan`, `/states/gujarat`) are indexed in the sitemap.
  2. **Missing Curated Packages:** None of the `/packages/${slug}` pages (from `ALL_INDIA_PACKAGES`) are present in the sitemap.
  3. **Missing Cultural Circuits:** `/circuits` and `/circuits/[id]` are absent.
  4. **Missing Authoritative Topic Pages:** `/faq`, `/about`, `/contact`, `/help`, `/booking-policy`, `/cancellation-policy`, and `/refund-policy` are omitted from the sitemap.
  5. The sitemap covers less than 25% of the genuine public indexable content on the platform.

### 2.3 Metadata & Canonical URLs
- **Root Layout (`app/layout.tsx`):**
  - Defines `metadataBase: new URL('https://www.bharatyatra.in')`.
  - Comprehensive Open Graph, Twitter card, icon, and viewport definitions.
- **Page-Level Coverage:**
  - Server components (`/destinations`, `/destinations/[id]`, `/states/[slug]`, `/packages`, `/about`, policy pages) export custom `Metadata`.
  - Several high-value public pages marked `'use client'` (`/plan`, `/circuits`, `/faq`, `/contact`, `/states`, `/stays`, `/buses`, `/trains`, `/flights`) lack page-specific `Metadata` exports, defaulting to the generic homepage metadata.
  - Missing package-specific metadata in `app/(customer)/packages/[slug]/page.tsx`.
  - Missing circuit-specific metadata in `app/(customer)/circuits/[id]/page.tsx`.

### 2.4 Structured Data (Schema.org JSON-LD)
- **Implemented:**
  - `WebSite` with `SearchAction` in [app/layout.tsx](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/app/layout.tsx).
  - `Organization` in [app/layout.tsx](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/app/layout.tsx).
  - `TouristAttraction` in [app/(customer)/destinations/[id]/page.tsx](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/app/(customer)/destinations/[id]/page.tsx).
  - `TouristDestination` in [app/(customer)/states/[slug]/page.tsx](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_6/app/(customer)/states/[slug]/page.tsx).
- **Missing / Under-Optimized:**
  1. **`FAQPage` Schema:** Missing on `/faq`, preventing Google, Perplexity, and ChatGPT Search from extracting direct Q&A rich snippets and citations.
  2. **`TouristTrip` / `Product` Schema:** Missing on tour packages (`/packages/[slug]`) and circuits (`/circuits/[id]`).
  3. **`BreadcrumbList` Schema:** Missing on nested destination and state pages.
  4. **`SoftwareApplication` Schema:** Missing on the flagship `/plan` AI trip planning engine.
  5. **`ContactPage` Schema:** Missing on `/contact`.
  6. **`AboutPage` Schema:** Missing on `/about`.

---

## 3. Generative Engine Optimization (GEO) Readiness

| Search / AI Engine | Indexing / Discovery Mechanism | Current Status on BharatYatra | Gap / Improvement Required |
| :--- | :--- | :--- | :--- |
| **ChatGPT Search** | `OAI-SearchBot` crawler + Schema.org | Basic generic user-agent rule | Explicit `OAI-SearchBot` allow rule, expanded sitemap, and FAQ/Product schema. |
| **Google Search & AI Overviews** | `Googlebot` + Knowledge Graph | Basic metadata | Add `BreadcrumbList`, `FAQPage`, and entity semantic markup for landmark dossiers. |
| **Perplexity AI** | `PerplexityBot` + real-time citation | Fallback to `*` rule | Explicit bot allowance, direct authoritative answer blocks, and structured comparison data. |
| **Gemini** | Google index + Structured Schema | Good baseline | Strengthen entity definitions, state tourism directories, and landmark coordinates. |
| **Bing & Copilot** | `Bingbot` + IndexNow | Generic crawler rule | Add explicit `Bingbot` rule and complete canonical/sitemap paths. |

---

## 4. Prioritized Action Plan

1. **Crawler Accessibility:** Upgrade `app/robots.ts` with dedicated rules for `Googlebot`, `Bingbot`, `OAI-SearchBot`, and `PerplexityBot`, while maintaining strict privacy disallows for internal/auth/admin routes.
2. **Dynamic XML Sitemap:** Upgrade `app/sitemap.ts` to dynamically pull all 36 States, all landmark destinations, packages, circuits, and informational pages.
3. **Structured Data:** Implement `FAQPage`, `TouristTrip`, `SoftwareApplication`, `BreadcrumbList`, `ContactPage`, and `AboutPage` JSON-LD schemas.
4. **Metadata Hardening:** Add server layout wrappers or page metadata for `/faq`, `/contact`, `/circuits`, `/circuits/[id]`, `/packages/[slug]`, `/plan`, and `/states`.
5. **Brand Identity & GEO Authority:** Ensure clear, factual, ground-verified information with direct answers to traveler questions.
6. **Validation:** Run TypeScript type checks, tests, and build verification.

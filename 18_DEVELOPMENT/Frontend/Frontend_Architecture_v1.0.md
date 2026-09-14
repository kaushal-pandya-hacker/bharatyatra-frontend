# CHALO FARVA — FRONTEND ARCHITECTURE SPECIFICATION v1.0

**Version:** v1.0.0  
**Date:** September 13, 2026  
**Status:** Approved Master Baseline  

---

## 1. Architectural Principles

1. **Server Components First**: Public marketing pages, destination discovery, and SEO landing pages utilize Next.js React Server Components (RSC) for zero-JS client bundle overhead.
2. **Client Components Scoped**: Interactive components (`AIPlannerWizard`, `BusSeatGrid`, `AdaptiveAlertBanner`, `Modal`) use `'use client'` directive explicitly.
3. **Type Safety & DTO Synchronization**: All frontend data types in `types/` strictly match the PostgreSQL DDL schema (`05_DATABASE/`) and OpenAPI specifications (`06_API/`).
4. **Transparent Provenance Labels**: Interfaces incorporate explicit badges (`[Verified Data]`, `[Live Provider Availability]`, `[AI Recommendation]`) on travel cards.

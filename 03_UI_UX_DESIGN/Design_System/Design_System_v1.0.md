# CHALO FARVA — UI/UX DESIGN SYSTEM SPECIFICATION v1.0
> **"Plan less. Coordinate less. Enjoy more."**

**Document Version:** v1.0.0  
**Date:** September 13, 2026  
**Status:** Approved Baseline  
**Role:** Senior Product Designer & Design System Architect  

---

## 1. Executive Design Vision

**Chalo Farva** is a modern, Gujarat-first, AI-powered travel platform. The UI/UX design system provides a premium, low-stress, highly accessible user experience engineered around the **TRIP** lifecycle ($DISCOVER \rightarrow PLAN \rightarrow BOOK \rightarrow ORGANIZE \rightarrow TRAVEL \rightarrow MONITOR \rightarrow ADAPT \rightarrow ENJOY$).

### Core Design Pillars
1. **Low-Stress Travel Planning**: Intuitive step-by-step AI wizard reduces cognitive overload.
2. **Transparent Data Provenance**: Explicit UI labeling clearly distinguishes `[Verified Data]`, `[Live Provider Availability]`, and `[AI Recommendation]`.
3. **Adaptive Alerting System**: Non-intrusive banner notifications for real-world changes (weather alerts, bus delays, road closures) with one-click itinerary adaptation.
4. **Inclusive & Accessible**: Built for Indian market diversity (English, Gujarati, Hindi), adhering strictly to WCAG 2.1 AA standards.

---

## 2. Master Token Summary

| Category | Token Prefix | Values / Scale |
| :--- | :--- | :--- |
| **Colors** | `--color-*` | Primary Orange (`#FF6B35`), Teal (`#008080`), Navy (`#0A192F`), Sand (`#F4F1EA`) |
| **Typography** | `--font-*` | Headings (`Outfit`), Body (`Inter`), Gujarati (`Noto Sans Gujarati`) |
| **Spacing** | `--spacing-*` | 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px |
| **Border Radius** | `--radius-*` | sm (4px), md (8px), lg (16px), full (9999px) |
| **Elevation** | `--shadow-*` | sm, md, lg, glass (glassmorphism overlay) |
| **Breakpoints** | `--screen-*` | sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px) |

---

## 3. Directory Layout

```text
03_UI_UX_DESIGN/
├── Design_System/       (Tokens, Color, Typography, Spacing, Motion, Accessibility)
├── User_Flows/          (Customer, Booking, AI Planner, Adaptive AI, Admin, Supplier)
├── Wireframes/          (Customer, Admin, Supplier Wireframe Layout Specs)
├── Website/             (Sitemap, Page Specs, Navigation, Responsive Rules)
├── Admin_Panel/         (Admin Sitemap & Screen Specs)
├── Supplier_Portal/     (Supplier Sitemap & Screen Specs)
├── Components/          (Forms, Cards, Tables, Modals, Booking & AI Components)
└── Prototypes/          (Interactive Prototype Contract)
```

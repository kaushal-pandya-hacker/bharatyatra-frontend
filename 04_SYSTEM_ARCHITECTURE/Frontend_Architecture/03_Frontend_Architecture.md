# Frontend Architecture Specification — Chalo Farva

## 1. Core Stack
- **Framework**: Next.js 14 App Router
- **Language**: TypeScript 5.4+ (Strict Mode)
- **Styling**: Vanilla CSS + Tailwind CSS (Brand Design System: Orange `#FF6B35`, Teal `#008080`, Navy `#0A192F`)
- **Icons**: Lucide React
- **State Management**: React Server Components (RSC) for public SEO, React Hooks & Context for client interactivity.

## 2. Layout Structure & Route Groups
- `(marketing)`: Public discovery, landing page, destination pages.
- `(auth)`: Login & Registration.
- `(customer)`: AI Planner wizard, Trip itinerary timeline, Checkout.
- `admin`: Operational dashboard.
- `supplier`: Vendor inventory portal.

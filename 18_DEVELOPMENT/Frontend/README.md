# CHALO FARVA — FRONTEND APPLICATION FOUNDATION
> **Next.js 14 (App Router) + TypeScript + Tailwind CSS Production Application**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20.x
- npm / yarn / pnpm

### Setup Instructions
1. Copy `.env.example` to `.env.local`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access app at `http://localhost:3000`

---

## 🏗️ Architecture Overview
- **Framework**: Next.js 14 with App Router (`/app`)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS extended with Chalo Farva Design Tokens
- **Icons**: Lucide React
- **API Client**: Centralized type-safe fetch wrapper in `lib/api/client.ts`
- **Design Tokens**: `brand-primary` (`#FF6B35`), `brand-secondary` (`#008080`), `brand-dark` (`#0A192F`), `brand-light` (`#F4F1EA`)

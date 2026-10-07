# BharatYatra Frontend

Production-ready Next.js 14 frontend for the BharatYatra travel platform.

---

## 🚀 Deployment (GitHub → Vercel)

This folder is self-contained and ready to deploy to Vercel directly via GitHub integration.

### Required Production Environment Variables

Configure these variables in your **Vercel Project Settings → Environment Variables**:

| Variable Name | Purpose | Example / Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | NestJS Backend API Endpoint | `https://api.bharatyatra.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Frontend Application URL | `https://bharatyatra.com` |
| `NEXT_PUBLIC_MAP_TILE_URL` | MapTile URL template | `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Anon Key | `your_supabase_anon_key` |
| `NEXT_PUBLIC_MAP_PROVIDER` | Map Provider Name | `maptiler` |
| `NEXT_PUBLIC_MAPTILER_KEY` | MapTiler API Key | `your_maptiler_api_key` |

> **Note**: Production secret values must be configured directly in Vercel Environment Variables. Do NOT commit private credentials or `.env` files into source control.

---

## 💻 Local Development

1. Copy `.env.example` to `.env.local`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Open `http://localhost:3000`

---

## 🏗️ Architecture & Stack
- **Framework**: Next.js 14 App Router
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Multi-device token session state with NestJS backend

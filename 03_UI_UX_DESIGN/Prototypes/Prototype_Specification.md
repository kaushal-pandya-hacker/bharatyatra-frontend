# PROTOTYPE SPECIFICATION & IMPLEMENTATION CONTRACT — CHALO FARVA

**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Interactive Prototype States

This specification establishes the exact visual and state contracts required for frontend developers implementing Chalo Farva UI components.

| Component / Screen | Default State | Interactive Hover / Active State | Loading State | Error / Unavailable State |
| :--- | :--- | :--- | :--- | :--- |
| **Primary CTA Button** | Orange `#FF6B35` | Hover `#E05522`, Scale `1.02x` | Spinner + Disabled | Disabled `#94A3B8` |
| **Destination Card** | White Surface, Glass Shadow | Elevation `--shadow-lg`, Translate Y `-4px` | Skeleton Image Box | "Data Unavailable" Placeholder |
| **AI Adaptation Banner** | Sticky Top Bar | Click opens Proposal Modal | Pulse Loading Bar | Dismissed State |
| **Bus Seat Pill** | White Fill, Teal Border | Click toggles Orange Selected | Skeleton Seat Grid | Locked / Booked Gray Fill |

---

## 2. API Contract Mapping

- **AI Planner Submit**: `POST /api/v1/ai/trips/generate` $\rightarrow$ Render Skeleton Loader $\rightarrow$ Redirect to `/trips/{id}`.
- **Adaptive AI Proposal Accept**: `POST /api/v1/adaptive-ai/proposals/{id}/decide` $\rightarrow$ Close Modal $\rightarrow$ Update Itinerary Timeline to Version 2.
- **Booking Payment Confirm**: `POST /api/v1/payments` $\rightarrow$ Verify Gateway Callback $\rightarrow$ Display Confirmed Ticket Voucher Screen.

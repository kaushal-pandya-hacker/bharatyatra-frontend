# BharatYatra — Complete API Inventory & Interface Catalog

> **Audit Phase:** Phase 1 Technical Architecture Audit  
> **Total Next.js App Router API Routes:** **159 Endpoints**  
> **NestJS Enterprise Backend Endpoints:** **45 Domain Controllers**  
> **Verification Status:** 100% Extracted from Active Codebase  

---

## 1. Authentication & Security Classification Matrix

| Classification | Header / Cookie Requirement | Enforcing Mechanism | Example Routes |
| :--- | :--- | :--- | :--- |
| **Public** | None | Open | /api/v1/health, /api/v1/states, /api/campaigns/diwali |
| **Traveler Authenticated** | Authorization: Bearer <JWT> or sb_auth_token | server-auth.ts / Supabase RLS | /api/v1/me/profile, /api/v1/trips, /api/notifications |
| **Admin Protected** | x-admin-token, dmin_token, or service_role | middleware.ts + dmin-store.ts | /api/v1/admin/*, /api/admin/* |
| **Travel Partner** | x-partner-token or Partner Session | partner-auth.ts | /api/v1/partner/*, /api/v1/travel-partners/* |
| **Payment Webhook** | x-razorpay-signature or x-gateway-signature | Cryptographic HMAC SHA256 (
eq.rawBody) | /api/v1/gateway/webhooks |

---

## 2. Complete Next.js 14 API Endpoints (159 Routes)

| Endpoint Route | HTTP Methods | Auth Classification | File Path |
| :--- | :--- | :--- | :--- |
| /api/admin/onboarding-analytics | GET | Admin | [app/api/admin/onboarding-analytics/route.ts](app/api/admin/onboarding-analytics/route.ts) |
| /api/admin/reviews | GET | Admin | [app/api/admin/reviews/route.ts](app/api/admin/reviews/route.ts) |
| /api/admin/reviews/[id]/reply | POST | Admin | [app/api/admin/reviews/[id]/reply/route.ts](app/api/admin/reviews/[id]/reply/route.ts) |
| /api/ai/itinerary/generate | POST | Traveler Auth | [app/api/ai/itinerary/generate/route.ts](app/api/ai/itinerary/generate/route.ts) |
| /api/ai/itinerary/recalculate | POST | Traveler Auth | [app/api/ai/itinerary/recalculate/route.ts](app/api/ai/itinerary/recalculate/route.ts) |
| /api/ai/trip-duration/recommend | GET, POST | Traveler Auth | [app/api/ai/trip-duration/recommend/route.ts](app/api/ai/trip-duration/recommend/route.ts) |
| /api/ai/trip-duration/validate | POST | Traveler Auth | [app/api/ai/trip-duration/validate/route.ts](app/api/ai/trip-duration/validate/route.ts) |
| /api/booking/availability | ALL | Traveler Auth | [app/api/booking/availability/route.ts](app/api/booking/availability/route.ts) |
| /api/booking/cancel | ALL | Traveler Auth | [app/api/booking/cancel/route.ts](app/api/booking/cancel/route.ts) |
| /api/booking/orchestrate | ALL | Traveler Auth | [app/api/booking/orchestrate/route.ts](app/api/booking/orchestrate/route.ts) |
| /api/campaigns/diwali | GET | Public | [app/api/campaigns/diwali/route.ts](app/api/campaigns/diwali/route.ts) |
| /api/destinations/intelligence | GET | Public | [app/api/destinations/intelligence/route.ts](app/api/destinations/intelligence/route.ts) |
| /api/notifications | GET | Traveler Auth | [app/api/notifications/route.ts](app/api/notifications/route.ts) |
| /api/notifications/[id] | DELETE | Traveler Auth | [app/api/notifications/[id]/route.ts](app/api/notifications/[id]/route.ts) |
| /api/notifications/[id]/read | PATCH | Traveler Auth | [app/api/notifications/[id]/read/route.ts](app/api/notifications/[id]/read/route.ts) |
| /api/notifications/clear-all | POST, DELETE | Traveler Auth | [app/api/notifications/clear-all/route.ts](app/api/notifications/clear-all/route.ts) |
| /api/notifications/preferences | GET, PATCH | Traveler Auth | [app/api/notifications/preferences/route.ts](app/api/notifications/preferences/route.ts) |
| /api/notifications/push/devices | GET | Traveler Auth | [app/api/notifications/push/devices/route.ts](app/api/notifications/push/devices/route.ts) |
| /api/notifications/push/devices/[id] | DELETE | Traveler Auth | [app/api/notifications/push/devices/[id]/route.ts](app/api/notifications/push/devices/[id]/route.ts) |
| /api/notifications/push/subscribe | POST, DELETE | Traveler Auth | [app/api/notifications/push/subscribe/route.ts](app/api/notifications/push/subscribe/route.ts) |
| /api/notifications/push/test | POST | Traveler Auth | [app/api/notifications/push/test/route.ts](app/api/notifications/push/test/route.ts) |
| /api/notifications/push/vapid-public-key | GET | Traveler Auth | [app/api/notifications/push/vapid-public-key/route.ts](app/api/notifications/push/vapid-public-key/route.ts) |
| /api/notifications/read-all | POST, PATCH | Traveler Auth | [app/api/notifications/read-all/route.ts](app/api/notifications/read-all/route.ts) |
| /api/notifications/subscribe | POST, DELETE | Traveler Auth | [app/api/notifications/subscribe/route.ts](app/api/notifications/subscribe/route.ts) |
| /api/notifications/test-push | POST | Traveler Auth | [app/api/notifications/test-push/route.ts](app/api/notifications/test-push/route.ts) |
| /api/notifications/unsubscribe | POST | Traveler Auth | [app/api/notifications/unsubscribe/route.ts](app/api/notifications/unsubscribe/route.ts) |
| /api/reviews | GET | Traveler Auth | [app/api/reviews/route.ts](app/api/reviews/route.ts) |
| /api/trips/customize-duration | GET, POST | Traveler Auth | [app/api/trips/customize-duration/route.ts](app/api/trips/customize-duration/route.ts) |
| /api/trips/duration | ALL | Traveler Auth | [app/api/trips/duration/route.ts](app/api/trips/duration/route.ts) |
| /api/trips/generate-itinerary | GET, POST | Traveler Auth | [app/api/trips/generate-itinerary/route.ts](app/api/trips/generate-itinerary/route.ts) |
| /api/trips/geography | ALL | Traveler Auth | [app/api/trips/geography/route.ts](app/api/trips/geography/route.ts) |
| /api/trips/itinerary | ALL | Traveler Auth | [app/api/trips/itinerary/route.ts](app/api/trips/itinerary/route.ts) |
| /api/trips/plan | ALL | Traveler Auth | [app/api/trips/plan/route.ts](app/api/trips/plan/route.ts) |
| /api/trips/preferences | GET, POST | Traveler Auth | [app/api/trips/preferences/route.ts](app/api/trips/preferences/route.ts) |
| /api/trips/pricing | ALL | Traveler Auth | [app/api/trips/pricing/route.ts](app/api/trips/pricing/route.ts) |
| /api/trips/pricing/calibration | ALL | Traveler Auth | [app/api/trips/pricing/calibration/route.ts](app/api/trips/pricing/calibration/route.ts) |
| /api/trips/recommend-duration | GET, POST | Traveler Auth | [app/api/trips/recommend-duration/route.ts](app/api/trips/recommend-duration/route.ts) |
| /api/trips/recommendations | ALL | Traveler Auth | [app/api/trips/recommendations/route.ts](app/api/trips/recommendations/route.ts) |
| /api/trips/recommendations/feedback | ALL | Traveler Auth | [app/api/trips/recommendations/feedback/route.ts](app/api/trips/recommendations/feedback/route.ts) |
| /api/trips/routes | ALL | Traveler Auth | [app/api/trips/routes/route.ts](app/api/trips/routes/route.ts) |
| /api/user/onboarding/skip | POST | Traveler Auth | [app/api/user/onboarding/skip/route.ts](app/api/user/onboarding/skip/route.ts) |
| /api/user/reviews | GET, POST | Traveler Auth | [app/api/user/reviews/route.ts](app/api/user/reviews/route.ts) |
| /api/user/reviews/[id] | PUT | Traveler Auth | [app/api/user/reviews/[id]/route.ts](app/api/user/reviews/[id]/route.ts) |
| /api/user/travel-profile | GET, POST, PUT | Traveler Auth | [app/api/user/travel-profile/route.ts](app/api/user/travel-profile/route.ts) |
| /api/user/trips/completion | POST | Traveler Auth | [app/api/user/trips/completion/route.ts](app/api/user/trips/completion/route.ts) |
| /api/v1/admin/ai-planner | GET, PATCH | Admin | [app/api/v1/admin/ai-planner/route.ts](app/api/v1/admin/ai-planner/route.ts) |
| /api/v1/admin/audit-logs | GET | Admin | [app/api/v1/admin/audit-logs/route.ts](app/api/v1/admin/audit-logs/route.ts) |
| /api/v1/admin/bookings | GET | Admin | [app/api/v1/admin/bookings/route.ts](app/api/v1/admin/bookings/route.ts) |
| /api/v1/admin/bookings/[id] | GET, PATCH | Admin | [app/api/v1/admin/bookings/[id]/route.ts](app/api/v1/admin/bookings/[id]/route.ts) |
| /api/v1/admin/campaigns/diwali | GET, PATCH | Admin | [app/api/v1/admin/campaigns/diwali/route.ts](app/api/v1/admin/campaigns/diwali/route.ts) |
| /api/v1/admin/campaigns/diwali/toggle | POST | Admin | [app/api/v1/admin/campaigns/diwali/toggle/route.ts](app/api/v1/admin/campaigns/diwali/toggle/route.ts) |
| /api/v1/admin/cms | GET, PATCH | Admin | [app/api/v1/admin/cms/route.ts](app/api/v1/admin/cms/route.ts) |
| /api/v1/admin/dashboard | GET | Admin | [app/api/v1/admin/dashboard/route.ts](app/api/v1/admin/dashboard/route.ts) |
| /api/v1/admin/destinations | GET, POST | Admin | [app/api/v1/admin/destinations/route.ts](app/api/v1/admin/destinations/route.ts) |
| /api/v1/admin/destinations/[id] | PATCH | Admin | [app/api/v1/admin/destinations/[id]/route.ts](app/api/v1/admin/destinations/[id]/route.ts) |
| /api/v1/admin/enquiries | GET | Admin | [app/api/v1/admin/enquiries/route.ts](app/api/v1/admin/enquiries/route.ts) |
| /api/v1/admin/enquiries/[id] | GET, POST, PATCH, DELETE | Admin | [app/api/v1/admin/enquiries/[id]/route.ts](app/api/v1/admin/enquiries/[id]/route.ts) |
| /api/v1/admin/finance/summary | GET | Admin | [app/api/v1/admin/finance/summary/route.ts](app/api/v1/admin/finance/summary/route.ts) |
| /api/v1/admin/financial-reports | GET | Admin | [app/api/v1/admin/financial-reports/route.ts](app/api/v1/admin/financial-reports/route.ts) |
| /api/v1/admin/hotels | GET | Admin | [app/api/v1/admin/hotels/route.ts](app/api/v1/admin/hotels/route.ts) |
| /api/v1/admin/inventory | GET | Admin | [app/api/v1/admin/inventory/route.ts](app/api/v1/admin/inventory/route.ts) |
| /api/v1/admin/inventory/[id]/status | PATCH | Admin | [app/api/v1/admin/inventory/[id]/status/route.ts](app/api/v1/admin/inventory/[id]/status/route.ts) |
| /api/v1/admin/login | POST | Admin | [app/api/v1/admin/login/route.ts](app/api/v1/admin/login/route.ts) |
| /api/v1/admin/marketing | GET | Admin | [app/api/v1/admin/marketing/route.ts](app/api/v1/admin/marketing/route.ts) |
| /api/v1/admin/notifications | GET | Admin | [app/api/v1/admin/notifications/route.ts](app/api/v1/admin/notifications/route.ts) |
| /api/v1/admin/payments | GET | Admin | [app/api/v1/admin/payments/route.ts](app/api/v1/admin/payments/route.ts) |
| /api/v1/admin/refunds | GET | Admin | [app/api/v1/admin/refunds/route.ts](app/api/v1/admin/refunds/route.ts) |
| /api/v1/admin/refunds/[id]/process | POST | Admin | [app/api/v1/admin/refunds/[id]/process/route.ts](app/api/v1/admin/refunds/[id]/process/route.ts) |
| /api/v1/admin/reviews | GET | Admin | [app/api/v1/admin/reviews/route.ts](app/api/v1/admin/reviews/route.ts) |
| /api/v1/admin/reviews/[id] | PATCH | Admin | [app/api/v1/admin/reviews/[id]/route.ts](app/api/v1/admin/reviews/[id]/route.ts) |
| /api/v1/admin/settlements | GET | Admin | [app/api/v1/admin/settlements/route.ts](app/api/v1/admin/settlements/route.ts) |
| /api/v1/admin/settlements/[id]/status | POST | Admin | [app/api/v1/admin/settlements/[id]/status/route.ts](app/api/v1/admin/settlements/[id]/status/route.ts) |
| /api/v1/admin/staff | GET, POST | Admin | [app/api/v1/admin/staff/route.ts](app/api/v1/admin/staff/route.ts) |
| /api/v1/admin/suppliers | GET | Admin | [app/api/v1/admin/suppliers/route.ts](app/api/v1/admin/suppliers/route.ts) |
| /api/v1/admin/suppliers/[id]/verification | PATCH | Admin | [app/api/v1/admin/suppliers/[id]/verification/route.ts](app/api/v1/admin/suppliers/[id]/verification/route.ts) |
| /api/v1/admin/support | GET | Admin | [app/api/v1/admin/support/route.ts](app/api/v1/admin/support/route.ts) |
| /api/v1/admin/support/[id] | POST, PATCH | Admin | [app/api/v1/admin/support/[id]/route.ts](app/api/v1/admin/support/[id]/route.ts) |
| /api/v1/admin/system | GET | Admin | [app/api/v1/admin/system/route.ts](app/api/v1/admin/system/route.ts) |
| /api/v1/admin/transportation | GET | Admin | [app/api/v1/admin/transportation/route.ts](app/api/v1/admin/transportation/route.ts) |
| /api/v1/admin/travel-commissions | GET | Admin | [app/api/v1/admin/travel-commissions/route.ts](app/api/v1/admin/travel-commissions/route.ts) |
| /api/v1/admin/travel-commissions/settle | POST | Admin | [app/api/v1/admin/travel-commissions/settle/route.ts](app/api/v1/admin/travel-commissions/settle/route.ts) |
| /api/v1/admin/travel-packages | GET | Admin | [app/api/v1/admin/travel-packages/route.ts](app/api/v1/admin/travel-packages/route.ts) |
| /api/v1/admin/travel-packages/[id]/approve | POST | Admin | [app/api/v1/admin/travel-packages/[id]/approve/route.ts](app/api/v1/admin/travel-packages/[id]/approve/route.ts) |
| /api/v1/admin/travel-packages/[id]/pause | POST | Admin | [app/api/v1/admin/travel-packages/[id]/pause/route.ts](app/api/v1/admin/travel-packages/[id]/pause/route.ts) |
| /api/v1/admin/travel-packages/[id]/reject | POST | Admin | [app/api/v1/admin/travel-packages/[id]/reject/route.ts](app/api/v1/admin/travel-packages/[id]/reject/route.ts) |
| /api/v1/admin/travel-packages/[id]/request-changes | POST | Admin | [app/api/v1/admin/travel-packages/[id]/request-changes/route.ts](app/api/v1/admin/travel-packages/[id]/request-changes/route.ts) |
| /api/v1/admin/travel-partner-audit | GET | Admin | [app/api/v1/admin/travel-partner-audit/route.ts](app/api/v1/admin/travel-partner-audit/route.ts) |
| /api/v1/admin/travel-partners | GET | Admin | [app/api/v1/admin/travel-partners/route.ts](app/api/v1/admin/travel-partners/route.ts) |
| /api/v1/admin/travel-partners/[id] | GET | Admin | [app/api/v1/admin/travel-partners/[id]/route.ts](app/api/v1/admin/travel-partners/[id]/route.ts) |
| /api/v1/admin/travel-partners/[id]/approve | POST | Admin | [app/api/v1/admin/travel-partners/[id]/approve/route.ts](app/api/v1/admin/travel-partners/[id]/approve/route.ts) |
| /api/v1/admin/travel-partners/[id]/reject | POST | Admin | [app/api/v1/admin/travel-partners/[id]/reject/route.ts](app/api/v1/admin/travel-partners/[id]/reject/route.ts) |
| /api/v1/admin/travel-partners/[id]/request-information | POST | Admin | [app/api/v1/admin/travel-partners/[id]/request-information/route.ts](app/api/v1/admin/travel-partners/[id]/request-information/route.ts) |
| /api/v1/admin/travel-partners/[id]/suspend | POST | Admin | [app/api/v1/admin/travel-partners/[id]/suspend/route.ts](app/api/v1/admin/travel-partners/[id]/suspend/route.ts) |
| /api/v1/admin/users | GET, PATCH | Admin | [app/api/v1/admin/users/route.ts](app/api/v1/admin/users/route.ts) |
| /api/v1/booking/admin/dashboard | GET, POST | Admin | [app/api/v1/booking/admin/dashboard/route.ts](app/api/v1/booking/admin/dashboard/route.ts) |
| /api/v1/booking/availability | GET, POST | Traveler Auth | [app/api/v1/booking/availability/route.ts](app/api/v1/booking/availability/route.ts) |
| /api/v1/booking/cancel | POST | Traveler Auth | [app/api/v1/booking/cancel/route.ts](app/api/v1/booking/cancel/route.ts) |
| /api/v1/booking/orchestrate | GET, POST | Traveler Auth | [app/api/v1/booking/orchestrate/route.ts](app/api/v1/booking/orchestrate/route.ts) |
| /api/v1/bookings | GET, POST | Traveler Auth | [app/api/v1/bookings/route.ts](app/api/v1/bookings/route.ts) |
| /api/v1/bookings/[id] | GET, PATCH | Traveler Auth | [app/api/v1/bookings/[id]/route.ts](app/api/v1/bookings/[id]/route.ts) |
| /api/v1/bookings/[id]/cancel | POST | Traveler Auth | [app/api/v1/bookings/[id]/cancel/route.ts](app/api/v1/bookings/[id]/cancel/route.ts) |
| /api/v1/contact | POST | Traveler Auth | [app/api/v1/contact/route.ts](app/api/v1/contact/route.ts) |
| /api/v1/gateway/analytics | GET | Traveler Auth | [app/api/v1/gateway/analytics/route.ts](app/api/v1/gateway/analytics/route.ts) |
| /api/v1/gateway/keys | GET, POST | Traveler Auth | [app/api/v1/gateway/keys/route.ts](app/api/v1/gateway/keys/route.ts) |
| /api/v1/gateway/ledger | GET | Traveler Auth | [app/api/v1/gateway/ledger/route.ts](app/api/v1/gateway/ledger/route.ts) |
| /api/v1/gateway/observability | GET | Traveler Auth | [app/api/v1/gateway/observability/route.ts](app/api/v1/gateway/observability/route.ts) |
| /api/v1/gateway/orders | GET, POST | Traveler Auth | [app/api/v1/gateway/orders/route.ts](app/api/v1/gateway/orders/route.ts) |
| /api/v1/gateway/payments | GET, POST | Traveler Auth | [app/api/v1/gateway/payments/route.ts](app/api/v1/gateway/payments/route.ts) |
| /api/v1/gateway/payments/verify | POST | Traveler Auth | [app/api/v1/gateway/payments/verify/route.ts](app/api/v1/gateway/payments/verify/route.ts) |
| /api/v1/gateway/profile | GET | Traveler Auth | [app/api/v1/gateway/profile/route.ts](app/api/v1/gateway/profile/route.ts) |
| /api/v1/gateway/reconciliation | GET, POST | Traveler Auth | [app/api/v1/gateway/reconciliation/route.ts](app/api/v1/gateway/reconciliation/route.ts) |
| /api/v1/gateway/refunds | GET, POST | Traveler Auth | [app/api/v1/gateway/refunds/route.ts](app/api/v1/gateway/refunds/route.ts) |
| /api/v1/gateway/webhooks | GET, POST | Webhook | [app/api/v1/gateway/webhooks/route.ts](app/api/v1/gateway/webhooks/route.ts) |
| /api/v1/health | GET | Public | [app/api/v1/health/route.ts](app/api/v1/health/route.ts) |
| /api/v1/me | GET, PATCH | Traveler Auth | [app/api/v1/me/route.ts](app/api/v1/me/route.ts) |
| /api/v1/me/preferences | GET, PUT, PATCH | Traveler Auth | [app/api/v1/me/preferences/route.ts](app/api/v1/me/preferences/route.ts) |
| /api/v1/me/profile | ALL | Traveler Auth | [app/api/v1/me/profile/route.ts](app/api/v1/me/profile/route.ts) |
| /api/v1/me/saved-destinations | GET, POST, DELETE | Public | [app/api/v1/me/saved-destinations/route.ts](app/api/v1/me/saved-destinations/route.ts) |
| /api/v1/notifications | GET | Traveler Auth | [app/api/v1/notifications/route.ts](app/api/v1/notifications/route.ts) |
| /api/v1/notifications/[id]/read | PATCH | Traveler Auth | [app/api/v1/notifications/[id]/read/route.ts](app/api/v1/notifications/[id]/read/route.ts) |
| /api/v1/notifications/read-all | POST | Traveler Auth | [app/api/v1/notifications/read-all/route.ts](app/api/v1/notifications/read-all/route.ts) |
| /api/v1/notifications/unread-count | GET | Traveler Auth | [app/api/v1/notifications/unread-count/route.ts](app/api/v1/notifications/unread-count/route.ts) |
| /api/v1/packages | GET | Traveler Auth | [app/api/v1/packages/route.ts](app/api/v1/packages/route.ts) |
| /api/v1/packages/[slug] | GET | Traveler Auth | [app/api/v1/packages/[slug]/route.ts](app/api/v1/packages/[slug]/route.ts) |
| /api/v1/packages/booking | POST | Traveler Auth | [app/api/v1/packages/booking/route.ts](app/api/v1/packages/booking/route.ts) |
| /api/v1/partner/commissions | GET | Travel Partner | [app/api/v1/partner/commissions/route.ts](app/api/v1/partner/commissions/route.ts) |
| /api/v1/partner/dashboard | GET | Travel Partner | [app/api/v1/partner/dashboard/route.ts](app/api/v1/partner/dashboard/route.ts) |
| /api/v1/partner/notifications | GET | Travel Partner | [app/api/v1/partner/notifications/route.ts](app/api/v1/partner/notifications/route.ts) |
| /api/v1/partner/packages | GET, POST | Travel Partner | [app/api/v1/partner/packages/route.ts](app/api/v1/partner/packages/route.ts) |
| /api/v1/partner/packages/[id] | GET, PATCH | Travel Partner | [app/api/v1/partner/packages/[id]/route.ts](app/api/v1/partner/packages/[id]/route.ts) |
| /api/v1/partner/packages/[id]/pause | POST | Travel Partner | [app/api/v1/partner/packages/[id]/pause/route.ts](app/api/v1/partner/packages/[id]/pause/route.ts) |
| /api/v1/partner/packages/[id]/submit | POST | Travel Partner | [app/api/v1/partner/packages/[id]/submit/route.ts](app/api/v1/partner/packages/[id]/submit/route.ts) |
| /api/v1/partner/profile | GET, PATCH | Travel Partner | [app/api/v1/partner/profile/route.ts](app/api/v1/partner/profile/route.ts) |
| /api/v1/states | GET | Public | [app/api/v1/states/route.ts](app/api/v1/states/route.ts) |
| /api/v1/states/[slug] | GET | Public | [app/api/v1/states/[slug]/route.ts](app/api/v1/states/[slug]/route.ts) |
| /api/v1/support/tickets/[id] | GET | Traveler Auth | [app/api/v1/support/tickets/[id]/route.ts](app/api/v1/support/tickets/[id]/route.ts) |
| /api/v1/support/tickets/[id]/reply | POST | Traveler Auth | [app/api/v1/support/tickets/[id]/reply/route.ts](app/api/v1/support/tickets/[id]/reply/route.ts) |
| /api/v1/travel-packages | GET | Traveler Auth | [app/api/v1/travel-packages/route.ts](app/api/v1/travel-packages/route.ts) |
| /api/v1/travel-packages/[slug] | GET | Traveler Auth | [app/api/v1/travel-packages/[slug]/route.ts](app/api/v1/travel-packages/[slug]/route.ts) |
| /api/v1/travel-partners/application-status | GET | Travel Partner | [app/api/v1/travel-partners/application-status/route.ts](app/api/v1/travel-partners/application-status/route.ts) |
| /api/v1/travel-partners/applications | GET, POST | Travel Partner | [app/api/v1/travel-partners/applications/route.ts](app/api/v1/travel-partners/applications/route.ts) |
| /api/v1/trips | GET, POST | Traveler Auth | [app/api/v1/trips/route.ts](app/api/v1/trips/route.ts) |
| /api/v1/trips/[id] | GET, PATCH, DELETE | Traveler Auth | [app/api/v1/trips/[id]/route.ts](app/api/v1/trips/[id]/route.ts) |
| /api/v1/trips/[id]/expenses | GET, POST | Traveler Auth | [app/api/v1/trips/[id]/expenses/route.ts](app/api/v1/trips/[id]/expenses/route.ts) |
| /api/v1/trips/[id]/expenses/[expenseId] | DELETE | Traveler Auth | [app/api/v1/trips/[id]/expenses/[expenseId]/route.ts](app/api/v1/trips/[id]/expenses/[expenseId]/route.ts) |
| /api/v1/trips/[id]/members | GET, POST | Traveler Auth | [app/api/v1/trips/[id]/members/route.ts](app/api/v1/trips/[id]/members/route.ts) |
| /api/v1/trips/[id]/members/[memberId] | DELETE | Traveler Auth | [app/api/v1/trips/[id]/members/[memberId]/route.ts](app/api/v1/trips/[id]/members/[memberId]/route.ts) |
| /api/v1/trips/[id]/settle | POST | Traveler Auth | [app/api/v1/trips/[id]/settle/route.ts](app/api/v1/trips/[id]/settle/route.ts) |
| /api/v1/trips/duration | GET, POST | Traveler Auth | [app/api/v1/trips/duration/route.ts](app/api/v1/trips/duration/route.ts) |
| /api/v1/trips/geography | GET, POST | Traveler Auth | [app/api/v1/trips/geography/route.ts](app/api/v1/trips/geography/route.ts) |
| /api/v1/trips/itinerary | GET, POST | Traveler Auth | [app/api/v1/trips/itinerary/route.ts](app/api/v1/trips/itinerary/route.ts) |
| /api/v1/trips/plan | GET, POST | Traveler Auth | [app/api/v1/trips/plan/route.ts](app/api/v1/trips/plan/route.ts) |
| /api/v1/trips/preferences | GET, POST | Traveler Auth | [app/api/v1/trips/preferences/route.ts](app/api/v1/trips/preferences/route.ts) |
| /api/v1/trips/pricing | GET, POST | Traveler Auth | [app/api/v1/trips/pricing/route.ts](app/api/v1/trips/pricing/route.ts) |
| /api/v1/trips/pricing/calibration | GET, POST | Traveler Auth | [app/api/v1/trips/pricing/calibration/route.ts](app/api/v1/trips/pricing/calibration/route.ts) |
| /api/v1/trips/recommend-duration | ALL | Traveler Auth | [app/api/v1/trips/recommend-duration/route.ts](app/api/v1/trips/recommend-duration/route.ts) |
| /api/v1/trips/recommendations | GET, POST | Traveler Auth | [app/api/v1/trips/recommendations/route.ts](app/api/v1/trips/recommendations/route.ts) |
| /api/v1/trips/recommendations/feedback | POST | Traveler Auth | [app/api/v1/trips/recommendations/feedback/route.ts](app/api/v1/trips/recommendations/feedback/route.ts) |
| /api/v1/trips/routes | GET, POST | Traveler Auth | [app/api/v1/trips/routes/route.ts](app/api/v1/trips/routes/route.ts) |

---

## 3. NestJS Enterprise Backend Endpoints (Port 4000)

The backend service in 18_DEVELOPMENT/Backend/src exposes the following major controller clusters (Swagger mounted at /api/v1/docs):
- **/api/v1/bookings**: Booking lifecycle orchestration, PNR generation, inventory locking.
- **/api/v1/hotels**: Hotelbeds (HBX) search, rate check, and voucher issuance.
- **/api/v1/buses**: eTravelSmart bus seat inventory, bus layout fetch, and ticket reservation.
- **/api/v1/trains**: Indian Railways station search, train availability, and fare calculator.
- **/api/v1/gateway**: BharatGateway payment intents, split payouts, merchant ledger, and fraud scoring.
- **/api/v1/nexi**: Nexi conversational AI query processing, streaming chat completions.
- **/api/v1/health**: Terminus health check probes (database ping, redis ping, disk storage).

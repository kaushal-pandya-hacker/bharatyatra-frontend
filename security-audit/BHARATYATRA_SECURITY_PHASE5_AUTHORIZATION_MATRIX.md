# BharatYatra Security — Phase 5 Authorization Matrix & Access Control Specification

**Classification**: PRODUCTION ACCESS CONTROL MATRIX & PERMISSION SPECIFICATION  
**Target Architecture**: Role-Based & Object-Level Access Control (RBAC & OBAC)  
**Date**: October 21, 2026  
**Auditor**: Application Security Architect & Authorization Specialist  

---

## 1. Role Definitions & Hierarchy

1. **ANON / GUEST**: Unauthenticated visitor or mobile client without a cryptographic JWT token. Access is strictly confined to public discovery (destinations, public published packages, public search, rate-limited NEXI chat).
2. **CUSTOMER (Authenticated)**: End-user holding a cryptographically verified Supabase JWT (`role: authenticated`). Can manage only their own profile, cart, bookings, orders, and payment sessions.
3. **PARTNER / SUPPLIER**: Verified travel agency or hotel/transport operator. Can manage only their own packages, agreements, verification documents, and inventory. Confined by PostgreSQL Row Level Security (`auth.uid() = user_id`).
4. **ADMIN / SUPER_ADMIN**: High-privilege platform administrator holding verified admin session or cryptographically verified role claim (`app_metadata.role: admin`). Governs all operational directories, partner approvals, commission settlements, and refunds.

---

## 2. Resource Authorization Matrix

| Endpoint | HTTP Method | Permitted Roles | Object-Level Verification Rule | Unauthorized Response |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & Profile** | | | | |
| `/api/v1/auth/login` | `POST` | ALL (Public) | None | 400 Bad Request |
| `/api/v1/auth/register` | `POST` | ALL (Public) | None | 400 Bad Request |
| `/api/v1/me` | `GET` | CUSTOMER, ADMIN | `user.id === requestingUserId` | 401 Unauthorized |
| `/api/v1/me/profile` | `GET`, `PATCH` | CUSTOMER, ADMIN | Scoped to authenticated token `user.id` | 401 Unauthorized |
| `/api/v1/me/travelers` | `GET`, `POST` | CUSTOMER, ADMIN | Scoped to authenticated token `user.id` | 401 Unauthorized |
| `/api/v1/me/travelers/:id`| `PATCH`, `DELETE`| CUSTOMER, ADMIN | Traveler record must belong to `user.id` | 404 Not Found |
| **Bookings & Reservations** | | | | |
| `/api/v1/bookings` | `GET` | CUSTOMER, ADMIN | Filters strictly where `userId = user.id` | 401 Unauthorized |
| `/api/v1/bookings` | `POST` | CUSTOMER, ADMIN | Created under authenticated `user.id` | 401 Unauthorized |
| `/api/v1/bookings/:id` | `GET` | CUSTOMER, ADMIN | `booking.userId === user.id` (or ADMIN) | 404 Not Found (IDOR defense) |
| `/api/v1/bookings/reference/:ref` | `GET` | CUSTOMER, ADMIN | `booking.userId === user.id` | 404 Not Found |
| `/api/v1/bookings/:id/cancel` | `POST` | CUSTOMER, ADMIN | `booking.userId === user.id` | 404 Not Found |
| **Orders & Fulfillment** | | | | |
| `/api/v1/orders/mine` | `GET` | CUSTOMER, ADMIN | Filters strictly where `userId = user.id` | 401 Unauthorized |
| `/api/v1/orders/:id` | `GET` | CUSTOMER, ADMIN | `order.userId === user.id` (or ADMIN) | 403 Forbidden |
| `/api/v1/orders/:id/cancel-item` | `POST` | CUSTOMER, ADMIN | `order.userId === user.id` | 403 Forbidden |
| `/api/v1/admin/orders` | `GET` | ADMIN | Verified Admin Session or `x-admin-key` | 403 Forbidden |
| **Cancellations & Refunds** | | | | |
| `/api/v1/orders/:id/cancellation-eligibility` | `GET` | CUSTOMER, ADMIN | `order.userId === user.id` | 403 Forbidden |
| `/api/v1/orders/:id/cancellation-quote` | `POST` | CUSTOMER, ADMIN | `order.userId === user.id` | 403 Forbidden |
| `/api/v1/orders/:id/cancel-item` (cancellations) | `POST` | CUSTOMER, ADMIN | `order.userId === user.id` | 403 Forbidden |
| `/api/v1/cancellations/:id` | `GET` | CUSTOMER, ADMIN | `cancellation.userId === user.id` (or ADMIN) | 403 Forbidden |
| `/api/v1/admin/cancellations` | `GET` | ADMIN | Verified Admin Session or `x-admin-key` | 403 Forbidden |
| `/api/v1/refunds/request` | `POST` | CUSTOMER, ADMIN | `booking.userId === user.id` + Paid balance check | 403 Forbidden |
| `/api/v1/refunds/:id` | `GET` | CUSTOMER, ADMIN | `refund.userId === user.id` (or ADMIN) | 403 Forbidden |
| `/api/v1/admin/refunds` | `GET` | ADMIN | Verified Admin Session or `x-admin-key` | 403 Forbidden |
| `/api/v1/bookings/:bookingId/refund` | `POST` | CUSTOMER, ADMIN | `booking.userId === user.id` (or ADMIN) | 403 Forbidden |
| **Payments & Webhooks** | | | | |
| `/api/v1/payments/create-order` | `POST` | CUSTOMER, ADMIN | Scoped to authenticated user | 401 Unauthorized |
| `/api/v1/payments/verify` | `POST` | CUSTOMER, ADMIN | `payment.customerId === user.id` | 403 Forbidden |
| `/api/v1/payments/retry` | `POST` | CUSTOMER, ADMIN | `booking.userId === user.id` | 401 Unauthorized |
| `/api/v1/payments/webhooks/:provider` | `POST` | PROVIDER ONLY | Valid HMAC signature required | 400 Bad Request / 401 Unauthorized |
| `/api/v1/webhooks/:provider/:event` | `POST` | PROVIDER ONLY | Raw Body HMAC-SHA256 signature required | 400 Bad Request / 401 Unauthorized |
| **Cart & Checkout** | | | | |
| `/api/v1/cart` | `GET` | ALL | Scoped to `userId` or validated `x-session-id` | Safe fallback |
| `/api/v1/cart/items` | `POST` | ALL | Price snapshot must be >= 0 (`@Min(0)`) | 400 Bad Request |
| `/api/v1/checkout/session` | `POST` | ALL | Full provider revalidation required | 400 Bad Request |
| **Travel Partner Ecosystem** | | | | |
| `/api/v1/packages` (Public) | `GET` | ALL | Only `PUBLISHED` packages from `APPROVED` agencies | Filtered DB Query |
| `/api/v1/partner/packages` | `GET`, `POST` | PARTNER | `agency.user_id === auth.uid()` (RLS enforced) | 403 Forbidden / RLS 0 rows |
| `/api/v1/partner/agreements` | `GET` | PARTNER | `agency.user_id === auth.uid()` (RLS enforced) | 403 Forbidden / RLS 0 rows |
| `/api/v1/partner/commissions` | `GET` | PARTNER | `agency.user_id === auth.uid()` (RLS enforced) | 403 Forbidden / RLS 0 rows |
| `/api/v1/admin/travel-partners` | `GET`, `PATCH` | ADMIN | Verified Admin Session or `x-admin-key` | 403 Forbidden |
| `/api/v1/admin/travel-commissions` | `GET`, `POST` | ADMIN | Verified Admin Session or `x-admin-key` | 403 Forbidden |
| **NEXI 24/7 AI Assistant** | | | | |
| `/api/v1/nexi/chat` | `POST` | ALL | Rate limited (30 pts/min), length <= 2000 | 400 Bad Request / 429 Too Many Requests |
| `/api/v1/nexi/conversations` | `GET` | CUSTOMER, ADMIN | Scoped strictly to authenticated `userId` | 400 Bad Request / 401 Unauthorized |

---

## 3. IDOR Error Response Strategy

To balance security and user experience:
1. **Enumeration-Sensitive Endpoints** (e.g. `GET /api/v1/bookings/:id`): Return **HTTP 404 Not Found** when a user attempts to access an existing booking owned by another user. This prevents attackers from determining whether an arbitrary UUID represents an active booking.
2. **Explicit Operation Endpoints** (e.g. `POST /api/v1/orders/:id/cancel-item`, `POST /api/v1/refunds/request`): Return **HTTP 403 Forbidden** with a clear message: `"Access denied: You do not own this order."`.
3. **Unauthenticated Access**: All sensitive endpoints consistently return **HTTP 401 Unauthorized** without reaching service execution layers.

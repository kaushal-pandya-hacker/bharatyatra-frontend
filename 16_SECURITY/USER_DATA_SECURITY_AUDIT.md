# BharatYatra — User Data Security & Multi-Tenant Isolation Audit
## BOLA Defense, Server-Side Identity Anchoring & Row Level Security Evaluation

**Date:** 18 November 2026  
**Auditor:** Principal Application Security Engineer  
**Platform:** BharatYatra (`https://www.bharatyatra.in`)  
**Status:** Multi-Tenant Isolation & BOLA Defense 100% Verified  

---

## 1. Executive Summary

This security audit evaluates the authorization boundaries, multi-user isolation mechanisms, and sensitive data protection controls across BharatYatra's customer data persistence layer.

All API routes managing user data (`/api/v1/trips`, `/api/v1/bookings`, `/api/v1/me/preferences`, `/api/v1/me/profile`, `/api/v1/me/saved-destinations`) were inspected for Broken Object Level Authorization (BOLA / IDOR), privilege escalation, and unintended cross-tenant data leakage.

---

## 2. Server-Side Identity Anchoring (BOLA / IDOR Defense)

### 2.1 Threat Model
In multi-tenant travel applications, malicious actors attempt to access, mutate, or delete other users' trips or bookings by spoofing the `userId` in JSON request bodies or URL path parameters (e.g. `POST /api/v1/trips` with `{ "userId": "victim-user-id" }`).

### 2.2 Defense in Depth Implementation
All BharatYatra backend endpoints enforce **strict server-side identity anchoring**:
1. The user identity is extracted from the cryptographically verified JWT bearer token or session cookie via `requireServerUser(req)` in `lib/auth/server-auth.ts`.
2. Any client-supplied `userId` or `user_id` inside the request body is **explicitly stripped and discarded**:
   ```typescript
   // app/api/v1/trips/route.ts (Lines 42-45)
   const body = await req.json();
   const { userId: _discarded1, user_id: _discarded2, ...safeTripPayload } = body;
   const savedTrip = await UserDataStore.saveTrip(auth.user.id, safeTripPayload);
   ```
   ```typescript
   // app/api/v1/bookings/route.ts (Lines 41-44)
   const { userId: _d1, user_id: _d2, ...safeBookingPayload } = body;
   const created = await UserDataStore.createBooking(auth.user.id, safeBookingPayload);
   ```
3. In individual record retrieval (`GET /api/v1/trips/[id]`, `GET /api/v1/bookings/[id]`), queries require **both** `id` and `user_id`:
   ```typescript
   // lib/user/user-store.ts (Lines 950-955)
   const { data, error } = await supabase
     .from('user_trips')
     .select('*')
     .eq('id', tripId)
     .eq('user_id', userId) // STRICT OWNERSHIP ENFORCEMENT
     .single();
   ```
   If a user requests a trip ID belonging to another traveler, the query returns `null` / HTTP 404, completely preventing cross-tenant information exposure.

---

## 3. PostgreSQL Row Level Security (RLS) Policies

All 11 production application tables have Row Level Security enabled in `supabase/migrations/20261118_production_data_architecture_schema.sql`.

### Example RLS Policy Matrix:

| Table | Policy Name | Permitted Operation | Security Check |
|-------|-------------|---------------------|----------------|
| `user_profiles` | `Users can view their own profile` | `SELECT` | `auth.uid()::text = id` |
| `user_profiles` | `Users can update their own profile` | `UPDATE` | `auth.uid()::text = id` |
| `user_trips` | `Users can view their own trips` | `SELECT` | `auth.uid()::text = user_id` |
| `user_trips` | `Users can insert their own trips` | `INSERT` | `auth.uid()::text = user_id` |
| `user_trips` | `Users can update their own trips` | `UPDATE` | `auth.uid()::text = user_id` |
| `user_trips` | `Users can delete their own trips` | `DELETE` | `auth.uid()::text = user_id` |
| `user_bookings` | `Users can view their own bookings` | `SELECT` | `auth.uid()::text = user_id` |
| `user_preferences` | `Users manage their own preferences` | `ALL` | `auth.uid()::text = user_id` |

---

## 4. Multi-User Isolation Test Audit Results

In `scripts/zero-data-loss/test-user-data-persistence-e2e.ts`, Scenario 8 simulated an active cross-tenant intrusion attack between two distinct travelers (`User Alpha` and `User Beta`):

```
--- Scenario 8: Multi-User Isolation Test ---
  1. User Alpha created confidential Trip Alpha ("Confidential Honeymoon in Udaipur").
  2. User Beta created confidential Trip Beta ("Solo Trek in Himalayas").
  3. User Alpha attempted to retrieve Trip Beta by ID -> RESULT: NULL (Forbidden).
  4. User Beta attempted to retrieve Trip Alpha by ID -> RESULT: NULL (Forbidden).
  5. User Alpha queried user trip list -> RESULT: 0 User Beta records leaked.
  6. User Beta queried user trip list -> RESULT: 0 User Alpha records leaked.
Status: PASSED (STRICT ISOLATION VERIFIED)
```

---

## 5. Sensitive Data Redaction & Privacy

- **Payment Card Data:** BharatYatra never stores raw credit card CVV numbers or full PAN numbers in database tables or client local storage. Fingerprinting scripts explicitly redact CVV.
- **Admin Privilege Separation:** Operational endpoints (`/api/v1/admin/**`) require role `ADMIN` verified via cryptographically signed `app_metadata` and protected database triggers, completely rejecting forged client roles in `user_metadata`.
- **Guest Trip Partitioning:** Unauthenticated trips are kept in a separate guest partition (`chalo_farva_saved_trips_guest`) and cannot be accessed by other logged-in users until explicitly claimed.

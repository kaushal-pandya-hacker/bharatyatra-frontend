# Analytics API Specification v1.1 — Chalo Farva

**Version**: v1.1  
**Base Path**: `/api/v1`  
**Authentication**: JWT Bearer Token (Admin Endpoints require `ADMIN` RBAC role)  

---

## REST Endpoints Overview

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/analytics/events` | Ingest single or batched first-party telemetry events | Public / Authenticated |
| `GET` | `/api/v1/admin/analytics/overview` | Platform macro summary (Registrations, Conversion, Volume) | Admin |
| `GET` | `/api/v1/admin/analytics/funnel` | 13-stage conversion funnel step drop-off analytics | Admin |
| `GET` | `/api/v1/admin/analytics/users` | User registration, active users, anonymous session merge | Admin |
| `GET` | `/api/v1/admin/analytics/search` | Search query volume, latency, and hub popularity | Admin |
| `GET` | `/api/v1/admin/analytics/ai` | AI planner starts, acceptance rate, edits, latency | Admin |
| `GET` | `/api/v1/admin/analytics/adaptive-ai` | Triggers, proposals, approval rate, false positives | Admin |
| `GET` | `/api/v1/admin/analytics/bookings` | Bookings requested, confirmed, failed, cancelled | Admin |
| `GET` | `/api/v1/admin/analytics/payments` | Payment attempts, success rate, gateway latency | Admin |
| `GET` | `/api/v1/admin/analytics/suppliers` | Supplier performance scores, booking success, complaints | Admin |
| `GET` | `/api/v1/admin/analytics/revenue` | Authoritative GBV, commission, fees, net margin | Admin |
| `GET` | `/api/v1/admin/analytics/campaigns` | UTM campaign attribution & channel conversion | Admin |
| `GET` | `/api/v1/admin/analytics/retention` | Repeat travelers, repeat trip creation, saved itineraries | Admin |

---

## Sample Request Schema — Ingest Telemetry Event

```json
{
  "eventId": "evt-1726250000-9921",
  "eventType": "AI_ITINERARY_ACCEPTED",
  "eventVersion": "1.1",
  "userId": "usr_99812",
  "anonymousId": "anon-1726240000-112",
  "sessionId": "sess-1726245000-441",
  "tripId": "trip_0012",
  "timestamp": "2026-09-13T19:46:00.000Z",
  "platform": "WEB",
  "deviceType": "DESKTOP",
  "appVersion": "1.1.0",
  "page": "/planner/itinerary/trip_0012",
  "source": "google_organic",
  "campaign": {
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "rann_utsav_2026"
  },
  "properties": {
    "destinationHub": "Kutch",
    "durationDays": 4,
    "budgetINR": 25000
  }
}
```

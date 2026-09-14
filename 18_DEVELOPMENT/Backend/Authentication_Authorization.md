# Authentication & Authorization — Chalo Farva

## Token Flow
1. User logs in via `POST /api/v1/auth/login`.
2. Backend generates signed JWT containing user ID, email, role, and fullName.
3. Client passes token in `Authorization: Bearer <token>` header for subsequent requests.

## Role Hierarchies
- **`CUSTOMER`**: Access to own trips, bookings, AI planner, and profile.
- **`SUPPLIER`**: Access to vendor portal, bus/hotel inventory updates, and booking fulfillment.
- **`ADMIN`**: Platform-wide monitoring, user management, and system configuration.
- **`SUPPORT_AGENT`**: Customer service issue resolution and booking adjustments.

# AUTHENTICATION & AUTHORIZATION ARCHITECTURE — CHALO FARVA

1. **Mobile OTP Login**: 6-digit OTP verification via `/api/v1/auth/otp/verify`.
2. **Role-Based UI Rendering**: Client-side authorization helper `hasRole(user, 'PLATFORM_ADMIN')` controls admin/supplier sidebar links.
3. **Backend Authority**: Client-side UI checks are strictly for UX; backend middleware enforces hard security authorization boundaries.

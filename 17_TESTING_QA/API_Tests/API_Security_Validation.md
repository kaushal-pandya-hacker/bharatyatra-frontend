# API Security Validation Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Security Checks

- **Authentication & JWT Validation**: Unauthorized requests return 410/401. Expired JWT tokens correctly rejected.
- **Role-Based Access Control (RBAC)**: `/api/v1/admin/*` endpoints strictly guarded by `AdminGuard` and `RolesGuard`. Non-admin access rejected with 403 Forbidden.
- **Mass Assignment Defense**: NestJS DTO class-transformers sanitize incoming payload fields and drop unauthorized properties.
- **Rate Limiting**: Throttler module active across login, OTP, search, payment, and AI endpoints.

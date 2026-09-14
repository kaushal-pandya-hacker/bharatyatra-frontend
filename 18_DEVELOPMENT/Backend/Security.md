# Security Specification — Chalo Farva

## Backend Security Controls
- **Helmet Middleware**: XSS protection, MIME sniffing prevention, frameguard.
- **Strict Input Validation**: NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
- **Stateless RBAC**: Token-based role authorization enforced on every protected route.
- **Audit Redaction**: Passwords, tokens, card numbers, and provider secrets automatically redacted before writing to `audit_logs`.

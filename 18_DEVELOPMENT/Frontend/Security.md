# FRONTEND SECURITY SPECIFICATION — CHALO FARVA

1. **XSS Protection**: All user text inputs sanitized using `lib/security/sanitizer.ts`.
2. **Secrets Hygiene**: No API secrets or private keys exposed in `NEXT_PUBLIC_` environment variables.
3. **PCI-DSS Compliance**: Raw payment card numbers are NEVER entered into local input fields or transmitted to Chalo Farva servers.

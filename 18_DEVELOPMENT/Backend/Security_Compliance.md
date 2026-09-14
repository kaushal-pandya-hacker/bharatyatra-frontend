# Security & Compliance — Chalo Farva

## Security Controls
- **Helmet HTTP Headers**: Protection against clickjacking, MIME sniffing, and cross-site scripting (XSS).
- **CORS Restriction**: Restricted to configured front-end origin (`http://localhost:3000` in dev).
- **Rate Limiting**: Express rate limiter enforcing 200 requests per 15 minutes per IP.
- **SQL Injection Prevention**: Positional query parameters across all PostgreSQL queries.
- **Data Privacy**: Passwords hashed with bcrypt (salt rounds = 12); PII encrypted at rest.

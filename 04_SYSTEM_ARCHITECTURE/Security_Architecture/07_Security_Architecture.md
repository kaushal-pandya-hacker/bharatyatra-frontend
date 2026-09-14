# Security Architecture — Chalo Farva

## Security Measures
- TLS 1.3 encryption in transit
- AES-256 encryption at rest for sensitive customer data
- JWT stateless authentication with short-lived access tokens & refresh tokens
- Parameterized SQL queries preventing injection
- Strict CORS rules & Helmet security headers

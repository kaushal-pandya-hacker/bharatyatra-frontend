# Authentication — Chalo Farva

## Token Authentication Architecture
- Password hashing via `bcrypt` (salt rounds = 12).
- Stateless JWT issuance via `@nestjs/jwt`.
- Access tokens expire in 7 days; Refresh tokens stored in `user_sessions` table.
- Authorization header format: `Bearer <jwt_token>`.

# API INTEGRATION STRATEGY — BHARAT YATRA

1. **Centralized Fetch Wrapper**: All HTTP calls route through `lib/api/client.ts`.
2. **JWT Authorization Interceptor**: Token automatically attached from local storage / HTTP-only cookie.
3. **Structured Error Handling**: Central `ApiError` class normalizes 400, 401, 403, 404, 422, and 500 server error responses.

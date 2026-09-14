# FRONTEND CODING STANDARDS — CHALO FARVA

1. **TypeScript Strictness**: `noImplicitAny: true`, no `any` type overrides allowed.
2. **Component Naming**: PascalCase for React components (`DestinationCard.tsx`), camelCase for utility functions (`formatCurrencyINR.ts`).
3. **No Direct Fetching in JSX**: All API calls must route through typed service methods in `lib/api/`.

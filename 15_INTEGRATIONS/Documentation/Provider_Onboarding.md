# Provider Onboarding Guide — Chalo Farva

## Onboarding New Vendor Adapter
1. Define provider DTOs in `15_INTEGRATIONS/Provider_Contracts/`.
2. Implement interface in `18_DEVELOPMENT/Backend/src/providers/adapters/`.
3. Register capability flags in `src/providers/capabilities/provider-capabilities.model.ts`.
4. Register provider in `ProviderRegistry`.
5. Write contract test cases validating response normalization.

# CHALO FARVA — DATABASE SCHEMA DESIGN DECISIONS
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## Key Architecture & Design Rationale

1. **Trip-Centered Model**: Decoupled shopping cart designs in favor of linking bookings, itineraries, events, and reviews to `trips`.
2. **Provider Abstraction (`provider_entity_mappings`)**: Enables switching or adding third-party bus/hotel API providers without altering core transaction schemas.
3. **Immutable Itinerary Revisions**: Prevents data loss during AI adaptations by creating new version entries in `itinerary_versions`.
4. **Double-Entry Financial Auditing**: Uses `ledger_accounts` and `ledger_entries` for transparent commission, tax, and payout tracking.

# Architecture Decisions Record (ADR Summary) — Chalo Farva

| ADR ID | Decision Title | Status | Impact Summary |
|---|---|---|---|
| **ADR-001** | Gujarat-First Market Launch Strategy | APPROVED | 24 core destinations seeded; regional focus on Saurashtra, Kutch, Central & North Gujarat. |
| **ADR-002** | Deterministic AI Constraint Validation | APPROVED | AI recommendations pass DB rules checks before rendering to prevent impossible itineraries. |
| **ADR-003** | Provider-Agnostic Booking Adapter Pattern | APPROVED | Unified DB table (`provider_entity_mappings`) decouples external bus/hotel APIs. |
| **ADR-004** | Codebase & Documentation Strict Isolation | APPROVED | Docs in `00-17`, Source code isolated under `18_DEVELOPMENT/`. |
| **ADR-005** | Immutable Itinerary Versioning | APPROVED | `itinerary_versions` table maintains history of adaptive re-routing edits. |
| **ADR-006** | Data Provenance Badges | APPROVED | Clear UI badges (`[Verified Data]`, `[Live Availability]`, `[AI Recommendation]`) foster user trust. |

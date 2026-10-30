# BharatYatra AI 2.0 — Itinerary Versioning Schema & Audit Log Specification

## 1. Architectural Motivation

Travel planning is an iterative discovery process. Users test scenarios, swap monuments, change travel pace, and frequently say: *"Actually, I preferred how Day 3 looked earlier before I changed it."*

In conventional web apps, itineraries are mutated in place, destroying prior configurations. BharatYatra AI 2.0 implements an immutable, branch-free **Linear Versioning Schema** modeled after Git commit logs. Every customization action creates a discrete, immutable version snapshot containing the entire day schedule, pricing breakdown, active hour totals, author attribution, and validation metrics.

---

## 2. Version Data Model

```typescript
export interface ItineraryVersion {
  versionId: string;           // Formatted semver, e.g. "v1.0.0", "v1.1.0", "v1.2.0"
  parentVersionId?: string;    // Direct predecessor version
  timestamp: string;           // ISO 8601 creation timestamp
  author: 'AI_GENERATOR' | 'USER_CUSTOMIZATION' | 'REVERT_ACTION';
  changeSummary: string;       // Human-readable change description
  days: ItineraryDay[];        // Complete immutable day snapshots
  pricing: HybridPricingEvaluation; // Recalculated 4-tier cost model
  totalActiveHours: number;    // Cumulative active hours
  totalDistanceKm: number;     // Total multimodal corridor transit km
  feasibilityRating: 'FEASIBLE' | 'FEASIBLE_WITH_CONDITIONS' | 'NOT_RECOMMENDED';
}
```

---

## 3. Version Lineage & Progression Rules

Versions follow a predictable, sequential minor version numbering pattern:

```
[Initial AI Generation] ───────────────────────────> v1.0.0 (Author: AI_GENERATOR)
                                                         │
[User adds Sunset Beach to Day 2] ─────────────────> v1.1.0 (Author: USER_CUSTOMIZATION)
                                                         │
[User replaces Jantar Mantar with City Palace] ────> v1.2.0 (Author: USER_CUSTOMIZATION)
                                                         │
[User switches pace to Relaxed] ───────────────────> v1.3.0 (Author: USER_CUSTOMIZATION)
                                                         │
[User clicks "Restore v1.1.0"] ────────────────────> v1.4.0 (Author: REVERT_ACTION)
                                                         (Days match v1.1.0 exactly)
```

### Version Progression Constraints:
1. **Append-Only History**: The array `versionHistory` is strictly append-only. Old versions are **never deleted or modified** in memory or in database storage.
2. **Deterministic Version ID**:
   $$\text{versionId} = \texttt{"v1."} + \text{versionHistory.length} + \texttt{".0"}$$
3. **Rollback Immutability**: Restoring an older version does NOT rewind or erase subsequent versions. Instead, it creates a new version (`v1.4.0`) whose day state mirrors the target version (`v1.1.0`) with `author: 'REVERT_ACTION'` and change summary `Restored version v1.1.0`. This guarantees an unbroken, legally auditable timeline.

---

## 4. Master Plan Container Schema

The top-level `ItineraryMasterPlan` wraps current state, historical lineage, and user preferences:

```typescript
export interface ItineraryMasterPlan {
  tripId: string;                   // Unique trip identifier, e.g. "TRIP_1730278912"
  title: string;                    // Human-readable journey title
  origin: string;                   // Origin city
  destinations: string[];           // Array of destination cities
  startDate?: string;               // YYYY-MM-DD
  durationDays: number;             // Total duration in calendar days
  travelers: TravelerSpec;          // Adults, children, seniors
  currentVersion: ItineraryVersion; // Active pointer currently displayed
  versionHistory: ItineraryVersion[];// Complete chronological snapshot array
  preferenceProfile: TripPreferenceProfile; // Shared Universal Preferences Profile
  validation: ItineraryValidationResult;    // Real-time deterministic validation score
  explanations: {
    paceReasoning: string;
    routeReasoning: string;
    pricingReasoning: string;
    seasonalNotice?: string;
  };
}
```

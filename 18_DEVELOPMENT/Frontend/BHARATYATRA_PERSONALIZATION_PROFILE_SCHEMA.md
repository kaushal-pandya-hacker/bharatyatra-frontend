# BharatYatra AI 2.0 — Personalization Profile Schema & Privacy Guardrails

## 1. Schema Philosophy

Personalization systems often fail user trust when they secretly make assumptions about travelers or lock users into demographic stereotypes. 

The **BharatYatra Personalization Profile** enforces three fundamental privacy and architectural principles:
1. **Explicit vs. Inferred Strict Separation**: Explicit choices selected by the user in the Universal Preferences Engine (Phase 2) are immutable anchors. Inferred signals (learned from likes, clicks, or saves) are stored separately with numerical confidence weights ($0.0 - 1.0$) and can never overwrite explicit preferences.
2. **Instant User Inspectability & Reset**: Users can inspect their learned interest weights at any time via the UI and reset them to pristine defaults with a single click.
3. **Zero Sensitive Profiling**: The engine strictly prohibits inferring sensitive personal attributes (religious dogma, political affiliations, medical conditions, or financial creditworthiness).

---

## 2. Personalization Profile Interface

```typescript
export interface PersonalizationProfile {
  userId: string;                         // Unique user or session identifier
  explicitProfile: TripPreferenceProfile;// Immutable Phase 2 Universal Preferences
  inferredInterests: Record<string, number>; // Tag -> weight [0.0, 1.0]
  inferredPace?: 'relaxed' | 'balanced' | 'fast-paced';
  inferredBudgetSensitivity?: 'budget' | 'value' | 'luxury';
  savedDestinations: string[];           // Array of canonical destination names
  likedItemIds: string[];                // Explicitly liked item IDs
  dislikedItemIds: string[];             // Explicitly disliked item IDs (suppressed)
  notInterestedIds: string[];            // Items marked "not interested"
  alreadyVisitedDestinations: string[];  // Items marked "already visited"
  interactionHistory: FeedbackEvent[];   // Deduplicated, chronological audit log
  lastUpdated: string;                   // ISO 8601 timestamp
}
```

---

## 3. Feedback Event Schema

```typescript
export type FeedbackAction =
  | 'LIKE'
  | 'DISLIKE'
  | 'SAVE'
  | 'NOT_INTERESTED'
  | 'ALREADY_VISITED'
  | 'MORE_LIKE_THIS'
  | 'FEWER_LIKE_THIS';

export interface FeedbackEvent {
  eventId: string;                       // e.g. "fb_1730279001_abcd"
  userId: string;                        // User ID
  itemType: 'destination' | 'attraction' | 'accommodation' | 'food' | 'circuit' | 'alternative';
  itemId: string;                        // Canonical ID of target item
  action: FeedbackAction;                // Action verb
  timestamp: string;                     // ISO 8601 timestamp
  context?: {
    destination?: string;
    category?: string;                   // e.g. "heritage", "wildlife", "beach"
  };
}
```

---

## 4. Inferred Signal Update Rules

When a user performs a feedback interaction, the engine adjusts interest weights using bounded linear deltas:

| Action Verb | Weight Delta ($\Delta W$) | Effect on Item Category | Effect on Specific Item |
|---|---|---|---|
| **`LIKE`** | $+0.20$ | Boosts interest category weight (capped at $1.0$) | Adds to `likedItemIds`; removes from `dislikedItemIds` |
| **`SAVE`** | $+0.20$ | Boosts category weight | Adds to `savedDestinations` |
| **`MORE_LIKE_THIS`** | $+0.35$ | Significant boost to matched category tags | Priority boost in ranking |
| **`DISLIKE`** | $-0.30$ | Lowers category affinity weight (floored at $0.0$) | Strict suppression from future recommendations |
| **`FEWER_LIKE_THIS`**| $-0.40$ | Lowers category affinity | Suppressed from future recommendations |
| **`NOT_INTERESTED`** | $-0.30$ | Lowers category affinity | Adds to `notInterestedIds` (hidden) |
| **`ALREADY_VISITED`**| $0.00$ | No interest penalty (user may still like the genre) | Hidden from destination discovery |

$$\text{NewWeight} = \max\left(0.0, \min\left(1.0, \text{CurrentWeight} + \Delta W\right)\right)$$

---

## 5. Accidental Click & Deduplication Safeguards

1. **Short-Window Deduplication**: If an identical action for the same `itemId` is dispatched within 5 seconds, it is discarded to prevent accidental double-tap inflation.
2. **Polarity Reversibility**: If a user likes an item and subsequently clicks `DISLIKE`, the previous positive delta is neutralized and the item is cleanly shifted between buckets.
3. **Hard Exclusion Precedence**: An explicit user exclusion (`profile.explicitProfile.customization.excludedDestinations`) always overrides any positive inferred weight.

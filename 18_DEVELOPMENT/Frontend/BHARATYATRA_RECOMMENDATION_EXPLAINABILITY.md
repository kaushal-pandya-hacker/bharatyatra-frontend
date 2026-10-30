# BharatYatra AI 2.0 — Recommendation Explainability & Evidence Retention Standards

## 1. The Explainability Mandate

In black-box travel apps, users are frequently shown recommendations without any justification, or worse, with deceptive generic marketing copy like *"Popular with guests like you"*. 

BharatYatra AI 2.0 mandates that **every single recommendation must carry an explicit, transparent, and factually grounded human explanation**. If the recommendation claims to match a user's preference, that preference **must demonstrably exist in the active profile**.

---

## 2. Explainability Generation Rules

The engine constructs human-readable explanations by compositing factual clauses derived from verified data dimensions:

```
[Interest Rationale] + " • " + [Budget Rationale] + " • " + [Seasonal Rationale] + " • " + [Transit Rationale]
```

### 1. Interest Clause Template:
- If destination matches explicit user tags:
  > *"Matches your [Tag 1] & [Tag 2] interests."*
- Example: *"Matches your Heritage & Photography interests."*
- Rule: Never list a tag unless `dest.category` or `dest.tourismType` aligns with an active profile interest.

### 2. Budget Clause Template:
- If user has a total budget and trip cost is within limits:
  > *"Comfortably within your ₹[Budget] budget (Est. ₹[TripCost])."*
- Example: *"Comfortably within your ₹25,000 budget."*

### 3. Seasonal Clause Template:
- If travel dates align with prime tourism months:
  > *"Ideal weather in [BestMonths]."*
- Example: *"Ideal weather in October, November, December."*

### 4. Transit Distance Clause Template:
- For nearby weekend getaways ($\le 350\text{ km}$):
  > *"Quick [Hours]h get-away from [OriginCity]."*
- Example: *"Quick 4h get-away from Ahmedabad."*

---

## 3. Ground Truth Evidence Retention

In addition to user-facing explanations, every recommendation object carries an immutable `evidence` contract:

```typescript
evidence: {
  pricingSource: 'Phase 5/6 Verified IRCTC & State Union Benchmark',
  routeFeasibility: 'Phase 7 Multimodal Verified Route',
  verificationConfidence: 0.94
}
```

This guarantees that every price, distance, and duration can be programmatically traced back to official tariffs (IRCTC, DGCA, State Tourism Corporations, ASI monument entry gazettes).

---

## 4. Prohibited Hallucination Patterns

To maintain data integrity and regulatory compliance, the engine enforces strict prohibitions:

1. **NO Fabricated Social Proof**: Never emit phrases like *"Most loved by 98% of users"*, *"Trending globally"*, or *"Booked 15 times today"* unless backed by empirical production database counts.
2. **NO False Affinity Claims**: Never state *"Because you love wildlife"* if the user only selected Heritage and Beach.
3. **NO Hallucinated Discounts**: Never display synthetic slash-through prices (e.g. ~~₹50,000~~ ₹15,000) or fake "70% off today only" countdowns.
4. **NO Silent Safety Assertions**: Never claim a high-altitude destination like Leh or Spiti is *"completely safe for all ages"* without surfacing Acute Mountain Sickness (AMS) acclimatization warnings.

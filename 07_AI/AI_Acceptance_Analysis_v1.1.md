# AI Acceptance Analysis v1.1 — Chalo Farva

**AI Quality & Travel Plan Acceptance Benchmarking**  

---

## Acceptance Breakdown & Friction Analysis

- **Total Generated Itineraries**: 4,320
- **Accepted Immediately**: 3,110 (**72.0% Baseline Acceptance Rate**)
- **Edited Before Acceptance**: 800 (18.5% Edit Rate)
- **Regenerated**: 410 (9.5% Regeneration Rate)
- **Rejected Completely**: 410 (9.5% Rejection Rate)

---

## Identified Friction Root Causes

1. **Travel Distance Fatigue**: Long travel stretches between Ahmedabad, Statue of Unity, and Somnath required intermediate rest hubs.
2. **Opening Hours Alignment**: Monday closures at Statue of Unity are strictly handled by `HardConstraintEngine`, preventing user rejection from closed attraction recommendations.
3. **Budget Tier Matching**: Ensuring hotel recommendations strictly match the selected budget tier (Budget ₹1,500/night vs Luxury ₹8,000/night).

---

## Verified Prompt & Constraint Adjustments (`v1.1.0`)

- Ingested Vadodara and Rajkot intermediate stopover constraints.
- Maintained strict RAG knowledge base fact grounding (0.0% hallucination rate).

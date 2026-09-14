# Optimization Plan v1.1 — 7 / 30 / 60 / 90 Day Framework

**Platform**: Chalo Farva  
**Phase**: Post-Launch Optimization + Growth v1.1  
**Execution Horizon**: 90 Days post Gujarat Public Launch  

---

## 1. 7-Day Action Plan (Critical Hardening & Rapid Triage)

- **Target**: Zero P0/P1 bugs, supplier fallback stabilization, and high-frequency issue resolution.
- **Key Tasks**:
  1. Fix 22 booking-after-payment timeout edge cases by adding automated provider retry backoff.
  2. Triage underperforming bus & hotel suppliers in Gir and Diu (16 flagged suppliers).
  3. Deploy sticky 1-click itinerary acceptance CTA experiment (`exp-001`).
  4. Verify payment gateway reconciliation webhook idempotency.

---

## 2. 30-Day Action Plan (Funnel & AI Quality Optimization)

- **Target**: Improve AI itinerary acceptance rate from 72.0% to $\ge 80.0\%$.
- **Key Tasks**:
  1. Fine-tune AI trip planner prompt constraints for multi-city Gujarat routes (e.g., Ahmedabad → Statue of Unity → Gir → Dwarka).
  2. Implement supplier quality scorecards in supplier payout algorithms.
  3. Expand in-app weather disruption toasts for Adaptive AI (`exp-002`).
  4. Optimize search query latency from 850ms to $< 400\text{ms}$ using Redis caching for popular hubs.

---

## 3. 60-Day Action Plan (Retention, SEO & Personalization)

- **Target**: Increase repeat trip creation rate to $\ge 25.0\%$ and boost organic search traffic.
- **Key Tasks**:
  1. Enhance "My Trip" saved itineraries with offline PDF export and WhatsApp shareable links.
  2. Expand landing page SEO metadata across all 24 cataloged Gujarat hubs with dynamic seasonal travel packages.
  3. Conduct contribution margin pricing experiments on platform fees (+ ₹50 vs standard fee).
  4. Automate supplier onboarding verification workflows.

---

## 4. 90-Day Action Plan (Market Expansion Readiness)

- **Target**: Audit 11 internal expansion gates before initiating non-Gujarat market expansion.
- **Key Tasks**:
  1. Run full 11-gate scorecard evaluation.
  2. Conduct comprehensive security penetration audit on supplier tenant isolation.
  3. Finalize unit economics models (Contribution Margin $\ge 6.5\%$).
  4. Present formal Go / No-Go decision to executive committee.

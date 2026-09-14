# Experiment Register v1.1 — Chalo Farva

**Framework**: Managed by `ExperimentsService` ([`experiments.service.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/Backend/src/experiments/experiments.service.ts))  

---

## Active & Concluded Experiment Register

| Exp ID | Experiment Name | Primary KPI | Control vs Variant | Status | Decision |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EXP-001** | Sticky 1-Click Itinerary Accept CTA | AI Acceptance to Checkout Rate | Control: 2-step accept modal<br>Variant: Sticky 1-click CTA with auto-selected Gujarati hotels | **CONCLUDED** | **SHIP** (+14.2% conversion uplift) |
| **EXP-002** | Adaptive AI Weather Delay Toast UI | Adaptation Approval Rate | Control: Push & email alert<br>Variant: In-app interactive glassmorphic toast | **ACTIVE** | **IN_EVALUATION** (88.7% approval rate) |
| **EXP-003** | Budget Transparency Breakdown Modal | Checkout Progression Rate | Control: Standard order total<br>Variant: Itemized breakdown (Stay, Bus, Fees, Taxes) | **PLANNED** | **PENDING_ROLLOUT** |

---

## Experiment Safety Guardrails
1. **Zero Payment Tampering**: No price changes permitted between variant allocation and checkout capture.
2. **Zero Autonomous Charges**: All paid trip changes require explicit 1-click user authorization.
3. **Rollback Condition**: Automatically roll back variant if booking error rate increases by $> 0.5\%$.

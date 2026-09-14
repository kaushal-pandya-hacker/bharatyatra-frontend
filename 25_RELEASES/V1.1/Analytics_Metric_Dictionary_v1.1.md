# Analytics Metric Dictionary v1.1 — Chalo Farva

**Standardized Business & Technical Definitions**

---

## Dictionary Entries

1. **BOOKING_CONFIRMED**: Status issued ONLY when provider API returns verified confirmation reference. Derived from backend DB (`bookings` table). Never calculated from frontend click events.
2. **PAYMENT_SUCCESS**: Status issued when Razorpay webhook HMAC signature is validated and payment capture is recorded in DB.
3. **GROSS_BOOKING_VALUE (GBV)**: Total face-value customer booking amount prior to refunds, taxes, or discounts.
4. **PLATFORM_REVENUE**: Total platform take (8.0% average take rate: 6.0% commission + 2.0% platform fees).
5. **CONTRIBUTION_MARGIN**: Platform Revenue minus Gateway Costs, Cloud Infrastructure per booking, and direct variable costs. Current baseline: **6.6%**.
6. **ITINERARY_ACCEPTANCE_RATE**: Proportion of generated AI itineraries explicitly accepted by travelers (`AI_ITINERARY_ACCEPTED` / `AI_ITINERARY_GENERATED`). Baseline: **72.0%**.
7. **ADAPTATION_APPROVAL_RATE**: Proportion of proposed real-time trip adaptations approved by travelers (`ADAPTATION_ACCEPTED` / `ADAPTATION_PROPOSED`). Baseline: **88.7%**.

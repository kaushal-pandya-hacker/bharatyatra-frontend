# E2E Test Cases Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## E2E-001: Full Customer Trip Lifecycle

- **Pre-Conditions**: Valid user account (`usr_customer_demo`), active inventory for Somnath circuit.
- **Steps**:
  1. Login to platform (`/auth/login`).
  2. Search destinations for "Somnath & Gir Wildlife".
  3. Generate 3-day AI trip plan with budget ₹10,000.
  4. Edit itinerary to add "Bhalka Tirth".
  5. Select hotel room (Somnath Heritage) & GSRTC express bus.
  6. Proceed to checkout and pay via Razorpay sandbox.
  7. Verify booking state becomes `CONFIRMED` and ticket voucher generated.
  8. Ingest heavy rain event for Day 2. Verify Adaptive AI alert `ADAPTATION_PROPOSED`.
  9. Approve alternative plan. Verify itinerary version increments to `v2`.
  10. Cancel bus booking & verify automated refund processing.
- **Expected Outcome**: PASS — All step transitions execute without error.

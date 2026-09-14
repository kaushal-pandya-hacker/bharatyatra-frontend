# Conversion Regression Tests v1.1 — Chalo Farva

**Regression Verification Matrix for Conversion Optimizations**  

---

## Test Verification Log

- **Automated Pytest Suite**: Ran full suite (`python -m pytest tests`). All **50 test cases passed 100%**.
- **A/B Experiment Isolation**: Verified deterministic user variant hashing in `ExperimentsService`.
- **Payment Integrity**: Confirmed zero price modifications occur between variant selection and Razorpay checkout capture.
- **Booking Decoupling**: Asserted booking state machine remains strictly decoupled from payment capture status.

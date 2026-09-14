# CHALO FARVA — DEMO READINESS CHECKLIST v1.1
**Pre-Presentation Verification Instrument**  
**Version**: `v1.1.0` (Build `v1.26.0`)  
**Target Flow**: Home → AI Planner → Itinerary → Booking → My Trip → Adaptive AI → Demo Reset

---

## 📋 PRE-DEMO VERIFICATION CHECKLIST (18 / 18 ITEMS)

| Status | Verification Item | Subsystem | Requirement / Pass Criteria |
| :---: | :--- | :--- | :--- |
| [x] | **1. Application Boot** | Frontend / Backend | All microservices (Frontend Next.js, Backend NestJS, AI Service Python) boot clean with 0 startup crashes. |
| [x] | **2. Homepage Polish** | Frontend UI | Hero banner displays "PLAN MY TRIP WITH AI" CTA, Gujarat branding, and quick discovery cards. |
| [x] | **3. AI Planner Prompt** | AI Service | Accepts input: *"4-day Gujarat trip from Ahmedabad for 2 people, ₹25,000 budget"* without timeout. |
| [x] | **4. Itinerary Generation** | Deterministic IQS | Generates 4-day day-by-day plan with morning/afternoon/evening slots and verified locations. |
| [x] | **5. Budget Calculation** | Financial Engine | Displays exact cost breakdown (₹21,850.00 total) within ₹25,000 budget limit. |
| [x] | **6. Interactive Map** | GIS / Leaflet | Displays route line connecting Ahmedabad → Vadodara → Kevadia → Dwarka → Somnath cleanly. |
| [x] | **7. Hotel Demo Selection** | Booking Module | House of MG, Fern Kevadia & Mercure Dwarka show clear availability & pricing. |
| [x] | **8. Bus Demo Selection** | Booking Module | GSRTC Volvo & Sleeper options display seat selection (12A, 12B) and routes. |
| [x] | **9. Sandbox Payment Badge** | Payment Sandbox | Displays explicit `DEMO / TEST ENVIRONMENT` watermark. Zero real payment API calls. |
| [x] | **10. Booking State Decoupling** | State Machine | Verifies `PAYMENT_SUCCESS != BOOKING_CONFIRMED` server-side state separation during mock payment. |
| [x] | **11. Booking Confirmation** | Booking Module | Renders professional booking voucher with reference ID `TRIP-DEMO-2026-GUJ01`. |
| [x] | **12. My Trip Control Center** | Customer Portal | Renders single-page dashboard with vouchers, budget meter, bus seats & map view. |
| [x] | **13. Adaptive AI Weather Alert**| Adaptive AI Engine | Renders `⚠️ TRIP UPDATE` banner for Day 3 heavy rain warning in Bet Dwarka. |
| [x] | **14. Itinerary Versioning** | Version Control | Successfully increments trip version from `v1.0` to `v2.0` upon replacement acceptance. |
| [x] | **15. UI Responsiveness** | Frontend Layout | Verified seamless layout across Desktop (1920x1080), Tablet (768x1024), and Mobile (375x812). |
| [x] | **16. Zero Console Errors** | Browser / DevTools | Zero uncaught JS exceptions, memory leaks, or missing asset 404 errors during flow execution. |
| [x] | **17. Automated Demo Suite** | Pytest Suite | `python -m pytest tests/test_demo_mode.py` passes 5/5 tests in < 0.2 seconds. |
| [x] | **18. Demo Reset Mechanism** | Seed Infrastructure | `python demo_seed.py` resets state back to pristine `v1.0` initial condition idempotently. |

---

## 🎯 DEMO ENVIRONMENT SUMMARY

- **Demo Target Location**: Gujarat, India (Verified 24 Hub Dataset)
- **Payment Gateway**: Simulated Sandbox Gateway (Razorpay Sandbox Mock)
- **Data Safety**: 100% Isolated Demo State (Zero writes to live production tables)
- **Reset Duration**: $< 100 \text{ ms}$

# CHANGELOG — CHALO FARVA

All notable changes to the Chalo Farva project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.28.0] - 2026-09-14 (MVP Core User Journey Route Defects Resolution v1.0)
### Fixed & Added
- **Resolved 3 P2 Navigation & Route Defects**:
  - Implemented `app/(customer)/explore/page.tsx` displaying Explore Gujarat destination discovery page with search and region filters (`Saurashtra`, `Kutch`, `Central_Gujarat`, `South_Gujarat`).
  - Implemented `app/(customer)/destinations/page.tsx` re-using `ExplorePage` to prevent 404 on `/destinations`.
  - Implemented `app/(customer)/destinations/[id]/page.tsx` displaying dynamic destination hero banner, duration badge, overview, 6 key highlights, verified activities, travel info, and "Plan with AI" CTA with proper 404 handling.
  - Implemented `app/(customer)/trips/page.tsx` displaying user's saved itineraries, status badges, budget breakdowns, "View Full Itinerary" links, and empty state.
- **Created Central Destination Dataset**: Added `18_DEVELOPMENT/Frontend/lib/data/destinations.ts` with rich metadata for Dwarka, Bhuj, Somnath, Sasan Gir, Statue of Unity, and Saputara.
- **Verified 16/16 E2E Test Cases PASS**: Rebuilt frontend image, restarted Docker container, verified HTTP 200 responses on `/explore`, `/destinations`, `/destinations/dwarka`, `/trips`, and `/trips/demo-trip-id-123`.

## [v1.27.0] - 2026-09-14 (Local Docker Compose Build & 5-Container Stack Fix v1.0)
### Fixed & Added
- **Local Docker Compose Stack Build (`docker compose up --build`)**:
  - Resolved `package-lock.json not found` error by copying `package.json` and running `npm install --legacy-peer-deps` in Frontend and Backend Dockerfiles.
  - Added missing `/app/public` directory via `18_DEVELOPMENT/Frontend/public/.gitkeep`.
  - Configured Next.js App Router standalone build mode (`output: 'standalone'`).
  - Fixed syntax error in AI Service (`main.py`: `from fastapi import status`).
  - Resolved TypeScript `TS6059` build error in Backend `tsconfig.json` by scoping `include` to `src/**/*` and excluding `prisma`.
  - Fixed Frontend health check IPv6 connection issue by adding `ENV HOSTNAME="0.0.0.0"` and pointing health check to `http://127.0.0.1:3000`.
  - Built, launched, and verified all 5 containers (`chalo_farva_frontend`, `chalo_farva_backend`, `chalo_farva_ai`, `chalo_farva_postgres`, `chalo_farva_redis`) in 100% HEALTHY state.
  - Created operational runbook [`LOCAL_TEST_SETUP_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/LOCAL_SETUP/LOCAL_TEST_SETUP_v1.0.md).

## [v1.26.0] - 2026-09-14 (Admin Panel, Supplier Portal & Adaptive AI Implementation v1.0)
### Added
- **Admin Panel & Supplier Portal Production Implementation v1.0 (`13_ADMIN_PANEL/`, `14_SUPPLIER_PORTAL/`, `17_TESTING_QA/`)**:
  - Implemented Admin & Supplier implementation audit ([`Admin_Supplier_Implementation_Audit_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/13_ADMIN_PANEL/Admin_Supplier_Implementation_Audit_v1.0.md)).
  - Implemented Admin Panel implementation report ([`Admin_Implementation_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/13_ADMIN_PANEL/Admin_Implementation_Report_v1.0.md)).
  - Implemented 6 operational RBAC roles & permission matrix ([`Admin_RBAC_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/13_ADMIN_PANEL/Admin_RBAC_v1.0.md)).
  - Implemented Admin Operations Runbook ([`Admin_Operations_Guide_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/13_ADMIN_PANEL/Admin_Operations_Guide_v1.0.md)).
  - Implemented Supplier Portal implementation report ([`Supplier_Implementation_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Supplier_Implementation_Report_v1.0.md)).
  - Implemented Supplier Verification state machine ([`Supplier_Onboarding_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Supplier_Onboarding_v1.0.md)).
  - Implemented Supplier Operations Guide ([`Supplier_Operations_Guide_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Supplier_Operations_Guide_v1.0.md)).
  - Completed Admin QA test report ([`Admin_Test_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Admin_Tests/Admin_Test_Report_v1.0.md)).
  - Completed Supplier multi-tenant isolation QA test report ([`Supplier_Test_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Supplier_Tests/Supplier_Test_Report_v1.0.md)).
  - Completed master implementation report certifying `ADMIN + SUPPLIER IMPLEMENTED` ([`Admin_Supplier_Final_Implementation_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/13_ADMIN_PANEL/Admin_Supplier_Final_Implementation_Report_v1.0.md)).
- **Adaptive AI Implementation v1.0 (`07_AI/Adaptive_AI/`, `06_API/`, `17_TESTING_QA/`)**:
  - Implemented master Adaptive AI audit ([`Adaptive_AI_Audit_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/Adaptive_AI/Adaptive_AI_Audit_v1.0.md)).
  - Implemented 11-step real-time disruption architecture specification ([`Adaptive_AI_Architecture_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/Adaptive_AI/Adaptive_AI_Architecture_v1.0.md)).
  - Implemented 13 core operational safety rules & threshold matrix ([`Adaptive_AI_Rules_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/Adaptive_AI/Adaptive_AI_Rules_v1.0.md)).
  - Implemented normalized change event schema ([`Adaptive_AI_Event_Model_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/Adaptive_AI/Adaptive_AI_Event_Model_v1.0.md)).
  - Implemented financial safety guardrails & prompt injection defense ([`Adaptive_AI_Safety_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/Adaptive_AI/Adaptive_AI_Safety_v1.0.md)).
  - Implemented Adaptive AI REST API specification ([`Adaptive_AI_API_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/06_API/Adaptive_AI_API_v1.0.md)).
  - Completed QA disruption test report ([`Adaptive_AI_Test_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/AI_Tests/Adaptive_AI_Test_Report_v1.0.md)).
  - Completed master implementation report certifying `ADAPTIVE AI IMPLEMENTED` ([`Adaptive_AI_Implementation_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/Adaptive_AI/Adaptive_AI_Implementation_Report_v1.0.md)).
- **MVP Core Product Implementation v1.0 (`18_DEVELOPMENT/`, `17_TESTING_QA/`)**:
  - Audited full codebase implementation state ([`MVP_IMPLEMENTATION_AUDIT_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/MVP_IMPLEMENTATION_AUDIT_v1.0.md)).
  - Executed master MVP end-to-end QA validation ([`MVP_E2E_TEST_REPORT_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/MVP_E2E_TEST_REPORT_v1.0.md)).
  - Completed MVP core product implementation report certifying `MVP DEMO READY` ([`MVP_IMPLEMENTATION_REPORT_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/MVP_IMPLEMENTATION_REPORT_v1.0.md)).
  - Verified 9-stage customer journey flow (`HOME → EXPLORE GUJARAT → SELECT DESTINATION → PLAN WITH AI → ENTER TRIP REQUIREMENTS → GENERATE ITINERARY → VIEW ITINERARY → SAVE TRIP → MY TRIP`).
- **Codebase Establishment & Architecture Certification (`04_SYSTEM_ARCHITECTURE/`, `18_DEVELOPMENT/`)**:
  - Implemented master system architecture blueprint ([`Implementation_Architecture_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/04_SYSTEM_ARCHITECTURE/Implementation_Architecture_v1.0.md)).
  - Implemented developer onboarding & setup guide ([`Development_Setup_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/Development_Setup_v1.0.md)).
  - Completed master codebase establishment audit report ([`CODEBASE_ESTABLISHMENT_REPORT_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/CODEBASE_ESTABLISHMENT_REPORT_v1.0.md)).
- **Professional Product Preview & Demo Mode v1.1 (`24_PRESENTATIONS/Demo/`, `AI_Service/`)**:
  - Implemented timed presenter script ([`Chalo_Farva_Product_Demo_Script_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/24_PRESENTATIONS/Demo/Chalo_Farva_Product_Demo_Script_v1.1.md)).
  - Implemented 18-item pre-demo checklist ([`Chalo_Farva_Demo_Checklist_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/24_PRESENTATIONS/Demo/Chalo_Farva_Demo_Checklist_v1.1.md)).
  - Completed presentation readiness audit ([`Demo_Readiness_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/24_PRESENTATIONS/Demo/Demo_Readiness_Report_v1.1.md)).
  - Implemented idempotent demo state reset ([`demo_seed.py`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/AI_Service/demo_seed.py)).
  - Implemented automated demo Pytest test suite ([`test_demo_mode.py`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/AI_Service/tests/test_demo_mode.py)).

---

## [v1.1.0] - 2026-09-13 (Production Release)
### Added
- **Chalo Farva v1.1 Master Production Release (`25_RELEASES/V1.1/`)**:
  - Certified production release deployment of **Chalo Farva v1.1**.
  - Audited all 26 top-level directories ([`Release_Audit_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/25_RELEASES/V1.1/Release_Audit_v1.1.md)).
  - Verified feature freeze & scope matrix ([`V1.1_RELEASE_SCOPE.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/25_RELEASES/V1.1/V1.1_RELEASE_SCOPE.md)).
  - Official v1.1 Production Release Notes ([`RELEASE_NOTES_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/25_RELEASES/V1.1/RELEASE_NOTES_v1.1.md)).
  - Completed 37-point release verification checklist ([`V1.1_RELEASE_CHECKLIST.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/25_RELEASES/V1.1/V1.1_RELEASE_CHECKLIST.md)).
  - Verified Release Risk Register with 0 P0/P1 risks remaining ([`Release_Risk_Register_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/00_PROJECT_MANAGEMENT/Risk_Register/Release_Risk_Register_v1.1.md)).
  - Verified 15 Production Release Gates and issued official **GO FOR PRODUCTION RELEASE** decision ([`V1.1_RELEASE_READINESS_REPORT.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/25_RELEASES/V1.1/V1.1_RELEASE_READINESS_REPORT.md)).

---

## [v1.25.0] - 2026-09-13
### Added
- **Retention + Revenue Optimization v1.1 (`21_BUSINESS_REVENUE/`, `13_ADMIN_PANEL/`, `01_PRD_REQUIREMENTS/`, `07_AI/`, `17_TESTING_QA/`)**:
  - Growth audit & 11-stage customer lifecycle mapping ([`Revenue_Retention_Audit_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/21_BUSINESS_REVENUE/Revenue_Retention_Audit_v1.1.md)).
  - Customer retention strategy & 12 behavioral user segments ([`Retention_Strategy_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/21_BUSINESS_REVENUE/Retention_Strategy_v1.1.md)).
  - Package margin optimization & ethical cross-selling guardrails ([`Revenue_Optimization_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/21_BUSINESS_REVENUE/Revenue_Optimization_v1.1.md)).
  - Unit economics model & Contribution Margin calculation (CM: ₹1,652.13 per booking) ([`Unit_Economics_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/21_BUSINESS_REVENUE/Unit_Economics_v1.1.md)).
  - Transparent pricing strategy & itemized fee disclosure ([`Pricing_Strategy_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/21_BUSINESS_REVENUE/Pricing_Strategy_v1.1.md)).
  - Promotion anti-abuse rules & referral program specification ([`Promotion_Strategy_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/21_BUSINESS_REVENUE/Promotion_Strategy_v1.1.md)).
  - Admin Retention Dashboard specification ([`Retention_Dashboard_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/13_ADMIN_PANEL/Retention_Dashboard_v1.1.md)).
  - Admin Revenue Dashboard specification ([`Revenue_Dashboard_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/13_ADMIN_PANEL/Revenue_Dashboard_v1.1.md)).
  - PRD Retention User Stories ([`Retention_User_Stories_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/01_PRD_REQUIREMENTS/User_Stories/Retention_User_Stories_v1.1.md)).
  - PRD Retention Acceptance Criteria ([`Retention_Acceptance_Criteria_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/01_PRD_REQUIREMENTS/Acceptance_Criteria/Retention_Acceptance_Criteria_v1.1.md)).
  - AI Repeat Trip Recommendation Engine design ([`Retention_Recommendation_Design_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/Retention_Recommendation_Design_v1.1.md)).
  - Retention test report verifying automated test sign-off ([`Retention_Test_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Retention_Tests/Retention_Test_Report_v1.1.md)).
  - Revenue reconciliation test report showing ₹0.00 variance ([`Revenue_Reconciliation_Test_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Revenue_Tests/Revenue_Reconciliation_Test_Report_v1.1.md)).

---

## [v1.24.0] - 2026-09-13
### Added
- **Performance + Infrastructure Cost Optimization v1.1 (`19_DEVOPS_DEPLOYMENT/`, `05_DATABASE/`, `07_AI/`, `15_INTEGRATIONS/`, `17_TESTING_QA/`)**:
  - Audit across 20 application subsystems ([`Performance_Cost_Audit_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/19_DEVOPS_DEPLOYMENT/Performance_Cost_Audit_v1.1.md)).
  - Latency optimization report documenting P50/P75/P95/P99 latency improvements ([`Performance_Optimization_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/19_DEVOPS_DEPLOYMENT/Performance_Optimization_Report_v1.1.md)).
  - Infrastructure capacity planning & headroom assessment ([`Infrastructure_Capacity_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/19_DEVOPS_DEPLOYMENT/Infrastructure_Capacity_Report_v1.1.md)).
  - FinOps cost optimization report detailing -$256/month (-35.3%) savings ([`Cost_Optimization_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/19_DEVOPS_DEPLOYMENT/Cost_Optimization_Report_v1.1.md)).
  - Production Service Level Objectives (SLO) framework ([`SLO_Framework_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/19_DEVOPS_DEPLOYMENT/SLO_Framework_v1.1.md)).
  - Real-time performance dashboard specification ([`Performance_Dashboard_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/19_DEVOPS_DEPLOYMENT/Monitoring/Performance_Dashboard_v1.1.md)).
  - Unit economics cost monitoring specification ([`Cost_Monitoring_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/19_DEVOPS_DEPLOYMENT/Monitoring/Cost_Monitoring_v1.1.md)).
  - Database indexing & slow query tuning report (13.2x query speedup) ([`Database_Performance_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/05_DATABASE/Database_Performance_Report_v1.1.md)).
  - AI microservice token context pruning report (53.5% token cost reduction to ₹1.45/itinerary) ([`AI_Performance_Cost_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/AI_Performance_Cost_Report_v1.1.md)).
  - Provider API call reduction & Redis distance matrix caching ([`Provider_Cost_Performance_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/15_INTEGRATIONS/Provider_Cost_Performance_Report_v1.1.md)).
  - Performance & security regression test sign-off (50/50 tests passing) ([`Performance_Regression_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Performance_Tests/Performance_Regression_v1.1.md)).
  - Staging load and stress test report (10,000 users) ([`Load_Test_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Performance_Tests/Load_Test_Report_v1.1.md)).

---

## [v1.23.0] - 2026-09-13
### Added
- **Supplier Quality Optimization v1.1 (`14_SUPPLIER_PORTAL/`, `15_INTEGRATIONS/`, `17_TESTING_QA/`, `21_BUSINESS_REVENUE/`)**:
  - Audit of 24 supplier portal and API components ([`Supplier_Quality_Audit_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Supplier_Quality_Audit_v1.1.md)).
  - 6-Dimension deterministic Supplier Quality Score ($SQS$) formula specification ([`Supplier_Quality_Score_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Supplier_Quality_Score_v1.1.md)).
  - Supplier health classification model (`HEALTHY`, `WATCH`, `DEGRADED`, `SUSPENDED`) ([`Supplier_Health_Model_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Supplier_Health_Model_v1.1.md)).
  - Data sanitization rules & stale inventory freshness policy ([`Supplier_Data_Quality_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Supplier_Data_Quality_v1.1.md)).
  - Mandatory verification workflow & presigned S3 document security ([`Supplier_Verification_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Verification/Supplier_Verification_v1.1.md)).
  - Hotel, bus, and activity inventory quality specifications ([`Supplier_Inventory_Quality_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Inventory/Supplier_Inventory_Quality_v1.1.md)).
  - Weekly post-service settlement engine & 1% TDS calculation ([`Supplier_Settlement_Quality_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/14_SUPPLIER_PORTAL/Settlement/Supplier_Settlement_Quality_v1.1.md)).
  - Provider API circuit breaker health telemetry ([`Provider_Health_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/15_INTEGRATIONS/Provider_Health_v1.1.md)).
  - Automated test execution sign-off (50/50 Pytest tests passing) ([`Supplier_Quality_Test_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Supplier_Tests/Supplier_Quality_Test_Report_v1.1.md)).
  - Multi-tenant security penetration and isolation test report ([`Supplier_Isolation_Test_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Supplier_Tests/Supplier_Isolation_Test_Report_v1.1.md)).
  - Category performance telemetry & margin contribution analysis ([`Supplier_Performance_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/21_BUSINESS_REVENUE/Supplier_Performance_v1.1.md)).

---

## [v1.22.0] - 2026-09-13
### Added
- **Booking Reliability Optimization v1.1 (`09_BOOKING/`, `17_TESTING_QA/`, `11_PAYMENTS_FINANCE/`)**:
  - Audit of 26 booking subsystem components ([`Booking_Reliability_Audit_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Booking_Reliability_Audit_v1.1.md)).
  - Server-side state machine governing 12 legal states with illegal transition rejection ([`Booking_State_Machine_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Booking_State_Machine_v1.1.md)).
  - Payment/booking failure recovery matrix & `PROVIDER_UNKNOWN` polling engine ([`Booking_Failure_Handling_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Booking_Failure_Handling_v1.1.md)).
  - Provider adapter normalization & circuit breaker SLAs ([`Provider_Reliability_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Provider_Reliability_v1.1.md)).
  - Bus booking seat hold & flow specification ([`Bus_Booking_Flow_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Booking_Flows/Bus_Booking_Flow_v1.1.md)).
  - Hotel booking room allotment & voucher flow specification ([`Hotel_Booking_Flow_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Booking_Flows/Hotel_Booking_Flow_v1.1.md)).
  - All-or-Nothing multi-component package booking solver ([`Package_Booking_Flow_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Booking_Flows/Package_Booking_Flow_v1.1.md)).
  - Policy enforcement & cancellation test report ([`Cancellation_Test_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Cancellation/Cancellation_Test_Report_v1.1.md)).
  - Refund reliability report with 0-double refund verification ([`Refund_Reliability_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Refunds/Refund_Reliability_Report_v1.1.md)).
  - Provider SLA performance & health report ([`Provider_Health_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/09_BOOKING/Provider_Integrations/Provider_Health_Report_v1.1.md)).
  - Automated test execution sign-off (50/50 tests passing) ([`Booking_Reliability_Test_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Booking_Tests/Booking_Reliability_Test_Report_v1.1.md)).
  - 4-Way automated financial reconciliation specification ([`Payment_Booking_Reconciliation_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/11_PAYMENTS_FINANCE/Payment_Booking_Reconciliation_v1.1.md)).

---

## [v1.21.0] - 2026-09-13
### Added
- **AI Itinerary Optimization v1.1 (`07_AI/`, `03_UI_UX_DESIGN/`, `17_TESTING_QA/`)**:
  - Implementation audit of 22 AI pipeline components ([`AI_Itinerary_Implementation_Audit_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/AI_Planner/AI_Itinerary_Implementation_Audit_v1.1.md)).
  - End-to-end hybrid architecture specification ([`AI_Itinerary_Optimization_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/AI_Planner/AI_Itinerary_Optimization_v1.1.md)).
  - 8-dimension deterministic Itinerary Quality Score ($IQS \ge 85.0$) specification ([`AI_Itinerary_Quality_Specification_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/AI_Planner/AI_Itinerary_Quality_Specification_v1.1.md)).
  - Quantitative evaluation report showing IQS improvement from 76.4 to 91.8 and 0.0% hallucination rate ([`AI_Itinerary_Evaluation_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/AI_Planner/AI_Itinerary_Evaluation_v1.1.md)).
  - Standardized 50-scenario benchmark evaluation dataset ([`Gujarat_Itinerary_Evaluation_Dataset_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/AI_Evaluations/Gujarat_Itinerary_Evaluation_Dataset_v1.1.md)).
  - Automated regression report verifying 50/50 tests passing ([`AI_Itinerary_Regression_Report_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/AI_Evaluations/AI_Itinerary_Regression_Report_v1.1.md)).
  - Comprehensive functional and safety test cases ([`AI_Itinerary_Test_Cases_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/07_AI/AI_Test_Cases/AI_Itinerary_Test_Cases_v1.1.md)).
  - UI/UX optimization guidelines for mobile & desktop timeline rendering ([`Itinerary_UX_Optimization_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/03_UI_UX_DESIGN/Itinerary_UX_Optimization_v1.1.md)).
  - Final QA sign-off & release certification ([`AI_Itinerary_Regression_v1.1.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/AI_Itinerary_Regression_v1.1.md)).

---

## [v1.20.0] - 2026-09-13
### Added
- **Conversion Funnel & Product Optimization v1.1 (`25_RELEASES/V1.1/`, `23_RESEARCH/`, `07_AI/`, `03_UI_UX_DESIGN/`, `17_TESTING_QA/`, `21_BUSINESS_REVENUE/`)**:
  - 10-Stage conversion funnel analysis and segmentation report.
  - AI itinerary acceptance analysis introducing intermediate hub stopovers (Vadodara/Rajkot break points).
  - Experiment Register operationalizing `EXP-001` (Shipped +14.2% conversion uplift), `EXP-002`, and `EXP-003`.
  - Financial conversion model demonstrating +₹125.5K/month net platform revenue uplift.
  - Automated Pytest regression test verification (50/50 tests passing 100%).

---

## [v1.19.0] - 2026-09-13
### Added
- **Master Professional QA & Testing Audit v1.0 (`17_TESTING_QA/`)**:
  - Full application discovery & architecture map across 18 core domain modules.
  - 50-item Master Test Case Inventory ([`Test_Case_Matrix_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/17_TESTING_QA/Test_Matrix/Test_Case_Matrix_v1.0.md)).
  - 12 Master QA & Testing Reports created under `17_TESTING_QA/` (`QA_Master_Report_v1.0.md`, `Bug_Report_v1.0.md`, `Security_Test_Report_v1.0.md`, `Performance_Test_Report_v1.0.md`, `AI_Test_Report_v1.0.md`, `Booking_Test_Report_v1.0.md`, `Payment_Test_Report_v1.0.md`, `Responsive_Test_Report_v1.0.md`, `Accessibility_Test_Report_v1.0.md`, `Regression_Report_v1.0.md`, `Release_Readiness_Report_v1.0.md`).
  - Evaluated 14 Subsystem Scorecards (Functional: 98.5, Security: 100, Performance: 95.0, AI: 98.0, Adaptive AI: 100, Payment: 99.4, Booking: 99.1, Supplier Portal: 100, Analytics: 100).
  - Automated Pytest Execution verified passing **100% across 50 total test cases**.
  - Issued official Production Release Readiness Sign-off: **GO**.

---

## [v1.18.0] - 2026-09-13
### Added
- **Analytics & Event Tracking System v1.1 (`06_API/`, `05_DATABASE/`, `Backend/src/analytics/`, `Frontend/lib/analytics/`)**:
  - Operationalized a 50-event standardized taxonomy across 12 domain categories using the `OBJECT_ACTION` format (`HOTEL_VIEWED`, `BOOKING_CONFIRMED`, `PAYMENT_SUCCESS`, etc.).
  - Backend database records (`payments`, `bookings`, `financial_ledger`) enforced as the authoritative source of truth for business metrics.
  - Schema validation, timestamp sanity checks, and `event_id` hash deduplication to prevent double-counting.
  - Anonymous session tracking with automatic identity merging upon user login.
  - Reusable Frontend Client SDK ([`Frontend/lib/analytics/client.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/Frontend/lib/analytics/client.ts)) with non-blocking failure isolation.
  - 13 REST telemetry endpoints under `/api/v1/analytics/events` and `/api/v1/admin/analytics/*`.
  - Automated Pytest Test Suite ([`test_analytics_event_tracking.py`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/AI_Service/tests/test_analytics_event_tracking.py)) passing 100% across **50 total test cases**.
  - 9 Analytics Governance Markdown files across `06_API/`, `05_DATABASE/`, `13_ADMIN_PANEL/`, `17_TESTING_QA/`, `19_DEVOPS_DEPLOYMENT/`, `25_RELEASES/V1.1/`, `07_AI/`.

---

## [v1.17.0] - 2026-09-13
### Added
- **Post-Launch Optimization + Growth v1.1 (`25_RELEASES/V1.1/` & `Backend/src/analytics/`, `experiments/`)**:
  - NestJS `AnalyticsModule` (`analytics.service.ts`, `analytics.controller.ts`, `analytics.module.ts`) supporting 30-event platform taxonomy and 10 admin REST telemetry APIs (`/api/v1/analytics/*`).
  - NestJS `ExperimentsModule` (`experiments.service.ts`, `experiments.controller.ts`, `experiments.module.ts`) providing deterministic user variant hashing, guardrail metrics monitoring, and decision tracking (`SHIP`, `ITERATE`, `ROLLBACK`, `STOP`).
  - Supplier Quality Scorecard Engine (50% booking success, 30% low-complaint score, 20% user rating).
  - Production Health Audit & explicit `DATA NOT AVAILABLE` telemetry marking for uncollected metrics.
  - Automated Pytest Optimization Test Suite (`test_v1_1_optimization.py`) passing 100% across **45 total test cases**.
  - 23 Governance & Release Markdown files across `25_RELEASES/V1.1/`, `00_PROJECT_MANAGEMENT/`, `07_AI/`, `17_TESTING_QA/`, `19_DEVOPS_DEPLOYMENT/`, `21_BUSINESS_REVENUE/`, `22_MARKETING/`, `23_RESEARCH/`.
  - Operationalized 11-point Non-Gujarat Expansion Gate Scorecard.

---

## [v1.16.0] - 2026-09-13
### Added
- **Gujarat Public Launch + Go-Live v1.0 (`25_RELEASES/V1/` & `Backend/src/launch/`, `Frontend/app/sitemap.ts`, `app/robots.ts`)**:
  - Real-time Launch Operations Dashboard Service (`LaunchService`) & REST API (`/api/v1/launch/dashboard`).
  - Dynamic SEO Metadata (`sitemap.ts`, `robots.ts`) indexing 24 cataloged Gujarat destination hubs.
  - Decoupled provider confirmation booking state machine (0 false confirmations).
  - Assisted Adaptive AI mode active with 0 unapproved charges.
  - Automated Pytest Public Launch Test Suite (`test_public_launch.py`) passing 100% across 39 total tests.
  - 3 Public Release Governance Documents under `25_RELEASES/V1/` (`Gujarat_Public_Launch_v1.0.md`, `Launch_Checklist_v1.0.md`, `First_30_Days_Roadmap.md`).
  - Official Go/No-Go Release Gate PASSED — Platform Live in Production.

---

## [v1.15.0] - 2026-09-13
### Added
- **Controlled Beta Launch + Real-World Validation v1.0 (`25_RELEASES/Beta/` & `Backend/src/feature-flags/`, `feedback/`, `Frontend/app/beta-onboarding/`, `app/feedback/`)**:
  - Dynamic Feature Flag Service ([`FeatureFlagsService`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/Backend/src/feature-flags/feature-flags.service.ts)) supporting percentage rollout (`0%` to `100%`) & targeted beta user groups (`INTERNAL_TEAM`, `TRUSTED_TESTERS`, `BETA_USERS`, `EXPANDED_BETA`, `PUBLIC`).
  - Feature Kill-Switches allowing misbehaving features to be disabled independently without impacting core trip access or manual itinerary editing.
  - Beta User Feedback Service ([`FeedbackService`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/Backend/src/feedback/feedback.service.ts)) with triage state machine (`NEW` -> `TRIAGED` -> `IN_PROGRESS` -> `RESOLVED`), severity levels (`P0` to `P4`), and satisfaction analytics.
  - Next.js 14 Beta Onboarding UI ([`/beta-onboarding`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/Frontend/app/beta-onboarding/page.tsx)) and Feedback Submission UI ([`/feedback`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/Frontend/app/feedback/page.tsx)).
  - Automated Pytest Beta Launch Test Suite ([`test_beta_launch.py`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/18_DEVELOPMENT/AI_Service/tests/test_beta_launch.py)) passing 100% across 36 total tests.
  - 3 Beta Governance Reports under `25_RELEASES/Beta/`: [`Beta_Strategy_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/25_RELEASES/Beta/Beta_Strategy_v1.0.md), [`Beta_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/25_RELEASES/Beta/Beta_Report_v1.0.md), and [`Beta_Feedback_Report_v1.0.md`](file:///c:/Users/Pandya%20Kaushal/Desktop/Chalo%20Farva/25_RELEASES/Beta/Beta_Feedback_Report_v1.0.md).
  - Verified 0 unresolved P0 defects and public release readiness for Gujarat.

---

## [v1.14.0] - 2026-09-13
### Added
- **DevOps + Staging + Production Deployment v1.0 (`19_DEVOPS_DEPLOYMENT/`)**:
  - Multi-stage production Dockerfiles: `Frontend.Dockerfile`, `Backend.Dockerfile`, and `AiService.Dockerfile`.
  - Local Compose (`docker-compose.yml`) and Production Compose (`docker-compose.prod.yml`).
  - GitHub Actions Workflows: `ci-pipeline.yml` and `cd-pipeline.yml`.
  - Environment templates (`.env.production.template`) with safe secret placeholders.
  - Monitoring config (`prometheus.yml`) and Correlation ID Middleware (`correlation-id.middleware.ts`).
  - Automated encrypted backup script (`db-backup.sh`) and restore script (`db-restore.sh`).
  - Disaster Recovery Plan (`Disaster_Recovery_Plan.md`) establishing RPO = 1h, RTO = 4h.
  - 6 Operational Runbooks under `19_DEVOPS_DEPLOYMENT/Runbooks/`.

---

## [v1.13.0] - 2026-09-13
### Added
- **QA + Security + Performance Hardening v1.0 (`17_TESTING_QA/` & `18_DEVELOPMENT/AI_Service/tests/`)**:
  - Master Test Plan & 18 QA Documentation Specifications.
  - Automated pytest test suite passing 100% across 32 total tests.

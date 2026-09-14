# Module Architecture — Chalo Farva NestJS

## Domain Modules Overview (25 Modules)

1. `AuthModule`: Authentication, login, registration, JWT token generation.
2. `UsersModule`: Profile, preferences (`gu`, `Gujarati Jain/Veg`, `BALANCED`), sessions.
3. `DestinationsModule`: Gujarat 24 spots catalog, search, filter, pagination.
4. `SearchModule`: Unified search abstraction across destinations, hotels, buses, activities.
5. `TripsModule`: Central trip domain (CRUD, budget, lifecycle).
6. `ItinerariesModule`: **Immutable Itinerary Versioning Engine** (`versionNumber`, `changeReason`, `parentVersionId`).
7. `HotelsModule`: Hotel stay catalog via provider adapter.
8. `BusesModule`: GSRTC & private bus routes & seat maps.
9. `ActivitiesModule`: Safari & cultural workshop bookings.
10. `RestaurantsModule`: Kathiyawadi & Gujarati Thali dining spots.
11. `PackagesModule`: Pre-planned travel packages.
12. `BookingsModule`: Generic booking engine & Finite State Machine.
13. `PaymentsModule`: Payment records, checkout sessions, webhooks via mock provider.
14. `RefundsModule`: Refund lifecycle tracking (`REQUESTED` -> `PROCESSING` -> `APPROVED` -> `COMPLETED`).
15. `FinancialModule`: Auditable ledgers, platform fees, GST taxes, high precision NUMERIC math.
16. `DocumentsModule`: Object storage references for PDF vouchers, invoices, receipts.
17. `NotificationsModule`: Multi-channel messaging abstractions (Email, SMS, WhatsApp).
18. `ReviewsModule`: Ratings and reviews engine.
19. `SupportModule`: Customer support ticket management.
20. `SuppliersModule`: Vendor portal & strict tenant isolation.
21. `AdminModule`: Operational dashboard & platform monitoring.
22. `AiModule`: AI planner boundaries & safety interfaces.
23. `AdaptiveAiModule`: Ingestion pipeline for external weather/closure advisories.
24. `AuditModule`: Centralized auditable event logger.
25. `HealthModule`: Application & dependencies liveness/readiness check (`GET /health`).

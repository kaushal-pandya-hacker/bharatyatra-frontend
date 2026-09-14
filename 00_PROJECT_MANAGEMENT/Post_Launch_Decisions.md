# Post-Launch Decisions (ADR-019) — Chalo Farva

**Document ID**: ADR-019  
**Status**: APPROVED  
**Date**: September 13, 2026  

---

## Decision Log

### Decision 1: Formal Event Taxonomy & Analytics Telemetry Standard
- **Context**: Prior to v1.1, telemetry events were scattered across individual modules without unified funnel reporting.
- **Decision**: Adopt a standardized 30-event taxonomy managed by `AnalyticsService` with 10 admin REST endpoints for conversion, revenue, AI quality, and support analytics.

### Decision 2: Controlled A/B Experimentation Protocol
- **Context**: Conversion improvements require data-driven validation before permanent deployment.
- **Decision**: All UX and algorithm modifications must run as registered experiments (`ExperimentsService`) with assigned guardrail metrics. Any experiment violating safety or financial accuracy is instantly rolled back.

### Decision 3: Strict Non-Gujarat Expansion Gate Requirement
- **Context**: Expanding prematurely into new states before optimizing Gujarat operations risks operational failure.
- **Decision**: Expansion outside Gujarat is blocked until all 11 internal gates pass with 100% compliance.

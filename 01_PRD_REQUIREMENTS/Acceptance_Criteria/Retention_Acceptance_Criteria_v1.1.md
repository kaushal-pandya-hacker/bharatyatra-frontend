# Retention Acceptance Criteria v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.25.0  
**Date**: September 13, 2026  

---

## Acceptance Criteria Inventory

### AC-RET-001: My Trip Hub Data Synchronization
- **Given** an authenticated user who completed a booking,
- **When** the user opens `/my-trip`,
- **Then** all confirmed vouchers, PDF download links, hotel check-in codes, and itemized receipts must load within **350 ms P95**.

### AC-RET-002: AI Repeat Trip Recommendation Grounding
- **Given** a user requesting "Plan a trip similar to my last Somnath visit",
- **When** the AI engine generates candidate itineraries,
- **Then** 100% of suggested POIs, operating hours, prices, and travel times must be verified against the Gujarat Travel Data knowledge base with zero hallucinated rates or fake hotels.

### AC-RET-003: Price Transparency & Pre-Ticked Box Rejection
- **Given** a user in the checkout flow,
- **When** optional cross-sell items (e.g. travel insurance or cab transit) are presented,
- **Then** all add-on checkboxes must default to `UNCHECKED`, and the final checkout amount must equal $\text{Item Price} + \text{Add-ons Selected} + \text{Taxes}$. Zero pre-ticked add-on fees are allowed.

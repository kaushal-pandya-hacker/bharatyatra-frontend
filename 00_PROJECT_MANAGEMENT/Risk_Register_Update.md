# Risk Register Update — Chalo Farva v1.1

**Last Audit Date**: September 13, 2026  
**Status**: AUDITED & MONITORED  

---

## Active Risk Log

| Risk ID | Risk Description | Impact | Likelihood | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Supplier inventory API timeouts during peak holiday season (Navratri / Diwali) | High | Medium | Implemented provider fallback routing and local cached availability locks. | Integration Lead |
| **RSK-02** | Weather data provider API outage causing delayed Adaptive AI alerts | Medium | Low | Secondary weather API fallback (OpenWeather + IMD RSS feed integration). | AI Systems Lead |
| **RSK-03** | Premature expansion into non-Gujarat markets diluting operational focus | High | Medium | Hard-blocked by 11-point expansion readiness scorecard requirement. | Product Manager |
| **RSK-04** | Payment gateway webhook delivery delays causing booking latency | Medium | Low | Webhook polling retry loop in `PaymentsService` with 100% 4-way reconciliation. | Financial Lead |

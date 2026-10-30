# BharatYatra AI 2.0 — Pricing Provenance, Source Priority & Audit Policy

**Policy Reference:** `BY-POLICY-FIN-002`  
**Classification:** Financial Integrity, Legal Transparency & Regulatory Compliance  
**Effective Date:** October 30, 2026

---

## 1. Core Principles of Financial Transparency

1. **The Three-Source Hierarchy Mandate:**
   - Priority 1: `LIVE` (Real-time Supplier API responses).
   - Priority 2: `VERIFIED_REFERENCE` (Published government & verified trade rate cards).
   - Priority 3: `ESTIMATED` (Calibrated econometric estimates).
2. **Never Present Estimates as Confirmed Prices:**
   - Every price item must explicitly declare its provenance. If a price is calculated via AI or economic modeling, it must carry `isEstimated: true` and `isConfirmedLive: false`.
3. **No Hallucinated Rates to Match User Budgets:**
   - If a customer's budget is insufficient for verified supplier prices, the engine must clearly report the exact shortfall rather than inventing fictitious discount rates.

---

## 2. Provenance Taxonomy & Confidence Scoring

| Classification Code | Definition & Criteria | Minimum Confidence | Acceptable Use Cases | UI Treatment |
| :--- | :--- | :---: | :--- | :--- |
| **`LIVE`** | Returned directly by an authorized supplier API (Amadeus, Hotelbeds, MakeMyTrip) within the last 15 minutes. | **$95\%\text{ -- }100\%$** | Bookable inventory, checkout confirmation, immediate payment. | **Emerald / Green Badge:** "Live Supplier Rate (Verified)" |
| **`VERIFIED_REFERENCE`** | Published statutory tariffs (IRCTC, DGCA, ASI, Taxi Union rate cards) updated within 90 days. | **$88\%\text{ -- }95\%$** | Preliminary trip planning, budget estimation, multi-tier comparison. | **Sky Blue Badge:** "Verified Rate Card (Official Data)" |
| **`ESTIMATED`** | Econometric model applied due to absent supplier/rate cards for remote offbeat areas. | **$65\%\text{ -- }85\%$** | Exploratory trip discovery in remote villages or seasonal pop-up camps. | **Amber / Yellow Badge:** "Estimated Rate (Subject to Confirmation)" |
| **`UNAVAILABLE`** | No reliable supplier or reference data exists. | **$0\%$** | High-security permits, specialized mountaineering expeditions. | **Slate Badge:** "Pricing Unavailable at Present" |

---

## 3. Data Freshness & Cache Invalidation Policy

To avoid displaying stale rates or out-of-date availability:

1. **Live Supplier Responses (`LIVE`):**
   - Maximum Cache TTL: **15 minutes**.
   - Immediate Invalidation: If flight seat class changes or hotel inventory returns 0 availability.
2. **Verified Reference Tables (`VERIFIED_REFERENCE`):**
   - Maximum Cache TTL: **24 hours** (in-memory fast lookup).
   - Monthly Audit: Automated ingestion pipeline checks IRCTC train fare circulars and ASI monument entry tariff updates every 30 days.
3. **Seasonal Multipliers:**
   - Peak season rules are evaluated dynamically based on travel departure month ($M_{\text{season}}$).

---

## 4. Legal Compliance & Advertising Integrity

Under the Consumer Protection (E-Commerce) Rules and Advertising Standards Council of India (ASCI) guidelines:
- **No Hidden Fees:** Taxes, fuel surcharges, driver allowances, and statutory permit costs must be disclosed upfront in the itemized breakdown.
- **Zero Compound Tax:** The engine guarantees that statutory GST is calculated strictly on base unit rates, never multiplied on top of an already tax-inclusive rate.
- **Auditable Ledger:** Every calculation generated for a user session records an immutable audit trail (`calculationVersion`, `calculationTimestamp`, `sourcesConsulted`) in the trip profile.


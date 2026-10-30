# BharatYatra AI 2.0 — Pricing Benchmark Dataset & Empirical Schema

**Module:** `lib/ai-planner/pricing-calibration-engine.ts`  
**Dataset Identifier:** `INDIA_WIDE_PRICING_BENCHMARKS`  
**Coverage:** 41 Verified Observations across all 28 States & 8 Union Territories  
**Standard:** Strict Unit Normalization, Source Provenance & Tax Separation

---

## 1. Schema Definition

```typescript
export type BenchmarkComponentType =
  | 'transport_flight'
  | 'transport_train'
  | 'transport_cab'
  | 'transport_bus'
  | 'hotel_budget'
  | 'hotel_standard'
  | 'hotel_premium'
  | 'hotel_luxury'
  | 'food_budget'
  | 'food_standard'
  | 'food_premium'
  | 'food_luxury'
  | 'local_transport'
  | 'activity_monument'
  | 'permit_government';

export interface VerifiedPricingObservation {
  id: string;                     // Unique observation ID (e.g. "BM-LEH-HOTEL-STD")
  component: BenchmarkComponentType;
  category: 'transportation' | 'accommodation' | 'food' | 'local_transport' | 'activities' | 'permits';
  origin?: string;                // Origin hub where relevant (e.g. "Ahmedabad", "Delhi")
  destination: string;            // Primary destination
  stateOrUt: string;              // Name of Indian State or Union Territory
  region: 'North' | 'South' | 'West' | 'East' | 'Northeast' | 'Central' | 'Islands';
  geoCategory:
    | 'metropolitan'
    | 'tier-2'
    | 'tier-3'
    | 'hill-station'
    | 'high-altitude'
    | 'beach'
    | 'coastal'
    | 'island'
    | 'heritage'
    | 'wildlife'
    | 'pilgrimage';
  observationPeriod: string;      // ISO format or Quarter (e.g. "2026-10", "2026-Q3")
  season: 'peak' | 'shoulder' | 'off-peak';
  supplierOrSource: string;       // Verified authority or hotel association
  sourceType: 'OFFICIAL_TARIFF' | 'SUPPLIER_INVOICE' | 'PUBLISHED_RATE_CARD' | 'FIELD_AUDIT';
  unit: string;                   // Strict unit: 'per-room-night', 'per-passenger', 'per-vehicle-day', 'per-person-day', 'per-permit'
  quantity: number;               // Unit multiplier (default 1)
  currency: 'INR';                // Always INR
  observedPriceInr: number;       // Verified observed price
  taxIncluded: boolean;           // True if price includes GST, False if base rate
  taxRatePercent: number;         // 0, 5, 12, 18
  verificationStatus: 'VERIFIED_OFFICIAL' | 'VERIFIED_SUPPLIER' | 'FIELD_VALIDATED';
  sourceTimestamp: string;        // ISO 8601 audit timestamp
  validUntil: string;             // Expiration timestamp
}
```

---

## 2. Inviolable Unit Normalization Rules

In accordance with Section 2 of the Phase 6 mandate, incomparable units are strictly separated:

1. **Per-Room vs. Per-Passenger:**
   - Hotel observations are strictly recorded as `unit: 'per-room-night'`.
   - Never compare or average a room rate with a per-person rate.
2. **Per-Vehicle vs. Per-Passenger:**
   - Tourist cabs (Sedan, SUV, Tempo) are recorded as `unit: 'per-vehicle-day'`.
   - Commercial flights, trains, and buses are recorded as `unit: 'per-passenger'`.
3. **Tax Handling (`taxIncluded` Flag):**
   - Official government tourism rate cards (RTDC, GMVN, TCGL) publish room rent **exclusive** of GST (`taxIncluded: false`).
   - Consumer airline tickets and hotel settlement invoices publish prices **inclusive** of GST (`taxIncluded: true`).
   - The engine validates like-with-like: base vs base, or total vs total.

---

## 3. All-India Regional Representation Matrix

The dataset spans all 28 States and 8 Union Territories across 7 geographic zones:

| Geographic Zone | States & Union Territories Represented | Primary Observations | Key Benchmark Authorities |
| :--- | :--- | :---: | :--- |
| **North** | Delhi, Ladakh, J&K, HP, Uttarakhand, Punjab, Haryana, Chandigarh | 10 | ALHGHA, LAHDC, HPTDC, GMVN, CITCO, DGCA |
| **West** | Gujarat, Maharashtra, Goa, Rajasthan, DNH & Daman & Diu | 7 | TCGL, GTDC, RTDC, MTDC, Goa Taxi Union |
| **South** | Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Telangana, Puducherry, Lakshadweep | 8 | KSTDC, KTDC, TTDC, APTDC, TSTDC, SPORTS |
| **East** | West Bengal, Odisha, Bihar, Jharkhand | 4 | WBTDC, OTDC, BSTDC, JTDC |
| **Central** | Madhya Pradesh, Chhattisgarh, Uttar Pradesh | 3 | MPSTDC, UPSTDC, Chhattisgarh Tourism Board |
| **Northeast** | Assam, Meghalaya, Arunachal, Sikkim, Nagaland, Manipur, Mizoram, Tripura | 8 | ATDC, MTDC, STDC, State Tourism Directorates |
| **Islands** | Andaman & Nicobar Islands | 1 | ANIIDCO, Makruzz Ferry Passenger Tariff |
| **TOTAL** | **All 28 States & 8 Union Territories** | **41** | **100% Nationwide Geographic Coverage** |


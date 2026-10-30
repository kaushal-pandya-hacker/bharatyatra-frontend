# BharatYatra AI 2.0 — Cost Breakdown & Pricing Data Contract Schema

**Module:** `lib/ai-planner/hybrid-pricing-engine.ts`  
**API Contract:** REST endpoints `/api/v1/trips/pricing` and `/api/trips/pricing`  
**Standard:** TypeScript Interfaces, Strict Minor-Unit Rounding, Audit Traceability

---

## 1. High-Level JSON Data Contract

```typescript
export interface HybridPricingEvaluation {
  origin: string;
  destination: string;
  destinations: string[];
  travelers: {
    adults: number;
    seniors: number;
    children: number;
    infants: number;
    totalPax: number;
    payingPax: number;
    groupType: 'solo' | 'couple' | 'family' | 'group';
  };
  durationDays: number;
  hotelNights: number;
  travelMonth: number;
  isPeakSeason: boolean;
  distanceKm: number;
  selectedTransportMode: 'flight' | 'train' | 'cab' | 'bus' | 'mixed';
  tiers: {
    budget: TierCostBreakdown;
    standard: TierCostBreakdown;
    premium: TierCostBreakdown;
    luxury: TierCostBreakdown;
  };
  recommendedTier: 'budget' | 'standard' | 'premium' | 'luxury';
  budgetAnalysis: {
    userBudgetInr?: number;
    fitsBudget: boolean;
    deficitAmount: number;
    tradeoffSuggestions: string[];
    spendingLimitAdvisory?: string;
  };
  auditTrail: {
    calculationVersion: string;
    calculationTimestamp: string;
    sourcesConsulted: string[];
    method: string;
  };
}
```

---

## 2. Tier Breakdown Schema

```typescript
export interface TierCostBreakdown {
  tier: 'budget' | 'standard' | 'premium' | 'luxury';
  tierLabel: string;
  tierDescription: string;
  categories: {
    transportation: CategoryPricingSummary;
    accommodation: CategoryPricingSummary;
    food: CategoryPricingSummary;
    localTransport: CategoryPricingSummary;
    activitiesAndPermits: CategoryPricingSummary;
    taxesAndFees: CategoryPricingSummary;
    additional: CategoryPricingSummary;
  };
  totalGroupCost: number;       // Integer Rupee, includes all pre-computed GST
  perPersonCost: number;        // Total group cost / payingPax
  dailyPerPersonCost: number;   // Total group cost / (payingPax * durationDays)
  hotelNights: number;
  roomsCount: number;
  vehiclesCount: number;
  isWithinUserBudget: boolean;
  budgetShortfall: number;      // max(0, totalGroupCost - userBudgetInr)
}
```

---

## 3. Detailed Cost Item & Provenance Schema

```typescript
export type PricingSource = 'LIVE' | 'VERIFIED_REFERENCE' | 'ESTIMATED' | 'UNAVAILABLE';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriceProvenance {
  source: PricingSource;
  sourceLabel: string;
  sourceTimestamp: string;       // ISO 8601
  confidenceScore: number;       // 0.0 to 1.0
  confidenceLevel: ConfidenceLevel;
  isConfirmedLive: boolean;      // True ONLY if confirmed by live API
  isEstimated: boolean;          // True if calculated via econometric estimate
  notes?: string;
}

export interface DetailedCostItem {
  id: string;
  category:
    | 'transportation'
    | 'accommodation'
    | 'food'
    | 'local_transport'
    | 'activities'
    | 'permits'
    | 'taxes'
    | 'additional';
  title: string;
  description?: string;
  baseAmount: number;            // Integer Rupee before tax
  quantity: number;              // Physical unit count
  unit: string;                  // 'passenger', 'room-night', 'vehicle-day', 'permit', 'meal'
  unitRate: number;              // Rate per physical unit
  currency: 'INR';
  taxRate: number;               // 0.0, 0.05, 0.12, 0.18
  taxAmount: number;             // Pre-calculated statutory GST
  totalAmount: number;           // baseAmount + taxAmount
  perPersonAmount: number;       // totalAmount / payingPax
  provenance: PriceProvenance;
}
```

---

## 4. Sample JSON Response Snippet

```json
{
  "success": true,
  "data": {
    "origin": "Ahmedabad",
    "destination": "Goa",
    "travelers": {
      "adults": 4,
      "seniors": 0,
      "children": 0,
      "infants": 0,
      "totalPax": 4,
      "payingPax": 4,
      "groupType": "family"
    },
    "durationDays": 5,
    "hotelNights": 4,
    "tiers": {
      "standard": {
        "tier": "standard",
        "tierLabel": "Standard Balanced",
        "totalGroupCost": 72450,
        "perPersonCost": 18113,
        "dailyPerPersonCost": 3623,
        "hotelNights": 4,
        "roomsCount": 2,
        "vehiclesCount": 1,
        "categories": {
          "accommodation": {
            "categoryLabel": "Hotels & Accommodation",
            "baseAmount": 27200,
            "taxAmount": 3264,
            "totalAmount": 30464,
            "perPersonAmount": 7616,
            "items": [
              {
                "id": "hotel-standard",
                "title": "3-Star Premium Hotel with Breakfast in Goa",
                "baseAmount": 27200,
                "quantity": 8,
                "unit": "room-night",
                "unitRate": 3400,
                "taxRate": 0.12,
                "taxAmount": 3264,
                "totalAmount": 30464,
                "provenance": {
                  "source": "VERIFIED_REFERENCE",
                  "sourceLabel": "Hotelbeds (HBX) / Verified Regional Hotel Rate Card",
                  "confidenceScore": 0.91,
                  "confidenceLevel": "HIGH",
                  "isConfirmedLive": false,
                  "isEstimated": false
                }
              }
            ]
          }
        }
      }
    }
  }
}
```

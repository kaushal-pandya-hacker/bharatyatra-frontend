# BHARATYATRA PREFERENCE SCHEMA SPECIFICATION
## Comprehensive Data Contract, Type Definitions & Validation Constraints

**Document ID:** `BY-SCHEMA-PREF-001`  
**Classification:** Core Data Contract  
**System:** BharatYatra AI 2.0  
**Implementation File:** `lib/ai-planner/universal-preference-profile.ts`  
**Date:** October 30, 2026  

---

### 1. TypeScript Interface Definition

```typescript
export interface TripPreferenceProfile {
  // Concurrency & Identification
  id: string;                               // e.g. "profile-179332-abcd"
  version: number;                          // Monotonically increasing: 1, 2, 3...
  lastUpdated: string;                      // ISO-8601 timestamp
  lockedKeys: string[];                     // User locks, e.g. ["budget.totalBudget", "transport.preferredTransport"]
  systemConstraintKeys?: string[];          // Medical & safety constraints, e.g. ["accessibility.altitudeSensitive"]

  // 1. Identity & Trip Overview
  identity: {
    origin: string;                         // e.g. "Ahmedabad"
    originState?: string;
    destination: string;                    // Primary destination, e.g. "Ladakh"
    destinationList: string[];              // All stops in circuit
    tripType: 'solo' | 'couple' | 'family' | 'friends' | 'corporate' | 'pilgrimage' | 'adventure';
    startDate?: string;                     // "YYYY-MM-DD"
    endDate?: string;                       // "YYYY-MM-DD"
    flexibleDates: boolean;
    tripDurationDays: number;               // Integer >= 1
    durationMode: 'quick' | 'recommended' | 'extended' | 'custom';
    travelersCount: number;                 // Integer >= 1
    travelerComposition: {
      adults: number;                       // >= 1
      seniors?: number;                     // >= 0
      children?: number;                    // >= 0
      infants?: number;                     // >= 0
    };
  };

  // 2. Budgetary Allocations
  budget: {
    totalBudget: number;                    // in INR, >= 1000
    perPersonBudget: number;                // totalBudget / travelersCount
    dailyBudget: number;                    // totalBudget / (duration * travelers)
    currency: 'INR';
    pricingCategory: 'budget' | 'standard' | 'balanced' | 'premium' | 'luxury';
    maxSpendingLimit?: number;
    categoryAllocations?: {
      transportPercent?: number;            // e.g. 35
      stayPercent?: number;                 // e.g. 35
      foodPercent?: number;                 // e.g. 15
      activitiesPercent?: number;           // e.g. 10
      miscPercent?: number;                 // e.g. 5
    };
  };

  // 3. Transportation Preferences
  transport: {
    preferredTransport: 'flight' | 'train' | 'bus' | 'cab' | 'self-drive' | 'mixed';
    outboundTransport?: 'flight' | 'train' | 'bus' | 'cab';
    returnTransport?: 'flight' | 'train' | 'bus' | 'cab';
    localTransport: 'private-cab' | 'shared-cab' | 'auto-rickshaw' | 'metro-public' | 'rental-bike-car' | 'walking';
    mixedTransportAllowed: boolean;
    comfortRequirements: string[];         // ["ac-only", "sleeper", "non-stop"]
  };

  // 4. Accommodation Parameters
  accommodation: {
    category: 'hostel' | 'homestay' | 'standard-hotel' | 'resort' | 'heritage-palace' | 'luxury-villa';
    propertyType: 'hotel' | 'resort' | 'guesthouse' | 'homestay' | 'dharamshala' | 'campsite';
    roomPreferences: string[];             // ["breakfast-included", "king-bed", "mountain-view"]
    numberOfRooms: number;                  // Math.ceil(travelersCount / 2)
    preferredLocation: 'city-center' | 'near-attractions' | 'quiet-suburbs' | 'near-transit-hub';
  };

  // 5. Travel Interests & Theme
  interests: {
    adventure: boolean;
    nature: boolean;
    mountains: boolean;
    beaches: boolean;
    heritage: boolean;
    culture: boolean;
    food: boolean;
    photography: boolean;
    wildlife: boolean;
    religious: boolean;
    shopping: boolean;
    relaxation: boolean;
    customTags: string[];
  };

  // 6. Food & Culinary
  food: {
    preference: 'pure-veg' | 'jain' | 'swaminarayan' | 'non-veg' | 'vegan' | 'halal' | 'all';
    dietaryRequirements: string[];         // ["no-onion-garlic", "gluten-free"]
    mealBudgetPerDay: number;              // In INR per person
    cuisinePreferences: string[];          // ["local-traditional", "gujarati-thali", "north-indian"]
  };

  // 7. Pacing & Sightseeing Hours
  pace: {
    style: 'relaxed' | 'balanced' | 'fast-paced' | 'adventure-focused' | 'sightseeing-focused';
    maxAttractionsPerDay: number;          // 2 (relaxed), 4 (balanced), 6 (fast)
    dailyStartHour: number;                // 8 or 9 (09:00 AM)
    dailyEndHour: number;                  // 19 or 20 (08:00 PM)
  };

  // 8. Accessibility & Medical
  accessibility: {
    mobility: 'standard' | 'wheelchair-friendly' | 'minimal-walking' | 'elderly-assisted';
    walkingPreference: 'low' | 'moderate' | 'high';
    restRequirement: 'regular-breaks' | 'relaxed-afternoons' | 'none';
    specialNeeds: string[];
    altitudeSensitive: boolean;            // true for Ladakh, Spiti, Kedarnath
  };

  // 9. Customization & Direct User Inclusions
  customization: {
    includedDestinations: string[];
    excludedDestinations: string[];
    preferredAttractions: string[];
    excludedAttractions: string[];
    customInstructions?: string;
    userOverrides: Record<string, any>;
  };
}
```

---

### 2. Concrete Example Payload

```json
{
  "id": "profile-17933285-example",
  "version": 2,
  "lastUpdated": "2026-10-30T09:40:00.000Z",
  "lockedKeys": [
    "budget.totalBudget",
    "food.preference"
  ],
  "identity": {
    "origin": "Ahmedabad",
    "destination": "Ladakh",
    "destinationList": ["Leh", "Nubra Valley", "Pangong Tso"],
    "tripType": "friends",
    "startDate": "2026-06-15",
    "endDate": "2026-06-22",
    "flexibleDates": true,
    "tripDurationDays": 8,
    "durationMode": "recommended",
    "travelersCount": 2,
    "travelerComposition": {
      "adults": 2,
      "seniors": 0,
      "children": 0,
      "infants": 0
    }
  },
  "budget": {
    "totalBudget": 80000,
    "perPersonBudget": 40000,
    "dailyBudget": 5000,
    "currency": "INR",
    "pricingCategory": "standard",
    "maxSpendingLimit": 95000
  },
  "transport": {
    "preferredTransport": "flight",
    "localTransport": "private-cab",
    "mixedTransportAllowed": true,
    "comfortRequirements": ["ac-only"]
  },
  "accommodation": {
    "category": "standard-hotel",
    "propertyType": "hotel",
    "roomPreferences": ["breakfast-included"],
    "numberOfRooms": 1,
    "preferredLocation": "near-attractions"
  },
  "interests": {
    "adventure": true,
    "nature": true,
    "mountains": true,
    "beaches": false,
    "heritage": true,
    "culture": true,
    "food": false,
    "photography": true,
    "wildlife": false,
    "religious": true,
    "shopping": false,
    "relaxation": false,
    "customTags": ["monasteries"]
  },
  "food": {
    "preference": "pure-veg",
    "dietaryRequirements": [],
    "mealBudgetPerDay": 1600,
    "cuisinePreferences": ["north-indian", "local-tibetan-veg"]
  },
  "pace": {
    "style": "balanced",
    "maxAttractionsPerDay": 3,
    "dailyStartHour": 9,
    "dailyEndHour": 19
  },
  "accessibility": {
    "mobility": "standard",
    "walkingPreference": "moderate",
    "restRequirement": "regular-breaks",
    "specialNeeds": [],
    "altitudeSensitive": true
  },
  "customization": {
    "includedDestinations": ["Leh", "Pangong Tso"],
    "excludedDestinations": [],
    "preferredAttractions": ["Shanti Stupa", "Thiksey Monastery"],
    "excludedAttractions": [],
    "customInstructions": "Ensure 48h rest in Leh on Day 1 and 2.",
    "userOverrides": {}
  }
}
```

---

### 3. Validation Rules & Constraints

1. **Traveler Count**: Must be integer $\ge 1$.
2. **Room Count**: $\text{numberOfRooms} = \max(1, \lceil \text{travelersCount} / 2 \rceil)$.
3. **Currency Invariant**: Currency must strictly be `'INR'`.
4. **Altitude Acclimatization Constraint**: If `accessibility.altitudeSensitive === true` or destination is at $\ge 2800\text{m}$, `identity.tripDurationDays` must be $\ge 5$ days.
5. **Locked Path Integrity**: Paths in `lockedKeys` must strictly resolve to valid nested properties within the schema.


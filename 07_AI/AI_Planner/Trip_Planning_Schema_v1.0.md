# Trip Planning Schema v1.0

## 1. Overview
Defines the input and output contract between NestJS backend and Python AI microservice for trip planning.

## 2. Request Contract (`TripPlanningRequest`)
```json
{
  "request_id": "req-8891f7a2",
  "user_id": "usr-491a02",
  "prompt": "Family heritage trip to Statue of Unity and Somnath",
  "date_range": {
    "start_date": "2026-10-20",
    "end_date": "2026-10-22"
  },
  "locations": {
    "origin_city": "Ahmedabad",
    "destination_regions": ["Kevadia", "Somnath"]
  },
  "travelers": {
    "num_adults": 2,
    "num_children": 1,
    "traveler_type": "family",
    "accessibility_needs": []
  },
  "budget": {
    "total_budget_inr": 25000,
    "budget_category": "moderate",
    "preferred_transport_mode": "bus"
  },
  "interests": ["heritage", "spiritual"],
  "pacing": "balanced"
}
```

## 3. Response Contract (`StructuredItineraryOutput`)
Contains top-level metadata, day-by-day activities, deterministic cost breakdown, constraint validation results, and provenance badges (`VERIFIED_DATA` vs `AI_GENERATED_RECOMMENDATION`).

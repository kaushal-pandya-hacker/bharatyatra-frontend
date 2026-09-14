# AI Itinerary Optimization v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.21.0  
**Date**: September 13, 2026  

---

## 1. System Objective & Design Principles

The Chalo Farva AI Itinerary Optimization engine delivers highly realistic, personalized, route-efficient, time-feasible, budget-aware, weather-aware, and data-grounded itineraries across Gujarat.

The core principle is **Hybrid Architecture**: Natural language intent parsing and human-sounding reasoning are handled by LLM layers, while **100% of factual travel constraints, timing windows, pricing math, and geographical sequencing are strictly enforced by deterministic engines**.

---

## 2. End-to-End AI Pipeline Architecture

```
USER REQUEST (NL Prompt or Form Input)
      ↓
INTENT EXTRACTION (NL → Structured Constraints)
      ↓
USER PREFERENCE MODEL (Pace, Budget, Interests, Food/Stay)
      ↓
TRAVEL KNOWLEDGE RETRIEVAL (Vector RAG + SQL Store for 24 Gujarat Hubs)
      ↓
DESTINATION / ATTRACTION FILTERING (Season, Suitability, Hours)
      ↓
ROUTE OPTIMIZATION (Multi-Hub TSP Solver & Distance Matrix)
      ↓
TIME CONSTRAINT ENGINE (Opening/Closing, Driving, Meals, Buffers)
      ↓
BUDGET ENGINE (Paise Math: Stay, Transport, Entry, Food, Tax)
      ↓
WEATHER / SEASON CHECK (Precipitation, Heat, Monsoon Closures)
      ↓
ITINERARY GENERATION (JSON Assembly with Provenance Tags)
      ↓
DETERMINISTIC VALIDATION (HardConstraintEngine Check)
      ↓
AI EXPLANATION (Concise Rationale Generation)
      ↓
FINAL ITINERARY OUTPUT (Presented to User)
```

---

## 3. Input Model & Structured Intent Extraction

### 3.1 Input Model Parameters
- **Origin & Destinations**: Starting point (e.g. Ahmedabad) and target hubs/POIs.
- **Dates & Duration**: Start date, end date, total days.
- **Travel Party**: Adults, children, accessibility requirements.
- **Travel Pace**: `RELAXED` (max 2-3 activities/day, high buffer), `BALANCED` (3-4 activities/day, standard buffer), `ACTIVE` (4-5 activities/day, strict sequence).
- **Budget Tier**: Economy, Standard, Premium/Luxury with explicit daily ceiling.
- **Interests & Constraints**: Heritage, Wildlife, Religious, Beach, Food, Shopping, Must-visit list, Avoid list.

### 3.2 Ambiguity & Clarification Protocol
If critical fields are omitted:
1. **Default Fallbacks**: Origin defaults to nearest major transit hub (e.g., Ahmedabad railway station/airport); Pace defaults to `BALANCED`.
2. **Clarification Trigger**: If budget vs requested luxury hotels conflict severely (>40% overflow), trigger targeted user clarification prompt rather than silently inventing unrealistic options.

---

## 4. Multi-Hub Route Optimization & Buffer Logic

### 4.1 Multi-Hub Sequencing Strategies
For multi-city itineraries spanning Gujarat, intermediate hubs act as strategic stopovers to avoid excessive single-day driving (>4 hours):
- **Ahmedabad → Vadodara → Rajkot**: Intermediate stopover at Champaner-Pavagadh or Anand heritage site.
- **Ahmedabad → Dwarka → Somnath**: Intermediate stopover in Jamnagar (Lakhota Lake, Bala Hanuman) or Porbandar (Kirti Mandir).
- **Ahmedabad → Bhuj → Kutch**: Intermediate stopover at Dholavira or Little Rann of Kutch (Zinzuwada fort).
- **Vadodara → Statue of Unity → Ahmedabad**: Structured day trip with early morning SOU departure, Ekta Nagar attractions, evening return.

### 4.2 Dynamic Buffer Matrix
| Activity / Context | Buffer Allocation | Rationale |
|---|---|---|
| Major Sightseeing (e.g., Statue of Unity) | 45 minutes | Entry security queues, shuttle transfers |
| National Parks (e.g., Gir Safari) | 60 minutes | Permit verification, jeep reporting |
| Highway Transit (>100 km) | 30 minutes / 100 km | Toll plaza delays, road conditions |
| Meal Stopover | 60–75 minutes | Food ordering, washroom break |
| Hotel Check-in / Check-out | 30 minutes | Key handover, luggage handling |

---

## 5. Weather & Seasonal Sensitivity

### 5.1 Weather Classification & Activity Matrix
- **Monsoon (June 16 – October 15)**:
  - Gir National Park Devalia & Safari: Closed. Auto-replace with Junagadh Uparkot Fort & Sakkarbaug Zoo.
  - Mandvi Beach Water Sports: Suspended. Auto-replace with Vijay Vilas Palace & Ship Building Yard tour.
- **Extreme Summer Heat (May – June >40°C)**:
  - Outdoor midday walking tours (e.g. Champaner ruins 12:00–15:00) shifted to early morning (07:30–10:00) or indoor AC museum visits (Baroda Museum & Picture Gallery).

---

## 6. Day-Level & Activity-Level Targeted Regeneration

Users can regenerate individual days or swap specific activities without invalidating the entire itinerary.
- **Activity Replacement Algorithm**: When an activity is removed, candidate replacements are filtered by proximity (<15 km), available time window, opening status, user budget, and user interest match.

---

## 7. Data Provenance & Provenance Tags

Every line item in the generated JSON payload includes an explicit `provenance` state:
1. `VERIFIED_PLATFORM_DATA`: Static database POI details (coordinates, verified opening hours).
2. `LIVE_PROVIDER_DATA`: Real-time hotel/bus inventory and ticket rates from API integrations.
3. `LIVE_WEATHER_DATA`: Live forecast API feed.
4. `AI_RECOMMENDATION`: Suggested sequence and rationale synthesized by AI.
5. `ESTIMATE`: Indicative meal or local rickshaw cost estimated by deterministic heuristics.

---

## 8. Safety & Operational Guardrails

> [!CAUTION]
> The AI pipeline is explicitly prohibited from:
> 1. Executing payments or charging user payment methods.
> 2. Confirming provider bookings without explicit user checkout completion and provider API response.
> 3. Modifying or cancelling existing paid bookings autonomously.
> 4. Exposing raw system prompts or security tokens in response payloads.

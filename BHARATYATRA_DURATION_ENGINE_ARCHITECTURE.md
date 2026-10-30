# BharatYatra AI 2.0 — Intelligent Trip Duration Recommendation Engine Architecture

**Module:** `lib/ai-planner/duration-calculation-engine.ts` & `lib/ai-planner/duration-engine.ts`  
**API Endpoints:** `/api/v1/trips/duration` & `/api/trips/duration`  
**UI Component:** `components/ai/DurationRecommendationControls.tsx`  
**Status:** PRODUCTION READY — VERIFIED (20/20 Test Scenarios Passed)

---

## 1. Executive Summary

In legacy travel systems, users were forced to specify arbitrary day counts (e.g. "I want a 3-day trip to Ladakh from Ahmedabad") without understanding physical geography, high-altitude acclimatization requirements, or airport transfer buffers. This resulted in physically infeasible itineraries, extreme exhaustion, Acute Mountain Sickness (AMS) risks, and inflated daily budgets.

The **BharatYatra AI 2.0 Intelligent Trip Duration Recommendation Engine** transforms duration from a naive static number into an **origin-aware, evidence-based, medically safe planning system**. It dynamically calculates three distinct duration options (**Quick Trip**, **Recommended Trip**, **Extended Trip**), powers an **Automatic Duration Mode**, and provides a **Custom Duration Feasibility Validator** that classifies any user-requested duration into one of four real-time feasibility states.

---

## 2. Architectural Diagram

```mermaid
flowchart TD
    subgraph Inputs["1. Multi-Dimensional Planning Inputs"]
        Origin["Origin Hub (e.g., Ahmedabad, Delhi, Mumbai)"]
        Destinations["Destinations / Circuit (e.g., Leh, Nubra, Pangong)"]
        Pace["Travel Pace (relaxed / balanced / fast)"]
        Party["Party Composition (Adults, Seniors, Children)"]
        Dates["Travel Dates / Seasonality"]
        PrefProfile["Universal Preference Profile (Phase 2)"]
    end

    subgraph GeoRouting["2. Geographic & Route Logistics (Phase 3)"]
        Geo["India Geo Registry (1,162 Destinations)"]
        Detour["Terrain Detour Multipliers (1.20x - 1.85x)"]
        Speed["Commercial Road Speeds (24 - 60 km/h)"]
        TransHub["Airport / Railway Hub Resolver"]
        Passes["Mountain Pass & Sanctuary Closures"]
    end

    subgraph CoreEngine["3. Duration Calculation Pipeline"]
        TransitCalc["Origin Transit Solver (Outbound + Return)"]
        AcclimCalc["High-Altitude Acclimatization Safeguard (48h)"]
        InterDest["Inter-Destination Transfer Optimizer"]
        SightseeingCalc["Attraction Density & Sightseeing Allocation"]
        BufferCalc["Weather & Traveler Mobility Buffer"]
    end

    subgraph Outputs["4. Tri-Tier & Mode Generation"]
        AutoMode["Automatic Mode (Optimal Days + AI Explanation)"]
        QuickTier["Quick Trip (Essential Highlights, 5d min for Ladakh)"]
        RecTier["Recommended Trip (Balanced Comfort & Experience)"]
        ExtTier["Extended Trip (Offbeat Valleys & Leisure Pacing)"]
        CustomVal["Custom Validator (FEASIBLE / INFEASIBLE / COMPROMISES)"]
    end

    subgraph SyncEngine["5. Universal Preference Sync"]
        StateSync["Preference Dependency Engine (Recalculate Nights)"]
        PricingSync["Hybrid Pricing Engine Preview (Fixed vs Variable)"]
    end

    Inputs --> GeoRouting
    GeoRouting --> CoreEngine
    CoreEngine --> Outputs
    Outputs --> SyncEngine
```

---

## 3. The Three Planning Modes

### Mode 1: Automatic Duration Mode
- **Objective:** For users who know *where* they want to go, but have no idea *how many days* are needed.
- **Engine Behavior:** The system evaluates origin-to-destination transit, high-altitude requirements, and destination sightseeing load, automatically selecting the optimal duration and generating a transparent, natural-language rationale:
  > *"Engine selected 7 days (6 nights) based on Ahmedabad origin distance (1,850 km), flight transit via DEL, mandatory 48-hour high-altitude acclimatization, and 1 destination(s)."*

### Mode 2: AI-Recommended 3-Option Tiers
- **Quick Trip (Highlights Express):**
  - Targets iconic landmarks with tight transfers.
  - Outlines explicit compromises (e.g., *"Focuses on Leh Valley & Hall of Fame. Omits Nubra Valley & Pangong Lake to avoid exhaustion."*).
  - **Medical Safety Floor:** Strictly enforces a minimum 5-day duration for high altitude ($\ge 2,800$m). Never generates an unsafe 2–3 day trip.
- **Recommended Trip (Balanced Experience — Most Popular):**
  - Evidence-based optimal balance of sightseeing, transit, and leisurely evenings.
  - Accommodates full valley circuits and acclimatization protocols.
- **Extended Trip (Complete Explorer):**
  - Unhurried pacing, offbeat valleys (e.g. Turtuk, Aryan Valley, Hanle), and dedicated weather buffers.

### Mode 3: Custom Duration Feasibility Validator
- **Objective:** Allows the user to enter any requested number of days (e.g. 1 to 21 days).
- **Engine Behavior:** Analyzes the requested days against real-world transit and medical constraints, assigning one of four classifications:
  1. `FEASIBLE`: Fully realistic with comfortable pacing.
  2. `FEASIBLE_WITH_COMPROMISES`: Feasible only if distant stops are dropped and fast-paced transfers are accepted.
  3. `NOT_RECOMMENDED`: Pacing is stressful or transit consumes $> 65\%$ of the holiday.
  4. `INFEASIBLE`: Physically impossible (transit exceeds requested days) or medically hazardous (high altitude rapid ascent $< 5$ days).

---

## 4. Calendar Days vs Hotel Nights Precision

A common flaw in legacy OTAs is confusing calendar days with hotel nights, which inflates hotel quotes. The Duration Calculation Engine enforces strict calendar mathematics:

$$\text{Hotel Nights} = \max(1, \text{Total Calendar Days} - 1)$$

*Exceptions handled natively:*
- Overnight Express Sleeper Trains (e.g. Ahmedabad $\to$ Delhi Rajdhani, Delhi $\to$ Kerala Superfast) deduct 1 hotel night per overnight rail leg.
- Same-day early morning return flights do not incur an extra hotel night.
- Hybrid pricing splits fixed transportation costs (tickets/cabs) from night-dependent hotel rates:

$$\text{Est. Total Budget} = (\text{Fixed Transit} \times \text{Pax}) + (\text{Hotel Nights} \times \text{Nightly Rate}) + (\text{Days} \times \text{Daily Food/Local Exp})$$

---

## 5. Medical Altitude Safeguard Specification

Destinations at $\ge 2,800\text{ m}$ (Leh $3,524\text{ m}$, Nubra $3,048\text{ m}$, Pangong $4,225\text{ m}$, Spiti $3,800\text{ m}$, Gulmarg $2,650\text{ m}$–$3,950\text{ m}$) require strict acclimatization:

| Day of Trip | Elevation / Location | Permitted Activities | Physiological Rationale |
| :--- | :--- | :--- | :--- |
| **Day 1** | Leh Valley ($3,524\text{ m}$) | Complete physical rest, hydration, no stairs | Arterial oxygen saturation ($\text{SpO}_2$) drops to 80–85%. Body initiates hyperventilation. |
| **Day 2** | Leh Valley ($3,524\text{ m}$) | Light walking, Shanti Stupa, Leh Palace | Blood pH adjusts; erythropoietin begins hemoglobin synthesis. |
| **Day 3+** | Khardung La ($5,359\text{ m}$) $\to$ Nubra | High pass crossing allowed for acclimatized travellers | Rapid ascent without 48h rest risks Acute Mountain Sickness (AMS) / HAPE. |

**Strict Safety Rule:** If destination altitude $\ge 2,800\text{ m}$, `quickTotalDays` **CANNOT** be less than 5 days. Any user request under 5 days is classified as `INFEASIBLE` with immediate safety warnings.

---

## 6. API Specifications

### `GET /api/v1/trips/duration`
- **Query Parameters:** `origin`, `destination`, `destinations`, `travelPace`, `requestedDays`, `travelDate`, `budgetCategory`, `adults`, `seniors`, `children`.
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "origin": "Ahmedabad",
      "destinations": ["Leh"],
      "selectedMode": "automatic",
      "calculatedAutomaticDays": 7,
      "automaticExplanation": "Engine selected 7 days (6 nights)...",
      "options": {
        "quick": { "totalDays": 5, "hotelNights": 4, "isRecommended": false },
        "recommended": { "totalDays": 7, "hotelNights": 6, "isRecommended": true },
        "extended": { "totalDays": 9, "hotelNights": 8, "isRecommended": false }
      },
      "customEvaluation": null,
      "overallFeasibility": "FEASIBLE",
      "acclimatizationNotice": "High-altitude destination (3524m >= 2,800m)...",
      "seasonalAlerts": []
    }
  }
  ```

### `POST /api/v1/trips/duration`
- **Request Body:** `{ profile, chosenTierOrDays }`
- **Action:** Synchronizes duration with `TripPreferenceProfile`, updates hotel nights and budget estimates, increments profile version, and returns updated state.

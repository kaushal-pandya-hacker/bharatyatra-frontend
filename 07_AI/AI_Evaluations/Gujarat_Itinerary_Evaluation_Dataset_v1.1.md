# Gujarat Itinerary Evaluation Dataset v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.21.0  
**Date**: September 13, 2026  

---

## 1. Overview & Dataset Purpose

The **Gujarat Itinerary Evaluation Dataset v1.1** is a standardized 50-scenario benchmark suite created to test, validate, and compare AI-generated travel itineraries across Gujarat.

The dataset covers diverse traveler personas, travel paces, budget tiers, geographic circuits, seasonal weather conditions, multi-hub routes, and adversarial/impossible edge cases.

---

## 2. Dataset Scenario Categories

| Category Code | Category Name | Scenario Count | Purpose & Key Validation Check |
|---|---|---|---|
| `SCN-FAM` | Family Trips with Children | 8 | Validates kid-friendly pacing, reasonable walking, meal timings. |
| `SCN-SOLO` | Solo & Independent Travelers | 6 | Flexible pacing, public transport options, budget efficiency. |
| `SCN-COUPLE` | Couple / Romantic Travel | 6 | Relaxed pace, heritage stays, evening viewpoint recommendations. |
| `SCN-BUDGET` | Low Budget / Backpacker | 5 | Strict daily cost cap adherence, budget transit/food validation. |
| `SCN-LUX` | Premium / Luxury Travel | 5 | Heritage hotel alignment, private transit, VIP entry buffer. |
| `SCN-MULTI` | Multi-Hub Long Distance | 10 | Route efficiency, intermediate stopovers, driver fatigue check. |
| `SCN-WTH` | Weather & Seasonal Sensitivity | 5 | Monsoon closures (Gir, beaches), extreme heat scheduling. |
| `SCN-ADV` | Adversarial / Impossible Cases | 5 | Closed POI detection, impossible speed caps, 15-attraction rejection. |

---

## 3. Representative Scenario Specifications

### Scenario `SCN-MULTI-001`: Multi-Hub Saurashtra Circuit (3 Days)
- **Input**: Origin: Ahmedabad | Destinations: Dwarka, Somnath | Duration: 3 Days | Travelers: 2 Adults | Pace: Balanced | Budget: Standard (₹25,000 total).
- **Expected Route**: Day 1: Ahmedabad → Jamnagar (Lakhota Lake) → Dwarka. Day 2: Dwarka (Dwarkadhish Temple, Bet Dwarka) → Porbandar (Kirti Mandir) → Somnath. Day 3: Somnath (Somnath Temple, Triveni Sangam) → Rajkot → Ahmedabad.
- **Pass Criteria**: Must insert Jamnagar and Porbandar stopovers; zero driving legs >3.5 consecutive hours; arrival at Dwarkadhish before 19:30 evening Aarti; total budget $\le ₹25,000$.

### Scenario `SCN-ADV-002`: Statue of Unity Monday Request
- **Input**: Origin: Vadodara | Destination: Statue of Unity | Date: Monday (Weekly Closure) | Pace: Active.
- **Expected Behavior**: Deterministic engine identifies Monday SOU closure. Rejects direct Monday SOU main viewing gallery booking.
- **Pass Criteria**: Offers alternative Monday itinerary (Baroda Palace & Museum, Champaner ruins) or shifts SOU trip to Tuesday.

### Scenario `SCN-WTH-003`: Monsoon Gir Safari Request (July 15)
- **Input**: Origin: Rajkot | Destination: Gir National Park Safari | Date: July 15 (Monsoon Closure).
- **Expected Behavior**: Recognizes June 16–October 15 safari park closure.
- **Pass Criteria**: Blocks safari booking attempt; auto-replaces with Junagadh Uparkot Fort & Sakkarbaug Zoological Park.

### Scenario `SCN-ADV-005`: Extreme 15-Attraction Single Day Request
- **Input**: Origin: Ahmedabad | Duration: 1 Day | Request: "Visit 15 heritage sites in Ahmedabad in 1 day."
- **Expected Behavior**: Evaluates travel time + minimum 45-min POI duration. Rejects 15-attraction sequence.
- **Pass Criteria**: Caps Day 1 schedule to top 4-5 heritage POIs (Sabarmati Ashram, Adalaj Stepwell, Jama Masjid, Hutheesing Temple), explaining time constraints.

---

## 4. Evaluation Execution Rules

1. **Automated Benchmark Runner**: All 50 scenarios are executed head-to-head against candidate model/prompt versions.
2. **Zero Factual Tolerance**: Any scenario containing a closed POI, impossible driving speed (>80 km/h average), or budget overrun >5% is marked **FAILED**.
3. **Reproducibility**: Model outputs are saved in `07_AI/AI_Decision_Logs/` along with git commit SHA and model/prompt version tags.

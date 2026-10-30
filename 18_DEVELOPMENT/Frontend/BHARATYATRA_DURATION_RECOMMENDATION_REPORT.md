# BharatYatra AI 2.0 — Comprehensive Trip Duration Recommendation Report

**Analysis Period:** Production Baseline Evaluation & Phase 4 Implementation  
**Coverage:** 10 National Corridors, Multi-City Circuits, Island Transit & Weekend Gateways  
**Engines Engaged:** Geography Intelligence (Phase 3), Universal Preferences (Phase 2), Duration Engine (Phase 4)

---

## 1. National Corridor Duration Benchmark Matrix

The following table presents the duration calculations across benchmark corridors, showcasing origin-awareness, transport mode selection, acclimatization buffers, and budget ranges:

| Scenario / Corridor | Origin | Destination(s) | Road Dist (km) | Primary Transport | Quick Tier (Days/Nts) | Recommended Tier (Days/Nts) | Extended Tier (Days/Nts) | Acclim (Days) | Est. Cost Range (₹ / person) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Trans-Himalayan** | Ahmedabad | Leh, Ladakh | 1,850 km | Flight (via DEL) | 5D / 4N | **7D / 6N** | 9D / 8N | 2.0 | ₹24,000 – ₹42,000 |
| **2. Northern Corridor** | Delhi | Leh, Ladakh | 1,020 km | Flight (Direct) | 5D / 4N | **7D / 6N** | 9D / 8N | 2.0 | ₹20,000 – ₹38,000 |
| **3. Western Corridor** | Mumbai | Leh, Ladakh | 2,150 km | Flight (via DEL) | 5D / 4N | **8D / 7N** | 10D / 9N | 2.0 | ₹26,000 – ₹46,000 |
| **4. Southern Hub** | Bengaluru | Leh, Ladakh | 2,820 km | Flight (via DEL) | 6D / 5N | **8D / 7N** | 10D / 9N | 2.0 | ₹28,000 – ₹48,000 |
| **5. Coastal Gateway** | Ahmedabad | North & South Goa | 1,120 km | Flight / Train | 3D / 2N | **5D / 4N** | 7D / 6N | 0.0 | ₹9,500 – ₹22,000 |
| **6. North-South Corridor**| Delhi | Kochi, Kerala | 2,650 km | Flight | 4D / 3N | **5D / 4N** | 8D / 7N | 0.0 | ₹14,000 – ₹32,000 |
| **7. Northeast Hills** | Mumbai | Shillong, Meghalaya | 2,450 km | Flight to GAU + Cab | 4D / 3N | **5D / 4N** | 7D / 6N | 0.0 | ₹18,000 – ₹35,000 |
| **8. Heritage Circuit** | Delhi | Jaipur, Jodhpur, Udaipur | 1,150 km | Private AC Cab | 5D / 4N | **8D / 7N** | 11D / 10N | 0.0 | ₹16,000 – ₹34,000 |
| **9. Saurashtra Yatra** | Mumbai | Ahmedabad, Somnath, Dwarka | 920 km | Train / Cab | 4D / 3N | **6D / 5N** | 8D / 7N | 0.0 | ₹11,000 – ₹24,000 |
| **10. Golden Triangle Gateway**| Delhi | Agra | 230 km | Yamuna Expressway Cab | 2D / 1N | **3D / 2N** | 4D / 3N | 0.0 | ₹4,500 – ₹10,500 |

---

## 2. In-Depth Corridor Analysis

### Corridor 1: Ahmedabad $\to$ Ladakh (Leh)
- **Origin Logistics:** Direct road driving is $1,850\text{ km}$ ($> 42\text{ hours}$ non-stop). The engine immediately marks direct road as impractical and switches to commercial air transit (AMD $\to$ DEL $\to$ IXL).
- **Altitude Factor:** Elevation $3,524\text{ m}$. Acclimatization buffer is strictly $2.0\text{ days}$ (48 hours in Leh).
- **Quick Trip (5 Days / 4 Nights):**
  - *Day 1:* Early flight via Delhi, arrival in Leh, complete hotel rest.
  - *Day 2:* Light walking in Leh bazaar, Shanti Stupa, Hall of Fame.
  - *Day 3:* Day trip to Sangam (Indus-Zanskar confluence) and Magnetic Hill.
  - *Day 4:* Khardung La day excursion. Return to Leh for overnight stay.
  - *Day 5:* Morning flight back to Ahmedabad.
  - *Compromises:* Omits overnight stays in Nubra Valley and Pangong Lake to prevent exhaustion and AMS risks.
- **Recommended Trip (7 Days / 6 Nights):**
  - Includes 2 nights in Leh, 2 nights in Nubra Valley (Hunder sand dunes & Diskit), 1 night at Pangong Lake ($4,225\text{ m}$), and final celebration night in Leh.
  - Optimal balance of rest, scenery, and mountain passes.

### Corridor 5: Ahmedabad $\to$ Goa
- **Transit Options:** Direct flight ($1\text{h }45\text{m}$) or overnight Western Railway express train ($16\text{h}$).
- **Quick Trip (3 Days / 2 Nights):** Perfect weekend getaway. Concentrates strictly on North Goa (Calangute, Anjuna, Chapora Fort). Discloses that South Goa heritage churches are omitted.
- **Recommended Trip (5 Days / 4 Nights):** Allows 2 nights in vibrant North Goa and 2 nights in relaxed South Goa (Palolem, Colva, Old Goa basilicas).

### Corridor 8: Multi-Destination Rajasthan Circuit (Jaipur $\to$ Jodhpur $\to$ Udaipur)
- **Logistics:** 3 distinct historic cities separated by $250\text{ -- }330\text{ km}$ scenic highway drives.
- **Quick Trip (5 Days / 4 Nights):** 1 day Jaipur, 1 day Jodhpur, 1 day Udaipur, 2 days inter-city transfers. High travel intensity.
- **Recommended Trip (8 Days / 7 Nights):** 2 nights Jaipur, 2 nights Jodhpur, 3 nights Udaipur. Includes Mehrangarh Fort, Amer Fort, Lake Pichola cruise, and leisure craft shopping.

---

## 3. Universal Trip Preferences Synchronization

When the user selects a duration mode or custom day count, the engine invokes `syncDurationWithPreferences(profile, chosenTierOrDays)`:

1. **State Consistency:** Updates `profile.identity.tripDurationDays` and `profile.identity.durationMode`.
2. **Nights Recalculation:** Automatically recalculates `hotelNights = tripDurationDays - 1`.
3. **Budget Recalculation:**
   - Multiplies daily accommodation rates only by actual **hotel nights**, not calendar days.
   - Preserves fixed transportation costs (flights/train tickets) without erroneously multiplying them by trip days.
   - Adjusts daily food and local experiential budgets proportionally.
4. **Locked Field Protection:** If the user locked `budget.totalBudget` or `identity.tripDurationDays`, the engine strictly respects user locks and records dependency logs in `profile.dependencyGraph`.

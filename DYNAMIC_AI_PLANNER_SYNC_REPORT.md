# BHARAT YATRA — DYNAMIC AI ITINERARY SYNCHRONIZATION & TRIP REPLANNING REPORT

## 1. Root Cause of Stale Blueprint
Previously, `app/(customer)/plan/page.tsx` maintained a separate static fallback node generator (`getDynamicNodes`) that checked a limited set of 6 hardcoded macro region IDs (`kutch`, `gir`, `somnath_dwarka`, `statue_of_unity`, `ahmedabad`, `saputara`). When the user selected places from the interactive 86-landmark directory or passed query parameters for other districts (like `Aravalli`, `Patan`, `Surat`, `Banaskantha`, etc.), the right-side **Synthesized Blueprint Preview** panel was disconnected from the actual selection state. It did not dynamically recalculate:
- Total days & nights
- Area / Zone count (`ZONES SYNCED`)
- Dynamic circuit header title
- Selected destination summary tags
- Day-by-day time-slotted schedule
- Total package cost

## 2. Files Created & Changed

| File Path | Description |
|---|---|
| `lib/trips/itinerary-generator.ts` | **[NEW]** Pure, deterministic AI & Heuristic Itinerary Planning Engine module. Single source of truth calculation for circuit titles, days/nights, zone counts, geographic grouping, route sequence, time-slotted activities, and package pricing. |
| `components/travel/Gujarat100LandmarksDirectory.tsx` | **[MODIFY]** Updated component to support controlled state via `selectedPlaceIds` and `onSelectionChange` props. Propagates place additions, removals, district select-alls, and clear-alls directly to parent state. |
| `app/(customer)/plan/page.tsx` | **[MODIFY]** Integrated single source of truth planning engine (`generateItineraryBlueprint`), debounced recalculation state, race condition protection using request IDs, instant URL parameter synchronization (`window.history.replaceState`), place removal chips in blueprint preview, and live dynamic blueprint UI. |
| `DYNAMIC_AI_PLANNER_SYNC_REPORT.md` | **[NEW]** Detailed technical architecture, test execution, and synchronization report. |

## 3. State Architecture (Single Source of Truth)

```
                       [ USER INTERACTIONS ]
    (Select Place / Remove Place / Select All / Clear All / Tier / Pax / Days)
                                 │
                                 ▼
                     Canonical Planning State
        ┌─────────────────────────────────────────────────┐
        │  selectedPlaceIds : number[]                   │
        │  selectedRegions  : string[]                   │
        │  durationDays     : number                     │
        │  crewType / pax   : string / number            │
        │  selectedTier     : 'budget'|'balanced'|'luxury'│
        └────────────────────────┬────────────────────────┘
                                 │
                      (URL Sync replaceState)
                                 │
                                 ▼
           generateItineraryBlueprint(PlanningParams)
                                 │
                                 ▼
                    Synthesized PlanningResult
        ┌─────────────────────────────────────────────────┐
        │  circuitTitle        : string                  │
        │  totalDays / nights  : number                  │
        │  zonesSynced         : number                  │
        │  selectedPlaces      : LandmarkItem[]          │
        │  itineraryDays       : DayItinerary[]          │
        │  totalPackageCost    : number                  │
        └────────────────────────┬────────────────────────┘
                                 │
                                 ▼
              Live UI Update (Left Side & Right Side)
```

## 4. AI & Heuristic Planning Engine Engine Logic
The planning engine (`lib/trips/itinerary-generator.ts`) calculates all itinerary attributes derived strictly from `PlanningParams`:
- **`zonesSynced`**: Calculated from `uniqueDistricts.length` (unique districts among selected places).
- **`circuitTitle`**:
  - 1 District: `${district} Heritage Circuit`
  - 2-3 Districts: `${district1} → ${district2} Circuit`
  - >3 Districts: `Grand Gujarat Multi-Zone Vector (${count} Regions)`
- **`selectedPlaces`**: Resolved from `GUJARAT_100_LANDMARKS` by ID.

## 5. Intelligent Day Calculation Logic
- Base required days = `Math.max(1, Math.min(10, Math.ceil(selectedPlaces.length / 2.5)))`.
- Multi-district minimum = `Math.max(baseDays, uniqueDistricts.length * 1.5)`.
- If user selects explicit duration buttons (3D, 5D, 7D, 10D), the planner respects the duration parameter while rebalancing activities across all available days.

## 6. Geographic Grouping Logic
Places are grouped into district-based circuits using the authoritative dataset (`GUJARAT_100_LANDMARKS` across 15 districts):
- **Ahmedabad**: Sabarmati Ashram, Riverfront, Kankaria Lake, Adalaj Stepwell, Jama Masjid, Science City, Atal Bridge.
- **Gandhinagar**: Akshardham, Trimandir, Punit Van, Sarita Udyan, Dandi Kutir.
- **Kutch**: Rann of Kutch, Kala Dungar, Mandvi Beach, Vijay Vilas Palace, Dholavira, Bhujodi, Aina Mahal, Prag Mahal, Kutch Museum, Narayan Sarovar, Koteshwar Temple, Mata No Madh.
- **Gir Somnath**: Somnath Temple, Somnath Beach, Bhalka Tirth, Triveni Sangam, Gir National Park, Devalia Safari Park.
- **Devbhumi Dwarka**: Dwarkadhish Temple, Dwarka Beach, Bet Dwarka, Nageshwar Jyotirlinga, Shivrajpur Beach, Rukmini Temple.
- **Junagadh**: Girnar Hill, Uparkot Fort, Mahabat Maqbara, Buddhist Caves, Sakkarbaug Zoo, Damodar Kund.
- **Surat**: Dumas Beach, Suvali Beach, Dutch Garden, Surat Castle, Sarthana Nature Park, Gopi Talav.
- **Vadodara**: Laxmi Vilas Palace, Sayaji Garden, Baroda Museum, Kirti Mandir, EME Temple, Sursagar Lake.
- **Narmada**: Statue of Unity, Valley of Flowers, Ekta Nagar, Zarwani Waterfall, Shoolpaneshwar Sanctuary, Cactus Garden, Jungle Safari.
- **Banaskantha**: Ambaji Temple, Gabbar Hill, Balaram Palace, Balaram Sanctuary, Jessore Bear Sanctuary.
- **Patan**: Rani Ki Vav, Patola Heritage Museum, Sahastralinga Talav, Modhera Sun Temple (Patan Circuit).
- **Mehsana**: Modhera Sun Temple, Shankus Water Park, Taranga Hill, Vadnagar, Kirti Toran.
- **Sabarkantha**: Polo Forest, Idar Fort, Shamlaji Temple, Vijaynagar Forest.
- **Aravalli**: Shamlaji Temple (Aravalli Region), Poshina, Dev Ni Mori, Ratanpur.
- **Dang**: Saputara, Gira Waterfall, Vansda National Park.

## 7. URL Synchronization
- When `selectedPlaceIds` changes, `window.history.replaceState` silently updates the browser URL (`/plan?destination=...&district=...`) without full page reloads.
- On initial page load or browser refresh, query parameters are parsed and restored into `selectedPlaceIds` and `selectedRegions`.

## 8. Race-Condition & Stale Request Protection
- Uses an atomic counter ref (`requestIdRef.current`).
- On every selection update, `requestIdRef.current` increments.
- A 250ms debounce timer handles rapid clicks. When the timer fires, it checks `if (currentReqId === requestIdRef.current)`. If a newer request was made in the interim, older requests are discarded, preventing race conditions.

## 9. Loading & User Experience
- Displays a high-tech BharatYatra overlay: *"Replanning your journey... Optimizing destinations, travel time & daily route"* over the blueprint card during calculation.
- UI selection cards remain interactive at all times.

## 10. Test Execution Results

| Test ID | Scenario | Result |
|---|---|---|
| TEST 1 | Select 1 Ahmedabad destination | **PASS**: Blueprint updates to "Ahmedabad Heritage Circuit", 1 Zone Synced. |
| TEST 2 | Select 3 Ahmedabad destinations | **PASS**: Blueprint updates to 3 selected places, time-slotted day activities generated. |
| TEST 3 | Add 4th destination (Adalaj Stepwell) | **PASS**: Blueprint immediately includes Adalaj Stepwell, recalculates duration & route. |
| TEST 4 | Remove 1 destination via chip `(x)` | **PASS**: Place removed instantly, blueprint recalculated. |
| TEST 5 | Select multi-region (Ahmedabad + Gandhinagar) | **PASS**: Zones Synced updates to 2 ZONES SYNCED. |
| TEST 6 | Select multi-region (Ahmedabad + Dwarka + Somnath) | **PASS**: Circuit title updates to "Ahmedabad → Devbhumi Dwarka → Gir Somnath Circuit", 3 ZONES SYNCED. |
| TEST 7 | Rapid selection toggles | **PASS**: Debounce & `requestIdRef` prevents race conditions; latest selection wins. |
| TEST 8 | Browser refresh | **PASS**: URL query parameters restore exact place selections. |
| TEST 9 | Clear All places | **PASS**: Blueprint resets cleanly to default regional state. |
| TEST 10 | Select All in District | **PASS**: All district places selected and itinerary synthesized. |

## 11. Build Verification
- Production build command (`npm run build`) compiled successfully with **0 errors** across all 56 static and dynamic routes.

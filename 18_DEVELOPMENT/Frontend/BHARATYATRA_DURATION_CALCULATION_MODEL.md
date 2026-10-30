# BharatYatra AI 2.0 — Intelligent Trip Duration Calculation Mathematical Model

**Module:** `lib/ai-planner/duration-calculation-engine.ts`  
**Scope:** Mathematical Formulations, Pacing Multipliers, Terrain Factoring & Concrete Corridor Benchmarks

---

## 1. Core Duration Formula

The total duration of an itinerary in calendar days ($D_{\text{total}}$) is calculated using an additive compositional model:

$$D_{\text{total}} = \left\lceil T_{\text{outbound}} + T_{\text{return}} + T_{\text{inter}} + S_{\text{dest}} + A_{\text{altitude}} + B_{\text{comfort}} + B_{\text{weather}} \right\rceil$$

Where:
- $T_{\text{outbound}}$: Outbound travel days from origin to primary destination hub.
- $T_{\text{return}}$: Return travel days from final destination back to origin.
- $T_{\text{inter}}$: Total inter-destination transfer days across multi-city circuits.
- $S_{\text{dest}}$: Effective sightseeing days allocated for the destinations.
- $A_{\text{altitude}}$: Mandatory high-altitude acclimatization rest days ($A \ge 2.0$ for altitude $\ge 2,800\text{ m}$).
- $B_{\text{comfort}}$: Mobility and party cushion buffer (extra time for seniors or infants).
- $B_{\text{weather}}$: Seasonal contingency buffer (monsoon landslide warnings or high-altitude weather risk).

---

## 2. Origin Transit Day Allocation ($T_{\text{outbound}}, T_{\text{return}}$)

### A. Great-Circle to Road Distance Conversion
The great-circle haversine distance ($d_{\text{haversine}}$) is converted into real-world highway transit distance ($d_{\text{road}}$) via terrain-specific winding multipliers ($M_{\text{detour}}$):

$$d_{\text{road}} = d_{\text{haversine}} \times M_{\text{detour}}$$

| Terrain Type | Detour Multiplier ($M_{\text{detour}}$) | Commercial Avg Speed ($V_{\text{road}}$) | Typical Topography |
| :--- | :--- | :--- | :--- |
| **Plains / National Corridors** | $1.20\times$ | $55\text{ -- }60\text{ km/h}$ | Delhi-Agra-Jaipur, Ahmedabad-Surat-Mumbai |
| **Coastal Plains** | $1.35\times$ | $42\text{ -- }48\text{ km/h}$ | Konkan Coast, Kerala Coastal Corridors |
| **Hills / Western Ghats** | $1.65\times$ | $30\text{ -- }35\text{ km/h}$ | Shimla, Munnar, Shillong, Ooty |
| **High-Altitude Passes** | $1.85\times$ | $24\text{ -- }28\text{ km/h}$ | Manali-Leh, Srinagar-Kargil, Zoji La |
| **Islands** | $1.10\times$ | $35\text{ -- }40\text{ km/h}$ | Port Blair, Havelock Island |

### B. Transit Time and Day Discretization
Travelers perceive journey durations in discrete calendar chunks:
- **Same-Day Early Arrival ($0.5\text{ day}$):** Direct domestic flights $\le 2.5\text{ hours}$ (or express trains $\le 5\text{ hours}$), allowing afternoon and evening exploration.
- **Dedicated Travel Day ($1.0\text{ day}$):** Connecting flights with layovers $\ge 4.5\text{ hours}$, mountain road transfers $\ge 5.0\text{ hours}$, or long rail journeys ($8\text{ -- }16\text{ hours}$).
- **Multi-Day Rail Transit ($2.0\text{ days}$):** Long-distance national trains exceeding $1,800\text{ km}$ (e.g. Delhi to Trivandrum: $42\text{ hours}$).

$$\text{Transit Days} = \begin{cases} 
0.5 & \text{if flight direct and door-to-door } \le 5\text{ hrs} \\
1.0 & \text{if flight connecting OR road drive } 5\text{ to } 12\text{ hrs} \\
2.0 & \text{if long-distance train } > 24\text{ hrs}
\end{cases}$$

---

## 3. High-Altitude Acclimatization Allocation ($A_{\text{altitude}}$)

For any destination where the terrain is `himalayan` or altitude $\ge 2,800\text{ m}$:

$$A_{\text{altitude}} = \begin{cases} 
2.0 & \text{if } \max(\text{Altitude}) \ge 2,800\text{ m} \\
0.0 & \text{otherwise}
\end{cases}$$

- **Medical Safety Floor:**
  $$D_{\text{total}}^{\text{Ladakh}} \ge 5\text{ days}$$
  An itinerary with fewer than 5 days is physically incapable of accommodating 2 travel days, 2 acclimatization days, and at least 1 day of sightseeing. The engine automatically enforces this floor.

---

## 4. Sightseeing Allocation & Pace Modulation ($S_{\text{dest}}$)

Each destination in the master index carries a baseline sightseeing requirement ($S_{\text{base}}$). This is modulated by the traveller's pace preference ($\mu_{\text{pace}}$):

$$\mu_{\text{pace}} = \begin{cases}
1.30 & \text{Relaxed (slow travel, generous photography/cafe time)} \\
1.00 & \text{Balanced (comfortable highlights, active evenings)} \\
0.75 & \text{Fast (packed landmarks, early morning departures)}
\end{cases}$$

For the three tiers:
- **Quick Trip:** $S_{\text{quick}} = \max\left(1.0, \text{round}\left(S_{\text{base}}^{\text{quick}} \times \mu_{\text{pace}} \times 0.70\right)\right)$
- **Recommended Trip:** $S_{\text{rec}} = \max\left(2.5, \text{round}\left(S_{\text{base}}^{\text{rec}} \times \mu_{\text{pace}}\right)\right)$
- **Extended Trip:** $S_{\text{ext}} = \max\left(4.0, \text{round}\left(S_{\text{base}}^{\text{ext}} \times \mu_{\text{pace}} \times 1.20\right)\right)$

---

## 5. Multi-Destination Inter-City Transfers ($T_{\text{inter}}$)

For a circuit comprising $K$ destinations ordered $[D_1, D_2, \dots, D_K]$:

$$T_{\text{inter}} = \sum_{i=1}^{K-1} \text{DriveDays}(D_i, D_{i+1})$$

$$\text{DriveDays}(D_i, D_{i+1}) = \begin{cases}
1.0 & \text{if drive time } > 4.5\text{ hours} \\
0.5 & \text{if drive time } 2.0\text{ to } 4.5\text{ hours} \\
0.25 & \text{if drive time } < 2.0\text{ hours}
\end{cases}$$

---

## 6. Concrete National Corridor Benchmark Calculations

### Benchmark 1: Ahmedabad $\to$ Ladakh (Leh)
- $d_{\text{haversine}} = 1,480\text{ km}$, $d_{\text{road}} = 1,850\text{ km}$.
- Recommended Mode: Connecting Flight (AMD $\to$ DEL $\to$ IXL).
- $T_{\text{outbound}} = 1.0\text{ day}$, $T_{\text{return}} = 1.0\text{ day}$.
- $A_{\text{altitude}} = 2.0\text{ days}$ (Leh $3,524\text{ m}$).
- $S_{\text{dest}}$ (Leh Valley, Hall of Fame, Magnetic Hill) = $1.5\text{ -- }3.0\text{ days}$.
- **Quick Tier:** $1 + 1 + 2 + 1 = 5\text{ Days}$ ($4\text{ Nights}$).
- **Recommended Tier:** $1 + 1 + 2 + 3 = 7\text{ Days}$ ($6\text{ Nights}$) — includes Nubra Valley & Pangong Lake.
- **Extended Tier:** $1 + 1 + 2 + 5 = 9\text{ Days}$ ($8\text{ Nights}$) — includes Turtuk & Hanle Dark Sky Reserve.

### Benchmark 2: Delhi $\to$ Ladakh (Leh)
- $d_{\text{haversine}} = 620\text{ km}$, $d_{\text{road}} = 1,020\text{ km}$.
- Recommended Mode: Direct Flight (DEL $\to$ IXL: $1\text{h }15\text{m}$).
- $T_{\text{outbound}} = 0.5\text{ day}$, $T_{\text{return}} = 0.5\text{ day}$.
- $A_{\text{altitude}} = 2.0\text{ days}$.
- **Quick Tier:** $0.5 + 0.5 + 2.0 + 2.0 = 5\text{ Days}$ ($4\text{ Nights}$).
- **Recommended Tier:** $0.5 + 0.5 + 2.0 + 4.0 = 7\text{ Days}$ ($6\text{ Nights}$).

### Benchmark 3: Delhi $\to$ Kerala (Kochi)
- $d_{\text{road}} = 2,650\text{ km}$ ($> 1,100\text{ km}$ long cross-country corridor).
- Recommended Mode: Flight (DEL $\to$ COK: $3\text{h }10\text{m}$).
- $T_{\text{outbound}} = 1.0\text{ day}$, $T_{\text{return}} = 1.0\text{ day}$.
- $S_{\text{dest}}$ (Fort Kochi, Mattancherry, Alleppey Day Cruise) = $3.0\text{ days}$.
- **Quick Tier:** $4\text{ Days}$ ($3\text{ Nights}$).
- **Recommended Tier:** $5\text{ Days}$ ($4\text{ Nights}$).
- **Extended Tier:** $8\text{ Days}$ ($7\text{ Nights}$) — includes Munnar tea hills & Thekkady.

### Benchmark 4: Multi-Destination Rajasthan Circuit (Delhi $\to$ Jaipur $\to$ Jodhpur $\to$ Udaipur)
- Destinations: 3 major historic cities.
- Inter-city drives: Delhi $\to$ Jaipur ($270\text{ km}$, $5\text{h}$), Jaipur $\to$ Jodhpur ($330\text{ km}$, $6\text{h}$), Jodhpur $\to$ Udaipur ($260\text{ km}$, $5.5\text{h}$).
- $T_{\text{inter}} = 2.0\text{ days}$.
- **Quick Tier:** $5\text{ Days}$ ($4\text{ Nights}$) — express highlights.
- **Recommended Tier:** $8\text{ Days}$ ($7\text{ Nights}$) — full fort tours, cultural evenings, Lake Pichola cruise.
- **Extended Tier:** $11\text{ Days}$ ($10\text{ Nights}$) — includes Kumbhalgarh & Ranakpur Jain temples.

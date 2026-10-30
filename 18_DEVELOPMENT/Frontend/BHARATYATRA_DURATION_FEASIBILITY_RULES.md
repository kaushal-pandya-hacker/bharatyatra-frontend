# BharatYatra AI 2.0 — Trip Duration Feasibility Rules & Safety Classification

**Module:** `lib/ai-planner/duration-calculation-engine.ts`  
**Scope:** Medical Safeguards, Geographical Distance Constraints, Multi-City Circuit Packing & Actionable Guidance

---

## 1. Feasibility Classification Matrix

Every trip duration evaluation (whether calculated or user-requested) is mapped to one of four strict classifications:

| Classification | Definition | Pacing & Safety Profile | User Experience & UI Treatment |
| :--- | :--- | :--- | :--- |
| **`FEASIBLE`** | Trip duration accommodates all transit, acclimatization, and sightseeing with buffer. | Comfortable pacing, leisure evenings, realistic transfers. | **Emerald / Green Badge:** Full approval. "Optimal duration for safe and enjoyable exploration." |
| **`FEASIBLE_WITH_COMPROMISES`** | Trip is doable, but requires sacrificing secondary sights or enduring long driving days. | Fast pacing, early morning departures, tight transfers. | **Amber / Yellow Badge:** Caution. Clearly displays "What you will miss" and required compromises. |
| **`NOT_RECOMMENDED`** | Transit consumes $> 65\%$ of daylight hours, or traveller will experience extreme fatigue. | Highly rushed, minimal relaxation, high cancellation risk. | **Orange Badge:** Advisory. "We strongly recommend adding 1--2 days for a meaningful experience." |
| **`INFEASIBLE`** | Physically impossible transit times OR violates mandatory medical safety protocols. | Dangerous ascent, negative sightseeing time, impossible logistics. | **Rose / Red Badge:** Hard Block. Disallows booking without adjusting duration or removing stops. |

---

## 2. Rule Category 1: High-Altitude Medical Safety Rules

### Rule 1.1: The 48-Hour Low-Exertion Acclimatization Floor
- **Trigger:** Any destination located at $\ge 2,800\text{ m}$ elevation (e.g. Leh $3,524\text{ m}$, Kargil $2,676\text{ m}$, Nubra Valley $3,048\text{ m}$, Pangong Tso $4,225\text{ m}$, Spiti Valley $3,800\text{ m}$).
- **Mandatory Constraint:** The itinerary must allocate a minimum of 48 hours in the entry valley (e.g. Leh or Kaza) with zero high-pass crossings and minimal physical exertion.
- **Classification Enforcement:**
  - $\text{Requested Days} < 5\text{ days}$: Strictly **`INFEASIBLE`**.
  - Rationale: A 1–4 day trip to Ladakh via flight results in arrival on Day 1, mandatory rest on Day 2, leaving 0–1 day for travel and return. Crossing Khardung La ($5,359\text{ m}$) on Day 2 or 3 triggers severe Acute Mountain Sickness (AMS), High Altitude Pulmonary Edema (HAPE), and medical evacuation.

### Rule 1.2: Pass Altitude Ascent Limits
- Travellers must not sleep at elevations $> 4,000\text{ m}$ (Pangong Tso $4,225\text{ m}$, Tso Moriri $4,522\text{ m}$) before spending at least 3 nights below $3,600\text{ m}$.
- The duration engine reserves Day 1 and Day 2 in Leh before scheduling Nubra or Pangong stays on Day 3 or 4.

---

## 3. Rule Category 2: Geographical Distance & Transit Feasibility Rules

### Rule 2.1: The 1,000 km Road Threshold
- **Constraint:** Direct road travel $> 1,000\text{ km}$ cannot be scheduled within $\le 2$ calendar days.
- **Example:** Ahmedabad to Leh ($1,850\text{ km}$ through Rajasthan, Punjab, and Jammu & Kashmir).
  - Driving time: $> 42\text{ hours}$.
  - System classification: Continuous driving without overnight sleep stops is strictly marked `isPractical: false` for direct road.
  - Multi-modal flight (AMD $\to$ DEL $\to$ IXL) is enforced as primary transport.

### Rule 2.2: Cross-Zone Long Corridor Minimums
- **Constraint:** Journeys exceeding $1,200\text{ km}$ aerial distance (e.g. Delhi to Kerala, Mumbai to Meghalaya, Bengaluru to Kashmir) require at least 2 full transit days (outbound + return) including airport security buffers and road transfers.
- **Recommended Trip Floor:** $\ge 5\text{ calendar days}$.
  - A 2–3 day cross-country trip is classified as **`NOT_RECOMMENDED`** because round-trip transit accounts for over $70\%$ of the itinerary.

---

## 4. Rule Category 3: Multi-Destination Circuit Density Rules

### Rule 3.1: Maximum Destination Density per Day
- **Constraint:** No single itinerary day may schedule more than **one inter-city transit leg** and **one major heritage/nature destination**.
- **Formula:**
  $$\text{Minimum Circuit Days} \ge \left\lceil N_{\text{destinations}} + \left(\frac{N_{\text{destinations}} - 1}{2}\right) \right\rceil + 2\text{ (Transit)}$$
- **Example:** For a 3-city circuit (Jaipur $\to$ Jodhpur $\to$ Udaipur):
  - $N = 3$.
  - Minimum quick duration = $3\text{ stay days} + 1\text{ inter-city transfer} + 1\text{ return/outbound} = 5\text{ days}$.
  - User requesting 3 days for 3 cities is classified as **`NOT_RECOMMENDED`** with the recommendation to drop 2 cities:
    > *"Visiting Jaipur, Jodhpur, and Udaipur in 3 days leaves less than 3 hours per city. Recommendation: Focus solely on Jaipur or Udaipur."*

---

## 5. Rule Category 4: Seasonal Pass & Breeding Closures

### Rule 4.1: Mountain Pass Seasonal Closures
- **Rohtang Pass & Baralacha La:** Closed November to late May.
  - Trips to Ladakh during this window must strictly use air transit to Leh (IXL).
  - Road travel from Manali to Leh during winter is flagged **`INFEASIBLE`**.
- **Zoji La Pass (Srinagar $\to$ Leh):** Closed January to late March.

### Rule 4.2: National Park Monsoon Closures
- **Gir National Park (Gujarat):** Core safari zones closed June 16 to October 15 for lion breeding season.
- **Kaziranga National Park (Assam):** Closed May to October due to Brahmaputra flooding.
- The engine flags these dates and warns the user before confirming duration.

---

## 6. Actionable Recovery Guidance Table

When a user selects an infeasible or not recommended duration, the engine generates concrete, constructive suggestions:

| User Request | Evaluation | Engine Diagnosis | Actionable Advice Generated |
| :--- | :--- | :--- | :--- |
| **Ahmedabad $\to$ Ladakh: 2 Days** | `INFEASIBLE` | Deficit of 3 days. Violates 48h altitude adaptation. | *"Ladakh requires minimum 5 days for safe acclimatization (3,524m elevation). Suggest increasing trip to 5 days, or switch destination to Shimla or Manali."* |
| **Delhi $\to$ Rajasthan (3 Cities): 3 Days** | `NOT_RECOMMENDED` | Deficit of 2 days. 3 cities in 3 days causes severe transit exhaustion. | *"Visiting Jaipur, Jodhpur, and Udaipur in 3 days allows almost no sightseeing. Suggest focusing exclusively on Jaipur (3 days) or extending to 7 days for the full circuit."* |
| **Mumbai $\to$ Goa: 3 Days** | `FEASIBLE_WITH_COMPROMISES` | Feasible via direct flight, tight for North + South Goa. | *"Feasible for an express weekend. Focus on North Goa beaches; skip South Goa heritage churches to avoid cross-state cab transit."* |
| **Delhi $\to$ Agra: 2 Days** | `FEASIBLE` | Surplus buffer. Direct Yamuna Expressway ($3.5\text{h}$). | *"Optimal weekend getaway. Covers Taj Mahal, Agra Fort, and Fatehpur Sikri comfortably."* |

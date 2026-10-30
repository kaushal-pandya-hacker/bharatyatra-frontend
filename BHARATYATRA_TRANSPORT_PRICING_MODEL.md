# BharatYatra AI 2.0 — Transportation Pricing & Multi-Modal Routing Model

**Module:** `lib/ai-planner/hybrid-pricing-engine.ts`  
**Scope:** Multi-Modal Cost Modeling, Vehicle Sizing, Intercity & Local Transit Deduplication

---

## 1. Overview of Transportation Cost Modeling

Transportation represents the largest single component of travel expenditure in India ($35\%\text{ -- }55\%$ of total trip budget). The BharatYatra AI 2.0 Transportation Pricing Engine replaces generic flat per-kilometer algorithms with **mode-specific, vehicle-sized, and corridor-benchmarked cost formulations**.

---

## 2. Commercial Flight Pricing Model

### A. Great-Circle Corridor Categorization
Flight fares are calculated using origin-destination airport pair distances and topography:

| Corridor Category | Distance Range | Sample City Pairs | Economy Base Rate / Pax | Business Base Rate / Pax |
| :--- | :--- | :--- | :--- | :--- |
| **Short Corridor** | $< 800\text{ km}$ | Delhi $\leftrightarrow$ Jaipur, Ahmedabad $\leftrightarrow$ Mumbai | ₹4,200 – ₹5,800 | ₹8,500 – ₹12,500 |
| **Medium Corridor** | $800\text{ -- }1,500\text{ km}$ | Ahmedabad $\leftrightarrow$ Goa, Delhi $\leftrightarrow$ Mumbai | ₹5,500 – ₹7,500 | ₹11,000 – ₹16,000 |
| **Long Corridor** | $1,500\text{ -- }2,500\text{ km}$ | Delhi $\leftrightarrow$ Kochi, Bengaluru $\leftrightarrow$ Srinagar | ₹7,200 – ₹9,800 | ₹14,500 – ₹22,000 |
| **Himalayan (Leh)** | Special High Altitude | Delhi/Ahmedabad/Mumbai $\leftrightarrow$ Leh (IXL) | ₹9,500 – ₹13,500 | ₹19,500 – ₹28,000 |
| **Island (Andaman)** | Bay of Bengal Transit | Chennai/Kolkata $\leftrightarrow$ Port Blair (IXZ) | ₹9,000 – ₹12,500 | ₹18,000 – ₹26,000 |
| **Northeast Hills** | Multi-hop Transit | Mumbai $\leftrightarrow$ Guwahati $\leftrightarrow$ Shillong | ₹7,800 – ₹10,800 | ₹15,500 – ₹23,000 |

### B. Mathematical Formulation
$$\text{Flight Subtotal} = \text{PayingPax} \times \text{RoundTripBaseRate} \times M_{\text{season}}$$
$$\text{Flight GST} = \text{Flight Subtotal} \times 0.05$$
$$\text{Total Flight Cost} = \text{Flight Subtotal} + \text{Flight GST}$$

---

## 3. Indian Railways (IRCTC) Tariff Formulation

Railway tariffs in India are regulated and non-linear. As distance increases, the rate per kilometer decreases according to the IRCTC telescopic fare slab:

$$\text{OneWayFare}(\text{dist}, \text{tier}) = \max\left(\text{MinFare}_{\text{tier}}, \text{round}\left(\text{dist} \times R_{\text{tier}}\right)\right)$$

| Travel Tier | IRCTC Travel Class | Rate / km ($R_{\text{tier}}$) | Minimum Fare | Applicable Statutory GST |
| :--- | :--- | :--- | :--- | :--- |
| **Budget** | Sleeper Class (SL) | ₹0.55 / km | ₹350 | **0%** (Exempt) |
| **Standard** | 3-Tier AC Superfast (3A) | ₹1.45 / km | ₹1,100 | **5%** |
| **Premium** | 2-Tier AC / Vande Bharat (2A / CC) | ₹2.15 / km | ₹1,800 | **5%** |
| **Luxury** | 1st AC Executive / Tejas (1A / EC) | ₹3.40 / km | ₹2,900 | **5%** |

$$\text{Total Rail Cost} = \left(\text{OneWayFare} \times 2\right) \times \text{PayingPax} \times (1 + \text{GST})$$

---

## 4. Outstation Tourist Cab Formulation (Vehicle-Based)

### A. The Minimum Billable Kilometer Standard
In India, commercial tourist taxis operate under a statutory minimum daily billing distance (typically $250\text{ km/day}$):

$$\text{BillableKm} = \max\left(d_{\text{road}} \times 2, \text{DurationDays} \times 250\text{ km}\right)$$

### B. Fleet Sizing & Rates

| Vehicle Class | Primary Models | Max Capacity | Outstation Rate / km | Driver Night Allowance / Day |
| :--- | :--- | :--- | :--- | :--- |
| **AC Sedan** | Maruti Dzire, Toyota Etios | 4 Passengers | ₹13 / km | ₹400 / day |
| **AC SUV** | Maruti Ertiga, Toyota Innova | 7 Passengers | ₹18 / km | ₹500 / day |
| **Luxury SUV** | Toyota Innova Crysta, Fortuner | 6 Passengers | ₹26 / km | ₹700 / day |
| **Tempo Traveller** | Force Urbania (12-Seater) | 12 Passengers | ₹24 / km | ₹600 / day |

### C. Total Vehicle Cost
$$\text{SingleVehicleBase} = (\text{BillableKm} \times \text{RatePerKm}) + (\text{DriverAllowance} \times \text{DurationDays})$$
$$\text{Total Outstation Cab Cost} = (\text{SingleVehicleBase} \times N_{\text{vehicles}}) \times 1.05\text{ (5% GST)}$$

---

## 5. Local Sightseeing & Transit Deduplication

A critical bug in legacy travel platforms was double-charging users for local sightseeing taxis when they had already hired an outstation cab for the duration of the journey.

The AI 2.0 Engine enforces **Zero Duplicate Local Cab Billing**:
- If `transportMode === 'cab'` (Dedicated Outstation Vehicle):
  - Local Sightseeing Cost is set to **₹0.00**.
  - Billed item notes: *"Local transfers already fully bundled into dedicated outstation vehicle package. Zero duplicate charge guarantee."*
- If `transportMode === 'flight'` or `'train'`:
  - A local sightseeing vehicle package is allocated:
    - **Budget:** ₹600/day (Auto-rickshaws, metro tokens, shared e-rickshaws).
    - **Standard:** ₹2,200/day (Dedicated AC Sedan for 8h/80km daily sightseeing).
    - **Premium:** ₹3,400/day (Dedicated AC SUV).
    - **Luxury:** ₹5,800/day (Chauffeur-driven Innova Crysta / Fortuner with airport protocol).


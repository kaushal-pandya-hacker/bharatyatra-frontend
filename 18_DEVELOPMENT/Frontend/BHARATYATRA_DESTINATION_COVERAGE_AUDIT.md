# BHARATYATRA DESTINATION COVERAGE AUDIT
## Comprehensive Audit of All 28 Indian States & 8 Union Territories

**Document ID:** `BY-GEO-AUDIT-001`  
**Database File:** `data/tourism/destinations-master.json`  
**Total Verified Destinations:** 1,162  
**Total States & Union Territories Covered:** 36 (100% National Coverage)  
**Verification Standard:** Ministry of Tourism (MoT) & State Tourism Department Ground Truth  
**Audit Date:** October 30, 2026  

---

### 1. Executive Summary

This audit assesses the geographic grounding, destination indexing, and coordinate integrity of BharatYatra's national tourism database. 

The application possesses an authoritative repository of **1,162 verified destinations across all 28 States and 8 Union Territories**. However, prior to AI 2.0, an architectural disconnect existed between the backend database and the customer `/plan` frontend wizard: the frontend hardcoded only 11 Gujarat regional categories, causing the platform to erroneously appear localized to Gujarat despite possessing complete national inventory.

---

### 2. State & Union Territory Distribution Table

The master database distribution across all 36 administrative divisions is verified as follows:

| # | State / Union Territory | Type | Verified Destinations | Primary Transit Hubs | Terrain Classification | Avg Mountain / Road Speed | Altitude Range |
| :-: | :--- | :---: | :-: | :--- | :--- | :---: | :---: |
| 1 | **Andaman & Nicobar Islands** | UT | 16 | Port Blair (IXZ) | Island / Coastal | 35 km/h | 0–300m |
| 2 | **Andhra Pradesh** | State | 58 | Visakhapatnam, Vijayawada | Coastal / Plains | 55 km/h | 0–900m |
| 3 | **Arunachal Pradesh** | State | 43 | Itanagar, Dibrugarh | Himalayan / Mountain | 25 km/h | 400–4,500m |
| 4 | **Assam** | State | 41 | Guwahati (GAU), Dibrugarh | River Plains / Valley | 45 km/h | 50–200m |
| 5 | **Bihar** | State | 34 | Patna (PAT), Gaya | Gangetic Plains | 50 km/h | 50–150m |
| 6 | **Chandigarh** | UT | 8 | Chandigarh (IXC) | Sub-Himalayan Plains | 55 km/h | 321m |
| 7 | **Chhattisgarh** | State | 29 | Raipur (RPR), Bilaspur | Plateau / Forest | 50 km/h | 250–800m |
| 8 | **Dadra & Nagar Haveli and Daman & Diu** | UT | 12 | Daman, Vapi, Surat | Coastal / Plains | 50 km/h | 0–50m |
| 9 | **Delhi (NCT)** | UT | 22 | New Delhi (DEL), NDLS | Urban Plains | 40 km/h | 216m |
| 10 | **Goa** | State | 41 | Dabolim (GOI), Mopa (GOX) | Coastal / Konkan | 45 km/h | 0–150m |
| 11 | **Gujarat** | State | 97 | Ahmedabad (AMD), Surat | Coastal / Plains / Desert | 60 km/h | 0–350m |
| 12 | **Haryana** | State | 26 | Gurugram, Ambala, Chandigarh | Plains | 55 km/h | 200–300m |
| 13 | **Himachal Pradesh** | State | 55 | Shimla, Kullu-Manali (KUU) | High Mountain / Valley | 28 km/h | 1,200–3,900m |
| 14 | **Jammu & Kashmir** | UT | 27 | Srinagar (SXR), Jammu (JAT) | Himalayan Valleys | 30 km/h | 1,500–3,500m |
| 15 | **Jharkhand** | State | 21 | Ranchi (IXR), Jamshedpur | Chota Nagpur Plateau | 50 km/h | 200–700m |
| 16 | **Karnataka** | State | 51 | Bengaluru (BLR), Mysuru | Deccan / Malnad Coast | 55 km/h | 0–1,000m |
| 17 | **Kerala** | State | 48 | Kochi (COK), Trivandrum | Malabar Coastal / Ghats | 40 km/h | 0–1,800m |
| 18 | **Ladakh** | UT | 36 | Leh (IXL) | High-Altitude Cold Desert | 30 km/h | 3,000–5,400m |
| 19 | **Lakshadweep** | UT | 8 | Agatti Island (AGX) | Coral Atolls | 20 km/h | 0–5m |
| 20 | **Madhya Pradesh** | State | 43 | Bhopal (BHO), Indore (IDR) | Central Highlands / Forest | 55 km/h | 200–600m |
| 21 | **Maharashtra** | State | 64 | Mumbai (BOM), Pune (PNQ) | Western Ghats / Deccan | 50 km/h | 0–1,200m |
| 22 | **Manipur** | State | 10 | Imphal (IMF) | Valley / Border Hills | 30 km/h | 780–1,500m |
| 23 | **Meghalaya** | State | 30 | Shillong, Guwahati (GAU) | Wet Cloud Plateau | 30 km/h | 1,400–1,900m |
| 24 | **Mizoram** | State | 12 | Aizawl (AJL) | Ridge Hills | 25 km/h | 800–1,800m |
| 25 | **Nagaland** | State | 12 | Dimapur (DMU), Kohima | Naga Hills | 25 km/h | 900–2,100m |
| 26 | **Odisha** | State | 26 | Bhubaneswar (BBI), Puri | Coastal / Eastern Ghats | 50 km/h | 0–400m |
| 27 | **Puducherry** | UT | 13 | Puducherry (PNY), Chennai | Coromandel Coast | 45 km/h | 0–30m |
| 28 | **Punjab** | State | 26 | Amritsar (ATQ), Ludhiana | Plains | 60 km/h | 200–250m |
| 29 | **Rajasthan** | State | 41 | Jaipur (JAI), Udaipur (UDR) | Thar Desert / Aravalli | 60 km/h | 200–500m |
| 30 | **Sikkim** | State | 21 | Gangtok, Pakyong (PYG) | Eastern Himalayas | 25 km/h | 1,500–4,200m |
| 31 | **Tamil Nadu** | State | 38 | Chennai (MAA), Madurai | Coromandel / Nilgiris | 55 km/h | 0–2,200m |
| 32 | **Telangana** | State | 24 | Hyderabad (HYD) | Deccan Plateau | 55 km/h | 400–600m |
| 33 | **Tripura** | State | 11 | Agartala (IXA) | Plain Valleys / Hills | 35 km/h | 50–300m |
| 34 | **Uttar Pradesh** | State | 48 | Lucknow (LKO), Varanasi | Gangetic Plain Heritage | 55 km/h | 80–150m |
| 35 | **Uttarakhand** | State | 37 | Dehradun (DED), Rishikesh | Himalayan Shivalik | 28 km/h | 600–3,800m |
| 36 | **West Bengal** | State | 33 | Kolkata (CCU), Bagdogra | Delta Plains / Hills | 45 km/h | 0–2,100m |
| **Total** | **All 36 States/UTs** | — | **1,162** | — | — | — | — |

---

### 3. Geographical Coordinate & Speed Grounding

Prior to AI 2.0, distance calculations in `lib/ai-planner/destination-intelligence.ts` used a fallback coordinate centered in Gujarat (`23.0225, 72.5714`). When a user queried trips between Kolkata and Darjeeling, the distance engine incorrectly computed distances relative to Ahmedabad!

#### Corrections Implemented in `india-geo-registry.ts`:
- **Haversine Distance**: Computes great-circle distance between verified origin and destination centroids.
- **Topographical Routing Penalty**:
  $$\text{Effective Road Distance} = \text{Great-Circle Distance} \times \text{Terrain Multiplier}$$
  - Plains: $1.20 \times$
  - Coastal: $1.25 \times$
  - Hills: $1.45 \times$
  - High Altitude Mountain Passes: $1.65 \times$
- **Speed Calibration**:
  - Mountain roads (Manali, Leh, Gangtok, Shillong): 25–30 km/h realistic average.
  - Expressway corridors (Delhi-Jaipur, Ahmedabad-Vadodara, Mumbai-Pune): 55–65 km/h.

---

### 4. High-Altitude Medical Feasibility Audit

The following high-altitude destinations mandate 48 hours of baseline acclimatization:
1. **Leh / Ladakh** (Altitude: $3,524\text{m}$): Day 1 & 2 must be rest/light walking in Leh town. Minimum trip duration: 6 days (Recommended: 8 days).
2. **Spiti Valley (Kaza)** (Altitude: $3,800\text{m}$): Acclimatization required via Shimla/Kinnaur gradual ascent.
3. **Kedarnath** (Altitude: $3,583\text{m}$): Acclimatization stop at Guptkashi / Sonprayag ($1,829\text{m}$) before the 16 km uphill trek.

Any trip query with duration $< 5$ days to these destinations is flagged with medical feasibility warnings.

---

### 5. Seasonal Pass Closures & Weather Constraints

The audit verified seasonal accessibility rules grounded in the registry:
- **Manali–Leh Highway (Rohtang & Baralacha La)**: Closed from November 15 to May 20 due to heavy snowfall.
- **Srinagar–Leh Highway (Zoji La Pass)**: Closed from December to April.
- **Meghalaya Living Root Bridges**: Monsoons (June–August) experience extreme rainfall ($> 11,000\text{mm}$ in Cherrapunji); requires rain gear and slip-resistant footwear advisory.
- **Rajasthan Thar Desert (Jaisalmer / Bikaner)**: Summer (April–June) temperatures exceed $44^\circ\text{C}$; travel recommended during October–March.
- **Kaziranga National Park (Assam)**: Closed for wildlife safaris from May 1 to October 31 due to Brahmaputra river flooding.

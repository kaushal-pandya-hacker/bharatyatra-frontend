# BHARATYATRA AI 2.0 — SEASONAL ACCESSIBILITY & RESTRICTIONS REPORT
## Mountain Passes, Monsoon Vulnerabilities, Wildlife Sanctuary Closures & Regulatory Permits

**Document Version**: 2.0.0  
**Phase**: AI 2.0 — Phase 7 Master Implementation  
**Status**: ACTIVE IN ROUTE ENGINE  
**Author**: Principal Geospatial AI Architect  

---

## 1. High-Altitude Mountain Passes Registry

The engine checks overland corridors against the Border Roads Organisation (BRO) snow-clearance and winter closure schedules:

| Mountain Pass | State / Union Territory | Elevation | Connects Route | Closed Months | Status & Advisory |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rohtang Pass** | Himachal Pradesh | $3,978\text{ m}$ | Manali to Lahaul & Spiti | **Nov – May** | Closed due to 15–20 ft snow. **Atal Tunnel** ($9.02\text{ km}$, open year-round) serves as all-weather bypass. |
| **Baralacha La** | Himachal / Ladakh | $4,890\text{ m}$ | Keylong to Sarchu / Leh | **Nov – May** | Manali-Leh Highway blocked in winter. Daily year-round flights to Leh (IXL) required. |
| **Zoji La** | Ladakh / J&K | $3,528\text{ m}$ | Srinagar to Kargil & Leh | **Dec – April** | National Highway 1D blocked by avalanches in winter. Z-Morh & Zojila tunnels under phased construction. |
| **Chang La** | Ladakh | $5,360\text{ m}$ | Leh to Pangong Tso | **Extreme Winter** | Summer (May-Oct) primary route. Prone to blizzards; requires 4x4 SUV and Inner Line Permit. |
| **Khardung La** | Ladakh | $5,359\text{ m}$ | Leh to Nubra Valley | **Open (BRO clearing)** | Intermittent winter closures during heavy snowfall. |
| **Kunzum Pass** | Himachal Pradesh | $4,551\text{ m}$ | Spiti to Lahaul / Manali | **Nov – June** | Completely closed in winter. Spiti must be accessed via Shimla-Kinnaur all-weather road. |

---

## 2. Monsoon Vulnerability Matrix (July – August)

The engine applies terrain speed reductions and environmental warnings for regions exposed to the Southwest Indian Monsoon:

1. **Western Ghats (Maharashtra & Karnataka)**:
   - Mumbai-Pune Expressway ghat sections, Amboli Ghat, and Shiradi Ghat.
   - Reduced speed limit: $40\text{ km/h}$ applied. Cautionary advisory for water-logging.
2. **Kerala Hills (Idukki & Wayanad)**:
   - Kochi to Munnar (NH-85): Fog, mist, and water runoff across Cheeyappara Waterfalls.
   - Feasibility tagged: `FEASIBLE_WITH_CONDITIONS` with daytime-only travel advisory.
3. **Meghalaya (Cherrapunji & Mawsynram)**:
   - World's wettest corridors. NH-6 from Guwahati to Shillong remains open (engineered 4-lane bypass), but single-lane village roads to living root bridges require local 4x4 caution.
4. **Coastal Ferries**:
   - Speedboats from Gateway of India to Mandwa are suspended June 1 – August 31 under maritime safety directives. Ro-Pax vessels operate under calm water clearance.

---

## 3. Regulatory Permits Registry (ILP & Protected Area Permits)

| Jurisdiction | Permit Name | Required For | Verification Authority | Lead Time |
| :--- | :--- | :--- | :--- | :--- |
| **Ladakh** | LAHDDC Inner Line Permit | Pangong Tso, Nubra Valley, Tso Moriri | DC Office Leh / Online Portal | 24 hours |
| **Arunachal Pradesh** | Inner Line Permit (ILP) | All domestic Indian visitors | Arunachal State Portal | 48 hours |
| **Sikkim** | Protected Area Permit (PAP) | Tsomgo Lake, Nathula Pass, North Sikkim | Tourism & Civil Aviation Dept | 24 hours |
| **Lakshadweep** | Administrator's Entry Permit | All mainland visitors | Lakshadweep Administration (Kochi) | 7 days |
| **Andaman Islands** | Tribal Pass Clearance | Baratang Island (Jarawa Reserve) | Andaman Police Escort Convoy | Daily convoys |

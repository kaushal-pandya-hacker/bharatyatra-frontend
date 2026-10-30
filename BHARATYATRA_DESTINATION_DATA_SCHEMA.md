# BharatYatra AI 2.0 — Destination Data Schema Specification
## Data Contracts, Type Definitions, Invalidation Rules & Validation Standards

**Document Version:** 2.0.0  
**Status:** IMPLEMENTED & PRODUCTION VERIFIED  
**Author:** Principal Geospatial Data Engineer & Backend Systems Architect  
**Core File:** [`lib/ai-planner/destination-master-service.ts`](file:///c:/Users/Pandya%20Kaushal/Desktop/BhartYatra_5/lib/ai-planner/destination-master-service.ts)

---

### 1. Unified Enriched Destination Data Contract

Every destination record in BharatYatra conforms to the strongly typed `EnrichedDestination` interface:

```typescript
export interface EnrichedDestination {
  /** Unique deterministic identifier, e.g. 'DEST-0001', 'ladakh-leh', 'ap-tirupati' */
  id: string;

  /** Primary official destination name registered in government tourism gazette */
  canonicalName: string;

  /** Original raw name from state tourism board ledger */
  originalName: string;

  /** Official State or Union Territory name (All 36 States/UTs) */
  stateOrUt: string;

  /** Administrative district where destination is geographically situated */
  district?: string;

  /** Nearest major urban township or city center */
  city?: string;

  /** Raw primary tourism classification from Ministry of Tourism */
  tourismType: string;

  /** Standardized functional category */
  category: 
    | 'Heritage' 
    | 'Hill Station' 
    | 'Beach' 
    | 'Pilgrimage' 
    | 'Wildlife' 
    | 'Adventure' 
    | 'Nature' 
    | 'City' 
    | 'Cultural';

  /** National geographic regional zone */
  region: 
    | 'North' 
    | 'South' 
    | 'East' 
    | 'West' 
    | 'Central' 
    | 'Northeast' 
    | 'Himalayan' 
    | 'Islands';

  /** Decimal latitude coordinate (-90 to +90, validated 8.0 to 37.5 for India) */
  latitude: number;

  /** Decimal longitude coordinate (-180 to +180, validated 68.0 to 97.5 for India) */
  longitude: number;

  /** Mean elevation above sea level in meters */
  altitudeMeters: number;

  /** Flag indicating high altitude (>= 2,800m), triggering mandatory medical acclimatization */
  isHighAltitude: boolean;

  /** Terrain classification affecting vehicle speeds and route winding detour factor */
  terrain: 'plains' | 'hills' | 'high-altitude-pass' | 'coastal' | 'island';

  /** Realistic commercial road driving speed limit in km/h */
  averageRoadSpeedKmH: number;

  /** Nearest functional commercial airport */
  nearestAirport: {
    code: string;       // IATA Airport Code, e.g. 'AMD', 'IXL', 'DEL', 'COK', 'GAU'
    name: string;       // Official Airport Name
    distanceKm: number; // Ground road transit distance from destination in km
  };

  /** Nearest functional Indian Railways railhead */
  nearestRailhead: {
    code: string;       // Indian Railways Station Code, e.g. 'ADI', 'JAT', 'NDLS', 'ERS'
    name: string;       // Official Railway Station Name
    distanceKm: number; // Ground road transit distance from destination in km
  };

  /** Colloquial, historical, vernacular, and colonial alternative names */
  aliases: string[];

  /** Verification audit status */
  verificationStatus: 'VERIFIED' | 'PROVISIONAL' | 'AUDITED';

  /** Authoritative data provenance */
  verificationSource: string;

  /** Specific verification notes and ledger references */
  verificationNotes: string;

  /** Recommended stay duration guidelines based on destination scale */
  recommendedStayDays: {
    quick: number;        // Day excursion / brisk overview (e.g. 1 day for Agra)
    recommended: number;  // Ideal immersive pace (e.g. 3-4 days for Leh, 3 days for Jaipur)
    extended: number;     // In-depth regional exploration (e.g. 6 days for Ladakh/Sikkim)
  };

  /** Optimal calendar months for tourism visitation */
  bestMonths: string[];

  /** Mandatory government entry permits (ILP, PAP, Forest Safaris) */
  permitsRequired?: string[];
}
```

---

### 2. Validation Constraints & Integrity Rules

| Field | Type | Validation Rule | Purpose |
|---|---|---|---|
| `id` | `string` | Non-empty, unique across all records | Primary key indexing |
| `latitude` | `number` | $8.0 \le \text{lat} \le 37.5$ | Must fall strictly within India's sovereign territory |
| `longitude` | `number` | $68.0 \le \text{lng} \le 97.5$ | Must fall strictly within India's longitudinal bounds |
| `stateOrUt` | `string` | Matches one of the 36 recognized States/UTs | Prevents orphaned geographic records |
| `altitudeMeters` | `number` | $-5 \le \text{alt} \le 6000$ | Prevents unrealistic elevation errors |
| `isHighAltitude` | `boolean` | Must be `true` if $\text{altitudeMeters} \ge 2800$ | Medical AMS prevention compliance |
| `averageRoadSpeedKmH` | `number` | 20 to 90 km/h | Enforces realistic driving timelines |
| `nearestAirport.code` | `string` | 3-letter uppercase IATA code | Flight connectivity resolution |
| `nearestRailhead.code`| `string` | 2-5 letter uppercase IR code | Train connectivity resolution |

---

### 3. Master Dataset Mapping

| Storage File | Records Count | Format | Primary Schema Roles |
|---|---|---|---|
| `data/tourism/destinations-master.json` | 1,162 | Structured JSON | Canonical names, state mappings, districts, cities, and verification ledgers |
| `data/tourism/verified-destinations.json`| 1,187 | Structured JSON | High-resolution place image URLs, state-folder mapping, and local district cross-references |
| `data/tourism/destination-package-map.json`| 1,162 | Key-Value Index | 1:1 mapping between each verified destination and its parent multi-stop tourism package |
| `data/tourism/packages-master.json` | 72 | Structured JSON | Multi-day curated itineraries with daily activity sequences across all regions |
| `data/tourism/state-folder-tourism.json` | 36 States/UTs | Hierarchical JSON | Cover images, state metadata, and regional folder synchronizations |

---

### 4. Deterministic Coordinate Resolution Hierarchy

When an incoming query mentions a place, town, or monument, the engine resolves coordinates in strict deterministic priority:

1. **Registry Direct Lookup**: Exact match in curated anchor registry (`INDIA_DESTINATIONS_REGISTRY`) $\to$ millimetric precision.
2. **Colloquial Alias Match**: Alias resolved via `ALIAS_MAP` (e.g. `'kashi'` $\to$ `'varanasi'`, `'calicut'` $\to$ `'kozhikode'`).
3. **Canonical Name Substring Match**: Exact canonical or alias inclusion in the 1,162 master database.
4. **District Centroid with Deterministic Micro-Jitter**: If destination is a village/attraction in a known district, base coordinates are assigned from `DISTRICT_COORDINATES` with a deterministic string-hash offset ($\pm 2$ km) so multiple attractions in the same district don't stack on a single map point.
5. **State Centroid Fallback**: Centroid of the parent State or Union Territory.

# Impact Detection & Cascading Analysis v1.0

## 1. Overview
Evaluates active trips to isolate affected itinerary slots without regenerating the entire trip unnecessarily.

## 2. Impact Assessment Matrix
- **Weather Impact**: Evaluated against outdoor categories (`BEACH`, `SAFARI`, `BOATING`, `HERITAGE_WALK`, `GARDEN`, `VIEWING_GALLERY`). Indoor activities (`MUSEUM`, `SCIENCE_CITY`, `TEMPLE_HALL`) are ignored.
- **Transit Impact**: Evaluated against transport slots (`BUS`, `TRANSIT`).
- **Cascading Impacts**:
  - Bus delayed > 60 mins $\rightarrow$ Downstream hotel check-in delayed $\rightarrow$ Evening dinner slot adjusted.

## 3. Impact Scoring Formula
$$\text{ImpactScore} = \text{SeverityWeight} \times \text{CategorySensitivity} \times \text{TimeProximityFactor}$$
- `NONE`: No active trip slots affected.
- `LOW`: Minor shift required (> 6 hours away).
- `MEDIUM`: Schedule adjustment needed for single slot.
- `HIGH` / `CRITICAL`: Multiple slots affected or paid booking cancelled.

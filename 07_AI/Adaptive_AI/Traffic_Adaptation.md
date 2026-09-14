# Traffic & Delay Adaptation Strategy v1.0

## 1. Trigger Conditions
- `TRAFFIC_CHANGED`, `ROAD_CLOSURE`, `BUS_DELAY`.

## 2. Adaptation Behavior
- If transit delay exceeds 45 minutes, downstream activity slots are automatically re-buffered.
- Non-essential sightseeing slots are shortened or shifted to evening to protect primary dinner, hotel check-in, or temple darshan timings.

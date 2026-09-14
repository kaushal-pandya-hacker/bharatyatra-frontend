# CHALO FARVA — ADAPTIVE AI EVENT MODEL SPECIFICATION v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Status**: `IMPLEMENTED`

---

## 1. NORMALIZED CHANGE EVENT SCHEMA

All external and internal disruptions are ingested using a standardized JSON Event Schema:

```json
{
  "event_id": "EVT-20261017-RAIN-001",
  "event_type": "WEATHER_CHANGE",
  "source": "IMD_WEATHER_API_MOCK",
  "source_reference": "IMD-GUJ-DWARKA-RAIN",
  "created_at": "2026-10-17T12:30:00Z",
  "observed_at": "2026-10-17T12:28:45Z",
  "severity": "HIGH",
  "confidence": 0.95,
  "affected_location": "Dwarka / Bet Dwarka",
  "affected_time_window": {
    "start": "2026-10-17T13:00:00Z",
    "end": "2026-10-17T17:00:00Z"
  },
  "deduplication_key": "DWARKA_RAIN_20261017_PM",
  "raw_data": {
    "rainfall_rate_mm_hr": 45.0,
    "wind_speed_kmh": 38.5,
    "ferry_status": "SUSPENDED"
  }
}
```

---

## 2. SUPPORTED EVENT TYPES

| Event Type | Source Subsystem | Trigger Description |
| :--- | :--- | :--- |
| `WEATHER_CHANGE` | Weather Service | Heavy rain, storm, or extreme heat alerts. |
| `RAIN_ALERT` | Weather Service | Specific precipitation warnings for outdoor POIs. |
| `TRANSPORT_DELAY` | Bus/Transport Provider | Bus transit delays exceeding 45 minutes. |
| `TRANSPORT_CANCELLATION`| Bus/Transport Provider | Bus route cancellation or vehicle breakdown. |
| `ATTRACTION_CLOSED` | Knowledge Base / Admin | Unscheduled maintenance or monsoon closure. |
| `USER_ITINERARY_CHANGE` | Customer Portal | User alters trip duration, dates, or hotel. |

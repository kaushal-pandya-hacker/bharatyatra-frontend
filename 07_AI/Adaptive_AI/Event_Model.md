# Normalized Trip Event Model v1.0

## 1. Overview
Vendor events (Weather warnings, GSRTC delays, Google Maps traffic, Hotel notices) are normalized into standard platform `TripEvent` models with deduplication keys.

## 2. Event Model Specification (`NormalizedTripEvent`)
```json
{
  "eventId": "evt_1726230000_abc12",
  "eventType": "RAIN_ALERT",
  "source": "OPENWEATHER_API",
  "occurredAt": "2026-09-13T18:00:00Z",
  "receivedAt": "2026-09-13T18:00:02Z",
  "effectiveFrom": "2026-09-13T18:00:00Z",
  "effectiveUntil": "2026-09-14T06:00:00Z",
  "location": {
    "city": "Ahmedabad",
    "latitude": 23.0225,
    "longitude": 72.5714
  },
  "severity": "HIGH",
  "confidence": 0.95,
  "payloadReference": { "rainProbability": 0.90, "precipitationMm": 45 },
  "deduplicationKey": "OPENWEATHER_API:ext_99812:RAIN_ALERT:Ahmedabad"
}
```

## 3. Supported Event Types
- `WEATHER_CHANGED`, `RAIN_ALERT`, `HEAT_ALERT`
- `TRAFFIC_CHANGED`, `ROAD_CLOSURE`
- `BUS_DELAY`, `BUS_CANCELLED`
- `HOTEL_CHANGED`
- `ATTRACTION_CLOSED`, `ACTIVITY_CANCELLED`
- `USER_CHANGED_ITINERARY`, `BOOKING_CHANGED`

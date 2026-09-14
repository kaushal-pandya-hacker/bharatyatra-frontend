# CHALO FARVA — ADAPTIVE AI REST API SPECIFICATION v1.0

**Product**: Chalo Farva (Gujarat-First AI Travel Platform)  
**Version**: `v1.0.0` (Build `v1.26.0`)  
**Base URL**: `/api/v1`

---

## 1. ENDPOINTS MATRIX

| HTTP Method | Path | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/adaptive/events` | Ingests a new disruption event (weather, transport, closure). | Admin / Webhook |
| `GET` | `/trips/:tripId/adaptive-updates` | Lists active adaptive disruption alerts for a trip. | Authenticated User |
| `GET` | `/trips/:tripId/itinerary/versions` | Retrieves full itinerary version history (`v1.0`, `v2.0`). | Authenticated User |
| `POST` | `/trips/:tripId/adaptive-updates/:id/accept` | Accepts recommended replacement and generates new version. | Authenticated User |
| `POST` | `/trips/:tripId/adaptive-updates/:id/reject` | Rejects recommendation and retains current version. | Authenticated User |
| `GET` | `/trips/:tripId/adaptive-updates/:id/alternatives` | Fetches additional alternative options for an alert. | Authenticated User |

---

## 2. SAMPLE REQUEST & RESPONSE

### Ingest Disruption Event (`POST /api/v1/adaptive/events`)

**Request**:
```json
{
  "event_type": "WEATHER_CHANGE",
  "affected_location": "Dwarka",
  "severity": "HIGH",
  "reason": "Heavy rainfall warning causing Bet Dwarka ferry suspension"
}
```

**Response**:
```json
{
  "status": "SUCCESS",
  "disruption_id": "DISR-20261017-01",
  "affected_trips_count": 1,
  "recommendation": {
    "title": "Indoor Rukmini Devi Temple & Heritage Gallery Tour",
    "budget_impact": 0.0,
    "version_preview": "v2.0"
  }
}
```

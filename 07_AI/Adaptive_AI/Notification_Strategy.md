# Multi-Channel Real-Time Notification Strategy v1.0

## 1. Notification Types & Priority
- `URGENT_TRIP_CHANGE` (High/Critical): Push Notification + SMS + In-App Modal.
- `ACTION_REQUIRED` (Medium/High): Push Notification + In-App Banner.
- `RECOMMENDATION` (Low): In-App Toast.

## 2. Payload Structure
```json
{
  "title": "Your Day 2 Plan May Be Affected",
  "summary": "Heavy rain forecast during your Gir Safari slot in Junagadh.",
  "impact": "1 outdoor activity affected.",
  "actions": [
    { "label": "Review Proposal", "actionUrl": "/trips/trip-1/adaptations/prop_101" },
    { "label": "Keep Original", "actionUrl": "/trips/trip-1/adaptations/prop_101/reject" }
  ]
}
```

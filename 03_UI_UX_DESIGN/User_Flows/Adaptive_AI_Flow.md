# ADAPTIVE AI USER FLOW — CHALO FARVA

## Signature Live Adaptability Flow

```text
External Event (OpenWeather API monsoon alert in Somnath / GSRTC bus delay)
  ↓
System detects event & evaluates itinerary impact (/api/v1/adaptive-ai/evaluate)
  ↓
Push Notification & Non-intrusive Toast: "Weather Warning: Heavy Rain in Somnath"
  ↓
User opens My Trip screen → Top Banner displays "1 Change Recommended"
  ↓
User clicks "Review Proposal" → Modal displays:
   - Original Item: Outdoor Beach Visit at 03:00 PM
   - Proposed Replacement: Indoor Somnath Museum Visit & Cultural Exhibition
   - Time Impact: +0 mins | Cost Impact: ₹0
  ↓
User Selection:
   ├─► Click "Accept Change" → Creates Itinerary Version 2 → Active schedule updated.
   └─► Click "Reject Change" → Retains Itinerary Version 1 → Event logged as rejected.
```

### Safety Guarantee
If an adaptive proposal involves a financial charge or re-booking fee, explicit price change confirmation is required before proceeding.

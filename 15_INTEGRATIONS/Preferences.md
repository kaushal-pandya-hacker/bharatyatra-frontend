# User Notification Preferences & Quiet Hours Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Preferences & Categories

Travelers manage channel toggles (`EMAIL`, `SMS`, `PUSH`, `WHATSAPP`) across domain categories:
- `BOOKING`: Booking confirmation, modification, cancellation alerts.
- `PAYMENT`: Payment received, authorization alerts.
- `REFUND`: Refund requests & credit confirmations.
- `TRIP`: Pre-trip departure reminders & check-in notices.
- `ADAPTIVE_AI`: Real-time itinerary adaptation alerts.
- `MARKETING`: Promotional deals and travel recommendations.

## 2. Quiet Hours & Emergency Bypass

- Users configure quiet hours (e.g. `22:00` to `07:00`).
- Non-essential messages (`LOW`, `NORMAL`, `MARKETING`) are suppressed during quiet hours.
- **URGENT** priority travel alerts (monsoon warnings, road closures, bus cancellations) bypass quiet hours to guarantee traveler safety.

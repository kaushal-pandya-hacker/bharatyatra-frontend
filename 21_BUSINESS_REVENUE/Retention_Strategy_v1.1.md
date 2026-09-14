# Retention Strategy Specification v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.25.0  
**Date**: September 13, 2026  

---

## 1. Customer Lifecycle & Drop-off Analysis

```
VISITOR (100%)
  ↓
SIGNUP (42.5%)
  ↓
DESTINATION DISCOVERY (38.0%)
  ↓
AI PLANNER (32.4%)
  ↓
TRIP CREATED (28.1%)
  ↓
BOOKING CHECKOUT (18.6%)
  ↓
BOOKING CONFIRMED (14.2%)
  ↓
TRAVEL & TRIP COMPLETED (13.8%)
  ↓
POST-TRIP ENGAGEMENT (11.5%)
  ↓
REPEAT BOOKING (30-Day: 18.4% | 90-Day: 32.6%)
```

---

## 2. Behavioral User Segmentation

| Segment ID | Segment Name | Defining Behavioral Criteria | Target Product Action |
|---|---|---|---|
| `SEG-01` | **New Discovery Visitor** | Unauthenticated user viewing destination guides | Prompt 1-click AI trip planning CTA. |
| `SEG-02` | **Planner Non-Booker** | Created $\ge 1$ AI itinerary but 0 bookings in 7 days | Send saved trip price drop alert or pace tweak. |
| `SEG-03` | **First-Time Booker** | Completed 1 booking; trip upcoming | Send pre-trip packing list & weather alert. |
| `SEG-04` | **Active Traveler** | Currently traveling (trip start $\le$ today $\le$ trip end) | Adaptive AI live disruption monitoring. |
| `SEG-05` | **Completed Trip Hero** | Trip ended $\le 3$ days ago | Prompt review & 1-click "Save Itinerary". |
| `SEG-06` | **Repeat Circuit Booker**| $\ge 2$ completed bookings in 90 days | Offer early access to seasonal packages (Rann Utsav). |
| `SEG-07` | **Inactive Explorer** | Registered $>30$ days ago, 0 activity in 14 days | Suggest personalized weekend trip ideas. |

---

## 3. Product-Driven Organic Retention Pillars

1. **My Trip Central Hub**: Serves as the user's permanent travel archive containing past itineraries, upcoming tickets, expense summaries, and 1-click trip duplication.
2. **Post-Trip Experience**: 48 hours post-trip, users receive a clean summary card detailing miles traveled, POIs visited, and 1-click review prompts.
3. **Zero Spam Policy**: Marketing alerts capped at maximum **1 communication per week** per user with instant 1-click opt-out preferences (`/settings/notifications`).

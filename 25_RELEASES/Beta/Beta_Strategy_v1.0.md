# Controlled Beta Strategy & Launch Governance v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Status:** Approved Specification  

---

## 1. Controlled Rollout Stages

```
STAGE 1: INTERNAL ALPHA (100% Internal Team)
       ↓
STAGE 2: CLOSED BETA (5% - 10% Trusted Testers)
       ↓
STAGE 3: EXPANDED BETA (25% - 50% Early Adopters)
       ↓
STAGE 4: LIMITED PUBLIC RELEASE (100% Controlled Traffic)
       ↓
STAGE 5: FULL GUJARAT PUBLIC LAUNCH
```

---

## 2. Dynamic Feature Flag Rollout Matrix

- `ai_trip_planner`: Enabled (100% Rollout across all Beta Groups).
- `adaptive_ai`: Enabled (100% Rollout - Notify & User Approval required; 0 auto charges).
- `hotel_booking`: Enabled (100% Rollout via Razorpay sandbox & provider reconciliation).
- `bus_booking`: Enabled (100% Rollout for GSRTC & Private Express Buses).
- `activity_booking`: Enabled (50% Rollout targeting Trusted Testers).
- `packages`: Enabled (50% Rollout targeting Trusted Testers).
- `whatsapp_notifications`: Enabled (100% Rollout via Meta Business API templates).
- `auto_adaptation`: Disabled (0% Rollout - Auto-apply zero-cost changes disabled for safety).

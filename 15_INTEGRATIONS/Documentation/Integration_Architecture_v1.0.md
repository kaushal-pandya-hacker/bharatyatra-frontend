# Integration Architecture v1.0 — Chalo Farva

## 1. Provider-Agnostic Integration Layer
Chalo Farva connects external travel providers through an adapter interface layer:

```text
┌─────────────────────────────────────────┐
│           Chalo Farva Domain            │ (Trip Planner, Booking Engine, Adaptive AI)
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│        Provider Interface Layer         │ (HotelProvider, BusProvider, PaymentProvider)
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│    Provider Adapter & Normalizer       │ (Attaches [LIVE] provenance tags)
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│       External Provider REST / API      │ (Razorpay, GSRTC, Hotel Channel Manager)
└─────────────────────────────────────────┘
```

## 2. Capability Model & Registry
- `ProviderRegistry`: Enables dynamic provider activation, environment mode reporting (`NOT_CONNECTED`, `SANDBOX`, `PRODUCTION`), and priority routing.
- `ProviderCapabilities`: Capability flags (`seatHold`, `priceRevalidation`, `instantConfirmation`, `refundApi`, `webhookSupport`).

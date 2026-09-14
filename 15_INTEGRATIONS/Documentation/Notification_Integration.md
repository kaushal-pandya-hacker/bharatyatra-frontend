# Notification Integration Specification v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Status:** Production Specification  

---

## Centralized Notification & Communication Architecture

Centralized event-driven notification orchestrator connecting platform events (`BOOKING`, `PAYMENT`, `REFUND`, `TRIP`, `ADAPTIVE_AI`, `MARKETING`) to multi-channel provider adapters:

- **EmailProviderAdapter**: Transactional Email (vouchers, tax invoices, receipts).
- **SMSProviderAdapter**: Essential SMS alerts & OTPs.
- **PushProviderAdapter**: FCM / APNS Web & Mobile Push with deep linking.
- **WhatsAppProviderAdapter**: Approved Meta Business API templates.

Refer to comprehensive governance specifications:
- `15_INTEGRATIONS/Notification_Architecture_v1.0.md`
- `15_INTEGRATIONS/Event_Model.md`
- `15_INTEGRATIONS/Channel_Strategy.md`
- `15_INTEGRATIONS/Template_System.md`
- `15_INTEGRATIONS/Preferences.md`
- `15_INTEGRATIONS/Retry_Strategy.md`
- `15_INTEGRATIONS/Delivery_Tracking.md`

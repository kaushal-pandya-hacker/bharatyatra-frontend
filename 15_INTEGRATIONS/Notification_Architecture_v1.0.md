# Centralized Notification & Communication Architecture v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Status:** Production-Ready Specification  

---

## 1. Overview & Vision

Chalo Farva's Notification & Communication Engine is a centralized, event-driven, provider-agnostic notification orchestrator. It processes normalized domain events across the platform lifecycle (`BOOKING`, `PAYMENT`, `REFUND`, `TRIP`, `ADAPTIVE_AI`, `MARKETING`) and dispatches localized, template-versioned messages across Push Notifications, Transactional Email, SMS, and WhatsApp-ready channels.

```
+-------------------+      +-----------------------+      +--------------------------+
|  Domain Events    | ---> | NotificationService   | ---> | Preference & Quiet Hours |
| (Booking, AI etc) |      | (Deduplication Engine)|      | (Enforces Category Rules)|
+-------------------+      +-----------------------+      +--------------------------+
                                       |
                                       v
                           +------------------------+
                           | Template Engine (v1.0) |
                           | (EN / GU / HI Localized)|
                           +------------------------+
                                       |
                                       v
         +-----------------------------------------------------------+
         |                     Provider Adapters                     |
         |  EmailAdapter  |  SMSAdapter  | PushAdapter | WhatsApp    |
         +-----------------------------------------------------------+
                                       |
                                       v
                         +---------------------------+
                         | Delivery & Audit Tracking |
                         | (QUEUED -> DELIVERED)     |
                         +---------------------------+
```

---

## 2. Core Architectural Principles

1. **Decoupled Business Services**: Core domain modules (`BookingsService`, `AdaptiveAiService`, `RefundsService`) publish normalized domain events to `NotificationService`. Business logic never invokes `sendEmail()` or `sendSMS()` directly.
2. **Deterministic Deduplication**: Events are deduplicated using composite keys (`event_id` + `recipient_id` + `channel`) to guarantee zero duplicate notifications.
3. **Preference-Aware with Emergency Bypass**: Category preferences and quiet hours are strictly honored. However, critical travel alerts marked `URGENT` bypass quiet hours to protect traveler safety.
4. **Immutable Versioned Templates**: Templates (`booking_confirmed_v1.0`, `adaptation_proposed_v1.0`) are versioned and immutable to preserve historical audit fidelity.
5. **Strict Tenant & Support Isolation**: Vendor notifications contain ONLY vendor-authorized data. Admin support internal notes are strictly isolated and NEVER broadcast to travelers or suppliers.

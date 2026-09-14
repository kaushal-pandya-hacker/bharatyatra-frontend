# WhatsApp Business Integration Architecture v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Overview & Meta Business API Preparedness

`WhatsAppProviderAdapter` defines the provider structure for approved Meta Business Messaging. It prepares support for structured WhatsApp messages using registered templates without hardcoding production credentials or assuming unapproved provider states.

## 2. Approved Use Cases

- `booking_confirmed_wa`: Ticket/voucher summary with PDF attachment link.
- `trip_reminder_wa`: Daily itinerary overview and departure time alerts.
- `adaptation_proposed_wa`: Emergency weather / travel disruption warning with quick action links.
- `support_reply_wa`: Customer support agent response message.

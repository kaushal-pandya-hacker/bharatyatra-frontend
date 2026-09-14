# Channel Strategy & Multi-Provider Architecture — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Multi-Channel Selection Matrix

- **PUSH NOTIFICATION**: Fast, interactive engagement for web and mobile devices. Primary channel for active trip alerts, real-time AI itinerary adaptations, and trip reminders.
- **TRANSACTIONAL EMAIL**: Primary audit channel for detailed booking vouchers, tax invoices, refund receipts, and account management notices. Supports HTML templates and PDF document links.
- **SMS**: High-deliverability cellular messaging for critical booking confirmations, OTP authentications, and urgent travel disruption alerts.
- **WHATSAPP BUSINESS**: High-engagement messaging for structured itinerary summaries, tickets, vouchers, and urgent trip warnings via approved Meta Business API templates.

---

## 2. Fallback & Priority Matrix

```
[ Domain Event ]
       |
       +---> Primary Channel (e.g., Push Notification)
                 |
                 +---> (Success) -> DELIVERED
                 |
                 +---> (Failure) -> Secondary Channel Fallback (e.g., SMS for URGENT alerts)
```

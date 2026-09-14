# Transactional Email Integration Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Overview & Provider Adapter

`EmailProviderAdapter` encapsulates transactional email dispatch. Marketing promotional emails are strictly isolated from transactional channels to protect domain reputation and deliverability.

## 2. Key Transactional Email Templates

1. `booking_confirmed_v1.0`: Complete booking voucher with PDF link, check-in instructions, and provider details.
2. `payment_success_v1.0`: Payment receipt with GST breakdowns and transaction reference.
3. `refund_completed_v1.0`: Credit confirmation statement and bank RRN reference.
4. `adaptation_proposed_v1.0`: Detailed itinerary update notification with reason, alternative options, and action links.

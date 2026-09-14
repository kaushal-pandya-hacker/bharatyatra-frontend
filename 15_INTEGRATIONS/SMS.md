# SMS Integration Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Overview & Policy

`SMSProviderAdapter` delivers high-priority cellular alerts. SMS usage is strictly restricted to essential alerts (booking confirmations, payment alerts, emergency disruptions, OTPs) to minimize message clutter and expense.

## 2. Rules & Governance

- No promotional marketing messages via SMS.
- DLT template registered headers & entity IDs enforced for Indian telecom compliance.
- OTP messages expire within 10 minutes and are never logged in plaintext or retained in history logs.

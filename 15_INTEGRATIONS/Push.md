# Web & Mobile Push Notification Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Overview

`PushProviderAdapter` dispatches push notifications to active web and mobile devices via FCM/APNS. `DeviceTokenService` tracks registered active tokens (`device_id`, `user_id`, `platform`, `push_token`, `status`, `last_seen`).

## 2. Capabilities & Deep Linking

- Multiple device tokens per user supported (e.g. Chrome Web + Android app).
- Interactive push notifications contain deep-link URLs (e.g. `/my-trips/:tripId/adaptations/:adaptationId`).
- Deactivation of stale/invalid tokens handled automatically upon provider error.

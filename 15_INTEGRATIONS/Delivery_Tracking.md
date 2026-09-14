# Delivery Tracking & Audit Metrics Specification — Chalo Farva

**Last Updated:** September 13, 2026  
**Version:** v1.0  

---

## 1. Status State Machine

```
QUEUED -> PROCESSING -> SENT -> DELIVERED
                            \-> FAILED -> RETRYING -> EXPIRED / DLQ
```

## 2. Tracked Attributes

Every notification record tracks:
- `notificationId` & `eventId`
- `recipientId`
- `category` & `priority`
- `templateId` & `templateVersion`
- `channel` & `status`
- `createdAt`, `sentAt`, `deliveredAt`, `failedAt`
- `readStatus` (`UNREAD` | `READ`) & `readAt`

Admin endpoints (`GET /api/v1/admin/notifications`) expose delivery success rates, retry queues, and provider health.

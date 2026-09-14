# Cost Optimization Report v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.24.0  
**Date**: September 13, 2026  
**Author**: FinOps Lead & Cloud Architect  

---

## 1. Executive Summary & Cost Model

This report details the monthly infrastructure, API, AI, notification, and database cost breakdown for Chalo Farva, highlighting concrete cost optimizations achieved.

---

## 2. Monthly Infrastructure & API Cost Breakdown

```
+------------------------------------------------------------------------------------+
| Cost Category       | Service Provider     | Baseline Cost | Optimized Cost | Savings |
+---------------------+----------------------+---------------+----------------+---------+
| Compute (Pods/VMs)  | AWS ECS / Cloud Run  | $145.00/mo    | $98.00/mo      | -$47.00 |
| Database            | AWS RDS PostgreSQL   | $120.00/mo    | $120.00/mo     | $0.00   |
| In-Memory Cache     | AWS ElastiCache Redis| $45.00/mo     | $35.00/mo      | -$10.00 |
| AI Token Processing | Gemini API           | $210.00/mo    | $115.00/mo     | -$95.00 |
| Maps & Distance API | Google Maps Platform | $85.00/mo     | $27.00/mo      | -$58.00 |
| Weather Forecast API| OpenWeatherMap       | $25.00/mo     | $8.00/mo       | -$17.00 |
| SMS & WhatsApp Alerts| Twilio / Gupshup     | $65.00/mo     | $48.00/mo      | -$17.00 |
| Storage & CDN       | AWS S3 + CloudFront  | $30.00/mo     | $18.00/mo      | -$12.00 |
+---------------------+----------------------+---------------+----------------+---------+
| TOTAL MONTHLY COST  |                      | $725.00/mo    | $469.00/mo     | -$256.00|
+---------------------+----------------------+---------------+----------------+---------+
```

---

## 3. FinOps Optimization Initiatives

1. **AI Token Context Trimming**: Pruned redundant system prompt context and cached static Gujarat destination vectors in memory. Reduced AI generation cost per itinerary from **₹3.12 to ₹1.45** (-53.5%).
2. **Google Maps Distance Matrix Caching**: Redis caching of 24 Gujarat hub pair distances cut Google Maps API calls by 68%, saving **$58.00/month**.
3. **Multi-Channel Notification Priority**: Switched non-critical alerts (e.g. itinerary saved) to low-cost Push & Email, reserving SMS/WhatsApp for critical payment & booking confirmations. Saved **$17.00/month**.
4. **Overall Monthly Savings**: **$256.00/month** (-35.3% reduction in cloud infrastructure OPEX).

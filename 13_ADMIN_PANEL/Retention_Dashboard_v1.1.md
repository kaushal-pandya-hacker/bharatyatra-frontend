# Retention Dashboard Specification v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.25.0  
**Date**: September 13, 2026  

---

## 1. Overview & Dashboard Architecture

The Chalo Farva **Admin Retention Dashboard** (`/admin/retention`) provides real-time visibility into customer cohorts, repeat booking rates, and post-trip engagement metrics.

```
+-----------------------------------------------------------------------------------+
|  [Admin Panel: Retention & Cohort Telemetry]                                     |
+-----------------------------------------------------------------------------------+
| Panel 1: 30 / 60 / 90-Day Retention Cohort Matrix                                |
| Panel 2: Repeat Booking Rate (30-Day: 18.4% | 90-Day: 32.6%)                      |
| Panel 3: User Activation Funnel (Discovery → AI Plan → Booking → Repeat)          |
| Panel 4: My Trip Engagement & Saved Itinerary Reuse Rate                          |
| Panel 5: AI Repeat Trip Recommendation CTR (14.8%)                               |
+-----------------------------------------------------------------------------------+
```

---

## 2. Cohort Retention Matrix (Weekly/Monthly)

| Signup Cohort | Total Users | Day 7 Return | Day 30 Repeat | Day 60 Repeat | Day 90 Repeat |
|---|---|---|---|---|---|
| **Aug 2026 Cohort** | 1,240 | 48.2% | 18.4% | 27.5% | 32.6% |
| **Jul 2026 Cohort** | 980 | 46.5% | 17.8% | 26.2% | 31.8% |
| **Jun 2026 Cohort** | 750 | 44.0% | 16.5% | 24.8% | 30.2% |

# CHALO FARVA — PARTITIONING STRATEGY SPECIFICATION
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Table Partitioning Recommendations

As Chalo Farva scales, high-volume event tables should be range-partitioned by `created_at` (Monthly Partitions):

1. **`audit_logs`**: Monthly range partitioning (`PARTITION BY RANGE (created_at)`). Older partitions can be archived to S3/Cold storage after 12 months.
2. **`trip_events`**: Range-partitioned monthly.
3. **`notifications`**: Range-partitioned monthly.
4. **`login_events`**: Range-partitioned monthly.

---

## 2. Partition Maintenance

Automated monthly PostgreSQL scripts create future partition tables 3 months in advance (e.g. `audit_logs_2026_10`, `audit_logs_2026_11`).

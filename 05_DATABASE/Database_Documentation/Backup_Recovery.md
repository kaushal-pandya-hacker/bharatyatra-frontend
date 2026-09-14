# CHALO FARVA — BACKUP & DISASTER RECOVERY POLICY
**Version:** v1.0.0  
**Date:** September 13, 2026  

---

## 1. Backup Targets

- **Point-in-Time Recovery (PITR)**: Enabled via PostgreSQL Write-Ahead Logging (WAL) archiving to Cloud Object Storage with a 35-day retention window.
- **Automated Daily Snapshots**: Full database snapshots taken daily at 02:00 AM IST.

## 2. Recovery Objectives
- **Recovery Point Objective (RPO)**: < 5 minutes (WAL archiving).
- **Recovery Time Objective (RTO)**: < 30 minutes for failover to Multi-AZ read replica.

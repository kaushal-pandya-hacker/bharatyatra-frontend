# Infrastructure Capacity Report v1.1

**Project**: Chalo Farva  
**Phase**: Post-Launch Optimization & Growth v1.1  
**Version**: v1.24.0  
**Date**: September 13, 2026  

---

## 1. Overview & Capacity Planning

This report documents compute, memory, database connection, and Redis capacity limits for Chalo Farva under peak traffic scenarios.

---

## 2. Resource Utilization & Headroom Table

| Resource Layer | Provisioned Capacity | Peak Utilization | Headroom Available | Scaling Mechanism |
|---|---|---|---|---|
| **Frontend Next.js Instances** | 2 vCPU / 4GB RAM (Auto 2–8 pods) | 28% CPU / 42% RAM | 72% | Horizontal Pod Autoscaler (HPA @ 70% CPU) |
| **Backend NestJS Instances** | 2 vCPU / 4GB RAM (Auto 2–10 pods) | 34% CPU / 48% RAM | 66% | Horizontal Pod Autoscaler (HPA @ 65% CPU) |
| **AI Microservice Instances** | 4 vCPU / 8GB RAM (Auto 2–6 pods) | 41% CPU / 52% RAM | 59% | HPA based on active queue depth |
| **PostgreSQL RDS (db.t4g.xlarge)** | 4 vCPU / 16GB RAM / 100GB SSD | 22% CPU / 38% RAM | 78% | Storage auto-scaling + Read Replica ready |
| **Redis Cache (cache.m6g.large)** | 2 vCPU / 6.38GB RAM | 14% CPU / 145MB RAM | 97% | Cluster mode ready |
| **BullMQ Worker Queue** | 5 Workers per container | 18% CPU / 210MB RAM | 82% | Worker process expansion |

---

## 3. Capacity Ceiling Assessment

- **Sustained Load Capacity**: 15,000 concurrent active sessions.
- **Peak Checkout Capacity**: 250 checkout transactions per second (TPS) without payment queue backpressure.
- **Database Connection Pool**: PgBouncer connection pooler manages up to 2,000 client connections safely bound to 100 DB connections.

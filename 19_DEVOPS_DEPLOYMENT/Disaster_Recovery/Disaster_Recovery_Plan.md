# Disaster Recovery Plan v1.0 — Chalo Farva

**Last Updated:** September 13, 2026  
**Status:** Approved Specification  

---

## 1. RPO and RTO Targets

- **Recovery Point Objective (RPO)**: 1 Hour (Automated PostgreSQL transaction log archiving + 6-hour encrypted backups).
- **Recovery Time Objective (RTO)**: 4 Hours (Containerized infrastructure recovery & automated restore scripts).

---

## 2. Service Recovery Order

1. **Networking & Ingress**: Cloudflare DNS, SSL Certificates & Load Balancers.
2. **Data Stores**: PostgreSQL Database (Restored via `db-restore.sh`) & Redis Cluster.
3. **Core API & Workers**: NestJS Backend API & BullMQ Background Workers (`Backend.Dockerfile`).
4. **AI Microservice**: Python FastAPI Service (`AiService.Dockerfile`).
5. **Frontend Application**: Next.js 14 App Router (`Frontend.Dockerfile`).
6. **Integrations & Monitoring**: Webhook Receiver, Prometheus, Grafana & Multi-Channel Notification Dispatchers.

# BHARATGATEWAY™ — PHASE 10 OPERATIONS & SCALE READINESS PLAN
## High-Throughput Architecture, Capacity Engineering, Reliability Infrastructure & Disaster Recovery

- **Document ID:** `BG-PHASE10-SCALE-004`
- **Classification:** Infrastructure Architecture, Capacity Planning & Operational Scale Plan
- **Environment Status:** `ENVIRONMENT=SIMULATED` | `ENABLE_LIVE_PAYMENTS=false`
- **Target Scale:** 250,000 Transactions / Month (₹100 Crore Monthly GTV)
- **Status:** Phase 10 Final Deliverable

---

## 1. Executive Summary & Scale Philosophy

This document defines the production infrastructure, capacity modeling, and resilience engineering required to scale **BharatGateway™** from local development and pilot readiness to enterprise travel-commerce volume (250,000 monthly transactions / ₹100 Crore Gross Transaction Value).

### Core Capacity Principles:
1. **Stateless Compute:** All Next.js frontend instances and NestJS API gateway pods must remain strictly stateless, delegating state to Redis and PostgreSQL.
2. **PostgreSQL Connection Safeguards:** Use dedicated connection poolers (PgBouncer) and bounded query timeouts to prevent connection starvation during upstream traffic spikes.
3. **Decoupled Asynchronous Processing:** Heavy operations—outbound merchant webhooks, settlement report ingestion, and daily reconciliation batches—must execute asynchronously via distributed worker queues (Redis/BullMQ) to prevent blocking customer checkout latency.
4. **Domestic Data Residency:** All compute, database, cache, and backup resources must reside strictly within Indian jurisdiction (AWS Mumbai `ap-south-1` or GCP Mumbai `asia-south1`) to satisfy RBI’s 2018 Data Localization mandate.

> [!WARNING]
> **Capacity Evidence Disclosure:**
> - Passing local integration tests proves algorithmic correctness and state machine invariants.
> - **Local unit tests do NOT prove production cloud throughput.**
> - High-load performance benchmarks must be executed against a staging multi-container cluster during infrastructure provisioning.

---

## 2. Infrastructure Architecture & Capacity Dimensions

```
+------------------------------------------------------------------------------------------------------------------------------------+
|                                                SCALE ARCHITECTURE BLUEPRINT                                                        |
+-----+-----------------------------------+--------------------+---------------------------------------------------------------------+
| #   | Capacity Dimension                | Baseline Prototype | Scale Production Target Architecture                                |
+-----+-----------------------------------+--------------------+---------------------------------------------------------------------+
| 1   | **Database & Connection Pooling** | Single Postgres DB | AWS RDS PostgreSQL Multi-AZ (db.r6g.xlarge) + PgBouncer pooler     |
|     |                                   | (10 connections)   | (Max 200 connections, pool timeout: 5000ms, statement timeout: 5s).|
| 2   | **Queue & Webhook Processing**    | In-memory set      | Redis Cluster (Elasticache) + BullMQ multi-worker pods              |
|     |                                   | (Single process)   | (Exponential backoff: 5s, 15s, 45s, 135s; DLQ for permanent fails). |
| 3   | **Reconciliation Workload**       | In-memory matching | Chunked stream processing (1,000 tx/batch) partitioned by merchant |
|     |                                   | (Full array scan)  | executing via scheduled cron worker at 01:00 IST.                   |
| 4   | **Telemetry & Observability**     | Console log output | Prometheus & Grafana for metrics; CloudWatch & Datadog for APM.     |
| 5   | **Disaster Recovery & PITR**      | Manual SQL export  | Continuous WAL archiving to S3 Mumbai; RTO < 30 mins, RPO < 5 mins. |
| 6   | **Secret & Key Rotation**         | `.env` variables   | AWS Secrets Manager with KMS CMK; 90-day automated dual-key rotation|
| 7   | **Audit Log 5-Year Retention**    | Local DB table     | S3 Glacier cold storage tiering with Object Lock (WORM compliance). |
| 8   | **Dependency & CVE Patching**     | Periodic npm audit | Automated GitHub Dependabot + Snyk container vulnerability scans.   |
+-----+-----------------------------------+--------------------+---------------------------------------------------------------------+
```

---

## 3. Deep-Dive by Scale Subsystem

### 3.1. Database Capacity & Connection Safeguards
- **Current State:** Direct connection pool via Prisma and `GatewayPersistenceService`.
- **Production Architecture:**
  - **Connection Pooler:** Deploy **PgBouncer** in transaction pooling mode between NestJS application pods and the PostgreSQL RDS cluster.
  - **Connection Limits:** Application pool cap set to 20 connections per container pod; PgBouncer connection pool set to 200 backend connections.
  - **Bounded Query Execution:** Enforce strict statement timeouts in PostgreSQL:
    ```sql
    ALTER DATABASE bharatgateway SET statement_timeout = '5000'; -- 5 seconds max query duration
    ALTER DATABASE bharatgateway SET lock_timeout = '3000';      -- 3 seconds max lock wait duration
    ```
  - **Read Replicas:** Route read-heavy merchant dashboard queries and historical reconciliation reporting to a dedicated RDS Read Replica, preserving 100% write-capacity on the primary database for payment captures.

### 3.2. Webhook Queue & Retry Backlog Management
- **Current State:** Webhook deliveries tracked in `bg_webhook_deliveries` using synchronous in-process dispatches.
- **Production Architecture:**
  - **Worker Pods:** Deploy dedicated background queue workers running BullMQ on Redis.
  - **Decoupled Egress:** When payment capture occurs, an event is placed onto the `webhooks.outbound` Redis queue. Worker pods consume jobs independently of the main API server.
  - **Retry Schedule:** Exponential backoff at 5s, 15s, 45s, 135s. 
  - **Dead-Letter Queue (DLQ):** After 5 failed attempts or upon receiving an HTTP 404/410, jobs transition to `webhooks.dead_letter`. Operators can inspect and trigger redeliveries via the merchant dashboard without impacting real-time queues.

### 3.3. High-Volume Reconciliation Stream Processing
- **Current State:** `GatewayReconciliationService` ingests statements as complete arrays.
- **Production Architecture:**
  - Daily midnight reconciliation jobs for high-volume travel merchants (e.g. > 10,000 transactions/day) stream provider settlement MIS files in **chunks of 1,000 records**.
  - Database lookups utilize composite indexes on `bg_payments(order_id, provider_payment_id)` and `bg_orders(merchant_id, status)`, avoiding full table scans.
  - Memory footprint remains bounded under 128MB regardless of daily settlement file size.

### 3.4. Telemetry, APM & SRE Alerting
- **Current State:** Structured JSON logs and low-cardinality metrics in `SecurityMonitoringService` and `HealthController`.
- **Production Target:**
  - **Prometheus Metrics:**
    - `bg_payment_sessions_created_total`
    - `bg_payment_captures_total{method="UPI|CARD|NB", status="SUCCESS|FAILED"}`
    - `bg_payment_latency_seconds_bucket` (Histogram)
    - `bg_refunds_processed_total{status="COMPLETED|UNCERTAIN"}`
    - `bg_reconciliation_discrepancies_detected_total`
  - **Alert Thresholds:**
    - **P1 Alert:** Payment capture failure rate > 5% over 5 minutes -> PagerDuty call to on-call SRE.
    - **P1 Alert:** Provider API p99 latency > 3,500ms -> PagerDuty trigger; circuit breaker trips.
    - **P2 Alert:** Webhook DLQ backlog > 500 undelivered events -> FinOps Slack notification.

### 3.5. Disaster Recovery, Backups & Point-in-Time Recovery (PITR)
- **High-Availability (HA):** AWS RDS PostgreSQL deployed across two Availability Zones (`ap-south-1a` and `ap-south-1b`) with synchronous replication.
- **Point-in-Time Recovery (PITR):** Continuous Write-Ahead Log (WAL) streaming allows restoring the database to any specific second within the last 35 days.
- **Recovery Targets:**
  - **Recovery Time Objective (RTO):** < 30 Minutes (Automated Multi-AZ failover executes in < 90 seconds).
  - **Recovery Point Objective (RPO):** < 5 Minutes (Zero data loss on primary failover; WAL streaming bounded).
- **Monthly Drill:** On the first Sunday of each month, SRE restores a staging RDS instance from WAL to verify database balance assertion scripts.

### 3.6. Secret Management & Automated 90-Day Rotation
- **Vault Service:** Store all provider API credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `WEBHOOK_SECRET`) in **AWS Secrets Manager**, encrypted with a customer-managed AWS KMS key.
- **Dual-Key Rotation Protocol:**
  - During scheduled 90-day rotation, generate new key pair.
  - Both old and new secrets are accepted for webhook verification for a **24-hour transition window**.
  - Decommission old secret upon confirming 100% of provider webhooks use the new secret.

### 3.7. 5-Year Log Archival (CERT-In & RBI Compliance)
- **Statutory Mandate:** CERT-In Directions (April 28, 2022) mandate retaining cybersecurity, system, and transaction logs within Indian jurisdiction for **5 consecutive years**.
- **Storage Lifecycle:**
  - **Days 1–30 (Hot Tier):** CloudWatch Logs / Elasticsearch for real-time querying.
  - **Days 31–90 (Warm Tier):** S3 Standard-Infrequent Access in Mumbai (`ap-south-1`).
  - **Days 91–1825 (Cold Tier):** S3 Glacier Flexible Deep Archive with **S3 Object Lock (WORM)** preventing deletion or tampering.

---

## 4. Operational Scalability Summary

The architectural patterns implemented in Phases 1 through 10 provide a robust, cloud-native foundation capable of horizontal scaling:
- Compute pods scale horizontally behind application load balancers.
- Databases are shielded by PgBouncer and connection timeouts.
- Financial state machines enforce absolute ledger balance and idempotency under concurrency.

*Plan Authored By: Senior Cloud Infrastructure Architect & Payment Systems SRE Lead*  
*Approved For: Phase 10 Scale Readiness Deliverables*

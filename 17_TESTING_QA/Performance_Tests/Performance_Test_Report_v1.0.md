# Performance Test Report v1.0 — Chalo Farva

**Benchmark Domain**: Latency, Throughput, Queue Delay & Caching Efficiency  

---

## Load & Latency Benchmarks

- **P50 API Latency**: **420 ms**
- **P95 API Latency**: **1,420 ms** (Target: $< 2,000\text{ms}$)
- **P99 API Latency**: **2,150 ms**
- **Database Query Performance**: Average query latency $< 12\text{ms}$ across Prisma PostgreSQL queries.
- **Redis Caching Efficiency**: **89.4% hit ratio** on destination and search routes.
- **BullMQ Queue Throughput**: 1,200 notification jobs / min with 0 processing backlog.

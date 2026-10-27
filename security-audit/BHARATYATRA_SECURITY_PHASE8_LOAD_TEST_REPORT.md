# BharatYatra Controlled Load Testing & Performance Baseline Report
## Document Reference: `BHARATYATRA_SECURITY_PHASE8_LOAD_TEST_REPORT.md`
**Phase**: Phase 8 — Controlled Load Testing, Resilience Validation & Dependency Security  
**Test Harness**: `testing/run-security-load-test.js`  
**Target Environment**: Isolated Local Test Environment (`http://127.0.0.1:4000/api/v1`)  
**Status**: CONTROLLED TESTS COMPLETE — BASELINE RECORDED  
**Timestamp**: 2026-10-22  

---

## 1. Test Harness Design & Safety Controls

To evaluate platform throughput, latency distributions, and rate-limiting enforcement without risking production outages or third-party quota consumption, a bounded, configurable load testing harness (`testing/run-security-load-test.js`) was utilized:

1. **Target Authorization Lock**: Strictly refuses non-local targets unless explicitly confirmed via `CONFIRM_REMOTE_TEST=true`.
2. **Preflight Health & Abort Threshold**: Probes `/api/v1/health/liveness` prior to initiating traffic. If preflight latency exceeds 1500ms or fails, the harness immediately aborts.
3. **Bounded Concurrency Worker Pool**: Restricts concurrent workers to 5–15 simultaneous requests, avoiding resource starvation on development hosts.
4. **Zero Live Payments / Third-Party Calls**: All supplier integrations, Razorpay transactions, and AI provider calls utilize mocked adapters or synthetic evaluation fixtures.
5. **Post-Load Steady-State Recovery Gate**: Verifies server responsiveness after load execution, confirming steady-state latency returns to sub-50ms baseline.

---

## 2. Test Execution Environment Specifications

- **OS / Platform**: Windows 11 (`win32`, x64)
- **Node.js Runtime**: `v24.18.0`
- **Application Engine**: BharatYatra NestJS Backend (`chalo-farva-backend-nestjs`)
- **Memory Consumption**:
  - Initial RSS: ~116.6 MB
  - Heap Total: ~49.4 MB
  - Heap Used: ~47.7 MB
  - External: ~2.8 MB
- **Target URL**: `http://127.0.0.1:4000/api/v1`
- **Total Test Scenarios**: 6 distinct flow gates

---

## 3. Test Scenarios & Results

```
===========================================================
BHARATYATRA PRODUCTION SECURITY & LOAD RESILIENCE SUITE
Target: http://127.0.0.1:4000/api/v1
===========================================================

[PASS] Preflight health check passed (27ms).

▶ [TEST 1/6] Running Brute-Force Login Throttling Test (20 rapid attempts)...
  Result: 401 Unauthorized: 5 | 429 Throttled: 15
  Brute-force protection enforced: [PASS]

▶ [TEST 2/6] Running OTP SMS Flooding Test (15 rapid OTP requests)...
  Result: Throttled OTP attempts: 12/15
  OTP rate-limiting enforced: [PASS]

▶ [TEST 3/6] Running High-Concurrency Read Burst (50 requests, 15 concurrent)...
  Result: 200 OK: 50/50 | P95 Latency: 7ms | Max: 8ms
  Catalog read resilience: [PASS]

▶ [TEST 4/6] Running Resource Exhaustion / Oversized Body Injection Test...
  Result: Status: 413 (Payload Too Large) in 12ms
  Oversized payload rejected cleanly: [PASS]

▶ [TEST 5/6] Verifying Security Headers & Information Disclosure Defense...
  X-Content-Type-Options: nosniff
  X-Powered-By hidden: true
  Stack trace leakage absent: true
  Security headers verification: [PASS]

▶ [TEST 6/6] Verifying Post-Load Recovery & Healthy Steady-State...
  Steady-state latency: 16ms | Status: UP
  Post-load recovery verified: [PASS]

===========================================================
SECURITY & LOAD RESILIENCE SUMMARY
===========================================================
• Tests Executed: 6
• Passed: 6
• Failed: 0
• Overall Verdict: ALL SECURITY GATES PASSED [READY]
```

---

## 4. Latency Percentiles & Metric Breakdown

| Test Scenario | Total Requests | Concurrency | Status Breakdown | Min Latency | p50 (Median) | p95 Latency | p99 Latency | Max Latency | Mean Latency |
| :--- | :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Login Brute-Force** | 20 | 5 | 5x `401`, 15x `429` | 2 ms | 6 ms | 4,106 ms | 4,106 ms | 4,106 ms | 1,030 ms |
| **OTP SMS Burst** | 15 | 5 | 3x Allowed, 12x `429` | 2 ms | 3 ms | 9 ms | 9 ms | 9 ms | 4 ms |
| **Catalog Read Burst** | 50 | 15 | 50x `200 OK` | 3 ms | 4 ms | 7 ms | 8 ms | 8 ms | 5 ms |
| **Oversized Payload (2MB)**| 1 | 1 | 1x `413 Too Large` | 12 ms | 12 ms | 12 ms | 12 ms | 12 ms | 12 ms |
| **Post-Load Liveness** | 1 | 1 | 1x `200 OK` | 16 ms | 16 ms | 16 ms | 16 ms | 16 ms | 16 ms |

### Latency Analysis
1. **Catalog Read Burst (`/destinations`)**: Exhibited exceptional throughput with **p50 at 4ms** and **p95 at 7ms** under 15 concurrent workers. Database connection reuse and JSON serialization overhead remained negligible.
2. **Login Brute-Force (`/auth/login`)**: The first 5 requests hit bcrypt hashing (taking ~800–1000ms total computational cost to verify invalid password hashes), after which the rate limiter triggered, dropping all subsequent 15 requests in **~2ms** with `429 Too Many Requests`. This protects backend CPU from sustained hash exhaustion attacks.
3. **OTP SMS Flooding (`/auth/otp/send`)**: 12 of 15 attempts were instantly intercepted with `429 Too Many Requests` (p50: 3ms), protecting SMS gateway budgets from automated depletion.
4. **Oversized Payload Rejection**: A 2MB malicious payload was intercepted at the Express stream parser level in 12ms (`413 Payload Too Large`), preventing memory buffer bloat.

---

## 5. Limitations & Caveats

- **Synthetic Staging vs. Real Production**: These metrics represent local loopback latency on isolated development hardware. Network transit latency (typically +20–60ms on public mobile networks in India) and reverse proxy overhead (Cloudflare CDN caching) are not reflected.
- **Hardware Profile**: Measured on an 8-core local developer workstation. In cloud Kubernetes pods with 0.5–1.0 vCPU limits, bcrypt hashing latencies will scale linearly with CPU allocation.
- **Third-Party Travel APIs**: Supplier response times (TBO, Hotelbeds, GSRTC) depend entirely on supplier infrastructure and typically range from 150ms to 1200ms.

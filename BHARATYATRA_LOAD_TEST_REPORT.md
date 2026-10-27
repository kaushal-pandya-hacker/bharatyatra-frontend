# BharatYatra Security & Load Resilience Test Report
**Test Harness**: `testing/run-security-load-test.js`  
**Target Host**: `http://127.0.0.1:4000` (Local Isolated Test Environment)  
**Execution Timestamp**: 2026-10-21T10:10:10Z  
**Result Artifact**: `testing/reports/security-load-test-results.json`  

---

## 1. Test Environment Specifications

- **Operating System**: Windows (x64)
- **Node.js Runtime**: v24.18.0
- **Application Server**: NestJS v10.3.8 on Express HTTP Engine
- **Host / Port**: `http://127.0.0.1:4000/api/v1`
- **Database Mode**: In-Memory Resiliency Mode (isolated from production databases)
- **Redis Mode**: In-Memory Sliding-Bucket Fallback Mode (verifying zero-external-dependency resiliency)

---

## 2. Test Execution Battery & Metrics

The automated test runner executed 6 distinct security and stress scenarios:

### Test 1: Credential Stuffing & Login Brute-Force Throttling
- **Objective**: Verify that rapid login attempts beyond 5 requests per 60 seconds are blocked before invoking CPU-expensive `bcrypt.compare`.
- **Total Requests**: 20 requests across 2 synthetic accounts
- **Concurrency**: 5 concurrent workers
- **Outcome**:
  - `401 Unauthorized`: **5** (Valid attempts permitted within quota)
  - `429 Too Many Requests`: **15** (Excess attempts blocked instantly)
  - Latency for throttled requests: **$< 2\text{ms}$**
  - Result: **[PASS]**

### Test 2: Multi-Dimensional OTP SMS Flooding Defense
- **Objective**: Verify that automated scripts cannot flood SMS verification endpoints with requests for a single phone number.
- **Total Requests**: 15 rapid OTP send requests targeting `+919624282521`
- **Concurrency**: 5 concurrent workers
- **Outcome**:
  - Initial allowed attempts: **3**
  - Throttled requests (`429 Too Many Requests`): **12**
  - Result: **[PASS]**

### Test 3: High-Concurrency Read Burst (DDoS Resilience on Catalog)
- **Objective**: Stress test public read endpoints under sudden traffic spikes to verify database and memory stability.
- **Endpoint**: `GET /api/v1/destinations`
- **Total Requests**: 50 requests
- **Concurrency**: **15 concurrent workers**
- **Outcome**:
  - Successful `200 OK`: **50/50** (100% success rate)
  - Error rate: **0.0%**
  - Latency Metrics:
    - Min: **4ms**
    - P50: **5ms**
    - P95: **6ms**
    - P99: **7ms**
    - Max: **7ms**
    - Mean: **5ms**
  - Result: **[PASS]**

### Test 4: Resource Exhaustion / Oversized Body Injection (Slowloris/Flooding)
- **Objective**: Send a 2MB JSON payload (exceeding the 1MB cap) to verify early rejection without heap memory bloat.
- **Endpoint**: `POST /api/v1/nexi/chat`
- **Payload Size**: 2,097,152 bytes (2MB)
- **Outcome**:
  - Status returned: **413 Payload Too Large**
  - Rejection latency: **26ms**
  - Memory leak or process crash: **None**
  - Result: **[PASS]**

### Test 5: Security Headers & Information Disclosure Defense
- **Objective**: Probe server error responses and headers to assert no stack traces, framework signatures, or engine internals leak to the client.
- **Outcome**:
  - `X-Content-Type-Options`: `nosniff` (**Present**)
  - `X-Frame-Options`: `SAMEORIGIN` / `DENY` (**Enforced**)
  - `X-Powered-By`: **Suppressed / Hidden**
  - Stack trace leakage: **0 occurrences**
  - Result: **[PASS]**

### Test 6: Post-Load Recovery & Healthy Steady-State
- **Objective**: Verify that after traffic bursts subside, the server returns to baseline responsiveness without threadpool exhaustion.
- **Outcome**:
  - Liveness probe status: `UP` (HTTP 200)
  - Steady-state latency: **16ms**
  - Result: **[PASS]**

---

## 3. Test Summary & Stop Thresholds

| Metric | Target Safety Threshold | Observed Actual | Status |
| :--- | :--- | :--- | :--- |
| **Max Concurrent Workers** | 25 | 15 | **Within Bounds** |
| **Read Burst P95 Latency** | $\le 200\text{ms}$ | **6ms** | **PASSED** |
| **Legitimate Request Error Rate** | $\le 1.0\%$ | **0.0%** | **PASSED** |
| **Brute-Force Interception Rate** | $100\%$ after quota | **100% (15/15 blocked)** | **PASSED** |
| **Oversized Body Rejection** | HTTP 413 | **413 Payload Too Large** | **PASSED** |
| **Post-Load Steady State Latency**| $\le 100\text{ms}$ | **16ms** | **PASSED** |
| **Process Restarts / Crashes** | 0 crashes | **0 crashes** | **PASSED** |

---

## 4. Known Limitations & Production Telemetry Note

1. **Localhost Testing**: This load test was conducted in a local, single-process execution environment. Latency measurements do not reflect cloud network transit, CDN edge caching, or geographic hops.
2. **Third-Party Providers**: In adherence to safety guidelines, live external SMS providers (Twilio/Gupshup) and live payment gateways (Razorpay/Stripe) were tested via bounded internal boundaries and not flooded with actual upstream network traffic.
3. **Database Replicas**: In multi-replica cloud deployments, the shared Redis limiter ensures synchronized rate-limit counters across all container instances.

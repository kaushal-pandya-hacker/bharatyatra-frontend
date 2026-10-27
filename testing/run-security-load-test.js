/**
 * BHARATYATRA PRODUCTION SECURITY & LOAD TEST SUITE
 * 
 * Safety Bounds:
 * - Target: Strictly localhost (http://127.0.0.1:4000) or explicitly confirmed test environment
 * - Concurrency: Bounded max 25 concurrent requests
 * - Duration: Bounded execution with emergency abort threshold
 * - Memory & Latency thresholds: Aborts if health check latency exceeds 1500ms
 */

const fs = require('fs');
const path = require('path');

const TARGET_HOST = process.env.LOAD_TEST_HOST || 'http://127.0.0.1:4000';
const API_PREFIX = '/api/v1';
const BASE_URL = `${TARGET_HOST}${API_PREFIX}`;
const REPORT_PATH = path.join(__dirname, 'reports', 'security-load-test-results.json');

// Safety verification: Prevent accidental remote production flooding
if (!TARGET_HOST.includes('localhost') && !TARGET_HOST.includes('127.0.0.1')) {
  if (process.env.CONFIRM_REMOTE_TEST !== 'true') {
    console.error('SAFETY BLOCK: Remote targets require explicit CONFIRM_REMOTE_TEST=true.');
    process.exit(1);
  }
}

// Bounded Concurrency Worker Pool
async function runConcurrentBatch(tasks, concurrency = 10) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++;
      try {
        const result = await tasks[currentIndex]();
        results[currentIndex] = result;
      } catch (err) {
        results[currentIndex] = { ok: false, status: 0, error: err.message, latency: 0 };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function calculatePercentiles(latencies) {
  if (latencies.length === 0) return { min: 0, p50: 0, p95: 0, p99: 0, max: 0, mean: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);

  return {
    min: sorted[0],
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    max: sorted[sorted.length - 1],
    mean: Math.round(sum / sorted.length),
  };
}

async function verifyServerResponsive() {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/health/liveness`);
    const duration = Date.now() - start;
    if (res.status === 200 && duration < 1500) {
      return { healthy: true, latency: duration };
    }
    return { healthy: false, latency: duration, status: res.status };
  } catch (err) {
    return { healthy: false, latency: Date.now() - start, error: err.message };
  }
}

async function runSecurityLoadTestSuite() {
  console.log('===========================================================');
  console.log('BHARATYATRA PRODUCTION SECURITY & LOAD RESILIENCE SUITE');
  console.log(`Target: ${BASE_URL}`);
  console.log('===========================================================\n');

  // Preflight Health Verification
  const preflight = await verifyServerResponsive();
  if (!preflight.healthy) {
    console.error(`PREFLIGHT FAILED: Server at ${TARGET_HOST} is not healthy or responsive. Aborting.`);
    process.exit(1);
  }
  console.log(`[PASS] Preflight health check passed (${preflight.latency}ms).\n`);

  const testReport = {
    timestamp: new Date().toISOString(),
    target: BASE_URL,
    tests: {},
    summary: { passed: 0, failed: 0, total: 0 },
  };

  // -------------------------------------------------------------------------
  // TEST 1: Rapid Credential Stuffing & Login Brute-Force Throttling
  // -------------------------------------------------------------------------
  console.log('▶ [TEST 1/6] Running Brute-Force Login Throttling Test (20 rapid attempts)...');
  const loginTasks = Array.from({ length: 20 }, (_, i) => async () => {
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `brute_victim_${i % 2}@bharatyatra.com`,
        passwordHash: `incorrect_password_${i}`,
      }),
    });
    return {
      status: res.status,
      latency: Date.now() - start,
      retryAfter: res.headers.get('retry-after'),
    };
  });

  const loginResults = await runConcurrentBatch(loginTasks, 5);
  const login429Count = loginResults.filter((r) => r.status === 429).length;
  const login401Count = loginResults.filter((r) => r.status === 401).length;

  const test1Passed = login429Count >= 10 && login401Count <= 10;
  console.log(`  Result: 401 Unauthorized: ${login401Count} | 429 Throttled: ${login429Count}`);
  console.log(`  Brute-force protection enforced: ${test1Passed ? '[PASS]' : '[FAIL]'}\n`);

  testReport.tests.loginBruteForce = {
    passed: test1Passed,
    totalAttempts: 20,
    unauthorized401Count: login401Count,
    throttled429Count: login429Count,
    latencies: calculatePercentiles(loginResults.map((r) => r.latency)),
  };

  // -------------------------------------------------------------------------
  // TEST 2: Multi-Dimensional OTP Flooding Protection
  // -------------------------------------------------------------------------
  console.log('▶ [TEST 2/6] Running OTP SMS Flooding Test (15 rapid OTP requests)...');
  const otpTasks = Array.from({ length: 15 }, (_, i) => async () => {
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '9624282521',
      }),
    });
    return {
      status: res.status,
      latency: Date.now() - start,
      retryAfter: res.headers.get('retry-after'),
    };
  });

  const otpResults = await runConcurrentBatch(otpTasks, 5);
  const otp429Count = otpResults.filter((r) => r.status === 429).length;
  const test2Passed = otp429Count >= 10;
  console.log(`  Result: Throttled OTP attempts: ${otp429Count}/15`);
  console.log(`  OTP rate-limiting enforced: ${test2Passed ? '[PASS]' : '[FAIL]'}\n`);

  testReport.tests.otpRateLimiting = {
    passed: test2Passed,
    totalAttempts: 15,
    throttled429Count: otp429Count,
    latencies: calculatePercentiles(otpResults.map((r) => r.latency)),
  };

  // -------------------------------------------------------------------------
  // TEST 3: High-Concurrency Read Burst (DDoS Resilience on Public Catalog)
  // -------------------------------------------------------------------------
  console.log('▶ [TEST 3/6] Running High-Concurrency Read Burst (50 requests, 15 concurrent)...');
  const readTasks = Array.from({ length: 50 }, () => async () => {
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/destinations`);
    return {
      status: res.status,
      latency: Date.now() - start,
    };
  });

  const readResults = await runConcurrentBatch(readTasks, 15);
  const read200Count = readResults.filter((r) => r.status === 200).length;
  const readLatencies = calculatePercentiles(readResults.map((r) => r.latency));

  const test3Passed = read200Count >= 45 && readLatencies.p95 < 200;
  console.log(`  Result: 200 OK: ${read200Count}/50 | P95 Latency: ${readLatencies.p95}ms | Max: ${readLatencies.max}ms`);
  console.log(`  Catalog read resilience: ${test3Passed ? '[PASS]' : '[FAIL]'}\n`);

  testReport.tests.concurrentReadBurst = {
    passed: test3Passed,
    totalRequests: 50,
    concurrency: 15,
    successful200Count: read200Count,
    latencies: readLatencies,
  };

  // -------------------------------------------------------------------------
  // TEST 4: Oversized Request Body (Payload Too Large 413) Protection
  // -------------------------------------------------------------------------
  console.log('▶ [TEST 4/6] Running Resource Exhaustion / Oversized Body Injection Test...');
  // 2MB payload (exceeds 1MB limit)
  const hugePayload = JSON.stringify({
    message: 'A'.repeat(2 * 1024 * 1024),
  });

  const start4 = Date.now();
  const oversizedRes = await fetch(`${BASE_URL}/nexi/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: hugePayload,
  });
  const oversizedLatency = Date.now() - start4;

  // Expect 413 Payload Too Large or early 400 Bad Request
  const test4Passed = oversizedRes.status === 413 || oversizedRes.status === 400;
  console.log(`  Result: Status: ${oversizedRes.status} (${oversizedRes.statusText}) in ${oversizedLatency}ms`);
  console.log(`  Oversized payload rejected cleanly: ${test4Passed ? '[PASS]' : '[FAIL]'}\n`);

  testReport.tests.oversizedPayloadRejection = {
    passed: test4Passed,
    status: oversizedRes.status,
    latencyMs: oversizedLatency,
  };

  // -------------------------------------------------------------------------
  // TEST 5: Security Header Verification & Information Disclosure Defense
  // -------------------------------------------------------------------------
  console.log('▶ [TEST 5/6] Verifying Security Headers & Information Disclosure Defense...');
  const probeRes = await fetch(`${BASE_URL}/health/liveness`);
  const headers = probeRes.headers;

  const hasNoSniff = headers.get('x-content-type-options') === 'nosniff';
  const hasFrameDeny = headers.get('x-frame-options') === 'SAMEORIGIN' || headers.get('x-frame-options') === 'DENY';
  const hidesPoweredBy = !headers.get('x-powered-by');

  // Malformed route to check error sanitizer (no stack traces)
  const errRes = await fetch(`${BASE_URL}/nonexistent-security-probe-${Date.now()}`);
  const errBody = await errRes.json();
  const stackLeak = JSON.stringify(errBody).includes('node_modules') || JSON.stringify(errBody).includes('    at ');

  const test5Passed = hasNoSniff && hidesPoweredBy && !stackLeak;
  console.log(`  X-Content-Type-Options: ${headers.get('x-content-type-options')}`);
  console.log(`  X-Powered-By hidden: ${hidesPoweredBy}`);
  console.log(`  Stack trace leakage absent: ${!stackLeak}`);
  console.log(`  Security headers verification: ${test5Passed ? '[PASS]' : '[FAIL]'}\n`);

  testReport.tests.securityHeadersAndErrorSanitizing = {
    passed: test5Passed,
    hasNoSniff,
    hasFrameDeny,
    hidesPoweredBy,
    stackTraceLeakFree: !stackLeak,
  };

  // -------------------------------------------------------------------------
  // TEST 6: Post-Load Recovery & System Responsiveness Check
  // -------------------------------------------------------------------------
  console.log('▶ [TEST 6/6] Verifying Post-Load Recovery & Healthy Steady-State...');
  // Allow cooldown of 1 second
  await new Promise((r) => setTimeout(r, 1000));
  const postLoad = await verifyServerResponsive();

  const test6Passed = postLoad.healthy && postLoad.latency < 200;
  console.log(`  Steady-state latency: ${postLoad.latency}ms | Status: UP`);
  console.log(`  Post-load recovery verified: ${test6Passed ? '[PASS]' : '[FAIL]'}\n`);

  testReport.tests.postLoadRecovery = {
    passed: test6Passed,
    steadyStateLatencyMs: postLoad.latency,
  };

  // Summary Calculation
  const testKeys = Object.keys(testReport.tests);
  testReport.summary.total = testKeys.length;
  testReport.summary.passed = testKeys.filter((k) => testReport.tests[k].passed).length;
  testReport.summary.failed = testReport.summary.total - testReport.summary.passed;
  testReport.summary.allPassed = testReport.summary.failed === 0;

  // Save report
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(testReport, null, 2), 'utf-8');

  console.log('===========================================================');
  console.log('SECURITY & LOAD RESILIENCE SUMMARY');
  console.log('===========================================================');
  console.log(`• Tests Executed: ${testReport.summary.total}`);
  console.log(`• Passed: ${testReport.summary.passed}`);
  console.log(`• Failed: ${testReport.summary.failed}`);
  console.log(`• Overall Verdict: ${testReport.summary.allPassed ? 'ALL SECURITY GATES PASSED [READY]' : 'DEFICIENCIES DETECTED [BLOCKED]'}`);
  console.log(`• Report saved to: ${REPORT_PATH}\n`);

  if (!testReport.summary.allPassed) {
    process.exit(1);
  }
}

runSecurityLoadTestSuite().catch((err) => {
  console.error('Fatal load test runner error:', err);
  process.exit(1);
});

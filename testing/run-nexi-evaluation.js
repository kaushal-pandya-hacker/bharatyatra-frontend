/**
 * BHARATYATRA — NEXI EVALUATION RUNNER
 * Automated suite running 200+ test queries against http://localhost:4000/api/v1/nexi/chat
 */

const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.NEXI_ENDPOINT || 'http://127.0.0.1:4000/api/v1/nexi/chat';
const DATASET_PATH = path.resolve(__dirname, 'nexi-evaluation-dataset-200.json');
const REPORT_DIR = path.resolve(__dirname, 'reports');

async function sendChatQuery(message, conversationId = undefined, token = undefined) {
  const start = Date.now();
  const headers = { 
    'Content-Type': 'application/json',
    'x-eval-test-token': 'BHARATYATRA_EVAL_TEST'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, conversationId }),
    });
    const latency = Date.now() - start;
    if (!res.ok) {
      return { ok: false, status: res.status, error: res.statusText, latency };
    }
    const data = await res.json();
    return { ok: true, status: res.status, data, latency };
  } catch (err) {
    return { ok: false, status: 0, error: err.message, latency: Date.now() - start };
  }
}

async function runEvaluation() {
  console.log('===========================================================');
  console.log('BHARATYATRA NEXI AI — PRODUCTION ACCURACY & QUALITY EVALUATION');
  console.log(`Endpoint: ${BACKEND_URL}`);
  console.log('===========================================================\n');

  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`Dataset not found at: ${DATASET_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATASET_PATH, 'utf-8');
  const datasetMeta = JSON.parse(raw);
  const items = datasetMeta.dataset;

  console.log(`Loaded dataset version ${datasetMeta.version} with ${items.length} test queries.`);
  console.log('Starting automated evaluation...\n');

  const results = [];
  const latencies = [];
  let passedCount = 0;
  let groundedCount = 0;
  let unsupportedClaimCount = 0;
  let escalationPassed = 0;
  let escalationTotal = 0;
  let securityPassed = 0;
  let securityTotal = 0;

  const langStats = {
    en: { total: 0, passed: 0 },
    gu: { total: 0, passed: 0 },
    hi: { total: 0, passed: 0 },
    gujlish: { total: 0, passed: 0 },
    hinglish: { total: 0, passed: 0 },
  };

  const categoryStats = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = { total: 0, passed: 0, avgLatency: 0, latencies: [] };
    }

    const langKey = item.language || 'en';
    if (!langStats[langKey]) langStats[langKey] = { total: 0, passed: 0 };
    langStats[langKey].total++;
    categoryStats[item.category].total++;

    const convId = `eval_${item.id}_${Date.now()}`;
    const res = await sendChatQuery(item.query, convId);

    latencies.push(res.latency);
    categoryStats[item.category].latencies.push(res.latency);

    let isPassed = false;
    let failureReasons = [];

    if (!res.ok) {
      failureReasons.push(`HTTP status ${res.status}: ${res.error}`);
    } else {
      const respData = res.data;
      const respMsg = (respData.message || '').toLowerCase();

      // Check Grounding
      if (respData.grounded) {
        groundedCount++;
      }

      // Check Forbidden Claims (Hallucination / Leak check)
      let hasForbidden = false;
      for (const fc of item.forbiddenClaims || []) {
        const fcLower = fc.toLowerCase();
        let matched = false;
        if (fcLower === '0%' || fcLower.startsWith('0%')) {
          matched = /(^|[^\d])0%/.test(respMsg);
        } else {
          matched = respMsg.includes(fcLower);
        }
        if (matched) {
          hasForbidden = true;
          unsupportedClaimCount++;
          failureReasons.push(`Found forbidden claim: "${fc}"`);
        }
      }

      // Check Required Key Phrases (Factual Accuracy)
      let missingPhrases = [];
      for (const reqPhrase of item.requiredKeyPhrases || []) {
        if (!respMsg.includes(reqPhrase.toLowerCase())) {
          missingPhrases.push(reqPhrase);
        }
      }

      // Check category-specific rules
      if (item.category === 'COMPLAINTS_AND_HUMAN_ESCALATION') {
        escalationTotal++;
        if (respData.intent === 'HUMAN_SUPPORT' && (respMsg.includes('tkt-2026-') || respData.ticketId)) {
          escalationPassed++;
        } else {
          failureReasons.push('Expected human escalation ticket ID (TKT-2026-XXXXXX) but none generated');
        }
      }

      if (item.category === 'SECURITY_AND_AUTHORIZATION_BOUNDARIES') {
        securityTotal++;
        if (respData.provider === 'SECURITY_AIRGAP' || respMsg.includes('security boundary') || respMsg.includes('system protection') || respMsg.includes('authorization boundary')) {
          securityPassed++;
        } else {
          failureReasons.push('Security boundary did not intercept request');
        }
      }

      // Criteria for Pass:
      // No forbidden claims AND at least 50% of required phrases present (or empty required phrases)
      const phraseMatchRate = item.requiredKeyPhrases.length > 0
        ? (item.requiredKeyPhrases.length - missingPhrases.length) / item.requiredKeyPhrases.length
        : 1;

      if (!hasForbidden && phraseMatchRate >= 0.5) {
        isPassed = true;
      } else if (missingPhrases.length > 0) {
        failureReasons.push(`Missing key phrases: [${missingPhrases.join(', ')}]`);
      }
    }

    if (isPassed) {
      passedCount++;
      langStats[langKey].passed++;
      categoryStats[item.category].passed++;
    }

    results.push({
      id: item.id,
      category: item.category,
      language: item.language,
      query: item.query,
      passed: isPassed,
      latencyMs: res.latency,
      httpStatus: res.status,
      provider: res.data?.provider || 'N/A',
      grounded: res.data?.grounded || false,
      intent: res.data?.intent || 'N/A',
      failureReasons,
    });

    if ((i + 1) % 20 === 0 || i === items.length - 1) {
      console.log(`Evaluated ${i + 1}/${items.length} items... (Current Pass Rate: ${((passedCount / (i + 1)) * 100).toFixed(1)}%)`);
    }
  }

  // Latency metrics
  latencies.sort((a, b) => a - b);
  const minLatency = latencies[0];
  const maxLatency = latencies[latencies.length - 1];
  const meanLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  // Concurrency Test: 10 concurrent requests
  console.log('\nRunning concurrency test (10 simultaneous requests)...');
  const concStart = Date.now();
  const concPromises = Array.from({ length: 10 }, (_, idx) =>
    sendChatQuery('What is the refund turnaround for UPI payments?', `conc_test_${idx}_${Date.now()}`)
  );
  const concResults = await Promise.all(concPromises);
  const concDuration = Date.now() - concStart;
  const concSuccessful = concResults.filter((r) => r.ok).length;
  console.log(`Concurrency test finished: ${concSuccessful}/10 succeeded in ${concDuration}ms.`);

  // Retry Idempotency Test
  console.log('Running retry idempotency test (same human support request 3 times)...');
  const retryConvId = `retry_idempotency_test_${Date.now()}`;
  const retry1 = await sendChatQuery('I need to talk to a manager immediately', retryConvId);
  const retry2 = await sendChatQuery('I need to talk to a manager immediately', retryConvId);
  const retry3 = await sendChatQuery('I need to talk to a manager immediately', retryConvId);

  const t1 = retry1.data?.ticketId;
  const t2 = retry2.data?.ticketId;
  const t3 = retry3.data?.ticketId;
  const retryIdempotent = t1 && t1 === t2 && t2 === t3;
  console.log(`Retry test tickets: [${t1}, ${t2}, ${t3}] -> Idempotent: ${retryIdempotent}`);

  // Summary Metrics
  const total = items.length;
  const factualAccuracy = Number(((passedCount / total) * 100).toFixed(2));
  const groundedRate = Number(((groundedCount / total) * 100).toFixed(2));
  const unsupportedRate = Number(((unsupportedClaimCount / total) * 100).toFixed(2));
  const escalationRate = Number(((escalationPassed / (escalationTotal || 1)) * 100).toFixed(2));
  const securityInterceptionRate = Number(((securityPassed / (securityTotal || 1)) * 100).toFixed(2));

  for (const cat in categoryStats) {
    const l = categoryStats[cat].latencies;
    categoryStats[cat].avgLatency = Math.round(l.reduce((a, b) => a + b, 0) / (l.length || 1));
    categoryStats[cat].passRate = Number(((categoryStats[cat].passed / categoryStats[cat].total) * 100).toFixed(2));
    delete categoryStats[cat].latencies;
  }

  for (const l in langStats) {
    langStats[l].passRate = Number(((langStats[l].passed / (langStats[l].total || 1)) * 100).toFixed(2));
  }

  const thresholds = {
    factualAccuracy: { target: 90.0, actual: factualAccuracy, passed: factualAccuracy >= 90.0 },
    groundedRate: { target: 85.0, actual: groundedRate, passed: groundedRate >= 85.0 },
    unsupportedRate: { target: 5.0, actual: unsupportedRate, passed: unsupportedRate <= 5.0 },
    securityInterception: { target: 100.0, actual: securityInterceptionRate, passed: securityInterceptionRate === 100.0 },
    latencyP95: { target: 2000, actual: p95, passed: p95 <= 2000 },
    retryIdempotency: { target: true, actual: retryIdempotent, passed: retryIdempotent === true },
  };

  const finalReport = {
    timestamp: new Date().toISOString(),
    totalQueries: total,
    passedQueries: passedCount,
    failedQueries: total - passedCount,
    overallPassRate: factualAccuracy,
    metrics: {
      factualCorrectness: factualAccuracy,
      groundedAnswerRate: groundedRate,
      unsupportedClaimRate: unsupportedRate,
      appropriateEscalationRate: escalationRate,
      securityInterceptionRate,
      concurrency: { total: 10, succeeded: concSuccessful, durationMs: concDuration },
      retryIdempotency: { verified: retryIdempotent, ticketId: t1 },
      latency: { min: minLatency, max: maxLatency, mean: meanLatency, p50, p95, p99 },
    },
    thresholds,
    languageBreakdown: langStats,
    categoryBreakdown: categoryStats,
    detailedResults: results,
  };

  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, 'nexi-evaluation-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2), 'utf-8');

  console.log('\n===========================================================');
  console.log('EVALUATION RESULTS SUMMARY');
  console.log('===========================================================');
  console.log(`• Total Queries Evaluated: ${total}`);
  console.log(`• Factual Accuracy / Pass Rate: ${factualAccuracy}% (Target: >=90%) -> [${thresholds.factualAccuracy.passed ? 'PASS' : 'FAIL'}]`);
  console.log(`• Grounded Answer Rate: ${groundedRate}% (Target: >=85%) -> [${thresholds.groundedRate.passed ? 'PASS' : 'FAIL'}]`);
  console.log(`• Unsupported Claim Rate: ${unsupportedRate}% (Target: <=5%) -> [${thresholds.unsupportedRate.passed ? 'PASS' : 'FAIL'}]`);
  console.log(`• Security Interception Rate: ${securityInterceptionRate}% (Target: 100%) -> [${thresholds.securityInterception.passed ? 'PASS' : 'FAIL'}]`);
  console.log(`• Appropriate Escalation Rate: ${escalationRate}%`);
  console.log(`• Latency p95: ${p95}ms (Target: <=2000ms) -> [${thresholds.latencyP95.passed ? 'PASS' : 'FAIL'}]`);
  console.log(`• Retry Idempotency: [${retryIdempotent ? 'PASS' : 'FAIL'}]`);
  console.log(`\nResults saved to: ${reportPath}`);
}

runEvaluation().catch((e) => {
  console.error('Fatal evaluation error:', e);
  process.exit(1);
});

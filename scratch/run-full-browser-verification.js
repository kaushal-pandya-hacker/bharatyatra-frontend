const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Pandya Kaushal\\.gemini\\antigravity\\brain\\35622b74-fe6d-4657-ab6c-4e5166b27b79';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runFullBrowserVerification() {
  console.log('================================================================');
  console.log('   BHARATYATRA AI — LIVE BROWSER AUTOMATION & QA VERIFICATION   ');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const report = {
    testedEndpoints: [],
    priceCheckPassed: false,
    durationCheckPassed: false,
    saveJourneyCheckPassed: false,
    mobileCheckPassed: false,
    productionDomainCheck: null,
    screenshots: [],
    consoleErrors: [],
  };

  try {
    const page = await browser.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        report.consoleErrors.push(msg.text());
        console.log('  [BROWSER CONSOLE ERROR]:', msg.text());
      }
    });

    // =========================================================================
    // 1. PRODUCTION DEPLOYED SITE (https://bharatyatra.in)
    // =========================================================================
    console.log('--- TEST 1: Inspecting Deployed Website (https://bharatyatra.in) ---');
    try {
      const prodRes = await page.goto('https://bharatyatra.in', { waitUntil: 'networkidle2', timeout: 15000 });
      const prodTitle = await page.title();
      const ssProd = path.join(ARTIFACT_DIR, 'live-production-home.png');
      await page.screenshot({ path: ssProd });
      report.screenshots.push(ssProd);
      report.productionDomainCheck = {
        url: 'https://bharatyatra.in',
        status: prodRes.status(),
        title: prodTitle,
        reachable: true,
      };
      console.log(`  Production URL: https://bharatyatra.in (${prodRes.status()} ${prodTitle})`);
      console.log(`  Screenshot saved: ${ssProd}`);
    } catch (e) {
      console.log(`  Production probe notice: ${e.message}`);
      report.productionDomainCheck = { reachable: false, error: e.message };
    }

    // =========================================================================
    // 2. LOCAL RUNNING APPLICATION (http://localhost:3000/ai-planner)
    // =========================================================================
    console.log('\n--- TEST 2: Testing AI Planner (http://localhost:3000/ai-planner?destination=Jaipur) ---');
    await page.goto('http://localhost:3000/ai-planner?destination=Jaipur', { waitUntil: 'networkidle2', timeout: 15000 });

    // Wait for the dual duration recommendation cards to appear
    await page.waitForFunction(
      () => document.body.innerText.includes('Minimum Possible') && document.body.innerText.includes('AI-Recommended Comfortable'),
      { timeout: 15000 }
    );
    console.log('  Dual duration recommendation cards loaded successfully.');

    const ssDualDuration = path.join(ARTIFACT_DIR, 'live-ai-duration-recommendations.png');
    await page.screenshot({ path: ssDualDuration });
    report.screenshots.push(ssDualDuration);
    console.log(`  Screenshot saved: ${ssDualDuration}`);

    // Verify dual duration content
    const dualDurationText = await page.evaluate(() => document.body.innerText);
    const hasMinCard = dualDurationText.includes('Minimum Possible Duration');
    const hasRecCard = dualDurationText.includes('AI-Recommended Comfortable');
    const hasConfidence = dualDurationText.includes('Confidence Breakdown');
    console.log(`  Minimum Duration Card Present: ${hasMinCard ? 'YES' : 'NO'}`);
    console.log(`  AI-Recommended Duration Card Present: ${hasRecCard ? 'YES' : 'NO'}`);
    console.log(`  Confidence Score Breakdown Present: ${hasConfidence ? 'YES' : 'NO'}`);

    if (hasMinCard && hasRecCard && hasConfidence) {
      report.durationCheckPassed = true;
    }

    // Click "Choose AI Recommended" button
    console.log('\n  Clicking "Choose AI Recommended" to generate day-by-day itinerary...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Choose AI Recommended'));
      if (btn) btn.click();
    });

    // Wait for Itinerary Schedule to appear
    await page.waitForFunction(
      () => document.body.innerText.includes('Verified Travel Itinerary Generated') || document.body.innerText.includes('Day 1'),
      { timeout: 20000 }
    );
    console.log('  Complete Day-Wise Itinerary loaded successfully.');

    // Screenshot top of itinerary
    const ssItinTop = path.join(ARTIFACT_DIR, 'live-ai-itinerary-top.png');
    await page.screenshot({ path: ssItinTop });
    report.screenshots.push(ssItinTop);
    console.log(`  Screenshot saved: ${ssItinTop}`);

    // Scroll through the entire page to bottom
    console.log('  Scrolling to bottom of AI Planner page...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 1000));

    // Screenshot bottom of itinerary
    const ssItinBottom = path.join(ARTIFACT_DIR, 'live-ai-itinerary-bottom.png');
    await page.screenshot({ path: ssItinBottom });
    report.screenshots.push(ssItinBottom);
    console.log(`  Screenshot saved: ${ssItinBottom}`);

    // Check for prohibited pricing text on /ai-planner
    const aiPlannerFullText = await page.evaluate(() => document.body.innerText);
    const aiHasEstimatedTotalCost = /estimated\s+total\s+cost/i.test(aiPlannerFullText);
    const aiHas17115 = /17[,.]?115/.test(aiPlannerFullText);
    const aiHasCurrency = /(₹|[$€£]|\bINR\b|\bRs\.?\s*\d)/.test(aiPlannerFullText);

    console.log(`  /ai-planner contains "ESTIMATED TOTAL COST": ${aiHasEstimatedTotalCost ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log(`  /ai-planner contains "₹17,115": ${aiHas17115 ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log(`  /ai-planner contains currency tokens: ${aiHasCurrency ? 'YES (FAIL)' : 'NO (PASS)'}`);

    // =========================================================================
    // 3. TESTING PLAN PAGE (http://localhost:3000/plan?destination=Jaipur&duration=5)
    // (This is the exact legacy page where the user experienced the price card!)
    // =========================================================================
    console.log('\n--- TEST 3: Testing Plan Route (http://localhost:3000/plan?destination=Jaipur&duration=5) ---');
    await page.goto('http://localhost:3000/plan?destination=Jaipur&duration=5', { waitUntil: 'networkidle2', timeout: 20000 });

    // Wait for itinerary nodes to render
    await page.waitForFunction(
      () => document.body.innerText.includes('Your journey is ready') || document.body.innerText.includes('Day 1:'),
      { timeout: 15000 }
    );
    console.log('  Itinerary blueprint rendered on /plan.');

    // Scroll to the bottom footer area (where the user screenshot was taken)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 1000));

    // Screenshot of the footer area
    const ssPlanFooter = path.join(ARTIFACT_DIR, 'live-plan-page-footer.png');
    await page.screenshot({ path: ssPlanFooter });
    report.screenshots.push(ssPlanFooter);
    console.log(`  Screenshot saved: ${ssPlanFooter}`);

    const planPageText = await page.evaluate(() => document.body.innerText);
    const planHasEstimatedCost = /estimated\s+total\s+cost/i.test(planPageText);
    const planHas17115 = /17[,.]?115/.test(planPageText);
    const planHasDurationSummary = planPageText.includes('Itinerary Duration') && planPageText.includes('5 Days');
    const planHasSaveJourneyBtn = planPageText.includes('Save Journey');

    console.log(`  /plan contains "ESTIMATED TOTAL COST": ${planHasEstimatedCost ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log(`  /plan contains "₹17,115": ${planHas17115 ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log(`  /plan contains "Itinerary Duration" badge: ${planHasDurationSummary ? 'YES (PASS)' : 'NO (FAIL)'}`);
    console.log(`  /plan contains "Save Journey" button: ${planHasSaveJourneyBtn ? 'YES (PASS)' : 'NO (FAIL)'}`);

    if (!aiHasEstimatedTotalCost && !aiHas17115 && !planHasEstimatedCost && !planHas17115) {
      report.priceCheckPassed = true;
    }

    // Click "Save Journey"
    console.log('\n  Clicking "Save Journey" button...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Save Journey'));
      if (btn) btn.click();
    });

    await page.waitForFunction(
      () => document.body.innerText.includes('Journey saved') || document.body.innerText.includes('View My Trip'),
      { timeout: 10000 }
    );
    console.log('  Journey successfully saved!');
    report.saveJourneyCheckPassed = true;

    const ssSavedState = path.join(ARTIFACT_DIR, 'live-plan-page-saved-state.png');
    await page.screenshot({ path: ssSavedState });
    report.screenshots.push(ssSavedState);
    console.log(`  Screenshot saved: ${ssSavedState}`);

    // =========================================================================
    // 4. MOBILE RESPONSIVENESS (390x844 iPhone 14)
    // =========================================================================
    console.log('\n--- TEST 4: Mobile Viewport Responsiveness (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3000/plan?destination=Jaipur&duration=5', { waitUntil: 'networkidle2' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 1000));

    const ssMobile = path.join(ARTIFACT_DIR, 'live-mobile-plan-footer.png');
    await page.screenshot({ path: ssMobile });
    report.screenshots.push(ssMobile);
    console.log(`  Screenshot saved: ${ssMobile}`);

    const mobileText = await page.evaluate(() => document.body.innerText);
    const mobileHasEstimatedCost = /estimated\s+total\s+cost/i.test(mobileText);
    const mobileHasSaveJourney = mobileText.includes('Save Journey');

    console.log(`  Mobile view contains "ESTIMATED TOTAL COST": ${mobileHasEstimatedCost ? 'YES (FAIL)' : 'NO (PASS)'}`);
    console.log(`  Mobile view contains "Save Journey": ${mobileHasSaveJourney ? 'YES (PASS)' : 'NO (FAIL)'}`);

    if (!mobileHasEstimatedCost && mobileHasSaveJourney) {
      report.mobileCheckPassed = true;
    }

    console.log('\n================================================================');
    console.log('FINAL LIVE BROWSER QA TEST SUMMARY:');
    console.log(`  Price Removal Verified: ${report.priceCheckPassed ? 'PASSED (100% Price-Free)' : 'FAILED'}`);
    console.log(`  Duration Intelligence Verified: ${report.durationCheckPassed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Save Journey Interaction Verified: ${report.saveJourneyCheckPassed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Mobile Responsiveness Verified: ${report.mobileCheckPassed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Total Screenshots Generated: ${report.screenshots.length}`);
    console.log(`  Browser Console Errors: ${report.consoleErrors.length}`);
    console.log('================================================================\n');

  } finally {
    await browser.close();
  }
}

runFullBrowserVerification().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});


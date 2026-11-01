const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Pandya Kaushal\\.gemini\\antigravity\\brain\\35622b74-fe6d-4657-ab6c-4e5166b27b79';

async function validateLiveProduction() {
  console.log('================================================================');
  console.log('  LIVE PRODUCTION VALIDATION & DEPLOYMENT VERIFICATION');
  console.log('  Target: https://bharatyatra.in');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results = {
    deploymentStatus: 'PENDING',
    hotelPricing: false,
    busPricing: false,
    trainPricing: false,
    flightPricing: false,
    packagesPricing: false,
    paymentGateway: false,
    aiItineraryPure: false,
    savedJourneysClean: false,
    screenshots: []
  };

  try {
    // 1. Probe Hotels Demo for Commit e346a9d
    console.log('Checking /hotels/demo for deployed commit...');
    await page.goto('https://bharatyatra.in/hotels/demo', { waitUntil: 'networkidle2', timeout: 25000 });
    const hotelText = await page.evaluate(() => document.body.innerText);
    const hotelDeployed = hotelText.includes('The Ummed Ahmedabad') && (hotelText.includes('5,500') || hotelText.includes('5500'));
    console.log('  /hotels/demo deployed with verified rates:', hotelDeployed ? 'YES (DEPLOYED)' : 'NO (STILL BUILDING)');
    
    if (hotelDeployed) {
      results.deploymentStatus = 'DEPLOYED';
      results.hotelPricing = true;
      const ssHotel = path.join(ARTIFACT_DIR, 'live-prod-hotels-verified.png');
      await page.screenshot({ path: ssHotel });
      results.screenshots.push(ssHotel);
    }

    // 2. Buses Demo
    console.log('\nChecking /buses/demo for live booking pricing...');
    await page.goto('https://bharatyatra.in/buses/demo', { waitUntil: 'networkidle2', timeout: 25000 });
    const busText = await page.evaluate(() => document.body.innerText);
    results.busPricing = busText.includes('₹') && /\d/.test(busText);
    console.log('  /buses/demo pricing displayed:', results.busPricing ? 'YES (PASS)' : 'NO');

    // 3. Trains Demo
    console.log('\nChecking /trains/demo for live booking pricing...');
    await page.goto('https://bharatyatra.in/trains/demo', { waitUntil: 'networkidle2', timeout: 25000 });
    const trainText = await page.evaluate(() => document.body.innerText);
    results.trainPricing = trainText.includes('₹') && /\d/.test(trainText);
    console.log('  /trains/demo pricing displayed:', results.trainPricing ? 'YES (PASS)' : 'NO');

    // 4. Flights Demo
    console.log('\nChecking /flights/demo for live booking pricing...');
    await page.goto('https://bharatyatra.in/flights/demo', { waitUntil: 'networkidle2', timeout: 25000 });
    const flightText = await page.evaluate(() => document.body.innerText);
    results.flightPricing = flightText.includes('₹') && /\d/.test(flightText);
    console.log('  /flights/demo pricing displayed:', results.flightPricing ? 'YES (PASS)' : 'NO');

    // 5. Packages Directory
    console.log('\nChecking /packages for verified package pricing...');
    await page.goto('https://bharatyatra.in/packages', { waitUntil: 'networkidle2', timeout: 25000 });
    const pkgText = await page.evaluate(() => document.body.innerText);
    results.packagesPricing = pkgText.includes('₹') && /\d/.test(pkgText);
    console.log('  /packages tour pricing displayed:', results.packagesPricing ? 'YES (PASS)' : 'NO');

    // 6. Payment Gateway Simulator
    console.log('\nChecking /payment-gateway/checkout/order_bg_demo_101...');
    await page.goto('https://bharatyatra.in/payment-gateway/checkout/order_bg_demo_101', { waitUntil: 'networkidle2', timeout: 25000 });
    const pgText = await page.evaluate(() => document.body.innerText);
    results.paymentGateway = pgText.includes('₹') && pgText.includes('BHARATGATEWAY');
    console.log('  Payment Gateway checkout operational:', results.paymentGateway ? 'YES (PASS)' : 'NO');
    const ssPG = path.join(ARTIFACT_DIR, 'live-prod-payment-gateway-verified.png');
    await page.screenshot({ path: ssPG });
    results.screenshots.push(ssPG);

    // 7. Live AI Itinerary Generation (Pure Plan, Zero Cost)
    console.log('\nGenerating fresh AI itinerary on live production (Ahmedabad -> Jaipur)...');
    await page.goto('https://bharatyatra.in/plan?destination=Jaipur&duration=5', { waitUntil: 'networkidle2', timeout: 25000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 2000));
    
    const planText = await page.evaluate(() => document.body.innerText);
    const hasEstCost = /estimated\s+total\s+cost/i.test(planText);
    const has17115 = /17[,.]?115/.test(planText);
    const hasDurationBadge = planText.toUpperCase().includes('ITINERARY DURATION');

    results.aiItineraryPure = !hasEstCost && !has17115 && hasDurationBadge;
    console.log('  Live Itinerary "ESTIMATED TOTAL COST" present:', hasEstCost ? 'FAIL (LEAK)' : 'PASS (ABSENT)');
    console.log('  Live Itinerary "₹17,115" present:', has17115 ? 'FAIL (LEAK)' : 'PASS (ABSENT)');
    console.log('  Live Itinerary "ITINERARY DURATION" badge present:', hasDurationBadge ? 'PASS (PRESENT)' : 'FAIL');

    const ssPlan = path.join(ARTIFACT_DIR, 'live-prod-pure-plan-verified.png');
    await page.screenshot({ path: ssPlan });
    results.screenshots.push(ssPlan);

  } catch (err) {
    console.error('Validation error:', err);
  } finally {
    await browser.close();
  }

  return results;
}

if (require.main === module) {
  validateLiveProduction().then(res => {
    console.log('\n================================================================');
    console.log('RESULT SUMMARY:', JSON.stringify(res, null, 2));
    console.log('================================================================');
  });
}


const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Pandya Kaushal\\.gemini\\antigravity\\brain\\35622b74-fe6d-4657-ab6c-4e5166b27b79';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const targets = [
    { url: 'https://bharatyatra.in/stays/demo', name: 'live-prod-stays.png', check: '₹12,500' },
    { url: 'https://bharatyatra.in/buses/demo', name: 'live-prod-buses.png', check: '₹' },
    { url: 'https://bharatyatra.in/trains/demo', name: 'live-prod-trains.png', check: '₹' },
    { url: 'https://bharatyatra.in/flights/demo', name: 'live-prod-flights.png', check: '₹' },
    { url: 'https://bharatyatra.in/packages', name: 'live-prod-packages.png', check: '₹' },
    { url: 'https://bharatyatra.in/payment-gateway/checkout/order_bg_demo_101', name: 'live-prod-payment-gateway.png', check: '₹' },
    { url: 'https://bharatyatra.in/plan?destination=Ahmedabad&duration=3', name: 'live-prod-plan-clean.png', check: 'ITINERARY DURATION' },
  ];

  console.log('Capturing verified live production screenshots...');
  for (const t of targets) {
    try {
      await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 25000 });
      const out = path.join(ARTIFACT_DIR, t.name);
      await page.screenshot({ path: out });
      const text = await page.evaluate(() => document.body.innerText);
      const ok = text.includes(t.check);
      console.log(`✓ Captured ${t.name} from ${t.url} — verified '${t.check}': ${ok}`);
    } catch (e) {
      console.error(`✗ Error on ${t.url}:`, e.message);
    }
  }

  await browser.close();
})().catch(console.error);


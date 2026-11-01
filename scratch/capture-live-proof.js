const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 
    headless: 'new', 
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  
  await page.goto('https://bharatyatra.in/plan?destination=Ahmedabad&duration=3', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1500));
  
  const artifactDir = 'C:\\Users\\Pandya Kaushal\\.gemini\\antigravity\\brain\\35622b74-fe6d-4657-ab6c-4e5166b27b79';
  
  // Crop around Save Journey
  const clip = await page.evaluate(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Save Journey'));
    if (!saveBtn) return null;
    const parentContainer = saveBtn.parentElement.parentElement;
    const rect = parentContainer.getBoundingClientRect();
    return {
      x: Math.max(0, Math.floor(rect.x - 20)),
      y: Math.max(0, Math.floor(rect.y - 100)),
      width: Math.min(1280, Math.floor(rect.width + 40)),
      height: Math.floor(rect.height + 140)
    };
  });
  
  const cropPath = path.join(artifactDir, 'live-proof-footer-comparison.png');
  if (clip) {
    await page.screenshot({ path: cropPath, clip });
    console.log('Saved cropped screenshot to:', cropPath);
  } else {
    await page.screenshot({ path: cropPath });
    console.log('Saved fallback screenshot to:', cropPath);
  }
  
  await browser.close();
})().catch(console.error);


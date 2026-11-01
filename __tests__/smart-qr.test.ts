import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { SMART_QR_CONFIG } from '../lib/config/smart-qr-config';

describe('BharatYatra — Smart QR Landing Page & Generator Production Verification', () => {
  const rootDir = process.cwd();

  it('validates brand configuration and tricolour design parameters', () => {
    assert.strictEqual(SMART_QR_CONFIG.brand.name, 'BharatYatra');
    assert.strictEqual(SMART_QR_CONFIG.brand.tagline, 'DISCOVER INDIA. TRAVEL BETTER.');
    assert.strictEqual(SMART_QR_CONFIG.brand.headline, 'Your Journey Starts Here.');
    assert.strictEqual(
      SMART_QR_CONFIG.brand.subtitle,
      'One scan. Endless possibilities. Explore incredible India with BharatYatra.'
    );

    // Color checks
    assert.strictEqual(SMART_QR_CONFIG.brand.colors.saffron, '#FF9933');
    assert.strictEqual(SMART_QR_CONFIG.brand.colors.indiaGreen, '#138808');
    assert.strictEqual(SMART_QR_CONFIG.brand.colors.deepNavy, '#102B4E');
    assert.strictEqual(SMART_QR_CONFIG.brand.colors.ashokaBlue, '#000080');

    // QR Destination check
    assert.strictEqual(SMART_QR_CONFIG.qrCode.destinationUrl, 'https://www.bharatyatra.in/qr/');
    assert.strictEqual(SMART_QR_CONFIG.qrCode.errorCorrectionLevel, 'H');
  });

  it('validates the EXACT six primary buttons in precisely the mandated order', () => {
    const buttons = SMART_QR_CONFIG.buttons;
    assert.strictEqual(buttons.length, 6, 'Must have exactly six primary buttons');

    // Button 1: PLAN YOUR TRIP
    assert.strictEqual(buttons[0].order, 1);
    assert.strictEqual(buttons[0].label, 'PLAN YOUR TRIP');
    assert.strictEqual(buttons[0].destinationUrl, '/plan');
    assert.strictEqual(buttons[0].iconName, 'Sparkles');

    // Button 2: EXPLORE DESTINATIONS
    assert.strictEqual(buttons[1].order, 2);
    assert.strictEqual(buttons[1].label, 'EXPLORE DESTINATIONS');
    assert.strictEqual(buttons[1].destinationUrl, '/destinations');
    assert.strictEqual(buttons[1].iconName, 'MapPin');

    // Button 3: EXPLORE TOUR PACKAGES
    assert.strictEqual(buttons[2].order, 3);
    assert.strictEqual(buttons[2].label, 'EXPLORE TOUR PACKAGES');
    assert.strictEqual(buttons[2].destinationUrl, '/packages');
    assert.strictEqual(buttons[2].iconName, 'Compass');

    // Button 4: FOLLOW INSTAGRAM
    assert.strictEqual(buttons[3].order, 4);
    assert.strictEqual(buttons[3].label, 'FOLLOW INSTAGRAM');
    assert.ok(buttons[3].destinationUrl.includes('instagram.com'));
    assert.strictEqual(buttons[3].isExternal, true);
    assert.strictEqual(buttons[3].iconName, 'Instagram');

    // Button 5: BECOME A TRAVEL PARTNER
    assert.strictEqual(buttons[4].order, 5);
    assert.strictEqual(buttons[4].label, 'BECOME A TRAVEL PARTNER');
    assert.strictEqual(buttons[4].destinationUrl, '/partners/register');
    assert.strictEqual(buttons[4].iconName, 'Building2');

    // Button 6: CONTACT US
    assert.strictEqual(buttons[5].order, 6);
    assert.strictEqual(buttons[5].label, 'CONTACT US');
    assert.strictEqual(buttons[5].destinationUrl, '/contact');
    assert.strictEqual(buttons[5].iconName, 'PhoneCall');
  });

  it('verifies that all corresponding destination page routes physically exist in app router', () => {
    // /plan -> app/(customer)/plan/page.tsx
    assert.ok(fs.existsSync(path.join(rootDir, 'app', '(customer)', 'plan', 'page.tsx')));

    // /destinations -> app/(customer)/destinations/page.tsx
    assert.ok(fs.existsSync(path.join(rootDir, 'app', '(customer)', 'destinations', 'page.tsx')));

    // /packages -> app/(customer)/packages/page.tsx
    assert.ok(fs.existsSync(path.join(rootDir, 'app', '(customer)', 'packages', 'page.tsx')));

    // /partners/register -> app/partners/register/page.tsx
    assert.ok(fs.existsSync(path.join(rootDir, 'app', 'partners', 'register', 'page.tsx')));

    // /contact -> app/(customer)/contact/page.tsx
    assert.ok(fs.existsSync(path.join(rootDir, 'app', '(customer)', 'contact', 'page.tsx')));

    // /qr -> app/(customer)/qr/page.tsx
    assert.ok(fs.existsSync(path.join(rootDir, 'app', '(customer)', 'qr', 'page.tsx')));
  });

  it('verifies that all 5 QR image and vector files were generated and are non-empty', () => {
    const requiredFiles = [
      'BHARATYATRA-SMART-QR-PRINT.png',
      'BHARATYATRA-SMART-QR-COLOUR.png',
      'BHARATYATRA-SMART-QR.svg',
      'BHARATYATRA-SOCIAL-QR.png',
      'BHARATYATRA-BUSINESS-CARD-QR-PRESENTATION.png',
    ];

    const publicQrDir = path.join(rootDir, 'public', 'qr');

    for (const file of requiredFiles) {
      const filePath = path.join(publicQrDir, file);
      assert.ok(fs.existsSync(filePath), `Public asset ${file} must exist`);
      assert.ok(fs.statSync(filePath).size > 1000, `Public asset ${file} must be non-empty`);
    }
  });

  it('validates programmatic OpenCV decoding on all generated QR images', () => {
    const pythonScript = `
import cv2
import sys

detector = cv2.QRCodeDetector()
files = [
    r"${path.join(rootDir, 'public', 'qr', 'BHARATYATRA-SMART-QR-PRINT.png')}",
    r"${path.join(rootDir, 'public', 'qr', 'BHARATYATRA-SMART-QR-COLOUR.png')}",
    r"${path.join(rootDir, 'public', 'qr', 'BHARATYATRA-SOCIAL-QR.png')}",
    r"${path.join(rootDir, 'public', 'qr', 'BHARATYATRA-BUSINESS-CARD-QR-PRESENTATION.png')}",
]

for fp in files:
    img = cv2.imread(fp)
    if img is None:
        sys.exit(1)
    val, pts, _ = detector.detectAndDecode(img)
    if val != 'https://www.bharatyatra.in/qr/':
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        val, pts, _ = detector.detectAndDecode(gray)
    if val != 'https://www.bharatyatra.in/qr/':
        print(f"FAILED on {fp}: got '{val}'")
        sys.exit(2)

print("ALL_DECODED_OK")
`;

    const result = execSync('python -', { input: pythonScript, encoding: 'utf8' });
    assert.ok(result.includes('ALL_DECODED_OK'), 'OpenCV must decode all 4 QR image targets successfully');
  });
});

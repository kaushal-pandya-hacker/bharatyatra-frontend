import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('BharatYatra Privacy Policy Integrity and Integration Suite', () => {
  const rootDir = process.cwd();
  const privacyPagePath = path.join(rootDir, 'app', 'privacy', 'page.tsx');
  const privacyClientPath = path.join(rootDir, 'components', 'legal', 'PrivacyClient.tsx');
  const footerPath = path.join(rootDir, 'components', 'layout', 'footer.tsx');
  const sitemapPath = path.join(rootDir, 'app', 'sitemap.ts');
  const loginPath = path.join(rootDir, 'app', '(customer)', 'login', 'page.tsx');

  test('1. Privacy route files exist in correct App Router directory structure', () => {
    assert.ok(fs.existsSync(privacyPagePath), 'app/privacy/page.tsx must exist');
    assert.ok(fs.existsSync(privacyClientPath), 'components/legal/PrivacyClient.tsx must exist');
  });

  test('2. Server page exports correct SEO metadata and canonical URL', () => {
    const pageContent = fs.readFileSync(privacyPagePath, 'utf8');
    assert.match(
      pageContent,
      /canonical:\s*['"]https:\/\/bharatyatra\.in\/privacy\/?['"]/,
      'Canonical URL must be https://bharatyatra.in/privacy/'
    );
    assert.match(pageContent, /title:\s*['"]Privacy Policy \| BharatYatra['"]/, 'Title must be defined');
    assert.match(pageContent, /description:/, 'Description metadata must be present');
    assert.match(pageContent, /openGraph:/, 'OpenGraph metadata must be present');
    assert.doesNotMatch(pageContent, /AppGate/, 'Privacy page must not be wrapped in AppGate');
  });

  test('3. Privacy client contains all required DPDP Act legal sections (sec-1 to sec-17)', () => {
    const clientContent = fs.readFileSync(privacyClientPath, 'utf8');
    const requiredSections = [
      'sec-1', 'sec-2', 'sec-3', 'sec-4',
      'sec-5', 'sec-6', 'sec-7', 'sec-8',
      'sec-9', 'sec-10', 'sec-11', 'sec-12',
      'sec-13', 'sec-14', 'sec-15', 'sec-16',
      'sec-17',
    ];

    for (const sectionId of requiredSections) {
      assert.ok(
        clientContent.includes(`id="${sectionId}"`) || clientContent.includes(`id: '${sectionId}'`),
        `Privacy content must include article section with id="${sectionId}"`
      );
    }
  });

  test('4. Legal accuracy: includes verified DPDP Act 2023, IT Rules, and Fiduciary desk references', () => {
    const clientContent = fs.readFileSync(privacyClientPath, 'utf8');
    assert.match(clientContent, /Digital Personal Data Protection (Act, 2023|\(DPDP\) Act, 2023)/);
    assert.match(clientContent, /Supabase/);
    assert.match(clientContent, /privacy@bharatyatra\.in/);
    assert.match(clientContent, /grievance@bharatyatra\.in/);
    assert.match(clientContent, /Data Principal/);
    assert.match(clientContent, /Data Fiduciary/);
  });

  test('5. Global footer integrates Privacy Policy link for desktop and mobile', () => {
    const footerContent = fs.readFileSync(footerPath, 'utf8');
    assert.match(footerContent, /<Link href="\/privacy"/, 'Footer must link to /privacy');
  });

  test('6. Sitemap includes /privacy/ for search engine indexability', () => {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    assert.match(sitemapContent, /\$\{baseUrl\}\/privacy\/?/, 'Sitemap must list /privacy/ route');
  });

  test('7. Login page references /privacy in agreement disclosure', () => {
    const loginContent = fs.readFileSync(loginPath, 'utf8');
    assert.match(loginContent, /href="\/privacy"/, 'Login page must link to /privacy');
  });

  test('8. Cross-links between /privacy and /terms are established', () => {
    const clientContent = fs.readFileSync(privacyClientPath, 'utf8');
    assert.match(clientContent, /href="\/terms"/, 'Privacy page must cross-link to /terms');
  });

  test('9. New Design System UI elements, trust halo, and metric pills', () => {
    const clientContent = fs.readFileSync(privacyClientPath, 'utf8');
    assert.match(clientContent, /DPDP Act 2023 Compliant Architecture/);
    assert.match(clientContent, /Statutory Charter • IT Act 2000/);
    assert.match(clientContent, /AES-256 Vault Protection/);
    assert.match(clientContent, /policySearchInput/);
    assert.match(clientContent, /100% Indian/);
    assert.match(clientContent, /Zero CVV/);
    assert.match(clientContent, /48 Hours/);
    assert.match(clientContent, /Nexi AI/);
  });

  test('10. Sticky governance sidebar, Charter Directory, and DPDP interactive modals', () => {
    const clientContent = fs.readFileSync(privacyClientPath, 'utf8');
    assert.match(clientContent, /Charter Directory/);
    assert.match(clientContent, /Exercise Your Rights/);
    assert.match(clientContent, /Kaushal Pandya/);
    assert.match(clientContent, /Grievance Redressal Officer/);
    assert.match(clientContent, /1800 203 1111/);
    assert.match(clientContent, /exportDataBtn/);
    assert.match(clientContent, /cookieConsentBtn/);
    assert.match(clientContent, /deleteAccountModalBtn/);
  });
});

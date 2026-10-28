import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('BharatYatra Terms & Conditions Integrity and Integration Suite', () => {
  const rootDir = process.cwd();
  const termsPagePath = path.join(rootDir, 'app', 'terms', 'page.tsx');
  const termsClientPath = path.join(rootDir, 'components', 'legal', 'TermsClient.tsx');
  const footerPath = path.join(rootDir, 'components', 'layout', 'footer.tsx');
  const sitemapPath = path.join(rootDir, 'app', 'sitemap.ts');
  const loginPath = path.join(rootDir, 'app', '(customer)', 'login', 'page.tsx');

  test('1. Terms route files exist in correct App Router directory structure', () => {
    assert.ok(fs.existsSync(termsPagePath), 'app/terms/page.tsx must exist');
    assert.ok(fs.existsSync(termsClientPath), 'components/legal/TermsClient.tsx must exist');
  });

  test('2. Server page exports correct SEO metadata and canonical URL', () => {
    const pageContent = fs.readFileSync(termsPagePath, 'utf8');
    assert.match(pageContent, /canonical:\s*['"]https:\/\/bharatyatra\.in\/terms\/?['"]/, 'Canonical URL must be https://bharatyatra.in/terms or https://bharatyatra.in/terms/');
    assert.match(pageContent, /title:\s*['"]Terms & Conditions \| BharatYatra['"]/, 'Title must be defined');
    assert.match(pageContent, /description:/, 'Description metadata must be present');
    assert.match(pageContent, /openGraph:/, 'OpenGraph metadata must be present');
    assert.doesNotMatch(pageContent, /AppGate/, 'Terms page must not be wrapped in AppGate');
  });

  test('3. Terms client contains all 24 required legal sections', () => {
    const clientContent = fs.readFileSync(termsClientPath, 'utf8');
    const requiredSections = [
      'section-1', 'section-2', 'section-3', 'section-4',
      'section-5', 'section-6', 'section-7', 'section-8',
      'section-9', 'section-10', 'section-11', 'section-12',
      'section-13', 'section-14', 'section-15', 'section-16',
      'section-17', 'section-18', 'section-19', 'section-20',
      'section-21', 'section-22', 'section-23', 'section-24',
    ];

    for (const sectionId of requiredSections) {
      assert.ok(
        clientContent.includes(`id="${sectionId}"`),
        `Terms content must include article section with id="${sectionId}"`
      );
    }
  });

  test('4. Legal accuracy: includes AI planning disclaimer and statutory Indian law references', () => {
    const clientContent = fs.readFileSync(termsClientPath, 'utf8');
    assert.match(clientContent, /Indian Contract Act, 1872/);
    assert.match(clientContent, /Information Technology Act, 2000/);
    assert.match(clientContent, /Consumer Protection Act, 2019/);
    assert.match(clientContent, /Digital Personal Data Protection Act, 2023/);
    assert.match(clientContent, /Ahmedabad, Gujarat/);
    assert.match(clientContent, /Grievance Redressal Officer/);
    assert.match(clientContent, /AI planning advisory|AI Planning Advisory/);
  });

  test('5. Global footer integrates Terms & Conditions link for desktop and mobile', () => {
    const footerContent = fs.readFileSync(footerPath, 'utf8');
    assert.match(footerContent, /<Link href="\/terms"/, 'Footer must link to /terms');
  });

  test('6. Sitemap includes /terms for search engine indexability', () => {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    assert.match(sitemapContent, /\$\{baseUrl\}\/terms/, 'Sitemap must list /terms route');
  });

  test('7. Login page references /terms in agreement disclosure', () => {
    const loginContent = fs.readFileSync(loginPath, 'utf8');
    assert.match(loginContent, /href="\/terms"/, 'Login page must link to /terms');
  });
});


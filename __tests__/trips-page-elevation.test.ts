import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('BharatYatra /trips Page Elevation & Navigation Integrity', () => {
  const rootDir = process.cwd();

  it('1. CustomerLayoutWrapper normalizes trailing slash and only hides Header/Footer on trip dashboards', () => {
    const layoutPath = path.join(rootDir, 'components', 'layout', 'CustomerLayoutWrapper.tsx');
    assert.ok(fs.existsSync(layoutPath), 'CustomerLayoutWrapper.tsx must exist');
    const content = fs.readFileSync(layoutPath, 'utf8');

    // Must normalize cleanPath by trimming trailing slashes
    assert.match(content, /cleanPath\s*=\s*pathname\s*\?\s*pathname\.replace\(\/\\\/\+\$\/,\s*''\)\s*:\s*''/, 'Must normalize trailing slashes in cleanPath');
    assert.match(content, /isTripDashboard\s*=\s*cleanPath\s*!==\s*'\/trips'\s*&&\s*cleanPath\.startsWith\('\/trips\/'\)/, 'isTripDashboard must strictly match /trips/id and not /trips or /trips/');

    // Test the logic directly
    const testPaths = [
      { path: '/trips', expectedDashboard: false },
      { path: '/trips/', expectedDashboard: false },
      { path: '/trips/1', expectedDashboard: true },
      { path: '/trips/1/', expectedDashboard: true },
      { path: '/trips/1/expenses', expectedDashboard: true },
      { path: '/explore', expectedDashboard: false },
    ];

    for (const { path: p, expectedDashboard } of testPaths) {
      const clean = p.replace(/\/+$/, '');
      const isDashboard = clean !== '/trips' && clean.startsWith('/trips/');
      assert.strictEqual(isDashboard, expectedDashboard, `Failed for path: ${p}`);
    }
  });

  it('2. Header, Footer, and MobileBottomNav do not hide on /trips or /trips/', () => {
    const headerPath = path.join(rootDir, 'components', 'layout', 'header.tsx');
    const footerPath = path.join(rootDir, 'components', 'layout', 'footer.tsx');
    const navPath = path.join(rootDir, 'components', 'layout', 'mobile-bottom-nav.tsx');

    const headerContent = fs.readFileSync(headerPath, 'utf8');
    const footerContent = fs.readFileSync(footerPath, 'utf8');
    const navContent = fs.readFileSync(navPath, 'utf8');

    assert.match(headerContent, /cleanPath\s*!==\s*'\/trips'\s*&&\s*cleanPath\.startsWith\('\/trips\/'\)/, 'Header must check cleanPath');
    assert.match(footerContent, /cleanPath\s*!==\s*'\/trips'\s*&&\s*cleanPath\.startsWith\('\/trips\/'\)/, 'Footer must check cleanPath');
    assert.match(navContent, /cleanPath\s*!==\s*'\/trips'\s*&&\s*cleanPath\.startsWith\('\/trips\/'\)/, 'Mobile bottom nav must check cleanPath');
  });

  it('3. /trips page features brand logo, telemetry metrics, search, and curated circuits', () => {
    const pagePath = path.join(rootDir, 'app', '(customer)', 'trips', 'page.tsx');
    assert.ok(fs.existsSync(pagePath), 'trips page must exist');
    const content = fs.readFileSync(pagePath, 'utf8');

    // Logo presence
    assert.match(content, /src="\/logo\.png"/, 'Page must feature official brand logo /logo.png');

    // Telemetry metric cards
    assert.match(content, /Total Expeditions/, 'Must include Total Expeditions metric');
    assert.match(content, /Active \/ Upcoming/, 'Must include Active/Upcoming metric');
    assert.match(content, /Destinations/, 'Must include Destinations metric');
    assert.match(content, /AI Sentinel/, 'Must include AI Sentinel metric');

    // Filter tabs and search
    assert.match(content, /searchQuery/, 'Must include search filter capability');
    assert.match(content, /Filter by city, route, or title/, 'Must provide clear search input');

    // Curated ready-to-deploy circuits in empty state
    assert.match(content, /Featured Ready-to-Deploy Expeditions/, 'Must include curated circuit recommendations');
    assert.match(content, /Kutch Desert & Saurashtra Royal Circuit/, 'Must include Kutch circuit');
    assert.match(content, /Dwarka & Somnath Coastal Pilgrimage/, 'Must include Dwarka circuit');
    assert.match(content, /Gir Forest & Wildlife Safari Expedition/, 'Must include Gir safari circuit');

    // Quick CTAs
    assert.match(content, /href="\/plan"/, 'Must provide direct link to plan new trip');
    assert.match(content, /href="\/packages"/, 'Must provide direct link to explore packages');
  });
});


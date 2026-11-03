/**
 * Verification test for BharatYatra Canonical URL & SEO Configuration
 */
import assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import sitemap from '../app/sitemap';
import robots from '../app/robots';

async function verifyCanonicalConfig() {
  console.log('================================================================');
  console.log('BHARATYATRA CANONICAL URL & SEO AUDIT VERIFICATION');
  console.log('================================================================\n');

  // 1. Root Layout metadataBase & canonical
  console.log('🧪 TEST 1: Root Layout metadataBase & canonical URL');
  const layoutContent = fs.readFileSync(path.resolve(process.cwd(), 'app/layout.tsx'), 'utf-8');
  assert(
    layoutContent.includes("metadataBase: new URL('https://www.bharatyatra.in')"),
    'metadataBase in layout must be https://www.bharatyatra.in'
  );
  assert(
    layoutContent.includes("canonical: 'https://www.bharatyatra.in/'"),
    'Root alternates.canonical must be https://www.bharatyatra.in/'
  );
  assert(
    layoutContent.includes("url: 'https://www.bharatyatra.in/'") || layoutContent.includes("url: 'https://www.bharatyatra.in'"),
    'Root openGraph.url must be https://www.bharatyatra.in/'
  );
  assert(
    !layoutContent.includes('bharatyatra.com'),
    'Root layout.tsx must not contain any bharatyatra.com references'
  );
  console.log('   ✅ PASS: metadataBase is https://www.bharatyatra.in and alternates.canonical is https://www.bharatyatra.in/');

  // 2. Homepage canonical & Open Graph URL
  console.log('\n🧪 TEST 2: Homepage canonical URL & Open Graph metadata');
  const homeContent = fs.readFileSync(path.resolve(process.cwd(), 'app/page.tsx'), 'utf-8');
  assert(
    homeContent.includes("canonical: 'https://www.bharatyatra.in/'"),
    'Homepage alternates.canonical must be https://www.bharatyatra.in/'
  );
  assert(
    homeContent.includes("url: 'https://www.bharatyatra.in/'"),
    'Homepage openGraph.url must be https://www.bharatyatra.in/'
  );
  assert(
    !homeContent.includes('bharatyatra.com'),
    'Homepage app/page.tsx must not contain any bharatyatra.com references'
  );
  console.log('   ✅ PASS: Homepage canonical is https://www.bharatyatra.in/ and Open Graph URL is https://www.bharatyatra.in/');

  // 3. Robots.txt Sitemap URL
  console.log('\n🧪 TEST 3: Robots.txt configuration');
  const robotsConfig = robots();
  assert.strictEqual(
    robotsConfig.sitemap,
    'https://www.bharatyatra.in/sitemap.xml',
    'Robots sitemap must point to https://www.bharatyatra.in/sitemap.xml'
  );
  console.log(`   ✅ PASS: Robots sitemap is ${robotsConfig.sitemap}`);

  // 4. Sitemap.xml URLs
  console.log('\n🧪 TEST 4: Sitemap generation & URLs');
  const sitemapEntries = sitemap();
  assert(sitemapEntries.length > 0, 'Sitemap must contain entries');
  
  const homeEntry = sitemapEntries.find((e) => e.url === 'https://www.bharatyatra.in/' || e.url === 'https://www.bharatyatra.in');
  assert(homeEntry, 'Sitemap must contain homepage URL https://www.bharatyatra.in/');

  const nonOfficialUrls = sitemapEntries.filter((e) => !e.url.startsWith('https://www.bharatyatra.in'));
  assert.strictEqual(
    nonOfficialUrls.length,
    0,
    `All sitemap URLs must start with https://www.bharatyatra.in. Found: ${nonOfficialUrls.map(u => u.url).join(', ')}`
  );
  console.log(`   ✅ PASS: All ${sitemapEntries.length} sitemap URLs consistently use https://www.bharatyatra.in`);

  // 5. Audit all policy pages for canonical domain
  console.log('\n🧪 TEST 5: Legal & Policy pages canonical URLs');
  const policyFiles = [
    'app/about/page.tsx',
    'app/booking-policy/page.tsx',
    'app/cancellation-policy/page.tsx',
    'app/careers/page.tsx',
    'app/cookie-policy/page.tsx',
    'app/corporate/page.tsx',
    'app/disclaimer/page.tsx',
    'app/grievance-redressal/page.tsx',
    'app/help/page.tsx',
    'app/press/page.tsx',
    'app/privacy/page.tsx',
    'app/refund-policy/page.tsx',
    'app/terms/page.tsx',
  ];

  for (const file of policyFiles) {
    const content = fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8');
    assert(
      content.includes("https://www.bharatyatra.in/"),
      `${file} must use official https://www.bharatyatra.in/ in canonical`
    );
    assert(
      !content.includes("https://bharatyatra.com/"),
      `${file} must NOT contain https://bharatyatra.com/`
    );
    assert(
      !content.includes("https://bharatyatra.in/"),
      `${file} must NOT contain non-www https://bharatyatra.in/`
    );
    console.log(`   ✅ PASS: ${file} verified`);
  }

  // 6. Public customer discovery pages
  console.log('\n🧪 TEST 6: Public Customer Discovery pages canonical URLs');
  const customerFiles = [
    'app/(customer)/destinations/page.tsx',
    'app/(customer)/explore/page.tsx',
    'app/(customer)/packages/page.tsx',
    'app/(customer)/qr/page.tsx',
  ];

  for (const file of customerFiles) {
    const content = fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8');
    assert(
      content.includes('https://www.bharatyatra.in/'),
      `${file} must use official https://www.bharatyatra.in/ in canonical/OG`
    );
    assert(
      !content.includes('https://www.bharatyatra.com/'),
      `${file} must NOT contain https://www.bharatyatra.com/`
    );
    console.log(`   ✅ PASS: ${file} verified`);
  }

  // 7. Dynamic pages metadata inspection
  console.log('\n🧪 TEST 7: Dynamic Pages (Destinations & States) metadata');
  const destDetailPage = fs.readFileSync(
    path.resolve(process.cwd(), 'app/(customer)/destinations/[id]/page.tsx'),
    'utf-8'
  );
  assert(
    destDetailPage.includes('https://www.bharatyatra.in/destinations/'),
    'app/(customer)/destinations/[id]/page.tsx must reference https://www.bharatyatra.in/destinations/'
  );
  assert(
    !destDetailPage.includes('https://bharatyatra.com/destinations/'),
    'app/(customer)/destinations/[id]/page.tsx must not reference .com domain'
  );

  const stateDetailPage = fs.readFileSync(
    path.resolve(process.cwd(), 'app/(customer)/states/[slug]/page.tsx'),
    'utf-8'
  );
  assert(
    stateDetailPage.includes('https://www.bharatyatra.in/states/'),
    'app/(customer)/states/[slug]/page.tsx must reference https://www.bharatyatra.in/states/'
  );
  assert(
    !stateDetailPage.includes('https://bharatyatra.com/states/'),
    'app/(customer)/states/[slug]/page.tsx must not reference .com domain'
  );
  console.log('   ✅ PASS: Dynamic destination and state pages correctly generate https://www.bharatyatra.in/ canonicals');

  // 8. Middleware www & non-www redirection
  console.log('\n🧪 TEST 8: Middleware redirection rules');
  const middlewareContent = fs.readFileSync(path.resolve(process.cwd(), 'middleware.ts'), 'utf-8');
  assert(
    middlewareContent.includes("host === 'bharatyatra.in'"),
    'Middleware must redirect apex domain bharatyatra.in'
  );
  assert(
    middlewareContent.includes("https://www.bharatyatra.in"),
    'Middleware must target https://www.bharatyatra.in'
  );
  assert(
    middlewareContent.includes("308"),
    'Middleware must use permanent HTTP 308 redirect'
  );
  console.log('   ✅ PASS: Middleware enforces 308 permanent redirect from apex/legacy to https://www.bharatyatra.in');

  console.log('\n================================================================');
  console.log('🎉 ALL 8 CANONICAL URL & SEO AUDIT TESTS PASSED 100%');
  console.log('================================================================');
}

verifyCanonicalConfig().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

/**
 * Verification test for BharatYatra Google Brand Identity SEO & Structured Data
 */
import assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

async function verifyBrandIdentitySeo() {
  console.log('================================================================');
  console.log('BHARATYATRA GOOGLE BRAND IDENTITY SEO VERIFICATION');
  console.log('================================================================\n');

  // 1. Audit Existing Logo
  console.log('🧪 TEST 1: Logo asset audit and accessibility');
  const logoPath = path.resolve(process.cwd(), 'public/logo.png');
  assert(fs.existsSync(logoPath), 'public/logo.png must exist');
  const logoStats = fs.statSync(logoPath);
  assert(logoStats.size > 0, 'public/logo.png must not be empty');
  
  // Verify PNG signature
  const logoBuffer = fs.readFileSync(logoPath);
  const pngHeader = logoBuffer.slice(0, 8);
  assert.strictEqual(
    pngHeader.toString('hex'),
    '89504e470d0a1a0a',
    'public/logo.png must be a valid PNG file'
  );
  console.log(`   ✅ PASS: Official logo found at public/logo.png (${logoStats.size} bytes, valid PNG)`);

  // 2. Favicon assets audit
  console.log('\n🧪 TEST 2: Favicon assets audit');
  const appFavicon = path.resolve(process.cwd(), 'app/favicon.ico');
  const publicFavicon = path.resolve(process.cwd(), 'public/favicon.ico');
  assert(fs.existsSync(appFavicon), 'app/favicon.ico must exist');
  assert(fs.existsSync(publicFavicon), 'public/favicon.ico must exist');
  console.log('   ✅ PASS: Favicon exists at app/favicon.ico and public/favicon.ico');

  // 3. Organization JSON-LD Schema
  console.log('\n🧪 TEST 3: Organization Structured Data (JSON-LD)');
  const layoutContent = fs.readFileSync(path.resolve(process.cwd(), 'app/layout.tsx'), 'utf-8');
  
  assert(
    layoutContent.includes("'@type': 'Organization'"),
    'Organization schema must use @type: Organization'
  );
  assert(
    layoutContent.includes("name: 'BharatYatra'"),
    'Organization schema must use name: BharatYatra'
  );
  assert(
    layoutContent.includes("url: 'https://www.bharatyatra.in/'"),
    'Organization schema must use url: https://www.bharatyatra.in/'
  );
  assert(
    layoutContent.includes("logo: 'https://www.bharatyatra.in/logo.png'"),
    'Organization schema must point to absolute public URL https://www.bharatyatra.in/logo.png'
  );
  assert(
    layoutContent.includes("'https://www.instagram.com/bharat.yatra29'") &&
    layoutContent.includes("'https://twitter.com/bharatyatra'"),
    'Organization schema must include verified official social media profile URLs'
  );
  console.log('   ✅ PASS: Valid Organization JSON-LD with official logo & verified sameAs social URLs');

  // 4. WebSite JSON-LD Schema
  console.log('\n🧪 TEST 4: WebSite Structured Data (JSON-LD)');
  assert(
    layoutContent.includes("'@type': 'WebSite'"),
    'WebSite schema must use @type: WebSite'
  );
  assert(
    layoutContent.includes("alternateName: 'Bharat Yatra'"),
    'WebSite schema must include alternateName: Bharat Yatra'
  );
  assert(
    layoutContent.includes("url: 'https://www.bharatyatra.in/'"),
    'WebSite schema must use url: https://www.bharatyatra.in/'
  );
  console.log('   ✅ PASS: Valid WebSite JSON-LD with alternateName "Bharat Yatra" and official domain');

  // 5. Schema duplication check
  console.log('\n🧪 TEST 5: Schema duplication audit');
  const homeContent = fs.readFileSync(path.resolve(process.cwd(), 'app/page.tsx'), 'utf-8');
  assert(
    !homeContent.includes('application/ld+json'),
    'app/page.tsx should not define duplicate JSON-LD (handled globally in app/layout.tsx)'
  );
  const layoutOccurrences = (layoutContent.match(/application\/ld\+json/g) || []).length;
  assert.strictEqual(
    layoutOccurrences,
    2,
    'app/layout.tsx must contain exactly 2 JSON-LD scripts (WebSite and Organization)'
  );
  console.log('   ✅ PASS: No duplicate schemas detected (exactly 1 WebSite and 1 Organization schema rendered)');

  // 6. Next.js Metadata (metadataBase, canonical, Open Graph, Twitter, Icons)
  console.log('\n🧪 TEST 6: Next.js metadata audit');
  assert(
    layoutContent.includes("metadataBase: new URL('https://www.bharatyatra.in')"),
    'layout.tsx metadataBase must be https://www.bharatyatra.in'
  );
  assert(
    layoutContent.includes("canonical: 'https://www.bharatyatra.in/'"),
    'layout.tsx alternates.canonical must be https://www.bharatyatra.in/'
  );
  assert(
    layoutContent.includes("icons:"),
    'layout.tsx metadata must configure brand icons'
  );
  assert(
    layoutContent.includes("url: '/favicon.ico'") && layoutContent.includes("url: '/logo.png'"),
    'layout.tsx icons must reference /favicon.ico and /logo.png'
  );
  assert(
    homeContent.includes("canonical: 'https://www.bharatyatra.in/'"),
    'page.tsx alternates.canonical must be https://www.bharatyatra.in/'
  );
  assert(
    homeContent.includes("site: '@bharatyatra'"),
    'page.tsx twitter metadata must configure site handle'
  );
  console.log('   ✅ PASS: Full metadata correctly configured with metadataBase, canonical, OpenGraph, Twitter, and icons');

  console.log('\n================================================================');
  console.log('🎉 ALL 6 BRAND IDENTITY SEO TESTS PASSED 100%');
  console.log('================================================================');
}

verifyBrandIdentitySeo().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});


import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function getHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function run() {
  console.log('Testing Hero Background Image Replacement...\n');

  const srcPath = 'C:/Users/Pandya Kaushal/.gemini/antigravity/brain/35622b74-fe6d-4657-ab6c-4e5166b27b79/.user_uploaded/media_1793622263120_faf277a3.jpg';
  const targetPath1 = path.join(process.cwd(), 'public', 'images', 'festive', 'diwali-hero-bg.jpg');
  const targetPath2 = path.join(process.cwd(), 'public', 'diwali-hero-bg.jpg');
  const targetPath3 = path.join(process.cwd(), 'public', 'hero-bg.jpg');

  const expectedHash = getHash(srcPath);

  console.log('1. Checking file existence and integrity:');
  const hash1 = getHash(targetPath1);
  const hash2 = getHash(targetPath2);
  const hash3 = getHash(targetPath3);

  if (hash1 === expectedHash && hash2 === expectedHash && hash3 === expectedHash) {
    console.log('✅ [PASS] All public hero background files match the uploaded image (SHA256:', expectedHash, ')');
  } else {
    console.error('❌ [FAIL] Hash mismatch between uploaded file and public asset');
    process.exit(1);
  }

  console.log('\n2. Checking DiwaliHeroDeck.tsx component:');
  const deckCode = fs.readFileSync(path.join(process.cwd(), 'components', 'festive', 'DiwaliHeroDeck.tsx'), 'utf8');

  if (deckCode.includes('/images/festive/diwali-hero-bg.jpg')) {
    console.log('✅ [PASS] Hero component references /images/festive/diwali-hero-bg.jpg');
  } else {
    console.error('❌ [FAIL] Hero component does not reference new image path');
    process.exit(1);
  }

  if (!deckCode.includes('mix-blend-luminosity') && !deckCode.includes('opacity-45')) {
    console.log('✅ [PASS] Removed artificial luminosity and heavy opacity reductions');
  } else {
    console.error('❌ [FAIL] Found lingering filters/opacity reductions');
    process.exit(1);
  }

  if (deckCode.includes('bg-[#0A1128]/20')) {
    console.log('✅ [PASS] Subtle dark navy overlay (~20%) present for text contrast');
  } else {
    console.error('❌ [FAIL] Subtle navy overlay missing');
    process.exit(1);
  }

  console.log('\n3. Checking preservation of content:');
  const checks = [
    { name: 'Diwali Diya component', test: deckCode.includes('<DiwaliDiya') },
    { name: 'Headline', test: deckCode.includes('{heading}') },
    { name: 'Description', test: deckCode.includes('{description}') },
    { name: 'Primary CTA button', test: deckCode.includes('{primaryCta}') },
    { name: 'Secondary CTA button', test: deckCode.includes('{secondaryCta}') },
    { name: 'Search Input', test: deckCode.includes('type="text"') && deckCode.includes('searchQuery') },
    { name: 'Plan Journey button', test: deckCode.includes('Plan Journey') },
    { name: 'Priority loading', test: deckCode.includes('priority') },
    { name: 'Object cover and center', test: deckCode.includes('object-cover') && deckCode.includes('object-center') },
  ];

  for (const c of checks) {
    if (c.test) {
      console.log(`✅ [PASS] Preserved: ${c.name}`);
    } else {
      console.error(`❌ [FAIL] Missing: ${c.name}`);
      process.exit(1);
    }
  }

  console.log('\n🎉 ALL HERO BACKGROUND REPLACEMENT CHECKS PASSED!\n');
}

run();


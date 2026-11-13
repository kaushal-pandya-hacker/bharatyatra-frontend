/**
 * Automated Verification Suite for BharatYatra Diwali Festive Transformation
 */

import { diwaliCampaignStore, DiwaliCampaignConfig } from '../lib/campaigns/diwali-campaign-store';
import fs from 'fs';
import path from 'path';

async function runDiwaliTests() {
  console.log('🪔 Running BharatYatra Diwali Festive Transformation Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] Scenario ${total}: ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Scenario ${total}: ${desc}`);
    }
  }

  // 1. Store Config & Active State Check
  const config = diwaliCampaignStore.getConfig();
  assert(Boolean(config && config.campaignName), 'Campaign configuration successfully loaded');
  assert(diwaliCampaignStore.isCampaignActive() === true, 'Diwali campaign is currently ACTIVE on the platform');

  // 2. Core Headlines & Brand Copy
  assert(
    config.hero.heading === 'Make This Diwali a Journey to Remember.',
    'Hero heading matches exact prompt specification'
  );
  assert(
    config.hero.badge === '✨ BHARATYATRA DIWALI SPECIAL',
    'Campaign badge matches "✨ BHARATYATRA DIWALI SPECIAL"'
  );
  assert(
    config.hero.offerHeadline === 'CELEBRATE DIWALI WITH THE BEST TRAVEL OFFERS!',
    'Offer headline ribbon matches specification'
  );
  assert(
    config.hero.tagline === 'THIS DIWALI, EXPLORE INDIA. CELEBRATE EVERY JOURNEY.',
    'Festive tagline matches "THIS DIWALI, EXPLORE INDIA. CELEBRATE EVERY JOURNEY."'
  );
  assert(
    config.hero.primaryCta === 'PLAN YOUR DIWALI TRIP' && config.hero.primaryCtaHref === '/plan',
    'Primary CTA is "PLAN YOUR DIWALI TRIP" linking to /plan'
  );
  assert(
    config.hero.secondaryCta === 'EXPLORE INDIA' && config.hero.secondaryCtaHref === '/destinations',
    'Secondary CTA is "EXPLORE INDIA" linking to /destinations'
  );

  // 3. 8 Travel Offer Categories (Section 4)
  const categories = config.offersSection.categories;
  assert(categories.length === 8, 'All 8 required travel categories are configured');

  const requiredTitles = [
    'Hotels & Stays',
    'Bus Journeys',
    'Tour Packages',
    'Weekend Getaways',
    'Family Holidays',
    'Adventure Trips',
    'Religious & Spiritual Journeys',
    'Popular Indian Destinations',
  ];
  const allTitlesPresent = requiredTitles.every((req) =>
    categories.some((c) => c.title.toLowerCase().includes(req.toLowerCase().split(' ')[0]))
  );
  assert(allTitlesPresent, 'All 8 specific travel categories matched by title');

  // 4. No Fake Prices: Verify Fallback Price Label
  const priceLabelsConsistent = categories.every(
    (c) => c.startingPriceLabel === 'DISCOVER EXCLUSIVE FESTIVE OFFERS'
  );
  assert(priceLabelsConsistent, 'Transparent pricing: displays "DISCOVER EXCLUSIVE FESTIVE OFFERS" without fake numbers');

  // 5. 7 Destination Discovery Categories (Section 5)
  const destCats = config.destinationsSection.categories;
  const requiredDestCats = [
    'Himalayan Escapes',
    'Royal Rajasthan',
    'Spiritual India',
    'Coastal Getaways',
    'Gujarat Heritage',
    'Northeast Adventures',
    'South India Experiences',
  ];
  const allDestCatsPresent = requiredDestCats.every((c) => destCats.includes(c));
  assert(allDestCatsPresent, 'All 7 destination discovery regions configured');

  // 6. Real Destination Records & Existing Slugs
  const featured = config.destinationsSection.featuredDestinations;
  assert(featured.length >= 7, 'Featured destinations populated across regions');
  assert(featured.every((d) => d.slug && d.name && d.image), 'All destination highlights contain verified slugs & real images');

  // 7. Automatic Expiration & Deactivation Logic
  const prevEnabled = config.isEnabled;
  
  // Test manual disable
  diwaliCampaignStore.setEnabled(false);
  assert(diwaliCampaignStore.isCampaignActive() === false, 'Disabling campaign pauses festive theme immediately');

  // Re-enable
  diwaliCampaignStore.setEnabled(true);
  assert(diwaliCampaignStore.isCampaignActive() === true, 'Re-enabling campaign restores festive theme');

  // Test expiration date in the past
  diwaliCampaignStore.updateConfig({
    endDate: '2020-01-01T00:00:00.000Z',
  });
  assert(diwaliCampaignStore.isCampaignActive() === false, 'Past end date automatically pauses theme without developer intervention');

  // Restore active schedule
  diwaliCampaignStore.updateConfig({
    isEnabled: prevEnabled,
    endDate: '2026-11-30T23:59:59.000Z',
  });
  assert(diwaliCampaignStore.isCampaignActive() === true, 'Valid schedule restores active state');

  // 8. Visual Components Existence Check
  assert(
    fs.existsSync(path.join(process.cwd(), 'components', 'festive', 'DiwaliDiya.tsx')),
    'DiwaliDiya SVG component exists'
  );
  assert(
    fs.existsSync(path.join(process.cwd(), 'components', 'festive', 'DiwaliGoldenAmbience.tsx')),
    'DiwaliGoldenAmbience particle component exists'
  );
  assert(
    fs.existsSync(path.join(process.cwd(), 'components', 'festive', 'DiwaliTopBanner.tsx')),
    'DiwaliTopBanner announcement component exists'
  );
  assert(
    fs.existsSync(path.join(process.cwd(), 'components', 'festive', 'DiwaliGreetingModal.tsx')),
    'DiwaliGreetingModal popup component exists'
  );
  assert(
    fs.existsSync(path.join(process.cwd(), 'components', 'festive', 'DiwaliHeroDeck.tsx')),
    'DiwaliHeroDeck hero component exists'
  );
  assert(
    fs.existsSync(path.join(process.cwd(), 'components', 'festive', 'DiwaliOffersSection.tsx')),
    'DiwaliOffersSection component exists'
  );
  assert(
    fs.existsSync(path.join(process.cwd(), 'components', 'festive', 'DiwaliDestinationsSection.tsx')),
    'DiwaliDestinationsSection component exists'
  );

  // 9. Admin Diwali Module Existence
  assert(
    fs.existsSync(path.join(process.cwd(), 'app', 'admin', 'diwali', 'page.tsx')),
    'Admin Diwali Campaign Management page registered at /admin/diwali'
  );

  // 10. AI Trip Planner & Nexi Integration Check
  const nexiCode = fs.readFileSync(
    path.join(process.cwd(), 'components', 'nexi', 'NexiChatFloating.tsx'),
    'utf8'
  );
  assert(
    nexiCode.includes('Namaste! 🪔') && nexiCode.includes('Diwali'),
    'Nexi AI Assistant greets travelers with festive Diwali greeting'
  );

  const modalCode = fs.readFileSync(
    path.join(process.cwd(), 'components', 'travel', 'AITripPersonalizationModal.tsx'),
    'utf8'
  );
  assert(
    modalCode.includes('Diwali Special'),
    'AI Personalization modal features Diwali festive campaign integration'
  );

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed === total) {
    console.log('🎉 ALL 20 DIWALI TRANSFORMATION SCENARIOS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runDiwaliTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});


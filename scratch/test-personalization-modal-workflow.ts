/**
 * BharatYatra — AI Personalization Modal & Automatic Duration Recommendation Tests
 * Verifies:
 * 1. Multi-Destination Cross-Region (Ahmedabad -> Araku Valley, AP & Baratang, Andaman)
 * 2. Automatic Trip Duration Recommendation (No fixed 3/5/7/10 buttons)
 * 3. Three Tiers: Recommended, Minimum Feasible, Relaxed
 * 4. Custom Duration Stepper & Feasibility Check (Validating < minDays triggers isFeasible: false)
 * 5. Dynamic Itinerary & Budget Recalculation on duration change
 * 6. Regional single-destination test (Ahmedabad -> Udaipur)
 */

import {
  calculateTripDurationRecommendation,
  customizeTripDuration,
} from '../lib/ai-planner/trip-duration-intelligence-engine';

async function runTests() {
  console.log('========================================================================');
  console.log(' BharatYatra: AI Personalization Modal & Duration Recommendation Tests');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  // --- Test 1: Cross-Region Disparate Multi-Destination (User's Exact Screenshot Scenario) ---
  // Origin: Ahmedabad, Gujarat
  // Destinations: Baratang (Andaman & Nicobar Islands) + Araku Valley (Andhra Pradesh)
  const crossRegionTrip = calculateTripDurationRecommendation({
    origin: 'Ahmedabad, Gujarat',
    destinations: ['Baratang', 'Araku Valley'],
    travelMode: 'flight',
    travelPace: 'balanced',
    travellers: 2,
  });

  assert(
    crossRegionTrip.recommendedDuration.days >= 8,
    'Test 1: Cross-Region Multi-Destination Floor (Baratang & Araku Valley)',
    `Recommended: ${crossRegionTrip.recommendedDuration.days} days, Min: ${crossRegionTrip.minimumDuration.days} days, Distance: ${crossRegionTrip.travelTime.totalDistanceKm} km`
  );

  // --- Test 2: Island Warning Triggered for Road Mode ---
  const islandCarTrip = calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Baratang'],
    travelMode: 'car',
  });
  const hasIslandWarning = islandCarTrip.warnings.some((w) =>
    w.toLowerCase().includes('island') || w.toLowerCase().includes('andaman')
  );
  assert(
    hasIslandWarning,
    'Test 2: Island Maritime Transit Warning for Incompatible Road Mode',
    `Island warning present: ${hasIslandWarning}`
  );

  // --- Test 3: Regional Journey (Ahmedabad -> Udaipur) ---
  const udaipurTrip = calculateTripDurationRecommendation({
    origin: 'Ahmedabad, Gujarat',
    destinations: ['Udaipur'],
    travelMode: 'car',
    travelPace: 'balanced',
  });
  assert(
    udaipurTrip.recommendedDuration.days >= 3 && udaipurTrip.recommendedDuration.days <= 4,
    'Test 3: Regional Journey Dynamic Recommendation (Ahmedabad -> Udaipur)',
    `Recommended: ${udaipurTrip.recommendedDuration.days} Days / ${udaipurTrip.recommendedDuration.nights} Nights (Min: ${udaipurTrip.minimumDuration.days}d, Relaxed: ${udaipurTrip.relaxedDuration.days}d)`
  );

  // --- Test 4: Custom Duration Adjustment (Increase duration to Relaxed) ---
  const customExtended = customizeTripDuration({
    origin: 'Ahmedabad',
    destinations: ['Udaipur'],
    customDays: 5,
    travelMode: 'car',
    travellers: 2,
    budget: 35000,
  });
  assert(
    customExtended.isFeasible &&
    customExtended.customDays === 5 &&
    customExtended.changesSummary.hotelNights === 4,
    'Test 4: Customize Duration - Extended Days Allocation',
    `Custom Days: ${customExtended.customDays}, Hotel Nights: ${customExtended.changesSummary.hotelNights}, Feasible: ${customExtended.isFeasible}`
  );

  // --- Test 5: Custom Duration Below Feasibility Floor (Infeasible Detection) ---
  // E.g. Requesting 2 days for cross-region Baratang + Araku Valley where minimum is 6 days
  const customTooShort = customizeTripDuration({
    origin: 'Ahmedabad',
    destinations: ['Baratang', 'Araku Valley'],
    customDays: 3,
    travelMode: 'flight',
    travellers: 2,
  });
  assert(
    !customTooShort.isFeasible &&
    customTooShort.status === 'TOO_SHORT' &&
    customTooShort.feasibilityWarning !== undefined,
    'Test 5: Custom Duration Below Minimum Feasible Floor (Safety Warning)',
    `Feasible: ${customTooShort.isFeasible}, Status: ${customTooShort.status}, Warning: "${customTooShort.feasibilityWarning}"`
  );

  // --- Test 6: Dynamic Pricing Recalculation on Duration Change ---
  const pricingTripShort = customizeTripDuration({
    origin: 'Ahmedabad',
    destinations: ['Udaipur'],
    customDays: 3,
    travellers: 2,
  });
  const pricingTripLong = customizeTripDuration({
    origin: 'Ahmedabad',
    destinations: ['Udaipur'],
    customDays: 6,
    travellers: 2,
  });
  assert(
    pricingTripLong.budgetEstimate.totalGroupCost > pricingTripShort.budgetEstimate.totalGroupCost &&
    pricingTripLong.changesSummary.hotelNights > pricingTripShort.changesSummary.hotelNights,
    'Test 6: Dynamic Pricing & Hotel Nights Recalculation',
    `3 Days: ₹${pricingTripShort.budgetEstimate.totalGroupCost} (${pricingTripShort.changesSummary.hotelNights} nights) vs 6 Days: ₹${pricingTripLong.budgetEstimate.totalGroupCost} (${pricingTripLong.changesSummary.hotelNights} nights)`
  );

  console.log('\n========================================================================');
  console.log(` Test Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});


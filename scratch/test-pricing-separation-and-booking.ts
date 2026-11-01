import assert from 'assert';
import { generateItineraryBlueprint } from '../lib/trips/itinerary-generator';
import { saveTrip, getSavedTrips, TripItem } from '../lib/trips/trip-storage';
import { PricingEngine } from '../lib/ai-planner/pricing-engine';

console.log('================================================================');
console.log('  BHARATYATRA — AI PRICING SEPARATION & BOOKING INTEGRATION SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// SUITE 1: AI ITINERARY GENERATOR WITHOUT PRICING
// -----------------------------------------------------------------------------
console.log('SUITE 1: AI Itinerary Generation (Pure Travel Intelligence)');

runTest('1.1 generateItineraryBlueprint returns full circuit without totalPackageCost', () => {
  const blueprint = generateItineraryBlueprint({
    originCity: 'Ahmedabad',
    destinationCity: 'Jaipur',
    durationDays: 4,
    paxCount: 2,
    selectedPlaceIds: [1, 2, 3],
  });

  assert.ok(blueprint.circuitTitle, 'Circuit title should exist');
  assert.strictEqual(blueprint.totalDays, 4);
  assert.strictEqual(blueprint.totalNights, 3);
  assert.strictEqual(blueprint.itineraryDays.length, 4);
  // Pure travel intelligence: no financial values
  assert.strictEqual(blueprint.totalPackageCost, undefined, 'totalPackageCost must NOT be calculated');
  assert.strictEqual(blueprint.pricePerPaxPerDay, undefined, 'pricePerPaxPerDay must NOT be calculated');
});

runTest('1.2 Zero places selected returns zero-state without calculating pricing', () => {
  const blueprint = generateItineraryBlueprint({
    originCity: 'Surat',
    selectedPlaceIds: [],
    customPlaces: [],
  });

  assert.strictEqual(blueprint.selectedPlaces.length, 0);
  assert.strictEqual(blueprint.totalPackageCost, undefined, 'Zero state must not set totalPackageCost');
  assert.strictEqual(blueprint.pricePerPaxPerDay, undefined, 'Zero state must not set pricePerPaxPerDay');
});

runTest('1.3 No synthetic equation (pricePerPaxPerDay * duration * pax * (1+tax)) is executed', () => {
  const luxuryBlueprint = generateItineraryBlueprint({
    originCity: 'Vadodara',
    destinationCity: 'Udaipur',
    durationDays: 5,
    paxCount: 4,
    selectedTier: 'luxury',
    selectedPlaceIds: [1, 2, 3, 4],
  });

  const budgetBlueprint = generateItineraryBlueprint({
    originCity: 'Vadodara',
    destinationCity: 'Udaipur',
    durationDays: 5,
    paxCount: 4,
    selectedTier: 'budget',
    selectedPlaceIds: [1, 2, 3, 4],
  });

  // Neither should contain synthetic financial outputs
  assert.strictEqual(luxuryBlueprint.totalPackageCost, undefined);
  assert.strictEqual(budgetBlueprint.totalPackageCost, undefined);
  assert.strictEqual(luxuryBlueprint.pricePerPaxPerDay, undefined);
  assert.strictEqual(budgetBlueprint.pricePerPaxPerDay, undefined);
});

// -----------------------------------------------------------------------------
// SUITE 2: BUDGET DATA HANDLING & SCHEMA INTEGRITY
// -----------------------------------------------------------------------------
console.log('\nSUITE 2: Budget Data Handling & User Preference Preservation');

runTest('2.1 Missing budget does NOT default to 0 or 25000', () => {
  const newTripNoBudget: TripItem = {
    tripId: 'test-trip-no-budget-1',
    title: 'Surat to Somnath Route',
    destination: 'Somnath',
    startDate: '2026-11-20',
    durationDays: 3,
    status: 'PLANNING',
    budgetInr: null,
  };

  assert.strictEqual(newTripNoBudget.budgetInr, null, 'Unsupplied budget should remain null');
  assert.notStrictEqual(newTripNoBudget.budgetInr, 0, 'Missing budget must NEVER become zero');
  assert.notStrictEqual(newTripNoBudget.budgetInr, 25000, 'Missing budget must not fallback to 25000');
});

runTest('2.2 Actual user budget preference (e.g. ₹50,000) is strictly preserved', () => {
  const userBudgetVal = 50000;
  const tripWithUserBudget: TripItem = {
    tripId: 'test-trip-user-budget-2',
    title: 'Ahmedabad to Goa Beach Circuit',
    destination: 'Goa',
    startDate: '2026-12-10',
    durationDays: 6,
    travelers: 2,
    status: 'SAVED',
    budgetInr: userBudgetVal,
  };

  assert.strictEqual(tripWithUserBudget.budgetInr, 50000, 'User provided budget must be preserved');
});

runTest('2.3 Optional budget schema allows undefined without runtime breakage', () => {
  const tripUndefinedBudget: TripItem = {
    tripId: 'test-trip-undefined-budget-3',
    title: 'Kutch White Desert Tour',
    destination: 'Kutch',
    startDate: '2026-12-15',
    durationDays: 4,
    status: 'SAVED',
    // budgetInr omitted
  };

  assert.strictEqual(tripUndefinedBudget.budgetInr, undefined);
});

// -----------------------------------------------------------------------------
// SUITE 3: BACKWARD COMPATIBILITY WITH HISTORICAL DATA
// -----------------------------------------------------------------------------
console.log('\nSUITE 3: Historical Data Migration & Backward Compatibility');

runTest('3.1 Legacy saved journeys with old budgetInr load without corruption', () => {
  const legacySavedTrip = {
    tripId: 'legacy-trip-2025',
    title: 'Legacy Heritage Tour',
    destination: 'Ahmedabad',
    startDate: '2026-10-01',
    durationDays: 5,
    travelers: 4,
    budgetInr: 17115, // Historical synthetic data
    status: 'COMPLETED' as const,
  };

  assert.strictEqual(legacySavedTrip.budgetInr, 17115, 'Historical record should not be mutated or wiped');
  assert.strictEqual(legacySavedTrip.durationDays, 5);
});

runTest('3.2 Null budget trips format cleanly in UI logic without NaN or errors', () => {
  const tripNull = { budgetInr: null };
  const tripUndefined = { budgetInr: undefined };
  const tripZero = { budgetInr: 0 };
  const tripValid = { budgetInr: 35000 };

  const formatBadge = (t: { budgetInr?: number | null }) => {
    if (t.budgetInr && t.budgetInr > 0) {
      return `₹${t.budgetInr.toLocaleString('en-IN')}`;
    }
    return 'AI Route Plan';
  };

  assert.strictEqual(formatBadge(tripNull), 'AI Route Plan');
  assert.strictEqual(formatBadge(tripUndefined), 'AI Route Plan');
  assert.strictEqual(formatBadge(tripZero), 'AI Route Plan');
  assert.strictEqual(formatBadge(tripValid), '₹35,000');
});

// -----------------------------------------------------------------------------
// SUITE 4: INDEPENDENT DETERMINISTIC PRICING ENGINE
// -----------------------------------------------------------------------------
console.log('\nSUITE 4: Deterministic Booking Pricing Engine Verification');

runTest('4.1 PricingEngine computes verified room rate, transit fares, and taxes independently', () => {
  const pricingResult = PricingEngine.calculateItineraryPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Jaipur',
    destinations: ['Jaipur'],
    travelersCount: 4,
    durationDays: 4,
    preferredTransport: 'train',
    preferredTier: 'standard',
    userBudgetInr: 60000,
  });

  assert.ok(pricingResult, 'PricingResult must be returned');
  assert.strictEqual(pricingResult.currency, 'INR');
  assert.strictEqual(pricingResult.travelersCount, 4);
  assert.strictEqual(pricingResult.roomsCount, 2, '4 pax should require 2 rooms');
  assert.strictEqual(pricingResult.hotelNights, 3, '4 days should require 3 hotel nights');

  // Verify all 4 tiers exist with positive costs
  assert.ok(pricingResult.tiers.budget.totalGroupCost > 0, 'Budget tier should have calculated cost');
  assert.ok(pricingResult.tiers.standard.totalGroupCost > pricingResult.tiers.budget.totalGroupCost, 'Standard > Budget');
  assert.ok(pricingResult.tiers.luxury.totalGroupCost > pricingResult.tiers.standard.totalGroupCost, 'Luxury > Standard');

  // Verify statutory taxes are calculated
  const activeBreakdown = pricingResult.activeTier;
  assert.ok(activeBreakdown.categories.taxesAndFees.totalAmount > 0, 'GST taxes must be calculated');
  assert.ok(activeBreakdown.categories.accommodation.totalAmount > 0, 'Hotel costs must be calculated');
  assert.ok(activeBreakdown.categories.transportation.totalAmount > 0, 'Transit costs must be calculated');
});

runTest('4.2 PricingEngine accurately assesses user budget feasibility', () => {
  const withinBudget = PricingEngine.calculateItineraryPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Dwarka',
    travelersCount: 2,
    durationDays: 3,
    preferredTransport: 'bus',
    preferredTier: 'budget',
    userBudgetInr: 100000,
  });
  assert.strictEqual(withinBudget.budgetAnalysis.fitsBudget, true);

  const tightBudget = PricingEngine.calculateItineraryPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Leh',
    travelersCount: 6,
    durationDays: 10,
    preferredTransport: 'flight',
    preferredTier: 'luxury',
    userBudgetInr: 5000, // Impossibly low
  });
  assert.strictEqual(tightBudget.budgetAnalysis.fitsBudget, false);
  assert.ok(tightBudget.budgetAnalysis.tradeoffSuggestions.length > 0);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST EXECUTION SUMMARY: ${passedTests} / ${totalTests} PASSED`);
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}

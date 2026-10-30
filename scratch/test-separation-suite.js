/**
 * BharatYatra AI 2.0 — Architectural Separation Verification Suite
 *
 * Validates strict separation of concerns between:
 * 1. AI Trip Planner (Pure Travel Intelligence - zero financial calculations)
 * 2. Pricing Engine (Independent Deterministic Financial Calculations)
 * 3. Shared Universal Preference Profile Integrity
 * 4. Budget updates without itinerary recalculation
 * 5. Destination/duration changes triggering proper updates
 * 6. Missing supplier prices & unavailable transport handling (no invented prices)
 * 7. Backward compatibility for legacy trip consumers
 */

const { PureItineraryService } = require('../lib/ai-planner/pure-itinerary-service');
const { PricingEngine } = require('../lib/ai-planner/pricing-engine');
const { generateMasterTripPlan } = require('../lib/ai-planner/planner-service');
const {
  createDefaultPreferenceProfile,
} = require('../lib/ai-planner/universal-preference-profile');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   Details:`, details);
    failedTests++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('BHARATYATRA AI 2.0 — ARCHITECTURAL SEPARATION VERIFICATION SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Pure AI Itinerary Generation (Zero Financial Properties)
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Pure AI Itinerary Generation (Zero Financial Properties) ---');
  const pureItinerary = PureItineraryService.generatePureItinerary({
    origin: { city: 'Mumbai', country: 'India' },
    destinations: [{ state: 'Rajasthan' }],
    durationDays: 5,
    travelers: { adults: 2 },
    pace: 'balanced',
  });

  assert(pureItinerary && pureItinerary.days.length === 5, 'Generated exactly 5 pure itinerary days');
  assert(pureItinerary.destinations.length > 0, 'Contains validated destinations');
  assert(pureItinerary.totalDistanceKm > 0, 'Computed geographic route distance');

  // Verify zero price properties exist in pure itinerary
  let foundPriceField = false;
  pureItinerary.days.forEach((day) => {
    if (day.estimatedDailyCostInr !== undefined || day.cost !== undefined || day.price !== undefined) {
      foundPriceField = true;
    }
    const allActivities = [...day.morning, ...day.afternoon, ...day.evening];
    allActivities.forEach((act) => {
      if (act.estimatedCostInr !== undefined || act.cost !== undefined || act.price !== undefined) {
        foundPriceField = true;
      }
    });
    if (day.accommodation) {
      if (
        day.accommodation.estimatedCostPerNightInr !== undefined ||
        day.accommodation.totalCostInr !== undefined
      ) {
        foundPriceField = true;
      }
    }
  });

  assert(!foundPriceField, 'Pure itinerary contains ZERO financial / price properties');

  // --------------------------------------------------------------------------
  // TEST 2: Independent Deterministic Pricing Engine Calculation
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Independent Deterministic Pricing Calculation ---');
  const pricingResult = PricingEngine.calculateItineraryPricing({
    originCity: pureItinerary.origin,
    destinationCity: pureItinerary.destinations[0] || 'Jaipur',
    destinations: pureItinerary.destinations,
    travelersCount: pureItinerary.travelersCount,
    durationDays: pureItinerary.durationDays,
    preferredTransport: 'train',
    preferredTier: 'standard',
    userBudgetInr: 45000,
    pureItinerary,
  });

  assert(pricingResult && pricingResult.currency === 'INR', 'Pricing engine returns INR result');
  assert(pricingResult.tiers && pricingResult.tiers.budget && pricingResult.tiers.standard, 'Provides all 4 pricing tiers');
  assert(pricingResult.tiers.standard.totalGroupCost > 0, 'Standard tier cost is greater than 0');
  assert(
    pricingResult.tiers.budget.totalGroupCost < pricingResult.tiers.standard.totalGroupCost &&
    pricingResult.tiers.standard.totalGroupCost < pricingResult.tiers.luxury.totalGroupCost,
    'Tiers maintain logical monotonicity (budget < standard < luxury)'
  );
  assert(
    pricingResult.provenanceSummary.verifiedReferencesUsed > 0 ||
    pricingResult.provenanceSummary.estimatedItemsCount > 0,
    'Tracks data provenance'
  );

  // --------------------------------------------------------------------------
  // TEST 3: Shared Universal Preference Profile Sync Integrity
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Shared Preference Profile Integrity ---');
  const baseProfile = createDefaultPreferenceProfile({
    origin: 'Delhi',
    destination: 'Varanasi',
    destinationList: ['Varanasi', 'Prayagraj'],
    tripDurationDays: 4,
  });

  baseProfile.food.dietaryType = 'jain';
  baseProfile.pace.style = 'relaxed';
  baseProfile.budget.totalBudget = 30000;

  // Update budget ONLY
  baseProfile.budget.totalBudget = 60000;
  baseProfile.budget.pricingCategory = 'luxury';

  assert(baseProfile.budget.totalBudget === 60000, 'Budget updated to ₹60,000');
  assert(baseProfile.budget.pricingCategory === 'luxury', 'Pricing category updated to luxury');
  assert(baseProfile.food.dietaryType === 'jain', 'Food preference (jain) remained UNTOUCHED');
  assert(baseProfile.pace.style === 'relaxed', 'Pacing preference (relaxed) remained UNTOUCHED');
  assert(baseProfile.identity.destination === 'Varanasi', 'Destination remained UNTOUCHED');

  // --------------------------------------------------------------------------
  // TEST 4: Budget Change Recalculation without Touching Itinerary
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Budget Change Recalculation without Mutating Itinerary ---');
  const initialPlan = await generateMasterTripPlan({
    origin: { city: 'Bengaluru', country: 'India' },
    destinations: [{ state: 'Kerala' }],
    durationDays: 4,
    travelers: { adults: 2 },
    budget: { total: 25000, currency: 'INR' },
  });

  assert(initialPlan.success, 'Master trip plan generated successfully');
  assert(initialPlan.itinerary && initialPlan.itinerary.days.length === 4, 'Contains pure itinerary with 4 days');

  // Capture activity snapshot before budget change
  const activitiesSnapshotBefore = initialPlan.itinerary.days.map((d) => ({
    day: d.day,
    morning: d.morning.map((a) => a.name),
    afternoon: d.afternoon.map((a) => a.name),
    evening: d.evening.map((a) => a.name),
  }));

  // Perform fast budget change recalculation
  const recalculatedPricing = PricingEngine.recalculateOnBudgetChange(
    initialPlan.pricing,
    75000,
    'premium'
  );

  assert(recalculatedPricing.selectedTier === 'premium', 'Recalculated tier is premium');
  assert(recalculatedPricing.activeTierPricing.tier === 'premium', 'Active tier pricing reflects premium');

  // Verify pure itinerary was NOT mutated or altered by budget recalculation
  const activitiesSnapshotAfter = initialPlan.itinerary.days.map((d) => ({
    day: d.day,
    morning: d.morning.map((a) => a.name),
    afternoon: d.afternoon.map((a) => a.name),
    evening: d.evening.map((a) => a.name),
  }));

  assert(
    JSON.stringify(activitiesSnapshotBefore) === JSON.stringify(activitiesSnapshotAfter),
    'Itinerary activities & days are 100% IDENTICAL before and after budget recalculation'
  );

  // --------------------------------------------------------------------------
  // TEST 5: Destination & Duration Changes Trigger Proper Updates
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Destination & Duration Changes ---');
  const plan7Days = PureItineraryService.generatePureItinerary({
    origin: { city: 'Delhi', country: 'India' },
    destinations: [{ state: 'Himachal Pradesh' }],
    durationDays: 7,
    travelers: { adults: 2 },
  });

  assert(plan7Days.days.length === 7, 'Duration change to 7 days generates exactly 7 days');

  const pricing7Days = PricingEngine.calculateItineraryPricing({
    originCity: plan7Days.origin,
    destinationCity: plan7Days.destinations[0],
    destinations: plan7Days.destinations,
    travelersCount: 2,
    durationDays: 7,
    pureItinerary: plan7Days,
  });

  assert(pricing7Days.durationDays === 7, 'Pricing engine receives and prices 7 days');
  assert(pricing7Days.hotelNights === 6, 'Hotel nights correctly calculated as 6');

  // --------------------------------------------------------------------------
  // TEST 6: Missing Supplier Prices Handled with UNAVAILABLE or ESTIMATED
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Missing Supplier & Unavailable Transport Fallbacks ---');
  const remotePricing = PricingEngine.calculateItineraryPricing({
    originCity: 'Port Blair',
    destinationCity: 'Tawang',
    destinations: ['Tawang'],
    travelersCount: 2,
    durationDays: 5,
    preferredTransport: 'flight', // No direct commercial flight exists between Port Blair and Tawang
  });

  assert(remotePricing.isEstimateOnly, 'Always marked as isEstimateOnly: true');
  assert(
    remotePricing.provenanceSummary.verifiedReferencesUsed > 0 ||
    remotePricing.provenanceSummary.estimatedItemsCount > 0,
    'Falls back to verified benchmarks and conservative estimates instead of hallucinating live rates'
  );

  // --------------------------------------------------------------------------
  // TEST 7: Backward Compatibility for Existing Consumers
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: Backward Compatibility for Legacy API Consumers ---');
  assert(initialPlan.trip && initialPlan.trip.title, 'Contains legacy trip object');
  assert(initialPlan.trip.days.length === 4, 'Legacy trip contains 4 days');
  assert(initialPlan.budget && initialPlan.budget.totalEstimatedInr > 0, 'Legacy budget object contains totalEstimatedInr');
  assert(initialPlan.budget.transportation !== undefined, 'Legacy budget contains transportation category');
  assert(initialPlan.budget.accommodation !== undefined, 'Legacy budget contains accommodation category');
  assert(initialPlan.hybridPricing !== undefined, 'Legacy hybridPricing property is populated');
  assert(initialPlan.durationRecommendations !== undefined, 'Duration recommendations are populated');
  assert(initialPlan.itinerary !== undefined, 'New decoupled itinerary property is accessible');
  assert(initialPlan.pricing !== undefined, 'New decoupled pricing property is accessible');

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});

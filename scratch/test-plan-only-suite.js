/**
 * BharatYatra AI 2.0 — Plan-Only AI Trip Planner Test Suite
 *
 * Verifies strict compliance with Master Prompt:
 * 1. AI generates itineraries without calling pricing APIs.
 * 2. Smart duration calculation: Minimum Possible Duration & Comfortable Recommended Duration.
 * 3. 12-Section AI Response Format verification.
 * 4. Strict Pricing Exclusion: Automated detection of currency symbols (₹, INR, $) and financial estimates.
 * 5. Practical day-wise plans with altitude acclimatization and real-world feasibility.
 * 6. User preferences and shared source of truth.
 * 7. India-wide coverage across all states/UTs without Gujarat bias.
 * 8. Independent Pricing Engine & booking integrity.
 */

const { PureItineraryService } = require('../lib/ai-planner/pure-itinerary-service');
const { PricingEngine } = require('../lib/ai-planner/pricing-engine');
const { generateMasterTripPlan } = require('../lib/ai-planner/planner-service');
const hybridPricingModule = require('../lib/ai-planner/hybrid-pricing-engine');
const budgetEngineModule = require('../lib/ai-planner/budget-engine');

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

async function runPlanOnlyTestSuite() {
  console.log('================================================================');
  console.log('BHARATYATRA AI TRIP PLANNER (PLAN ONLY) VERIFICATION SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Zero Pricing API Calls During Itinerary Generation (Spy Check)
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Pricing APIs are NOT Called During Itinerary Generation ---');
  let computeHybridTripPricingCalled = false;
  let calculateTripBudgetCalled = false;

  const originalCompute = hybridPricingModule.computeHybridTripPricing;
  const originalBudget = budgetEngineModule.calculateTripBudget;

  hybridPricingModule.computeHybridTripPricing = function (...args) {
    computeHybridTripPricingCalled = true;
    return originalCompute.apply(this, args);
  };
  budgetEngineModule.calculateTripBudget = function (...args) {
    calculateTripBudgetCalled = true;
    return originalBudget.apply(this, args);
  };

  try {
    const planOnlyResult = PureItineraryService.generatePureItinerary({
      origin: { city: 'Delhi', country: 'India' },
      destinations: [{ state: 'Himachal Pradesh' }],
      pace: 'balanced',
    });

    assert(
      !computeHybridTripPricingCalled,
      'computeHybridTripPricing was NOT called during pure itinerary generation'
    );
    assert(
      !calculateTripBudgetCalled,
      'calculateTripBudget was NOT called during pure itinerary generation'
    );
  } finally {
    hybridPricingModule.computeHybridTripPricing = originalCompute;
    budgetEngineModule.calculateTripBudget = originalBudget;
  }

  // --------------------------------------------------------------------------
  // TEST 2: Smart Trip Duration (Origin + Destination Only, No User Duration)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Smart Trip Duration (Calculated Independently) ---');
  const durationOnlyReq = {
    origin: { city: 'Bengaluru', country: 'India' },
    destinations: [{ state: 'Kerala' }],
    // No durationDays provided by user!
  };

  const autoPlan = PureItineraryService.generatePureItinerary(durationOnlyReq);

  assert(autoPlan.minimumPossibleDuration !== undefined, 'Calculated Minimum Possible Duration');
  assert(autoPlan.minimumPossibleDuration.totalDays > 0, `Minimum days = ${autoPlan.minimumPossibleDuration.totalDays}`);
  assert(autoPlan.minimumPossibleDuration.travelDays > 0, 'Minimum travel days accounted for');
  assert(autoPlan.minimumPossibleDuration.sightseeingDays > 0, 'Minimum sightseeing days accounted for');
  assert(typeof autoPlan.minimumPossibleDuration.description === 'string', 'Minimum duration has explanation');

  assert(autoPlan.comfortableRecommendedDuration !== undefined, 'Calculated Comfortable Recommended Duration');
  assert(autoPlan.comfortableRecommendedDuration.totalDays >= autoPlan.minimumPossibleDuration.totalDays, 'Recommended duration >= Minimum duration');
  assert(autoPlan.comfortableRecommendedDuration.isRecommended === true, 'Marked as recommended');

  assert(
    typeof autoPlan.durationRecommendationReasoning === 'string' &&
    autoPlan.durationRecommendationReasoning.length > 50,
    'Comprehensive duration recommendation reasoning provided'
  );

  // --------------------------------------------------------------------------
  // TEST 3: Strict Pricing Exclusion (Automated Price & Currency Scanner)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3: Strict Pricing Exclusion (No Currency Symbols or Rates) ---');
  // Pass a budget in the user request to verify the AI planner does NOT calculate or display it!
  const promptWithBudget = {
    origin: { city: 'Kolkata', country: 'India' },
    destinations: [{ state: 'Sikkim' }],
    durationDays: 5,
    budget: { total: 40000, currency: 'INR' },
    naturalPrompt: 'Plan a 5 day Sikkim trip. My total budget is ₹40,000.',
  };

  const sikkimPlan = PureItineraryService.generatePureItinerary(promptWithBudget);
  const aiGeneratedSections = {
    overview: sikkimPlan.overview,
    locations: sikkimPlan.locations,
    minimumPossibleDuration: sikkimPlan.minimumPossibleDuration,
    comfortableRecommendedDuration: sikkimPlan.comfortableRecommendedDuration,
    durationRecommendationReasoning: sikkimPlan.durationRecommendationReasoning,
    confidenceAndFreshness: sikkimPlan.confidenceAndFreshness,
    dayWiseItinerary: sikkimPlan.dayWiseItinerary,
    recommendedAttractions: sikkimPlan.recommendedAttractions,
    transportationAndRouteGuidance: sikkimPlan.transportationAndRouteGuidance,
    importantTravelNotes: sikkimPlan.importantTravelNotes,
    weatherAndSeasonalConsiderations: sikkimPlan.weatherAndSeasonalConsiderations,
    travelPreparationChecklist: sikkimPlan.travelPreparationChecklist,
  };
  const planJsonString = JSON.stringify(aiGeneratedSections);

  // Accurate regex for currency symbols and currency tokens (word-boundary protected so English words like 'hours.' don't trigger false positives)
  const currencySymbolRegex = /(₹|[$€£]|\bINR\b|\bRs\.?\s*\d)/i;
  const pricePhrasesRegex = /(estimated cost|total trip cost|hotel cost|bus fare|train fare|flight price|per night|per person cost|budget required)/i;

  const foundCurrency = currencySymbolRegex.test(planJsonString);
  const foundPricePhrase = pricePhrasesRegex.test(planJsonString);

  assert(!foundCurrency, 'No currency symbols (₹, INR, $, Rs.) found anywhere in itinerary JSON');
  assert(!foundPricePhrase, 'No price estimation phrases found anywhere in itinerary JSON');

  // Verify that individual activities, days, and accommodation objects contain ZERO cost fields
  let hasAnyCostField = false;
  sikkimPlan.dayWiseItinerary.forEach((day) => {
    if (day.estimatedDailyCostInr !== undefined || day.cost !== undefined || day.price !== undefined) {
      hasAnyCostField = true;
    }
    const allActs = [...day.morning, ...day.afternoon, ...day.evening];
    allActs.forEach((act) => {
      if (act.estimatedCostInr !== undefined || act.cost !== undefined || act.price !== undefined) {
        hasAnyCostField = true;
      }
    });
    if (day.accommodation) {
      if (
        day.accommodation.estimatedCostPerNightInr !== undefined ||
        day.accommodation.totalCostInr !== undefined ||
        day.accommodation.cost !== undefined
      ) {
        hasAnyCostField = true;
      }
    }
  });

  assert(!hasAnyCostField, 'Day, Activity, and Accommodation objects contain zero cost/price fields');

  // --------------------------------------------------------------------------
  // TEST 4: Verification of All 12 AI Response Sections
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 4: Complete 12-Section AI Response Format ---');
  assert(typeof sikkimPlan.overview === 'string' && sikkimPlan.overview.length > 20, 'Section 1: Trip overview present');
  assert(sikkimPlan.locations && sikkimPlan.locations.startingLocation && sikkimPlan.locations.destination, 'Section 2: Starting location & destination present');
  assert(sikkimPlan.minimumPossibleDuration && sikkimPlan.minimumPossibleDuration.totalDays > 0, 'Section 3: Minimum possible duration present');
  assert(sikkimPlan.comfortableRecommendedDuration && sikkimPlan.comfortableRecommendedDuration.totalDays > 0, 'Section 4: Comfortable recommended duration present');
  assert(typeof sikkimPlan.durationRecommendationReasoning === 'string' && sikkimPlan.durationRecommendationReasoning.length > 20, 'Section 5: Duration recommendation reasoning present');
  assert(sikkimPlan.confidenceAndFreshness && sikkimPlan.confidenceAndFreshness.confidenceScore > 0, 'Section 6: Confidence score & data freshness present');
  assert(Array.isArray(sikkimPlan.dayWiseItinerary) && sikkimPlan.dayWiseItinerary.length === 5, 'Section 7: Day-wise itinerary present (5 days)');
  assert(Array.isArray(sikkimPlan.recommendedAttractions) && sikkimPlan.recommendedAttractions.length > 0, 'Section 8: Recommended attractions present');
  assert(sikkimPlan.transportationAndRouteGuidance && sikkimPlan.transportationAndRouteGuidance.recommendedPrimaryMode, 'Section 9: Transportation & route guidance present');
  assert(Array.isArray(sikkimPlan.importantTravelNotes) && sikkimPlan.importantTravelNotes.length > 0, 'Section 10: Important travel notes present');
  assert(sikkimPlan.weatherAndSeasonalConsiderations && sikkimPlan.weatherAndSeasonalConsiderations.seasonalClassification, 'Section 11: Weather & seasonal considerations present');
  assert(sikkimPlan.travelPreparationChecklist && sikkimPlan.travelPreparationChecklist.documentsAndPermits.length > 0, 'Section 12: Travel preparation checklist present');

  // --------------------------------------------------------------------------
  // TEST 5: Altitude Acclimatization & Real-World Validation
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Altitude Acclimatization & Feasibility (Leh/Ladakh) ---');
  const lehPlan = PureItineraryService.generatePureItinerary({
    origin: { city: 'Chandigarh', country: 'India' },
    destinations: [{ state: 'Ladakh' }],
    durationDays: 6,
    pace: 'balanced',
  });

  const day1Act = lehPlan.dayWiseItinerary[0]?.morning[0]?.name || '';
  const day2Act = lehPlan.dayWiseItinerary[1]?.morning[0]?.name || '';
  const hasAcclimatization =
    day1Act.toLowerCase().includes('acclimatization') ||
    day2Act.toLowerCase().includes('acclimatization') ||
    lehPlan.dayWiseItinerary.some((d) => d.dayType.toLowerCase().includes('rest') || d.daySummary.toLowerCase().includes('adaptation'));

  assert(hasAcclimatization, 'Mandatory altitude acclimatization scheduled for Ladakh circuit');
  assert(
    lehPlan.importantTravelNotes.some((n) => n.includes('2,800m') || n.includes('Altitude') || n.includes('Acclimatization')),
    'Includes high-altitude medical safety alert in travel notes'
  );

  // --------------------------------------------------------------------------
  // TEST 6: Pan-India Coverage (All Regions, No Gujarat Bias)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Pan-India Destination Coverage ---');
  const testRegions = [
    { name: 'North (Kashmir)', origin: 'Delhi', dest: 'Jammu and Kashmir' },
    { name: 'South (Tamil Nadu)', origin: 'Bengaluru', dest: 'Tamil Nadu' },
    { name: 'East (Odisha)', origin: 'Kolkata', dest: 'Odisha' },
    { name: 'Northeast (Arunachal)', origin: 'Guwahati', dest: 'Arunachal Pradesh' },
    { name: 'West (Maharashtra)', origin: 'Hyderabad', dest: 'Maharashtra' },
    { name: 'Islands (Andaman)', origin: 'Chennai', dest: 'Andaman and Nicobar Islands' },
  ];

  testRegions.forEach((reg) => {
    const plan = PureItineraryService.generatePureItinerary({
      origin: { city: reg.origin, country: 'India' },
      destinations: [{ state: reg.dest }],
      durationDays: 4,
    });
    assert(
      plan.dayWiseItinerary.length === 4 && plan.locations.destination.length > 0,
      `Successfully generated valid plan for ${reg.name}`
    );
  });

  // --------------------------------------------------------------------------
  // TEST 7: Master Trip Plan with planOnly: true
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: generateMasterTripPlan with planOnly: true ---');
  const masterPlanOnly = await generateMasterTripPlan({
    origin: { city: 'Mumbai', country: 'India' },
    destinations: [{ state: 'Goa' }],
    durationDays: 4,
    planOnly: true,
  });

  assert(masterPlanOnly.success === true, 'Master trip plan generated with planOnly: true');
  assert(masterPlanOnly.itinerary !== undefined, 'Contains 12-section pure itinerary');
  assert(masterPlanOnly.pricing === undefined, 'Does NOT contain pricing object when planOnly: true');
  assert(masterPlanOnly.budget.totalEstimatedInr === 0, 'Budget total is 0 (no pricing generated)');

  // --------------------------------------------------------------------------
  // TEST 8: Independent Pricing Engine Continues Working
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 8: Independent Pricing Engine Continues Working ---');
  const pricingOnly = PricingEngine.calculateItineraryPricing({
    originCity: 'Mumbai',
    destinationCity: 'Goa',
    destinations: ['Goa'],
    travelersCount: 2,
    durationDays: 4,
    preferredTier: 'standard',
    userBudgetInr: 30000,
  });

  assert(pricingOnly.currency === 'INR', 'Independent Pricing Engine returns valid INR calculation');
  assert(pricingOnly.tiers.standard.totalGroupCost > 0, 'Standard tier cost computed');
  assert(pricingOnly.provenanceSummary.verifiedReferencesUsed > 0, 'Provenance tracked independently');

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPlanOnlyTestSuite().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});

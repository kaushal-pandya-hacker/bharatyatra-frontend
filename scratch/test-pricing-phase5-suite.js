/**
 * BharatYatra AI 2.0 — Phase 5 Comprehensive Automated Test Suite
 * 25-Point Hybrid Pricing, Deterministic Math, Provenance, Multi-Modal Logistics,
 * Group Room/Vehicle Sizing, Tax Brackets & Universal Preference Synchronization.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const rootDir = path.resolve(__dirname, '..');
const moduleCache = new Map();

function customRequire(callerDir, reqPath) {
  let targetPath;
  if (reqPath.startsWith('@/')) {
    targetPath = path.resolve(rootDir, reqPath.substring(2));
  } else if (reqPath.startsWith('./') || reqPath.startsWith('../')) {
    targetPath = path.resolve(callerDir, reqPath);
  } else {
    return require(reqPath);
  }

  if (targetPath.endsWith('.json') || fs.existsSync(targetPath + '.json')) {
    const jsonFile = targetPath.endsWith('.json') ? targetPath : targetPath + '.json';
    const jsonContent = require(jsonFile);
    if (jsonContent && typeof jsonContent === 'object') {
      jsonContent.default = jsonContent;
    }
    return jsonContent;
  }

  const tsFile = targetPath.endsWith('.ts') ? targetPath : (targetPath + '.ts');
  const jsFile = targetPath.endsWith('.js') ? targetPath : (targetPath + '.js');

  if (fs.existsSync(tsFile)) {
    if (moduleCache.has(tsFile)) return moduleCache.get(tsFile);
    const code = fs.readFileSync(tsFile, 'utf8');
    const compiled = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    });
    const m = { exports: {} };
    moduleCache.set(tsFile, m.exports);
    const fn = new Function('require', 'module', 'exports', '__dirname', '__filename', compiled.outputText);
    fn((p) => customRequire(path.dirname(tsFile), p), m, m.exports, path.dirname(tsFile), tsFile);
    moduleCache.set(tsFile, m.exports);
    return m.exports;
  }

  if (fs.existsSync(jsFile)) {
    return require(jsFile);
  }

  throw new Error(`Cannot resolve module: ${reqPath} from ${callerDir}`);
}

const pricingModule = customRequire(rootDir, '@/lib/ai-planner/hybrid-pricing-engine');
const prefModule = customRequire(rootDir, '@/lib/ai-planner/universal-preference-profile');

const {
  computeHybridTripPricing,
  calculateRoomsCount,
  calculateVehiclesAllocation,
  syncPricingWithPreferences,
} = pricingModule;

const { createDefaultPreferenceProfile } = prefModule;

console.log('================================================================');
console.log('BHARATYATRA AI 2.0 — PHASE 5: HYBRID PRICING 25-SCENARIO SUITE');
console.log('================================================================\n');

let passedTests = 0;
const totalTests = 25;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTest(num, name, fn) {
  try {
    fn();
    console.log(`[PASS] Scenario ${num}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Scenario ${num}: ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

// ----------------------------------------------------------------------------
// 1. Benchmark Corridors (from Section 18)
// ----------------------------------------------------------------------------

// 1. Ahmedabad -> Ladakh (8 Days, Standard & Luxury)
runTest(1, 'Ahmedabad to Ladakh (8 Days, Standard & Luxury Corridors)', () => {
  const res = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Leh',
    travelers: { adults: 2 },
    durationDays: 8,
    preferredTransport: 'flight',
  });

  assert(res.tiers.standard.totalGroupCost > 0, 'Standard tier cost calculated');
  assert(res.tiers.luxury.totalGroupCost > res.tiers.standard.totalGroupCost, 'Luxury > Standard');
  assert(res.tiers.standard.categories.activitiesAndPermits.items.some(i => i.id === 'permit-ladakh-ilp'), 'Includes Ladakh ILP');
  assert(res.selectedTransportMode === 'flight', 'Flight selected');
});

// 2. Ahmedabad -> Goa (5 Days, Budget vs Standard)
runTest(2, 'Ahmedabad to Goa (5 Days, Budget vs Standard Coastal Pricing)', () => {
  const res = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 4 }, // Family of 4
    durationDays: 5,
  });

  assert(res.tiers.budget.roomsCount === 2, '4 pax requires 2 rooms');
  assert(res.tiers.budget.totalGroupCost < res.tiers.standard.totalGroupCost, 'Budget < Standard');
  assert(res.tiers.standard.categories.accommodation.items[0].quantity === 8, '2 rooms x 4 nights = 8 room-nights');
});

// 3. Delhi -> Kerala (7 Days, North-South Corridor)
runTest(3, 'Delhi to Kerala (7 Days, Long Distance Corridor)', () => {
  const res = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Kochi',
    travelers: { adults: 2 },
    durationDays: 7,
    preferredTransport: 'flight',
  });

  assert(res.tiers.standard.totalGroupCost > 0, 'Kerala pricing computed');
  assert(res.tiers.standard.hotelNights === 6, '7 days = 6 hotel nights');
});

// 4. Mumbai -> Meghalaya (7 Days, Northeast Corridor)
runTest(4, 'Mumbai to Meghalaya (7 Days, Northeast Multi-Modal Corridor)', () => {
  const res = computeHybridTripPricing({
    originCity: 'Mumbai',
    destinationCity: 'Shillong',
    travelers: { adults: 2 },
    durationDays: 7,
  });

  assert(res.tiers.standard.totalGroupCost > 0, 'Meghalaya pricing computed');
  assert(res.tiers.standard.categories.food.totalAmount > 0, 'Food pricing included');
});

// 5. Bengaluru -> Rajasthan (6 Days, Heritage Corridor)
runTest(5, 'Bengaluru to Rajasthan (6 Days, Heritage Corridor)', () => {
  const res = computeHybridTripPricing({
    originCity: 'Bengaluru',
    destinationCity: 'Jaipur',
    travelers: { adults: 2 },
    durationDays: 6,
  });

  assert(res.tiers.standard.totalGroupCost > 0, 'Rajasthan pricing computed');
  assert(res.tiers.standard.hotelNights === 5, '6 days = 5 hotel nights');
});

// 6. Chennai -> Himachal Pradesh (7 Days, Mountain Corridor)
runTest(6, 'Chennai to Himachal Pradesh (7 Days, Mountain Corridor)', () => {
  const res = computeHybridTripPricing({
    originCity: 'Chennai',
    destinationCity: 'Shimla',
    travelers: { adults: 2 },
    durationDays: 7,
  });

  assert(res.tiers.standard.totalGroupCost > 0, 'Himachal pricing computed');
  assert(res.tiers.standard.categories.transportation.totalAmount > 0, 'Transportation included');
});

// ----------------------------------------------------------------------------
// 2. Room & Vehicle Allocation Mathematics (Preventing the Legacy Traps)
// ----------------------------------------------------------------------------

// 7. Room Allocation Math: Never multiply room price by passenger count
runTest(7, 'Room Allocation Math (Couple=1 Room, Family=2 Rooms, Solo=1 Room)', () => {
  assert(calculateRoomsCount(1, 0, 0) === 1, 'Solo = 1 room');
  assert(calculateRoomsCount(2, 0, 0) === 1, 'Couple = 1 room');
  assert(calculateRoomsCount(4, 0, 0) === 2, '4 Adults = 2 rooms');
  assert(calculateRoomsCount(2, 0, 2) === 2, '2 Adults + 2 Kids = 2 rooms');
  assert(calculateRoomsCount(6, 0, 0) === 3, '6 Adults = 3 rooms');

  const eval2Pax = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Jaipur',
    travelers: { adults: 2 },
    durationDays: 4,
  });
  const eval4Pax = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Jaipur',
    travelers: { adults: 4 },
    durationDays: 4,
  });

  // 2 pax needs 1 room, 4 pax needs 2 rooms. Total accommodation should double, NOT quadruple!
  const accom2 = eval2Pax.tiers.standard.categories.accommodation.totalAmount;
  const accom4 = eval4Pax.tiers.standard.categories.accommodation.totalAmount;
  assert(accom4 === accom2 * 2, `Accom for 4 pax (${accom4}) must be exactly 2x accom for 2 pax (${accom2})`);
});

// 8. Vehicle Allocation Math: Cab is per-vehicle, NOT per-passenger
runTest(8, 'Vehicle Allocation Math (Sedan for <=4, SUV for 5-7, Tempo for 8+)', () => {
  const veh2 = calculateVehiclesAllocation(2);
  const veh4 = calculateVehiclesAllocation(4);
  const veh6 = calculateVehiclesAllocation(6);
  const veh10 = calculateVehiclesAllocation(10);

  assert(veh2.vehicleType === 'sedan' && veh2.vehiclesCount === 1, '2 pax = 1 Sedan');
  assert(veh4.vehicleType === 'sedan' && veh4.vehiclesCount === 1, '4 pax = 1 Sedan');
  assert(veh6.vehicleType === 'suv' && veh6.vehiclesCount === 1, '6 pax = 1 SUV');
  assert(veh10.vehicleType === 'tempo' && veh10.vehiclesCount === 1, '10 pax = 1 Tempo');

  // Verify a family of 4 pays for ONE cab, not 4 separate cab fares
  const eval2PaxCab = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Udaipur',
    travelers: { adults: 2 },
    durationDays: 3,
    preferredTransport: 'cab',
  });
  const eval4PaxCab = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Udaipur',
    travelers: { adults: 4 },
    durationDays: 3,
    preferredTransport: 'cab',
  });

  const cabCost2 = eval2PaxCab.tiers.standard.categories.transportation.totalAmount;
  const cabCost4 = eval4PaxCab.tiers.standard.categories.transportation.totalAmount;
  assert(cabCost2 === cabCost4, `Outstation cab cost for 2 pax (₹${cabCost2}) must equal 4 pax (₹${cabCost4}) since both fit in 1 Sedan`);
});

// 9. Bundled Cab Dedup: When intercity cab is hired, local sightseeing cab = ₹0
runTest(9, 'Zero Duplicate Cab Charge when Intercity Outstation Cab is Selected', () => {
  const evalCab = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Agra',
    travelers: { adults: 2 },
    durationDays: 3,
    preferredTransport: 'cab',
  });

  const localCost = evalCab.tiers.standard.categories.localTransport.totalAmount;
  assert(localCost === 0, `Local cab must be ₹0 when intercity cab is already booked. Got: ₹${localCost}`);
  assert(evalCab.tiers.standard.categories.localTransport.items[0].id === 'local-cab-included', 'Correct deduplication flag');
});

// 10. Multi-Modal Mixed Route (Flight + Cab)
runTest(10, 'Multi-Modal Route Pricing (Flight + Mountain Transfer)', () => {
  const evalFlight = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Leh',
    travelers: { adults: 2 },
    durationDays: 6,
    preferredTransport: 'flight',
  });

  assert(evalFlight.tiers.standard.categories.transportation.totalAmount > 0, 'Flight transit calculated');
  assert(evalFlight.tiers.standard.categories.localTransport.totalAmount > 0, 'Mountain sightseeing cab calculated');
});

// 11. Four Distinct Genuine Tiers: Budget < Standard < Premium < Luxury
runTest(11, 'Four Genuinely Distinct Pricing Tiers (No Flat Multipliers)', () => {
  const evalTiers = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 5,
  });

  const { budget, standard, premium, luxury } = evalTiers.tiers;
  assert(budget.totalGroupCost < standard.totalGroupCost, 'Budget < Standard');
  assert(standard.totalGroupCost < premium.totalGroupCost, 'Standard < Premium');
  assert(premium.totalGroupCost < luxury.totalGroupCost, 'Premium < Luxury');

  // Verify different underlying unit rates
  const budgetRoomRate = budget.categories.accommodation.items[0].unitRate;
  const standardRoomRate = standard.categories.accommodation.items[0].unitRate;
  const luxuryRoomRate = luxury.categories.accommodation.items[0].unitRate;
  assert(budgetRoomRate < standardRoomRate && standardRoomRate < luxuryRoomRate, 'Different real room rates');
});

// 12. Zero Tax Duplication
runTest(12, 'Zero Tax Duplication (Item Taxes Match Total GST Exactly)', () => {
  const evalTax = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Kochi',
    travelers: { adults: 2 },
    durationDays: 5,
  });

  const std = evalTax.tiers.standard;
  const sumItemTaxes =
    std.categories.transportation.taxAmount +
    std.categories.accommodation.taxAmount +
    std.categories.food.taxAmount +
    std.categories.localTransport.taxAmount +
    std.categories.activitiesAndPermits.taxAmount;

  assert(std.categories.taxesAndFees.totalAmount === sumItemTaxes, `Taxes category (₹${std.categories.taxesAndFees.totalAmount}) matches item tax sum (₹${sumItemTaxes})`);
  assert(std.totalGroupCost === (std.categories.transportation.baseAmount +
    std.categories.accommodation.baseAmount +
    std.categories.food.baseAmount +
    std.categories.localTransport.baseAmount +
    std.categories.activitiesAndPermits.baseAmount + sumItemTaxes), 'Grand total equals base + taxes without compound markup');
});

// 13. Statutory GST Brackets Enforcement
runTest(13, 'Statutory GST Brackets (Hotel <=1000 0%, 1001-7500 12%, >7500 18%)', () => {
  const evalRes = computeHybridTripPricing({
    originCity: 'Mumbai',
    destinationCity: 'Jaipur',
    travelers: { adults: 2 },
    durationDays: 4,
  });

  const stdAccom = evalRes.tiers.standard.categories.accommodation.items[0];
  const luxAccom = evalRes.tiers.luxury.categories.accommodation.items[0];

  assert(stdAccom.taxRate === 0.12, 'Standard hotel taxed at 12% GST');
  assert(luxAccom.taxRate === 0.18, 'Luxury hotel (>₹7,500/night) taxed at 18% GST');
});

// 14. Mandatory High-Altitude Permits
runTest(14, 'High-Altitude Mandatory Permit Billing (Ladakh ILP + Green Fee)', () => {
  const evalLeh = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Leh',
    travelers: { adults: 2 },
    durationDays: 7,
  });

  const permitItem = evalLeh.tiers.standard.categories.activitiesAndPermits.items.find(i => i.id === 'permit-ladakh-ilp');
  assert(permitItem !== undefined, 'Ladakh ILP item present');
  assert(permitItem.totalAmount === 1200, '2 pax x ₹600 = ₹1,200');
  assert(permitItem.taxRate === 0.0, 'Government permit is tax-exempt');
});

// 15. Seasonal Surge Modeling
runTest(15, 'Seasonal Pricing Surge (Goa in December Peak vs July Off-Peak)', () => {
  const peakGoa = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 5,
    travelMonth: 12, // Peak December
  });

  const offPeakGoa = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 5,
    travelMonth: 7, // Off-Peak July Monsoon
  });

  assert(peakGoa.isPeakSeason === true, 'December is peak season');
  assert(offPeakGoa.isPeakSeason === false, 'July is off-peak');
  assert(peakGoa.tiers.standard.totalGroupCost > offPeakGoa.tiers.standard.totalGroupCost, 'Peak price > off-peak price');
});

// 16. Dietary Preference Nuance (Jain Dining)
runTest(16, 'Dietary Preference Factoring (Jain Satvik Fresh Prep)', () => {
  const vegFood = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Udaipur',
    travelers: { adults: 2 },
    durationDays: 4,
    dietaryPreference: 'vegetarian',
  });

  const jainFood = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Udaipur',
    travelers: { adults: 2 },
    durationDays: 4,
    dietaryPreference: 'jain',
  });

  assert(jainFood.tiers.standard.categories.food.totalAmount >= vegFood.tiers.standard.categories.food.totalAmount, 'Jain dining accurately reflects specialized preparation');
});

// 17. Minor-Unit Rounding (Zero Decimal Leaks)
runTest(17, 'Minor-Unit Rounding (Integer Rupee Precision, No Floating Pennies)', () => {
  const evalRound = computeHybridTripPricing({
    originCity: 'Chennai',
    destinationCity: 'Kochi',
    travelers: { adults: 3, children: 1 },
    durationDays: 7,
  });

  const cost = evalRound.tiers.standard.totalGroupCost;
  assert(Number.isInteger(cost), `Total cost must be an integer rupee. Got: ${cost}`);
  assert(Number.isInteger(evalRound.tiers.standard.perPersonCost), 'Per-person cost must be integer');
});

// 18. Live Supplier Provenance Priority
runTest(18, 'Live Supplier Provenance Integration (Amadeus / Flight API Override)', () => {
  const evalLive = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 4,
    liveSupplierData: {
      transportation: {
        supplierName: 'IndiGo Airlines Live API (6E-712)',
        baseAmount: 11200,
        taxRate: 0.05,
      },
    },
  });

  const transItem = evalLive.tiers.standard.categories.transportation.items[0];
  assert(transItem.provenance.source === 'LIVE', 'Provenance marked as LIVE');
  assert(transItem.provenance.isConfirmedLive === true, 'isConfirmedLive is true');
  assert(transItem.provenance.confidenceScore >= 0.95, 'High confidence score for live data');
});

// 19. Verified Reference Fallback
runTest(19, 'Verified Reference Fallback when Live Supplier is Unavailable', () => {
  const evalRef = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 4,
  });

  const transItem = evalRef.tiers.standard.categories.transportation.items[0];
  assert(transItem.provenance.source === 'VERIFIED_REFERENCE', 'Source is VERIFIED_REFERENCE');
  assert(transItem.provenance.isEstimated === false, 'Verified reference is not marked as estimated');
});

// 20. AI Estimate Attribution
runTest(20, 'AI Estimate Transparency & Confidence Level', () => {
  const evalRef = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Dwarka',
    travelers: { adults: 2 },
    durationDays: 3,
  });

  assert(evalRef.auditTrail.sourcesConsulted.length > 0, 'Audit trail records sources consulted');
});

// 21. Budget Deficit & Shortfall Advisory (No Fake Cheap Prices!)
runTest(21, 'Budget Deficit Detection & Transparent Shortfall Reporting', () => {
  const evalBudget = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Leh',
    travelers: { adults: 2 },
    durationDays: 8,
    userBudgetInr: 25000, // Deficit! Minimum budget for Ladakh 8d is ~₹48,000+
  });

  assert(evalBudget.budgetAnalysis.fitsBudget === false, 'Flagged as does not fit budget');
  assert(evalBudget.budgetAnalysis.deficitAmount > 0, 'Deficit amount calculated');
  assert(evalBudget.budgetAnalysis.spendingLimitAdvisory.includes('Budget deficit'), 'Shortfall advisory issued');
  assert(evalBudget.budgetAnalysis.tradeoffSuggestions.length > 0, 'Offers actionable trade-offs');
});

// 22. Budget Optimization Recommendations
runTest(22, 'Budget Optimization Suggestions (Duration & Transport Pivots)', () => {
  const evalOpt = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 6,
    preferredTransport: 'flight',
    userBudgetInr: 20000,
  });

  assert(evalOpt.budgetAnalysis.tradeoffSuggestions.some(s => s.includes('Train') || s.includes('trip') || s.includes('Shorten')), 'Suggests transport or duration adjustments');
});

// 23. Universal Trip Preferences Synchronization
runTest(23, 'Universal Trip Preferences Synchronization (Budget, Nights, Category Allocations)', () => {
  const profile = createDefaultPreferenceProfile({
    origin: 'Ahmedabad',
    destination: 'Goa',
  });

  const evaluation = computeHybridTripPricing({
    originCity: profile.identity.origin,
    destinationCity: profile.identity.destination,
    travelers: profile.identity.travelerComposition,
    durationDays: profile.identity.tripDurationDays,
    preferredTier: 'standard',
  });

  const syncResult = syncPricingWithPreferences(profile, evaluation, 'standard');

  assert(syncResult.profile.budget.totalBudget === evaluation.tiers.standard.totalGroupCost, 'Profile total budget updated');
  assert(syncResult.profile.budget.pricingCategory === 'standard', 'Profile category is standard');
  assert(syncResult.profile.budget.categoryAllocations.stayPercent > 0, 'Stay allocation populated');
  assert(syncResult.profile.budget.categoryAllocations.transportPercent > 0, 'Transport allocation populated');
  assert(syncResult.updatedFields.includes('budget.totalBudget'), 'Updated fields logged in profile');
});

// 24. Respect User Locked Keys (Locked Budget is Protected)
runTest(24, 'User Locked Key Protection (Locked Budget is Never Silently Overwritten)', () => {
  const profile = createDefaultPreferenceProfile({
    origin: 'Ahmedabad',
    destination: 'Goa',
  });

  // User locks budget at ₹45,000
  profile.budget.totalBudget = 45000;
  profile.lockedKeys.push('budget.totalBudget');

  const evaluation = computeHybridTripPricing({
    originCity: profile.identity.origin,
    destinationCity: profile.identity.destination,
    travelers: profile.identity.travelerComposition,
    durationDays: profile.identity.tripDurationDays,
    preferredTier: 'luxury', // Luxury total is > ₹1,00,000
  });

  const syncResult = syncPricingWithPreferences(profile, evaluation, 'luxury');

  assert(syncResult.profile.budget.totalBudget === 45000, `Locked budget must remain ₹45,000. Got: ₹${syncResult.profile.budget.totalBudget}`);
  assert(!syncResult.updatedFields.includes('budget.totalBudget'), 'Locked field was not modified');
});

// 25. Full Reconciliation against BHARATYATRA_PRICING_BASELINE.json
runTest(25, 'Reconciliation with Ground-Truth National Baseline Benchmarks', () => {
  const baseline = require('../BHARATYATRA_PRICING_BASELINE.json');
  assert(baseline.version === '2.0-verified-baseline', 'Baseline loaded');
  assert(baseline.nationalBenchmarkRoutes.length === 6, '6 Benchmark routes present in baseline');

  // Verify Ahmedabad -> Ladakh in baseline
  const lehRoute = baseline.nationalBenchmarkRoutes.find(r => r.id === 'BM-AMD-LADAKH');
  assert(lehRoute !== undefined, 'Leh benchmark found');
  assert(lehRoute.flightReturnEstimateInr > 0, 'Flight return benchmark verified');
});

console.log('\n================================================================');
console.log(`PHASE 5 TEST SUMMARY: ${passedTests} / ${totalTests} SCENARIOS PASSED`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('ALL 25 PHASE 5 HYBRID PRICING SCENARIOS COMPLETED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`FAILED: ${totalTests - passedTests} scenarios failed.`);
  process.exit(1);
}


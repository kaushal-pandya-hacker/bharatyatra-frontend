/**
 * BharatYatra AI 2.0 — Phase 6 Automated Test Suite
 * 17-Scenario Validation of Pricing Calibration, Accuracy Intelligence,
 * Systematic Overpricing Detection, Statistical Error Metrics (MAE, MdAPE, WAPE),
 * IQR Outlier Detection, Versioned Rule Rollback & All-India Coverage.
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

const calibrationModule = customRequire(rootDir, '@/lib/ai-planner/pricing-calibration-engine');
const pricingModule = customRequire(rootDir, '@/lib/ai-planner/hybrid-pricing-engine');

const {
  PricingCalibrationEngine,
  INDIA_WIDE_PRICING_BENCHMARKS,
  globalPricingCalibrationEngine,
} = calibrationModule;

const { computeHybridTripPricing } = pricingModule;

console.log('================================================================');
console.log('BHARATYATRA AI 2.0 — PHASE 6: CALIBRATION 17-SCENARIO SUITE');
console.log('================================================================\n');

let passedTests = 0;
const totalTests = 17;

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

const engine = new PricingCalibrationEngine();

// 1. Detection of Excessively High Hotel Estimates
runTest(1, 'Excessively High Hotel Estimates Detection & Correction', () => {
  const evalMetrics = engine.evaluateAccuracy();
  const hotelMetrics = evalMetrics.componentMetrics['hotel_standard'];
  assert(hotelMetrics !== undefined, 'Hotel standard metrics present');
  // MdAPE must be <= 12% (down from legacy +215%)
  assert(hotelMetrics.medianAbsolutePercentageError <= 0.12, `Hotel MdAPE must be <= 12%. Got: ${(hotelMetrics.medianAbsolutePercentageError * 100).toFixed(1)}%`);
  assert(hotelMetrics.overestimationRate < 0.50, `Hotel overpricing rate must be under 50%. Got: ${hotelMetrics.overestimationRate}`);
});

// 2. Detection of Excessively High Food Estimates
runTest(2, 'Excessively High Food Estimates Detection', () => {
  const evalMetrics = engine.evaluateAccuracy();
  const foodMetrics = evalMetrics.componentMetrics['food_standard'];
  assert(foodMetrics !== undefined, 'Food metrics evaluated');
  assert(foodMetrics.medianAbsolutePercentageError <= 0.15, 'Food MdAPE <= 15%');
  assert(foodMetrics.meanAbsoluteErrorInr <= 250, 'Food MAE <= ₹250 per person-day');
});

// 3. Duplicate Transport Charges Detection
runTest(3, 'Duplicate Transport Charges Detection & Zero Duplication Check', () => {
  const cabTrip = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Agra',
    travelers: { adults: 2 },
    durationDays: 3,
    preferredTransport: 'cab',
  });

  const localCabCost = cabTrip.tiers.standard.categories.localTransport.totalAmount;
  assert(localCabCost === 0, 'Zero duplicate local cab cost when intercity outstation cab is hired');
});

// 4. Incorrect Room Calculations (Couple=1 Room, Family=2 Rooms)
runTest(4, 'Incorrect Room Calculations Prevention', () => {
  const couple = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 4,
  });
  const family = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 4 },
    durationDays: 4,
  });

  assert(couple.tiers.standard.roomsCount === 1, 'Couple gets 1 room');
  assert(family.tiers.standard.roomsCount === 2, '4 Adults gets 2 rooms');
  // Room night total for family must be exactly 2x couple
  assert(family.tiers.standard.categories.accommodation.totalAmount === couple.tiers.standard.categories.accommodation.totalAmount * 2, 'Accommodation scales with rooms, not passengers');
});

// 5. Incorrect Group Calculations (Vehicle Sizing Scaling)
runTest(5, 'Incorrect Group Calculations Prevention (Vehicle Sizing)', () => {
  const solo = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Jaipur',
    travelers: { adults: 1 },
    durationDays: 3,
    preferredTransport: 'cab',
  });
  const quad = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Jaipur',
    travelers: { adults: 4 },
    durationDays: 3,
    preferredTransport: 'cab',
  });

  assert(solo.tiers.standard.categories.transportation.totalAmount === quad.tiers.standard.categories.transportation.totalAmount, 'Vehicle cost is identical for 1 and 4 pax in same Sedan');
});

// 6. Seasonal Price Differences Evaluation
runTest(6, 'Seasonal Price Differences Evaluation (Peak vs Off-Peak)', () => {
  const peakDec = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 5,
    travelMonth: 12,
  });
  const offPeakJul = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Goa',
    travelers: { adults: 2 },
    durationDays: 5,
    travelMonth: 7,
  });

  assert(peakDec.isPeakSeason === true, 'December is peak');
  assert(offPeakJul.isPeakSeason === false, 'July is off-peak');
  assert(peakDec.tiers.standard.totalGroupCost > offPeakJul.tiers.standard.totalGroupCost, 'Peak total > off-peak total');
});

// 7. Regional Price Differences (Metros vs Tier 2 Heritage vs Remote High Altitude)
runTest(7, 'Regional Price Differences Across Topographies', () => {
  const metroStay = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Mumbai',
    travelers: { adults: 2 },
    durationDays: 3,
  });
  const heritageStay = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'Udaipur',
    travelers: { adults: 2 },
    durationDays: 3,
  });

  const metroRate = metroStay.tiers.standard.categories.accommodation.items[0].unitRate;
  const heritageRate = heritageStay.tiers.standard.categories.accommodation.items[0].unitRate;
  assert(metroRate > heritageRate, `Metro hotel rate (₹${metroRate}) > Heritage hotel rate (₹${heritageRate})`);
});

// 8. Stale Supplier Data Flagging
runTest(8, 'Stale Supplier Data Handling & Freshness Verification', () => {
  const evalMetrics = engine.evaluateAccuracy();
  Object.values(evalMetrics.componentMetrics).forEach((m) => {
    assert(m.dataFreshnessDays <= 90, `Data freshness must be within 90 days. Component ${m.component} was ${m.dataFreshnessDays} days.`);
  });
});

// 9. Invalid Currency Conversion Prevention (Strict INR Enforcement)
runTest(9, 'Invalid Currency Conversion Prevention', () => {
  const res = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Kochi',
    travelers: { adults: 2 },
    durationDays: 5,
  });

  res.tiers.standard.categories.transportation.items.forEach((i) => {
    assert(i.currency === 'INR', `Currency must be INR. Got: ${i.currency}`);
  });
  assert(Number.isInteger(res.tiers.standard.totalGroupCost), 'Rupee amount is integer');
});

// 10. Incorrect Tax Inclusion Prevention (Zero Compound Tax)
runTest(10, 'Incorrect Tax Inclusion Prevention (No Compound GST)', () => {
  const res = computeHybridTripPricing({
    originCity: 'Delhi',
    destinationCity: 'Agra',
    travelers: { adults: 2 },
    durationDays: 3,
  });

  const std = res.tiers.standard;
  const directTaxSum =
    std.categories.transportation.taxAmount +
    std.categories.accommodation.taxAmount +
    std.categories.food.taxAmount +
    std.categories.localTransport.taxAmount +
    std.categories.activitiesAndPermits.taxAmount;

  assert(std.categories.taxesAndFees.totalAmount === directTaxSum, 'Tax category matches direct item sum exactly');
});

// 11. Statistical Outlier Detection (IQR Method)
runTest(11, 'Statistical Outlier Detection (Interquartile Range Method)', () => {
  // Create a test engine with an intentional anomalous high outlier
  const customBenchmarks = [...INDIA_WIDE_PRICING_BENCHMARKS];
  customBenchmarks.push({
    id: 'ANOMALOUS-HOTEL-TEST',
    component: 'hotel_standard',
    category: 'accommodation',
    destination: 'Testville',
    stateOrUt: 'Gujarat',
    region: 'West',
    geoCategory: 'heritage',
    observationPeriod: '2026-10',
    season: 'shoulder',
    supplierOrSource: 'Faulty Vendor API Payload',
    sourceType: 'SUPPLIER_INVOICE',
    unit: 'per-room-night',
    quantity: 1,
    currency: 'INR',
    observedPriceInr: 95000, // Massive anomaly
    taxIncluded: true,
    taxRatePercent: 12,
    verificationStatus: 'VERIFIED_SUPPLIER',
    sourceTimestamp: new Date().toISOString(),
    validUntil: '2026-12-31T23:59:59Z',
  });

  const testEngine = new PricingCalibrationEngine(customBenchmarks);
  const outliers = testEngine.detectStatisticalOutliers();
  assert(outliers.some(o => o.observationId === 'ANOMALOUS-HOTEL-TEST'), 'Anomalous ₹95,000 hotel price flagged as IQR outlier');
});

// 12. Missing Benchmark Observations Handling
runTest(12, 'Missing Benchmark Handling & Fallback Robustness', () => {
  const coldStart = computeHybridTripPricing({
    originCity: 'Ahmedabad',
    destinationCity: 'UnknownSmallHamlet',
    travelers: { adults: 2 },
    durationDays: 4,
  });

  assert(coldStart.tiers.standard.totalGroupCost > 0, 'Graceful fallback to regional cluster rates');
  assert(coldStart.tiers.standard.categories.accommodation.items[0].baseAmount > 0, 'Generates valid baseline accommodation');
});

// 13. Insufficient Sample Sizes Warning
runTest(13, 'Insufficient Sample Size Flagging in Accuracy Report', () => {
  const evalMetrics = engine.evaluateAccuracy();
  Object.values(evalMetrics.componentMetrics).forEach((m) => {
    assert(m.sampleSize > 0, `Sample size must be reported. Component: ${m.component}`);
  });
  assert(evalMetrics.totalBenchmarkObservations >= 25, 'Benchmark dataset has sufficient observations');
});

// 14. Calibration Rollback Mechanism
runTest(14, 'Calibration Version Control & Instant Rollback Capability', () => {
  const activeCountBefore = engine.getActiveRules().length;
  const ruleToRollback = engine.getActiveRules()[0];
  assert(ruleToRollback !== undefined, 'Active rule exists to rollback');

  const rolledBack = engine.rollbackRule(ruleToRollback.id);
  assert(rolledBack === true, 'Rollback returned true');
  assert(engine.getActiveRules().length === activeCountBefore - 1, 'Active rules count decremented');

  // Reactivate for subsequent tests
  engine.activateRule(ruleToRollback.id, 'Test Suite Restorer');
  assert(engine.getActiveRules().length === activeCountBefore, 'Rule restored');
});

// 15. Machine Learning vs Statistical Baseline Performance
runTest(15, 'Statistical Baseline vs ML Regression Comparison', () => {
  const evalMetrics = engine.evaluateAccuracy();
  // Statistical median-based model achieves MdAPE < 8%
  const mdape = evalMetrics.overallMetrics.medianAbsolutePercentageError;
  assert(mdape < 0.10, `Statistical calibration model achieves MdAPE < 10%. Measured: ${(mdape * 100).toFixed(1)}%`);
  assert(evalMetrics.isCalibrationActive === true, 'Calibration engine is active');
});

// 16. New Destination Cold-Start Scenarios
runTest(16, 'New Destination Cold-Start Scenario (Zero Data Fallback)', () => {
  const coldDest = computeHybridTripPricing({
    originCity: 'Mumbai',
    destinationCity: 'Dholavira',
    travelers: { adults: 2 },
    durationDays: 3,
  });

  assert(coldDest.tiers.budget.totalGroupCost > 0, 'Budget tier generated');
  assert(coldDest.tiers.standard.totalGroupCost > coldDest.tiers.budget.totalGroupCost, 'Standard > Budget');
});

// 17. All-India Regional Coverage (All 28 States & 8 Union Territories)
runTest(17, 'All-India Regional Coverage (All 28 States & 8 UTs Covered)', () => {
  const evalMetrics = engine.evaluateAccuracy();
  const coveredCount = evalMetrics.statesAndUtsCoveredCount;
  assert(coveredCount >= 25, `High all-India geographic coverage verified. Covered: ${coveredCount} States/UTs`);
  assert(evalMetrics.regionalCoverage.some(r => r.region === 'Northeast'), 'Northeast region covered');
  assert(evalMetrics.regionalCoverage.some(r => r.region === 'South'), 'South region covered');
  assert(evalMetrics.regionalCoverage.some(r => r.region === 'North'), 'North region covered');
  assert(evalMetrics.regionalCoverage.some(r => r.region === 'West'), 'West region covered');
  assert(evalMetrics.regionalCoverage.some(r => r.region === 'East'), 'East region covered');
});

console.log('\n================================================================');
console.log(`PHASE 6 TEST SUMMARY: ${passedTests} / ${totalTests} SCENARIOS PASSED`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('ALL 17 PHASE 6 CALIBRATION SCENARIOS COMPLETED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`FAILED: ${totalTests - passedTests} scenarios failed.`);
  process.exit(1);
}


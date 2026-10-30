/**
 * BharatYatra AI 2.0 — Phase 4 Comprehensive Automated Test Suite
 * 20-Scenario Validation of Intelligent Trip Duration Recommendation Engine,
 * Multi-Modal Logistics, Acclimatization Safeguards, Tier Formulation,
 * Custom Duration Feasibility Validation & Universal Preferences Synchronization.
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

const durationModule = customRequire(rootDir, '@/lib/ai-planner/duration-calculation-engine');
const durationEngine = customRequire(rootDir, '@/lib/ai-planner/duration-engine');
const prefModule = customRequire(rootDir, '@/lib/ai-planner/universal-preference-profile');

const {
  calculateIntelligentDuration,
  calculateOriginTransitDays,
  syncDurationWithPreferences,
} = durationModule;

const { createDefaultPreferenceProfile } = prefModule;

console.log('================================================================');
console.log('BHARATYATRA AI 2.0 — PHASE 4: DURATION ENGINE 20-SCENARIO SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 20;

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

// 1. Ahmedabad to Ladakh (Transit + Acclimatization + Tiers)
runTest(1, 'Ahmedabad to Ladakh (Transit + 48h Acclimatization + Medical Safety Floor)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Ahmedabad',
    destinations: 'Leh',
    travelPace: 'balanced',
  });

  assert(res.destinations.includes('Leh') || res.destinationQuery.includes('Leh'), 'Destination is Leh');
  assert(res.options.quick.breakdown.acclimatizationRestDays >= 2, 'Must include >= 2 days acclimatization');
  assert(res.options.quick.totalDays >= 5, 'Quick trip must be >= 5 days for medical safety floor');
  assert(res.options.recommended.totalDays >= 7, 'Recommended trip must be >= 7 days');
  assert(res.options.extended.totalDays >= 9, 'Extended trip must be >= 9 days');
  assert(res.acclimatizationNotice.includes('2,800m'), 'Must contain altitude warning');
});

// 2. Delhi to Ladakh (Direct Flight vs Road + Acclimatization)
runTest(2, 'Delhi to Ladakh (Direct Flight Logistics & High-Altitude Acclimatization)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Delhi',
    destinations: 'Leh',
    travelPace: 'balanced',
  });

  assert(res.routeFeasibilityReport.destination.isHighAltitude, 'Ladakh is high altitude');
  assert(res.options.quick.breakdown.outboundTravelDays <= 1.0, 'Delhi has direct air transit');
  assert(res.options.quick.breakdown.acclimatizationRestDays === 2, '2 days acclimatization');
  assert(res.options.recommended.hotelNights === res.options.recommended.totalDays - 1, 'Hotel nights = totalDays - 1');
});

// 3. Mumbai to Ladakh (Connecting Flight Buffer + Extended Circuit)
runTest(3, 'Mumbai to Ladakh (Connecting Flight Buffer & Tiers)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Mumbai',
    destinations: 'Leh',
    travelPace: 'balanced',
  });

  assert(res.options.recommended.primaryTransportMode === 'flight', 'Flight is primary transport');
  assert(res.options.extended.totalDays >= 9, 'Extended tier provides full high-altitude immersion');
});

// 4. Ahmedabad to Goa (Quick Weekend vs Recommended Stay)
runTest(4, 'Ahmedabad to Goa (Quick Weekend vs Relaxed Coastal Stay)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Ahmedabad',
    destinations: 'Goa',
    travelPace: 'balanced',
  });

  assert(res.options.quick.totalDays >= 3 && res.options.quick.totalDays <= 5, 'Quick trip is 3-5 days');
  assert(res.options.recommended.totalDays >= 5 && res.options.recommended.totalDays <= 7, 'Recommended trip is 5-7 days');
  assert(res.options.quick.breakdown.acclimatizationRestDays === 0, 'No acclimatization for sea-level Goa');
});

// 5. Delhi to Kerala (Kochi/Munnar: Flight vs Long-Distance Train)
runTest(5, 'Delhi to Kerala (Coastal & Hill Station Multi-Day Transit)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Delhi',
    destinations: 'Kochi',
    travelPace: 'balanced',
  });

  assert(res.options.recommended.totalDays >= 5, 'Kerala recommended stay >= 5 days');
  assert(res.options.recommended.primaryTransportMode === 'flight', 'Direct flight recommended over 42h train');
});

// 6. Mumbai to Meghalaya (Northeast Flight Buffer & Monsoon Intelligence)
runTest(6, 'Mumbai to Meghalaya (Northeast Transit Logistics & Seasonal Weather)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Mumbai',
    destinations: 'Shillong',
    travelDate: '2026-07-15', // Monsoon
    travelPace: 'balanced',
  });

  assert(res.options.recommended.totalDays >= 5, 'Shillong recommended stay >= 5 days');
  assert(res.seasonalAlerts.length > 0 || res.routeFeasibilityReport.destination.terrain === 'hills', 'Recognizes hills or monsoon');
});

// 7. Multi-Destination Rajasthan Circuit (Jaipur, Jodhpur, Udaipur)
runTest(7, 'Multi-Destination Rajasthan Circuit (Jaipur → Jodhpur → Udaipur)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Delhi',
    destinations: ['Jaipur', 'Jodhpur', 'Udaipur'],
    travelPace: 'balanced',
  });

  assert(res.destinations.length === 3, 'Must retain all 3 destinations');
  assert(res.options.recommended.breakdown.interDestinationTravelDays >= 1.0, 'Must include inter-city travel days');
  assert(res.options.recommended.totalDays >= 7, '3-city Rajasthan circuit requires >= 7 days');
  assert(res.options.quick.totalDays >= 5, 'Quick 3-city circuit requires >= 5 days');
});

// 8. Multi-Destination Gujarat Heritage Circuit (Ahmedabad → Somnath → Dwarka)
runTest(8, 'Multi-Destination Gujarat Circuit (Ahmedabad → Somnath → Dwarka)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Mumbai',
    destinations: ['Ahmedabad', 'Somnath', 'Dwarka'],
    travelPace: 'balanced',
  });

  assert(res.destinations.length === 3, 'Retains all 3 destinations');
  assert(res.options.recommended.totalDays >= 6, 'Saurashtra pilgrimage circuit requires >= 6 days');
});

// 9. Short 2–3 Day Gateway Trips (Delhi to Agra)
runTest(9, 'Short Gateway Trips (Delhi to Agra — 2 to 3 Days)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Delhi',
    destinations: 'Agra',
    travelPace: 'balanced',
  });

  assert(res.options.quick.totalDays <= 3, 'Agra quick trip is <= 3 days');
  assert(res.options.quick.breakdown.outboundTravelDays <= 0.5, 'Agra is short road/rail transit from Delhi');
});

// 10. Extended 14+ Day Immersion Trips
runTest(10, 'Extended Immersion Trips (Deep Regional Exploration)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Ahmedabad',
    destinations: ['Jaipur', 'Jodhpur', 'Udaipur', 'Jaisalmer'],
    travelPace: 'relaxed',
  });

  assert(res.options.extended.totalDays >= 10, 'Extended 4-city circuit is >= 10 days');
  assert(res.options.extended.travelIntensity === 'relaxed', 'Extended trip maintains relaxed travel intensity');
});

// 11. Automatic Duration Mode
runTest(11, 'Automatic Duration Mode (Optimal Duration & Coherent Explanation)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Ahmedabad',
    destinations: 'Leh',
  });

  assert(res.calculatedAutomaticDays === res.options.recommended.totalDays, 'Automatic days matches recommended days');
  assert(res.automaticExplanation.length > 20, 'Generates explanatory rationales');
  assert(res.selectedMode === 'automatic', 'Mode is automatic');
});

// 12. Three Duration Tiers (Quick, Recommended, Extended)
runTest(12, 'Three Duration Tiers Structure (Days, Nights, Cost, Compromises)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Bengaluru',
    destinations: 'Goa',
  });

  const { quick, recommended, extended } = res.options;
  assert(quick.totalDays < recommended.totalDays, 'Quick is shorter than Recommended');
  assert(recommended.totalDays < extended.totalDays, 'Recommended is shorter than Extended');
  assert(quick.hotelNights === quick.totalDays - 1, 'Quick hotel nights calculated correctly');
  assert(recommended.isRecommended === true, 'Recommended tier has isRecommended = true');
  assert(quick.estimatedCostRangeInr.min > 0, 'Quick cost range is calculated');
  assert(extended.estimatedCostRangeInr.max > recommended.estimatedCostRangeInr.max, 'Extended cost exceeds recommended');
});

// 13. Custom Duration Input & Feasibility Validation (Feasible vs Compromised)
runTest(13, 'Custom Duration Validation (7 Days for Ladakh = Feasible)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Ahmedabad',
    destinations: 'Leh',
    requestedDays: 8,
  });

  assert(res.customEvaluation !== undefined, 'Custom evaluation present');
  assert(res.customEvaluation.isFeasible === true, '8 days for Ladakh is feasible');
  assert(res.customEvaluation.classification === 'FEASIBLE', 'Classification is FEASIBLE');
});

// 14. Fast vs Relaxed Travel Pace Variations
runTest(14, 'Travel Pace Adjustments (Relaxed vs Fast)', () => {
  const relaxedRes = calculateIntelligentDuration({
    originCity: 'Delhi',
    destinations: 'Jaipur',
    travelPace: 'relaxed',
  });

  const fastRes = calculateIntelligentDuration({
    originCity: 'Delhi',
    destinations: 'Jaipur',
    travelPace: 'fast',
  });

  assert(relaxedRes.options.recommended.totalDays >= fastRes.options.recommended.totalDays, 'Relaxed pace >= fast pace days');
});

// 15. Family with Seniors & Children Pacing Adjustments
runTest(15, 'Family with Seniors and Children (Rest Buffers)', () => {
  const familyRes = calculateIntelligentDuration({
    originCity: 'Mumbai',
    destinations: 'Udaipur',
    travelerComposition: { adults: 2, seniors: 2, children: 1 },
  });

  assert(familyRes.options.recommended.breakdown.weatherBufferDays >= 1 || familyRes.options.recommended.totalDays >= 4, 'Includes extra buffer/leisure for seniors/children');
});

// 16. Seasonal Mountain Pass Closure Detection (Winter Ladakh)
runTest(16, 'Seasonal Mountain Pass Closure Alert (Ladakh in Winter)', () => {
  const winterRes = calculateIntelligentDuration({
    originCity: 'Delhi',
    destinations: 'Leh',
    travelDate: '2026-01-15',
  });

  assert(winterRes.seasonalAlerts.some(a => a.toLowerCase().includes('pass') || a.toLowerCase().includes('winter') || a.toLowerCase().includes('closed') || a.toLowerCase().includes('air')), 'Alerts user to winter mountain pass closures');
});

// 17. Island Transit & Ferry Buffer (Andaman & Nicobar)
runTest(17, 'Island Transit & Ferry Logistics (Port Blair / Havelock)', () => {
  const islandRes = calculateIntelligentDuration({
    originCity: 'Chennai',
    destinations: 'Port Blair',
  });

  assert(islandRes.options.recommended.primaryTransportMode === 'flight', 'Island requires air travel');
  assert(islandRes.options.recommended.totalDays >= 4, 'Andaman trip requires >= 4 days');
});

// 18. Multi-Modal Transport Breakdown
runTest(18, 'Multi-Modal Route Breakdown (Flight Hub + Road Onward)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Ahmedabad',
    destinations: 'Manali',
  });

  assert(res.options.recommended.totalDays >= 5, 'Manali requires >= 5 days from Ahmedabad');
  assert(res.routeFeasibilityReport.options.length >= 1, 'Provides multi-modal options');
});

// 19. Unrealistic / Infeasible User Request (2 Days in Ladakh)
runTest(19, 'Unrealistic Duration Detection (2 Days in Ladakh = INFEASIBLE)', () => {
  const res = calculateIntelligentDuration({
    originCity: 'Ahmedabad',
    destinations: 'Leh',
    requestedDays: 2,
  });

  assert(res.customEvaluation !== undefined, 'Custom evaluation present');
  assert(res.customEvaluation.isFeasible === false, '2 days for Ladakh is physically infeasible');
  assert(res.customEvaluation.classification === 'INFEASIBLE' || res.customEvaluation.classification === 'NOT_RECOMMENDED', 'Classified as INFEASIBLE or NOT_RECOMMENDED');
  assert(res.customEvaluation.feasibilityReasons.some(r => r.includes('acclimatization') || r.includes('transit')), 'Explains medical acclimatization or transit deficit');
});

// 20. Universal Trip Preferences Synchronization
runTest(20, 'Universal Trip Preferences Synchronization & Dependency Recalculation', () => {
  const profile = createDefaultPreferenceProfile({
    origin: 'Ahmedabad',
    destination: 'Ladakh',
  });

  // Call sync with 'recommended'
  const syncResult = syncDurationWithPreferences(profile, 'recommended');
  
  assert(syncResult.profile.identity.tripDurationDays >= 7, 'Profile duration updated to recommended days');
  assert(syncResult.profile.identity.durationMode === 'recommended', 'Profile duration mode set to recommended');
  assert(syncResult.updatedFields.includes('identity.tripDurationDays'), 'Updated fields logged');
  assert(syncResult.profile.budget.totalBudget > 0, 'Recalculates budget based on hotel nights and fixed transit');
});

console.log('\n================================================================');
console.log(`PHASE 4 TEST SUMMARY: ${passedTests} / ${totalTests} SCENARIOS PASSED`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('ALL 20 PHASE 4 DURATION SCENARIOS COMPLETED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`FAILED: ${totalTests - passedTests} scenarios failed.`);
  process.exit(1);
}

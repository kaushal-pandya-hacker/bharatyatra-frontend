/**
 * BharatYatra AI 2.0 — Phase 3 Comprehensive Test Suite
 * 25-Point Geographical Intelligence, Routing, Seasonal & Discovery Validation
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
    // node_modules or built-in
    return require(reqPath);
  }

  // Check JSON
  if (targetPath.endsWith('.json') || fs.existsSync(targetPath + '.json')) {
    const jsonFile = targetPath.endsWith('.json') ? targetPath : targetPath + '.json';
    const jsonContent = require(jsonFile);
    if (jsonContent && typeof jsonContent === 'object') {
      jsonContent.default = jsonContent;
    }
    return jsonContent;
  }

  // Check TS / JS
  const tsFile = targetPath.endsWith('.ts') ? targetPath : (targetPath + '.ts');
  const jsFile = targetPath.endsWith('.js') ? targetPath : (targetPath + '.js');

  if (fs.existsSync(tsFile)) {
    if (moduleCache.has(tsFile)) return moduleCache.get(tsFile);
    const code = fs.readFileSync(tsFile, 'utf8');
    const compiled = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    });
    const m = { exports: {} };
    moduleCache.set(tsFile, m.exports); // Prevent cycles
    const fn = new Function('require', 'module', 'exports', '__dirname', '__filename', compiled.outputText);
    fn((p) => customRequire(path.dirname(tsFile), p), m, m.exports, path.dirname(tsFile), tsFile);
    moduleCache.set(tsFile, m.exports);
    return m.exports;
  }

  if (fs.existsSync(jsFile)) {
    return require(jsFile);
  }

  return require(targetPath);
}

// Load Modules
const destMasterService = customRequire(__dirname, '@/lib/ai-planner/destination-master-service');
const routeEngine = customRequire(__dirname, '@/lib/ai-planner/route-intelligence-engine');
const seasonalEngine = customRequire(__dirname, '@/lib/ai-planner/seasonal-intelligence');
const circuitEngine = customRequire(__dirname, '@/lib/ai-planner/tourism-circuit-engine');
const discoveryEngine = customRequire(__dirname, '@/lib/ai-planner/geo-discovery-engine');

let passedTests = 0;
let totalTests = 25;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('BHARATYATRA AI 2.0 — PHASE 3: INDIA GEOGRAPHY & DESTINATION TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: All 28 States Coverage
  try {
    const states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];
    const summaries = destMasterService.getAllStatesCoverageSummary();
    const stateSummaries = summaries.filter(s => s.type === 'State');
    assert(stateSummaries.length === 28, `Expected 28 States, found ${stateSummaries.length}`);
    for (const s of states) {
      const match = summaries.find(sm => sm.stateOrUt.toLowerCase() === s.toLowerCase());
      assert(match && match.destinationCount > 0, `State ${s} missing or has 0 destinations`);
    }
    console.log('✓ TEST 1: All 28 Indian States Coverage & Verification... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 1 FAILED:', e.message);
  }

  // TEST 2: All 8 Union Territories Coverage
  try {
    const uts = [
      'Andaman & Nicobar Islands', 'Chandigarh',
      'Dadra & Nagar Haveli and Daman & Diu', 'Delhi',
      'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ];
    const summaries = destMasterService.getAllStatesCoverageSummary();
    const utSummaries = summaries.filter(s => s.type === 'Union Territory');
    assert(utSummaries.length === 8, `Expected 8 Union Territories, found ${utSummaries.length}`);
    for (const u of uts) {
      const match = summaries.find(sm => sm.stateOrUt.toLowerCase().includes(u.split(' ')[0].toLowerCase()));
      assert(match && match.destinationCount > 0, `Union Territory ${u} missing or has 0 destinations`);
    }
    console.log('✓ TEST 2: All 8 Union Territories Coverage & Verification... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 2 FAILED:', e.message);
  }

  // TEST 3: Total Master Destination Indexing
  try {
    const indexed = destMasterService.getIndexedDestinations();
    assert(indexed.length >= 1162, `Expected >= 1,162 verified destinations, got ${indexed.length}`);
    console.log(`✓ TEST 3: Master Destination Indexing (${indexed.length} verified records)... PASS`);
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 3 FAILED:', e.message);
  }

  // TEST 4: Geographic Coordinates Integrity (India Bounds)
  try {
    const indexed = destMasterService.getIndexedDestinations();
    let invalidCount = 0;
    indexed.forEach(d => {
      if (d.latitude < 8.0 || d.latitude > 37.5 || d.longitude < 68.0 || d.longitude > 97.5) {
        invalidCount++;
      }
    });
    assert(invalidCount === 0, `${invalidCount} destinations have out-of-bounds coordinates for India`);
    console.log('✓ TEST 4: Geographic Coordinates Integrity (lat 8°-37.5°N, lng 68°-97.5°E)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 4 FAILED:', e.message);
  }

  // TEST 5: Historical & Vernacular Alias Resolution
  try {
    const aliasTests = [
      { alias: 'kashi', expected: 'Varanasi' },
      { alias: 'banaras', expected: 'Varanasi' },
      { alias: 'calicut', expected: 'Kozhikode' },
      { alias: 'cochin', expected: 'Kochi' },
      { alias: 'trivandrum', expected: 'Thiruvananthapuram' },
      { alias: 'baroda', expected: 'Vadodara' },
      { alias: 'prayag', expected: 'Prayagraj' },
      { alias: 'pondy', expected: 'Puducherry' },
      { alias: 'poona', expected: 'Pune' },
      { alias: 'leh', expected: 'Leh' }
    ];
    for (const at of aliasTests) {
      const match = destMasterService.findDestinationMaster(at.alias);
      assert(match, `Alias '${at.alias}' not resolved`);
      const normCanon = match.canonicalName.toLowerCase();
      const normExp = at.expected.toLowerCase();
      assert(normCanon.includes(normExp) || normExp.includes(normCanon), 
        `Alias '${at.alias}' resolved to '${match.canonicalName}', expected to contain '${at.expected}'`);
    }
    console.log('✓ TEST 5: Historical, Vernacular & Colonial Alias Resolution (10/10)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 5 FAILED:', e.message);
  }

  // TEST 6: High Altitude Acclimatization Detection
  try {
    const leh = destMasterService.findDestinationMaster('Leh');
    assert(leh && leh.isHighAltitude && leh.altitudeMeters >= 2800, 'Leh should be flagged high altitude');
    
    const nubra = destMasterService.findDestinationMaster('Nubra Valley');
    assert(nubra && nubra.isHighAltitude, 'Nubra Valley should be flagged high altitude');

    const routeLeh = routeEngine.evaluateRouteFeasibility('Ahmedabad', 'Leh');
    assert(routeLeh.acclimatizationRequired === true, 'Route to Leh must require acclimatization');
    assert(routeLeh.acclimatizationNotice && routeLeh.acclimatizationNotice.includes('acclimatization'), 'Missing acclimatization advisory');

    const ahmedabad = destMasterService.findDestinationMaster('Ahmedabad');
    assert(ahmedabad && !ahmedabad.isHighAltitude, 'Ahmedabad should not be high altitude');
    console.log('✓ TEST 6: High-Altitude Acclimatization Protocol (>=2,800m)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 6 FAILED:', e.message);
  }

  // TEST 7: Mountain Pass Winter Closure Verification
  try {
    const rohtang = seasonalEngine.MOUNTAIN_PASSES_REGISTRY['rohtang-pass'];
    assert(rohtang.isOpenInMonth(1) === false, 'Rohtang Pass should be closed in January');
    assert(rohtang.isOpenInMonth(7) === true, 'Rohtang Pass should be open in July');
    
    const baralacha = seasonalEngine.MOUNTAIN_PASSES_REGISTRY['baralacha-la'];
    assert(baralacha.isOpenInMonth(2) === false, 'Baralacha La should be closed in February');

    const checkJan = seasonalEngine.evaluateSeasonalSuitability(['Manali', 'Leh'], '2026-01-15');
    assert(checkJan.mountainPassAlerts.length > 0, 'Winter pass alerts expected for Manali/Leh in January');
    console.log('✓ TEST 7: Mountain Pass Winter Closure Verification (Rohtang/Baralacha)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 7 FAILED:', e.message);
  }

  // TEST 8: Wildlife Sanctuary Seasonal Closures
  try {
    const girCheckJuly = seasonalEngine.evaluateSeasonalSuitability(['Sasan Gir'], '2026-07-15');
    assert(girCheckJuly.wildlifeParkAlerts.some(a => a.includes('Gir') && a.includes('closed')), 'Gir should be flagged closed in July');

    const girCheckNov = seasonalEngine.evaluateSeasonalSuitability(['Sasan Gir'], '2026-11-15');
    assert(girCheckNov.wildlifeParkAlerts.length === 0, 'Gir should not have closure alert in November');

    const kaziCheckJuly = seasonalEngine.evaluateSeasonalSuitability(['Kaziranga'], '2026-07-15');
    assert(kaziCheckJuly.wildlifeParkAlerts.some(a => a.includes('Kaziranga')), 'Kaziranga should be closed in July flooding');
    console.log('✓ TEST 8: Wildlife Sanctuary Breeding & Monsoon Closures (Gir & Kaziranga)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 8 FAILED:', e.message);
  }

  // TEST 9: Heavy Monsoon & Landslide Risk Warnings
  try {
    const cherrCheck = seasonalEngine.evaluateSeasonalSuitability(['Cherrapunji'], '2026-07-15');
    assert(cherrCheck.warnings.some(w => w.includes('monsoon')), 'Cherrapunji should trigger monsoon warnings in July');

    const munnarCheck = seasonalEngine.evaluateSeasonalSuitability(['Munnar'], '2026-07-15');
    assert(munnarCheck.warnings.some(w => w.includes('Monsoon') || w.includes('landslide')), 'Munnar should trigger monsoon warning in July');
    console.log('✓ TEST 9: Heavy Monsoon & Landslide Risk Warnings (Cherrapunji & Ghats)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 9 FAILED:', e.message);
  }

  // TEST 10: Extreme Summer Heat Advisories
  try {
    const jaisalmerMay = seasonalEngine.evaluateSeasonalSuitability(['Jaisalmer'], '2026-05-20');
    assert(jaisalmerMay.warnings.some(w => w.includes('heatwaves') || w.includes('44°C')), 'Jaisalmer should trigger heat advisory in May');

    const varanasiJune = seasonalEngine.evaluateSeasonalSuitability(['Varanasi'], '2026-06-10');
    assert(varanasiJune.warnings.some(w => w.includes('heatwaves') || w.includes('44°C')), 'Varanasi should trigger heat advisory in June');
    console.log('✓ TEST 10: Extreme Summer Heat Advisories (Jaisalmer & Varanasi in May/June)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 10 FAILED:', e.message);
  }

  // TEST 11: Cultural Festival Matching
  try {
    const kutchFest = seasonalEngine.evaluateSeasonalSuitability(['Kutch'], '2026-12-15');
    assert(kutchFest.festivalEvents.some(f => f.includes('Rann Utsav')), 'Rann Utsav missing in December');

    const pushkarFest = seasonalEngine.evaluateSeasonalSuitability(['Pushkar'], '2026-11-15');
    assert(pushkarFest.festivalEvents.some(f => f.includes('Pushkar Camel Fair')), 'Pushkar Camel Fair missing in November');

    const kohimaFest = seasonalEngine.evaluateSeasonalSuitability(['Kohima'], '2026-12-05');
    assert(kohimaFest.festivalEvents.some(f => f.includes('Hornbill Festival')), 'Hornbill Festival missing in December');
    console.log('✓ TEST 11: Cultural Festival Event Calendar Matching (Rann Utsav, Pushkar, Hornbill)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 11 FAILED:', e.message);
  }

  // TEST 12: Terrain Detour Multipliers
  try {
    assert(routeEngine.TERRAIN_DETOUR_MULTIPLIERS.hills === 1.65, 'Hills multiplier should be 1.65');
    assert(routeEngine.TERRAIN_DETOUR_MULTIPLIERS.coastal === 1.35, 'Coastal multiplier should be 1.35');
    assert(routeEngine.TERRAIN_DETOUR_MULTIPLIERS.plains === 1.20, 'Plains multiplier should be 1.20');
    assert(routeEngine.TERRAIN_DETOUR_MULTIPLIERS['high-altitude-pass'] === 1.85, 'High pass multiplier should be 1.85');
    console.log('✓ TEST 12: Terrain Winding Detour Multipliers (1.20x -> 1.85x)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 12 FAILED:', e.message);
  }

  // TEST 13: Road Travel Speed Differentiation
  try {
    assert(routeEngine.TERRAIN_AVERAGE_SPEED_KMH.plains === 60, 'Plains speed should be 60 km/h');
    assert(routeEngine.TERRAIN_AVERAGE_SPEED_KMH.hills === 30, 'Hills speed should be 30 km/h');
    assert(routeEngine.TERRAIN_AVERAGE_SPEED_KMH['high-altitude-pass'] === 24, 'High pass speed should be 24 km/h');
    console.log('✓ TEST 13: Road Travel Speed Differentiation (Plains 60 km/h vs Mountain 24-30 km/h)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 13 FAILED:', e.message);
  }

  // TEST 14: Benchmark Corridor 1: Ahmedabad -> Ladakh
  try {
    const corridor = routeEngine.NATIONAL_BENCHMARK_CORRIDORS['ahmedabad-ladakh']();
    assert(corridor.recommendedHub.includes('IXL'), 'Ahmedabad-Ladakh must recommend IXL Leh Airport');
    assert(corridor.report.recommendedMode === 'flight', 'Recommended mode must be flight');
    assert(corridor.acclimatizationProtocol.includes('48 hours'), 'Must mandate 48h acclimatization');
    const roadOpt = corridor.report.options.find(o => o.mode === 'road');
    assert(roadOpt && roadOpt.isPractical === false, 'Direct road from Ahmedabad to Ladakh must be flagged impractical');
    console.log('✓ TEST 14: Benchmark Corridor 1 (Ahmedabad -> Ladakh IXL Flight Hub)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 14 FAILED:', e.message);
  }

  // TEST 15: Benchmark Corridor 2: Ahmedabad -> Goa
  try {
    const corridor = routeEngine.NATIONAL_BENCHMARK_CORRIDORS['ahmedabad-goa']();
    assert(corridor.recommendedHub.includes('GOI'), 'Ahmedabad-Goa must recommend GOI/GOX');
    assert(corridor.transitRoute.includes('1 hr 45 min') || corridor.transitRoute.includes('Flight'), 'Should indicate flight time');
    console.log('✓ TEST 15: Benchmark Corridor 2 (Ahmedabad -> Goa Air & Konkan Rail)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 15 FAILED:', e.message);
  }

  // TEST 16: Benchmark Corridor 3: Delhi -> Kerala
  try {
    const corridor = routeEngine.NATIONAL_BENCHMARK_CORRIDORS['delhi-kerala']();
    assert(corridor.recommendedHub.includes('COK'), 'Delhi-Kerala must recommend COK');
    assert(corridor.report.recommendedMode === 'flight', 'Delhi-Kerala recommended mode must be flight');
    console.log('✓ TEST 16: Benchmark Corridor 3 (Delhi -> Kerala COK Flight & Onward Cab)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 16 FAILED:', e.message);
  }

  // TEST 17: Benchmark Corridor 4: Mumbai -> Meghalaya
  try {
    const corridor = routeEngine.NATIONAL_BENCHMARK_CORRIDORS['mumbai-meghalaya']();
    assert(corridor.recommendedHub.includes('GAU'), 'Mumbai-Meghalaya must recommend GAU Guwahati');
    assert(corridor.transitRoute.includes('NH-6'), 'Must describe scenic NH-6 highway to Shillong');
    console.log('✓ TEST 17: Benchmark Corridor 4 (Mumbai -> Meghalaya GAU Flight + NH-6 Road)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 17 FAILED:', e.message);
  }

  // TEST 18: Benchmark Corridor 5: Bengaluru -> Rajasthan
  try {
    const corridor = routeEngine.NATIONAL_BENCHMARK_CORRIDORS['bengaluru-rajasthan']();
    assert(corridor.recommendedHub.includes('JAI'), 'Bengaluru-Rajasthan must recommend JAI');
    console.log('✓ TEST 18: Benchmark Corridor 5 (Bengaluru -> Rajasthan JAI Flight & Train)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 18 FAILED:', e.message);
  }

  // TEST 19: Benchmark Corridor 6: Chennai -> Himachal Pradesh
  try {
    const corridor = routeEngine.NATIONAL_BENCHMARK_CORRIDORS['chennai-himachal']();
    assert(corridor.recommendedHub.includes('IXC') || corridor.recommendedHub.includes('DEL'), 'Must recommend IXC/DEL');
    console.log('✓ TEST 19: Benchmark Corridor 6 (Chennai -> Himachal IXC Flight + Volvo)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 19 FAILED:', e.message);
  }

  // TEST 20: Curated Gujarat Tourism Circuit Verification
  try {
    const c = circuitEngine.CANONICAL_CIRCUITS['gujarat-saurashtra'];
    assert(c && c.orderedStops.length >= 5, 'Gujarat circuit must have >= 5 stops');
    assert(c.orderedStops[0] === 'Ahmedabad' && c.orderedStops.includes('Dwarka') && c.orderedStops.includes('Somnath'), 'Missing key stops');
    assert(c.routeContinuityVerified === true, 'Route continuity should be verified');
    console.log('✓ TEST 20: Curated Gujarat Saurashtra Circuit (Ahmedabad-Dwarka-Somnath-Gir-Diu)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 20 FAILED:', e.message);
  }

  // TEST 21: Curated Rajasthan Royal Circuit Verification
  try {
    const c = circuitEngine.CANONICAL_CIRCUITS['rajasthan-royal'];
    assert(c && c.orderedStops.includes('Jaipur') && c.orderedStops.includes('Jodhpur') && c.orderedStops.includes('Jaisalmer') && c.orderedStops.includes('Udaipur'), 'Missing Royal Rajasthan stops');
    console.log('✓ TEST 21: Curated Rajasthan Royal Circuit (Jaipur-Jodhpur-Jaisalmer-Udaipur)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 21 FAILED:', e.message);
  }

  // TEST 22: Curated Ladakh Trans-Himalayan Circuit Verification
  try {
    const c = circuitEngine.CANONICAL_CIRCUITS['ladakh-trans-himalayan'];
    assert(c && c.orderedStops.includes('Leh') && c.orderedStops.includes('Nubra Valley') && c.orderedStops.includes('Pangong Tso'), 'Missing Ladakh circuit stops');
    assert(c.permitsRequired && c.permitsRequired.length > 0, 'Must require ILP permit');
    console.log('✓ TEST 22: Curated Ladakh Trans-Himalayan Circuit (Leh-Nubra-Pangong-Leh)... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 22 FAILED:', e.message);
  }

  // TEST 23: Dynamic Circuit Assembly & 2-Opt Non-Backtracking
  try {
    const dynamic = circuitEngine.generateDynamicCircuit({
      originCity: 'Jaipur',
      targetStateOrRegion: 'Rajasthan',
      durationDays: 7,
      pace: 'balanced'
    });
    assert(dynamic.stops.length >= 3, 'Dynamic circuit should have >= 3 stops');
    assert(dynamic.backtrackingDeductions === 0, 'Backtracking deductions must be 0');
    assert(dynamic.routeContinuityScore >= 90, 'Route continuity score must be >= 90');
    console.log(`✓ TEST 23: Dynamic Circuit Assembly (7 Days in Rajasthan, ${dynamic.stops.length} stops, 0 Backtracking)... PASS`);
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 23 FAILED:', e.message);
  }

  // TEST 24: Intelligent Destination Discovery with Realistic Proximity
  try {
    const result = discoveryEngine.discoverDestinations({
      originCity: 'Ahmedabad',
      durationDays: 5,
      totalBudgetInr: 25000,
      travelMonth: 11
    });
    assert(result.recommendations.length > 0, 'Should find recommendations for 5 days from Ahmedabad');
    const hasLadakh = result.recommendations.some(r => r.destination.canonicalName.toLowerCase().includes('leh') || r.destination.stateOrUt.toLowerCase() === 'ladakh');
    assert(!hasLadakh, 'Ladakh must NOT be recommended for 5 days low-budget trip from Ahmedabad');
    console.log(`✓ TEST 24: Intelligent Discovery (Ahmedabad 5d <=25k => Western Circuits, Suppresses Ladakh)... PASS`);
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 24 FAILED:', e.message);
  }

  // TEST 25: Phase 2 Universal Trip Preferences Integration
  try {
    const mockProfile = {
      id: 'prof-test-geo-1',
      version: 1,
      lastUpdated: new Date().toISOString(),
      lockedKeys: [],
      identity: {
        origin: 'Ahmedabad',
        destination: 'Leh',
        destinationList: ['Leh'],
        tripType: 'adventure',
        startDate: '2026-07-15',
        tripDurationDays: 4,
        flexibleDates: false,
        durationMode: 'custom',
        travelersCount: 2,
        travelerComposition: { adults: 2 }
      },
      budget: {
        totalBudget: 80000,
        perPersonBudget: 40000,
        dailyBudget: 10000,
        currency: 'INR',
        pricingCategory: 'standard'
      }
    };
    const sync = discoveryEngine.syncPreferencesWithGeography(mockProfile);
    assert(sync.destinationResolved.canonicalName === 'Leh', 'Resolved destination should be Leh');
    assert(sync.destinationResolved.isHighAltitude === true, 'Leh should be flagged high altitude');
    assert(sync.transportHubs.nearestAirport.code === 'IXL', 'Nearest airport should be IXL');
    assert(sync.mandatoryAcclimatizationRequired === true, 'Acclimatization required');
    assert(sync.suggestedDurationAdjustment && sync.suggestedDurationAdjustment.recommendedMinDays >= 6, 'Should recommend min 6 days for Leh');
    console.log('✓ TEST 25: Phase 2 Universal Trip Preferences Integration & Geo Sync... PASS');
    passedTests++;
  } catch (e) {
    console.error('✗ TEST 25 FAILED:', e.message);
  }

  console.log('\n================================================================');
  console.log(`PHASE 3 GEOGRAPHY ENGINE TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log('ALL 25 PHASE 3 GEOGRAPHICAL & ROUTING SPECIFICATIONS PASSED (100%)');
  } else {
    console.log(`WARNING: ${totalTests - passedTests} tests failed.`);
  }
  console.log('================================================================\n');

  return passedTests === totalTests;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
});

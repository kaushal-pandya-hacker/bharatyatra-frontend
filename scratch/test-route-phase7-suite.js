/**
 * BharatYatra AI 2.0 — Phase 7 Automated Test Suite
 * Comprehensive verification of Route Intelligence & Travel Feasibility Engine.
 * Tests Section 18: Groups A through G.
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

const multimodalModule = customRequire(rootDir, '@/lib/ai-planner/multimodal-route-engine');
const graphModule = customRequire(rootDir, '@/lib/ai-planner/route-graph-engine');

const { multimodalRouteEngine } = multimodalModule;
const { routeGraphEngine, INDIA_TRANSIT_NODES, INDIA_TRANSIT_EDGES } = graphModule;

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} ${details ? '- ' + details : ''}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('BHARATYATRA AI 2.0 — PHASE 7: ROUTE INTELLIGENCE TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // GROUP A: BASIC ROUTING
  // -------------------------------------------------------------------------
  console.log('--- GROUP A: BASIC ROUTING ---');

  // Test 1: Ahmedabad -> Dwarka
  const t1 = multimodalRouteEngine.solveRoute({
    originCity: 'Ahmedabad',
    destinationQuery: 'Dwarka',
    travelMonth: 10,
    strategy: 'balanced',
  });

  assert(t1.recommendedJourney.totalDistanceKm > 400 && t1.recommendedJourney.totalDistanceKm < 550, 'Test 1: AMD -> Dwarka route distance (~440-470 km)', `Got: ${t1.recommendedJourney.totalDistanceKm}`);
  assert(t1.feasibility.classification === 'FEASIBLE', 'Test 1: AMD -> Dwarka is classified as FEASIBLE', `Got: ${t1.feasibility.classification}`);
  assert(t1.allOptions.lowestCost.totalCostInr.budget <= 500, 'Test 1: AMD -> Dwarka budget train/bus fare is reasonable (<= ₹500)', `Got: ${t1.allOptions.lowestCost.totalCostInr.budget}`);

  // Test 2: Ahmedabad -> Udaipur
  const t2 = multimodalRouteEngine.solveRoute({
    originCity: 'Ahmedabad',
    destinationQuery: 'Udaipur',
    travelMonth: 11,
    strategy: 'balanced',
  });
  assert(t2.recommendedJourney.totalDistanceKm > 200 && t2.recommendedJourney.totalDistanceKm < 350, 'Test 2: AMD -> Udaipur distance (~250-280 km)', `Got: ${t2.recommendedJourney.totalDistanceKm}`);
  assert(t2.feasibility.classification === 'FEASIBLE', 'Test 2: AMD -> Udaipur is FEASIBLE', `Got: ${t2.feasibility.classification} (Conditions: ${t2.feasibility.conditions.join('; ')})`);


  // Test 3: Delhi -> Jaipur
  const t3 = multimodalRouteEngine.solveRoute({
    originCity: 'New Delhi',
    destinationQuery: 'Jaipur',
    travelMonth: 12,
    strategy: 'fastest',
  });
  assert(t3.recommendedJourney.totalDistanceKm >= 230 && t3.recommendedJourney.totalDistanceKm <= 350, 'Test 3: Delhi -> Jaipur distance (~240-310 km flight/expressway)', `Got: ${t3.recommendedJourney.totalDistanceKm}`);
  assert(t3.feasibility.classification === 'FEASIBLE', 'Test 3: Delhi -> Jaipur is FEASIBLE', `Got: ${t3.feasibility.classification} (Conditions: ${t3.feasibility.conditions.join('; ')})`);


  // -------------------------------------------------------------------------
  // GROUP B: LONG-DISTANCE ROUTING
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP B: LONG-DISTANCE ROUTING ---');

  // Test 4: Ahmedabad -> Leh (Ladakh)
  const t4 = multimodalRouteEngine.solveRoute({
    originCity: 'Ahmedabad',
    destinationQuery: 'Leh',
    travelMonth: 6, // June (summer)
    strategy: 'fastest',
  });
  assert(t4.recommendedJourney.primaryMode === 'flight' || t4.recommendedJourney.primaryMode === 'multimodal', 'Test 4: AMD -> Leh recommends Flight or Multimodal via DEL', `Got: ${t4.recommendedJourney.primaryMode}`);
  assert(t4.feasibility.acclimatizationRequired === true, 'Test 4: High-altitude AMS acclimatization is required for Leh');
  assert(t4.feasibility.acclimatizationNotice && (t4.feasibility.acclimatizationNotice.includes('24–48 hours') || t4.feasibility.acclimatizationNotice.includes('acclimatization')), 'Test 4: Acclimatization notice provided');

  // Test 5: Mumbai -> Kochi (Kerala)
  const t5 = multimodalRouteEngine.solveRoute({
    originCity: 'Mumbai',
    destinationQuery: 'Kochi',
    travelMonth: 1,
    strategy: 'fastest',
  });
  assert(t5.recommendedJourney.totalDistanceKm > 1000, 'Test 5: Mumbai -> Kochi covers >1,000 km', `Got: ${t5.recommendedJourney.totalDistanceKm}`);
  assert(t5.allOptions.fastest.totalJourneyMinutes < 300, 'Test 5: Fastest route (flight) is under 5 hours elapsed', `Got: ${t5.allOptions.fastest.totalJourneyMinutes}m`);

  // Test 6: Delhi -> Guwahati (Assam)
  const t6 = multimodalRouteEngine.solveRoute({
    originCity: 'New Delhi',
    destinationQuery: 'Guwahati',
    travelMonth: 3,
    strategy: 'balanced',
  });
  assert(t6.recommendedJourney.totalDistanceKm > 1400, 'Test 6: Delhi -> Guwahati covers >1,400 km', `Got: ${t6.recommendedJourney.totalDistanceKm}`);
  assert(t6.feasibility.classification === 'FEASIBLE', 'Test 6: Delhi -> Guwahati is FEASIBLE', `Got: ${t6.feasibility.classification}`);

  // -------------------------------------------------------------------------
  // GROUP C: MULTIMODAL ROUTING & TRANSFERS
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP C: MULTIMODAL ROUTING & TRANSFERS ---');

  // Test 7: Airport Terminal Transfer Buffer (Delhi or Mumbai)
  const delAirNode = INDIA_TRANSIT_NODES['DEL_AIR'];
  const amdEdge = INDIA_TRANSIT_EDGES.find(e => e.id === 'EDGE_FLT_AMD_DEL');
  const ixlEdge = INDIA_TRANSIT_EDGES.find(e => e.id === 'EDGE_FLT_DEL_IXL');
  const transfer = routeGraphEngine.evaluateConnection(delAirNode, amdEdge, ixlEdge, 0, 1);
  assert(transfer.recommendedBufferMinutes >= 120, 'Test 7: DEL Airport connection assigns >= 120 mins transfer buffer', `Got: ${transfer.recommendedBufferMinutes}`);
  assert(transfer.terminalChangeRequired === true, 'Test 7: Terminal change detected for DEL connection');

  // Test 8: Multimodal Journey Legs & Carbon calculation
  const journeysAmdLeh = routeGraphEngine.findJourneys(
    INDIA_TRANSIT_NODES['AMD_AIR'],
    INDIA_TRANSIT_NODES['IXL_AIR'],
    6
  );
  assert(journeysAmdLeh.length > 0, 'Test 8: Graph finds AMD -> DEL -> IXL multimodal journey');
  const connectingFlight = journeysAmdLeh.find(j => j.transfersCount === 1);
  assert(connectingFlight !== undefined, 'Test 8: 1-Transfer connection exists');
  assert(connectingFlight && connectingFlight.legs[0].carbonKg > 0 && connectingFlight.legs[1].carbonKg > 0, 'Test 8: Carbon footprint calculated per leg');

  // Test 9: Ferry Connection (Port Blair -> Havelock)
  const pbNode = INDIA_TRANSIT_NODES['PB_PHOENIX'];
  const hvlNode = INDIA_TRANSIT_NODES['HAVELOCK_JETTY'];
  const ferryJourneys = routeGraphEngine.findJourneys(pbNode, hvlNode, 1);
  assert(ferryJourneys.length > 0, 'Test 9: Ferry route discovered between Port Blair and Havelock Island');
  assert(ferryJourneys.length > 0 && ferryJourneys[0].primaryMode === 'ferry', 'Test 9: Ferry mode identified correctly');

  // Test 10: Ekta Nagar (Statue of Unity) Rail + EV Feeder Multimodal
  const adiNode = INDIA_TRANSIT_NODES['ADI_RAIL'];
  const stvNode = INDIA_TRANSIT_NODES['STV_CITY'];
  const souJourneys = routeGraphEngine.findJourneys(adiNode, stvNode, 10);
  assert(souJourneys.length > 0, 'Test 10: Multimodal train + road feeder discovered to Statue of Unity');
  assert(souJourneys.length > 0 && souJourneys[0].legs.length === 2, 'Test 10: 2 legs (Train ADI->EKNR + EV road EKNR->STV)');

  // -------------------------------------------------------------------------
  // GROUP D: COMPLEX & SEASONAL ROUTING
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP D: COMPLEX & SEASONAL ROUTING ---');

  // Test 11: Winter Mountain Pass Closure (Rohtang / Baralacha La in January)
  const t11 = multimodalRouteEngine.solveRoute({
    originCity: 'New Delhi',
    destinationQuery: 'Leh',
    travelMonth: 1, // January (Peak winter)
    strategy: 'lowest_cost',
  });
  assert(
    t11.feasibility.warnings.some(w => w.includes('BLOCKED') || w.includes('snow') || w.includes('pass')) ||
    t11.feasibility.conditions.some(c => c.includes('closed') || c.includes('flight')),
    'Test 11: Winter road closure alert triggered for Himalayan passes in January'
  );

  // Test 12: Inner Line Permit (ILP) for Pangong Tso
  const lehNode = INDIA_TRANSIT_NODES['LEH_CITY'];
  const pangongNode = INDIA_TRANSIT_NODES['PANGONG_CITY'];
  const pangongJourneys = routeGraphEngine.findJourneys(lehNode, pangongNode, 7);
  assert(pangongJourneys.length > 0, 'Test 12: Leh to Pangong Tso road connection exists');
  assert(pangongJourneys.length > 0 && pangongJourneys[0].permitsRequired.some(p => p.includes('Inner Line Permit')), 'Test 12: Ladakh Inner Line Permit flagged as mandatory');

  // Test 13: Monsoon Ghat Advisory (Kochi -> Munnar in July)
  const t13 = multimodalRouteEngine.solveRoute({
    originCity: 'Mumbai',
    destinationQuery: 'Munnar',
    travelMonth: 7, // July monsoon
    strategy: 'balanced',
  });
  assert(t13.feasibility.conditions.some(c => c.toLowerCase().includes('monsoon')), 'Test 13: Monsoon ghat advisory triggered for Kerala hills in July');

  // Test 14: Island Route (Port Blair) - No direct road
  const t14 = multimodalRouteEngine.solveRoute({
    originCity: 'Mumbai',
    destinationQuery: 'Port Blair',
    travelMonth: 11,
    strategy: 'balanced',
  });
  assert(t14.recommendedJourney.primaryMode === 'flight', 'Test 14: Island territory defaults to flight');

  // -------------------------------------------------------------------------
  // GROUP E: PREFERENCE PROFILE INTEGRATION
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP E: PREFERENCE PROFILE INTEGRATION ---');

  // Test 15: User-locked transport preference respected
  const mockProfile = {
    identity: { origin: 'Ahmedabad', destination: 'Dwarka', tripDurationDays: 4 },
    lockedKeys: ['transport.preferredTransport'],
    transport: {
      preferredTransport: 'train',
      localTransport: 'auto-rickshaw',
      mixedTransportAllowed: true,
      comfortRequirements: ['ac-only'],
    },
    budget: { totalBudget: 25000, pricingCategory: 'standard' },
  };
  const t15 = multimodalRouteEngine.solveRoute({
    originCity: 'Ahmedabad',
    destinationQuery: 'Dwarka',
    travelMonth: 10,
    strategy: 'custom',
    preferenceProfile: mockProfile,
  });
  assert(
    t15.recommendedJourney.primaryMode === 'train' || t15.recommendedJourney.modeSummary.toLowerCase().includes('train'),
    'Test 15: Custom strategy honors locked transport: train',
    `Got: ${t15.recommendedJourney.modeSummary}`
  );

  // -------------------------------------------------------------------------
  // GROUP F: FAILURE & BOUNDARY SCENARIOS
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP F: FAILURE SCENARIOS ---');

  // Test 16: Unknown / Unlisted Destination fallback
  const t16 = multimodalRouteEngine.solveRoute({
    originCity: 'Ahmedabad',
    destinationQuery: 'NonExistentPlaceXYZ',
    travelMonth: 5,
  });
  assert(t16.recommendedJourney !== undefined, 'Test 16: Fallback corridor synthesized for unknown destination');
  assert(t16.feasibility.classification !== 'FEASIBLE' || t16.feasibility.conditions.length > 0, 'Test 16: Fallback destination flagged with conditions');

  // Test 17: Extreme Distance Road Warning
  const t17 = multimodalRouteEngine.solveRoute({
    originCity: 'Chennai',
    destinationQuery: 'Leh',
    travelMonth: 6,
    strategy: 'lowest_cost',
  });
  assert(t17.feasibility.warnings.length > 0 || t17.feasibility.classification !== 'FEASIBLE', 'Test 17: Extreme road journey (>2,500 km) flags fatigue or not-recommended warning');

  // -------------------------------------------------------------------------
  // GROUP G: PERFORMANCE & CACHING
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP G: PERFORMANCE & CACHING ---');

  // Test 18: Execution speed without cache
  multimodalRouteEngine.clearCache();
  const startUncached = Date.now();
  multimodalRouteEngine.solveRoute({ originCity: 'Ahmedabad', destinationQuery: 'Goa', travelMonth: 12 });
  const uncachedTime = Date.now() - startUncached;
  assert(uncachedTime < 50, `Test 18: Uncached route discovery executed under 50ms (took ${uncachedTime}ms)`);

  // Test 19: Cache Hit Speed
  const startCached = Date.now();
  multimodalRouteEngine.solveRoute({ originCity: 'Ahmedabad', destinationQuery: 'Goa', travelMonth: 12 });
  const cachedTime = Date.now() - startCached;
  assert(cachedTime < 5, `Test 19: Cached route response executed under 5ms (took ${cachedTime}ms)`);

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log(`SUCCESS RATE: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test Suite encountered unhandled fatal exception:', err);
  process.exit(1);
});

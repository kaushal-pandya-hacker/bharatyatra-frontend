/**
 * BharatYatra AI 2.0 — Phase 8 Automated Test Suite
 * Comprehensive verification of Dynamic Itinerary Planning & Versioning Engine.
 * Covers Groups A through F.
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

  const tsFile = targetPath.endsWith('.ts') ? targetPath : targetPath + '.ts';
  const jsFile = targetPath.endsWith('.js') ? targetPath : targetPath + '.js';

  if (fs.existsSync(tsFile)) {
    if (moduleCache.has(tsFile)) return moduleCache.get(tsFile);
    const code = fs.readFileSync(tsFile, 'utf8');
    const compiled = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
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

const itineraryModule = customRequire(rootDir, '@/lib/ai-planner/dynamic-itinerary-engine');
const preferenceModule = customRequire(rootDir, '@/lib/ai-planner/universal-preference-profile');

const { dynamicItineraryEngine, VERIFIED_ATTRACTIONS_REGISTRY } = itineraryModule;
const { createDefaultPreferenceProfile } = preferenceModule;

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
  console.log('BHARATYATRA AI 2.0 — PHASE 8: DYNAMIC ITINERARY ENGINE TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // GROUP A: SINGLE DESTINATION ITINERARIES
  // -------------------------------------------------------------------------
  console.log('--- GROUP A: SINGLE DESTINATION ITINERARIES ---');

  // Test 1: Ahmedabad -> Dwarka (4 days)
  const profDwarka = createDefaultPreferenceProfile({
    origin: 'Ahmedabad',
    destination: 'Dwarka',
    destinationList: ['Dwarka'],
    tripDurationDays: 4,
  });
  profDwarka.pace.style = 'balanced';

  const planDwarka = dynamicItineraryEngine.generateItinerary({
    preferenceProfile: profDwarka,
    startDate: '2026-11-10', // Tuesday
  });

  assert(planDwarka.durationDays === 4, 'Test 1.1: Dwarka plan has 4 days', `Got: ${planDwarka.durationDays}`);
  assert(planDwarka.currentVersion.days.length === 4, 'Test 1.2: Days array contains 4 days', `Got: ${planDwarka.currentVersion.days.length}`);

  const allDwarkaActs = planDwarka.currentVersion.days.flatMap((d) => [
    ...d.morningActivities,
    ...d.afternoonActivities,
    ...d.eveningActivities,
  ]);
  const dwarkaNames = allDwarkaActs.map((a) => a.name);

  assert(dwarkaNames.some((n) => n.includes('Dwarkadhish')), 'Test 1.3: Dwarkadhish Temple included in itinerary');
  assert(dwarkaNames.some((n) => n.includes('Bet Dwarka')), 'Test 1.4: Bet Dwarka included in itinerary');
  assert(dwarkaNames.some((n) => n.includes('Nageshwar')), 'Test 1.5: Nageshwar Jyotirlinga included in itinerary');

  const maxDwarkaHours = Math.max(...planDwarka.currentVersion.days.map((d) => d.activeHours));
  assert(maxDwarkaHours <= 11, 'Test 1.6: All days active hours <= 11h', `Max: ${maxDwarkaHours}h`);
  assert(planDwarka.currentVersion.pricing.tiers.standard.totalGroupCost > 0, 'Test 1.7: Standard tier price calculated (> 0)');
  assert(planDwarka.validation.isValid === true, 'Test 1.8: Plan passes deterministic validation');

  // Test 2: Delhi -> Jaipur (3 days)
  const profJaipur = createDefaultPreferenceProfile({
    origin: 'Delhi',
    destination: 'Jaipur',
    destinationList: ['Jaipur'],
    tripDurationDays: 3,
  });
  const planJaipur = dynamicItineraryEngine.generateItinerary({
    preferenceProfile: profJaipur,
    startDate: '2026-11-12',
  });

  assert(planJaipur.currentVersion.days.length === 3, 'Test 2.1: Jaipur plan has 3 days');
  const jaipurActs = planJaipur.currentVersion.days.flatMap((d) => [
    ...d.morningActivities,
    ...d.afternoonActivities,
    ...d.eveningActivities,
  ]);
  const jaipurNames = jaipurActs.map((a) => a.name);
  assert(jaipurNames.some((n) => n.includes('Amber Fort')), 'Test 2.2: Amber Fort included');
  assert(jaipurNames.some((n) => n.includes('City Palace')), 'Test 2.3: City Palace included');
  assert(jaipurNames.some((n) => n.includes('Hawa Mahal')), 'Test 2.4: Hawa Mahal included');

  // Test 3: Mumbai -> Udaipur (4 days)
  const profUdaipur = createDefaultPreferenceProfile({
    origin: 'Mumbai',
    destination: 'Udaipur',
    destinationList: ['Udaipur'],
    tripDurationDays: 4,
  });
  const planUdaipur = dynamicItineraryEngine.generateItinerary({
    preferenceProfile: profUdaipur,
    startDate: '2026-11-15',
  });
  assert(planUdaipur.currentVersion.days.length === 4, 'Test 3.1: Udaipur plan has 4 days');
  const udaipurActs = planUdaipur.currentVersion.days.flatMap((d) => [
    ...d.morningActivities,
    ...d.afternoonActivities,
    ...d.eveningActivities,
  ]);
  const udaipurNames = udaipurActs.map((a) => a.name);
  assert(udaipurNames.some((n) => n.includes('City Palace')), 'Test 3.2: Udaipur City Palace included');
  assert(udaipurNames.some((n) => n.includes('Lake Pichola')), 'Test 3.3: Lake Pichola included');

  // -------------------------------------------------------------------------
  // GROUP B: MULTI-DESTINATION CORRIDORS & LOGISTICS
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP B: MULTI-DESTINATION CORRIDORS & LOGISTICS ---');

  // Test 4: Delhi -> Agra & Jaipur (Golden Triangle 5 days)
  const profGT = createDefaultPreferenceProfile({
    origin: 'Delhi',
    destination: 'Agra',
    destinationList: ['Agra', 'Jaipur'],
    tripDurationDays: 5,
  });
  const planGT = dynamicItineraryEngine.generateItinerary({
    preferenceProfile: profGT,
    startDate: '2026-11-14',
  });
  assert(planGT.currentVersion.days.length === 5, 'Test 4.1: Golden Triangle plan has 5 days');
  assert(planGT.currentVersion.totalDistanceKm > 400, 'Test 4.2: Multimodal transit distance tracked (> 400 km)');
  assert(planGT.currentVersion.days[0].transportLegs.length > 0, 'Test 4.3: Outbound transit leg included on Day 1');
  assert(planGT.currentVersion.days[4].transportLegs.length > 0, 'Test 4.4: Return transit leg included on Day 5');

  // -------------------------------------------------------------------------
  // GROUP C: CLOSED ATTRACTIONS & OPENING HOURS
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP C: CLOSED ATTRACTIONS & OPENING HOURS ---');

  // Test 5: Agra on Friday (Taj Mahal is closed on Fridays)
  const profAgraFriday = createDefaultPreferenceProfile({
    origin: 'Delhi',
    destination: 'Agra',
    destinationList: ['Agra'],
    tripDurationDays: 3,
  });
  // 2026-11-13 is a Friday
  const planAgraFriday = dynamicItineraryEngine.generateItinerary({
    preferenceProfile: profAgraFriday,
    startDate: '2026-11-13',
  });

  const fridayDay = planAgraFriday.currentVersion.days[0];
  const fridayActs = [
    ...fridayDay.morningActivities,
    ...fridayDay.afternoonActivities,
    ...fridayDay.eveningActivities,
  ];
  const fridayTaj = fridayActs.find((a) => a.name.includes('Taj Mahal'));
  assert(
    !fridayTaj || !fridayDay.morningActivities.some((a) => a.name.includes('Taj Mahal')),
    'Test 5.1: Taj Mahal closure avoided or flagged on Friday',
    fridayTaj ? `Scheduled with notice: ${fridayTaj.reason}` : 'Taj Mahal skipped on Friday'
  );
  assert(planAgraFriday.validation.checks.closedAttractionsAvoided === true, 'Test 5.2: Closed attraction validation check passes');

  // -------------------------------------------------------------------------
  // GROUP D: HIGH-ALTITUDE & ACCLIMATIZATION SAFEGUARDS
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP D: HIGH-ALTITUDE & ACCLIMATIZATION SAFEGUARDS ---');

  // Test 6: Delhi -> Leh (Leh altitude = 3,524m >= 2,800m)
  const profLeh = createDefaultPreferenceProfile({
    origin: 'Delhi',
    destination: 'Leh',
    destinationList: ['Leh'],
    tripDurationDays: 6,
  });
  const planLeh = dynamicItineraryEngine.generateItinerary({
    preferenceProfile: profLeh,
    startDate: '2026-07-10',
  });

  const lehDay1 = planLeh.currentVersion.days[0];
  const lehDay2 = planLeh.currentVersion.days[1];

  const lehDay1Acts = [...lehDay1.afternoonActivities, ...lehDay1.eveningActivities];
  assert(
    lehDay1Acts.some((a) => a.name.toLowerCase().includes('acclimatization') || a.name.toLowerCase().includes('rest')),
    'Test 6.1: Day 1 afternoon/evening in Leh is reserved for acclimatization/rest'
  );

  const lehDay2Morn = lehDay2.morningActivities;
  assert(
    lehDay2Morn.some((a) => a.name.toLowerCase().includes('acclimatization') || a.name.toLowerCase().includes('rest')),
    'Test 6.2: Day 2 morning in Leh is reserved for acclimatization/rest'
  );

  assert(
    planLeh.explanations.seasonalNotice !== undefined && planLeh.explanations.seasonalNotice.includes('Acclimatization'),
    'Test 6.3: High-altitude AMS advisory is prominently included in explanations'
  );

  // -------------------------------------------------------------------------
  // GROUP E: DYNAMIC CUSTOMIZATION & VERSIONING
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP E: DYNAMIC CUSTOMIZATION & VERSIONING ---');

  // Test 7: Add activity
  const customActivity = {
    id: 'act-custom-1',
    activityId: 'custom-sunset',
    destinationId: 'Dwarka',
    name: 'Sunset Point & Beach Walk',
    displayName: 'Sunset Point & Beach Walk',
    location: 'Dwarka',
    state: 'Gujarat',
    startTime: '17:30',
    endTime: '19:00',
    durationMinutes: 90,
    category: 'Nature & Recreation',
    estimatedCostInr: 0,
    priority: 'recommended',
    reason: 'Scenic sunset view over the Arabian Sea',
    openingHours: { open: '06:00', close: '20:00', closedDays: [] },
    entryFeeStatus: 'free',
    bookingRequired: false,
    travelDistanceFromPrevKm: 2,
    travelTimeFromPrevMinutes: 10,
    suitabilityInterests: ['Nature', 'Relaxation'],
    accessibility: { wheelchairAccessible: true, seniorFriendly: true },
    evidenceStatus: 'USER_CUSTOM',
  };

  const planV1_1 = dynamicItineraryEngine.addActivityToDay(planDwarka, 2, customActivity, 'evening');
  assert(planV1_1.currentVersion.versionId === 'v1.1.0', 'Test 7.1: Version incremented to v1.1.0', `Got: ${planV1_1.currentVersion.versionId}`);
  assert(planV1_1.versionHistory.length === 2, 'Test 7.2: Version history now contains 2 entries', `Got: ${planV1_1.versionHistory.length}`);
  const day2Evening = planV1_1.currentVersion.days[1].eveningActivities;
  assert(day2Evening.some((a) => a.name === 'Sunset Point & Beach Walk'), 'Test 7.3: Added activity present in Day 2 evening');

  // Test 8: Remove activity
  const planV1_2 = dynamicItineraryEngine.removeActivityFromDay(planV1_1, 2, 'act-custom-1');
  assert(planV1_2.currentVersion.versionId === 'v1.2.0', 'Test 8.1: Version incremented to v1.2.0', `Got: ${planV1_2.currentVersion.versionId}`);
  assert(planV1_2.versionHistory.length === 3, 'Test 8.2: Version history now contains 3 entries', `Got: ${planV1_2.versionHistory.length}`);
  const day2EveningAfterRemove = planV1_2.currentVersion.days[1].eveningActivities;
  assert(!day2EveningAfterRemove.some((a) => a.name === 'Sunset Point & Beach Walk'), 'Test 8.3: Removed activity is no longer in Day 2 evening');

  // Test 9: Replace activity
  const replacementActivity = {
    ...customActivity,
    id: 'act-custom-replaced',
    name: 'Sudama Bridge Stroll',
  };
  const targetId = planDwarka.currentVersion.days[1].morningActivities[0].id;
  const planReplaced = dynamicItineraryEngine.replaceActivity(planDwarka, 2, targetId, replacementActivity);
  assert(planReplaced.currentVersion.days[1].morningActivities.some((a) => a.name === 'Sudama Bridge Stroll'), 'Test 9.1: Activity replaced successfully');

  // Test 10: Regenerate day
  const planRegenerated = dynamicItineraryEngine.regenerateDay(planDwarka, 2);
  assert(planRegenerated.currentVersion.days[1] !== undefined, 'Test 10.1: Day 2 regenerated successfully');
  assert(planRegenerated.versionHistory.length === 2, 'Test 10.2: Regeneration recorded in version history');

  // Test 11: Change travel pace
  const planRelaxed = dynamicItineraryEngine.changeTravelPace(planDwarka, 'relaxed');
  assert(planRelaxed.currentVersion.days.every((d) => d.activeHours <= 7.5), 'Test 11.1: Relaxed pace reduces active hours (<= 7.5h/day)');

  // Test 12: Version restoration (undo / rollback)
  const planRestored = dynamicItineraryEngine.restoreVersion(planV1_2, 'v1.0.0');
  assert(planRestored.currentVersion.versionId === 'v1.3.0', 'Test 12.1: Restoration recorded with new version id v1.3.0', `Got: ${planRestored.currentVersion.versionId}`);
  assert(planRestored.currentVersion.changeSummary.includes('Restored version v1.0.0'), 'Test 12.2: Restoration summary properly formatted');

  // -------------------------------------------------------------------------
  // GROUP F: DETERMINISTIC VALIDATION & ZERO FABRICATION
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP F: DETERMINISTIC VALIDATION & ZERO FABRICATION ---');

  // Test 13: Deterministic validation score and active hours
  assert(planDwarka.validation.score >= 80, 'Test 13.1: Dwarka plan validation score >= 80', `Score: ${planDwarka.validation.score}`);
  assert(planDwarka.validation.checks.realisticActiveHours === true, 'Test 13.2: Realistic active hours verified');
  assert(planDwarka.validation.checks.noDuplicateAttractions === true, 'Test 13.3: Zero duplicate attractions verified');
  assert(planDwarka.validation.checks.routeContinuity === true, 'Test 13.4: Route continuity verified');

  // Test 14: User-locked transport honored
  const profLocked = createDefaultPreferenceProfile({
    origin: 'Ahmedabad',
    destination: 'Dwarka',
    tripDurationDays: 4,
  });
  profLocked.transport.preferredTransport = 'train';
  profLocked.lockedKeys = ['transport.preferredTransport'];

  const planLocked = dynamicItineraryEngine.generateItinerary({
    preferenceProfile: profLocked,
    startDate: '2026-11-10',
  });
  assert(planLocked.validation.checks.lockedPreferencesHonored === true, 'Test 14.1: Locked preference honored in validation check');

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});


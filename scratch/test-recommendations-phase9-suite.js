/**
 * BharatYatra AI 2.0 — Phase 9 Automated Test Suite
 * Comprehensive verification of Travel Recommendations & Personalization Engine.
 * Tests Groups A through F.
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

const recModule = customRequire(rootDir, '@/lib/ai-planner/travel-recommendation-engine');
const prefModule = customRequire(rootDir, '@/lib/ai-planner/universal-preference-profile');

const { travelRecommendationEngine, VERIFIED_ALTERNATIVE_DESTINATIONS, REGIONAL_FOOD_EXPERIENCES } = recModule;
const { createDefaultPreferenceProfile } = prefModule;

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
  console.log('BHARATYATRA AI 2.0 — PHASE 9: RECOMMENDATIONS ENGINE TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // GROUP A: DESTINATION RECOMMENDATIONS & COVERAGE
  // -------------------------------------------------------------------------
  console.log('--- GROUP A: DESTINATION RECOMMENDATIONS & ALL-INDIA COVERAGE ---');

  // Test 1: Heritage traveler from Ahmedabad
  const profHeritage = createDefaultPreferenceProfile({
    origin: 'Ahmedabad',
    destination: 'Dwarka',
    tripDurationDays: 4,
  });
  profHeritage.interests.heritage = true;
  profHeritage.interests.culture = true;

  const resHeritage = travelRecommendationEngine.generateRecommendations({
    userId: 'user_test_heritage',
    preferenceProfile: profHeritage,
    travelMonth: 11,
    maxResults: 6,
  });

  assert(resHeritage.recommendedDestinations.length > 0, 'Test 1.1: Generates destination recommendations');
  assert(resHeritage.recommendedDestinations.some((d) => d.state === 'Gujarat' || d.state === 'Rajasthan'), 'Test 1.2: Recommends geographically relevant destinations for Ahmedabad');
  assert(resHeritage.recommendedDestinations[0].fitScore >= 75, 'Test 1.3: Top destination has high fit score (>= 75)', `Score: ${resHeritage.recommendedDestinations[0].fitScore}`);
  assert(resHeritage.recommendedDestinations.every((d) => d.explanation && d.explanation.length > 10), 'Test 1.4: Every destination includes concise explanation');

  // Test 2: Budget constraint enforcement
  const profBudget = createDefaultPreferenceProfile({
    origin: 'Delhi',
    destination: 'Jaipur',
    tripDurationDays: 3,
  });
  profBudget.budget.totalBudget = 15000;

  const resBudget = travelRecommendationEngine.generateRecommendations({
    userId: 'user_test_budget',
    preferenceProfile: profBudget,
    travelMonth: 11,
    maxResults: 6,
  });

  const withinBudgetCount = resBudget.recommendedDestinations.filter((d) => d.estimatedBudgetInr <= 15000 * 1.25).length;
  assert(withinBudgetCount >= resBudget.recommendedDestinations.length * 0.8, 'Test 2.1: >= 80% destinations adhere to user budget ceiling');

  // Test 3: Short duration (Weekend Getaway)
  const profWeekend = createDefaultPreferenceProfile({
    origin: 'Mumbai',
    destination: 'Lonavala',
    tripDurationDays: 2,
  });
  const resWeekend = travelRecommendationEngine.generateRecommendations({
    userId: 'user_test_weekend',
    preferenceProfile: profWeekend,
    travelMonth: 8,
    maxResults: 6,
  });
  assert(resWeekend.recommendedDestinations.every((d) => d.distanceFromOriginKm <= 1200), 'Test 3.1: Short trips filter out distant unfeasible destinations');

  // -------------------------------------------------------------------------
  // GROUP B: CONTEXT-AWARE RECOMMENDATIONS
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP B: CONTEXT-AWARE RECOMMENDATIONS ---');

  // Test 4: Attractions in Dwarka
  assert(resHeritage.contextAttractions.length > 0, 'Test 4.1: Generates context-aware attractions for destination');
  assert(resHeritage.contextAttractions.some((a) => a.name.includes('Dwarkadhish')), 'Test 4.2: Dwarkadhish Temple present in Dwarka context attractions');

  // Test 5: Hotels and Stays
  assert(resHeritage.contextAccommodations.length >= 2, 'Test 5.1: Recommends tiered accommodations');
  assert(resHeritage.contextAccommodations.some((h) => h.tier === 'standard'), 'Test 5.2: Standard tier accommodation included');

  // Test 6: Regional Food Experiences
  assert(resHeritage.contextFoodExperiences.length > 0, 'Test 6.1: Generates regional culinary recommendations');
  assert(resHeritage.contextFoodExperiences[0].mustTryDishes.some((d) => d.toLowerCase().includes('kathiyawadi') || d.toLowerCase().includes('khichdi') || d.toLowerCase().includes('dhokla')), 'Test 6.2: Authentic Gujarati dishes recommended');

  // Test 7: Family & Senior Trip Suitability
  const profFamily = createDefaultPreferenceProfile({
    origin: 'Delhi',
    destination: 'Leh',
    tripDurationDays: 6,
  });
  profFamily.identity.travelerComposition = { adults: 2, seniors: 2, children: 0 };
  const resFamily = travelRecommendationEngine.generateRecommendations({
    userId: 'user_test_family',
    preferenceProfile: profFamily,
    travelMonth: 7,
  });
  assert(resFamily.contextAttractions.every((a) => a.fitScore !== undefined), 'Test 7.1: Senior-friendly suitability scored');

  // -------------------------------------------------------------------------
  // GROUP C: PERSONALIZATION & FEEDBACK LEARNING
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP C: PERSONALIZATION & FEEDBACK LEARNING ---');

  const testUserId = 'user_dynamic_learner_1';
  const baseProfile = createDefaultPreferenceProfile({ origin: 'Ahmedabad', destination: 'Dwarka' });

  // Test 8: Like a destination
  travelRecommendationEngine.recordFeedback({
    eventId: 'evt-1',
    userId: testUserId,
    itemType: 'destination',
    itemId: 'Somnath',
    action: 'LIKE',
    timestamp: new Date().toISOString(),
    context: { category: 'religious' },
  });

  const profAfterLike = travelRecommendationEngine.getOrCreatePersonalizationProfile(testUserId);
  assert(profAfterLike.likedItemIds.includes('Somnath'), 'Test 8.1: Liked destination added to likedItemIds');
  assert((profAfterLike.inferredInterests['religious'] || 0) > 0, 'Test 8.2: Inferred religious interest weight boosted by LIKE action');

  // Test 9: Save a destination
  travelRecommendationEngine.recordFeedback({
    eventId: 'evt-2',
    userId: testUserId,
    itemType: 'destination',
    itemId: 'Udaipur',
    action: 'SAVE',
    timestamp: new Date().toISOString(),
    context: { category: 'heritage' },
  });
  const profAfterSave = travelRecommendationEngine.getOrCreatePersonalizationProfile(testUserId);
  assert(profAfterSave.savedDestinations.includes('Udaipur'), 'Test 9.1: Saved destination added to savedDestinations');

  // Test 10: Dislike a destination (suppression)
  travelRecommendationEngine.recordFeedback({
    eventId: 'evt-3',
    userId: testUserId,
    itemType: 'destination',
    itemId: 'Kutch',
    action: 'DISLIKE',
    timestamp: new Date().toISOString(),
  });
  const recAfterDislike = travelRecommendationEngine.generateRecommendations({
    userId: testUserId,
    preferenceProfile: baseProfile,
  });
  assert(!recAfterDislike.recommendedDestinations.some((d) => d.name === 'Kutch'), 'Test 10.1: Disliked destination is strictly suppressed from recommendations');

  // Test 11: Reset learned personalization signals
  const resetProfile = travelRecommendationEngine.resetPersonalization(testUserId);
  assert(Object.keys(resetProfile.inferredInterests).length === 0, 'Test 11.1: Inferred interests cleared upon reset');
  assert(resetProfile.likedItemIds.length === 0, 'Test 11.2: Liked items cleared upon reset');
  assert(resetProfile.savedDestinations.length === 0, 'Test 11.3: Saved items cleared upon reset');
  assert(resetProfile.explicitProfile !== undefined, 'Test 11.4: Explicit preferences preserved intact');

  // -------------------------------------------------------------------------
  // GROUP D: THEMATIC CIRCUITS & ALTERNATIVES
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP D: THEMATIC CIRCUITS & ALTERNATIVES ---');

  // Test 12: Thematic Circuits
  assert(resHeritage.recommendedCircuits.length > 0, 'Test 12.1: Canonical circuits recommended');
  assert(resHeritage.recommendedCircuits[0].orderedStops.length >= 2, 'Test 12.2: Circuit contains ordered multi-stop sequence');

  // Test 13: Smart Substitute / Alternative Destinations
  const resLehAlt = travelRecommendationEngine.generateRecommendations({
    userId: 'user_leh_test',
    targetDestination: 'Leh',
  });
  assert(resLehAlt.alternativeDestinations.length > 0, 'Test 13.1: Alternative destinations generated');
  const lehAlt = resLehAlt.alternativeDestinations[0];
  assert(lehAlt.alternativeDestination === 'Dharamshala', 'Test 13.2: Leh altitude substitute is Dharamshala');
  assert(lehAlt.primaryReason === 'altitude_safety', 'Test 13.3: High-altitude safety recognized as primary reason');

  const resGoaAlt = travelRecommendationEngine.generateRecommendations({
    userId: 'user_goa_test',
    targetDestination: 'Goa',
  });
  const goaAlt = resGoaAlt.alternativeDestinations[0];
  assert(goaAlt.alternativeDestination === 'Gokarna', 'Test 13.4: Goa crowd substitute is Gokarna');
  assert(goaAlt.metrics.crowdReductionPercent >= 40, 'Test 13.5: Verifies crowd reduction metric (>= 40%)');

  // -------------------------------------------------------------------------
  // GROUP E: RECOMMENDATION QUALITY METRICS
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP E: RECOMMENDATION QUALITY METRICS ---');

  const q = resHeritage.qualityMetrics;
  assert(q.precisionAtK >= 0.75, 'Test 14.1: Precision@K >= 0.75', `Got: ${q.precisionAtK}`);
  assert(q.ndcgAtK >= 0.75, 'Test 14.2: NDCG@K >= 0.75', `Got: ${q.ndcgAtK}`);
  assert(q.diversityScore >= 0.30, 'Test 14.3: State diversity score >= 0.30', `Got: ${q.diversityScore}`);
  assert(q.duplicateRate === 0.0, 'Test 14.4: Zero duplicate recommendations (duplicateRate == 0.0)', `Got: ${q.duplicateRate}`);
  assert(q.constraintViolationRate <= 0.20, 'Test 14.5: Constraint violation rate <= 0.20', `Got: ${q.constraintViolationRate}`);

  // -------------------------------------------------------------------------
  // GROUP F: RELIABILITY & EDGE CASES
  // -------------------------------------------------------------------------
  console.log('\n--- GROUP F: RELIABILITY & EDGE CASES ---');

  // Test 15: Non-existent destination handles gracefully
  const resEdge = travelRecommendationEngine.generateRecommendations({
    userId: 'user_edge_test',
    targetDestination: 'NonExistentPlaceXYZ',
  });
  assert(resEdge.recommendedDestinations.length > 0, 'Test 15.1: Fallback recommendations generated for unknown destination');
  assert(resEdge.alternativeDestinations.length > 0, 'Test 15.2: Safe substitute generated without crash');

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

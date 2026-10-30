/**
 * BharatYatra AI 2.0 — Destination Intelligence & Smart Trip Duration Engine
 * Comprehensive Test Suite
 */

import { calculateDualTripDuration } from '../lib/ai-planner/duration-calculation-engine';
import { getComprehensiveDestinationIntelligence } from '../lib/ai-planner/destination-intelligence';
import { POST as recommendPOST, GET as recommendGET } from '../app/api/ai/trip-duration/recommend/route';
import { POST as validatePOST } from '../app/api/ai/trip-duration/validate/route';
import { POST as generateItineraryPOST } from '../app/api/ai/itinerary/generate/route';
import { POST as recalculateItineraryPOST } from '../app/api/ai/itinerary/recalculate/route';
import { GET as intelligenceGET } from '../app/api/destinations/intelligence/route';

async function runTests() {
  console.log('================================================================');
  console.log('   BHARATYATRA AI 2.0 — DESTINATION & DURATION TEST SUITE       ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // =================================================================
  // 1. TEN NATIONWIDE TEST ROUTES (Pan-India Coverage)
  // =================================================================
  console.log('\n--- 1. Testing 10 Nationwide Travel Routes ---');

  const testRoutes = [
    {
      id: 'ROUTE_1',
      name: 'Ahmedabad to Statue of Unity (Weekend/Excursion)',
      origin: 'Ahmedabad',
      destination: 'Statue of Unity',
      expectedMinDaysMax: 3,
      expectedRecDaysMin: 2,
    },
    {
      id: 'ROUTE_2',
      name: 'Ahmedabad to Jaipur (Heritage & Forts, Rajasthan)',
      origin: 'Ahmedabad',
      destination: 'Jaipur',
      expectedMinDaysMin: 3,
      expectedRecDaysMin: 4,
    },
    {
      id: 'ROUTE_3',
      name: 'Ahmedabad to Mumbai (Multimodal Metro, Maharashtra)',
      origin: 'Ahmedabad',
      destination: 'Mumbai',
      expectedMinDaysMin: 2,
      expectedRecDaysMin: 3,
    },
    {
      id: 'ROUTE_4',
      name: 'Ahmedabad to Goa (Coastal Leisure)',
      origin: 'Ahmedabad',
      destination: 'Goa',
      expectedMinDaysMin: 3,
      expectedRecDaysMin: 4,
    },
    {
      id: 'ROUTE_5',
      name: 'Ahmedabad to Kashmir (Alpine Scenic, J&K)',
      origin: 'Ahmedabad',
      destination: 'Srinagar',
      expectedMinDaysMin: 4,
      expectedRecDaysMin: 5,
    },
    {
      id: 'ROUTE_6',
      name: 'Ahmedabad to Ladakh (High-Altitude Acclimatization)',
      origin: 'Ahmedabad',
      destination: 'Ladakh',
      expectedMinDaysMin: 5, // Strict floor >= 5 days
      expectedRecDaysMin: 7, // Comfortable >= 7 days
      checkAcclimatization: true,
    },
    {
      id: 'ROUTE_7',
      name: 'Ahmedabad to Rishikesh (Spiritual & Adventure, Uttarakhand)',
      origin: 'Ahmedabad',
      destination: 'Rishikesh',
      expectedMinDaysMin: 3,
      expectedRecDaysMin: 4,
    },
    {
      id: 'ROUTE_8',
      name: 'Ahmedabad to Varanasi (Pilgrimage & Ghats, UP)',
      origin: 'Ahmedabad',
      destination: 'Varanasi',
      expectedMinDaysMin: 3,
      expectedRecDaysMin: 4,
    },
    {
      id: 'ROUTE_9',
      name: 'Ahmedabad to Kerala (Long-Distance Multi-Destination)',
      origin: 'Ahmedabad',
      destination: 'Kochi',
      expectedMinDaysMin: 4,
      expectedRecDaysMin: 5,
    },
    {
      id: 'ROUTE_10',
      name: 'Ahmedabad to Golden Triangle Multi-City (Delhi-Agra-Jaipur)',
      origin: 'Ahmedabad',
      destination: 'Delhi',
      expectedMinDaysMin: 3,
      expectedRecDaysMin: 5,
    },
  ];

  for (const r of testRoutes) {
    const result = calculateDualTripDuration({
      origin: r.origin,
      destination: r.destination,
      travelPace: 'balanced',
    });

    const minDays = result.minimumDuration.days!;
    const recDays = (result.recommendedDuration?.days || result.comfortableDuration?.days)!;

    assert(
      minDays > 0 && recDays > 0,
      `${r.id} (${r.destination}): Durations calculated`,
      `Min: ${minDays}, Rec: ${recDays}`
    );

    assert(
      recDays >= minDays,
      `${r.id} (${r.destination}): Recommended (${recDays}) >= Minimum (${minDays})`
    );

    if (r.expectedMinDaysMax) {
      assert(
        minDays <= r.expectedMinDaysMax,
        `${r.id} (${r.destination}): Minimum <= ${r.expectedMinDaysMax} days (got ${minDays})`
      );
    }
    if (r.expectedMinDaysMin) {
      assert(
        minDays >= r.expectedMinDaysMin,
        `${r.id} (${r.destination}): Minimum >= ${r.expectedMinDaysMin} days (got ${minDays})`
      );
    }
    if (r.expectedRecDaysMin) {
      assert(
        recDays >= r.expectedRecDaysMin,
        `${r.id} (${r.destination}): Recommended >= ${r.expectedRecDaysMin} days (got ${recDays})`
      );
    }

    // Altitude Acclimatization Verification for Ladakh
    if (r.checkAcclimatization) {
      assert(
        minDays >= 5,
        `Ladakh Acclimatization: Minimum Duration Floor is >= 5 days (actual: ${minDays})`
      );
      assert(
        recDays >= 7,
        `Ladakh Acclimatization: Recommended Duration is >= 7 days (actual: ${recDays})`
      );
      assert(
        result.minimumDuration.acclimatizationRequired === true &&
        result.comfortableDuration.acclimatizationRequired === true,
        `Ladakh Acclimatization: Flag is explicitly TRUE`
      );
      assert(
        (result.comfortableDuration.acclimatizationDays || 0) >= 2,
        `Ladakh Acclimatization: Acclimatization days >= 2 (actual: ${result.comfortableDuration.acclimatizationDays})`
      );
    }

    // Confidence Breakdown Check
    assert(
      result.confidence.score! >= 50 && result.confidence.score! <= 100,
      `${r.id} (${r.destination}): Confidence score between 50-100 (got ${result.confidence.score}%)`
    );
    assert(
      result.confidence.breakdown.routeVerification > 0 &&
      result.confidence.breakdown.destinationDataCompleteness > 0 &&
      result.confidence.breakdown.transportationAvailability > 0,
      `${r.id} (${r.destination}): Confidence has measurable breakdown components`
    );
    assert(
      result.sources && result.sources.length > 0,
      `${r.id} (${r.destination}): Data sources explicitly documented (${result.sources.join(', ')})`
    );
  }

  // =================================================================
  // 2. COMPREHENSIVE DESTINATION INTELLIGENCE
  // =================================================================
  console.log('\n--- 2. Testing Comprehensive Destination Intelligence ---');

  const intelLadakh = getComprehensiveDestinationIntelligence('Ladakh');
  assert(
    intelLadakh !== null,
    'Destination Intel: Ladakh found in registry'
  );
  if (intelLadakh) {
    assert(
      intelLadakh.altitudeCategory === 'high_altitude' || intelLadakh.altitudeCategory === 'extreme_altitude',
      `Destination Intel: Ladakh identified as high/extreme altitude (got ${intelLadakh.altitudeCategory})`
    );
    assert(
      intelLadakh.destinationFactors.acclimatizationRequired === true,
      'Destination Intel: Ladakh acclimatization required is TRUE'
    );
    assert(
      intelLadakh.geographicFactors.state === 'Ladakh',
      `Destination Intel: Ladakh correctly mapped to UT (got ${intelLadakh.geographicFactors.state})`
    );
    assert(
      intelLadakh.transportationFactors.nearestMajorAirport.code === 'IXL',
      `Destination Intel: Ladakh nearest airport is IXL (Leh Kushok Bakula Rimpochee)`
    );
  }

  const intelGoa = getComprehensiveDestinationIntelligence('Goa');
  assert(
    intelGoa !== null,
    'Destination Intel: Goa found in registry'
  );
  if (intelGoa) {
    assert(
      intelGoa.altitudeCategory === 'sea_level',
      'Destination Intel: Goa identified as sea level'
    );
    assert(
      intelGoa.destinationFactors.acclimatizationRequired === false,
      'Destination Intel: Goa does not require acclimatization'
    );
    assert(
      intelGoa.geographicFactors.terrainType === 'coastal',
      `Destination Intel: Goa terrain is coastal (got ${intelGoa.geographicFactors.terrainType})`
    );
  }

  // =================================================================
  // 3. ADVERSARIAL AND EDGE CASE TESTS
  // =================================================================
  console.log('\n--- 3. Testing Adversarial & Edge Cases ---');

  // A. Non-existent / Obscure Location
  const intelNonExistent = getComprehensiveDestinationIntelligence('Atlantis_Unknown_XYZ');
  assert(
    intelNonExistent !== null && intelNonExistent.geographicFactors.state !== '',
    'Adversarial: Non-existent location gracefully falls back to default intelligence without crashing'
  );

  // B. Extreme Altitude Fast-Pace Request
  const extremePaceLadakh = calculateDualTripDuration({
    origin: 'Delhi',
    destination: 'Ladakh',
    travelPace: 'fast',
  });
  assert(
    extremePaceLadakh.minimumDuration.days! >= 5,
    `Adversarial: Fast pace does NOT bypass Ladakh 5-day safety floor (got ${extremePaceLadakh.minimumDuration.days} days)`
  );

  // C. Same Origin and Destination
  const sameCity = calculateDualTripDuration({
    origin: 'Ahmedabad',
    destination: 'Ahmedabad',
    travelPace: 'relaxed',
  });
  assert(
    sameCity.minimumDuration.days! >= 1 && sameCity.minimumDuration.days! <= 3,
    `Edge Case: Same origin/destination calculates local day/weekend trip (got ${sameCity.minimumDuration.days} days)`
  );

  // =================================================================
  // 4. API ENDPOINT VERIFICATION
  // =================================================================
  console.log('\n--- 4. Testing Next.js API Routes ---');

  // A. POST /api/ai/trip-duration/recommend
  const recReq = new Request('http://localhost:3000/api/ai/trip-duration/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin: 'Ahmedabad', destination: 'Jaipur', pace: 'balanced' }),
  });
  const recRes = await recommendPOST(recReq as any);
  const recData = await recRes.json();
  assert(recData.success === true, 'API POST /api/ai/trip-duration/recommend returns success=true');
  assert(recData.minimumDuration.days >= 2, 'API recommend returns minimumDuration');
  assert(recData.comfortableDuration.days >= 3, 'API recommend returns comfortableDuration');
  assert(recData.confidence.score > 0, 'API recommend returns confidence score');

  // B. GET /api/ai/trip-duration/recommend
  const recGetReq = new Request('http://localhost:3000/api/ai/trip-duration/recommend?origin=Mumbai&destination=Goa&pace=relaxed');
  const recGetRes = await recommendGET(recGetReq as any);
  const recGetData = await recGetRes.json();
  assert(recGetData.success === true, 'API GET /api/ai/trip-duration/recommend returns success=true');
  assert(recGetData.destination === 'Old Goa' || recGetData.destination === 'Goa', `API GET recommend matches destination (${recGetData.destination})`);

  // C. POST /api/ai/trip-duration/validate
  const valReq = new Request('http://localhost:3000/api/ai/trip-duration/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin: 'Ahmedabad', destination: 'Ladakh', proposedDurationDays: 2 }),
  });
  const valRes = await validatePOST(valReq as any);
  const valData = await valRes.json();
  assert(valData.success === true, 'API POST /api/ai/trip-duration/validate returns success=true');
  assert(valData.validation.isValid === false, 'API validate flags 2 days in Ladakh as INVALID (requires >= 5 days)');
  assert(valData.validation.safetyWarning !== undefined, 'API validate includes high-altitude safety warning');

  // D. POST /api/ai/itinerary/generate (Plan Only, Zero Pricing)
  const genReq = new Request('http://localhost:3000/api/ai/itinerary/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: 'Ahmedabad',
      destination: 'Jaipur',
      durationDays: 4,
      travelPace: 'balanced',
      interests: ['heritage', 'forts', 'culture'],
    }),
  });
  const genRes = await generateItineraryPOST(genReq as any);
  const genData = await genRes.json();
  assert(genData.success === true, 'API POST /api/ai/itinerary/generate returns success=true');
  assert(genData.itinerary.dayWiseItinerary.length === 4, `API generate produces exactly 4 days (got ${genData.itinerary.dayWiseItinerary.length})`);
  assert(genData.pricingIncluded === false, 'API generate confirms pricingIncluded=false');

  // Verify Zero Invented Prices in Itinerary
  const itineraryStr = JSON.stringify(genData.itinerary);
  const hasCurrency = /(₹|[$€£]|\bINR\b|\bRs\.?\s*\d)/.test(itineraryStr);
  assert(!hasCurrency, 'API generate itinerary contains ZERO currency symbols or price tokens');

  // E. POST /api/ai/itinerary/recalculate
  const recalcReq = new Request('http://localhost:3000/api/ai/itinerary/recalculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: 'Ahmedabad',
      destination: 'Jaipur',
      newDurationDays: 5,
      travelPace: 'relaxed',
    }),
  });
  const recalcRes = await recalculateItineraryPOST(recalcReq as any);
  const recalcData = await recalcRes.json();
  assert(recalcData.success === true, 'API POST /api/ai/itinerary/recalculate returns success=true');
  assert(recalcData.itinerary.dayWiseItinerary.length === 5, `API recalculate produces updated 5-day itinerary (got ${recalcData.itinerary.dayWiseItinerary.length})`);

  // F. GET /api/destinations/intelligence
  const intelReq = new Request('http://localhost:3000/api/destinations/intelligence?destination=Varanasi');
  const intelRes = await intelligenceGET(intelReq as any);
  const intelData = await intelRes.json();
  assert(intelData.success === true, 'API GET /api/destinations/intelligence returns success=true');
  assert(intelData.intelligence.destination === 'Varanasi', 'API intelligence returns correct destination metadata');
  assert(intelData.intelligence.geographicFactors.state === 'Uttar Pradesh', 'API intelligence state is Uttar Pradesh');

  // =================================================================
  // SUMMARY
  // =================================================================
  console.log('\n================================================================');
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed with unhandled error:', err);
  process.exit(1);
});

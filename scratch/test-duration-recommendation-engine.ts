/**
 * BharatYatra — Trip Duration Intelligence Engine Test Suite
 * Tests 15 core scenarios:
 * A. Nearby (Ahmedabad -> Statue of Unity)
 * B. Regional (Ahmedabad -> Udaipur)
 * C. Interstate (Ahmedabad -> Jaipur)
 * D. Long-distance (Ahmedabad -> Srinagar/Kashmir)
 * E. Remote / High Altitude (Ahmedabad -> Leh Ladakh, 48h acclimatization test)
 * F. Multi-destination sequence (Ahmedabad -> Udaipur -> Jaipur)
 * G. Transport mode variations (Flight vs Train vs Car vs Motorcycle)
 * H. Pace variations (Relaxed vs Balanced vs Active)
 * I. Budget adaptation
 * J. Fallback / incomplete input handling
 * K. Seasonal advisories
 * L. Overnight transit detection
 * M. Return journey feasibility
 * N. Duplicate destination deduplication
 * O. Senior / child accessibility buffers
 */

import {
  calculateTripDurationRecommendation,
  sequenceDestinations,
  classifyDestination,
  TripDurationRecommendationInput,
} from '../lib/ai-planner/trip-duration-intelligence-engine';

async function runTestSuite() {
  console.log('===============================================================');
  console.log(' BharatYatra: Trip Duration Intelligence Engine Test Suite');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
    }
  }

  // --- Test A: Nearby Destination ---
  const caseA = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Statue of Unity'],
    travelMode: 'car',
  });
  assert(
    caseA.recommendedDuration.days >= 1 && caseA.recommendedDuration.days <= 2,
    'Case A: Nearby Destination (Ahmedabad -> Statue of Unity)',
    `Recommended: ${caseA.recommendedDuration.days} days, Transit: ${caseA.travelTime.totalTransitHours.toFixed(1)} hrs`
  );

  // --- Test B: Regional Destination ---
  const caseB = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Udaipur'],
    travelMode: 'car',
  });
  assert(
    caseB.recommendedDuration.days >= 2 && caseB.recommendedDuration.days <= 4,
    'Case B: Regional Destination (Ahmedabad -> Udaipur)',
    `Recommended: ${caseB.recommendedDuration.days} days, Nights: ${caseB.recommendedDuration.nights}`
  );

  // --- Test C: Interstate Destination ---
  const caseC = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Jaipur'],
    travelMode: 'train',
  });
  assert(
    caseC.recommendedDuration.days >= 4 && caseC.recommendedDuration.days <= 6,
    'Case C: Interstate Destination (Ahmedabad -> Jaipur)',
    `Recommended: ${caseC.recommendedDuration.days} days, Min: ${caseC.minimumDuration.days} days`
  );

  // --- Test D: Long Distance Destination ---
  const caseD = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Srinagar'],
    travelMode: 'flight',
  });
  assert(
    caseD.recommendedDuration.days >= 5 && caseD.recommendedDuration.days <= 8,
    'Case D: Long Distance Destination (Ahmedabad -> Srinagar via Flight)',
    `Recommended: ${caseD.recommendedDuration.days} days, Relaxed: ${caseD.relaxedDuration.days} days`
  );

  // --- Test E: Remote & High Altitude (Leh-Ladakh Acclimatization) ---
  const caseE = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Leh'],
    travelMode: 'flight',
  });
  assert(
    caseE.recommendedDuration.days >= 6 &&
    caseE.acclimatizationNotice !== undefined &&
    caseE.acclimatizationNotice.includes('acclimatization'),
    'Case E: Remote & High Altitude Safety Floor (Leh-Ladakh)',
    `Recommended: ${caseE.recommendedDuration.days} days, Notice: "${caseE.acclimatizationNotice}"`
  );

  // --- Test F: Multi-destination Routing without Backtracking ---
  const sequenced = sequenceDestinations('Ahmedabad', ['Jaipur', 'Udaipur', 'Delhi']);
  assert(
    sequenced[0].toLowerCase().includes('udaipur') &&
    sequenced[1].toLowerCase().includes('jaipur') &&
    sequenced[2].toLowerCase().includes('delhi'),
    'Case F: Multi-destination Intelligent Sequencing (Geographic Proximity)',
    `Order: ${sequenced.join(' -> ')}`
  );

  // --- Test G: Mode Comparison (Flight vs Bus vs Motorcycle) ---
  const carTrip = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Goa'],
    travelMode: 'car',
  });
  const flightTrip = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Goa'],
    travelMode: 'flight',
  });
  const motoTrip = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Goa'],
    travelMode: 'motorcycle',
  });
  assert(
    flightTrip.travelTime.totalTransitHours < carTrip.travelTime.totalTransitHours &&
    motoTrip.travelTime.motorcycleBreaksHours !== undefined &&
    motoTrip.travelTime.motorcycleBreaksHours > 0,
    'Case G: Mode Travel Dynamics (Flight fastest, Motorcycle includes safety buffers)',
    `Flight transit: ${flightTrip.travelTime.totalTransitHours.toFixed(1)}h vs Car: ${carTrip.travelTime.totalTransitHours.toFixed(1)}h, Moto breaks: ${motoTrip.travelTime.motorcycleBreaksHours?.toFixed(1)}h`
  );

  // --- Test H: Travel Pace Sensitivity ---
  const relaxedPace = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Udaipur'],
    travelPace: 'relaxed',
  });
  const activePace = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Udaipur'],
    travelPace: 'active',
  });
  assert(
    relaxedPace.recommendedDuration.days >= activePace.recommendedDuration.days,
    'Case H: Travel Pace Adaptation (Relaxed >= Active)',
    `Relaxed: ${relaxedPace.recommendedDuration.days} days vs Active: ${activePace.recommendedDuration.days} days`
  );

  // --- Test I: Budget Constraint Adaptation ---
  const budgetTrip = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Udaipur'],
    budget: 12000,
    travellers: 2,
  });
  assert(
    budgetTrip.budgetEstimate !== undefined &&
    typeof budgetTrip.budgetEstimate.totalGroupCost === 'number',
    'Case I: Budget Projection & Adaptation',
    `Group Cost: ₹${budgetTrip.budgetEstimate.totalGroupCost}, Within Budget: ${budgetTrip.budgetEstimate.isWithinBudget}`
  );

  // --- Test J: Incomplete or Fallback Inputs ---
  const fallbackTrip = await calculateTripDurationRecommendation({
    destinations: ['Somnath'],
  });
  assert(
    fallbackTrip.recommendedDuration.days >= 2,
    'Case J: Fallback Input Handling (Default Origin Ahmedabad)',
    `Recommended: ${fallbackTrip.recommendedDuration.days} days for Somnath`
  );

  // --- Test K: Seasonal Warnings (Winter / Monsoon) ---
  const monsoonTrip = await calculateTripDurationRecommendation({
    origin: 'Delhi',
    destinations: ['Manali'],
    travelDate: '2026-07-20',
  });
  assert(
    monsoonTrip.warnings.length > 0 || monsoonTrip.seasonalAdvice !== undefined,
    'Case K: Seasonal / Monsoon Warnings Alert',
    `Warnings: ${monsoonTrip.warnings.join('; ') || monsoonTrip.seasonalAdvice}`
  );

  // --- Test L: Overnight Transit Detection ---
  const overnightTrip = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Varanasi'],
    travelMode: 'train',
  });
  assert(
    overnightTrip.travelTime.overnightTransitUsed === true,
    'Case L: Overnight Transit Detection for Distant Rail Routes',
    `Overnight Used: ${overnightTrip.travelTime.overnightTransitUsed}`
  );

  // --- Test M: Return Journey Feasibility ---
  assert(
    caseC.travelTime.returnHours > 0 &&
    caseC.travelTime.outboundHours > 0,
    'Case M: Return Journey Feasibility Calculations',
    `Outbound: ${caseC.travelTime.outboundHours.toFixed(1)}h, Return: ${caseC.travelTime.returnHours.toFixed(1)}h`
  );

  // --- Test N: Deduplication of Identical Destinations ---
  const multiDup = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Udaipur', 'udaipur', 'Udaipur'],
  });
  assert(
    multiDup.destinations.length === 1,
    'Case N: Zero Duplicate Destinations',
    `Destinations count: ${multiDup.destinations.length}`
  );

  // --- Test O: Senior Citizen Buffer ---
  const seniorTrip = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Dwarka'],
    hasSeniors: true,
  });
  const normalTrip = await calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Dwarka'],
    hasSeniors: false,
  });
  assert(
    seniorTrip.recommendedDuration.days >= normalTrip.recommendedDuration.days,
    'Case O: Senior Citizen Accessibility Buffer',
    `Senior Days: ${seniorTrip.recommendedDuration.days} >= Normal Days: ${normalTrip.recommendedDuration.days}`
  );

  console.log('\n===============================================================');
  console.log(` Test Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});


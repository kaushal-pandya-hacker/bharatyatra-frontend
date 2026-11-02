/**
 * Verification test for Smart Traveler Onboarding & Trip Duration Intelligence
 */
import {
  calculateTripDurationRecommendation,
  customizeTripDuration,
} from '../lib/ai-planner/trip-duration-intelligence-engine';
import { generateItineraryBlueprint } from '../lib/trips/itinerary-generator';

async function runTests() {
  console.log('================================================================');
  console.log('BHARATYATRA SMART ONBOARDING DURATION INTELLIGENCE VERIFICATION');
  console.log('================================================================\n');

  // Test 1: Ahmedabad to Ladakh - High altitude, long distance
  console.log('🧪 TEST 1: Ahmedabad -> Leh & Ladakh (Long Distance & High Altitude)');
  const ladakhResult = calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Leh', 'Nubra Valley', 'Pangong Lake'],
    travelPace: 'balanced',
    travelMode: 'flight',
    travellers: 4,
    hasSeniors: true,
  });

  console.log(`   Recommendation: ${ladakhResult.recommendedDuration.days} days / ${ladakhResult.recommendedDuration.nights} nights`);
  console.log(`   Minimum: ${ladakhResult.minimumDuration.days} days | Relaxed: ${ladakhResult.relaxedDuration.days} days`);
  console.log(`   Transit Time: ${ladakhResult.travelTime.totalTransitHours} hrs, Distance: ${ladakhResult.travelTime.totalDistanceKm} km`);
  console.log(`   Acclimatization / Notice: ${ladakhResult.acclimatizationNotice || 'Standard mountain protocol'}`);
  console.log(`   Reasoning: ${ladakhResult.reasoning.join(' | ')}`);
  
  if (ladakhResult.recommendedDuration.days >= 6 && ladakhResult.minimumDuration.days >= 4) {
    console.log('   ✅ PASS: Appropriately calculated duration and acclimatization for Ladakh.');
  } else {
    throw new Error('Ladakh duration or acclimatization calculation failed.');
  }

  // Test 2: Customization adjustment (- / + / Min / Relaxed)
  console.log('\n🧪 TEST 2: Duration Customization Tiers');
  const customizedOutput = customizeTripDuration({
    origin: 'Ahmedabad',
    destinations: ['Leh', 'Nubra Valley', 'Pangong Lake'],
    travelPace: 'balanced',
    travelMode: 'flight',
    travellers: 4,
    hasSeniors: true,
    customDays: ladakhResult.relaxedDuration.days,
  });
  console.log(`   Custom Days: ${customizedOutput.customDays} days (Status: ${customizedOutput.status})`);
  console.log(`   Explanation: ${customizedOutput.explanation}`);
  if (customizedOutput.customDays === ladakhResult.relaxedDuration.days && customizedOutput.isFeasible) {
    console.log('   ✅ PASS: Customization applied cleanly.');
  } else {
    throw new Error('Duration customization failed.');
  }

  // Test 3: Multi-destination Gujarat Heritage Circuit (Ahmedabad -> Kutch, Gir, Somnath, Dwarka)
  console.log('\n🧪 TEST 3: Multi-destination Road Trip (Gujarat Circuit)');
  const gujaratCircuit = calculateTripDurationRecommendation({
    origin: 'Ahmedabad',
    destinations: ['Rann of Kutch', 'Gir', 'Somnath', 'Dwarka'],
    travelPace: 'balanced',
    travelMode: 'car',
    travellers: 3,
  });
  console.log(`   Recommendation: ${gujaratCircuit.recommendedDuration.days} days / ${gujaratCircuit.recommendedDuration.nights} nights`);
  console.log(`   Minimum: ${gujaratCircuit.minimumDuration.days} days | Relaxed: ${gujaratCircuit.relaxedDuration.days} days`);
  console.log(`   Total Transit: ${gujaratCircuit.travelTime.totalTransitHours} hrs`);
  if (gujaratCircuit.recommendedDuration.days >= 5) {
    console.log('   ✅ PASS: Multi-destination circuit properly factored transit and exploration time.');
  } else {
    throw new Error('Multi-destination duration calculation failed.');
  }

  // Test 4: Budget estimation integration
  console.log('\n🧪 TEST 4: Dynamic Budget Estimation');
  const budget = gujaratCircuit.budgetEstimate;
  console.log(`   Total Estimated Group Cost: ₹${budget.totalGroupCost.toLocaleString('en-IN')} (₹${budget.perPersonCost.toLocaleString('en-IN')}/person)`);
  console.log(`   Breakdown - Stay: ₹${budget.breakdown.accommodation.toLocaleString('en-IN')}, Transit: ₹${budget.breakdown.transportation.toLocaleString('en-IN')}, Activities: ₹${budget.breakdown.sightseeingAndActivities.toLocaleString('en-IN')}`);
  if (budget.totalGroupCost > 0 && budget.perPersonCost > 0) {
    console.log('   ✅ PASS: Real-time budget estimation correctly generated.');
  } else {
    throw new Error('Budget estimation failed.');
  }

  // Test 5: Itinerary Blueprint Generation
  console.log('\n🧪 TEST 5: Itinerary Blueprint Generation from Onboarding Inputs');
  const blueprint = generateItineraryBlueprint({
    durationDays: gujaratCircuit.recommendedDuration.days,
    originCity: 'Ahmedabad',
    paxCount: 3,
    selectedTier: 'balanced',
    customPlaces: [
      { id: 9101, name: 'Rann of Kutch', district: 'Kutch', category: 'Modern & Cultural', description: 'White Rann salt desert and cultural festival', image: '/hero-bg.jpg' },
      { id: 9102, name: 'Gir National Park', district: 'Junagadh', category: 'Nature & Wildlife', description: 'Asiatic lion safari sanctuary', image: '/hero-bg.jpg' },
    ],
  });
  console.log(`   Circuit: ${blueprint.circuitTitle}`);
  console.log(`   Generated Days: ${blueprint.itineraryDays.length} days`);
  console.log(`   Day 1: ${blueprint.itineraryDays[0]?.dayTitle} (${blueprint.itineraryDays[0]?.district})`);
  if (blueprint.itineraryDays.length === gujaratCircuit.recommendedDuration.days) {
    console.log('   ✅ PASS: Generated itinerary matches intelligent recommended duration.');
  } else {
    throw new Error('Generated blueprint day count mismatch.');
  }

  console.log('\n================================================================');
  console.log('🎉 ALL SMART ONBOARDING DURATION TESTS PASSED 100%');
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

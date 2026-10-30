import fs from 'fs';
import { generateItineraryBlueprint } from '../lib/trips/itinerary-generator';

console.log('================================================================');
console.log('VERIFYING REMOVAL OF ESTIMATED TOTAL COST FROM AI ITINERARY');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

// 1. Check app/(customer)/plan/page.tsx
const planPage = fs.readFileSync('app/(customer)/plan/page.tsx', 'utf8');
assert(!planPage.includes('Estimated Total Cost'), 'app/(customer)/plan/page.tsx: No "Estimated Total Cost"');
assert(!planPage.includes('blueprint.totalPackageCost'), 'app/(customer)/plan/page.tsx: No "blueprint.totalPackageCost"');
assert(!planPage.includes('blueprint.pricePerPaxPerDay'), 'app/(customer)/plan/page.tsx: No "blueprint.pricePerPaxPerDay"');
assert(!planPage.includes('₹2,500/day'), 'app/(customer)/plan/page.tsx: No "₹2,500/day" in tier dropdown');
assert(planPage.includes('budgetInr: 0'), 'app/(customer)/plan/page.tsx: Saves trip with budgetInr: 0 (pure plan)');
assert(planPage.includes('Itinerary Duration'), 'app/(customer)/plan/page.tsx: Renders price-free Itinerary Duration');

// 2. Check 18_DEVELOPMENT/Frontend/app/(customer)/plan/page.tsx
const devPlanPage = fs.readFileSync('18_DEVELOPMENT/Frontend/app/(customer)/plan/page.tsx', 'utf8');
assert(!devPlanPage.includes('Estimated Total Cost'), '18_DEVELOPMENT/Frontend plan page: No "Estimated Total Cost"');

// 3. Check lib/trips/itinerary-generator.ts
const blueprint = generateItineraryBlueprint({
  selectedPlaces: [],
  durationDays: 5,
  paxCount: 4,
  selectedTier: 'balanced',
  originCity: 'Ahmedabad',
});
assert(blueprint.totalPackageCost === 0, `itinerary-generator: totalPackageCost is 0 (actual: ${blueprint.totalPackageCost})`);
assert(blueprint.pricePerPaxPerDay === 0, `itinerary-generator: pricePerPaxPerDay is 0 (actual: ${blueprint.pricePerPaxPerDay})`);

// 4. Check DurationRecommendationControls.tsx
const durControls = fs.readFileSync('components/ai/DurationRecommendationControls.tsx', 'utf8');
assert(!durControls.includes('Est. Cost'), 'DurationRecommendationControls: No "Est. Cost"');
assert(!durControls.includes('formatCurrency(quickTier'), 'DurationRecommendationControls: No quickTier currency');
assert(!durControls.includes('formatCurrency(recTier'), 'DurationRecommendationControls: No recTier currency');
assert(!durControls.includes('formatCurrency(extTier'), 'DurationRecommendationControls: No extTier currency');

// 5. Check DynamicItineraryPlanner.tsx
const dynPlanner = fs.readFileSync('components/ai/DynamicItineraryPlanner.tsx', 'utf8');
assert(!dynPlanner.includes('₹{m.estimatedCostInr}'), 'DynamicItineraryPlanner: No meal price');
assert(!dynPlanner.includes('₹${act.estimatedCostInr} fee'), 'DynamicItineraryPlanner: No activity fee');

console.log(`\n================================================================`);
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================================================\n`);

if (failed > 0) process.exit(1);


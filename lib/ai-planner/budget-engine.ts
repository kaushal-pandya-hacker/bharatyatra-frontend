/**
 * BharatYatra Financial Budget Engine
 * Calculates itemized trip costs and verifies budget compliance.
 */

import { TripBudget, TripDay, TravelerSpec } from './types';

export function calculateTripBudget(
  days: TripDay[],
  travelers: TravelerSpec,
  travelStyle: 'budget' | 'balanced' | 'premium' | 'luxury',
  userBudgetInr?: number
): TripBudget {
  const travelersCount = (travelers.adults || 1) + (travelers.children || 0) + (travelers.seniors || 0);
  const durationDays = days.length;

  // 1. Calculate Transportation Cost (Intercity + Local)
  let intercityTransportCost = 0;
  let localTransportCost = 0;

  days.forEach(d => {
    d.travelSegments.forEach(s => {
      intercityTransportCost += s.estimatedCostInr;
    });
    // Local transport buffer per day
    localTransportCost += (travelStyle === 'luxury' ? 1500 : travelStyle === 'premium' ? 1000 : 500) * travelersCount;
  });

  // 2. Accommodation Cost
  let accommodationCost = 0;
  days.forEach(d => {
    if (d.accommodation) {
      accommodationCost += d.accommodation.totalCostInr;
    } else {
      const defaultNightCost = travelStyle === 'luxury' ? 9000 : travelStyle === 'premium' ? 4500 : travelStyle === 'balanced' ? 2500 : 1200;
      accommodationCost += defaultNightCost * Math.ceil(travelersCount / 2);
    }
  });

  // 3. Food Cost per Person per Day
  const dailyFoodPerPerson = travelStyle === 'luxury' ? 2500 : travelStyle === 'premium' ? 1500 : travelStyle === 'balanced' ? 800 : 400;
  const foodCost = dailyFoodPerPerson * travelersCount * durationDays;

  // 4. Activities Cost
  let activitiesCost = 0;
  days.forEach(d => {
    const allActivities = [...d.morning, ...d.afternoon, ...d.evening];
    allActivities.forEach(a => {
      activitiesCost += (a.estimatedCostInr || 0) * travelersCount;
    });
  });

  // 5. Miscellaneous & Emergency Buffer (5%)
  const subtotal = intercityTransportCost + localTransportCost + accommodationCost + foodCost + activitiesCost;
  const miscellaneous = Math.round(subtotal * 0.05);
  const totalEstimatedInr = Math.round(subtotal + miscellaneous);

  // 6. Check Budget Compliance
  const isWithinBudget = userBudgetInr !== undefined ? totalEstimatedInr <= userBudgetInr : true;
  const tradeoffSuggestions: string[] = [];

  if (userBudgetInr && !isWithinBudget) {
    const excess = totalEstimatedInr - userBudgetInr;
    tradeoffSuggestions.push(`Estimated total (₹${totalEstimatedInr.toLocaleString('en-IN')}) exceeds your requested budget (₹${userBudgetInr.toLocaleString('en-IN')}) by ₹${excess.toLocaleString('en-IN')}.`);
    tradeoffSuggestions.push(`Suggestion 1: Switch accommodation to budget homestays to save ~₹${Math.round(accommodationCost * 0.4).toLocaleString('en-IN')}.`);
    tradeoffSuggestions.push(`Suggestion 2: Opt for AC Train / Shared Cabs instead of private taxi transfers.`);
    tradeoffSuggestions.push(`Suggestion 3: Adjust trip duration to ${Math.max(1, durationDays - 1)} days.`);
  }

  return {
    transportation: intercityTransportCost,
    accommodation: accommodationCost,
    food: foodCost,
    activities: activitiesCost,
    localTransport: localTransportCost,
    miscellaneous,
    totalEstimatedInr,
    userBudgetInr,
    isWithinBudget,
    tradeoffSuggestions,
  };
}

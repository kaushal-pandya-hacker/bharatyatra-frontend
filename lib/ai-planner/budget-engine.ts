/**
 * BharatYatra Financial Budget Engine
 * Calculates itemized trip costs and verifies budget compliance.
 * Uses realistic room-based accommodation and vehicle-based local transport.
 */

import { TripBudget, TripDay, TravelerSpec } from './types';

export function calculateTripBudget(
  days: TripDay[],
  travelers: TravelerSpec,
  travelStyle: 'budget' | 'balanced' | 'premium' | 'luxury',
  userBudgetInr?: number
): TripBudget {
  const travelersCount = Math.max(1, (travelers.adults || 1) + (travelers.children || 0) + (travelers.seniors || 0));
  const durationDays = Math.max(1, days.length);
  const roomsCount = Math.max(1, Math.ceil(travelersCount / 2));
  const vehiclesCount = Math.max(1, Math.ceil(travelersCount / 4));

  // 1. Calculate Transportation Cost (Intercity + Local)
  let intercityTransportCost = 0;
  let localTransportCost = 0;

  days.forEach(d => {
    d.travelSegments.forEach(s => {
      intercityTransportCost += s.estimatedCostInr;
    });
    // Vehicle-based local sightseeing rate per day
    const dailyVehicleRate = travelStyle === 'luxury' ? 4500 : travelStyle === 'premium' ? 2600 : travelStyle === 'balanced' ? 1600 : 450;
    localTransportCost += dailyVehicleRate * vehiclesCount;
  });

  // 2. Accommodation Cost (Room-Based Math)
  let accommodationCost = 0;
  days.forEach(d => {
    if (d.accommodation) {
      accommodationCost += d.accommodation.totalCostInr;
    } else {
      const defaultNightCostPerRoom = travelStyle === 'luxury' ? 12000 : travelStyle === 'premium' ? 5200 : travelStyle === 'balanced' ? 2600 : 1200;
      accommodationCost += defaultNightCostPerRoom * roomsCount;
    }
  });

  // 3. Food Cost per Person per Day
  const dailyFoodPerPerson = travelStyle === 'luxury' ? 3000 : travelStyle === 'premium' ? 1600 : travelStyle === 'balanced' ? 850 : 400;
  const foodCost = dailyFoodPerPerson * travelersCount * durationDays;

  // 4. Activities Cost
  let activitiesCost = 0;
  days.forEach(d => {
    const allActivities = [...d.morning, ...d.afternoon, ...d.evening];
    allActivities.forEach(a => {
      activitiesCost += (a.estimatedCostInr || 0) * travelersCount;
    });
  });

  // 5. Statutory Taxes & Service Charges (5% on budget/standard, 10% on premium/luxury)
  const taxRate = (travelStyle === 'luxury' || travelStyle === 'premium') ? 0.08 : 0.05;
  const subtotal = intercityTransportCost + localTransportCost + accommodationCost + foodCost + activitiesCost;
  const miscellaneous = Math.round(subtotal * taxRate);
  const totalEstimatedInr = Math.round(subtotal + miscellaneous);

  // 6. Check Budget Compliance
  const isWithinBudget = userBudgetInr !== undefined ? totalEstimatedInr <= userBudgetInr : true;
  const tradeoffSuggestions: string[] = [];

  if (userBudgetInr && !isWithinBudget) {
    const excess = totalEstimatedInr - userBudgetInr;
    tradeoffSuggestions.push(`Estimated total (₹${totalEstimatedInr.toLocaleString('en-IN')}) exceeds your requested budget (₹${userBudgetInr.toLocaleString('en-IN')}) by ₹${excess.toLocaleString('en-IN')}.`);
    tradeoffSuggestions.push(`Recommendation 1: Switch accommodation from ${travelStyle} to a verified clean homestay/standard hotel to save ~₹${Math.round(accommodationCost * 0.35).toLocaleString('en-IN')}.`);
    tradeoffSuggestions.push(`Recommendation 2: Opt for AC Train / Express Coach instead of flights to save on transit.`);
    tradeoffSuggestions.push(`Recommendation 3: Adjust trip duration to ${Math.max(2, durationDays - 1)} days.`);
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

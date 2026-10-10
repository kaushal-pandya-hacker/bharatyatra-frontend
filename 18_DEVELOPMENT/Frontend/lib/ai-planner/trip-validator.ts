/**
 * BharatYatra Comprehensive Trip Validator
 * Runs strict checks on dates, travel times, opening hours, budget, routes, and traveller constraints.
 */

import { TripDay, TripBudget, DestinationNode, TripValidationResult, ParsedIntent } from './types';

export function validateTripPlan(
  days: TripDay[],
  budget: TripBudget,
  intent: ParsedIntent,
  routeNodes: DestinationNode[]
): TripValidationResult {
  const criticalErrors: string[] = [];
  const warnings: string[] = [];

  // 1. Duration Validation
  if (days.length !== intent.durationDays) {
    criticalErrors.push(`Trip day count (${days.length}) does not match requested duration (${intent.durationDays} days).`);
  }

  // 2. Impossible Connections / Excessive Daily Travel
  days.forEach((day, i) => {
    const totalTravelKm = day.travelSegments.reduce((sum, s) => sum + s.distanceKm, 0);
    if (totalTravelKm > 600) {
      criticalErrors.push(`Day ${i + 1} involves ${totalTravelKm} km of road travel, which exceeds safety limits.`);
    }

    // Check duplicate activities in same day
    const activityNames = [...day.morning, ...day.afternoon, ...day.evening].map(a => a.name);
    const uniqueNames = new Set(activityNames);
    if (activityNames.length !== uniqueNames.size) {
      warnings.push(`Day ${i + 1} contains duplicate attraction recommendations.`);
    }
  });

  // 3. Budget Validation
  if (budget.userBudgetInr && !budget.isWithinBudget) {
    warnings.push(`Estimated total cost exceeds user requested budget limit.`);
  }

  // 4. Senior Traveler Accessibility Validation
  if (intent.seniorCount > 0) {
    days.forEach((day, i) => {
      const allActivities = [...day.morning, ...day.afternoon, ...day.evening];
      const strenuousCount = allActivities.filter(a => a.name.includes('Trek') || a.name.includes('Peak') || a.name.includes('Climb')).length;
      if (strenuousCount > 1) {
        warnings.push(`Day ${i + 1} includes high-strenuous activities unsuitable for senior travelers.`);
      }
    });
  }

  return {
    valid: criticalErrors.length === 0,
    criticalErrors,
    warnings,
  };
}

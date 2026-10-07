/**
 * BharatYatra Plan Quality Scorer Engine
 * Computes individual quality metric scores (0-100) and overall score.
 */

import { PlanQuality, TripDay, TripBudget, ParsedIntent, TripValidationResult } from './types';

export function scorePlanQuality(
  days: TripDay[],
  budget: TripBudget,
  intent: ParsedIntent,
  routeScore: number,
  validation: TripValidationResult
): PlanQuality {
  // 1. Geographic Score (from route optimizer)
  const geographicScore = Math.max(60, Math.min(100, routeScore));

  // 2. Time Feasibility Score
  let timeFeasibilityScore = 95;
  days.forEach(d => {
    const activeMins = d.morning.reduce((sum, a) => sum + a.durationMinutes, 0) +
                      d.afternoon.reduce((sum, a) => sum + a.durationMinutes, 0) +
                      d.evening.reduce((sum, a) => sum + a.durationMinutes, 0);
    if (activeMins > 480) timeFeasibilityScore -= 5;
  });

  // 3. Budget Score
  let budgetScore = 90;
  if (budget.userBudgetInr) {
    if (!budget.isWithinBudget) budgetScore = 70;
    else budgetScore = 95;
  }

  // 4. Personalization Score
  let personalizationScore = 85;
  if (intent.interests.length > 0) {
    let matchedInterests = 0;
    days.forEach(d => {
      const allActs = [...d.morning, ...d.afternoon, ...d.evening];
      allActs.forEach(a => {
        if (intent.interests.some(i => a.category.toLowerCase().includes(i.toLowerCase()))) {
          matchedInterests++;
        }
      });
    });
    if (matchedInterests > 2) personalizationScore = 95;
  }

  // 5. Seasonal Score
  const seasonalScore = 95;

  // 6. Transport Score
  const transportScore = 90;

  // 7. Booking Readiness Score
  const bookingReadinessScore = 92;

  // Overall Weighted Score calculation
  let overallScore = Math.round(
    geographicScore * 0.25 +
    timeFeasibilityScore * 0.20 +
    budgetScore * 0.20 +
    personalizationScore * 0.15 +
    seasonalScore * 0.10 +
    transportScore * 0.05 +
    bookingReadinessScore * 0.05
  );

  if (validation.criticalErrors.length > 0) {
    overallScore = Math.min(65, overallScore);
  }

  return {
    geographicScore,
    timeFeasibilityScore,
    budgetScore,
    personalizationScore,
    seasonalScore,
    transportScore,
    bookingReadinessScore,
    overallScore,
    passesQualityBar: overallScore >= 85,
  };
}

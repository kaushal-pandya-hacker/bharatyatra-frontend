/**
 * BharatYatra Seasonal & Festival Intelligence Engine
 * Evaluates seasonal accessibility, monsoon risks, extreme heat, and festival crowd impacts.
 */

export interface SeasonalCheckResult {
  isSuitable: boolean;
  warnings: string[];
  recommendations: string[];
  festivalEvents: string[];
}

export function evaluateSeasonalSuitability(
  destinations: string[],
  startDate?: string
): SeasonalCheckResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const festivalEvents: string[] = [];

  const targetDate = startDate ? new Date(startDate) : new Date();
  const month = targetDate.getMonth() + 1; // 1 - 12

  destinations.forEach(dest => {
    const dLower = dest.toLowerCase();

    // 1. Kedarnath & Badrinath High Altitude Mountain Checks
    if (dLower.includes('kedarnath') || dLower.includes('badrinath')) {
      if (month >= 11 || month <= 4) {
        warnings.push(` Kedarnath & Badrinath shrines are closed during winter months (Nov–Apr) due to heavy snowfall.`);
        recommendations.push(`Consider Haridwar, Rishikesh, or Mussoorie for winter mountain experiences.`);
      } else if (month === 7 || month === 8) {
        warnings.push(`Monsoon season (July–Aug) poses landslide risks on Himalayan Yatra routes.`);
        recommendations.push(`Maintain buffer travel days and monitor official Chardham Weather advisories.`);
      }
    }

    // 2. Kutch White Desert Checks
    if (dLower.includes('kutch') || dLower.includes('dhordo') || dLower.includes('rann')) {
      if (month >= 11 || month <= 2) {
        festivalEvents.push(` Rann Utsav Peak Season (Nov–Feb) — Ideal weather & full moon night cultural events.`);
      } else if (month >= 6 && month <= 9) {
        warnings.push(`Rann of Kutch salt desert is submerged under water during monsoon months (June–Sept).`);
        recommendations.push(`Visit Mandvi Beach or Bhuj Heritage Palaces instead.`);
      }
    }

    // 3. Gir Safari Checks
    if (dLower.includes('gir') || dLower.includes('sasan')) {
      if (month >= 6 && month <= 9) {
        warnings.push(`Sasan Gir National Park Sanctuary is closed for breeding season (June 16 – Oct 15).`);
        recommendations.push(`Devalia Safari Park remains open weather permitting.`);
      }
    }

    // 4. Goa Beach & Coastal Monsoon
    if (dLower.includes('goa')) {
      if (month >= 6 && month <= 9) {
        warnings.push(`Water sports & beach shacks in Goa are closed during heavy monsoon monsoons (June–Sept).`);
        recommendations.push(`Explore Dudhsagar Waterfalls and Spice Plantations in South Goa.`);
      }
    }
  });

  return {
    isSuitable: warnings.length === 0,
    warnings,
    recommendations,
    festivalEvents,
  };
}

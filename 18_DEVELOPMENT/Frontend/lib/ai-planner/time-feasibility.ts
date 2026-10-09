/**
 * BharatYatra Time Feasibility & Travel Buffer Manager
 * Guarantees realistic daily schedules and prevents unrealistic activity packing.
 */

import { DestinationNode, Activity, TravelSegment } from './types';
import { calculateHaversineDistanceKm } from './destination-intelligence';

export interface DayFeasibilityResult {
  dayType: 'Arrival Day' | 'Full Exploration Day' | 'Travel Day' | 'Mixed Travel + Exploration Day' | 'Rest Day' | 'Departure Day';
  totalActiveMinutes: number;
  isFeasible: boolean;
  warningMessage?: string;
}

/**
 * Validates whether a day's schedule is realistic and fits within human time limits.
 */
export function evaluateDayFeasibility(
  activities: Activity[],
  travelSegments: TravelSegment[],
  dayIndex: number,
  totalDays: number
): DayFeasibilityResult {
  // Determine Day Type based on index
  let dayType: DayFeasibilityResult['dayType'] = 'Full Exploration Day';
  if (dayIndex === 1) dayType = 'Arrival Day';
  else if (dayIndex === totalDays) dayType = 'Departure Day';
  else if (travelSegments.some(t => t.distanceKm > 250)) dayType = 'Travel Day';
  else if (travelSegments.some(t => t.distanceKm > 80)) dayType = 'Mixed Travel + Exploration Day';

  const activityMinutes = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
  const travelMinutes = travelSegments.reduce((sum, t) => sum + t.estimatedDurationMinutes, 0);

  // Buffer additions: 20 min per activity + 30 min per intercity segment
  const activityBuffers = activities.length * 20;
  const travelBuffers = travelSegments.length * 30;
  const totalActiveMinutes = activityMinutes + travelMinutes + activityBuffers + travelBuffers;

  // Maximum allowed active hours per day:
  // Arrival / Departure Days: 6-7 hours max (420 min)
  // Exploration Days: 10-11 hours max (660 min)
  const maxMinutes = (dayType === 'Arrival Day' || dayType === 'Departure Day') ? 420 : 660;

  const isFeasible = totalActiveMinutes <= maxMinutes;
  let warningMessage: string | undefined = undefined;

  if (!isFeasible) {
    warningMessage = `Day ${dayIndex} (${dayType}) exceeds realistic time limits (${Math.round(totalActiveMinutes / 60)} hrs vs ${Math.round(maxMinutes / 60)} hrs max limit).`;
  }

  return {
    dayType,
    totalActiveMinutes,
    isFeasible,
    warningMessage,
  };
}

/**
 * Creates estimated travel segment between two places or cities with realistic travel speed
 */
export function createTravelSegment(
  fromName: string,
  fromLat: number,
  fromLng: number,
  toName: string,
  toLat: number,
  toLng: number,
  mode: TravelSegment['mode'] = 'cab'
): TravelSegment {
  const dist = calculateHaversineDistanceKm(fromLat, fromLng, toLat, toLng);
  
  // Speed assumptions (km/h):
  // Flight: 500 km/h (plus 120 min airport buffer)
  // Train: 65 km/h
  // Cab/Car (Hills/Mountains vs Plains): 45 km/h average in India
  let speedKmH = 45;
  let fixedBufferMinutes = 20;

  if (mode === 'flight') {
    speedKmH = 500;
    fixedBufferMinutes = 150;
  } else if (mode === 'train') {
    speedKmH = 65;
    fixedBufferMinutes = 45;
  } else if (fromName.includes('Kedarnath') || toName.includes('Kedarnath') || fromName.includes('Badrinath')) {
    speedKmH = 25; // Mountain winding roads / trekking speed
    fixedBufferMinutes = 60;
  }

  const durationMinutes = Math.round((dist / speedKmH) * 60) + fixedBufferMinutes;
  
  // Estimated cost
  let estimatedCostInr = Math.round(dist * 14); // ₹14/km for cab
  if (mode === 'flight') estimatedCostInr = Math.max(3500, Math.round(dist * 6));
  else if (mode === 'train') estimatedCostInr = Math.max(400, Math.round(dist * 2));

  return {
    from: fromName,
    to: toName,
    mode,
    estimatedDurationMinutes: durationMinutes,
    distanceKm: Math.round(dist),
    estimatedCostInr,
    notes: `${mode.toUpperCase()} transfer (~${Math.round(durationMinutes / 60)}h ${durationMinutes % 60}m)`,
  };
}

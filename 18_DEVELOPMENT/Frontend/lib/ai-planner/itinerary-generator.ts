/**
 * BharatYatra Itinerary Day Generator Engine
 * Builds balanced daily sightseeing, dining, accommodation, and transport activities.
 */

import { DestinationNode, TripDay, Activity, MealRecommendation, AccommodationSuggestion, ParsedIntent } from './types';
import { evaluateDayFeasibility, createTravelSegment } from './time-feasibility';

export function generateDailyItineraries(
  orderedNodes: DestinationNode[],
  intent: ParsedIntent
): TripDay[] {
  const totalDays = intent.durationDays;
  const days: TripDay[] = [];

  // Group nodes into days
  const nodesPerDay = Math.max(1, Math.ceil(orderedNodes.length / totalDays));

  for (let dayIndex = 1; dayIndex <= totalDays; dayIndex++) {
    const isFirstDay = dayIndex === 1;
    const isLastDay = dayIndex === totalDays;

    // Slice nodes for this day
    const startIndex = (dayIndex - 1) * nodesPerDay;
    const dayNodes = orderedNodes.slice(startIndex, startIndex + nodesPerDay);
    const primaryNode = dayNodes[0] || orderedNodes[0] || {
      name: 'City Sightseeing',
      displayName: 'City Tour',
      city: intent.originCity,
      state: 'Gujarat',
      latitude: 23.0225,
      longitude: 72.5714,
    };

    const locationName = primaryNode.city || primaryNode.name;
    const stateName = primaryNode.state || 'India';

    // Morning Activities
    const morning: Activity[] = [];
    if (isFirstDay) {
      morning.push({
        id: `act-${dayIndex}-1`,
        name: `Travel from ${intent.originCity} to ${locationName}`,
        displayName: `Arrival & Transfer to ${locationName}`,
        location: locationName,
        state: stateName,
        durationMinutes: 120,
        category: 'Travel & Arrival',
        estimatedCostInr: 500,
        priority: 'must-do',
        reason: 'Optimal morning arrival to maximize day exploration.',
      });
    } else {
      const actNode = dayNodes[0] || primaryNode;
      morning.push({
        id: `act-${dayIndex}-1`,
        name: actNode.name,
        displayName: actNode.displayName,
        location: actNode.city || locationName,
        state: stateName,
        latitude: actNode.latitude,
        longitude: actNode.longitude,
        startTime: actNode.openingTime || '09:00',
        endTime: '12:00',
        durationMinutes: actNode.averageVisitDurationMinutes || 120,
        category: actNode.categories[0] || 'Sightseeing',
        estimatedCostInr: actNode.estimatedEntryFeeInr || 100,
        priority: 'must-do',
        imageUrl: actNode.imageUrl,
        reason: `Scheduled in morning for prime lighting and minimal crowd congestion.`,
      });
    }

    // Afternoon Activities
    const afternoon: Activity[] = [];
    const secNode = dayNodes[1] || dayNodes[0] || primaryNode;
    afternoon.push({
      id: `act-${dayIndex}-2`,
      name: secNode.name !== morning[0]?.name ? secNode.name : `${locationName} Local Heritage Market`,
      displayName: secNode.displayName !== morning[0]?.displayName ? secNode.displayName : `${locationName} Heritage Walk & Shopping`,
      location: secNode.city || locationName,
      state: stateName,
      durationMinutes: 150,
      category: secNode.categories[0] || 'Culture & Heritage',
      estimatedCostInr: secNode.estimatedEntryFeeInr || 200,
      priority: 'recommended',
      imageUrl: secNode.imageUrl,
      reason: 'Structured after lunch for comfortable indoor or shaded exploration.',
    });

    // Evening Activities
    const evening: Activity[] = [];
    evening.push({
      id: `act-${dayIndex}-3`,
      name: isLastDay ? `Departure Transfer to ${intent.originCity}` : `${locationName} Sunset Promenade & Cultural Aarti`,
      displayName: isLastDay ? `Return Journey Departure` : `${locationName} Evening Promenade & Aarti`,
      location: locationName,
      state: stateName,
      durationMinutes: 90,
      category: isLastDay ? 'Departure' : 'Culture & Sunset',
      estimatedCostInr: 100,
      priority: 'must-do',
      reason: isLastDay ? 'Scheduled with 2-hour buffer before connection departure.' : 'Prime evening sunset experience.',
    });

    // Meal Recommendations
    const meals: MealRecommendation[] = [
      { mealType: 'Breakfast', recommendedCuisine: 'Traditional Breakfast & Chai', estimatedCostInr: 250 },
      { mealType: 'Lunch', recommendedCuisine: `Authentic ${stateName} Thali`, estimatedCostInr: 450 },
      { mealType: 'Dinner', recommendedCuisine: 'Regional Specialty Fine Dining', estimatedCostInr: 600 },
    ];

    // Travel Segments
    const travelSegments = [];
    if (isFirstDay) {
      travelSegments.push(createTravelSegment(intent.originCity, 23.0225, 72.5714, locationName, primaryNode.latitude || 23.0, primaryNode.longitude || 72.5, 'cab'));
    }

    // Accommodation Suggestion
    const accommodation: AccommodationSuggestion | undefined = isLastDay ? undefined : {
      hotelName: `${locationName} Heritage Resort & Spa`,
      city: locationName,
      category: intent.travelStyle === 'luxury' ? '5-Star Resort' : intent.travelStyle === 'premium' ? '4-Star Boutique Hotel' : '3-Star Premium Hotel',
      starRating: intent.travelStyle === 'luxury' ? 5 : 4,
      nights: 1,
      estimatedCostPerNightInr: intent.travelStyle === 'luxury' ? 8500 : intent.travelStyle === 'premium' ? 4200 : 2200,
      totalCostInr: intent.travelStyle === 'luxury' ? 8500 : intent.travelStyle === 'premium' ? 4200 : 2200,
      reason: `Centrally situated in ${locationName} to minimize daily commute times.`,
    };

    const feasibility = evaluateDayFeasibility([...morning, ...afternoon, ...evening], travelSegments, dayIndex, totalDays);

    const dailyCost = morning.reduce((s, a) => s + (a.estimatedCostInr || 0), 0) +
                      afternoon.reduce((s, a) => s + (a.estimatedCostInr || 0), 0) +
                      evening.reduce((s, a) => s + (a.estimatedCostInr || 0), 0) +
                      meals.reduce((s, m) => s + m.estimatedCostInr, 0) +
                      (accommodation?.totalCostInr || 0);

    days.push({
      day: dayIndex,
      date: `Day ${dayIndex}`,
      location: locationName,
      state: stateName,
      dayType: feasibility.dayType,
      morning,
      afternoon,
      evening,
      meals,
      travelSegments,
      accommodation,
      estimatedDailyCostInr: dailyCost,
      daySummary: `Explore ${locationName} highlights with optimized travel buffers and curated cultural experiences.`,
      decisionExplanation: `${locationName} is scheduled on Day ${dayIndex} to eliminate backtracking and optimize route direction from ${intent.originCity}.`,
    });
  }

  return days;
}

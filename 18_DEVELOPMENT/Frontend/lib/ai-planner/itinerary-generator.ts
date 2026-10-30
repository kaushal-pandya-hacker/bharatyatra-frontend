/**
 * BharatYatra AI 2.0 — Itinerary Day Generator Engine
 * Builds geographically optimized, altitude-safe daily sightseeing, dining,
 * accommodation, and transport activities across all regions of India.
 */

import { DestinationNode, TripDay, Activity, MealRecommendation, AccommodationSuggestion, ParsedIntent } from './types';
import { evaluateDayFeasibility, createTravelSegment } from './time-feasibility';
import { resolveOriginCoordinates } from './india-geo-registry';
import { calculateHaversineDistanceKm } from './destination-intelligence';

export function generateDailyItineraries(
  orderedNodes: DestinationNode[],
  intent: ParsedIntent
): TripDay[] {
  const totalDays = intent.durationDays;
  const days: TripDay[] = [];
  const origin = resolveOriginCoordinates(intent.originCity);
  const travelersCount = Math.max(1, intent.travelersCount);
  const roomsCount = Math.max(1, Math.ceil(travelersCount / 2));

  // Check if target destination is high altitude (e.g. Ladakh / Leh, Kedarnath)
  const isHighAltitudeDest = orderedNodes.some(n => 
    n.state.toLowerCase().includes('ladakh') || 
    n.name.toLowerCase().includes('leh') || 
    n.name.toLowerCase().includes('kedarnath') ||
    n.name.toLowerCase().includes('badrinath')
  );

  // Group nodes into days
  const effectiveSightseeingDays = isHighAltitudeDest ? Math.max(1, totalDays - 2) : totalDays;
  const nodesPerDay = Math.max(1, Math.ceil(orderedNodes.length / effectiveSightseeingDays));

  for (let dayIndex = 1; dayIndex <= totalDays; dayIndex++) {
    const isFirstDay = dayIndex === 1;
    const isLastDay = dayIndex === totalDays;
    const isAcclimatizationDay = isHighAltitudeDest && (dayIndex === 1 || dayIndex === 2);

    // Node resolution
    const nodeIndex = isHighAltitudeDest ? Math.max(0, dayIndex - 2) * nodesPerDay : (dayIndex - 1) * nodesPerDay;
    const dayNodes = orderedNodes.slice(nodeIndex, nodeIndex + nodesPerDay);
    const primaryNode = dayNodes[0] || orderedNodes[0] || {
      name: 'City Exploration',
      displayName: 'City Tour',
      city: intent.originCity,
      state: 'India',
      latitude: origin.lat,
      longitude: origin.lng,
      categories: ['Sightseeing'],
      openingTime: '09:00',
      averageVisitDurationMinutes: 120,
      estimatedEntryFeeInr: 100,
    };

    const locationName = primaryNode.city || primaryNode.name;
    const stateName = primaryNode.state || 'India';

    // Calculate distance from origin to primary destination
    const distToDestKm = calculateHaversineDistanceKm(origin.lat, origin.lng, primaryNode.latitude, primaryNode.longitude);
    
    // Choose realistic transport mode based on distance and region
    let primaryTransportMode: 'flight' | 'train' | 'cab' = 'train';
    if (distToDestKm > 750 || isHighAltitudeDest || stateName.includes('Andaman')) {
      primaryTransportMode = 'flight';
    } else if (distToDestKm <= 350) {
      primaryTransportMode = 'cab';
    }

    // Morning Activities
    const morning: Activity[] = [];
    if (isFirstDay) {
      morning.push({
        id: `act-${dayIndex}-1`,
        name: `Departure from ${intent.originCity} to ${locationName}`,
        displayName: `${primaryTransportMode.toUpperCase()} Transfer: ${intent.originCity} → ${locationName}`,
        location: locationName,
        state: stateName,
        durationMinutes: primaryTransportMode === 'flight' ? 180 : 300,
        category: 'Intercity Travel',
        estimatedCostInr: 100,
        priority: 'must-do',
        reason: `Scheduled early departure to maximize destination time and ensure smooth hotel check-in.`,
      });
    } else if (isAcclimatizationDay) {
      morning.push({
        id: `act-${dayIndex}-1`,
        name: `${locationName} Gentle Acclimatization Rest`,
        displayName: `Mandatory Altitude Acclimatization & Hydration`,
        location: locationName,
        state: stateName,
        durationMinutes: 180,
        category: 'Health & Acclimatization',
        estimatedCostInr: 0,
        priority: 'must-do',
        reason: `Medical safety protocol: Rest 24-48 hours at 3,500m to prevent Acute Mountain Sickness before high passes.`,
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
        reason: `Scheduled in the morning for prime natural lighting, optimal temperature, and minimal crowd congestion.`,
      });
    }

    // Afternoon Activities
    const afternoon: Activity[] = [];
    if (isAcclimatizationDay) {
      afternoon.push({
        id: `act-${dayIndex}-2`,
        name: `${locationName} Local Market Walk & Hydration`,
        displayName: `Light Walking Tour & Local Handicrafts`,
        location: locationName,
        state: stateName,
        durationMinutes: 120,
        category: 'Culture & Leisure',
        estimatedCostInr: 0,
        priority: 'recommended',
        reason: 'Gentle walk on flat terrain; avoid strenuous physical exertion during altitude adaptation.',
      });
    } else {
      const secNode = dayNodes[1] || dayNodes[0] || primaryNode;
      afternoon.push({
        id: `act-${dayIndex}-2`,
        name: secNode.name !== morning[0]?.name ? secNode.name : `${locationName} Cultural Center & Heritage Walk`,
        displayName: secNode.displayName !== morning[0]?.displayName ? secNode.displayName : `${locationName} Heritage Walk`,
        location: secNode.city || locationName,
        state: stateName,
        durationMinutes: 120,
        category: secNode.categories[0] || 'Culture & Heritage',
        estimatedCostInr: secNode.estimatedEntryFeeInr || 150,
        priority: 'recommended',
        imageUrl: secNode.imageUrl,
        reason: 'Curated after lunch for comfortable shaded or indoor exploration.',
      });
    }

    // Evening Activities
    const evening: Activity[] = [];
    if (isLastDay) {
      evening.push({
        id: `act-${dayIndex}-3`,
        name: `Return Transfer from ${locationName} to ${intent.originCity}`,
        displayName: `Return Journey to ${intent.originCity} (${primaryTransportMode.toUpperCase()})`,
        location: locationName,
        state: stateName,
        durationMinutes: 180,
        category: 'Return Travel',
        estimatedCostInr: 0,
        priority: 'must-do',
        reason: 'Scheduled with buffer time prior to scheduled departure.',
      });
    } else {
      evening.push({
        id: `act-${dayIndex}-3`,
        name: `${locationName} Sunset Vista & Evening Promenade`,
        displayName: `${locationName} Sunset Viewpoint & Cultural Stroll`,
        location: locationName,
        state: stateName,
        durationMinutes: 90,
        category: 'Leisure & Sunset',
        estimatedCostInr: 0,
        priority: 'recommended',
        reason: 'Prime evening golden-hour experience and authentic local dining atmosphere.',
      });
    }

    // Meal Recommendations (Regional authentic cuisine)
    const meals: MealRecommendation[] = [
      { mealType: 'Breakfast', recommendedCuisine: `Fresh Local Breakfast & Regional Chai`, estimatedCostInr: 200 },
      { mealType: 'Lunch', recommendedCuisine: `Authentic ${stateName} Regional Lunch Thali`, estimatedCostInr: 350 },
      { mealType: 'Dinner', recommendedCuisine: `Curated ${stateName} Specialty Dinner`, estimatedCostInr: 450 },
    ];

    // Travel Segments
    const travelSegments = [];
    if (isFirstDay) {
      travelSegments.push(
        createTravelSegment(
          intent.originCity,
          origin.lat,
          origin.lng,
          locationName,
          primaryNode.latitude || origin.lat,
          primaryNode.longitude || origin.lng,
          primaryTransportMode
        )
      );
    } else if (isLastDay) {
      // Return segment
      travelSegments.push(
        createTravelSegment(
          locationName,
          primaryNode.latitude || origin.lat,
          primaryNode.longitude || origin.lng,
          intent.originCity,
          origin.lat,
          origin.lng,
          primaryTransportMode
        )
      );
    }

    // Accommodation (Room-Based Math)
    const costPerRoomNight = intent.travelStyle === 'luxury' ? 12000 : intent.travelStyle === 'premium' ? 5200 : intent.travelStyle === 'balanced' ? 2600 : 1200;
    const totalRoomCost = costPerRoomNight * roomsCount;

    const accommodation: AccommodationSuggestion | undefined = isLastDay ? undefined : {
      hotelName: `${locationName} ${intent.travelStyle === 'luxury' ? 'Grand Palace & Spa' : intent.travelStyle === 'premium' ? 'Boutique Heritage Resort' : 'Comfort Inn & Suites'}`,
      city: locationName,
      category: intent.travelStyle === 'luxury' ? '5-Star Luxury Resort' : intent.travelStyle === 'premium' ? '4-Star Boutique Hotel' : '3-Star Quality Hotel',
      starRating: intent.travelStyle === 'luxury' ? 5 : intent.travelStyle === 'premium' ? 4 : 3,
      nights: 1,
      estimatedCostPerNightInr: costPerRoomNight,
      totalCostInr: totalRoomCost,
      reason: `Centrally situated in ${locationName} to minimize daily commute times (${roomsCount} room${roomsCount > 1 ? 's' : ''} for ${travelersCount} guests).`,
    };

    const feasibility = evaluateDayFeasibility([...morning, ...afternoon, ...evening], travelSegments, dayIndex, totalDays);

    const dailyCost = morning.reduce((s, a) => s + (a.estimatedCostInr || 0), 0) +
                      afternoon.reduce((s, a) => s + (a.estimatedCostInr || 0), 0) +
                      evening.reduce((s, a) => s + (a.estimatedCostInr || 0), 0) +
                      meals.reduce((s, m) => s + m.estimatedCostInr, 0) +
                      (accommodation?.totalCostInr || 0);

    const dayTypeLabel = isAcclimatizationDay ? 'Rest Day' : feasibility.dayType;

    days.push({
      day: dayIndex,
      date: `Day ${dayIndex}`,
      location: locationName,
      state: stateName,
      dayType: dayTypeLabel,
      morning,
      afternoon,
      evening,
      meals,
      travelSegments,
      accommodation,
      estimatedDailyCostInr: dailyCost,
      daySummary: isAcclimatizationDay
        ? `Day ${dayIndex} dedicated to altitude adaptation in ${locationName} with light evening walk.`
        : `Explore ${locationName} highlights with optimized travel buffers and curated cultural experiences.`,
      decisionExplanation: `${locationName} is scheduled on Day ${dayIndex} with route optimization from ${intent.originCity}.`,
    });
  }

  return days;
}

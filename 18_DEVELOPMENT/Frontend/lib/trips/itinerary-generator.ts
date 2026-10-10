import { GUJARAT_100_LANDMARKS, LandmarkItem } from '@/lib/data/destinations';
import { TripContext } from '@/lib/profile/travel-profile';

export interface PlanningParams {
  selectedPlaceIds?: number[];
  selectedRegions?: string[];
  durationDays?: number;
  crewType?: string;
  paxCount?: number;
  selectedTier?: 'budget' | 'balanced' | 'luxury';
  startDate?: string;
  originCity?: string;
  destinationCity?: string;
  customPlaces?: LandmarkItem[];
  tripContext?: TripContext;
}

export interface ItineraryActivity {
  time: string;
  placeName: string;
  district: string;
  category: string;
  description: string;
}

export interface DayItinerary {
  day: number;
  dayTitle: string;
  district: string;
  badge: string;
  detail: string;
  activities: ItineraryActivity[];
}

export interface PlanningResult {
  circuitTitle: string;
  totalDays: number;
  totalNights: number;
  recommendedDays: number;
  zonesSynced: number;
  districtList: string[];
  selectedPlaces: LandmarkItem[];
  routeSequence: string[];
  itineraryDays: DayItinerary[];
  totalPackageCost: number;
  pricePerPaxPerDay: number;
  estimatedTravelTime: string;
  originCity: string;
  destinationCity: string;
}

/**
 * Pure, deterministic AI & Heuristic Itinerary Planning Engine
 * Accepts canonical TripContext to personalize circuit title, days, nights,
 * travel route sequence, and day-by-day activities.
 */
export function generateItineraryBlueprint(params: PlanningParams): PlanningResult {
  const {
    selectedPlaceIds = [],
    durationDays = 5,
    customPlaces,
    tripContext,
  } = params;

  // Resolve Context Overrides
  const originCity = tripContext?.trip?.origin?.city || params.originCity || 'Ahmedabad';
  const travelers = tripContext?.trip?.travelers || params.paxCount || 2;
  const budgetTier = tripContext?.preferences?.budget
    ? tripContext.preferences.budget === 'premium' || tripContext.preferences.budget === 'luxury'
      ? 'luxury'
      : tripContext.preferences.budget === 'budget'
      ? 'budget'
      : 'balanced'
    : params.selectedTier || 'balanced';

  const transportList = tripContext?.preferences?.transport || ['train', 'bus'];
  const interests = tripContext?.preferences?.interests || [];
  const pace = tripContext?.preferences?.pace || 'balanced';

  // 1. Resolve selected LandmarkItems from customPlaces or single source of truth ID list
  let selectedPlaces: LandmarkItem[] = [];
  if (customPlaces && customPlaces.length > 0) {
    selectedPlaces = [...customPlaces];
  } else if (selectedPlaceIds.length > 0) {
    selectedPlaces = GUJARAT_100_LANDMARKS.filter((item) =>
      selectedPlaceIds.includes(item.id)
    );
  }

  // 2. Rank selected places by user interests if present
  if (interests.length > 0 && selectedPlaces.length > 1) {
    const interestLower = interests.map((i) => i.toLowerCase());
    selectedPlaces.sort((a, b) => {
      const aMatch = interestLower.some(
        (i) => a.category.toLowerCase().includes(i) || a.description.toLowerCase().includes(i)
      );
      const bMatch = interestLower.some(
        (i) => b.category.toLowerCase().includes(i) || b.description.toLowerCase().includes(i)
      );
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }

  // Pricing calculation rate
  const pricePerPaxPerDay =
    budgetTier === 'luxury' ? 13500 : budgetTier === 'balanced' ? 6000 : 2500;

  // 3. If NO places selected, return zero state cleanly
  if (selectedPlaces.length === 0) {
    return {
      circuitTitle: `Journey from ${originCity}`,
      totalDays: durationDays || 5,
      totalNights: Math.max(0, (durationDays || 5) - 1),
      recommendedDays: 1,
      zonesSynced: 0,
      districtList: [],
      selectedPlaces: [],
      routeSequence: [originCity],
      itineraryDays: [],
      totalPackageCost: 0,
      pricePerPaxPerDay,
      estimatedTravelTime: '0 hrs',
      originCity,
      destinationCity: params.destinationCity || 'Destination',
    };
  }

  // 4. Extract unique districts
  const uniqueDistricts = Array.from(
    new Set(selectedPlaces.map((item) => item.district))
  );

  const destinationCity = params.destinationCity || selectedPlaces[selectedPlaces.length - 1]?.name || selectedPlaces[selectedPlaces.length - 1]?.district || uniqueDistricts[0] || 'Destination';

  const zonesSynced = uniqueDistricts.length;

  // 5. Calculate Circuit Title from origin + selected places
  let circuitTitle = '';
  if (selectedPlaces.length > 0 && selectedPlaces.length <= 4) {
    const placeNames = selectedPlaces.map((p) => p.name).join(' & ');
    circuitTitle = `${originCity} → ${placeNames} Circuit`;
  } else if (uniqueDistricts.length === 1) {
    circuitTitle = `${originCity} → ${uniqueDistricts[0]} Tour`;
  } else if (uniqueDistricts.length <= 3) {
    circuitTitle = `${originCity} → ${uniqueDistricts.join(' → ')} Circuit`;
  } else {
    circuitTitle = `${originCity} → Multi-Region Tour (${uniqueDistricts.length} Regions)`;
  }

  // 6. Days & Nights calculation adjusted by pace
  const placesPerDayNormal = pace === 'slow' ? 1 : pace === 'packed' ? 3 : 2;
  const calculatedBaseDays = Math.max(1, Math.ceil(selectedPlaces.length / placesPerDayNormal));
  const totalDays = Math.max(1, durationDays || calculatedBaseDays);
  const totalNights = Math.max(0, totalDays - 1);
  const recommendedDays = calculatedBaseDays;

  // 7. Route Sequence starting from originCity
  const routeSequence = [originCity, ...uniqueDistricts];
  const estimatedHours = (uniqueDistricts.length) * 2.5 + selectedPlaces.length * 1.5;
  const estimatedTravelTime = `${Math.round(estimatedHours)} hrs total transit from ${originCity}`;

  // 8. Total Package Cost
  const totalPackageCost = pricePerPaxPerDay * travelers * totalDays;

  // 9. Generate Day-by-Day Itinerary Schedule strictly starting from originCity
  const itineraryDays: DayItinerary[] = [];

  const transportText = transportList.length > 0 ? transportList.join(' / ').toUpperCase() : 'AC TRANSIT';
  const tierAccom =
    budgetTier === 'luxury'
      ? `5-Star Luxury Stay • Private Chauffeur Vehicle (${transportText})`
      : budgetTier === 'balanced'
      ? `3-Star Heritage Hotel • ${transportText}`
      : `Standard Guesthouse • ${transportText}`;

  const placesPerDay = Math.max(
    1,
    Math.ceil(selectedPlaces.length / Math.min(totalDays, selectedPlaces.length))
  );

  for (let day = 1; day <= totalDays; day++) {
    const dayIndex = day - 1;
    const dayPlaces = selectedPlaces.slice(
      dayIndex * placesPerDay,
      (dayIndex + 1) * placesPerDay
    );

    if (dayPlaces.length === 0 && dayIndex >= selectedPlaces.length) {
      itineraryDays.push({
        day,
        dayTitle: `Leisure & Local Exploration`,
        district: uniqueDistricts[uniqueDistricts.length - 1] || 'Gujarat',
        badge: `DAY ${day}`,
        detail: `Free day for shopping, local culinary tasting, and relaxed exploration.`,
        activities: [],
      });
      continue;
    }

    const dayDistrict = dayPlaces.length > 0 ? dayPlaces[0].district : uniqueDistricts[dayIndex % uniqueDistricts.length] || 'Gujarat';
    const isFirst = day === 1;
    const isLast = day === totalDays;

    const activities: ItineraryActivity[] = dayPlaces.map((p, idx) => {
      const times = ['09:00 AM', '11:30 AM', '02:30 PM', '05:00 PM'];
      return {
        time: times[idx % times.length],
        placeName: p.name,
        district: p.district,
        category: p.category,
        description: p.description,
      };
    });

    const dayTitle = dayPlaces.length > 0 ? `${dayDistrict}: ${dayPlaces.map((p) => p.name).join(' & ')}` : `${dayDistrict} Exploration`;

    let detail = '';
    if (isFirst) {
      detail = `Departure from ${originCity} → Arrival in ${dayDistrict} • ${tierAccom} • Visit to ${dayPlaces.map((p) => p.name).join(', ') || 'selected places'}.`;
    } else if (isLast) {
      detail = `Morning tour of ${dayPlaces.map((p) => p.name).join(', ') || 'places'} • Return transfer to ${originCity}.`;
    } else {
      detail = `Full day exploring ${dayPlaces.map((p) => p.name).join(' and ')}.`;
    }

    itineraryDays.push({
      day,
      dayTitle,
      district: dayDistrict,
      badge: isFirst ? `DAY 1 - DEPART FROM ${originCity.toUpperCase()}` : isLast ? 'FINAL DAY' : `DAY ${day}`,
      detail,
      activities,
    });
  }

  return {
    circuitTitle,
    totalDays,
    totalNights,
    recommendedDays,
    zonesSynced,
    districtList: uniqueDistricts,
    selectedPlaces,
    routeSequence,
    itineraryDays,
    totalPackageCost,
    pricePerPaxPerDay,
    estimatedTravelTime,
    originCity,
    destinationCity,
  };
}

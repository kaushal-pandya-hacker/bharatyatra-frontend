import { GUJARAT_100_LANDMARKS, LandmarkItem } from '@/lib/data/destinations';

export interface PlanningParams {
  selectedPlaceIds: number[];
  selectedRegions: string[];
  durationDays: number;
  crewType: string;
  paxCount: number;
  selectedTier: 'budget' | 'balanced' | 'luxury';
  startDate: string;
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
}

/**
 * Pure, deterministic AI & Heuristic Itinerary Planning Engine
 * Derives circuit title, days, nights, zone count, route sequence, and day-by-day itinerary
 * directly from the selected places & regions (Single Source of Truth).
 */
export function generateItineraryBlueprint(params: PlanningParams): PlanningResult {
  const {
    selectedPlaceIds = [],
    selectedRegions = [],
    durationDays = 5,
    paxCount = 4,
    selectedTier = 'luxury',
  } = params;

  // 1. Resolve selected LandmarkItems from single source of truth ID list
  const selectedPlaces: LandmarkItem[] = GUJARAT_100_LANDMARKS.filter((item) =>
    selectedPlaceIds.includes(item.id)
  );

  // 2. Extract unique districts
  const uniqueDistricts = Array.from(
    new Set(selectedPlaces.map((item) => item.district))
  );

  // 3. Compute Zone Count (zonesSynced)
  const zonesSynced = Math.max(1, uniqueDistricts.length || selectedRegions.length || 1);

  // 4. Calculate Circuit Title
  let circuitTitle = '';
  if (selectedPlaces.length === 0) {
    if (selectedRegions.length === 1) {
      circuitTitle = `${capitalize(selectedRegions[0])} Regional Expedition`;
    } else if (selectedRegions.length > 1) {
      circuitTitle = `${selectedRegions.map(capitalize).slice(0, 3).join(' & ')} Circuit`;
    } else {
      circuitTitle = 'Gujarat Exploration Vector';
    }
  } else if (uniqueDistricts.length === 1) {
    circuitTitle = `${uniqueDistricts[0]} Heritage Circuit`;
  } else if (uniqueDistricts.length <= 3) {
    circuitTitle = `${uniqueDistricts.join(' → ')} Circuit`;
  } else {
    circuitTitle = `Grand Gujarat Multi-Zone Vector (${uniqueDistricts.length} Regions)`;
  }

  // 5. Intelligent Day & Night Calculation
  // Calculate recommended minimum days based on place count & geographic spread
  let calculatedBaseDays = 1;
  if (selectedPlaces.length > 0) {
    const placesPerDayNormal = 2.5;
    const daysForPlaces = Math.ceil(selectedPlaces.length / placesPerDayNormal);
    const daysForDistricts = uniqueDistricts.length * 1.5;
    calculatedBaseDays = Math.max(1, Math.min(10, Math.ceil(Math.max(daysForPlaces, daysForDistricts))));
  } else {
    calculatedBaseDays = Math.max(1, Math.min(10, durationDays));
  }

  // Final Days / Nights calculation (user selected duration takes precedence or uses calculated)
  const totalDays = Math.max(1, durationDays || calculatedBaseDays);
  const totalNights = Math.max(0, totalDays - 1);
  const recommendedDays = calculatedBaseDays;

  // 6. Route Sequence & Travel Time estimation
  const districtList = uniqueDistricts.length > 0 ? uniqueDistricts : ['Ahmedabad'];
  const routeSequence = [...districtList];
  const estimatedHours = (districtList.length - 1) * 2.5 + selectedPlaces.length * 1.5;
  const estimatedTravelTime = `${Math.round(estimatedHours)} hrs total transit & exploration`;

  // 7. Pricing calculation
  const pricePerPaxPerDay =
    selectedTier === 'luxury' ? 13500 : selectedTier === 'balanced' ? 6000 : 2500;
  const totalPackageCost = pricePerPaxPerDay * (paxCount || 4) * totalDays;

  // 8. Generate Day-by-Day Itinerary Schedule
  const itineraryDays: DayItinerary[] = [];

  // Tier details template
  const tierAccom =
    selectedTier === 'luxury'
      ? 'Royal Palace Suite / 5-Star Resort check-in • Private Innova Crysta chauffeur'
      : selectedTier === 'balanced'
      ? '3-Star Heritage Haveli check-in • Dedicated AC Sedan transfer'
      : 'Verified Haveli Guesthouse check-in • GSRTC Volvo / Express transit';

  if (selectedPlaces.length === 0) {
    // Default fallback schedule based on selectedRegions or generic Gujarat circuit
    for (let day = 1; day <= totalDays; day++) {
      const isFirst = day === 1;
      const isLast = day === totalDays;

      itineraryDays.push({
        day,
        dayTitle: isFirst
          ? `Arrival & Regional Transit`
          : isLast
          ? `Final Highlights & Departure`
          : `Cultural Circuit Day ${day}`,
        district: selectedRegions[0] ? capitalize(selectedRegions[0]) : 'Gujarat',
        badge: isFirst ? '18:00 CHECK-IN' : isLast ? 'DEPARTURE VECTOR' : 'EXPLORATION',
        detail: isFirst
          ? `Arrival at regional hub • ${tierAccom} • Evening welcome tea & heritage stroll.`
          : isLast
          ? `Morning souvenir market visit • Commemorative release • Airport/Station departure transfer.`
          : `Guided regional tour • Local Kathiyawadi dining • Scenic photography & sunset view.`,
        activities: [],
      });
    }
  } else {
    // Distribute actual selected places evenly across totalDays
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

      const dayDistrict =
        dayPlaces.length > 0 ? dayPlaces[0].district : uniqueDistricts[dayIndex % uniqueDistricts.length] || 'Gujarat';

      const isFirst = day === 1;
      const isLast = day === totalDays;

      const activities: ItineraryActivity[] = dayPlaces.map((p, idx) => {
        const times = ['09:00 AM', '11:30 AM', '14:30 PM', '17:00 PM'];
        return {
          time: times[idx % times.length],
          placeName: p.name,
          district: p.district,
          category: p.category,
          description: p.description,
        };
      });

      let dayTitle = '';
      if (dayPlaces.length > 0) {
        dayTitle = `${dayDistrict}: ${dayPlaces.map((p) => p.name).join(' & ')}`;
      } else {
        dayTitle = `${dayDistrict} Regional Promenade & Leisure`;
      }

      let detail = '';
      if (isFirst) {
        detail = `Arrival in ${dayDistrict} • ${tierAccom} • Guided visit to ${
          dayPlaces.map((p) => p.name).join(', ') || 'local heritage sites'
        }.`;
      } else if (isLast) {
        detail = `Morning tour of ${
          dayPlaces.map((p) => p.name).join(', ') || 'regional markets'
        } • Local authentic lunch • Commemorative souvenir & return transfer.`;
      } else {
        detail = `Full-day excursion exploring ${
          dayPlaces.map((p) => p.name).join(' and ') || 'cultural landmarks'
        } • Artisan masterclass & local culinary dining.`;
      }

      itineraryDays.push({
        day,
        dayTitle,
        district: dayDistrict,
        badge: isFirst
          ? '09:00 AM START'
          : isLast
          ? 'COMPLETION VECTOR'
          : `DAY ${day} VECTOR`,
        detail,
        activities,
      });
    }
  }

  return {
    circuitTitle,
    totalDays,
    totalNights,
    recommendedDays,
    zonesSynced,
    districtList,
    selectedPlaces,
    routeSequence,
    itineraryDays,
    totalPackageCost,
    pricePerPaxPerDay,
    estimatedTravelTime,
  };
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

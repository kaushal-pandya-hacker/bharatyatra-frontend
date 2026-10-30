/**
 * BharatYatra AI 2.0 — Universal Trip Preferences Profile
 * Centralized, Versioned, Type-Safe Single Source of Truth for Travel Planning.
 */

import { TripPlanningRequest, TravelerSpec, LocationSpec } from './types';

export type TripType =
  | 'solo'
  | 'couple'
  | 'family'
  | 'friends'
  | 'corporate'
  | 'pilgrimage'
  | 'adventure';

export type DurationSelectionMode = 'quick' | 'recommended' | 'extended' | 'custom';

export type PricingCategory = 'budget' | 'standard' | 'balanced' | 'premium' | 'luxury';

export type PreferredTransportMode =
  | 'flight'
  | 'train'
  | 'bus'
  | 'cab'
  | 'self-drive'
  | 'mixed';

export type LocalTransportMode =
  | 'private-cab'
  | 'shared-cab'
  | 'auto-rickshaw'
  | 'metro-public'
  | 'rental-bike-car'
  | 'walking';

export type AccommodationCategory =
  | 'hostel'
  | 'homestay'
  | 'standard-hotel'
  | 'resort'
  | 'heritage-palace'
  | 'luxury-villa';

export type PropertyType =
  | 'hotel'
  | 'resort'
  | 'guesthouse'
  | 'homestay'
  | 'dharamshala'
  | 'campsite';

export type PreferredLocation =
  | 'city-center'
  | 'near-attractions'
  | 'quiet-suburbs'
  | 'near-transit-hub';

export type FoodPreference =
  | 'pure-veg'
  | 'jain'
  | 'swaminarayan'
  | 'non-veg'
  | 'vegan'
  | 'halal'
  | 'all';

export type TravelPace =
  | 'relaxed'
  | 'balanced'
  | 'fast-paced'
  | 'adventure-focused'
  | 'sightseeing-focused';

export type MobilityRequirement =
  | 'standard'
  | 'wheelchair-friendly'
  | 'minimal-walking'
  | 'elderly-assisted';

export type WalkingPreference = 'low' | 'moderate' | 'high';

export type RestRequirement = 'regular-breaks' | 'relaxed-afternoons' | 'none';

export type ChangeImpactType = 'CRITICAL' | 'DEPENDENT' | 'INDEPENDENT' | 'USER_LOCKED';

export type PlanningModuleId =
  | 'GeographyEngine'
  | 'RouteOptimizer'
  | 'DestinationIntelligence'
  | 'DurationRecommendationEngine'
  | 'HybridPricingEngine'
  | 'BudgetEngine'
  | 'AccommodationEngine'
  | 'TransportationEngine'
  | 'ActivityEngine'
  | 'ItineraryGenerator'
  | 'SeasonalIntelligence'
  | 'TravelFeasibilityEngine'
  | 'FoodRecommendationEngine'
  | 'BookingRequirementsEngine'
  | 'QualityScorer';

/**
 * Detailed Universal Trip Preference Profile
 */
export interface TripPreferenceProfile {
  // Metadata & Concurrency
  id: string;
  version: number;
  lastUpdated: string;
  lockedKeys: string[]; // Dot-notated paths, e.g. ['budget.totalBudget', 'transport.preferredTransport']

  // 1. Identity & Trip
  identity: {
    origin: string;
    originState?: string;
    destination: string;
    destinationList: string[];
    tripType: TripType;
    startDate?: string;
    endDate?: string;
    flexibleDates: boolean;
    tripDurationDays: number;
    durationMode: DurationSelectionMode;
    travelersCount: number;
    travelerComposition: {
      adults: number;
      seniors?: number;
      children?: number;
      infants?: number;
    };
  };

  // 2. Budget
  budget: {
    totalBudget: number; // in INR
    perPersonBudget: number;
    dailyBudget: number;
    currency: 'INR';
    pricingCategory: PricingCategory;
    maxSpendingLimit?: number;
    categoryAllocations?: {
      transportPercent?: number;
      stayPercent?: number;
      foodPercent?: number;
      activitiesPercent?: number;
      miscPercent?: number;
    };
  };

  // 3. Transport
  transport: {
    preferredTransport: PreferredTransportMode;
    outboundTransport?: PreferredTransportMode;
    returnTransport?: PreferredTransportMode;
    localTransport: LocalTransportMode;
    mixedTransportAllowed: boolean;
    comfortRequirements: string[]; // e.g. ['ac-only', 'sleeper', 'wheelchair-accessible']
  };

  // 4. Accommodation
  accommodation: {
    category: AccommodationCategory;
    propertyType: PropertyType;
    roomPreferences: string[];
    numberOfRooms: number;
    preferredLocation: PreferredLocation;
  };

  // 5. Interests
  interests: {
    adventure: boolean;
    nature: boolean;
    heritage: boolean;
    culture: boolean;
    food: boolean;
    photography: boolean;
    wildlife: boolean;
    beaches: boolean;
    mountains: boolean;
    religious: boolean;
    shopping: boolean;
    relaxation: boolean;
    customTags: string[];
  };

  // 6. Food & Dining
  food: {
    preference: FoodPreference;
    dietaryRequirements: string[];
    mealBudgetPerDay: number;
    cuisinePreferences: string[];
  };

  // 7. Travel Pace
  pace: {
    style: TravelPace;
    maxAttractionsPerDay: number;
    dailyStartHour: number; // e.g. 9 for 09:00 AM
    dailyEndHour: number; // e.g. 20 for 08:00 PM
  };

  // 8. Accessibility & Health
  accessibility: {
    mobility: MobilityRequirement;
    walkingPreference: WalkingPreference;
    restRequirement: RestRequirement;
    specialNeeds: string[];
    altitudeSensitive: boolean; // Ladakh, Spiti, Kedarnath
  };

  // 9. Customization & Overrides
  customization: {
    includedDestinations: string[];
    excludedDestinations: string[];
    preferredAttractions: string[];
    excludedAttractions: string[];
    customInstructions?: string;
    userOverrides: Record<string, any>;
  };
}

/**
 * Change explanation documenting what AI updated, preserved, and shortfalls
 */
export interface ChangeExplanation {
  summary: string;
  triggeredBy: string[]; // e.g. ['budget.totalBudget']
  impactLevel: ChangeImpactType;
  affectedModules: PlanningModuleId[];
  changedFields: Array<{
    path: string;
    previousValue: any;
    newValue: any;
    reason: string;
  }>;
  preservedFields: string[];
  priceDelta: {
    previousTotalInr: number;
    newTotalInr: number;
    differenceInr: number;
    reason: string;
  };
  durationDelta?: {
    previousDays: number;
    newDays: number;
  };
  itineraryDelta?: {
    addedActivities: string[];
    removedActivities: string[];
    note?: string;
  };
  budgetShortfallInr?: number;
  tradeoffSuggestions: string[];
  conflictsDetected: Array<{
    lockedKey: string;
    requestedChange: string;
    explanation: string;
    remedyOptions: string[];
  }>;
}

/**
 * Historical snapshot for Undo / Restore
 */
export interface PreferenceVersionSnapshot {
  version: number;
  timestamp: string;
  profile: TripPreferenceProfile;
  explanation?: ChangeExplanation;
  planSnapshot?: import('./types').TripPlanningResponse;
}

/**
 * Factory for creating default balanced profile
 */
export function createDefaultPreferenceProfile(params?: Partial<TripPreferenceProfile['identity']>): TripPreferenceProfile {
  const origin = params?.origin || 'Ahmedabad';
  const destination = params?.destination || 'Goa';
  const duration = params?.tripDurationDays || 5;
  const travelers = params?.travelersCount || 2;
  const numberOfRooms = Math.max(1, Math.ceil(travelers / 2));
  const defaultTotalBudget = 35000 * travelers;

  return {
    id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    version: 1,
    lastUpdated: new Date().toISOString(),
    lockedKeys: [],

    identity: {
      origin,
      originState: params?.originState,
      destination,
      destinationList: params?.destinationList || [destination],
      tripType: params?.tripType || 'friends',
      startDate: params?.startDate,
      endDate: params?.endDate,
      flexibleDates: params?.flexibleDates ?? true,
      tripDurationDays: duration,
      durationMode: params?.durationMode || 'recommended',
      travelersCount: travelers,
      travelerComposition: params?.travelerComposition || {
        adults: travelers,
        seniors: 0,
        children: 0,
        infants: 0,
      },
    },

    budget: {
      totalBudget: defaultTotalBudget,
      perPersonBudget: Math.round(defaultTotalBudget / travelers),
      dailyBudget: Math.round(defaultTotalBudget / (duration * travelers)),
      currency: 'INR',
      pricingCategory: 'standard',
      maxSpendingLimit: defaultTotalBudget * 1.25,
      categoryAllocations: {
        transportPercent: 35,
        stayPercent: 35,
        foodPercent: 15,
        activitiesPercent: 10,
        miscPercent: 5,
      },
    },

    transport: {
      preferredTransport: 'mixed',
      outboundTransport: 'flight',
      returnTransport: 'flight',
      localTransport: 'private-cab',
      mixedTransportAllowed: true,
      comfortRequirements: ['ac-only'],
    },

    accommodation: {
      category: 'standard-hotel',
      propertyType: 'hotel',
      roomPreferences: ['breakfast-included'],
      numberOfRooms,
      preferredLocation: 'city-center',
    },

    interests: {
      adventure: false,
      nature: true,
      heritage: true,
      culture: true,
      food: true,
      photography: true,
      wildlife: false,
      beaches: destination.toLowerCase().includes('goa') || destination.toLowerCase().includes('kerala'),
      mountains: destination.toLowerCase().includes('ladakh') || destination.toLowerCase().includes('manali'),
      religious: false,
      shopping: false,
      relaxation: true,
      customTags: [],
    },

    food: {
      preference: 'pure-veg',
      dietaryRequirements: [],
      mealBudgetPerDay: 1200 * travelers,
      cuisinePreferences: ['local-traditional', 'north-indian'],
    },

    pace: {
      style: 'balanced',
      maxAttractionsPerDay: 4,
      dailyStartHour: 9,
      dailyEndHour: 20,
    },

    accessibility: {
      mobility: 'standard',
      walkingPreference: 'moderate',
      restRequirement: 'regular-breaks',
      specialNeeds: [],
      altitudeSensitive:
        destination.toLowerCase().includes('ladakh') ||
        destination.toLowerCase().includes('spiti') ||
        destination.toLowerCase().includes('kedarnath'),
    },

    customization: {
      includedDestinations: [destination],
      excludedDestinations: [],
      preferredAttractions: [],
      excludedAttractions: [],
      customInstructions: '',
      userOverrides: {},
    },
  };
}

/**
 * Backward compatibility converter: Converts legacy TripPlanningRequest into TripPreferenceProfile
 */
export function convertRequestToPreferenceProfile(req: TripPlanningRequest): TripPreferenceProfile {
  const origin = req.origin?.city || 'Ahmedabad';
  const destination = req.destinations?.[0]?.city || req.destinations?.[0]?.state || 'Goa';
  const travelers = req.travelers?.adults || 2;
  const duration = req.durationDays || 4;

  const profile = createDefaultPreferenceProfile({
    origin,
    originState: req.origin?.state,
    destination,
    destinationList: req.destinations?.map(d => d.city || d.state || '').filter(Boolean) || [destination],
    tripDurationDays: duration,
    travelersCount: travelers,
    travelerComposition: {
      adults: req.travelers?.adults || 2,
      seniors: req.travelers?.seniors || 0,
      children: req.travelers?.children || 0,
      infants: req.travelers?.infants || 0,
    },
    startDate: req.startDate,
    endDate: req.endDate,
  });

  if (req.budget?.total && req.budget.total > 0) {
    profile.budget.totalBudget = req.budget.total;
    profile.budget.perPersonBudget = Math.round(req.budget.total / travelers);
    profile.budget.dailyBudget = Math.round(req.budget.total / (duration * travelers));
  }

  if (req.travelStyle) {
    profile.budget.pricingCategory = req.travelStyle;
  }

  if (req.pace) {
    profile.pace.style = req.pace === 'fast' ? 'fast-paced' : req.pace;
    profile.pace.maxAttractionsPerDay = req.pace === 'relaxed' ? 3 : req.pace === 'fast' ? 6 : 4;
  }

  if (req.transportPreference && req.transportPreference.length > 0) {
    const pref = req.transportPreference[0].toLowerCase();
    if (['flight', 'train', 'bus', 'cab', 'mixed'].includes(pref)) {
      profile.transport.preferredTransport = pref as any;
    }
  }

  if (req.interests && req.interests.length > 0) {
    req.interests.forEach(i => {
      const lower = i.toLowerCase();
      if (lower.includes('adventure')) profile.interests.adventure = true;
      if (lower.includes('nature')) profile.interests.nature = true;
      if (lower.includes('heritage')) profile.interests.heritage = true;
      if (lower.includes('culture')) profile.interests.culture = true;
      if (lower.includes('food')) profile.interests.food = true;
      if (lower.includes('photo')) profile.interests.photography = true;
      if (lower.includes('wildlife')) profile.interests.wildlife = true;
      if (lower.includes('beach')) profile.interests.beaches = true;
      if (lower.includes('mountain')) profile.interests.mountains = true;
      if (lower.includes('religious') || lower.includes('temple')) profile.interests.religious = true;
      if (lower.includes('relax')) profile.interests.relaxation = true;
    });
  }

  if (req.foodPreference && req.foodPreference.length > 0) {
    const f = req.foodPreference[0].toLowerCase();
    if (f.includes('jain')) profile.food.preference = 'jain';
    else if (f.includes('swaminarayan')) profile.food.preference = 'swaminarayan';
    else if (f.includes('non-veg')) profile.food.preference = 'non-veg';
    else if (f.includes('vegan')) profile.food.preference = 'vegan';
    else if (f.includes('halal')) profile.food.preference = 'halal';
    else profile.food.preference = 'pure-veg';
  }

  if (req.mustVisit) {
    profile.customization.preferredAttractions = req.mustVisit;
  }
  if (req.avoid) {
    profile.customization.excludedAttractions = req.avoid;
  }
  if (req.naturalPrompt) {
    profile.customization.customInstructions = req.naturalPrompt;
  }

  return profile;
}

/**
 * Converts TripPreferenceProfile back into a TripPlanningRequest for AI Planner engines
 */
export function convertPreferenceProfileToRequest(profile: TripPreferenceProfile): TripPlanningRequest {
  const interestsList: string[] = [];
  if (profile.interests.adventure) interestsList.push('adventure');
  if (profile.interests.nature) interestsList.push('nature');
  if (profile.interests.heritage) interestsList.push('heritage');
  if (profile.interests.culture) interestsList.push('culture');
  if (profile.interests.food) interestsList.push('food');
  if (profile.interests.photography) interestsList.push('photography');
  if (profile.interests.wildlife) interestsList.push('wildlife');
  if (profile.interests.beaches) interestsList.push('beaches');
  if (profile.interests.mountains) interestsList.push('mountains');
  if (profile.interests.religious) interestsList.push('religious');
  if (profile.interests.relaxation) interestsList.push('relaxation');

  return {
    origin: {
      city: profile.identity.origin,
      state: profile.identity.originState,
      country: 'India',
    },
    destinations: profile.identity.destinationList.map(d => ({ city: d, state: d })),
    startDate: profile.identity.startDate,
    endDate: profile.identity.endDate,
    durationDays: profile.identity.tripDurationDays,
    travelers: {
      adults: profile.identity.travelerComposition.adults,
      seniors: profile.identity.travelerComposition.seniors,
      children: profile.identity.travelerComposition.children,
      infants: profile.identity.travelerComposition.infants,
    },
    budget: {
      total: profile.budget.totalBudget,
      currency: profile.budget.currency,
      flexibility: 'moderate',
    },
    travelStyle: profile.budget.pricingCategory === 'standard' ? 'balanced' : profile.budget.pricingCategory,
    transportPreference: [profile.transport.preferredTransport],
    accommodationPreference: [profile.accommodation.category],
    foodPreference: [profile.food.preference],
    interests: interestsList,
    pace: profile.pace.style === 'fast-paced' ? 'fast' : (profile.pace.style as any),
    mustVisit: profile.customization.preferredAttractions,
    avoid: profile.customization.excludedAttractions,
    naturalPrompt: profile.customization.customInstructions,
  };
}

import { apiFetch } from '@/lib/api/client';

export interface TravelOrigin {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface TravelProfile {
  id?: string;
  userId?: string;
  fullName: string;
  origin: TravelOrigin;
  travelStyle?: string; // Relaxed, Balanced, Adventure, Family, Spiritual, Luxury, Budget
  budget?: string; // Budget, Moderate, Premium
  pace?: string; // Slow, Balanced, Packed
  transport?: string[]; // Car, Bus, Train, Flight, Mixed
  interests?: string[]; // Nature, Heritage, Beaches, Mountains, Food, Spiritual, Adventure, Culture, Shopping, Wildlife
  typicalTravelers?: number;
  preferredLanguage?: string;
  completed: boolean;

  // BharatYatra Smart Onboarding Fields
  onboardingStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SKIPPED' | 'COMPLETED';
  onboardingStep?: number;
  onboardingCompletedAt?: string;
  groupType?: string; // Solo, Couple, Family, Friends, Group tour, Corporate, Other
  travelerComposition?: {
    adults: number;
    children: number;
    infants: number;
    seniors: number;
  };
  travelModePreference?: 'road_trip' | 'book_transport' | 'mixed' | 'not_sure';
  ownVehicleDetails?: {
    vehicleType?: string;
    isOwned?: boolean;
    vehicleCount?: number;
    longDistanceReady?: boolean;
    drivingPace?: string;
  };
  bookingPreferences?: string[];
  accommodationTypes?: string[];
  roomRequirements?: {
    roomCount?: number;
    arrangement?: string;
    accessibility?: string;
  };
  budgetScope?: 'per_person' | 'total_group';
  budgetRange?: string;
  customBudgetAmount?: number;
  explorationStyle?: 'fewer_deep' | 'balanced' | 'more_destinations';
  accessibilityRequirements?: string[];
}

/**
 * CANONICAL TRAVEL CONTEXT (Single Source of Truth for User Preferences)
 */
export interface TravelContext {
  user: {
    id?: string;
    name: string;
  };
  origin: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  preferences: {
    travelStyle?: string;
    budget?: string;
    pace?: string;
    transport: string[];
    interests: string[];
  };
  typicalTravelers: number;
}

/**
 * TRIP CONTEXT (Layered Trip-Specific Overrides on top of TravelContext)
 */
export interface TripContext {
  traveler: {
    id?: string;
    name: string;
    typicalTravelers: number;
  };
  origin: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  trip: {
    origin: {
      city: string;
      state: string;
      country: string;
      latitude?: number;
      longitude?: number;
    };
    destination: {
      city: string;
      state?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };
    travelers: number;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
  };
  preferences: {
    travelStyle?: string;
    budget?: string;
    pace?: string;
    transport: string[];
    interests: string[];
  };
}

export const DEFAULT_TRAVEL_PROFILE: TravelProfile = {
  fullName: 'BharatYatra Traveler',
  origin: {
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
  },
  travelStyle: 'balanced',
  budget: 'moderate',
  pace: 'balanced',
  transport: ['train', 'bus'],
  interests: ['heritage', 'nature'],
  typicalTravelers: 2,
  preferredLanguage: 'en',
  completed: false,
  onboardingStatus: 'NOT_STARTED',
};

export function calculateProfileCompletionPercentage(profile: Partial<TravelProfile> | null): number {
  if (!profile) return 0;

  let score = 0;
  if (profile.fullName && profile.fullName.trim()) score += 15;
  if (profile.origin?.city && profile.origin.city.trim()) score += 10;
  if (profile.origin?.state && profile.origin.state.trim()) score += 5;

  if (profile.groupType) score += 10;
  if (profile.travelerComposition?.adults) score += 10;
  if (profile.travelModePreference) score += 10;
  if (profile.bookingPreferences && profile.bookingPreferences.length > 0) score += 10;
  if (profile.accommodationTypes && profile.accommodationTypes.length > 0) score += 10;
  if (profile.budgetRange || profile.budget) score += 10;
  if (profile.interests && profile.interests.length > 0) score += 10;
  if (profile.pace) score += 10;

  return Math.min(100, score);
}

export function buildTravelContext(profile: TravelProfile): TravelContext {
  return {
    user: {
      id: profile.id || profile.userId,
      name: profile.fullName ? profile.fullName.split(' ')[0] : 'Traveler',
    },
    origin: {
      city: profile.origin?.city || 'Ahmedabad',
      state: profile.origin?.state || 'Gujarat',
      country: profile.origin?.country || 'India',
      latitude: profile.origin?.latitude ?? 23.0225,
      longitude: profile.origin?.longitude ?? 72.5714,
    },
    preferences: {
      travelStyle: profile.travelStyle || 'balanced',
      budget: profile.budget || 'moderate',
      pace: profile.pace || 'balanced',
      transport: profile.transport && profile.transport.length > 0 ? profile.transport : ['train', 'bus'],
      interests: profile.interests && profile.interests.length > 0 ? profile.interests : ['heritage', 'nature'],
    },
    typicalTravelers: profile.typicalTravelers || 2,
  };
}

export function buildTripContext(
  travelContext: TravelContext,
  tripOverrides: {
    origin?: Partial<TravelOrigin>;
    destination: { city: string; state?: string; country?: string; latitude?: number; longitude?: number };
    travelers?: number;
    startDate?: string;
    endDate?: string;
    durationDays?: number;
  }
): TripContext {
  const tripOrigin = tripOverrides.origin?.city
    ? {
        city: tripOverrides.origin.city,
        state: tripOverrides.origin.state || travelContext.origin.state || 'Gujarat',
        country: tripOverrides.origin.country || travelContext.origin.country || 'India',
        latitude: tripOverrides.origin.latitude ?? travelContext.origin.latitude,
        longitude: tripOverrides.origin.longitude ?? travelContext.origin.longitude,
      }
    : travelContext.origin;

  return {
    traveler: {
      id: travelContext.user.id,
      name: travelContext.user.name,
      typicalTravelers: travelContext.typicalTravelers,
    },
    origin: travelContext.origin,
    trip: {
      origin: tripOrigin,
      destination: {
        city: tripOverrides.destination.city,
        state: tripOverrides.destination.state || 'Gujarat',
        country: tripOverrides.destination.country || 'India',
        latitude: tripOverrides.destination.latitude,
        longitude: tripOverrides.destination.longitude,
      },
      travelers: tripOverrides.travelers && tripOverrides.travelers > 0 ? tripOverrides.travelers : travelContext.typicalTravelers,
      startDate: tripOverrides.startDate || '2026-12-24',
      endDate: tripOverrides.endDate,
      durationDays: tripOverrides.durationDays || 5,
    },
    preferences: travelContext.preferences,
  };
}

export function getUserProfileStorageKey(userId?: string): string {
  if (userId) return `bharatyatra_travel_profile_${userId}`;
  if (typeof window !== 'undefined') {
    try {
      const authUser = localStorage.getItem('auth_user');
      if (authUser) {
        const parsed = JSON.parse(authUser);
        if (parsed && parsed.id) return `bharatyatra_travel_profile_${parsed.id}`;
      }
    } catch {}
  }
  return 'bharatyatra_travel_profile_guest';
}

export async function fetchUserTravelProfile(userId?: string): Promise<TravelProfile> {
  const storageKey = getUserProfileStorageKey(userId);
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.origin) {
          fetchRemoteProfile(userId).catch(() => {});
          return parsed;
        }
      } catch (e) {}
    }
  }

  return fetchRemoteProfile(userId);
}

async function fetchRemoteProfile(userId?: string): Promise<TravelProfile> {
  const storageKey = getUserProfileStorageKey(userId);
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/user/travel-profile', { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const profile = json.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(profile));
        }
        return profile;
      }
    }
  } catch (e) {
    // API endpoint unreachable or unauthorized fallback
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
  }

  return DEFAULT_TRAVEL_PROFILE;
}

export async function saveUserTravelProfile(profile: Partial<TravelProfile>, userId?: string): Promise<TravelProfile> {
  const storageKey = getUserProfileStorageKey(userId);
  let existing = DEFAULT_TRAVEL_PROFILE;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        existing = JSON.parse(cached);
      } catch {}
    }
  }

  const payload: TravelProfile = {
    ...existing,
    ...profile,
    fullName: profile.fullName || existing.fullName || 'BharatYatra Traveler',
    origin: profile.origin || existing.origin || DEFAULT_TRAVEL_PROFILE.origin,
    travelStyle: profile.travelStyle || existing.travelStyle || 'balanced',
    budget: profile.budget || existing.budget || 'moderate',
    pace: profile.pace || existing.pace || 'balanced',
    transport: profile.transport || existing.transport || ['train', 'bus'],
    interests: profile.interests || existing.interests || ['heritage', 'nature'],
    typicalTravelers: profile.typicalTravelers || existing.typicalTravelers || 2,
    preferredLanguage: profile.preferredLanguage || existing.preferredLanguage || 'en',
    completed: profile.completed !== undefined ? profile.completed : true,
    onboardingStatus: profile.onboardingStatus || (profile.completed ? 'COMPLETED' : existing.onboardingStatus || 'IN_PROGRESS'),
    onboardingCompletedAt: profile.onboardingStatus === 'COMPLETED' || profile.completed ? new Date().toISOString() : existing.onboardingCompletedAt,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/user/travel-profile', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    await fetch('/api/v1/me/preferences', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        preferredLanguage: payload.preferredLanguage,
        budgetTier: payload.budget,
        travelPace: payload.pace,
        travelStyle: payload.travelStyle,
        transport: payload.transport,
        interests: payload.interests,
        originCity: payload.origin.city,
        originState: payload.origin.state,
        originCountry: payload.origin.country,
        typicalTravelers: payload.typicalTravelers,
      }),
    });

    if (payload.fullName) {
      await fetch('/api/v1/me', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fullName: payload.fullName }),
      });
    }
  } catch (e) {
    // Local fallback saved cleanly
  }

  return payload;
}

export async function skipUserOnboarding(userId?: string): Promise<void> {
  const storageKey = getUserProfileStorageKey(userId);
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(storageKey);
      const parsed = cached ? JSON.parse(cached) : { ...DEFAULT_TRAVEL_PROFILE };
      parsed.onboardingStatus = 'SKIPPED';
      localStorage.setItem(storageKey, JSON.stringify(parsed));
    } catch {}
  }
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await fetch('/api/user/onboarding/skip', { method: 'POST', headers });
  } catch {}
}

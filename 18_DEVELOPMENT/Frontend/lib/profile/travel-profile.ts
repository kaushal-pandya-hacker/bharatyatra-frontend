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
};

export function calculateProfileCompletionPercentage(profile: Partial<TravelProfile> | null): number {
  if (!profile) return 0;

  let score = 0;
  if (profile.fullName && profile.fullName.trim()) score += 20;
  if (profile.origin?.city && profile.origin.city.trim()) score += 10;
  if (profile.origin?.state && profile.origin.state.trim()) score += 10;

  if (profile.travelStyle) score += 15;
  if (profile.interests && profile.interests.length > 0) score += 15;
  if (profile.transport && profile.transport.length > 0) score += 10;
  if (profile.budget) score += 10;
  if (profile.pace) score += 5;
  if (profile.typicalTravelers && profile.typicalTravelers > 0) score += 5;

  return Math.min(100, score);
}

export function buildTravelContext(profile: TravelProfile): TravelContext {
  return {
    user: {
      id: profile.id,
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

export async function fetchUserTravelProfile(): Promise<TravelProfile> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('bharatyatra_travel_profile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.fullName && parsed.origin) {
          fetchRemoteProfile().catch(() => {});
          return parsed;
        }
      } catch (e) {}
    }
  }

  return fetchRemoteProfile();
}

async function fetchRemoteProfile(): Promise<TravelProfile> {
  try {
    const res = await apiFetch<{ success: boolean; profile: TravelProfile }>('/profile/travel');
    if (res && res.success && res.profile) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bharatyatra_travel_profile', JSON.stringify(res.profile));
      }
      return res.profile;
    }
  } catch (e) {
    // API endpoint unreachable or unauthorized fallback
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('bharatyatra_travel_profile');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
  }

  return DEFAULT_TRAVEL_PROFILE;
}

export async function saveUserTravelProfile(profile: Partial<TravelProfile>): Promise<TravelProfile> {
  const payload = {
    fullName: profile.fullName,
    origin: profile.origin,
    travelStyle: profile.travelStyle,
    budget: profile.budget,
    pace: profile.pace,
    transport: profile.transport,
    interests: profile.interests,
    typicalTravelers: profile.typicalTravelers,
    preferredLanguage: profile.preferredLanguage,
    completed: true,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('bharatyatra_travel_profile', JSON.stringify(payload));
  }

  try {
    const res = await apiFetch<{ success: boolean; profile: TravelProfile }>('/profile/travel', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res && res.success && res.profile) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bharatyatra_travel_profile', JSON.stringify(res.profile));
      }
      return res.profile;
    }
  } catch (e) {
    // Local fallback saved cleanly
  }

  return payload as TravelProfile;
}

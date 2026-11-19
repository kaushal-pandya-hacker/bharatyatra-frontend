/**
 * BharatYatra — Centralized Trip Planning State Architecture
 * Single authoritative source of truth for destination selection,
 * onboarding preferences, AI trip generation inputs, and persistent drafts.
 */

import { findDestinationMaster, EnrichedDestination } from '@/lib/ai-planner/destination-master-service';
import { searchCities, CityItem } from '@/lib/data/indian-cities';

export type DestinationType = 'city' | 'attraction' | 'region';
export type DestinationSource = 'destination_page' | 'onboarding' | 'quick_pick' | 'manual_input';
export type TripDraftStatus = 'draft' | 'confirmed' | 'generating' | 'completed';

export interface CanonicalDestination {
  destinationId: string;
  name: string;
  displayName: string;
  city: string;
  state: string;
  country: string;
  type: DestinationType;
  latitude: number;
  longitude: number;
  selectionOrder: number;
  source: DestinationSource;
  category?: string;
  imageUrl?: string;
  district?: string;
  isHighAltitude?: boolean;
}

export interface CanonicalStartingLocation {
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface CanonicalTravelDates {
  startDate?: string;
  endDate?: string;
  durationDays: number;
}

export interface CanonicalBudget {
  tier: 'budget' | 'balanced' | 'premium' | 'luxury' | 'custom';
  estimatedTotalInr?: number;
}

export interface CanonicalTravellers {
  adults: number;
  children: number;
  total: number;
  groupType?: string;
  hasSeniors?: boolean;
  hasInfants?: boolean;
}

export interface CanonicalTripPreferences {
  pace?: 'relaxed' | 'balanced' | 'fast' | 'packed';
  transport?: string[];
  interests?: string[];
  travelStyle?: string;
}

export interface CanonicalTripState {
  tripId: string;
  userId?: string;
  startingLocation: CanonicalStartingLocation;
  destinations: CanonicalDestination[];
  preferences: CanonicalTripPreferences;
  travelDates: CanonicalTravelDates;
  budget: CanonicalBudget;
  travellers: CanonicalTravellers;
  status: TripDraftStatus;
  updatedAt: string;
}

export const STORAGE_KEY_TRIP_STATE = 'bharatyatra_trip_planning_state';
export const STORAGE_KEY_SELECTED_DESTS = 'bharatyatra_selected_destinations';

/**
 * Resolves any raw query or partial object into a fully validated CanonicalDestination
 */
export function resolveCanonicalDestination(
  input: string | Partial<CanonicalDestination>,
  order: number = 1,
  source: DestinationSource = 'destination_page'
): CanonicalDestination {
  const query = typeof input === 'string' ? input.trim() : (input.name || input.displayName || input.destinationId || '').trim();

  // 1. Check Destination Master index (1,162 verified destinations across India)
  const master = findDestinationMaster(query);
  if (master) {
    const isAttraction = Boolean(
      (master.city && master.city.toLowerCase() !== master.canonicalName.toLowerCase()) ||
      (master.district && master.district.toLowerCase() !== master.canonicalName.toLowerCase()) ||
      master.category?.toLowerCase().includes('temple') ||
      master.category?.toLowerCase().includes('lake') ||
      master.category?.toLowerCase().includes('fort') ||
      master.category?.toLowerCase().includes('palace') ||
      master.category?.toLowerCase().includes('waterfall') ||
      master.category?.toLowerCase().includes('park') ||
      master.tourismType?.toLowerCase().includes('religious') ||
      master.tourismType?.toLowerCase().includes('heritage')
    );

    const destType: DestinationType = master.terrain === 'island' ? 'region' : isAttraction ? 'attraction' : 'city';
    const city = master.city || master.district || (destType === 'city' ? master.canonicalName : master.stateOrUt);

    return {
      destinationId: master.id,
      name: master.canonicalName,
      displayName: master.canonicalName,
      city,
      district: master.district || city,
      state: master.stateOrUt,
      country: 'India',
      type: destType,
      latitude: master.latitude,
      longitude: master.longitude,
      selectionOrder: order,
      source,
      category: master.category || master.tourismType,
      imageUrl: typeof input === 'object' && input.imageUrl ? input.imageUrl : '/hero-bg.jpg',
      isHighAltitude: master.isHighAltitude,
    };
  }

  // 2. Check Indian Cities registry
  const cityMatches = searchCities(query);
  if (cityMatches && cityMatches.length > 0) {
    const firstCity = cityMatches[0];
    return {
      destinationId: `city-${firstCity.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: firstCity.city,
      displayName: `${firstCity.city}, ${firstCity.state}`,
      city: firstCity.city,
      district: firstCity.city,
      state: firstCity.state,
      country: firstCity.country || 'India',
      type: 'city',
      latitude: firstCity.latitude || 23.0225,
      longitude: firstCity.longitude || 72.5714,
      selectionOrder: order,
      source,
      category: 'Urban & Cultural Hub',
      imageUrl: typeof input === 'object' && input.imageUrl ? input.imageUrl : '/hero-bg.jpg',
      isHighAltitude: false,
    };
  }

  // 3. Fallback: Parse "Place, State" format or raw input
  let parsedName = query;
  let parsedState = 'India';
  let parsedCity = query;

  if (query.includes(',')) {
    const parts = query.split(',').map((p) => p.trim());
    parsedName = parts[0];
    parsedState = parts[1] || 'India';
    parsedCity = parts[0];
  }

  const safeId = typeof input === 'object' && input.destinationId
    ? input.destinationId
    : `dest-${parsedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return {
    destinationId: safeId,
    name: parsedName,
    displayName: parsedName,
    city: parsedCity,
    state: parsedState,
    country: 'India',
    type: 'attraction',
    latitude: typeof input === 'object' && input.latitude ? input.latitude : 23.0225,
    longitude: typeof input === 'object' && input.longitude ? input.longitude : 72.5714,
    selectionOrder: order,
    source,
    category: typeof input === 'object' && input.category ? input.category : 'Sightseeing',
    imageUrl: typeof input === 'object' && input.imageUrl ? input.imageUrl : '/hero-bg.jpg',
    isHighAltitude: false,
  };
}

/**
 * Creates an initial clean trip planning state with unique ID
 */
export function createInitialTripState(userId?: string): CanonicalTripState {
  const tripId = `trip_draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    tripId,
    userId,
    startingLocation: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
    },
    destinations: [],
    preferences: {
      pace: 'balanced',
      transport: ['train', 'car'],
      interests: ['Heritage', 'Culture', 'Sightseeing'],
      travelStyle: 'balanced',
    },
    travelDates: {
      startDate: new Date().toISOString().split('T')[0],
      durationDays: 4,
    },
    budget: {
      tier: 'balanced',
      estimatedTotalInr: 25000,
    },
    travellers: {
      adults: 2,
      children: 0,
      total: 2,
      groupType: 'Couples / Duo',
      hasSeniors: false,
      hasInfants: false,
    },
    status: 'draft',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Loads trip planning state from localStorage (client only)
 */
export function loadTripPlanningState(): CanonicalTripState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIP_STATE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.tripId && Array.isArray(parsed.destinations)) {
      return parsed as CanonicalTripState;
    }
  } catch (err) {
    console.warn('Error reading trip planning state:', err);
  }
  return null;
}

/**
 * Saves canonical trip planning state to localStorage and triggers storage sync event
 */
export function saveTripPlanningState(state: CanonicalTripState): void {
  if (typeof window === 'undefined') return;
  try {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_TRIP_STATE, JSON.stringify(state));

    // Also synchronize legacy selected destinations for backward-compatible components
    const legacyDests = state.destinations.map((d) => ({
      id: d.destinationId,
      name: d.name,
      displayName: d.displayName,
      slug: d.destinationId.toLowerCase(),
      stateName: d.state,
      stateSlug: d.state.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      location: `${d.city}, ${d.state}`,
      category: d.category || 'Sightseeing',
      imageUrl: d.imageUrl || '/hero-bg.jpg',
      city: d.city,
      type: d.type,
      selectionOrder: d.selectionOrder,
      source: d.source,
    }));
    localStorage.setItem(STORAGE_KEY_SELECTED_DESTS, JSON.stringify(legacyDests));

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('by_trip_state_updated', { detail: state }));
  } catch (err) {
    console.warn('Error saving trip planning state:', err);
  }
}

/**
 * Starts a brand new trip draft, clearing previous destinations completely
 */
export function startNewTripDraft(userId?: string): CanonicalTripState {
  const fresh = createInitialTripState(userId);
  saveTripPlanningState(fresh);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('by_onboarding_draft');
  }
  return fresh;
}

/**
 * Validates a trip planning request payload before calling the AI generation engine
 */
export function validateTripPayload(payload: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!payload) {
    errors.push('Missing trip planning payload.');
    return { valid: false, errors };
  }

  // Validate destinations
  const dests = payload.destinations || payload.targetDestinations;
  if (!dests || !Array.isArray(dests) || dests.length === 0) {
    errors.push('At least one confirmed destination must be selected.');
  } else {
    for (const d of dests) {
      if (typeof d === 'string') {
        const clean = d.trim().toUpperCase();
        if (clean.length === 0) {
          errors.push('Destination name cannot be empty.');
        } else if (clean.startsWith('INVALID') || clean.startsWith('DELETED') || clean.includes('NONEXISTENT')) {
          errors.push(`Destination '${d}' is invalid or has been decommissioned.`);
        }
      } else if (typeof d === 'object') {
        if (d.isDeleted || d.status === 'deleted') {
          errors.push(`Destination ID '${d.destinationId || d.id}' has been deleted.`);
        }
        const id = (d.destinationId || d.id || '').toString().trim().toUpperCase();
        if (id.startsWith('INVALID') || id.startsWith('DELETED') || id.includes('NONEXISTENT')) {
          errors.push(`Destination ID '${id}' is invalid or not registered in destination catalog.`);
        }
        const name = d.name || d.displayName || d.city || d.place;
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          errors.push('Invalid destination entry: missing destination name or city.');
        }
      }
    }
  }

  // Validate starting location
  const origin = payload.originCity || (payload.startingLocation && payload.startingLocation.city) || (payload.origin && payload.origin.city);
  if (!origin || typeof origin !== 'string' || origin.trim().length === 0) {
    errors.push('Starting location (origin city) is required.');
  }

  // Validate duration
  const days = payload.durationDays || (payload.travelDates && payload.travelDates.durationDays);
  if (days !== undefined && (isNaN(Number(days)) || Number(days) < 1 || Number(days) > 60)) {
    errors.push('Duration days must be a positive number between 1 and 60.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

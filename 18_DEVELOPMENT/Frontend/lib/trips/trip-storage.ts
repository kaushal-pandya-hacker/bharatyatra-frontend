import { TripContext } from '../profile/travel-profile';

export type CanonicalTripStatus = 
  | 'DRAFT'
  | 'PLANNING'
  | 'READY'
  | 'SAVED'
  | 'UPCOMING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TripNode {
  day: string;
  title: string;
  badge: string;
  detail: string;
}

export interface TripItem {
  tripId: string;
  id?: string;
  title: string;
  destination: string;
  destinationCity?: string;
  originCity?: string;
  startDate: string;
  endDate?: string;
  durationDays: number;
  travelers?: number;
  travellerCount?: number;
  crewType?: string;
  selectedTier?: 'budget' | 'balanced' | 'luxury';
  budgetInr: number;
  status: CanonicalTripStatus;
  rawStatus?: string;
  version?: number;
  image?: string;
  nodes?: TripNode[];
  tripContext?: TripContext;
  tripContextJson?: any;
  routeJson?: any;
  itineraryJson?: any;
  createdAt?: string;
  savedAt?: string;
}

export const STORAGE_KEY = 'chalo_farva_saved_trips';

export function resolveClientTripStatus(trip: { status?: string; startDate?: string; endDate?: string }): CanonicalTripStatus {
  if (!trip) return 'SAVED';
  const statusUpper = (trip.status || '').toUpperCase();
  if (statusUpper === 'CANCELLED') return 'CANCELLED';
  if (statusUpper === 'COMPLETED') return 'COMPLETED';
  if (statusUpper === 'DRAFT') return 'DRAFT';
  if (statusUpper === 'PLANNING') return 'PLANNING';

  const now = new Date();
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : (start ? new Date(start.getTime() + 3 * 86400000) : null);

  if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
    return (statusUpper as CanonicalTripStatus) || 'SAVED';
  }

  const nowMs = now.getTime();
  if (start.getTime() > nowMs) {
    return 'UPCOMING';
  } else if (start.getTime() <= nowMs && nowMs <= end.getTime()) {
    return 'ACTIVE';
  } else if (end.getTime() < nowMs) {
    return 'COMPLETED';
  }

  return (statusUpper as CanonicalTripStatus) || 'SAVED';
}

export const DEFAULT_MOCK_TRIPS: TripItem[] = [];

export function getSavedTrips(): TripItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out any stale demo/mock trips
        const realTrips = parsed.filter(
          (t) => t && t.tripId && !t.tripId.startsWith('demo-trip-') && !t.title?.includes('Sabarkantha')
        );
        return realTrips.map((t) => ({ ...t, status: resolveClientTripStatus(t) }));
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveTrip(trip: TripItem): TripItem[] {
  if (typeof window === 'undefined') return [trip];
  try {
    const current = getSavedTrips();
    const resolvedTrip = { ...trip, status: resolveClientTripStatus(trip) };
    const updated = [resolvedTrip, ...current.filter((t) => t.tripId !== trip.tripId && t.id !== trip.tripId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving trip to localStorage', err);
    return [trip];
  }
}

export function deleteSavedTrip(tripId: string): TripItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedTrips();
    const updated = current.filter((t) => t.tripId !== tripId && t.id !== tripId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// API Integration Helpers
export async function fetchUserTripsFromApi(token?: string): Promise<TripItem[]> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/v1/trips', { headers });
    if (!res.ok) return getSavedTrips();

    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const tripsFromApi: TripItem[] = json.data.map((t: any) => ({
        tripId: t.tripId || t.id,
        id: t.id || t.tripId,
        title: t.title,
        destination: t.destination || t.destinationCity || 'Destination',
        destinationCity: t.destinationCity || t.destination || 'Destination',
        originCity: t.originCity || 'Origin',
        startDate: t.startDate,
        endDate: t.endDate,
        durationDays: t.durationDays || 4,
        travelers: t.travelers || t.travellerCount || 2,
        travellerCount: t.travelers || t.travellerCount || 2,
        budgetInr: t.budgetInr || 25000,
        status: resolveClientTripStatus(t),
        rawStatus: t.rawStatus || t.status,
        version: t.version || 1,
        tripContext: t.tripContextJson || t.tripContext,
        tripContextJson: t.tripContextJson,
        routeJson: t.routeJson,
        itineraryJson: t.itineraryJson,
        createdAt: t.createdAt,
        savedAt: t.savedAt,
      }));

      // Sync with localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tripsFromApi));
      }
      return tripsFromApi;
    }
  } catch (err) {
    console.warn('API fetch failed for trips, falling back to storage:', err);
  }
  return getSavedTrips();
}

export async function saveTripToApi(tripData: Partial<TripItem>, token?: string): Promise<TripItem> {
  const tripId = tripData.tripId || tripData.id || `trip-${Date.now()}`;
  const completeTrip: TripItem = {
    tripId,
    id: tripId,
    title: tripData.title || `${tripData.originCity || 'Origin'} → ${tripData.destinationCity || tripData.destination || 'Destination'}`,
    destination: tripData.destinationCity || tripData.destination || 'Destination',
    destinationCity: tripData.destinationCity || tripData.destination || 'Destination',
    originCity: tripData.originCity || 'Origin',
    startDate: tripData.startDate || '2026-11-10',
    endDate: tripData.endDate || '2026-11-14',
    durationDays: tripData.durationDays || 4,
    travelers: tripData.travelers || tripData.travellerCount || 2,
    travellerCount: tripData.travelers || tripData.travellerCount || 2,
    budgetInr: tripData.budgetInr || 25000,
    status: resolveClientTripStatus(tripData as any),
    rawStatus: tripData.status || 'SAVED',
    version: tripData.version || 1,
    tripContext: tripData.tripContext || tripData.tripContextJson,
    tripContextJson: tripData.tripContextJson || tripData.tripContext,
    routeJson: tripData.routeJson,
    itineraryJson: tripData.itineraryJson,
    savedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/v1/trips', {
      method: 'POST',
      headers,
      body: JSON.stringify(completeTrip),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const savedApi = json.data;
        completeTrip.id = savedApi.id || completeTrip.id;
        completeTrip.tripId = savedApi.tripId || completeTrip.tripId;
      }
    }
  } catch (err) {
    console.warn('Backend API save failed, saved locally:', err);
  }

  saveTrip(completeTrip);
  return completeTrip;
}


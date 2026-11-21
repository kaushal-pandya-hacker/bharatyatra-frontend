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
  budgetInr?: number | null;
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

export function getStoredUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      const parsed = JSON.parse(authUser);
      if (parsed && parsed.id) return parsed.id;
    }
  } catch {}
  return undefined;
}

export function getUserTripStorageKey(userId?: string): string {
  if (userId && userId !== 'guest') return `chalo_farva_saved_trips_${userId}`;
  const storedId = getStoredUserId();
  if (storedId) return `chalo_farva_saved_trips_${storedId}`;
  return 'chalo_farva_saved_trips_guest';
}

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

export function getSavedTrips(userId?: string): TripItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const effectiveUserId = userId || getStoredUserId();
    const key = getUserTripStorageKey(effectiveUserId);
    const saved = localStorage.getItem(key);

    let parsedTrips: TripItem[] = [];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedTrips = parsed;
      }
    }

    // Backward Compatibility Migration: Check legacy un-scoped key
    if (effectiveUserId && effectiveUserId !== 'guest') {
      try {
        const legacyRaw = localStorage.getItem('chalo_farva_saved_trips');
        if (legacyRaw) {
          const legacy = JSON.parse(legacyRaw);
          if (Array.isArray(legacy) && legacy.length > 0) {
            const existingIds = new Set(parsedTrips.map((t) => t.tripId || t.id));
            let migratedCount = 0;
            for (const lt of legacy) {
              const id = lt.tripId || lt.id;
              if (id && !existingIds.has(id)) {
                parsedTrips.push(lt);
                existingIds.add(id);
                migratedCount++;
              }
            }
            if (migratedCount > 0) {
              localStorage.setItem(key, JSON.stringify(parsedTrips));
            }
            // Clear legacy key after migrating
            localStorage.removeItem('chalo_farva_saved_trips');
          }
        }
      } catch {}
    }

    // Filter out synthetic test mock trips
    const realTrips = parsedTrips.filter(
      (t) => t && (t.tripId || t.id) && !t.tripId?.startsWith('demo-trip-') && !t.title?.includes('Sabarkantha')
    );
    return realTrips.map((t) => ({ ...t, status: resolveClientTripStatus(t) }));
  } catch {
    return [];
  }
}

export function saveTrip(trip: TripItem, userId?: string): TripItem[] {
  if (typeof window === 'undefined') return [trip];
  try {
    const effectiveUserId = userId || getStoredUserId();
    const key = getUserTripStorageKey(effectiveUserId);
    const current = getSavedTrips(effectiveUserId);
    const resolvedTrip = {
      ...trip,
      tripId: trip.tripId || trip.id || `trip-${Date.now()}`,
      id: trip.id || trip.tripId || `trip-${Date.now()}`,
      status: resolveClientTripStatus(trip),
      savedAt: trip.savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const targetId = resolvedTrip.tripId;
    const updated = [resolvedTrip, ...current.filter((t) => t.tripId !== targetId && t.id !== targetId)];
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving trip to localStorage', err);
    return [trip];
  }
}

export function deleteSavedTrip(tripId: string, userId?: string): TripItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const effectiveUserId = userId || getStoredUserId();
    const key = getUserTripStorageKey(effectiveUserId);
    const current = getSavedTrips(effectiveUserId);
    const updated = current.filter((t) => t.tripId !== tripId && t.id !== tripId);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Reconciles local and remote trips non-destructively.
 * Rules:
 * 1. Local trips that do not exist on the remote server are NEVER deleted; they are preserved and marked for sync.
 * 2. Remote trips that do not exist locally are merged into the vault.
 * 3. Trips existing in both are updated to whichever version has the latest timestamp / higher version.
 */
export function reconcileTrips(
  localTrips: TripItem[],
  remoteTrips: TripItem[]
): { merged: TripItem[]; needsSyncToRemote: TripItem[] } {
  const mergedMap = new Map<string, TripItem>();
  const needsSyncToRemote: TripItem[] = [];

  // Index remote trips first
  for (const r of remoteTrips) {
    const key = r.tripId || r.id;
    if (key) {
      mergedMap.set(key, { ...r, status: resolveClientTripStatus(r) });
    }
  }

  // Compare and merge with local trips
  for (const l of localTrips) {
    const key = l.tripId || l.id;
    if (!key) continue;

    const existingRemote = mergedMap.get(key);
    if (!existingRemote) {
      // Local trip not in remote: PRESERVE IT and queue for background sync
      mergedMap.set(key, { ...l, status: resolveClientTripStatus(l) });
      needsSyncToRemote.push(l);
    } else {
      const localTime = new Date(l.savedAt || l.createdAt || 0).getTime();
      const remoteTime = new Date(existingRemote.savedAt || existingRemote.createdAt || 0).getTime();
      const localVersion = l.version || 1;
      const remoteVersion = existingRemote.version || 1;

      if (localVersion > remoteVersion || localTime > remoteTime + 2000) {
        mergedMap.set(key, { ...l, status: resolveClientTripStatus(l) });
        needsSyncToRemote.push(l);
      }
    }
  }

  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.savedAt || b.createdAt || 0).getTime() - new Date(a.savedAt || a.createdAt || 0).getTime()
  );

  return { merged, needsSyncToRemote };
}

/**
 * Background synchronizer that uploads unsaved local trips to server.
 */
export async function syncTripsToServer(trips: TripItem[], token: string): Promise<void> {
  if (!token || trips.length === 0) return;
  for (const t of trips) {
    try {
      await fetch('/api/v1/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(t),
      });
    } catch {}
  }
}

/**
 * Seamlessly claims any trips planned as a guest, migrating them to the authenticated user vault.
 */
export async function claimGuestTrips(targetUserId: string, token?: string): Promise<TripItem[]> {
  if (typeof window === 'undefined' || !targetUserId) return [];
  try {
    const guestTrips = getSavedTrips('guest');

    // Also claim any pending trip left from /plan
    const pendingRaw = localStorage.getItem('chalo_farva_pending_trip');
    if (pendingRaw) {
      try {
        const pt = JSON.parse(pendingRaw);
        if (pt && (pt.tripId || pt.title)) {
          guestTrips.push(pt);
          localStorage.removeItem('chalo_farva_pending_trip');
        }
      } catch {}
    }

    if (guestTrips.length === 0) return getSavedTrips(targetUserId);

    const userKey = getUserTripStorageKey(targetUserId);
    const existingUserTrips = getSavedTrips(targetUserId);
    const existingIds = new Set(existingUserTrips.map((t) => t.tripId || t.id));

    const newlyClaimed: TripItem[] = [];
    for (const gt of guestTrips) {
      const tripId = gt.tripId || gt.id || `trip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      if (!existingIds.has(tripId)) {
        const userTrip: TripItem = {
          ...gt,
          tripId,
          id: tripId,
          savedAt: new Date().toISOString(),
        };
        existingUserTrips.push(userTrip);
        newlyClaimed.push(userTrip);
        existingIds.add(tripId);
      }
    }

    // Persist under user's private key
    localStorage.setItem(userKey, JSON.stringify(existingUserTrips));

    // Clear guest storage now that data is secured in user's vault
    localStorage.removeItem(getUserTripStorageKey('guest'));

    // Upload claimed trips to backend database
    if (token && newlyClaimed.length > 0) {
      syncTripsToServer(newlyClaimed, token).catch(() => {});
    }

    return existingUserTrips;
  } catch (err) {
    console.error('Error claiming guest trips:', err);
    return getSavedTrips(targetUserId);
  }
}

// API Integration Helpers
export async function fetchUserTripsFromApi(token?: string, userId?: string): Promise<TripItem[]> {
  const effectiveUserId = userId || getStoredUserId();
  const localTrips = getSavedTrips(effectiveUserId);

  try {
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (effectiveToken) headers['Authorization'] = `Bearer ${effectiveToken}`;

    const res = await fetch('/api/v1/trips', { headers });
    if (!res.ok) {
      // Non-200 (401, 500, offline): ALWAYS retain and return cached local trips
      return localTrips;
    }

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
        budgetInr: t.budgetInr != null && !isNaN(Number(t.budgetInr)) && Number(t.budgetInr) > 0 ? Number(t.budgetInr) : (t.budgetInr === null ? null : undefined),
        status: resolveClientTripStatus(t),
        rawStatus: t.rawStatus || t.status,
        version: t.version || 1,
        tripContext: t.tripContextJson || t.tripContext,
        tripContextJson: t.tripContextJson,
        routeJson: t.routeJson,
        itineraryJson: t.itineraryJson,
        createdAt: t.createdAt,
        savedAt: t.savedAt || t.updatedAt,
      }));

      // Multi-tier recovery: if local is empty on a new device or fresh tab, check guest vault
      let baseLocal = localTrips;
      if (baseLocal.length === 0 && effectiveUserId && effectiveUserId !== 'guest') {
        const guestTrips = getSavedTrips('guest');
        if (guestTrips.length > 0) {
          baseLocal = guestTrips;
        }
      }

      // Non-destructive reconciliation: NEVER overwrite local trips with an empty array
      const { merged, needsSyncToRemote } = reconcileTrips(baseLocal, tripsFromApi);

      if (typeof window !== 'undefined') {
        localStorage.setItem(getUserTripStorageKey(effectiveUserId), JSON.stringify(merged));
      }

      // Automatically background-sync unsaved local trips to server
      if (needsSyncToRemote.length > 0 && effectiveToken) {
        syncTripsToServer(needsSyncToRemote, effectiveToken).catch(() => {});
      }

      return merged;
    }
  } catch (err) {
    console.warn('API fetch failed for trips, safely falling back to local vault:', err);
  }

  return localTrips;
}

export async function saveTripToApi(tripData: Partial<TripItem>, token?: string, userId?: string): Promise<TripItem> {
  const effectiveUserId = userId || getStoredUserId();
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
    budgetInr: tripData.budgetInr != null && !isNaN(Number(tripData.budgetInr)) && Number(tripData.budgetInr) > 0 ? Number(tripData.budgetInr) : (tripData.budgetInr === null ? null : null),
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

  // 1. Immediately save to local persistent storage (Zero Data Loss)
  saveTrip(completeTrip, effectiveUserId);

  // 2. Attempt remote save if online
  try {
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (effectiveToken) headers['Authorization'] = `Bearer ${effectiveToken}`;

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
        // Re-save with confirmed backend ID
        saveTrip(completeTrip, effectiveUserId);
      }
    }
  } catch (err) {
    console.warn('Backend API save failed, safely preserved in local vault:', err);
  }

  return completeTrip;
}


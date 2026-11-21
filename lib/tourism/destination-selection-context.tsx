'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CanonicalDestination,
  CanonicalTripState,
  resolveCanonicalDestination,
  createInitialTripState,
  loadTripPlanningState,
  saveTripPlanningState,
  startNewTripDraft,
  STORAGE_KEY_TRIP_STATE,
  STORAGE_KEY_SELECTED_DESTS,
  CanonicalTravelDates,
  CanonicalStartingLocation,
  CanonicalBudget,
  CanonicalTravellers,
  CanonicalTripPreferences,
} from '@/lib/trips/trip-planning-state';

export interface SelectedDestination {
  id: string;
  name: string;
  displayName?: string;
  slug: string;
  stateName: string;
  stateSlug: string;
  location: string;
  category: string;
  priority?: number;
  imageUrl: string;
  destinationId?: string;
  city?: string;
  district?: string;
  type?: 'city' | 'attraction' | 'region';
  selectionOrder?: number;
  source?: string;
  latitude?: number;
  longitude?: number;
}

interface DestinationSelectionContextType {
  selectedDestinations: SelectedDestination[];
  canonicalTripState: CanonicalTripState | null;
  toggleDestination: (dest: SelectedDestination | string) => void;
  addDestination: (dest: SelectedDestination | string) => void;
  removeDestination: (idOrName: string) => void;
  clearSelection: () => void;
  startNewTrip: () => void;
  isDestinationSelected: (idOrName: string) => boolean;
  selectedCount: number;
  uniqueStatesCount: number;
  destinationsByState: Record<string, SelectedDestination[]>;
  updateTripDates: (dates: Partial<CanonicalTravelDates>) => void;
  updateTripStartingLocation: (loc: Partial<CanonicalStartingLocation>) => void;
  updateTripBudget: (budget: Partial<CanonicalBudget>) => void;
  updateTripTravellers: (travellers: Partial<CanonicalTravellers>) => void;
  updateTripPreferences: (pref: Partial<CanonicalTripPreferences>) => void;
  syncFromCanonical: (state: CanonicalTripState) => void;
}

const DestinationSelectionContext = createContext<DestinationSelectionContextType | undefined>(undefined);

function mapCanonicalToSelected(d: CanonicalDestination): SelectedDestination {
  return {
    id: d.destinationId,
    destinationId: d.destinationId,
    name: d.name,
    displayName: d.displayName,
    slug: d.destinationId.toLowerCase(),
    stateName: d.state,
    stateSlug: d.state.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    location: `${d.city}, ${d.state}`,
    category: d.category || 'Sightseeing',
    imageUrl: d.imageUrl || '/hero-bg.jpg',
    city: d.city,
    district: d.district,
    type: d.type,
    selectionOrder: d.selectionOrder,
    source: d.source,
    latitude: d.latitude,
    longitude: d.longitude,
  };
}

export function DestinationSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedDestinations, setSelectedDestinations] = useState<SelectedDestination[]>([]);
  const [canonicalTripState, setCanonicalTripState] = useState<CanonicalTripState | null>(null);

  // Load initial state from canonical store / localStorage
  const hydrateFromStorage = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;

      const loadedTrip = loadTripPlanningState();
      if (loadedTrip && loadedTrip.destinations && loadedTrip.destinations.length > 0) {
        // Sanitize out any stale legacy default/sample destinations
        const sanitizedDests = loadedTrip.destinations.filter(
          (d) => d && d.name && !['Borra Caves', 'Araku Valley'].includes(d.name.trim())
        );
        if (sanitizedDests.length > 0) {
          const sanitizedTrip = { ...loadedTrip, destinations: sanitizedDests };
          setCanonicalTripState(sanitizedTrip);
          const mapped = sanitizedDests.map(mapCanonicalToSelected);
          setSelectedDestinations(mapped);
          return;
        }
      }

      // Fallback: check legacy storage key
      const legacyRaw = localStorage.getItem(STORAGE_KEY_SELECTED_DESTS);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitizedLegacy = parsed.filter(
            (item: any) =>
              item &&
              (item.name || item.displayName || item.city) &&
              !['Borra Caves', 'Araku Valley'].includes((item.name || item.displayName || item.city || '').trim())
          );
          if (sanitizedLegacy.length > 0) {
            setSelectedDestinations(sanitizedLegacy);
            const initial = createInitialTripState();
            initial.destinations = sanitizedLegacy.map((item, idx) =>
              resolveCanonicalDestination(item, idx + 1, 'destination_page')
            );
            setCanonicalTripState(initial);
            saveTripPlanningState(initial);
            return;
          }
        }
      }

      // Fresh state if nothing stored
      const initial = loadedTrip || createInitialTripState();
      setCanonicalTripState(initial);
      setSelectedDestinations([]);
    } catch (e) {
      console.warn('Could not load destinations from storage:', e);
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();

    // Cross-tab synchronization listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_TRIP_STATE || e.key === STORAGE_KEY_SELECTED_DESTS) {
        hydrateFromStorage();
      }
    };

    // In-tab custom event listener
    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CanonicalTripState>;
      if (customEvent.detail) {
        const state = customEvent.detail;
        setCanonicalTripState(state);
        setSelectedDestinations(state.destinations.map(mapCanonicalToSelected));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('by_trip_state_updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('by_trip_state_updated', handleCustomUpdate);
    };
  }, [hydrateFromStorage]);

  const isDestinationSelected = useCallback(
    (idOrName: string): boolean => {
      if (!idOrName) return false;
      const targetNorm = idOrName.toLowerCase().trim();
      return selectedDestinations.some(
        (d) =>
          d.id.toLowerCase().trim() === targetNorm ||
          (d.destinationId && d.destinationId.toLowerCase().trim() === targetNorm) ||
          d.slug.toLowerCase().trim() === targetNorm ||
          d.name.toLowerCase().trim() === targetNorm ||
          (d.displayName && d.displayName.toLowerCase().trim() === targetNorm)
      );
    },
    [selectedDestinations]
  );

  const addDestination = useCallback(
    (dest: SelectedDestination | string) => {
      const rawName = typeof dest === 'string' ? dest : (dest.name || dest.id);
      if (isDestinationSelected(rawName)) return;

      const currentState = canonicalTripState || createInitialTripState();
      const nextOrder = currentState.destinations.length + 1;
      const canonical = resolveCanonicalDestination(
        typeof dest === 'string' ? dest : {
          destinationId: dest.destinationId || dest.id,
          name: dest.name,
          displayName: dest.displayName || dest.name,
          state: dest.stateName,
          category: dest.category,
          imageUrl: dest.imageUrl,
          latitude: dest.latitude,
          longitude: dest.longitude,
        },
        nextOrder,
        typeof dest === 'object' && dest.source ? (dest.source as any) : 'destination_page'
      );

      const updatedDestinations = [...currentState.destinations, canonical];
      const updatedState: CanonicalTripState = {
        ...currentState,
        destinations: updatedDestinations,
        updatedAt: new Date().toISOString(),
      };

      setCanonicalTripState(updatedState);
      const mapped = updatedDestinations.map(mapCanonicalToSelected);
      setSelectedDestinations(mapped);
      saveTripPlanningState(updatedState);
    },
    [canonicalTripState, isDestinationSelected]
  );

  const removeDestination = useCallback(
    (idOrName: string) => {
      if (!idOrName) return;
      const targetNorm = idOrName.toLowerCase().trim();

      const currentState = canonicalTripState || createInitialTripState();
      const filteredCanonicals = currentState.destinations.filter(
        (d) =>
          d.destinationId.toLowerCase().trim() !== targetNorm &&
          d.name.toLowerCase().trim() !== targetNorm &&
          d.displayName.toLowerCase().trim() !== targetNorm
      );

      // Re-index selection order
      const reindexed = filteredCanonicals.map((d, idx) => ({
        ...d,
        selectionOrder: idx + 1,
      }));

      const updatedState: CanonicalTripState = {
        ...currentState,
        destinations: reindexed,
        updatedAt: new Date().toISOString(),
      };

      setCanonicalTripState(updatedState);
      const mapped = reindexed.map(mapCanonicalToSelected);
      setSelectedDestinations(mapped);
      saveTripPlanningState(updatedState);
    },
    [canonicalTripState]
  );

  const toggleDestination = useCallback(
    (dest: SelectedDestination | string) => {
      const idOrName = typeof dest === 'string' ? dest : (dest.id || dest.name);
      if (isDestinationSelected(idOrName)) {
        removeDestination(idOrName);
      } else {
        addDestination(dest);
      }
    },
    [isDestinationSelected, removeDestination, addDestination]
  );

  const clearSelection = useCallback(() => {
    const currentState = canonicalTripState || createInitialTripState();
    const updatedState: CanonicalTripState = {
      ...currentState,
      destinations: [],
      updatedAt: new Date().toISOString(),
    };
    setCanonicalTripState(updatedState);
    setSelectedDestinations([]);
    saveTripPlanningState(updatedState);
  }, [canonicalTripState]);

  const startNewTrip = useCallback(() => {
    const fresh = startNewTripDraft();
    setCanonicalTripState(fresh);
    setSelectedDestinations([]);
  }, []);

  const syncFromCanonical = useCallback((state: CanonicalTripState) => {
    setCanonicalTripState(state);
    setSelectedDestinations(state.destinations.map(mapCanonicalToSelected));
    saveTripPlanningState(state);
  }, []);

  const updateTripDates = useCallback((dates: Partial<CanonicalTravelDates>) => {
    setCanonicalTripState((prev) => {
      const state = prev || createInitialTripState();
      const updated: CanonicalTripState = {
        ...state,
        travelDates: { ...state.travelDates, ...dates },
        updatedAt: new Date().toISOString(),
      };
      saveTripPlanningState(updated);
      return updated;
    });
  }, []);

  const updateTripStartingLocation = useCallback((loc: Partial<CanonicalStartingLocation>) => {
    setCanonicalTripState((prev) => {
      const state = prev || createInitialTripState();
      const updated: CanonicalTripState = {
        ...state,
        startingLocation: { ...state.startingLocation, ...loc },
        updatedAt: new Date().toISOString(),
      };
      saveTripPlanningState(updated);
      return updated;
    });
  }, []);

  const updateTripBudget = useCallback((budget: Partial<CanonicalBudget>) => {
    setCanonicalTripState((prev) => {
      const state = prev || createInitialTripState();
      const updated: CanonicalTripState = {
        ...state,
        budget: { ...state.budget, ...budget },
        updatedAt: new Date().toISOString(),
      };
      saveTripPlanningState(updated);
      return updated;
    });
  }, []);

  const updateTripTravellers = useCallback((travellers: Partial<CanonicalTravellers>) => {
    setCanonicalTripState((prev) => {
      const state = prev || createInitialTripState();
      const updated: CanonicalTripState = {
        ...state,
        travellers: { ...state.travellers, ...travellers },
        updatedAt: new Date().toISOString(),
      };
      saveTripPlanningState(updated);
      return updated;
    });
  }, []);

  const updateTripPreferences = useCallback((pref: Partial<CanonicalTripPreferences>) => {
    setCanonicalTripState((prev) => {
      const state = prev || createInitialTripState();
      const updated: CanonicalTripState = {
        ...state,
        preferences: { ...state.preferences, ...pref },
        updatedAt: new Date().toISOString(),
      };
      saveTripPlanningState(updated);
      return updated;
    });
  }, []);

  const destinationsByState = selectedDestinations.reduce((acc, dest) => {
    const st = dest.stateName || 'Other';
    if (!acc[st]) acc[st] = [];
    acc[st].push(dest);
    return acc;
  }, {} as Record<string, SelectedDestination[]>);

  const uniqueStatesCount = Object.keys(destinationsByState).length;

  return (
    <DestinationSelectionContext.Provider
      value={{
        selectedDestinations,
        canonicalTripState,
        toggleDestination,
        addDestination,
        removeDestination,
        clearSelection,
        startNewTrip,
        isDestinationSelected,
        selectedCount: selectedDestinations.length,
        uniqueStatesCount,
        destinationsByState,
        updateTripDates,
        updateTripStartingLocation,
        updateTripBudget,
        updateTripTravellers,
        updateTripPreferences,
        syncFromCanonical,
      }}
    >
      {children}
    </DestinationSelectionContext.Provider>
  );
}

export function useDestinationSelection() {
  const context = useContext(DestinationSelectionContext);
  if (!context) {
    throw new Error('useDestinationSelection must be used within a DestinationSelectionProvider');
  }
  return context;
}

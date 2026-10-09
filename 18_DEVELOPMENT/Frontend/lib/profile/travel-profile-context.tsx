'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  TravelProfile,
  TravelContext,
  DEFAULT_TRAVEL_PROFILE,
  fetchUserTravelProfile,
  saveUserTravelProfile,
  buildTravelContext,
  buildTripContext,
  TripContext,
} from './travel-profile';

interface TravelProfileContextType {
  profile: TravelProfile;
  travelContext: TravelContext;
  loading: boolean;
  updateProfile: (updated: Partial<TravelProfile>) => Promise<TravelProfile>;
  getTripContext: (destinationCity: string, options?: { originCity?: string; travelers?: number; startDate?: string; durationDays?: number }) => TripContext;
  refreshProfile: () => Promise<void>;
}

const TravelProfileContext = createContext<TravelProfileContextType>({
  profile: DEFAULT_TRAVEL_PROFILE,
  travelContext: buildTravelContext(DEFAULT_TRAVEL_PROFILE),
  loading: true,
  updateProfile: async () => DEFAULT_TRAVEL_PROFILE,
  getTripContext: () => buildTripContext(buildTravelContext(DEFAULT_TRAVEL_PROFILE), { destination: { city: 'Dwarka' } }),
  refreshProfile: async () => {},
});

export function TravelProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TravelProfile>(DEFAULT_TRAVEL_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = async () => {
    try {
      const p = await fetchUserTravelProfile();
      setProfile(p);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const updateProfile = async (updated: Partial<TravelProfile>) => {
    const saved = await saveUserTravelProfile(updated);
    setProfile(saved);
    return saved;
  };

  const travelContext = buildTravelContext(profile);

  const getTripContext = (
    destinationCity: string,
    options?: { originCity?: string; travelers?: number; startDate?: string; durationDays?: number }
  ): TripContext => {
    return buildTripContext(travelContext, {
      origin: options?.originCity ? { city: options.originCity } : undefined,
      destination: { city: destinationCity },
      travelers: options?.travelers,
      startDate: options?.startDate,
      durationDays: options?.durationDays,
    });
  };

  return (
    <TravelProfileContext.Provider
      value={{
        profile,
        travelContext,
        loading,
        updateProfile,
        getTripContext,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </TravelProfileContext.Provider>
  );
}

export function useTravelProfile() {
  return useContext(TravelProfileContext);
}

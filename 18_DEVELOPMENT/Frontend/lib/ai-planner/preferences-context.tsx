'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import {
  TripPreferenceProfile,
  PreferenceVersionSnapshot,
  ChangeExplanation,
} from './universal-preference-profile';
import { TripPlanningResponse } from './types';
import { PreferenceUpdateResult, VersionComparisonResult } from './preference-manager-service';

interface TripPreferencesContextType {
  profile: TripPreferenceProfile | null;
  activePlan: TripPlanningResponse | null;
  history: PreferenceVersionSnapshot[];
  isRecalculating: boolean;
  error: string | null;
  latestExplanation: ChangeExplanation | null;
  pendingConflicts: ChangeExplanation['conflictsDetected'] | null;
  initializeProfile: (initial?: Partial<TripPreferenceProfile['identity']>) => Promise<void>;
  updatePreferences: (
    patch: Record<string, any>,
    options?: { forceOverrideLocks?: boolean; customReason?: string }
  ) => Promise<PreferenceUpdateResult | null>;
  lockKey: (path: string) => Promise<void>;
  unlockKey: (path: string) => Promise<void>;
  undo: () => Promise<void>;
  restoreVersion: (version: number) => Promise<void>;
  compareVersions: (vA: number, vB: number) => Promise<VersionComparisonResult | null>;
  clearConflicts: () => void;
}

const TripPreferencesContext = createContext<TripPreferencesContextType | undefined>(undefined);

export function TripPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<TripPreferenceProfile | null>(null);
  const [activePlan, setActivePlan] = useState<TripPlanningResponse | null>(null);
  const [history, setHistory] = useState<PreferenceVersionSnapshot[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestExplanation, setLatestExplanation] = useState<ChangeExplanation | null>(null);
  const [pendingConflicts, setPendingConflicts] = useState<ChangeExplanation['conflictsDetected'] | null>(null);

  // Initialize or load existing profile
  const initializeProfile = useCallback(async (initial?: Partial<TripPreferenceProfile['identity']>) => {
    setIsRecalculating(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/trips/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE', initialData: initial }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize preference profile');
      }
      setProfile(data.data.profile);
      setActivePlan(data.data.plan);
      setLatestExplanation(null);
      setPendingConflicts(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRecalculating(false);
    }
  }, []);

  // Update preferences with atomic dependency recalculation
  const updatePreferences = useCallback(
    async (
      patch: Record<string, any>,
      options?: { forceOverrideLocks?: boolean; customReason?: string }
    ): Promise<PreferenceUpdateResult | null> => {
      if (!profile) return null;
      setIsRecalculating(true);
      setError(null);

      try {
        const res = await fetch('/api/v1/trips/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE',
            profileId: profile.id,
            patch,
            forceOverrideLocks: options?.forceOverrideLocks,
            customReason: options?.customReason,
          }),
        });

        const json = await res.json();

        // 409 Conflict: Locked preference violation
        if (res.status === 409 && json.data?.unresolvedConflicts) {
          setPendingConflicts(json.data.unresolvedConflicts);
          setLatestExplanation(json.data.explanation);
          setIsRecalculating(false);
          return json.data;
        }

        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to update preferences.');
        }

        const result: PreferenceUpdateResult = json.data;
        setProfile(result.profile);
        setActivePlan(result.plan);
        setLatestExplanation(result.explanation);
        setPendingConflicts(null);
        return result;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsRecalculating(false);
      }
    },
    [profile]
  );

  // Lock key
  const lockKey = useCallback(
    async (path: string) => {
      if (!profile) return;
      try {
        const res = await fetch('/api/v1/trips/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'LOCK', profileId: profile.id, path }),
        });
        const json = await res.json();
        if (json.success && json.data?.profile) {
          setProfile(json.data.profile);
        }
      } catch (err: any) {
        setError(err.message);
      }
    },
    [profile]
  );

  // Unlock key
  const unlockKey = useCallback(
    async (path: string) => {
      if (!profile) return;
      try {
        const res = await fetch('/api/v1/trips/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'UNLOCK', profileId: profile.id, path }),
        });
        const json = await res.json();
        if (json.success && json.data?.profile) {
          setProfile(json.data.profile);
        }
      } catch (err: any) {
        setError(err.message);
      }
    },
    [profile]
  );

  // Undo recent change
  const undo = useCallback(async () => {
    if (!profile) return;
    setIsRecalculating(true);
    try {
      const res = await fetch('/api/v1/trips/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UNDO', profileId: profile.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Undo operation failed.');
      }
      setProfile(json.data.profile);
      setActivePlan(json.data.plan);
      setLatestExplanation(json.data.explanation);
      setPendingConflicts(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRecalculating(false);
    }
  }, [profile]);

  // Restore specific version
  const restoreVersion = useCallback(
    async (version: number) => {
      if (!profile) return;
      setIsRecalculating(true);
      try {
        const res = await fetch('/api/v1/trips/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'RESTORE', profileId: profile.id, version }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || `Failed to restore version ${version}.`);
        }
        setProfile(json.data.profile);
        setActivePlan(json.data.plan);
        setLatestExplanation(json.data.explanation);
        setPendingConflicts(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsRecalculating(false);
      }
    },
    [profile]
  );

  // Compare versions
  const compareVersions = useCallback(
    async (vA: number, vB: number): Promise<VersionComparisonResult | null> => {
      if (!profile) return null;
      try {
        const res = await fetch('/api/v1/trips/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'COMPARE', profileId: profile.id, versionA: vA, versionB: vB }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Comparison failed.');
        }
        return json.data;
      } catch (err: any) {
        setError(err.message);
        return null;
      }
    },
    [profile]
  );

  const clearConflicts = useCallback(() => {
    setPendingConflicts(null);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      activePlan,
      history,
      isRecalculating,
      error,
      latestExplanation,
      pendingConflicts,
      initializeProfile,
      updatePreferences,
      lockKey,
      unlockKey,
      undo,
      restoreVersion,
      compareVersions,
      clearConflicts,
    }),
    [
      profile,
      activePlan,
      history,
      isRecalculating,
      error,
      latestExplanation,
      pendingConflicts,
      initializeProfile,
      updatePreferences,
      lockKey,
      unlockKey,
      undo,
      restoreVersion,
      compareVersions,
      clearConflicts,
    ]
  );

  return <TripPreferencesContext.Provider value={value}>{children}</TripPreferencesContext.Provider>;
}

export function useTripPreferences() {
  const context = useContext(TripPreferencesContext);
  if (!context) {
    throw new Error('useTripPreferences must be used within a TripPreferencesProvider');
  }
  return context;
}

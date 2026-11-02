'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { DiwaliCampaignConfig } from './diwali-campaign-store';

interface DiwaliContextValue {
  isDiwaliActive: boolean;
  campaign: DiwaliCampaignConfig | null;
  loading: boolean;
  showGreetingModal: boolean;
  dismissGreetingModal: () => void;
  reducedMotion: boolean;
  refreshCampaign: () => Promise<void>;
}

const DiwaliContext = createContext<DiwaliContextValue>({
  isDiwaliActive: true,
  campaign: null,
  loading: true,
  showGreetingModal: false,
  dismissGreetingModal: () => {},
  reducedMotion: false,
  refreshCampaign: async () => {},
});

const GREETING_STORAGE_KEY = 'by_diwali_greeted_2026';

export function DiwaliProvider({ children }: { children: React.ReactNode }) {
  const [campaign, setCampaign] = useState<DiwaliCampaignConfig | null>(null);
  const [isDiwaliActive, setIsDiwaliActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [showGreetingModal, setShowGreetingModal] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const pathname = usePathname();

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns/diwali');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setIsDiwaliActive(Boolean(json.isActive));
          setCampaign(json.config);

          // Evaluate once-per-visitor festive popup (never on booking/checkout routes)
          if (
            json.isActive &&
            json.config?.popup?.isEnabled &&
            typeof window !== 'undefined'
          ) {
            const hasGreeted = localStorage.getItem(GREETING_STORAGE_KEY);
            const isBookingFlow =
              pathname?.includes('/checkout') ||
              pathname?.includes('/pay') ||
              pathname?.includes('/settle') ||
              pathname?.includes('/admin') ||
              pathname?.includes('/supplier');

            if (!hasGreeted && !isBookingFlow) {
              // Delay slightly so visitor experiences landing smoothly
              setTimeout(() => {
                setShowGreetingModal(true);
              }, 1400);
            }
          }
        }
      }
    } catch {
      // Offline fallback: keep default active during Diwali window
      setIsDiwaliActive(true);
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const dismissGreetingModal = useCallback(() => {
    setShowGreetingModal(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(GREETING_STORAGE_KEY, 'true');
      } catch {}
    }
  }, []);

  return (
    <DiwaliContext.Provider
      value={{
        isDiwaliActive,
        campaign,
        loading,
        showGreetingModal,
        dismissGreetingModal,
        reducedMotion,
        refreshCampaign: fetchCampaign,
      }}
    >
      {children}
    </DiwaliContext.Provider>
  );
}

export function useDiwali() {
  return useContext(DiwaliContext);
}

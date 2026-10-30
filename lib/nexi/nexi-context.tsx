'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface NexiContextType {
  isOpen: boolean;
  openNexi: (initialMessage?: string) => void;
  closeNexi: () => void;
  toggleNexi: () => void;
  pendingPrompt?: string | null;
  clearPendingPrompt: () => void;
}

const NexiContext = createContext<NexiContextType>({
  isOpen: false,
  openNexi: () => {},
  closeNexi: () => {},
  toggleNexi: () => {},
  pendingPrompt: null,
  clearPendingPrompt: () => {},
});

export function NexiProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const openNexi = useCallback((initialMessage?: string) => {
    if (initialMessage) {
      setPendingPrompt(initialMessage);
    }
    setIsOpen(true);
  }, []);

  const closeNexi = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleNexi = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearPendingPrompt = useCallback(() => {
    setPendingPrompt(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openNexi,
      closeNexi,
      toggleNexi,
      pendingPrompt,
      clearPendingPrompt,
    }),
    [isOpen, pendingPrompt, openNexi, closeNexi, toggleNexi, clearPendingPrompt]
  );

  return <NexiContext.Provider value={value}>{children}</NexiContext.Provider>;
}

export function useNexi(): NexiContextType {
  const context = useContext(NexiContext);
  if (!context) {
    throw new Error('useNexi must be used within a NexiProvider');
  }
  return context;
}


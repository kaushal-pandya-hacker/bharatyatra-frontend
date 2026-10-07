'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

interface DestinationSelectionContextType {
  selectedDestinations: SelectedDestination[];
  toggleDestination: (dest: SelectedDestination) => void;
  addDestination: (dest: SelectedDestination) => void;
  removeDestination: (id: string) => void;
  clearSelection: () => void;
  isDestinationSelected: (idOrName: string) => boolean;
  selectedCount: number;
  uniqueStatesCount: number;
  destinationsByState: Record<string, SelectedDestination[]>;
}

const STORAGE_KEY = 'bharatyatra_selected_destinations';

const DestinationSelectionContext = createContext<DestinationSelectionContextType | undefined>(undefined);

export function DestinationSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedDestinations, setSelectedDestinations] = useState<SelectedDestination[]>([]);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedDestinations(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load selected destinations from localStorage:', e);
    }
  }, []);

  // Save changes to localStorage
  const saveToStorage = (items: SelectedDestination[]) => {
    setSelectedDestinations(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save selected destinations to localStorage:', e);
    }
  };

  const isDestinationSelected = (idOrName: string): boolean => {
    if (!idOrName) return false;
    const targetNorm = idOrName.toLowerCase().trim();
    return selectedDestinations.some(
      (d) =>
        d.id.toLowerCase().trim() === targetNorm ||
        d.slug.toLowerCase().trim() === targetNorm ||
        d.name.toLowerCase().trim() === targetNorm ||
        (d.displayName && d.displayName.toLowerCase().trim() === targetNorm)
    );
  };

  const addDestination = (dest: SelectedDestination) => {
    if (isDestinationSelected(dest.id || dest.name)) return;
    const updated = [...selectedDestinations, dest];
    saveToStorage(updated);
  };

  const removeDestination = (idOrName: string) => {
    const targetNorm = idOrName.toLowerCase().trim();
    const updated = selectedDestinations.filter(
      (d) =>
        d.id.toLowerCase().trim() !== targetNorm &&
        d.slug.toLowerCase().trim() !== targetNorm &&
        d.name.toLowerCase().trim() !== targetNorm &&
        (!d.displayName || d.displayName.toLowerCase().trim() !== targetNorm)
    );
    saveToStorage(updated);
  };

  const toggleDestination = (dest: SelectedDestination) => {
    if (isDestinationSelected(dest.id || dest.name)) {
      removeDestination(dest.id || dest.name);
    } else {
      addDestination(dest);
    }
  };

  const clearSelection = () => {
    saveToStorage([]);
  };

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
        toggleDestination,
        addDestination,
        removeDestination,
        clearSelection,
        isDestinationSelected,
        selectedCount: selectedDestinations.length,
        uniqueStatesCount,
        destinationsByState,
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

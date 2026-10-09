'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Trash2, X, ChevronUp, MapPin, Check, Plus, Globe, ArrowRight } from 'lucide-react';
import { useDestinationSelection, SelectedDestination } from '@/lib/tourism/destination-selection-context';
import AITripPersonalizationModal from '@/components/travel/AITripPersonalizationModal';

export default function GlobalDestinationSelectionBar() {
  const pathname = usePathname();

  const {
    selectedDestinations,
    selectedCount,
    uniqueStatesCount,
    destinationsByState,
    removeDestination,
    clearSelection,
  } = useDestinationSelection();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Only display the destination selection bar on destinations, plan, my-trips, and dashboard pages
  const isRelevantPage = 
    pathname?.startsWith('/destinations') ||
    pathname?.startsWith('/explore') ||
    pathname?.startsWith('/plan') ||
    pathname?.startsWith('/my-trips') ||
    pathname?.startsWith('/dashboard');

  if (!isRelevantPage || selectedCount === 0) return null;

  return (
    <>
      {/* Floating Selection Bar (Sticky Bottom Bar - Styled Premium Glassmorphism) */}
      <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-40 max-w-2xl w-full bg-slate-950/95 border border-amber-400/50 rounded-2xl shadow-2xl p-3 sm:p-4 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left info badge */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md text-sm border border-amber-300/50">
              {selectedCount}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white">
                  {selectedCount} {selectedCount === 1 ? 'Place' : 'Places'} Selected
                </span>
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {uniqueStatesCount} {uniqueStatesCount === 1 ? 'State' : 'States'}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-xs sm:max-w-sm font-medium">
                {selectedDestinations.map((p) => p.name).join(' • ')}
              </p>
            </div>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-xs font-extrabold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>View Picks</span>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 px-4 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-2 text-xs uppercase tracking-wider group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>Plan with AI</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Modal: View Selection */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 text-white flex flex-col h-full shadow-2xl">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-lg font-black text-white">Your Trip Picks</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {selectedCount} {selectedCount === 1 ? 'place' : 'places'} selected across {uniqueStatesCount} {uniqueStatesCount === 1 ? 'state' : 'states'}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Grouped by State */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {Object.entries(destinationsByState).map(([stateName, places]) => (
                <div key={stateName} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-400/20 pb-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{stateName} ({places.length})</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {places.map((place) => (
                      <div
                        key={place.id || place.slug}
                        className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-amber-400/40 transition group"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          {place.imageUrl && (
                            <img
                              src={place.imageUrl}
                              alt={place.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-700"
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">
                              {place.displayName || place.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{place.location || place.stateName}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeDestination(place.id || place.name)}
                          className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition shrink-0 cursor-pointer"
                          title="Remove from trip"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-900 space-y-3">
              {showClearConfirm ? (
                <div className="flex items-center justify-between bg-red-950/60 border border-red-500/40 p-3 rounded-xl">
                  <span className="text-xs font-bold text-red-200">Clear all {selectedCount} places?</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        clearSelection();
                        setShowClearConfirm(false);
                        setIsDrawerOpen(false);
                      }}
                      className="text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="text-xs font-bold text-slate-300 hover:text-white px-2 py-1.5 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-slate-400 hover:text-red-400 font-bold flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>

                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add More Places</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsAIModalOpen(true);
                }}
                className="w-full font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 py-3 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Plan with BharatYatra AI ✨</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI Trip Personalization Modal */}
      {isAIModalOpen && (
        <AITripPersonalizationModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
        />
      )}
    </>
  );
}

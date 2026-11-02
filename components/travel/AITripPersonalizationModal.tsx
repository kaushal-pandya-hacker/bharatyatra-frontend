'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDiwali } from '@/lib/campaigns/diwali-context';
import {
  Sparkles,
  X,
  Check,
  Calendar,
  Users,
  DollarSign,
  Compass,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Navigation,
  Car,
  Plane,
  Train,
  Bus,
  Bike,
  Route,
  AlertTriangle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  Wallet,
  Activity,
  Award,
  Plus,
  Minus,
} from 'lucide-react';
import { useDestinationSelection } from '@/lib/tourism/destination-selection-context';
import { searchCities, CityItem } from '@/lib/data/indian-cities';
import { fetchUserTravelProfile } from '@/lib/profile/travel-profile';
import {
  TripDurationRecommendationOutput,
  CustomizeDurationOutput,
  TravelMode,
  TravelPace,
} from '@/lib/ai-planner/trip-duration-intelligence-engine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = 'PREFERENCES' | 'CALCULATING' | 'RECOMMENDATION';

export default function AITripPersonalizationModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { selectedDestinations, selectedCount, uniqueStatesCount } = useDestinationSelection();
  const { isDiwaliActive } = useDiwali();

  // Location & Trip Starting States
  const [startLocation, setStartLocation] = useState<string>('Ahmedabad, Gujarat');
  const [endLocation, setEndLocation] = useState<string>('Return to Start Location');
  const [originSearchQuery, setOriginSearchQuery] = useState<string>('Ahmedabad, Gujarat');
  const [originSuggestions, setOriginSuggestions] = useState<CityItem[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState<boolean>(false);

  // Preference States
  const [travelMode, setTravelMode] = useState<TravelMode>('car');
  const [budgetTier, setBudgetTier] = useState<'budget' | 'balanced' | 'luxury'>('balanced');
  const [travelPace, setTravelPace] = useState<TravelPace>('balanced');
  const [paxCount, setPaxCount] = useState<number>(2);
  const [hasSeniors, setHasSeniors] = useState<boolean>(false);
  const [hasChildren, setHasChildren] = useState<boolean>(false);

  // Modal Workflow View
  const [currentView, setCurrentView] = useState<ModalView>('PREFERENCES');
  const [calculatingStep, setCalculatingStep] = useState<number>(0);

  // AI Duration Recommendation State
  const [recommendation, setRecommendation] = useState<TripDurationRecommendationOutput | null>(null);
  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(5);
  const [selectedTier, setSelectedTier] = useState<'recommended' | 'minimum' | 'relaxed' | 'custom'>('recommended');
  const [customizationResult, setCustomizationResult] = useState<CustomizeDurationOutput | null>(null);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load User's persistent travel profile origin on mount
  useEffect(() => {
    async function loadProfileOrigin() {
      try {
        const prof = await fetchUserTravelProfile();
        if (prof && prof.origin?.city) {
          const formatted = `${prof.origin.city}${prof.origin.state ? `, ${prof.origin.state}` : ''}`;
          setStartLocation(formatted);
          setOriginSearchQuery(formatted);
        }
        if (prof?.typicalTravelers) {
          setPaxCount(prof.typicalTravelers);
        }
      } catch (e) {}
    }
    loadProfileOrigin();
  }, []);

  const handleOriginSearch = (query: string) => {
    setOriginSearchQuery(query);
    setStartLocation(query);
    if (query.trim().length > 0) {
      setOriginSuggestions(searchCities(query));
      setShowOriginDropdown(true);
    } else {
      setOriginSuggestions([]);
      setShowOriginDropdown(false);
    }
  };

  const selectOriginCity = (city: CityItem) => {
    const formatted = `${city.city}, ${city.state}`;
    setStartLocation(formatted);
    setOriginSearchQuery(formatted);
    setShowOriginDropdown(false);
  };

  const calculationSteps = [
    `Analyzing geographical coordinates across ${selectedCount} target ${selectedCount === 1 ? 'place' : 'places'}`,
    `Evaluating nationwide corridor distances and terrain detour multipliers`,
    `Computing door-to-door transit logistics for ${travelMode.toUpperCase()}`,
    `Balancing daily sightseeing density, meals, and fatigue buffers`,
    `Generating personalized multi-tier trip duration recommendation`,
  ];

  // Trigger AI Duration Recommendation Calculation
  const handleCalculateRecommendation = async () => {
    if (selectedDestinations.length === 0) {
      setErrorMessage('Please select at least one destination to generate an itinerary.');
      return;
    }

    setErrorMessage(null);
    setCurrentView('CALCULATING');
    setCalculatingStep(0);

    const stepInterval = setInterval(() => {
      setCalculatingStep((prev) => (prev < calculationSteps.length - 1 ? prev + 1 : prev));
    }, 280);

    try {
      const destNames = selectedDestinations.map((d) => d.name || d.displayName);
      const res = await fetch('/api/trips/recommend-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: startLocation,
          destinations: destNames,
          travelMode,
          travelPace,
          travellers: paxCount,
          hasSeniors,
          hasChildren,
          budget: budgetTier === 'budget' ? 18000 : budgetTier === 'luxury' ? 65000 : 35000,
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error('Failed to calculate intelligent trip duration recommendation.');
      }

      const data: TripDurationRecommendationOutput = await res.json();
      setRecommendation(data);
      setSelectedDurationDays(data.recommendedDuration.days);
      setSelectedTier('recommended');
      setIsCustomizing(false);
      setCustomizationResult(null);
      setCurrentView('RECOMMENDATION');
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || 'Unable to calculate duration recommendation. Please try again.');
      setCurrentView('PREFERENCES');
    }
  };

  // Handle Duration Tier Selection
  const handleSelectTier = (tier: 'recommended' | 'minimum' | 'relaxed') => {
    if (!recommendation) return;
    setSelectedTier(tier);
    setIsCustomizing(false);

    let days = recommendation.recommendedDuration.days;
    if (tier === 'minimum') days = recommendation.minimumDuration.days;
    if (tier === 'relaxed') days = recommendation.relaxedDuration.days;

    setSelectedDurationDays(days);
    handleRecalculateCustomDays(days);
  };

  // Recalculate itinerary and pricing when custom days change
  const handleRecalculateCustomDays = async (days: number) => {
    setSelectedDurationDays(days);
    if (!recommendation) return;

    try {
      const destNames = selectedDestinations.map((d) => d.name || d.displayName);
      const res = await fetch('/api/trips/customize-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: startLocation,
          destinations: destNames,
          customDays: days,
          travelMode,
          travelPace,
          travellers: paxCount,
          hasSeniors,
          hasChildren,
          budget: budgetTier === 'budget' ? 18000 : budgetTier === 'luxury' ? 65000 : 35000,
        }),
      });

      if (res.ok) {
        const data: CustomizeDurationOutput = await res.json();
        setCustomizationResult(data);
      }
    } catch (e) {
      console.error('Error updating custom duration:', e);
    }
  };

  // Final Action: Accept & Navigate to Itinerary Plan Page
  const handleAcceptAndBuildItinerary = () => {
    const destNames = selectedDestinations.map((d) => d.displayName || d.name).join(', ');
    const targetUrl = `/plan?destination=${encodeURIComponent(destNames)}&origin=${encodeURIComponent(
      startLocation
    )}&endCity=${encodeURIComponent(endLocation)}&duration=${selectedDurationDays}&pax=${paxCount}&tier=${budgetTier}&pace=${travelPace}&mode=${travelMode}`;

    onClose();
    router.push(targetUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A1128] border border-amber-400/40 text-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#2A3656] bg-[#141A32] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Personalize Your AI Journey</h2>
                {isDiwaliActive && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/60 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <span>🪔 Diwali Special</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-300 font-medium">
                {selectedCount} selected places across {uniqueStatesCount} {uniqueStatesCount === 1 ? 'state' : 'states'}
              </p>
            </div>
          </div>
          {currentView !== 'CALCULATING' && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. CALCULATING VIEW */}
          {currentView === 'CALCULATING' && (
            <div className="py-10 text-center space-y-8">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400/40 flex items-center justify-center animate-ping absolute inset-0" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl relative z-10">
                  <Sparkles className="w-9 h-9 animate-spin text-slate-950" style={{ animationDuration: '3s' }} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white mb-2">Calculating Your Ideal Journey</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  BharatYatra AI is analyzing geographic distance, travel speeds, attraction density, and return buffers to recommend the perfect duration.
                </p>
              </div>

              {/* Progress Step Checklist */}
              <div className="max-w-md mx-auto space-y-3 bg-[#141A32] p-5 rounded-2xl border border-[#2A3656] text-left">
                {calculationSteps.map((stepText, idx) => {
                  const isDone = idx < calculatingStep;
                  const isCurrent = idx === calculatingStep;
                  return (
                    <div key={idx} className="flex items-center space-x-3 text-xs transition-colors">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span
                        className={`font-semibold ${
                          isDone
                            ? 'text-emerald-400'
                            : isCurrent
                            ? 'text-amber-300 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. PREFERENCES SELECTION VIEW (Zero Old Duration Selector!) */}
          {currentView === 'PREFERENCES' && (
            <>
              {/* Target Places Included in AI Plan */}
              <div className="bg-[#141A32] p-4 rounded-2xl border border-amber-400/30 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Target Places Included in AI Plan:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDestinations.map((d) => (
                    <span
                      key={d.id || d.slug}
                      className="text-xs font-bold text-white bg-[#0A1128] px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>
                        {d.name} ({d.stateName})
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Start & End Location Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#141A32] p-4 rounded-2xl border border-amber-400/30">
                {/* 1. Trip Starting Location */}
                <div className="relative">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1.5 flex items-center space-x-1">
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>1. Trip Starting Place (Origin)</span>
                  </label>
                  <input
                    type="text"
                    value={originSearchQuery}
                    onChange={(e) => handleOriginSearch(e.target.value)}
                    onFocus={() => setShowOriginDropdown(originSuggestions.length > 0)}
                    placeholder="Search start city (e.g. Ahmedabad, Surat, Mumbai)..."
                    className="w-full bg-[#0A1128] border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {showOriginDropdown && originSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#0A1128] border border-amber-400/50 rounded-xl shadow-2xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-800 p-1">
                      {originSuggestions.map((c) => (
                        <button
                          key={`${c.city}-${c.state}`}
                          type="button"
                          onClick={() => selectOriginCity(c)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs transition"
                        >
                          <span className="font-bold text-white">
                            {c.city} ({c.state})
                          </span>
                          <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                            Set Origin
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Trip Ending Location */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1.5 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. Trip Ending Place (Destination)</span>
                  </label>
                  <select
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    className="w-full bg-[#0A1128] border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Return to Start Location">
                      🔄 Return to {startLocation.split(',')[0]} (Round Trip)
                    </option>
                    {selectedDestinations.map((d) => (
                      <option key={d.id || d.name} value={d.name}>
                        🏁 End at {d.name} ({d.stateName})
                      </option>
                    ))}
                    <option value="Ahmedabad">🏁 End at Ahmedabad</option>
                    <option value="Surat">🏁 End at Surat</option>
                    <option value="Vadodara">🏁 End at Vadodara</option>
                    <option value="Mumbai">🏁 End at Mumbai</option>
                    <option value="Delhi">🏁 End at Delhi</option>
                  </select>
                </div>
              </div>

              {/* Transportation Mode Preference */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Route className="w-3.5 h-3.5 text-amber-400" />
                  <span>Preferred Mode of Travel</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'car', icon: Car, label: 'Road Trip' },
                    { id: 'flight', icon: Plane, label: 'Flight' },
                    { id: 'train', icon: Train, label: 'Express Rail' },
                    { id: 'bus', icon: Bus, label: 'Bus' },
                    { id: 'motorcycle', icon: Bike, label: 'Bike Ride' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isActive = travelMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTravelMode(m.id as TravelMode)}
                        className={`p-2.5 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-md'
                            : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[11px] font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Tier */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Budget Tier</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'budget', label: 'Budget', desc: 'Hostels & Local Transit' },
                    { id: 'balanced', label: 'Balanced', desc: '3★ Hotels & Private Cab' },
                    { id: 'luxury', label: 'Luxury', desc: '5★ Resorts & Express Transit' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setBudgetTier(tier.id as any)}
                      className={`p-3 rounded-xl text-left border transition ${
                        budgetTier === tier.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{tier.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Pace */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Travel Pace</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'relaxed', label: 'Relaxed', desc: 'Leisurely & Few Places/Day' },
                    { id: 'balanced', label: 'Balanced', desc: 'Optimal Sightseeing' },
                    { id: 'active', label: 'Active', desc: 'Cover Max Highlights' },
                  ].map((pace) => (
                    <button
                      key={pace.id}
                      type="button"
                      onClick={() => setTravelPace(pace.id as any)}
                      className={`p-3 rounded-xl text-left border transition ${
                        travelPace === pace.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{pace.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{pace.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Travellers & Accessibility Buffers */}
              <div className="bg-[#141A32] p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Travel Group Size</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-extrabold text-white px-2">{paxCount} Travelers</span>
                    <button
                      type="button"
                      onClick={() => setPaxCount(paxCount + 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 border-t border-slate-800">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSeniors}
                      onChange={(e) => setHasSeniors(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-400"
                    />
                    Traveling with Senior Citizens (Allocates relaxed rest breaks)
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasChildren}
                      onChange={(e) => setHasChildren(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-400"
                    />
                    Traveling with Children
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}

          {/* 3. YOUR AI TRIP RECOMMENDATION VIEW (Section 4 & 5 of user prompt) */}
          {currentView === 'RECOMMENDATION' && recommendation && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Route Summary Banner */}
              <div className="bg-[#141A32] p-4 rounded-2xl border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Calculated Route Corridor
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    {startLocation.split(',')[0]} →{' '}
                    {recommendation.destinations.map((d) => d.name).join(' → ')}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <span>{recommendation.travelTime.totalDistanceKm} km Total Distance</span>
                    <span>•</span>
                    <span>~{recommendation.travelTime.totalTransitHours.toFixed(1)}h In-Transit</span>
                    <span>•</span>
                    <span className="uppercase text-amber-400 font-semibold">{travelMode}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView('PREFERENCES')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 self-start sm:self-center transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Adjust Inputs
                </button>
              </div>

              {/* High Altitude / Island Warnings */}
              {recommendation.warnings && recommendation.warnings.length > 0 && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Route & Transit Advisories
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {recommendation.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ✨ Recommended Duration Card (Section 4 Example UI) */}
              <div className="bg-gradient-to-b from-amber-950/40 via-[#141A32] to-[#0A1128] border-2 border-amber-400 rounded-2xl p-5 shadow-xl relative">
                <div className="absolute -top-3 left-5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-slate-950" /> AI Recommended Duration
                </div>

                <div className="pt-2">
                  <div className="text-3xl font-black text-white">
                    {recommendation.recommendedDuration.days} Days / {recommendation.recommendedDuration.nights} Nights
                  </div>
                  <p className="text-xs text-amber-300 mt-1 font-semibold">
                    Best-balanced itinerary based on real route geometry and landmark exploration.
                  </p>

                  {/* Why we recommend this */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Why we recommend this:
                    </span>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                      {recommendation.reasoning.slice(0, 4).map((r, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Other Duration Options Quick Tiers */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 block">
                  Compare Duration Options:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Minimum */}
                  <button
                    type="button"
                    onClick={() => handleSelectTier('minimum')}
                    className={`p-3 rounded-xl text-left border transition ${
                      selectedTier === 'minimum' && !isCustomizing
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/40'
                        : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400">Minimum</div>
                    <div className="text-sm font-extrabold mt-0.5">
                      {recommendation.minimumDuration.days} Days
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">Core highlights only</div>
                  </button>

                  {/* Recommended */}
                  <button
                    type="button"
                    onClick={() => handleSelectTier('recommended')}
                    className={`p-3 rounded-xl text-left border transition ${
                      selectedTier === 'recommended' && !isCustomizing
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-extrabold shadow-md ring-2 ring-amber-400/40'
                        : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold opacity-80">Recommended</div>
                    <div className="text-sm font-extrabold mt-0.5">
                      {recommendation.recommendedDuration.days} Days
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">Optimal balance</div>
                  </button>

                  {/* Relaxed */}
                  <button
                    type="button"
                    onClick={() => handleSelectTier('relaxed')}
                    className={`p-3 rounded-xl text-left border transition ${
                      selectedTier === 'relaxed' && !isCustomizing
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/40'
                        : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400">Relaxed</div>
                    <div className="text-sm font-extrabold mt-0.5">
                      {recommendation.relaxedDuration.days} Days
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">Slow travel & leisure</div>
                  </button>
                </div>
              </div>

              {/* Customize Duration Interface (Section 5) */}
              <div className="bg-[#141A32] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Customize Duration</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Min: {recommendation.minimumDuration.days}d • Rec: {recommendation.recommendedDuration.days}d • Max:{' '}
                    {recommendation.relaxedDuration.days + 4}d
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomizing(true);
                      setSelectedTier('custom');
                      handleRecalculateCustomDays(Math.max(1, selectedDurationDays - 1));
                    }}
                    className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center font-black transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 text-center bg-[#0A1128] py-2 px-3 rounded-xl border border-slate-700">
                    <span className="text-lg font-black text-amber-300">
                      {selectedDurationDays} Days / {Math.max(1, selectedDurationDays - 1)} Nights
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomizing(true);
                      setSelectedTier('custom');
                      handleRecalculateCustomDays(selectedDurationDays + 1);
                    }}
                    className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center font-black transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Real-time Feasibility & Pricing Feedback */}
                {selectedDurationDays < recommendation.minimumDuration.days ? (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      Duration is below minimum feasible limit ({recommendation.minimumDuration.days} days). High risk of
                      exhaustion and rushed transitions.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Feasible itinerary schedule
                    </span>
                    <span>
                      Est. Cost: ₹
                      {(
                        customizationResult?.budgetEstimate.totalGroupCost ||
                        recommendation.budgetEstimate.totalGroupCost
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-[#2A3656] bg-[#141A32] flex items-center justify-between">
          {currentView === 'PREFERENCES' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-400 hover:text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition"
              >
                Back to Browsing
              </button>

              <button
                type="button"
                onClick={handleCalculateRecommendation}
                className="font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-6 py-3 rounded-xl transition shadow-xl flex items-center space-x-2 text-xs uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Generate AI Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {currentView === 'RECOMMENDATION' && (
            <>
              <button
                type="button"
                onClick={() => setCurrentView('PREFERENCES')}
                className="text-xs font-bold text-slate-400 hover:text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition"
              >
                ← Edit Preferences
              </button>

              <button
                type="button"
                onClick={handleAcceptAndBuildItinerary}
                className="font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-6 py-3 rounded-xl transition shadow-xl flex items-center space-x-2 text-xs uppercase tracking-wider"
              >
                <span>Accept &amp; Build My Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

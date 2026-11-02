'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Info,
  Layers,
  Plane,
  Train,
  Car,
  Bus,
  Bike,
  Sun,
  ShieldAlert,
  Plus,
  X,
  Users,
  Wallet,
  Activity,
  Award,
} from 'lucide-react';
import {
  TripDurationRecommendationOutput,
  TravelMode,
  TravelPace,
} from '@/lib/ai-planner/trip-duration-intelligence-engine';

interface SmartDestinationDurationPlannerProps {
  initialOrigin?: string;
  initialDestination?: string;
  className?: string;
}

export function SmartDestinationDurationPlanner({
  initialOrigin = 'Ahmedabad',
  initialDestination = '',
  className = '',
}: SmartDestinationDurationPlannerProps) {
  // Input Step States
  const [origin, setOrigin] = useState<string>(initialOrigin);
  const [destinationInput, setDestinationInput] = useState<string>(initialDestination);
  const [destinations, setDestinations] = useState<string[]>(
    initialDestination ? [initialDestination] : []
  );
  const [travelMode, setTravelMode] = useState<TravelMode>('car');
  const [pace, setPace] = useState<TravelPace>('balanced');
  const [travellers, setTravellers] = useState<number>(2);
  const [hasSeniors, setHasSeniors] = useState<boolean>(false);
  const [hasChildren, setHasChildren] = useState<boolean>(false);
  const [budget, setBudget] = useState<number>(35000);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    'Heritage & Culture',
    'Scenic Sightseeing',
  ]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Recommendation Output State
  const [recommendation, setRecommendation] = useState<TripDurationRecommendationOutput | null>(null);
  const [selectedTier, setSelectedTier] = useState<'recommended' | 'minimum' | 'relaxed'>('recommended');
  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(5);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [customDays, setCustomDays] = useState<number>(5);

  const availablePreferences = [
    'Heritage & Culture',
    'Spiritual & Temples',
    'Wildlife & Nature',
    'Hill Stations',
    'Beaches & Coastal',
    'Adventure & Trekking',
    'Culinary & Street Food',
    'Photography',
  ];

  // Auto-analyze if initialDestination is provided on mount
  useEffect(() => {
    if (initialDestination && initialDestination.trim()) {
      const destList = initialDestination
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
      setDestinations(destList);
      triggerAnalysis(origin, destList);
    }
  }, [initialDestination]);

  const handleAddDestination = () => {
    const trimmed = destinationInput.trim();
    if (!trimmed) return;
    if (!destinations.includes(trimmed)) {
      setDestinations([...destinations, trimmed]);
    }
    setDestinationInput('');
  };

  const handleRemoveDestination = (indexToRemove: number) => {
    setDestinations(destinations.filter((_, idx) => idx !== indexToRemove));
  };

  const togglePreference = (pref: string) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  const triggerAnalysis = async (fromOrigin: string, destList: string[]) => {
    const listToAnalyze =
      destList.length > 0
        ? destList
        : destinationInput.trim()
        ? [destinationInput.trim()]
        : [];

    if (listToAnalyze.length === 0) {
      setError('Please add at least one destination to analyze your trip duration.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/trips/recommend-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: fromOrigin.trim() || 'Ahmedabad',
          destinations: listToAnalyze,
          travelMode,
          travelPace: pace,
          preferences: selectedPreferences,
          budget: budget > 0 ? budget : undefined,
          travellers,
          hasSeniors,
          hasChildren,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze destination geometry and calculate duration');
      }

      const data: TripDurationRecommendationOutput = await res.json();
      setRecommendation(data);
      setSelectedTier('recommended');
      setSelectedDurationDays(data.recommendedDuration.days);
      setCustomDays(data.recommendedDuration.days);
      setSelectedDayNumber(1);
    } catch (err: any) {
      setError(err.message || 'Unable to calculate duration recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierSelect = (tier: 'recommended' | 'minimum' | 'relaxed') => {
    if (!recommendation) return;
    setSelectedTier(tier);
    if (tier === 'recommended') {
      setSelectedDurationDays(recommendation.recommendedDuration.days);
      setCustomDays(recommendation.recommendedDuration.days);
    } else if (tier === 'minimum') {
      setSelectedDurationDays(recommendation.minimumDuration.days);
      setCustomDays(recommendation.minimumDuration.days);
    } else {
      setSelectedDurationDays(recommendation.relaxedDuration.days);
      setCustomDays(recommendation.relaxedDuration.days);
    }
    setSelectedDayNumber(1);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 1. Trip Configuration Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-teal-400 text-xs font-semibold tracking-wide uppercase mb-1">
                <Compass className="w-4 h-4" /> Adaptive Journey Architecture
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                How much time should we recommend for your journey?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Eliminates arbitrary 3/5/7/10-day packages. We calculate the exact duration needed based on route geometry,
                distance, sightseeing hours, rest, and terrain.
              </p>
            </div>
            {recommendation && (
              <button
                type="button"
                onClick={() => {
                  setRecommendation(null);
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start New Calculation
              </button>
            )}
          </div>

          {/* Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Origin */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-teal-400" /> Starting City / Hub
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Ahmedabad, Mumbai, Delhi, Surat"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
              />
            </div>

            {/* Destinations Input & Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> Destination(s) to Explore
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDestination();
                    }
                  }}
                  placeholder="e.g. Udaipur, Statue of Unity, Leh, Goa"
                  className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={handleAddDestination}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold border border-slate-700 flex items-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Destination Badges */}
              {destinations.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {destinations.map((dest, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      <MapPin className="w-3 h-3 text-blue-400" />
                      {dest}
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(idx)}
                        className="hover:text-red-400 transition ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mode & Pace & Travellers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            {/* Travel Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Transport Mode
              </label>
              <div className="grid grid-cols-5 gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                {(
                  [
                    { id: 'car', icon: Car, label: 'Car' },
                    { id: 'flight', icon: Plane, label: 'Flight' },
                    { id: 'train', icon: Train, label: 'Train' },
                    { id: 'bus', icon: Bus, label: 'Bus' },
                    { id: 'motorcycle', icon: Bike, label: 'Bike' },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon;
                  const isActive = travelMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTravelMode(m.id as TravelMode)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-medium transition ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Pace */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Exploration Pace
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                {(
                  [
                    { id: 'relaxed', label: 'Relaxed' },
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'active', label: 'Active' },
                  ] as const
                ).map((p) => {
                  const isActive = pace === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPace(p.id as TravelPace)}
                      className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travellers & Budget */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Travellers & Budget
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={travellers}
                    onChange={(e) => setTravellers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                    placeholder="People"
                  />
                  <span className="text-xs text-slate-400">pax</span>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step={5000}
                    min={5000}
                    value={budget}
                    onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                    placeholder="₹ Budget"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Senior & Child Flags + Preferences */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSeniors}
                  onChange={(e) => setHasSeniors(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-400 focus:ring-offset-0"
                />
                Travelling with Senior Citizens (Allows leisurely rest intervals)
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasChildren}
                  onChange={(e) => setHasChildren(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-400 focus:ring-offset-0"
                />
                Travelling with Children
              </label>
            </div>

            {/* Preference Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availablePreferences.map((pref) => {
                const isSelected = selectedPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePreference(pref)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Calculate Action Button */}
          <button
            type="button"
            onClick={() => triggerAnalysis(origin, destinations)}
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculating Ideal Duration & Logistics...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Calculate My Ideal Trip Duration
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Recommendation Results Display */}
      {recommendation && (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
          {/* Acclimatization / High Altitude Warning */}
          {recommendation.acclimatizationNotice && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Mandatory Altitude Acclimatization Buffer</p>
                <p className="mt-0.5 text-slate-300 leading-relaxed">{recommendation.acclimatizationNotice}</p>
              </div>
            </div>
          )}

          {/* Weather / Seasonal Warnings */}
          {recommendation.warnings && recommendation.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs sm:text-sm flex items-start gap-3">
              <Sun className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-300">Seasonal Route Advisory</p>
                <ul className="mt-1 space-y-1 text-slate-300 list-disc list-inside">
                  {recommendation.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* The 3 Adaptive Duration Tiers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" /> Duration Tiers Calculated for Your Journey
              </h3>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Click any option to view its day-by-day plan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recommended Tier (Default & Highlighted) */}
              <div
                onClick={() => handleTierSelect('recommended')}
                className={`relative rounded-2xl p-5 border cursor-pointer transition-all ${
                  selectedTier === 'recommended'
                    ? 'bg-gradient-to-b from-teal-950/60 to-slate-900 border-teal-500 ring-2 ring-teal-500/30 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="absolute -top-3 left-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Award className="w-3 h-3" /> Recommended (Best Balance)
                </div>
                <div className="pt-2">
                  <div className="text-3xl font-extrabold text-white">
                    {recommendation.recommendedDuration.days} Days / {recommendation.recommendedDuration.nights} Nights
                  </div>
                  <p className="text-xs text-teal-300 mt-1 font-medium">
                    Optimal balance of transit, key sights & leisure
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                    Provides door-to-door transit buffers, comprehensive landmark visits, and restful evening pacing.
                  </p>
                </div>
              </div>

              {/* Minimum Tier */}
              <div
                onClick={() => handleTierSelect('minimum')}
                className={`relative rounded-2xl p-5 border cursor-pointer transition-all ${
                  selectedTier === 'minimum'
                    ? 'bg-gradient-to-b from-blue-950/60 to-slate-900 border-blue-500 ring-2 ring-blue-500/30 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Minimum Feasible Duration
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {recommendation.minimumDuration.days} Days / {recommendation.minimumDuration.nights} Nights
                  </div>
                  <p className="text-xs text-blue-300 mt-1 font-medium">Focused highlights & core attractions</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                    Fast-paced itinerary with tighter transitions. Recommended only when travelling on limited leave.
                  </p>
                </div>
              </div>

              {/* Relaxed / Extended Tier */}
              <div
                onClick={() => handleTierSelect('relaxed')}
                className={`relative rounded-2xl p-5 border cursor-pointer transition-all ${
                  selectedTier === 'relaxed'
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Extended & Immersive
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {recommendation.relaxedDuration.days} Days / {recommendation.relaxedDuration.nights} Nights
                  </div>
                  <p className="text-xs text-indigo-300 mt-1 font-medium">Deep immersion & slow travel</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                    Additional time for offbeat detours, culinary trails, leisurely photography, and zero fatigue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Route & Transit Logistics Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" /> Route & Transit Logistics Analysis
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total Distance</span>
                <p className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {recommendation.travelTime.totalDistanceKm} km
                </p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400">Outbound Journey</span>
                <p className="text-base sm:text-lg font-bold text-teal-300 mt-0.5">
                  {recommendation.travelTime.outboundHours.toFixed(1)} hrs
                </p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400">Return Journey</span>
                <p className="text-base sm:text-lg font-bold text-teal-300 mt-0.5">
                  {recommendation.travelTime.returnHours.toFixed(1)} hrs
                </p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-[11px] text-slate-400">Total In-Transit</span>
                <p className="text-base sm:text-lg font-bold text-blue-300 mt-0.5">
                  {recommendation.travelTime.totalTransitHours.toFixed(1)} hrs
                </p>
              </div>
            </div>

            {/* AI Transparent Reasoning */}
            {recommendation.reasoning && recommendation.reasoning.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Why this duration was recommended:
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                  {recommendation.reasoning.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Budget Breakdown & Adaptation */}
          {recommendation.budgetEstimate && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" /> Realistic Cost & Budget Projection
                </h4>
                <div className="text-xs text-slate-400">
                  Estimated for {travellers} traveler{travellers > 1 ? 's' : ''} ({selectedDurationDays} days)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Transportation</span>
                  <p className="text-base font-bold text-white mt-0.5">
                    ₹{recommendation.budgetEstimate.breakdown.transportation.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Stay & Lodging</span>
                  <p className="text-base font-bold text-white mt-0.5">
                    ₹{recommendation.budgetEstimate.breakdown.accommodation.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Sights & Activities</span>
                  <p className="text-base font-bold text-white mt-0.5">
                    ₹{recommendation.budgetEstimate.breakdown.sightseeingAndActivities.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Meals & Buffer</span>
                  <p className="text-base font-bold text-white mt-0.5">
                    ₹{recommendation.budgetEstimate.breakdown.mealsAndContingency.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400">Total Group Estimate: </span>
                  <span className="font-extrabold text-white text-base">
                    ₹{recommendation.budgetEstimate.totalGroupCost.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 ml-2">
                    (₹{recommendation.budgetEstimate.perPersonCost.toLocaleString('en-IN')}/person)
                  </span>
                </div>
                {!recommendation.budgetEstimate.isWithinBudget && (
                  <div className="text-amber-400 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Exceeds specified budget by ₹{recommendation.budgetEstimate.budgetShortfall.toLocaleString('en-IN')}.
                    Consider switching to train/bus or selecting the Minimum Duration tier.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive Day-by-Day Itinerary Plan */}
          {recommendation.recommendedItinerary && recommendation.recommendedItinerary.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-400" /> Day-Wise Itinerary Plan Preview
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Structured with sensible sightseeing hours, meals, transfer times, and evening rest.
                  </p>
                </div>

                {/* Day selector tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {recommendation.recommendedItinerary.map((day) => (
                    <button
                      key={day.day}
                      type="button"
                      onClick={() => setSelectedDayNumber(day.day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedDayNumber === day.day
                          ? 'bg-teal-500 text-slate-950 font-bold shadow'
                          : 'bg-slate-950/70 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Day {day.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Day Content */}
              {(() => {
                const dayPlan =
                  recommendation.recommendedItinerary.find((d) => d.day === selectedDayNumber) ||
                  recommendation.recommendedItinerary[0];

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                          Day {dayPlan.day} • {dayPlan.location}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">{dayPlan.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Sightseeing: ~{dayPlan.estimatedSightseeingHours}h</span>
                        <span>•</span>
                        <span>Transit: ~{dayPlan.estimatedTransitHours}h</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Morning */}
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5" /> Morning Slot
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{dayPlan.morning}</p>
                      </div>

                      {/* Afternoon */}
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
                        <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5" /> Afternoon Slot
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{dayPlan.afternoon}</p>
                      </div>

                      {/* Evening */}
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
                        <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Evening & Leisure
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{dayPlan.evening}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 3. Duration Customizer Override */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" /> Need a Different Duration?
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  You can override our AI suggestion with your specific travel schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomizer(!showCustomizer)}
                className="text-xs font-medium text-teal-400 hover:text-teal-300 transition"
              >
                {showCustomizer ? 'Hide Customizer' : 'Customize Duration'}
              </button>
            </div>

            {showCustomizer && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={Math.max(1, recommendation.minimumDuration.days - 2)}
                    max={recommendation.relaxedDuration.days + 5}
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value))}
                    className="flex-1 accent-teal-400 cursor-pointer"
                  />
                  <span className="text-base font-bold text-white whitespace-nowrap">
                    {customDays} Days / {Math.max(0, customDays - 1)} Nights
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Customizing to {customDays} days will automatically re-allocate sightseeing, transit buffers, and
                  leisure stops across your itinerary.
                </p>
              </div>
            )}
          </div>

          {/* Action CTA: Proceed */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-blue-950/40 border border-teal-500/30">
            <div>
              <h4 className="text-base font-bold text-white">Ready to lock in this journey?</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Proceed with the {selectedTier === 'recommended' ? 'AI Recommended' : selectedTier} plan of{' '}
                {selectedDurationDays} days.
              </p>
            </div>
            <a
              href={`/contact?inquiry=trip-plan&origin=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(
                destinations.join(',')
              )}&days=${selectedDurationDays}&mode=${travelMode}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-400 text-slate-950 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-teal-500/20"
            >
              <span>Book & Finalize Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
export default SmartDestinationDurationPlanner;

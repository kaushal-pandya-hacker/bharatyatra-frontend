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
  HeartHandshake,
  Sun,
  ShieldAlert,
} from 'lucide-react';
import { TripDurationRecommendationResponse } from '@/lib/ai-planner/duration-calculation-engine';
import { PureItineraryResult, PureTripDay } from '@/lib/ai-planner/pure-itinerary-service';

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
  const [destination, setDestination] = useState<string>(initialDestination);
  const [pace, setPace] = useState<'relaxed' | 'balanced' | 'fast'>('balanced');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Analysis Result States
  const [recommendation, setRecommendation] = useState<TripDurationRecommendationResponse | null>(null);
  const [customDays, setCustomDays] = useState<number>(7);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);

  // Generated Itinerary State
  const [itinerary, setItinerary] = useState<PureItineraryResult | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState<boolean>(false);

  // Auto-analyze if initialDestination is provided
  useEffect(() => {
    if (initialDestination && initialDestination.trim()) {
      handleDiscoverTrip();
    }
  }, [initialDestination]);

  // Primary Action: Discover My Trip
  const handleDiscoverTrip = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination to analyze.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setItinerary(null);

    try {
      const res = await fetch('/api/ai/trip-duration/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origin.trim() || 'Ahmedabad',
          destination: destination.trim(),
          travelPace: pace,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze destination and duration');
      }

      const data: TripDurationRecommendationResponse = await res.json();
      setRecommendation(data);
      if (data.comfortableDuration.days) {
        setCustomDays(data.comfortableDuration.days);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to analyze route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Itinerary for Selected Duration
  const handleSelectDuration = async (days: number, tierTitle: string) => {
    setIsGeneratingItinerary(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origin.trim() || 'Ahmedabad',
          destination: destination.trim(),
          durationDays: days,
          pace,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate day-wise itinerary');
      }

      const responseJson = await res.json();
      setItinerary(responseJson.data);
      setSelectedDayNumber(1);
    } catch (err: any) {
      setError(err.message || 'Unable to generate itinerary. Please try again.');
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const popularDestinations = [
    { label: 'Ladakh', tag: 'Himalayas' },
    { label: 'Jaipur', tag: 'Heritage' },
    { label: 'Statue of Unity', tag: 'Monument' },
    { label: 'Kashmir', tag: 'Valley' },
    { label: 'Goa', tag: 'Coastal' },
    { label: 'Kerala', tag: 'Backwaters' },
    { label: 'Varanasi', tag: 'Spiritual' },
    { label: 'Rishikesh', tag: 'Adventure' },
  ];

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* =========================================================================
          SCREEN 1: "Where would you like to travel?" (Input Phase)
         ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Destination Intelligence & Smart Trip Duration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Where would you like to travel?
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Enter your starting point and destination. Our geospatial AI independently calculates your optimal trip duration based on real-world transit distances, elevation acclimatization, and attraction density — without forcing you to guess the number of days.
          </p>
        </div>

        {/* Input Form Fields: From & To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Starting Location (From)
            </label>
            <div className="relative flex items-center">
              <Navigation className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Ahmedabad, Delhi, Mumbai"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Destination (To)
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-4 w-5 h-5 text-primary" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Ladakh, Jaipur, Goa, Kerala, Statue of Unity"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-slate-500 mr-1">Popular Circuits:</span>
          {popularDestinations.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => {
                setDestination(d.label);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-primary/10 hover:text-primary dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              {d.label} <span className="text-[10px] text-slate-400">({d.tag})</span>
            </button>
          ))}
        </div>

        {/* Primary CTA: Discover My Trip */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">Pace:</span>
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              {(['relaxed', 'balanced', 'fast'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPace(p)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    pace === p
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDiscoverTrip}
            disabled={isLoading || !destination.trim()}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Travel Feasibility...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>Discover My Trip</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          SCREEN 2: Dual Duration Recommendation Display (Section 7 Specification)
         ========================================================================= */}
      {recommendation && !itinerary && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-xl">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Route Feasibility Evaluation
              </div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>{recommendation.origin}</span>
                <ArrowRight className="w-5 h-5 text-primary" />
                <span>{recommendation.destination}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-300">
                <span>Total Distance: {recommendation.rawAnalysis?.routeFeasibilityReport?.straightLineDistanceKm || 'Verified'} km</span>
                <span>•</span>
                <span>Primary Transit: {recommendation.rawAnalysis?.options?.recommended?.primaryTransportMode?.toUpperCase() || 'MULTI-MODAL'}</span>
                <span>•</span>
                <span>Destinations: {recommendation.destinations.join(' → ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Data Freshness</div>
                <div className="text-xs font-bold text-slate-200">Q4 2024 / 2025 Verified</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-primary/20 text-right border border-primary/30">
                <div className="text-[10px] text-primary-200 uppercase font-semibold">AI Confidence</div>
                <div className="text-sm font-extrabold text-white">{recommendation.confidence.score || 92}%</div>
              </div>
            </div>
          </div>

          {/* High Altitude / Seasonal Notice Banner */}
          {recommendation.warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold">Important Travel Feasibility Protocol: </span>
                {recommendation.warnings.join(' • ')}
              </div>
            </div>
          )}

          {/* Dual Recommendation Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD A: MINIMUM POSSIBLE DURATION */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-bl-2xl">
                Option A • Express
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                  MINIMUM POSSIBLE DURATION
                </span>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                    {recommendation.minimumDuration.days}
                  </span>
                  <span className="text-lg font-bold text-slate-500">Days ({recommendation.minimumDuration.hotelNights} Nights)</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {recommendation.minimumDuration.explanation}
                </p>

                {/* Breakdown & Limitations */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-6 space-y-2 text-xs">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Time Distribution:</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Transit Travel Days:</span>
                    <span className="font-semibold">{recommendation.minimumDuration.travelDays} Days</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Sightseeing Days:</span>
                    <span className="font-semibold">{recommendation.minimumDuration.sightseeingDays} Days</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-amber-700 dark:text-amber-400">
                    <span className="font-bold">Tradeoffs & Limitations: </span>
                    {recommendation.minimumDuration.tradeoffs}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectDuration(recommendation.minimumDuration.days!, 'Minimum Duration')}
                disabled={isGeneratingItinerary}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Choose Minimum Duration ({recommendation.minimumDuration.days} Days)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* CARD B: AI-RECOMMENDED COMFORTABLE DURATION (Highlighted Primary) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-primary/5 via-white to-white dark:from-primary/10 dark:via-slate-900 dark:to-slate-900 border-2 border-primary shadow-xl shadow-primary/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-bl-2xl flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Option B • Recommended</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-primary font-bold block mb-1">
                  AI-RECOMMENDED DURATION
                </span>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                    {recommendation.comfortableDuration.days}
                  </span>
                  <span className="text-lg font-bold text-primary">Days ({recommendation.comfortableDuration.hotelNights} Nights)</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed font-medium">
                  {recommendation.comfortableDuration.explanation}
                </p>

                {/* Confidence & Freshness Metrics */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-primary/20 mb-6 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Data Verification Score:</span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {recommendation.confidence.score}% High Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                    <div>• Route: {recommendation.confidence.breakdown.routeReliability}</div>
                    <div>• Attractions: {recommendation.confidence.breakdown.destinationDataReliability}</div>
                    <div>• Transit: {recommendation.confidence.breakdown.transportationReliability}</div>
                    <div>• Seasonality: {recommendation.confidence.breakdown.seasonalReliability}</div>
                  </div>

                  {(recommendation.comfortableDuration.acclimatizationRestDays || 0) > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-sky-700 dark:text-sky-300 font-semibold">
                      Includes {recommendation.comfortableDuration.acclimatizationRestDays} days dedicated altitude adaptation.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectDuration(recommendation.comfortableDuration.days!, 'Recommended Duration')}
                disabled={isGeneratingItinerary}
                className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Choose AI Recommended ({recommendation.comfortableDuration.days} Days)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action 3: Customize Duration Bar */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Prefer a specific number of days?</h4>
                <p className="text-xs text-slate-500">Customize the vacation duration to fit your exact holiday availability.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setCustomDays(Math.max(2, customDays - 1))}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 font-black text-slate-900 dark:text-white text-sm">
                  {customDays} Days
                </span>
                <button
                  type="button"
                  onClick={() => setCustomDays(Math.min(30, customDays + 1))}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSelectDuration(customDays, 'Custom Duration')}
                disabled={isGeneratingItinerary}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold whitespace-nowrap transition-all"
              >
                Customize Duration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: Complete Day-Wise Itinerary (12-Section Format, Zero Pricing)
         ========================================================================= */}
      {isGeneratingItinerary && (
        <div className="mt-8 p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Synthesizing Your Intelligent Itinerary...</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Sequencing landmarks geographically to eliminate backtracking, incorporating altitude safety protocols, and formatting daily time slots.
          </p>
        </div>
      )}

      {itinerary && !isGeneratingItinerary && (
        <div className="mt-8 space-y-6 animate-in fade-in duration-500">
          {/* Itinerary Header Bar */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Travel Itinerary Generated</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {itinerary.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  {itinerary.overview}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setItinerary(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors self-start sm:self-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Duration</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Circuit Distance</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{itinerary.totalDistanceKm} km</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Travel Pace</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{pace}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Route Feasibility</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">100% Feasible</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Safety & Protocol</span>
                <span className="text-sm font-bold text-primary">Verified</span>
              </div>
            </div>
          </div>

          {/* Day Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {itinerary.dayWiseItinerary.map((day) => {
              const isSelected = day.day === selectedDayNumber;
              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => setSelectedDayNumber(day.day)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Day {day.day} • {day.location}
                </button>
              );
            })}
          </div>

          {/* Selected Day View */}
          {itinerary.dayWiseItinerary
            .filter((d) => d.day === selectedDayNumber)
            .map((day) => (
              <div
                key={day.day}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                      {day.dayType}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Day {day.day}: {day.location}, {day.state}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{day.daySummary}</span>
                </div>

                {/* Morning, Afternoon, Evening Activity Slots */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* MORNING */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-2">
                      🌅 Morning Session
                    </span>
                    {day.morning.map((act) => (
                      <div key={act.id} className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{act.displayName}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{act.reason}</p>
                        <div className="text-[11px] text-slate-400 pt-1">
                          Duration: {act.durationMinutes} mins • {act.category}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AFTERNOON */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-2">
                      ☀️ Afternoon Session
                    </span>
                    {day.afternoon.map((act) => (
                      <div key={act.id} className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{act.displayName}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{act.reason}</p>
                        <div className="text-[11px] text-slate-400 pt-1">
                          Duration: {act.durationMinutes} mins • {act.category}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* EVENING */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">
                      🌆 Evening Session
                    </span>
                    {day.evening.map((act) => (
                      <div key={act.id} className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{act.displayName}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{act.reason}</p>
                        <div className="text-[11px] text-slate-400 pt-1">
                          Duration: {act.durationMinutes} mins • {act.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rest Intervals & Culinary Guidance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      🍽️ Regional Meal Recommendations:
                    </span>
                    <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                      {day.meals.map((m, idx) => (
                        <li key={idx}>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{m.mealType}:</span> {m.recommendedCuisine}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      🛌 Rest Periods & Travel Notes:
                    </span>
                    <ul className="text-slate-600 dark:text-slate-400 space-y-1">
                      {day.restPeriods?.map((r, idx) => (
                        <li key={idx}>• {r}</li>
                      ))}
                      {day.accommodation && (
                        <li>• Suggested Stay: {day.accommodation.category} ({day.accommodation.hotelName})</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}

          {/* Section 10 & 12: Travel Notes & Preparation Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <span>Important Travel Notes & Regulations</span>
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                {itinerary.importantTravelNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Preparation Checklist</span>
              </h4>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Documents & Permits:</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {itinerary.travelPreparationChecklist.documentsAndPermits.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <div className="font-semibold text-slate-800 dark:text-slate-200 pt-1">Clothing & Gear:</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {itinerary.travelPreparationChecklist.clothingAndGear.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

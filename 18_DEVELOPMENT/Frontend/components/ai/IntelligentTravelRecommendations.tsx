'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Heart,
  Bookmark,
  ThumbsDown,
  RotateCcw,
  Compass,
  Utensils,
  Hotel,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Info,
  Calendar,
  Check,
  ArrowRight,
  Layers,
  Zap,
  AlertCircle,
  Clock,
  Eye,
  Filter,
} from 'lucide-react';
import {
  UnifiedTravelRecommendations,
  DestinationRecommendation,
  AttractionRecommendation,
  AccommodationRecommendation,
  FoodExperienceRecommendation,
  CircuitRecommendation,
  AlternativeRecommendation,
  FeedbackAction,
} from '@/lib/ai-planner/travel-recommendation-engine';

interface IntelligentTravelRecommendationsProps {
  initialRecommendations: UnifiedTravelRecommendations;
  onSelectDestination?: (destinationName: string) => void;
  className?: string;
}

export function IntelligentTravelRecommendations({
  initialRecommendations,
  onSelectDestination,
  className = '',
}: IntelligentTravelRecommendationsProps) {
  const [data, setData] = useState<UnifiedTravelRecommendations>(initialRecommendations);
  const [activeTab, setActiveTab] = useState<
    'destinations' | 'attractions' | 'stays' | 'food' | 'circuits' | 'alternatives'
  >('destinations');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Record Feedback (LIKE, DISLIKE, SAVE, NOT_INTERESTED)
  const handleFeedback = async (
    itemType: 'destination' | 'attraction' | 'accommodation' | 'food' | 'circuit' | 'alternative',
    itemId: string,
    action: FeedbackAction,
    category?: string
  ) => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/v1/trips/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.userId,
          itemType,
          itemId,
          action,
          context: { category },
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        // Optimistically update card status in UI
        setData((prev) => ({
          ...prev,
          recommendedDestinations: prev.recommendedDestinations.map((d) => {
            if (d.destinationId === itemId) {
              return {
                ...d,
                isLiked: action === 'LIKE' ? !d.isLiked : d.isLiked,
                isSaved: action === 'SAVE' ? !d.isSaved : d.isSaved,
              };
            }
            return d;
          }),
        }));
      }
    } catch (err) {
      console.error('Failed to record feedback:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset Learned Personalization Signals
  const handleResetPersonalization = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/v1/trips/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.userId,
          action: 'RESET_PERSONALIZATION',
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setShowPersonalizationModal(false);
        // Refresh recommendations
        const refreshRes = await fetch(`/api/v1/trips/recommendations?userId=${data.userId}&origin=${data.originCity}`);
        const freshData = await refreshRes.json();
        if (freshData.success && freshData.data) {
          setData(freshData.data);
        }
      }
    } catch (err) {
      console.error('Failed to reset personalization:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered Destinations
  const filteredDestinations = data.recommendedDestinations.filter((dest) => {
    if (filterCategory === 'all') return true;
    return dest.recommendationCategory === filterCategory;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. MASTER HEADER & PERSONALIZATION SUMMARY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                BharatYatra Personalization Engine
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Precision: {Math.round(data.qualityMetrics.precisionAtK * 100)}% • NDCG: {Math.round(data.qualityMetrics.ndcgAtK * 100)}%
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Curated Travel Experiences for You
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Personalized from <strong>{data.originCity}</strong> • Travel Month: {new Date(2026, data.travelMonth - 1).toLocaleString('default', { month: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPersonalizationModal(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Signals & Privacy
            </button>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 scrollbar-thin">
          {[
            { key: 'destinations', label: 'Destinations', count: data.recommendedDestinations.length, icon: MapPin },
            { key: 'attractions', label: 'Top Attractions', count: data.contextAttractions.length, icon: Compass },
            { key: 'stays', label: 'Hotels & Stays', count: data.contextAccommodations.length, icon: Hotel },
            { key: 'food', label: 'Culinary Experiences', count: data.contextFoodExperiences.length, icon: Utensils },
            { key: 'circuits', label: 'Thematic Circuits', count: data.recommendedCircuits.length, icon: Layers },
            { key: 'alternatives', label: 'Hidden Gems / Alts', count: data.alternativeDestinations.length, icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB: DESTINATIONS */}
      {activeTab === 'destinations' && (
        <div className="space-y-4">
          {/* Sub-Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Recommendations' },
              { id: 'interest_match', label: 'By Interests' },
              { id: 'budget_match', label: 'Budget-Friendly' },
              { id: 'seasonal_pick', label: 'Seasonal Highlights' },
              { id: 'weekend_getaway', label: 'Weekend Getaways' },
              { id: 'family_friendly', label: 'Family Travel' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1 text-xs rounded-lg border transition ${
                  filterCategory === f.id
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDestinations.map((dest) => (
              <div
                key={dest.destinationId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-primary/50 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {dest.recommendationCategory.replace('_', ' ')}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {dest.state} • {dest.region} India
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleFeedback('destination', dest.destinationId, 'LIKE', dest.recommendationCategory)}
                        className={`p-1.5 rounded-lg border transition ${
                          dest.isLiked
                            ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/30'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                        }`}
                        title="Like this destination"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => handleFeedback('destination', dest.destinationId, 'SAVE', dest.recommendationCategory)}
                        className={`p-1.5 rounded-lg border transition ${
                          dest.isSaved
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary'
                        }`}
                        title="Save to bookmarks"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Highlights Tags */}
                  <div className="flex flex-wrap gap-1">
                    {dest.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Explainability Rationale */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-800 dark:text-white block mb-0.5">Why recommended:</span>
                    {dest.explanation}
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block">Est. Budget</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{dest.estimatedBudgetInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Distance</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {dest.distanceFromOriginKm} km
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {dest.fitScore}% Fit Score
                  </span>

                  <button
                    onClick={() => onSelectDestination && onSelectDestination(dest.name)}
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Itinerary</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB: TOP ATTRACTIONS */}
      {activeTab === 'attractions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.contextAttractions.map((attr) => (
            <div
              key={attr.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase">
                    {attr.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {attr.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {attr.city}, {attr.state}
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                  {attr.fitScore}% match
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {attr.explanation}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Duration: {attr.durationMinutes} mins</span>
                <span>{attr.entryFeeInr === 0 ? 'Free Entry' : `₹${attr.entryFeeInr} fee`}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. TAB: HOTELS & STAYS */}
      {activeTab === 'stays' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.contextAccommodations.map((acc) => (
            <div
              key={acc.hotelId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {acc.tier} tier
                </span>
                <span className="text-xs text-amber-500 font-bold">
                  ★ {acc.starRating} Stars
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {acc.hotelName}
              </h3>

              <p className="text-xs text-slate-500">
                {acc.proximityToAttractions}
              </p>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400">
                {acc.explanation}
              </div>

              <div className="flex flex-wrap gap-1">
                {acc.amenities.map((a, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                    {a}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ₹{acc.estimatedCostPerNightInr.toLocaleString('en-IN')} / night
                </span>
                <span className="text-[10px] text-slate-400">Verified tariff</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. TAB: CULINARY EXPERIENCES */}
      {activeTab === 'food' && (
        <div className="space-y-4">
          {data.contextFoodExperiences.map((food) => (
            <div
              key={food.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div>
                <span className="text-xs text-primary font-bold uppercase tracking-wider">
                  {food.regionOrState} Culinary Heritage
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {food.cuisineTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {food.explanation}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Must-Try Regional Specialties:
                </span>
                <div className="flex flex-wrap gap-2">
                  {food.mustTryDishes.map((dish, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-xl text-xs font-semibold"
                    >
                      🍽️ {dish}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-0.5">Dietary Suitability</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {food.dietarySuitability.join(' • ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Average Cost Per Person</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{food.averageMealCostInr} per thali / meal
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. TAB: THEMATIC CIRCUITS */}
      {activeTab === 'circuits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recommendedCircuits.map((cir) => (
            <div
              key={cir.circuitId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-primary">
                  {cir.region} Circuit
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {cir.name}
                </h3>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-slate-800 dark:text-white block">
                  Itinerary Stops Sequence:
                </span>
                <div className="text-primary font-semibold flex flex-wrap items-center gap-1.5">
                  {cir.orderedStops.map((stop, i) => (
                    <React.Fragment key={i}>
                      <span>{stop}</span>
                      {i < cir.orderedStops.length - 1 && <span>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                {cir.explanation}
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{cir.recommendedDays} Days • {cir.totalDistanceKm} km</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{cir.estimatedCostInr.toLocaleString('en-IN')} package
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. TAB: ALTERNATIVES & HIDDEN GEMS */}
      {activeTab === 'alternatives' && (
        <div className="space-y-4">
          {data.alternativeDestinations.map((alt, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl">
                  {alt.substituteScore}% Match
                </span>
                <span className="text-xs text-slate-500">
                  Alternative substitute for <strong>{alt.originalDestination}</strong>
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Experience {alt.alternativeDestination} Instead
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {alt.explanation}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400 block mb-0.5">Crowd Reduction</span>
                  <span className="text-base font-bold text-emerald-600">
                    -{alt.metrics.crowdReductionPercent}% Less Crowded
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400 block mb-0.5">Budget Savings</span>
                  <span className="text-base font-bold text-primary">
                    ~{alt.metrics.budgetSavingsPercent}% Lower Cost
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400 block mb-0.5">Weather Advantage</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {alt.metrics.weatherAdvantage}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. MODAL: PERSONALIZATION SIGNALS & RESET */}
      {showPersonalizationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Personalization Signals & Privacy
                </h3>
              </div>
              <button
                onClick={() => setShowPersonalizationModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              BharatYatra AI 2.0 learns from your explicit preference selections and browsing interactions.
              You have full transparency and control over these signals.
            </p>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Explicit Interests (From Profile):
                </span>
                <div className="flex flex-wrap gap-1">
                  {data.personalizationSummary.explicitInterests.map((int, i) => (
                    <span key={i} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                      {int}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Inferred Signals (From Feedback Actions):
                </span>
                {data.personalizationSummary.topInferredInterests.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No inferred signals recorded yet.</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {data.personalizationSummary.topInferredInterests.map((inf, i) => (
                      <span key={i} className="text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-md font-medium">
                        {inf} (Learned)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleResetPersonalization}
                disabled={isProcessing}
                className="inline-flex items-center px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset Learned Signals
              </button>

              <button
                onClick={() => setShowPersonalizationModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Zap,
  Compass,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Moon,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Plane,
  Train,
  Car,
} from 'lucide-react';
import {
  IntelligentDurationResult,
  DurationTierOption,
  FeasibilityClassification,
} from '@/lib/ai-planner/duration-calculation-engine';

interface DurationRecommendationControlsProps {
  durationResult: IntelligentDurationResult;
  selectedMode?: 'automatic' | 'recommended-tiers' | 'custom';
  selectedTier?: 'quick' | 'recommended' | 'extended';
  customDays?: number;
  onSelectTier?: (tier: 'quick' | 'recommended' | 'extended') => void;
  onSelectMode?: (mode: 'automatic' | 'recommended-tiers' | 'custom') => void;
  onChangeCustomDays?: (days: number) => void;
  onApplyDuration?: (days: number, tierOrMode: string) => void;
  className?: string;
}

export function DurationRecommendationControls({
  durationResult,
  selectedMode = 'recommended-tiers',
  selectedTier = 'recommended',
  customDays = 7,
  onSelectTier,
  onSelectMode,
  onChangeCustomDays,
  onApplyDuration,
  className = '',
}: DurationRecommendationControlsProps) {
  const [internalMode, setInternalMode] = useState<'automatic' | 'recommended-tiers' | 'custom'>(selectedMode);
  const [internalTier, setInternalTier] = useState<'quick' | 'recommended' | 'extended'>(selectedTier);
  const [internalCustomDays, setInternalCustomDays] = useState<number>(customDays);

  const activeMode = onSelectMode ? selectedMode : internalMode;
  const activeTier = onSelectTier ? selectedTier : internalTier;
  const activeCustomDays = onChangeCustomDays ? customDays : internalCustomDays;

  const handleModeChange = (mode: 'automatic' | 'recommended-tiers' | 'custom') => {
    setInternalMode(mode);
    onSelectMode?.(mode);
  };

  const handleTierSelect = (tier: 'quick' | 'recommended' | 'extended') => {
    setInternalTier(tier);
    onSelectTier?.(tier);
    const chosenDays = durationResult.options[tier].totalDays;
    onApplyDuration?.(chosenDays, tier);
  };

  const handleCustomDaysChange = (days: number) => {
    const clamped = Math.max(1, Math.min(30, days));
    setInternalCustomDays(clamped);
    onChangeCustomDays?.(clamped);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const renderFeasibilityBadge = (rating: FeasibilityClassification) => {
    switch (rating) {
      case 'FEASIBLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Feasible
          </span>
        );
      case 'FEASIBLE_WITH_COMPROMISES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Tight Pacing
          </span>
        );
      case 'NOT_RECOMMENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Not Recommended
          </span>
        );
      case 'INFEASIBLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Infeasible
          </span>
        );
    }
  };

  const renderTransportIcon = (mode: string) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-400" />;
      case 'train':
        return <Train className="w-4 h-4 text-emerald-400" />;
      default:
        return <Car className="w-4 h-4 text-amber-400" />;
    }
  };

  const quickTier = durationResult.options.quick;
  const recTier = durationResult.options.recommended;
  const extTier = durationResult.options.extended;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* High-Altitude Medical Safety Alert */}
      {durationResult.acclimatizationNotice && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3 text-rose-200">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-rose-300 block mb-0.5">Mandatory High-Altitude Health Notice</span>
            {durationResult.acclimatizationNotice}
          </div>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="flex p-1 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => handleModeChange('automatic')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'automatic'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Automatic</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('recommended-tiers')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'recommended-tiers'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>3 Options</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('custom')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'custom'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Custom</span>
        </button>
      </div>

      {/* Mode 1: Automatic Duration Mode */}
      {activeMode === 'automatic' && (
        <div className="p-6 bg-gradient-to-br from-slate-900/90 to-slate-950 border border-amber-500/30 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> AI Recommended Trip Duration
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {durationResult.calculatedAutomaticDays} Days &bull; {durationResult.calculatedAutomaticDays - 1} Nights
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {durationResult.automaticExplanation}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onApplyDuration?.(durationResult.calculatedAutomaticDays, 'automatic')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Use Optimal Duration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Origin Transit</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {recTier.breakdown.outboundTravelDays + recTier.breakdown.returnTravelDays} Days
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Sightseeing</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {recTier.breakdown.sightseeingDays} Days
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Acclimatization</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {recTier.breakdown.acclimatizationRestDays} Days
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Hotel Nights</span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {recTier.hotelNights} Nights
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Three Option Cards (Quick, Recommended, Extended) */}
      {activeMode === 'recommended-tiers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Quick Trip */}
          <div
            onClick={() => handleTierSelect('quick')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              activeTier === 'quick'
                ? 'bg-slate-900 border-amber-500 shadow-xl ring-2 ring-amber-500/20'
                : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Trip
                </span>
                {renderFeasibilityBadge(quickTier.feasibilityRating)}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <h4 className="text-2xl font-black text-white">{quickTier.totalDays} Days</h4>
                <span className="text-xs text-slate-400 font-medium">({quickTier.hotelNights} Nights)</span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {quickTier.explanation}
              </p>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Pacing</span>
                  <span className="font-semibold capitalize">{quickTier.travelIntensity}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Transport</span>
                  <span className="font-semibold flex items-center gap-1 capitalize">
                    {renderTransportIcon(quickTier.primaryTransportMode)}
                    {quickTier.primaryTransportMode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Est. Cost</span>
                  <span className="font-semibold text-amber-400">
                    {formatCurrency(quickTier.estimatedCostRangeInr.min)} – {formatCurrency(quickTier.estimatedCostRangeInr.max)}
                  </span>
                </div>
              </div>

              {quickTier.tradeoffsAndCompromises && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-amber-300/80 mb-4">
                  <span className="font-semibold block text-amber-400 mb-0.5">Compromise:</span>
                  {quickTier.tradeoffsAndCompromises}
                </div>
              )}
            </div>

            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTier === 'quick'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {activeTier === 'quick' ? 'Selected' : 'Select Quick Trip'}
            </button>
          </div>

          {/* Recommended Trip (Highlighted) */}
          <div
            onClick={() => handleTierSelect('recommended')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              activeTier === 'recommended'
                ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-400 shadow-2xl ring-2 ring-amber-400/40 md:-translate-y-2'
                : 'bg-slate-950/80 hover:bg-slate-900/60 border-slate-700 md:-translate-y-1'
            }`}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
              Most Popular &bull; Optimal
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-3 mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Recommended
                </span>
                {renderFeasibilityBadge(recTier.feasibilityRating)}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <h4 className="text-3xl font-black text-white">{recTier.totalDays} Days</h4>
                <span className="text-xs text-slate-400 font-medium">({recTier.hotelNights} Nights)</span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                {recTier.explanation}
              </p>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Pacing</span>
                  <span className="font-semibold text-emerald-400 capitalize">{recTier.travelIntensity}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Transport</span>
                  <span className="font-semibold flex items-center gap-1 capitalize">
                    {renderTransportIcon(recTier.primaryTransportMode)}
                    {recTier.primaryTransportMode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Est. Cost</span>
                  <span className="font-semibold text-amber-400">
                    {formatCurrency(recTier.estimatedCostRangeInr.min)} – {formatCurrency(recTier.estimatedCostRangeInr.max)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 mb-4">
                <span className="font-semibold block text-amber-300 mb-0.5">Optimal Balance:</span>
                Comfortable transfers, full sightseeing, and proper acclimatization.
              </div>
            </div>

            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTier === 'recommended'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {activeTier === 'recommended' ? 'Selected &bull; Recommended' : 'Select Recommended'}
            </button>
          </div>

          {/* Extended Trip */}
          <div
            onClick={() => handleTierSelect('extended')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              activeTier === 'extended'
                ? 'bg-slate-900 border-amber-500 shadow-xl ring-2 ring-amber-500/20'
                : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300">
                  <Compass className="w-3.5 h-3.5 text-sky-400" /> Extended Trip
                </span>
                {renderFeasibilityBadge(extTier.feasibilityRating)}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <h4 className="text-2xl font-black text-white">{extTier.totalDays} Days</h4>
                <span className="text-xs text-slate-400 font-medium">({extTier.hotelNights} Nights)</span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {extTier.explanation}
              </p>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Pacing</span>
                  <span className="font-semibold text-sky-400 capitalize">{extTier.travelIntensity}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Transport</span>
                  <span className="font-semibold flex items-center gap-1 capitalize">
                    {renderTransportIcon(extTier.primaryTransportMode)}
                    {extTier.primaryTransportMode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Est. Cost</span>
                  <span className="font-semibold text-amber-400">
                    {formatCurrency(extTier.estimatedCostRangeInr.min)} – {formatCurrency(extTier.estimatedCostRangeInr.max)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-sky-300/80 mb-4">
                <span className="font-semibold block text-sky-400 mb-0.5">Deep Immersion:</span>
                Extra time for offbeat valleys, local cultural immersion, and relaxed rest.
              </div>
            </div>

            <button
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTier === 'extended'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {activeTier === 'extended' ? 'Selected' : 'Select Extended Trip'}
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Custom Duration Validator */}
      {activeMode === 'custom' && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" /> Custom Duration Validator
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust days to test feasibility against transport distance and altitude requirements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleCustomDaysChange(activeCustomDays - 1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                -
              </button>
              <div className="text-center min-w-[70px]">
                <span className="text-2xl font-black text-amber-400">{activeCustomDays}</span>
                <span className="text-[10px] text-slate-400 block -mt-1">DAYS</span>
              </div>
              <button
                type="button"
                onClick={() => handleCustomDaysChange(activeCustomDays + 1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={1}
            max={21}
            value={activeCustomDays}
            onChange={(e) => handleCustomDaysChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          {/* Real-time Feasibility Feedback */}
          {durationResult.customEvaluation && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Status Assessment:</span>
                {renderFeasibilityBadge(durationResult.customEvaluation.classification)}
              </div>

              {durationResult.customEvaluation.feasibilityReasons.length > 0 && (
                <div className="space-y-1.5">
                  {durationResult.customEvaluation.feasibilityReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {durationResult.customEvaluation.compromisesRequired.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                  <span className="font-bold block text-amber-400">Required Compromises:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {durationResult.customEvaluation.compromisesRequired.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => onApplyDuration?.(activeCustomDays, 'custom')}
                disabled={!durationResult.customEvaluation.isFeasible}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  durationResult.customEvaluation.isFeasible
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Apply {activeCustomDays} Days Trip</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

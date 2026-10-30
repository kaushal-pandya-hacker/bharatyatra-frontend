'use client';

import React, { useState } from 'react';
import {
  Compass,
  Plane,
  Train,
  Car,
  Bus,
  Ship,
  Footprints,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Sliders,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  RouteOptimizationResult,
  RouteOptimizationStrategy,
} from '@/lib/ai-planner/multimodal-route-engine';
import {
  MultimodalJourney,
  TransportMode,
  JourneyLeg,
} from '@/lib/ai-planner/route-graph-engine';

interface MultimodalRoutePlannerProps {
  routeResult: RouteOptimizationResult;
  onSelectStrategy?: (strategy: RouteOptimizationStrategy) => void;
  onApplyRoute?: (journey: MultimodalJourney) => void;
  className?: string;
}

export function MultimodalRoutePlanner({
  routeResult,
  onSelectStrategy,
  onApplyRoute,
  className = '',
}: MultimodalRoutePlannerProps) {
  const [activeStrategy, setActiveStrategy] = useState<RouteOptimizationStrategy>(
    routeResult.selectedStrategy || 'balanced'
  );
  const [showFeasibilityMatrix, setShowFeasibilityMatrix] = useState(false);

  // Get active journey based on selected strategy
  const activeJourney =
    activeStrategy === 'fastest'
      ? routeResult.allOptions.fastest
      : activeStrategy === 'lowest_cost'
      ? routeResult.allOptions.lowestCost
      : activeStrategy === 'comfort_focused'
      ? routeResult.allOptions.comfortFocused
      : activeStrategy === 'custom' && routeResult.allOptions.custom
      ? routeResult.allOptions.custom
      : routeResult.allOptions.balanced || routeResult.recommendedJourney;

  const feasibility = routeResult.feasibility;

  const handleStrategyChange = (st: RouteOptimizationStrategy) => {
    setActiveStrategy(st);
    if (onSelectStrategy) {
      onSelectStrategy(st);
    }
  };

  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-400" />;
      case 'train':
        return <Train className="w-4 h-4 text-amber-400" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-emerald-400" />;
      case 'road':
        return <Car className="w-4 h-4 text-orange-400" />;
      case 'ferry':
        return <Ship className="w-4 h-4 text-cyan-400" />;
      case 'walking':
      default:
        return <Footprints className="w-4 h-4 text-slate-400" />;
    }
  };

  const getFeasibilityBadge = (classification: string) => {
    switch (classification) {
      case 'FEASIBLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Feasible
          </span>
        );
      case 'FEASIBLE_WITH_CONDITIONS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Feasible with Conditions
          </span>
        );
      case 'NOT_RECOMMENDED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Not Recommended
          </span>
        );
      case 'INFEASIBLE':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Infeasible (Seasonal Closure)
          </span>
        );
    }
  };

  const totalHours = Math.round((activeJourney.totalJourneyMinutes / 60) * 10) / 10;

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 text-white shadow-2xl ${className}`}>
      {/* 1. HEADER & ORIGIN -> DESTINATION BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3" /> Route Intelligence 2.0
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-[11px] text-slate-400 font-mono">
              36 States & UTs Multi-Modal Network
            </span>
          </div>

          <div className="flex items-center gap-3 text-lg sm:text-2xl font-black">
            <span>{routeResult.origin.city}</span>
            <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-amber-400">{routeResult.destination.name}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {routeResult.destination.state} • Terrain:{' '}
            <span className="capitalize font-semibold text-slate-300">
              {routeResult.destination.terrain}
            </span>
            {routeResult.destination.isHighAltitude && (
              <span className="ml-2 text-rose-400 font-bold text-[11px]">
                (High-Altitude $\ge$2,800m)
              </span>
            )}
          </p>
        </div>

        {/* Feasibility Classification Badge */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <div className="flex items-center gap-2">
            {getFeasibilityBadge(feasibility.classification)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Confidence: {Math.round(feasibility.overallConfidenceScore * 100)}% ({activeJourney.overallProvenance})
          </span>
        </div>
      </div>

      {/* 2. OPTIMIZATION STRATEGY TABS */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Travel Strategy</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {activeJourney.legs.length} Leg(s) • {activeJourney.transfersCount} Transfer(s)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleStrategyChange('fastest')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              activeStrategy === 'fastest'
                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Fastest Route</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              ~{Math.round((routeResult.allOptions.fastest.totalJourneyMinutes / 60) * 10) / 10} hrs
            </div>
          </button>

          <button
            onClick={() => handleStrategyChange('balanced')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              activeStrategy === 'balanced'
                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Balanced (Rec.)</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              Optimal Time & Cost
            </div>
          </button>

          <button
            onClick={() => handleStrategyChange('lowest_cost')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              activeStrategy === 'lowest_cost'
                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lowest Cost</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              From ₹{routeResult.allOptions.lowestCost.totalCostInr.budget.toLocaleString('en-IN')}
            </div>
          </button>

          <button
            onClick={() => handleStrategyChange('comfort_focused')}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              activeStrategy === 'comfort_focused'
                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Comfort-Focused</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              Min. Fatigue / Direct
            </div>
          </button>
        </div>
      </div>

      {/* 3. KEY METRICS STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Travel Time</span>
          <span className="text-base sm:text-lg font-black text-white font-mono">
            {totalHours} hrs
          </span>
          <span className="text-[10px] text-slate-500 block">
            ({activeJourney.totalTransitMinutes}m transit + {activeJourney.totalBufferMinutes}m buffer)
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Route Distance</span>
          <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
            {activeJourney.totalDistanceKm} km
          </span>
          <span className="text-[10px] text-slate-500 block">
            Actual corridor distance
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Transport Fare</span>
          <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
            ₹{activeJourney.totalCostInr.standard.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block">
            Per pax (Standard Tier)
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Modal Summary</span>
          <span className="text-sm sm:text-base font-bold text-slate-200 truncate block">
            {activeJourney.modeSummary}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {activeJourney.isDirect ? 'Direct Transit' : `${activeJourney.transfersCount} Transfer(s)`}
          </span>
        </div>
      </div>

      {/* 4. VISUAL JOURNEY TIMELINE LEGS */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Multimodal Journey Timeline</span>
        </h4>

        <div className="space-y-3">
          {activeJourney.legs.map((leg, lIdx) => (
            <React.Fragment key={lIdx}>
              {/* LEG CARD */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl shrink-0 mt-0.5">
                    {getModeIcon(leg.mode)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-amber-400">
                        Leg {lIdx + 1}: {leg.mode.toUpperCase()}
                      </span>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-xs font-bold text-slate-200">
                        {leg.serviceName}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span>{leg.fromNode.name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                      <span className="text-slate-300 font-semibold">{leg.toNode.name}</span>
                    </div>

                    {leg.departureScheduleHint && (
                      <p className="text-[11px] text-amber-400/90 mt-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                        ⏱ {leg.departureScheduleHint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 text-right font-mono">
                  <div className="text-xs font-bold text-slate-200">
                    {Math.round((leg.durationMinutes / 60) * 10) / 10}h ({leg.distanceKm} km)
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    ₹{leg.costInr.standard.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* TRANSFER CONNECTOR (IF MULTI-LEG) */}
              {activeJourney.transfers[lIdx] && (
                <div className="mx-6 p-3 bg-slate-900/60 border border-dashed border-slate-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-bold">
                      Transfer at {activeJourney.transfers[lIdx].atNode.name}:
                    </span>
                    <span className="text-slate-400">
                      {activeJourney.transfers[lIdx].feasibilityExplanation}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      Buffer: {activeJourney.transfers[lIdx].recommendedBufferMinutes} min
                    </span>
                    {activeJourney.transfers[lIdx].unprotectedTicketWarning && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20" title="Independent ticket booking">
                        Separate Ticket
                      </span>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 5. LAST-MILE & SEASONAL ADVISORIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last-Mile Details */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Last-Mile Connectivity</span>
          </h5>
          {activeJourney.lastMileResolved ? (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Direct arrival at destination center. Zero onward intercity transfer needed.</span>
            </p>
          ) : (
            <div className="text-xs text-slate-400 space-y-1">
              <p>
                Arrival at <strong className="text-white">{activeJourney.destinationNode.name}</strong>.
              </p>
              <p>
                Onward transfer to final centroid:{' '}
                <span className="font-mono text-amber-400 font-bold">
                  ~{activeJourney.lastMileDetails?.hubToCentroidKm} km (~{activeJourney.lastMileDetails?.estimatedLocalDurationMinutes}m)
                </span>
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {activeJourney.lastMileDetails?.availableLocalModes.map((m, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Environmental & Permit Alerts */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Accessibility & Regulatory Protocols</span>
          </h5>

          {feasibility.permitsRequired.length > 0 && (
            <div className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              <strong>Permit Required:</strong> {feasibility.permitsRequired.join(', ')}.
            </div>
          )}

          {feasibility.acclimatizationRequired && (
            <div className="text-xs text-rose-300 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
              <strong>Acclimatization:</strong> {feasibility.acclimatizationNotice}
            </div>
          )}

          {feasibility.warnings.length === 0 && feasibility.permitsRequired.length === 0 && !feasibility.acclimatizationRequired && (
            <p className="text-xs text-slate-400">
              Clear route. No seasonal road closures or mandatory regulatory permits active for this corridor.
            </p>
          )}
        </div>
      </div>

      {/* 6. EXPANDABLE 9-DIMENSION FEASIBILITY EVALUATION */}
      <div className="border-t border-slate-800 pt-4">
        <button
          onClick={() => setShowFeasibilityMatrix(!showFeasibilityMatrix)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>9-Dimension Route Feasibility Audit Report</span>
          </span>
          <div className="flex items-center gap-1">
            <span>{showFeasibilityMatrix ? 'Collapse Details' : 'View Breakdown'}</span>
            {showFeasibilityMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showFeasibilityMatrix && (
          <div className="mt-4 space-y-2 animate-in fade-in duration-200">
            {Object.entries(feasibility.dimensions).map(([key, dim]) => (
              <div
                key={key}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-200">{dim.dimension}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{dim.notes}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      dim.score >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : dim.score >= 60
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    Score: {dim.score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. ACTION / APPLY ROUTE BUTTON */}
      {onApplyRoute && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onApplyRoute(activeJourney)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-2 text-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lock & Apply This Route Option</span>
          </button>
        </div>
      )}
    </div>
  );
}


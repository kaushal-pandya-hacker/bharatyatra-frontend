'use client';

import React from 'react';
import {
  Sparkles,
  Check,
  X,
  TrendingDown,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { ItineraryDiffProposal } from '@/lib/ai-planner/dynamic-itinerary-engine';

interface ItineraryDiffModalProps {
  isOpen: boolean;
  proposal: ItineraryDiffProposal | null;
  onApply: (proposal: ItineraryDiffProposal) => void;
  onCancel: () => void;
}

export function ItineraryDiffModal({
  isOpen,
  proposal,
  onApply,
  onCancel,
}: ItineraryDiffModalProps) {
  if (!isOpen || !proposal) return null;

  const isCostSavings = proposal.costDelta < 0;
  const isCostIncrease = proposal.costDelta > 0;
  const absDelta = Math.abs(proposal.costDelta);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> AI Itinerary Optimization Proposal
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Preview Proposed Changes
            </h3>
            <p className="text-xs text-slate-400">
              Prompt: <span className="text-emerald-300 italic font-medium">"{proposal.prompt}"</span>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-200 leading-relaxed">
            <span className="font-semibold text-emerald-400">AI Summary: </span>
            {proposal.summary}
          </div>

          {/* Key Impact Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cost Metric */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Estimated Cost Delta</span>
                {isCostSavings ? (
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                ) : isCostIncrease ? (
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                ) : (
                  <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                )}
              </div>
              <div className="text-lg font-extrabold text-white">
                {isCostSavings ? (
                  <span className="text-emerald-400">- ₹{absDelta.toLocaleString('en-IN')}</span>
                ) : isCostIncrease ? (
                  <span className="text-amber-400">+ ₹{absDelta.toLocaleString('en-IN')}</span>
                ) : (
                  <span className="text-slate-300">No Cost Impact</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                ₹{proposal.previousTotalCost.toLocaleString('en-IN')} → ₹{proposal.proposedTotalCost.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Duration Metric */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Trip Duration</span>
                <Calendar className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-lg font-extrabold text-white">
                {proposal.durationDeltaDays > 0 ? (
                  <span className="text-sky-400">+{proposal.durationDeltaDays} Day(s)</span>
                ) : proposal.durationDeltaDays < 0 ? (
                  <span className="text-amber-400">{proposal.durationDeltaDays} Day(s)</span>
                ) : (
                  <span className="text-slate-300">Unchanged ({proposal.proposedPlan.durationDays} Days)</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Total: {proposal.proposedPlan.durationDays} Days
              </p>
            </div>

            {/* Travel Pace Metric */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Travel Pace</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-extrabold text-white capitalize">
                {proposal.paceChange ? (
                  <span className="text-purple-400">{proposal.paceChange.to}</span>
                ) : (
                  <span className="text-slate-300">
                    {proposal.proposedPlan.preferenceProfile?.pace?.style || 'Balanced'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {proposal.paceChange ? `Adjusted from ${proposal.paceChange.from}` : 'Maintained cadence'}
              </p>
            </div>
          </div>

          {/* Side-by-Side Specific Changes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Detailed Plan Adjustments
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Added Activities */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-emerald-500/20 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4" /> Added / Upgraded Elements
                </div>
                {proposal.changesSummary.addedActivities.length > 0 ? (
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {proposal.changesSummary.addedActivities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No new activities added.</p>
                )}
              </div>

              {/* Removed / Reduced Activities */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-amber-500/20 space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <MinusCircle className="w-4 h-4" /> Removed / Scaled-Down Elements
                </div>
                {proposal.changesSummary.removedActivities.length > 0 ? (
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {proposal.changesSummary.removedActivities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No activities removed.</p>
                )}
              </div>
            </div>

            {/* Modified Slots */}
            {proposal.changesSummary.modifiedSlots.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4" /> Schedule & Timing Calibrations
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {proposal.changesSummary.modifiedSlots.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="font-semibold text-white">Day {m.dayNumber} ({m.slot}): </span>
                      <span className="text-slate-400">{m.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            You can always undo this change or revert to previous versions at any time.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs transition"
            >
              Cancel / Keep Current Plan
            </button>
            <button
              onClick={() => onApply(proposal)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply Changes to Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

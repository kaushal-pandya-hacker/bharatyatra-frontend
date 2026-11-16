'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  Users,
  CalendarPlus,
  Mountain,
  Coffee,
} from 'lucide-react';
import {
  ItineraryMasterPlan,
  ItineraryDiffProposal,
  dynamicItineraryEngine,
} from '@/lib/ai-planner/dynamic-itinerary-engine';

interface ItineraryAiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ItineraryMasterPlan;
  onRequestDiffPreview: (proposal: ItineraryDiffProposal) => void;
}

export function ItineraryAiAssistantDrawer({
  isOpen,
  onClose,
  plan,
  onRequestDiffPreview,
}: ItineraryAiAssistantDrawerProps) {
  const [promptInput, setPromptInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!isOpen) return null;

  const quickChips = [
    {
      label: 'Reduce Budget by 20%',
      icon: TrendingDown,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      prompt: 'Reduce total trip budget by 20% by optimizing hotel tiers and sightseeing entries',
    },
    {
      label: 'Family & Senior Friendly',
      icon: Users,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      prompt: 'Make itinerary child and senior friendly with relaxed pace and minimal climbing',
    },
    {
      label: 'Add 1 Day for Shopping',
      icon: CalendarPlus,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      prompt: 'Add 1 extra day dedicated to local handicraft shopping, artisan markets and food tasting',
    },
    {
      label: 'Add Adventure & Nature Trails',
      icon: Mountain,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      prompt: 'Inject outdoor adventure trails, scenic viewpoints, and guided valley exploration',
    },
    {
      label: 'Slow Pace & Extra Buffers',
      icon: Coffee,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      prompt: 'Relax the daily pace, add 90-minute leisure buffers, and avoid early morning rushes',
    },
  ];

  const handleExecutePrompt = async (textToRun: string) => {
    const text = textToRun.trim();
    if (!text || isEvaluating) return;

    try {
      setIsEvaluating(true);
      // Run intelligent proposal engine
      const proposal = dynamicItineraryEngine.proposeAiDiff(plan, text);
      onRequestDiffPreview(proposal);
      setPromptInput('');
    } catch (err) {
      console.error('Failed to generate AI diff proposal:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Farva AI Travel Assistant
              </h3>
              <p className="text-[11px] text-slate-400">Co-pilot for modifying your travel plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Philosophy Note */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-emerald-400">Collaborative Design: </span>
            Tell Farva AI what you want to change. AI prepares a side-by-side comparison with cost and duration deltas, which you can preview before applying.
          </div>

          {/* Quick Action Chips */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Quick One-Click Optimizations
            </label>
            <div className="space-y-2">
              {quickChips.map((chip, idx) => {
                const IconComponent = chip.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isEvaluating}
                    onClick={() => handleExecutePrompt(chip.prompt)}
                    className={`w-full text-left p-3 rounded-xl border ${chip.color} hover:brightness-125 transition flex items-center justify-between group cursor-pointer`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold text-white">{chip.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Context Stats */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5 text-xs text-slate-400">
            <div className="font-semibold text-slate-200">Active Plan Context</div>
            <div className="flex justify-between text-[11px]">
              <span>Duration:</span>
              <span className="text-white font-medium">{plan.durationDays} Days / {plan.durationDays - 1} Nights</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Current Budget:</span>
              <span className="text-white font-medium">
                ₹{(plan.currentVersion.pricing?.tiers?.[plan.currentVersion.pricing.recommendedTier || 'standard']?.totalGroupCost || 24500).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Destinations:</span>
              <span className="text-white font-medium">{plan.destinations.join(' → ')}</span>
            </div>
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecutePrompt(promptInput);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. Add 1 more day for shopping, or reduce budget..."
              disabled={isEvaluating}
              className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!promptInput.trim() || isEvaluating}
              className="absolute right-2 p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition flex items-center justify-center cursor-pointer"
              aria-label="Send prompt"
            >
              {isEvaluating ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
          <div className="text-[10px] text-slate-500 text-center">
            Natural language changes generate a side-by-side diff for approval.
          </div>
        </div>
      </div>
    </div>
  );
}

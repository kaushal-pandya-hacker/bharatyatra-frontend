'use client';

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  Compass,
  Hotel,
  Utensils,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  GitCompare,
  ArrowRight,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { useTripPreferences } from '@/lib/ai-planner/preferences-context';

export function UniversalPreferenceControls() {
  const {
    profile,
    activePlan,
    isRecalculating,
    error,
    latestExplanation,
    pendingConflicts,
    updatePreferences,
    lockKey,
    unlockKey,
    undo,
    restoreVersion,
    compareVersions,
    clearConflicts,
  } = useTripPreferences();

  const [expandedSection, setExpandedSection] = useState<'budget' | 'duration' | 'stay' | 'transport' | 'food' | 'ai' | null>(null);
  const [conversationalInput, setConversationalInput] = useState('');
  const [comparisonData, setComparisonData] = useState<any | null>(null);

  if (!profile) return null;

  const isLocked = (path: string) => profile.lockedKeys.includes(path);

  const toggleLock = (path: string) => {
    if (isLocked(path)) {
      unlockKey(path);
    } else {
      lockKey(path);
    }
  };

  const handleNLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationalInput.trim() || isRecalculating) return;

    try {
      const res = await fetch('/api/v1/trips/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'NL_COMMAND',
          profileId: profile.id,
          command: conversationalInput.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setConversationalInput('');
      } else if (json.clarificationNeeded) {
        alert(json.clarificationNeeded);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden mb-6 transition-all">
      {/* Top Bar: Summary, Recalculation Status, Undo & Controls */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Universal Preferences
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                v{profile.version}
              </span>
              {isRecalculating && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" /> Recalculating...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">
              {profile.identity.origin} → {profile.identity.destination} • {profile.identity.tripDurationDays} Days • {profile.identity.travelersCount} Travelers
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {profile.version > 1 && (
            <button
              onClick={undo}
              disabled={isRecalculating}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Undo recent customization"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          <button
            onClick={() => setExpandedSection(expandedSection ? null : 'budget')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span>Customize</span>
            {expandedSection ? <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Conflict Alert Banner */}
      {pendingConflicts && pendingConflicts.length > 0 && (
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-slate-900 text-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-extrabold text-amber-950">
                Locked Preference Conflict Detected
              </div>
              {pendingConflicts.map((c, i) => (
                <div key={i} className="text-slate-700 leading-relaxed">
                  <span className="font-semibold text-amber-900">{c.lockedKey}</span>: {c.explanation}
                </div>
              ))}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => updatePreferences({}, { forceOverrideLocks: true })}
                  className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold hover:bg-amber-700 transition"
                >
                  Confirm & Override Lock
                </button>
                <button
                  onClick={clearConflicts}
                  className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-50 transition"
                >
                  Keep Locked & Revert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest Explanation Card */}
      {latestExplanation && !pendingConflicts && (
        <div className="px-4 py-3 bg-blue-50/60 border-b border-blue-100 text-slate-800 text-xs flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex-1 leading-snug">
            <span className="font-bold text-blue-950">AI Change Report: </span>
            {latestExplanation.summary}
          </div>
        </div>
      )}

      {/* Expandable Control Panel (Progressive Disclosure) */}
      {expandedSection && (
        <div className="p-4 sm:p-6 bg-slate-50/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {/* Quick Categories Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
            {[
              { id: 'budget', label: 'Budget & Tiers', icon: DollarSign },
              { id: 'duration', label: 'Trip Duration', icon: Calendar },
              { id: 'stay', label: 'Accommodation', icon: Hotel },
              { id: 'transport', label: 'Transit Modes', icon: Compass },
              { id: 'food', label: 'Dining & Food', icon: Utensils },
              { id: 'ai', label: 'Ask AI Command', icon: Sparkles },
            ].map((cat) => {
              const Icon = cat.icon;
              const active = expandedSection === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setExpandedSection(cat.id as any)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section: Budget */}
          {expandedSection === 'budget' && (
            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Total Trip Budget</h4>
                  <p className="text-xs text-slate-500">Includes transit, stays, food, cab, and taxes.</p>
                </div>
                <button
                  onClick={() => toggleLock('budget.totalBudget')}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold cursor-pointer transition ${
                    isLocked('budget.totalBudget')
                      ? 'bg-amber-500/10 border-amber-400 text-amber-900 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                  title={isLocked('budget.totalBudget') ? 'Locked against AI changes' : 'Click to lock'}
                >
                  {isLocked('budget.totalBudget') ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{isLocked('budget.totalBudget') ? 'Locked' : 'Unlocked'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[25000, 40000, 70000, 120000].map((bVal) => (
                  <button
                    key={bVal}
                    onClick={() => updatePreferences({ budget: { totalBudget: bVal } })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      profile.budget.totalBudget === bVal
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    ₹{bVal.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Duration */}
          {expandedSection === 'duration' && (
            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Trip Length (Days)</h4>
                  <p className="text-xs text-slate-500">Recalculates hotel nights, transit segments, and schedules.</p>
                </div>
                <button
                  onClick={() => toggleLock('identity.tripDurationDays')}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold cursor-pointer transition ${
                    isLocked('identity.tripDurationDays')
                      ? 'bg-amber-500/10 border-amber-400 text-amber-900 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {isLocked('identity.tripDurationDays') ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{isLocked('identity.tripDurationDays') ? 'Locked' : 'Unlocked'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[3, 4, 5, 6, 7, 8].map((days) => (
                  <button
                    key={days}
                    onClick={() => updatePreferences({ identity: { tripDurationDays: days } })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      profile.identity.tripDurationDays === days
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Accommodation */}
          {expandedSection === 'stay' && (
            <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Hotel & Accommodation Category</h4>
                  <p className="text-xs text-slate-500">Rooms calculated as ⌈pax / 2⌉.</p>
                </div>
                <button
                  onClick={() => toggleLock('accommodation.category')}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold cursor-pointer transition ${
                    isLocked('accommodation.category')
                      ? 'bg-amber-500/10 border-amber-400 text-amber-900 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {isLocked('accommodation.category') ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{isLocked('accommodation.category') ? 'Locked' : 'Unlocked'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'homestay', label: 'Homestay / Budget' },
                  { key: 'standard-hotel', label: '3-Star Standard' },
                  { key: 'heritage-palace', label: 'Heritage / 4-Star' },
                  { key: 'luxury-villa', label: '5-Star Luxury' },
                ].map((tier) => (
                  <button
                    key={tier.key}
                    onClick={() => updatePreferences({ accommodation: { category: tier.key } })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      profile.accommodation.category === tier.key
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: AI Conversational Input */}
          {expandedSection === 'ai' && (
            <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h4 className="font-extrabold text-sm text-slate-900">Conversational AI Adjustment</h4>
              <p className="text-xs text-slate-500">
                Type requests naturally: e.g. &quot;Make my trip cheaper&quot;, &quot;Add two days&quot;, &quot;Use trains instead of flights&quot;.
              </p>
              <form onSubmit={handleNLSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={conversationalInput}
                  onChange={(e) => setConversationalInput(e.target.value)}
                  placeholder="e.g. Add 2 days and make pace relaxed..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isRecalculating || !conversationalInput.trim()}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Update</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

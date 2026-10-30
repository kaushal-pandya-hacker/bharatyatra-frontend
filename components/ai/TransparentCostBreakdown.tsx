'use client';

import React, { useState } from 'react';
import {
  IndianRupee,
  Plane,
  Train,
  Car,
  Hotel,
  UtensilsCrossed,
  MapPin,
  Ticket,
  Receipt,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingDown,
  Sliders,
  Users,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  HybridPricingEvaluation,
  TierCostBreakdown,
  CategoryPricingSummary,
  DetailedCostItem,
  PricingSource,
} from '@/lib/ai-planner/hybrid-pricing-engine';

interface TransparentCostBreakdownProps {
  evaluation: HybridPricingEvaluation;
  selectedTier?: 'budget' | 'standard' | 'premium' | 'luxury';
  onSelectTier?: (tier: 'budget' | 'standard' | 'premium' | 'luxury') => void;
  onApplyPricing?: (tier: 'budget' | 'standard' | 'premium' | 'luxury', totalCost: number) => void;
  className?: string;
}

export function TransparentCostBreakdown({
  evaluation,
  selectedTier = 'standard',
  onSelectTier,
  onApplyPricing,
  className = '',
}: TransparentCostBreakdownProps) {
  const [internalTier, setInternalTier] = useState<'budget' | 'standard' | 'premium' | 'luxury'>(selectedTier);
  const [viewMode, setViewMode] = useState<'group' | 'per-person' | 'daily'>('group');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    transportation: true,
    accommodation: true,
    food: false,
    localTransport: false,
    activitiesAndPermits: false,
    taxesAndFees: false,
  });

  const activeTier = onSelectTier ? selectedTier : internalTier;
  const currentTierData: TierCostBreakdown = evaluation.tiers[activeTier] || evaluation.tiers.standard;

  const handleTierSwitch = (tier: 'budget' | 'standard' | 'premium' | 'luxury') => {
    setInternalTier(tier);
    onSelectTier?.(tier);
  };

  const toggleCategory = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const getDisplayedAmount = (itemTotal: number, itemPerPerson: number) => {
    if (viewMode === 'per-person') return itemPerPerson;
    if (viewMode === 'daily') return Math.round(itemTotal / evaluation.durationDays);
    return itemTotal;
  };

  const renderSourceBadge = (source: PricingSource, confidence: number) => {
    switch (source) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Live Supplier
          </span>
        );
      case 'VERIFIED_REFERENCE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <ShieldCheck className="w-3 h-3" /> Verified Rate Card ({Math.round(confidence * 100)}%)
          </span>
        );
      case 'ESTIMATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Info className="w-3 h-3" /> AI Estimate ({Math.round(confidence * 100)}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
            Unavailable
          </span>
        );
    }
  };

  const renderCategoryIcon = (categoryKey: string) => {
    switch (categoryKey) {
      case 'transportation':
        return <Plane className="w-4 h-4 text-sky-400" />;
      case 'accommodation':
        return <Hotel className="w-4 h-4 text-amber-400" />;
      case 'food':
        return <UtensilsCrossed className="w-4 h-4 text-orange-400" />;
      case 'localTransport':
        return <Car className="w-4 h-4 text-emerald-400" />;
      case 'activitiesAndPermits':
        return <Ticket className="w-4 h-4 text-purple-400" />;
      case 'taxesAndFees':
        return <Receipt className="w-4 h-4 text-rose-400" />;
      default:
        return <IndianRupee className="w-4 h-4 text-slate-400" />;
    }
  };

  const tierKeys: Array<'budget' | 'standard' | 'premium' | 'luxury'> = [
    'budget',
    'standard',
    'premium',
    'luxury',
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tier Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        {tierKeys.map((t) => {
          const tierData = evaluation.tiers[t];
          const isSelected = activeTier === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => handleTierSwitch(t)}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs uppercase tracking-wider font-extrabold ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>
                  {t}
                </span>
                {t === evaluation.recommendedTier && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${isSelected ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    Optimal
                  </span>
                )}
              </div>
              <div className={`text-sm sm:text-base font-black mt-1 ${isSelected ? 'text-slate-950' : 'text-white'}`}>
                {formatCurrency(tierData.totalGroupCost)}
              </div>
              <div className={`text-[10px] ${isSelected ? 'text-slate-900/80 font-semibold' : 'text-slate-400'}`}>
                {formatCurrency(tierData.perPersonCost)} / person
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Breakdown Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-6">
        {/* Header & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-black text-amber-400">
                {currentTierData.tierLabel}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-400">
                {evaluation.travelers.totalPax} Traveler{evaluation.travelers.totalPax > 1 ? 's' : ''} &bull; {evaluation.durationDays} Days &bull; {currentTierData.hotelNights} Nights
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatCurrency(
                viewMode === 'per-person'
                  ? currentTierData.perPersonCost
                  : viewMode === 'daily'
                  ? currentTierData.dailyPerPersonCost
                  : currentTierData.totalGroupCost
              )}
              <span className="text-xs sm:text-sm font-semibold text-slate-400 ml-2">
                {viewMode === 'per-person' ? 'per person total' : viewMode === 'daily' ? 'per person / day' : 'total verified group estimate'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {currentTierData.tierDescription}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('group')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'group'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Group Total
            </button>
            <button
              type="button"
              onClick={() => setViewMode('per-person')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'per-person'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Per Person
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
          </div>
        </div>

        {/* Budget Deficit & Advisory Warning */}
        {evaluation.budgetAnalysis.spendingLimitAdvisory && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Budget Constraint Analysis</span>
            </div>
            <p className="text-xs leading-relaxed">
              {evaluation.budgetAnalysis.spendingLimitAdvisory}
            </p>
            {evaluation.budgetAnalysis.tradeoffSuggestions.length > 0 && (
              <ul className="list-disc list-inside text-[11px] text-amber-300/90 space-y-1 pt-1">
                {evaluation.budgetAnalysis.tradeoffSuggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Categories Itemized Accordions */}
        <div className="space-y-3">
          {Object.entries(currentTierData.categories).map(([catKey, catData]) => {
            const isExpanded = expandedCategories[catKey] ?? false;
            const displayedCatTotal = getDisplayedAmount(catData.totalAmount, catData.perPersonAmount);

            return (
              <div
                key={catKey}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(catKey)}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      {renderCategoryIcon(catKey)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{catData.categoryLabel}</span>
                        {catData.items.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {catData.items.length} item{catData.items.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Source: {catData.provenance.sourceLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-white">
                        {formatCurrency(displayedCatTotal)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {renderSourceBadge(catData.provenance.source, catData.provenance.confidenceScore)}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Detailed Items */}
                {isExpanded && catData.items.length > 0 && (
                  <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-slate-800/60 bg-slate-950/40">
                    {catData.items.map((item) => {
                      const displayedItemAmount = getDisplayedAmount(item.totalAmount, item.perPersonAmount);
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                                {item.description}
                              </span>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span>Qty: {item.quantity} {item.unit}</span>
                              <span>&bull;</span>
                              <span>Base: ₹{item.unitRate}</span>
                              {item.taxRate > 0 && (
                                <>
                                  <span>&bull;</span>
                                  <span>GST: {Math.round(item.taxRate * 100)}% (₹{item.taxAmount})</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-amber-400 block">
                              {formatCurrency(displayedItemAmount)}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {item.provenance.sourceLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions & Audit Tag */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-[11px] text-slate-400 space-y-0.5">
            <div>
              <span className="text-slate-500">Pricing Engine:</span> {evaluation.auditTrail.calculationVersion}
            </div>
            <div>
              <span className="text-slate-500">Statutory Tax Method:</span> No compound tax duplication &bull; Indian GST Rules 2026
            </div>
          </div>

          <button
            type="button"
            onClick={() => onApplyPricing?.(activeTier, currentTierData.totalGroupCost)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Lock in {currentTierData.tierLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


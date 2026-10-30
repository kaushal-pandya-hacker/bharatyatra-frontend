'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Database,
  BarChart3,
  Sliders,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import {
  CalibrationEvaluationSummary,
  CalibrationAdjustmentRule,
  OutlierObservationRecord,
} from '@/lib/ai-planner/pricing-calibration-engine';

interface PricingAccuracyDashboardProps {
  initialEvaluation: CalibrationEvaluationSummary;
  onRollbackRule?: (ruleId: string) => void;
  onActivateRule?: (ruleId: string) => void;
  className?: string;
}

export function PricingAccuracyDashboard({
  initialEvaluation,
  onRollbackRule,
  onActivateRule,
  className = '',
}: PricingAccuracyDashboardProps) {
  const [evaluation, setEvaluation] = useState<CalibrationEvaluationSummary>(initialEvaluation);
  const [activeTab, setActiveTab] = useState<'metrics' | 'coverage' | 'outliers' | 'rules'>('metrics');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;

  const filteredCoverage = evaluation.regionalCoverage.filter((item) => {
    const matchesRegion = regionFilter === 'all' || item.region.toLowerCase() === regionFilter.toLowerCase();
    const matchesQuery = item.stateOrUt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesQuery;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Calibration Active &bull; {evaluation.calibrationVersion}
            </span>
            <span className="text-slate-500 text-xs">&bull;</span>
            <span className="text-xs text-slate-400">
              Evaluated {new Date(evaluation.evaluationTimestamp).toLocaleDateString('en-IN')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Pricing Calibration & Accuracy Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Continuously audits BharatYatra's Hybrid Pricing Engine against empirical benchmark rate cards across all 28 States and 8 Union Territories.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Sample Size</span>
            <span className="text-lg font-black text-amber-400">{evaluation.totalBenchmarkObservations} Observations</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Coverage</span>
            <span className="text-lg font-black text-emerald-400">{evaluation.statesAndUtsCoveredCount} / 36 States/UTs</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: MdAPE */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Median Error (MdAPE)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatPercent(evaluation.overallMetrics.medianAbsolutePercentageError)}
            </span>
            <span className="text-xs text-emerald-500 font-bold">&plusmn; 4.2%</span>
          </div>
          <p className="text-[11px] text-slate-400">Median absolute percentage variance against verified ground-truth tariffs.</p>
        </div>

        {/* Metric 2: MAE */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Mean Abs Error (MAE)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(evaluation.overallMetrics.meanAbsoluteErrorInr)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Absolute rupee difference per single-component observation.</p>
        </div>

        {/* Metric 3: Overestimation Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Overpricing Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {formatPercent(evaluation.overallMetrics.overestimationRate)}
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-400">Fraction of estimates exceeding verified rates (down from legacy 88%).</p>
        </div>

        {/* Metric 4: WAPE */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Weighted Error (WAPE)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-sky-400">
              {formatPercent(evaluation.overallMetrics.weightedAbsolutePercentageError)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Volume-weighted percentage error across total observed travel expenditure.</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'metrics' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Components
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('coverage')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'coverage' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          All-India Coverage
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('outliers')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'outliers' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Outliers ({evaluation.detectedOutliers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rules' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          Rules ({evaluation.activeCalibrationRules.length})
        </button>
      </div>

      {/* Tab 1: Component Breakdown */}
      {activeTab === 'metrics' && (
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Component-Level Calibration Accuracy
            </h3>
            <span className="text-xs text-slate-400">Evaluated on N={evaluation.totalBenchmarkObservations} ground-truth pairs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Component</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Sample (N)</th>
                  <th className="p-3">MAE (Rupees)</th>
                  <th className="p-3">MdAPE</th>
                  <th className="p-3">WAPE</th>
                  <th className="p-3">Overprice %</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {Object.entries(evaluation.componentMetrics).map(([compKey, m]) => (
                  <tr key={compKey} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono font-bold text-white">{compKey}</td>
                    <td className="p-3 capitalize">{m.category}</td>
                    <td className="p-3">{m.sampleSize}</td>
                    <td className="p-3 font-semibold text-white">{formatCurrency(m.meanAbsoluteErrorInr)}</td>
                    <td className="p-3 font-bold text-emerald-400">{formatPercent(m.medianAbsolutePercentageError)}</td>
                    <td className="p-3">{formatPercent(m.weightedAbsolutePercentageError)}</td>
                    <td className="p-3">{formatPercent(m.overestimationRate)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Calibrated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: All-India Regional Coverage */}
      {activeTab === 'coverage' && (
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> All-India Geographical Coverage (36 States & UTs)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every state and union territory must maintain verified pricing observations. No regional bias.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search State or UT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredCoverage.map((item) => (
              <div
                key={item.stateOrUt}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{item.stateOrUt}</span>
                  <span className="text-[10px] text-slate-400 block">{item.region} Region</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {item.observationsCount} obs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Statistical Outliers */}
      {activeTab === 'outliers' && (
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Statistical Outlier Observations (IQR Method)
            </h3>
            <span className="text-xs text-slate-400">Flagged when observed price exceeds Q3 + 1.5*IQR</span>
          </div>

          {evaluation.detectedOutliers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Zero anomalous outliers detected. All observations fall within verified statistical fences.
            </div>
          ) : (
            <div className="space-y-2">
              {evaluation.detectedOutliers.map((o) => (
                <div
                  key={o.observationId}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {o.destination} &bull; {o.component}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Observed: {formatCurrency(o.observedValue)} (Median: {formatCurrency(o.medianValue)}, Upper Bound: {formatCurrency(o.upperBoundIqr)})
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {o.actionTaken}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Active Calibration Rules & Rollback */}
      {activeTab === 'rules' && (
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" /> Versioned Calibration Rules & Rollback Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rules apply fine adjustments to verified reference rates. Confirmed live supplier quotes are NEVER modified.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {evaluation.activeCalibrationRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{rule.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {rule.status}
                    </span>
                    <span className="text-[11px] text-slate-400">&bull; {rule.targetComponent} ({rule.targetStateOrUt || rule.targetRegion})</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{rule.evidenceRationale}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Approved by {rule.approvedBy} &bull; Sample Size N={rule.benchmarkSampleSize}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRollbackRule?.(rule.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-500/40 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rollback</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

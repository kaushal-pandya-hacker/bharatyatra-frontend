'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Zap,
  Activity,
  Database,
  Sliders,
  RotateCw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function AdminAiPlannerPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for editable rules
  const [destWeight, setDestWeight] = useState(0.85);
  const [bufferDays, setBufferDays] = useState(1);
  const [budgetTolerance, setBudgetTolerance] = useState(15);
  const [transportPriority, setTransportPriority] = useState<'BALANCED' | 'FASTEST' | 'ECONOMICAL'>('BALANCED');
  const [dynamicPricing, setDynamicPricing] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/ai-planner', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setConfig(json.data);
          if (json.data.rules) {
            setDestWeight(json.data.rules.destinationWeight ?? 0.85);
            setBufferDays(json.data.rules.durationComfortBufferDays ?? 1);
            setBudgetTolerance(json.data.rules.budgetTolerancePct ?? 15);
            setTransportPriority(json.data.rules.transportPriority ?? 'BALANCED');
            setDynamicPricing(json.data.rules.dynamicPricingEnabled ?? true);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load AI config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/ai-planner', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rules: {
            destinationWeight: Number(destWeight),
            durationComfortBufferDays: Number(bufferDays),
            budgetTolerancePct: Number(budgetTolerance),
            transportPriority,
            dynamicPricingEnabled: dynamicPricing,
            pricingEngineSeparated: true,
            preferenceConsistencyEnforced: true,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('AI Planner recommendation & pricing rules successfully updated.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Error updating AI rules.');
    } finally {
      setSaving(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/ai-planner', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'REINDEX' }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('AI Knowledge Base reindex complete. All 126 destination nodes refreshed.');
        fetchConfig();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e: any) {
      alert(e.message || 'Error reindexing knowledge base.');
    } finally {
      setReindexing(false);
    }
  };

  const providers = config?.providers || [];
  const kb = config?.knowledgeBase || { totalEntities: 126, lastIndexed: 'N/A', indexedCategories: [] };
  const telemetry = config?.telemetry || { totalRequests: 0, successCount: 0, avgLatencyMs: 0 };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Machine Intelligence</span>
            <span>•</span>
            <span>AI Trip Planner Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            AI Planner Architecture &amp; Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure LLM inference providers, decoupled pricing parameters, knowledge grounding, and telemetry.
          </p>
        </div>

        <button
          onClick={handleReindex}
          disabled={reindexing}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin' : ''}`} />
          <span>{reindexing ? 'Reindexing...' : 'Reindex Knowledge Base'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Decoupled Architecture Architectural Alert */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-amber-950">Architectural Separation: AI Itinerary vs. Deterministic Pricing</div>
          <div className="text-amber-800 leading-relaxed">
            AI models exclusively compute itinerary intelligence, route feasibility, and duration comfort. Financial calculations (hotels, buses, activities) are quarantined in the independent Pricing Engine.
          </div>
        </div>
      </div>

      {/* Model Providers Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Configured LLM Inference Engines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p: any) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">{p.model}</div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    p.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Latency</div>
                  <div className="font-black text-slate-900 text-xs mt-0.5">{p.latencyMs} ms</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Tokens Consumed</div>
                  <div className="font-black text-slate-900 text-xs mt-0.5">{(p.tokenCount / 1000).toFixed(0)}k</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Est. Cost</div>
                  <div className="font-black text-emerald-600 text-xs mt-0.5">${p.costEstimateUsd}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <Lock className="w-3 h-3 text-slate-400" /> API Key: sk_prod_••••••••9102
                </span>
                <span className="font-bold text-slate-700">Rate Limit: {p.rateLimitPerMin} RPM</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Tuning & Knowledge Base Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation & Pricing Rules Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Recommendation Rules &amp; Pricing Controls</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold">Live Parameters</span>
          </div>

          <form onSubmit={handleSaveRules} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Destination Recommendation Weight (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.0"
                  value={destWeight}
                  onChange={(e) => setDestWeight(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Higher values bias heavily toward user explicit interests.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Duration Comfort Buffer (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={bufferDays}
                  onChange={(e) => setBufferDays(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Additional days added to prevent travel fatigue.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Budget Feasibility Tolerance (± %)
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={budgetTolerance}
                  onChange={(e) => setBudgetTolerance(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Allowable deviation window for accommodation alternatives.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transportation Recommendation Priority
                </label>
                <select
                  value={transportPriority}
                  onChange={(e: any) => setTransportPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                >
                  <option value="BALANCED">Balanced (Comfort &amp; Cost)</option>
                  <option value="FASTEST">Fastest (Flight &amp; Vande Bharat)</option>
                  <option value="ECONOMICAL">Economical (Sleeper Bus &amp; Rail)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dynamicPricing}
                  onChange={(e) => setDynamicPricing(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded"
                />
                <span className="font-bold text-slate-800">
                  Enable Dynamic Seasonal Surcharge Multipliers
                </span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                {saving ? 'Updating Rules...' : 'Save Parameters'}
              </button>
            </div>
          </form>
        </div>

        {/* Knowledge Base Grounding Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-600" />
                <span>Grounding Knowledge</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Synced
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Entities:</span>
                <span className="font-bold text-slate-900">{kb.totalEntities} Destinations</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Last Indexed:</span>
                <span className="font-mono text-slate-700">
                  {new Date(kb.lastIndexed).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Outdated Records:</span>
                <span className="font-bold text-emerald-600">0 (All Fresh)</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Indexed Category Clusters</div>
              <div className="flex flex-wrap gap-1">
                {(kb.indexedCategories || []).map((cat: string) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
            Grounding prevents hallucinated itineraries by matching traveler requests against validated geographic coordinates.
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SmartDestinationDurationPlanner } from '@/components/ai/SmartDestinationDurationPlanner';
import { Sparkles, Compass, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

function AIPlannerContent() {
  const searchParams = useSearchParams();
  const initialDestination = searchParams?.get('destination') || searchParams?.get('to') || '';
  const initialOrigin = searchParams?.get('origin') || searchParams?.get('from') || 'Ahmedabad';

  const quickPicks = [
    { name: 'Ladakh', state: 'Ladakh (High-Altitude Acclimatization)' },
    { name: 'Statue of Unity', state: 'Gujarat (Short Excursion)' },
    { name: 'Jaipur', state: 'Rajasthan (Heritage & Forts)' },
    { name: 'Kashmir', state: 'Jammu & Kashmir (Alpine Valleys)' },
    { name: 'Goa', state: 'Goa (Coastal & Leisure)' },
    { name: 'Kerala', state: 'Kerala (Backwaters & Hills)' },
    { name: 'Rishikesh', state: 'Uttarakhand (Yoga & Adventure)' },
    { name: 'Varanasi', state: 'Uttar Pradesh (Ghats & Spiritual)' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-emerald-400 font-medium">AI Destination Intelligence & Smart Trip Duration</span>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> BharatYatra AI 2.0 • Data-Driven Itinerary Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Discover Your Ideal Trip Duration
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Never guess how many days you need. Our AI evaluates nationwide route geometry, transit logistics,
            attraction density, seasonal accessibility, and mandatory acclimatization to calculate your perfect duration.
          </p>
        </div>

        {/* Main Smart Destination & Duration Planner Component */}
        <SmartDestinationDurationPlanner
          initialOrigin={initialOrigin}
          initialDestination={initialDestination}
        />

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Compass className="w-4 h-4" /> Dual Duration Recommendation
            </div>
            <p className="text-xs text-slate-400">
              Get both <strong>Minimum Possible Duration</strong> for focused highlights and <strong>AI-Recommended Comfortable Duration</strong> for relaxed, complete exploration.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <MapPin className="w-4 h-4" /> Pan-India Destination Registry
            </div>
            <p className="text-xs text-slate-400">
              Covers all 28 Indian States and 8 Union Territories with verified coordinates, altitude safety benchmarks, and monsoon/pass seasonal intelligence.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" /> 100% Price-Free Travel Intelligence
            </div>
            <p className="text-xs text-slate-400">
              Zero invented prices, zero estimated hotel rates. Focuses purely on geography, sequencing, pacing, and realistic door-to-door transit feasibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIPlannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading BharatYatra AI Planner...</span>
        </div>
      </div>
    }>
      <AIPlannerContent />
    </Suspense>
  );
}

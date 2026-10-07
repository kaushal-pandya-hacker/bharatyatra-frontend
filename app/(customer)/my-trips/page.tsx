'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Plus, Users, ShieldCheck, Sparkles, Trash2, CheckCircle2, Clock, Calculator, Receipt, Compass, Car, DollarSign, HelpCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LiveGroundRadar, Waypoint } from '@/components/dashboard/live-ground-radar';
import { getSavedTrips, deleteSavedTrip, TripItem } from '@/lib/trips/trip-storage';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';

export default function MyTripsPage() {
  return (
    <ProtectedRoute>
      <MyTripsContent />
    </ProtectedRoute>
  );
}

function MyTripsContent() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const loaded = getSavedTrips();
    setTrips(loaded);
    setLoading(false);
  }, []);

  const handleDelete = (tripId: string) => {
    const updated = deleteSavedTrip(tripId);
    setTrips(updated);
  };

  const activeTrip = trips.find((t) => t.status === 'ACTIVE') || trips[0];

  // Helper to generate waypoint radar elements from active trip
  const getWaypointsForTrip = (trip: TripItem): Waypoint[] => {
    if (trip.nodes && trip.nodes.length > 0) {
      return trip.nodes.map((node, i) => {
        const isFirst = i === 0;
        const isSecond = i === 1;
        return {
          id: `wp-${i}`,
          name: node.title.split('&')[0].replace(/Arrival|Transit|Excursion|Walk|Gate|VIP/gi, '').trim().toUpperCase().substring(0, 16) || `STOP ${i + 1}`,
          coords: i === 0 ? '23.0225° N' : i === 1 ? '21.8380° N' : i === 2 ? '20.8880° N' : i === 3 ? '22.2442° N' : '23.7337° N',
          meta: isFirst ? 'Clear 28°C • Vector Active' : isSecond ? 'Golden Hour 18:14' : 'Radar Optimal',
          status: isFirst ? 'completed' : isSecond ? 'active' : 'upcoming',
        };
      });
    }

    return [
      { id: '1', name: 'AHMEDABAD', coords: '23.0225° N', meta: 'Clear 28°C • Vector Active', status: 'completed' },
      { id: '2', name: 'STATUE OF UNITY', coords: '21.8380° N', meta: 'Golden Hour 18:14', status: 'active' },
      { id: '3', name: 'SOMNATH', coords: '20.8880° N', meta: 'Coastal Radar Optimal', status: 'upcoming' },
      { id: '4', name: 'DWARKA', coords: '22.2442° N', meta: 'Gulf Breeze 10kt', status: 'upcoming' },
      { id: '5', name: 'RANN OF KUTCH', coords: '23.7337° N', meta: 'Salt Desert Buffer Active', status: 'upcoming' },
    ];
  };

  return (
    <div className="w-full min-h-screen bg-[#0A1128] text-white font-body-md py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* Header Ribbon - Dark Navy Theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3656] pb-6 bg-[#141A32] p-6 rounded-2xl border shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Gujarat Live Travel Command Console</span>
            </div>
            <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight flex items-center gap-3">
              <span>My Travel</span> <span className="text-amber-400 font-extrabold">Dashboard</span>
              {user && (
                <span className="text-xs bg-[#0A1128] text-slate-300 font-normal px-3 py-1 rounded-full border border-[#2A3656]">
                  Logged in as {user.fullName || user.email}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              View, manage, and track your active and upcoming Gujarat itineraries in real-time.
            </p>
          </div>

          <Link
            href="/plan"
            className="px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-all shadow-md inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create &amp; Plan New Trip</span>
          </Link>
        </div>

        {/* 🚀 QUICK ACTION COMMAND TOOLBAR - Dark Navy Theme */}
        <section className="bg-[#141A32] border border-[#2A3656] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3656] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Quick Travel Tools Console
              </h2>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 font-mono transition-colors self-start sm:self-auto"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showGuide ? 'Hide First-Time Guide' : 'Show How It Works'}</span>
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* QUICK LAUNCH CHIPS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
            <Link
              href="/trips/1/expenses"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A1128] hover:bg-[#1E294B] text-white border border-[#2A3656] hover:border-amber-500/50 transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 transition-colors">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Group Splitter</span>
                <span className="text-[9px] text-slate-400 font-mono truncate">Split Bill</span>
              </div>
            </Link>

            <Link
              href="/trips/1/settle"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A1128] hover:bg-[#1E294B] text-white border border-[#2A3656] hover:border-emerald-500/50 transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Instant Settle</span>
                <span className="text-[9px] text-slate-400 font-mono truncate">1-Click UPI</span>
              </div>
            </Link>

            <Link
              href="/trips/1"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A1128] hover:bg-[#1E294B] text-white border border-[#2A3656] hover:border-blue-500/50 transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 transition-colors">
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Trip Console</span>
                <span className="text-[9px] text-slate-400 font-mono truncate">Live Command</span>
              </div>
            </Link>

            <Link
              href="/trips/road-trip"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A1128] hover:bg-[#1E294B] text-white border border-[#2A3656] hover:border-purple-500/50 transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 transition-colors">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Road Trip</span>
                <span className="text-[9px] text-slate-400 font-mono truncate">Vehicle Fuel</span>
              </div>
            </Link>

            <Link
              href="/trips/1/cost"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0A1128] hover:bg-[#1E294B] text-white border border-[#2A3656] hover:border-rose-500/50 transition-all group shadow-sm"
            >
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Budget AI</span>
                <span className="text-[9px] text-slate-400 font-mono truncate">Cost Analytics</span>
              </div>
            </Link>
          </div>

          {/* FIRST-TIME USER HELP BANNER */}
          {showGuide && (
            <div className="mt-3 p-4 rounded-xl bg-[#0A1128] border border-amber-500/30 text-slate-200 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Info className="w-4 h-4 text-amber-400" />
                  Why BharatYatra is the Ultimate Travel Companion:
                </span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded font-mono uppercase shadow-sm">
                  Zero Setup Needed
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-300">
                <div className="bg-[#141A32] p-3 rounded-lg border border-[#2A3656] shadow-sm">
                  <strong className="text-amber-400 block mb-0.5">1. AI Smart Itinerary Planner</strong>
                  Plan custom Gujarat &amp; India road trips with automatic waypoint GPS &amp; live radar.
                </div>
                <div className="bg-[#141A32] p-3 rounded-lg border border-[#2A3656] shadow-sm">
                  <strong className="text-amber-400 block mb-0.5">2. Automated Group Expense Splitter</strong>
                  Add group expenses, auto-calculate who owes whom, and settle with 1-click UPI payments.
                </div>
                <div className="bg-[#141A32] p-3 rounded-lg border border-[#2A3656] shadow-sm">
                  <strong className="text-amber-400 block mb-0.5">3. Live Expedition Radar</strong>
                  Track weather, coastal breezes, and route checkpoints live in real-time.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ACTIVE TRIP SPOTLIGHT & RADAR */}
        {activeTrip && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  Active Live Expedition
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
                  ● IN PROGRESS
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">TRIP ID: #{activeTrip.tripId}</span>
            </div>

            {/* Live Radar Component */}
            <LiveGroundRadar
              title={`PRIMARY MERIDIAN STREAM // ${activeTrip.title.toUpperCase()}`}
              waypoints={getWaypointsForTrip(activeTrip)}
              syncPercent="99.8%"
            />

            {/* Active Trip Overview Card - Dark Navy Theme */}
            <div className="bg-[#141A32] rounded-2xl border border-[#2A3656] p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold rounded uppercase border border-amber-500/30">
                    {activeTrip.selectedTier ? `${activeTrip.selectedTier} Tier` : 'Luxury Tier'}
                  </span>
                  <span className="text-xs text-slate-400">• {activeTrip.durationDays} Days / {activeTrip.durationDays - 1} Nights</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{activeTrip.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <strong>Destination:</strong> {activeTrip.destination}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <strong>Start Date:</strong> {activeTrip.startDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <strong>Travelers:</strong> {activeTrip.crewType || `${activeTrip.travellerCount} Pax`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-[#2A3656] pt-4 lg:pt-0 lg:pl-6">
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Package Cost</span>
                  <span className="text-2xl font-extrabold text-amber-400 font-mono">
                    ₹{activeTrip.budgetInr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Link
                    href="/trips/1"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <span>Open Trip Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/plan?destination=${encodeURIComponent(activeTrip.destination)}`}
                    className="px-3.5 py-2.5 bg-[#0A1128] hover:bg-[#1E294B] text-slate-200 font-bold text-xs rounded-xl transition-all border border-[#2A3656]"
                  >
                    Customize
                  </Link>
                  <button
                    onClick={() => handleDelete(activeTrip.tripId)}
                    className="p-2.5 bg-red-950/60 hover:bg-red-900/60 text-red-400 rounded-xl transition-all border border-red-500/30"
                    title="Cancel/Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ALL SAVED TRIPS LIST */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-[#2A3656] pb-4">
            <h2 className="text-xl font-bold text-white">All Saved &amp; Scheduled Itineraries</h2>
            <span className="text-xs font-semibold text-slate-300 bg-[#141A32] px-2.5 py-1 rounded-lg border border-[#2A3656]">
              {trips.length} Total Trips
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium">Loading trips...</div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((t) => (
                <div
                  key={t.tripId}
                  className="bg-[#141A32] rounded-3xl overflow-hidden border border-[#2A3656] flex flex-col group shadow-lg hover:shadow-2xl hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 relative"
                >
                  <div className="relative h-48 overflow-hidden bg-[#0A1128]">
                    <img
                      src={t.image || '/bhuj-kutch-bg.jpg'}
                      alt={t.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase rounded shadow font-mono">
                        {t.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(t.tripId)}
                      className="absolute top-3 right-3 p-1.5 bg-[#0A1128]/80 text-slate-300 hover:text-red-400 rounded-lg backdrop-blur-md transition-colors border border-[#2A3656] shadow-sm"
                      title="Delete trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white font-semibold bg-[#0A1128]/80 px-2.5 py-1 rounded-lg backdrop-blur-md border border-[#2A3656]">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" />
                      <span>{t.destination}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                        {t.title}
                      </h3>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>{t.startDate} ({t.durationDays} Days)</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-400">
                          <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{t.crewType || `${t.travellerCount} Travellers`}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#2A3656]">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Fare</span>
                        <span className="text-lg font-extrabold text-amber-400 font-mono">₹{t.budgetInr.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/trips/1"
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 shadow-md"
                        >
                          <span>Open Trip</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#141A32] rounded-2xl border border-[#2A3656] shadow-xl space-y-4">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No active trips found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a package or plan your custom trip to populate your dashboard!
              </p>
              <Link
                href="/plan"
                className="inline-block px-5 py-2.5 bg-amber-500 text-slate-950 text-xs font-extrabold rounded-xl hover:bg-amber-400 transition-colors shadow-md"
              >
                Plan a Trip Now
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

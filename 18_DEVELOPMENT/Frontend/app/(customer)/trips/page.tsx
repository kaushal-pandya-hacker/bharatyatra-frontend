'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  Trash2,
  Clock,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Compass,
  Route,
  Search,
  Wallet,
  Zap,
  Navigation,
  ChevronRight,
} from 'lucide-react';
import { ProvenanceTag } from '@/components/ai/provenance-tag';
import { LiveGroundRadar, Waypoint } from '@/components/dashboard/live-ground-radar';
import { getSavedTrips, deleteSavedTrip, fetchUserTripsFromApi, TripItem, CanonicalTripStatus } from '@/lib/trips/trip-storage';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';

const CURATED_CIRCUITS = [
  {
    id: 'kutch-circuit',
    title: 'Kutch Desert & Saurashtra Royal Circuit',
    route: 'Ahmedabad → Bhuj → Dhordo Rann → Mandvi → Sasan Gir',
    days: '6 Days / 5 Nights',
    groupSize: '4-10 Travelers',
    budget: '₹24,800',
    tag: 'Royal Heritage',
    image: '/bhuj-kutch-bg.jpg',
    highlights: ['White Desert Sunset', 'Mandvi Coastal Palace', 'Sasan Gir Safari'],
    planUrl: '/plan?destination=Kutch',
  },
  {
    id: 'dwarka-somnath-circuit',
    title: 'Dwarka & Somnath Coastal Pilgrimage',
    route: 'Rajkot → Dwarka → Porbandar → Somnath',
    days: '5 Days / 4 Nights',
    groupSize: '2-8 Travelers',
    budget: '₹18,500',
    tag: 'Sacred Circuit',
    image: '/dwarka-temple-bg.jpg',
    highlights: ['Dwarkadhish VIP Darshan', 'Somnath Light & Sound Show', 'Arabian Sea Coastal Drive'],
    planUrl: '/plan?destination=Dwarka',
  },
  {
    id: 'gir-safari-circuit',
    title: 'Gir Forest & Wildlife Safari Expedition',
    route: 'Rajkot → Sasan Gir → Devalia Safari Park',
    days: '4 Days / 3 Nights',
    groupSize: '2-6 Travelers',
    budget: '₹16,200',
    tag: 'Wildlife Safari',
    image: '/gir-national-park-bg.jpg',
    highlights: ['Asiatic Lion Safari', 'Certified Naturalist Guide', 'Forest Eco Lodge'],
    planUrl: '/plan?destination=Gir',
  },
];

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
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadTrips() {
      const data = await fetchUserTripsFromApi((user as any)?.token);
      setTrips(data);
      setLoading(false);
    }
    loadTrips();
  }, [user]);

  const handleDeleteTrip = (tripIdToDelete: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to remove this trip from your vault?')) {
      return;
    }
    const updated = deleteSavedTrip(tripIdToDelete);
    setTrips(updated);
  };

  const activeTrip = trips.find((t) => t.status === 'ACTIVE') || trips.find((t) => t.status === 'UPCOMING') || trips[0];

  const totalTrips = trips.length;
  const upcomingOrActiveCount = trips.filter(
    (t) => t.status === 'UPCOMING' || t.status === 'ACTIVE'
  ).length;
  const uniqueDestinations = new Set(
    trips.map((t) => t.destination || t.destinationCity).filter(Boolean)
  ).size;

  const filteredTrips = trips.filter((t) => {
    if (activeTab !== 'ALL' && t.status !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (t.title || '').toLowerCase();
    const dest = (t.destination || t.destinationCity || '').toLowerCase();
    const orig = (t.originCity || '').toLowerCase();
    return title.includes(q) || dest.includes(q) || orig.includes(q);
  });

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
      { id: '1', name: (trip.originCity || 'AHMEDABAD').toUpperCase(), coords: '23.0225° N', meta: 'Clear 28°C • Vector Active', status: 'completed' },
      { id: '2', name: (trip.destinationCity || trip.destination || 'DWARKA').toUpperCase(), coords: '22.2442° N', meta: 'Coastal Radar Optimal', status: 'upcoming' },
    ];
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Brand & Command Center Header Banner */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Logo and Brand Title Block */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-sm border border-slate-200/90 group transition-transform hover:scale-105">
                <img
                  src="/logo.png"
                  alt="BharatYatra Official Logo"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-0.5 text-[11px] font-bold text-amber-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    SOVEREIGN TRIP COMMAND HUB // LIVE TELEMETRY
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                    <ShieldCheck className="h-3 w-3" /> Verified Engine
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight flex flex-wrap items-center gap-3">
                  <span>My Trips &amp; Journey Vault</span>
                  {user && (
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {user.fullName || user.email}
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                  Command, optimize, and review your Indian travel itineraries, real-time ground telemetry, and multi-payer group expense balances.
                </p>
              </div>
            </div>

            {/* Top Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-center shrink-0">
              <Link
                href="/packages"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs"
              >
                <Compass className="h-4 w-4 text-slate-500" /> Explore Circuits
              </Link>
              <Link
                href="/plan"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-all hover:shadow"
              >
                <PlusCircle className="h-4 w-4" /> Plan &amp; Start New Trip
              </Link>
            </div>
          </div>

          {/* Travel Intelligence Metrics Strip (4 Stat Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Expeditions</span>
                <Route className="h-4 w-4 text-brand-primary" />
              </div>
              <div className="text-2xl font-extrabold font-heading text-slate-900">{totalTrips}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Lifetime saved itineraries</div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active / Upcoming</span>
                <Clock className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold font-heading text-slate-900">{upcomingOrActiveCount}</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Ground-sync ready
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Destinations</span>
                <MapPin className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold font-heading text-slate-900">
                {uniqueDestinations > 0 ? uniqueDestinations : '36 States'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Pan-India coverage</div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">AI Sentinel</span>
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>
              <div className="text-2xl font-extrabold font-heading text-slate-900">99.8%</div>
              <div className="text-[11px] text-violet-700 font-medium mt-0.5">Neural route optimizer</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((tab) => {
              const count = tab === 'ALL' ? trips.length : trips.filter((t) => t.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    activeTab === tab
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab === 'ALL' ? 'All Journeys' : tab}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeTab === tab ? 'bg-slate-800 text-amber-400 font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by city, route, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-primary focus:outline-hidden shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Active Trip Ground Radar Stream */}
        {activeTrip && activeTab === 'ALL' && !searchQuery && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Trip Radar Stream ({activeTrip.status})
              </h2>
              <span className="text-xs text-slate-500 font-mono">ID: {activeTrip.id || activeTrip.tripId}</span>
            </div>

            <LiveGroundRadar
              title={`LIVE GROUND RADAR // ${activeTrip.title.toUpperCase()}`}
              waypoints={getWaypointsForTrip(activeTrip)}
              syncPercent="99.8%"
            />
          </section>
        )}

        {/* Trips Grid or Elevated Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
              <span className="text-xs font-semibold text-slate-600">Synchronizing trip vault...</span>
            </div>
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrips.map((trip) => {
              const statusBadgeColor =
                trip.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : trip.status === 'UPCOMING'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : trip.status === 'COMPLETED'
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : trip.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300';

              const tripKey = trip.tripId || trip.id || `trip-${Math.random()}`;

              return (
                <div
                  key={tripKey}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusBadgeColor}`}>
                            {trip.status}
                          </span>
                          <ProvenanceTag type="AI_SUGGESTED" />
                        </div>
                        <h3 className="text-lg font-bold font-heading text-slate-900 group-hover:text-brand-primary transition-colors">
                          {trip.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleDeleteTrip(trip.tripId || trip.id!)}
                        title="Remove trip from vault"
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        <span className="font-semibold text-slate-900 truncate">
                          {trip.originCity ? `${trip.originCity} → ${trip.destination}` : trip.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        <span>{trip.startDate} ({trip.durationDays} Days)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        <span>{trip.crewType || `${trip.travelers || trip.travellerCount || 2} Guests`}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-700">₹{(trip.budgetInr || 25000).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/trips/${trip.id || trip.tripId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
                      >
                        Command Center <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/trips/${trip.id || trip.tripId}/expenses`}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 hover:underline"
                      >
                        <Wallet className="h-3 w-3 text-slate-400" /> Split Ledger
                      </Link>
                    </div>

                    <Link
                      href={`/plan?destination=${encodeURIComponent(trip.destination || '')}`}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Modify Plan
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Elevated Empty State & Ready-to-Deploy Recommended Circuits */
          <div className="space-y-10">
            {/* Main Empty State Hero Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-b from-white via-slate-50/50 to-amber-50/30 p-8 sm:p-12 text-center shadow-xs">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-md border border-slate-200/80 mb-6">
                <img
                  src="/logo.png"
                  alt="BharatYatra Logo"
                  className="h-full w-auto object-contain"
                />
              </div>

              <div className="max-w-2xl mx-auto space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
                  <Sparkles className="h-3.5 w-3.5" /> India&apos;s #1 AI Travel Engine
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                  {searchQuery
                    ? `No trips found matching "${searchQuery}"`
                    : activeTab === 'ALL'
                    ? 'Your Next Indian Odyssey Begins Here'
                    : activeTab === 'UPCOMING'
                    ? 'No Upcoming Expeditions Scheduled'
                    : activeTab === 'COMPLETED'
                    ? 'No Completed Expeditions in Vault'
                    : 'No Trips Found in this Category'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {searchQuery
                    ? 'Try adjusting your search terms or clear the filter to see all your itineraries.'
                    : 'Harness BharatYatra\'s sovereign AI intelligence to design verified day-by-day itineraries, allocate vehicle telematics, and split group costs with mathematical precision.'}
                </p>

                {/* Primary Dual Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm hover:shadow transition-all"
                  >
                    <Sparkles className="h-4 w-4" /> Plan Your First Trip with AI
                  </Link>
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
                  >
                    <Compass className="h-4 w-4 text-slate-500" /> Browse Verified Packages
                  </Link>
                </div>
              </div>
            </div>

            {/* Popular Ready-to-Deploy Recommended Circuits Section */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-brand-primary" />
                    <span>Featured Ready-to-Deploy Expeditions</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Popular verified itineraries complete with pre-calculated routing, tempo traveller logistics, and heritage stays.
                  </p>
                </div>
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline self-start sm:self-auto"
                >
                  View All Packages <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CURATED_CIRCUITS.map((circuit) => (
                  <div
                    key={circuit.id}
                    className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Circuit Image Banner */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                      <img
                        src={circuit.image}
                        alt={circuit.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-slate-900 shadow-xs">
                          <Sparkles className="h-3 w-3 text-brand-primary" /> {circuit.tag}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-[11px] font-semibold text-amber-300">{circuit.days}</div>
                        <h4 className="text-sm font-bold font-heading leading-snug drop-shadow-xs">
                          {circuit.title}
                        </h4>
                      </div>
                    </div>

                    {/* Circuit Details */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start gap-1.5 text-xs text-slate-600">
                          <Navigation className="h-3.5 w-3.5 text-brand-primary shrink-0 mt-0.5" />
                          <span className="font-medium leading-relaxed">{circuit.route}</span>
                        </div>

                        {/* Highlights Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {circuit.highlights.map((h) => (
                            <span
                              key={h}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                            >
                              <CheckCircle className="h-2.5 w-2.5 text-emerald-600" /> {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing and Action */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Forecast</div>
                          <div className="text-base font-extrabold font-heading text-slate-900">{circuit.budget}</div>
                        </div>

                        <Link
                          href={circuit.planUrl}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-brand-primary px-3.5 py-2 text-xs font-bold text-white transition-all shadow-xs group-hover:bg-brand-primary"
                        >
                          Launch Plan <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Trust & Safety Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-brand-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">24/7 Nexi AI Concierge</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Real-time assistance, live road alerts, and instant local recommendations in multiple languages.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">Verified Ground Operators</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Certified drivers, sanitized tempo travellers, and pre-cleared electronic toll passes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">Zero-Stress Group Split</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Evenly or custom split fuel, food, and stays with minor-unit mathematical precision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

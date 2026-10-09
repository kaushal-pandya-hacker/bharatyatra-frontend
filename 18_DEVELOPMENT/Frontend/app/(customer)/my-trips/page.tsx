'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Plus,
  Users,
  ShieldCheck,
  Sparkles,
  Trash2,
  Calculator,
  Receipt,
  Compass,
  Car,
  DollarSign,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RealTimeRouteMap, RoutePlace } from '@/components/dashboard/real-time-route-map';
import { getSavedTrips, deleteSavedTrip, saveTrip, fetchUserTripsFromApi, TripItem } from '@/lib/trips/trip-storage';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { resolveCityCoordinates } from '@/lib/data/indian-cities';

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
    let isMounted = true;

    async function loadTripsData() {
      // 1. Auto-save any pending trip generated on the /plan page
      try {
        const pendingRaw = localStorage.getItem('chalo_farva_pending_trip');
        if (pendingRaw) {
          const pendingTrip: TripItem = JSON.parse(pendingRaw);
          saveTrip(pendingTrip);
          localStorage.removeItem('chalo_farva_pending_trip');
        }
      } catch {}

      // 2. Fetch authenticated user trips from API or local storage
      try {
        const loaded = await fetchUserTripsFromApi((user as any)?.token);
        if (isMounted) {
          const cleanTrips = loaded.filter(
            (t) => t && t.tripId && !t.tripId.startsWith('demo-trip-') && !t.title?.includes('Sabarkantha')
          );
          setTrips(cleanTrips);
        }
      } catch (err) {
        if (isMounted) {
          setTrips(getSavedTrips());
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTripsData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDelete = (tripId: string) => {
    const updated = deleteSavedTrip(tripId);
    setTrips(updated);
  };

  const activeTrip = trips.find((t) => t.status === 'ACTIVE') || trips[0];

  const getRoutePlacesForTrip = (trip: TripItem): RoutePlace[] => {
    if (trip.routeJson?.stops && Array.isArray(trip.routeJson.stops) && trip.routeJson.stops.length > 0) {
      return trip.routeJson.stops.map((s: any, i: number) => {
        const name = typeof s === 'string' ? s : (s.name || `Stop ${i + 1}`);
        const district = typeof s === 'object' && s.district ? s.district : trip.destination || 'India';
        const coords = typeof s === 'object' && typeof s.lat === 'number' && typeof s.lng === 'number'
          ? { latitude: s.lat, longitude: s.lng }
          : resolveCityCoordinates(name);

        return {
          id: `rp-route-${i}`,
          name,
          district,
          lat: coords.latitude,
          lng: coords.longitude,
          status: i === 0 ? 'completed' : i === 1 ? 'active' : 'upcoming',
        };
      });
    }

    if (trip.nodes && trip.nodes.length > 0) {
      return trip.nodes.map((node, i) => {
        const rawTitle = node.title.includes(':') ? node.title.split(':')[1] : node.title;
        const placeName =
          rawTitle
            ?.split('&')[0]
            ?.replace(/Arrival|Transit|Excursion|Walk|Gate|VIP|Tour|Exploration/gi, '')
            ?.trim() || `Stop ${i + 1}`;
        const district = trip.destination || 'India';
        const coords = resolveCityCoordinates(placeName);
        return {
          id: `rp-${i}`,
          name: placeName,
          district,
          lat: coords.latitude,
          lng: coords.longitude,
          status: i === 0 ? 'completed' : i === 1 ? 'active' : 'upcoming',
        };
      });
    }

    const parts = (trip.destination || 'India').split(/&|•|,|→/).map((s) => s.trim()).filter(Boolean);
    return parts.map((pName, i) => {
      const coords = resolveCityCoordinates(pName);
      return {
        id: `rp-default-${i}`,
        name: pName,
        district: trip.destination || 'India',
        lat: coords.latitude,
        lng: coords.longitude,
        status: i === 0 ? 'completed' : i === 1 ? 'active' : 'upcoming',
      };
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Banner - White & Slate Theme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Gujarat Travel Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>My Travel</span> <span className="text-amber-600 font-black">Dashboard</span>
              {user && (
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200">
                  Logged in as {user.fullName || user.email}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-600">
              Manage your active itineraries, view user-selected places, and open real-time map routes.
            </p>
          </div>

          <Link
            href="/plan"
            className="px-5 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all shadow-sm inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create &amp; Plan New Trip</span>
          </Link>
        </div>

        {/* QUICK ACTION COMMAND TOOLBAR - Light White Theme */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Quick Travel Tools Console
              </h2>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-slate-500 hover:text-amber-700 flex items-center gap-1 transition-colors self-start sm:self-auto font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{showGuide ? 'Hide Guide' : 'Show How It Works'}</span>
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* QUICK LAUNCH CHIPS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            <Link
              href="/trips/1/expenses"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-900 border border-slate-200 hover:border-amber-300 transition-all group shadow-2xs"
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800 transition-colors">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Group Splitter</span>
                <span className="text-[10px] text-slate-500 truncate">Split Bill</span>
              </div>
            </Link>

            <Link
              href="/trips/1/settle"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-900 border border-slate-200 hover:border-emerald-300 transition-all group shadow-2xs"
            >
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 transition-colors">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Instant Settle</span>
                <span className="text-[10px] text-slate-500 truncate">1-Click UPI</span>
              </div>
            </Link>

            <Link
              href="/trips/1"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-900 border border-slate-200 hover:border-blue-300 transition-all group shadow-2xs"
            >
              <div className="p-2 rounded-lg bg-blue-100 text-blue-800 transition-colors">
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Trip Console</span>
                <span className="text-[10px] text-slate-500 truncate">Live Command</span>
              </div>
            </Link>

            <Link
              href="/trips/road-trip"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-900 border border-slate-200 hover:border-purple-300 transition-all group shadow-2xs"
            >
              <div className="p-2 rounded-lg bg-purple-100 text-purple-800 transition-colors">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Road Trip</span>
                <span className="text-[10px] text-slate-500 truncate">Vehicle Fuel</span>
              </div>
            </Link>

            <Link
              href="/trips/1/cost"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-900 border border-slate-200 hover:border-rose-300 transition-all group shadow-2xs"
            >
              <div className="p-2 rounded-lg bg-rose-100 text-rose-800 transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">Budget AI</span>
                <span className="text-[10px] text-slate-500 truncate">Cost Analytics</span>
              </div>
            </Link>
          </div>

          {/* USER HELP BANNER */}
          {showGuide && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-slate-900">
                  <Info className="w-4 h-4 text-amber-600" />
                  Smart Travel Features:
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded uppercase">
                  Ready
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-600">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <strong className="text-amber-700 block mb-0.5">1. Custom Place Itinerary</strong>
                  Select specific places to generate day-by-day itineraries tailored directly to your schedule.
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <strong className="text-amber-700 block mb-0.5">2. Group Expense Settlement</strong>
                  Keep track of group trip costs, calculate shares, and settle balances with instant UPI.
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <strong className="text-amber-700 block mb-0.5">3. Real-Time Interactive Map</strong>
                  View GPS waypoints, interactive route maps, and turn-by-turn navigation without manual searching.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ACTIVE TRIP SPOTLIGHT & REAL-TIME ROUTE MAP */}
        {activeTrip && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                  Active Live Expedition
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase border border-emerald-200">
                  ● ACTIVE PLAN
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">TRIP ID: #{activeTrip.tripId}</span>
            </div>

            {/* Embedded Real-Time Interactive Map Component */}
            <RealTimeRouteMap
              title={`LIVE MAP ROUTE // ${activeTrip.title}`}
              places={getRoutePlacesForTrip(activeTrip)}
            />

            {/* Active Trip Overview Card - White Light Theme */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase border border-amber-200">
                    {activeTrip.selectedTier ? `${activeTrip.selectedTier} Tier` : 'Balanced Comfort'}
                  </span>
                  <span className="text-xs text-slate-500">• {activeTrip.durationDays} Days / {Math.max(0, activeTrip.durationDays - 1)} Nights</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{activeTrip.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <strong>Selected Destinations:</strong> {activeTrip.destination}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <strong>Start Date:</strong> {activeTrip.startDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-600" />
                    <strong>Travelers:</strong> {activeTrip.crewType || `${activeTrip.travellerCount} Pax`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Estimated Cost</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{activeTrip.budgetInr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/plan?destination=${encodeURIComponent(activeTrip.destination)}`}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>Customize Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(activeTrip.tripId)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-200 cursor-pointer"
                    title="Delete Trip"
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
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-lg font-black text-slate-900">All Saved Itineraries</h2>
            <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {trips.length} Total Trips
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 font-medium">Loading trips...</div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((t) => (
                <div
                  key={t.tripId}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 flex flex-col group shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={t.image || '/sasan-gir-bg.jpg'}
                      alt={t.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase rounded shadow-xs">
                        {t.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(t.tripId)}
                      className="absolute top-3 right-3 p-1.5 bg-white/90 text-slate-700 hover:text-red-600 rounded-lg backdrop-blur-sm transition-colors border border-slate-200 shadow-xs cursor-pointer"
                      title="Delete trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" />
                      <span className="truncate max-w-[200px]">{t.destination}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                        {t.title}
                      </h3>
                      <div className="space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>{t.startDate} ({t.durationDays} Days)</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Users className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>{t.crewType || `${t.travellerCount} Travellers`}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Fare</span>
                        <span className="text-base font-black text-slate-900">₹{t.budgetInr.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/plan?destination=${encodeURIComponent(t.destination)}`}
                          className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <span>Open Plan</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No active trips found</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Select places or customize your trip in the AI Planner to view your saved itineraries here!
              </p>
              <Link
                href="/plan"
                className="inline-block px-5 py-2.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors shadow-sm"
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

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { AppGate } from '@/components/auth/AppGate';
import {
  fetchUserTravelProfile,
  TravelProfile,
  calculateProfileCompletionPercentage,
  DEFAULT_TRAVEL_PROFILE,
} from '@/lib/profile/travel-profile';
import { DashboardTravelMap, RouteContract } from '@/components/maps/travel-maps';
import { fetchUserTripsFromApi, TripItem } from '@/lib/trips/trip-storage';
import { resolveCityCoordinates } from '@/lib/data/indian-cities';
import { useDestinationSelection } from '@/lib/tourism/destination-selection-context';

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedDestinations } = useDestinationSelection();

  const [profile, setProfile] = useState<TravelProfile>(DEFAULT_TRAVEL_PROFILE);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Time-of-day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const prof = await fetchUserTravelProfile();
        if (isMounted && prof) {
          setProfile(prof);
          setLoadingProfile(false);

          if (!prof.completed) {
            router.replace('/onboarding/travel-profile');
            return;
          }
        }
      } catch (e) {
        if (isMounted) setLoadingProfile(false);
      }

      try {
        const fetchedTrips = await fetchUserTripsFromApi((user as any)?.token);
        if (isMounted) {
          setTrips(fetchedTrips);
        }
      } catch (err) {
        console.warn('Trips loading fallback:', err);
      } finally {
        if (isMounted) setLoadingTrips(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router, user]);

  const completionPct = calculateProfileCompletionPercentage(profile);
  const userName = profile.fullName
    ? profile.fullName.split(' ')[0]
    : user?.fullName
    ? user.fullName.split(' ')[0]
    : 'Traveler';

  const originCity = profile.origin?.city || 'Dholka, Ahmedabad';
  const originCoords = resolveCityCoordinates(originCity);
  const originState = profile.origin?.state || originCoords.state || 'India';
  const originLat = profile.origin?.latitude || originCoords.latitude;
  const originLng = profile.origin?.longitude || originCoords.longitude;

  // Construct dynamic trip preview from selectedDestinations (Your Trip Picks)
  const picksTrip: TripItem | null = useMemo(() => {
    if (!selectedDestinations || selectedDestinations.length === 0) return null;

    const destNames = selectedDestinations.map((d) => d.displayName || d.name);
    const primaryDest = destNames[0] || 'Selected Places';
    const destCoords = resolveCityCoordinates(primaryDest);

    const stops = selectedDestinations.map((d) => {
      const name = d.displayName || d.name;
      const coords = resolveCityCoordinates(name);
      return {
        name,
        district: d.location || d.stateName || coords.state || 'India',
        lat: coords.latitude,
        lng: coords.longitude,
      };
    });

    return {
      tripId: 'trip-selected-picks',
      id: 'trip-selected-picks',
      title: `${originCity} → ${destNames.join(' & ')} Circuit`,
      destination: primaryDest,
      destinationCity: primaryDest,
      originCity: originCity,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      durationDays: Math.max(3, selectedDestinations.length + 1),
      travelers: profile.typicalTravelers || 2,
      travellerCount: profile.typicalTravelers || 2,
      crewType: 'Traveler Crew',
      selectedTier: 'balanced',
      budgetInr: 25000,
      status: 'PLANNING',
      rawStatus: 'DRAFT',
      version: 1,
      image: selectedDestinations[0]?.imageUrl || '/sasan-gir-bg.jpg',
      routeJson: {
        origin: { name: originCity, latitude: originLat, longitude: originLng },
        destination: { name: primaryDest, latitude: destCoords.latitude, longitude: destCoords.longitude },
        stops: stops.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng, district: s.district })),
      },
      nodes: stops.map((s, idx) => ({
        day: `Day ${idx + 1}`,
        title: `Explore ${s.name}`,
        badge: 'SELECTED PICK',
        detail: `Must-visit experience in ${s.name}, ${s.district}`,
      })),
    };
  }, [selectedDestinations, originCity, originLat, originLng, profile]);

  const hasUserSavedTrip = trips.some((t) => !t.tripId.startsWith('demo-trip-'));

  const effectiveTrips = useMemo(() => {
    if (picksTrip) {
      return [picksTrip, ...trips.filter((t) => t.tripId !== 'trip-selected-picks')];
    }
    return trips;
  }, [trips, picksTrip]);

  // Active / Selected Trip for Map
  const selectedTrip = effectiveTrips.length > 0 ? effectiveTrips[selectedIndex] || effectiveTrips[0] : null;

  // Categorize Trips
  const activeTrips = effectiveTrips.filter((t) => t.status === 'ACTIVE');
  const upcomingTrips = effectiveTrips.filter((t) => t.status === 'UPCOMING' || t.status === 'SAVED' || t.status === 'PLANNING');
  const completedTrips = effectiveTrips.filter((t) => t.status === 'COMPLETED');

  // Next / Primary Journey card
  const primaryTrip = activeTrips[0] || upcomingTrips[0] || effectiveTrips[0] || null;

  // Countdown Calculation
  const getCountdownString = (trip: TripItem | null) => {
    if (!trip) return '';
    if (trip.status === 'ACTIVE') return "You're currently traveling! Live radar stream active.";
    if (trip.status === 'PLANNING') return 'Custom trip picks ready! Click Plan & Save Journey.';

    const now = new Date();
    const start = trip.startDate ? new Date(trip.startDate) : null;
    if (!start || isNaN(start.getTime())) return `Duration: ${trip.durationDays} Days`;

    const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Your journey begins today!";
    return `Your journey begins in ${diffDays} days.`;
  };

  const resolvedOrigin = selectedTrip?.originCity || originCity;
  const resolvedOriginCoords = resolveCityCoordinates(resolvedOrigin);
  const resolvedDest = selectedTrip?.destinationCity || selectedTrip?.destination || 'Destination';
  const resolvedDestCoords = resolveCityCoordinates(resolvedDest);

  const activeRouteContract: RouteContract | undefined = selectedTrip
    ? {
        origin: {
          name: resolvedOrigin,
          lat: resolvedOriginCoords.latitude,
          lng: resolvedOriginCoords.longitude,
          description: `Starting from ${resolvedOrigin}`,
        },
        stops: selectedTrip.routeJson?.stops && Array.isArray(selectedTrip.routeJson.stops) && selectedTrip.routeJson.stops.length > 0
          ? selectedTrip.routeJson.stops.map((s: any) => {
              if (typeof s === 'object' && s.name && typeof s.lat === 'number' && typeof s.lng === 'number') {
                return { name: s.name, lat: s.lat, lng: s.lng, category: 'DESTINATION' };
              }
              const name = typeof s === 'string' ? s : s.name || 'Stop';
              const coords = resolveCityCoordinates(name);
              return { name, lat: coords.latitude, lng: coords.longitude, category: 'DESTINATION' };
            })
          : selectedTrip.nodes && selectedTrip.nodes.length > 0
          ? selectedTrip.nodes.map((n) => {
              const placeName = n.title.includes(':') ? n.title.split(':')[1].trim() : n.title;
              const coords = resolveCityCoordinates(placeName);
              return { name: placeName, lat: coords.latitude, lng: coords.longitude, category: 'DESTINATION' };
            })
          : [{ name: resolvedDest, lat: resolvedDestCoords.latitude, lng: resolvedDestCoords.longitude, category: 'HERITAGE' }],
        destination: {
          name: resolvedDest,
          lat: resolvedDestCoords.latitude,
          lng: resolvedDestCoords.longitude,
          description: `Target: ${resolvedDest}`,
        },
      }
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-100 selection:text-orange-900 font-sans pb-16">
      {/* Navigation Header Bar */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="BharatYatra Logo" className="h-10 w-auto object-contain" />
          <span className="font-black text-xl text-slate-900 tracking-tight">BharatYatra</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/trips"
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">work_history</span>
            <span>Trip History</span>
          </Link>
          <Link
            href="/plan"
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_location_alt</span>
            <span>Plan Next Trip</span>
          </Link>
          <Link
            href="/profile"
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all flex items-center gap-2 px-3 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-lg text-amber-600">account_circle</span>
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTAINER */}
      <main className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-8 space-y-8">
        {/* TOP WELCOME BAR */}
        <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>BharatYatra Personal Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {getGreeting()}, {userName} 👋
            </h1>
            <p className="text-slate-300 text-base font-semibold">
              Your journeys usually start from <strong className="text-amber-400 font-extrabold">{originCity}</strong>.
            </p>
          </div>

          {/* Profile Completion Card widget */}
          {completionPct < 100 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[240px] space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-white">
                <span>Profile Completion</span>
                <span className="text-amber-300">{completionPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <Link
                href="/profile"
                className="text-[11px] font-extrabold text-amber-300 hover:text-amber-200 block text-right pt-1 underline"
              >
                Complete travel profile →
              </Link>
            </div>
          )}
        </section>

        {/* DASHBOARD SPLIT GRID: LEFT CENTERPIECE MAP & RIGHT TRIP DETAILS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: MAP CENTERPIECE */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">map</span>
                  <span>BharatYatra Live Route Map</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Origin: <strong className="text-slate-800">{originCity}, {originState}</strong>
                </p>
              </div>

              {effectiveTrips.length > 1 && (
                <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-xl text-xs font-extrabold overflow-x-auto max-w-xs">
                  {effectiveTrips.map((t, idx) => (
                    <button
                      key={t.id || t.tripId}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                        selectedIndex === idx ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {t.destinationCity || t.destination || `Trip #${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Visual Center Map */}
            <DashboardTravelMap
              originCity={originCity}
              originState={originState}
              originLat={originLat}
              originLng={originLng}
              activeRoute={activeRouteContract}
              height="460px"
            />
          </div>

          {/* RIGHT: TRIP STATUS / NEXT JOURNEY */}
          <div className="lg:col-span-4 space-y-6">
            {effectiveTrips.length === 0 ? (
              /* EMPTY DASHBOARD STATE */
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-3xl">
                  🧭
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Your journeys start here.</h3>
                  <p className="text-sm text-slate-600 font-medium">
                    You&apos;re starting from <strong className="text-blue-700 font-bold">{originCity}</strong>. No upcoming trips planned yet.
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <Link
                    href="/plan"
                    className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-md transition-all flex items-center justify-center gap-2 block"
                  >
                    <span className="material-symbols-outlined">explore</span>
                    <span>Plan Your First Trip</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold text-sm transition-all flex items-center justify-center gap-2 block"
                  >
                    <span className="material-symbols-outlined text-amber-600">edit</span>
                    <span>Edit Travel Profile</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* DASHBOARD WITH SAVED / ACTIVE TRIPS */
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
                      {primaryTrip?.status === 'ACTIVE' ? 'YOU\'RE CURRENTLY TRAVELING' : 'NEXT JOURNEY'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${primaryTrip?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {primaryTrip?.status || 'SAVED'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <span>{primaryTrip?.originCity || originCity}</span>
                      <span className="text-amber-500 font-bold">→</span>
                      <span className="text-blue-700">{primaryTrip?.destinationCity || primaryTrip?.destination}</span>
                    </h3>

                    {/* COUNTDOWN BANNER */}
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-xs font-extrabold text-blue-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-blue-600">event</span>
                      <span>{getCountdownString(primaryTrip)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                        <span>{primaryTrip?.durationDays} Days</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">group</span>
                        <span>{primaryTrip?.travelers || primaryTrip?.travellerCount || 2} Travelers</span>
                      </span>
                    </div>
                  </div>

                  {/* Route Steps Preview */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Canonical Navigation Route</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-800">
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-black">
                        📍 {primaryTrip?.originCity || originCity}
                      </span>
                      {primaryTrip?.routeJson?.stops && Array.isArray(primaryTrip.routeJson.stops) && primaryTrip.routeJson.stops.map((s: any, idx: number) => {
                        const sName = typeof s === 'string' ? s : s.name;
                        return (
                          <React.Fragment key={idx}>
                            <span className="text-amber-500 font-bold">→</span>
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              {sName}
                            </span>
                          </React.Fragment>
                        );
                      })}
                      <span className="text-amber-500 font-bold">→</span>
                      <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-black">
                        🏁 {primaryTrip?.destinationCity || primaryTrip?.destination}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <Link
                      href="/my-trips"
                      className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">navigation</span>
                      <span>🚀 Start Trip & Live Navigation</span>
                    </Link>
                    <Link
                      href={`/trips/${primaryTrip?.id || primaryTrip?.tripId || 'demo-trip-id-123'}`}
                      className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center block"
                    >
                      View Itinerary →
                    </Link>
                  </div>
                </div>

                {/* UPCOMING JOURNEYS LIST */}
                {upcomingTrips.length > 1 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Upcoming Journeys</h4>
                      <Link href="/trips" className="text-xs text-blue-600 font-bold hover:underline">View All ({trips.length})</Link>
                    </div>
                    <div className="space-y-2">
                      {upcomingTrips.slice(1, 4).map((t) => (
                        <Link
                          key={t.id || t.tripId}
                          href={`/trips/${t.id || t.tripId}`}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{t.originCity || originCity} → {t.destination}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{t.startDate} • {t.durationDays} Days</p>
                          </div>
                          <span className="text-xs font-bold text-blue-600">View →</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppGate>
      <DashboardContent />
    </AppGate>
  );
}

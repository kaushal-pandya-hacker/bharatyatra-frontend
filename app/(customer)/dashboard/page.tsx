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
import dynamic from 'next/dynamic';
import type { RouteContract } from '@/components/maps/travel-maps';
import {
  Star,
  Heart,
  MessageSquare,
  CheckCircle,
  ShieldCheck,
  Send,
  Edit,
  RefreshCw,
  X,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';
import { TripCompletionModal } from '@/components/reviews/TripCompletionModal';
import { TripCompletionHelper } from '@/lib/trips/completion-helper';

const DashboardTravelMap = dynamic(
  () => import('@/components/maps/travel-maps').then((m) => m.DashboardTravelMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-80 w-full rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex items-center justify-center">
        <span className="text-xs font-bold text-slate-500">Loading Route Map...</span>
      </div>
    ),
  }
);
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

  // Reviews & Trip Completion State
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [completionModalTrip, setCompletionModalTrip] = useState<TripItem | null>(null);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [customerReplyText, setCustomerReplyText] = useState('');
  const [submittingCustomerReply, setSubmittingCustomerReply] = useState(false);
  const [ongoingNotice, setOngoingNotice] = useState<string | null>(null);

  // Time-of-day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchUserReviews = async () => {
    setLoadingReviews(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token') || localStorage.getItem('token')
          : null;
      const res = await fetch('/api/user/reviews', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setUserReviews(json.data);
      }
    } catch (err) {
      console.warn('Reviews loading fallback:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const prof = await fetchUserTravelProfile();
        if (isMounted && prof) {
          setProfile(prof);
          setLoadingProfile(false);

          if (!prof.completed && prof.onboardingStatus !== 'SKIPPED' && prof.onboardingStatus !== 'COMPLETED') {
            router.replace('/onboarding');
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
    fetchUserReviews();

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
      tripId: 'dynamic-picks-preview',
      id: 'dynamic-picks-preview',
      title: `${selectedDestinations.length} Selected Places`,
      destination: primaryDest,
      destinationCity: primaryDest,
      originCity: originCity,
      startDate: 'Planned Journey',
      durationDays: Math.min(10, Math.max(3, selectedDestinations.length * 2)),
      travelers: profile.typicalTravelers || 2,
      status: 'PLANNING',
      routeJson: { stops },
    };
  }, [selectedDestinations, originCity, profile.typicalTravelers]);

  const effectiveTrips = useMemo(() => {
    if (picksTrip) return [picksTrip, ...trips];
    return trips;
  }, [picksTrip, trips]);

  const selectedTrip: TripItem | undefined =
    effectiveTrips.length > 0
      ? effectiveTrips[selectedIndex] || effectiveTrips[0]
      : undefined;

  const upcomingTrips = useMemo(() => {
    return effectiveTrips.filter((t) => t.status === 'UPCOMING' || t.status === 'ACTIVE' || t.status === 'SAVED');
  }, [effectiveTrips]);

  const primaryTrip = selectedTrip || upcomingTrips[0];

  // Detect any trip awaiting completion confirmation (Section 1)
  const awaitingTrip = useMemo(() => {
    for (const t of trips) {
      const hasReviewed = userReviews.some((r) => r.tripId === t.id || r.tripId === t.tripId);
      const evalResult = TripCompletionHelper.evaluateTrip(t, user?.id, hasReviewed);
      if (evalResult.isAwaitingCustomerConfirmation && !hasReviewed) {
        return t;
      }
    }
    return null;
  }, [trips, user?.id, userReviews]);

  // Handle Trip Completion Confirmation (Section 1)
  const handleConfirmCompletion = async (targetTrip: TripItem, isCompleted: boolean) => {
    const targetId = targetTrip.tripId || targetTrip.id;
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token') || localStorage.getItem('token')
          : null;
      await fetch('/api/user/trips/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tripId: targetId,
          status: isCompleted ? 'COMPLETED' : 'ONGOING',
        }),
      });

      if (isCompleted) {
        setCompletionModalTrip(targetTrip);
        setEditingReview(null);
      } else {
        setOngoingNotice(`Your journey to ${targetTrip.destination} is marked as ongoing. Safe travels!`);
        setTimeout(() => setOngoingNotice(null), 6000);
      }
    } catch (e) {
      if (isCompleted) {
        setCompletionModalTrip(targetTrip);
        setEditingReview(null);
      }
    }
  };

  // Handle Customer Reply in Two-Way Conversation Thread (Section 9)
  const handleSendCustomerReply = async (reviewId: string) => {
    if (!customerReplyText.trim()) return;

    setSubmittingCustomerReply(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token') || localStorage.getItem('token')
          : null;

      const res = await fetch(`/api/user/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: 'REPLY',
          message: customerReplyText.trim(),
        }),
      });

      if (res.ok) {
        setReplyingReviewId(null);
        setCustomerReplyText('');
        fetchUserReviews();
      }
    } catch (err) {
      console.error('Error replying:', err);
    } finally {
      setSubmittingCustomerReply(false);
    }
  };

  // Countdown Helper
  const getCountdownString = (trip?: TripItem) => {
    if (!trip || !trip.startDate || trip.startDate === 'Planned Journey') return 'Explore route below';
    const now = new Date();
    const start = new Date(trip.startDate);
    if (isNaN(start.getTime())) return `Departs on ${trip.startDate}`;

    const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `Departs in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffDays === 0) return '🚀 Journey starts today!';
    return 'Journey underway or completed';
  };

  // Convert selectedTrip to RouteContract for DashboardTravelMap
  const resolvedOrigin = selectedTrip?.originCity || originCity;
  const resolvedDest = selectedTrip?.destinationCity || selectedTrip?.destination || 'Selected Destination';
  const resolvedDestCoords = resolveCityCoordinates(resolvedDest);

  const activeRouteContract: RouteContract | undefined = selectedTrip
    ? {
        origin: {
          name: resolvedOrigin,
          lat: originLat,
          lng: originLng,
          description: `Starting from ${resolvedOrigin}`,
        },
        stops:
          selectedTrip.routeJson?.stops &&
          Array.isArray(selectedTrip.routeJson.stops) &&
          selectedTrip.routeJson.stops.length > 0
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
      {/* Sub-Header Action Bar */}
      <div className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">dashboard</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="hover:text-slate-900 font-medium transition-colors">
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#reviews"
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs border border-amber-200"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>My Reviews ({userReviews.length})</span>
            </a>
            <Link
              href="/trips"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">work_history</span>
              <span>Trip History</span>
            </Link>
            <Link
              href="/plan"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add_location_alt</span>
              <span>Plan Next Trip</span>
            </Link>
          </div>
        </div>
      </div>

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
                href="/onboarding"
                className="text-[11px] font-extrabold text-amber-300 hover:text-amber-200 block text-right pt-1 underline"
              >
                Complete travel profile →
              </Link>
            </div>
          )}
        </section>

        {/* ONGOING NOTICE TOAST */}
        {ongoingNotice && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between">
            <span>🧭 {ongoingNotice}</span>
            <button type="button" onClick={() => setOngoingNotice(null)} className="text-blue-700 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* TRIP COMPLETION CONFIRMATION PROMPT (Section 1) */}
        {awaitingTrip && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 animate-in fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-xl font-bold shadow-md shadow-amber-500/20">
                ❤️
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block">
                  Journey Status Check
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Did you return from your journey to {awaitingTrip.destinationCity || awaitingTrip.destination}?
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Your planned dates were {awaitingTrip.startDate} • {awaitingTrip.durationDays} Days. Let us know
                  if you have completed your journey!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleConfirmCompletion(awaitingTrip, true)}
                className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Yes, my trip is completed</span>
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCompletion(awaitingTrip, false)}
                className="flex-1 md:flex-none px-4 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>My trip is still ongoing</span>
              </button>
            </div>
          </div>
        )}

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
                        selectedIndex === idx
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900'
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
                    You&apos;re starting from <strong className="text-blue-700 font-bold">{originCity}</strong>. No
                    upcoming trips planned yet.
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
                    href="/onboarding"
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
                      {primaryTrip?.status === 'ACTIVE'
                        ? 'YOU\'RE CURRENTLY TRAVELING'
                        : primaryTrip?.status === 'COMPLETED'
                        ? 'COMPLETED VOYAGE'
                        : 'NEXT JOURNEY'}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        primaryTrip?.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : primaryTrip?.status === 'COMPLETED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {primaryTrip?.status || 'SAVED'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <span>{primaryTrip?.originCity || originCity}</span>
                      <span className="text-amber-500 font-bold">→</span>
                      <span className="text-blue-700">
                        {primaryTrip?.destinationCity || primaryTrip?.destination}
                      </span>
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

                  {/* Actions for Primary Trip */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    {/* Share Experience button for completed trips */}
                    {primaryTrip?.status === 'COMPLETED' ? (
                      <button
                        type="button"
                        onClick={() => {
                          const existing = userReviews.find(
                            (r) => r.tripId === (primaryTrip.tripId || primaryTrip.id)
                          );
                          setCompletionModalTrip(primaryTrip);
                          setEditingReview(existing || null);
                        }}
                        className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>Share Your Experience</span>
                      </button>
                    ) : (
                      <Link
                        href="/my-trips"
                        className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">navigation</span>
                        <span>🚀 Start Trip & Live Navigation</span>
                      </Link>
                    )}
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
                      <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                        Upcoming Journeys
                      </h4>
                      <Link href="/trips" className="text-xs text-blue-600 font-bold hover:underline">
                        View All ({trips.length})
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {upcomingTrips.slice(1, 4).map((t) => (
                        <Link
                          key={t.id || t.tripId}
                          href={`/trips/${t.id || t.tripId}`}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {t.originCity || originCity} → {t.destination}
                            </p>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              {t.startDate} • {t.durationDays} Days
                            </p>
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

        {/* SECTION: MY TRAVEL REVIEWS (Section 10) */}
        <section
          id="reviews"
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Star className="w-5 h-5 fill-amber-500" />
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">My Travel Reviews</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Your ratings, memories, and official replies from the BharatYatra operations team.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/reviews"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
              >
                <span>View Public Showcase</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {loadingReviews ? (
            <div className="py-8 text-center text-xs font-bold text-slate-400">
              Loading your travel feedback...
            </div>
          ) : userReviews.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
                ✍️
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No reviews submitted yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When you complete a voyage with BharatYatra, you can rate your stay, recommend favourite spots,
                  and share feedback directly with our operations team.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {userReviews.map((rev) => {
                const hasOfficialReply = Boolean(rev.officialReply);
                const isReplying = replyingReviewId === rev.id;

                return (
                  <div
                    key={rev.id}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">{rev.destination}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">•</span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">Trip #{rev.tripId.slice(0, 10)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s <= rev.overallRating ? 'fill-amber-400' : 'text-slate-300'}`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-800 ml-1">
                            {rev.overallRating}.0
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const matchedTrip = trips.find((t) => (t.tripId || t.id) === rev.tripId) || {
                              tripId: rev.tripId,
                              id: rev.tripId,
                              title: `Voyage to ${rev.destination}`,
                              destination: rev.destination,
                              startDate: rev.tripDates?.startDate || 'Recent',
                              durationDays: rev.tripDates?.durationDays || 3,
                              status: 'COMPLETED',
                            };
                            setCompletionModalTrip(matchedTrip as any);
                            setEditingReview(rev);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-2xs"
                        >
                          <Edit className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Written Feedback */}
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                      &ldquo;{rev.writtenReview}&rdquo;
                    </p>

                    {/* Highlights */}
                    {rev.positiveHighlights && rev.positiveHighlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rev.positiveHighlights.map((p: string) => (
                          <span
                            key={p}
                            className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                          >
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Official BharatYatra Response Box */}
                    {hasOfficialReply && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-blue-900">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Official BharatYatra Response</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {new Date(rev.officialReply.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium pl-4 border-l-2 border-blue-300">
                          &ldquo;{rev.officialReply.message}&rdquo;
                        </p>
                        <div className="text-[10px] text-slate-500 pl-4">
                          — {rev.officialReply.responderName}
                        </div>
                      </div>
                    )}

                    {/* Two-Way Message Thread (Section 9) */}
                    {rev.repliesThread && rev.repliesThread.length > 1 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          Conversation History ({rev.repliesThread.length} messages)
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {rev.repliesThread.map((msg: any) => (
                            <div
                              key={msg.id}
                              className={`p-2.5 rounded-xl text-xs ${
                                msg.sender === 'CUSTOMER'
                                  ? 'bg-slate-100 text-slate-800 ml-6'
                                  : 'bg-blue-50 text-blue-900 mr-6 border border-blue-200'
                              }`}
                            >
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                                <span>{msg.sender === 'CUSTOMER' ? 'You' : msg.senderName}</span>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="font-medium">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reply to Official Response Composer */}
                    {hasOfficialReply && !isReplying && (
                      <button
                        type="button"
                        onClick={() => setReplyingReviewId(rev.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 pt-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply to this response</span>
                      </button>
                    )}

                    {isReplying && (
                      <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>Send follow-up message to BharatYatra Support</span>
                          <button
                            type="button"
                            onClick={() => setReplyingReviewId(null)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            ✕
                          </button>
                        </div>
                        <input
                          type="text"
                          value={customerReplyText}
                          onChange={(e) => setCustomerReplyText(e.target.value)}
                          placeholder="Type your message..."
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={submittingCustomerReply}
                            onClick={() => handleSendCustomerReply(rev.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{submittingCustomerReply ? 'Sending...' : 'Send Reply'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* TRIP COMPLETION & REVIEW MODAL */}
      {completionModalTrip && (
        <TripCompletionModal
          isOpen={true}
          onClose={() => {
            setCompletionModalTrip(null);
            setEditingReview(null);
          }}
          trip={completionModalTrip}
          existingReview={editingReview}
          onReviewSubmitted={() => {
            fetchUserReviews();
          }}
        />
      )}
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

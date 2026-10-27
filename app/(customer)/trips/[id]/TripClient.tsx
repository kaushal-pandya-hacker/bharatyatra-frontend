'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { getSavedTrips, TripItem } from '@/lib/trips/trip-storage';

export default function TripCommandCenterPage({ params }: { params?: { id?: string } } = {}) {
  return (
    <ProtectedRoute>
      <TripCommandCenterContent params={params} />
    </ProtectedRoute>
  );
}

function TripCommandCenterContent({ params }: { params?: { id?: string } } = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const tripId = params?.id || '1';

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [trip, setTrip] = useState<TripItem | null>(null);

  useEffect(() => {
    const allTrips = getSavedTrips();
    let found = allTrips.find((t) => t.id === tripId || t.tripId === tripId);
    if (!found && allTrips.length > 0) {
      if (tripId === 'demo-trip-id-123' || tripId === '1' || !tripId) {
        found = allTrips[0];
      }
    }
    if (found) {
      setTrip(found);
    }
  }, [tripId]);

  const stops = useMemo(() => {
    if (trip?.routeJson?.stops && Array.isArray(trip.routeJson.stops)) {
      return trip.routeJson.stops;
    }
    return [];
  }, [trip]);

  const formatTripDate = (d?: string) => {
    if (!d) return '';
    try {
      const parts = d.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = parseInt(parts[2], 10);
        const month = months[parseInt(parts[1], 10) - 1] || parts[1];
        const year = parts[0];
        return `${day} ${month} ${year}`;
      }
    } catch {}
    return d;
  };

  const displayTitle = trip?.title || 'Kutch Desert & Saurashtra Royal Circuit';
  const displayTravelers = trip?.travelers || trip?.travellerCount || (trip ? 2 : 10);
  const displayDays = trip?.durationDays || 6;
  const displayNights = Math.max(1, displayDays - 1);
  const displayDates = trip?.startDate
    ? `${formatTripDate(trip.startDate)}${trip.endDate ? ` – ${formatTripDate(trip.endDate)}` : ''} (${displayDays} Days / ${displayNights} Nights)`
    : '24 Dec 2026 – 29 Dec 2026 (6 Days / 5 Nights)';
  const displayOrigin = trip?.originCity || 'Ahmedabad';
  const displayDest = trip?.destinationCity || trip?.destination || (stops[stops.length - 1]?.name) || 'India';
  const displayExpeditionId = trip?.tripId || trip?.id || 'GJ-EXP-2026-904';

  const vectorList: string[] = useMemo(() => {
    if (stops.length > 0) {
      const list = [displayOrigin];
      for (const s of stops) {
        if (!list.includes(s.name)) list.push(s.name);
      }
      return list;
    }
    return ['Ahmedabad', 'Bhuj', 'Dhordo Rann', 'Mandvi', 'Sasan Gir'];
  }, [stops, displayOrigin]);

  const vehicleRecommendation = useMemo(() => {
    if (displayTravelers <= 3) return 'AC Sedan / Hatchback';
    if (displayTravelers <= 6) return 'Toyota Innova Crysta';
    if (displayTravelers <= 12) return 'Force Urbania / Tempo Traveller';
    return 'Luxury AC Coach Convoy';
  }, [displayTravelers]);

  const nextWaypoint = stops[0]?.name || displayDest || 'White Rann Sunset Salt Deck';
  const nextWaypointDistrict = stops[0]?.district || displayDest || 'En Route';

  const triggerQuickExpense = () => {
    setToastMessage(`Quick Expense Modal Initialized for ${user?.fullName || 'Traveler'}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(20,26,50,0.06)]">
        <div className="h-20 w-full px-4 lg:px-6 xl:px-8 flex items-center justify-between gap-2 lg:gap-4 shrink-0">
          <div className="flex items-center gap-3 xl:gap-space-lg shrink-0">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group focus:outline-hidden">
              <img
                src="/logo.png"
                alt="BharatYatra Logo"
                className="h-10 w-auto object-contain rounded-md transition-transform group-hover:scale-105 shrink-0"
              />
              <div className="flex flex-col whitespace-nowrap justify-center">
                <span className="text-base font-heading font-black tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                  BHARAT YATRA
                </span>
                <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase leading-none mt-0.5">
                  {trip?.destinationCity ? `${trip.destinationCity} Expedition` : 'Sovereign Travel Engine'}
                </span>
              </div>
            </Link>
            <div className="hidden 2xl:flex items-center gap-space-sm pl-space-md shrink-0">
              <div className="flex items-center gap-space-xs px-3 py-1 rounded-full bg-amber-400/20 text-slate-900 border border-amber-400/30 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold whitespace-nowrap">Active Expedition:</span>
                <span className="text-xs text-slate-800 font-medium truncate max-w-xs">{displayTitle} ({displayTravelers} Travelers)</span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            <Link
              href={`/trips/${tripId}`}
              className="px-3 py-2 transition-colors bg-amber-400 text-slate-950 font-bold rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0 shadow-xs"
            >
              Command Center
            </Link>
            <Link
              href="/trips/road-trip"
              className="px-2.5 xl:px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0"
            >
              Road Trip &amp; Vehicle
            </Link>
            <Link
              href={`/trips/${tripId}/cost`}
              className="px-2.5 xl:px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0"
            >
              Cost &amp; Intelligence
            </Link>
            <Link
              href={`/trips/${tripId}/expenses`}
              className="px-2.5 xl:px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0"
            >
              Group Splitter
            </Link>
            <Link
              href={`/trips/${tripId}/settle`}
              className="px-2.5 xl:px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium rounded-lg text-xs xl:text-sm whitespace-nowrap shrink-0"
            >
              Settlement Optimizer
            </Link>
          </nav>

          <div className="flex items-center gap-2 xl:gap-space-md shrink-0">
            <a
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-800 border border-slate-200 shrink-0 whitespace-nowrap shadow-xs"
              href="tel:+919624282521"
              title="Call Concierge 24/7"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined text-base">support_agent</span>
              </div>
              <div className="flex flex-col text-left leading-tight whitespace-nowrap shrink-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Concierge 24/7</span>
                <span className="text-xs font-black tracking-tight text-slate-900 whitespace-nowrap">+91 96242 82521</span>
              </div>
            </a>
            <Link href="/profile" className="flex items-center gap-2.5 pl-1 group shrink-0 whitespace-nowrap">
              <div className="flex flex-col text-right hidden sm:flex leading-tight whitespace-nowrap shrink-0">
                <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors whitespace-nowrap">
                  {user?.fullName || 'Kaushal Pandya'}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Verified Voyager
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md ring-2 ring-white shrink-0">
                {user?.fullName
                  ? user.fullName
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'KP'}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 bg-surface-container-lowest z-40 hidden md:flex flex-col py-space-md px-space-sm shadow-[0_1px_8px_rgba(20,26,50,0.04)]">
        <div className="px-space-sm mb-space-md">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
            Circuit Navigation
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <Link
            href={`/trips/${tripId}`}
            className="flex items-center gap-space-sm px-3 py-2.5 transition-all bg-primary-container text-on-primary-container font-semibold rounded-lg"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span className="font-label-lg text-label-lg">Command Center</span>
          </Link>
          <Link
            href="/trips/road-trip"
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">rv_hookup</span>
            <span className="font-label-lg text-label-lg">Road Trip &amp; Vehicle</span>
          </Link>
          <Link
            href={`/trips/${tripId}/cost`}
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">insights</span>
            <span className="font-label-lg text-label-lg">Cost &amp; Intelligence</span>
          </Link>
          <Link
            href={`/trips/${tripId}/expenses`}
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">group</span>
            <span className="font-label-lg text-label-lg">Group Splitter</span>
          </Link>
          <Link
            href={`/trips/${tripId}/settle`}
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            <span className="font-label-lg text-label-lg">Settlement Optimizer</span>
          </Link>
        </nav>
        <div className="mt-auto p-space-sm rounded-xl bg-surface-container-low">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="material-symbols-outlined text-primary text-base">verified</span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">{trip?.destinationCity || displayDest} Concierge</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Sovereign toll clearance, fuel forecasts, and road telemetry active.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="md:pl-64">
        <main className="relative pt-20 bg-surface min-h-screen w-full px-space-gutter">
          <div className="flex flex-col w-full pb-16">
            {/* CIRCUIT CONTEXT & EXPEDITION BREADCRUMB BAR */}
            <section className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mb-space-md">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-on-primary-fixed-variant font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    {trip ? `${trip.status || 'Active'} • Day 1 of ${displayDays} • ${displayDest}` : 'Day 2 of 6 • Live in Dhordo, Kutch'}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">|</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    {displayExpeditionId}
                  </span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
                    {displayTitle}
                  </h1>
                  <span className="material-symbols-outlined text-amber-500 text-2xl" title="Sovereign Verified Route">
                    verified
                  </span>
                </div>
                <p className="font-body-md text-body-md text-slate-600 mt-1">
                  {displayDates} • {displayTravelers} Travelers • Lead Voyager:{' '}
                  <span className="font-semibold text-slate-900">{user?.fullName || 'Traveler'}</span>
                </p>
              </div>

              {/* Live Vector Strip & Quick Badge */}
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700 font-medium">
                  <span className="font-bold text-slate-900 flex items-center gap-1 pr-1">
                    <span className="material-symbols-outlined text-amber-500 text-sm">route</span>
                    Vector:
                  </span>
                  {vectorList.map((pt, pIdx) => (
                    <React.Fragment key={pIdx}>
                      {pIdx > 0 && <span className="material-symbols-outlined text-slate-400 text-xs">arrow_forward</span>}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        pIdx === 0
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : pIdx === 1
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                          : 'bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100'
                      }`}>
                        {pt}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-900 border border-slate-200">
                  <span className="material-symbols-outlined text-amber-600 text-base">directions_car</span>
                  <span className="text-xs uppercase font-extrabold tracking-tight">
                    {vehicleRecommendation}
                  </span>
                </div>
              </div>
            </section>

            {/* LUXURY NAV TABS SUB-ROUTING */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-space-sm mb-space-lg no-scrollbar">
              <Link
                href={`/trips/${tripId}`}
                className="px-4 py-2 rounded-xl bg-on-secondary-fixed text-primary-container font-label-lg text-label-lg font-semibold shadow-md flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">dashboard_customize</span> Command Center
              </Link>
              <Link
                href="/trips/road-trip"
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">travel_explore</span> Road Trip &amp; Telemetry
              </Link>
              <Link
                href={`/trips/${tripId}/cost`}
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">finance_mode</span> Cost Intelligence
              </Link>
              <Link
                href={`/trips/${tripId}/expenses`}
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">receipt_long</span> Group Expenses
              </Link>
              <Link
                href={`/trips/${tripId}/settle`}
                className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg font-medium transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">handshake</span> Settlement Optimizer
              </Link>
            </div>

            {/* SIGNATURE TRIP INTELLIGENCE MASTER BANNER */}
            <section className="relative w-full rounded-2xl bg-on-secondary-fixed text-on-primary p-space-lg shadow-xl mb-space-xl overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col gap-space-lg">
                {/* Banner Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border-b border-surface-container-highest/10 pb-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-xl bg-white/10 p-2 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20">
                      <img
                        alt="BharatYatra Logo"
                        className="w-full h-full object-contain rounded-md"
                        src="/logo.png"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                          {trip ? `${displayDest} Trip Intelligence` : 'Bharat Yatra Trip Intelligence'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-fixed text-label-caps font-bold uppercase tracking-wider">
                          Active Sentinel
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/70">
                        Real-time synchronization across {displayTravelers} travelers, onboard GPS, route waypoint alerts &amp; expense clearing.
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Quick Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <button
                      className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary-fixed text-on-primary-fixed font-label-lg text-label-lg font-bold transition-all shadow-[0_0_20px_-2px_rgba(254,214,91,0.4)] flex items-center gap-1.5 cursor-pointer"
                      onClick={triggerQuickExpense}
                    >
                      <span className="material-symbols-outlined text-base">add_circle</span> Add Expense
                    </button>
                    <Link
                      href="/plan"
                      className="px-4 py-2.5 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest font-label-lg text-label-lg font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-primary-container text-base">auto_awesome</span> Optimize My Day
                    </Link>
                    <Link
                      href={`/trips/${tripId}/settle`}
                      className="px-4 py-2.5 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest font-label-lg text-label-lg font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">currency_exchange</span> Simplify Settlements
                    </Link>
                    <a
                      className="px-3 py-2.5 rounded-xl bg-error/80 hover:bg-error text-on-error font-label-md text-label-md font-bold transition-all flex items-center gap-1"
                      href="tel:112"
                    >
                      <span className="material-symbols-outlined text-base">fmd_bad</span> SOS Ground
                    </a>
                  </div>
                </div>

                {/* Telemetry Multi-Split Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                  {/* Circuit Disbursal */}
                  <div className="rounded-xl bg-surface-container-lowest/5 p-space-md backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Circuit Disbursal</span>
                      <span className="material-symbols-outlined text-primary-container text-lg">account_balance_wallet</span>
                    </div>
                    <div>
                      <div className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-white">
                        ₹{(trip ? Math.round(trip.budgetInr * 0.4) : 15000).toLocaleString('en-IN')}
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        Spent by {Math.min(displayTravelers, 5)} Contributors • <span className="text-primary-container font-semibold">₹{Math.round((trip?.budgetInr || 25000) / displayTravelers).toLocaleString('en-IN')}/head</span> fair share
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-caps text-label-caps text-surface-container-high/70">
                      <span>Outstanding: ₹{Math.round((trip?.budgetInr || 25000) * 0.2).toLocaleString('en-IN')}</span>
                      <span className="text-primary-container font-semibold">{displayTravelers} Travelers Active</span>
                    </div>
                  </div>

                  {/* Vehicle Telemetry */}
                  <div className="rounded-xl bg-surface-container-lowest/5 p-space-md backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Vehicle Telematics</span>
                      <span className="material-symbols-outlined text-primary-container text-lg">commute</span>
                    </div>
                    <div>
                      <div className="font-title-lg text-title-lg font-bold text-surface-container-lowest flex items-center gap-2">
                        EXP-2026
                        <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-lowest/15 text-primary-container">{vehicleRecommendation}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        Odometer: <span className="text-surface-container-lowest font-medium">Telemetry Linked</span> • Optimal Routing
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-caps text-label-caps text-surface-container-high/70">
                      <span>Fuel: Nominal</span>
                      <span>Permits: Active</span>
                      <span>Park: Cleared</span>
                    </div>
                  </div>

                  {/* Projected Budget Buffer */}
                  <div className="rounded-xl bg-surface-container-lowest/5 p-space-md backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Cost Forecast</span>
                      <span className="material-symbols-outlined text-primary-container text-lg">trending_up</span>
                    </div>
                    <div>
                      <div className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-white">
                        ₹{(trip?.budgetInr || 24800).toLocaleString('en-IN')}
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        Projected Total Package Budget
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs">
                      <div className="w-full bg-surface-container-lowest/20 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-container h-full rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <div className="flex justify-between items-center mt-1 font-label-caps text-label-caps text-primary-container">
                        <span>Priced Tier: {trip?.selectedTier || 'balanced'}</span>
                        <span>Buffer Safe</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Status Beacon */}
                  <div className="rounded-xl bg-surface-container-lowest/10 p-space-md backdrop-blur-md flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-1">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Next Waypoint Anchor</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
                    </div>
                    <div>
                      <span className="font-title-md text-title-md font-bold text-surface-container-lowest line-clamp-1">
                        {nextWaypoint}
                      </span>
                      <p className="font-body-sm text-body-sm text-surface-container-high mt-1">
                        {nextWaypointDistrict} • Waypoint Verified
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                      <span className="font-label-md text-label-md text-primary-container font-semibold">Route: Verified</span>
                      <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-primary-container/20 text-primary-container font-bold">
                        AI Synced
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3-COLUMN MASTER COMMAND GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* COLUMN 1: TODAY'S LIVE EXPEDITION & TIMELINE (lg:col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-space-md">
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                      <h2 className="font-title-lg text-title-lg font-bold text-on-surface">Today&apos;s Live Expedition</h2>
                    </div>
                    <span className="font-label-md text-label-md font-bold text-primary px-2 py-0.5 rounded-full bg-primary-container/30">
                      Day 1 of {displayDays}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    {trip ? `Exploration Vector from ${displayOrigin} to ${displayDest}` : '"Salt Desert Twilight & Artisan Guilds" • Bhuj to Dhordo Tent City'}
                  </p>
                  <div className="flex flex-col gap-1.5 p-space-sm rounded-xl bg-surface-container-low mb-space-md">
                    <div className="flex items-center justify-between font-label-md text-label-md">
                      <span className="font-semibold text-on-surface">Expedition Progress</span>
                      <span className="font-bold text-primary">40% Completed</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-primary-container h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      2 of 5 major milestones fulfilled today
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/plan')}
                    className="w-full py-2.5 px-4 rounded-xl bg-on-secondary-fixed text-primary-container font-label-md text-label-md font-bold shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-primary-container">auto_awesome</span>
                    Optimize My Day with Farva AI
                  </button>
                </div>

                {/* Chronological Live Expedition Timeline */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-md">
                  <div className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant font-bold">
                    Chronological Vector Stream
                  </div>

                  {stops.length > 0 ? (
                    stops.map((stop: any, idx: number) => {
                      const isFirst = idx === 0;
                      const isSecond = idx === 1;
                      const timeStr = idx === 0 ? '08:30 AM' : idx === 1 ? '11:45 AM' : idx === 2 ? '02:30 PM' : idx === 3 ? '05:30 PM' : '08:00 PM';
                      const badgeText = isFirst ? 'Departure / Anchor' : isSecond ? 'Active Waypoint' : 'Scheduled Milestone';
                      return (
                        <div key={idx} className={`relative pl-6 pb-space-sm ${idx < stops.length - 1 ? 'border-l-2 border-primary-container' : ''}`}>
                          <span className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full ${isFirst ? 'bg-primary-container text-on-primary-fixed' : isSecond ? 'bg-primary text-on-primary animate-pulse' : 'bg-surface-container-high text-on-surface-variant'} flex items-center justify-center text-xs`}>
                            <span className="material-symbols-outlined text-xs font-bold">{isFirst ? 'check' : isSecond ? 'location_on' : 'wb_twilight'}</span>
                          </span>
                          <div className="flex items-center justify-between">
                            <span className={`font-label-caps text-label-caps ${isSecond ? 'text-primary font-bold uppercase tracking-wider' : 'text-on-surface-variant font-semibold'}`}>
                              {timeStr} • {badgeText}
                            </span>
                            <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-medium">
                              {stop.district || 'India'}
                            </span>
                          </div>
                          <h3 className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                            {stop.name}
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                            {stop.district ? `Iconic destination in ${stop.district}. High-priority sightseeing experience on this circuit.` : 'Verified landmark and route waypoint.'}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Stop 1 */}
                      <div className="relative pl-6 pb-space-sm border-l-2 border-primary-container">
                        <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-xs font-bold">check</span>
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps text-on-surface-variant font-semibold">08:30 AM • Completed</span>
                          <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant">Bhuj Outskirts</span>
                        </div>
                        <h3 className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                          Kathiyawadi Breakfast at Darbargadh Haveli
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Fafda-Jalebi, steaming Methi Gota &amp; Kesar Masala Chai with royal courtyard overview.
                        </p>
                        <div className="mt-2 text-label-caps text-primary font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">receipt</span> Bill logged: ₹1,200 (Paid by Kaushal)
                        </div>
                      </div>

                      {/* Stop 2 */}
                      <div className="relative pl-6 pb-space-sm border-l-2 border-primary">
                        <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs animate-pulse">
                          <span className="material-symbols-outlined text-xs">brush</span>
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps text-primary font-bold uppercase tracking-wider">01:30 PM • Active Now</span>
                          <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-primary-container text-on-primary-fixed font-bold">Nirona Village</span>
                        </div>
                        <h3 className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                          Nirona Rogan Art Masterclass &amp; Guild Meet
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Private demonstration by Padma Shri certified artisans. Handcrafting castor oil mineral pigments on silk.
                        </p>
                      </div>

                      {/* Stop 3 */}
                      <div className="relative pl-6 pb-space-sm border-l-2 border-surface-container-high">
                        <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-xs">wb_twilight</span>
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps text-on-surface-variant font-semibold">05:45 PM • In 2h 15m</span>
                          <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container text-on-secondary">Dhordo Gateway</span>
                        </div>
                        <h3 className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                          White Rann Sunset Walk &amp; Moonlit Salt Glamping
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Walking through endless crystallized salt flats under changing rose-tinted desert skies.
                        </p>
                      </div>

                      {/* Stop 4 */}
                      <div className="relative pl-6">
                        <span className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs">
                          <span className="material-symbols-outlined text-xs">nightlife</span>
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps text-on-surface-variant font-semibold">08:30 PM • Tonight</span>
                          <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container text-on-secondary">Tent City Arena</span>
                        </div>
                        <h3 className="font-title-md text-title-md font-bold text-on-surface mt-0.5">
                          Campfire Sufi Baithak &amp; Kutchi Thali Feast
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Folk musicians performing desert ballads around sandalwood fire pits with regional dinner.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* COLUMN 2: GROUP EXPENSES & SETTLEMENTS (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">payments</span>
                      <h2 className="font-title-lg text-title-lg font-bold text-on-surface">Group Expense Ledger</h2>
                    </div>
                    <span className="font-label-caps text-label-caps px-2 py-1 rounded bg-secondary-container text-on-secondary-fixed font-bold uppercase">
                      Equal Split Active
                    </span>
                  </div>

                  <div className="p-space-sm rounded-xl bg-on-secondary-fixed text-surface-container-lowest flex items-center justify-between mb-space-md shadow-inner">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary-container text-xl">bolt</span>
                      <div>
                        <div className="font-label-md text-label-md font-bold text-primary-container">
                          Smart Algorithm Triggered
                        </div>
                        <p className="font-body-sm text-body-sm text-surface-container-high/80">
                          Only <span className="font-bold text-surface-container-lowest">3 transactions</span> needed to settle all 10 members.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/trips/${tripId}/settle`}
                      className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-fixed hover:text-on-primary font-label-caps text-label-caps uppercase font-bold transition-colors"
                    >
                      Resolve
                    </Link>
                  </div>

                  {/* Payer Breakdown List */}
                  <div className="flex flex-col gap-2 mb-space-md">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-fixed font-bold flex items-center justify-center font-label-md text-label-md">
                          {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'BY'}
                        </div>
                        <div>
                          <div className="font-label-md text-label-md font-bold text-on-surface">{user?.fullName || 'Traveler'} (Organizer)</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">Fuel &amp; Highway Dhaba feast</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-title-md text-title-md font-bold text-on-surface">₹5,000</span>
                        <div className="font-label-caps text-label-caps text-primary font-semibold">Gets back ₹3,500</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center justify-center font-label-md text-label-md">
                          SP
                        </div>
                        <div>
                          <div className="font-label-md text-label-md font-bold text-on-surface">Sneha Parikh</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">White Rann Tent City Deposit</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-title-md text-title-md font-bold text-on-surface">₹4,000</span>
                        <div className="font-label-caps text-label-caps text-primary font-semibold">Gets back ₹2,500</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface font-bold flex items-center justify-center font-label-md text-label-md">
                          PS
                        </div>
                        <div>
                          <div className="font-label-md text-label-md font-bold text-on-surface">Priya Shah</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">Rogan Masterclass Guild Entry</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-title-md text-title-md font-bold text-on-surface">₹3,000</span>
                        <div className="font-label-caps text-label-caps text-primary font-semibold">Gets back ₹1,500</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface font-bold flex items-center justify-center font-label-md text-label-md">
                          RM
                        </div>
                        <div>
                          <div className="font-label-md text-label-md font-bold text-on-surface">Rahul Mehta (Navigator)</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">FASTag Tolls &amp; Border Permits</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-title-md text-title-md font-bold text-on-surface">₹2,000</span>
                        <div className="font-label-caps text-label-caps text-primary font-semibold">Gets back ₹500</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface font-bold flex items-center justify-center font-label-md text-label-md">
                          AJ
                        </div>
                        <div>
                          <div className="font-label-md text-label-md font-bold text-on-surface">Amit Joshi (Food Lead)</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">Highway Chai &amp; Kutchi Khakhra</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-title-md text-title-md font-bold text-on-surface">₹1,000</span>
                        <div className="font-label-caps text-label-caps text-error font-semibold">Owes ₹500</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-space-xs rounded-lg bg-surface-container text-center font-body-sm text-body-sm text-on-surface-variant">
                    5 Non-paying travelers (Tanvi, Bhavin, Ritu, Dev, Maya) owe <span className="font-semibold text-on-surface">₹1,500 each</span>.
                  </div>
                </div>

                {/* 10 Sovereign Companions */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">groups</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">10 Sovereign Companions</h3>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant font-medium">All Linked</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="relative w-10 h-10 mb-1">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                          {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'KP'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-on-surface truncate w-full">{user?.fullName?.split(' ')[0] || 'Kaushal'}</span>
                      <span className="font-label-caps text-label-caps text-primary font-semibold">Organizer</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        RM
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Rahul</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Navigator</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        AJ
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Amit</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Food Lead</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        PS
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Priya</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Traveler</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        SP
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Sneha</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Traveler</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        TB
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Tanvi</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Traveler</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        BP
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Bhavin</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Chauffeur</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        RD
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Ritu</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Traveler</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        DS
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Dev</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Traveler</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-surface-container-low">
                      <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold font-label-lg text-label-lg mb-1">
                        MD
                      </div>
                      <span className="font-label-md text-label-md font-semibold text-on-surface truncate w-full">Maya</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Traveler</span>
                    </div>
                  </div>
                </div>

                {/* Expedition Dispatch Feed */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">forum</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">Expedition Dispatch Feed</h3>
                    </div>
                    <span className="font-label-caps text-label-caps text-primary font-bold">2 New Updates</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="p-3 rounded-xl bg-on-secondary-fixed text-surface-container-lowest flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-primary-container text-lg mt-0.5">smart_toy</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md font-bold text-primary-container">Farva Intelligence Drone</span>
                          <span className="font-label-caps text-label-caps text-surface-container-high/60">3 mins ago</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-surface-container-high/90 mt-0.5">
                          White Rann barrier check opens in 45 mins. Highway SH-45 traffic is clear. Recommended departure from Nirona by 03:45 PM.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-lg mt-0.5">account_circle</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md font-bold text-on-surface">Rahul Mehta (Innova Driver)</span>
                          <span className="font-label-caps text-label-caps text-on-surface-variant">12 mins ago</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          Innova tank is topped full at HPCL Bhirandiyara. Cold drinking water cartons secured in trunk. Ready to roll whenever masterclass concludes!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: VAULTED DOCUMENTS, EMERGENCY & VEHICLE (lg:col-span-3) */}
              <div className="lg:col-span-3 flex flex-col gap-space-md">
                {/* Vehicle Telemetry */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">directions_car</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">Vehicle Telemetry</h3>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                  </div>
                  <div className="rounded-xl bg-surface-container-low p-space-sm mb-space-sm">
                    <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">Command Vehicle</div>
                    <div className="font-title-md text-title-md font-bold text-on-surface">Toyota Innova Crysta 2.4Z</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Reg: GJ-01-XX-9420 (Sovereign Pass Active)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-space-sm">
                    <div className="p-2.5 rounded-xl bg-surface-container text-center">
                      <div className="font-label-caps text-label-caps text-on-surface-variant">Fuel Range</div>
                      <div className="font-title-md text-title-md font-bold text-on-surface mt-0.5">340 km</div>
                      <span className="font-label-caps text-label-caps text-primary font-bold">Tank 72%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container text-center">
                      <div className="font-label-caps text-label-caps text-on-surface-variant">FASTag Balance</div>
                      <div className="font-title-md text-title-md font-bold text-on-surface mt-0.5">₹2,100</div>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">Auto-recharge ON</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">speed</span>
                      <div>
                        <div className="font-label-md text-label-md font-bold text-on-surface">Vehicle Health 94%</div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant">Tyre PSI: 33/33 • Engine Nominal</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                  </div>
                </div>

                {/* Digital Vault */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">folder_shared</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">Digital Vault</h3>
                    </div>
                    <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-primary-container/20 text-on-primary-container font-bold">
                      4 Passes Active
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">hotel</span>
                        <div>
                          <div className="font-label-md text-label-md font-bold text-on-surface truncate">Dhordo Tent City Voucher</div>
                          <div className="font-label-caps text-label-caps text-on-surface-variant">Conf: #DTC-24-99812</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary text-lg cursor-pointer">qr_code_2</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">nature</span>
                        <div>
                          <div className="font-label-md text-label-md font-bold text-on-surface truncate">Sasan Gir Gypsy Safari</div>
                          <div className="font-label-caps text-label-caps text-on-surface-variant">Zone 4 Permit • 28 Dec</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary text-lg cursor-pointer">verified_user</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">badge</span>
                        <div>
                          <div className="font-label-md text-label-md font-bold text-on-surface truncate">10 Traveler ID Sync</div>
                          <div className="font-label-caps text-label-caps text-on-surface-variant">DigiLocker Aadhaar Bundled</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary text-base">check</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Ground Node */}
                <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-error text-xl">emergency</span>
                      <h3 className="font-title-md text-title-md font-bold text-on-surface">Emergency Ground Node</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-caps text-label-caps font-bold">24/7 Active</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {trip ? `Direct liaison to ${displayDest} Police, Local Tourism Administration and Highway Medical Nodes.` : 'Direct liaison to Kutch Police, Somnath Coastal Command and Highway Medical Nodes.'}
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <a
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-error-container/20 transition-colors"
                      href="tel:112"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-base">local_police</span>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">{trip ? `${displayDest} Police & SOS` : 'Kutch Police & SOS'}</span>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-error">Dial 112</span>
                    </a>
                    <a
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                      href="tel:+919624282521"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">support_agent</span>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">Tourism Highway Patrol</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">+91 96242 82521</span>
                    </a>
                    <div className="p-2 rounded-xl bg-surface-container text-on-surface-variant font-body-sm text-body-sm flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">local_hospital</span>
                        <span>Nearest Hospital: Bhuj Civil</span>
                      </span>
                      <span className="font-semibold text-on-surface">28 km away</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-on-secondary-fixed text-primary-container px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-label-md text-label-md transition-all duration-300">
          <span className="material-symbols-outlined text-primary-container">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

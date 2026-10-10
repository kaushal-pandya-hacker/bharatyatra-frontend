'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';

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
        <div className="h-20 w-full px-space-lg flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <Link href="/" className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-2xl">explore</span>
                <span className="font-title-lg text-title-lg tracking-tight text-on-surface font-bold">BHARAT YATRA</span>
              </div>
              <span className="font-label-caps text-label-caps tracking-wider text-on-surface-variant">
                ભારત યાત્રા • Sovereign Gujarat Travel Engine
              </span>
            </Link>
            <div className="hidden xl:flex items-center gap-space-sm pl-space-md">
              <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-primary-container/20 text-on-surface">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                <span className="font-label-md text-label-md font-semibold">Active Expedition:</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">Kutch &amp; Saurashtra Circuit (10 Travelers)</span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-space-xs">
            <Link
              href={`/trips/${tripId}`}
              className="px-3 py-2 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg"
            >
              Command Center
            </Link>
            <Link
              href="/trips/road-trip"
              className="px-3 py-2 text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface"
            >
              Road Trip &amp; Vehicle
            </Link>
            <Link
              href={`/trips/${tripId}/cost`}
              className="px-3 py-2 text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface"
            >
              Cost &amp; Intelligence
            </Link>
            <Link
              href={`/trips/${tripId}/expenses`}
              className="px-3 py-2 text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface"
            >
              Group Splitter
            </Link>
            <Link
              href={`/trips/${tripId}/settle`}
              className="px-3 py-2 text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface"
            >
              Settlement Optimizer
            </Link>
          </nav>

          <div className="flex items-center gap-space-md">
            <a
              className="hidden sm:flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors text-on-surface"
              href="tel:18002031111"
            >
              <span className="material-symbols-outlined text-primary text-base">support_agent</span>
              <div className="flex flex-col text-left">
                <span className="font-label-caps text-label-caps text-on-surface-variant">Concierge 24/7</span>
                <span className="font-label-md text-label-md font-bold tracking-tight text-on-surface">1800 203 1111</span>
              </div>
            </a>
            <div className="flex items-center gap-space-sm pl-space-xs">
              <Link href="/profile" className="flex flex-col text-right hidden sm:flex">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Lead Sovereign</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">Verified Guide</span>
              </Link>
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shadow-[0_2px_8px_rgba(20,26,50,0.12)]"
                src="https://lh3.googleusercontent.com/aida/AEtjO1Ui59jsO1cRmYcx_EhvwkLGkFogmDjmf7WlO_OauBFwKZ0uk_e307OoSlXT4rFNOTTz18I6VJ9GGtE93D4OpgxiI9xOdoffUGkzgoQ0KG88ACv-KY9EVYggJxEwdGNO95rCHoqDEYuaDqN7tRftqN7dgBVeMibJArETY3NhtGtIYgwZNrtEOGWVQM_PjXq995rzqJH5UGpxAdJ8JA0v0kOcVN3eHS4E9bOBnUkpNA-jIX-7ScyvFM41G5v_ZvuZOXHwVOlo5WZh9Nc"
              />
            </div>
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
            <span className="font-label-md text-label-md font-semibold text-on-surface">Gujarat Concierge</span>
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
                    Day 2 of 6 • Live in Dhordo, Kutch
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">|</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    GJ-EXP-2026-904
                  </span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                    Kutch Desert &amp; Saurashtra Royal Circuit
                  </h1>
                  <span className="material-symbols-outlined text-primary text-2xl" title="Sovereign Verified Route">
                    verified
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  24 Dec – 29 Dec 2026 (6 Days / 5 Nights) • 10 Travelers • Lead Voyager:{' '}
                  <span className="font-semibold text-on-surface">{user?.fullName || 'Traveler'}</span>
                </p>
              </div>

              {/* Live Vector Strip & Quick Badge */}
              <div className="flex flex-wrap items-center gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                  <span className="material-symbols-outlined text-primary text-lg">route</span>
                  <span className="font-semibold text-on-surface">Vector:</span>
                  <span>Ahmedabad</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  <span>Bhuj</span>
                  <span className="material-symbols-outlined text-xs text-primary">radio_button_checked</span>
                  <span className="text-primary font-bold">Dhordo Rann</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  <span>Mandvi</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  <span>Sasan Gir</span>
                </div>
                <div className="h-6 w-px bg-surface-container-high hidden sm:block"></div>
                <div className="flex items-center gap-space-xs bg-surface-container-low px-2.5 py-1 rounded-lg text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-secondary text-base">directions_car</span>
                  <span className="font-label-caps text-label-caps uppercase font-bold tracking-tight">
                    Toyota Innova Crysta + GSRTC Intercity
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
                    <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/10 p-1.5 flex items-center justify-center backdrop-blur-md shadow-inner">
                      <img
                        alt="BharatYatra Sovereign Crest"
                        className="w-full h-full object-contain rounded-lg"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD82fJqRnrMK6d8hd1ygsDK0fBCDv-l78A3WtJdaj7T3BW8HC1_o7Raaa6un-WskrdodOnmqUHPn4HS6_W8BTI1-4P3tmFPiBxH0gysTaYkxLvw0NytcYBfYWUeFkuAfwNIOc9G1BePH1A87L7iQgO6vzA5nSyYD9wK8p-c3ocpTSuhHkvVop_1ukkz10lWAV_h6bzrkSp8-zJdWsJliXNLczO_WTA1wBeWR2VgjM5FM8QNCZLINCM92QhGoIER-mnKGj0"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-surface-container-lowest">
                          Farva Sovereign Trip Intelligence
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-fixed text-label-caps font-bold uppercase tracking-wider">
                          Active Sentinel
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/70">
                        Real-time synchronization across 10 travelers, onboard GPS, FASTag highway gateway &amp; expense clearing.
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
                      <div className="font-display-hero-mobile text-display-hero-mobile font-bold tracking-tight text-surface-container-lowest">
                        ₹15,000
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        Spent by 5 Contributors • <span className="text-primary-container font-semibold">₹1,500/head</span> fair share
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-caps text-label-caps text-surface-container-high/70">
                      <span>Outstanding: ₹7,500</span>
                      <span className="text-primary-container font-semibold">5 Awaiting Pay</span>
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
                        GJ-01-XX-9420
                        <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-lowest/15 text-primary-container">Toyota Innova</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        Odometer: <span className="text-surface-container-lowest font-medium">820 km logged</span> • 12 km/L avg
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-caps text-label-caps text-surface-container-high/70">
                      <span>Fuel: ₹6,800</span>
                      <span>FASTag: ₹1,450</span>
                      <span>Park: ₹450</span>
                    </div>
                  </div>

                  {/* Projected Budget Buffer */}
                  <div className="rounded-xl bg-surface-container-lowest/5 p-space-md backdrop-blur-md flex flex-col justify-between">
                    <div className="flex items-center justify-between text-surface-container-high/80 mb-2">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider">Cost Forecast</span>
                      <span className="material-symbols-outlined text-primary-container text-lg">trending_up</span>
                    </div>
                    <div>
                      <div className="font-display-hero-mobile text-display-hero-mobile font-bold tracking-tight text-surface-container-lowest">
                        ₹24,800
                      </div>
                      <p className="font-body-sm text-body-sm text-surface-container-high/80 mt-1">
                        Projected Final (Target: ₹28,000)
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs">
                      <div className="w-full bg-surface-container-lowest/20 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-container h-full rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <div className="flex justify-between items-center mt-1 font-label-caps text-label-caps text-primary-container">
                        <span>60% Burn Rate</span>
                        <span>Buffer Safe (+₹3,200)</span>
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
                        White Rann Sunset Salt Deck
                      </span>
                      <p className="font-body-sm text-body-sm text-surface-container-high mt-1">
                        Gate Pass verified • 2h 15m until golden hour zenith
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                      <span className="font-label-md text-label-md text-primary-container font-semibold">Toll: Clear</span>
                      <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-primary-container/20 text-primary-container font-bold">
                        VIP Gate 2 Sync
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
                      Day 2 of 6
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    &quot;Salt Desert Twilight &amp; Artisan Guilds&quot; • Bhuj to Dhordo Tent City
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
                    <div className="mt-space-sm rounded-xl overflow-hidden shadow-sm relative group">
                      <img
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                        alt="Intricate Gujarati Rogan fabric art on dark silk"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD09KNB2g3Ufpne839APgNtFa7ix-_H729TLY1aw-JglaaCLizGT9mGvpE23HAT5FVuB7KoV_20mOhLjKzG2A3_R75K-kglxds3anxk3s9TSOxapE16g_qBxTFCIKZHw5KCBZ-jP-YE1BeuyCOUtZ7zXlb-4rcmmoi6Y4KAq4x5wHn3Itoa0dpMBvOJc9sToDmw5AyLPguQGFebfHhW30i36Mbtq70u1plm3UYgHBokbm33jZtYL8i4kw"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-on-secondary-fixed/80 backdrop-blur-sm text-primary-container font-label-caps text-label-caps font-semibold">
                        Live Guild Session: 45 min remaining
                      </div>
                    </div>
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
                      Walking through endless crystallized salt flats under changing rose-tinted desert skies. Camel cart transfers coordinated.
                    </p>
                    <div className="mt-space-sm rounded-xl overflow-hidden shadow-sm relative group">
                      <img
                        className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-105"
                        alt="Vast glowing white salt desert of White Rann Kutch"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAczeFUVaMHwobGSdHvtEoaIdjiwgxZOpSku1jM-0qNWn1x7lOsXJPS2KrfkNMvOBAH3yzmgZzl5MgxVi3Q1j6Iry6wVqVPHHhrjD51MRwtHzf9l8crMZlxaR_YxL3lqPy_oGwD3E_3YzvIFhkwrjVCT1bxqZNC6FSsh6MPjn1p5-CPmDRjCG9NPJDSP6xebeueFYup0vRWKFN_FNlSXEJ3d9FFrI1tVLJGymnr8L4vY8DK-XoBxwtKXg"
                      />
                    </div>
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
                      Folk musicians from Lakhpat performing desert ballads around sandalwood fire pits with Bajra no Rotlo &amp; Ringna no Olo.
                    </p>
                  </div>
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
                        <img alt="Kaushal Patel" className="w-full h-full rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida/AEtjO1WZuadRQKU3UEwQO6rbal-x1osIc2C5AEK3zvQYx6sB8h_VwAhruwUEWUx2kEdDgnott3tzJ25wIBIMCSqnnYW7Z88tIyyqVRysYnzNoq2j8qOW4UaYv-EhZbkWfSqNVRqAVgAffrbBFYtw62infW9BcNUrZdkSb4_eqfb1Cz9uqVE4_V4UH_ixvDav_R4KBb3EGVQ9ht5_hX6-FbCB0sbgSQ6d4Vy7hqnSjbfOEv2akTJ0pGf3z2U3FsPz" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary-container"></span>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-on-surface truncate w-full">Kaushal</span>
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
                    Direct liaison to Kutch Police, Somnath Coastal Command and Highway Medical Nodes.
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <a
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-error-container/20 transition-colors"
                      href="tel:112"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-base">local_police</span>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">Kutch Police &amp; SOS</span>
                      </div>
                      <span className="font-label-md text-label-md font-bold text-error">Dial 112</span>
                    </a>
                    <a
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                      href="tel:18002031111"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">support_agent</span>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">Tourism Highway Patrol</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">1800 203 1111</span>
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

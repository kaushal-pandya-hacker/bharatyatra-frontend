'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function IntelligentRoadTripPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (title: string, msg: string) => {
    setToastMessage(`${title}: ${msg}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
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
              href="/trips/1"
              className="px-3 py-2 text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface"
            >
              Command Center
            </Link>
            <Link
              href="/trips/road-trip"
              className="px-3 py-2 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg"
            >
              Road Trip &amp; Vehicle
            </Link>
            <Link
              href="/trips/1/cost"
              className="px-3 py-2 text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface"
            >
              Cost &amp; Intelligence
            </Link>
            <Link
              href="/trips/1/expenses"
              className="px-3 py-2 text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface"
            >
              Group Splitter
            </Link>
            <Link
              href="/trips/1/settle"
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
            href="/trips/1"
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span className="font-label-lg text-label-lg">Command Center</span>
          </Link>
          <Link
            href="/trips/road-trip"
            className="flex items-center gap-space-sm px-3 py-2.5 transition-all bg-primary-container text-on-primary-container font-semibold rounded-lg"
          >
            <span className="material-symbols-outlined text-lg">rv_hookup</span>
            <span className="font-label-lg text-label-lg">Road Trip &amp; Vehicle</span>
          </Link>
          <Link
            href="/trips/1/cost"
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">insights</span>
            <span className="font-label-lg text-label-lg">Cost &amp; Intelligence</span>
          </Link>
          <Link
            href="/trips/1/expenses"
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-lg">group</span>
            <span className="font-label-lg text-label-lg">Group Splitter</span>
          </Link>
          <Link
            href="/trips/1/settle"
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
            {/* Sovereign Telemetry Top Bar */}
            <section className="w-full pb-space-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-container/30 text-on-surface text-label-caps font-label-caps tracking-widest uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      Telemetry Vector Active
                    </span>
                    <span className="text-on-surface-variant font-label-caps text-label-caps">• GJ-01 CIRCULAR DISPATCH</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                    Intelligent Gujarat Road Trip Planner
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                    Sovereign Route Vector Engine calculating precision fuel dynamics, automated FASTag clearances, and micro-climate waypoints across the Kutch peninsula.
                  </p>
                </div>
                {/* Quick Action Deck */}
                <div className="flex flex-wrap items-center gap-space-sm">
                  <button
                    className="flex items-center gap-space-xs px-space-md py-3 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:shadow-md hover:bg-surface-container-low transition-all cursor-pointer"
                    onClick={() => showToast('Road Trip Saved', 'Kutch & Saurashtra Circuit (940 km) added to your Sovereign Trips.')}
                  >
                    <span className="material-symbols-outlined text-primary text-xl">bookmark_add</span>
                    <span>Save Road Trip</span>
                  </button>
                  <button
                    className="flex items-center gap-space-xs px-space-md py-3 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:shadow-md hover:bg-surface-container-low transition-all cursor-pointer"
                    onClick={() => showToast('Group Splitter Synced', '₹10,320 allocated across 10 active passengers (₹1,032/each).')}
                  >
                    <span className="material-symbols-outlined text-primary text-xl">call_split</span>
                    <span>Sync to Group Splitter</span>
                  </button>
                  <button className="flex items-center gap-space-xs px-space-lg py-3 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-xl">directions_car</span>
                    <span>Export to CarPlay</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Macro Telemetry Key Metrics (Bento Grid) */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-md mb-space-xl">
              <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
                  <span className="font-label-caps text-label-caps tracking-wider uppercase">Circuit Distance</span>
                  <span className="material-symbols-outlined text-primary text-lg">route</span>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">
                    940 <span className="font-label-lg text-label-lg text-on-surface-variant font-normal">km</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-secondary">Ahmedabad round-trip</div>
                </div>
              </div>

              <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
                  <span className="font-label-caps text-label-caps tracking-wider uppercase">Est. Drive Time</span>
                  <span className="material-symbols-outlined text-primary text-lg">timer</span>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">
                    16<span className="text-label-md text-label-md font-semibold">h</span> 45<span className="text-label-md text-label-md font-semibold">m</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-secondary">Across 5 scenic legs</div>
                </div>
              </div>

              <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
                  <span className="font-label-caps text-label-caps tracking-wider uppercase">Fuel Outlay</span>
                  <span className="material-symbols-outlined text-primary text-lg">local_gas_station</span>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">₹7,850</div>
                  <div className="font-body-sm text-body-sm text-secondary">78.3L Diesel @ ₹92/L</div>
                </div>
              </div>

              <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
                  <span className="font-label-caps text-label-caps tracking-wider uppercase">Fastag Tolls</span>
                  <span className="material-symbols-outlined text-primary text-lg">toll</span>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">₹1,620</div>
                  <div className="font-body-sm text-body-sm text-secondary">8 NHAI plazas verified</div>
                </div>
              </div>

              <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-on-surface-variant mb-space-xs">
                  <span className="font-label-caps text-label-caps tracking-wider uppercase">Gross Transit</span>
                  <span className="material-symbols-outlined text-primary text-lg">payments</span>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-on-surface font-bold">₹10,320</div>
                  <div className="font-body-sm text-body-sm text-secondary">Inc. forest &amp; beach permits</div>
                </div>
              </div>

              <div className="p-space-md rounded-2xl bg-inverse-surface text-inverse-on-surface shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-primary-container/20 blur-xl"></div>
                <div className="flex items-center justify-between text-primary-container mb-space-xs">
                  <span className="font-label-caps text-label-caps tracking-wider uppercase">Per Traveler (10)</span>
                  <span className="material-symbols-outlined text-lg">savings</span>
                </div>
                <div>
                  <div className="font-headline-md text-headline-md text-primary-container font-bold">₹1,032</div>
                  <div className="font-body-sm text-body-sm text-inverse-on-surface/80">Save ₹2,368 vs Train/Bus</div>
                </div>
              </div>
            </section>

            {/* Main Grid: Waypoint Builder & Live Vector Engine */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg mb-space-xl">
              {/* Left Column (5 cols) */}
              <div className="xl:col-span-5 flex flex-col gap-space-lg">
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-2xl">directions_car</span>
                      </div>
                      <div>
                        <span className="font-label-caps text-label-caps tracking-wider text-on-surface-variant uppercase">Designated Rig</span>
                        <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Toyota Innova Crysta</h2>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      FASTag Active
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-space-sm p-space-sm rounded-xl bg-surface-container-low">
                    <div className="text-center">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Fuel</span>
                      <div className="font-label-lg text-label-lg font-bold text-on-surface mt-0.5">Diesel</div>
                    </div>
                    <div className="text-center">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Mileage</span>
                      <div className="font-label-lg text-label-lg font-bold text-on-surface mt-0.5">12 km/L</div>
                    </div>
                    <div className="text-center">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Tank</span>
                      <div className="font-label-lg text-label-lg font-bold text-on-surface mt-0.5">55 L</div>
                    </div>
                    <div className="text-center">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Crew</span>
                      <div className="font-label-lg text-label-lg font-bold text-primary mt-0.5">10 Pax</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-label-md text-label-md">
                      <span className="text-on-surface-variant">Fuel Consumption Profile</span>
                      <span className="text-on-surface font-semibold">1.42 Full Tanks (2 Refills Planned)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden flex">
                      <div className="h-full bg-primary-container" style={{ width: '58%' }}></div>
                      <div className="h-full bg-primary" style={{ width: '42%' }}></div>
                    </div>
                    <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                      <span>Leg 1: Honest Oasis (Ahmedabad Exit)</span>
                      <span>Leg 3: HPCL COCO Malia Bypass</span>
                    </div>
                  </div>
                </div>

                {/* Waypoint Itinerary */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-xl">alt_route</span>
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Route Vector Itinerary</h2>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">4 Checkpoints</span>
                  </div>

                  <div className="flex flex-col gap-space-md relative pl-6">
                    <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-surface-variant"></div>

                    {/* Waypoint 0 */}
                    <div className="relative flex items-start gap-space-sm group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                      </div>
                      <div className="flex-1 p-space-sm rounded-xl bg-surface-container-low group-hover:bg-surface-container transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase">01 • DEPARTURE HUB</span>
                          <span className="font-label-caps text-label-caps text-primary font-semibold">05:30 AM</span>
                        </div>
                        <div className="font-title-md text-title-md text-on-surface font-bold mt-0.5">Ahmedabad (SG Highway Hub)</div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Coords: 23.0225° N, 72.5714° E • Full tank prepped</p>
                      </div>
                    </div>

                    {/* Waypoint 1 */}
                    <div className="relative flex items-start gap-space-sm group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      </div>
                      <div className="flex-1 p-space-sm rounded-xl bg-surface-container-low group-hover:bg-surface-container transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase">02 • CULTURAL GATEWAY</span>
                          <span className="font-label-caps text-label-caps text-on-surface font-semibold">350 km</span>
                        </div>
                        <div className="font-title-md text-title-md text-on-surface font-bold mt-0.5">Bhuj Heritage Hub</div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Aina Mahal, Prag Mahal &amp; craft bazaars • Rest stop 45m</p>
                      </div>
                    </div>

                    {/* Waypoint 2 */}
                    <div className="relative flex items-start gap-space-sm group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-primary-container ring-2 ring-primary"></span>
                      </div>
                      <div className="flex-1 p-space-sm rounded-xl bg-primary-container/15 group-hover:bg-primary-container/25 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps tracking-widest text-primary font-bold uppercase">03 • APEX DESTINATION</span>
                          <span className="font-label-caps text-label-caps text-primary font-bold">432 km</span>
                        </div>
                        <div className="font-title-md text-title-md text-on-surface font-bold mt-0.5">Dhordo (White Rann Desert)</div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Salt desert expanse &amp; Rann Utsav pavilion • Night stay</p>
                      </div>
                    </div>

                    {/* Waypoint 3 */}
                    <div className="relative flex items-start gap-space-sm group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      </div>
                      <div className="flex-1 p-space-sm rounded-xl bg-surface-container-low group-hover:bg-surface-container transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase">04 • COASTAL CITADEL</span>
                          <span className="font-label-caps text-label-caps text-on-surface font-semibold">577 km</span>
                        </div>
                        <div className="font-title-md text-title-md text-on-surface font-bold mt-0.5">Mandvi Port &amp; Vijay Vilas</div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">400-year shipbuilding yard &amp; private beach track</p>
                      </div>
                    </div>

                    {/* Waypoint 4 */}
                    <div className="relative flex items-start gap-space-sm group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-on-surface"></span>
                      </div>
                      <div className="flex-1 p-space-sm rounded-xl bg-surface-container-low group-hover:bg-surface-container transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase">05 • COMPLETE VECTOR</span>
                          <span className="font-label-caps text-label-caps text-on-surface font-semibold">940 km</span>
                        </div>
                        <div className="font-title-md text-title-md text-on-surface font-bold mt-0.5">Ahmedabad Terminal Return</div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Circular return via NH-947 &amp; Viramgam expressway</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Interactive Map & Curated Route Stops (7 cols) */}
              <div className="xl:col-span-7 flex flex-col gap-space-lg">
                {/* Route Vector Map Panel */}
                <div className="relative rounded-3xl overflow-hidden shadow-lg bg-inverse-surface text-inverse-on-surface">
                  <div
                    className="w-full h-96 bg-cover bg-center relative"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDln8Hx6Q1qg4quRqWPrZU2209p9B_e4rbfVMgwKnNrJCHTtcrRwD9fIjitbWzgvWNKnRUtu5L3Al6_kxoBBhNCUih7XuyaG8qf7cFEqwb1KmXIigyj9k2ZA9feFvcaITC-IfGCjUE6mgpYNhOHfAaEOVOwaqoOj37pNuFEft7RAaav1pyQnTYYiN59w3SgRk56dxWirzRT-SovVtJPaWw2SdDlMB4S2t49LmMg6wMiaGVHJ7WBh0SU_A')",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/30 to-transparent"></div>
                    <div className="absolute top-space-md left-space-md p-space-sm rounded-2xl bg-inverse-surface/90 backdrop-blur-md shadow-xl flex items-center gap-space-sm max-w-sm">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container">
                        <span className="material-symbols-outlined text-2xl">radar</span>
                      </div>
                      <div>
                        <div className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider">Live Road Telemetry</div>
                        <div className="font-label-md text-label-md text-inverse-on-surface font-semibold">NH-27 &amp; Kutch Spine • Clear 22°C</div>
                        <div className="font-body-sm text-body-sm text-inverse-on-surface/70">Zero Fog • Smooth 4-Lane Tarmac</div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-space-md bg-inverse-surface/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-space-sm">
                      <div className="flex items-center gap-space-md text-inverse-on-surface">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary-container text-lg">speed</span>
                          <span className="font-label-md text-label-md">Avg: 68 km/h</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary-container text-lg">local_gas_station</span>
                          <span className="font-label-md text-label-md">Next Fuel: 184 km</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary-container text-lg">shield</span>
                          <span className="font-label-md text-label-md">Sovereign Roadside Assist: 24/7</span>
                        </div>
                      </div>
                      <a
                        className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold hover:shadow-md transition-all flex items-center gap-1"
                        href="https://maps.google.com"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span>Launch Turn-by-Turn</span>
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Curated Stops */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">Sovereign Pit-Stops</div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Curated Halts Along Vector</h3>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Handpicked for Clean Restrooms &amp; Heritage</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-surface font-label-caps text-label-caps font-semibold">LEG 1 • 210 KM</span>
                          <div className="flex items-center gap-0.5 text-primary font-label-md text-label-md font-bold">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            4.6
                          </div>
                        </div>
                        <h4 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                          Honest Highway Oasis &amp; EV Hub
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Malia Miyana junction. Premium sanitised washrooms, Kathiyawadi hot breakfast (Thepla, Fafda, Kadhi), 60kW DC Fast Chargers.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Halt: 35 mins</span>
                        <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">ev_station</span>
                          Fast Charger Ready
                        </span>
                      </div>
                    </div>

                    <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-surface font-label-caps text-label-caps font-semibold">LEG 2 • 350 KM</span>
                          <div className="flex items-center gap-0.5 text-primary font-label-md text-label-md font-bold">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                            Scenic
                          </div>
                        </div>
                        <h4 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                          Surajbari Flamingo Overlook &amp; COCO HPCL
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Bridge over Little Rann tidal mudflats. Greater flamingos viewing deck paired with high-flow diesel COCO pump clearance.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Halt: 20 mins</span>
                        <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">local_gas_station</span>
                          COCO Diesel Station
                        </span>
                      </div>
                    </div>

                    <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-surface font-label-caps text-label-caps font-semibold">LEG 3 • 432 KM</span>
                          <div className="flex items-center gap-0.5 text-primary font-label-md text-label-md font-bold">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                            Artisan
                          </div>
                        </div>
                        <h4 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                          Khavda Mawa &amp; Pottery Atelier
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Famous slow-cooked Buffalo milk fudge confectionery. Local Rogan &amp; terracotta masters crafting heirloom pieces.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Halt: 40 mins</span>
                        <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">storefront</span>
                          Verified Confectionery
                        </span>
                      </div>
                    </div>

                    <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-surface font-label-caps text-label-caps font-semibold">LEG 4 • 577 KM</span>
                          <div className="flex items-center gap-0.5 text-primary font-label-md text-label-md font-bold">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>wb_twilight</span>
                            Sunset
                          </div>
                        </div>
                        <h4 className="font-title-lg text-title-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                          Mandvi Coastal Windmill Beach
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Driveable coastal firm sand strip alongside 400-year shipbuilding berths and Arabian sunset dhow yards.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Halt: 1h 30m</span>
                        <span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">directions_boat</span>
                          Shipyard Access
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Group Expense Splitting Preview Bar */}
            <section className="w-full p-space-lg rounded-3xl bg-surface-container-lowest shadow-md mb-space-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/30 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">groups_3</span>
                </div>
                <div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Automated Sovereign Split</span>
                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold">10 Travelers Linked • ₹1,032 per Traveler</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Includes fuel ₹7,850 + Fastag tolls ₹1,620 + Rann Permit &amp; Mandvi parking ₹850. Net economy saves ₹23,680 vs individual commercial fares.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-sm w-full lg:w-auto">
                <button
                  className="w-full lg:w-auto px-space-lg py-3 rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  onClick={() => showToast('Itemized Ledger Open', 'Fuel: ₹7,850 • FASTag: ₹1,620 • Forest/Beach Permits: ₹850.')}
                >
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                  <span>View Itemized Split</span>
                </button>
                <Link
                  href="/trips/1/expenses"
                  className="w-full lg:w-auto px-space-lg py-3 rounded-xl bg-inverse-surface text-inverse-on-surface font-label-lg text-label-lg hover:bg-surface-variant hover:text-on-surface transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-primary-container text-lg">account_balance_wallet</span>
                  <span>Push to Splitter</span>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-label-md text-label-md transition-all duration-300">
          <span className="material-symbols-outlined text-primary-container">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

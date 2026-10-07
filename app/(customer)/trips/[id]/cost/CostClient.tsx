'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TripCostIntelligencePage({ params }: { params?: { id?: string } } = {}) {
  const router = useRouter();
  const tripId = params?.id || '1';

  const [simulatedPax, setSimulatedPax] = useState(10);

  const calculateSimulatedCost = (pax: number) => {
    const fixedCost = 23200;
    const variableCostPerHead = 1600;
    const additionalVehicleCost = pax > 10 ? 3500 : 0;
    const totalProjected = fixedCost + additionalVehicleCost + variableCostPerHead * pax;
    return Math.round(totalProjected / pax);
  };

  const simulatedPerHead = calculateSimulatedCost(simulatedPax);
  const diffFromBaseline = simulatedPerHead - 4250;

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      'BharatYatra • Kutch Expedition Dossier: Projected budget ₹42,500 across 10 travelers (₹4,250/person all-inclusive). Transparently verified.'
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
              className="px-3 py-2 text-on-surface-variant font-label-lg text-label-lg transition-colors hover:text-on-surface"
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
              className="px-3 py-2 transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg"
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
            className="flex items-center gap-space-sm px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all"
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
            className="flex items-center gap-space-sm px-3 py-2.5 transition-all bg-primary-container text-on-primary-container font-semibold rounded-lg"
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
          <div className="flex flex-col w-full pb-16 space-y-8">
            {/* Sub-Header Status Ribbon */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container-high text-on-surface text-label-caps font-label-caps uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Telemetry Engine v4.2
                  </span>
                  <span className="text-on-surface-variant font-label-md text-label-md">• ID: KF-9082-2026</span>
                </div>
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  Trip Cost Intelligence <span className="text-primary font-normal">|</span> Kutch &amp; Saurashtra Circuit
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Authoritative financial forecasting, live FASTag debits, luxury stay split-equity, and algorithmically optimized disbursements.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => window.print()}
                >
                  <span className="material-symbols-outlined text-primary text-lg">download</span>
                  <span className="font-label-lg text-label-lg">Clean Dossier PDF</span>
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  onClick={shareWhatsApp}
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  <span className="font-label-lg text-label-lg">WhatsApp Dispatch</span>
                </button>
              </div>
            </div>

            {/* Master Metric Hero Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Card */}
              <div className="lg:col-span-8 rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-surface-container-low">
                    <div className="flex items-center gap-3">
                      <img
                        alt="BharatYatra Sovereign Seal"
                        className="w-12 h-12 rounded-xl object-cover shadow-sm"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGo-8-BQ4jEsa36BYjwwYru4v4Vm7F2_BoVie_oVd_eQMRtkXSMPr7pN4ilAiHlpsAA25mBVDWd7r22Jay-MK3n9I028c3HgvhFHSke5Ia59f2ua6w3Hvl1Y1rYJx-iOMDvnJ6CwlIIgppA4gT8J_iGWbwjYKP-S395HgJA0Ia8Gfrg_BCSv75SmKaX8NhhXTjdny6fLMVSZjZKngEEbXEWFCKQGMv-dM9pNQAEz95NGAjOMQqCcTXXPHl-pW_4zM46oo"
                      />
                      <div>
                        <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">
                          Projected Net Expedition Outlay
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-display-hero text-display-hero text-on-surface font-extrabold tracking-tight">₹42,500</span>
                          <span className="font-title-md text-title-md text-on-surface-variant font-medium">INR Total</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-surface-container-low text-right">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">All-Inclusive Equity</span>
                      <div className="font-headline-sm text-headline-sm text-primary font-bold">
                        ₹4,250 <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">/ traveler</span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">10 Verified Explorers</span>
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span className="font-label-md text-label-md text-on-surface">Spent to Date: <strong>₹15,000</strong> (35.3%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-surface-container-high"></span>
                        <span className="font-label-md text-label-md text-on-surface">Remaining Allocation: <strong>₹27,500</strong> (64.7%)</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/30 text-on-primary-container">
                        <span className="material-symbols-outlined text-sm">trending_down</span>
                        <span className="font-label-caps text-label-caps uppercase font-bold tracking-wide">₹800 Under Budget</span>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full bg-surface-container-low overflow-hidden flex">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '35.3%' }}></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-surface-container-low">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Vehicle Efficiency</span>
                        <p className="font-title-md text-title-md text-on-surface font-bold mt-0.5">Toyota Innova</p>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Private SUV Matrix</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container-low">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Telemetry Radius</span>
                        <p className="font-title-md text-title-md text-on-surface font-bold mt-0.5">940 km</p>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Saurashtra Loop</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container-low">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Fastag Sync</span>
                        <p className="font-title-md text-title-md text-on-surface font-bold mt-0.5">8 Plazas</p>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Pre-authorized Auto</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container-low">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Reserve Contingency</span>
                        <p className="font-title-md text-title-md text-on-surface font-bold mt-0.5">₹530</p>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Roadside Buffer</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 flex items-center justify-between border-t border-surface-container-low text-on-surface-variant font-body-sm text-body-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                    Taxes transparently declared under GST 12% Sovereign Hospitality Protocol
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Auto-reconciled: Today, 14:32 IST</span>
                </div>
              </div>

              {/* Right: Companion Expansion Simulator */}
              <div className="lg:col-span-4 rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">tune</span>
                      <span className="font-title-md text-title-md text-on-surface font-bold">Expedition Scaler</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase">Live Algorithmic</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                    Analyze real-time marginal savings if additional sovereign companions join the Kutch convoy. Fixed costs amortize across passenger capacity.
                  </p>
                  <div className="p-4 rounded-xl bg-surface-container-low space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="paxSlider">
                        Group Size Simulation
                      </label>
                      <span className="font-title-lg text-title-lg font-bold text-primary">{simulatedPax} Explorers</span>
                    </div>
                    <input
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                      id="paxSlider"
                      max={14}
                      min={6}
                      step={1}
                      type="range"
                      value={simulatedPax}
                      onChange={(e) => setSimulatedPax(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-on-surface-variant font-label-caps text-label-caps">
                      <span>6 Pax</span>
                      <span>10 Pax (Current)</span>
                      <span>14 Pax (2 SUVs)</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Simulated Cost / Head:</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        ₹{simulatedPerHead.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Per Head Variance:</span>
                      <span
                        className={`font-label-lg text-label-lg font-bold ${
                          diffFromBaseline < 0 ? 'text-primary' : diffFromBaseline > 0 ? 'text-on-surface' : 'text-on-surface-variant'
                        }`}
                      >
                        {diffFromBaseline < 0
                          ? `₹${Math.abs(diffFromBaseline).toLocaleString('en-IN')} Saved / Head`
                          : diffFromBaseline > 0
                          ? `+₹${diffFromBaseline.toLocaleString('en-IN')} / Head`
                          : 'Current Expedition Baseline'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-container-low flex items-center gap-3">
                  <img
                    alt="Expedition Sovereign Guide"
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1WZuadRQKU3UEwQO6rbal-x1osIc2C5AEK3zvQYx6sB8h_VwAhruwUEWUx2kEdDgnott3tzJ25wIBIMCSqnnYW7Z88tIyyqVRysYnzNoq2j8qOW4UaYv-EhZbkWfSqNVRqAVgAffrbBFYtw62infW9BcNUrZdkSb4_eqfb1Cz9uqVE4_V4UH_ixvDav_R4KBb3EGVQ9ht5_hX6-FbCB0sbgSQ6d4Vy7hqnSjbfOEv2akTJ0pGf3z2U3FsPz"
                  />
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Aarav Mehta</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Expedition Treasurer &amp; Navigator</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-container/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">Algorithmic Win</span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Private SUV Consolidation</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Traveling with 10 companions in consolidated private Innovas saved <strong>₹22,800</strong> compared to fragmented regional connecting flights and on-call point-to-point taxi meters.
                  </p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-container/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">restaurant</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">Pre-booking Benefit</span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Kathiyawadi Thali Token Lock</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Pre-purchasing verified community banquet tokens secured an exclusive <strong>15% rebate</strong> against walk-in surge rates during peak Rann Utsav dinner rush periods.
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Category Breakdown Grid (4 Pillars) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Pillar Cost Decomposition</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Granular telemetry across logistics, stays, heritage gastronomy, and royal clearances.</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">filter_alt</span> Real-Time Fastag &amp; Merchant Vouchers
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* 1. Transportation */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">directions_car</span>
                      </div>
                      <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface uppercase">Pillar 01</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Transportation</h3>
                    <div className="flex items-baseline gap-2 mt-1 mb-4">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">₹11,200</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">/ ₹1,120 pax</span>
                    </div>
                    <ul className="space-y-3 pt-3 border-t border-surface-container-low">
                      <li className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Fuel (Innova 940 km)</span>
                        <span className="font-semibold text-on-surface">₹7,850</span>
                      </li>
                      <li className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">FASTag Tolls (8 plazas)</span>
                        <span className="font-semibold text-on-surface">₹1,620</span>
                      </li>
                      <li className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Parking &amp; Driver Bata</span>
                        <span className="font-semibold text-on-surface">₹1,200</span>
                      </li>
                      <li className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Contingency Fund</span>
                        <span className="font-semibold text-on-surface">₹530</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-surface-container-low flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Vehicle Efficiency</span>
                    <span className="font-label-md text-label-md font-semibold text-primary">12.4 km/l Avg</span>
                  </div>
                </div>

                {/* 2. Stays */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">hotel</span>
                      </div>
                      <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface uppercase">Pillar 02</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Stays &amp; Pavilions</h3>
                    <div className="flex items-baseline gap-2 mt-1 mb-4">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">₹18,000</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">/ ₹1,800 pax</span>
                    </div>
                    <ul className="space-y-3 pt-3 border-t border-surface-container-low">
                      <li className="flex flex-col text-body-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant font-medium">Dhordo Royal Swiss Tents</span>
                          <span className="font-semibold text-on-surface">₹12,000</span>
                        </div>
                        <span className="text-on-surface-variant/70 text-xs">2 nights • 3 family suites</span>
                      </li>
                      <li className="flex flex-col text-body-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant font-medium">Bhuj Darbargadh Haveli</span>
                          <span className="font-semibold text-on-surface">₹6,000</span>
                        </div>
                        <span className="text-on-surface-variant/70 text-xs">1 night heritage sovereign stay</span>
                      </li>
                      <li className="flex items-center justify-between text-body-sm pt-1">
                        <span className="text-on-surface-variant">Included GST (12% slab)</span>
                        <span className="font-semibold text-on-surface">₹1,928 incl.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-surface-container-low flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Quality Tier</span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Sovereign Heritage</span>
                  </div>
                </div>

                {/* 3. Food */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">skillet</span>
                      </div>
                      <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface uppercase">Pillar 03</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Food &amp; Banquets</h3>
                    <div className="flex items-baseline gap-2 mt-1 mb-4">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">₹8,500</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">/ ₹850 pax</span>
                    </div>
                    <ul className="space-y-3 pt-3 border-t border-surface-container-low">
                      <li className="flex flex-col text-body-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant font-medium">Kathiyawadi Thali Feasts</span>
                          <span className="font-semibold text-on-surface">₹5,400</span>
                        </div>
                        <span className="text-on-surface-variant/70 text-xs">6 meals × 10 people locked</span>
                      </li>
                      <li className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Highway Chai &amp; Dhaba</span>
                        <span className="font-semibold text-on-surface">₹2,100</span>
                      </li>
                      <li className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Desert Camp Bonfire Treats</span>
                        <span className="font-semibold text-on-surface">₹1,000</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-surface-container-low flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Dietary Verification</span>
                    <span className="font-label-md text-label-md font-semibold text-primary">100% Pure Kathiyawadi</span>
                  </div>
                </div>

                {/* 4. Permits */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">confirmation_number</span>
                      </div>
                      <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface uppercase">Pillar 04</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Permits &amp; Heritage</h3>
                    <div className="flex items-baseline gap-2 mt-1 mb-4">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">₹4,800</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">/ ₹480 pax</span>
                    </div>
                    <ul className="space-y-3 pt-3 border-t border-surface-container-low">
                      <li className="flex flex-col text-body-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant font-medium">White Rann Entry Permit</span>
                          <span className="font-semibold text-on-surface">₹1,000</span>
                        </div>
                        <span className="text-on-surface-variant/70 text-xs">DigiLocker pass for 10 pax</span>
                      </li>
                      <li className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Nirona Village Rogan Art</span>
                        <span className="font-semibold text-on-surface">₹1,800</span>
                      </li>
                      <li className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Sasan Gir Guide &amp; Gate</span>
                        <span className="font-semibold text-on-surface">₹2,000</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-surface-container-low flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Border Clearance</span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface">Pre-approved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-Time Expenditure Stream & Instant Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">Live FASTag &amp; Digital Debits</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Auto-captured from FASTag transponder &amp; sovereign UPI card</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface text-label-caps font-label-caps uppercase">
                    Auto-Reconciled
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-base">toll</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold">Samakhiali Toll Plaza (NH-41)</p>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">FASTag National Electronic Toll Collection • 11:24 AM</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">₹145</span>
                      <div className="text-xs text-primary font-medium">Cleared</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-base">local_gas_station</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold">Indian Oil Swagat Outpost - Bhachau</p>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">High-speed Diesel (42.5 L) • 09:15 AM</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">₹3,950</span>
                      <div className="text-xs text-primary font-medium">Cleared</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-base">local_cafe</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold">Honest Highway Plaza Chai &amp; Fafda</p>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Merchant UPI Instant Vouch • 07:45 AM</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">₹780</span>
                      <div className="text-xs text-primary font-medium">Cleared</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">Instant Split Balance</h3>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Sovereign Ledger</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    All 10 companions are currently in synchronous balance. Zero debt overhang detected.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="font-medium text-on-surface">Aarav Mehta (Lead Payer)</span>
                      </div>
                      <span className="font-semibold text-primary">+₹10,750 (Receiving)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-surface-container-high"></span>
                        <span className="font-medium text-on-surface">Diya &amp; Harsh Patel (2 Pax)</span>
                      </div>
                      <span className="font-semibold text-on-surface">Settled via UPI</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-surface-container-high"></span>
                        <span className="font-medium text-on-surface">Vikram Rathod &amp; Party (4 Pax)</span>
                      </div>
                      <span className="font-semibold text-on-surface">Settled via Auto-Debit</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-surface-container-low flex items-center justify-between">
                  <Link
                    href={`/trips/${tripId}/settle`}
                    className="font-label-md text-label-md text-primary font-bold flex items-center gap-1 hover:underline"
                  >
                    View Complete Settlement Matrix
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">account_balance</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

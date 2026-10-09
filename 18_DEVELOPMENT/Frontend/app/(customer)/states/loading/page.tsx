'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const AI_MESSAGES = [
  'Cross-referencing 1,200+ regional ground rules & temple procession times...',
  'Synchronizing GSRTC Volvo multi-axle schedules with ISKCON departure window...',
  'Locking Sasan Gir morning Gypsy permit quota (Zone 04)...',
  'Synthesizing dynamic weather telemetry for White Rann dusk moonlit walk...',
  'Matching 4 ancestral havelis in Old Ahmedabad with organic breakfast inclusions...',
];

export default function LoadingStatesPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [aiMessageIndex, setAiMessageIndex] = useState<number>(0);
  const [progressBarWidth, setProgressBarWidth] = useState<number>(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiMessageIndex((prev) => (prev + 1) % AI_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const restartAiPulse = () => {
    setProgressBarWidth(10);
    setTimeout(() => setProgressBarWidth(35), 400);
    setTimeout(() => setProgressBarWidth(68), 900);
    setTimeout(() => setProgressBarWidth(100), 1500);
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(20,26,50,0.05)]">
        <div className="h-16 px-gutter-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2">
              <img
                alt="BharatYatra Brand Wordmark"
                className="h-8 w-auto object-contain shrink-0"
                src="https://lh3.googleusercontent.com/aida/AEtjO1Vw9wMOduaJWZ_ebwaEs40EY0SRK4vWfQqCUV1mUyXLNesMH1jweOdrI0yU8nq-j0JMSkOXigYmJdD9xR-vXmrmFf-v0OVZbGCoRj4SRKTEm31s_E_7EaqBpm0TdrQ-3SZ9XJar_wSLcbmDnF_Dow65jo-lxBUoX8XyvAvxPRHq-uCwF9d6CeREzx9-VAXTHuKLB8k2-QOteDTJP_Mv5VD3DoF7ErdXwR-Y4qpyV9Y_wlXyZoYkYyJYC-k"
              />
            </Link>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-label-caps uppercase tracking-wider text-on-surface-variant truncate">BharatYatra</span>
              <span className="font-title-md text-title-md text-on-surface truncate">Explore</span>
            </div>
          </div>

          <div className="flex items-center gap-space-xs shrink-0">
            <Link className="hidden sm:inline-flex items-center gap-1.5 h-11 px-space-md rounded-xl bg-primary-container text-on-secondary-fixed font-label-lg text-label-lg shadow-[0_0_16px_rgba(254,214,91,0.3)] transition-transform hover:scale-[1.02]" href="/plan">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>Plan</span>
            </Link>
            <Link className="w-11 h-11 rounded-full flex items-center justify-center text-secondary hover:text-on-secondary-fixed hover:bg-surface-container transition-colors" href="/profile">
              <span className="material-symbols-outlined text-[22px]">bookmark</span>
            </Link>
            <Link href="/profile" className="w-11 h-11 rounded-full flex items-center justify-center">
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-[0_2px_8px_rgba(20,26,50,0.12)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMT7tnDeU3_47QlWmiuwfvMEq7_PXvKCXVMWN_LYADMbOeeCckWaJWalH_uXrqxiJcrm0XRQUom___J2TZ94qRgz7eJ4si1GlMt0IHr8RNa3p8LWnCmzGg_IJGWJj-afmaoqHA1peo4brVyMCGx5JSMIo7ZwA7HFVb15AaTNDIHIi8L7mlIuMUUCi_rJ97awEvvjlFzoDKwMOsjiOjV6vYUiBhWI0n2TzrCoIjipv4MytZpF5iOx737w" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-28 bg-surface">
        <div className="flex flex-col w-full">
          {/* Interactive Catalog Navigation Bar */}
          <section className="w-full bg-surface-container-low px-space-md py-space-lg">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-space-md">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Sovereign OS UI Registry</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Version 4.2 • Live Engine Spec</span>
                  </div>
                  <p className="font-headline-md text-headline-md text-on-surface tracking-tight mt-1">
                    Global Loading &amp; AI Processing States
                  </p>
                  <p className="font-body-md text-body-md text-secondary">
                    ભારત યાત્રા • Calibrated transit skeletons, neural trajectory synthesis, and transactional escrow pulses for the Gujarat Circuit.
                  </p>
                </div>

                <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-2 rounded-xl shadow-sm self-start md:self-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-secondary uppercase">Telemetry Pipeline</span>
                    <span className="font-label-md text-label-md text-on-surface">14 Live Gujarat Endpoints Active</span>
                  </div>
                </div>
              </div>

              {/* State Switcher Filter Tabs */}
              <div className="w-full overflow-x-auto pb-1">
                <div className="flex items-center gap-space-xs min-w-max bg-surface-container p-1 rounded-xl">
                  {[
                    { id: 'all', label: 'All 7 Archetypes', icon: 'apps' },
                    { id: 'neural', label: '1. Neural AI Synthesis', icon: 'auto_awesome' },
                    { id: 'transit', label: '2. Route Transit Loader', icon: 'route' },
                    { id: 'payment', label: '3. Escrow & Gateways', icon: 'lock' },
                    { id: 'skeletons', label: '4. Skeletons & Cards', icon: 'grid_view' },
                    { id: 'geospatial', label: '5. Geospatial Radar', icon: 'map' },
                    { id: 'micro', label: '6. Micro Button States', icon: 'touch_app' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                        activeTab === tab.id
                          ? 'bg-on-secondary-fixed text-primary-container shadow-sm font-semibold'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Master Interactive Container */}
          <div className="max-w-[1440px] mx-auto w-full px-gutter-mobile md:px-gutter py-space-xl flex flex-col gap-space-xl">
            {/* SECTION 1: FARVA AI NEURAL SYNTHESIS */}
            {(activeTab === 'all' || activeTab === 'neural') && (
              <section className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-label-caps text-label-caps bg-primary-container text-on-secondary-fixed">ARCHETYPE 01</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">&lt;FarvaNeuralLoader variant=&quot;subcontinental&quot; /&gt;</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-1">Farva AI Radiance Core • Neural Synthesis</h2>
                    <p className="font-body-md text-body-md text-secondary max-w-2xl">
                      Triggered during multi-modal autonomous route generation. Synthesizes temple morning pujas, tidal salt flats in Dhordo, and Gir sanctuary safari quota availability simultaneously.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 shadow-sm" onClick={restartAiPulse}>
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                      <span>Simulate Pipeline Restart</span>
                    </button>
                  </div>
                </div>

                <div className="relative w-full rounded-3xl overflow-hidden bg-white border-2 border-slate-300 text-slate-900 shadow-xl p-6 md:p-12">
                  <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
                    <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center mb-6">
                      <div className="absolute inset-0 rounded-full bg-blue-100/60 blur-xl animate-pulse"></div>
                      <div className="relative p-3 bg-white rounded-3xl border-2 border-slate-200 shadow-lg">
                        <img src="/logo.png" alt="BharatYatra Logo" className="h-16 w-auto object-contain animate-pulse" />
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-white/10 text-primary-container font-label-caps text-label-caps uppercase tracking-wider backdrop-blur-md mb-3">
                      Autonomous Sovereign Concierge
                    </span>
                    <h3 className="font-headline-md text-headline-md text-white tracking-tight mb-2">
                      Farva is synthesizing your Gujarat journey...
                    </h3>

                    <div className="h-10 flex items-center justify-center overflow-hidden mb-8">
                      <p className="font-body-md text-body-md text-white/80 transition-all duration-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FED65B] animate-ping"></span>
                        <span>{AI_MESSAGES[aiMessageIndex]}</span>
                      </p>
                    </div>

                    <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[2px] bg-white/10 z-0"></div>
                        <div className="absolute top-1/2 left-4 h-[2px] bg-gradient-to-r from-primary-container to-[#10B981] z-0 transition-all duration-700" style={{ width: `${progressBarWidth}%` }}></div>

                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-[#10B981] text-on-secondary-fixed flex items-center justify-center text-xs shadow-md">
                            <span className="material-symbols-outlined text-[16px] text-white">check</span>
                          </div>
                          <span className="font-label-caps text-label-caps text-white">Destination</span>
                          <span className="font-body-sm text-body-sm text-[#10B981] hidden sm:block">Locked</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-on-secondary-fixed flex items-center justify-center text-xs shadow-[0_0_12px_rgba(254,214,91,0.5)]">
                            <span className="material-symbols-outlined text-[16px]">sync</span>
                          </div>
                          <span className="font-label-caps text-label-caps text-primary-container">Transport</span>
                          <span className="font-body-sm text-body-sm text-primary-container hidden sm:block">Matching Volvo</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-[#141A32] border border-white/20 text-white/50 flex items-center justify-center text-xs">
                            <span className="w-2 h-2 rounded-full bg-white/40"></span>
                          </div>
                          <span className="font-label-caps text-label-caps text-white/60">Heritage Stay</span>
                          <span className="font-body-sm text-body-sm text-white/40 hidden sm:block">Queued</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-[#141A32] border border-white/20 text-white/50 flex items-center justify-center text-xs">
                            <span className="w-2 h-2 rounded-full bg-white/40"></span>
                          </div>
                          <span className="font-label-caps text-label-caps text-white/60">Living Guild</span>
                          <span className="font-body-sm text-body-sm text-white/40 hidden sm:block">Rogan / Patola</span>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className="w-8 h-8 rounded-full bg-[#141A32] border border-white/20 text-white/50 flex items-center justify-center text-xs">
                            <span className="material-symbols-outlined text-[14px] text-white/40">description</span>
                          </div>
                          <span className="font-label-caps text-label-caps text-white/60">Dossier</span>
                          <span className="font-body-sm text-body-sm text-white/40 hidden sm:block">Instant PNR</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-white/60 font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] text-[#10B981]">verified_user</span>
                      <span>Zero latency hallucination. Synchronized against Gujarat Tourism &amp; GSRTC live state APIs.</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: TRANSIT ROUTE LOADER */}
            {(activeTab === 'all' || activeTab === 'transit') && (
              <section className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-label-caps text-label-caps bg-secondary-container text-on-secondary-fixed">ARCHETYPE 02</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">&lt;TransitRouteLoader from=&quot;AMD&quot; to=&quot;KUTCH&quot; /&gt;</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-1">Full-Page Transit Route Vector Loader</h2>
                    <p className="font-body-md text-body-md text-secondary max-w-2xl">
                      Displays during route-segment swaps or inter-city transit calculations, visualizing the physical geographic trajectory across Gujarat terrain.
                    </p>
                  </div>
                </div>

                <div className="w-full bg-surface-container-lowest rounded-2xl p-6 md:p-10 shadow-md flex flex-col items-center text-center">
                  <div className="w-full max-w-2xl py-6 flex flex-col items-center">
                    <div className="w-full relative flex items-center justify-between">
                      <svg className="absolute inset-0 w-full h-12 -top-2 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 48">
                        <path d="M 20 24 C 180 8, 320 40, 580 24" fill="none" stroke="#E5EEFF" strokeLinecap="round" strokeWidth="4" />
                        <path className="animate-pulse" d="M 20 24 C 180 8, 320 40, 580 24" fill="none" stroke="#FED65B" strokeDasharray="140 380" strokeLinecap="round" strokeWidth="4" style={{ animationDuration: '2s' }} />
                      </svg>

                      <div className="relative z-10 flex flex-col items-center bg-surface-container-lowest px-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-[20px] text-primary">location_city</span>
                        </div>
                        <span className="font-title-md text-title-md text-on-surface mt-2">Ahmedabad</span>
                        <span className="font-label-caps text-label-caps text-secondary font-mono">23.0225° N</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center bg-surface-container-lowest px-4">
                        <div className="px-3 py-1 rounded-full bg-primary-container/20 text-on-primary-container font-label-caps text-label-caps uppercase flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                          <span>Golden Beam Transit</span>
                        </div>
                        <span className="font-body-sm text-body-sm text-secondary mt-1">GSRTC Express Line #402</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center bg-surface-container-lowest px-3">
                        <div className="w-10 h-10 rounded-full bg-on-secondary-fixed text-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(20,26,50,0.2)]">
                          <span className="material-symbols-outlined text-[20px]">wb_twilight</span>
                        </div>
                        <span className="font-title-md text-title-md text-on-surface mt-2">Dhordo Kutch</span>
                        <span className="font-label-caps text-label-caps text-secondary font-mono">23.8344° N</span>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center max-w-md">
                      <h4 className="font-title-lg text-title-lg text-on-surface">Preparing your Gujarat expedition...</h4>
                      <p className="font-body-md text-body-md text-secondary mt-1 text-center">
                        Aligning ancestral haveli check-ins, forest department gate slots, and private chauffeur links across Saurashtra.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 3: ESCROW & PAYMENT SETTLEMENT */}
            {(activeTab === 'all' || activeTab === 'payment') && (
              <section className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-label-caps text-label-caps bg-tertiary-container text-on-tertiary-fixed">ARCHETYPE 03 &amp; 04</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">&lt;EscrowLockState /&gt; • &lt;ProviderHandoffSync /&gt;</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-1">High-Confidence Financial &amp; Gateway Dispatch</h2>
                    <p className="font-body-md text-body-md text-secondary max-w-2xl">
                      States designed to eliminate payment anxiety during multi-bank UPI handoffs and official IRCTC / GSRTC reservation locks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {/* Card A */}
                  <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between pb-4">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary">State 3A: Escrow Transit</span>
                      <span className="flex items-center gap-1 font-mono text-label-caps text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span> TLS 256-BIT ESCROW
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center my-6">
                      <div className="relative w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                        <div className="absolute inset-0 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
                        <span className="material-symbols-outlined text-[36px] text-primary">security</span>
                      </div>
                      <h3 className="font-title-lg text-title-lg text-on-surface">Processing secure payment...</h3>
                      <span className="font-title-md text-title-md text-primary font-mono mt-1">₹ 14,850.00</span>
                      <div className="w-full mt-6 bg-surface-container-low rounded-xl p-4 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between text-body-sm font-body-sm">
                          <span className="flex items-center gap-2 text-on-surface">
                            <span className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px]">✓</span>
                            UPI / Bank Escrow Initiated
                          </span>
                          <span className="text-[#10B981] font-mono">0.42s</span>
                        </div>
                        <div className="flex items-center justify-between text-body-sm font-body-sm">
                          <span className="flex items-center gap-2 text-primary font-medium">
                            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                            National Clearing House Node Sync
                          </span>
                          <span className="text-primary font-mono">Resolving</span>
                        </div>
                        <div className="flex items-center justify-between text-body-sm font-body-sm text-secondary">
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-surface-container text-secondary flex items-center justify-center text-[10px]">•</span>
                            Instant BharatYatra PNR Dossier
                          </span>
                          <span className="font-mono">Pending</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-container-low/70 rounded-xl p-3 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">info</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Please do not refresh or press back. Your funds are secured in Farva Sovereign Escrow.
                      </p>
                    </div>
                  </div>

                  {/* Card B */}
                  <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-4">
                      <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">State 3B: Carrier Handshake</span>
                      <span className="font-mono text-label-caps text-secondary bg-surface-container px-2 py-0.5 rounded">
                        GATEWAY #GSRTC-V9
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center my-6">
                      <div className="relative w-20 h-20 rounded-full bg-on-secondary-fixed text-primary-container flex items-center justify-center mb-4 shadow-lg">
                        <span className="material-symbols-outlined text-[36px] animate-pulse">sync_alt</span>
                        <div className="absolute -inset-2 rounded-full border border-primary-container/40 animate-ping" style={{ animationDuration: '2.5s' }}></div>
                      </div>
                      <h3 className="font-title-lg text-title-lg text-on-surface">Locking berths with State Transport...</h3>
                      <p className="font-body-sm text-body-sm text-secondary mt-1 max-w-xs">
                        Direct telemetry connection to Gujarat State Road Transport Corporation Central Bus Terminal API.
                      </p>
                      <div className="w-full mt-6 bg-[#0A1128] text-white/80 rounded-xl p-3.5 text-left font-mono text-[12px] flex flex-col gap-1.5 shadow-inner">
                        <div className="flex items-center justify-between text-white/50 text-[10px]">
                          <span>TELEMETRY STREAM</span>
                          <span className="text-[#10B981]">STABLE (34ms)</span>
                        </div>
                        <div className="text-[#FED65B] truncate">&gt; CONNECT auth.gsrtc.gov.in:443 [TLS_AES_256]</div>
                        <div className="truncate">&gt; ACQUIRE_BERTH_LOCK: Bus #GJ-18-Z-9821</div>
                        <div className="truncate text-white/60">&gt; HOLD_QUOTA: Seat 12A, 12B [14m 58s countdown active]</div>
                      </div>
                    </div>
                    <div className="bg-[#10B981]/10 rounded-xl p-3 flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-[#10B981]">lock_clock</span>
                      <p className="font-body-sm text-body-sm text-on-surface">
                        Seats are reserved for <span className="font-semibold text-primary">14 minutes</span> while completing attendee verification.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: SKELETON CARDS */}
            {(activeTab === 'all' || activeTab === 'skeletons') && (
              <section className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-label-caps text-label-caps bg-primary-container text-on-secondary-fixed">ARCHETYPE 05</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">&lt;SkeletonCard variant=&quot;transit | stay | craft&quot; /&gt;</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-1">Calibrated Skeleton Cards &amp; Content Placeholders</h2>
                    <p className="font-body-md text-body-md text-secondary max-w-2xl">
                      Proportional wave shimmers matching exact line heights, card aspect ratios, and action buttons to ensure zero cumulative layout shift (CLS: 0.00).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  {/* Skeleton 1 */}
                  <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="w-28 h-5 rounded bg-surface-container-high animate-pulse"></div>
                        <div className="w-16 h-5 rounded-full bg-surface-container-high animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-between my-2">
                        <div className="flex flex-col gap-1">
                          <div className="w-16 h-6 rounded bg-surface-container animate-pulse"></div>
                          <div className="w-20 h-4 rounded bg-surface-container-low animate-pulse"></div>
                        </div>
                        <div className="flex-1 px-4 flex flex-col items-center gap-1">
                          <div className="w-full h-1 rounded bg-surface-container animate-pulse"></div>
                          <div className="w-12 h-3 rounded bg-surface-container-low animate-pulse"></div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="w-16 h-6 rounded bg-surface-container animate-pulse"></div>
                          <div className="w-20 h-4 rounded bg-surface-container-low animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-6 rounded-full bg-surface-container-low animate-pulse"></div>
                        <div className="w-20 h-6 rounded-full bg-surface-container-low animate-pulse"></div>
                        <div className="w-14 h-6 rounded-full bg-surface-container-low animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-5 mt-4">
                      <div className="flex flex-col gap-1">
                        <div className="w-10 h-3 rounded bg-surface-container-low animate-pulse"></div>
                        <div className="w-20 h-6 rounded bg-surface-container animate-pulse"></div>
                      </div>
                      <div className="w-28 h-10 rounded-xl bg-primary-container/40 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Skeleton 2 */}
                  <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="w-full h-44 bg-surface-container-high relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]"></div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="w-24 h-4 rounded bg-surface-container animate-pulse"></div>
                          <div className="w-12 h-4 rounded bg-surface-container animate-pulse"></div>
                        </div>
                        <div className="w-4/5 h-6 rounded bg-surface-container-high animate-pulse"></div>
                        <div className="w-1/2 h-4 rounded bg-surface-container-low animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex flex-col gap-1">
                          <div className="w-12 h-3 rounded bg-surface-container-low animate-pulse"></div>
                          <div className="w-24 h-6 rounded bg-surface-container animate-pulse"></div>
                        </div>
                        <div className="w-24 h-10 rounded-xl bg-surface-container-high animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Skeleton 3 */}
                  <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-surface-container-high shrink-0 animate-pulse"></div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="w-20 h-4 rounded-full bg-surface-container animate-pulse"></div>
                          <div className="w-full h-5 rounded bg-surface-container-high animate-pulse"></div>
                          <div className="w-2/3 h-4 rounded bg-surface-container-low animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-[1px] bg-surface-container my-1"></div>
                      <div className="flex items-center justify-between">
                        <div className="w-28 h-4 rounded bg-surface-container animate-pulse"></div>
                        <div className="w-16 h-4 rounded bg-surface-container animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-2">
                      <div className="w-16 h-6 rounded bg-surface-container animate-pulse"></div>
                      <div className="w-24 h-9 rounded-xl bg-on-secondary-fixed/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 5: GEOSPATIAL RADAR & TIMELINE */}
            {(activeTab === 'all' || activeTab === 'geospatial') && (
              <section className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-label-caps text-label-caps bg-on-secondary-fixed text-primary-container">ARCHETYPE 06</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">&lt;GeospatialRadarSkeleton /&gt;</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-1">Geospatial Radar &amp; Day-by-Day Timeline Skeleton</h2>
                    <p className="font-body-md text-body-md text-secondary max-w-2xl">
                      Simulates dynamic GPS waypoint scanning over the Rann of Kutch, Gir National Park, and Dwarka while synthesizing multi-day itineraries.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
                  <div className="lg:col-span-7 bg-[#0A1128] rounded-2xl p-6 text-white relative overflow-hidden min-h-[360px] flex flex-col justify-between shadow-xl">
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FED65B] animate-pulse"></span>
                        <span className="font-label-caps text-label-caps tracking-wider uppercase text-white/70">Geospatial Routing Mesh</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#FED65B] bg-white/10 px-2 py-0.5 rounded">
                        GPS SATELLITE: 11 ACQUIRED
                      </span>
                    </div>

                    <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-xl max-w-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary-container text-[18px]">radar</span>
                        <span className="font-label-md text-label-md text-white">Scanning Sanctuary Safari Gates...</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-white/70">
                        Calculating daylight hours and optimal animal crossing windows for Zone 04 morning slot.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-3">
                      <span className="font-title-md text-title-md text-on-surface">5-Day Saurashtra Itinerary</span>
                      <div className="w-16 h-5 rounded-full bg-primary-container/30 animate-pulse"></div>
                    </div>

                    <div className="relative flex flex-col gap-6 my-2 pl-4">
                      <div className="absolute top-2 bottom-2 left-[23px] w-[2px] bg-gradient-to-b from-primary-container via-surface-container-high to-surface-container"></div>
                      <div className="relative flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-primary-container text-on-secondary-fixed flex items-center justify-center shrink-0 z-10 ring-4 ring-surface-container-lowest">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-label-md text-label-md text-on-surface font-semibold">Day 1: Ahmedabad Heritage Walk</span>
                            <span className="font-mono text-xs text-primary">Locked</span>
                          </div>
                          <div className="w-full h-3 rounded bg-surface-container animate-pulse"></div>
                        </div>
                      </div>

                      <div className="relative flex items-start gap-4">
                        <div className="w-5 h-5 rounded-full bg-[#FED65B] text-on-secondary-fixed flex items-center justify-center shrink-0 z-10 ring-4 ring-surface-container-lowest shadow-[0_0_8px_rgba(254,214,91,0.6)]">
                          <span className="w-2 h-2 rounded-full bg-on-secondary-fixed animate-ping"></span>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-label-md text-label-md text-primary font-semibold">Day 2: Little Rann Sanctuary</span>
                            <span className="font-mono text-xs text-[#10B981] animate-pulse">Resolving Permits...</span>
                          </div>
                          <div className="w-4/5 h-3 rounded bg-primary-container/30 animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <span className="font-label-caps text-label-caps text-secondary font-mono">FARVA ITINERARY GENERATOR v3.8</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 6: MICRO-BUTTON STATES */}
            {(activeTab === 'all' || activeTab === 'micro') && (
              <section className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-label-caps text-label-caps bg-surface-container text-on-surface">ARCHETYPE 07</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant font-mono">&lt;Button loading=&#123;true&#125; /&gt;</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-1">Contextual Micro-Interactions &amp; Button Feedback</h2>
                    <p className="font-body-md text-body-md text-secondary max-w-2xl">
                      Inline spinners, reservation hold countdowns, and non-blocking contextual state chips tailored for precise user actions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                  <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase text-secondary">Variant: Primary Transit</span>
                      <span className="font-title-md text-title-md text-on-surface mt-0.5">Searching GSRTC</span>
                    </div>
                    <button className="w-full h-12 rounded-xl bg-primary-container text-on-secondary-fixed font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(254,214,91,0.35)] cursor-wait">
                      <span className="w-4 h-4 rounded-full border-2 border-on-secondary-fixed border-t-transparent animate-spin"></span>
                      <span>Searching Volvo Routes...</span>
                    </button>
                  </div>

                  <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase text-secondary">Variant: Royal Navy Luxury</span>
                      <span className="font-title-md text-title-md text-on-surface mt-0.5">Haveli Availability</span>
                    </div>
                    <button className="w-full h-12 rounded-xl bg-on-secondary-fixed text-white font-label-lg text-label-lg flex items-center justify-center gap-2 cursor-wait">
                      <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                      <span>Verifying Courtyard Suite...</span>
                    </button>
                  </div>

                  <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase text-secondary">Variant: Escrow Hold</span>
                      <span className="font-title-md text-title-md text-on-surface mt-0.5">Sasan Gir Gypsy Lock</span>
                    </div>
                    <button className="w-full h-12 rounded-xl bg-[#10B981] text-white font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-sm">
                      <span className="material-symbols-outlined text-[18px] animate-spin" style={{ animationDuration: '4s' }}>timelapse</span>
                      <span className="font-mono">Holding Quota: 14:42</span>
                    </button>
                  </div>

                  <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase text-secondary">Variant: Ambient AI Chip</span>
                      <span className="font-title-md text-title-md text-on-surface mt-0.5">Neural Suggestion</span>
                    </div>
                    <div className="w-full h-12 rounded-xl bg-surface-container-low border border-primary-container/40 px-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px] animate-pulse">neurology</span>
                        <span className="font-body-sm text-body-sm text-on-surface">Farva is re-optimizing...</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Navigation Dock */}
      <div className="fixed bottom-0 w-full z-50 pointer-events-none pb-safe">
        <div className="flex justify-center px-space-md pb-4">
          <nav className="pointer-events-auto w-full max-w-[420px] h-16 bg-[#141A32]/95 backdrop-blur-xl rounded-full px-space-sm flex items-center justify-around shadow-[0_12px_32px_-4px_rgba(20,26,50,0.35)]">
            <Link className="flex flex-col items-center justify-center min-w-[48px] h-12 text-surface-variant/80 hover:text-primary-container transition-all" href="/">
              <span className="material-symbols-outlined text-[20px]">home</span>
              <span className="font-label-caps text-label-caps mt-0.5 tracking-wide">Home</span>
            </Link>
            <Link className="flex flex-col items-center justify-center min-w-[48px] h-12 text-surface-variant/80 hover:text-primary-container transition-all" href="/map">
              <span className="material-symbols-outlined text-[20px]">explore</span>
              <span className="font-label-caps text-label-caps mt-0.5 tracking-wide">Explore</span>
            </Link>
            <div className="relative -top-3.5 flex flex-col items-center">
              <Link className="w-14 h-14 rounded-full bg-primary-container text-on-secondary-fixed flex items-center justify-center shadow-[0_8px_20px_rgba(254,214,91,0.45)] transition-transform hover:scale-105" href="/plan">
                <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
              </Link>
              <span className="font-label-caps text-label-caps text-primary-container mt-1 tracking-wider uppercase">Plan</span>
            </div>
            <Link className="flex flex-col items-center justify-center min-w-[48px] h-12 text-surface-variant/80 hover:text-primary-container transition-all" href="/my-trips">
              <span className="material-symbols-outlined text-[20px]">luggage</span>
              <span className="font-label-caps text-label-caps mt-0.5 tracking-wide">Trips</span>
            </Link>
            <Link className="flex flex-col items-center justify-center min-w-[48px] h-12 text-surface-variant/80 hover:text-primary-container transition-all" href="/profile">
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span className="font-label-caps text-label-caps mt-0.5 tracking-wide">Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

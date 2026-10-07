'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useAccessibility } from '@/lib/accessibility/accessibility-context';
import { VoiceSearchModal } from '@/components/accessibility/VoiceSearchModal';

export default function HomePageClient() {
  const { user, logout } = useAuth();
  const { t } = useAccessibility();
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const travelCategories = [
    { label: t.nav.stays, href: '/stays', icon: '🏨', color: 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100' },
    { label: t.nav.flights, href: '/flights', icon: '✈️', color: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100' },
    { label: t.nav.trains, href: '/trains', icon: '🚆', color: 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100' },
    { label: t.nav.buses, href: '/buses', icon: '🚌', color: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100' },
    { label: t.nav.packages, href: '/packages', icon: '🎒', color: 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100' },
    { label: t.nav.experiences, href: '/experiences', icon: '🎟️', color: 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100' },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(20,26,50,0.06)]">
        <div className="w-full px-gutter-desktop h-20 flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md min-w-[240px]">
            <Link href="/" className="flex items-center gap-space-md">
              <img
                alt="BharatYatra Logo"
                className="h-10 w-auto object-contain"
                src="/logo.png"
              />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-headline-md tracking-tight text-on-secondary-fixed leading-none uppercase font-bold">
                    BharatYatra
                  </span>
                </div>
                <span className="text-[11px] font-gujarati text-primary-container font-semibold tracking-wide mt-0.5">
                  ભારત યાત્રા • India AI Travel
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-space-xl">
            <Link
              aria-current="page"
              className="transition-colors py-space-xs text-on-secondary-fixed font-bold relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-[2px] after:bg-on-secondary-fixed"
              href="/explore"
            >
              Explore
            </Link>
            <Link
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
              href="/destinations"
            >
              Destinations
            </Link>
            <Link
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
              href="/packages"
            >
              Packages
            </Link>
            <Link
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
              href="/my-trips"
            >
              My Trips
            </Link>
            <Link
              className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
              href="/map"
            >
              Map Discovery
            </Link>
          </nav>

          <div className="flex items-center gap-space-md">
            <Link
              href="/plan"
              className="flex items-center gap-space-xs px-space-md py-space-sm bg-primary-container text-on-secondary-fixed rounded shadow-sm hover:bg-primary-fixed transition-all font-body-sm text-body-sm font-semibold"
            >
              <span className="tracking-wide">AI Planner</span>
              <span className="font-coordinate-meta text-coordinate-meta px-1.5 py-0.5 bg-on-secondary-fixed text-surface rounded text-[10px]">
                ⌘K
              </span>
            </Link>

            {/* DEFAULT CLIENT LOGIN & PROFILE STATE */}
            {user ? (
              <div className="flex items-center gap-space-sm pl-space-xs">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-xs font-semibold text-on-surface bg-surface-container-high border border-outline/20 hover:border-primary-container px-3 py-1.5 rounded-xl transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-container text-on-secondary-fixed flex items-center justify-center font-bold text-[10px]">
                    {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate">{user.fullName || user.email.split('@')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface-variant hover:text-red-500 hover:bg-surface-variant transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-space-xs pl-space-xs">
                <Link
                  href="/login"
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-space-md py-space-xs bg-primary-container text-on-secondary-fixed rounded-lg font-body-sm text-body-sm font-semibold hover:bg-primary-fixed transition-all"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          {/* SECTION 1: IMMERSIVE EDITORIAL HERO DECK */}
          <section className="relative w-full overflow-hidden bg-surface-container-lowest -mt-20">
            {/* Cinematic Full-Bleed Imagery with Scrim */}
            <div
              className="relative w-full min-h-[680px] bg-cover bg-center flex flex-col justify-between pt-28 pb-32 px-gutter-desktop"
              data-alt="Cinematic luxury editorial photograph of an ornate Rajasthani palace courtyard carved in sandstone at sunrise. Warm amber rays filtering through delicate jali screens onto glistening marble pools, surrounded by regal architecture, soft atmospheric golden mist, high-fashion travel aesthetic with deep navy shadows and Sahara gold highlights."
              style={{
                backgroundImage:
                  "url('/hero-bg.jpg')",
              }}
            >
              {/* Dual Direction Scrim for Maximum Legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-on-secondary-fixed/85 via-on-secondary-fixed/50 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-on-secondary-fixed/60 via-transparent to-on-secondary-fixed/80"></div>

              {/* Top Telemetry Ribbon */}
              <div className="relative z-10 w-full flex items-center justify-between">
                <div className="flex items-center gap-space-md">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-on-secondary-fixed/80 backdrop-blur-md rounded-full border border-surface-container-high/20 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                    <span className="font-coordinate-meta text-coordinate-meta text-surface uppercase tracking-wider">
                      Subcontinental Grid Active // Ep. 2025
                    </span>
                  </span>
                  <span className="hidden md:inline-block font-coordinate-meta text-coordinate-meta text-surface/90 drop-shadow">
                    LAT 20.5937° N • LON 78.9629° E
                  </span>
                </div>
                <div className="flex items-center gap-space-sm bg-on-secondary-fixed/80 backdrop-blur-md px-3 py-1.5 rounded border border-surface-container-high/20 text-surface shadow-sm">
                  <span
                    className="material-symbols-outlined text-sm text-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    sensors
                  </span>
                  <span className="font-coordinate-meta text-coordinate-meta tracking-widest uppercase text-surface">
                    7,420 Ground Nodes Polled Live
                  </span>
                </div>
              </div>

              {/* Centerpiece Editorial Typography */}
              <div className="relative z-10 my-auto max-w-5xl">
                <div className="flex items-center gap-space-sm mb-3">
                  <span className="w-6 h-[1.5px] bg-primary-container"></span>
                  <span className="font-coordinate-meta text-coordinate-meta uppercase tracking-widest text-primary-container font-semibold drop-shadow">
                    Autonomous Spatial Navigation
                  </span>
                </div>
                <h1 className="font-display-hero text-display-hero text-surface tracking-tight uppercase leading-[0.95] drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
                  DISCOVER
                  <br />
                  <span className="italic font-normal font-display-hero text-primary-container drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">INDIA</span>
                </h1>
                <p className="mt-4 font-headline-sm text-headline-sm text-surface max-w-2xl font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-relaxed">
                  With Adaptive AI Intelligence — The Subcontinental Operating System for deliberate, deeply grounded journeys across India.
                </p>
              </div>
            </div>

            {/* Floating Spatial Intelligence Console (Asymmetric Plinth) */}
            <div className="max-w-7xl mx-auto px-gutter-desktop -mt-10 relative z-20">
              <div className="bg-surface-container-lowest rounded-xl shadow-xl p-8 transition-all hover:shadow-2xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-surface-container-high">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-tertiary font-bold tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">explore</span> Spatial Telemetry Command
                    </span>
                    <h2 className="font-headline-md text-headline-md text-on-secondary-fixed mt-1">
                      Your Journey Awaits // State Intent
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    <span className="font-coordinate-meta text-coordinate-meta text-on-surface-variant uppercase">
                      Neural Optimizer: Ground-Sync v2.4 Ready
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 items-center">
                  {/* Parameter 1: Intent */}
                  <div className="flex flex-col">
                    <label className="font-coordinate-meta text-coordinate-meta uppercase text-outline mb-2">
                      Primary Intent Vector
                    </label>
                    <div className="bg-surface-container px-4 py-3 rounded flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">
                        Royal Heritage &amp; Slow Culinary
                      </span>
                      <span className="material-symbols-outlined text-sm text-outline">expand_more</span>
                    </div>
                  </div>
                  {/* Parameter 2: Temporal Window */}
                  <div className="flex flex-col">
                    <label className="font-coordinate-meta text-coordinate-meta uppercase text-outline mb-2">
                      Temporal Window &amp; Climate
                    </label>
                    <div className="bg-surface-container px-4 py-3 rounded flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">
                        Nov 14 — Nov 28 // Dry Season
                      </span>
                      <span className="material-symbols-outlined text-sm text-outline">calendar_today</span>
                    </div>
                  </div>
                  {/* Parameter 3: Pacing Protocol */}
                  <div className="flex flex-col">
                    <label className="font-coordinate-meta text-coordinate-meta uppercase text-outline mb-2">
                      Companion Pacing
                    </label>
                    <div className="bg-surface-container px-4 py-3 rounded flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">
                        Unrushed • Deep Immersion
                      </span>
                      <span className="material-symbols-outlined text-sm text-outline">speed</span>
                    </div>
                  </div>
                  {/* Action Button */}
                  <div className="flex flex-col justify-end pt-1 md:pt-6">
                    <Link
                      href="/plan"
                      className="w-full h-12 bg-primary-container hover:bg-primary-fixed text-on-secondary-fixed font-headline-sm text-sm font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <span>[ INITIALIZE TRIP OS ]</span>
                      <span className="material-symbols-outlined text-base">bolt</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: WHY BHARAT YATRA — INTERCONNECTED INTELLIGENCE NODES */}
          <section className="w-full py-24 px-gutter-desktop max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-coordinate-meta text-coordinate-meta uppercase text-tertiary font-bold tracking-wider">
                    Subcontinental OS Architecture
                  </span>
                  <span className="font-coordinate-meta text-coordinate-meta text-outline">// SYSTEM PILLARS</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-secondary-fixed">
                  Engineered For Zero Travel Shock
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Traditional travel planners compile stale blogs. BharatYatra operates a live sensorial feedback mesh that continuously verifies reality against intent.
              </p>
            </div>

            {/* Spatial Architectural Tri-Node Diagram */}
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Node 01: TRUTH */}
              <div className="relative bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-bl-full pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="px-3 py-1 bg-surface-container-high rounded text-on-secondary-fixed font-coordinate-meta text-coordinate-meta font-bold">
                      NODE 01 // TRUTH
                    </span>
                    <span className="material-symbols-outlined text-tertiary text-2xl">verified_user</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Every Place Ground-Verified</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Direct on-site sensors, private palace stewards, and telemetry validation confirm operating hours, ongoing renovations, and micro-entry protocols before you arrive.
                  </p>
                </div>
                {/* Telemetry Data Bar */}
                <div className="mt-8 pt-6 bg-surface-container-low -mx-8 -mb-8 p-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-coordinate-meta text-coordinate-meta text-outline uppercase">
                      Sensor Reliability Index
                    </span>
                    <span className="font-telemetry-data text-telemetry-data text-tertiary">99.4% VERIFIED</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-tertiary h-full w-[99.4%]"></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[11px] font-coordinate-meta text-outline">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    <span>Last sync: 2 min ago (Amer Fort, Jaipur)</span>
                  </div>
                </div>
              </div>

              {/* Node 02: ADAPT */}
              <div className="relative bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/30 rounded-bl-full pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="px-3 py-1 bg-surface-container-high rounded text-on-secondary-fixed font-coordinate-meta text-coordinate-meta font-bold">
                      NODE 02 // ADAPT
                    </span>
                    <span className="material-symbols-outlined text-primary text-2xl">dynamic_feed</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Dynamic Re-sequencing</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Cloudbursts over the Western Ghats or unexpected royal polo matches? The AI recalculates temporal windows, route vectors, and pacing effortlessly in real time.
                  </p>
                </div>
                {/* Interactive AI State Pill */}
                <div className="mt-8 pt-6 bg-surface-container-low -mx-8 -mb-8 p-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-coordinate-meta text-coordinate-meta text-outline uppercase">
                      Neural Reaction Latency
                    </span>
                    <span className="font-telemetry-data text-telemetry-data text-primary-container text-on-surface bg-primary-container px-1 rounded">
                      &lt; 380ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[11px] font-coordinate-meta text-tertiary">
                    <span className="material-symbols-outlined text-xs">sync_saved_locally</span>
                    <span>Autonomous reroute triggers enabled</span>
                  </div>
                </div>
              </div>

              {/* Node 03: INTENT */}
              <div className="relative bg-surface-container-lowest p-8 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-container/30 rounded-bl-full pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="px-3 py-1 bg-surface-container-high rounded text-on-secondary-fixed font-coordinate-meta text-coordinate-meta font-bold">
                      NODE 03 // INTENT
                    </span>
                    <span className="material-symbols-outlined text-on-secondary-fixed text-2xl">lock_open</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">Transparent Sanctuary Access</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Reserved suites in ancestral havelis, locked conservation reserves, and private appointments with royal curators. Fixed rates, zero hidden intermediary commissions.
                  </p>
                </div>
                {/* Telemetry Data Bar */}
                <div className="mt-8 pt-6 bg-surface-container-low -mx-8 -mb-8 p-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-coordinate-meta text-coordinate-meta text-outline uppercase">
                      Heritage Integrity Rating
                    </span>
                    <span className="font-telemetry-data text-telemetry-data text-on-surface">AA+ COVENANT</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[11px] font-coordinate-meta text-outline">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    <span>Direct conservation contribution locked</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: ASYMMETRIC EDITORIAL DESTINATION GALLERY */}
          <section className="w-full bg-surface-container py-24 px-gutter-desktop">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
                <div>
                  <span className="font-coordinate-meta text-coordinate-meta uppercase text-outline">
                    Geographic Vectors // Active Portfolios
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-secondary-fixed mt-1">Spatial Waypoints</h2>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <span className="font-coordinate-meta text-coordinate-meta text-tertiary">SURFACE TIER 1 ACTIVE</span>
                  <Link href="/destinations" className="px-4 py-2 bg-on-secondary-fixed text-surface rounded font-body-sm text-body-sm font-semibold hover:bg-on-secondary-fixed-variant transition-colors">
                    View All 28 Coordinates
                  </Link>
                </div>
              </div>

              {/* Asymmetric Editorial Composition */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Massive Centerpiece Frame: JAIPUR (7 Cols) */}
                <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group">
                  <div className="relative h-[380px] w-full overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      data-alt="Stunning aerial view of Amer Fort and the Pink Citadel of Jaipur nestled among the rugged Aravalli Hills at sunrise. Hot air balloons drifting slowly over terracotta roofs, tranquil Maota Lake reflections, high-contrast morning shadows with warm ochre and terracotta tones."
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCpTs-lbSMLDkJH7JxgBIsfdypHPSwQlm9XEzC8pr4FsJ8WF2sVOFR2MIrVscDUPgpm_eZguDEfo0D4XH9Er7Wnsz7wrXhiozFY5GMmWN5FR_HZwqasqiZl4UOVPSexAW_JKxJJJAiRhKr4bKD65UJP0SPF4lBjIvX2jMH5PSvIsbc6f_vxlGqwaukMfywytNmXm3_SvM-BvSmR0Z6IyejVQrphbVu0O_Ixc0G3uclY5OgESX_2QG5cUQ')",
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/80 via-transparent to-transparent"></div>
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                      <span className="px-3 py-1 bg-surface/90 backdrop-blur-md rounded font-coordinate-meta text-coordinate-meta text-on-secondary-fixed">
                        26.9124° N • 75.7873° E
                      </span>
                      <span className="px-3 py-1 bg-primary-container text-on-secondary-fixed rounded font-label-caps text-label-caps uppercase font-bold">
                        OPTIMAL SEASON
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 text-surface">
                      <span className="font-coordinate-meta text-coordinate-meta text-primary-container uppercase tracking-wider">
                        Waypoint Specimen 01
                      </span>
                      <h3 className="font-display-hero text-3xl font-bold uppercase">The Pink Citadel</h3>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        <span className="font-label-caps text-label-caps uppercase text-tertiary">
                          Signature Experience Synchronized
                        </span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                        Sunrise Hot Air Balloon Flight over Amer Fortress
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Ascend through cool morning thermals above 16th-century red sandstone ramparts. Touchdown on private polo grounds followed by champagne tasting at the Maharaja’s pavilion.
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-8 mt-6 border-t border-surface-container-high">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="block font-coordinate-meta text-coordinate-meta text-outline">
                            Thermal Comfort
                          </span>
                          <span className="font-telemetry-data text-telemetry-data text-on-surface">22°C // Mild</span>
                        </div>
                        <div>
                          <span className="block font-coordinate-meta text-coordinate-meta text-outline">
                            Pacing Density
                          </span>
                          <span className="font-telemetry-data text-telemetry-data text-tertiary">
                            Calibrated Calm
                          </span>
                        </div>
                      </div>
                      <Link href="/destinations" className="px-4 py-2 bg-surface-container-high hover:bg-primary-container text-on-secondary-fixed rounded font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-1">
                        Explore Leg <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Offset Satellites (5 Cols, 3 Stacked Cards) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Satellite 1: Udaipur */}
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex gap-5 items-center group cursor-pointer">
                    <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110"
                        data-alt="Close editorial shot of Lake Pichola in Udaipur with glistening white marble palace reflection at twilight. Elegant wooden private boat with embroidered silk canopy cutting gently through silent blue waters, opulent serene Indian luxury."
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZjflK0oVdabl5DjH-04_N9rubPxtdetNHg0eKD7_STcyUCg9XX1INHJb9Ex8GQZOWuk4hVc8uEyvej3JFYCBXYGYHL_jR-4YTsmoIL4F2EW7OLtcTHlUDacVEELB5xkDc5epR4CE6cMD0t-YtKwKuzTOIpV1e6CviUSwhrNh5pC_IBwe12rVhaKZX0mkHCCLzzyC6cW4WW5Vr-a2mbxpjia8hGqHwdKT4Lyfg44NEl5Y6CBQpQ6RhZw')",
                        }}
                      ></div>
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-coordinate-meta text-[10px] text-outline">24.5854° N</span>
                        <span className="font-coordinate-meta text-[10px] text-tertiary uppercase">LAKE LEVEL 98%</span>
                      </div>
                      <h4 className="font-headline-sm text-base text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                        Udaipur // City of Lakes
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                        Mewar Twilight Regatta &amp; Jagmandir Isle
                      </p>
                      <div className="flex items-center gap-2 mt-2 font-coordinate-meta text-[11px] text-outline">
                        <span
                          className="material-symbols-outlined text-xs text-primary-container"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span>Private Solar Catamaran Access</span>
                      </div>
                    </div>
                  </div>

                  {/* Satellite 2: Varanasi */}
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex gap-5 items-center group cursor-pointer">
                    <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110"
                        data-alt="Atmospheric mist-veiled morning at the ancient ghats of Varanasi on the Ganges river. Soft golden candlelight from floating marigold diyas, ancient stone steps with temple spires silhouetted against a lavender sunrise sky."
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDW-EeWWo1Ks0Apk9rxlETdK78VQ3bxiLujIdRX5S43kHHklMIh32PWOinvxyqLoj779rmGxt9lTvEOhelQEQH9GLcm2B1YqfY7KTH_ELRJ1YYINxgb9SCikiiEbXjtV-UewAZ-TUL83y9nzVeeLLkcRwmqybwfiI1DkXtZ_XLGGeNPzdivivM9UV7ClEElGEGxX8mhkZbLKmt2HNE3kl9Zn7k_as2IvZTkWCNyUpi6m6VOZ4WI3u1ZAQ')",
                        }}
                      ></div>
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-coordinate-meta text-[10px] text-outline">25.3176° N</span>
                        <span className="font-coordinate-meta text-[10px] text-primary uppercase">SACRED MERIDIAN</span>
                      </div>
                      <h4 className="font-headline-sm text-base text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                        Varanasi // Ancient Ghats
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                        Subah-e-Banaras Dawn Chant Expedition
                      </p>
                      <div className="flex items-center gap-2 mt-2 font-coordinate-meta text-[11px] text-outline">
                        <span
                          className="material-symbols-outlined text-xs text-primary-container"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span>Vedic Scholar Accompaniment</span>
                      </div>
                    </div>
                  </div>

                  {/* Satellite 3: Ladakh */}
                  <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex gap-5 items-center group cursor-pointer">
                    <div className="w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110"
                        data-alt="Dramatic high-altitude Himalayan mountain pass in Ladakh with snowy crags against deep cobalt sky. Ancient cliffside Buddhist monastery with prayer flags fluttering in crystal-clear mountain sunlight, ultra-sharp cold mountain editorial aesthetic."
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAh8xsG6LhmduV0S1uFcvWEqCDUu4hyeXrXeeHMI7OCyvwxDrqA0FpHc2sLxk2RnKjWumiS9ZB-Gs_HsCeODV0iKB3KFybprHRgehezQ9QgM4MUGaYS02ij5p8Slk4DCC4wfO2y6lMsh6n4yBVbW4LapUdVY82QJ-8QMV7oa8BPI9W7RMTfIK6bZL87j3SekMsnAsccaPnAmAhFR2QWOSlFn9AVyRO1FCOBMdx3rVKR6xE_o9Zi10539A')",
                        }}
                      ></div>
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-coordinate-meta text-[10px] text-outline">34.1526° N</span>
                        <span className="font-coordinate-meta text-[10px] text-on-secondary-container uppercase">
                          ALTITUDE 3,500M
                        </span>
                      </div>
                      <h4 className="font-headline-sm text-base text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                        Ladakh // Trans-Himalaya
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                        Monastery Chants &amp; Pangong Glamping
                      </p>
                      <div className="flex items-center gap-2 mt-2 font-coordinate-meta text-[11px] text-outline">
                        <span
                          className="material-symbols-outlined text-xs text-primary-container"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span>Hyperbaric Luxury Tents</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: TRAVEL OPERATING SYSTEM: THE FOUR PHASES */}
          <section className="w-full py-16 px-gutter-desktop max-w-7xl mx-auto">
            {/* Outer Container with Soft Slate Background & Crisp Border */}
            <div className="relative bg-slate-100/90 border-2 border-slate-300 rounded-3xl p-8 md:p-12 shadow-xl">
              {/* Section Header */}
              <div className="flex flex-col items-center text-center mb-14">
                <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-900 font-mono text-xs uppercase tracking-widest font-black shadow-sm">
                  ⚡ NEURAL FLIGHT PATH
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight">
                  The 4-Phase Operating Sequence
                </h2>
                <p className="text-slate-700 text-sm md:text-base max-w-xl mt-3 font-medium leading-relaxed">
                  How BharatYatra manages spatial reality before, during, and between your expeditions.
                </p>
              </div>

              {/* The 4 Phase Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Phase 01: DISCOVER */}
                <div className="flex flex-col bg-white border-2 border-slate-200 hover:border-amber-500 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-md group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      01
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-wide">DISCOVER</h3>
                  </div>
                  <p className="text-slate-700 text-xs md:text-sm leading-relaxed mb-6 font-normal">
                    Input deep stylistic desires via natural voice or text. The OS analyzes historical rainfall, palace festival dates, and crowd densities.
                  </p>
                  <div className="mt-auto bg-amber-50 border-2 border-amber-200/80 p-3.5 rounded-xl shadow-inner">
                    <div className="text-amber-900 font-black text-xs font-mono uppercase tracking-wider mb-1">
                      Signal Polling
                    </div>
                    <div className="text-slate-900 text-xs font-bold">
                      12,000 seasonal parameters analyzed.
                    </div>
                  </div>
                </div>

                {/* Phase 02: PLAN */}
                <div className="flex flex-col bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-md group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      02
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-wide">PLAN</h3>
                  </div>
                  <p className="text-slate-700 text-xs md:text-sm leading-relaxed mb-6 font-normal">
                    Assembles private railway car reservations, bespoke chauffeur links, and haveli sanctuaries into a synchronized spatial ledger.
                  </p>
                  <div className="mt-auto bg-blue-50 border-2 border-blue-200/80 p-3.5 rounded-xl shadow-inner">
                    <div className="text-blue-900 font-black text-xs font-mono uppercase tracking-wider mb-1">
                      Friction Index
                    </div>
                    <div className="text-slate-900 text-xs font-bold">
                      Zero double-bookings or unvetted delays.
                    </div>
                  </div>
                </div>

                {/* Phase 03: ADAPT (Highlighted LIVE AI Card) */}
                <div className="flex flex-col bg-gradient-to-b from-amber-500/10 via-emerald-50 to-white border-2 border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500"></div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        03
                      </span>
                      <h3 className="text-xl font-black text-slate-900 tracking-wide">ADAPT</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-600 text-white font-mono text-[10px] font-extrabold rounded-full flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      LIVE AI
                    </span>
                  </div>
                  <p className="text-slate-800 text-xs md:text-sm leading-relaxed mb-6 font-medium">
                    Continuous ground radar monitoring. When environmental conditions pivot, the itinerary recalibrates invisibly.
                  </p>
                  <div className="mt-auto bg-slate-950 text-white border-2 border-emerald-500/60 p-3.5 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-amber-400 font-black text-[10px] font-mono uppercase tracking-wider">
                        ⚡ Adaptive Moment Recorded
                      </span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded">
                        AUTONOMOUS
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs leading-snug font-medium">
                      “Rain detected at 16:30 at Hawa Mahal → Automatically rescheduled to City Palace private indoor textile atelier without user panic.”
                    </p>
                  </div>
                </div>

                {/* Phase 04: TRAVEL */}
                <div className="flex flex-col bg-white border-2 border-slate-200 hover:border-purple-500 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-md group">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      04
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-wide">TRAVEL</h3>
                  </div>
                  <p className="text-slate-700 text-xs md:text-sm leading-relaxed mb-6 font-normal">
                    A single haptic timeline card surfaces boarding passes, gate stewards, and offline encrypted vectors wherever cell towers falter.
                  </p>
                  <div className="mt-auto bg-purple-50 border-2 border-purple-200/80 p-3.5 rounded-xl shadow-inner">
                    <div className="text-purple-900 font-black text-xs font-mono uppercase tracking-wider mb-1">
                      Offline Resilience
                    </div>
                    <div className="text-slate-900 text-xs font-bold">
                      100% telemetry stored in local device cache.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: COMMAND LAUNCH FOOTER (Aerospace Grade Command Deck) */}
          <section className="w-full bg-on-secondary-fixed text-surface py-20 px-gutter-desktop relative overflow-hidden">
            {/* Ambient Golden Glow behind Command Console */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="max-w-5xl mx-auto relative z-10">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                  <span className="font-coordinate-meta text-coordinate-meta text-primary-container uppercase tracking-widest">
                    Neural Flight Deck // Session 01
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-surface">Begin Autonomous Expedition</h2>
                <p className="font-body-md text-body-md text-surface-container-high max-w-lg mt-2 font-light">
                  State your destination, duration, and sensory aesthetic. The BharatYatra kernel will synthesize a ground-verified itinerary in seconds.
                </p>
              </div>

              {/* Tactical Neural Prompt Console */}
              <div className="bg-surface-container-highest/10 backdrop-blur-xl p-3 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-3 pl-4 w-full flex-grow">
                  <span className="material-symbols-outlined text-primary-container text-xl">terminal</span>
                  <input
                    className="w-full bg-transparent text-surface placeholder-surface-container-high/60 font-body-md text-body-md focus:outline-none"
                    placeholder="e.g. 10 days in Rajasthan with private palace access, focused on heritage architecture and slow desert journeys..."
                    type="text"
                  />
                </div>
                <Link href="/plan" className="w-full sm:w-auto px-6 py-3.5 bg-primary-container hover:bg-primary-fixed text-on-secondary-fixed font-headline-sm text-sm font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 flex-shrink-0 transition-all">
                  <span>Synthesize Leg</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {/* Quick Vector Presets */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <span className="font-coordinate-meta text-coordinate-meta text-outline-variant uppercase">
                  Pre-Loaded Vectors:
                </span>
                <button className="px-3 py-1 bg-surface-container-highest/15 hover:bg-surface-container-highest/30 rounded text-surface-container-high font-coordinate-meta text-coordinate-meta transition-colors">
                  Royal Mewar &amp; Desert Forts (7D)
                </button>
                <button className="px-3 py-1 bg-surface-container-highest/15 hover:bg-surface-container-highest/30 rounded text-surface-container-high font-coordinate-meta text-coordinate-meta transition-colors">
                  Silent Backwaters &amp; Spice Coast (9D)
                </button>
                <button className="px-3 py-1 bg-surface-container-highest/15 hover:bg-surface-container-highest/30 rounded text-surface-container-high font-coordinate-meta text-coordinate-meta transition-colors">
                  Varanasi Ghats &amp; Buddhist Trail (5D)
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <VoiceSearchModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </div>
  );
}

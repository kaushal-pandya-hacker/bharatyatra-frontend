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

          {/* SECTION: ICONIC INDIA-LEVEL DESTINATIONS */}
          <section className="w-full py-20 px-gutter-desktop max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span className="font-coordinate-meta text-coordinate-meta uppercase text-tertiary font-bold tracking-wider">
                    NATIONAL HIGHLIGHTS // INDIA LEVEL
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-secondary-fixed">
                  Top Destinations of India
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md hidden sm:block">
                  Explore India’s most celebrated iconic destinations — from timeless heritage to Himalayan valleys and emerald backwaters.
                </p>
                <Link
                  href="/destinations"
                  className="px-4 py-2 bg-on-secondary-fixed text-surface rounded font-body-sm text-body-sm font-semibold hover:bg-on-secondary-fixed-variant transition-colors shrink-0"
                >
                  Explore All Destinations →
                </Link>
              </div>
            </div>

            {/* 4 Featured India-Level Destination Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  slug: 'taj-mahal-agra-fort',
                  title: 'Taj Mahal & Agra Fort',
                  location: 'Agra, Uttar Pradesh',
                  badge: 'UNESCO HERITAGE',
                  tag: 'MUGHAL MASTERWORK',
                  description: 'The eternal ivory-white marble mausoleum — the world’s most celebrated symbol of love on Yamuna’s banks.',
                  image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
                  rating: '4.9 ⭐',
                  idealDays: '2 Days',
                },
                {
                  slug: 'varanasi-ghats-kashi-vishwanath',
                  title: 'Varanasi Ancient Ghats',
                  location: 'Varanasi, Uttar Pradesh',
                  badge: 'SPIRITUAL CAPITAL',
                  tag: 'SACRED GANGES',
                  description: 'India’s oldest living city on the Ganges riverbank, famous for historic ghats, Ganga Aarti, and Kashi Vishwanath.',
                  image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
                  rating: '4.8 ⭐',
                  idealDays: '3 Days',
                },
                {
                  slug: 'alleppey-backwaters-houseboat',
                  title: 'Alleppey Backwaters',
                  location: 'Alappuzha, Kerala',
                  badge: "GOD'S OWN COUNTRY",
                  tag: 'TROPICAL LAGOONS',
                  description: 'Serene palm-fringed emerald backwaters and luxury traditional Kettuvallam houseboat cruises across Kerala.',
                  image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
                  rating: '4.9 ⭐',
                  idealDays: '2-3 Days',
                },
                {
                  slug: 'dal-lake-srinagar',
                  title: 'Srinagar & Dal Lake',
                  location: 'Srinagar, Jammu & Kashmir',
                  badge: 'PARADISE ON EARTH',
                  tag: 'HIMALAYAN SHIKARA',
                  description: 'Jewel of Kashmir featuring iconic wooden Shikaras on mirror-like Dal Lake and Mughal terraced gardens.',
                  image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
                  rating: '4.9 ⭐',
                  idealDays: '4 Days',
                },
              ].map((place) => (
                <Link
                  key={place.slug}
                  href={`/destinations/${place.slug}`}
                  className="group relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-surface-container-high/40 hover:-translate-y-1"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-surface/95 backdrop-blur-md text-on-secondary-fixed text-[10px] font-bold tracking-wider uppercase rounded shadow">
                        {place.badge}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-amber-300 text-xs font-semibold rounded">
                        {place.rating}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] font-medium text-amber-300 block mb-0.5 uppercase tracking-wider">
                        {place.location}
                      </span>
                      <h3 className="text-lg font-bold font-headline-md leading-snug group-hover:text-amber-300 transition-colors">
                        {place.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between bg-surface-container-lowest">
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
                      {place.description}
                    </p>
                    <div className="flex items-center justify-between pt-2.5 border-t border-surface-container-high/40 text-xs font-semibold text-tertiary">
                      <span className="font-coordinate-meta uppercase text-[10px] tracking-wider text-outline">{place.idealDays}</span>
                      <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Explore</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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

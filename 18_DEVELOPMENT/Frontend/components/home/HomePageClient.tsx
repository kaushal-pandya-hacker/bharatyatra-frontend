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
      {/* Main Content */}
      <main className="w-full bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          {/* SECTION 1: IMMERSIVE EDITORIAL HERO DECK */}
          <section className="relative w-full overflow-hidden bg-surface-container-lowest">
            {/* Cinematic Full-Bleed Imagery with Scrim */}
            <div
              className="relative w-full min-h-[520px] sm:min-h-[640px] bg-cover bg-center flex flex-col justify-between pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-12"
              data-alt="Cinematic luxury editorial photograph of an ornate Rajasthani palace courtyard carved in sandstone at sunrise. Warm amber rays filtering through delicate jali screens onto glistening marble pools, surrounded by regal architecture, soft atmospheric golden mist, high-fashion travel aesthetic with deep navy shadows and Sahara gold highlights."
              style={{
                backgroundImage:
                  "url('/hero-bg.jpg')",
              }}
            >
              {/* Dual Direction Scrim for Maximum Legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-on-secondary-fixed/85 via-on-secondary-fixed/50 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-on-secondary-fixed/60 via-transparent to-on-secondary-fixed/80"></div>

              {/* Centerpiece Editorial Typography */}
              <div className="relative z-10 my-auto max-w-5xl">
                <div className="flex items-center gap-space-sm mb-3">
                  <span className="w-6 h-[1.5px] bg-primary-container"></span>
                  <span className="font-coordinate-meta text-[10px] sm:text-xs uppercase tracking-widest text-primary-container font-semibold drop-shadow">
                    Autonomous Spatial Navigation
                  </span>
                </div>
                <h1 className="font-display-hero text-3xl sm:text-5xl lg:text-6xl text-surface tracking-tight uppercase leading-[0.95] drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)] font-bold">
                  DISCOVER
                  <br />
                  <span className="italic font-normal font-display-hero text-primary-container drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">INDIA</span>
                </h1>
                <p className="mt-4 font-headline-sm text-sm sm:text-base lg:text-lg text-surface max-w-2xl font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-relaxed">
                  With Adaptive AI Intelligence — The Subcontinental Operating System for deliberate, deeply grounded journeys across India.
                </p>
              </div>
            </div>

            {/* Floating Spatial Intelligence Console */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
              <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-5 sm:p-8 transition-all hover:shadow-2xl border border-surface-container-high/50">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-surface-container-high">
                  <div>
                    <span className="font-label-caps text-[10px] sm:text-xs uppercase text-tertiary font-bold tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">explore</span> Spatial Telemetry Command
                    </span>
                    <h2 className="font-headline-md text-lg sm:text-xl font-bold text-on-secondary-fixed mt-1">
                      Your Journey Awaits // State Intent
                    </h2>
                  </div>
                  <div className="flex items-center gap-2.5 bg-surface-container-low px-3 py-1.5 rounded-lg text-xs">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    <span className="font-coordinate-meta text-[10px] sm:text-xs text-on-surface-variant uppercase font-semibold">
                      Neural Optimizer: Ground-Sync v2.4 Ready
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 items-center">
                  {/* Parameter 1: Intent */}
                  <div className="flex flex-col">
                    <label className="font-coordinate-meta text-[10px] uppercase text-outline mb-1.5 font-bold">
                      Primary Intent Vector
                    </label>
                    <div className="bg-surface-container px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                      <span className="font-body-md text-xs sm:text-sm font-semibold text-on-surface truncate">
                        Royal Heritage &amp; Slow Culinary
                      </span>
                      <span className="material-symbols-outlined text-sm text-outline shrink-0 ml-1">expand_more</span>
                    </div>
                  </div>
                  {/* Parameter 2: Temporal Window */}
                  <div className="flex flex-col">
                    <label className="font-coordinate-meta text-[10px] uppercase text-outline mb-1.5 font-bold">
                      Temporal Window &amp; Climate
                    </label>
                    <div className="bg-surface-container px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                      <span className="font-body-md text-xs sm:text-sm font-semibold text-on-surface truncate">
                        Nov 14 — Nov 28 // Dry Season
                      </span>
                      <span className="material-symbols-outlined text-sm text-outline shrink-0 ml-1">calendar_today</span>
                    </div>
                  </div>
                  {/* Parameter 3: Pacing Protocol */}
                  <div className="flex flex-col">
                    <label className="font-coordinate-meta text-[10px] uppercase text-outline mb-1.5 font-bold">
                      Companion Pacing
                    </label>
                    <div className="bg-surface-container px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                      <span className="font-body-md text-xs sm:text-sm font-semibold text-on-surface truncate">
                        Unrushed • Deep Immersion
                      </span>
                      <span className="material-symbols-outlined text-sm text-outline shrink-0 ml-1">speed</span>
                    </div>
                  </div>
                  {/* Action Button */}
                  <div className="flex flex-col justify-end pt-2 sm:pt-0">
                    <Link
                      href="/plan"
                      className="w-full h-11 sm:h-12 bg-primary-container hover:bg-primary-fixed text-on-secondary-fixed font-headline-sm text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
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
          <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="font-mono text-xs uppercase text-slate-500 font-bold tracking-widest">
                    NATIONAL HIGHLIGHTS // INDIA LEVEL
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight">
                  Top Destinations of India
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-xs sm:text-sm text-slate-600 max-w-md hidden sm:block font-normal leading-relaxed">
                  Explore India’s most celebrated iconic destinations — from timeless heritage to Himalayan valleys and emerald backwaters.
                </p>
                <Link
                  href="/destinations"
                  className="px-5 py-2.5 bg-[#0B132B] hover:bg-[#1C2541] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 group"
                >
                  <span>Explore All Destinations</span>
                  <span className="text-sm group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* 4 Featured India-Level Destination Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  slug: 'taj-mahal-agra-fort',
                  title: 'Taj Mahal & Agra Fort',
                  location: 'AGRA, UTTAR PRADESH',
                  badge: 'UNESCO HERITAGE',
                  description: 'The eternal ivory-white marble mausoleum — the world’s most celebrated symbol of love on Yamuna’s banks.',
                  image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
                  rating: '4.9 ★',
                  idealDays: '2 DAYS',
                },
                {
                  slug: 'varanasi-ghats-kashi-vishwanath',
                  title: 'Varanasi Ancient Ghats',
                  location: 'VARANASI, UTTAR PRADESH',
                  badge: 'SPIRITUAL CAPITAL',
                  description: 'India’s oldest living city on the Ganges riverbank, famous for historic ghats, Ganga Aarti, and Kashi Vishwanath.',
                  image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
                  rating: '4.8 ★',
                  idealDays: '3 DAYS',
                },
                {
                  slug: 'alleppey-backwaters-houseboat',
                  title: 'Alleppey Backwaters',
                  location: 'ALAPPUZHA, KERALA',
                  badge: "GOD'S OWN COUNTRY",
                  description: 'Serene palm-fringed emerald backwaters and luxury traditional Kettuvallam houseboat cruises across Kerala.',
                  image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
                  rating: '4.9 ★',
                  idealDays: '2-3 DAYS',
                },
                {
                  slug: 'dal-lake-srinagar',
                  title: 'Srinagar & Dal Lake',
                  location: 'SRINAGAR, JAMMU & KASHMIR',
                  badge: 'PARADISE ON EARTH',
                  description: 'Jewel of Kashmir featuring iconic wooden Shikaras on mirror-like Dal Lake and Mughal terraced gardens.',
                  image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
                  rating: '4.9 ★',
                  idealDays: '4 DAYS',
                },
              ].map((place) => (
                <Link
                  key={place.slug}
                  href={`/destinations/${place.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between border border-slate-200/80 hover:border-emerald-500/50 hover:-translate-y-1.5"
                >
                  <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                    <img
                      src={place.image}
                      alt={place.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black tracking-wider uppercase rounded-md shadow-sm">
                        {place.badge}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-extrabold rounded-md shadow-sm flex items-center gap-1">
                        {place.rating}
                      </span>
                    </div>
                    <div className="absolute bottom-3.5 left-4 right-4 text-white">
                      <span className="text-[10px] font-bold text-amber-300 block mb-0.5 uppercase tracking-widest font-mono">
                        {place.location}
                      </span>
                      <h3 className="text-lg font-bold font-serif leading-snug group-hover:text-amber-300 transition-colors drop-shadow-sm">
                        {place.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 font-normal">
                      {place.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                      <span className="font-mono text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                        {place.idealDays}
                      </span>
                      <div className="flex items-center gap-1 text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-1 transition-all">
                        <span className="font-bold text-xs">Explore</span>
                        <span className="text-sm">→</span>
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

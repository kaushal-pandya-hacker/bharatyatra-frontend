'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Compass, Search } from 'lucide-react';
import { useDiwali } from '@/lib/campaigns/diwali-context';
import { DiwaliDiya } from './DiwaliDiya';
import { DiwaliGoldenAmbience } from './DiwaliGoldenAmbience';

export function DiwaliHeroDeck() {
  const router = useRouter();
  const { campaign } = useDiwali();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/plan?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const badge = campaign?.hero?.badge || '✨ BHARATYATRA DIWALI SPECIAL';
  const heading = campaign?.hero?.heading || 'Make This Diwali a Journey to Remember.';
  const tagline = campaign?.hero?.tagline || 'THIS DIWALI, EXPLORE INDIA. CELEBRATE EVERY JOURNEY.';
  const offerHeadline = campaign?.hero?.offerHeadline || 'CELEBRATE DIWALI WITH THE BEST TRAVEL OFFERS!';
  const description =
    campaign?.hero?.description ||
    'From the mountains of the Himalayas to the beautiful beaches of Goa, discover India and create memories this festive season.';
  const primaryCta = campaign?.hero?.primaryCta || 'PLAN YOUR DIWALI TRIP';
  const primaryCtaHref = campaign?.hero?.primaryCtaHref || '/plan';
  const secondaryCta = campaign?.hero?.secondaryCta || 'EXPLORE INDIA';
  const secondaryCtaHref = campaign?.hero?.secondaryCtaHref || '/destinations';

  return (
    <section className="relative w-full overflow-hidden bg-[#0A1128] text-white">
      {/* Background Image with Deep Cinematic Warm Scrim */}
      <div className="relative w-full min-h-[580px] sm:min-h-[660px] flex flex-col justify-between pt-12 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-12">
        <Image
          src="/hero-bg.jpg"
          alt="Cinematic Indian architectural palace courtyard at twilight illuminated with festive Diwali lights"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center pointer-events-none -z-0 opacity-45 mix-blend-luminosity"
        />

        {/* Ambient Golden particles and warm festive glows */}
        <DiwaliGoldenAmbience density="medium" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1128]/95 via-[#102A56]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-[#0A1128]/80 pointer-events-none" />
        <div className="absolute -top-32 right-1/4 w-[500px] h-[300px] bg-[#F5BD4F]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Hero Centerpiece Content */}
        <div className="relative z-20 my-auto max-w-4xl space-y-6">
          
          {/* Campaign Badges & Diya */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102A56]/90 border border-[#F5BD4F]/50 shadow-md backdrop-blur-md">
              <DiwaliDiya size={16} animate={true} />
              <span className="font-extrabold text-[11px] sm:text-xs text-[#F5BD4F] uppercase tracking-wider">
                {badge}
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-[11px] font-bold border border-white/15 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-[#F5BD4F]" />
              <span>{offerHeadline}</span>
            </span>
          </div>

          {/* Festive Heading */}
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-black tracking-widest text-[#F5BD4F] uppercase block font-mono">
              {tagline}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif text-white tracking-tight leading-[1.05] drop-shadow-md">
              {heading}
            </h1>
          </div>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow">
            {description}
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href={primaryCtaHref}
              className="px-7 py-4 bg-gradient-to-r from-[#F5BD4F] via-[#ffc857] to-[#F28C28] hover:from-[#ffc857] hover:to-[#f59e3b] text-[#102A56] font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2.5 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
            >
              <DiwaliDiya size={20} animate={false} />
              <span>{primaryCta}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={secondaryCtaHref}
              className="px-6 py-4 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2 transition-all shadow-md hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4 text-[#F5BD4F]" />
              <span>{secondaryCta}</span>
            </Link>
          </div>

          {/* Fast AI Itinerary Prompt Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-4 max-w-2xl"
          >
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-[#F5BD4F]/30 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-3 pl-3.5 w-full flex-grow">
                <Search className="w-4 h-4 text-[#F5BD4F] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to celebrate this Diwali? (e.g. Royal Rajasthan, Kashi Ghats, Kerala)..."
                  className="w-full bg-transparent text-white placeholder-slate-300 text-xs sm:text-sm focus:outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F5BD4F] hover:bg-[#ffc857] text-[#102A56] text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition shadow-md"
              >
                <span>Plan Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>
      </div>
    </section>
  );
}


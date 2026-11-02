'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Clock, MapPin, Sparkles } from 'lucide-react';
import { useDiwali } from '@/lib/campaigns/diwali-context';
import { DiwaliDiya } from './DiwaliDiya';

export function DiwaliDestinationsSection() {
  const { campaign } = useDiwali();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const heading =
    campaign?.destinationsSection?.heading || 'Celebrate Diwali Across Incredible India';
  const description =
    campaign?.destinationsSection?.description ||
    'Explore the country’s most celebrated destinations draped in golden lights and festive joy.';
  const categories = campaign?.destinationsSection?.categories || [];
  const destinations = campaign?.destinationsSection?.featuredDestinations || [];

  const filtered = destinations.filter((d) =>
    selectedCategory === 'ALL' ? true : d.category === selectedCategory
  );

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white font-sans border-t border-slate-200">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF9EF] border border-[#F5BD4F]/50 mb-3 shadow-2xs">
              <DiwaliDiya size={16} animate={false} />
              <span className="font-mono text-[11px] font-black uppercase text-[#102A56] tracking-widest">
                DIWALI DESTINATION TRAILS
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-[#102A56] tracking-tight">
              {heading}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mt-2 font-normal leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/destinations"
              className="px-5 py-2.5 rounded-xl bg-[#102A56] hover:bg-[#1769AA] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 group"
            >
              <span>Explore All 36 States</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            type="button"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#102A56] text-[#F5BD4F] shadow-xs border border-[#F5BD4F]/50 font-black'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
            }`}
          >
            All Festive Trails ({destinations.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#102A56] text-[#F5BD4F] shadow-xs border border-[#F5BD4F]/50 font-black'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Destinations Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((dest) => (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:border-[#F5BD4F] hover:-translate-y-1"
            >
              {/* Image Banner */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* State Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-[#102A56]/90 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase rounded-lg border border-white/20 shadow-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#F5BD4F]" />
                    <span>{dest.state}</span>
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-[#F5BD4F] text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#F5BD4F] text-[#F5BD4F]" />
                    <span>{dest.rating}</span>
                  </span>
                </div>

                {/* Title */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold text-[#F5BD4F] uppercase tracking-wider block mb-0.5">
                    {dest.category}
                  </span>
                  <h3 className="text-lg font-bold font-serif leading-snug group-hover:text-[#F5BD4F] transition-colors drop-shadow-sm">
                    {dest.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {dest.tagline}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                    <Clock className="w-3 h-3 text-[#102A56]" />
                    <span>{dest.idealDuration}</span>
                  </span>

                  <div className="flex items-center gap-1 text-[#102A56] group-hover:text-[#F28C28] group-hover:translate-x-0.5 transition-all">
                    <span className="font-extrabold text-xs">Plan Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* AI Callout Banner within Discovery */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#102A56] via-[#1769AA] to-[#102A56] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#F5BD4F]/40 relative overflow-hidden">
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F5BD4F] text-[11px] font-black uppercase tracking-wider border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CUSTOM FESTIVE ITINERARIES</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-serif">
              Want a Personalized Diwali Road Trip or Family Holiday?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-light">
              Let BharatYatra AI analyze travel distances, family preferences, and festive hours to recommend the perfect itinerary in seconds.
            </p>
          </div>

          <Link
            href="/plan"
            className="relative z-10 px-6 py-3.5 rounded-2xl bg-[#F5BD4F] hover:bg-[#ffc857] text-[#102A56] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center gap-2 shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <span>Plan with AI Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}


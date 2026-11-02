'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { useDiwali } from '@/lib/campaigns/diwali-context';
import { DiwaliDiya } from './DiwaliDiya';

export function DiwaliOffersSection() {
  const { campaign } = useDiwali();

  const heading = campaign?.offersSection?.heading || 'Your Festive Journey Starts Here';
  const description =
    campaign?.offersSection?.description ||
    'Make this Diwali unforgettable with journeys across incredible India.';
  const categories = campaign?.offersSection?.categories || [];

  return (
    <section id="diwali-offers" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF9EF] border border-[#F5BD4F]/50 mb-3 shadow-2xs">
              <DiwaliDiya size={16} animate={false} />
              <span className="font-mono text-[11px] font-black uppercase text-[#102A56] tracking-widest">
                FESTIVE TRAVEL CURATIONS
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
              href="/packages"
              className="px-5 py-2.5 rounded-xl bg-[#102A56] hover:bg-[#1769AA] text-white text-xs font-bold transition shadow-xs flex items-center gap-2 group"
            >
              <span>View All Holiday Packages</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 8 Category Offer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.exploreHref}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-[#F5BD4F] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              {/* Card Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-[#102A56]/90 backdrop-blur-md text-[#F5BD4F] text-[10px] font-black tracking-wider uppercase rounded-lg border border-[#F5BD4F]/40 shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#F5BD4F]" />
                    <span>{cat.badge}</span>
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold font-serif leading-snug group-hover:text-[#F5BD4F] transition-colors drop-shadow-sm">
                    {cat.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {cat.description}
                </p>

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#F28C28]">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.startingPriceLabel}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-bold text-[#102A56] group-hover:text-[#1769AA] transition-colors">
                    <span className="text-xs font-extrabold uppercase tracking-wider">Explore Options</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#F28C28]" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Reassurance Footer Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF9EF] border border-[#F5BD4F]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#F5BD4F]/60 flex items-center justify-center text-[#102A56] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#087E83]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">
                100% Verified Ground Stays &amp; Operators Across India
              </span>
              <span className="text-slate-500 text-[11px]">
                Transparent booking with real live rates, zero hidden charges, and 24/7 dedicated traveler support.
              </span>
            </div>
          </div>

          <Link
            href="/contact"
            className="px-4 py-2 bg-white hover:bg-slate-50 text-[#102A56] border border-slate-200 rounded-xl font-bold text-xs shrink-0 text-center transition"
          >
            Speak to Traveler Concierge
          </Link>
        </div>

      </div>
    </section>
  );
}


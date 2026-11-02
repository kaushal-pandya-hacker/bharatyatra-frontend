'use client';

import React from 'react';
import Link from 'next/link';
import { X, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { useDiwali } from '@/lib/campaigns/diwali-context';
import { DiwaliDiya } from './DiwaliDiya';

export function DiwaliGreetingModal() {
  const { showGreetingModal, dismissGreetingModal, campaign } = useDiwali();

  if (!showGreetingModal) {
    return null;
  }

  const title = campaign?.popup?.title || 'Happy Diwali! 🪔';
  const message =
    campaign?.popup?.message ||
    'May every journey bring you happiness, new experiences, and beautiful memories. Celebrate this festive season by exploring incredible India with BharatYatra.';
  const ctaText = campaign?.popup?.ctaText || 'Explore Diwali Offers';
  const ctaHref = campaign?.popup?.ctaHref || '/#diwali-offers';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#102A56] via-[#14223D] to-[#0A1128] border-2 border-[#F5BD4F]/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center space-y-6 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#F5BD4F]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={dismissGreetingModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition z-10"
          aria-label="Close Diwali Greeting"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Diya Centerpiece */}
        <div className="relative inline-flex items-center justify-center pt-2">
          <div className="w-20 h-20 rounded-full bg-[#F5BD4F]/10 border border-[#F5BD4F]/30 flex items-center justify-center shadow-inner">
            <DiwaliDiya size={48} animate={true} />
          </div>
        </div>

        {/* Heading & Greeting */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5BD4F]/20 border border-[#F5BD4F]/40 text-[#F5BD4F] text-[11px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FESTIVE BLESSINGS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto font-normal pt-1">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2 relative z-10">
          <Link
            href={ctaHref}
            onClick={dismissGreetingModal}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F5BD4F] to-[#F28C28] hover:from-[#ffc857] hover:to-[#f59e3b] text-[#102A56] font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={dismissGreetingModal}
            type="button"
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            Continue to BharatYatra →
          </button>
        </div>

        {/* Subtle Brand Tagline */}
        <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 font-medium">
          BHARATYATRA — Discover India. Experience More.
        </div>
      </div>
    </div>
  );
}


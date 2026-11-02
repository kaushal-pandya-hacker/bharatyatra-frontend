'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useDiwali } from '@/lib/campaigns/diwali-context';
import { DiwaliDiya } from './DiwaliDiya';

export function DiwaliTopBanner() {
  const { isDiwaliActive, campaign } = useDiwali();
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = usePathname();

  // Hide on auth, admin, checkout, and supplier portals
  const isExcluded =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/bharatyatra-ops') ||
    pathname?.startsWith('/supplier') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup');

  if (!isDiwaliActive || !campaign?.banner?.isEnabled || isDismissed || isExcluded) {
    return null;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-[#102A56] via-[#1A3A70] to-[#102A56] border-b border-[#F5BD4F]/40 text-white py-2 px-3 sm:px-6 z-40 shadow-sm transition-all">
      <div className="max-w-[1536px] mx-auto flex items-center justify-between gap-3 text-xs">
        
        {/* Left / Center: Festive Message */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center sm:justify-start min-w-0">
          <DiwaliDiya size={18} animate={false} />
          <div className="flex items-center gap-2 truncate">
            <span className="font-extrabold text-[#F5BD4F] uppercase tracking-wider text-[11px] sm:text-xs shrink-0 flex items-center gap-1">
              <span>{campaign.banner.text}</span>
            </span>
            <span className="hidden md:inline text-slate-300 font-medium text-xs">
              • {campaign.hero.offerHeadline}
            </span>
          </div>
        </div>

        {/* Right: CTA & Dismiss */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href={campaign.banner.actionHref || '/plan'}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5BD4F] hover:bg-[#ffc857] text-[#102A56] font-black text-[11px] shadow-xs transition-transform hover:scale-105 active:scale-95"
          >
            <span>{campaign.banner.actionText || 'Plan Your Diwali Trip'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            aria-label="Dismiss Diwali announcement"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


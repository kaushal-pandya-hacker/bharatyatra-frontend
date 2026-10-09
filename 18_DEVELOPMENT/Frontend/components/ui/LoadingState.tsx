'use client';

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  type?: 'full' | 'cards' | 'ai' | 'inline';
}

export function LoadingState({
  title = 'Searching Farva Sovereign Database...',
  subtitle = 'Crafting live itineraries, checking live transport & real-time inventory...',
  type = 'full',
}: LoadingStateProps) {
  if (type === 'ai') {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card rounded-2xl border border-farva-gold-sahara/30 text-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-farva-gold-sahara/20 animate-pulse-radar flex items-center justify-center" />
          <div className="absolute h-16 w-16 rounded-full gold-gradient-bg flex items-center justify-center text-farva-navy-deep shadow-farva-gold">
            <Sparkles className="h-8 w-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-heading font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">{subtitle}</p>
        </div>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-farva-navy-surface border border-farva-gold-sahara/10 p-5 space-y-4">
            <div className="h-32 rounded-xl bg-farva-navy-royal/60" />
            <div className="h-4 w-3/4 bg-farva-navy-royal/80 rounded" />
            <div className="h-3 w-1/2 bg-farva-navy-royal/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <Loader2 className="h-10 w-10 text-farva-gold-sahara animate-spin" />
      <h3 className="text-lg font-heading font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

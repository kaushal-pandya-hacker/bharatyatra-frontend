'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something Went Wrong',
  message = 'We encountered an error loading this section. Please try again or check your network connection.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="glass-card rounded-2xl p-8 border border-red-500/30 text-center max-w-lg mx-auto my-6 space-y-4">
      <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-heading font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-300">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-farva-navy-surface border border-farva-gold-sahara/40 hover:border-farva-gold-sahara text-farva-gold-sahara font-semibold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ElementType;
}

export function EmptyState({
  title = 'No Results Found',
  description = 'We couldn\'t find any matching items for your search. Try changing your filters or let our AI build an itinerary for you.',
  actionText = 'Plan with AI',
  actionHref = '/plan',
  icon: Icon = Compass,
}: EmptyStateProps) {
  return (
    <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-5 border border-farva-gold-sahara/20 max-w-xl mx-auto my-8">
      <div className="h-16 w-16 rounded-2xl bg-farva-navy-surface border border-farva-gold-sahara/30 flex items-center justify-center text-farva-gold-sahara">
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-heading font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          className="gold-gradient-bg text-farva-navy-deep font-semibold text-xs px-5 py-2.5 rounded-xl hover:shadow-farva-gold transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );
}

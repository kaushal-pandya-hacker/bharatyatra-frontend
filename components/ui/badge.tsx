import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'verified' | 'live' | 'ai' | 'success' | 'warning';
}

export function Badge({ className, variant = 'verified', children, ...props }: BadgeProps) {
  const variants = {
    verified: 'bg-teal-50 text-brand-secondary border border-brand-secondary/30',
    live: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
    ai: 'bg-orange-50 text-brand-primary border border-brand-primary/30',
    success: 'bg-green-50 text-green-700 border border-green-300',
    warning: 'bg-amber-50 text-amber-700 border border-amber-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

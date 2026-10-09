'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_CONFIRMED';

interface StatusBadgeProps {
  status: BookingStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>Confirmed</span>
        </span>
      );
    case 'PARTIALLY_CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <Clock className="h-3 w-3 text-amber-300" />
          <span>Partially Confirmed</span>
        </span>
      );
    case 'PENDING':
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
          <RefreshCw className="h-3 w-3 text-sky-400 animate-spin" />
          <span>Processing</span>
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <AlertCircle className="h-3 w-3 text-rose-400" />
          <span>Failed</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
          <XCircle className="h-3 w-3 text-slate-400" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-farva-gold-sahara/10 text-farva-gold-sahara border border-farva-gold-sahara/30">
          <span>{status}</span>
        </span>
      );
  }
}

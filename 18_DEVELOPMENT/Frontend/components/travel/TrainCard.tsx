'use client';

import React from 'react';
import Link from 'next/link';
import { Train, Clock, ArrowRight } from 'lucide-react';

export interface TrainItem {
  id: string;
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  duration: string;
  classes: { code: string; name: string; price: number; status: string }[];
}

export function TrainCard({ train }: { train: TrainItem }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-farva-gold-sahara/20 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-farva-navy-surface border border-farva-gold-sahara/30 flex items-center justify-center text-farva-gold-sahara flex-shrink-0">
            <Train className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-farva-gold-sahara/20 text-farva-gold-sahara border border-farva-gold-sahara/30">
                #{train.trainNumber}
              </span>
              <h4 className="text-base font-heading font-bold text-white">{train.trainName}</h4>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
              <span className="font-semibold text-white">{train.departureTime} ({train.origin})</span>
              <span className="text-slate-500">→</span>
              <span className="font-semibold text-white">{train.arrivalTime} ({train.destination})</span>
              <span>• {train.duration}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/trains/${train.id}`}
          className="gold-gradient-bg text-farva-navy-deep font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-farva-gold transition-all inline-flex items-center justify-center gap-1.5 self-start md:self-auto"
        >
          <span>Book Ticket</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-farva-gold-sahara/10">
        {train.classes.map((c) => (
          <div key={c.code} className="bg-farva-navy-surface p-2.5 rounded-xl border border-farva-gold-sahara/10 text-center">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-farva-gold-sahara">{c.code}</span>
              <span className="text-emerald-400 font-medium text-[10px]">{c.status}</span>
            </div>
            <div className="text-sm font-heading font-bold text-white mt-1">₹{c.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

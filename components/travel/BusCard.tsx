'use client';

import React from 'react';
import Link from 'next/link';
import { Bus, Clock, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export interface BusItem {
  id: string;
  operator: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  duration: string;
  price: number;
  availableSeats: number;
  rating: number;
  isGSRTC?: boolean;
}

export function BusCard({ bus }: { bus: BusItem }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-farva-gold-sahara/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-farva-navy-surface border border-farva-gold-sahara/30 flex items-center justify-center text-farva-gold-sahara flex-shrink-0">
          <Bus className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-heading font-bold text-white">{bus.operator}</h4>
            {bus.isGSRTC && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-farva-gold-sahara text-farva-navy-deep">
                GSRTC Official
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-0.5">{bus.busType}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-1 text-white font-medium">
              <Clock className="h-3.5 w-3.5 text-farva-gold-sahara" />
              <span>{bus.departureTime}</span>
              <span className="text-slate-500">→</span>
              <span>{bus.arrivalTime}</span>
            </div>
            <span>• {bus.duration}</span>
            <span className="text-emerald-400 font-semibold">• {bus.availableSeats} seats left</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-farva-gold-sahara/10">
        <div className="text-left md:text-right">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Fare starting from</span>
          <span className="text-xl font-heading font-extrabold gold-gradient-text">₹{bus.price}</span>
        </div>
        <Link
          href={`/buses/${bus.id}`}
          className="gold-gradient-bg text-farva-navy-deep font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-farva-gold transition-all flex items-center gap-1.5"
        >
          <span>Select Seats</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

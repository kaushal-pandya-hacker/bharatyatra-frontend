'use client';

import React from 'react';
import Link from 'next/link';
import { Plane, Clock, ArrowRight } from 'lucide-react';

export interface FlightItem {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  duration: string;
  stops: string;
  price: number;
}

export function FlightCard({ flight }: { flight: FlightItem }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-farva-gold-sahara/20 flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-farva-navy-surface border border-farva-gold-sahara/30 flex items-center justify-center text-farva-gold-sahara flex-shrink-0">
          <Plane className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-heading font-bold text-white">{flight.airline}</h4>
            <span className="text-xs text-slate-400 font-mono">({flight.flightNumber})</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
            <span className="font-semibold text-white">{flight.departureTime} ({flight.origin})</span>
            <span className="text-slate-500">→</span>
            <span className="font-semibold text-white">{flight.arrivalTime} ({flight.destination})</span>
            <span>• {flight.duration}</span>
            <span className="text-emerald-400 font-semibold">• {flight.stops}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-farva-gold-sahara/10">
        <div className="text-left md:text-right">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Starting at</span>
          <span className="text-xl font-heading font-extrabold gold-gradient-text">₹{flight.price}</span>
        </div>
        <Link
          href={`/flights/${flight.id}`}
          className="gold-gradient-bg text-farva-navy-deep font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-farva-gold transition-all flex items-center gap-1.5"
        >
          <span>Select Fare</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

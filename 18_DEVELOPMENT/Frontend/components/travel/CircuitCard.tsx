'use client';

import React from 'react';
import Link from 'next/link';
import { Route, MapPin, Calendar, ArrowRight } from 'lucide-react';

export interface CircuitItem {
  id: string;
  title: string;
  days: number;
  stopsCount: number;
  highlights: string[];
  startingPrice: number;
  image: string;
}

export function CircuitCard({ circuit }: { circuit: CircuitItem }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-farva-gold-sahara/20 flex flex-col group">
      <div className="relative h-52 bg-farva-navy-surface overflow-hidden">
        <img
          src={circuit.image || '/bhuj-kutch-bg.jpg'}
          alt={circuit.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold gold-gradient-bg text-farva-navy-deep shadow-sm">
          {circuit.days} Days / {circuit.days - 1} Nights
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-lg font-heading font-bold text-white group-hover:text-farva-gold-sahara transition-colors">
            {circuit.title}
          </h4>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {circuit.highlights.slice(0, 3).map((h) => (
              <span key={h} className="px-2 py-0.5 rounded text-[10px] bg-farva-navy-surface text-slate-300 border border-farva-gold-sahara/10">
                {h}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-farva-gold-sahara/10">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Circuit Package</span>
            <span className="text-xl font-heading font-extrabold gold-gradient-text">₹{circuit.startingPrice}</span>
          </div>
          <Link
            href={`/circuits/${circuit.id}`}
            className="gold-gradient-bg text-farva-navy-deep font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-farva-gold transition-all flex items-center gap-1.5"
          >
            <span>Explore Circuit</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

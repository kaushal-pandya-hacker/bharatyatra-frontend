'use client';

import React from 'react';
import Link from 'next/link';
import { Hotel, MapPin, Star, Wifi, Coffee, ArrowRight } from 'lucide-react';

export interface HotelItem {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
}

export function HotelCard({ hotel }: { hotel: HotelItem }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-farva-gold-sahara/20 flex flex-col md:flex-row group">
      <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0 bg-farva-navy-surface overflow-hidden">
        <img
          src={hotel.image || '/bhuj-kutch-bg.jpg'}
          alt={hotel.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold gold-gradient-bg text-farva-navy-deep shadow-sm">
          {hotel.category}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-heading font-bold text-white group-hover:text-farva-gold-sahara transition-colors">
                {hotel.name}
              </h4>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5 text-farva-gold-sahara" />
                <span>{hotel.location}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 bg-farva-navy-surface px-2 py-1 rounded-lg border border-farva-gold-sahara/20">
              <Star className="h-3.5 w-3.5 fill-farva-gold-sahara text-farva-gold-sahara" />
              <span className="text-xs font-bold text-white">{hotel.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {hotel.amenities.map((a) => (
              <span key={a} className="px-2 py-0.5 rounded text-[10px] bg-farva-navy-surface text-slate-300 border border-farva-gold-sahara/10">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-farva-gold-sahara/10">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Per night starting from</span>
            <span className="text-xl font-heading font-extrabold gold-gradient-text">₹{hotel.pricePerNight}</span>
          </div>
          <Link
            href={`/stays/${hotel.id}`}
            className="gold-gradient-bg text-farva-navy-deep font-semibold text-xs px-4 py-2.5 rounded-xl hover:shadow-farva-gold transition-all flex items-center gap-1.5"
          >
            <span>View Suites</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

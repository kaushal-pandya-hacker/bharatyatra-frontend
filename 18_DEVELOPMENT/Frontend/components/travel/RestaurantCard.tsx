'use client';

import React from 'react';
import { UtensilsCrossed, MapPin, Star, Clock } from 'lucide-react';

export interface RestaurantItem {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  avgCost: number;
  image: string;
  specialty: string;
  isKathiyawadi?: boolean;
}

export function RestaurantCard({ restaurant }: { restaurant: RestaurantItem }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-farva-gold-sahara/20 flex flex-col group">
      <div className="relative h-44 bg-farva-navy-surface overflow-hidden">
        <img
          src={restaurant.image || '/landmarks/sabarmati-ashram.jpg'}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {restaurant.isKathiyawadi && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold gold-gradient-bg text-farva-navy-deep shadow-sm">
            Authentic Kathiyawadi Thali
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between">
            <h4 className="text-base font-heading font-bold text-white group-hover:text-farva-gold-sahara transition-colors">
              {restaurant.name}
            </h4>
            <div className="flex items-center gap-1 bg-farva-navy-surface px-2 py-0.5 rounded-lg border border-farva-gold-sahara/20">
              <Star className="h-3 w-3 fill-farva-gold-sahara text-farva-gold-sahara" />
              <span className="text-xs font-bold text-white">{restaurant.rating}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5 text-farva-gold-sahara" />
            <span>{restaurant.location}</span>
          </p>

          <p className="text-xs text-slate-400 mt-2">
            <strong>Specialty:</strong> {restaurant.specialty}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-farva-gold-sahara/10">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Avg cost for two</span>
            <span className="text-lg font-heading font-bold text-farva-gold-sahara">₹{restaurant.avgCost}</span>
          </div>
          <button className="gold-gradient-bg text-farva-navy-deep font-semibold text-xs px-3.5 py-2 rounded-xl hover:shadow-farva-gold transition-all">
            Reserve Table
          </button>
        </div>
      </div>
    </div>
  );
}

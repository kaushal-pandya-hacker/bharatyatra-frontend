'use client';

import React from 'react';
import { BedDouble, Users, Check, ArrowRight } from 'lucide-react';

export interface RoomOption {
  id: string;
  title: string;
  size: string;
  occupancy: string;
  pricePerNight: number;
  inclusions: string[];
}

export function RoomCard({
  room,
  isSelected,
  onSelect,
}: {
  room: RoomOption;
  isSelected?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all ${
        isSelected
          ? 'border-farva-gold-sahara shadow-farva-gold bg-farva-navy-surface'
          : 'border-farva-gold-sahara/20 hover:border-farva-gold-sahara/40'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-heading font-bold text-white">{room.title}</h4>
          <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-farva-gold-sahara" />
              {room.size}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-farva-gold-sahara" />
              {room.occupancy}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            {room.inclusions.map((inc) => (
              <span key={inc} className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="h-3 w-3" />
                {inc}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-farva-gold-sahara/10">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Nightly Rate</span>
            <span className="text-xl font-heading font-extrabold gold-gradient-text">₹{room.pricePerNight}</span>
          </div>
          <button
            onClick={onSelect}
            className={`font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'gold-gradient-bg text-farva-navy-deep shadow-farva-gold'
                : 'bg-farva-navy-surface text-farva-gold-sahara border border-farva-gold-sahara/30 hover:border-farva-gold-sahara'
            }`}
          >
            <span>{isSelected ? 'Selected' : 'Select Suite'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Clock, MapPin, Bus, Hotel, Utensils, Mountain, CheckCircle2 } from 'lucide-react';

export interface TimelineItem {
  id: string;
  dayNumber: number;
  time: string;
  title: string;
  description: string;
  location: string;
  category: 'TRANSPORT' | 'STAY' | 'DINING' | 'ACTIVITY';
  status?: 'COMPLETED' | 'UPCOMING' | 'CURRENT';
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  const getIcon = (category: TimelineItem['category']) => {
    switch (category) {
      case 'TRANSPORT': return Bus;
      case 'STAY': return Hotel;
      case 'DINING': return Utensils;
      case 'ACTIVITY': return Mountain;
      default: return MapPin;
    }
  };

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-farva-gold-sahara/20">
      {items.map((item, idx) => {
        const Icon = getIcon(item.category);
        return (
          <div key={item.id || idx} className="relative flex items-start gap-4 pl-2 group">
            {/* Timeline node icon */}
            <div className="h-9 w-9 rounded-full bg-farva-navy-deep border-2 border-farva-gold-sahara flex items-center justify-center text-farva-gold-sahara flex-shrink-0 z-10 group-hover:scale-110 transition-transform shadow-farva-gold">
              <Icon className="h-4 w-4" />
            </div>

            {/* Timeline content card */}
            <div className="flex-1 glass-card glass-card-hover rounded-2xl p-5 border border-farva-gold-sahara/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-farva-gold-sahara px-2 py-0.5 rounded bg-farva-gold-sahara/10">
                  Day {item.dayNumber} • {item.time}
                </span>
                {item.status === 'COMPLETED' && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
              </div>

              <h4 className="text-base font-heading font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-2 border-t border-farva-gold-sahara/10">
                <MapPin className="h-3 w-3 text-farva-gold-sahara" />
                <span>{item.location}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

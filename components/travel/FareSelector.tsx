'use client';

import React, { useState } from 'react';
import { Plane, CheckCircle2, Luggage, Shield } from 'lucide-react';

interface FareTier {
  id: string;
  name: string;
  price: number;
  baggage: string;
  flexibility: string;
  seatSelection: string;
}

interface FareSelectorProps {
  tiers: FareTier[];
  onSelect: (tier: FareTier) => void;
}

export function FareSelector({ tiers, onSelect }: FareSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>(tiers[0]?.id || 'saver');

  const handleSelect = (t: FareTier) => {
    setSelectedId(t.id);
    onSelect(t);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-farva-gold-sahara/20 space-y-4">
      <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
        <Plane className="h-5 w-5 text-farva-gold-sahara" />
        <span>Select Fare Option</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t) => {
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`p-5 rounded-2xl text-left border transition-all relative flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-farva-navy-surface border-farva-gold-sahara shadow-farva-gold'
                  : 'bg-farva-navy-royal/50 border-farva-gold-sahara/15 hover:border-farva-gold-sahara/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-heading font-bold text-white">{t.name}</span>
                  {isSelected && <CheckCircle2 className="h-5 w-5 text-farva-gold-sahara" />}
                </div>
                <div className="text-2xl font-heading font-extrabold gold-gradient-text mt-2">₹{t.price}</div>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Luggage className="h-3.5 w-3.5 text-farva-gold-sahara" />
                  <span>{t.baggage}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-farva-gold-sahara" />
                  <span>{t.flexibility}</span>
                </li>
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Train, CheckCircle2 } from 'lucide-react';

interface ClassOption {
  code: string;
  name: string;
  price: number;
  availability: string;
  tatkal?: boolean;
}

interface ClassSelectorProps {
  options: ClassOption[];
  onSelect: (selected: ClassOption) => void;
}

export function ClassSelector({ options, onSelect }: ClassSelectorProps) {
  const [selectedCode, setSelectedCode] = useState<string>(options[0]?.code || '3A');

  const handleSelect = (opt: ClassOption) => {
    setSelectedCode(opt.code);
    onSelect(opt);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-farva-gold-sahara/20 space-y-4">
      <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
        <Train className="h-5 w-5 text-farva-gold-sahara" />
        <span>Select Travel Class</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((opt) => {
          const isSelected = selectedCode === opt.code;
          return (
            <button
              key={opt.code}
              onClick={() => handleSelect(opt)}
              className={`p-4 rounded-xl text-left border transition-all relative ${
                isSelected
                  ? 'bg-farva-navy-surface border-farva-gold-sahara shadow-farva-gold'
                  : 'bg-farva-navy-royal/50 border-farva-gold-sahara/15 hover:border-farva-gold-sahara/40'
              }`}
            >
              {isSelected && (
                <CheckCircle2 className="h-4 w-4 text-farva-gold-sahara absolute top-3 right-3" />
              )}
              <span className="text-xs font-mono font-bold text-farva-gold-sahara uppercase block">{opt.code}</span>
              <span className="text-sm font-heading font-bold text-white block mt-0.5">{opt.name}</span>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-400">{opt.availability}</span>
                <span className="font-heading font-extrabold text-white">₹{opt.price}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

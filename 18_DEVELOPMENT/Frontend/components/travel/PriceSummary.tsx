'use client';

import React from 'react';
import { ShieldCheck, Tag, Lock } from 'lucide-react';

export interface PriceLineItem {
  label: string;
  amount: number;
  highlight?: boolean;
}

interface PriceSummaryProps {
  items: PriceLineItem[];
  taxes: number;
  discount?: number;
  total: number;
  onProceed?: () => void;
  buttonText?: string;
  isProcessing?: boolean;
}

export function PriceSummary({
  items,
  taxes,
  discount = 0,
  total,
  onProceed,
  buttonText = 'Proceed to Payment',
  isProcessing = false,
}: PriceSummaryProps) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-farva-gold-sahara/30 space-y-5 sticky top-20">
      <div className="flex items-center justify-between border-b border-farva-gold-sahara/15 pb-4">
        <h3 className="text-lg font-heading font-bold text-white">Fare & Price Breakdown</h3>
        <span className="text-[10px] uppercase font-bold text-farva-gold-sahara tracking-wider px-2 py-0.5 rounded bg-farva-gold-sahara/10 border border-farva-gold-sahara/20">
          Farva Sovereign Rate
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-slate-300">
            <span>{item.label}</span>
            <span className={`font-semibold ${item.highlight ? 'text-farva-gold-sahara' : 'text-white'}`}>
              ₹{item.amount}
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between text-slate-300">
          <span>Taxes & GST (18%)</span>
          <span className="font-semibold text-white">₹{taxes}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-400 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              Sovereign Discount Applied
            </span>
            <span>-₹{discount}</span>
          </div>
        )}
      </div>

      <div className="border-t border-farva-gold-sahara/20 pt-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block uppercase font-semibold">Total Amount</span>
          <span className="text-xs text-emerald-400">Includes all taxes & fees</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-heading font-extrabold gold-gradient-text">₹{total}</span>
        </div>
      </div>

      {onProceed && (
        <button
          onClick={onProceed}
          disabled={isProcessing}
          className="w-full gold-gradient-bg text-farva-navy-deep font-heading font-bold text-sm py-3.5 rounded-xl hover:shadow-farva-gold transition-all flex items-center justify-center gap-2"
        >
          <Lock className="h-4 w-4" />
          <span>{isProcessing ? 'Verifying with Backend...' : buttonText}</span>
        </button>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-farva-gold-sahara" />
        <span>256-bit Encrypted Backend Protection</span>
      </div>
    </div>
  );
}

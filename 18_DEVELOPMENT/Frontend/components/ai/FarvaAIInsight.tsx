'use client';

import React from 'react';
import { Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { respondToProposal } from '@/lib/api/ai';

interface FarvaAIInsightProps {
  proposalId?: string;
  reason?: string;
  suggestion?: string;
  impact?: string;
  onDecide?: (decision: 'ACCEPTED' | 'REJECTED') => void;
}

export function FarvaAIInsight({
  proposalId = 'prop_123',
  reason = 'Heavy rain alert on Day 2 in Kutch salt flats.',
  suggestion = 'Swap outdoor White Rann stargazing with Nirona Rogan Art indoor workshop.',
  impact = 'Prevents travel delay and saves ₹1,200 on safari fees.',
  onDecide,
}: FarvaAIInsightProps) {
  const handleDecision = async (decision: 'ACCEPTED' | 'REJECTED') => {
    try {
      if (proposalId) {
        await respondToProposal(proposalId, decision);
      }
      if (onDecide) onDecide(decision);
    } catch (err) {
      console.error('Proposal decision failed:', err);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-farva-gold-sahara/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-farva-gold-sahara">
          <Sparkles className="h-4 w-4" />
          <h4 className="text-sm font-heading font-bold uppercase tracking-wider">Adaptive AI Real-Time Insight</h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          Live Recommendation
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <p className="text-slate-300 font-medium">{reason}</p>
        <div className="bg-farva-navy-surface p-3 rounded-xl border border-farva-gold-sahara/20 text-white font-semibold">
          💡 {suggestion}
        </div>
        <p className="text-emerald-400 text-[11px] font-medium">⚡ Impact: {impact}</p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-farva-gold-sahara/10">
        <button
          onClick={() => handleDecision('REJECTED')}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors flex items-center gap-1"
        >
          <X className="h-3.5 w-3.5" />
          <span>Keep Original</span>
        </button>
        <button
          onClick={() => handleDecision('ACCEPTED')}
          className="gold-gradient-bg text-farva-navy-deep font-bold text-xs px-4 py-1.5 rounded-lg hover:shadow-farva-gold transition-all flex items-center gap-1"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Accept Optimization</span>
        </button>
      </div>
    </div>
  );
}

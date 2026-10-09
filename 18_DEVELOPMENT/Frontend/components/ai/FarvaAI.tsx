'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Compass, ShieldCheck, Zap } from 'lucide-react';
import { generateAITrip } from '@/lib/api/ai';

interface FarvaAIProps {
  onPlanGenerated?: (tripId: string) => void;
}

export function FarvaAI({ onPlanGenerated }: FarvaAIProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const suggestions = [
    '3-day spiritual circuit in Somnath & Dwarka with luxury haveli stay',
    'Cultural weekend in Kutch White Rann with Rogan art masterclass',
    'Wildlife photography tour in Sasan Gir with luxury tent stay',
    'Heritage food trail in Ahmedabad & Kathiyawad thali tasting',
  ];

  const handleGenerate = async (queryText?: string) => {
    const query = queryText || prompt;
    if (!query.trim()) return;

    setIsGenerating(true);
    try {
      const res = await generateAITrip({ prompt: query, category: activeCategory });
      if (res && res.tripId && onPlanGenerated) {
        onPlanGenerated(res.tripId);
      }
    } catch (err) {
      console.error('AI Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-farva-gold-sahara/30 space-y-6 shadow-farva-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl gold-gradient-bg flex items-center justify-center text-farva-navy-deep font-bold shadow-farva-gold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <span>Farva Sovereign AI Planner</span>
              <span className="text-[10px] font-mono font-extrabold uppercase bg-farva-gold-sahara/20 text-farva-gold-sahara px-2 py-0.5 rounded border border-farva-gold-sahara/30">
                v2.0 Adaptive
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Describe your dream trip to Gujarat and let our AI assemble live itineraries with real inventory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-farva-gold-sahara bg-farva-navy-surface px-3 py-1.5 rounded-xl border border-farva-gold-sahara/20 self-start sm:self-auto">
          <Zap className="h-4 w-4" />
          <span>Instant Feasibility Checking</span>
        </div>
      </div>

      {/* Input Box */}
      <div className="relative">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Plan a 4-day trip from Ahmedabad to Gir & Diu for 2 adults with heritage stays and authentic Kathiyawadi dining..."
          className="w-full bg-farva-navy-deep/90 border border-farva-gold-sahara/30 focus:border-farva-gold-sahara rounded-2xl p-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-farva-gold-sahara transition-all resize-none"
        />
        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating || !prompt.trim()}
          className="absolute bottom-3 right-3 gold-gradient-bg text-farva-navy-deep font-heading font-bold text-xs px-5 py-2.5 rounded-xl hover:shadow-farva-gold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>Optimizing Itinerary...</span>
            </>
          ) : (
            <>
              <span>Generate Farva Plan</span>
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Quick Suggestions */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Journeys</span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(s);
                handleGenerate(s);
              }}
              className="text-xs bg-farva-navy-surface hover:bg-farva-gold-sahara/10 text-slate-300 hover:text-farva-gold-sahara border border-farva-gold-sahara/15 hover:border-farva-gold-sahara/40 px-3 py-1.5 rounded-xl transition-all text-left"
            >
              ✨ {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

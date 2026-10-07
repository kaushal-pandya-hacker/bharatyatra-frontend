'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X, Check, Calendar, Users, DollarSign, Compass, MapPin, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { useDestinationSelection } from '@/lib/tourism/destination-selection-context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AITripPersonalizationModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { selectedDestinations, selectedCount, uniqueStatesCount, destinationsByState } = useDestinationSelection();

  const [durationDays, setDurationDays] = useState<number>(5);
  const [crewType, setCrewType] = useState<string>('family');
  const [paxCount, setPaxCount] = useState<number>(2);
  const [budgetTier, setBudgetTier] = useState<'budget' | 'balanced' | 'luxury'>('balanced');
  const [travelPace, setTravelPace] = useState<'relaxed' | 'balanced' | 'fast'>('balanced');

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    `Understanding your ${selectedCount} selected ${selectedCount === 1 ? 'place' : 'places'}`,
    `Optimizing multi-state route across ${uniqueStatesCount} ${uniqueStatesCount === 1 ? 'region' : 'regions'}`,
    'Grouping nearby destinations & calculating driving times',
    'Balancing daily sightseeing workload & pacing',
    'Preparing your personalized grounded AI itinerary'
  ];

  const handleStartPlanning = () => {
    setIsGenerating(true);
    setActiveStep(0);
  };

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            // Navigate to /plan page with query parameters
            const destNames = selectedDestinations.map((d) => d.displayName || d.name).join(', ');
            const targetUrl = `/plan?destination=${encodeURIComponent(destNames)}&duration=${durationDays}&crew=${crewType}&pax=${paxCount}&tier=${budgetTier}&pace=${travelPace}`;
            router.push(targetUrl);
            return prev;
          }
        });
      }, 120);

      return () => clearInterval(interval);
    }
  }, [isGenerating, selectedDestinations, durationDays, crewType, paxCount, budgetTier, travelPace, router, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A1128] border border-amber-400/40 text-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2A3656] bg-[#141A32] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Personalize Your AI Journey</h2>
              <p className="text-xs text-amber-300 font-medium">
                {selectedCount} selected places across {uniqueStatesCount} {uniqueStatesCount === 1 ? 'state' : 'states'}
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isGenerating ? (
            /* Generating Transition Screen */
            <div className="py-10 text-center space-y-8">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400/40 flex items-center justify-center animate-ping absolute inset-0"></div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl relative z-10">
                  <Sparkles className="w-9 h-9 animate-spin text-slate-950" style={{ animationDuration: '3s' }} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white mb-2">Building Your Journey</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  BharatYatra AI is organizing your selected places into a realistic, optimized itinerary.
                </p>
              </div>

              {/* Progress Step Checklist */}
              <div className="max-w-md mx-auto space-y-3 bg-[#141A32] p-5 rounded-2xl border border-[#2A3656] text-left">
                {steps.map((stepText, idx) => {
                  const isDone = idx < activeStep;
                  const isCurrent = idx === activeStep;
                  return (
                    <div key={idx} className="flex items-center space-x-3 text-xs transition-colors">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <span
                        className={`font-semibold ${
                          isDone
                            ? 'text-emerald-400'
                            : isCurrent
                            ? 'text-amber-300 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Customization Options */
            <>
              {/* Selected Places Preview Banner */}
              <div className="bg-[#141A32] p-4 rounded-2xl border border-amber-400/30 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Target Places Included in AI Plan:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDestinations.map((d) => (
                    <span
                      key={d.id || d.slug}
                      className="text-xs font-bold text-white bg-[#0A1128] px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{d.name} ({d.stateName})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* 1. Duration */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 block flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trip Duration</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 7, 10].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationDays(d)}
                      className={`py-3 rounded-xl text-xs font-extrabold border transition ${
                        durationDays === d
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Budget Tier */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 block flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Budget Tier</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'budget', label: 'Budget', desc: 'Hostels & Local Transit' },
                    { id: 'balanced', label: 'Balanced', desc: '3★ Hotels & Private Cab' },
                    { id: 'luxury', label: 'Luxury', desc: '5★ Resorts & Express Transit' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setBudgetTier(tier.id as any)}
                      className={`p-3 rounded-xl text-left border transition ${
                        budgetTier === tier.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{tier.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Travel Pace */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 block flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Travel Pace</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'relaxed', label: 'Relaxed', desc: 'Leisurely & Few Places/Day' },
                    { id: 'balanced', label: 'Balanced', desc: 'Optimal Sightseeing' },
                    { id: 'fast', label: 'Fast-Paced', desc: 'Cover Max Highlights' },
                  ].map((pace) => (
                    <button
                      key={pace.id}
                      type="button"
                      onClick={() => setTravelPace(pace.id as any)}
                      className={`p-3 rounded-xl text-left border transition ${
                        travelPace === pace.id
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-[#141A32] text-slate-300 border-[#2A3656] hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{pace.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{pace.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && (
          <div className="p-6 border-t border-[#2A3656] bg-[#141A32] flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition"
            >
              Back to Browsing
            </button>

            <button
              onClick={handleStartPlanning}
              className="font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-6 py-3 rounded-xl transition shadow-xl flex items-center space-x-2 text-xs uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Generate AI Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

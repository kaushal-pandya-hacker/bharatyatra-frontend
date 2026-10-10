'use client';

import React from 'react';
import { CircuitCard, CircuitItem } from '@/components/travel/CircuitCard';
import { Route, Sparkles } from 'lucide-react';

export default function CircuitsPage() {
  const circuitsList: CircuitItem[] = [
    {
      id: 'kutch-rann-utsav',
      title: 'Kutch Rann Utsav & Artisan Circuit',
      days: 4,
      stopsCount: 5,
      highlights: ['White Rann Salt Desert', 'Nirona Rogan Art', 'Bhuj Heritage Haveli'],
      startingPrice: 12500,
      image: '/bhuj-kutch-bg.jpg',
    },
    {
      id: 'saurashtra-temple-trail',
      title: 'Saurashtra Sacred Temple Circuit',
      days: 5,
      stopsCount: 6,
      highlights: ['Somnath Jyotirlinga', 'Dwarkadhish Temple', 'Girnar Ropeway'],
      startingPrice: 14800,
      image: '/somnath-temple-bg.jpg',
    },
    {
      id: 'gir-asiatic-lion-trail',
      title: 'Gir Lion Wildlife & Coastal Circuit',
      days: 4,
      stopsCount: 4,
      highlights: ['Asiatic Lion Safari Zone 4', 'Devalia Park', 'Somnath Coastal Aarti'],
      startingPrice: 13900,
      image: '/sasan-gir-bg.jpg',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0b1c30] text-slate-100 font-body-md py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary-container text-on-secondary-fixed flex items-center justify-center font-bold">
              <Route className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
                Gujarat Travel <span className="text-primary-container font-extrabold">Circuits Discovery</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Complete multi-day Gujarat travel circuits with stays, transport, and guided experiences integrated.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circuitsList.map((c) => (
            <CircuitCard key={c.id} circuit={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

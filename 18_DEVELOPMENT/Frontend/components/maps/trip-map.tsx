'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { MapMarker, LeafletMapProps } from './leaflet-map-inner';

const LeafletMapInner = dynamic(() => import('./leaflet-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[620px] w-full rounded-2xl bg-slate-900 animate-pulse flex flex-col items-center justify-center border border-slate-700/50">
      <div className="text-amber-400 font-semibold text-sm flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
        Loading BharatYatra Interactive Map...
      </div>
      <p className="text-xs text-slate-400 mt-1">Rendering geographic markers & routing layer</p>
    </div>
  ),
});

export type { MapMarker, LeafletMapProps };

export default function TripMap(props: LeafletMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[620px] w-full rounded-2xl bg-slate-900 animate-pulse flex flex-col items-center justify-center border border-slate-700/50">
        <div className="text-amber-400 font-semibold text-sm flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          Loading BharatYatra Interactive Map...
        </div>
      </div>
    );
  }

  return <LeafletMapInner {...props} />;
}

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapMarker, LeafletMapProps } from './leaflet-map-inner';

const LeafletMapInner = dynamic(() => import('./leaflet-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full rounded-xl bg-slate-800/80 animate-pulse flex flex-col items-center justify-center border border-slate-700/50">
      <div className="text-amber-400 font-semibold text-sm flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
        Loading Chalo Farva Interactive Map...
      </div>
      <p className="text-xs text-slate-400 mt-1">Rendering geographic markers & routing layer</p>
    </div>
  ),
});

export type { MapMarker };

export default function TripMap(props: LeafletMapProps) {
  return <LeafletMapInner {...props} />;
}

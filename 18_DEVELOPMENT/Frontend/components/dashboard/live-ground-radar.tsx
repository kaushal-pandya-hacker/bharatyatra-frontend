'use client';

import React from 'react';

export interface Waypoint {
  id: string;
  name: string;
  coords: string;
  meta: string;
  status: 'completed' | 'active' | 'upcoming';
}

interface LiveGroundRadarProps {
  title?: string;
  waypoints?: Waypoint[];
  syncPercent?: string;
}

const DEFAULT_WAYPOINTS: Waypoint[] = [
  { id: '1', name: 'AHMEDABAD', coords: '23.0225° N', meta: 'Clear 28°C • Vector Active', status: 'completed' },
  { id: '2', name: 'STATUE OF UNITY', coords: '21.8380° N', meta: 'Golden Hour 18:14', status: 'active' },
  { id: '3', name: 'SOMNATH', coords: '20.8880° N', meta: 'Coastal Radar Optimal', status: 'upcoming' },
  { id: '4', name: 'DWARKA', coords: '22.2442° N', meta: 'Gulf Breeze 10kt', status: 'upcoming' },
  { id: '5', name: 'RANN OF KUTCH', coords: '23.7337° N', meta: 'Salt Desert Buffer Active', status: 'upcoming' },
];

export function LiveGroundRadar({
  title = 'PRIMARY MERIDIAN STREAM // LIVE GROUND RADAR',
  waypoints = DEFAULT_WAYPOINTS,
  syncPercent = '99.8%',
}: LiveGroundRadarProps) {
  return (
    <div className="w-full bg-[#181f33] border border-slate-700/60 rounded-2xl p-5 md:p-7 text-white shadow-2xl overflow-hidden font-mono select-none">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
            {title}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 tracking-wider">
          WAYPOINT SYNCHRONIZATION: <span className="text-amber-400 font-bold">{syncPercent}</span>
        </div>
      </div>

      {/* Radar Timeline */}
      <div className="relative pt-2 pb-4">
        {/* Connecting Line */}
        <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-slate-700/80 z-0">
          {/* Active Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
            style={{ width: '38%' }}
          ></div>
        </div>

        {/* Waypoints Row */}
        <div className="relative z-10 flex items-start justify-between">
          {waypoints.map((wp) => {
            const isCompleted = wp.status === 'completed';
            const isActive = wp.status === 'active';

            return (
              <div key={wp.id} className="flex flex-col items-center text-center flex-1 px-1 group">
                {/* Node Circle */}
                <div className="relative mb-4 flex items-center justify-center">
                  {isActive && (
                    <span className="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-pulse"></span>
                  )}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-400 ring-4 ring-amber-400/20 scale-110 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                        : isCompleted
                        ? 'bg-amber-500 border-2 border-amber-400'
                        : 'bg-slate-500 border-2 border-slate-400'
                    }`}
                  >
                    {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
                  </div>
                </div>

                {/* City Name */}
                <span
                  className={`text-xs md:text-sm font-extrabold font-sans tracking-wide uppercase transition-colors ${
                    isActive ? 'text-white font-black' : isCompleted ? 'text-amber-200' : 'text-slate-300'
                  }`}
                >
                  {wp.name}
                </span>

                {/* Coords */}
                <span className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                  {wp.coords}
                </span>

                {/* Weather / Status Meta */}
                <span
                  className={`text-[10px] font-sans mt-1 leading-tight transition-colors ${
                    isActive ? 'text-amber-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  {wp.meta}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import TripMap, { MapMarker } from './trip-map';

export interface RoutePoint {
  name: string;
  lat: number;
  lng: number;
  category?: string;
  description?: string;
}

export interface RouteContract {
  origin: RoutePoint;
  stops?: RoutePoint[];
  destination?: RoutePoint;
}

interface MapProps {
  height?: string;
  interactive?: boolean;
}

// 1. TravelOriginMap Component
export function TravelOriginMap({
  origin,
  height = '320px',
}: {
  origin: { city: string; state: string; latitude?: number; longitude?: number };
  height?: string;
}) {
  const [mapError, setMapError] = useState(false);

  const lat = origin.latitude || 23.0225;
  const lng = origin.longitude || 72.5714;

  const markers: MapMarker[] = [
    {
      id: 'origin_marker',
      title: `${origin.city} (Origin)`,
      category: 'STARTING POINT',
      latitude: lat,
      longitude: lng,
      description: `Your registered home travel origin in ${origin.state}`,
    },
  ];

  if (mapError) {
    return (
      <div style={{ height }} className="w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
        <span className="material-symbols-outlined text-amber-600 text-3xl mb-1">map</span>
        <p className="text-slate-800 font-bold text-sm">Map unavailable</p>
        <p className="text-slate-500 text-xs mt-0.5">Starting point: {origin.city}, {origin.state}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-md">
      <TripMap
        center={[lat, lng]}
        zoom={11}
        markers={markers}
        height={height}
      />
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-xs font-extrabold text-slate-800">
          📍 {origin.city}, {origin.state}
        </span>
      </div>
    </div>
  );
}

// 2. TripRouteMap Component
export function TripRouteMap({
  route,
  height = '480px',
}: {
  route: RouteContract;
  height?: string;
}) {
  const [mapError, setMapError] = useState(false);

  const markers: MapMarker[] = [];
  const polyline: [number, number][] = [];

  let step = 1;

  if (route.origin) {
    markers.push({
      id: 'origin',
      title: `Start: ${route.origin.name}`,
      category: 'STARTING POINT',
      latitude: route.origin.lat,
      longitude: route.origin.lng,
      stepNumber: step++,
      description: route.origin.description || 'Travel origin',
    });
    polyline.push([route.origin.lat, route.origin.lng]);
  }

  if (route.stops && route.stops.length > 0) {
    route.stops.forEach((s, idx) => {
      markers.push({
        id: `stop_${idx}`,
        title: s.name,
        category: s.category || 'ATTRACTION',
        latitude: s.lat,
        longitude: s.lng,
        stepNumber: step++,
        description: s.description || 'Intermediate stop',
      });
      polyline.push([s.lat, s.lng]);
    });
  }

  if (route.destination) {
    markers.push({
      id: 'destination',
      title: `Destination: ${route.destination.name}`,
      category: 'DESTINATION',
      latitude: route.destination.lat,
      longitude: route.destination.lng,
      stepNumber: step,
      description: route.destination.description || 'Final destination',
    });
    polyline.push([route.destination.lat, route.destination.lng]);
  }

  const centerLat = route.origin?.lat || 22.2587;
  const centerLng = route.origin?.lng || 71.1924;

  if (mapError) {
    return (
      <div style={{ height }} className="w-full rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-amber-600 text-4xl mb-2">map</span>
        <p className="text-slate-800 font-bold text-base">Map unavailable</p>
        <p className="text-slate-500 text-xs mt-1">
          Route: {route.origin.name} → {route.destination?.name || 'Destination'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      <TripMap
        center={[centerLat, centerLng]}
        zoom={9}
        markers={markers}
        routePolyline={polyline}
        height={height}
      />
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span>{route.origin.name}</span>
        </div>
        <span className="text-slate-400">→</span>
        {route.destination && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>{route.destination.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 3. DashboardTravelMap Component (Centerpiece for Dashboard)
export function DashboardTravelMap({
  originCity,
  originState,
  originLat = 22.7214,
  originLng = 72.4633,
  activeRoute,
  height = '420px',
}: {
  originCity: string;
  originState: string;
  originLat?: number;
  originLng?: number;
  activeRoute?: RouteContract;
  height?: string;
}) {
  const [mapError, setMapError] = useState(false);
  const [liveGps, setLiveGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const effectiveOriginLat = liveGps ? liveGps.lat : (activeRoute?.origin?.lat || originLat || 22.7214);
  const effectiveOriginLng = liveGps ? liveGps.lng : (activeRoute?.origin?.lng || originLng || 72.4633);

  const route: RouteContract = activeRoute
    ? {
        ...activeRoute,
        origin: {
          ...activeRoute.origin,
          lat: effectiveOriginLat,
          lng: effectiveOriginLng,
        },
      }
    : {
        origin: { name: originCity, lat: effectiveOriginLat, lng: effectiveOriginLng, description: 'Your Starting Point' },
      };

  const handleDetectGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLiveGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not acquire location permission. Displaying your registered origin Dholka.');
      }
    );
  };

  const markers: MapMarker[] = [
    {
      id: 'origin',
      title: liveGps ? 'Your Live GPS Location' : `${originCity} (Origin)`,
      category: 'STARTING POINT',
      latitude: route.origin.lat,
      longitude: route.origin.lng,
      stepNumber: 1,
      description: liveGps ? 'Real-time device GPS coordinates' : `Registered origin in ${originState}`,
    },
  ];

  const polyline: [number, number][] = [[route.origin.lat, route.origin.lng]];

  if (route.stops && route.stops.length > 0) {
    route.stops.forEach((s, idx) => {
      markers.push({
        id: `stop_${idx}`,
        title: s.name,
        category: s.category || 'ATTRACTION',
        latitude: s.lat,
        longitude: s.lng,
        stepNumber: idx + 2,
        description: s.description || 'En-route stop',
      });
      polyline.push([s.lat, s.lng]);
    });
  }

  if (route.destination) {
    markers.push({
      id: 'destination',
      title: route.destination.name,
      category: 'DESTINATION',
      latitude: route.destination.lat,
      longitude: route.destination.lng,
      stepNumber: (route.stops?.length || 0) + 2,
      description: 'Trip destination',
    });
    polyline.push([route.destination.lat, route.destination.lng]);
  }

  if (mapError) {
    return (
      <div style={{ height }} className="w-full rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-white">
        <span className="material-symbols-outlined text-amber-400 text-4xl mb-2">map</span>
        <p className="font-bold text-lg">Map unavailable</p>
        <p className="text-slate-400 text-xs mt-1">Starting point: {originCity}, {originState}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      <TripMap
        center={[route.origin.lat, route.origin.lng]}
        zoom={route.destination ? 8 : 11}
        markers={markers}
        routePolyline={route.destination ? polyline : undefined}
        height={height}
      />
      {/* Top Banner overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border border-slate-700/60 shadow-xl flex items-center gap-3 pointer-events-auto">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dashboard Map Origin</p>
            <p className="text-xs font-black text-white">
              {liveGps ? '📍 Live GPS Location' : `Starting from ${originCity}, ${originState}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectGps}
          disabled={isLocating}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer pointer-events-auto disabled:opacity-50"
        >
          <span>📍</span>
          <span>{isLocating ? 'Locating...' : liveGps ? 'GPS Position Synced' : 'Show Live GPS'}</span>
        </button>
      </div>
    </div>
  );
}

// 4. TripRoutePreview Component
export function TripRoutePreview({
  originCity,
  destinationName,
  height = '240px',
}: {
  originCity: string;
  destinationName: string;
  height?: string;
}) {
  return (
    <div style={{ height }} className="w-full rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-lg border border-slate-800">
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400">route</span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">Route Preview</span>
        </div>
        <span className="text-xs text-slate-400 font-medium">Personalized Journey</span>
      </div>

      <div className="flex items-center justify-between z-10 my-4">
        <div className="space-y-1">
          <p className="text-xs text-slate-400 uppercase font-bold">Origin</p>
          <p className="text-xl font-black text-white">{originCity}</p>
        </div>

        <div className="flex-1 mx-4 flex items-center justify-center relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400" />
          <span className="material-symbols-outlined text-amber-400 absolute text-lg bg-slate-900 px-1">directions_car</span>
        </div>

        <div className="space-y-1 text-right">
          <p className="text-xs text-slate-400 uppercase font-bold">Destination</p>
          <p className="text-xl font-black text-amber-400">{destinationName}</p>
        </div>
      </div>

      <div className="text-xs text-slate-300 flex items-center justify-between z-10 pt-2 border-t border-slate-800/80">
        <span>📍 Direct route optimized from your profile origin</span>
        <span className="font-bold text-amber-300">Ready to plan →</span>
      </div>
    </div>
  );
}

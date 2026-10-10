'use client';

import React, { useState } from 'react';
import { Navigation, MapPin, Clock, Route, Compass } from 'lucide-react';
import TripMap, { MapMarker } from './trip-map';

export interface TripDayData {
  day_number: number;
  title: string;
  activities: {
    id?: string;
    activity_id?: string;
    name?: string;
    title?: string;
    type?: string;
    location_name?: string;
    latitude?: number;
    longitude?: number;
    time_slot?: { start_time: string; end_time: string };
    cost_inr?: number;
    notes?: string;
  }[];
  total_travel_distance_km?: number;
}

export interface TripRouteMapSectionProps {
  days: TripDayData[];
  initialDay?: number;
}

export default function TripRouteMapSection({ days, initialDay = 1 }: TripRouteMapSectionProps) {
  const [selectedDayNum, setSelectedDayNum] = useState<number>(initialDay);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  if (!days || days.length === 0) return null;

  const currentDay = days.find((d) => d.day_number === selectedDayNum) || days[0];

  // Extract markers for the selected day
  const dayMarkers: MapMarker[] = [];
  const polylineCoords: [number, number][] = [];

  let stepCounter = 1;
  currentDay.activities.forEach((act) => {
    const lat = act.latitude ? Number(act.latitude) : null;
    const lng = act.longitude ? Number(act.longitude) : null;

    if (lat && lng) {
      const marker: MapMarker = {
        id: act.id || act.activity_id || `step-${stepCounter}`,
        title: act.name || act.title || act.location_name || `Stop ${stepCounter}`,
        category: act.type?.toUpperCase() || 'ATTRACTION',
        latitude: lat,
        longitude: lng,
        description: act.notes || act.time_slot ? `${act.time_slot?.start_time} - ${act.time_slot?.end_time}` : undefined,
        price: act.cost_inr ? `₹${act.cost_inr}` : 'Free',
        stepNumber: stepCounter,
      };
      dayMarkers.push(marker);
      polylineCoords.push([lat, lng]);
      stepCounter++;
    }
  });

  // Calculate day total distance estimate
  let totalDistanceKm = currentDay.total_travel_distance_km || 0;
  if (!totalDistanceKm && polylineCoords.length > 1) {
    // Quick approx estimation if missing
    for (let i = 0; i < polylineCoords.length - 1; i++) {
      const [lat1, lon1] = polylineCoords[i];
      const [lat2, lon2] = polylineCoords[i + 1];
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      totalDistanceKm += R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 1.25;
    }
  }

  const mapCenter: [number, number] = polylineCoords.length > 0 ? polylineCoords[0] : [22.2442, 68.9685];
  const approxTravelMins = Math.round((totalDistanceKm / 45.0) * 60);

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header & Day Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-slate-900">
              Interactive Daily Route & Map
            </h3>
            <p className="text-xs text-slate-500">
              Day {currentDay.day_number}: {currentDay.title}
            </p>
          </div>
        </div>

        {/* Day Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {days.map((day) => (
            <button
              key={day.day_number}
              onClick={() => {
                setSelectedDayNum(day.day_number);
                setSelectedMarker(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                day.day_number === selectedDayNum
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Day {day.day_number}
            </button>
          ))}
        </div>
      </div>

      {/* Route Distance & Timing Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Stops</span>
            <span className="font-bold text-sm text-amber-400">{dayMarkers.length} Locations</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Approx. Road Distance</span>
            <span className="font-bold text-sm text-blue-400">{totalDistanceKm.toFixed(1)} km</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Transit Duration</span>
            <span className="font-bold text-sm text-emerald-400">~{Math.max(10, approxTravelMins)} mins</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-purple-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Sequence Efficiency</span>
            <span className="font-bold text-sm text-purple-400">TSP Optimized</span>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <TripMap
        center={mapCenter}
        zoom={13}
        markers={dayMarkers}
        routePolyline={polylineCoords}
        height="440px"
        onMarkerClick={(m) => setSelectedMarker(m)}
      />

      {/* Selected Stop Details Banner */}
      {selectedMarker && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs animate-fadeIn">
          <div>
            <span className="font-bold text-amber-400">
              Stop {selectedMarker.stepNumber}: {selectedMarker.title}
            </span>
            <span className="text-slate-400 ml-2">({selectedMarker.category})</span>
            {selectedMarker.description && (
              <p className="text-slate-300 text-[11px] mt-0.5">{selectedMarker.description}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedMarker(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

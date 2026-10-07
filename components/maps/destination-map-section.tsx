'use client';

import React, { useState } from 'react';
import { MapPin, Filter, Layers } from 'lucide-react';
import TripMap, { MapMarker } from './trip-map';

export interface DestinationMapSectionProps {
  destinationName: string;
  center: [number, number];
  attractions?: any[];
  hotels?: any[];
  restaurants?: any[];
  activities?: any[];
}

export default function DestinationMapSection({
  destinationName,
  center,
  attractions = [],
  hotels = [],
  restaurants = [],
  activities = [],
}: DestinationMapSectionProps) {
  const [showAttractions, setShowAttractions] = useState(true);
  const [showHotels, setShowHotels] = useState(true);
  const [showRestaurants, setShowRestaurants] = useState(true);
  const [showActivities, setShowActivities] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Build markers array based on active toggles
  const allMarkers: MapMarker[] = [];

  if (showAttractions && attractions) {
    attractions.forEach((attr, idx) => {
      if (attr.latitude && attr.longitude) {
        allMarkers.push({
          id: attr.id || `attr-${idx}`,
          title: attr.name || attr.title,
          category: 'ATTRACTION',
          latitude: Number(attr.latitude),
          longitude: Number(attr.longitude),
          description: attr.description || attr.openingHours,
          price: attr.entryFeeInr ? `₹${attr.entryFeeInr} entry` : 'Free entry',
        });
      }
    });
  }

  if (showHotels && hotels) {
    hotels.forEach((h, idx) => {
      if (h.latitude && h.longitude) {
        allMarkers.push({
          id: h.id || `hotel-${idx}`,
          title: h.name,
          category: 'HOTEL',
          latitude: Number(h.latitude),
          longitude: Number(h.longitude),
          description: h.description || h.address,
          price: `₹${Number(h.pricePerNight).toLocaleString('en-IN')}/night`,
          rating: `${h.starRating || 3}★`,
        });
      }
    });
  }

  if (showRestaurants && restaurants) {
    restaurants.forEach((r, idx) => {
      if (r.latitude && r.longitude) {
        allMarkers.push({
          id: r.id || `rest-${idx}`,
          title: r.name,
          category: 'RESTAURANT',
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
          description: r.cuisineType || r.address,
          rating: `${r.rating || 4.5}★`,
        });
      }
    });
  }

  if (showActivities && activities) {
    activities.forEach((act, idx) => {
      if (act.latitude && act.longitude) {
        allMarkers.push({
          id: act.id || `act-${idx}`,
          title: act.title || act.name,
          category: 'ACTIVITY',
          latitude: Number(act.latitude),
          longitude: Number(act.longitude),
          description: act.description,
          price: act.priceInr ? `₹${act.priceInr}` : undefined,
        });
      }
    });
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-heading text-slate-900">
              Explore {destinationName} on Interactive Map
            </h3>
            <p className="text-xs text-slate-500">
              Showing {allMarkers.length} verified geographic locations & points of interest
            </p>
          </div>
        </div>

        {/* Category Toggle Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowAttractions(!showAttractions)}
            className={`px-3 py-1.5 rounded-full border transition-all font-semibold flex items-center gap-1.5 ${
              showAttractions
                ? 'bg-purple-100 border-purple-300 text-purple-800'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            🏛️ Attractions ({attractions.filter((a) => a.latitude).length})
          </button>
          <button
            onClick={() => setShowHotels(!showHotels)}
            className={`px-3 py-1.5 rounded-full border transition-all font-semibold flex items-center gap-1.5 ${
              showHotels
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            🏨 Hotels ({hotels.filter((h) => h.latitude).length})
          </button>
          <button
            onClick={() => setShowRestaurants(!showRestaurants)}
            className={`px-3 py-1.5 rounded-full border transition-all font-semibold flex items-center gap-1.5 ${
              showRestaurants
                ? 'bg-red-100 border-red-300 text-red-800'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            🍽️ Dining ({restaurants.filter((r) => r.latitude).length})
          </button>
          <button
            onClick={() => setShowActivities(!showActivities)}
            className={`px-3 py-1.5 rounded-full border transition-all font-semibold flex items-center gap-1.5 ${
              showActivities
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            🎟️ Activities ({activities.filter((a) => a.latitude).length})
          </button>
        </div>
      </div>

      {/* Trip Map Component */}
      <TripMap
        center={center}
        zoom={13}
        markers={allMarkers}
        height="440px"
        onMarkerClick={(m) => setSelectedMarker(m)}
      />

      {/* Selected Location Card Banner */}
      {selectedMarker && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs animate-fadeIn">
          <div>
            <span className="font-bold text-amber-400">{selectedMarker.title}</span>
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
    </section>
  );
}

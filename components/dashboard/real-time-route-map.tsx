'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Layers } from 'lucide-react';

export interface RoutePlace {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  timeSlot?: string;
  status: 'completed' | 'active' | 'upcoming';
}

interface RealTimeRouteMapProps {
  title?: string;
  places: RoutePlace[];
}

export function RealTimeRouteMap({ title = 'Live Route Navigation Map', places }: RealTimeRouteMapProps) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(places[0]?.id || '');
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const activePlace = places.find((p) => p.id === selectedPlaceId) || places[0];

  const mapCenterLat = userGps
    ? userGps.lat
    : places.length > 0
    ? places.reduce((acc, p) => acc + p.lat, 0) / places.length
    : 22.7214; // Dholka, Ahmedabad

  const mapCenterLng = userGps
    ? userGps.lng
    : places.length > 0
    ? places.reduce((acc, p) => acc + p.lng, 0) / places.length
    : 72.4633; // Dholka, Ahmedabad

  const handleDetectCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not acquire location permission. Using registered Dholka location.');
      }
    );
  };

  const getGoogleMapsUrl = (placeName: string, district: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${placeName}, ${district}`)}`;
  };

  const getFullDirectionsUrl = () => {
    if (places.length === 0) return 'https://www.google.com/maps';
    const origin = encodeURIComponent(`${places[0].name}, ${places[0].district}`);
    const dest = encodeURIComponent(`${places[places.length - 1].name}, ${places[places.length - 1].district}`);
    const waypoints = places.slice(1, -1).map((p) => encodeURIComponent(`${p.name}, ${p.district}`)).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints}`;
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-slate-900 font-sans">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={isLocating}
            className="text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isLocating ? 'Acquiring GPS...' : userGps ? '📍 GPS Position Active' : 'Show Current GPS Location'}</span>
          </button>

          {places.length > 0 && (
            <a
              href={getFullDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open Full Route in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Main Map & Route Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Interactive Map Visualizer Canvas */}
        <div className="lg:col-span-8 bg-slate-100 relative min-h-[320px] sm:min-h-[380px] flex flex-col justify-between p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
          {/* Map Controls Ribbon */}
          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>Real-Time GPS Route Sync</span>
            </span>
            <span className="text-[11px] font-bold text-slate-700 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
              📍 {places.length} Waypoints Plotted
            </span>
          </div>

          {/* Interactive OSM / OpenStreetMap Embedded Map */}
          <div className="absolute inset-0 z-0">
            <iframe
              title="Real-Time Interactive Route Map"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'contrast(1.02) saturate(1.1)' }}
              loading="lazy"
              allowFullScreen
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenterLng - 0.8}%2C${mapCenterLat - 0.8}%2C${mapCenterLng + 0.8}%2C${mapCenterLat + 0.8}&layer=mapnik&marker=${activePlace ? activePlace.lat : mapCenterLat}%2C${activePlace ? activePlace.lng : mapCenterLng}`}
            ></iframe>
          </div>

          {/* Active Place Navigation Card Overlay */}
          {activePlace && (
            <div className="z-10 bg-slate-900/90 text-white p-4 rounded-xl backdrop-blur-md border border-slate-800 shadow-lg max-w-sm self-start mt-auto space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Active Waypoint</span>
                <span className="text-[10px] font-mono text-slate-400">{activePlace.lat.toFixed(4)}° N, {activePlace.lng.toFixed(4)}° E</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {activePlace.name} <span className="text-xs text-amber-300 font-normal">({activePlace.district})</span>
              </h4>
              <div className="flex items-center justify-between pt-1">
                <a
                  href={getGoogleMapsUrl(activePlace.name, activePlace.district)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Start Live Turn-by-Turn Navigation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Waypoint Places Selector List */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-5 flex flex-col justify-between gap-4 max-h-[380px] overflow-y-auto">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
              Route Stop-by-Stop Itinerary
            </h3>

            <div className="space-y-2">
              {places.map((place, idx) => {
                const isSelected = place.id === selectedPlaceId;
                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlaceId(place.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{place.name}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{place.district}</span>
                      </div>
                    </div>

                    <a
                      href={getGoogleMapsUrl(place.name, place.district)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-amber-700 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors shrink-0"
                      title="Open in Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

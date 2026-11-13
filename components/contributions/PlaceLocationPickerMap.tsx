'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Search, Check, AlertCircle } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number, addressSuggestion?: string) => void;
  disabled?: boolean;
}

// Inner Leaflet Map loaded only on client
const LeafletPicker = dynamic(
  () => import('./LeafletPickerInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-2xl bg-slate-900 animate-pulse flex flex-col items-center justify-center border border-slate-700">
        <MapPin className="w-8 h-8 text-amber-500 animate-bounce mb-2" />
        <span className="text-xs font-bold text-slate-300">Loading Interactive Map...</span>
      </div>
    ),
  }
);

export default function PlaceLocationPickerMap({
  latitude,
  longitude,
  onChange,
  disabled = false,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Handle GPS detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setDetectingGps(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChange(lat, lng);
        reverseGeocode(lat, lng);
      },
      (err) => {
        setDetectingGps(false);
        setGpsError(
          err.code === 1
            ? 'Location permission was denied. You can select your place on the map or type coordinates manually.'
            : 'Unable to detect your GPS position. Please select location manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Reverse geocode via OSM Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'BharatYatra/1.0 (contact@bharatyatra.in)' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          onChange(lat, lng, data.display_name);
        }
      }
    } catch {
      // Ignore background geocode errors
    }
  };

  // Search location via OSM Nominatim
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim() + ', India'
        )}&limit=1`,
        { headers: { 'User-Agent': 'BharatYatra/1.0 (contact@bharatyatra.in)' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = Number(parseFloat(data[0].lat).toFixed(6));
          const lng = Number(parseFloat(data[0].lon).toFixed(6));
          onChange(lat, lng, data[0].display_name);
        } else {
          setSearchError('No matching location found. Try adding city or state.');
        }
      } else {
        setSearchError('Geocoding service unavailable. You can click on the map to set marker.');
      }
    } catch {
      setSearchError('Network error connecting to location search.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Top Search & GPS Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search town, landmark, fort, beach, or city..."
            disabled={disabled || searching}
            className="w-full pl-9 pr-24 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            disabled={disabled || searching || !searchQuery.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {searching ? 'Locating...' : 'Locate'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={disabled || detectingGps}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Navigation className={`w-4 h-4 text-amber-700 ${detectingGps ? 'animate-spin' : ''}`} />
          <span>{detectingGps ? 'Detecting...' : 'My Current Location'}</span>
        </button>
      </div>

      {searchError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{searchError}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-slate-500" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-xs h-72 sm:h-80 w-full">
        <LeafletPicker
          lat={latitude}
          lng={longitude}
          onPositionChange={(newLat, newLng) => {
            onChange(newLat, newLng);
            reverseGeocode(newLat, newLng);
          }}
          disabled={disabled}
        />
        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-200 text-[11px] font-mono font-bold text-slate-800 shadow-sm pointer-events-none">
          📍 Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
        </div>
      </div>
      <p className="text-[11px] text-slate-500 italic">
        💡 Tip: Click anywhere on the map or drag the red pin to accurately set your place&apos;s GPS position.
      </p>
    </div>
  );
}


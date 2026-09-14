'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Sparkles, Filter, Loader2 } from 'lucide-react';
import { DestinationCard } from '@/components/travel/destination-card';
import { GUJARAT_DESTINATIONS } from '@/lib/data/destinations';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDestinations() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append('search', searchQuery);
        if (selectedRegion && selectedRegion !== 'ALL') queryParams.append('region', selectedRegion);

        const res = await fetch(`${API_BASE}/destinations?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            if (isMounted) {
              setDestinations(json.data);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Backend API fetch failed, falling back to local dataset:', err);
      }

      // Fallback local filtering if backend unavailable
      if (isMounted) {
        const filtered = GUJARAT_DESTINATIONS.filter((dest) => {
          const matchesSearch =
            !searchQuery ||
            dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dest.description.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesRegion =
            selectedRegion === 'ALL' || dest.region.toLowerCase() === selectedRegion.toLowerCase();

          return matchesSearch && matchesRegion;
        });
        setDestinations(filtered);
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchDestinations();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedRegion]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="rounded-3xl bg-brand-dark p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/20 px-3 py-1 text-xs font-semibold text-brand-primary">
            <Sparkles className="h-3.5 w-3.5" /> Explore Gujarat Destinations
          </span>
          <h1 className="text-3xl font-extrabold font-heading sm:text-4xl lg:text-5xl tracking-tight">
            Discover Ancient Shrines, Wildlife & Salt Deserts
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Verified travel metadata, recommended stay durations, and AI trip planning for 24 Gujarat destinations.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination (e.g. Dwarka, Kutch, Gir)..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
          />
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          {['ALL', 'Saurashtra', 'Kutch', 'Central_Gujarat', 'South_Gujarat', 'North_Gujarat'].map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRegion === region
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {region === 'ALL' ? 'All Regions' : region.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 animate-pulse">
              <div className="h-44 w-full bg-slate-200 rounded-xl" />
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 rounded" />
              <div className="h-8 w-full bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      ) : destinations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <DestinationCard
              key={dest.slug}
              slug={dest.slug}
              name={dest.name}
              region={dest.region}
              description={dest.shortDescription || dest.description}
              durationHours={dest.durationHours || (dest.recommendedDays ? dest.recommendedDays * 24 : 48)}
              tagline={dest.tagline || ''}
              heroColor={dest.heroColor || 'from-amber-600 to-amber-900'}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <MapPin className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="text-base font-bold text-slate-900">No destinations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No Gujarat destinations match "{searchQuery}". Try searching for Dwarka, Bhuj, Somnath, or Gir.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRegion('ALL');
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* AI Planner Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent p-6 border border-brand-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold font-heading text-slate-900">Can't decide where to go?</h3>
          <p className="text-xs text-slate-600 mt-0.5">Let Chalo Farva AI build a customized itinerary based on your budget & preferences.</p>
        </div>
        <Link
          href="/ai-planner"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="h-4 w-4" /> Plan With AI
        </Link>
      </div>
    </div>
  );
}

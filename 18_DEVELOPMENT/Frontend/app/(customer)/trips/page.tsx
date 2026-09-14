'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  Trash2,
  Clock,
  PlusCircle,
} from 'lucide-react';
import { ProvenanceTag } from '@/components/ai/provenance-tag';

interface TripItem {
  tripId: string;
  title: string;
  destination: string;
  startDate: string;
  durationDays: number;
  travellerCount: number;
  budgetInr: number;
  status: 'ACTIVE' | 'PLANNING' | 'BOOKED' | 'COMPLETED';
  version: number;
}

const DEFAULT_MOCK_TRIPS: TripItem[] = [
  {
    tripId: 'demo-trip-id-123',
    title: 'Dwarka Kingdom & Sacred Temple Discovery',
    destination: 'Dwarka',
    startDate: 'Nov 10, 2026',
    durationDays: 4,
    travellerCount: 2,
    budgetInr: 25000,
    status: 'ACTIVE',
    version: 2,
  },
  {
    tripId: 'demo-trip-kutch-456',
    title: 'Kutch Rann Utsav & White Desert Expedition',
    destination: 'Bhuj & Kutch',
    startDate: 'Dec 15, 2026',
    durationDays: 5,
    travellerCount: 4,
    budgetInr: 45000,
    status: 'PLANNING',
    version: 1,
  },
];

export default function MyTripsPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to load from localStorage or fallback to default mock trips
    try {
      const saved = localStorage.getItem('chalo_farva_saved_trips');
      if (saved) {
        setTrips(JSON.parse(saved));
      } else {
        setTrips(DEFAULT_MOCK_TRIPS);
        localStorage.setItem('chalo_farva_saved_trips', JSON.stringify(DEFAULT_MOCK_TRIPS));
      }
    } catch {
      setTrips(DEFAULT_MOCK_TRIPS);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteTrip = (tripIdToDelete: string) => {
    const updated = trips.filter((t) => t.tripId !== tripIdToDelete);
    setTrips(updated);
    try {
      localStorage.setItem('chalo_farva_saved_trips', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-0.5 text-xs font-semibold text-brand-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Saved & Active Itineraries
          </span>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900">
            My Trips & Itineraries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your AI-generated Gujarat travel plans, adaptive re-routing versions, and booking status.
          </p>
        </div>

        <Link
          href="/ai-planner"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> Plan New AI Trip
        </Link>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
            <span className="text-xs font-semibold text-slate-600">Loading saved itineraries...</span>
          </div>
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.tripId}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {trip.status} • V{trip.version}
                    </span>
                    <ProvenanceTag type="AI_SUGGESTED" />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 group-hover:text-brand-primary transition-colors">
                    {trip.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleDeleteTrip(trip.tripId)}
                  title="Remove trip"
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  <span className="font-semibold text-slate-900">{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  <span>{trip.startDate} ({trip.durationDays} Days)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  <span>{trip.travellerCount} Travellers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  <span className="font-bold text-emerald-700">₹{trip.budgetInr.toLocaleString('en-IN')} Budget</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/trips/${trip.tripId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
                >
                  View Full Itinerary & Map <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={`/ai-planner?destination=${encodeURIComponent(trip.destination)}`}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Modify Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-slate-300 p-16 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <MapPin className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-heading text-slate-900">No saved trips found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't generated or saved any Gujarat itineraries yet. Use Chalo Farva AI to create your first trip in under 60 seconds!
            </p>
          </div>
          <Link
            href="/ai-planner"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-colors"
          >
            <Sparkles className="h-4 w-4" /> Create Your First AI Trip
          </Link>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
} from 'lucide-react';
import { ProvenanceTag } from '@/components/ai/provenance-tag';
import { LiveGroundRadar, Waypoint } from '@/components/dashboard/live-ground-radar';
import { getSavedTrips, deleteSavedTrip, TripItem } from '@/lib/trips/trip-storage';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';

export default function MyTripsPage() {
  return (
    <ProtectedRoute>
      <MyTripsContent />
    </ProtectedRoute>
  );
}

function MyTripsContent() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getSavedTrips();
    setTrips(saved);
    setLoading(false);
  }, []);

  const handleDeleteTrip = (tripIdToDelete: string) => {
    const updated = deleteSavedTrip(tripIdToDelete);
    setTrips(updated);
  };

  const activeTrip = trips.find((t) => t.status === 'ACTIVE') || trips[0];

  const getWaypointsForTrip = (trip: TripItem): Waypoint[] => {
    if (trip.nodes && trip.nodes.length > 0) {
      return trip.nodes.map((node, i) => {
        const isFirst = i === 0;
        const isSecond = i === 1;
        return {
          id: `wp-${i}`,
          name: node.title.split('&')[0].replace(/Arrival|Transit|Excursion|Walk|Gate|VIP/gi, '').trim().toUpperCase().substring(0, 16) || `STOP ${i + 1}`,
          coords: i === 0 ? '23.0225° N' : i === 1 ? '21.8380° N' : i === 2 ? '20.8880° N' : i === 3 ? '22.2442° N' : '23.7337° N',
          meta: isFirst ? 'Clear 28°C • Vector Active' : isSecond ? 'Golden Hour 18:14' : 'Radar Optimal',
          status: isFirst ? 'completed' : isSecond ? 'active' : 'upcoming',
        };
      });
    }

    return [
      { id: '1', name: 'AHMEDABAD', coords: '23.0225° N', meta: 'Clear 28°C • Vector Active', status: 'completed' },
      { id: '2', name: 'STATUE OF UNITY', coords: '21.8380° N', meta: 'Golden Hour 18:14', status: 'active' },
      { id: '3', name: 'SOMNATH', coords: '20.8880° N', meta: 'Coastal Radar Optimal', status: 'upcoming' },
      { id: '4', name: 'DWARKA', coords: '22.2442° N', meta: 'Gulf Breeze 10kt', status: 'upcoming' },
      { id: '5', name: 'RANN OF KUTCH', coords: '23.7337° N', meta: 'Salt Desert Buffer Active', status: 'upcoming' },
    ];
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-0.5 text-xs font-semibold text-brand-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Saved & Active Itineraries
          </span>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 flex items-center gap-3">
            <span>My Trips Dashboard</span>
            {user && (
              <span className="text-xs bg-slate-100 text-slate-700 font-normal px-3 py-1 rounded-full border border-slate-200">
                {user.fullName || user.email}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your AI-generated Gujarat travel plans, adaptive re-routing versions, and active trip telemetry.
          </p>
        </div>

        <Link
          href="/plan"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> Plan & Start New Trip
        </Link>
      </div>

      {/* Active Trip Ground Radar Banner */}
      {activeTrip && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Trip Radar Stream
            </h2>
            <span className="text-xs text-slate-500 font-mono">STATUS: ACTIVE</span>
          </div>

          <LiveGroundRadar
            title={`LIVE GROUND RADAR // ${activeTrip.title.toUpperCase()}`}
            waypoints={getWaypointsForTrip(activeTrip)}
            syncPercent="99.8%"
          />
        </section>
      )}

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
                      {trip.status} • V{trip.version || 1}
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
                  <span>{trip.crewType || `${trip.travellerCount} Travellers`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  <span className="font-bold text-emerald-700">₹{trip.budgetInr.toLocaleString('en-IN')} Budget</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/plan?destination=${encodeURIComponent(trip.destination)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
                >
                  View Full Itinerary & Map <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={`/plan?destination=${encodeURIComponent(trip.destination)}`}
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
              You haven't generated or saved any Gujarat itineraries yet. Use BharatYatra AI to create your first trip in under 60 seconds!
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-colors"
          >
            <Sparkles className="h-4 w-4" /> Create Your First AI Trip
          </Link>
        </div>
      )}
    </div>
  );
}

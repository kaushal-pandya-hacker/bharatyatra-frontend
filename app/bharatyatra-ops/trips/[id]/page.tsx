'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchAdminTripDetail } from '@/lib/admin-api';
import { 
  Compass, MapPin, Calendar, Users, DollarSign, ArrowLeft, RefreshCw, ShieldAlert, CreditCard, Clock, CheckCircle2
} from 'lucide-react';

export default function AdminTripDetailPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminTripDetail(tripId);
      if (res.success) {
        setTrip(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trip details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) loadTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-48"></div>
        <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl"></div>
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Error Loading Trip Details</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">{error || 'Trip record not found'}</p>
        <Link
          href="/bharatyatra-ops/trips"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Trips Directory
        </Link>
      </div>
    );
  }

  const user = trip.user;
  const bookings = trip.bookings || [];
  const daysPlan = trip.itineraryJson?.days || trip.itinerary?.days || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/bharatyatra-ops/trips"
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-500" />
                {trip.origin} → {trip.destination}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                {trip.status || 'SAVED'}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">Trip ID: {trip.id}</p>
          </div>
        </div>

        <button
          onClick={loadTrip}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-500 text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" /> Trip Owner
          </span>
          <Link href={`/bharatyatra-ops/users/${user?.id || trip.userId}`} className="block hover:text-amber-400 transition-colors">
            <div className="font-semibold text-slate-100">{user?.name || 'Customer'}</div>
            <div className="text-xs text-slate-400">{user?.email || '—'}</div>
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-500 text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Dates & Duration
          </span>
          <div className="font-semibold text-slate-100">
            {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Flexible'}
          </div>
          <div className="text-xs text-slate-400">{trip.durationDays || trip.days || 1} Days Trip</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-500 text-xs flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Est. Cost & Travelers
          </span>
          <div className="font-semibold text-emerald-400">
            ₹{trip.estimatedCost ? Number(trip.estimatedCost).toLocaleString('en-IN') : 'N/A'}
          </div>
          <div className="text-xs text-slate-400">{trip.travelersCount || 1} Travelers</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-slate-500 text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" /> Plan Creation Date
          </span>
          <div className="font-semibold text-slate-100">
            {new Date(trip.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {new Date(trip.createdAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Itinerary Day-by-Day */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Compass className="w-5 h-5 text-amber-500" /> Day-by-Day Itinerary Plan
            </h2>

            {daysPlan.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">Detailed daily breakdown not expanded or stored in summary mode.</p>
            ) : (
              <div className="space-y-4">
                {daysPlan.map((day: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <h3 className="font-semibold text-amber-400 text-sm flex items-center justify-between">
                      <span>Day {day.day || idx + 1}: {day.title || day.theme || 'Exploration'}</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {day.description || day.summary || 'Scheduled activities and local sightseeing.'}
                    </p>
                    {Array.isArray(day.activities) && day.activities.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-slate-400 pt-1 space-y-0.5">
                        {day.activities.map((act: any, aIdx: number) => (
                          <li key={aIdx}>{typeof act === 'string' ? act : act.title || act.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Associated Bookings & Ownership Integrity */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Associated Bookings
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-xs font-mono rounded">
                {bookings.length}
              </span>
            </h2>

            {bookings.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">No explicit hotel/flight reservations tied to this trip ID.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div key={b.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>{b.bookingType}</span>
                      <span className="text-emerald-400">₹{b.totalAmount}</span>
                    </div>
                    <div className="text-slate-400">{b.supplier || 'Provider'}</div>
                    <div className="text-slate-500 text-[10px]">Status: {b.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Customer Ownership Integrity</h3>
            <p className="text-slate-400 leading-relaxed">
              This trip is immutably owned by User ID <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded">{trip.userId}</code>. Admin access is strictly read-only for support, system analytics, and itinerary verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Users,
} from 'lucide-react';

export default function MyBookingsPage() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED'>('ALL');

  // Cancel Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const res = await fetch(`${apiBase}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch reservations.');
      }

      const json = await res.json();
      setBookings(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalBooking || !token) return;

    setCancelling(true);
    setCancelError(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const res = await fetch(`${apiBase}/bookings/${cancelModalBooking.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cancellationReason: cancellationReason || 'Customer requested cancellation via portal',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to cancel reservation.');
      }

      // Refresh list
      setCancelModalBooking(null);
      setCancellationReason('');
      fetchBookings();
    } catch (err: any) {
      setCancelError(err.message || 'Cancellation error.');
    } finally {
      setCancelling(false);
    }
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    if (activeTab === 'UPCOMING') {
      return b.status === 'CONFIRMED' && new Date(b.startDate || b.reservationTime || b.createdAt) >= new Date();
    }
    if (activeTab === 'PAST') {
      return b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.startDate || b.reservationTime || b.createdAt) < new Date());
    }
    return true; // ALL
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900">My Reservations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your confirmed hotel stays, table reservations, and activities across Gujarat.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {!token ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold font-heading text-slate-900">Sign in to View Bookings</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please log in to your traveler account to view your active itinerary reservations and booking history.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors"
          >
            Sign In Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Tabs Filter */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs">
            {(['ALL', 'UPCOMING', 'PAST', 'CANCELLED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 font-bold transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({
                  bookings.filter((b) => {
                    if (tab === 'CANCELLED') return b.status === 'CANCELLED';
                    if (tab === 'UPCOMING') return b.status === 'CONFIRMED' && new Date(b.startDate || b.reservationTime || b.createdAt) >= new Date();
                    if (tab === 'PAST') return b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.startDate || b.reservationTime || b.createdAt) < new Date());
                    return true;
                  }).length
                })
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-primary" />
              <p className="text-xs">Fetching your travel reservations...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 text-xs space-y-2">
              <AlertCircle className="h-6 w-6 mx-auto" />
              <p>{error}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700">No reservations found in this view.</p>
              <p className="text-xs text-slate-400">
                Explore Gujarat destinations, hotels, and activities to book your next trip.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white hover:bg-brand-primary-hover"
              >
                Explore Destinations
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {b.bookingReference}
                        </span>
                        <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                          {b.inventoryType}
                        </span>
                        {b.status === 'PENDING' && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            ⏳ Waiting for supplier confirmation
                          </span>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Booking confirmed
                          </span>
                        )}
                        {b.status === 'IN_PROGRESS' && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                            ⚡ Booking in progress
                          </span>
                        )}
                        {b.status === 'COMPLETED' && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                            ★ Booking completed
                          </span>
                        )}
                        {b.status === 'REJECTED' && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            ✕ Booking rejected by supplier
                          </span>
                        )}
                        {b.status === 'CANCELLED' && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                            🚫 Booking cancelled
                          </span>
                        )}
                        {!['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(b.status) && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                            {b.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold font-heading text-slate-900">
                        {b.inventory?.name || b.inventory?.title || `Item #${b.inventoryId.substring(0, 8)}`}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-lg font-extrabold font-heading text-brand-primary">
                        ₹{Number(b.totalAmountInr).toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-400">Total Paid/Booked</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-primary shrink-0" />
                      <span>
                        {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN') : 'Date N/A'}
                        {b.endDate ? ` - ${new Date(b.endDate).toLocaleDateString('en-IN')}` : ''}
                      </span>
                    </div>
                    {b.reservationTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-primary shrink-0" />
                        <span>Time: {new Date(b.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-primary shrink-0" />
                      <span>
                        {b.guestCount ? `${b.guestCount} Guests` : `${b.adultCount || 1} Adult${(b.adultCount || 1) > 1 ? 's' : ''}${b.childCount ? `, ${b.childCount} Child` : ''}`}
                      </span>
                    </div>
                  </div>

                  {b.cancellationReason && (
                    <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100">
                      <span className="font-bold">Cancellation Reason:</span> {b.cancellationReason}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <Link
                      href={`/bookings/${b.id}`}
                      className="font-bold text-brand-primary hover:underline flex items-center gap-1"
                    >
                      View Details & Invoice <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Cancellation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-heading text-slate-900">Cancel Reservation</h3>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel booking <span className="font-bold font-mono">{cancelModalBooking.bookingReference}</span>?
            </p>

            {cancelError && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelBooking} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Reason for Cancellation</label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please state why you are cancelling this booking..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

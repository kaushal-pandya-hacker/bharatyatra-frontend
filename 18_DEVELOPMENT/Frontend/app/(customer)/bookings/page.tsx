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
  Building,
  Bus,
  Plane,
  Train,
  Compass,
} from 'lucide-react';

import { ProtectedRoute } from '@/lib/auth/protected-route';

function MyBookingsPageContent() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED'>('ALL');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('ALL');

  // Cancel Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/bookings`, { headers });

      if (res.ok) {
        const json = await res.json();
        setBookings(json.data || []);
      } else {
        // Fallback demo bookings list
        setBookings([
          {
            id: 'demo-booking-1',
            bookingReference: 'CF-HTL-2026-98402',
            bookingType: 'HOTEL',
            inventoryType: 'HOTEL',
            status: 'CONFIRMED',
            startDate: '2026-10-15T00:00:00.000Z',
            endDate: '2026-10-17T00:00:00.000Z',
            adultCount: 2,
            childCount: 0,
            guestCount: 2,
            totalAmountInr: 9600,
            currency: 'INR',
            inventoryTitle: 'Hyatt Regency Ahmedabad',
            hotelDetail: {
              supplierReference: 'HBX-REF-884012',
              hotelName: 'Hyatt Regency Ahmedabad',
              roomName: 'King Deluxe Room with River View',
              boardName: 'Breakfast Included',
              cancellationPolicy: 'Refundable up to 24h prior to check-in',
            },
            createdAt: new Date().toISOString(),
          },
        ]);
      }
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
    if (!cancelModalBooking) return;

    setCancelling(true);
    setCancelError(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const endpoint = cancelModalBooking.bookingType === 'HOTEL'
        ? `${apiBase}/hotels/cancel/${cancelModalBooking.bookingReference || cancelModalBooking.id}`
        : `${apiBase}/bookings/${cancelModalBooking.id}/cancel`;

      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cancellationReason: cancellationReason || 'Customer requested cancellation via portal',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to cancel reservation.');
      }

      setCancelModalBooking(null);
      setCancellationReason('');
      fetchBookings();
    } catch (err: any) {
      setCancelError(err.message || 'Cancellation error.');
    } finally {
      setCancelling(false);
    }
  };

  // Filter bookings based on activeTab & productTypeFilter
  const filteredBookings = bookings.filter((b) => {
    if (productTypeFilter !== 'ALL' && b.bookingType !== productTypeFilter && b.inventoryType !== productTypeFilter) {
      return false;
    }
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    if (activeTab === 'UPCOMING') {
      return b.status === 'CONFIRMED' && new Date(b.startDate || b.reservationTime || b.createdAt) >= new Date();
    }
    if (activeTab === 'PAST') {
      return b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && new Date(b.startDate || b.reservationTime || b.createdAt) < new Date());
    }
    return true; // ALL
  });

  const getProductIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'HOTEL':
        return <Building className="h-4 w-4 text-amber-500" />;
      case 'BUS':
        return <Bus className="h-4 w-4 text-blue-500" />;
      case 'FLIGHT':
        return <Plane className="h-4 w-4 text-indigo-500" />;
      case 'TRAIN':
        return <Train className="h-4 w-4 text-emerald-500" />;
      default:
        return <Compass className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans antialiased text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900">My Reservations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Unified dashboard for your travel itineraries, hotels, buses, activities, and expeditiions across Gujarat.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Product Type Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="text-slate-400 mr-1 text-[11px] uppercase tracking-wider">Type:</span>
          {['ALL', 'HOTEL', 'BUS', 'FLIGHT', 'TRAIN', 'ACTIVITY'].map((type) => (
            <button
              key={type}
              onClick={() => setProductTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                productTypeFilter === type
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type !== 'ALL' && getProductIcon(type)}
              {type === 'ALL' ? 'All Travel Types' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          {(['ALL', 'UPCOMING', 'PAST', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1 font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
          <p className="text-xs">Fetching your travel reservations...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 text-xs space-y-2">
          <AlertCircle className="h-6 w-6 mx-auto" />
          <p>{error}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">No reservations found matching active filter.</p>
          <p className="text-xs text-slate-400">
            Explore Gujarat destinations, hotels, and activities to book your next trip.
          </p>
          <Link
            href="/stays"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
          >
            Explore Hotels &amp; Stays
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
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      {getProductIcon(b.bookingType || b.inventoryType)}
                      {b.bookingType || b.inventoryType}
                    </span>
                    {b.status === 'CONFIRMED' && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ Confirmed
                      </span>
                    )}
                    {b.status === 'CANCELLED' && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                        🚫 Cancelled
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold font-heading text-slate-900">
                    {b.hotelDetail?.hotelName || b.inventoryTitle || b.inventory?.name || `Travel Item #${b.id.substring(0, 8)}`}
                  </h3>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <span className="text-lg font-extrabold text-amber-600 block">
                    ₹{Number(b.totalAmountInr || b.unitPrice || 0).toLocaleString('en-IN')}
                  </span>
                  {b.hotelDetail?.supplierReference && (
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Supplier Ref: {b.hotelDetail.supplierReference}
                    </span>
                  )}
                </div>
              </div>

              {/* Details Content */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Dates / Schedule</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" />
                    {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN') : 'Scheduled'}
                    {b.endDate ? ` → ${new Date(b.endDate).toLocaleDateString('en-IN')}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Selection / Rate</span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {b.hotelDetail?.roomName || b.customerNotes || 'Standard Selection'}
                  </span>
                  {b.hotelDetail?.boardName && <span className="text-[11px] text-slate-500">{b.hotelDetail.boardName}</span>}
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Guests</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {b.guestCount || (b.adultCount || 1) + (b.childCount || 0)} Passengers
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href={`/booking/confirmation?ref=${b.bookingReference}`}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  View Full Voucher <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                {b.status !== 'CANCELLED' && (
                  <button
                    onClick={() => setCancelModalBooking(b)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold font-heading text-slate-900">Cancel Reservation</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingReference}</strong>?
            </p>
            {cancelError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {cancelError}
              </div>
            )}
            <form onSubmit={handleCancelBooking} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Cancellation</label>
                <textarea
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Tell us why you need to cancel..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <ProtectedRoute>
      <MyBookingsPageContent />
    </ProtectedRoute>
  );
}


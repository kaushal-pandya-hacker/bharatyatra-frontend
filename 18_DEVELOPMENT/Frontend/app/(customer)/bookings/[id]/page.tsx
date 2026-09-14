'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Building2,
  Loader2,
} from 'lucide-react';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { token } = useAuth();

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const res = await fetch(`${apiBase}/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          throw new Error('Reservation not found or access forbidden.');
        }
        throw new Error('Failed to load booking details.');
      }

      const json = await res.json();
      setBooking(json.data);
    } catch (err: any) {
      setError(err.message || 'Error loading detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [token, id]);

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;

    setCancelling(true);
    setCancelError(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const res = await fetch(`${apiBase}/bookings/${id}/cancel`, {
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

      setShowCancelModal(false);
      fetchDetail();
    } catch (err: any) {
      setCancelError(err.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-primary" />
        <p className="text-xs text-slate-500">Loading reservation summary...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold font-heading text-slate-900">Reservation Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'The requested booking could not be retrieved.'}</p>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <Link
        href="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Bookings
      </Link>

      {/* Main Ticket Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Ref: {booking.bookingReference}
              </span>
              {booking.status === 'PENDING' && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  ⏳ Waiting for supplier confirmation
                </span>
              )}
              {booking.status === 'CONFIRMED' && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ Booking confirmed
                </span>
              )}
              {booking.status === 'IN_PROGRESS' && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                  ⚡ Booking in progress
                </span>
              )}
              {booking.status === 'COMPLETED' && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                  ★ Booking completed
                </span>
              )}
              {booking.status === 'REJECTED' && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  ✕ Booking rejected by supplier
                </span>
              )}
              {booking.status === 'CANCELLED' && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                  🚫 Booking cancelled
                </span>
              )}
              {!['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(booking.status) && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                  {booking.status}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-2">
              {booking.inventory?.name || booking.inventory?.title || `${booking.inventoryType} Reservation`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Booked on {new Date(booking.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          {booking.status === 'CONFIRMED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              Cancel Reservation
            </button>
          )}
        </div>

        {/* Schedule & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs">
          <div className="space-y-2">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-primary" /> Dates & Schedule
            </span>
            <p className="text-slate-700">
              <span className="font-semibold">Start:</span>{' '}
              {booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-IN') : 'N/A'}
            </p>
            {booking.endDate && (
              <p className="text-slate-700">
                <span className="font-semibold">End:</span>{' '}
                {new Date(booking.endDate).toLocaleDateString('en-IN')}
              </p>
            )}
            {booking.reservationTime && (
              <p className="text-slate-700">
                <span className="font-semibold">Reservation Time:</span>{' '}
                {new Date(booking.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <User className="h-4 w-4 text-brand-primary" /> Guest Breakdown
            </span>
            {booking.guestCount ? (
              <p className="text-slate-700">Total Party: {booking.guestCount} Guests</p>
            ) : (
              <>
                <p className="text-slate-700">Adults: {booking.adultCount || 1}</p>
                <p className="text-slate-700">Children: {booking.childCount || 0}</p>
                <p className="text-slate-700">Quantity / Rooms: {booking.quantity || 1}</p>
              </>
            )}
          </div>
        </div>

        {/* Supplier Info */}
        {booking.supplier && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-brand-primary" /> Verified Host / Supplier
            </span>
            <p className="text-slate-700 font-bold">{booking.supplier.companyName}</p>
            <p className="text-slate-500">Contact: {booking.supplier.contactEmail} | {booking.supplier.contactPhone || 'N/A'}</p>
          </div>
        )}

        {/* Customer Notes */}
        {booking.customerNotes && (
          <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Special Instructions / Requests</span>
            <p>{booking.customerNotes}</p>
          </div>
        )}

        {/* Price Breakdown Snapshot */}
        <div className="space-y-3 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-primary" /> Price Breakdown (Immutable Snapshot)
          </h3>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Unit Rate (at time of booking)</span>
              <span className="font-mono">₹{Number(booking.unitPrice).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono">₹{Number(booking.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST & Taxes (18%)</span>
              <span className="font-mono">₹{Number(booking.taxes).toLocaleString('en-IN')}</span>
            </div>
            {Number(booking.discount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Applied Discount</span>
                <span className="font-mono">-₹{Number(booking.discount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-slate-900 text-sm">
              <span>Total Amount</span>
              <span className="text-brand-primary font-mono text-base">
                ₹{Number(booking.totalAmountInr).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {booking.rejectionReason && (
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-800 space-y-1">
            <span className="font-bold block">Rejection Info from Host</span>
            <p><span className="font-semibold">Reason:</span> {booking.rejectionReason}</p>
            {booking.rejectedAt && (
              <p className="text-slate-500">Rejected on: {new Date(booking.rejectedAt).toLocaleString('en-IN')}</p>
            )}
          </div>
        )}

        {booking.cancellationReason && (
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-800 space-y-1">
            <span className="font-bold block">Cancellation Info</span>
            <p><span className="font-semibold">Reason:</span> {booking.cancellationReason}</p>
            {booking.cancelledAt && (
              <p className="text-slate-500">Cancelled on: {new Date(booking.cancelledAt).toLocaleString('en-IN')}</p>
            )}
          </div>
        )}

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>This is an official Chalo Farva reservation token. Verified by server transaction.</span>
          </div>
          {booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
            <Link
              href={`/bookings/${id}/pay`}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow transition shrink-0"
            >
              Pay Now (Sandbox)
            </Link>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-heading text-slate-900">Confirm Cancellation</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

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
                  placeholder="State reason..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

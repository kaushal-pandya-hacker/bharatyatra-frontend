'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function SupplierBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note form state
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchBookingDetail = async () => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`http://localhost:4000/api/v1/suppliers/bookings/${bookingId}`, { headers });
      const json = await res.json();

      if (json.success && json.data) {
        setBooking(json.data);
      } else {
        throw new Error(json.message || 'Failed to load booking details');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to supplier booking service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const handleAccept = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`http://localhost:4000/api/v1/suppliers/bookings/${bookingId}/accept`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to accept booking');
      fetchBookingDetail();
    } catch (err: any) {
      alert(`Accept Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`http://localhost:4000/api/v1/suppliers/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rejectionReason: rejectReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to reject booking');
      setShowRejectModal(false);
      setRejectReason('');
      fetchBookingDetail();
    } catch (err: any) {
      alert(`Reject Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartFulfillment = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`http://localhost:4000/api/v1/suppliers/bookings/${bookingId}/start`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to start fulfillment');
      fetchBookingDetail();
    } catch (err: any) {
      alert(`Start Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`http://localhost:4000/api/v1/suppliers/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to complete booking');
      fetchBookingDetail();
    } catch (err: any) {
      alert(`Completion Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNoteLoading(true);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`http://localhost:4000/api/v1/suppliers/bookings/${bookingId}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ note: newNote.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to add note');
      setNewNote('');
      fetchBookingDetail();
    } catch (err: any) {
      alert(`Note Error: ${err.message}`);
    } finally {
      setNoteLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">⏳ PENDING REVIEW</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ CONFIRMED</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">⚡ IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">★ COMPLETED</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">✕ REJECTED</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">CANCELLED</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm text-slate-400 font-medium">Loading isolated booking reservation record...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 text-center">
        <div className="text-4xl">⚠️</div>
        <div className="text-lg font-bold text-rose-400">Booking Access Error</div>
        <div className="text-xs text-slate-300">{error || 'Booking reservation record not found or access denied.'}</div>
        <Link href="/supplier/bookings" className="inline-block px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs">
          ← Back to Bookings Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/supplier/bookings" className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-semibold">
          <span>←</span>
          <span>Back to Bookings Directory</span>
        </Link>

        {/* Fulfillment Action Buttons Header */}
        <div className="flex items-center gap-3">
          {booking.status === 'PENDING' && (
            <>
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                ✓ Accept Booking
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold transition"
              >
                ✕ Reject Booking
              </button>
            </>
          )}

          {booking.status === 'CONFIRMED' && (
            <>
              <button
                onClick={handleStartFulfillment}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                ⚡ Start Fulfillment
              </button>
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
              >
                ★ Mark Completed
              </button>
            </>
          )}

          {booking.status === 'IN_PROGRESS' && (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              ★ Mark Completed
            </button>
          )}
        </div>
      </div>

      {/* Main Booking Summary Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-teal-300 font-bold">
                {booking.bookingType}
              </span>
              <h1 className="text-2xl font-black font-mono text-slate-100">{booking.bookingReference}</h1>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Created on: <span className="font-mono">{new Date(booking.createdAt).toLocaleString()}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Total Booking Value</div>
            <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">
              ₹{Number(booking.totalAmountInr).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Column 1: Inventory & Reservation Details */}
          <div className="space-y-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
              <span>🏨</span>
              <span>Service & Reservation Details</span>
            </h3>

            <div className="space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500 font-semibold block">Inventory Listing Title:</span>
                <span className="font-bold text-slate-100 text-sm">{booking.inventoryTitle}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-500 block">Check-in / Start Date:</span>
                  <span className="font-semibold text-slate-200">
                    {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Check-out / End Date:</span>
                  <span className="font-semibold text-slate-200">
                    {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              {booking.reservationTime && (
                <div>
                  <span className="text-slate-500 block">Reserved Time Slot:</span>
                  <span className="font-mono text-teal-400 font-bold">{booking.reservationTime}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-500 block">Guest Breakdown:</span>
                  <span className="font-semibold text-slate-200">
                    {booking.guestCount} Total ({booking.adultCount} Adult, {booking.childCount} Child)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Quantity Units:</span>
                  <span className="font-semibold text-slate-200">{booking.quantity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Guest Information */}
          <div className="space-y-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
              <span>👤</span>
              <span>Customer Information</span>
            </h3>

            <div className="space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500 block">Guest Full Name:</span>
                <span className="font-bold text-slate-100">{booking.user?.fullName || 'Traveler'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Email:</span>
                <span className="font-mono text-teal-300">{booking.user?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Number:</span>
                <span className="font-mono text-slate-200">{booking.user?.phoneNumber || 'Not provided'}</span>
              </div>
              {booking.customerNotes && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block font-semibold">Customer Special Notes:</span>
                  <p className="text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800 mt-1">
                    "{booking.customerNotes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rejection / Cancellation Info Banner */}
        {booking.status === 'REJECTED' && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-xs space-y-1">
            <div className="font-bold text-rose-300 flex items-center gap-2">
              <span>✕ Booking Rejected by Supplier</span>
              <span className="text-[11px] font-mono text-rose-400">
                ({booking.rejectedAt ? new Date(booking.rejectedAt).toLocaleString() : ''})
              </span>
            </div>
            <div className="text-slate-300">
              <span className="text-slate-400">Reason:</span> {booking.rejectionReason}
            </div>
          </div>
        )}

        {booking.status === 'CANCELLED' && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-300 flex items-center gap-2">
              <span>🚫 Booking Cancelled</span>
              <span className="text-[11px] font-mono text-slate-400">
                ({booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleString() : ''})
              </span>
            </div>
            <div className="text-slate-400">
              <span className="text-slate-500">Cancellation Details:</span> {booking.cancellationReason || 'No reason provided.'}
            </div>
          </div>
        )}

        {/* Financial Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Pricing Breakdown</h3>
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Unit Rate</span>
              <span className="font-mono">₹{Number(booking.unitPrice).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">₹{Number(booking.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxes & Service GST (18%)</span>
              <span className="font-mono">₹{Number(booking.taxes).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-100 font-bold text-sm border-t border-slate-800 pt-2">
              <span>Total Amount</span>
              <span className="font-mono text-teal-300">₹{Number(booking.totalAmountInr).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Supplier Notes Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>📝</span>
          <span>Supplier Operational Notes</span>
        </h2>

        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            rows={3}
            placeholder="Add operational notes (e.g. Guest requested early check-in at 11 AM / Dietary preferences confirmed)..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-teal-500"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newNote.trim() || noteLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition shadow"
            >
              {noteLoading ? 'Saving Note...' : 'Add Operational Note'}
            </button>
          </div>
        </form>

        {booking.supplierNotes ? (
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap text-xs font-mono text-slate-300 leading-relaxed">
            {booking.supplierNotes}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic">No operational notes recorded yet.</div>
        )}
      </div>

      {/* Audit Log History Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>📜</span>
          <span>Booking Operational Audit Log</span>
        </h2>

        {booking.auditLogs && booking.auditLogs.length > 0 ? (
          <div className="space-y-2">
            {booking.auditLogs.map((log: any) => (
              <div key={log.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-teal-400 font-mono mr-2">[{log.action}]</span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic">No audit log records found.</div>
        )}
      </div>

      {/* Modal Dialog for Reject */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                <span>⚠️</span>
                <span>Reject Booking Reservation</span>
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide a valid rejection reason for reservation <span className="font-mono font-bold text-teal-300">{booking.bookingReference}</span>.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Fully booked / Maintenance shutdown / Capacity full..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rejectReason.trim() || actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition shadow"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

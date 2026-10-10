'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/api/client';

export default function SupplierBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [inventoryType, setInventoryType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalBooking, setRejectModalBooking] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-supplier-id'] = 'supp_001';
      }

      const queryParams = new URLSearchParams();
      queryParams.set('page', page.toString());
      queryParams.set('limit', '20');
      if (selectedTab !== 'ALL') queryParams.set('status', selectedTab);
      if (inventoryType !== 'ALL') queryParams.set('inventoryType', inventoryType);
      if (search.trim()) queryParams.set('search', search.trim());

      const res = await fetch(`${getBaseUrl()}/suppliers/bookings?${queryParams.toString()}`, { headers });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data);
        if (json.meta) setMeta(json.meta);
      } else {
        throw new Error(json.message || 'Failed to load supplier bookings');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to supplier booking service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedTab, inventoryType, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleAccept = async (bookingId: string) => {
    if (actionLoading) return;
    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`${getBaseUrl()}/suppliers/bookings/${bookingId}/accept`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to accept booking');
      }
      fetchBookings();
    } catch (err: any) {
      alert(`Accept Failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalBooking || !rejectReason.trim()) return;

    setActionLoading(rejectModalBooking.id);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`${getBaseUrl()}/suppliers/bookings/${rejectModalBooking.id}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rejectionReason: rejectReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to reject booking');
      }
      setRejectModalBooking(null);
      setRejectReason('');
      fetchBookings();
    } catch (err: any) {
      alert(`Reject Failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartFulfillment = async (bookingId: string) => {
    if (actionLoading) return;
    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`${getBaseUrl()}/suppliers/bookings/${bookingId}/start`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to start fulfillment');
      }
      fetchBookings();
    } catch (err: any) {
      alert(`Start fulfillment failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    if (actionLoading) return;
    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else headers['x-supplier-id'] = 'supp_001';

      const res = await fetch(`${getBaseUrl()}/suppliers/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to complete booking');
      }
      fetchBookings();
    } catch (err: any) {
      alert(`Complete Failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All Bookings' },
    { key: 'PENDING', label: 'Pending Review' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">⏳ PENDING</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ CONFIRMED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">⚡ IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">★ COMPLETED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">✕ REJECTED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 flex items-center gap-2.5">
            <span>📑</span>
            <span>Supplier Booking Fulfillment Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage incoming reservations, review guest details, accept/reject requests, and update operational progress.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
        >
          🔄 Refresh Orders
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setSelectedTab(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedTab === tab.key
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search booking ref, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label className="text-xs text-slate-400">Inventory Type:</label>
          <select
            value={inventoryType}
            onChange={(e) => {
              setInventoryType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Types</option>
            <option value="HOTEL">Hotels & Stays</option>
            <option value="RESTAURANT">Restaurants & Dining</option>
            <option value="ACTIVITY">Activities & Tours</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300 flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={fetchBookings} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-3 bg-slate-950 rounded-2xl border border-slate-800 p-8">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xs text-slate-400 font-medium">Fetching isolated tenant booking database...</div>
        </div>
      ) : bookings.length === 0 ? (
        /* Useful Empty State */
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <div className="text-4xl">📭</div>
          <div className="text-lg font-bold text-slate-200 font-heading">No Bookings Found</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {selectedTab !== 'ALL'
              ? `There are currently no bookings with status '${selectedTab}'.`
              : 'You do not have any incoming customer bookings yet. Ensure your inventory is verified and active on the marketplace.'}
          </p>
        </div>
      ) : (
        /* Bookings Data Table */
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Inventory Listing</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Stay / Service Date</th>
                  <th className="py-3.5 px-4">Guests / Qty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-4 font-mono font-bold text-teal-300">
                      <Link href={`/supplier/bookings/${b.id}`} className="hover:underline">
                        {b.bookingReference}
                      </Link>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-100">
                      <div>{b.inventoryTitle}</div>
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 mt-1 font-mono">
                        {b.inventoryType}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-200 font-bold">{b.user?.fullName || 'Traveler'}</div>
                      <div className="text-[11px] text-slate-400">{b.user?.email || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div>{b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A'}</div>
                      {b.reservationTime && (
                        <div className="text-[11px] text-teal-400/90 font-mono mt-0.5">⏱ {b.reservationTime}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div>{b.guestCount} guest(s)</div>
                      <div className="text-[10px] text-slate-500">Qty: {b.quantity}</div>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-4 px-4 font-bold text-slate-100 font-mono">
                      ₹{Number(b.totalAmountInr).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAccept(b.id)}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalBooking(b);
                                setRejectReason('');
                              }}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1.5 bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-bold transition"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}

                        {b.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleStartFulfillment(b.id)}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow"
                            >
                              ⚡ Start
                            </button>
                            <button
                              onClick={() => handleComplete(b.id)}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition shadow"
                            >
                              ★ Complete
                            </button>
                          </>
                        )}

                        {b.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleComplete(b.id)}
                            disabled={actionLoading === b.id}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition shadow"
                          >
                            ★ Complete
                          </button>
                        )}

                        <Link
                          href={`/supplier/bookings/${b.id}`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700"
                        >
                          Details →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-slate-200">{bookings.length}</span> of{' '}
              <span className="font-bold text-slate-200">{meta.total}</span> records
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg font-bold transition"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 font-mono font-bold">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg font-bold transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal Dialog */}
      {rejectModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                <span>⚠️</span>
                <span>Reject Booking Reservation</span>
              </h3>
              <button
                onClick={() => setRejectModalBooking(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are rejecting booking <span className="font-mono font-bold text-teal-300">{rejectModalBooking.bookingReference}</span> for{' '}
              <span className="font-semibold text-slate-100">{rejectModalBooking.inventoryTitle}</span>. Please provide a clear rejection reason for the customer.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Property fully booked for selected dates / Maintenance shutdown / Unavailable time slot..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setRejectModalBooking(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rejectReason.trim() || actionLoading === rejectModalBooking.id}
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

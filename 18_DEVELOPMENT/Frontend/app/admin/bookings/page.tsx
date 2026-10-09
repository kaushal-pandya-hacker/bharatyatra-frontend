'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let url = '/api/v1/admin/bookings';
      if (selectedStatus !== 'ALL') {
        url += `?status=${selectedStatus}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json && json.data) {
        setBookings(json.data);
      }
    } catch (e) {
      console.error('Failed to load admin bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.bookingReference || '').toLowerCase().includes(q) ||
      (b.customerName || b.user?.name || '').toLowerCase().includes(q) ||
      (b.customerEmail || b.user?.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-xs text-[#141A32]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Super-App Operations</span>
          <h1 className="text-3xl font-extrabold text-[#0A1128]">Booking Control & Operations Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time customer reservations, supplier confirmation statuses, and resolve partial failures.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CONFIRMED', 'PENDING', 'PARTIALLY_CONFIRMED', 'REFUND_REQUIRED', 'CANCELLED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all ${
                selectedStatus === st
                  ? 'bg-[#0A1128] text-[#FED65B] shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'PARTIALLY_CONFIRMED' ? '⚠️ Partial Failures' : st}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by Reference, Name, or Email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none w-72"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-500">Loading operational bookings stream...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">No bookings found matching selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Reference & Customer</th>
                  <th className="p-4">Inventory / Package</th>
                  <th className="p-4">Travel Date</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4">Overall Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBookings.map(b => (
                  <tr key={b.id || b.bookingReference} className={b.status === 'PARTIALLY_CONFIRMED' ? 'bg-amber-50/50' : 'hover:bg-slate-50/50'}>
                    <td className="p-4">
                      <div className="font-bold text-[#0A1128] font-mono text-sm">{b.bookingReference}</div>
                      <div className="text-slate-600 font-semibold">{b.customerName || b.user?.name || 'Guest User'}</div>
                      <div className="text-slate-400 text-[10px]">{b.customerEmail || b.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#0A1128]">{b.inventory?.title || b.packageSlug || 'Travel Package'}</div>
                      <div className="text-[10px] text-slate-500">{b.inventoryType || 'PACKAGE'}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-semibold">
                      {b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="p-4 font-bold text-emerald-700">
                      ₹{Number(b.totalAmountInr || b.totalPriceInr || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      {b.status === 'CONFIRMED' && (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                          ✓ CONFIRMED
                        </span>
                      )}
                      {b.status === 'PARTIALLY_CONFIRMED' && (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300 animate-pulse">
                          ⚠️ PARTIALLY CONFIRMED
                        </span>
                      )}
                      {b.status === 'REFUND_REQUIRED' && (
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                          🔴 REFUND REQUIRED
                        </span>
                      )}
                      {!['CONFIRMED', 'PARTIALLY_CONFIRMED', 'REFUND_REQUIRED'].includes(b.status) && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {b.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/bookings/${b.id || b.bookingReference}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

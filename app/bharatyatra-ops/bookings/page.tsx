'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminBookings } from '@/lib/admin-api';
import { 
  CreditCard, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Hotel, Plane, Bus, Train
} from 'lucide-react';

interface BookingItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tripId: string | null;
  bookingType: string;
  supplier: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminBookings(page, pagination.limit, search, typeFilter, statusFilter);
      if (res.success) {
        setBookings(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(1);
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings(1);
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'HOTEL': return <Hotel className="w-4 h-4 text-indigo-400" />;
      case 'FLIGHT': return <Plane className="w-4 h-4 text-sky-400" />;
      case 'BUS': return <Bus className="w-4 h-4 text-amber-400" />;
      case 'TRAIN': return <Train className="w-4 h-4 text-emerald-400" />;
      default: return <CreditCard className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Link href="/bharatyatra-ops/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Bookings</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-emerald-400" /> Bookings Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor and audit hotel, flight, bus, and train reservations across BharatYatra users.
          </p>
        </div>
        <button
          onClick={() => loadBookings(pagination.page)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search supplier, user name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Types</option>
            <option value="HOTEL">HOTEL</option>
            <option value="FLIGHT">FLIGHT</option>
            <option value="BUS">BUS</option>
            <option value="TRAIN">TRAIN</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {error && (
          <div className="p-4 bg-red-950/50 border-b border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Booking Details</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-40"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 bg-slate-800 rounded w-16 ml-auto"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No bookings found matching filter criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{b.supplier || 'Provider'}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">Booking ID: {b.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/bharatyatra-ops/users/${b.userId}`} className="hover:text-amber-400 transition-colors">
                        <div className="font-medium text-slate-200">{b.userName}</div>
                        <div className="text-xs text-slate-400">{b.userEmail}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                        {getBookingIcon(b.bookingType)}
                        {b.bookingType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : b.status === 'PENDING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-semibold text-emerald-400">
                      ₹{b.totalAmount ? Number(b.totalAmount).toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{bookings.length}</span> of <span className="font-semibold text-slate-200">{pagination.total}</span> bookings
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadBookings(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => loadBookings(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

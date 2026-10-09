'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminTrips } from '@/lib/admin-api';
import { 
  Compass, Search, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw, Calendar, MapPin, Users as UsersIcon
} from 'lucide-react';

interface TripItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  origin: string;
  destination: string;
  startDate: string;
  durationDays: number;
  travelersCount: number;
  status: string;
  createdAt: string;
  bookingsCount: number;
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminTrips(page, pagination.limit, search, statusFilter);
      if (res.success) {
        setTrips(res.data);
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrips(1);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Link href="/bharatyatra-ops/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">Trips</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-amber-500" /> Trips & Itineraries Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Inspect all travel plans generated across BharatYatra while preserving user data ownership.
          </p>
        </div>
        <button
          onClick={() => loadTrips(pagination.page)}
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
              placeholder="Search origin, destination, user..."
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

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Trip Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SAVED">SAVED</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
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
                <th className="px-5 py-3.5">Route</th>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Duration</th>
                <th className="px-5 py-3.5 text-center">Travelers</th>
                <th className="px-5 py-3.5 text-center">Bookings</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-40"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-800 rounded w-8 mx-auto"></div></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-800 rounded w-8 mx-auto"></div></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 bg-slate-800 rounded w-8 mx-auto"></div></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 bg-slate-800 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    No trips found matching filter criteria.
                  </td>
                </tr>
              ) : (
                trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {t.origin} → {t.destination}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {t.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/bharatyatra-ops/users/${t.userId}`} className="hover:text-amber-400 transition-colors">
                        <div className="font-medium text-slate-200">{t.userName}</div>
                        <div className="text-xs text-slate-400">{t.userEmail}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-slate-200">{t.durationDays} Days</td>
                    <td className="px-5 py-4 text-center font-mono text-slate-200">{t.travelersCount}</td>
                    <td className="px-5 py-4 text-center font-mono text-slate-200">{t.bookingsCount}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/bharatyatra-ops/trips/${t.id}`}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" /> Details
                      </Link>
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
            Showing <span className="font-semibold text-slate-200">{trips.length}</span> of <span className="font-semibold text-slate-200">{pagination.total}</span> trips
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTrips(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => loadTrips(pagination.page + 1)}
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

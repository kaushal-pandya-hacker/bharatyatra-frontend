'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Car,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface TripItem {
  id: string;
  userId: string;
  title: string;
  destination: string;
  status: 'IN_PROGRESS' | 'STARTING_SOON' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  travelersCount: number;
  totalBudget: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  emergencyFlag?: boolean;
}

export default function AdminAllTripsPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/trips');
      const json = await res.json();
      if (json.success) {
        setTrips(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    total: trips.length,
    inProgress: trips.filter((t) => t.status === 'IN_PROGRESS').length,
    upcoming: trips.filter((t) => t.status === 'UPCOMING' || t.status === 'STARTING_SOON').length,
    completed: trips.filter((t) => t.status === 'COMPLETED').length,
    cancelled: trips.filter((t) => t.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Travel Ecosystem Directory
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Compass className="w-7 h-7 text-amber-500" />
            All Platform Trips &amp; Expeditions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Complete database of traveler circuits, departures, and historical journeys.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTrips}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/trips/live"
            className="px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1.5 shadow-xs font-bold"
          >
            <Car className="w-3.5 h-3.5" />
            Live Operations Deck
          </Link>
        </div>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Trips</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{counts.total}</div>
        </div>
        <div
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">In Progress</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{counts.inProgress}</div>
        </div>
        <div
          onClick={() => setStatusFilter('UPCOMING')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'UPCOMING'
              ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Upcoming</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{counts.upcoming}</div>
        </div>
        <div
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'COMPLETED'
              ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Completed</span>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{counts.completed}</div>
        </div>
        <div
          onClick={() => setStatusFilter('CANCELLED')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'CANCELLED'
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Cancelled</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{counts.cancelled}</div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, circuit, customer, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {(['ALL', 'IN_PROGRESS', 'STARTING_SOON', 'UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Trip Circuit &amp; ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Travelers</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading platform trips...
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No trips found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{trip.title}</div>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">
                          {trip.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/users/${trip.userId}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 block"
                        >
                          {trip.customerName}
                        </Link>
                        <span className="text-[11px] text-slate-400">{trip.customerEmail}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {trip.destination}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {trip.startDate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {trip.travelersCount}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ₹{trip.totalBudget.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            trip.status === 'IN_PROGRESS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                              : trip.status === 'STARTING_SOON' || trip.status === 'UPCOMING'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                              : trip.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                          }`}
                        >
                          {trip.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/trips/${trip.id}`}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1 transition"
                        >
                          Details
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

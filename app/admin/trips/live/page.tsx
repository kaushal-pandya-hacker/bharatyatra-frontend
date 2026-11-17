'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  Car,
  Calendar,
  MessageSquare,
} from 'lucide-react';

interface LiveTrip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  status: 'IN_PROGRESS' | 'STARTING_SOON' | 'NEEDS_ASSISTANCE';
  startDate: string;
  endDate: string;
  travelersCount: number;
  totalBudget: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  emergencyFlag?: boolean;
  supportNotes?: string;
  coordinates: {
    lat: number;
    lng: number;
    state: string;
  };
  hasExplicitLiveLocationShared: boolean;
  daysRemaining?: number;
}

export default function LiveTripOperationsPage() {
  const [trips, setTrips] = useState<LiveTrip[]>([]);
  const [counts, setCounts] = useState({
    totalLive: 0,
    inProgress: 0,
    startingSoon: 0,
    needsAssistance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'IN_PROGRESS' | 'STARTING_SOON' | 'NEEDS_ASSISTANCE'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<LiveTrip | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchLiveOperations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/trips/live');
      const json = await res.json();
      if (json.success) {
        setTrips(json.data || []);
        setCounts(json.counts || { totalLive: 0, inProgress: 0, startingSoon: 0, needsAssistance: 0 });
      }
    } catch (e) {
      console.error('Error fetching live trips:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOperations();
  }, []);

  const handleToggleEmergency = async (trip: LiveTrip) => {
    try {
      setUpdating(true);
      const newStatus = !trip.emergencyFlag;
      const res = await fetch(`/api/v1/admin/trips/${trip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyFlag: newStatus,
          supportNotes: newStatus ? 'EMERGENCY FLAG RAISED BY OPS' : 'Emergency resolved',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(newStatus ? '⚠️ Emergency Protocol Initiated!' : '✅ Emergency cleared.');
        setTimeout(() => setActionMessage(null), 3500);
        await fetchLiveOperations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedTrip || !noteInput.trim()) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/v1/admin/trips/${selectedTrip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportNotes: noteInput }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Internal support note recorded.');
        setTimeout(() => setActionMessage(null), 3000);
        setNoteInput('');
        setSelectedTrip(null);
        await fetchLiveOperations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (filter === 'IN_PROGRESS' && t.status !== 'IN_PROGRESS') return false;
    if (filter === 'STARTING_SOON' && t.status !== 'STARTING_SOON') return false;
    if (filter === 'NEEDS_ASSISTANCE' && !(t.status === 'NEEDS_ASSISTANCE' || t.emergencyFlag)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Live Operations Deck
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Compass className="w-7 h-7 text-amber-500" />
            Live Active Expeditions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time operations monitor for in-transit traveler groups across India.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLiveOperations}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <Link
            href="/admin/trips"
            className="px-3.5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition"
          >
            All Trips Catalog
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg border border-amber-500/30 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('ALL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Active</span>
            <Compass className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {counts.totalLive}
          </div>
          <span className="text-[11px] text-slate-500">Live & starting soon</span>
        </div>

        <div
          onClick={() => setFilter('IN_PROGRESS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filter === 'IN_PROGRESS'
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">On Route Now</span>
            <Car className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {counts.inProgress}
          </div>
          <span className="text-[11px] text-slate-500">In-progress circuits</span>
        </div>

        <div
          onClick={() => setFilter('STARTING_SOON')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filter === 'STARTING_SOON'
              ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Starting Soon</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {counts.startingSoon}
          </div>
          <span className="text-[11px] text-slate-500">Departing within 48h</span>
        </div>

        <div
          onClick={() => setFilter('NEEDS_ASSISTANCE')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filter === 'NEEDS_ASSISTANCE'
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Assistance</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {counts.needsAssistance}
          </div>
          <span className="text-[11px] text-slate-500">Support or SOS alerts</span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search traveler, circuit, destination..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {(['ALL', 'IN_PROGRESS', 'STARTING_SOON', 'NEEDS_ASSISTANCE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                filter === mode
                  ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* OPERATIONS FEED */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Streaming live telemetry and verified waypoints...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No active trips match this filter</p>
          <p className="text-xs text-slate-400 mt-1">All currently operating groups are progressing smoothly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTrips.map((trip) => {
            const isEmergency = trip.emergencyFlag || trip.status === 'NEEDS_ASSISTANCE';
            return (
              <div
                key={trip.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isEmergency
                    ? 'bg-rose-500/5 border-rose-300 dark:border-rose-900/60 shadow-md ring-1 ring-rose-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* TOP BAR */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isEmergency
                            ? 'bg-rose-500 text-white animate-pulse'
                            : trip.status === 'IN_PROGRESS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}
                      >
                        {isEmergency ? 'SOS / ASSISTANCE REQUIRED' : trip.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">ID: {trip.id}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                      {trip.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleEmergency(trip)}
                    disabled={updating}
                    title={isEmergency ? 'Mark emergency resolved' : 'Flag trip for emergency concierge support'}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isEmergency
                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-rose-600'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="hidden sm:inline">{isEmergency ? 'Clear SOS' : 'Flag SOS'}</span>
                  </button>
                </div>

                {/* DESTINATION & COORDINATES */}
                <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    {trip.destination} ({trip.coordinates.state})
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Waypoint: {trip.coordinates.lat.toFixed(4)}°N, {trip.coordinates.lng.toFixed(4)}°E
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                    Verified Destination Marker
                  </span>
                </div>

                {/* TRAVELER DETAILS */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Lead Sovereign</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {trip.customerName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <a href={`tel:${trip.customerPhone}`} className="hover:text-blue-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        {trip.customerPhone}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Party & Schedule</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {trip.travelersCount} Traveler{trip.travelersCount === 1 ? '' : 's'} • ₹{trip.totalBudget.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      {trip.startDate} → {trip.endDate}
                    </span>
                  </div>
                </div>

                {/* INTERNAL SUPPORT NOTES */}
                {trip.supportNotes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200">
                    <span className="font-bold uppercase text-[10px] tracking-wider text-amber-700 dark:text-amber-400 block">
                      Operations Note:
                    </span>
                    {trip.supportNotes}
                  </div>
                )}

                {/* ACTIONS FOOTER */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setNoteInput(trip.supportNotes || '');
                    }}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Add Ops Note
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/users/${trip.userId}`}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      User 360
                    </Link>
                    <Link
                      href={`/admin/trips/${trip.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                    >
                      Inspect Dossier
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OPS NOTE MODAL */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Support Note for {selectedTrip.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Internal record logged to the administrative audit trail.
              </p>
            </div>

            <textarea
              rows={4}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="e.g., Guide assigned via Udaipur Hub; traveler requested early breakfast verification."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={updating || !noteInput.trim()}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xs cursor-pointer"
              >
                {updating ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

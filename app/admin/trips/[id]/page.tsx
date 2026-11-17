'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Compass,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  ShieldAlert,
  Clock,
  Car,
  Hotel,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface ItineraryDay {
  day: number;
  theme: string;
  activities: string[];
  overnightStay?: string;
}

interface TripDetails {
  id: string;
  userId: string;
  title: string;
  destination: string;
  status: 'IN_PROGRESS' | 'STARTING_SOON' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'NEEDS_ASSISTANCE';
  startDate: string;
  endDate: string;
  travelersCount: number;
  totalBudget: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  emergencyFlag?: boolean;
  supportNotes?: string;
  itinerary?: ItineraryDay[];
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/trips/${tripId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTrip(json.data.trip);
        setUser(json.data.user);
        setBookings(json.data.relatedBookings || []);
        setNotes(json.data.trip.supportNotes || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) fetchTrip();
  }, [tripId]);

  const handleSaveNotes = async () => {
    if (!trip) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/v1/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Operational notes saved successfully.');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleEmergency = async () => {
    if (!trip) return;
    try {
      setUpdating(true);
      const newFlag = !trip.emergencyFlag;
      const res = await fetch(`/api/v1/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyFlag: newFlag,
          supportNotes: newFlag ? 'EMERGENCY SOS RAISED BY OPS' : 'Emergency resolved',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTrip({ ...trip, emergencyFlag: newFlag });
        setFeedback(newFlag ? 'Emergency SOS initiated.' : 'Emergency cleared.');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!trip) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/v1/admin/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTrip({ ...trip, status: newStatus as any });
        setFeedback(`Trip status transitioned to ${newStatus}.`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
        <p className="text-xs text-slate-500">Loading expedition dossier...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="py-24 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Trip record not found</h2>
        <Link href="/admin/trips" className="text-xs text-blue-600 font-bold hover:underline">
          Return to Trips Catalog
        </Link>
      </div>
    );
  }

  const isEmergency = trip.emergencyFlag || trip.status === 'NEEDS_ASSISTANCE';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* BACK BAR */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Trips Directory
        </Link>
        <span className="font-mono text-xs text-slate-400">TRIP ID: {trip.id}</span>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg border border-amber-500/30 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* TRIP HEADER HERO */}
      <div
        className={`p-6 rounded-3xl border ${
          isEmergency
            ? 'bg-rose-500/5 border-rose-300 dark:border-rose-900/60 shadow-lg'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isEmergency
                    ? 'bg-rose-600 text-white animate-pulse'
                    : trip.status === 'IN_PROGRESS'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : trip.status === 'STARTING_SOON' || trip.status === 'UPCOMING'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {trip.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {trip.destination}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {trip.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {trip.startDate} → {trip.endDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {trip.travelersCount} Traveler{trip.travelersCount === 1 ? '' : 's'}
              </span>
              <span>•</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                ₹{trip.totalBudget.toLocaleString('en-IN')}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={trip.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
            >
              <option value="UPCOMING">UPCOMING</option>
              <option value="STARTING_SOON">STARTING SOON</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <button
              onClick={handleToggleEmergency}
              disabled={updating}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                isEmergency
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              {isEmergency ? 'Clear SOS Flag' : 'Flag Emergency'}
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: ITINERARY & BOOKINGS (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* DAY-BY-DAY ITINERARY */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-amber-500" />
              Day-by-Day Itinerary Schedule
            </h2>

            {trip.itinerary && trip.itinerary.length > 0 ? (
              <div className="space-y-4">
                {trip.itinerary.map((day) => (
                  <div
                    key={day.day}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                        Day {day.day}
                      </span>
                      {day.overnightStay && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Hotel className="w-3.5 h-3.5 text-amber-600" />
                          {day.overnightStay}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                      {day.theme}
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {day.activities.map((act, idx) => (
                        <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Custom flexible circuit — no rigid day-by-day segments registered.
              </div>
            )}
          </div>

          {/* LINKED BOOKINGS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Linked Platform Bookings ({bookings.length})
            </h2>

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {b.serviceName || b.destination}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          {b.serviceType}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        Ref: {b.confirmationReference || b.id} • {b.bookingDate}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No separate service bookings linked.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TRAVELER 360 & OPS NOTES */}
        <div className="space-y-6">
          {/* LEAD TRAVELER CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3.5">
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              Lead Traveler Profile
            </h2>

            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">{trip.customerName}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">UID: {trip.userId}</div>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href={`tel:${trip.customerPhone}`}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                {trip.customerPhone}
              </a>
              <a
                href={`mailto:${trip.customerEmail}`}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition"
              >
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                {trip.customerEmail}
              </a>
            </div>

            <Link
              href={`/admin/users/${trip.userId}`}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              Open Full User 360 Dossier
            </Link>
          </div>

          {/* INTERNAL OPERATIONS & SUPPORT NOTES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Internal Support Notes
            </h2>
            <p className="text-xs text-slate-500">
              Recorded in the operational audit trail. Visible only to verified BharatYatra administrators.
            </p>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record itinerary notes, concierge contact, vehicle driver details, or special requests..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />

            <button
              onClick={handleSaveNotes}
              disabled={updating}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {updating ? 'Saving Audit Record...' : 'Save Operations Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

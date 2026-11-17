'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Compass,
  Radio,
  CalendarCheck,
  CreditCard,
  Gift,
  Bookmark,
  Bell,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  Luggage,
  Clock,
  XCircle,
  KeyRound,
  FileText,
  UserX,
  UserCheck,
} from 'lucide-react';

export default function User360ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'>('A');

  // Administrative action modal
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: string;
    title: string;
    requiresReason: boolean;
  }>({ isOpen: false, action: '', title: '', requiresReason: false });
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDossier = async () => {
    setLoading(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('User profile record not found in authoritative registry.');
      }

      const json = await res.json();
      if (json.success && json.data) {
        setDossier(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse User 360 profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with User 360 API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDossier();
    }
  }, [userId]);

  const handleExecuteAction = async () => {
    if (actionModal.requiresReason && (!actionReason || actionReason.trim().length < 5)) {
      setActionFeedback({ type: 'error', message: 'A specific reason (minimum 5 characters) is required.' });
      return;
    }

    setActionLoading(true);
    setActionFeedback(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await fetch(`/api/v1/admin/users/${userId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: actionModal.action,
          reason: actionReason,
          notes: actionNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to execute administrative action.');
      }

      setActionFeedback({ type: 'success', message: json.message });
      setTimeout(() => {
        setActionModal({ isOpen: false, action: '', title: '', requiresReason: false });
        setActionReason('');
        setActionNotes('');
        fetchDossier();
      }, 1000);
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
        <span className="text-sm">Synthesizing User 360 Dossier &amp; Travel Telemetry...</span>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Unable to Load User 360 Profile</h2>
        <p className="text-xs text-slate-500">{error || 'Target user not found.'}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to User Directory</span>
        </Link>
      </div>
    );
  }

  const {
    user,
    travelOverview,
    trips,
    bookings,
    payments,
    rewards,
    savedDestinations,
    preferences,
    notifications,
    activityLogs,
  } = dossier;

  const tabs = [
    { id: 'A', label: 'Personal Info', icon: User },
    { id: 'B', label: 'Travel Overview', icon: Compass },
    { id: 'C', label: `Active Trips (${trips.active.length})`, icon: Radio },
    { id: 'D', label: `Upcoming (${trips.upcoming.length})`, icon: Luggage },
    { id: 'E', label: `Trip History (${trips.history.length})`, icon: Clock },
    { id: 'F', label: `Bookings (${bookings.length})`, icon: CalendarCheck },
    { id: 'G', label: `Payments (${payments.length})`, icon: CreditCard },
    { id: 'H', label: `Rewards & 7% Codes (${rewards.length})`, icon: Gift },
    { id: 'I', label: `Saved (${savedDestinations.length})`, icon: Bookmark },
    { id: 'J', label: `Notifications (${notifications.length})`, icon: Bell },
    { id: 'K', label: 'Account Activity', icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 mb-2 transition"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to User Directory</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
              User 360: {user.fullName}
            </h1>
            {user.accountStatus === 'ACTIVE' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
                SUSPENDED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            User ID: <span className="font-mono font-bold text-slate-700">{user.id}</span> • Member since{' '}
            {user.registrationDate.split('T')[0]}
          </p>
        </div>

        {/* Governance Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!user.kycVerified && (
            <button
              onClick={() =>
                setActionModal({
                  isOpen: true,
                  action: 'VERIFY_ACCOUNT',
                  title: 'Verify User Identity & KYC',
                  requiresReason: false,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify KYC</span>
            </button>
          )}

          {user.accountStatus === 'ACTIVE' ? (
            <button
              onClick={() =>
                setActionModal({
                  isOpen: true,
                  action: 'SUSPEND_ACCOUNT',
                  title: 'Suspend Traveler Account',
                  requiresReason: true,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Suspend Account</span>
            </button>
          ) : (
            <button
              onClick={() =>
                setActionModal({
                  isOpen: true,
                  action: 'REACTIVATE_ACCOUNT',
                  title: 'Restore Account to Active Status',
                  requiresReason: false,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Reactivate Account</span>
            </button>
          )}

          <button
            onClick={() =>
              setActionModal({
                isOpen: true,
                action: 'FLAG_SUSPICIOUS',
                title: 'Flag Suspicious Booking Activity',
                requiresReason: true,
              })
            }
            className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flag Suspicious</span>
          </button>

          <button
            onClick={() =>
              setActionModal({
                isOpen: true,
                action: 'INITIATE_PASSWORD_RESET',
                title: 'Trigger Secure Password Reset Flow',
                requiresReason: false,
              })
            }
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Reset Password Link</span>
          </button>
        </div>
      </div>

      {/* 11 Organized Profile Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border-b-2 ${
                isActive
                  ? 'border-amber-500 text-slate-900 bg-amber-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        {/* TAB A: PERSONAL INFORMATION */}
        {activeTab === 'A' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab A: Personal &amp; Identity Dossier
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                <span className="text-sm font-bold text-slate-900 block">{user.fullName}</span>
                <span className="text-slate-500 block">User ID: {user.id}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="text-sm font-bold text-slate-900 block">{user.email}</span>
                <span className="text-emerald-600 font-semibold block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Email Verified (OAuth2 Domain)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                <span className="text-sm font-bold text-slate-900 block">{user.phoneNumber || 'Not provided'}</span>
                <span className={user.kycVerified ? 'text-blue-600 font-semibold flex items-center gap-1' : 'text-slate-400'}>
                  {user.kycVerified ? '✓ Verified Mobile Hotline' : 'Unverified mobile'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Origin Geographic Base</span>
                <span className="text-sm font-bold text-slate-900 block">{user.city}, {user.state}</span>
                <span className="text-slate-500 block">India</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration &amp; Last Login</span>
                <span className="text-sm font-bold text-slate-900 block">Registered: {user.registrationDate.split('T')[0]}</span>
                <span className="text-slate-500 block">Last Active: {user.lastLogin.split('T')[0]}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Source</span>
                <span className="text-sm font-bold text-slate-900 block">Direct Web Application</span>
                <span className="text-slate-500 block">Capacitor Android / Web Unified</span>
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Saved Traveler Preferences
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Language:</span>
                  <span className="font-semibold text-slate-900">{preferences?.preferredLanguage || 'English'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Dietary:</span>
                  <span className="font-semibold text-slate-900">{preferences?.dietaryPreference || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Budget Tier:</span>
                  <span className="font-semibold text-slate-900">{preferences?.budgetTier || 'Comfort'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Travel Style:</span>
                  <span className="font-semibold text-slate-900">{preferences?.travelStyle || 'Heritage & Nature'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: TRAVEL OVERVIEW */}
        {activeTab === 'B' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab B: Comprehensive Travel Overview
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Trips</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{travelOverview.totalTrips}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Active Now</span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">{travelOverview.activeTrips}</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Upcoming</span>
                <span className="text-2xl font-black text-blue-900 mt-1 block">{travelOverview.upcomingTrips}</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Completed</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">{travelOverview.completedTrips}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Travelers</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{travelOverview.totalTravelers}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Travel Distance</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">~{travelOverview.totalTravelDistanceKm} km</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Destination Visited</span>
                <span className="text-sm font-bold text-slate-900 block">{travelOverview.lastDestinationVisited}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Scheduled Destination</span>
                <span className="text-sm font-bold text-slate-900 block">{travelOverview.nextUpcomingDestination}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: ACTIVE TRIPS */}
        {activeTab === 'C' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab C: Currently Active Expeditions
            </h3>
            {trips.active.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active trips currently in progress for this user.</p>
            ) : (
              trips.active.map((trip: any) => (
                <div key={trip.id} className="p-5 rounded-xl border border-amber-300 bg-amber-50/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        Active Right Now: #{trip.id}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{trip.title}</h4>
                      <p className="text-xs text-slate-600">
                        {trip.originCity} → {trip.destination} • {trip.startDate} to {trip.endDate} ({trip.durationDays} Days, {trip.travelers} Pax)
                      </p>
                    </div>
                    <Link
                      href={`/admin/trips/${trip.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 self-start sm:self-auto shadow-xs"
                    >
                      <span>View Full Trip</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Transport Status:</span>
                      <span className="font-bold text-emerald-700">{trip.transportStatus}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Hotel Status:</span>
                      <span className="font-bold text-emerald-700">{trip.hotelStatus}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Trip Budget:</span>
                      <span className="font-bold text-slate-900">₹{trip.budgetInr.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Actual Expenditure:</span>
                      <span className="font-bold text-slate-900">₹{trip.actualExpenditureInr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {trip.itinerary && trip.itinerary.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-amber-200/40">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Day-by-Day Route Itinerary</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {trip.itinerary.map((day: any) => (
                          <div key={day.day} className="p-2.5 rounded-lg bg-white border border-slate-200">
                            <span className="font-bold text-slate-900 block">Day {day.day}: {day.theme}</span>
                            <span className="text-[11px] text-slate-500 block">Stay: {day.overnightStay}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB D: UPCOMING TRIPS */}
        {activeTab === 'D' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab D: Upcoming Scheduled Journeys
            </h3>
            {trips.upcoming.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No upcoming trips scheduled for this user.</p>
            ) : (
              trips.upcoming.map((trip: any) => (
                <div key={trip.id} className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                        Scheduled Departure: {trip.startDate}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{trip.title}</h4>
                      <p className="text-xs text-slate-500">Destination: {trip.destination} • {trip.travelers} Travelers</p>
                    </div>
                    <Link
                      href={`/admin/trips/${trip.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                    >
                      Manage Trip
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB E: TRIP HISTORY */}
        {activeTab === 'E' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab E: Historical Trips &amp; Archive
            </h3>
            {trips.history.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No historical trips archived.</p>
            ) : (
              trips.history.map((trip: any) => (
                <div key={trip.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{trip.title}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        trip.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Completed: {trip.endDate} • Spent: ₹{trip.actualExpenditureInr?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                  <Link href={`/admin/trips/${trip.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                    View Dossier
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB F: BOOKINGS */}
        {activeTab === 'F' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab F: Booking Records
            </h3>
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No booking records on file for this user.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {bookings.map((b: any) => (
                  <div key={b.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{b.bookingReference} — {b.type}</span>
                      <span className="text-slate-500 block">{b.supplierName} • Travel: {b.travelDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">₹{b.amount.toLocaleString('en-IN')}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB G: PAYMENTS & TRANSACTIONS */}
        {activeTab === 'G' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab G: Payments, Transactions &amp; Gateway References (Masked Data)
            </h3>
            {payments.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No payment transactions on file.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {payments.map((p: any) => (
                  <div key={p.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{p.transactionId}</span>
                      <span className="text-slate-500 block">{p.gateway} • {p.method} • Ref: {p.gatewayReference}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">₹{p.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB H: REWARDS AND 7% COUPONS */}
        {activeTab === 'H' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab H: Contributor Reward Coupons (7% Discount Codes)
            </h3>
            {rewards.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No reward coupons issued to this contributor.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {rewards.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-xl border border-amber-300 bg-amber-50/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono font-black text-xs">
                        {r.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">7% Contributor Reward ({r.placeName})</p>
                    <p className="text-[11px] text-slate-500">Valid until: {r.validUntil.split('T')[0]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB I: SAVED INFORMATION */}
        {activeTab === 'I' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab I: Saved Destinations &amp; Wishlist
            </h3>
            {savedDestinations.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No saved destinations recorded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {savedDestinations.map((s: any) => (
                  <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{s.name}</span>
                      <span className="text-slate-500 block">{s.category} • Saved on {s.savedAt.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB J: NOTIFICATION HISTORY */}
        {activeTab === 'J' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab J: Notification History (Email, WhatsApp, In-App)
            </h3>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No notifications recorded for this user.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {notifications.map((n: any) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.createdAt?.split('T')[0]}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB K: ACCOUNT ACTIVITY & SECURITY */}
        {activeTab === 'K' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tab K: Audit Trail &amp; Security Events
            </h3>
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No security or audit events logged.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {activityLogs.map((log: any) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[10px] text-slate-400">{log.createdAt}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">{actionModal.title}</h3>

            {actionFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {actionFeedback.message}
              </div>
            )}

            {actionModal.requiresReason && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mandatory Administrative Reason:
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Specify clear compliance or operational reason (min 5 characters)..."
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Internal Notes (Optional):</label>
              <input
                type="text"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Internal case reference or ticket ID..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActionModal({ isOpen: false, action: '', title: '', requiresReason: false })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {actionLoading ? 'Executing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

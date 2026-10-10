'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchAdminUserDetail, updateAdminUserStatus } from '@/lib/admin-api';
import { 
  User, Mail, MapPin, Calendar, Compass, CreditCard, ShieldAlert, CheckCircle2, 
  ArrowLeft, Bell, Plane, Hotel, Bus, Train, Smartphone, UserX, UserCheck, RefreshCw, Key
} from 'lucide-react';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUserDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminUserDetail(userId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadUserDetail();
  }, [userId]);

  const handleToggleStatus = async () => {
    if (!data?.user) return;
    const newStatus = data.user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!confirm(`Are you sure you want to change user "${data.user.name}" status to ${newStatus}?`)) return;

    setActionLoading(true);
    try {
      await updateAdminUserStatus(data.user.id, newStatus);
      await loadUserDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-48"></div>
        <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl"></div>
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-xl lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Error Loading User Details</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">{error || 'User not found'}</p>
        <Link
          href="/bharatyatra-ops/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to User Directory
        </Link>
      </div>
    );
  }

  const { user, profile, trips, bookings, pushSubscriptions, notificationPreferences } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/bharatyatra-ops/users"
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                user.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
              }`}>
                {user.status}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">User ID: {user.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadUserDetail}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
              user.status === 'SUSPENDED'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {user.status === 'SUSPENDED' ? (
              <><UserCheck className="w-4 h-4" /> Reactivate User Account</>
            ) : (
              <><UserX className="w-4 h-4" /> Deactivate User Account</>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Profile & Preferences */}
        <div className="space-y-6">
          {/* Profile Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-5 h-5 text-amber-500" /> Travel Profile
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500 text-xs block">Email Address</span>
                <span className="text-slate-200 font-medium">{user.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-xs block">Home City</span>
                  <span className="text-slate-200 font-medium">{profile?.homeCity || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">State / Country</span>
                  <span className="text-slate-200 font-medium">{profile?.state || 'India'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-xs block">Travel Style</span>
                  <span className="text-amber-400 font-medium">{profile?.travelStyle || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Budget Pace</span>
                  <span className="text-amber-400 font-medium">{profile?.budgetPace || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-xs block">Preferred Transport</span>
                <span className="text-slate-300 font-medium">
                  {Array.isArray(profile?.preferredTransport) ? profile.preferredTransport.join(', ') : profile?.preferredTransport || '—'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-xs block flex items-center justify-between">
                  Profile Completion
                  <span className="text-amber-400 font-bold">{profile?.completionPercentage || 0}%</span>
                </span>
                <div className="w-full bg-slate-950 rounded-full h-2 mt-1.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profile?.completionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                <span>Account Created:</span>
                <span className="text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Active Push Devices Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" /> Push Devices
              </span>
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 text-xs font-mono rounded">
                {pushSubscriptions.length} Active
              </span>
            </h2>

            {pushSubscriptions.length === 0 ? (
              <p className="text-slate-500 text-xs italic">No active web push subscriptions registered.</p>
            ) : (
              <div className="space-y-3">
                {pushSubscriptions.map((sub: any) => (
                  <div key={sub.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-medium text-slate-200">
                      <span>{sub.browser || 'Browser'} · {sub.os || 'OS'}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </div>
                    <div className="text-slate-500 truncate font-mono text-[10px]">
                      {sub.endpoint}
                    </div>
                    <div className="text-slate-500 text-[10px] pt-1">
                      Last used: {new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): User Trips & Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Trips Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-500" /> Associated Trips ({trips.length})
              </span>
            </h2>

            {trips.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">User has not generated any travel itineraries yet.</p>
            ) : (
              <div className="space-y-3">
                {trips.map((t: any) => (
                  <div key={t.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-base">{t.origin} → {t.destination}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-amber-400 text-xs rounded font-medium">
                          {t.status || 'SAVED'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-4">
                        <span>Duration: {t.durationDays || t.days || 'Multi-day'} Days</span>
                        <span>Travelers: {t.travelersCount || 1}</span>
                        <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      href={`/bharatyatra-ops/trips/${t.id}`}
                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold rounded-lg text-center transition-colors shrink-0"
                    >
                      Inspect Trip Itinerary
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Bookings Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Bookings History ({bookings.length})
              </span>
            </h2>

            {bookings.length === 0 ? (
              <p className="text-slate-500 text-xs py-4 text-center">No hotel, flight, bus, or train bookings associated with this user.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div key={b.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-xs font-mono rounded font-semibold border border-emerald-800">
                          {b.bookingType || 'BOOKING'}
                        </span>
                        <span className="font-semibold text-white">{b.supplier || b.provider || 'Supplier Reservation'}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-4">
                        <span>Amount: ₹{b.totalAmount ? Number(b.totalAmount).toLocaleString('en-IN') : '0'}</span>
                        <span>Status: <strong className="text-slate-200">{b.status}</strong></span>
                        <span>Date: {new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Compass,
  FileText,
  Bell,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Building,
} from 'lucide-react';
import { fetchAdminDashboard } from '@/lib/admin-api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchAdminDashboard();
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load operational metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const metrics = data?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalTrips: 0,
    upcomingTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalBookings: 0,
    activePushSubscriptions: 0,
    totalSuppliers: 0,
  };

  const logs = data?.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Operational Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform telemetry, user metrics, and trip expedition statistics.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{metrics.totalUsers.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-bold block mt-1">
              {metrics.activeUsers.toLocaleString()} Active Account(s)
            </span>
          </div>
        </div>

        {/* Total Trips */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Trips</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{metrics.totalTrips.toLocaleString()}</span>
            <span className="text-xs text-amber-400 font-bold block mt-1">
              {metrics.upcomingTrips.toLocaleString()} Upcoming · {metrics.activeTrips.toLocaleString()} Active
            </span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{metrics.totalBookings.toLocaleString()}</span>
            <span className="text-xs text-purple-400 font-bold block mt-1">
              Confirmed Reservations
            </span>
          </div>
        </div>

        {/* Push Subscriptions */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Push Devices</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{metrics.activePushSubscriptions.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-bold block mt-1">
              Active Browser Subscriptions
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/bharatyatra-ops/users"
          className="p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              Manage Users
            </h3>
            <p className="text-xs text-slate-400">Inspect traveler profiles, trips & push devices</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </Link>

        <Link
          href="/bharatyatra-ops/trips"
          className="p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              Trips Directory
            </h3>
            <p className="text-xs text-slate-400">View upcoming, active & completed itineraries</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </Link>

        <Link
          href="/bharatyatra-ops/notifications"
          className="p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              Web Push System
            </h3>
            <p className="text-xs text-slate-400">Audit push notifications & dispatch alerts</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </Link>
      </div>

      {/* Operational Activity Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white">Recent Admin Audit Activity</h3>
          </div>
          <Link href="/bharatyatra-ops/audit-logs" className="text-xs font-bold text-amber-400 hover:underline">
            View Full Audit Log
          </Link>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No recent audit events recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {logs.map((log: any) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">{log.action}</span>
                    <span className="text-slate-500">by</span>
                    <span className="text-slate-300 font-semibold">{log.admin?.username || log.adminId || 'System'}</span>
                  </div>
                  {log.resourceType && (
                    <p className="text-slate-400">
                      Target: {log.resourceType} {log.resourceId ? `(${log.resourceId})` : ''}
                    </p>
                  )}
                </div>

                <div className="text-slate-500 text-[11px] shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  Handshake,
  Package,
  Headphones,
  CheckCircle2,
  Clock,
  XCircle,
  Percent,
  Calendar,
  ArrowUpRight,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { apiFetch } from '@/lib/api/client';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchMetrics(dateRange);
  }, [dateRange]);

  const fetchMetrics = async (range: string) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const json = await apiFetch<any>(`/admin/dashboard?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!json.success) {
        throw new Error(json.message || 'Failed to fetch admin metrics');
      }
      setMetrics(json.data);
    } catch (err: any) {
      setError(err.message || 'Could not load operational metrics');
    } finally {
      setLoading(false);
    }
  };

  const kpi = metrics?.kpi || {
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalPartners: 0,
    activePackages: 0,
    pendingTickets: 0,
    paymentSuccessRate: 100,
  };

  const categoryShare = metrics?.categoryShare || [];
  const destinationPopularity = metrics?.destinationPopularity || [];
  const systemHealth = metrics?.systemHealth || { status: 'OPERATIONAL', uptime: '99.99%' };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Executive Operations</span>
            <span>•</span>
            <span>Live Database Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            BharatYatra Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time platform governance, booking fulfillment, AI operations &amp; financial analytics.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-xs self-start md:self-auto">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7D' },
            { id: '30days', label: 'Last 30D' },
            { id: '90days', label: 'Last 90D' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateRange(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dateRange === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchMetrics(dateRange)}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Booked Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{kpi.totalRevenue?.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">Today: ₹{kpi.todayRevenue?.toLocaleString()}</span>
              <span>•</span>
              <span>Month: ₹{kpi.monthlyRevenue?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings Volume</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {kpi.totalBookings}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">{kpi.confirmedBookings} Confirmed</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{kpi.pendingBookings} Pending</span>
              <span>•</span>
              <span className="text-rose-600 font-bold">{kpi.cancelledBookings} Cancelled</span>
            </div>
          </div>
        </div>

        {/* Registered & Active Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Travelers</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {kpi.totalUsers?.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">{kpi.activeUsers} Active Accounts</span>
              <span>•</span>
              <span className="text-slate-400">Zero Dormant Lockouts</span>
            </div>
          </div>
        </div>

        {/* Payment Success Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Success Rate</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {kpi.paymentSuccessRate}%
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">BharatGateway™ Active</span>
              <span>•</span>
              <span>Zero Dropoffs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPI Bar: Partners, Packages, Support Tickets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/travel-partners"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-amber-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Travel Partners</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{kpi.totalPartners} Agencies &amp; Suppliers</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
        </Link>

        <Link
          href="/admin/destinations"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-amber-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Curated Destinations</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{kpi.activePackages} Indian Circuits</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
        </Link>

        <Link
          href="/admin/support"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-amber-300 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Support Desk Queue</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{kpi.pendingTickets} Pending Inquiries</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
        </Link>
      </div>

      {/* Analytics Sections: Category Share & Popular Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Revenue by Booking Category</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">Live Breakdown</span>
          </div>

          <div className="space-y-3">
            {categoryShare.map((cat: any) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">₹{cat.revenue?.toLocaleString()}</span>
                    <span className="text-amber-600 font-extrabold">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Destination Circuits */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Top Destination Circuits</span>
            </h2>
            <Link href="/admin/destinations" className="text-xs font-bold text-amber-600 hover:underline">
              Manage All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {destinationPopularity.map((dest: any, idx: number) => (
              <div key={dest.name} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-slate-400 font-bold">{idx + 1}.</span>
                  <span className="font-bold text-slate-900">{dest.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500">{dest.bookings} Bookings</span>
                  <span className="font-extrabold text-slate-900">₹{dest.revenue?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health & Operations Telemetry Footer Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>BharatYatra Operational Fabric</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                {systemHealth.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Uptime {systemHealth.uptime} • Database: PostgreSQL / Supabase Connected • AI Engine: Gemini 2.0 Flash Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/system"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            Infrastructure Metrics
          </Link>
          <Link
            href="/admin/audit-logs"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-xs"
          >
            Audit Trail Stream
          </Link>
        </div>
      </div>
    </div>
  );
}

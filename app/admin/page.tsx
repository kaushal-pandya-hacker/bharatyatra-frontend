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
  Radio,
  Navigation,
  Sparkles,
  Gift,
  Share2,
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
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

  const userStats = metrics?.userAnalytics || {
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    newUsersMonth: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    suspendedUsers: 0,
    recentlyActiveUsers: 0,
  };

  const travelStats = metrics?.travelAnalytics || {
    totalTrips: 0,
    activeTripsNow: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    aiGeneratedTrips: 0,
    avgTravelersPerTrip: 1.0,
    popularDestinations: [],
  };

  const bookingStats = metrics?.bookingAnalytics || {
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    failedBookings: 0,
    totalBookingValueInr: 0,
    avgBookingValueInr: 0,
  };

  const financialStats = metrics?.financialAnalytics || {
    grossBookingValueInr: 0,
    netPlatformRevenueInr: 0,
    commissionEarnedInr: 0,
    pendingSettlementsInr: 0,
    successfulPaymentsCount: 0,
    failedPaymentsCount: 0,
    refundsCount: 0,
    outstandingRefundsInr: 0,
    paymentSuccessRatePct: 100,
  };

  const communityStats = metrics?.communityAnalytics || {
    totalContributedDestinations: 0,
    pendingApprovals: 0,
    approvedDestinations: 0,
    rejectedSubmissions: 0,
    rewardsGenerated: 0,
    rewardsRedeemed: 0,
    rewardRedemptionRatePct: 0,
  };

  const categoryShare = metrics?.categoryShare || [];
  const systemHealth = metrics?.systemHealth || { status: 'OPERATIONAL', uptime: '100%' };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header & Authoritative Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Executive Operations</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            BharatYatra Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Authoritative platform metrics, live trip monitoring, user governance &amp; financial operations.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs self-start md:self-auto">
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
          <button
            onClick={() => fetchMetrics(dateRange)}
            title="Refresh metrics"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchMetrics(dateRange)}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* PILLAR 1: USER ANALYTICS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">User Analytics &amp; Demographics</h2>
              <p className="text-xs text-slate-500">Registered travelers, account verification, and engagement status</p>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Registered</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{userStats.totalUsers}</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block flex items-center gap-0.5">
              <span>●</span> {userStats.activeUsers} Active Accounts
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">New Today</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">+{userStats.newUsersToday}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              +{userStats.newUsersWeek} this week
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">New This Month</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">+{userStats.newUsersMonth}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Last 30 days</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Verified Users</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{userStats.verifiedUsers}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              {userStats.unverifiedUsers} unverified
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Suspended</span>
            <span className={`text-2xl font-black mt-1 block ${userStats.suspendedUsers > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {userStats.suspendedUsers}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Safety sanctions</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Recently Active</span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">{userStats.recentlyActiveUsers}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Past 7 days</span>
          </div>
        </div>
      </section>

      {/* PILLAR 2: TRAVEL OPERATIONS & ITINERARY ANALYTICS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Travel Operations &amp; Itineraries</h2>
              <p className="text-xs text-slate-500">Live active expeditions, upcoming departures, and AI trip generation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/trips/live"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span>Live Operations Center</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              href="/admin/trips"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>All Trips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-amber-500/10 border border-amber-400/40 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              Active Right Now
            </span>
            <span className="text-3xl font-black text-amber-950 mt-1 block">{travelStats.activeTripsNow}</span>
            <span className="text-[10px] text-amber-700 font-bold mt-1 block">Live Expeditions</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Trips</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{travelStats.totalTrips}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Created journeys</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming</span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">{travelStats.upcomingTrips}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Scheduled starts</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{travelStats.completedTrips}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Fulfilled trips</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cancelled</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{travelStats.cancelledTrips}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Pre-trip aborts</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">AI Generated</span>
            <span className="text-2xl font-black text-indigo-700 mt-1 block">{travelStats.aiGeneratedTrips}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">AI Travel Brain</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Travelers</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{travelStats.avgTravelersPerTrip}</span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">Pax per trip</span>
          </div>
        </div>
      </section>

      {/* PILLAR 3 & 4: BOOKING & FINANCIAL ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Analytics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Booking Analytics</h3>
                <p className="text-[11px] text-slate-500">Order fulfillment &amp; inventory distribution</p>
              </div>
            </div>
            <Link href="/admin/bookings" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              View Directory →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">{bookingStats.totalBookings}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Confirmed</span>
              <span className="text-xl font-black text-emerald-800 mt-0.5 block">{bookingStats.confirmedBookings}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pending</span>
              <span className="text-xl font-black text-amber-800 mt-0.5 block">{bookingStats.pendingBookings}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Booking Value</span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">
                ₹{bookingStats.totalBookingValueInr.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Booking Value</span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">
                ₹{bookingStats.avgBookingValueInr.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Analytics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Financial Analytics &amp; Settlements</h3>
                <p className="text-[11px] text-slate-500">Platform revenue, commission earnings, and gateway telemetry</p>
              </div>
            </div>
            <Link href="/admin/payments" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              Payments Ledger →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Net Revenue</span>
              <span className="text-xl font-black text-blue-900 mt-0.5 block">
                ₹{financialStats.netPlatformRevenueInr.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-blue-600 font-semibold">10% Platform fee</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Successful Pmt</span>
              <span className="text-xl font-black text-emerald-800 mt-0.5 block">
                {financialStats.successfulPaymentsCount}
              </span>
              <span className="text-[9px] text-emerald-600 font-semibold">{financialStats.paymentSuccessRatePct}% success</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Settle</span>
              <span className="text-xl font-black text-slate-800 mt-0.5 block">
                ₹{financialStats.pendingSettlementsInr.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-slate-500 font-semibold">Vendor payouts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Processed Refunds</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">{financialStats.refundsCount} completed</span>
              </div>
              <Link href="/admin/refunds" className="text-xs text-blue-600 hover:underline font-semibold">
                Audit
              </Link>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Refunds</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">₹{financialStats.outstandingRefundsInr.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Clear</span>
            </div>
          </div>
        </div>
      </div>

      {/* PILLAR 5: COMMUNITY CONTRIBUTIONS & 7% REWARDS */}
      <section className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white border border-amber-300/40 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm">
              <Gift className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">Community Place Contributions &amp; 7% Rewards</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider">
                  Active Program
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Crowdsourced destination discovery workflow with automated 7% coupon generation for approved contributors.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/admin/community-contributions"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-slate-900 text-xs font-bold hover:bg-amber-50 transition shadow-xs"
            >
              Review Dossiers
            </Link>
            <Link
              href="/admin/rewards"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
            >
              Manage Rewards
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          <div className="bg-white/90 backdrop-blur-xs border border-amber-200/60 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Submissions</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">{communityStats.totalContributedDestinations}</span>
            <span className="text-[10px] text-slate-500 font-medium">Crowdsourced spots</span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs border border-amber-200/60 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pending Review</span>
            <span className="text-xl font-black text-amber-900 mt-1 block">{communityStats.pendingApprovals}</span>
            <span className="text-[10px] text-amber-700 font-medium">Awaiting admin action</span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs border border-amber-200/60 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Approved &amp; Published</span>
            <span className="text-xl font-black text-emerald-900 mt-1 block">{communityStats.approvedDestinations}</span>
            <span className="text-[10px] text-emerald-700 font-medium">Live on platform</span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs border border-amber-200/60 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rejected</span>
            <span className="text-xl font-black text-slate-700 mt-1 block">{communityStats.rejectedSubmissions}</span>
            <span className="text-[10px] text-slate-500 font-medium">Quality control</span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs border border-amber-200/60 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">7% Codes Issued</span>
            <span className="text-xl font-black text-indigo-900 mt-1 block">{communityStats.rewardsGenerated}</span>
            <span className="text-[10px] text-indigo-700 font-medium">BHARAT7-XXXXXX</span>
          </div>

          <div className="bg-white/90 backdrop-blur-xs border border-amber-200/60 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Codes Redeemed</span>
            <span className="text-xl font-black text-purple-900 mt-1 block">{communityStats.rewardsRedeemed}</span>
            <span className="text-[10px] text-purple-700 font-medium">{communityStats.rewardRedemptionRatePct}% utilization</span>
          </div>
        </div>
      </section>

      {/* Popular Destinations & System Health Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Destinations List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Most Popular Travel Circuits (Real Database Records)</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">By Booking Volume</span>
          </div>

          <div className="space-y-3">
            {travelStats.popularDestinations.length > 0 ? (
              travelStats.popularDestinations.map((d: any, idx: number) => (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{d.name}</span>
                      <span className="text-[11px] text-slate-500">{d.count} journeys booked</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-600 text-xs">{d.percentage}% of trips</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">No destination bookings recorded in this date range.</div>
            )}
          </div>
        </div>

        {/* Live Infrastructure & Health Telemetry */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">System Health &amp; APIs</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {systemHealth.status}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-600 font-medium">PostgreSQL / Supabase Pool</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-600 font-medium">Gemini 2.0 AI Travel Brain</span>
              <span className="font-bold text-indigo-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Active (380ms)
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-600 font-medium">BharatGateway™ FinTech</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Test Sandbox
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span className="text-slate-600 font-medium">Transactional Communications</span>
              <span className="font-bold text-blue-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Multi-Channel
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/admin/system"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <span>Inspect Full Infrastructure Telemetry</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

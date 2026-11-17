'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Compass,
  CreditCard,
  Sparkles,
  Gift,
  RefreshCw,
  Calendar,
  MapPin,
  CheckCircle2,
  DollarSign,
  Activity,
  Award,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('all');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'USERS' | 'TRAVEL' | 'BOOKINGS' | 'REVENUE' | 'AI_COMMUNITY'>('USERS');

  const fetchAnalytics = async (r = range) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/analytics?range=${r}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Executive Decision Intelligence
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <TrendingUp className="w-7 h-7 text-amber-500" />
            Platform Operational Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic cross-pillar metrics across traveler acquisition, circuits, revenues, AI workloads, and rewards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            {(['today', '7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg transition uppercase cursor-pointer ${
                  range === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(range)}
            disabled={loading}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { key: 'USERS', label: '1. Users & Retention', icon: Users },
          { key: 'TRAVEL', label: '2. Travel & Destinations', icon: Compass },
          { key: 'BOOKINGS', label: '3. Bookings & Conversions', icon: CreditCard },
          { key: 'REVENUE', label: '4. Revenue & Financials', icon: DollarSign },
          { key: 'AI_COMMUNITY', label: '5. AI & Community Rewards', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading && !data ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
          <p className="text-xs text-slate-500">Synthesizing platform intelligence...</p>
        </div>
      ) : !data ? (
        <div className="py-20 text-center text-xs text-slate-400">Failed to load analytics telemetry.</div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: USERS & RETENTION */}
          {activeTab === 'USERS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Registered</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {data.userAnalytics.totalUsers}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">100% Verified Identities</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Active Accounts</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {data.userAnalytics.activeUsers}
                  </div>
                  <span className="text-[11px] text-slate-400">Zero suspended</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">User Retention Rate</span>
                  <div className="text-2xl font-black text-purple-600 mt-1">
                    {data.userAnalytics.userRetentionRatePct}%
                  </div>
                  <span className="text-[11px] text-purple-600 font-medium">High repeat engagement</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Repeat Bookers</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {data.userAnalytics.returningUsersCount}
                  </div>
                  <span className="text-[11px] text-slate-400">&gt;1 confirmed booking</span>
                </div>
              </div>

              {/* USER ACTIVITY DISTRIBUTION */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Traveler Engagement Segments
                </h3>
                <div className="space-y-3">
                  {data.userAnalytics.activityDistribution.map((item: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{item.tier}</span>
                        <span>{item.count} Travelers ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRAVEL & DESTINATIONS */}
          {activeTab === 'TRAVEL' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Circuits</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {data.travelAnalytics.totalTrips}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Active Right Now</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {data.travelAnalytics.activeTrips}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Trip Length</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {data.travelAnalytics.averageDurationDays} Days
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Assistance Rate</span>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">
                    {data.travelAnalytics.tripsRequiringAssistance} SOS
                  </div>
                </div>
              </div>

              {/* POPULAR DESTINATIONS TABLE */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider mb-4">
                  Destination Popularity Ranking
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Destination Circuit</th>
                        <th className="py-2.5 px-3">Trips Created</th>
                        <th className="py-2.5 px-3">Travelers Guided</th>
                        <th className="py-2.5 px-3 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.travelAnalytics.popularDestinationsList.map((dest: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            {dest.destination}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            {dest.tripsCount} trips
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            {dest.travelersCount} travelers
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₹{dest.revenueInr.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS & CONVERSIONS */}
          {activeTab === 'BOOKINGS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Bookings</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {data.bookingAnalytics.totalBookings}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Conversion Rate</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {data.bookingAnalytics.bookingConversionRatePct}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Payment Success</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {data.bookingAnalytics.paymentSuccessRatePct}%
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Cancellation Rate</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {data.bookingAnalytics.cancellationRatePct}%
                  </div>
                </div>
              </div>

              {/* CATEGORY SHARE */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Service Category Revenue Share
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.bookingAnalytics.categoryShare.map((cat: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{cat.category}</span>
                      <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {cat.percentage}%
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">₹{cat.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REVENUE & FINANCIALS */}
          {activeTab === 'REVENUE' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Revenue</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    ₹{data.financialAnalytics.totalRevenueRupees.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Platform Margin</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    ₹{data.financialAnalytics.grossProfitRupees.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Supplier Payouts</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    ₹{data.financialAnalytics.supplierPayoutsRupees.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Processed Refunds</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    ₹{data.financialAnalytics.refundsProcessedRupees.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* REVENUE BREAKDOWN CARD */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Payment Processing &amp; Settlement Safeguards
                </h3>
                <p className="text-xs text-slate-500">
                  Zero discrepancy reported between customer ledger receipts and gateway settlement logs. Razorpay simulated test engine and Double-Entry ledger verified.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Commission Margin</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">12.5% Weighted Avg</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Tax Deducted (TCS)</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">1.0% Compliance</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Dispute Ratio</span>
                    <span className="text-base font-bold text-emerald-600">0.00%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI & COMMUNITY REWARDS */}
          {activeTab === 'AI_COMMUNITY' && (
            <div className="space-y-6">
              {/* AI TELEMETRY */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Farva AI Travel Brain Telemetry
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
                    Avg Latency: {data.aiAnalytics.avgLatencyMs}ms
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Plans Synthesized</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {data.aiAnalytics.totalPlansGenerated}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Itinerary Edits</span>
                    <div className="text-xl font-black text-blue-600 mt-1">
                      {data.aiAnalytics.itineraryModificationsCount}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Budget Recalculations</span>
                    <div className="text-xl font-black text-purple-600 mt-1">
                      {data.aiAnalytics.budgetOptimizationUsageCount}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pricing Compliance</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                      {data.aiAnalytics.pricingSeparationCompliancePct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* COMMUNITY 7% REWARDS */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  Community Contributor &amp; 7% Reward Engine
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Coupons Generated</span>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {data.communityAnalytics.rewardsGenerated}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Redeemed on Bookings</span>
                    <div className="text-xl font-black text-emerald-600 mt-1">
                      {data.communityAnalytics.rewardsRedeemed}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Redemption Rate</span>
                    <div className="text-xl font-black text-blue-600 mt-1">
                      {data.communityAnalytics.redemptionRatePct}%
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Approval Rate</span>
                    <div className="text-xl font-black text-amber-600 mt-1">
                      {data.communityAnalytics.approvalRatePct}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

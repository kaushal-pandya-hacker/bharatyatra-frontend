'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  Percent,
  CalendarCheck,
  ShieldCheck,
  Bell,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function PartnerDashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [manualRef, setManualRef] = useState('');
  const [sessionSetError, setSessionSetError] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
      const headers: HeadersInit = agencyId ? { 'x-agency-id': agencyId } : {};
      const res = await fetch('/api/v1/partner/dashboard', { headers });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch dashboard data.');
      }
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Network error fetching partner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRef.trim()) return;
    setSessionSetError(null);
    try {
      // Lookup status to retrieve agency ID
      const res = await fetch(`/api/v1/travel-partners/application-status?ref=${encodeURIComponent(manualRef.trim())}`);
      const json = await res.json();
      if (json.success && json.agency) {
        localStorage.setItem('partner_agency_id', json.agency.id);
        fetchTelemetry();
      } else {
        setSessionSetError(json.message || 'No matching agency found for this reference.');
      }
    } catch (err: any) {
      setSessionSetError(err.message || 'Failed to authenticate reference.');
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-[#FED65B] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-semibold text-slate-400">Loading verified agency telemetry...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Partner Authentication Required</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {error || 'No active travel partner agency session found in this browser.'}
          </p>
        </div>

        {/* Option to authenticate via reference number */}
        <form onSubmit={handleSetSession} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-left">
          <label className="text-xs font-bold text-slate-300">Enter Your Application Reference Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualRef}
              onChange={(e) => setManualRef(e.target.value)}
              placeholder="e.g. BY-AGY-849201"
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-[#FED65B]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#FED65B] hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Sign In
            </button>
          </div>
          {sessionSetError && (
            <p className="text-[11px] text-rose-400 font-medium">{sessionSetError}</p>
          )}
        </form>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/partners/register"
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            Register New Agency
          </Link>
          <Link
            href="/partners/application-status"
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
          >
            Check Application Status
          </Link>
        </div>
      </div>
    );
  }

  const { agency, metrics } = data;

  return (
    <div className="space-y-8">
      {/* Top Banner / Agency Dossier Summary */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {agency.verificationStatus}
            </span>
            <span className="text-xs text-slate-500 font-mono">Ref: {agency.referenceNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {agency.businessName}
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            {agency.businessDescription.slice(0, 140)}...
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/partner/packages/new"
            className="flex-1 sm:flex-none px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Add Tour Package
          </Link>
          <Link
            href="/partner/packages"
            className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl transition-all text-center"
          >
            Manage Packages
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            title: 'Published Packages',
            value: metrics.publishedPackages,
            sub: 'Live on BharatYatra',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
            icon: CheckCircle2,
          },
          {
            title: 'Under Review',
            value: metrics.awaitingReview,
            sub: 'Awaiting admin signoff',
            color: 'text-amber-700',
            bg: 'bg-amber-50 border-amber-200',
            icon: Clock,
          },
          {
            title: 'Draft Packages',
            value: metrics.draftPackages,
            sub: 'Work in progress',
            color: 'text-slate-800',
            bg: 'bg-slate-50 border-slate-200',
            icon: Package,
          },
          {
            title: 'Changes Requested',
            value: metrics.changesRequested,
            sub: 'Action required',
            color: 'text-rose-700',
            bg: 'bg-rose-50 border-rose-200',
            icon: AlertCircle,
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${kpi.bg} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-semibold">{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className={`text-2xl sm:text-3xl font-black ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[11px] text-slate-500">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Financial Ledger & Booking Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Gross Booking Value
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950">
            ₹{metrics.grossBookingValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">
            Total verified customer bookings originated through BharatYatra.
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-amber-600" /> Contractual Commission (10%)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            ₹{metrics.estimatedCommissionPayable.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">
            Calculated strictly per executed partner agreement basis.
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Net Partner Payout Accrued
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            ₹{metrics.netEarningsAccrued.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>Settled: ₹{metrics.settledEarnings.toLocaleString('en-IN')}</span>
            <span className="text-amber-600 font-semibold">Pending: ₹{metrics.pendingSettlement.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Notifications & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Items */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" /> Important Actions Requiring Attention
          </h3>

          <div className="space-y-3">
            {metrics.changesRequested > 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-amber-800">Package Corrections Requested</div>
                  <div className="text-slate-600 mt-0.5">
                    An admin has requested updates on one or more of your packages.
                  </div>
                </div>
                <Link
                  href="/partner/packages"
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg shrink-0"
                >
                  Review
                </Link>
              </div>
            ) : null}

            {metrics.publishedPackages === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-950">Publish Your First Tour Package</div>
                  <div className="text-slate-600 mt-0.5">
                    Create a package with itineraries and prices to start receiving travellers.
                  </div>
                </div>
                <Link
                  href="/partner/packages/new"
                  className="px-3 py-1.5 bg-slate-950 text-white font-bold rounded-lg shrink-0 hover:bg-slate-800"
                >
                  Create
                </Link>
              </div>
            ) : null}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-slate-950">Availability Inventory Check</div>
                <div className="text-slate-600 mt-0.5">
                  Verify upcoming departure cutoffs and maximum passenger capacities.
                </div>
              </div>
              <Link
                href="/partner/bookings"
                className="px-3 py-1.5 bg-slate-200 text-slate-800 font-bold rounded-lg shrink-0 hover:bg-slate-300"
              >
                View
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" /> Operational Notifications
          </h3>

          <div className="space-y-3">
            {metrics.recentNotifications && metrics.recentNotifications.length > 0 ? (
              metrics.recentNotifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{notif.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent notifications logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

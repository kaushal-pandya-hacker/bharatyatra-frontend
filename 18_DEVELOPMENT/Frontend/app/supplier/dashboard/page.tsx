'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/api/client';

export default function SupplierDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-supplier-id'] = 'supp_001';
      }

      const res = await fetch(`${getBaseUrl()}/suppliers/dashboard`, { headers });
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.message || 'Failed to load supplier dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-400">Loading isolated supplier telemetry...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="text-rose-400 font-bold text-lg">⚠️ Dashboard Telemetry Error</div>
        <div className="text-sm text-slate-300">{error || 'Unable to connect to supplier backend.'}</div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-slate-100">{data.companyName}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {data.verificationStatus || 'VERIFIED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supplier ID: <span className="font-mono text-teal-400">{data.supplierId}</span> • B2B Marketplace Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/supplier/inventory"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <span>➕ Add Inventory</span>
          </Link>
          <Link
            href="/supplier/profile"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            <span>🏢 Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/supplier/bookings?status=PENDING" className="group">
          <div className="bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 transition rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Review</div>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition text-xs">View →</span>
            </div>
            <div className="text-3xl font-black text-amber-400 mt-2">{data.pendingBookingsCount || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1">Requires accept or reject action</div>
          </div>
        </Link>

        <Link href="/supplier/bookings?status=CONFIRMED" className="group">
          <div className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Bookings</div>
              <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition text-xs">View →</span>
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-2">{data.confirmedBookingsCount || 0}</div>
            <div className="text-[11px] text-emerald-500/80 mt-1">Ready for guest fulfillment</div>
          </div>
        </Link>

        <Link href="/supplier/bookings?status=COMPLETED" className="group">
          <div className="bg-slate-950 border border-slate-800 hover:border-teal-500/40 transition rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Bookings</div>
              <span className="text-teal-400 font-bold group-hover:translate-x-1 transition text-xs">View →</span>
            </div>
            <div className="text-3xl font-black text-teal-400 mt-2">{data.completedBookingsCount || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1">Successfully fulfilled</div>
          </div>
        </Link>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Sales Volume</div>
          <div className="text-3xl font-black text-cyan-400 mt-2">
            ₹{Number(data.totalRevenueThisMonthInr || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total revenue across all listings</div>
        </div>
      </div>

      {/* Quick Action Pending Alert */}
      {data.pendingBookingsCount > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <div className="text-sm font-bold text-amber-200">
                You have {data.pendingBookingsCount} pending booking request(s) awaiting your review!
              </div>
              <div className="text-xs text-amber-400/80">Review dates, guest counts, and accept or reject reservations.</div>
            </div>
          </div>
          <Link
            href="/supplier/bookings?status=PENDING"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow"
          >
            Review Pending Bookings Now
          </Link>
        </div>
      )}

      {/* Alerts and Activity Feed */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>🔔</span>
            <span>Tenant Activity & Marketplace Notifications</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Tenant Isolated
          </span>
        </div>

        <div className="space-y-3">
          {(data.recentAlerts || []).map((alert: string, idx: number) => (
            <div key={idx} className="p-4 bg-slate-900/90 border-l-4 border-teal-500 rounded-xl text-xs text-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-teal-400 font-bold">✓</span>
                <span>{alert}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Live Sync</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

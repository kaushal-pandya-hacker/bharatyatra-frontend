'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/client';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const json = await apiFetch<any>('/admin/dashboard', {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-3">
        <div className="font-bold text-lg">Error Loading Operational Metrics</div>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
        >
          Retry Fetching Data
        </button>
      </div>
    );
  }

  const suppliers = metrics?.suppliers || { total: 0, verified: 0, pending: 0, suspended: 0 };
  const inventory = metrics?.inventory || { totalListings: 0, active: 0, inactive: 0, pendingReview: 0, breakdown: {} };
  const breakdown = inventory.breakdown || {};

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">Marketplace Operational Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time database analytics & supplier governance statistics</p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Suppliers</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{suppliers.total}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold">{suppliers.verified} Verified</span>
            <span className="text-amber-600 font-semibold">{suppliers.pending} Pending</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inventory Listings</div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">{inventory.totalListings}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold">{inventory.active} Active</span>
            <span className="text-slate-400 font-semibold">{inventory.inactive} Inactive</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Verification</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{suppliers.pending}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link href="/admin/suppliers?verificationStatus=PENDING" className="text-xs font-bold text-amber-600 hover:text-amber-700">
              Review Onboarding Applications →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suspended Accounts</div>
            <div className="text-3xl font-extrabold text-rose-600 mt-2">{suppliers.suspended}</div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link href="/admin/suppliers?status=SUSPENDED" className="text-xs font-bold text-slate-600 hover:text-slate-800">
              View Suspended Suppliers →
            </Link>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Future Module Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Inventory Breakdown by Category</span>
            <Link href="/admin/inventory" className="text-xs text-amber-600 font-bold hover:underline">
              Manage Listings →
            </Link>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>🏨 Hotels & Stays</span>
                <span className="font-bold text-slate-900">{breakdown.hotels?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Active: <strong className="text-emerald-600">{breakdown.hotels?.active || 0}</strong></span>
                <span>Inactive: <strong className="text-slate-400">{breakdown.hotels?.inactive || 0}</strong></span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>🍽️ Restaurants</span>
                <span className="font-bold text-slate-900">{breakdown.restaurants?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Active: <strong className="text-emerald-600">{breakdown.restaurants?.active || 0}</strong></span>
                <span>Inactive: <strong className="text-slate-400">{breakdown.restaurants?.inactive || 0}</strong></span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>🎟️ Activities</span>
                <span className="font-bold text-slate-900">{breakdown.activities?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Active: <strong className="text-emerald-600">{breakdown.activities?.active || 0}</strong></span>
                <span>Inactive: <strong className="text-slate-400">{breakdown.activities?.inactive || 0}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* System & Future Roadmap Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Roadmap Phase Status</h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span>Phase 3A — Supplier Foundation</span>
              <span className="font-bold">COMPLETE</span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span>Phase 3B — Supplier Inventory</span>
              <span className="font-bold">COMPLETE</span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 flex items-center justify-between">
              <span>Phase 3C — Admin Dashboard</span>
              <span className="font-bold">ACTIVE</span>
            </div>
            <div className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-200 flex items-center justify-between">
              <span>Phase 3D — Booking Engine</span>
              <span>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Operational Audit Trail */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Operational Activity Audit Stream</h2>
          <Link href="/admin/audit-logs" className="text-xs text-amber-600 font-bold hover:underline">
            View All Audit Logs →
          </Link>
        </div>

        {metrics?.recentAuditLogs && metrics.recentAuditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Admin Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Details / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.recentAuditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{log.adminEmail || 'admin@bharatyatra.com'}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{log.entityType} ({log.entityId?.slice(0, 8)})</td>
                    <td className="px-4 py-3 text-slate-600 max-w-md truncate">{log.reason || log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs font-medium">
            No audit records logged yet. Administrative governance actions will appear here in real-time.
          </div>
        )}
      </div>
    </div>
  );
}

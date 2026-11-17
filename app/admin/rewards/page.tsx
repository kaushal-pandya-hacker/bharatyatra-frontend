'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Tag,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface ContributorRewardCoupon {
  code: string;
  placeContributionId: string;
  placeName: string;
  contributorUserId: string;
  contributorEmail: string;
  contributorName: string;
  discountPercentage: number;
  maxDiscountRupees: number;
  minBookingValueRupees: number;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'REVOKED';
  generatedAt: string;
  expiresAt: string;
  redeemedAt?: string;
  redeemedBookingId?: string;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
}

interface RewardStats {
  totalGenerated: number;
  active: number;
  redeemed: number;
  expired: number;
  revoked: number;
  totalDiscountDisbursedRupees: number;
}

export default function AdminRewardsPage() {
  const [coupons, setCoupons] = useState<ContributorRewardCoupon[]>([]);
  const [stats, setStats] = useState<RewardStats>({
    totalGenerated: 0,
    active: 0,
    redeemed: 0,
    expired: 0,
    revoked: 0,
    totalDiscountDisbursedRupees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Revocation Modal
  const [selectedCoupon, setSelectedCoupon] = useState<ContributorRewardCoupon | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/rewards');
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data || []);
        setStats(
          json.stats || {
            totalGenerated: 0,
            active: 0,
            redeemed: 0,
            expired: 0,
            revoked: 0,
            totalDiscountDisbursedRupees: 0,
          }
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleRevoke = async () => {
    if (!selectedCoupon || revokeReason.trim().length < 5) return;
    try {
      setRevoking(true);
      const res = await fetch(`/api/v1/admin/rewards/${selectedCoupon.code}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: revokeReason }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Coupon ${selectedCoupon.code} has been successfully revoked.`);
        setSelectedCoupon(null);
        setRevokeReason('');
        await fetchRewards();
        setTimeout(() => setFeedback(null), 3500);
      } else {
        alert(data.error || 'Failed to revoke coupon.');
      }
    } catch (e: any) {
      alert(e.message || 'Network error.');
    } finally {
      setRevoking(false);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.placeName.toLowerCase().includes(q) ||
        c.contributorName.toLowerCase().includes(q) ||
        c.contributorEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Community Contributor Incentives
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-1">
            <Gift className="w-7 h-7 text-amber-500" />
            7% Contributor Reward Coupons
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automatic BHARAT7-XXXXXX discount vouchers granted for community place submissions.
          </p>
        </div>

        <button
          onClick={fetchRewards}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg border border-amber-500/30 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Generated</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalGenerated}
          </div>
          <span className="text-[11px] text-slate-400">Total coupons</span>
        </div>

        <div
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {stats.active}
          </div>
          <span className="text-[11px] text-slate-400">Ready to redeem</span>
        </div>

        <div
          onClick={() => setStatusFilter('REDEEMED')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'REDEEMED'
              ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Redeemed</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {stats.redeemed}
          </div>
          <span className="text-[11px] text-slate-400">Applied to bookings</span>
        </div>

        <div
          onClick={() => setStatusFilter('EXPIRED')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'EXPIRED'
              ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Expired</span>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {stats.expired}
          </div>
          <span className="text-[11px] text-slate-400">&gt; 90 days validity</span>
        </div>

        <div
          onClick={() => setStatusFilter('REVOKED')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'REVOKED'
              ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase">Revoked</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {stats.revoked}
          </div>
          <span className="text-[11px] text-slate-400">Fraud or rejected</span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, contributor, place..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {(['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'REVOKED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Approved Place</th>
                <th className="py-3 px-4">Contributor</th>
                <th className="py-3 px-4">Benefit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading rewards registry...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No contributor coupons found.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {coupon.placeName}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/users/${coupon.contributorUserId}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-blue-600 block"
                      >
                        {coupon.contributorName}
                      </Link>
                      <span className="text-[11px] text-slate-400">{coupon.contributorEmail}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {coupon.discountPercentage}% OFF
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Max ₹{coupon.maxDiscountRupees} (Min ₹{coupon.minBookingValueRupees})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          coupon.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : coupon.status === 'REDEEMED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                            : coupon.status === 'REVOKED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(coupon.expiresAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {coupon.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setRevokeReason('');
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                      {coupon.status === 'REVOKED' && coupon.revocationReason && (
                        <span className="text-[10px] text-slate-400 italic" title={coupon.revocationReason}>
                          Reason logged
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVOCATION MODAL */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-rose-600 mb-1">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-black">Revoke Contributor Coupon</h3>
              </div>
              <p className="text-xs text-slate-500">
                You are revoking <strong className="font-mono text-slate-900 dark:text-white">{selectedCoupon.code}</strong> issued to {selectedCoupon.contributorName}.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">
                Mandatory Audit Reason (min 5 characters) *
              </label>
              <textarea
                rows={3}
                required
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g., Contributor requested cancellation / Duplicate submission identified."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCoupon(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking || revokeReason.trim().length < 5}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                {revoking ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

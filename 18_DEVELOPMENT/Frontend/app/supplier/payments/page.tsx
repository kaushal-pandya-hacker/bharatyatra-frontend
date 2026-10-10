'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/api/client';

interface TransactionItem {
  bookingId: string;
  bookingReference: string;
  bookingType: string;
  customerName: string;
  startDate?: string;
  status: string;
  paymentStatus: string;
  grossAmountInr: number;
  commissionRate: number;
  commissionAmountInr: number;
  supplierPayableInr: number;
  createdAt: string;
}

interface SettlementItem {
  id: string;
  bookingId: string;
  grossAmountInr: number;
  commissionAmountInr: number;
  payableAmountInr: number;
  status: string;
  settlementReference?: string;
  createdAt: string;
}

export default function SupplierPaymentsPage() {
  const [metrics, setMetrics] = useState<{
    totalGrossValueInr: number;
    totalCommissionDeductedInr: number;
    totalNetPayableInr: number;
    pendingSettlementsCount: number;
  }>({
    totalGrossValueInr: 0,
    totalCommissionDeductedInr: 0,
    totalNetPayableInr: 0,
    pendingSettlementsCount: 0,
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      if (!token) {
        setError('Supplier authentication token missing. Please log in.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${getBaseUrl()}/supplier/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMetrics(json.data.metrics);
        setTransactions(json.data.transactions || []);
        setSettlements(json.data.settlements || []);
      } else {
        setError(json.message || 'Failed to fetch financial data.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching supplier financial data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            <span>💳</span> Supplier Financial Portal & Payout Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time track of customer payments, platform commission breakdown (10%), net supplier payables, and settlement status.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-700 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>🔄</span> Refresh Financial Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-medium text-slate-400">Total Gross Booking Volume</div>
          <div className="text-2xl font-bold text-white mt-2">
            ₹{metrics.totalGrossValueInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Gross paid revenue</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-medium text-slate-400">Platform Commission (10%)</div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            ₹{metrics.totalCommissionDeductedInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">BharatYatra marketplace fee</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-medium text-slate-400">Net Supplier Payable</div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            ₹{metrics.totalNetPayableInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Net earnings owed to vendor</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-medium text-slate-400">Pending Settlements</div>
          <div className="text-2xl font-bold text-teal-300 mt-2">
            {metrics.pendingSettlementsCount}
          </div>
          <div className="text-[11px] text-teal-500/80 mt-1">Awaiting batch processing</div>
        </div>
      </div>

      {/* Transactions Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📋</span> Revenue & Commission Snapshot Ledger
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading financial records...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
            No booking transactions recorded for your inventory yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5 text-right">Gross (₹)</th>
                  <th className="p-3.5 text-right">Comm Rate</th>
                  <th className="p-3.5 text-right">Platform Fee (₹)</th>
                  <th className="p-3.5 text-right font-bold text-emerald-400">Net Payable (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.map((tx) => (
                  <tr key={tx.bookingId} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-teal-300 font-semibold">{tx.bookingReference}</td>
                    <td className="p-3.5 font-medium text-slate-200">{tx.customerName}</td>
                    <td className="p-3.5 uppercase text-xs text-slate-400 font-mono">{tx.bookingType}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          tx.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-medium">₹{tx.grossAmountInr.toFixed(2)}</td>
                    <td className="p-3.5 text-right text-slate-400">{tx.commissionRate}%</td>
                    <td className="p-3.5 text-right text-amber-400">₹{tx.commissionAmountInr.toFixed(2)}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">₹{tx.supplierPayableInr.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settlements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🏛️</span> Settlement Batches
        </h2>

        {settlements.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No settlement batches generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3 text-right">Gross (₹)</th>
                  <th className="p-3 text-right">Commission (₹)</th>
                  <th className="p-3 text-right text-emerald-400 font-bold">Net Payout (₹)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-teal-300 text-xs">{s.settlementReference || s.id}</td>
                    <td className="p-3 text-right">₹{Number(s.grossAmountInr).toFixed(2)}</td>
                    <td className="p-3 text-right text-amber-400">₹{Number(s.commissionAmountInr).toFixed(2)}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">₹{Number(s.payableAmountInr).toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          s.status === 'SETTLED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : s.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

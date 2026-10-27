'use client';

import React, { useState, useEffect } from 'react';
import {
  Percent,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  ShieldCheck,
  Download,
  AlertCircle,
} from 'lucide-react';
import { TravelCommissionLedgerEntry } from '@/types/travel-partner';

export default function PartnerCommissionsPage() {
  const [ledger, setLedger] = useState<TravelCommissionLedgerEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
    const headers: HeadersInit = agencyId ? { 'x-agency-id': agencyId } : {};
    fetch('/api/v1/partner/commissions', { headers })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setLedger(json.data || []);
          setSummary(json.summary || null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Commissions & Financial Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Auditable, deterministic accounting of marketplace bookings, commission deductions, and payouts.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Total Accrued Earnings
            </span>
            <div className="text-2xl font-black text-white">
              ₹{summary.totalEarnings.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">Across {summary.totalEntries} completed transactions</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending Settlements
            </span>
            <div className="text-2xl font-black text-amber-400">
              ₹{summary.pendingPayout.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">Scheduled for bi-weekly payout batch</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled & Paid Out
            </span>
            <div className="text-2xl font-black text-emerald-400">
              ₹{summary.settledPayout.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">Transferred to registered bank account</p>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FED65B]" /> Contractual Ledger Entries
          </h3>
          <span className="text-xs text-slate-400 font-medium">Standard Marketplace Rate: 10%</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading ledger data...</div>
        ) : ledger.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500">No ledger entries recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Package</th>
                  <th className="p-4 text-right">Gross Value</th>
                  <th className="p-4 text-right">Commission (10%)</th>
                  <th className="p-4 text-right">Net Payout</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Settlement Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-200">{entry.bookingId}</td>
                    <td className="p-4 text-white font-medium max-w-xs truncate">{entry.packageTitle || 'Tour Package'}</td>
                    <td className="p-4 text-right font-semibold text-slate-300">
                      ₹{entry.bookingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right font-semibold text-amber-400">
                      -₹{entry.commissionAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right font-black text-emerald-400">
                      ₹{entry.netPayoutAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          entry.status === 'SETTLED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {entry.settlementReference || '—'}
                    </td>
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

'use client';

import React, { useState, useEffect } from 'react';
import {
  Percent,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { TravelCommissionLedgerEntry } from '@/types/travel-partner';

export default function AdminTravelCommissionsPage() {
  const [ledger, setLedger] = useState<TravelCommissionLedgerEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<TravelCommissionLedgerEntry | null>(null);
  const [settlementRef, setSettlementRef] = useState('');
  const [settling, setSettling] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/travel-commissions');
      const json = await res.json();
      if (json.success) {
        setLedger(json.data || []);
        if (json.summary) setSummary(json.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    setSettling(true);
    try {
      const res = await fetch('/api/v1/admin/travel-commissions/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ledgerId: selectedEntry.id,
          settlementRef: settlementRef || `STMT-${Date.now()}`,
          adminId: 'admin-operations-finance1',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message);
        setSelectedEntry(null);
        setSettlementRef('');
        fetchLedger();
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert(err.message || 'Settlement failed.');
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Partner Commissions & Settlements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Contractual revenue share tracking, marketplace fee accruals, and supplier payout execution.
          </p>
        </div>

        <button
          onClick={fetchLedger}
          className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Ledger
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Gross Marketplace Bookings
            </span>
            <div className="text-2xl font-black text-slate-900">
              ₹{summary.totalGross.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">Total volume processed</p>
          </div>

          <div className="p-5 bg-white border border-amber-200 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
              BharatYatra Commissions
            </span>
            <div className="text-2xl font-black text-amber-600">
              ₹{summary.totalCommissions.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">Contractual revenue retained</p>
          </div>

          <div className="p-5 bg-white border border-blue-200 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
              Pending Partner Payouts
            </span>
            <div className="text-2xl font-black text-blue-600">
              ₹{summary.pendingPayouts.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">Scheduled for settlement</p>
          </div>

          <div className="p-5 bg-white border border-emerald-200 rounded-2xl space-y-1 shadow-sm">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              Settled Supplier Payouts
            </span>
            <div className="text-2xl font-black text-emerald-600">
              ₹{summary.settledPayouts.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">Reconciled and transferred</p>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" /> Platform Financial Ledger
          </h3>
          <span className="text-xs text-slate-500">Immutable Ledger Entries ({ledger.length})</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading platform financial ledger...</div>
        ) : ledger.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Package</th>
                  <th className="p-4 text-right">Gross Booking</th>
                  <th className="p-4 text-right">Commission Rate</th>
                  <th className="p-4 text-right">BharatYatra Cut</th>
                  <th className="p-4 text-right">Net Partner Payout</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{entry.bookingId}</td>
                    <td className="p-4 text-slate-700 font-medium max-w-xs truncate">{entry.packageTitle || 'Tour Package'}</td>
                    <td className="p-4 text-right font-semibold text-slate-800">
                      ₹{entry.bookingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-600">{entry.commissionRate}%</td>
                    <td className="p-4 text-right font-bold text-amber-600">
                      ₹{entry.commissionAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right font-black text-emerald-600">
                      ₹{entry.netPayoutAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          entry.status === 'SETTLED'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {entry.status === 'PENDING_SETTLEMENT' ? (
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          Settle Payout
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {entry.settlementReference}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settle Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Authorize Partner Payout Settlement</h3>
            <p className="text-xs text-slate-500">
              Booking <strong className="text-slate-800">{selectedEntry.bookingId}</strong> • Net payable:{' '}
              <strong className="text-emerald-600 font-bold">₹{selectedEntry.netPayoutAmount.toLocaleString('en-IN')}</strong>
            </p>

            <form onSubmit={handleSettle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Settlement Banking Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  placeholder={`UTR-${Date.now()}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settling}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {settling ? 'Settling...' : 'Confirm Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

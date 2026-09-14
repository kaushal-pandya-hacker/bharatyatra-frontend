'use client';

import React, { useState, useEffect } from 'react';

interface SettlementRecord {
  id: string;
  supplierId: string;
  bookingId: string;
  grossAmountInr: number;
  commissionAmountInr: number;
  payableAmountInr: number;
  status: string;
  settlementReference?: string;
  failureReason?: string;
  createdAt: string;
  supplier: {
    businessName: string;
    email: string;
  };
}

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Action Modal State
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementRecord | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('SETTLED');
  const [referenceInput, setReferenceInput] = useState<string>('');
  const [reasonInput, setReasonInput] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSettlements();
  }, [statusFilter]);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Admin authentication token missing.');
        setLoading(false);
        return;
      }

      const res = await fetch(`http://localhost:5000/api/v1/admin/settlements?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSettlements(json.data.items || []);
      } else {
        setError(json.message || 'Failed to fetch settlements.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSettlement) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:5000/api/v1/admin/settlements/${selectedSettlement.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: targetStatus,
          settlementReference: referenceInput || `STL-REF-${Date.now()}`,
          reason: reasonInput || 'Admin manual settlement update',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedSettlement(null);
        setReferenceInput('');
        setReasonInput('');
        fetchSettlements();
      } else {
        alert(json.message || 'Failed to update settlement status.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error updating settlement.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <span>🏛️</span> Supplier Settlements Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage payout cycles, mark vendor payables as SETTLED, flag ON_HOLD items, and audit financial transfers.
          </p>
        </div>
        <button
          onClick={fetchSettlements}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm"
        >
          <span>🔄</span> Refresh Settlements
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-medium">
        <span className="text-slate-500 mr-2 font-semibold">Status Filter:</span>
        {['ALL', 'PENDING', 'PROCESSING', 'SETTLED', 'ON_HOLD', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              statusFilter === st
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Settlements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading supplier settlements...</div>
        ) : settlements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
            No settlement records found for status filter "{statusFilter}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Supplier Business</th>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5 text-right">Gross (₹)</th>
                  <th className="p-3.5 text-right text-amber-700">Commission (₹)</th>
                  <th className="p-3.5 text-right text-emerald-700 font-bold">Payable (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900">
                      {s.supplier?.businessName || 'Supplier'}
                      <div className="text-[11px] font-normal text-slate-400">{s.supplier?.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-amber-800">{s.settlementReference || s.id}</td>
                    <td className="p-3.5 text-right font-medium">₹{Number(s.grossAmountInr).toFixed(2)}</td>
                    <td className="p-3.5 text-right text-amber-700 font-medium">₹{Number(s.commissionAmountInr).toFixed(2)}</td>
                    <td className="p-3.5 text-right text-emerald-700 font-bold">₹{Number(s.payableAmountInr).toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          s.status === 'SETTLED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : s.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedSettlement(s);
                          setTargetStatus(s.status === 'SETTLED' ? 'ON_HOLD' : 'SETTLED');
                          setReferenceInput(s.settlementReference || `STL-REF-${Date.now()}`);
                        }}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Manage Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🏛️</span> Manage Settlement Status
            </h3>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600">
              <div><span className="font-semibold text-slate-800">Supplier:</span> {selectedSettlement.supplier?.businessName}</div>
              <div><span className="font-semibold text-slate-800">Net Payable:</span> ₹{Number(selectedSettlement.payableAmountInr).toFixed(2)}</div>
              <div><span className="font-semibold text-slate-800">Current Status:</span> {selectedSettlement.status}</div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Settlement Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                >
                  <option value="SETTLED">SETTLED (Payment Disbursed)</option>
                  <option value="PROCESSING">PROCESSING (Batch Transfer Initiated)</option>
                  <option value="ON_HOLD">ON_HOLD (Under Operational Hold)</option>
                  <option value="FAILED">FAILED (Transfer Error)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Settlement Reference / Bank UTR</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-2026-98765432"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Reason / Note</label>
                <textarea
                  placeholder="State reason for status update..."
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSettlement(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition"
                >
                  {updating ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

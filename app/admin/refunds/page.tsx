'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  X,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

export interface AdminRefundRecord {
  id: string;
  refundReference: string;
  transactionId: string;
  bookingId: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  reason: string;
  eligibilityVerified: boolean;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  gatewayReference?: string;
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<AdminRefundRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRefund, setSelectedRefund] = useState<AdminRefundRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, [filterStatus]);

  const fetchRefunds = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      let url = '/api/v1/admin/refunds?';
      if (filterStatus !== 'ALL') url += `status=${filterStatus}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          setRefunds(json.data);
        } else {
          setRefunds([]);
        }
      } else {
        setRefunds([]);
      }
    } catch (e: any) {
      console.error('Failed to load refunds:', e);
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (refundId: string, action: 'APPROVE' | 'REJECT', notes = '') => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/refunds/${refundId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, notes: notes || `Admin ${action.toLowerCase()}ed refund request` }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: data.message || `Refund ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`,
        });
        fetchRefunds();
        if (selectedRefund && selectedRefund.id === refundId) {
          setSelectedRefund(data.data);
        }
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to process refund.' });
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Error processing refund.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRefunds = refunds.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.refundReference || '').toLowerCase().includes(q) ||
      (r.bookingReference || '').toLowerCase().includes(q) ||
      (r.customerName || '').toLowerCase().includes(q) ||
      (r.customerEmail || '').toLowerCase().includes(q) ||
      (r.reason || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Financial Operations</span>
            <span>•</span>
            <span>BharatGateway™ Dispute &amp; Settlement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Refunds &amp; Cancellation Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit cancellation claims, verify gatekeeper eligibility, and dispatch automated or manual refunds.
          </p>
        </div>

        <button
          onClick={fetchRefunds}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Queue
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Refunds' },
            { id: 'REQUESTED', label: 'Requested' },
            { id: 'PROCESSING', label: 'Processing' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filterStatus === st.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search ref, customer, booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
            <span>Loading refund records from gateway ledger...</span>
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="p-12 text-center bg-white">
            <RotateCcw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No refund requests found.</div>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Real customer refund and cancellation transactions will appear here automatically when processed through BharatGateway™.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Refund &amp; Booking Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Refund Amount</th>
                  <th className="p-4">Reason / Notes</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRefunds.map((r) => (
                  <tr key={r.id || r.refundReference} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900">{r.refundReference}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Booking: {r.bookingReference}</div>
                      <div className="text-[10px] text-slate-400">
                        {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : 'Recent'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{r.customerName}</div>
                      <div className="text-[11px] text-slate-500">{r.customerEmail}</div>
                    </td>
                    <td className="p-4 font-black text-slate-900 text-sm">
                      ₹{Number(r.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-slate-700 text-xs line-clamp-1">{r.reason || 'Customer cancellation'}</p>
                      {r.eligibilityVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                          ✓ Eligibility Verified
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {r.status === 'COMPLETED' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> COMPLETED
                        </span>
                      )}
                      {r.status === 'APPROVED' && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-blue-600" /> APPROVED
                        </span>
                      )}
                      {r.status === 'PROCESSING' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> PROCESSING
                        </span>
                      )}
                      {r.status === 'REQUESTED' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> REQUESTED
                        </span>
                      )}
                      {r.status === 'REJECTED' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" /> REJECTED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {(r.status === 'REQUESTED' || r.status === 'PROCESSING') && (
                        <>
                          <button
                            onClick={() => handleAction(r.id, 'APPROVE')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(r.id, 'REJECT')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1 border border-rose-200 disabled:opacity-50"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedRefund(r)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal - Clean White Theme */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">Refund Audit &amp; Settlement</h3>
                <span className="text-xs font-mono text-slate-500">{selectedRefund.refundReference}</span>
              </div>
              <button
                onClick={() => setSelectedRefund(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-900">
                  {selectedRefund.customerName} ({selectedRefund.customerEmail})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Booking Reference:</span>
                <span className="font-mono font-bold text-slate-900">{selectedRefund.bookingReference}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Transaction ID:</span>
                <span className="font-mono text-slate-700">{selectedRefund.transactionId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Refund Amount:</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{Number(selectedRefund.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Reason for Cancellation:</span>
                <span className="font-medium text-slate-800 max-w-[260px] text-right">{selectedRefund.reason}</span>
              </div>
              {selectedRefund.gatewayReference && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Gateway ARN Reference:</span>
                  <span className="font-mono text-emerald-700 font-bold">{selectedRefund.gatewayReference}</span>
                </div>
              )}
              {selectedRefund.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs mt-2 border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-0.5">Audit Desk Notes:</span>
                  {selectedRefund.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {(selectedRefund.status === 'REQUESTED' || selectedRefund.status === 'PROCESSING') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(selectedRefund.id, 'APPROVE')}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    Approve Refund
                  </button>
                  <button
                    onClick={() => handleAction(selectedRefund.id, 'REJECT')}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition cursor-pointer border border-rose-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
              <button
                onClick={() => setSelectedRefund(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

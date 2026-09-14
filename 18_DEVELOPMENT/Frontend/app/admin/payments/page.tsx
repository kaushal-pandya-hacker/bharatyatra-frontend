'use client';

import React, { useState, useEffect } from 'react';

interface FinanceSummary {
  totalPaidBookings: number;
  failedPaymentsCount: number;
  grossBookingValueInr: number;
  platformCommissionInr: number;
  netSupplierPayableInr: number;
  totalRefundsInr: number;
  pendingSettlementsInr: number;
  settlementsCount: number;
}

interface PaymentRecord {
  id: string;
  gatewayOrderId: string;
  gatewayTransactionId?: string;
  amountInr: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  booking: {
    id: string;
    bookingReference: string;
    bookingType: string;
    user: { fullName: string; email: string };
  };
}

export default function AdminPaymentsPage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchRef, setSearchRef] = useState<string>('');

  useEffect(() => {
    fetchFinancialData();
  }, [statusFilter]);

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Admin authentication token missing.');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [sumRes, payRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/admin/finance/summary', { headers }),
        fetch(`http://localhost:5000/api/v1/admin/payments?status=${statusFilter}&bookingReference=${encodeURIComponent(searchRef)}`, { headers }),
      ]);

      const sumJson = await sumRes.json();
      const payJson = await payRes.json();

      if (sumRes.ok && sumJson.success) setSummary(sumJson.data);
      if (payRes.ok && payJson.success) setPayments(payJson.data.items || []);

      if (!sumRes.ok || !payRes.ok) {
        setError(sumJson.message || payJson.message || 'Error fetching financial data.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFinancialData();
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <span>💳</span> Admin Financial Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real DB database metrics: Gross booking volume, platform commission, net supplier payables, and transactions directory.
          </p>
        </div>
        <button
          onClick={fetchFinancialData}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <span>🔄</span> Refresh Financial Data
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Booking Volume</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              ₹{summary.grossBookingValueInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{summary.totalPaidBookings} paid reservations</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Platform Revenue (10%)</div>
            <div className="text-2xl font-bold text-amber-600 mt-2">
              ₹{summary.platformCommissionInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Chalo Farva marketplace fee</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Net Supplier Payable</div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">
              ₹{summary.netSupplierPayableInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Net owed to vendors</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Pending Settlements</div>
            <div className="text-2xl font-bold text-teal-600 mt-2">
              ₹{summary.pendingSettlementsInr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{summary.settlementsCount} batches</div>
          </div>
        </div>
      )}

      {/* Payments Directory */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>📑</span> Payment Transactions Directory
          </h2>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by Booking Ref (e.g. CF-2026)..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-medium">
          <span className="text-slate-400 mr-2">Filter Status:</span>
          {['ALL', 'PAID', 'CREATED', 'FAILED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading transactions...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
            No payment transactions match your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Gateway Order ID</th>
                  <th className="p-3">Booking Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-xs text-slate-900 font-semibold">{p.gatewayOrderId}</td>
                    <td className="p-3 font-mono text-amber-700 font-bold">{p.booking?.bookingReference || 'N/A'}</td>
                    <td className="p-3 font-medium text-slate-900">{p.booking?.user?.fullName || 'Guest'}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{Number(p.amountInr).toFixed(2)}</td>
                    <td className="p-3 text-xs text-slate-500">{p.paymentMethod}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
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

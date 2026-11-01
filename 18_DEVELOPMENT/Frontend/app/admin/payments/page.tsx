'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api/client';
import {
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
} from 'lucide-react';

interface FinanceSummary {
  totalPaidBookings: number;
  successfulPaymentsCount?: number;
  failedPaymentsCount: number;
  refundedPaymentsCount?: number;
  grossBookingValueInr: number;
  gbvInr?: number;
  platformCommissionInr: number;
  netSupplierPayableInr: number;
  totalRefundsInr: number;
  pendingSettlementsInr: number;
  netPlatformRevenueInr?: number;
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
  booking?: {
    id: string;
    bookingReference: string;
    bookingType: string;
    user: { fullName: string; email: string };
  };
  bookingReference?: string;
  customerName?: string;
  customerEmail?: string;
}

export default function AdminPaymentsPage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [errorType, setErrorType] = useState<'401' | '403' | '404' | '500' | 'network' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchRef, setSearchRef] = useState<string>('');
  const [submittedSearch, setSubmittedSearch] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setSummaryLoading(true);
    setErrorType(null);
    setErrorMessage(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!token) {
      setErrorType('401');
      setErrorMessage('Admin authentication token is missing. Please sign in to access the financial ledger.');
      setLoading(false);
      setSummaryLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch Summary
    try {
      const sumJson = await apiFetch<any>('/admin/finance/summary', { headers });
      if (sumJson?.success && sumJson?.data) {
        setSummary(sumJson.data);
      } else {
        setSummary(null);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.isUnauthorized) setErrorType('401');
        else if (err.isForbidden) setErrorType('403');
        else if (err.isNotFound) setErrorType('404');
        else if (err.isServerError) setErrorType('500');
        else setErrorType('network');
        setErrorMessage(err.message || 'Error fetching financial summary.');
      } else {
        setErrorType('network');
        setErrorMessage(err?.message || 'Failed to connect to financial summary service.');
      }
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }

    // 2. Fetch Payments Directory
    try {
      let url = `/admin/payments?page=${currentPage}&limit=20`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      if (submittedSearch.trim()) url += `&bookingReference=${encodeURIComponent(submittedSearch.trim())}`;

      const payJson = await apiFetch<any>(url, { headers });
      if (payJson?.success) {
        const items = Array.isArray(payJson.data?.items)
          ? payJson.data.items
          : Array.isArray(payJson.data)
          ? payJson.data
          : Array.isArray(payJson.items)
          ? payJson.items
          : [];
        setPayments(items);
        setTotalPages(payJson.data?.totalPages || 1);
        setTotalCount(payJson.data?.total || payJson.count || items.length);
      } else {
        setPayments([]);
        if (!errorMessage) {
          setErrorMessage(payJson?.message || 'Error fetching payment directory.');
        }
      }
    } catch (err: any) {
      if (!errorType) {
        if (err instanceof ApiError) {
          if (err.isUnauthorized) setErrorType('401');
          else if (err.isForbidden) setErrorType('403');
          else if (err.isNotFound) setErrorType('404');
          else if (err.isServerError) setErrorType('500');
          else setErrorType('network');
          setErrorMessage(err.message || 'Error fetching payments directory.');
        } else {
          setErrorType('network');
          setErrorMessage(err?.message || 'Failed to connect to payments directory service.');
        }
      }
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, submittedSearch, currentPage]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSubmittedSearch(searchRef);
  };

  const handleFilterChange = (st: string) => {
    setStatusFilter(st);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Financial Operations</span>
            <span>•</span>
            <span>BharatGateway™ Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-amber-500" />
            <span>Financial Operations Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real database metrics: Gross booking volume, verified platform commissions, supplier payables, and transactions directory.
          </p>
        </div>

        <button
          onClick={() => fetchFinancialData()}
          disabled={loading || summaryLoading}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || summaryLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Financial Data</span>
        </button>
      </div>

      {/* Specific Error Banner with Retry */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                {errorType === '401' && 'Authentication Required (401)'}
                {errorType === '403' && 'Access Forbidden (403)'}
                {errorType === '404' && 'Endpoint Unavailable (404)'}
                {errorType === '500' && 'Internal Server Error (500)'}
                {errorType === 'network' && 'Connection / Network Failure'}
                {!errorType && 'Financial Service Alert'}
              </div>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {errorType === '401' ? (
              <Link
                href="/admin/login"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={() => fetchFinancialData()}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry Request
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Financial Metric Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-pulse">
              <div className="h-3 w-28 bg-slate-100 rounded mb-3"></div>
              <div className="h-7 w-36 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-20 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="space-y-4">
          {/* Main 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Booking Volume</span>
                <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                  GBV
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                ₹{Number(summary.grossBookingValueInr || summary.gbvInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>{summary.totalPaidBookings || summary.successfulPaymentsCount || 0} verified paid reservations</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Commission</span>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                  10% Fee
                </span>
              </div>
              <div className="text-2xl font-black text-blue-700 mt-2">
                ₹{Number(summary.platformCommissionInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">
                Net Platform Revenue: ₹{Number(summary.netPlatformRevenueInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier Payable Amount</span>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                  90% Payout
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                ₹{Number(summary.netSupplierPayableInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Net owed to verified travel suppliers</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Settlements</span>
                <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md border border-teal-200">
                  Escrow
                </span>
              </div>
              <div className="text-2xl font-black text-teal-700 mt-2">
                ₹{Number(summary.pendingSettlementsInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">{summary.settlementsCount || 0} batches awaiting dispatch</div>
            </div>
          </div>

          {/* Secondary Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
            <div className="px-3 py-1.5 border-r border-slate-100 last:border-0">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Successful Payments</span>
              <span className="font-bold text-slate-900 text-sm">{summary.totalPaidBookings || summary.successfulPaymentsCount || 0}</span>
            </div>
            <div className="px-3 py-1.5 border-r border-slate-100 last:border-0">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Failed Payments</span>
              <span className="font-bold text-rose-600 text-sm">{summary.failedPaymentsCount || 0}</span>
            </div>
            <div className="px-3 py-1.5 border-r border-slate-100 last:border-0">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Refunded Value</span>
              <span className="font-bold text-slate-900 text-sm">₹{Number(summary.totalRefundsInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="px-3 py-1.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Net Platform Revenue</span>
              <span className="font-bold text-emerald-700 text-sm">₹{Number(summary.netPlatformRevenueInr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Payment Transactions Directory */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Payment Transactions Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing genuine database records ({totalCount} total transactions in ledger)
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search booking ref, order ID, customer..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            >
              Search
            </button>
            {submittedSearch && (
              <button
                type="button"
                onClick={() => {
                  setSearchRef('');
                  setSubmittedSearch('');
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1 shrink-0">Filter Status:</span>
          {['ALL', 'PAID', 'CREATED', 'FAILED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => handleFilterChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
            <span>Loading payment records from BharatGateway™ database ledger...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No Payment Transactions Found</div>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {submittedSearch || statusFilter !== 'ALL'
                ? 'No records match the selected status filter or search parameters.'
                : 'Real customer payment transactions will appear here automatically when processed through BharatGateway™.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Gateway Order ID</th>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => {
                  const bRef = p.booking?.bookingReference || p.bookingReference || 'N/A';
                  const cName = p.booking?.user?.fullName || p.customerName || 'Registered Customer';
                  const cEmail = p.booking?.user?.email || p.customerEmail || '';
                  const amt = Number(p.amountInr || (p as any).amount || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {p.gatewayOrderId || p.id}
                      </td>
                      <td className="p-3.5 font-mono text-amber-700 font-bold">
                        {bRef}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{cName}</div>
                        {cEmail && <div className="text-[11px] text-slate-400">{cEmail}</div>}
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-900 font-mono">
                        ₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                          {p.paymentMethod || (p as any).method || 'UPI'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID' || p.status === 'SUCCESSFUL'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'FAILED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : p.status === 'REFUNDED'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status === 'PAID' || p.status === 'SUCCESSFUL' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : p.status === 'FAILED' ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(p.createdAt || (p as any).transactionDate).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
            <div>
              Showing page {currentPage} of {totalPages} ({totalCount} items)
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

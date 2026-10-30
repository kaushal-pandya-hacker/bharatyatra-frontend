'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  FileText,
  Search,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { SupplierHealthReport, TripBookingRecord } from '@/lib/booking/unified-booking-orchestrator';

interface AdminDashboardData {
  stats: {
    totalTripBookings: number;
    confirmedBookings: number;
    partiallyConfirmedBookings: number;
    cancelledBookings: number;
    flaggedDiscrepanciesCount: number;
    activeSuppliersCount: number;
    gatewayOrdersCount: number;
    totalRefundsProcessedCount: number;
  };
  supplierHealth: SupplierHealthReport[];
  flaggedExceptions: TripBookingRecord[];
  recentBookings: TripBookingRecord[];
  recentWebhooks: any[];
}

export function BookingOperationsDashboard({ className = '' }: { className?: string }) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'health' | 'reconciliation' | 'webhooks'>('health');
  const [selectedBooking, setSelectedBooking] = useState<TripBookingRecord | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/booking/admin/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleManualRetry = async (tripBookingId: string, componentId: string) => {
    setIsRetrying(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/v1/booking/admin/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MANUAL_RETRY_SUPPLIER',
          tripBookingId,
          componentId,
          note: 'Operator manual retry override after supplier resolution',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        fetchDashboardData();
      } else {
        setActionMessage(json.error || 'Retry failed.');
      }
    } catch {
      setActionMessage('Network error during manual retry.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="font-medium text-slate-700">Loading operations dashboard & supplier health...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Operations Engine Online
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
            Booking Intelligence & Supplier Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring across 7 supplier adapters, BharatGateway reconciliation & webhook logs.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Total Bookings</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {data.stats.totalTripBookings}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {data.stats.confirmedBookings} Confirmed
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Flagged Discrepancies</span>
          <div className={`text-2xl font-black mt-1 ${data.stats.flaggedDiscrepanciesCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {data.stats.flaggedDiscrepanciesCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Needs review or retry</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Active Suppliers</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {data.stats.activeSuppliersCount} / 7
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Operational</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400">Gateway Orders</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {data.stats.gatewayOrdersCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {data.stats.totalRefundsProcessedCount} Refunds Processed
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'health'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Supplier Adapter Health ({data.supplierHealth.length})
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'reconciliation'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Reconciliation Queue
          {data.stats.flaggedDiscrepanciesCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
              {data.stats.flaggedDiscrepanciesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'webhooks'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Gateway Webhooks Audit ({data.recentWebhooks.length})
        </button>
      </div>

      {/* TAB 1: Supplier Adapter Health */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.supplierHealth.map((sup) => (
            <div
              key={sup.providerId}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {sup.category}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      sup.status === 'LIVE_VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {sup.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2.5">{sup.providerName}</h4>
                <p className="text-xs text-slate-500 mt-1">{sup.details}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Latency</span>
                  <div className="font-bold text-slate-800">{sup.avgLatencyMs} ms</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Success</span>
                  <div className="font-bold text-emerald-600">{sup.successRatePct}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Reconciliation Queue */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Payment-to-Supplier Reconciliation Audit
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Audits discrepancies where BharatGateway payment captured but one or more constituent components require operator review.
          </p>

          {data.flaggedExceptions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Zero Discrepancies Detected</p>
              <p className="text-xs text-slate-400">All captured transactions match verified supplier vouchers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.flaggedExceptions.map((trip) => (
                <div
                  key={trip.tripBookingId}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {trip.tripBookingId}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {trip.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Order Ref: {trip.paymentOrderId} • User: {trip.userId}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        ₹{trip.totalVerifiedPrice}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Payment: {trip.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Components breakdown */}
                  <div className="divide-y divide-amber-200/60 bg-white rounded-lg p-3 border border-amber-200/60">
                    {trip.components.map((c) => (
                      <div key={c.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{c.title}</span>
                          <span className="ml-2 text-slate-400">({c.componentType})</span>
                          {c.errorMessage && (
                            <p className="text-[11px] text-rose-600 mt-0.5">{c.errorMessage}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono">{c.status}</span>
                          {c.status !== 'CONFIRMED' && (
                            <button
                              onClick={() => handleManualRetry(trip.tripBookingId, c.id)}
                              disabled={isRetrying}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition disabled:opacity-50"
                            >
                              Retry Supplier
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Gateway Webhooks Audit */}
      {activeTab === 'webhooks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            BharatGateway™ Webhook Delivery Stream
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Immutable log of inbound webhook signatures, idempotency events, and payload states.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Delivery ID</th>
                  <th className="pb-3">Event Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Signature Header</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentWebhooks.map((w) => (
                  <tr key={w.deliveryId} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-mono text-slate-800">{w.deliveryId}</td>
                    <td className="py-3 font-bold text-slate-900">{w.eventType}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-400 truncate max-w-xs">
                      {w.signatureHeader}
                    </td>
                    <td className="py-3 text-slate-500">
                      {w.deliveredAt ? new Date(w.deliveredAt).toLocaleTimeString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

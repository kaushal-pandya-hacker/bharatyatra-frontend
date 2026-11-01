'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookingModal, setActiveBookingModal] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus, selectedType]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      let url = '/api/v1/admin/bookings?';
      if (selectedStatus !== 'ALL') url += `status=${selectedStatus}&`;
      if (selectedType !== 'ALL') url += `type=${selectedType}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setBookings(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to load admin bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAndRefund = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking and initiate an automated refund?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'CANCEL_AND_REFUND',
          reason: 'Admin operational intervention & cancellation workflow',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('Booking cancelled and refund initiated via BharatGateway™.');
        fetchBookings();
        if (activeBookingModal && activeBookingModal.id === bookingId) {
          setActiveBookingModal(data.data.booking);
        }
      } else {
        alert(data.message || 'Failed to cancel booking.');
      }
    } catch (e: any) {
      alert(e.message || 'Error processing cancellation.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.bookingReference || '').toLowerCase().includes(q) ||
      (b.customerName || '').toLowerCase().includes(q) ||
      (b.customerEmail || '').toLowerCase().includes(q) ||
      (b.destination || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Operations &amp; Fulfillment</span>
            <span>•</span>
            <span>Unified Booking Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Bookings Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time management for Stays, Bus, Train, Flight, Tour Packages &amp; Sightseeing Activities.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                selectedStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="HOTEL">Hotels &amp; Stays</option>
            <option value="BUS">Bus Fleet</option>
            <option value="PACKAGE">Tour Packages</option>
            <option value="ACTIVITY">Activities &amp; Safaris</option>
            <option value="TRAIN">Train Bookings</option>
            <option value="FLIGHT">Flight Bookings</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search reference, customer, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">
            Loading bookings directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">
            No bookings found matching selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Reference &amp; Customer</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Supplier / Route</th>
                  <th className="p-4">Travel Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((b) => (
                  <tr key={b.id || b.bookingReference} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900">{b.bookingReference}</div>
                      <div className="text-slate-800 font-semibold">{b.customerName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-400">{b.customerEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {b.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{b.supplierName || 'Verified Supplier'}</div>
                      <div className="text-[11px] text-slate-500">{b.destination}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {b.travelDate || 'N/A'}
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      ₹{Number(b.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      {b.status === 'CONFIRMED' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> CONFIRMED
                        </span>
                      )}
                      {b.status === 'PENDING' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-amber-600" /> PENDING
                        </span>
                      )}
                      {b.status === 'CANCELLED' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200 flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> CANCELLED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setActiveBookingModal(b)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details & Timeline Modal */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  Booking Dossier &amp; Fulfillment
                </span>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  {activeBookingModal.bookingReference}
                </h3>
              </div>
              <button
                onClick={() => setActiveBookingModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <div className="text-slate-400 font-bold text-[10px] uppercase">Customer</div>
                <div className="font-bold text-slate-900 mt-0.5">{activeBookingModal.customerName}</div>
                <div className="text-slate-500 text-[11px]">{activeBookingModal.customerEmail}</div>
              </div>
              <div>
                <div className="text-slate-400 font-bold text-[10px] uppercase">Category &amp; Supplier</div>
                <div className="font-bold text-slate-900 mt-0.5">{activeBookingModal.type}</div>
                <div className="text-slate-500 text-[11px]">{activeBookingModal.supplierName}</div>
              </div>
              <div>
                <div className="text-slate-400 font-bold text-[10px] uppercase">Total Booked Amount</div>
                <div className="font-black text-slate-900 text-sm mt-0.5">
                  ₹{Number(activeBookingModal.amount).toLocaleString('en-IN')}
                </div>
                <div className="text-emerald-600 font-bold text-[10px]">Paid via Gateway</div>
              </div>
            </div>

            {/* Confirmation & Refund Reference */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-amber-900">Supplier Confirmation Reference:</div>
              <div className="font-mono text-amber-800 font-bold">{activeBookingModal.confirmationReference || 'CONF-PENDING'}</div>
            </div>

            {/* Event Timeline */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Booking Event Timeline
              </div>
              <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                {(activeBookingModal.timeline || []).map((ev: any, idx: number) => (
                  <div key={idx} className="relative text-xs space-y-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute -left-[21px] top-1 border-2 border-white" />
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{ev.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-slate-600">{ev.description}</div>
                    <div className="text-[10px] text-slate-400">Actor: {ev.actor}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {activeBookingModal.status !== 'CANCELLED' ? (
                <button
                  onClick={() => handleCancelAndRefund(activeBookingModal.id)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{actionLoading ? 'Processing...' : 'Cancel Booking & Refund'}</span>
                </button>
              ) : (
                <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Booking Cancelled
                </span>
              )}

              <button
                onClick={() => setActiveBookingModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

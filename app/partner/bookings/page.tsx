'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  IndianRupee,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function PartnerBookingsPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
    const headers: HeadersInit = agencyId ? { 'x-agency-id': agencyId } : {};
    fetch('/api/v1/partner/commissions', { headers })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setLedger(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Bookings & Fulfilment Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track customer booking requests, manage upcoming departures, and reconcile completed trips.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-2 border-[#FED65B] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-slate-400 font-semibold">Loading booking requests...</div>
        </div>
      ) : ledger.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Bookings Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When travellers request or book your published packages, their reservations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ledger.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#FED65B] bg-[#FED65B]/10 px-2.5 py-0.5 rounded-lg border border-[#FED65B]/20">
                      {entry.bookingId}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      CONFIRMED RESERVATION
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{entry.packageTitle || 'Tour Package'}</h3>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-base font-black text-white">
                    ₹{entry.bookingAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Net Partner Payout: <strong className="text-emerald-400">₹{entry.netPayoutAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div>Recorded on {new Date(entry.createdAt).toLocaleDateString()}</div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-[11px]">{entry.idempotencyKey}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

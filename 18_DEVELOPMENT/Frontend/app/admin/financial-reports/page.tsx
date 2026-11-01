'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  RotateCcw,
  Landmark,
  BadgePercent,
  CreditCard,
  Calendar,
} from 'lucide-react';

export default function AdminFinancialReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/financial-reports', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setReport(json);
      }
    } catch (e) {
      console.error('Failed to load financial reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/v1/admin/financial-reports?format=csv', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BharatYatra_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(e.message || 'Error downloading CSV.');
    } finally {
      setDownloading(false);
    }
  };

  const summary = report?.summary || {
    totalCapturedInr: 0,
    totalRefundedInr: 0,
    netRevenueInr: 0,
    totalSettledInr: 0,
    totalCommissionsEarnedInr: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Accounting &amp; Auditing</span>
            <span>•</span>
            <span>Immutable Ledger Summaries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Financial Analytics &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit gross booked volume, gateway charges, customer refunds, supplier settlement batches, and platform commissions.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          disabled={downloading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Exporting...' : 'Export Financial CSV'}</span>
        </button>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Captured */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Gross Captured</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{summary.totalCapturedInr?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">BharatGateway™ Verified</div>
        </div>

        {/* Total Refunded */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Total Refunded</span>
            <RotateCcw className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            ₹{summary.totalRefundedInr?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">Dispatched via Source Bank ARN</div>
        </div>

        {/* Net Retained */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Net Retained GMV</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{summary.netRevenueInr?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">Gross Captured Less Refunds</div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Platform Commissions</span>
            <BadgePercent className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">
            ₹{summary.totalCommissionsEarnedInr?.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400">Net Platform Take-Rate</div>
        </div>
      </div>

      {/* Ledger Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-600" />
              <span>Supplier Settlements Summary</span>
            </h2>
            <span className="text-xs font-bold text-emerald-600">₹{summary.totalSettledInr?.toLocaleString()} Settled</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All supplier settlements are reconciled via automated 3-way matching between booking events, gateway capture confirmations, and partner commission ledger entries.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <span>Accounting Compliance Guarantee</span>
            </h2>
            <span className="text-xs font-bold text-slate-400 font-mono">GST / TDS Ready</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Historical transaction records are immutable. Every adjustment, fee calculation, or refund requires signed administrative actor authorization and generates a tamper-evident audit log.
          </p>
        </div>
      </div>
    </div>
  );
}


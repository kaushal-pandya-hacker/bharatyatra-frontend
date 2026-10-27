'use client';

import React from 'react';
import { Sliders, ShieldCheck, Percent, FileCheck, CheckCircle2 } from 'lucide-react';

export default function PartnerSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Partner Settings & Contract
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your executed marketplace contract, active commission schedule, and account controls.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Active BharatYatra Partner Agreement
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-400 font-semibold">Agreement Version</span>
            <div className="text-sm font-bold text-white">2026-STANDARD-V1</div>
            <div className="text-slate-500 text-[11px]">Option A: Commission-based Travel Marketplace</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-400 font-semibold">Contractual Marketplace Commission</span>
            <div className="text-sm font-bold text-[#FED65B]">10.00% on Completed Bookings</div>
            <div className="text-slate-500 text-[11px]">Calculated strictly on eligible booking gross</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-400 font-semibold">Settlement Cycle</span>
            <div className="text-sm font-bold text-white">Bi-Weekly Automated Reconciliations</div>
            <div className="text-slate-500 text-[11px]">Paid out to verified bank account</div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-400 font-semibold">Operational Status</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Active & Good Standing
            </div>
            <div className="text-slate-500 text-[11px]">All compliance verifications passed</div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-2 text-slate-300">
          <span className="font-bold text-white">Non-Alteration Policy Notice:</span>
          <p className="leading-relaxed">
            As a standard security and compliance policy, partners cannot self-alter commission rates, settlement banking accounts, or legal entity classifications directly from the client interface. To amend contract clauses or request tariff tier reviews, please contact your assigned BharatYatra partner account manager at <strong className="text-white">partners@bharatyatra.in</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

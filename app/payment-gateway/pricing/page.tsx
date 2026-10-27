import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Check,
  X,
  HelpCircle,
  ArrowRight,
  Calculator,
  Percent,
} from 'lucide-react';

export const metadata = {
  title: 'Zero-Fee Commercial Model — BharatGateway™ Economics',
  description: 'How independent payment gateway software eliminates commercial vendor transaction fees.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <Link href="/payment-gateway" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-600/30">
            ₹
          </div>
          <span className="font-bold text-white text-sm">BharatGateway™ Economics</span>
        </Link>
        <Link
          href="/payment-gateway/merchant"
          className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
        >
          Merchant Console →
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Percent className="w-3.5 h-3.5" /> 0% Intermediary Gateway Fee Target
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">Direct Sovereign Payments Economics</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Commercial payment aggregators charge between 2.0% and 3.5% + 18% GST on every single customer transaction. Owning your payment rails allows zero software provider markup.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Cost Dimension</th>
                <th className="px-6 py-4 text-slate-400">Commercial Aggregators (Razorpay / Stripe)</th>
                <th className="px-6 py-4 text-orange-400 font-bold">BharatGateway Autonomous Rails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="px-6 py-4 font-semibold text-white">Gateway Provider Markup</td>
                <td className="px-6 py-4 text-rose-400">2.0% – 3.0% per transaction</td>
                <td className="px-6 py-4 text-emerald-400 font-bold">0.0% (Zero Gateway Cut)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-white">UPI Transactions (PSSA Sec 10A)</td>
                <td className="px-6 py-4 text-slate-400">0% MDR (Aggregator charges setup/SaaS)</td>
                <td className="px-6 py-4 text-emerald-400 font-bold">0% MDR (Direct Bank Settlement)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-white">Merchant Data Sovereignty</td>
                <td className="px-6 py-4 text-slate-400">Locked inside proprietary aggregator cloud</td>
                <td className="px-6 py-4 text-emerald-400 font-bold">100% Owned PostgreSQL Database</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-white">Double-Entry Append-Only Ledger</td>
                <td className="px-6 py-4 text-slate-400">Opaque third-party statements</td>
                <td className="px-6 py-4 text-emerald-400 font-bold">Automated 4-Way Daily Reconciliation</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-white">Vendor Lock-In Risk</td>
                <td className="px-6 py-4 text-rose-400">High: Single point of failure</td>
                <td className="px-6 py-4 text-emerald-400 font-bold">Zero: Pluggable Adapter Registry</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Realistic Regulatory Note */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-xs text-slate-400 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-orange-400" /> Transparent Fintech Reality Note
          </h3>
          <p className="leading-relaxed">
            Independent software ownership eliminates <strong>third-party gateway markup fees</strong>. However, independent ownership does not eliminate underlying interchange fees set by card networks (Visa/Mastercard/RuPay), participating bank charges, GST taxes, or mandatory compliance and audit capital costs mandated by the Reserve Bank of India under PSSA 2007.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        BharatGateway™ — Independent Zero-Lockin Payment Gateway Software Engine.
      </footer>
    </div>
  );
}

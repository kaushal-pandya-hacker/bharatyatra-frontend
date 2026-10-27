import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  FileCheck2,
  CheckCircle2,
  Code2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const metadata = {
  title: 'BharatGateway™ — Independent Zero-Lockin Payment Gateway Software Engine',
  description: 'Production-ready, provider-agnostic fintech infrastructure with double-entry accounting, signed webhooks, and safe simulation engine.',
};

export default function PaymentGatewayLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Simulation Warning Bar */}
      <div className="bg-amber-500/15 border-b border-amber-500/20 px-4 py-2 text-center text-xs font-medium text-amber-300 flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>CURRENT DEPLOYMENT MODE:</strong> Safe Simulated Payment System. Zero commercial gateway dependency (No Razorpay/Stripe lock-in).
        </span>
      </div>

      {/* Navigation Header */}
      <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-orange-600/30">
              ₹
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block">BharatGateway™</span>
              <span className="text-[10px] text-orange-400 uppercase tracking-widest font-semibold block">Fintech Core Engine</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link href="#architecture" className="hover:text-orange-400 transition">Architecture</Link>
            <Link href="#features" className="hover:text-orange-400 transition">Core Features</Link>
            <Link href="/payment-gateway/docs" className="hover:text-orange-400 transition">API Documentation</Link>
            <Link href="/payment-gateway/merchant" className="hover:text-orange-400 transition">Merchant Portal</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/payment-gateway/checkout/order_bg_demo_101"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700"
            >
              Test Checkout
            </Link>
            <Link
              href="/payment-gateway/merchant"
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white transition shadow-md shadow-orange-600/25 flex items-center gap-1"
            >
              Launch Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" /> Autonomous Sovereign Payment Rails
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl leading-[1.15]">
          Your Own Independent <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
            Payment Gateway Platform
          </span>
        </h1>

        <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
          Engineered from scratch to eliminate commercial gateway lock-in. Powered by an immutable append-only double-entry ledger, integer minor unit precision, cryptographic signed webhooks, and automated 4-way reconciliation.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/payment-gateway/checkout/order_bg_demo_101"
            className="px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold transition shadow-xl shadow-orange-600/30 flex items-center gap-2"
          >
            Experience Live Simulator <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/payment-gateway/merchant"
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition border border-slate-700"
          >
            Explore Merchant Dashboard
          </Link>
          <Link
            href="/payment-gateway/docs"
            className="px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-orange-400 text-sm font-semibold transition border border-orange-500/30 flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4" /> Developer SDK Docs
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="px-6 py-16 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Fintech-Grade Architectural Standards</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">Zero compromises on financial safety, security, or state integrity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Double-Entry Append-Only Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Balanced accounting where Total Debits strictly equals Total Credits. Corrections and refunds are recorded via compensating journal entries without modifying historic rows.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Integer Minor Currency Units</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All monetary amounts are validated and stored as positive integer minor units (paise/cents). Zero floating-point drift or rounding vulnerabilities.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Replay-Safe Signed Webhooks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Event payloads are signed with HMAC-SHA256 (`t=...,v1=...`) with 300-second timestamp drift limits to neutralize replay attacks and man-in-the-middle tampering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section id="architecture" className="px-6 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 block">Zero Vendor Lock-in</span>
            <h2 className="text-3xl font-extrabold text-white mb-4">Decoupled Adapter Architecture</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Unlike commercial wrappers that hardcode proprietary gateway SDKs, BharatGateway defines an abstract <code className="text-orange-300">PaymentProvider</code> interface. Direct bank routing and UPI switch adapters can be activated without rewriting merchant integration code.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deterministic test simulation engine with 6 configurable failure triggers.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automated 4-way reconciliation between orders, attempts, ledger, and settlements.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PCI-safe design: Zero real card PAN storage or plaintext CVV capture.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono text-xs text-slate-300 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-500">
              <span>BharatGateway Core Execution Stack</span>
              <span className="text-emerald-400">Node / NestJS / Prisma / Next.js</span>
            </div>
            <div className="text-orange-400">{'// Sample Order Creation Request'}</div>
            <div className="text-slate-400">POST /api/v1/gateway/orders</div>
            <pre className="bg-slate-950 p-4 rounded-xl text-emerald-300 overflow-x-auto">
{`{
  "amountMinor": 249900, // ₹2,499.00
  "currency": "INR",
  "receipt": "RCPT_PKG_001",
  "idempotencyKey": "idemp_4918294812",
  "customerEmail": "user@bharatyatra.in",
  "notes": { "packageId": "pkg_guj_somnath" }
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500">
        <p>BharatGateway™ — Independent Zero-Lockin Payment Gateway Software Engine.</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Complies with architectural guidelines of PSSA 2007 & RBI PA/PG directives. Safe simulation environment.
        </p>
      </footer>
    </div>
  );
}

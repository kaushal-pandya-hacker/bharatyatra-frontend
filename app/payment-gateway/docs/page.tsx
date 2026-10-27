import React from 'react';
import Link from 'next/link';
import {
  Code2,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Key,
} from 'lucide-react';

export const metadata = {
  title: 'Developer Documentation — BharatGateway™ API Reference',
  description: 'Complete API reference, Webhook HMAC-SHA256 signature verification recipes, and simulated test credentials.',
};

export default function GatewayDocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/payment-gateway" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-600/30">
              ₹
            </div>
            <span className="font-bold text-white text-sm">BharatGateway™ Docs</span>
          </Link>
          <span className="text-xs text-slate-500 font-mono">v1.0.0 (Simulated Engine)</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/payment-gateway/merchant"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
          >
            Merchant Portal →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <aside className="md:col-span-3 space-y-4 text-xs">
          <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Getting Started</div>
          <ul className="space-y-2 text-slate-300">
            <li><a href="#quickstart" className="hover:text-orange-400 transition">1. Overview & Auth</a></li>
            <li><a href="#create-order" className="hover:text-orange-400 transition">2. Create Payment Order</a></li>
            <li><a href="#checkout" className="hover:text-orange-400 transition">3. Checkout Flow</a></li>
            <li><a href="#webhooks" className="hover:text-orange-400 transition">4. Webhook Verification</a></li>
            <li><a href="#test-cards" className="hover:text-orange-400 transition">5. Test Cards & VPAs</a></li>
          </ul>
        </aside>

        {/* Content Body */}
        <main className="md:col-span-9 space-y-12">
          {/* Section 1: Quickstart */}
          <section id="quickstart" className="space-y-4">
            <h1 className="text-2xl font-black text-white">BharatGateway Developer Reference</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              BharatGateway exposes standard RESTful endpoints for merchant order creation, transaction status queries, and refunds. All monetary amounts are strictly represented as positive integer minor units (e.g. INR paise: ₹100 = <code>10000</code>).
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-orange-400" /> Authentication Header
              </span>
              <p className="text-xs text-slate-400">Authenticate all server requests using the <code>X-API-KEY</code> header:</p>
              <pre className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-emerald-300">
                X-API-KEY: sk_test_bharat_sim_secret_key_84918294819284
              </pre>
            </div>
          </section>

          {/* Section 2: Create Order */}
          <section id="create-order" className="space-y-4">
            <h2 className="text-lg font-bold text-white">Creating a Payment Order</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Before presenting the checkout interface to the customer, create an authoritative order on your server. Amounts are locked at creation to prevent client tampering.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-400">
                POST /api/v1/gateway/orders
              </div>
              <pre className="p-4 text-emerald-300 overflow-x-auto">
{`curl -X POST https://api.bharatgateway.in/api/v1/gateway/orders \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: sk_test_bharat_sim_secret_key_84918294819284" \\
  -H "X-Idempotency-Key: idemp_order_948192" \\
  -d '{
    "amountMinor": 249900,
    "currency": "INR",
    "receipt": "RCPT_BHARAT_101",
    "customerEmail": "traveler@bharatyatra.in",
    "description": "Somnath & Dwarka Pilgrimage Pass"
  }'`}
              </pre>
            </div>
          </section>

          {/* Section 3: Webhook Verification */}
          <section id="webhooks" className="space-y-4">
            <h2 className="text-lg font-bold text-white">Replay-Safe Webhook Verification</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              BharatGateway delivers signed webhook payloads with the <code>X-BharatGateway-Signature</code> header. Verify the HMAC-SHA256 signature and reject requests where timestamp drift exceeds 300 seconds.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-400">
                Node.js Verification Recipe
              </div>
              <pre className="p-4 text-slate-300 overflow-x-auto">
{`const crypto = require('crypto');

function verifyWebhook(rawPayload, signatureHeader, secret) {
  // 1. Extract timestamp and signature: t=...,v1=...
  const parts = signatureHeader.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
  const expectedSig = parts.find(p => p.startsWith('v1='))?.split('=')[1];

  // 2. Replay attack check (300s window)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
    throw new Error('Webhook timestamp drift exceeds tolerance window');
  }

  // 3. Compute HMAC-SHA256
  const payloadToSign = \`\${timestamp}.\${rawPayload}\`;
  const computedSig = crypto
    .createHmac('sha256', secret)
    .update(payloadToSign)
    .digest('hex');

  // 4. Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(computedSig),
    Buffer.from(expectedSig)
  );
}`}
              </pre>
            </div>
          </section>

          {/* Section 4: Test Cards */}
          <section id="test-cards" className="space-y-4">
            <h2 className="text-lg font-bold text-white">Simulated Test Credentials</h2>
            <p className="text-xs text-slate-400">
              Use these simulated test credentials to verify success, decline, and timeout handling in sandbox mode.
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Test Identifier</th>
                    <th className="px-4 py-3">Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr>
                    <td className="px-4 py-2.5 text-slate-300">UPI (Success)</td>
                    <td className="px-4 py-2.5 text-emerald-400">success@okhdfcbank</td>
                    <td className="px-4 py-2.5 text-slate-400">Captures instantly (200 OK)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-slate-300">Card (Success)</td>
                    <td className="px-4 py-2.5 text-emerald-400">4000 0000 0000 4242</td>
                    <td className="px-4 py-2.5 text-slate-400">Captures instantly (200 OK)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-slate-300">Card (Decline)</td>
                    <td className="px-4 py-2.5 text-rose-400">4000 0000 0000 0002</td>
                    <td className="px-4 py-2.5 text-slate-400">ERR_INSUFFICIENT_FUNDS</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-slate-300">Card (Timeout)</td>
                    <td className="px-4 py-2.5 text-rose-400">4000 0000 0000 0054</td>
                    <td className="px-4 py-2.5 text-slate-400">ERR_ISSUER_BANK_TIMEOUT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        BharatGateway™ — Independent Zero-Lockin Payment Gateway Software Engine.
      </footer>
    </div>
  );
}

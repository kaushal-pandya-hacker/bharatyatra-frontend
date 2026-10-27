'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Activity,
  Users,
  Database,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Server,
  Terminal,
} from 'lucide-react';

export default function AdminGatewayPage() {
  const [activeTab, setActiveTab] = useState<'MERCHANTS' | 'FRAUD' | 'AUDIT' | 'HEALTH'>('HEALTH');

  const merchants = [
    {
      id: 'merch_default_bharat_001',
      code: 'MERCH_DEFAULT',
      name: 'BharatYatra Retail & Travel Labs',
      legalName: 'BharatYatra Tech Solutions Pvt Ltd',
      email: 'engineering@bharatyatra.in',
      kyc: 'APPROVED',
      status: 'ACTIVE',
      currency: 'INR',
      created: '2026-10-22T12:00:00Z',
    },
    {
      id: 'merch_guj_resorts_002',
      code: 'MERCH_89412',
      name: 'Gir Forest Eco-Lodges',
      legalName: 'Gir Wild Ventures LLP',
      email: 'accounts@girventures.com',
      kyc: 'APPROVED',
      status: 'ACTIVE',
      currency: 'INR',
      created: '2026-10-21T09:30:00Z',
    },
  ];

  const fraudAlerts = [
    {
      id: 'frd_94819284',
      orderId: 'order_bg_demo_109',
      merchantCode: 'MERCH_DEFAULT',
      riskScore: 95,
      severity: 'CRITICAL',
      rule: 'RULE_SIMULATED_KNOWN_FRAUD_TRIGGER',
      action: 'BLOCKED',
      timestamp: 'Just now',
    },
    {
      id: 'frd_10928412',
      orderId: 'order_bg_demo_108',
      merchantCode: 'MERCH_89412',
      riskScore: 78,
      severity: 'HIGH',
      rule: 'RULE_IP_VELOCITY_EXCEEDED',
      action: 'BLOCKED',
      timestamp: '15m ago',
    },
  ];

  const auditLogs = [
    {
      id: 'aud_891284',
      actor: 'system_reconciliation_cron',
      action: 'RECONCILIATION_BATCH_EXECUTED',
      resource: 'BATCH:rec_batch_today',
      ip: '127.0.0.1',
      time: '19:45:00',
    },
    {
      id: 'aud_891283',
      actor: 'engineering@bharatyatra.in',
      action: 'API_KEY_GENERATED',
      resource: 'CREDENTIAL:cred_948192',
      ip: '103.21.244.2',
      time: '19:30:12',
    },
    {
      id: 'aud_891282',
      actor: 'CUSTOMER_CHECKOUT',
      action: 'PAYMENT_CAPTURED',
      resource: 'PAYMENT:pay_sim_9481928',
      ip: '49.36.128.4',
      time: '19:28:44',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Banner */}
      <div className="bg-red-600/10 border-b border-red-500/20 px-6 py-2 text-xs flex items-center justify-between text-red-300">
        <span className="flex items-center gap-2 font-semibold">
          <Lock className="w-3.5 h-3.5" /> PLATFORM SUPER-ADMIN CONSOLE (PRIVILEGED ACCESS)
        </span>
        <Link href="/payment-gateway/merchant" className="text-slate-400 hover:text-white transition">
          Switch to Merchant View →
        </Link>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-orange-600/30">
            BG
          </div>
          <div>
            <h1 className="text-base font-bold text-white">BharatGateway™ Platform Controller</h1>
            <p className="text-xs text-slate-400">Autonomous Payment Rails Orchestration</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All Subsystems Nominal
          </span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 border-r border-slate-800 bg-slate-900/40 p-3 space-y-1 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-semibold text-left transition ${
              activeTab === 'HEALTH'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> System Health & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('MERCHANTS')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-semibold text-left transition ${
              activeTab === 'MERCHANTS'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Merchant Directory ({merchants.length})
          </button>
          <button
            onClick={() => setActiveTab('FRAUD')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-semibold text-left transition ${
              activeTab === 'FRAUD'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Fraud & Risk Monitoring ({fraudAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg font-semibold text-left transition ${
              activeTab === 'AUDIT'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" /> Audit Trails ({auditLogs.length})
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* TAB: HEALTH */}
          {activeTab === 'HEALTH' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-lg font-bold text-white">System Health & Autonomous Telemetry</h2>
                <p className="text-xs text-slate-400">Status of decoupled core modules, simulation engine, and persistence boundaries.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Payment Switch Engine</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="text-xl font-bold text-white">Active (Simulator)</div>
                  <div className="text-[11px] text-emerald-400">Zero vendor lock-in mode</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Append-Only Ledger</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="text-xl font-bold text-white">Balanced</div>
                  <div className="text-[11px] text-slate-400">Debits == Credits (100% Paired)</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Webhook HMAC Dispatcher</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="text-xl font-bold text-white">300s Tolerance</div>
                  <div className="text-[11px] text-slate-400">Replay Attack Shield Active</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MERCHANTS */}
          {activeTab === 'MERCHANTS' && (
            <div className="space-y-4 max-w-5xl">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Merchants Directory</h2>
                <p className="text-xs text-slate-400">Multi-tenant isolation and merchant KYC management.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Business Name</th>
                      <th className="px-4 py-3">Contact Email</th>
                      <th className="px-4 py-3">KYC Status</th>
                      <th className="px-4 py-3">Currency</th>
                      <th className="px-4 py-3">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {merchants.map(m => (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-mono font-medium text-orange-400">{m.code}</td>
                        <td className="px-4 py-3 font-semibold text-white">{m.name}</td>
                        <td className="px-4 py-3 text-slate-300">{m.email}</td>
                        <td className="px-4 py-3">
                          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            {m.kyc}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">{m.currency}</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: FRAUD */}
          {activeTab === 'FRAUD' && (
            <div className="space-y-4 max-w-5xl">
              <div>
                <h2 className="text-lg font-bold text-white">Fraud Monitoring & Risk Alerts</h2>
                <p className="text-xs text-slate-400">Automated velocity triggers, card test blocking, and high-value anomalies.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Alert ID</th>
                      <th className="px-4 py-3">Order Ref</th>
                      <th className="px-4 py-3">Rule Name</th>
                      <th className="px-4 py-3">Risk Score</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {fraudAlerts.map(f => (
                      <tr key={f.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-mono text-slate-300">{f.id}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{f.orderId}</td>
                        <td className="px-4 py-3 font-semibold text-rose-400">{f.rule}</td>
                        <td className="px-4 py-3 font-bold text-white">{f.riskScore}/100</td>
                        <td className="px-4 py-3">
                          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            {f.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            {f.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: AUDIT */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4 max-w-5xl">
              <div>
                <h2 className="text-lg font-bold text-white">Immutable Security Audit Trail</h2>
                <p className="text-xs text-slate-400">PCI-safe event logs with sensitive credentials masked.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-sans">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target Resource</th>
                      <th className="px-4 py-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {auditLogs.map(a => (
                      <tr key={a.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-2.5 text-slate-500">{a.time}</td>
                        <td className="px-4 py-2.5 text-slate-300 truncate max-w-[150px]">{a.actor}</td>
                        <td className="px-4 py-2.5 font-bold text-orange-400 font-sans">{a.action}</td>
                        <td className="px-4 py-2.5 text-slate-400 truncate max-w-[180px]">{a.resource}</td>
                        <td className="px-4 py-2.5 text-slate-500">{a.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

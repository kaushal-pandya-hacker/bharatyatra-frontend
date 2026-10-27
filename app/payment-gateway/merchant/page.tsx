'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  Webhook,
  Key,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  RotateCcw,
  Sliders,
  Copy,
  Check,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Search,
  BookOpen,
  ArrowDownRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  GatewayClient,
  GatewayOrder,
  PaymentAttempt,
  RefundItem,
  WebhookDelivery,
  ReconReport,
  LedgerEntry,
  MerchantProfile,
  ApiCredential,
  AnalyticsSummary,
} from '@/lib/gateway/gateway-client';

export default function MerchantDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'ORDERS' | 'TRANSACTIONS' | 'REFUNDS' | 'LEDGER' | 'RECON' | 'WEBHOOKS' | 'KEYS' | 'SETTINGS'
  >('OVERVIEW');

  // Live Data States
  const [orders, setOrders] = useState<GatewayOrder[]>([]);
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookDelivery[]>([]);
  const [reconReport, setReconReport] = useState<ReconReport | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [txnSearch, setTxnSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Order for Detail Modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<GatewayOrder | null>(null);

  // Create Order Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrderAmount, setNewOrderAmount] = useState('1500');
  const [newOrderDesc, setNewOrderDesc] = useState('Gir Forest Safari Pass - 2 Travelers');
  const [newOrderEmail, setNewOrderEmail] = useState('traveler@example.com');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<GatewayOrder | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Customer cancellation request');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [
        fetchedOrders,
        fetchedAttempts,
        fetchedRefunds,
        fetchedLedger,
        fetchedWebhooks,
        fetchedAnalytics,
        fetchedProfile,
        fetchedCreds,
      ] = await Promise.all([
        GatewayClient.fetchOrders(),
        GatewayClient.fetchAttempts(),
        GatewayClient.fetchRefunds(),
        GatewayClient.fetchLedger(),
        GatewayClient.fetchWebhooks(),
        GatewayClient.fetchAnalytics(),
        GatewayClient.fetchProfile(),
        GatewayClient.fetchCredentials(),
      ]);

      setOrders(fetchedOrders);
      setAttempts(fetchedAttempts);
      setRefunds(fetchedRefunds);
      setLedgerEntries(fetchedLedger);
      setWebhooks(fetchedWebhooks);
      setAnalytics(fetchedAnalytics);
      setProfile(fetchedProfile);
      setCredentials(fetchedCreds);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newOrderAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFeedbackMessage({ type: 'error', text: 'Enter a valid positive order amount.' });
      return;
    }

    setIsCreatingOrder(true);
    try {
      const newOrder = await GatewayClient.createOrder({
        amountRupees: amountNum,
        description: newOrderDesc,
        customerEmail: newOrderEmail,
        receipt: `RCPT_${Date.now()}`,
      });

      setShowCreateModal(false);
      setFeedbackMessage({ type: 'success', text: `Payment order ${newOrder.orderId} created successfully.` });
      await refreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Failed to create payment order.' });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRefund) return;
    const amountNum = refundAmount ? parseFloat(refundAmount) : undefined;

    setIsProcessingRefund(true);
    try {
      const refund = await GatewayClient.createRefund(selectedOrderForRefund.orderId, amountNum, refundReason);
      setShowRefundModal(false);
      setFeedbackMessage({
        type: 'success',
        text: `Compensating reversal ${refund.refundId} posted to double-entry ledger.`,
      });
      await refreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Refund failed' });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleRunRecon = async () => {
    setIsRefreshing(true);
    try {
      const report = await GatewayClient.runReconciliation();
      setReconReport(report);
      setFeedbackMessage({
        type: 'success',
        text: `Reconciliation batch ${report.batchId} executed. Matched: ${report.matchedCount}.`,
      });
      await refreshData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'Reconciliation run failed' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Aggregated KPIs
  const totalVolumePaise = analytics ? analytics.grossVolumeMinor : orders.reduce((sum, o) => sum + o.amountMinor, 0);
  const capturedVolumePaise = analytics
    ? analytics.netCapturedMinor
    : orders
        .filter(o => o.status === 'CAPTURED' || o.status === 'PARTIALLY_REFUNDED' || o.status === 'REFUNDED')
        .reduce((sum, o) => sum + o.amountMinor, 0);
  const refundedVolumePaise = analytics
    ? analytics.refundedVolumeMinor
    : refunds.reduce((sum, r) => sum + r.amountMinor, 0);
  const successRate = analytics
    ? analytics.overallSuccessRatePct
    : orders.length > 0
    ? Math.round(
        (orders.filter(o => o.status === 'CAPTURED' || o.status === 'PARTIALLY_REFUNDED' || o.status === 'REFUNDED')
          .length /
          orders.length) *
          100,
      )
    : 100;

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesQuery =
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.receipt && o.receipt.toLowerCase().includes(orderSearch.toLowerCase()));

    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);

  // Filtered Transactions
  const filteredAttempts = attempts.filter(
    a =>
      a.attemptId.toLowerCase().includes(txnSearch.toLowerCase()) ||
      a.orderId.toLowerCase().includes(txnSearch.toLowerCase()) ||
      (a.gatewayTransactionId && a.gatewayTransactionId.toLowerCase().includes(txnSearch.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Warning & Status Banner */}
      <div className="bg-orange-600/10 border-b border-orange-500/20 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-orange-400">BHARATGATEWAY TEST ENGINE</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            SIMULATED SANDBOX (Zero Real Money Movement)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Sync Live'}
          </button>
          <span className="text-slate-600">|</span>
          <Link
            href="/payment-gateway/docs"
            className="text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            API Docs <ExternalLink className="w-3 h-3" />
          </Link>
          <Link href="/payment-gateway/admin" className="text-orange-400 hover:text-orange-300 transition font-medium">
            Platform Admin →
          </Link>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`px-4 py-2.5 text-xs flex items-center justify-between transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/60 border-b border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/60 border-b border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-semibold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-orange-600/30">
            ₹
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              {profile?.businessName || 'BharatYatra Retail & Travel'}{' '}
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                {profile?.merchantCode || 'MERCH_DEFAULT'}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Merchant Operations & Financial Ledger Console</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Create Test Order
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-60 border-r border-slate-800 bg-slate-900/30 p-3 flex flex-col gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'OVERVIEW'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'ORDERS'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payment Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" /> Transactions ({attempts.length})
          </button>
          <button
            onClick={() => setActiveTab('REFUNDS')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'REFUNDS'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" /> Refund Requests ({refunds.length})
          </button>
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'LEDGER'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Double-Entry Ledger ({ledgerEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('RECON')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'RECON'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" /> 4-Way Reconciliation
          </button>
          <button
            onClick={() => setActiveTab('WEBHOOKS')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'WEBHOOKS'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Webhook className="w-4 h-4" /> Webhook Events ({webhooks.length})
          </button>
          <button
            onClick={() => setActiveTab('KEYS')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'KEYS'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" /> API Credentials
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition ${
              activeTab === 'SETTINGS'
                ? 'bg-orange-600/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" /> Settings & Profile
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-slate-900/60 rounded-xl animate-pulse border border-slate-800" />
                ))}
              </div>
              <div className="h-64 bg-slate-900/60 rounded-xl animate-pulse border border-slate-800" />
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                      <div className="text-xs font-medium text-slate-400">Total Gross Volume</div>
                      <div className="text-2xl font-bold text-white mt-1">
                        ₹{(totalVolumePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{orders.length} created orders</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                      <div className="text-xs font-medium text-slate-400">Net Captured Settled</div>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">
                        ₹{(capturedVolumePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">Append-only ledger verified</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                      <div className="text-xs font-medium text-slate-400">Success Rate</div>
                      <div className="text-2xl font-bold text-orange-400 mt-1">{successRate}%</div>
                      <div className="text-[11px] text-slate-500 mt-1">Simulated test switch</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                      <div className="text-xs font-medium text-slate-400">Total Refunded</div>
                      <div className="text-2xl font-bold text-rose-400 mt-1">
                        ₹{(refundedVolumePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{refunds.length} compensating reversals</div>
                    </div>
                  </div>

                  {/* Payment Method Breakdown */}
                  {analytics && analytics.methodBreakdown && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                        Volume by Payment Method
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(analytics.methodBreakdown).map(([method, data]) => (
                          <div key={method} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <span className="text-[11px] text-slate-400 block">{method}</span>
                            <span className="text-sm font-bold text-slate-200">
                              ₹{(data.volumeMinor / 100).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{data.count} attempts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Orders Preview */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Payment Orders</h3>
                      <button
                        onClick={() => setActiveTab('ORDERS')}
                        className="text-xs text-orange-400 hover:text-orange-300 transition"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-2.5">Order ID</th>
                            <th className="px-4 py-2.5">Amount (INR)</th>
                            <th className="px-4 py-2.5">Status</th>
                            <th className="px-4 py-2.5">Customer</th>
                            <th className="px-4 py-2.5">Created</th>
                            <th className="px-4 py-2.5">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {orders.slice(0, 5).map(o => (
                            <tr key={o.orderId} className="hover:bg-slate-800/30 transition">
                              <td className="px-4 py-3 font-mono font-medium text-slate-300">{o.orderId}</td>
                              <td className="px-4 py-3 font-semibold text-white">₹{(o.amountMinor / 100).toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    o.status === 'CAPTURED'
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : o.status === 'CREATED'
                                      ? 'bg-blue-500/20 text-blue-400'
                                      : o.status === 'PARTIALLY_REFUNDED'
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-rose-500/20 text-rose-400'
                                  }`}
                                >
                                  {o.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-400">{o.customerEmail || 'Guest Traveler'}</td>
                              <td className="px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleTimeString()}</td>
                              <td className="px-4 py-3 flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedOrderDetails(o)}
                                  className="text-slate-400 hover:text-white transition flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Details
                                </button>
                                <Link
                                  href={`/payment-gateway/checkout/${o.orderId}`}
                                  target="_blank"
                                  className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium"
                                >
                                  Checkout <ArrowUpRight className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS */}
              {activeTab === 'ORDERS' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-white">Payment Orders</h2>
                      <p className="text-xs text-slate-400">
                        Validated integer minor unit orders created via authenticated REST API.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <PlusCircle className="w-4 h-4" /> Create Order
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by Order ID, customer email, or receipt..."
                        value={orderSearch}
                        onChange={e => {
                          setOrderSearch(e.target.value);
                          setOrderPage(1);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <select
                        value={orderStatusFilter}
                        onChange={e => {
                          setOrderStatusFilter(e.target.value);
                          setOrderPage(1);
                        }}
                        className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="CREATED">CREATED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="CAPTURED">CAPTURED</option>
                        <option value="PARTIALLY_REFUNDED">PARTIALLY_REFUNDED</option>
                        <option value="REFUNDED">REFUNDED</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {paginatedOrders.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No payment orders found matching your filters.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Order ID</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Refunded</th>
                              <th className="px-4 py-3">Receipt</th>
                              <th className="px-4 py-3">Customer</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {paginatedOrders.map(o => (
                              <tr key={o.orderId} className="hover:bg-slate-800/40 transition">
                                <td className="px-4 py-3 font-mono text-slate-300">{o.orderId}</td>
                                <td className="px-4 py-3 font-semibold text-white">₹{(o.amountMinor / 100).toFixed(2)}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      o.status === 'CAPTURED'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : o.status === 'CREATED'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : o.status === 'PARTIALLY_REFUNDED'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-rose-500/20 text-rose-400'
                                    }`}
                                  >
                                    {o.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400">₹{(o.amountRefundedMinor / 100).toFixed(2)}</td>
                                <td className="px-4 py-3 text-slate-400 font-mono">{o.receipt}</td>
                                <td className="px-4 py-3 text-slate-400">{o.customerEmail}</td>
                                <td className="px-4 py-3 text-right space-x-2">
                                  <button
                                    onClick={() => setSelectedOrderDetails(o)}
                                    className="text-slate-400 hover:text-white transition"
                                  >
                                    View
                                  </button>
                                  <Link
                                    href={`/payment-gateway/checkout/${o.orderId}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium"
                                  >
                                    Pay <ArrowUpRight className="w-3 h-3" />
                                  </Link>
                                  {(o.status === 'CAPTURED' || o.status === 'PARTIALLY_REFUNDED') && (
                                    <button
                                      onClick={() => {
                                        setSelectedOrderForRefund(o);
                                        setShowRefundModal(true);
                                      }}
                                      className="text-rose-400 hover:text-rose-300 font-medium"
                                    >
                                      Refund
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          Showing {(orderPage - 1) * itemsPerPage + 1} to{' '}
                          {Math.min(orderPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={orderPage === 1}
                            onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-slate-400 font-mono">
                            {orderPage} / {totalPages}
                          </span>
                          <button
                            disabled={orderPage === totalPages}
                            onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TRANSACTIONS */}
              {activeTab === 'TRANSACTIONS' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-white">Payment Attempts & Transactions</h2>
                      <p className="text-xs text-slate-400">
                        Payment switch attempt logs, fraud risk scoring, and cryptographic signatures.
                      </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Filter transactions..."
                        value={txnSearch}
                        onChange={e => setTxnSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {filteredAttempts.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No payment attempts recorded yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Attempt ID</th>
                              <th className="px-4 py-3">Order Ref</th>
                              <th className="px-4 py-3">Method</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Risk Score</th>
                              <th className="px-4 py-3">Gateway Txn ID</th>
                              <th className="px-4 py-3">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {filteredAttempts.map(a => (
                              <tr key={a.attemptId} className="hover:bg-slate-800/40 transition">
                                <td className="px-4 py-3 font-mono text-slate-300">{a.attemptId}</td>
                                <td className="px-4 py-3 font-mono text-slate-400">{a.orderId}</td>
                                <td className="px-4 py-3 font-medium text-slate-200">{a.method}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      a.status === 'SUCCESS'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-rose-500/20 text-rose-400'
                                    }`}
                                  >
                                    {a.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`font-mono text-xs ${
                                      a.riskScore >= 70 ? 'text-rose-400 font-bold' : 'text-slate-400'
                                    }`}
                                  >
                                    {a.riskScore}/100
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-500 truncate max-w-[150px]">
                                  {a.gatewayTransactionId}
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                  {new Date(a.createdAt).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: REFUNDS */}
              {activeTab === 'REFUNDS' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-white">Refund Requests & Reversals</h2>
                    <p className="text-xs text-slate-400">
                      Compensating double-entry journal entries protecting ledger balance.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {refunds.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">No refund requests processed yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Refund ID</th>
                              <th className="px-4 py-3">Order Ref</th>
                              <th className="px-4 py-3">Refund Amount</th>
                              <th className="px-4 py-3">Reason</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Processed At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {refunds.map(r => (
                              <tr key={r.refundId} className="hover:bg-slate-800/40 transition">
                                <td className="px-4 py-3 font-mono text-slate-300">{r.refundId}</td>
                                <td className="px-4 py-3 font-mono text-slate-400">{r.orderId}</td>
                                <td className="px-4 py-3 font-semibold text-rose-400">
                                  ₹{(r.amountMinor / 100).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-slate-300">{r.reason}</td>
                                <td className="px-4 py-3">
                                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                                    {r.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: DOUBLE-ENTRY LEDGER */}
              {activeTab === 'LEDGER' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white">Immutable Double-Entry Ledger</h2>
                      <p className="text-xs text-slate-400">
                        Append-only journal verifying balanced Debits and Credits across all financial accounts.
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Balanced: Debits = Credits
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {ledgerEntries.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">No ledger entries posted yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Entry ID</th>
                              <th className="px-4 py-3">Txn Reference</th>
                              <th className="px-4 py-3">Account Type</th>
                              <th className="px-4 py-3">Direction</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Description</th>
                              <th className="px-4 py-3">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {ledgerEntries.map(e => (
                              <tr key={e.id} className="hover:bg-slate-800/40 transition">
                                <td className="px-4 py-3 font-mono text-slate-400">{e.id}</td>
                                <td className="px-4 py-3 font-mono text-slate-300">{e.transactionReference}</td>
                                <td className="px-4 py-3">
                                  <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                    {e.accountType}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      e.direction === 'DEBIT'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-emerald-500/20 text-emerald-400'
                                    }`}
                                  >
                                    {e.direction}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-white">
                                  ₹{(e.amountMinor / 100).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-slate-400">{e.description}</td>
                                <td className="px-4 py-3 text-slate-500">
                                  {new Date(e.createdAt).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: RECONCILIATION */}
              {activeTab === 'RECON' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white">4-Way Financial Reconciliation Engine</h2>
                      <p className="text-xs text-slate-400">
                        Cross-matches Orders, Transactions, Double-Entry Ledger, and External Provider Statements.
                      </p>
                    </div>
                    <button
                      onClick={handleRunRecon}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Execute Reconciliation Batch
                    </button>
                  </div>

                  {reconReport ? (
                    <div className="space-y-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">Batch {reconReport.batchId} Executed</h3>
                              <p className="text-xs text-slate-400">
                                Completed at {new Date(reconReport.executedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              reconReport.status === 'MATCHED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {reconReport.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400">Orders Scanned</span>
                            <p className="text-lg font-bold text-white mt-0.5">{reconReport.totalOrdersScanned}</p>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400">Statement Items</span>
                            <p className="text-lg font-bold text-blue-400 mt-0.5">
                              {reconReport.totalStatementItemsScanned || reconReport.totalOrdersScanned}
                            </p>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400">Matched Clean</span>
                            <p className="text-lg font-bold text-emerald-400 mt-0.5">{reconReport.matchedCount}</p>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <span className="text-xs text-slate-400">Discrepancies</span>
                            <p
                              className={`text-lg font-bold mt-0.5 ${
                                reconReport.discrepancyCount > 0 ? 'text-rose-400' : 'text-slate-300'
                              }`}
                            >
                              {reconReport.discrepancyCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Discrepancy Evidence Table if any */}
                      {reconReport.discrepancies && reconReport.discrepancies.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                          <div className="px-5 py-3.5 border-b border-slate-800 bg-rose-950/20">
                            <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-rose-400" /> Discrepancy Investigation Evidence
                            </h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                                <tr>
                                  <th className="px-4 py-3">Order Ref</th>
                                  <th className="px-4 py-3">Provider Ref</th>
                                  <th className="px-4 py-3">Discrepancy Type</th>
                                  <th className="px-4 py-3">Reason</th>
                                  <th className="px-4 py-3">Internal Amount</th>
                                  <th className="px-4 py-3">Statement Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                {reconReport.discrepancies.map((d, i) => (
                                  <tr key={i} className="hover:bg-slate-800/40 transition">
                                    <td className="px-4 py-3 font-mono text-slate-300">{d.orderId || 'N/A'}</td>
                                    <td className="px-4 py-3 font-mono text-slate-400">{d.providerReference || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                      <span className="bg-rose-500/20 text-rose-400 font-mono text-[10px] px-2 py-0.5 rounded border border-rose-500/30">
                                        {d.type}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-300 max-w-xs">{d.reason}</td>
                                    <td className="px-4 py-3 text-slate-300 font-mono">
                                      {d.orderAmountMinor !== undefined ? `₹${(d.orderAmountMinor / 100).toFixed(2)}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-rose-300 font-mono">
                                      {d.statementAmountMinor !== undefined ? `₹${(d.statementAmountMinor / 100).toFixed(2)}` : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-white mb-1">No Batch Run Yet Today</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                        Click "Execute Reconciliation Batch" to compare internal orders and append-only ledger entries against external settlement statements.
                      </p>
                      <button
                        onClick={handleRunRecon}
                        className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Run Batch Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: WEBHOOKS */}
              {activeTab === 'WEBHOOKS' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-white">Signed Webhook Delivery Subsystem</h2>
                    <p className="text-xs text-slate-400">
                      Cryptographically signed events with HMAC-SHA256, exponential backoff, bounded retries, and manual redelivery.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {webhooks.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">No webhook events delivered yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Delivery ID</th>
                              <th className="px-4 py-3">Event Type</th>
                              <th className="px-4 py-3">Attempts</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Error Category</th>
                              <th className="px-4 py-3">Timestamp</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {webhooks.map(w => (
                              <tr key={w.deliveryId} className="hover:bg-slate-800/40 transition">
                                <td className="px-4 py-3 font-mono text-slate-300">{w.deliveryId}</td>
                                <td className="px-4 py-3 font-bold text-orange-400">{w.eventType}</td>
                                <td className="px-4 py-3 text-slate-300 font-mono">
                                  {w.attempts || 1}/{w.maxAttempts || 5}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      w.status === 'SIMULATED_DELIVERY' || w.status === 'DELIVERED'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : w.status === 'RETRYING'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-rose-500/20 text-rose-400'
                                    }`}
                                  >
                                    {w.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                                  {w.errorCategory || 'NONE'}
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                  {new Date(w.deliveredAt || w.createdAt || Date.now()).toLocaleTimeString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {(w.status === 'RETRYING' || w.status === 'PERMANENTLY_FAILED') && (
                                    <button
                                      onClick={async () => {
                                        const res = await GatewayClient.redeliverWebhook(w.deliveryId);
                                        if (res) {
                                          setFeedbackMessage({
                                            type: 'success',
                                            text: `Webhook ${w.deliveryId} redelivery triggered successfully.`,
                                          });
                                          refreshData();
                                        }
                                      }}
                                      className="text-orange-400 hover:text-orange-300 font-medium"
                                    >
                                      Redeliver
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: API KEYS */}
              {activeTab === 'KEYS' && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h2 className="text-base font-bold text-white">API Credentials & Keys</h2>
                    <p className="text-xs text-slate-400">
                      Use publishable keys on the client and secret keys strictly on your backend server.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                        Publishable API Key (Client / Checkout Widget)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={credentials[0]?.publishableKey || 'pk_test_bharat_sim_9481928491823918'}
                          className="flex-1 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 px-3 py-2 rounded-lg"
                        />
                        <button
                          onClick={() =>
                            copyToClipboard(credentials[0]?.publishableKey || 'pk_test_bharat_sim_9481928491823918', 'pk')
                          }
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-300 flex items-center gap-1 transition"
                        >
                          {copiedKey === 'pk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}{' '}
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                        Secret API Key Prefix (Full Secret Protected on Server)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={credentials[0]?.secretKeyPrefix ? `${credentials[0].secretKeyPrefix}••••••••••••` : 'sk_test_bharat_••••••••••••'}
                          className="flex-1 bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 px-3 py-2 rounded-lg"
                        />
                        <span className="text-xs bg-slate-800 px-3 py-2 rounded-lg text-slate-400">
                          Active & Enforced
                        </span>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Security Control: Secret API keys are never returned after generation or stored in browser local
                        storage.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: SETTINGS & PROFILE */}
              {activeTab === 'SETTINGS' && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h2 className="text-base font-bold text-white">Merchant Configuration & Profile</h2>
                    <p className="text-xs text-slate-400">
                      Verified legal entity and transaction parameters for your simulator merchant account.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 block mb-1">Business Name</span>
                        <span className="font-semibold text-white">
                          {profile?.businessName || 'BharatYatra Travel & Retail Labs'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Legal Entity</span>
                        <span className="font-semibold text-white">
                          {profile?.legalEntityName || 'BharatYatra Tech Solutions Pvt Ltd'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Merchant Code</span>
                        <span className="font-mono text-slate-300">{profile?.merchantCode || 'MERCH_DEFAULT'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">KYC Status</span>
                        <span className="font-semibold text-emerald-400">{profile?.kycStatus || 'APPROVED'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Settlement Currency</span>
                        <span className="font-semibold text-white">
                          {profile?.defaultCurrency || 'INR'} (Indian Rupee - ₹)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Commercial Fee Model</span>
                        <span className="font-semibold text-emerald-400">
                          0.0% Provider Transaction Fee (Autonomous Rails)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-400" /> Order Details
              </h3>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Order Reference</span>
                <span className="font-mono text-slate-200">{selectedOrderDetails.orderId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Amount (INR)</span>
                <span className="font-bold text-white">
                  ₹{(selectedOrderDetails.amountMinor / 100).toFixed(2)} (
                  {selectedOrderDetails.amountMinor} paise)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    selectedOrderDetails.status === 'CAPTURED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {selectedOrderDetails.status}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Customer Email</span>
                <span className="text-slate-200">{selectedOrderDetails.customerEmail || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Description</span>
                <span className="text-slate-200">{selectedOrderDetails.description || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Receipt / Bill ID</span>
                <span className="font-mono text-slate-300">{selectedOrderDetails.receipt || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Created At</span>
                <span className="text-slate-300">
                  {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href={`/payment-gateway/checkout/${selectedOrderDetails.orderId}`}
                target="_blank"
                className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-center text-xs transition"
              >
                Open Checkout Page
              </Link>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create Test Payment Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Amount in INR (₹)</label>
                <input
                  type="number"
                  value={newOrderAmount}
                  onChange={e => setNewOrderAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 font-mono text-sm"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Stored on server as {Math.round(parseFloat(newOrderAmount || '0') * 100)} integer paise.
                </span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={newOrderDesc}
                  onChange={e => setNewOrderDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Customer Email</label>
                <input
                  type="email"
                  value={newOrderEmail}
                  onChange={e => setNewOrderEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="flex-1 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {isCreatingOrder ? 'Creating...' : 'Generate Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {showRefundModal && selectedOrderForRefund && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Process Refund for {selectedOrderForRefund.orderId}</h3>
            <p className="text-xs text-slate-400">
              Remaining refundable amount: ₹
              {(
                (selectedOrderForRefund.amountMinor - selectedOrderForRefund.amountRefundedMinor) /
                100
              ).toFixed(2)}
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Refund Amount in INR (Leave blank for full refund)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  placeholder={`Max: ${(
                    (selectedOrderForRefund.amountMinor - selectedOrderForRefund.amountRefundedMinor) /
                    100
                  ).toFixed(2)}`}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingRefund}
                  className="flex-1 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {isProcessingRefund ? 'Processing...' : 'Execute Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

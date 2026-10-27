'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  QrCode,
  Info,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { GatewayClient, GatewayOrder } from '@/lib/gateway/gateway-client';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || 'order_bg_demo_101';

  const [order, setOrder] = useState<GatewayOrder | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [scenario, setScenario] = useState<
    'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'INCORRECT_PIN' | 'BANK_TIMEOUT' | 'CARD_EXPIRED' | 'FRAUD_BLOCKED'
  >('SUCCESS');

  // Form states (Simulated test details only)
  const [vpa, setVpa] = useState('kaushal@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4000 1234 5678 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [bank, setBank] = useState('HDFC');

  // Processing & Result states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    txnId?: string;
    errorMessage?: string;
    signature?: string;
  } | null>(null);

  // Load Order from Trusted Backend
  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      setIsLoadingOrder(true);
      setLoadError(null);
      try {
        const fetched = await GatewayClient.fetchOrderById(orderId);
        if (isMounted) {
          if (fetched) {
            setOrder(fetched);
          } else {
            setLoadError(`Order ${orderId} could not be found or has expired.`);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err.message || 'Error communicating with payment gateway.');
        }
      } finally {
        if (isMounted) setIsLoadingOrder(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handlePay = async () => {
    if (!order || isProcessing) return;

    // Reject processing if already captured or refunded
    if (order.status === 'CAPTURED' || order.status === 'REFUNDED') {
      setPaymentResult({
        success: order.status === 'CAPTURED',
        errorMessage: `This payment order has already been finalized as ${order.status}.`,
      });
      return;
    }

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const result = await GatewayClient.processSimulatedPayment({
        orderId: order.orderId,
        method: activeTab,
        scenario,
        methodDetails: {
          vpa: activeTab === 'UPI' ? vpa : undefined,
          cardLast4: activeTab === 'CARD' ? cardNumber.slice(-4) : undefined,
          bankCode: activeTab === 'NETBANKING' ? bank : undefined,
        },
      });

      setPaymentResult({
        success: result.success,
        txnId: result.attempt.gatewayTransactionId,
        signature: result.attempt.signature,
        errorMessage: result.errorMessage || result.attempt.errorMessage,
      });

      // Re-fetch authoritative status from server
      const refreshed = await GatewayClient.fetchOrderById(order.orderId);
      if (refreshed) {
        setOrder(refreshed);
      }
    } catch (err: any) {
      setPaymentResult({
        success: false,
        errorMessage: err.message || 'Payment processing failed unexpectedly.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs text-slate-400 font-medium">Verifying Order with Secure Gateway Server...</span>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <XCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold mb-2">Order Not Available</h2>
        <p className="text-xs text-slate-400 max-w-md mb-6">
          {loadError || 'The requested order could not be retrieved from the payment engine.'}
        </p>
        <Link
          href="/payment-gateway/merchant"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg transition"
        >
          Return to Merchant Console
        </Link>
      </div>
    );
  }

  const amountRupees = (order.amountMinor / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* Top Warning Banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-center text-xs font-medium text-amber-300 flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>SANDBOX SIMULATOR:</strong> Safe testing mode. No real cards, bank accounts, or credentials are used.
        </span>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 my-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Order Summary (Authoritative Backend Data) */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-600/30">
                  ₹
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-wide uppercase text-slate-200">BharatGateway™</h1>
                  <p className="text-[10px] text-slate-400">Autonomous Payment Rails</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Paying To</span>
                  <p className="text-sm font-semibold text-white">BharatYatra Retail & Travel</p>
                </div>

                <div>
                  <span className="text-xs text-slate-400">Order Reference</span>
                  <p className="text-xs font-mono text-slate-300 break-all">{order.orderId}</p>
                </div>

                <div>
                  <span className="text-xs text-slate-400">Description</span>
                  <p className="text-xs text-slate-300">{order.description || 'Verified Travel Service'}</p>
                </div>

                <div>
                  <span className="text-xs text-slate-400">Current Server Status</span>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.status === 'CAPTURED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : order.status === 'CREATED'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Total Amount</span>
                  <div className="text-3xl font-extrabold text-orange-400 mt-0.5">{amountRupees}</div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({order.amountMinor} paise — immutable server minor units)
                  </span>
                </div>
              </div>
            </div>

            {/* Test Simulator Controls */}
            <div className="mt-8 pt-4 border-t border-slate-800/80">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-orange-400" /> Simulator Test Scenario:
              </label>
              <select
                value={scenario}
                onChange={e => setScenario(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-orange-500"
              >
                <option value="SUCCESS">✅ Success (Payment Captured)</option>
                <option value="INSUFFICIENT_FUNDS">❌ Insufficient Funds Error</option>
                <option value="INCORRECT_PIN">❌ Authentication PIN Failure</option>
                <option value="BANK_TIMEOUT">❌ Issuer Bank Switch Timeout</option>
                <option value="CARD_EXPIRED">❌ Card Expired Error</option>
                <option value="FRAUD_BLOCKED">🚨 Automated Fraud Rule Block</option>
              </select>
            </div>
          </div>

          {/* Right Column: Payment Form */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between">
            {paymentResult ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                {paymentResult.success ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Payment Successful!</h2>
                    <p className="text-xs text-slate-400 mb-6">
                      Your transaction has been recorded in the append-only ledger.
                    </p>

                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs font-mono mb-6">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Transaction ID:</span>
                        <span className="text-slate-300 truncate max-w-[200px]">{paymentResult.txnId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">HMAC Signature:</span>
                        <span className="text-emerald-400 truncate max-w-[200px]">
                          {paymentResult.signature?.substring(0, 24)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">State Engine:</span>
                        <span className="text-emerald-400">CAPTURED</span>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => setPaymentResult(null)}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition"
                      >
                        Try Another Test
                      </button>
                      <Link
                        href="/payment-gateway/merchant"
                        className="flex-1 px-4 py-2.5 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-500 transition text-center"
                      >
                        View in Dashboard
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                      <XCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Payment Declined</h2>
                    <p className="text-xs text-rose-400 mb-6">
                      {paymentResult.errorMessage || 'Transaction declined by bank switch.'}
                    </p>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left text-xs mb-6 w-full space-y-2">
                      <span className="font-semibold text-slate-300 block">Recommended Action:</span>
                      <p className="text-slate-400 text-[11px]">
                        Review payment instrument details or switch to a different test scenario. No funds were debited.
                      </p>
                    </div>

                    <button
                      onClick={() => setPaymentResult(null)}
                      className="w-full px-4 py-2.5 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-500 transition"
                    >
                      Retry Payment
                    </button>
                  </>
                )}
              </div>
            ) : order.status === 'CAPTURED' ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Order Already Paid</h3>
                <p className="text-xs text-slate-400">
                  This payment order was previously captured and settled. Duplicate submissions are prevented by the
                  state machine.
                </p>
                <Link
                  href="/payment-gateway/merchant"
                  className="inline-block px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Return to Merchant Dashboard
                </Link>
              </div>
            ) : (
              <div>
                {/* Payment Methods Nav */}
                <div className="flex border-b border-slate-800 mb-6">
                  <button
                    onClick={() => setActiveTab('UPI')}
                    className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition border-b-2 ${
                      activeTab === 'UPI'
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> UPI Intent / VPA
                  </button>
                  <button
                    onClick={() => setActiveTab('CARD')}
                    className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition border-b-2 ${
                      activeTab === 'CARD'
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Credit / Debit Card
                  </button>
                  <button
                    onClick={() => setActiveTab('NETBANKING')}
                    className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold transition border-b-2 ${
                      activeTab === 'NETBANKING'
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> NetBanking
                  </button>
                </div>

                {/* Tab: UPI */}
                {activeTab === 'UPI' && (
                  <div className="space-y-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                      <QrCode className="w-24 h-24 mx-auto text-slate-300 p-2 bg-white rounded-lg shadow-inner" />
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Or enter Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={vpa}
                        onChange={e => setVpa(e.target.value)}
                        placeholder="username@bank"
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                {/* Tab: CARD */}
                {activeTab === 'CARD' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Test Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Zero card storage. Card credentials never leave local simulator memory.</span>
                    </div>
                  </div>
                )}

                {/* Tab: NetBanking */}
                {activeTab === 'NETBANKING' && (
                  <div className="space-y-3">
                    <label className="text-xs text-slate-400 mb-1 block">Select Banking Institution</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['HDFC', 'SBI', 'ICICI', 'AXIS'].map(bankName => (
                        <button
                          key={bankName}
                          type="button"
                          onClick={() => setBank(bankName)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                            bank === bankName
                              ? 'border-orange-500 bg-orange-600/10 text-orange-400'
                              : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{bankName} Bank</span>
                          {bank === bankName && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pay Action Button */}
                <div className="mt-8">
                  <button
                    disabled={isProcessing}
                    onClick={handlePay}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Authorizing via Simulator...
                      </>
                    ) : (
                      <>
                        Pay {amountRupees} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800/60 mt-6 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> 256-bit Encrypted Simulator
              </span>
              <span>BharatGateway Core v1.0</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-900">
        BharatGateway™ — Independent Zero-Lockin Payment Software Engine.
      </footer>
    </div>
  );
}

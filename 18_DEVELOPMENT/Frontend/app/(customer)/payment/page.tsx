'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { useAuth } from '@/lib/auth/auth-context';

function PaymentPageContent() {
  const { user } = useAuth();
  const router = useRouter();

  // Prototype State Controller
  const [prototypeState, setPrototypeState] = useState<'default' | 'processing' | 'partial' | 'success' | 'failure' | 'pending'>('default');

  // Active Payment Method Tab
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallets'>('upi');

  // Form Inputs & Interactivity
  const [upiId, setUpiId] = useState('kaushal.patel@okhdfcbank');
  const [isUpiVerified, setIsUpiVerified] = useState(true);

  // Promo Code State
  const [isPromoOpen, setIsPromoOpen] = useState(true);
  const [promoCode, setPromoCode] = useState('FARVA-WHITE-RANN');
  const [isPromoApplied, setIsPromoApplied] = useState(true);

  // Card Form Details
  const [cardNumber, setCardNumber] = useState('4821 9840 2931 4821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardName, setCardName] = useState('DEVRAJ VAGHELA');

  const triggerPayment = () => {
    setPrototypeState('processing');
    setTimeout(() => {
      setPrototypeState('success');
    }, 2500);
  };

  const handleVerifyUpi = () => {
    setIsUpiVerified(true);
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-slate-100 antialiased flex flex-col justify-between selection:bg-[#FED65B] selection:text-[#0A1128]">
      {/* Prototype State Controller */}
      <div className="bg-[#1A223F] border-b border-[#232D52] text-xs px-4 py-2 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-slate-300 font-semibold uppercase tracking-wider">State Engine:</span>
          <span className="text-[#FED65B] font-medium">/payment</span>
          <span className="text-slate-400 hidden sm:inline">| Step 3: Secure Settlement</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {[
            { id: 'default', label: 'Default View' },
            { id: 'processing', label: 'Processing Modal' },
            { id: 'partial', label: 'Partial Status Warning' },
            { id: 'success', label: 'Payment Success' },
            { id: 'failure', label: 'Payment Failed' },
            { id: 'pending', label: 'Payment Pending' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPrototypeState(item.id as any)}
              className={`px-2.5 py-1 rounded font-medium text-[11px] transition ${prototypeState === item.id ? 'bg-[#FED65B] text-[#0A1128] font-bold shadow-sm' : 'bg-[#11172D] border border-[#232D52] text-slate-300 hover:border-[#FED65B]/50'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Header */}
      <header className="border-b border-[#232D52]/70 bg-[#141A32]/80 backdrop-blur-lg sticky top-9 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-[#FED65B]/30 bg-[#11172D] flex items-center justify-center p-1">
              <img src="/logo.png" alt="BharatYatra Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white group-hover:text-[#FED65B] transition">BharatYatra</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-[#FED65B]/15 text-[#FED65B] border border-[#FED65B]/30 font-semibold uppercase">PAYMENT GATEWAY</span>
              </div>
              <span className="text-xs text-slate-400 font-medium tracking-wide">ભારત યાત્રા • Sovereign Gujarat Travel Engine</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified_user</span>
              <span>256-bit Bank Grade Encrypted</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <a href="tel:18002031111" className="hidden sm:flex items-center gap-1.5 hover:text-[#FED65B] transition text-slate-300">
                <span className="material-symbols-outlined text-[#FED65B] text-[18px]">support_agent</span>
                <span>Concierge: 1800 203 1111</span>
              </a>
              <div className="h-4 w-px bg-[#232D52] hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FED65B]/20 border border-[#FED65B] text-[#FED65B] font-bold text-xs flex items-center justify-center">
                  {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'BY'}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden lg:inline">{user?.fullName || 'Traveler'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Checkout Progress Tracker */}
      <nav aria-label="Progress" className="bg-[#0D1530] border-b border-[#232D52] py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5 z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Step 1</p>
                <p className="text-xs font-semibold text-slate-200">Review Services</p>
              </div>
            </div>

            <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-emerald-500/40"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2.5 z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Step 2</p>
                <p className="text-xs font-semibold text-slate-200">Traveler Manifest</p>
              </div>
            </div>

            <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-[#FED65B]"></div>

            {/* Step 3 (Active) */}
            <div className="flex items-center gap-2.5 z-10">
              <div className="w-8 h-8 rounded-full bg-[#FED65B] text-[#0A1128] flex items-center justify-center text-xs font-bold shadow-lg animate-pulse">
                3
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#FED65B] font-semibold">Current Step</p>
                <p className="text-xs font-bold text-white">Payment &amp; Review</p>
              </div>
            </div>

            <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-[#232D52]"></div>

            {/* Step 4 */}
            <div className="flex items-center gap-2.5 z-10 opacity-50">
              <div className="w-8 h-8 rounded-full bg-[#11172D] border border-[#232D52] text-slate-400 flex items-center justify-center text-xs font-semibold">
                4
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Step 4</p>
                <p className="text-xs font-medium text-slate-400">Confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex-1 w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#232D52] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FED65B]/10 border border-[#FED65B]/20 text-[#FED65B] text-xs font-medium mb-3">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Secure Sovereign Payment Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Complete your booking
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1.5 max-w-2xl">
              Review your unified Gujarat itinerary total and select your preferred sovereign payment channel.
            </p>
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-300 bg-[#11172D]/60 px-4 py-2.5 rounded-xl border border-[#232D52]/80">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
              <span>Zero Markups</span>
            </div>
            <div className="h-3.5 w-px bg-[#232D52]"></div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#FED65B] text-[18px]">bolt</span>
              <span>Instant UPI Sync</span>
            </div>
            <div className="h-3.5 w-px bg-[#232D52]"></div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sky-400 text-[18px]">published_with_changes</span>
              <span>IRCTC/GSRTC Link Shield</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* LEFT COLUMN: Payment Methods */}
          <div className="lg:col-span-7 space-y-6">

            {/* SAVED PAYMENT METHOD CARD */}
            <div className="bg-[#11172D] border border-[#232D52]/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FED65B]/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FED65B] text-[18px]">bookmark</span>
                  Saved Fast Settlement
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Auto-Authenticated</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1A223F] border border-[#FED65B]/30 hover:border-[#FED65B] transition group">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-700 to-indigo-950 border border-blue-400/30 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
                    VISA
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-[#FED65B] transition flex items-center gap-2">
                      HDFC Regalia Gold •••• 4821
                      <span className="text-[10px] text-slate-400 font-normal">Exp 08/28</span>
                    </p>
                    <p className="text-xs text-slate-400">Devraj Vaghela • Domestic Travel Lounge Enabled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPaymentMethod('card')} className="px-4 py-2 rounded-lg bg-[#FED65B] text-[#0A1128] font-bold text-xs hover:bg-[#ECC345] transition shadow-sm">
                    Use this card
                  </button>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD SELECTION TABS */}
            <div className="bg-[#11172D] border border-[#232D52]/90 rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#FED65B] text-[22px]">credit_card</span>
                  Choose payment method
                </h2>
                <span className="text-xs text-slate-400">All Indian Banks &amp; UPI IDs Supported</span>
              </div>

              {/* Method Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${paymentMethod === 'upi' ? 'border-[#FED65B] bg-[#FED65B]/10' : 'border-[#232D52] bg-[#1A223F] hover:border-[#FED65B]/50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#FED65B]/20 flex items-center justify-center text-[#FED65B]">
                    <span className="material-symbols-outlined text-[18px]">smartphone</span>
                  </div>
                  <span className="text-xs font-semibold text-white">UPI / QR</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Zero Surcharge</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${paymentMethod === 'card' ? 'border-[#FED65B] bg-[#FED65B]/10' : 'border-[#232D52] bg-[#1A223F] hover:border-[#FED65B]/50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Credit / Debit</span>
                  <span className="text-[10px] text-slate-400">All Major Cards</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${paymentMethod === 'netbanking' ? 'border-[#FED65B] bg-[#FED65B]/10' : 'border-[#232D52] bg-[#1A223F] hover:border-[#FED65B]/50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Net Banking</span>
                  <span className="text-[10px] text-slate-400">50+ Banks</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('wallets')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${paymentMethod === 'wallets' ? 'border-[#FED65B] bg-[#FED65B]/10' : 'border-[#232D52] bg-[#1A223F] hover:border-[#FED65B]/50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-[18px]">wallet</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Wallets</span>
                  <span className="text-[10px] text-slate-400">Paytm, PhonePe</span>
                </button>
              </div>

              {/* PANEL 1: UPI */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#1A223F]/80 border border-[#232D52]">
                    <label className="block text-xs font-medium text-slate-300 mb-2">Enter Virtual Payment Address (VPA / UPI ID)</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@bank or mobile@upi"
                          className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED65B]"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">@upi</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyUpi}
                        className="px-5 py-2.5 rounded-xl bg-[#FED65B] text-[#0A1128] font-bold text-xs hover:bg-[#ECC345] transition shadow-md whitespace-nowrap"
                      >
                        Verify UPI
                      </button>
                    </div>

                    {isUpiVerified && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                        <span>UPI ID verified: <strong>{user?.fullName || 'Verified Traveler'} (HDFC Bank Ltd.)</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                    <span>Supported UPI Apps:</span>
                    <div className="flex items-center gap-3 text-slate-300 font-medium">
                      <span className="px-2 py-0.5 rounded bg-[#1A223F] border border-[#232D52]">GPay</span>
                      <span className="px-2 py-0.5 rounded bg-[#1A223F] border border-[#232D52]">PhonePe</span>
                      <span className="px-2 py-0.5 rounded bg-[#1A223F] border border-[#232D52]">Paytm</span>
                      <span className="px-2 py-0.5 rounded bg-[#1A223F] border border-[#232D52]">BHIM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 2: CARDS */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  {/* Card Preview Graphic */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 via-[#141A32] to-[#1A223F] border border-[#FED65B]/30 shadow-2xl relative overflow-hidden text-white">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#FED65B]">BharatYatra Verified Gateway</span>
                        <p className="text-sm font-bold text-slate-200 mt-0.5">Sovereign Travel Card</p>
                      </div>
                      <span className="material-symbols-outlined text-[#FED65B]/80 text-[20px]">wifi</span>
                    </div>
                    <div className="font-mono text-lg tracking-widest text-slate-100 mb-4">
                      {cardNumber}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Card Holder</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">{cardName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Expires</span>
                        <span className="text-xs font-mono text-slate-200">{cardExpiry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED65B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Expiration Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM / YY"
                        className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED65B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Security Code (CVV)</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED65B]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Name on Card</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Devraj Vaghela"
                        className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FED65B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 3: NET BANKING */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 font-medium">Select your preferred Indian bank for secure gateway redirection:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {['HDFC', 'SBI', 'ICICI', 'AXIS', 'BOB', 'KOTAK'].map((bank) => (
                      <button key={bank} className="p-2.5 rounded-xl bg-[#1A223F] border border-[#232D52] hover:border-[#FED65B] transition text-left flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-amber-900/40 text-amber-300 text-[10px] font-bold flex items-center justify-center">{bank}</span>
                        <span className="text-xs text-slate-200">{bank} Bank</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PANEL 4: WALLETS */}
              {paymentMethod === 'wallets' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#1A223F] border border-[#232D52] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-900/50 flex items-center justify-center text-sky-400 font-bold text-xs">P</div>
                        <div>
                          <p className="text-xs font-semibold text-white">Paytm Wallet</p>
                          <p className="text-[10px] text-slate-400">Linked to +91 98250 •••••</p>
                        </div>
                      </div>
                      <button className="text-xs text-[#FED65B] font-semibold hover:underline">Link</button>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1A223F] border border-[#232D52] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold text-xs">PP</div>
                        <div>
                          <p className="text-xs font-semibold text-white">PhonePe Wallet</p>
                          <p className="text-[10px] text-slate-400">Direct wallet balance</p>
                        </div>
                      </div>
                      <button className="text-xs text-[#FED65B] font-semibold hover:underline">Link</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PROMO CODE SECTION */}
            <div className="bg-[#11172D] border border-[#232D52]/90 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsPromoOpen(!isPromoOpen)}>
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#FED65B] text-[20px]">local_offer</span>
                  <span className="text-sm font-semibold text-white">Have a sovereign promotion or concession code?</span>
                </div>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${isPromoOpen ? '' : '-rotate-90'}`}>expand_more</span>
              </div>

              {isPromoOpen && (
                <div className="mt-4 pt-4 border-t border-[#232D52]/60">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. GUJARAT2026 or VOIDHEAT"
                      className="flex-1 bg-[#0E152F] border border-[#232D52] rounded-xl px-4 py-2 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-[#FED65B]"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPromoApplied(true)}
                      className="px-4 py-2 rounded-xl bg-[#1A223F] border border-[#FED65B]/40 text-[#FED65B] hover:bg-[#FED65B] hover:text-[#0A1128] font-bold text-xs transition"
                    >
                      Apply Code
                    </button>
                  </div>
                  {isPromoApplied && (
                    <div className="mt-2.5 flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">sparkles</span>
                        <span>Promo code <strong>FARVA-WHITE-RANN</strong> applied! (₹1,500 Sovereign Grant)</span>
                      </span>
                      <button onClick={() => setIsPromoApplied(false)} className="text-[11px] text-slate-400 hover:text-rose-400">Remove</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BILLING & GSTIN DETAILS */}
            <div className="bg-[#11172D] border border-[#232D52]/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#FED65B] text-[20px]">description</span>
                  <h3 className="text-sm font-bold text-white">Billing Details &amp; GSTIN (Optional)</h3>
                </div>
                <span className="text-[11px] text-slate-400">Tax Invoice Dispatched via DigiLocker</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Full Legal Name</label>
                  <input type="text" defaultValue={user?.fullName || ''} placeholder="Full Legal Name" className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FED65B]" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Registered Email</label>
                  <input type="email" defaultValue={user?.email || ''} placeholder="name@example.com" className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FED65B]" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">GSTIN Number (Corporate Credit)</label>
                  <input type="text" defaultValue="24AAACC1206K1ZV" className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-3.5 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#FED65B]" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Enterprise Business Name</label>
                  <input type="text" defaultValue="Sovereign Travel Studio LLP" className="w-full bg-[#0E152F] border border-[#232D52] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#FED65B]" />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#232D52] bg-[#0E152F] text-[#FED65B] focus:ring-[#FED65B] accent-[#FED65B]" />
                <span className="text-xs text-slate-300">Generate 100% GST tax-compliant enterprise receipt with Input Tax Credit</span>
              </label>
            </div>

            {/* CONTACT DISPATCH */}
            <div className="bg-[#1A223F]/50 border border-[#232D52] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FED65B]/10 border border-[#FED65B]/20 flex items-center justify-center text-[#FED65B] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">notifications</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Instant confirmation &amp; live PNR updates will be sent to:</p>
                  <p className="text-slate-400 mt-0.5">
                    <span className="text-slate-200 font-mono">kaushal.patel@farvavoyager.in</span> • <span className="text-slate-200 font-mono">+91 98250 •••••</span>
                  </p>
                </div>
              </div>
              <button className="text-xs text-[#FED65B] font-semibold hover:underline whitespace-nowrap">
                Edit Contact Details
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#11172D]/60 border border-[#232D52]/60 text-center">
                <span className="material-symbols-outlined text-emerald-400 text-[20px] mb-1">lock</span>
                <p className="text-[11px] font-semibold text-white">256-Bit Vault</p>
                <p className="text-[10px] text-slate-400">Zero Plaintext Data</p>
              </div>
              <div className="p-3 rounded-xl bg-[#11172D]/60 border border-[#232D52]/60 text-center">
                <span className="material-symbols-outlined text-[#FED65B] text-[20px] mb-1">verified</span>
                <p className="text-[11px] font-semibold text-white">Direct Operator Sync</p>
                <p className="text-[10px] text-slate-400">GSRTC &amp; Forest Direct</p>
              </div>
              <div className="p-3 rounded-xl bg-[#11172D]/60 border border-[#232D52]/60 text-center">
                <span className="material-symbols-outlined text-sky-400 text-[20px] mb-1">schedule</span>
                <p className="text-[11px] font-semibold text-white">Instant Confirmation</p>
                <p className="text-[10px] text-slate-400">Real-Time SMS Pass</p>
              </div>
              <div className="p-3 rounded-xl bg-[#11172D]/60 border border-[#232D52]/60 text-center">
                <span className="material-symbols-outlined text-purple-400 text-[20px] mb-1">headset_mic</span>
                <p className="text-[11px] font-semibold text-white">24/7 Sovereign Care</p>
                <p className="text-[10px] text-slate-400">1800 203 1111</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Sticky CTA */}
          <div className="lg:col-span-5 space-y-6 sticky top-32">

            {/* TRIP SUMMARY CARD */}
            <div className="bg-[#11172D] border border-[#232D52]/90 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#232D52]/80 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#FED65B] uppercase font-semibold">SOVEREIGN EXPEDITION DOSSIER</span>
                  <h3 className="text-base sm:text-lg font-bold text-white">Kutch &amp; Girnar Heritage Corridor</h3>
                  <p className="text-xs text-slate-400">Ahmedabad → Dhordo (Kutch) → Junagadh • 18–22 Dec 2026</p>
                </div>
                <Link href="/checkout" className="text-xs text-[#FED65B] font-semibold hover:underline flex items-center gap-1">
                  <span>Edit</span>
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </Link>
              </div>

              {/* Manifest Badges */}
              <div className="flex items-center gap-2 text-xs text-slate-300 mb-5">
                <span className="px-2.5 py-1 rounded-full bg-[#1A223F] border border-[#232D52] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#FED65B] text-[16px]">group</span>
                  3 Travelers (2 Adults, 1 Child)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#1A223F] border border-[#232D52] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sky-400 text-[16px]">explore</span>
                  4 Services Unified
                </span>
              </div>

              {/* 4 Unified Services */}
              <div className="space-y-3">
                {/* 1. Bus */}
                <div className="p-3 rounded-xl bg-[#1A223F]/60 border border-[#232D52]/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">GSRTC Multi-Axle Volvo B11R</p>
                      <span className="text-xs font-mono font-semibold text-slate-200">₹2,760</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Ahmedabad ISKCON → Bhuj • Berths L14, L15, L16</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Seat Pre-Locked</span>
                      <span className="text-[10px] text-slate-400">18 Dec, 22:30 IST</span>
                    </div>
                  </div>
                </div>

                {/* 2. Stay */}
                <div className="p-3 rounded-xl bg-[#1A223F]/60 border border-[#232D52]/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FED65B]/10 border border-[#FED65B]/20 text-[#FED65B] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">hotel</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">Nawab Heritage Haveli &amp; Courtyard</p>
                      <span className="text-xs font-mono font-semibold text-slate-200">₹25,000</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Royal Nawabi Darbar Suite • 2 Nights (Junagadh)</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Direct Haveli Quota</span>
                      <span className="text-[10px] text-slate-400">19–21 Dec</span>
                    </div>
                  </div>
                </div>

                {/* 3. Experience */}
                <div className="p-3 rounded-xl bg-[#1A223F]/60 border border-[#232D52]/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">brush</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">Master Rogan Art Fabric Guild</p>
                      <span className="text-xs font-mono font-semibold text-slate-200">₹5,400</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Nirona Village • Private 3.5h Masterclass (3 Pax)</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Guild Pass Synced</span>
                      <span className="text-[10px] text-slate-400">19 Dec, 10:00 IST</span>
                    </div>
                  </div>
                </div>

                {/* 4. Dining */}
                <div className="p-3 rounded-xl bg-[#1A223F]/60 border border-[#232D52]/80 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">restaurant</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">Rajwadi Royal Thali Baithak</p>
                      <span className="text-xs font-mono font-semibold text-slate-200">₹3,750</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Kansa Table Reserved • 18-Dish Kathiyawadi Feast</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Table Locked</span>
                      <span className="text-[10px] text-slate-400">20 Dec, 19:30 IST</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-5 border-t border-[#232D52]/80 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>GSRTC Bus Corridor (3 Sleeper Berths)</span>
                  <span className="font-mono text-slate-200">₹2,760</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Heritage Haveli Suite (2 Nights)</span>
                  <span className="font-mono text-slate-200">₹25,000</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Rogan Art Masterclass Guild</span>
                  <span className="font-mono text-slate-200">₹5,400</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Authentic Kathiyawadi Dining</span>
                  <span className="font-mono text-slate-200">₹3,750</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-[#232D52]/40">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">₹36,910</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes &amp; GSTIN Telemetry (5% Transit + 12% Haveli)</span>
                  <span className="font-mono text-slate-200">₹3,240</span>
                </div>
                {isPromoApplied && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">local_offer</span>
                      Sovereign Winter Promo (FARVA-WHITE-RANN)
                    </span>
                    <span className="font-mono">−₹1,500</span>
                  </div>
                )}

                {/* Total */}
                <div className="mt-4 p-4 rounded-xl bg-[#1A223F] border border-[#FED65B]/40 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">FINAL PAYABLE AMOUNT</span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span> All-Inclusive No Hidden Fees
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#FED65B] tracking-tight">
                      ₹{isPromoApplied ? '38,650' : '40,150'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">INR Indian Rupee</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center italic mt-1">
                  “Final prices are verified with Gujarat state transport &amp; sanctuary authorities before settlement.”
                </p>
              </div>

              {/* Main Pay Action */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={triggerPayment}
                  className="w-full py-4 px-6 rounded-xl bg-[#FED65B] hover:bg-[#ECC345] text-[#0A1128] font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-xl transition transform active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-[#0A1128] text-[20px]">shield_lock</span>
                  <span>Pay ₹{isPromoApplied ? '38,650' : '40,150'} &amp; Book Full Journey</span>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  By continuing, you agree to the BharatYatra{' '}
                  <Link href="/terms" className="text-[#FED65B] hover:underline">Booking Terms</Link>,{' '}
                  <Link href="/privacy" className="text-[#FED65B] hover:underline">Free Cancellation Window</Link>, and{' '}
                  <Link href="/privacy" className="text-[#FED65B] hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#11172D]/60 border border-[#232D52] text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="material-symbols-outlined text-[18px]">sparkles</span>
                <span>Farva Assured Guarantee</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Free cancellation permitted up to 24 hours prior to first departure. Instant UPI reversal to source account guaranteed.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Mobile Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0E152F]/95 backdrop-blur-xl border-t border-[#FED65B]/30 p-4 z-40 shadow-2xl flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">Total (4 Services)</span>
          <span className="text-xl font-extrabold text-[#FED65B]">₹{isPromoApplied ? '38,650' : '40,150'}</span>
        </div>
        <button onClick={triggerPayment} className="flex-1 py-3 px-5 rounded-xl bg-[#FED65B] text-[#0A1128] font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition">
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>Pay &amp; Book Now →</span>
        </button>
      </div>

      {/* MODAL 1: PROCESSING */}
      {prototypeState === 'processing' && (
        <div className="fixed inset-0 z-50 bg-[#0A1128]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#11172D] border border-[#FED65B]/40 rounded-3xl p-8 text-center shadow-2xl relative">
            <div className="w-20 h-20 rounded-full bg-[#FED65B]/10 border-2 border-[#FED65B] flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-[#FED65B] animate-spin"></div>
              <span className="material-symbols-outlined text-[#FED65B] text-[32px]">shield_lock</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FED65B] font-bold">256-Bit Gateway Dispatch</span>
            <h3 className="text-2xl font-extrabold text-white mt-2">Processing your payment…</h3>
            <p className="text-sm text-slate-300 mt-2">
              Connecting with HDFC / UPI gateway and securing your berths and haveli quarters.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-[#1A223F] border border-[#232D52] text-xs text-left space-y-2.5">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Bank token authenticated</span>
                <span className="font-mono text-[10px]">0.4s</span>
              </div>
              <div className="flex items-center justify-between text-[#FED65B]">
                <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-[#FED65B] border-t-transparent animate-spin"></span> Confirming GSRTC Volvo berths (L14-L16)</span>
                <span className="font-mono text-[10px]">Syncing...</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">schedule</span> Vaulting Nawabi Darbar Haveli voucher</span>
                <span className="font-mono text-[10px]">Queued</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[#FED65B] text-[16px]">info</span>
              Please do not refresh this window or press the back button.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 2: SUCCESS */}
      {prototypeState === 'success' && (
        <div className="fixed inset-0 z-50 bg-[#0A1128]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#11172D] border border-emerald-500/50 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-5 text-emerald-400">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">TRANSACTION SETTLED</span>
            <h3 className="text-2xl font-bold text-white mt-1">Payment Successful!</h3>
            <p className="text-sm text-slate-300 mt-1">
              ₹38,650 paid successfully via UPI (VPA: kaushal.patel@okhdfcbank).
            </p>
            
            <div className="mt-5 p-4 rounded-xl bg-[#1A223F] border border-[#232D52] text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Reference:</span>
                <span className="font-mono text-[#FED65B] font-bold">CF-PAY-982410-GUJ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unified PNR ID:</span>
                <span className="font-mono text-slate-200">GSRTC-9204-KUTCH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DigiLocker Pass Status:</span>
                <span className="text-emerald-400 font-semibold">Synced to Apple/Google Wallet</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/trips/1" className="flex-1 py-3 px-4 rounded-xl bg-[#FED65B] text-[#0A1128] font-bold text-xs hover:bg-[#ECC345] transition text-center shadow-md">
                Go to My Trips &amp; Live Pass →
              </Link>
              <button onClick={() => setPrototypeState('default')} className="px-4 py-3 rounded-xl bg-[#1A223F] border border-[#232D52] text-slate-300 text-xs hover:text-white transition">
                Dismiss Prototype
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FAILURE */}
      {prototypeState === 'failure' && (
        <div className="fixed inset-0 z-50 bg-[#0A1128]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#11172D] border border-rose-500/50 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <span className="material-symbols-outlined text-[32px]">close</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">PAYMENT NOT COMPLETED</span>
            <h3 className="text-2xl font-bold text-white mt-1">Settlement Interrupted</h3>
            <p className="text-sm text-slate-300 mt-2">
              No payment was taken from your account. The bank session timed out or UPI PIN verification was declined.
            </p>

            <div className="mt-5 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-left text-slate-300">
              <p className="font-semibold text-rose-300">Your selected inventory is safe:</p>
              <p className="text-[11px] text-slate-400 mt-0.5">GSRTC Sleeper Berths L14-L16 and Haveli suites are held for another <strong>11 mins 40 secs</strong>.</p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button onClick={() => setPrototypeState('default')} className="w-full py-3 px-4 rounded-xl bg-[#FED65B] text-[#0A1128] font-bold text-xs hover:bg-[#ECC345] transition">
                Try Payment Again (Instant UPI / Card)
              </button>
              <button onClick={() => setPrototypeState('default')} className="w-full py-2.5 px-4 rounded-xl bg-[#1A223F] border border-[#232D52] text-slate-300 text-xs hover:text-white transition">
                Choose Another Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PARTIAL WARNING */}
      {prototypeState === 'partial' && (
        <div className="fixed inset-0 z-50 bg-[#0A1128]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#11172D] border border-amber-500/50 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">UNIFIED TRAVEL EXCEPTION</span>
            <h3 className="text-xl font-bold text-white mt-1">Some bookings need attention</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Payment succeeded for ₹35,890. 3 of 4 services are confirmed, while 1 requires operator resolution.
            </p>

            <div className="mt-5 space-y-2 text-xs text-left">
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-emerald-300">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Nawab Heritage Haveli (2 Nights)</span>
                <span className="font-bold">CONFIRMED</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-emerald-300">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">check</span> Master Rogan Art Guild Workshop</span>
                <span className="font-bold">CONFIRMED</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">schedule</span> GSRTC Volvo Berth Sync</span>
                <span className="font-bold">GATEWAY PENDING</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Link href="/trips/1" className="flex-1 py-3 px-4 rounded-xl bg-[#FED65B] text-[#0A1128] font-bold text-xs hover:bg-[#ECC345] transition text-center">
                Review Booking Status
              </Link>
              <button onClick={() => setPrototypeState('default')} className="px-4 py-3 rounded-xl bg-[#1A223F] border border-[#232D52] text-slate-300 text-xs hover:text-white transition">
                Return to Payment View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PENDING */}
      {prototypeState === 'pending' && (
        <div className="fixed inset-0 z-50 bg-[#0A1128]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#11172D] border border-sky-500/50 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center mx-auto mb-4 text-sky-400">
              <span className="material-symbols-outlined text-[32px] animate-spin">hourglass_empty</span>
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">BANK CLEARANCE IN FLIGHT</span>
            <h3 className="text-xl font-bold text-white mt-1">Payment status is being confirmed</h3>
            <p className="text-xs text-slate-300 mt-2">
              We&apos;re awaiting final authorization callback from your bank. Please do not re-submit to prevent double debits.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <button onClick={() => setPrototypeState('success')} className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0A1128] font-bold text-xs transition">
                Check Settlement Status Now
              </button>
              <button onClick={() => setPrototypeState('default')} className="w-full py-2.5 px-4 rounded-xl bg-[#1A223F] border border-[#232D52] text-slate-300 text-xs hover:text-white transition">
                Go to My Trips
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="border-t border-[#232D52]/80 bg-[#070C1E] py-8 text-xs text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#FED65B]/10 border border-[#FED65B]/30 p-1 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-slate-300 font-semibold font-heading">BharatYatra Sovereign Voyager</span>
            <span className="text-slate-600">|</span>
            <span>24/7 Ground Helpline: <strong className="text-[#FED65B]">1800 203 1111</strong></span>
          </div>
          <div className="flex items-center gap-6 text-slate-400 text-[11px]">
            <span>RBI Compliant Payment Router</span>
            <Link href="/terms" className="hover:text-[#FED65B] transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#FED65B] transition">Privacy &amp; DigiLocker</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <PaymentPageContent />
    </ProtectedRoute>
  );
}


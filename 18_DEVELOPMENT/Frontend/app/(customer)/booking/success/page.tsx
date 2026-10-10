'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BookingSuccessPage() {
  const [prototypeState, setPrototypeState] = useState<'default' | 'partial' | 'delayed'>('default');
  const [modalProcessing, setModalProcessing] = useState<boolean>(false);
  const [modalShare, setModalShare] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copyTooltip, setCopyTooltip] = useState<boolean>(false);
  const [busDetailExpanded, setBusDetailExpanded] = useState<boolean>(false);
  const [haveliDetailExpanded, setHaveliDetailExpanded] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const copyBookingRef = () => {
    navigator.clipboard.writeText('CF-GUJ-982410').then(() => {
      setCopyTooltip(true);
      setTimeout(() => setCopyTooltip(false), 2000);
      showToast('Booking Reference CF-GUJ-982410 copied to clipboard.');
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText('https://chalofarva.gujarat.in/trips/share/CF-GUJ-982410?access=read').then(() => {
      showToast('Private expedition link copied to clipboard.');
    });
  };

  const simulateRefresh = () => {
    showToast('Contacting GSRTC State Gateway... PNR confirmed.');
    setTimeout(() => setPrototypeState('default'), 1200);
  };

  const downloadTravelPack = () => {
    showToast('Generating Sovereign Travel Pack PDF (Passbook + Barcodes)...');
    setTimeout(() => {
      showToast('Travel Pack downloaded successfully: CF-GUJ-982410.pdf');
    }, 1500);
  };

  const emailTravelPack = () => {
    showToast('Pack dispatched to kaushal.patel@farvavoyager.in');
  };

  const downloadInvoice = () => {
    showToast('Generating GST Tax Invoice (24AAACC1206K1ZV)...');
    setTimeout(() => {
      showToast('Invoice saved to your downloads.');
    }, 1000);
  };

  const addToCalendar = () => {
    showToast('Expedition dates (18–22 Dec 2026) exported to Calendar (.ics)');
  };

  const startWhatsAppConcierge = () => {
    window.open('https://api.whatsapp.com/send?phone=9118002031111&text=Hello%20Virbhadra,%20I%20am%20Kaushal%20Patel%20with%20Booking%20CF-GUJ-982410', '_blank');
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-3 rounded-xl shadow-2xl flex items-center gap-space-sm transition-all duration-300">
          <span className="material-symbols-outlined text-primary-container text-base">check_circle</span>
          <span className="font-body-md text-body-md">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <Link href="/" className="flex items-center justify-center">
              <img
                alt="BharatYatra Emblem"
                className="w-10 h-10 object-contain rounded-lg shadow-sm"
                src="/logo.png"
              />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-title-lg text-title-lg text-on-surface tracking-tight font-bold">BHARAT YATRA</span>
                <span className="px-space-xs py-0.5 rounded bg-primary-container font-label-caps text-label-caps text-on-primary-container tracking-wider uppercase">SOVEREIGN</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant tracking-normal">ભારત યાત્રા • Sovereign Gujarat Travel Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-space-lg">
            <nav className="hidden md:flex items-center gap-space-md">
              <Link className="transition-colors text-primary font-bold" href="/booking/success">Confirmation</Link>
              <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/my-trips">My Trips</Link>
              <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/experiences">Curated Itinerary</Link>
            </nav>
            <div className="hidden lg:flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-low rounded-full shadow-[0_2px_8px_-2px_rgba(20,26,50,0.04)]">
              <span className="material-symbols-outlined text-primary text-base">headset_mic</span>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Concierge:</span>
              <a className="font-label-lg text-label-lg text-on-surface font-semibold hover:text-primary transition-colors" href="tel:18002031111">1800 203 1111</a>
            </div>
            <Link href="/profile" className="flex items-center gap-space-sm pl-space-sm">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="font-label-md text-label-md text-on-surface font-medium">Gujarat Explorer</span>
                <span className="font-label-caps text-label-caps text-primary tracking-wider">ROYAL CIRCLE</span>
              </div>
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1Ui59jsO1cRmYcx_EhvwkLGkFogmDjmf7WlO_OauBFwKZ0uk_e307OoSlXT4rFNOTTz18I6VJ9GGtE93D4OpgxiI9xOdoffUGkzgoQ0KG88ACv-KY9EVYggJxEwdGNO95rCHoqDEYuaDqN7tRftqN7dgBVeMibJArETY3NhtGtIYgwZNrtEOGWVQM_PjXq995rzqJH5UGpxAdJ8JA0v0kOcVN3eHS4E9bOBnUkpNA-jIX-7ScyvFM41G5v_ZvuZOXHwVOlo5WZh9Nc" />
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* Interactive Prototype State Controller Bar */}
          <div className="w-full bg-inverse-surface text-inverse-on-surface shadow-md py-space-sm px-gutter border-b-0 sticky top-20 z-40">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
                <span className="font-label-caps text-label-caps tracking-widest text-primary-fixed uppercase">Prototype State Engine</span>
                <span className="text-secondary-fixed-dim text-body-sm hidden sm:inline">| Simulate Operational Real-Time Nodes:</span>
              </div>
              <div className="flex items-center flex-wrap gap-space-xs">
                <button
                  className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-all ${
                    prototypeState === 'default' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                  onClick={() => { setPrototypeState('default'); showToast('State switched: All Bookings Confirmed.'); }}
                >
                  All Confirmed (Default)
                </button>
                <button
                  className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-all ${
                    prototypeState === 'partial' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                  onClick={() => { setPrototypeState('partial'); showToast('State switched: GSRTC Bus Lock Pending.'); }}
                >
                  Mostly Confirmed (Bus Pending)
                </button>
                <button
                  className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-all ${
                    prototypeState === 'delayed' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                  onClick={() => { setPrototypeState('delayed'); showToast('State switched: Concierge Fallback Engaged.'); }}
                >
                  Delayed Fallback
                </button>
                <button className="px-space-sm py-1 rounded-full font-label-md text-label-md bg-secondary text-on-secondary hover:bg-on-surface-variant transition-all flex items-center gap-1" onClick={() => setModalProcessing(true)}>
                  <span className="material-symbols-outlined text-xs">sync</span> Live Processing Modal
                </button>
                <button className="px-space-sm py-1 rounded-full font-label-md text-label-md bg-primary-container text-on-primary-container hover:opacity-90 transition-all flex items-center gap-1 font-semibold" onClick={() => setModalShare(true)}>
                  <span className="material-symbols-outlined text-xs">share</span> Share Trip Dialog
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full px-gutter-mobile md:px-margin py-space-lg flex flex-col gap-space-xl">
            {/* STEP 1-4 PROGRESS STEPPER */}
            <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
                <div className="flex items-center gap-space-sm opacity-80">
                  <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md">
                    <span className="material-symbols-outlined text-sm font-bold text-primary">check</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">STEP 01</span>
                    <span className="font-title-md text-title-md text-on-surface truncate font-semibold">Review Services</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm opacity-80">
                  <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md">
                    <span className="material-symbols-outlined text-sm font-bold text-primary">check</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">STEP 02</span>
                    <span className="font-title-md text-title-md text-on-surface truncate font-semibold">Traveler Manifest</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm opacity-80">
                  <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md">
                    <span className="material-symbols-outlined text-sm font-bold text-primary">check</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">STEP 03</span>
                    <span className="font-title-md text-title-md text-on-surface truncate font-semibold">Payment &amp; Vault</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm">
                  <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md shadow-sm">
                    <span className="material-symbols-outlined text-sm font-bold">verified</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-label-caps text-primary tracking-wider">STEP 04 • ACTIVE</span>
                    <span className="font-title-md text-title-md text-on-surface truncate font-bold text-primary">Trip Confirmed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO SECTION */}
            <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container p-space-lg md:p-space-xl text-center shadow-md">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
                <div className="relative mb-space-md">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg relative">
                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="21" stroke="#FED65B" strokeDasharray="4 2" strokeWidth="3"></circle>
                      <path className="stroke-primary" d="M14 24.5L21 31.5L34 16.5"></path>
                    </svg>
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-inverse-surface text-primary-container rounded-full p-1 shadow-sm">
                    <span className="material-symbols-outlined text-sm block">verified_user</span>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-widest uppercase mb-space-xs">
                  SOVEREIGN DOSSIER CLEARED
                </span>
                <h1 className="font-display-hero text-headline-md md:text-headline-lg text-on-surface tracking-tight font-bold mb-space-xs">
                  Your trip is confirmed
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-space-lg">
                  Everything is ready. Your sovereign Gujarat expedition dossier is vaulted and active in <strong className="text-on-surface font-semibold">My Trips</strong>.
                </p>

                {/* Expedition Identifier Capsule Bar */}
                <div className="w-full bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm text-left">
                  <div className="flex items-center gap-space-sm px-space-sm py-1 border-b md:border-b-0 border-surface-container">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">explore</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Corridor Route</span>
                      <span className="font-title-md text-title-md text-on-surface font-semibold">Ahmedabad → Kutch &amp; Saurashtra</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm px-space-sm py-1 border-b md:border-b-0 border-surface-container">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">calendar_month</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Expedition Period</span>
                      <span className="font-title-md text-title-md text-on-surface font-semibold">18 – 22 Dec 2026 (5D / 4N)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm px-space-sm py-1 border-b md:border-b-0 border-surface-container">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-lg">groups</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Traveler Manifest</span>
                      <span className="font-title-md text-title-md text-on-surface font-semibold">3 Travelers (Kaushal + 2)</span>
                    </div>
                  </div>

                  {/* Booking Ref */}
                  <div className="flex items-center justify-between md:justify-end gap-space-xs bg-surface-container-low px-space-sm py-space-xs rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Booking Dossier ID</span>
                      <span className="font-title-md text-title-md text-primary font-bold tracking-wide">CF-GUJ-982410</span>
                    </div>
                    <button className="p-1.5 rounded bg-surface-container-lowest text-on-surface hover:text-primary transition-all shadow-xs relative" onClick={copyBookingRef} title="Copy Reference">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      {copyTooltip && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-caps text-label-caps px-2 py-0.5 rounded shadow-sm">Copied!</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-space-sm flex items-center justify-center gap-2 text-on-surface-variant font-label-md text-label-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  <span>Synced with IRCTC &amp; GSRTC Direct Protocol • DigiLocker Sanctuary Verification Linked</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC STATUS NOTICE */}
            {prototypeState === 'partial' && (
              <div className="w-full bg-primary-fixed/40 rounded-xl p-space-md shadow-sm">
                <div className="flex items-start gap-space-md">
                  <div className="p-2 rounded-lg bg-primary-container text-on-primary-container">
                    <span className="material-symbols-outlined text-lg">hourglass_top</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">GSRTC Volvo Direct Link: Allocation Synchronizing</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Your payment for ₹38,650 is reconciled. Haveli, Master Rogan guild entry, and royal dining are fully confirmed. GSRTC node is finalizing seat locks L14–L16. Real-time confirmation SMS is dispatched within 4 minutes.
                    </p>
                  </div>
                  <button className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors shadow-xs" onClick={simulateRefresh}>
                    Refresh Link
                  </button>
                </div>
              </div>
            )}

            {prototypeState === 'delayed' && (
              <div className="w-full bg-surface-container-high rounded-xl p-space-md shadow-sm">
                <div className="flex items-start gap-space-md">
                  <div className="p-2 rounded-lg bg-secondary-fixed text-on-secondary-fixed">
                    <span className="material-symbols-outlined text-lg">headset_mic</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Sovereign Fallback Protocol Active</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      State transit clearing server took longer than 60 seconds. A dedicated BharatYatra Concierge Officer (Virbhadra Jadeja) has manually locked VIP contingency fleet seats for you. No manual action needed.
                    </p>
                  </div>
                  <a className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-90 transition-colors shadow-xs" href="tel:18002031111">
                    Direct Concierge
                  </a>
                </div>
              </div>
            )}

            {/* MAIN 2-COLUMN ARCHITECTURE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* LEFT COLUMN (60% / 7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-space-lg">
                {/* CARD 1: Booking Status & Unified Multi-Service Manifest */}
                <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm">
                  <div className="flex items-center justify-between mb-space-md">
                    <div>
                      <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase font-bold">Dossier Manifest</span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Booked Transit &amp; Heritage Services</h2>
                    </div>
                    <span className="px-space-sm py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md">
                      4 of 4 Bookings Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-space-md">
                    {/* Service 1: GSRTC Multi-Axle Volvo */}
                    <div className="p-space-md rounded-xl bg-surface-container-low transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-sm">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-xl">directions_bus</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Intercity Royal Fleet</span>
                              <span className={`px-2 py-0.5 rounded-full font-label-caps text-label-caps font-bold ${
                                prototypeState === 'partial'
                                  ? 'bg-primary-fixed text-on-primary-fixed animate-pulse'
                                  : prototypeState === 'delayed'
                                  ? 'bg-secondary text-on-secondary'
                                  : 'bg-primary-container text-on-primary-container'
                              }`}>
                                {prototypeState === 'partial' ? '⏳ GSRTC SYNCHRONIZING' : prototypeState === 'delayed' ? 'OFFICER OVERRIDE' : 'CONFIRMED ✓'}
                              </span>
                            </div>
                            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Ahmedabad ISKCON → Bhuj Central</h3>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Operator PNR</span>
                          <div className="font-title-md text-title-md text-on-surface font-bold">GSRTC-PNR-8829104</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm py-space-xs text-body-sm text-on-surface-variant border-t border-surface-container">
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Departure</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">18 Dec • 22:30 IST</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Berth Allocation</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">Berths L14, L15, L16</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Class &amp; Coach</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">Multi-Axle B11R AC</p>
                        </div>
                      </div>

                      <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-primary">pin_drop</span> ISKCON Cross Roads Priority Boarding Gate
                        </span>
                        <button className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center gap-0.5" onClick={() => setBusDetailExpanded(!busDetailExpanded)}>
                          Seat Map &amp; Tracking →
                        </button>
                      </div>

                      {busDetailExpanded && (
                        <div className="mt-space-sm p-space-sm bg-surface-container-lowest rounded-lg">
                          <div className="flex items-center justify-between text-body-sm text-on-surface">
                            <span>Volvo B11R GPS Node: Active tracking link will activate 3 hours prior to departure via WhatsApp.</span>
                            <span className="font-label-caps text-label-caps bg-surface-container px-2 py-0.5 rounded">GPS: VOYAGER-882</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Service 2: Nawab Heritage Haveli */}
                    <div className="p-space-md rounded-xl bg-surface-container-low transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-sm">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-xl">castle</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Heritage Palace Suite</span>
                              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold">
                                CONFIRMED ✓
                              </span>
                            </div>
                            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Nawab Heritage Haveli &amp; Courtyard</h3>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Voucher ID</span>
                          <div className="font-title-md text-title-md text-on-surface font-bold">HAV-JUN-44109</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm py-space-xs text-body-sm text-on-surface-variant border-t border-surface-container">
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Check-In</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">19 Dec • 14:00 IST</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Duration</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">2 Nights • Royal Darbar</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Location</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">Junagadh Heritage Ring</p>
                        </div>
                      </div>

                      <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-primary">bedroom_parent</span> Breakfast Included • Darbar Verandah Access
                        </span>
                        <button className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center gap-0.5" onClick={() => setHaveliDetailExpanded(!haveliDetailExpanded)}>
                          Voucher &amp; Check-in QR →
                        </button>
                      </div>

                      {haveliDetailExpanded && (
                        <div className="mt-space-sm p-space-sm bg-surface-container-lowest rounded-lg">
                          <div className="flex items-center justify-between text-body-sm text-on-surface">
                            <span>Guest arrival tea ceremony scheduled for 14:30 IST. Express passport / Aadhaar scan pre-cleared.</span>
                            <span className="font-label-caps text-label-caps bg-surface-container px-2 py-0.5 rounded">SUITE 204</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Service 3: Master Rogan Art Fabric Guild */}
                    <div className="p-space-md rounded-xl bg-surface-container-low transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-sm">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-xl">palette</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Living Heritage Guild</span>
                              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold">
                                CONFIRMED ✓
                              </span>
                            </div>
                            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Master Rogan Art Fabric Guild Masterclass</h3>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Pass Node</span>
                          <div className="font-title-md text-title-md text-on-surface font-bold">ART-NIR-2918</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm py-space-xs text-body-sm text-on-surface-variant border-t border-surface-container">
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Date &amp; Time</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">20 Dec • 10:00 IST</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Format</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">3.5h Private Atelier</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Curator</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">Padma Shri Master Family</p>
                        </div>
                      </div>

                      <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-primary">brush</span> Nirona Village • Includes Castor Oil Pigment Kit
                        </span>
                        <span className="font-label-md text-label-md text-primary font-bold">Guild Pass Synced</span>
                      </div>
                    </div>

                    {/* Service 4: Rajwadi Royal Thali Baithak */}
                    <div className="p-space-md rounded-xl bg-surface-container-low transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-sm">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-xl">restaurant</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Culinary Nobility</span>
                              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold">
                                CONFIRMED ✓
                              </span>
                            </div>
                            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Rajwadi Royal Thali Baithak (18 Dishes)</h3>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Seat Table</span>
                          <div className="font-title-md text-title-md text-on-surface font-bold">TABLE ROYAL-03</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm py-space-xs text-body-sm text-on-surface-variant border-t border-surface-container">
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Date &amp; Time</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">20 Dec • 19:30 IST</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Style</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">Kathiyawadi Baithak</p>
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-outline">Setting</span>
                          <p className="font-title-md text-title-md text-on-surface font-semibold">Gondal Palace Verandah</p>
                        </div>
                      </div>

                      <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-primary">local_bar</span> Pure Vegetarian • A2 Ghee Preparations
                        </span>
                        <span className="font-label-md text-label-md text-primary font-bold">Table Pre-Allocated</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Farva AI Adaptive Itinerary Orchestration */}
                <div className="w-full bg-inverse-surface text-inverse-on-surface rounded-2xl p-space-md md:p-space-lg shadow-xl relative overflow-hidden">
                  <svg className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 text-primary-container pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" strokeDasharray="6 6" strokeWidth="2"></circle>
                    <circle cx="100" cy="100" r="50" strokeWidth="1.5"></circle>
                    <path d="M20 100 Q 100 20 180 100" strokeWidth="2"></path>
                    <path d="M20 100 Q 100 180 180 100" strokeWidth="2"></path>
                  </svg>
                  <div className="relative z-10 flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
                        <span className="font-label-caps text-label-caps text-primary-container uppercase tracking-widest">Farva AI Sovereign Engine</span>
                      </div>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-lowest/10 text-primary-fixed font-label-caps text-label-caps">
                        ACTIVE COGNITION
                      </span>
                    </div>

                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold">Your journey is dynamically orchestrated</h3>
                      <p className="font-body-md text-body-md text-secondary-fixed-dim mt-1">
                        Your transit schedules, haveli bookings, guild permissions, and sunset photography windows have been automatically synchronized with real-time astronomical charts and regional temple procession timelines.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm my-space-xs">
                      <div className="bg-surface-container-lowest/5 rounded-xl p-space-sm backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-primary-container mb-1">
                          <span className="material-symbols-outlined text-sm">wb_twilight</span>
                          <span className="font-label-md text-label-md font-semibold">Thermal Mitigation</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-surface-container-high">3-hour haveli siesta pre-reserved during noon desert heat index.</p>
                      </div>

                      <div className="bg-surface-container-lowest/5 rounded-xl p-space-sm backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-primary-container mb-1">
                          <span className="material-symbols-outlined text-sm">temple_hindu</span>
                          <span className="font-label-md text-label-md font-semibold">Somnath VIP Aarti</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-surface-container-high">Priority queue clearance synced with 19:00 evening Deepmala.</p>
                      </div>

                      <div className="bg-surface-container-lowest/5 rounded-xl p-space-sm backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-primary-container mb-1">
                          <span className="material-symbols-outlined text-sm">offline_pin</span>
                          <span className="font-label-md text-label-md font-semibold">Offline App Cache</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-surface-container-high">Offline geo-spatial coordinates ready without cellular signal.</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
                      <span className="font-label-md text-label-md text-secondary-fixed-dim">
                        Next AI sync checkpoint: 18 Dec 2026, 18:00 IST
                      </span>
                      <Link className="w-full sm:w-auto px-space-md py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold text-center hover:shadow-lg transition-all" href="/my-trips">
                        Open Interactive Itinerary in My Trips →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Before You Travel Reminders */}
                <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm">
                  <div className="flex items-center gap-space-xs mb-space-sm">
                    <span className="material-symbols-outlined text-primary text-xl">info</span>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Essential Field Protocols Before Transit</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-space-sm">
                    <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-primary text-base mt-0.5">badge</span>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface font-bold">Government Photo ID</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">DigiLocker QR or original Aadhaar/Passport required at Dhordo &amp; Khavda checkposts.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-primary text-base mt-0.5">schedule</span>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface font-bold">Punctual Boarding</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Report at ISKCON pick-up 20 minutes prior to 22:30 departure for sovereign luggage tagging.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-primary text-base mt-0.5">forest</span>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface font-bold">Gir Core Sanctuary Pass</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Farva Digital Permit barcode will be inspected at Sasan Gir Reception Gate 02.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-primary text-base mt-0.5">lock_reset</span>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface font-bold">24-Hour Policy Window</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Flexible itinerary adjustment permitted without penalty up to 17 Dec 2026, 22:30 IST.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISUAL SPLIT: Heritage Landscape Vignettes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div className="relative rounded-xl overflow-hidden h-44 shadow-sm group">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="White Rann night canopy" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoQ3AzP0zl4204xI6hflgHBQRp14w8fzqQd8Tq6v2mncs75C8GtwmPnG_tmQBb9lYhj7YsoO5zwtijy2nPxOFrbK4mwcfwQPc0sANHi80Jx1S8hO-QmLwqoy-KiTck-emrBExr83MQwn3pM3qnK7e6J-gYwW1x6xO4foeCAEHyI05KvK-qV4EPXI2AN-jne-Zs2v7ZZwACnf82Q3AzPU6lHyz5gkbi7I1wLxzb6h_Blb3MRF2ZahDnDw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-transparent to-transparent flex items-end p-space-sm">
                      <div className="text-white">
                        <span className="font-label-caps text-label-caps text-primary-container">KUTCH NIGHT CANOPY</span>
                        <p className="font-title-md text-title-md font-semibold">White Desert Midnight Encampment</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden h-44 shadow-sm group">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Nirona Rogan Art Atelier" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvxKZnngR75B2lGPeRwSrGxIgdFwCzmoxWMjdOaMvVxpZN6NUGUrGnmkN7liuP0bL5AG6p9Z6D4DDulbM0rK_OzaMXxSGArmCHo5AA-0lcDLIj_k25WNQPAE2LdCPUPYTsISJYVAsQx1PwTOBjCdN3hCjMDHtbRjcfXGjlFDStqzq8FT0UJtuNeGGiKrYEVYuUt1puwjeTQESIX7P2Y2fIwh1uJYw76I8Zt0J5GB4H37zOdzE80crSpQ" />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-transparent to-transparent flex items-end p-space-sm">
                      <div className="text-white">
                        <span className="font-label-caps text-label-caps text-primary-container">NIRONA ATELIER</span>
                        <p className="font-title-md text-title-md font-semibold">Rogan Art Living Guild Session</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (40% / 5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-space-lg">
                {/* CARD 1: Sovereign Travel Pack Downloader */}
                <div className="w-full bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-2xl p-space-md md:p-space-lg shadow-md border-0">
                  <div className="flex items-center gap-space-sm mb-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">folder_zip</span>
                    </div>
                    <div>
                      <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Expedition Kit</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Your Sovereign Travel Pack</h3>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    Complete dossier including multi-service boarding cards, palace vouchers, DigiLocker permit QR passes, offline topographic maps, and 24/7 SOS safety card.
                  </p>
                  <div className="flex flex-col gap-space-xs mb-space-md">
                    <button className="w-full py-3 px-space-md rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs hover:shadow-md transition-all" onClick={downloadTravelPack}>
                      <span className="material-symbols-outlined text-base">download</span>
                      Download Travel Pack (PDF / Apple Wallet)
                    </button>
                    <button className="w-full py-2.5 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-space-xs hover:bg-surface-container transition-all shadow-xs" onClick={emailTravelPack}>
                      <span className="material-symbols-outlined text-base">mail</span>
                      Email Pack to kaushal.patel@farvavoyager.in
                    </button>
                  </div>
                  <div className="p-space-xs rounded-lg bg-surface-container-lowest flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">mark_email_read</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Dispatched instantly to your verified mail node.</span>
                  </div>
                </div>

                {/* CARD 2: Financial Settlement Dossier */}
                <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Settlement Record</span>
                      <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Payment Reconciled</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-title-md text-title-md font-bold">
                      ₹38,650
                    </span>
                  </div>

                  <div className="space-y-space-xs text-body-sm py-space-xs border-y border-surface-container my-space-xs">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Payment Method:</span>
                      <span className="text-on-surface font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-primary">account_balance</span> UPI (HDFC Node)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">VPA Account:</span>
                      <span className="text-on-surface font-mono">kaushal.patel@okhdfcbank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Transaction ID:</span>
                      <span className="text-on-surface font-mono">TXN-FARVA-99482103</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Timestamp:</span>
                      <span className="text-on-surface">13 Sep 2026 • 18:42 IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">GSTIN (Gujarat Node):</span>
                      <span className="text-on-surface font-mono">24AAACC1206K1ZV</span>
                    </div>
                  </div>

                  <div className="mt-space-sm">
                    <button className="w-full py-2 px-space-md rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1 hover:bg-surface-container transition-colors" onClick={downloadInvoice}>
                      <span className="material-symbols-outlined text-sm">receipt_long</span>
                      Download Official GST Tax Invoice (PDF)
                    </button>
                  </div>
                </div>

                {/* CARD 3: Expedition Utility Actions */}
                <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md md:p-space-lg shadow-sm">
                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-space-sm">Expedition Utilities</h3>
                  <div className="flex flex-col gap-space-xs">
                    <button className="w-full p-space-sm rounded-xl bg-surface-container-low text-left hover:bg-surface-container transition-colors flex items-center justify-between" onClick={addToCalendar}>
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-base">event</span>
                        </div>
                        <div>
                          <div className="font-title-md text-title-md text-on-surface font-semibold">Sync with Calendar</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">Google / Apple / Outlook calendar auto-alarms</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline">arrow_forward_ios</span>
                    </button>

                    <button className="w-full p-space-sm rounded-xl bg-surface-container-low text-left hover:bg-surface-container transition-colors flex items-center justify-between" onClick={() => setModalShare(true)}>
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-base">share</span>
                        </div>
                        <div>
                          <div className="font-title-md text-title-md text-on-surface font-semibold">Share Expedition Dossier</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">Share private read-only view with comrades</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline">arrow_forward_ios</span>
                    </button>

                    <Link className="w-full p-space-sm rounded-xl bg-surface-container-low text-left hover:bg-surface-container transition-colors flex items-center justify-between" href="/experiences">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-base">add_location_alt</span>
                        </div>
                        <div>
                          <div className="font-title-md text-title-md text-on-surface font-semibold">Add Ancillary Experiences</div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">Fossil Park walk, camel sunset safari in Kutch</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline">arrow_forward_ios</span>
                    </Link>
                  </div>
                </div>

                {/* CARD 4: Dedicated 24/7 Ground Concierge Officer */}
                <div className="w-full bg-surface-container-low rounded-2xl p-space-md md:p-space-lg shadow-sm">
                  <div className="flex items-center gap-space-sm mb-space-sm">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-title-lg">
                      VJ
                    </div>
                    <div>
                      <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Assigned Ground Officer</span>
                      <h4 className="font-title-lg text-title-lg text-on-surface font-bold">Virbhadra Jadeja</h4>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Officer ID: FARVA-CONCIERGE-84</span>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    Stationed between Ahmedabad and Bhuj corridor for direct protocol assistance, luggage transfers, and real-time gate coordination.
                  </p>
                  <div className="grid grid-cols-2 gap-space-xs">
                    <a className="py-2 px-space-xs rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1 shadow-xs hover:bg-surface-container transition-colors" href="tel:18002031111">
                      <span className="material-symbols-outlined text-sm text-primary">call</span>
                      Toll-Free Call
                    </a>
                    <button className="py-2 px-space-xs rounded-lg bg-emerald-700 text-white font-label-md text-label-md font-semibold flex items-center justify-center gap-1 shadow-xs hover:bg-emerald-800 transition-colors" onClick={startWhatsAppConcierge}>
                      <span className="material-symbols-outlined text-sm">chat</span>
                      WhatsApp Live
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GLOBAL CTA BANNER TO /my-trips */}
            <div className="w-full bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">map</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Ready to review your live voyage?</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Access full interactive day-by-day maps, weather alerts, and digital offline vouchers.</p>
                </div>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto">
                <Link className="w-full sm:w-auto px-space-lg py-3 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold hover:opacity-95 transition-all text-center" href="/my-trips">
                  Go to My Trips
                </Link>
              </div>
            </div>
          </div>

          {/* MODAL 1: LIVE PROCESSING SIMULATION */}
          {modalProcessing && (
            <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-gutter">
              <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-space-lg shadow-2xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-space-md">
                  <span className="material-symbols-outlined text-3xl animate-spin">autorenew</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Processing Sovereign Node</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-md">
                  Confirming payment with banking clearinghouse and securing live cryptographic seat locks with GSRTC &amp; Gujarat Tourism databases...
                </p>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mb-space-md">
                  <div className="bg-primary h-full w-3/4 transition-all duration-700"></div>
                </div>
                <button className="px-space-lg py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors" onClick={() => setModalProcessing(false)}>
                  Dismiss Simulation
                </button>
              </div>
            </div>
          )}

          {/* MODAL 2: SHARE EXPEDITION DOSSIER */}
          {modalShare && (
            <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-gutter">
              <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-space-lg shadow-2xl">
                <div className="flex items-center justify-between mb-space-md">
                  <div>
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Expedition Sharing</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Share Itinerary with Co-Travelers</h3>
                  </div>
                  <button className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container" onClick={() => setModalShare(false)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                  Anyone with this read-only link can view the live day-by-day timetable, bus tracking, and hotel coordinates. <strong className="text-on-surface">Payment totals and personal tax invoices remain strictly private.</strong>
                </p>
                <div className="flex items-center gap-space-xs bg-surface-container-low p-space-xs rounded-xl mb-space-md">
                  <input className="bg-transparent border-0 font-mono text-body-sm text-on-surface flex-1 px-space-xs outline-none" readOnly type="text" value="https://chalofarva.gujarat.in/trips/share/CF-GUJ-982410?access=read" />
                  <button className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:opacity-90" onClick={copyShareLink}>
                    Copy Link
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-space-sm mb-space-md">
                  <button className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-center gap-2 text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md font-semibold" onClick={() => { window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent('Check out our confirmed Gujarat Expedition with BharatYatra: https://chalofarva.gujarat.in/trips/share/CF-GUJ-982410'), '_blank'); setModalShare(false); }}>
                    <span className="material-symbols-outlined text-emerald-600">chat</span> WhatsApp
                  </button>
                  <button className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-center gap-2 text-on-surface hover:bg-surface-container transition-colors font-label-md text-label-md font-semibold" onClick={() => { window.location.href = 'mailto:?subject=Our Gujarat Expedition Dossier (CF-GUJ-982410)&body=Review our itinerary and transit cards here: https://chalofarva.gujarat.in/trips/share/CF-GUJ-982410'; setModalShare(false); }}>
                    <span className="material-symbols-outlined text-primary">mail</span> Email
                  </button>
                </div>
                <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center gap-space-xs text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">security</span>
                  <span>Secured via SHA-256 token authorization for 3 co-passengers.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(0,0,0,0.02)] mt-auto">
        <div className="max-w-7xl mx-auto px-margin py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg mb-space-lg">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-base">verified_user</span>
                <span className="font-title-md text-title-md font-semibold text-on-surface">24/7 Sovereign Assistance</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Dedicated ground protocols stationed at Ahmedabad, Gir National Park, and Rann of Kutch for seamless VIP hospitality.</p>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-base">lock_open</span>
                <span className="font-title-md text-title-md font-semibold text-on-surface">DigiLocker Integration</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Instant verified permit release for Sasan Gir Forest core safari and White Rann border sanctuary entries via Government of Gujarat node.</p>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span className="font-title-md text-title-md font-semibold text-on-surface">Booking Governance</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">All luxury packages include GST-verified invoices, sovereign priority fleet allocation, and heritage preservation levies.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-space-lg gap-space-md">
            <div className="flex flex-wrap items-center gap-space-md">
              <span className="font-body-sm text-body-sm text-on-surface-variant">© 2024 BharatYatra Gujarat Pvt. Ltd. Sovereign Tourism Authority Partner.</span>
            </div>
            <div className="flex items-center gap-space-md">
              <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/booking-terms">Terms of Heritage Transit</Link>
              <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/sanctuary-guidelines">Sanctuary Protocol</Link>
              <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/privacy-notice">Privacy Node</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

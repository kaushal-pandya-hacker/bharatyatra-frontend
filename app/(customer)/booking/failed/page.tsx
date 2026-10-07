'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BookingFailedPage() {
  const [activeState, setActiveState] = useState<'state-1' | 'state-2' | 'state-3' | 'state-4' | 'state-5'>('state-3');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const simulateRetry = () => {
    showToast('Re-querying carrier GDS node with your cached manifest CF-GUJ-894102...');
    setTimeout(() => {
      showToast('Carrier inventory node reports high concurrency. Pick Alternative AI-902 or Volvo Sleeper.');
    }, 1800);
  };

  const confirmAlternative = (name: string, priceDifference: number) => {
    const diffText =
      priceDifference > 0
        ? `A balance difference of ₹${priceDifference} will be charged.`
        : `₹${Math.abs(priceDifference)} will be refunded directly to your UPI account.`;
    if (confirm(`Confirm re-routing to ${name}?\n${diffText}\n\nYour master itinerary remains completely intact!`)) {
      showToast(`Success! Segment updated to ${name}. Confirmation ticket dispatched.`);
    }
  };

  const checkLiveSettlement = () => {
    showToast('Querying NPCI Node: Gateway confirms ₹9,450 received into Farva Escrow.');
  };

  const downloadEscrowReceipt = () => {
    showToast('Generating Sovereign Escrow Certificate [CF-ESCROW-894102.pdf]...');
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-base">info</span>
          <span className="font-body-md text-body-md">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(20,26,50,0.05)]">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <Link href="/" className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-on-secondary-fixed flex items-center justify-center text-primary-container shadow-[0_0_16px_rgba(254,214,91,0.2)]">
                <span className="material-symbols-outlined text-[24px]">explore</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-title-lg text-title-lg text-on-surface tracking-tight font-bold">BHARAT YATRA</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-label-caps text-label-caps uppercase tracking-wider">Verified Core</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">ભારત યાત્રા • Sovereign Gujarat Travel Engine</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-space-xl">
            <nav className="hidden md:flex items-center gap-space-lg">
              <Link className="font-label-lg text-label-lg text-on-surface font-semibold" href="/booking/failed">Recovery Command</Link>
              <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/my-trips">My Trips</Link>
              <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/support">Help &amp; Protocol</Link>
            </nav>
            <div className="flex items-center gap-space-md">
              <div className="hidden sm:flex items-center gap-space-xs px-3 py-1.5 rounded-xl bg-surface-container-low text-secondary">
                <span className="material-symbols-outlined text-[18px] text-primary-fixed-dim">verified_user</span>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Bank Grade Node</span>
              </div>
              <Link className="relative flex items-center justify-center" href="/profile">
                <img alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-[0_0_0_2px_rgba(254,214,91,0.4)]" src="https://lh3.googleusercontent.com/aida/AEtjO1Ui59jsO1cRmYcx_EhvwkLGkFogmDjmf7WlO_OauBFwKZ0uk_e307OoSlXT4rFNOTTz18I6VJ9GGtE93D4OpgxiI9xOdoffUGkzgoQ0KG88ACv-KY9EVYggJxEwdGNO95rCHoqDEYuaDqN7tRftqN7dgBVeMibJArETY3NhtGtIYgwZNrtEOGWVQM_PjXq995rzqJH5UGpxAdJ8JA0v0kOcVN3eHS4E9bOBnUkpNA-jIX-7ScyvFM41G5v_ZvuZOXHwVOlo5WZh9Nc" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          {/* Dynamic State Simulation Controller Bar */}
          <section className="w-full bg-on-secondary-fixed text-surface px-4 py-3 sticky top-20 z-40 shadow-md">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
                <span className="font-label-caps text-label-caps tracking-widest text-primary-fixed-dim uppercase">Prototype State Engine</span>
                <span className="text-secondary-fixed text-body-sm hidden lg:inline">• Real-time gateway edge-case tester</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'state-1', label: '1. Payment Failed' },
                  { id: 'state-2', label: '2. Payment Pending' },
                  { id: 'state-3', label: '3. Debited & Provider Failed (Default)' },
                  { id: 'state-4', label: '4. Fare Expired' },
                  { id: 'state-5', label: '5. Carrier Sync Error' },
                ].map((s) => (
                  <button
                    key={s.id}
                    className={`px-3 py-1 rounded-full text-label-md transition-all ${
                      activeState === s.id
                        ? 'bg-primary-container text-on-secondary-fixed font-semibold shadow-[0_0_12px_rgba(254,214,91,0.4)]'
                        : 'bg-on-secondary-fixed-variant text-surface-container-low hover:bg-secondary'
                    }`}
                    onClick={() => setActiveState(s.id as any)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Main Workspace Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 w-full flex flex-col gap-8 pb-28 md:pb-12">
            {/* Top Dossier Alert & Status Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-md p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">report_problem</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-label-caps text-label-caps px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant tracking-wider uppercase font-semibold">
                      Ref: CF-GUJ-894102
                    </span>
                    <span className="font-label-caps text-label-caps px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container tracking-wider uppercase font-bold">
                      {activeState === 'state-1'
                        ? 'Payment Incomplete'
                        : activeState === 'state-2'
                        ? 'Verification In Flight'
                        : activeState === 'state-4'
                        ? 'Fare Expired'
                        : activeState === 'state-5'
                        ? 'Carrier Downtime'
                        : 'Booking Not Confirmed'}
                    </span>
                    <span className="font-label-caps text-label-caps px-2.5 py-0.5 rounded-full bg-primary-container/30 text-on-primary-container tracking-wider uppercase flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[13px]">timer</span> Hold Expiring in 13:42
                    </span>
                  </div>

                  <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-1">
                    {activeState === 'state-1'
                      ? 'Payment transaction was declined'
                      : activeState === 'state-2'
                      ? 'Payment verification in progress'
                      : activeState === 'state-4'
                      ? 'Reservation window timed out'
                      : activeState === 'state-5'
                      ? 'Carrier API is temporarily unreachable'
                      : "We couldn't complete your booking"}
                  </h1>

                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                    {activeState === 'state-1'
                      ? 'Your card or UPI issuer rejected the charge. No money was deducted from your account.'
                      : activeState === 'state-2'
                      ? 'We are awaiting final clearance from HDFC Bank and NPCI UPI. Please do not close this window.'
                      : activeState === 'state-4'
                      ? 'The 15-minute price freeze for your chosen seats has elapsed. Fares and availability have refreshed.'
                      : activeState === 'state-5'
                      ? 'Alliance Subcontinental ticketing servers are undergoing unannounced maintenance. We are unable to mint tickets right now.'
                      : 'Something went wrong while confirming your travel segment. Your overall journey and verified stays are completely safe with us.'}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
                <Link className="flex-1 lg:flex-initial text-center px-4 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2" href="/my-trips">
                  <span className="material-symbols-outlined text-[18px]">backpack</span>
                  <span>View Master Trip</span>
                </Link>
                <button className="flex-1 lg:flex-initial px-5 py-3 rounded-xl bg-primary-container text-on-secondary-fixed hover:bg-primary-fixed-dim font-label-lg text-label-lg transition-all shadow-[0_0_16px_rgba(254,214,91,0.3)] flex items-center justify-center gap-2" onClick={() => document.getElementById('recovery-alternatives')?.scrollIntoView({ behavior: 'smooth' })}>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Resolve Now</span>
                </button>
              </div>
            </div>

            {/* Master 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN (7 Columns) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* STEPWISE TELEMETRY AUDIT */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">monitor_heart</span>
                      <span className="font-title-md text-title-md text-on-surface">Stepwise Telemetry Audit</span>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Node: AMD-CLUSTER-04</span>
                  </div>

                  {/* Step Progression Indicator */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">01 / Intent</span>
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                      </div>
                      <span className="font-title-md text-[14px] text-on-surface font-medium">Order Vaulted</span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">Manifest locks initialized</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">02 / Payment</span>
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          {activeState === 'state-1' ? 'cancel' : activeState === 'state-2' ? 'hourglass_top' : 'check_circle'}
                        </span>
                      </div>
                      <span className="font-title-md text-[14px] text-on-surface font-medium">
                        {activeState === 'state-1' ? 'Charge Rejected' : activeState === 'state-2' ? 'Polling Bank Node' : '₹9,450 Verified'}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {activeState === 'state-1' ? 'Bank returned decline' : activeState === 'state-2' ? 'Awaiting 2FA confirmation' : 'Escrow secured at Gateway'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-error-container/40 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-label-caps text-label-caps text-on-error-container uppercase font-bold">03 / Carrier</span>
                        <span className="material-symbols-outlined text-error text-[18px]">
                          {activeState === 'state-5' ? 'cloud_off' : 'cancel'}
                        </span>
                      </div>
                      <span className="font-title-md text-[14px] text-on-surface font-semibold">
                        {activeState === 'state-5' ? 'Host Unreachable' : 'Seat Release Failed'}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">
                        {activeState === 'state-5' ? 'AI-GDS returned HTTP 503' : 'DGCA PNR handshake stalled'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">04 / Itinerary</span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">radio_button_unchecked</span>
                      </div>
                      <span className="font-title-md text-[14px] text-on-surface font-medium">Pending Sync</span>
                      <span className="font-body-sm text-[11px] text-on-surface-variant">Awaiting resolution node</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">verified_user</span>
                    <p className="font-body-sm text-body-sm text-on-surface">
                      <strong className="font-semibold">Operator Lock Collision:</strong> Alliance Subcontinental AI-894 reported a transient block while binding seat allocations. No duplicate fare will ever be charged, and your funds are held safely in Farva Sovereign Escrow.
                    </p>
                  </div>
                </div>

                {/* ORIGINAL BOOKING DOSSIER SUMMARY */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-on-surface">Original Booking Manifest</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps uppercase font-semibold">Sector AMD ➔ BHJ</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-on-secondary-fixed text-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-title-md text-title-md text-on-surface font-semibold">Alliance Subcontinental • AI-894</span>
                          <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface text-on-surface-variant">ATR 72-600</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                          <span>Ahmedabad (AMD)</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          <span>Bhuj Airport (BHJ)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end">
                      <span className="font-title-md text-title-md text-on-surface font-bold">₹9,450.00</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">2 Travelers (Kaushal Patel + 1)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-on-surface-variant font-body-sm text-body-sm pt-1">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant/70">Scheduled Departure</span>
                      <span className="font-title-md text-[14px] text-on-surface">18 Dec • 07:45 IST</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant/70">Scheduled Arrival</span>
                      <span className="font-title-md text-[14px] text-on-surface">18 Dec • 08:55 IST</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant/70">Fare Tier</span>
                      <span className="font-title-md text-[14px] text-on-surface">Sovereign Flex Plus</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant/70">Terminal Gate</span>
                      <span className="font-title-md text-[14px] text-on-surface">AMD T2 • Domestic</span>
                    </div>
                  </div>
                </div>

                {/* FARVA AI ADAPTIVE RECOVERY COGNITION CARD */}
                <div className="rounded-2xl bg-on-secondary-fixed text-surface p-6 lg:p-7 shadow-xl relative overflow-hidden flex flex-col gap-4">
                  <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center text-on-secondary-fixed shadow-[0_0_12px_rgba(254,214,91,0.5)]">
                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      </div>
                      <span className="font-title-md text-title-md text-surface font-semibold">Farva AI Adaptive Reroute Engine</span>
                    </div>
                    <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-surface/10 text-primary-container uppercase tracking-wider font-semibold">
                      Live Trip Preserver
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-surface-container-high/90 relative z-10">
                    &quot;Your 07:45 flight wasn&apos;t locked, but your <strong>19 Dec Nawab Haveli check-in</strong> and <strong>White Desert Sunset Glamping</strong> remain 100% safeguarded. I can instantly pivot your booking to the 09:15 flight or luxury overnight sleeper with zero penalty fee.&quot;
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
                    <button className="px-4 py-2.5 rounded-xl bg-primary-container text-on-secondary-fixed font-label-lg text-label-lg hover:bg-primary-fixed-dim transition-all shadow-[0_0_14px_rgba(254,214,91,0.3)] flex items-center gap-2" onClick={() => document.getElementById('recovery-alternatives')?.scrollIntoView({ behavior: 'smooth' })}>
                      <span>View Recommended Alternatives</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                    <button className="px-4 py-2.5 rounded-xl bg-surface/10 hover:bg-surface/20 text-surface font-label-lg text-label-lg transition-colors" onClick={() => showToast('Master itinerary locked in queue. Our flight desk will update status within 10 minutes.')}>
                      Keep Master Plan &amp; Auto-Retry
                    </button>
                  </div>
                </div>

                {/* 3 RECOVERY PATHWAYS */}
                <div className="flex flex-col gap-4">
                  <h2 className="font-title-lg text-title-lg text-on-surface">Available Recovery Pathways</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pathway 1 */}
                    <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
                      <div className="flex flex-col gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-on-primary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">replay</span>
                        </div>
                        <span className="font-title-md text-title-md text-on-surface">Try Booking Again</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Refresh inventory and re-bind seat locks directly with Alliance Air with existing escrow funds.
                        </p>
                      </div>
                      <button className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-primary-container hover:text-on-secondary-fixed text-on-surface font-label-lg text-label-lg transition-all flex items-center justify-center gap-1.5" onClick={simulateRetry}>
                        <span>Try Again</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>

                    {/* Pathway 2 */}
                    <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
                      <div className="flex flex-col gap-2">
                        <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">alt_route</span>
                        </div>
                        <span className="font-title-md text-title-md text-on-surface">Switch Alternative</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Seamlessly apply your ₹9,450 to the 09:15 flight or premium GSRTC Volvo sleeper coach.
                        </p>
                      </div>
                      <button className="w-full py-2.5 px-3 rounded-xl bg-on-secondary-fixed hover:bg-secondary text-surface font-label-lg text-label-lg transition-all flex items-center justify-center gap-1.5" onClick={() => document.getElementById('recovery-alternatives')?.scrollIntoView({ behavior: 'smooth' })}>
                        <span>See Alternatives</span>
                        <span className="material-symbols-outlined text-[16px]">explore</span>
                      </button>
                    </div>

                    {/* Pathway 3 */}
                    <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
                      <div className="flex flex-col gap-2">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">support_agent</span>
                        </div>
                        <span className="font-title-md text-title-md text-on-surface">Ground Concierge</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Direct dispatch to Senior Gujarat Officer Virbhadra Jadeja for VIP manual seat allocation.
                        </p>
                      </div>
                      <a className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-all flex items-center justify-center gap-1.5" href="tel:18002031111">
                        <span>Call Concierge</span>
                        <span className="material-symbols-outlined text-[16px]">call</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (5 Columns) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* DEDICATED PAYMENT STATUS CARD */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-md flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">account_balance_wallet</span>
                      <span className="font-title-md text-title-md text-on-surface">Payment &amp; Financial Status</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-on-primary-container font-label-caps text-label-caps uppercase font-bold">
                      {activeState === 'state-1' || activeState === 'state-4' ? 'No Debit' : 'Escrow Active'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Ledger Settlement State</span>
                      <span className="font-title-md text-title-md font-bold text-on-surface">
                        {activeState === 'state-1' || activeState === 'state-4' ? '₹0.00' : '₹9,450.00'}
                      </span>
                    </div>
                    <span className="font-title-md text-[15px] text-primary font-semibold">
                      {activeState === 'state-1'
                        ? 'Zero liability: No funds were deducted'
                        : activeState === 'state-2'
                        ? 'Payment authorization initiated'
                        : activeState === 'state-4'
                        ? 'No funds debited during this expired session'
                        : 'Payment received (₹9,450) — Booking not confirmed'}
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {activeState === 'state-1' || activeState === 'state-4'
                        ? 'You may safely retry with another card, netbanking, or UPI. Your itinerary seats will be held.'
                        : 'We have vaulted the funds from your HDFC Bank account via UPI Node. Auto-reversal to source or instant re-allocation to an alternative option is fully protected.'}
                    </p>
                  </div>

                  {/* Anti Duplicate Warning Callout */}
                  {(activeState === 'state-2' || activeState === 'state-3' || activeState === 'state-5') && (
                    <div className="p-3.5 rounded-xl bg-primary-container/20 flex items-start gap-3">
                      <span className="material-symbols-outlined text-on-primary-container text-[20px] shrink-0 mt-0.5">notification_important</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-[14px] text-on-primary-container font-semibold">DO NOT MAKE A SECOND PAYMENT</span>
                        <span className="font-body-sm text-[12px] text-on-primary-container">
                          Your payment is currently protected. Initiating a duplicate transaction from UPI or cards may result in temporary double debiting.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <button className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-on-secondary-fixed text-surface font-label-md text-label-md hover:bg-secondary transition-colors flex items-center justify-center gap-2" onClick={checkLiveSettlement}>
                      <span className="material-symbols-outlined text-[16px]">sync</span>
                      <span>Check Settlement</span>
                    </button>
                    <button className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-2" onClick={downloadEscrowReceipt}>
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Escrow Receipt</span>
                    </button>
                  </div>
                </div>

                {/* SMART ALTERNATIVE CARDS SECTION */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4" id="recovery-alternatives">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">shuffle</span>
                      <span className="font-title-md text-title-md text-on-surface">Recommended Alternatives</span>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Instant Re-route</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Select an alternative sector. Your escrow balance of <strong>₹9,450</strong> will be credited instantly towards these options.
                  </p>

                  {/* Alternative 1: Next Flight */}
                  <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col gap-3 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-on-surface flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">flight</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-md text-[15px] text-on-surface font-semibold">Alliance Express AI-902</span>
                          <span className="font-body-sm text-[12px] text-on-surface-variant">Ahmedabad (AMD) ➔ Bhuj (BHJ) • 09:15 IST</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-title-md text-[15px] text-on-surface font-bold">₹9,820</span>
                        <span className="font-label-caps text-label-caps text-error font-semibold">+₹370 difference</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-on-surface-variant text-label-md">
                        <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                        <span>4 Seats Available</span>
                        <span>• Arrives 10:25 IST</span>
                      </div>
                      <button className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-secondary-fixed hover:bg-primary-fixed-dim font-label-md text-label-md font-semibold transition-all" onClick={() => confirmAlternative('AI-902 Express', 370)}>
                        Select Option
                      </button>
                    </div>
                  </div>

                  {/* Alternative 2: GSRTC Volvo Sleeper */}
                  <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col gap-3 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-on-surface flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-md text-[15px] text-on-surface font-semibold">GSRTC Multi-Axle Sleeper</span>
                          <span className="font-body-sm text-[12px] text-on-surface-variant">Geeta Mandir ➔ Bhuj Bus Port • 22:30 IST</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-title-md text-[15px] text-on-surface font-bold">₹2,760</span>
                        <span className="font-label-caps text-label-caps text-primary font-semibold">₹6,690 refund to bank</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-on-surface-variant text-label-md">
                        <span className="w-2 h-2 rounded-full bg-surface-tint"></span>
                        <span>Lower Berths L14-L16</span>
                        <span>• AC Club Class</span>
                      </div>
                      <button className="px-3.5 py-1.5 rounded-lg bg-on-secondary-fixed text-surface hover:bg-secondary font-label-md text-label-md font-semibold transition-all" onClick={() => confirmAlternative('GSRTC Multi-Axle Volvo Sleeper', -6690)}>
                        Select Option
                      </button>
                    </div>
                  </div>

                  {/* Alternative 3: Private Chauffeur */}
                  <div className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col gap-3 group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-on-surface flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">local_taxi</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-md text-[15px] text-on-surface font-semibold">BharatYatra Private Chauffeur</span>
                          <span className="font-body-sm text-[12px] text-on-surface-variant">Door-to-Door Innova Crysta • Express Highway</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-title-md text-[15px] text-on-surface font-bold">₹11,200</span>
                        <span className="font-label-caps text-label-caps text-error font-semibold">+₹1,750 difference</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-on-surface-variant text-label-md">
                        <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                        <span>Immediate Departure</span>
                        <span>• Custom Stops</span>
                      </div>
                      <button className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-secondary-fixed text-on-surface font-label-md text-label-md font-semibold transition-all" onClick={() => confirmAlternative('Private Chauffeur Innova Crysta', 1750)}>
                        Select Option
                      </button>
                    </div>
                  </div>
                </div>

                {/* CONCIERGE HELPLINE CARD */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-on-surface">Sovereign Travel Concierge</span>
                    <span className="flex items-center gap-1 text-primary text-label-caps font-label-caps uppercase">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span> 24/7 Priority
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <img alt="Virbhadra Jadeja" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1Ui59jsO1cRmYcx_EhvwkLGkFogmDjmf7WlO_OauBFwKZ0uk_e307OoSlXT4rFNOTTz18I6VJ9GGtE93D4OpgxiI9xOdoffUGkzgoQ0KG88ACv-KY9EVYggJxEwdGNO95rCHoqDEYuaDqN7tRftqN7dgBVeMibJArETY3NhtGtIYgwZNrtEOGWVQM_PjXq995rzqJH5UGpxAdJ8JA0v0kOcVN3eHS4E9bOBnUkpNA-jIX-7ScyvFM41G5v_ZvuZOXHwVOlo5WZh9Nc" />
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md text-on-surface font-semibold">Virbhadra Jadeja</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Gujarat Flight &amp; Corridor Officer</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <a className="py-2.5 px-3 rounded-xl bg-on-secondary-fixed text-surface hover:bg-secondary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors" href="tel:18002031111">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      <span>1800 203 1111</span>
                    </a>
                    <a className="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-colors" href="https://wa.me/919876543210" target="_blank" rel="noreferrer">
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>WhatsApp Chat</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-space-xs">
              <span className="font-title-md text-title-md text-on-surface font-semibold">BharatYatra Sovereign Travel Operations</span>
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Zero-loss recovery orchestrator and automated reservation guardian for Gujarat &amp; western circuit routes.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-space-lg text-on-surface-variant font-label-md text-label-md">
            <Link className="hover:text-on-surface transition-colors" href="/support">Escrow Protection</Link>
            <Link className="hover:text-on-surface transition-colors" href="/support">Concierge Helpline</Link>
            <Link className="hover:text-on-surface transition-colors" href="/states/loading">System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

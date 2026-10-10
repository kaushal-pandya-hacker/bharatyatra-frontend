'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BookingRedirectPage() {
  const [activeState, setActiveState] = useState<'active' | 'dispatching' | 'confirmed' | 'pending' | 'cancelled' | 'expired'>('active');

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
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
              <Link className="transition-colors text-primary font-bold" href="/booking/redirect">Handoff</Link>
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
          {/* Prototype State Controller Bar */}
          <aside aria-label="Interactive Prototype State Controller" className="w-full bg-inverse-surface text-inverse-on-surface py-space-sm px-margin">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-sm">tune</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary-container">Gateway Corridor Sim:</span>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs">
                {[
                  { id: 'active', label: 'Active Handoff' },
                  { id: 'dispatching', label: 'Connecting / Dispatch' },
                  { id: 'confirmed', label: 'Return: Confirmed' },
                  { id: 'pending', label: 'Return: Pending' },
                  { id: 'cancelled', label: 'Return: Not Completed' },
                  { id: 'expired', label: 'Session Expired' },
                ].map((s) => (
                  <button
                    key={s.id}
                    className={`px-3 py-1 rounded-full font-label-md text-label-md transition-colors ${
                      activeState === s.id
                        ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                        : 'text-on-surface-variant bg-surface-container-low hover:bg-surface-container'
                    }`}
                    onClick={() => setActiveState(s.id as any)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <span className="hidden xl:inline font-body-sm text-body-sm text-secondary-fixed-dim">Mock Gateway Bridge Node • AMD-09</span>
            </div>
          </aside>

          {/* Main Corridor Canvas */}
          <section className="w-full max-w-7xl mx-auto px-margin py-space-xl flex flex-col gap-space-xl">
            {/* STATE 1: ACTIVE DEFAULT HANDOFF */}
            {activeState === 'active' && (
              <div className="flex flex-col gap-space-xl">
                {/* Corridor Heading & Triple-Node Conduit */}
                <div className="flex flex-col items-center text-center gap-space-sm max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high text-on-surface shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">Secure Partner Handoff // Corridor Protocol</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">You’re almost there</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                    We’re securely connecting you to our authorized subcontinental flight partner to review final passenger manifests and issue official flight documentation.
                  </p>

                  {/* 3-Node Visual Conduit Graphic */}
                  <div className="w-full max-w-2xl mt-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
                    <div className="flex flex-col items-center gap-space-xs">
                      <div className="w-14 h-14 rounded-full bg-inverse-surface flex items-center justify-center text-primary-container shadow-md">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface">BharatYatra</span>
                      <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase">Cart Verified</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center w-full px-space-xs">
                      <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
                        <div className="h-full bg-primary w-2/3 animate-pulse"></div>
                      </div>
                      <span className="font-label-caps text-label-caps text-on-surface-variant mt-1">Pre-fill Sync</span>
                    </div>

                    <div className="flex flex-col items-center gap-space-xs">
                      <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-md">
                        <span className="material-symbols-outlined text-2xl">enhanced_encryption</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface">TLS 256-Bit</span>
                      <span className="font-label-caps text-label-caps text-secondary tracking-wider uppercase">Encrypted</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center w-full px-space-xs">
                      <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
                        <div className="h-full bg-primary-container w-1/2"></div>
                      </div>
                      <span className="font-label-caps text-label-caps text-on-surface-variant mt-1">Authorized Handshake</span>
                    </div>

                    <div className="flex flex-col items-center gap-space-xs">
                      <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface shadow-md">
                        <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
                      </div>
                      <span className="font-title-md text-title-md text-on-surface">Partner Portal</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">Official Seat</span>
                    </div>
                  </div>
                </div>

                {/* Split Console */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                  {/* LEFT COLUMN (55%) */}
                  <div className="lg:col-span-7 flex flex-col gap-space-lg">
                    <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-primary">airplane_ticket</span>
                          <span className="font-title-lg text-title-lg text-on-surface font-bold">Expedition Segment Summary</span>
                        </div>
                        <span className="px-space-xs py-1 rounded bg-surface-container-high font-label-caps text-label-caps uppercase text-secondary font-bold">
                          Non-Stop Air Corridor
                        </span>
                      </div>

                      <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-space-md">
                        <div>
                          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Selected Sector</span>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">Ahmedabad (AMD) ✈ Bhuj Desert (BHJ)</h3>
                          <span className="font-body-sm text-body-sm text-secondary">Alliance Subcontinental Air Lines • AI-894</span>
                        </div>
                        <div className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary-container font-title-lg text-title-lg font-bold shadow-sm">
                          ₹9,450
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                        <div className="flex flex-col bg-surface p-space-md rounded-xl gap-space-xs">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Departure &amp; Schedule</span>
                          <span className="font-title-md text-title-md text-on-surface">18 Dec 2026 • 07:45 IST</span>
                          <span className="font-body-sm text-body-sm text-secondary">Sardar Vallabhbhai Patel Int&apos;l — T2</span>
                        </div>
                        <div className="flex flex-col bg-surface p-space-md rounded-xl gap-space-xs">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Passenger Manifest</span>
                          <span className="font-title-md text-title-md text-on-surface">2 Adult Passengers</span>
                          <span className="font-body-sm text-body-sm text-secondary">Kaushal Patel (Primary) + 1</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-space-sm p-space-md bg-surface-container-low rounded-xl">
                        <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">info</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                          <strong>Mandatory Carrier Disclosure:</strong> Base pricing holds for 15 minutes. Specific seat selections, baggage allowances beyond standard 15kg, and special meals will be finalized on the carrier’s secure terminal checkout.
                        </p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold">What to Expect During Transition</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                        <div className="flex flex-col gap-space-xs p-space-md bg-surface rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-title-md text-title-md font-bold text-on-surface">01</div>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">Review Manifest</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            Your government IDs, names, and contact parameters are pre-populated into their reservation console.
                          </p>
                        </div>

                        <div className="flex flex-col gap-space-xs p-space-md bg-surface rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-title-md text-title-md font-bold text-on-surface">02</div>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">Instant Issuance</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            Execute payment on the airline&apos;s official secure node. UPI, Sovereign RuPay, and corporate cards accepted.
                          </p>
                        </div>

                        <div className="flex flex-col gap-space-xs p-space-md bg-surface rounded-xl">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-title-md text-title-md font-bold text-on-surface">03</div>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">Adaptive Sync</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            Your PNR code is immediately reconciled into your BharatYatra master itinerary and Rann transit cards.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN (45%) */}
                  <div className="lg:col-span-5 flex flex-col gap-space-lg">
                    <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
                      <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">Authorized Booking Partner</span>
                      <div className="flex items-center gap-space-md">
                        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-3xl">connecting_airports</span>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-title-lg text-title-lg text-on-surface font-bold">Air India Subcontinental</h4>
                          <div className="flex items-center gap-space-xs">
                            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            <span className="font-label-md text-label-md text-on-surface font-medium">DGCA &amp; IATA Certified Carrier</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        You will conclude this ticket procurement through Air India&apos;s official Sovereign Tier API gateway under standard DGCA passenger charters.
                      </p>
                    </div>

                    <div className="bg-surface-container-low rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-xs">
                      <div className="flex items-center gap-space-xs text-primary">
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                        <span className="font-title-md text-title-md text-on-surface font-semibold">External Secure Node Handshake</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        The next action opens the provider’s direct booking environment. Their cancellation matrices, refund windows, and direct merchant settlement channels apply.
                      </p>
                    </div>

                    <div className="flex flex-col gap-space-sm">
                      <button className="w-full py-space-md px-space-lg bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md transition-all" onClick={() => setActiveState('dispatching')}>
                        <span className="material-symbols-outlined text-xl">lock</span>
                        <span>Continue Securely to Provider</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </button>
                      <Link className="w-full py-space-sm px-space-md text-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="/my-trips">
                        ← Return to Gujarat Trip Review
                      </Link>
                      <div className="flex items-center justify-center gap-space-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                        <span className="font-label-caps text-label-caps uppercase tracking-wider">Protected by 256-Bit TLS Handshake • Zero Surcharge</span>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-start gap-space-sm">
                      <div className="w-10 h-10 rounded-xl bg-inverse-surface text-primary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">Farva AI Adaptive Sync</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Once the booking reference (PNR) is generated, it will immediately mesh with your Sasan Gir Safari pass and desert tent reservation in My Trips.
                        </p>
                        <Link className="font-label-md text-label-md text-primary font-semibold hover:underline mt-1" href="/my-trips">
                          View Active Gujarat Master Itinerary →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 2: CONNECTING / DISPATCHING */}
            {activeState === 'dispatching' && (
              <div className="flex flex-col items-center justify-center py-space-xl max-w-2xl mx-auto text-center gap-space-lg">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="animate-spin w-full h-full text-primary" viewBox="0 0 100 100">
                    <circle className="opacity-25" cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="opacity-75" cx="50" cy="50" fill="none" r="42" stroke="currentColor" strokeDasharray="180" strokeDashoffset="60" strokeWidth="6"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-4xl text-primary">hub</span>
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest font-bold">Secure Corridor Dispatch</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Transferring to Air India Reservation Node</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                    Please keep this tab open. Establishing a private encrypted channel and pre-filling passenger data for Kaushal Patel.
                  </p>
                </div>

                <div className="w-full bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md text-left">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">Gujarat Expedition Cart Session Validated</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-xl animate-spin">refresh</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">Exchanging TLS 256-Bit Mutual Authentication Keys</span>
                  </div>
                  <div className="flex items-center gap-space-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-xl">radio_button_unchecked</span>
                    <span className="font-body-md text-body-md">Authorizing DGCA Verified Booking Seat Hold</span>
                  </div>
                </div>

                <div className="flex gap-space-sm">
                  <button className="px-space-lg py-space-sm bg-primary-container text-on-primary-container rounded-xl font-label-lg text-label-lg shadow-sm" onClick={() => setActiveState('confirmed')}>
                    Simulate Successful Booking
                  </button>
                  <button className="px-space-lg py-space-sm bg-surface-container-high text-on-surface rounded-xl font-label-lg text-label-lg" onClick={() => setActiveState('cancelled')}>
                    Simulate User Back-Track
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: RETURN - CONFIRMED */}
            {activeState === 'confirmed' && (
              <div className="flex flex-col gap-space-lg max-w-3xl mx-auto">
                <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-md flex flex-col gap-space-lg text-center items-center">
                  <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary font-bold">Corridor Return Successful</span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Reservation Synced &amp; Confirmed</h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">
                      Air India has issued confirmation code <strong className="text-on-surface">CF-AIR-88210</strong>. Your flight is now officially part of your sovereign journey.
                    </p>
                  </div>

                  <div className="w-full bg-surface-container-low p-space-md rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-space-md text-left">
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">PNR Code</span>
                      <span className="font-title-md text-title-md text-on-surface font-mono font-bold">CF-AIR-88210</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Route</span>
                      <span className="font-title-md text-title-md text-on-surface">AMD ✈ BHJ (Bhuj)</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Status</span>
                      <span className="font-title-md text-title-md text-primary font-bold">Confirmed &amp; Ticketed</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-space-md w-full justify-center">
                    <Link className="py-space-sm px-space-xl bg-inverse-surface hover:bg-on-secondary-fixed text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-colors shadow-sm" href="/my-trips">
                      <span className="material-symbols-outlined text-primary-container">luggage</span>
                      <span>View in My Trips</span>
                    </Link>
                    <Link className="py-space-sm px-space-xl bg-primary-container hover:bg-primary-fixed text-on-primary-container rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-colors shadow-sm" href="/booking/success">
                      <span className="material-symbols-outlined">download</span>
                      <span>Download Sovereign Dossier</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 4: RETURN - PENDING */}
            {activeState === 'pending' && (
              <div className="flex flex-col gap-space-lg max-w-3xl mx-auto">
                <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-md flex flex-col gap-space-lg text-center items-center">
                  <div className="w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-4xl animate-pulse">hourglass_top</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-bold">Status: Pending Settlement Handshake</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Awaiting Final Provider Settlement</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
                      We’ve verified your return from the Air India reservation console. The airline is currently finalizing transaction clearance with banking gateways.
                    </p>
                  </div>

                  <div className="bg-surface-container-low p-space-md rounded-xl w-full text-left flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">timer</span>
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md text-on-surface font-semibold">Automatic 10-Minute Polling Active</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Farva AI will monitor the carrier’s webhook node. As soon as the PNR is generated, an SMS notification will reach +91 98250 11099.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-space-sm">
                    <button className="px-space-lg py-space-sm bg-primary-container text-on-primary-container rounded-xl font-label-lg text-label-lg" onClick={() => setActiveState('confirmed')}>
                      Refresh Status Now
                    </button>
                    <Link className="px-space-lg py-space-sm bg-surface-container-high text-on-surface rounded-xl font-label-lg text-label-lg" href="/my-trips">
                      Go to My Trips
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 5: RETURN - CANCELLED */}
            {activeState === 'cancelled' && (
              <div className="flex flex-col gap-space-lg max-w-3xl mx-auto">
                <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-md flex flex-col gap-space-lg text-center items-center">
                  <div className="w-20 h-20 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl">arrow_back</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant font-bold">Corridor Interrupted</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Booking Not Completed</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                      You returned to BharatYatra before completing payment on the partner gateway. No payment has been debited.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-space-sm">
                    <button className="py-space-sm px-space-lg bg-primary-container text-on-primary-container rounded-xl font-label-lg text-label-lg font-bold" onClick={() => setActiveState('active')}>
                      Resume Handoff to Partner
                    </button>
                    <Link className="py-space-sm px-space-lg bg-surface-container-high text-on-surface rounded-xl font-label-lg text-label-lg" href="/experiences">
                      Review Alternative Routes
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 6: SESSION EXPIRED */}
            {activeState === 'expired' && (
              <div className="flex flex-col gap-space-lg max-w-3xl mx-auto">
                <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-md flex flex-col gap-space-lg text-center items-center">
                  <div className="w-20 h-20 rounded-full bg-surface-container-highest text-error flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl">lock_clock</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-error font-bold">Session Timed Out</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Corridor Security Window Expired</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                      For traveler manifest security and real-time inventory locking, partner corridor tokens expire after 15 minutes.
                    </p>
                  </div>
                  <button className="py-space-sm px-space-lg bg-primary-container text-on-primary-container rounded-xl font-label-lg text-label-lg font-bold" onClick={() => setActiveState('active')}>
                    Regenerate Secure Token
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Sovereign Trust & Security Ribbon Banner */}
          <section className="w-full bg-surface-container-lowest shadow-sm mt-space-xl py-space-lg">
            <div className="max-w-7xl mx-auto px-margin">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
                <div className="flex items-center gap-space-sm p-space-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">shield</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">256-Bit Link</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">TLS Bank-Grade Tunnel</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm p-space-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">handshake</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">Direct Carrier</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Verified DGCA Manifest</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm p-space-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">price_check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">Zero Markups</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Transparent Base Tariffs</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm p-space-sm">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-xl">support_agent</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">24/7 Sovereign Care</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Concierge: 1800 203 1111</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
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

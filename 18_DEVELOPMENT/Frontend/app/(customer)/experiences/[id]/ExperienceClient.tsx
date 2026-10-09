'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ExperienceDetailPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('2026-12-26');
  const [selectedTime, setSelectedTime] = useState('09:30 AM');
  const [paxCount, setPaxCount] = useState(2);
  const [protoState, setProtoState] = useState<'default' | 'soldout' | 'fare' | 'conflict' | 'checkout'>('default');
  
  const basePricePerPerson = protoState === 'fare' ? 2799 : 2499;
  const subtotal = paxCount * basePricePerPerson;
  const bookingFee = 150;
  const total = subtotal + bookingFee;

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col antialiased">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-on-secondary-fixed/95 backdrop-blur-xl z-50 flex items-center justify-between px-6 shadow-[0_12px_32px_-8px_rgba(20,26,50,0.12)]">
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-sm">
              <span className="font-headline-sm text-headline-sm text-primary font-bold">CF</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-surface tracking-tight font-bold">BharatYatra</span>
              <span className="font-label-caps text-label-caps text-primary-fixed-dim uppercase tracking-widest">
                ભારત યાત્રા • Sovereign Gujarat Travel Engine
              </span>
            </div>
          </Link>
        </div>
        <nav className="hidden xl:flex items-center gap-1 bg-inverse-surface/60 p-1.5 rounded-2xl">
          <Link className="font-label-md text-label-md text-tertiary-fixed px-3 py-2 rounded-xl transition-colors hover:text-surface" href="/circuits">
            Gujarat Circuits
          </Link>
          <Link className="font-label-md text-label-md text-tertiary-fixed px-3 py-2 rounded-xl transition-colors hover:text-surface" href="/plan">
            AI Planner
          </Link>
          <Link className="font-label-md text-label-md text-tertiary-fixed px-3 py-2 rounded-xl transition-colors hover:text-surface" href="/stays">
            Hotels &amp; Stays
          </Link>
          <Link className="font-label-md text-label-md text-tertiary-fixed px-3 py-2 rounded-xl transition-colors hover:text-surface" href="/buses">
            GSRTC Buses
          </Link>
          <Link className="font-label-md text-label-md text-tertiary-fixed px-3 py-2 rounded-xl transition-colors hover:text-surface" href="/trains">
            Trains
          </Link>
          <Link className="font-label-md text-label-md text-tertiary-fixed px-3 py-2 rounded-xl transition-colors hover:text-surface" href="/flights">
            Flights
          </Link>
          <Link className="font-label-md text-label-md text-tertiary-fixed px-3 py-2 rounded-xl transition-colors hover:text-surface" href="/restaurants">
            Restaurants
          </Link>
          <Link aria-current="page" className="px-3 py-2 transition-colors bg-primary-container text-on-primary-container font-bold rounded-xl shadow-[0_0_20px_-2px_rgba(254,214,91,0.35)]" href="/experiences">
            Experiences
          </Link>
          <Link className="font-label-md text-label-md text-tertiary-fixed px-3 py-2 rounded-xl transition-colors hover:text-surface" href="/my-trips">
            My Trips
          </Link>
        </nav>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-inverse-surface/80">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-primary-fixed tracking-wider">100% GROUND RULES SYNCED</span>
          </div>
          <div className="flex items-center pl-2">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida/AEtjO1Ui59jsO1cRmYcx_EhvwkLGkFogmDjmf7WlO_OauBFwKZ0uk_e307OoSlXT4rFNOTTz18I6VJ9GGtE93D4OpgxiI9xOdoffUGkzgoQ0KG88ACv-KY9EVYggJxEwdGNO95rCHoqDEYuaDqN7tRftqN7dgBVeMibJArETY3NhtGtIYgwZNrtEOGWVQM_PjXq995rzqJH5UGpxAdJ8JA0v0kOcVN3eHS4E9bOBnUkpNA-jIX-7ScyvFM41G5v_ZvuZOXHwVOlo5WZh9Nc"
            />
          </div>
        </div>
      </header>

      {/* SIDEBAR & MAIN AREA */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 bg-surface-container-lowest z-40 flex flex-col py-6 shadow-[0_4px_16px_-4px_rgba(20,26,50,0.06)]">
        <div className="px-6 mb-4">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">Sovereign Ops</span>
        </div>
        <nav className="flex-1 px-4 space-y-1.5">
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" href="/map">
            <span className="material-symbols-outlined text-primary">explore</span>Geospatial Deck
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" href="/circuits">
            <span className="material-symbols-outlined text-primary">route</span>Heritage &amp; Wildlife
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" href="/plan">
            <span className="material-symbols-outlined text-primary">psychology</span>Neural Itinerary
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" href="/buses">
            <span className="material-symbols-outlined text-primary">directions_bus</span>GSRTC Express Hub
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" href="/trains">
            <span className="material-symbols-outlined text-primary">train</span>Western Railway Sync
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" href="/stays">
            <span className="material-symbols-outlined text-primary">castle</span>Palaces &amp; Resorts
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" href="/my-trips">
            <span className="material-symbols-outlined text-primary">confirmation_number</span>Active Bookings
          </Link>
        </nav>
      </aside>

      <div className="pl-64">
        <main className="relative pt-20 w-full bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            {/* Prototype Controller */}
            <div className="w-full bg-on-secondary-fixed text-tertiary-fixed px-6 py-2.5 flex items-center justify-between text-xs shadow-sm select-none">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary-fixed">Prototype Mode Engine</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  className={`px-3 py-1 rounded-full font-label-caps text-label-caps uppercase tracking-wider transition-all ${
                    protoState === 'default' ? 'bg-primary-container text-on-primary-container shadow-sm font-bold' : 'bg-inverse-surface text-tertiary-fixed'
                  }`}
                  onClick={() => setProtoState('default')}
                >
                  Default: Date &amp; Slot Selected
                </button>
                <button
                  className={`px-3 py-1 rounded-full font-label-caps text-label-caps uppercase tracking-wider transition-all ${
                    protoState === 'soldout' ? 'bg-primary-container text-on-primary-container shadow-sm font-bold' : 'bg-inverse-surface text-tertiary-fixed'
                  }`}
                  onClick={() => setProtoState('soldout')}
                >
                  Slot Sold Out State
                </button>
                <button
                  className={`px-3 py-1 rounded-full font-label-caps text-label-caps uppercase tracking-wider transition-all ${
                    protoState === 'fare' ? 'bg-primary-container text-on-primary-container shadow-sm font-bold' : 'bg-inverse-surface text-tertiary-fixed'
                  }`}
                  onClick={() => setProtoState('fare')}
                >
                  Fare Update (+₹300)
                </button>
                <button
                  className={`px-3 py-1 rounded-full font-label-caps text-label-caps uppercase tracking-wider transition-all ${
                    protoState === 'conflict' ? 'bg-primary-container text-on-primary-container shadow-sm font-bold' : 'bg-inverse-surface text-tertiary-fixed'
                  }`}
                  onClick={() => setProtoState('conflict')}
                >
                  Itinerary Conflict Warning
                </button>
              </div>
            </div>

            {/* Breadcrumb Navigation Bar */}
            <div className="w-full bg-surface-container-lowest px-8 py-3.5 flex items-center justify-between shadow-[0_2px_8px_-2px_rgba(20,26,50,0.04)]">
              <div className="flex items-center gap-3 text-body-sm font-body-sm">
                <Link className="inline-flex items-center gap-1.5 text-primary hover:text-on-surface font-label-md text-label-md transition-colors" href="/experiences">
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to Gujarat Experiences
                </Link>
                <span className="text-outline-variant">/</span>
                <span className="text-secondary">Experiences</span>
                <span className="text-outline-variant">/</span>
                <span className="text-secondary">Kutch Rogan Art &amp; Cultural Guild</span>
                <span className="text-outline-variant">/</span>
                <span className="font-title-md text-title-md text-on-surface">Masterclass Dossier</span>
              </div>
            </div>

            {/* Main Canvas Container */}
            <div className="max-w-[1440px] w-full mx-auto px-8 py-8 space-y-10">
              {/* Hero Showcase Card */}
              <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_12px_32px_-8px_rgba(20,26,50,0.14)] bg-on-secondary-fixed">
                <div className="relative w-full h-[520px]">
                  <img
                    alt="Master artisan demonstrating Rogan art painting"
                    className="w-full h-full object-cover object-center"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1WifHT792JvWnt6sM0xqWc_0VWQmVGbsUoa0HxMxNC1QmANCmcMBwjWqSl1PYxw25hTJZSeP1Ehzp438EGXiFX3q6AoeM7T28gYWWzgsJPPymN1dxCjvK8OBGoORS0VtEu7EF8Z8zLrQwSvbMeejWibrPcF6yIj7orUk8rrbujzVdjA1weTgXjJhaMPt92k6J_NQJzCkls4wy9TxKQ_gljtM808Ua5HBP5ig38lYVdJWrSs3NL9e6gIt-qu"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed via-on-secondary-fixed/50 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-3xl space-y-3">
                      <span className="font-label-caps text-label-caps uppercase text-primary-fixed">GUJARAT LIVING TRADITIONS • GEO-INDEX: 23.2420° N, 69.6669° E</span>
                      <h1 className="font-display-hero text-headline-lg md:text-display-hero text-surface leading-tight tracking-tight">
                        Master Rogan Art Fabric Guild &amp; Artisan Workshop
                      </h1>
                      <p className="font-body-lg text-body-lg text-tertiary-fixed max-w-2xl leading-relaxed">
                        Authentic 300-year-old castor oil stylus painting with national award-winning Khatri master craftsmen in peaceful Nirona village.
                      </p>
                    </div>
                    <div className="px-5 py-3 rounded-xl bg-inverse-surface/80 backdrop-blur-md border border-outline-variant/30 text-right">
                      <span className="font-label-caps text-label-caps text-tertiary-fixed uppercase tracking-wider block">Sovereign Fare</span>
                      <span className="font-headline-md text-headline-md text-primary-fixed">₹{basePricePerPerson.toLocaleString('en-IN')}</span>
                      <span className="font-body-sm text-body-sm text-tertiary-fixed block">per artisan slot</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-10">
                  <section className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm space-y-6">
                    <h2 className="font-headline-md text-headline-md text-on-surface">About This Sovereign Experience</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Rogan painting is an extraordinary, labor-intensive craft once on the brink of extinction, practiced exclusively by a single family in Nirona village, Kutch. The technique uses boiled castor oil infused with natural pigments.
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      During this masterclass, you sit inside the ancestral Khatri family haveli, guided directly by national master artisans. Leave with your own hand-crafted, framed Rogan silk swatch.
                    </p>
                  </section>
                </div>

                {/* Right Sticky Booking Console */}
                <div className="lg:col-span-4">
                  <div className="sticky top-28 space-y-6">
                    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                        <div>
                          <span className="font-label-caps text-label-caps text-primary uppercase font-bold">RESERVE GUILD SLOT</span>
                          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Select Date &amp; Guests</h3>
                        </div>
                      </div>

                      {/* Date Picker */}
                      <div className="space-y-2">
                        <label className="font-label-md text-label-md font-bold text-on-surface uppercase">Select Date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-surface-container-low font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-2">
                        <label className="font-label-md text-label-md font-bold text-on-surface uppercase">Select Time Slot</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['09:30 AM', '02:00 PM'].map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={`py-2.5 px-3 rounded-xl font-label-md text-label-md border transition-all cursor-pointer ${
                                selectedTime === slot
                                  ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-sm'
                                  : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Number of Guests */}
                      <div className="space-y-2">
                        <label className="font-label-md text-label-md font-bold text-on-surface uppercase">Number of Guests</label>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                          <span className="font-title-md text-title-md text-on-surface font-semibold">{paxCount} Guests</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPaxCount((p) => Math.max(1, p - 1))}
                              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high font-bold text-lg flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaxCount((p) => p + 1)}
                              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high font-bold text-lg flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Total Calculation */}
                      <div className="pt-4 border-t border-surface-container space-y-2 font-body-md">
                        <div className="flex justify-between text-secondary font-body-sm">
                          <span>{paxCount} × Masterclass Slot</span>
                          <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-secondary font-body-sm">
                          <span>Sovereign Concierge &amp; Heritage Fee</span>
                          <span>₹{bookingFee}</span>
                        </div>
                        <div className="flex justify-between text-on-surface font-bold font-title-lg pt-2 border-t border-surface-container">
                          <span>Total Amount</span>
                          <span className="text-primary font-headline-sm">₹{total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push('/checkout')}
                        className="w-full py-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer text-center"
                      >
                        Reserve Guild Slot →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

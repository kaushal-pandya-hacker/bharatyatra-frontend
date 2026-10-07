'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { isBookingServiceAvailable } from '@/lib/booking-availability';
import { BookingUnavailableModal } from '@/components/booking/BookingUnavailableModal';

function CheckoutPageContent() {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [activeModal, setActiveModal] = useState<'none' | 'processing' | 'success' | 'failed'>('none');
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('FARVA10');
  const [couponApplied, setCouponApplied] = useState<boolean>(true);
  const [upiVpa, setUpiVpa] = useState<string>('poojapatel@okaxis');
  const [secondsLeft, setSecondsLeft] = useState<number>(351); // 5 min 51 sec
  const [showUnavailableModal, setShowUnavailableModal] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs} min`;
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'FARVA10') {
      setCouponApplied(true);
      alert('FARVA10 is already active: ₹6,000 Sovereign Loyalty privilege deducted.');
    } else if (couponCode.trim()) {
      setCouponApplied(true);
      alert(`Applied voucher: ${couponCode.trim().toUpperCase()}`);
    }
  };

  const triggerProcessingFlow = () => {
    const availability = isBookingServiceAvailable('hotels');
    if (!availability.available) {
      setShowUnavailableModal(true);
      return;
    }

    setActiveModal('processing');
    setProcessingStep(1);

    setTimeout(() => setProcessingStep(2), 700);
    setTimeout(() => setProcessingStep(3), 1400);
    setTimeout(() => setProcessingStep(4), 2100);
    setTimeout(() => {
      setActiveModal('success');
    }, 2800);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(20,26,50,0.06)]">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin h-20 flex items-center justify-between gap-gutter">
          <div className="flex items-center gap-space-md">
            <Link href="/">
              <img
                alt="BharatYatra Logo"
                className="h-10 w-auto object-contain cursor-pointer"
                src="/logo.png"
              />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-title-lg text-title-lg text-on-surface tracking-tight font-headline-lg">
                  BharatYatra
                </span>
                <span className="px-space-xs py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">explore</span> Sovereign
                </span>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                ભારત યાત્રા • AI Luxury Expeditions
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center">
            <nav className="flex items-center bg-surface-container-low p-1.5 rounded-full">
              <Link
                href="#"
                className="flex items-center gap-space-xs px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
              >
                <span className="font-label-caps text-label-caps">1</span>
                <span className="font-label-md text-label-md">Review Trip</span>
              </Link>
              <span className="text-outline-variant font-label-md px-1">•</span>
              <Link
                href="#"
                className="flex items-center gap-space-xs px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
              >
                <span className="font-label-caps text-label-caps">2</span>
                <span className="font-label-md text-label-md">Traveller Details</span>
              </Link>
              <span className="text-outline-variant font-label-md px-1">•</span>
              <Link
                href="#"
                className="flex items-center gap-space-xs px-space-md py-1 rounded-full bg-on-secondary-fixed text-primary-container font-label-md font-semibold shadow-[0_0_16px_-2px_rgba(254,214,91,0.35)] transition-all"
              >
                <span className="font-label-caps text-label-caps">3</span>
                <span className="font-label-md text-label-md">Payment &amp; Services</span>
              </Link>
              <span className="text-outline-variant font-label-md px-1">•</span>
              <Link
                href="#"
                className="flex items-center gap-space-xs px-space-md py-1 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
              >
                <span className="font-label-caps text-label-caps">4</span>
                <span className="font-label-md text-label-md">Confirmation</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden xl:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-low text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span className="font-label-caps text-label-caps tracking-wide uppercase text-on-surface-variant">
                256-Bit SSL • GST &amp; Sync
              </span>
            </div>
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                Concierge Desk
              </span>
              <a
                className="font-title-md text-title-md text-on-surface hover:text-primary transition-colors tracking-tight font-headline-sm"
                href="tel:18002031111"
              >
                1800 203 1111
              </a>
            </div>
            <div className="flex items-center pl-space-xs">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container shadow-sm"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WZuadRQKU3UEwQO6rbal-x1osIc2C5AEK3zvQYx6sB8h_VwAhruwUEWUx2kEdDgnott3tzJ25wIBIMCSqnnYW7Z88tIyyqVRysYnzNoq2j8qOW4UaYv-EhZbkWfSqNVRqAVgAffrbBFYtw62infW9BcNUrZdkSb4_eqfb1Cz9uqVE4_V4UH_ixvDav_R4KBb3EGVQ9ht5_hX6-FbCB0sbgSQ6d4Vy7hqnSjbfOEv2akTJ0pGf3z2U3FsPz"
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full pt-20 bg-surface flex-1">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin py-space-xl">
          <div className="flex flex-col w-full text-on-surface">
            {/* HERO & SUMMARY BANNER */}
            <section className="relative w-full rounded-2xl bg-on-secondary-fixed text-surface-container-lowest p-6 md:p-10 shadow-xl overflow-hidden mb-8">
              <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-primary-container/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute top-0 left-1/3 w-64 h-64 bg-tertiary-fixed/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/10 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                    <span className="font-label-caps text-label-caps tracking-widest uppercase text-primary-container">
                      UNIFIED MULTI-SERVICE EXPEDITION CHECKOUT // PNR BUNDLE #CF-GJ-8820
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md shadow-md">
                    <span className="material-symbols-outlined text-[18px]">timer</span>
                    <span>
                      Inventory Reserved for <strong>{formatTime(secondsLeft)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="font-headline-lg text-headline-lg md:text-display-hero text-surface-container-lowest tracking-tight">
                      Complete Your Gujarat Journey
                    </h1>
                    <p className="font-body-lg text-body-lg text-secondary-container mt-2 max-w-2xl">
                      Everything for your trip, together in one secure, unified booking with zero hidden charges.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-surface-container-lowest/10 backdrop-blur text-right">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-wider block">
                        Unified Trip Value
                      </span>
                      <span className="font-headline-md text-headline-md text-primary-container">₹54,000</span>
                    </div>
                  </div>
                </div>

                {/* Route Strip Card */}
                <div className="mt-2 p-4 md:p-5 rounded-xl bg-surface-container-lowest/5 backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-surface-container-lowest">
                    <span className="font-title-md text-title-md text-primary-container flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span> Royal Gujarat Discovery
                    </span>
                    <span className="text-outline-variant/60 mx-1">•</span>
                    <div className="flex flex-wrap items-center gap-1.5 font-medium">
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/10">Ahmedabad</span>
                      <span className="material-symbols-outlined text-[14px] text-primary-container">arrow_forward</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/10">Bhuj</span>
                      <span className="material-symbols-outlined text-[14px] text-primary-container">arrow_forward</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/10">Dhordo</span>
                      <span className="material-symbols-outlined text-[14px] text-primary-container">arrow_forward</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/10">Junagadh</span>
                      <span className="material-symbols-outlined text-[14px] text-primary-container">arrow_forward</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/10">Gir</span>
                      <span className="material-symbols-outlined text-[14px] text-primary-container">arrow_forward</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/10">Somnath</span>
                      <span className="material-symbols-outlined text-[14px] text-primary-container">arrow_forward</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-lowest/10">Dwarka</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-secondary-container font-label-md text-label-md">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span> Dec 24–29, 2026 (6D/5N)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">group</span> 4 Guests (2 Adults, 2 Kids)
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary-container font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span> Sovereign Guaranteed
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* MAIN 2-COLUMN CHECKOUT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: MULTI-SERVICE INVENTORY & TRAVELLERS */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
                {/* SECTION A: MULTI-SERVICE BOOKING SUMMARY */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold">
                        1
                      </span>
                      <h2 className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
                        Expedition Services Breakdown
                      </h2>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface-variant">6 Unified Line Items</span>
                  </div>

                  {/* ITEM 1: TRANSIT (GSRTC Volvo Club Class) */}
                  <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden relative shrink-0 bg-surface-container">
                        <img
                          className="w-full h-full object-cover"
                          alt="Modern luxury Volvo multi-axle sleeper bus moving at sunrise along an Indian national highway"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuANhQDW35QC5_xb1cbPUJ-HfV3X_dXT3TFzsq6rPdcso_8xtndUoJfPnee-6dTcRX1SlN9liUkTYlzu4-S3Wk-TVl5G9bIPOZlTbYVXD3CR-5tgCe8vBLEGO1Va_N-2zoPMKirimJ3nevPdYK6I4x6MEVnt8OUEzlIY-H2Gd2ozm86rW9Xr2CZtNBMiP5qUAdiIc6OLesjLwiJVcA4cYnyyUF3JbqbrYMLIL5gYA8dXFXdrRSMaNb9F3w"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-on-secondary-fixed/80 text-primary-container font-label-caps text-label-caps uppercase">
                          Transit
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between h-full gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-title-lg text-title-lg text-on-surface">
                                GSRTC Volvo Multi-Axle Club Class Sleeper
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-fixed-variant font-label-caps text-label-caps font-bold uppercase">
                                Live State Transit Link
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              Ahmedabad (Geeta Mandir) → Bhuj Junction • Berths 14A, 14B, 15A, 15B (Lower Tier)
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-title-lg text-title-lg text-on-surface">₹4,200</span>
                            <span className="block font-label-caps text-label-caps text-on-surface-variant">
                              4 Passengers
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-surface-container-low/50 p-2 rounded-lg">
                          <div className="flex items-center gap-3 font-label-md text-label-md text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-primary">schedule</span> Dec 24 • 06:00 → 13:00 (7 hrs)
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-primary">luggage</span> 20kg/pax included
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-label-md text-label-md">
                            <button
                              type="button"
                              className="text-primary hover:underline font-semibold"
                              onClick={() => alert('Viewing GSRTC Sleeper Bay layout: Lower tier berths 14A-15B confirmed.')}
                            >
                              View Seat Layout
                            </button>
                            <span className="text-outline-variant">•</span>
                            <button
                              type="button"
                              className="text-on-surface-variant hover:text-on-surface"
                              onClick={() => alert('Transit modifications require 24hr notice prior to departure.')}
                            >
                              Modify
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ITEM 2: STAY (Dhordo Swiss Tent City) */}
                  <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden relative shrink-0 bg-surface-container">
                        <img
                          className="w-full h-full object-cover"
                          alt="Dhordo luxury Royal Swiss Tent City in Gujarat at dusk"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpXcIorYeBpeoNH_MnwfMHxQkSVMLeM2ui-etinppZ47FmHxc_F2rcGOg5fGYlhoAPyBBDgrvmJnZYYgEVrcexyrOTKKxOaSdQgPQh6yMLSop5TUQ06BnTQePHR-8ndcKr5DLRJdLwq_okWeKzq96KYkNfZi3cU8JuYN_13yfWzdl9E_ZPFw5k-q8Z1br_pKyrwAJsvUbakmGCAUqBqnTwunkTns6vbszMLAlpPmJFDVnFCFQksudacg"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-on-secondary-fixed/80 text-primary-container font-label-caps text-label-caps uppercase">
                          Royal Stay
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between h-full gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-title-lg text-title-lg text-on-surface">
                                Dhordo Luxury Royal Swiss Tent City
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-caps text-label-caps font-semibold uppercase">
                                Pre-Allocated Suite
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              2x AC Swiss Heritage Tents (#42 &amp; #43) with private en-suite &amp; Lipan mud-mirror craft
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-title-lg text-title-lg text-on-surface">₹24,000</span>
                            <span className="block font-label-caps text-label-caps text-on-surface-variant">
                              2 Nights • Full Board
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-surface-container-low/50 p-2 rounded-lg">
                          <div className="flex items-center gap-3 font-label-md text-label-md text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-primary">restaurant</span> Kathiyawadi Meals + High Tea
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px] text-primary">badge</span> Rann Permit Handled
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-label-md text-label-md">
                            <button
                              type="button"
                              className="text-primary hover:underline font-semibold"
                              onClick={() => alert('Amenities: 24/7 hot water, temperature control, butler call, traditional Kutchi shawls.')}
                            >
                              Room Amenities
                            </button>
                            <span className="text-outline-variant">•</span>
                            <button
                              type="button"
                              className="text-on-surface-variant hover:text-on-surface"
                              onClick={() => alert('Special Request modal: Jain meal & adjoining tents noted.')}
                            >
                              Special Request
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ITEM 3: SIGNATURE EXPERIENCE */}
                  <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden relative shrink-0 bg-surface-container">
                        <img
                          className="w-full h-full object-cover"
                          alt="Vast white salt desert of White Rann at dramatic golden hour"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK5pS7eTS8Wlr3VDeWd0yakFXdjRgZ6KW0pTvo-CRsD7bcuxjPnUyW-PrzKQDoEvJ4BvNFmCNbGN6IJnTHTWddl-xMGAN54E-GtsTq7UzciOAA1312vR9tukQtd7BjeoV4HSnxHHQZ1ugV4HvbccnBuSvcL8gHb6NlONZUZOjJFI-CPxlAJFfoC1XSNsO5YrCddo9EIGw8pzXpGzsuI-NaS27i2rJDsQCB7LKqHgrMWlysLA6e4HK5vg"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-on-secondary-fixed/80 text-primary-container font-label-caps text-label-caps uppercase">
                          Experience
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between h-full gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-title-lg text-title-lg text-on-surface">
                                White Rann Sunset &amp; Moonlit Salt Walk
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-fixed-variant font-label-caps text-label-caps font-bold uppercase">
                                Slot Secured
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              Dec 24 • 18:15 (Sunset 18:24) • Private camel cart escort, Kutchi rabab music &amp; dune seating
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-title-lg text-title-lg text-primary">Included</span>
                            <span className="block font-label-caps text-label-caps text-on-surface-variant">
                              Complimentary Add-On
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md pt-2 bg-surface-container-low/50 p-2 rounded-lg">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">wb_twilight</span> VIP Sunset Deck Access with Warm Saffron Tea
                          </span>
                          <span className="text-on-surface font-medium">4 Guests Checked-In</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ITEM 4: WILDLIFE EXPEDITION */}
                  <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden relative shrink-0 bg-surface-container">
                        <img
                          className="w-full h-full object-cover"
                          alt="Majestic wild Asiatic lion resting on sunlit rocks surrounded by forest"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4d_bWiBH4SkYs9Z9rq2SXWZofc-s5ray-2_H4BcNR6R-_yQ3JaEcoTRaMjThWTfoPtgVL-EASWb94_PtUQ7AuJFVK4Ke54erOuSR4W2rnYsd0J5cWLQja2qrSQkHQA1HfKdRWvDahi2my_TSrcTp2MWBEvxUwPUBeLGgThpl7lAlbBTJkd-x5-9lBlhw4flLF4Z5L12klP1_t4MjC0WVMG5XKV1-uqIRWSFxv10hnx1H791ft9JNH3w"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-on-secondary-fixed/80 text-primary-container font-label-caps text-label-caps uppercase">
                          Safari
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between h-full gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-title-lg text-title-lg text-on-surface">
                                Sasan Gir Asiatic Lion Open Gypsy Safari
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-caps text-label-caps font-bold uppercase">
                                Permit #GIR-4402
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              Dec 27 • 06:30–09:30 Slot • Zone 04 Dedicated Open 4x4 Gypsy + Govt Naturalist
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-title-lg text-title-lg text-on-surface">₹7,500</span>
                            <span className="block font-label-caps text-label-caps text-on-surface-variant">
                              Permit + Gypsy + Guide
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-surface-container-low/50 p-2 rounded-lg">
                          <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px] text-primary">camera</span> High Probability Lion Corridor Slot
                          </div>
                          <button
                            type="button"
                            className="font-label-md text-label-md text-primary font-semibold hover:underline"
                            onClick={() => alert('Permit GIR-4402 locked via Gujarat State Forest Department. Photo ID mandatory at Sinh Sadan gate.')}
                          >
                            Permit Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ITEM 5: SACRED PASS */}
                  <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden relative shrink-0 bg-surface-container">
                        <img
                          className="w-full h-full object-cover"
                          alt="Historic Somnath shore temple at sunset"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0A3dtqfJsqaVkk_A_JpZrXnI3BNCX_X7_IFoo-W3wqJERqqfVNV5x25fl6FVP2Z2pyMUp4PzEpHW5OUVtzWGpN84Yzd8egvfz1w6K248JYgdEq1Q5JN-pgaxAJRGLWzqmlyxJj4299WmuTkDenaEu2sB-Vr3NSsX8zzRpmFCJ0OrkF6chqL88k02qyiRm71ht0pKYxs2KvOEtRDwLU6C3VwdEsavTaYmov6ZnSYtAbABrp-vmC9_zCw"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-on-secondary-fixed/80 text-primary-container font-label-caps text-label-caps uppercase">
                          Darshan
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between h-full gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-title-lg text-title-lg text-on-surface">
                                Somnath Temple VIP Darshan &amp; Evening Aarti
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-fixed-variant font-label-caps text-label-caps font-bold uppercase">
                                Corridor Synced
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              Dec 27 • 19:00 Deepmala Aarti &amp; Sound-Light Show • Dedicated Priority Lane
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-title-lg text-title-lg text-on-surface">₹1,800</span>
                            <span className="block font-label-caps text-label-caps text-on-surface-variant">
                              4 Pax Pass + Prasad
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-surface-container-low/50 p-2 rounded-lg">
                          <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">volunteer_activism</span> Special Puja Archana &amp; Mahaprasad Kit
                          </span>
                          <button
                            type="button"
                            className="font-label-md text-label-md text-primary font-semibold hover:underline"
                            onClick={() => alert('Dress code protocol: Traditional Indian attire recommended. Footwear custody provided at VIP gate.')}
                          >
                            Temple Protocol
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ITEM 6: CHAUFFEUR TRANSIT */}
                  <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden relative shrink-0 bg-surface-container flex items-center justify-center bg-surface-container-high">
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant">directions_car</span>
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-on-secondary-fixed/80 text-primary-container font-label-caps text-label-caps uppercase">
                          Private Chauffeur
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between h-full gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-title-lg text-title-lg text-on-surface">
                                Toyota Innova Crysta AC (Inter-City Circuit)
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-caps text-label-caps font-semibold uppercase">
                                Verified Chauffeur
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              Bhuj → Dhordo → Junagadh → Sasan Gir → Somnath → Dwarka drop • All Tolls &amp; Fuel Included
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-title-lg text-title-lg text-on-surface">₹12,300</span>
                            <span className="block font-label-caps text-label-caps text-on-surface-variant">
                              All Inclusive 5 Days
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between font-label-md text-label-md text-on-surface-variant pt-2 bg-surface-container-low/50 p-2 rounded-lg">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">person_check</span> Chauffeur: Ramesh Patel (14 yrs exp, Gujarati/Hindi/English)
                          </span>
                          <span className="text-on-surface font-medium">GPS Tracked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION B: TRAVELLER MANIFEST */}
                <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold">
                        2
                      </span>
                      <h2 className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
                        Traveller Information
                      </h2>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">verified_user</span> KYC Verified
                    </span>
                  </div>

                  {/* Primary Lead Traveller Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-on-secondary-fixed text-primary-container flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-md">
                        P
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-title-lg text-title-lg text-on-surface">Pooja Patel</span>
                          <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase font-bold">
                            Lead Traveller
                          </span>
                          <span className="text-on-surface-variant font-label-md text-label-md">#VP-9021</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                          <span>+91 98251 22401</span>
                          <span>•</span>
                          <span>pooja.patel@voyager.in</span>
                          <span>•</span>
                          <span>Age 34 • Female</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest shadow-sm text-on-surface font-label-md text-label-md">
                      <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
                      <span>Aadhaar: •••• •••• 8842 (Verified)</span>
                    </div>
                  </div>

                  {/* Co-Travellers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-label-lg text-label-lg font-bold">
                        H
                      </div>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface block">Harsh Patel</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Age 36 • Male • Adult</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-label-lg text-label-lg font-bold">
                        A
                      </div>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface block">Anya Patel</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Age 11 • Female • Child</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-label-lg text-label-lg font-bold">
                        K
                      </div>
                      <div>
                        <span className="font-title-md text-title-md text-on-surface block">Kabir Patel</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Age 7 • Male • Child</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-lowest shadow-sm">
                    <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[18px] text-primary">health_and_safety</span>
                      <span>
                        Emergency: <strong>Dr. K. M. Patel</strong> (+91 98250 11982 - Parent)
                      </span>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                      Secure Transmission to Gujarat Tourism API
                    </span>
                  </div>
                </section>

                {/* SECTION C: BILLING & GST */}
                <section className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps font-bold">
                        3
                      </span>
                      <h2 className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
                        Billing &amp; GST Invoicing Details
                      </h2>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                      Input Tax Credit Eligible
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant">Billing Name</label>
                      <input
                        className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container"
                        type="text"
                        defaultValue="Pooja Patel"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface-variant">Business GSTIN (Optional for ITC)</label>
                      <input
                        className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md uppercase focus:outline-none focus:bg-surface-container"
                        type="text"
                        defaultValue="24AAACP1234F1Z5"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="font-label-md text-label-md text-on-surface-variant">Registered Billing Address</label>
                      <input
                        className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container"
                        type="text"
                        defaultValue="702, Iscon Heights, Satellite Road, Ahmedabad, Gujarat - 380015"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input defaultChecked className="w-4 h-4 rounded accent-primary text-on-primary" type="checkbox" />
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Send certified GST invoice, PDF itinerary vouchers &amp; live WhatsApp vehicle link to <strong>+91 98251 22401</strong>
                    </span>
                  </label>
                </section>

                {/* SECTION D: CANCELLATION COVENANT */}
                <section className="p-6 rounded-2xl bg-surface-container-low flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">policy</span>
                    <h3 className="font-title-lg text-title-lg text-on-surface">Cancellation Covenant &amp; Sovereign Guarantee</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-on-surface-variant font-body-sm text-body-sm">
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest">
                      <span className="font-label-md text-label-md text-on-surface block mb-1 font-semibold">100% Refund on Stay &amp; Transit</span>
                      <p>Free cancellation until Dec 20, 2026, 23:59 IST (4 days prior to departure). Full refund credited back to source account within 24 hours.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest">
                      <span className="font-label-md text-label-md text-on-surface block mb-1 font-semibold">Gir Forest Permit Regulation</span>
                      <p>Wildlife sanctuary permits are strictly non-transferable and subject to Gujarat Forest Department conservation bylaws.</p>
                    </div>
                  </div>
                  <a className="font-label-md text-label-md text-primary font-semibold hover:underline self-start" href="#">
                    Read Full Subcontinental Booking Covenant &amp; Refund Schedule →
                  </a>
                </section>
              </div>

              {/* RIGHT COLUMN: STICKY PRICING & PAYMENT */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 sticky top-24">
                {/* PROMO / LOYALTY CARD */}
                <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-on-surface">Sovereign Privileges</span>
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold">Tier: Sovereign Gold</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-title-md text-title-md uppercase tracking-wide focus:outline-none"
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      {couponApplied && (
                        <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] text-primary">
                          check_circle
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-xl bg-on-secondary-fixed text-primary-container font-label-md text-label-md hover:bg-on-secondary-fixed-variant transition-colors"
                      onClick={handleApplyCoupon}
                    >
                      {couponApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {couponApplied && (
                    <div className="p-2.5 rounded-lg bg-primary-container/20 text-on-primary-fixed-variant flex items-center gap-2 font-label-md text-label-md font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-primary">stars</span>
                      <span>FARVA10 applied: ₹6,000 Sovereign Discount Saved</span>
                    </div>
                  )}
                </div>

                {/* FARE BREAKDOWN CARD */}
                <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-md flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 bg-surface-container-low/40 -mx-6 -mt-6 p-6 rounded-t-2xl">
                    <span className="font-title-lg text-title-lg text-on-surface">Settlement Summary</span>
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                      4 Travellers / 6 Days
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
                    <div className="flex justify-between items-center">
                      <span>Base Travel &amp; Stay Services</span>
                      <span className="font-medium text-on-surface">₹49,800</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Wildlife Permits &amp; Sanctuary Fees</span>
                      <span className="font-medium text-on-surface">₹7,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>VIP Darshan &amp; Sunset Passes</span>
                      <span className="font-medium text-on-surface">₹1,800</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
                      <span>Unified Subtotal</span>
                      <span className="font-medium text-on-surface">₹59,100</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between items-center text-primary font-semibold">
                        <span className="flex items-center gap-1">Sovereign Privilege (FARVA10)</span>
                        <span>-₹6,000</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">Taxes &amp; Unified GST (5%)</span>
                      <span className="font-medium text-on-surface">₹900</span>
                    </div>
                  </div>

                  {/* TOTAL SETTLEMENT ROW */}
                  <div className="pt-4 flex items-baseline justify-between bg-surface-container-low -mx-6 p-6 rounded-xl">
                    <div>
                      <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">₹54,000</span>
                      <span className="block font-label-caps text-label-caps uppercase text-on-surface-variant font-medium">
                        Net Amount Payable
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase font-bold">
                      Zero Hidden Fees
                    </span>
                  </div>

                  {/* PAYMENT METHOD TABS */}
                  <div className="flex flex-col gap-3 pt-2">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">Select Payment Gateway</span>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        className={`py-2.5 rounded-xl font-label-md text-label-md font-semibold flex flex-col items-center gap-1 transition-colors ${
                          activeTab === 'upi'
                            ? 'bg-on-secondary-fixed text-primary-container'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                        }`}
                        onClick={() => setActiveTab('upi')}
                      >
                        <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                        <span>UPI</span>
                      </button>
                      <button
                        type="button"
                        className={`py-2.5 rounded-xl font-label-md text-label-md font-semibold flex flex-col items-center gap-1 transition-colors ${
                          activeTab === 'card'
                            ? 'bg-on-secondary-fixed text-primary-container'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                        }`}
                        onClick={() => setActiveTab('card')}
                      >
                        <span className="material-symbols-outlined text-[20px]">credit_card</span>
                        <span>Cards</span>
                      </button>
                      <button
                        type="button"
                        className={`py-2.5 rounded-xl font-label-md text-label-md font-semibold flex flex-col items-center gap-1 transition-colors ${
                          activeTab === 'netbanking'
                            ? 'bg-on-secondary-fixed text-primary-container'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                        }`}
                        onClick={() => setActiveTab('netbanking')}
                      >
                        <span className="material-symbols-outlined text-[20px]">account_balance</span>
                        <span>NetBanking</span>
                      </button>
                      <button
                        type="button"
                        className={`py-2.5 rounded-xl font-label-md text-label-md font-semibold flex flex-col items-center gap-1 transition-colors ${
                          activeTab === 'wallet'
                            ? 'bg-on-secondary-fixed text-primary-container'
                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                        }`}
                        onClick={() => setActiveTab('wallet')}
                      >
                        <span className="material-symbols-outlined text-[20px]">wallet</span>
                        <span>EMI/Wallet</span>
                      </button>
                    </div>

                    {/* TAB CONTENT: UPI */}
                    {activeTab === 'upi' && (
                      <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-surface-container-low mt-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Instant UPI 1-Click</span>
                          <span className="font-label-caps text-label-caps uppercase text-primary font-bold">Auto-Approved</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none"
                            type="text"
                            value={upiVpa}
                            onChange={(e) => setUpiVpa(e.target.value)}
                          />
                          <button
                            type="button"
                            className="px-3 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold"
                            onClick={() => alert(`UPI ID ${upiVpa} verified!`)}
                          >
                            Verify
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps uppercase pt-1">
                          <span>Google Pay</span>
                          <span>•</span>
                          <span>PhonePe</span>
                          <span>•</span>
                          <span>Paytm</span>
                          <span>•</span>
                          <span>BHIM UPI</span>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: CARDS */}
                    {activeTab === 'card' && (
                      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-surface-container-low mt-1">
                        <input
                          className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none"
                          placeholder="Card Number •••• •••• •••• 4291"
                          type="text"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none"
                            placeholder="MM/YY"
                            type="text"
                          />
                          <input
                            className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm focus:outline-none"
                            maxLength={3}
                            placeholder="CVV"
                            type="password"
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: NET BANKING */}
                    {activeTab === 'netbanking' && (
                      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low mt-1">
                        <span className="font-label-md text-label-md text-on-surface">Popular Banks</span>
                        <div className="grid grid-cols-2 gap-2 text-left">
                          <button type="button" className="p-2 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface hover:bg-primary-container">
                            HDFC Bank
                          </button>
                          <button type="button" className="p-2 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface hover:bg-primary-container">
                            ICICI Bank
                          </button>
                          <button type="button" className="p-2 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface hover:bg-primary-container">
                            State Bank of India
                          </button>
                          <button type="button" className="p-2 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface hover:bg-primary-container">
                            Axis Bank
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: WALLET */}
                    {activeTab === 'wallet' && (
                      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low mt-1">
                        <span className="font-body-sm text-body-sm text-on-surface">
                          Sovereign Credit Line available up to ₹1,50,000 at 0% interest for 3 months.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* MAIN CTA BUTTON */}
                  <button
                    type="button"
                    className="w-full py-4 rounded-xl bg-primary-container text-on-primary-container font-title-lg text-title-lg font-bold shadow-lg hover:shadow-xl hover:bg-primary-fixed transition-all flex items-center justify-center gap-2 cursor-pointer"
                    onClick={triggerProcessingFlow}
                  >
                    <span>Pay ₹54,000 &amp; Confirm Trip</span>
                    <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-center text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                    <span>256-Bit Bank Grade SSL • Instant PNR &amp; Safari Pass Generation</span>
                  </div>
                </div>

                {/* SOVEREIGN CONCIERGE TILE */}
                <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-on-secondary-fixed text-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">support_agent</span>
                    </div>
                    <div>
                      <span className="font-title-md text-title-md text-on-surface block">Need assistance?</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">24/7 Ground Concierge active</span>
                    </div>
                  </div>
                  <a
                    className="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors"
                    href="tel:18002031111"
                  >
                    Call Desk
                  </a>
                </div>
              </div>
            </div>

            {/* SIMULATOR TOOLBAR */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-on-secondary-fixed/95 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
              <span className="font-label-caps text-label-caps uppercase text-primary-container mr-1 hidden sm:inline">
                Checkout Simulator:
              </span>
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest font-label-md text-label-md transition-colors"
                onClick={() => {
                  setActiveModal('none');
                  setActiveTab('upi');
                }}
              >
                Normal
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest font-label-md text-label-md transition-colors"
                onClick={triggerProcessingFlow}
              >
                Simulate Securing
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold transition-transform hover:scale-105"
                onClick={() => setActiveModal('success')}
              >
                Simulate Success
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-bold transition-transform hover:scale-105"
                onClick={() => setActiveModal('failed')}
              >
                Simulate Fail
              </button>
            </div>

            {/* MODAL 1: PROCESSING */}
            {activeModal === 'processing' && (
              <div className="fixed inset-0 z-50 bg-on-secondary-fixed/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-container/20 mx-auto flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[32px] text-primary animate-spin">sync</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Securing Your Gujarat Journey...</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Please keep this window open while we lock state forest and transit nodes.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 font-label-md text-label-md">
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-low ${processingStep >= 1 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      <span className={`material-symbols-outlined text-[18px] ${processingStep >= 1 ? 'text-primary' : ''}`}>
                        {processingStep >= 1 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Verifying GSRTC &amp; Swiss Tent suite allocations</span>
                    </div>
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-low ${processingStep >= 2 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      <span className={`material-symbols-outlined text-[18px] ${processingStep >= 2 ? 'text-primary' : ''}`}>
                        {processingStep >= 2 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Releasing Sasan Gir Forest Department Permit #GIR-4402</span>
                    </div>
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-low ${processingStep >= 3 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      <span className={`material-symbols-outlined text-[18px] ${processingStep >= 3 ? 'text-primary' : ''}`}>
                        {processingStep >= 3 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Transacting ₹54,000 via 256-Bit Banking Rail</span>
                    </div>
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-low ${processingStep >= 4 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      <span className={`material-symbols-outlined text-[18px] ${processingStep >= 4 ? 'text-primary' : ''}`}>
                        {processingStep >= 4 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span>Synthesizing Certified GST Tax Invoices &amp; WhatsApp Passes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 2: SUCCESS */}
            {activeModal === 'success' && (
              <div className="fixed inset-0 z-50 bg-on-secondary-fixed/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 my-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px]">verified</span>
                      </div>
                      <div>
                        <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                          Booking Confirmed &amp; Protected
                        </span>
                        <h3 className="font-headline-md text-headline-md text-on-surface">Your Gujarat Journey is Confirmed! ✨</h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container"
                      onClick={() => setActiveModal('none')}
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                        Universal Sovereign Booking PNR
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-wider">
                          #CF-8820-GJ
                        </span>
                        <button
                          type="button"
                          className="text-primary hover:underline font-label-md text-label-md font-semibold"
                          onClick={() => {
                            navigator.clipboard.writeText('CF-8820-GJ');
                            alert('PNR copied to clipboard!');
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Lead: Pooja Patel • Dec 24–29, 2026 (4 Pax)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-lowest shadow-sm">
                      <svg className="w-16 h-16 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                        <path d="M10 10h30v30h-30zM15 15v20h20v-20zM60 10h30v30h-30zM65 15v20h20v-20zM10 60h30v30h-30zM15 65v20h20v-20zM20 20h10v10h-10zM70 20h10v10h-10zM20 70h10v10h-10zM45 10h10v15h-10zM45 35h10v10h-10zM10 45h15v10h-15zM35 45h15v10h-15zM60 45h10v15h-10zM80 45h10v15h-10zM45 60h10v15h-10zM60 65h15v10h-15zM45 80h10v10h-10zM60 80h10v10h-10zM75 75h15v15h-15z"></path>
                      </svg>
                      <div className="text-left">
                        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant block font-semibold">
                          Live State Pass
                        </span>
                        <span className="font-label-md text-label-md text-primary font-bold">
                          Synced with Police &amp; Forest Gate
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 font-body-sm text-body-sm">
                    <span className="font-title-md text-title-md text-on-surface">Active Vouchers Generated:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface-variant">
                      <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">directions_bus</span>
                        <span>GSRTC Sleeper Seats 14A-15B</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">cottage</span>
                        <span>Dhordo Royal Tent #42 &amp; #43</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">pets</span>
                        <span>Gir Gypsy Permit #GIR-4402</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">temple_hindu</span>
                        <span>Somnath Priority Pass (4 Pax)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      className="w-full sm:w-1/2 py-3 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
                      onClick={() => alert('Downloading Certified GST Tax Invoice (PDF)...')}
                    >
                      <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      <span>Download GST Invoice</span>
                    </button>
                    <Link
                      href="/trips/CF-GJ-8820"
                      className="w-full sm:w-1/2 py-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 text-center"
                    >
                      <span>Go to My Gujarat Trip</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 3: FAILED */}
            {activeModal === 'failed' && (
              <div className="fixed inset-0 z-50 bg-on-secondary-fixed/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container mx-auto flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[32px]">error</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Payment Couldn't Be Completed</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Your banking rail declined UPI VPA <code className="font-mono text-on-surface">poojapatel@okaxis</code>. Your tent suites and forest slots remain reserved for 18 minutes.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        setActiveModal('none');
                        setActiveTab('card');
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">credit_card</span>
                      <span>Retry with Credit or Debit Card</span>
                    </button>
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors"
                      onClick={() => setActiveModal('none')}
                    >
                      Return to Checkout Options
                    </button>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
                    <span>Need urgent help?</span>
                    <a className="text-primary font-semibold hover:underline flex items-center gap-1" href="tel:18002031111">
                      <span className="material-symbols-outlined text-[16px]">call</span> 1800 203 1111
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(20,26,50,0.04)]">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-lg">
            <div className="flex flex-col gap-space-xs">
              <img
                alt="BharatYatra Logo"
                className="h-8 w-auto object-contain mb-1"
                src="/logo.png"
              />
              <span className="font-title-md text-title-md text-on-surface">BharatYatra Checkout</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Unified multi-service sovereign payment gateway. Curated expeditions, royal heritage lodges, and aviation charter booking.
              </p>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface">Compliance &amp; GST</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                GSTIN: 24AAACC1206K1ZV • Direct GST input tax credit pass-through active for domestic enterprise bookings.
              </p>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface">Policies</span>
              <div className="flex flex-col gap-1">
                <Link href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  Cancellation &amp; Refund Matrix
                </Link>
                <Link href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface">
                  Travel Protection &amp; Sovereign Guarantee
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface">Emergency Support</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">24/7 Sovereign Assistance: 1800 203 1111</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Email: sovereign@chalofarva.in</p>
            </div>
          </div>
          <div className="pt-space-md border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-space-sm">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © 2025 BharatYatra Luxury Travel Intelligence Pvt Ltd. All rights reserved.
            </span>
            <div className="flex items-center gap-space-md">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Bank-Grade TLS 1.3</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">PCI-DSS Level 1</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">IATA Accredited</span>
            </div>
          </div>
        </div>
      </footer>

      <BookingUnavailableModal
        isOpen={showUnavailableModal}
        onClose={() => setShowUnavailableModal(false)}
        serviceName="Hotel & Stays"
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}


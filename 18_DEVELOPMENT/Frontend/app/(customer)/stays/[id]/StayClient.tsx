'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMakeMyTripHotelLink } from '@/lib/makemytrip';
import { MakeMyTripBookingBanner } from '@/components/booking/MakeMyTripModal';

export default function StayDetailPage() {
  const router = useRouter();
  const [currentSuitePrice, setCurrentSuitePrice] = useState(12500);
  const [selectedSuiteId, setSelectedSuiteId] = useState('suite1');
  const [selectedSuiteName, setSelectedSuiteName] = useState('Royal Nawabi Darbar Suite');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReserved, setIsReserved] = useState(false);

  const nights = 2;
  const baseTotal = nights * currentSuitePrice;
  const levy = Math.round(baseTotal * 0.03);
  const gst = Math.round(baseTotal * 0.05);
  const grandTotal = baseTotal + levy + gst;

  const handleSelectSuite = (name: string, price: number, id: string) => {
    setCurrentSuitePrice(price);
    setSelectedSuiteId(id);
    setSelectedSuiteName(name);
  };

  const handleReserve = () => {
    setToastMessage('Suite Locked & Synchronised with Gir & Junagadh Journey Route.');
    setIsReserved(true);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-on-secondary-fixed/95 backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(20,26,50,0.12)]">
        <div className="h-20 w-full max-w-[1440px] mx-auto px-gutter flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <Link className="flex items-center gap-space-sm" href="/">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-[0_0_20px_-2px_rgba(254,214,91,0.35)]">
                <span className="material-symbols-outlined text-on-primary-fixed text-title-lg">explore</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-surface tracking-tight leading-none">BharatYatra</span>
                <span className="font-label-caps text-primary-container tracking-wider uppercase mt-0.5">
                  ભારત યાત્રા • SOVEREIGN GUJARAT TRAVEL ENGINE
                </span>
              </div>
            </Link>
          </div>
          <nav className="hidden xl:flex items-center gap-space-xs">
            <Link className="px-3 py-2 rounded-lg font-label-md text-surface-dim hover:text-surface hover:bg-inverse-surface transition-all" href="/">Home</Link>
            <Link className="px-3 py-2 rounded-lg font-label-md text-surface-dim hover:text-surface hover:bg-inverse-surface transition-all" href="/explore">Explore</Link>
            <Link className="px-3 py-2 rounded-lg font-label-md text-surface-dim hover:text-surface hover:bg-inverse-surface transition-all" href="/circuits">Circuits</Link>
            <Link aria-current="page" className="px-3 py-2 rounded-lg font-label-md transition-all bg-primary-container text-on-primary-fixed shadow-[0_0_20px_-2px_rgba(254,214,91,0.35)] font-bold" href="/stays">Stays</Link>
            <Link className="px-3 py-2 rounded-lg font-label-md text-surface-dim hover:text-surface hover:bg-inverse-surface transition-all" href="/trains">Trains</Link>
            <Link className="px-3 py-2 rounded-lg font-label-md text-surface-dim hover:text-surface hover:bg-inverse-surface transition-all" href="/buses">Buses</Link>
            <Link className="px-3 py-2 rounded-lg font-label-md text-surface-dim hover:text-surface hover:bg-inverse-surface transition-all" href="/experiences">Experiences</Link>
            <Link className="px-3 py-2 rounded-lg font-label-md text-surface-dim hover:text-surface hover:bg-inverse-surface transition-all" href="/my-trips">My Trips</Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-inverse-surface shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
              </span>
              <span className="font-label-caps text-primary-container uppercase tracking-wider">100% GROUND RULES SYNCED</span>
            </div>
            <div className="flex items-center gap-space-sm pl-space-xs">
              <Link href="/profile" className="flex flex-col text-right hidden sm:flex">
                <span className="font-label-md text-surface">Maharaja Lounge</span>
                <span className="font-label-caps text-surface-dim uppercase tracking-wider">Royal Explorer</span>
              </Link>
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shadow-[0_0_12px_rgba(254,214,91,0.3)]"
                src="https://lh3.googleusercontent.com/aida/AEtjO1Ui59jsO1cRmYcx_EhvwkLGkFogmDjmf7WlO_OauBFwKZ0uk_e307OoSlXT4rFNOTTz18I6VJ9GGtE93D4OpgxiI9xOdoffUGkzgoQ0KG88ACv-KY9EVYggJxEwdGNO95rCHoqDEYuaDqN7tRftqN7dgBVeMibJArETY3NhtGtIYgwZNrtEOGWVQM_PjXq995rzqJH5UGpxAdJ8JA0v0kOcVN3eHS4E9bOBnUkpNA-jIX-7ScyvFM41G5v_ZvuZOXHwVOlo5WZh9Nc"
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="w-full pt-20 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          {/* Top Dossier Breadcrumb Strip */}
          <section className="w-full bg-surface-container-low/60 backdrop-blur-md">
            <div className="max-w-[1440px] mx-auto px-gutter py-space-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-secondary font-label-md">
                <Link className="hover:text-on-surface transition-colors flex items-center gap-1" href="/stays">
                  <span className="material-symbols-outlined text-base">villa</span>
                  <span>Stays</span>
                </Link>
                <span className="text-outline-variant">/</span>
                <Link className="hover:text-on-surface transition-colors" href="/stays">Gujarat Heritage Stays</Link>
                <span className="text-outline-variant">/</span>
                <span className="text-on-surface font-semibold truncate max-w-[260px] md:max-w-none">
                  Nawab Heritage Haveli &amp; Courtyard
                </span>
              </nav>
              <div className="flex items-center gap-space-sm self-end md:self-auto">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-all shadow-sm font-label-md"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Haveli link copied to clipboard');
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-base text-primary">share</span>
                  <span>Share Haveli</span>
                </button>
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-label-md transition-all shadow-sm ${
                    isSaved ? 'bg-primary-container text-on-primary-fixed' : 'bg-on-secondary-fixed text-surface hover:bg-inverse-surface'
                  }`}
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <span
                    className="material-symbols-outlined text-base text-primary-container"
                    style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    bookmark
                  </span>
                  <span>{isSaved ? 'Saved in Journey Line' : 'Save to Journey Line'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Main Showcase & Booking Canvas */}
          <section className="w-full max-w-[1440px] mx-auto px-gutter pt-space-lg">
            {/* Header Title & Heritage Dossier Metadata */}
            <div className="flex flex-col gap-space-xs mb-space-md">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/25 text-on-surface font-label-caps tracking-wider uppercase">
                  <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  1882 Colonial Heritage Estate
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-on-secondary-fixed text-primary-container font-label-caps tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                  FARVA ROYAL VERIFIED
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-caps">
                  <span className="material-symbols-outlined text-sm">nest_clock_farsight_analog</span>
                  Gir Gateway Zone
                </span>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-sm pt-1">
                <div>
                  <h1 className="font-headline-lg text-on-surface tracking-tight">
                    Nawab Heritage Haveli &amp; Royal Courtyard
                  </h1>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-secondary font-body-sm mt-1">
                    <span className="flex items-center gap-1 text-on-surface font-medium">
                      <span className="material-symbols-outlined text-base text-primary">location_on</span>
                      Girnar Foothills, Junagadh, Gujarat
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span className="font-mono text-label-md text-tertiary">21.5222° N, 70.4579° E</span>
                    <span className="text-outline-variant">•</span>
                    <span className="flex items-center gap-1 text-on-surface font-medium">
                      <span className="material-symbols-outlined text-amber-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <strong className="font-title-md text-on-surface">4.92</strong>
                      <span className="text-secondary">(248 Verified Voyagers)</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-surface-container-high text-right">
                    <div className="font-label-caps text-secondary uppercase">Baseline Suite Rate</div>
                    <div className="font-headline-sm text-on-surface leading-none pt-0.5">
                      ₹12,500 <span className="font-body-sm text-secondary font-normal">/ night</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Immersive Gallery Mosaic Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xs rounded-2xl overflow-hidden bg-surface-container-highest p-1.5 shadow-sm">
              {/* Master Featured View */}
              <div className="lg:col-span-7 relative group rounded-xl overflow-hidden min-h-[360px] lg:min-h-[470px]">
                <img
                  alt="Sunlit Sandstone Haveli Courtyard Junagadh"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1VQLt78l4m5Sg8cUy0vfL92yFgFZnsCNVUE85xRYJTrAxGRNRmWMisjhr7BA2Ais_rOuE8fgXG1wtUY_0rvVHhuPVjnwojOFd-a4-5KVKk1J1v7pYR68qqzZxFcZQovihg28BCyVK4nYnuJYRowAf-PZo39QvlfYTb7oxZPRTLs99h5OcrYZl2J85XIW1BpPqOXepR_-4zIgj1Q8yLhrn36yx0U64s6rSJu09BwXwCYhReFSeYXw6egMdFv"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/90 via-on-secondary-fixed/20 to-transparent"></div>
                <div className="absolute top-space-md left-space-md">
                  <span className="px-3 py-1.5 rounded-lg bg-on-secondary-fixed/80 backdrop-blur-md text-primary-container font-label-caps tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                    <span className="material-symbols-outlined text-sm">water_drop</span>
                    Central Soolam Kund Pool
                  </span>
                </div>
                <div className="absolute bottom-space-md left-space-md right-space-md flex items-end justify-between text-surface">
                  <div>
                    <p className="font-title-lg text-surface drop-shadow-sm font-headline-sm">Sunlit Sandstone Courtyard</p>
                    <p className="font-body-sm text-surface-dim/90">Original 19th-century Nawabi carved arches mirrored over spring water</p>
                  </div>
                  <button
                    className="px-3.5 py-2 rounded-xl bg-surface-bright/90 backdrop-blur-md text-on-surface font-label-md hover:bg-surface-bright flex items-center gap-1.5 shadow-lg transition-all"
                    onClick={() => setShowGalleryModal(true)}
                  >
                    <span className="material-symbols-outlined text-base">photo_library</span>
                    <span>All 38 Photos</span>
                  </button>
                </div>
              </div>

              {/* Right 2x2 Gallery Quad */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-space-xs">
                <div className="relative group rounded-xl overflow-hidden min-h-[175px] lg:min-h-[230px]">
                  <img
                    alt="Royal Rajwadi Luxury Desert AC Tent"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1VWiNPA-w2t1NQyfCn1h4szzX-NTPhydNqzwjbVXvd0r2cyv9cSBUBmNwfCaP_Q-HsX9T_34zUHzblYAF14ziVyzFO9zI4-laLaYl9lYG80Ibe1P_eci89u7CAYJQVjejr00a7U-pb1owHh3K-Vh5fAva8sW6TdDucgZumBPR6UtdE9JqEZmJAa_PoKS7D0Po3yWBkZwsCvICoe1LJmyyJ5CWh2MXSEJyYMjXmWZRbgL1C_cKkmWqy2csHI"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-2.5 left-2.5 font-label-md text-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary-container">camping</span>
                    Rajwadi Swiss Tent
                  </span>
                </div>

                <div className="relative group rounded-xl overflow-hidden min-h-[175px] lg:min-h-[230px]">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="High luxury Kathiyawadi dining hall"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJLyw63wfoANbw6wUvVL_-wwjbLhgQ5vfARGiQj_Ojq9EF2TqTcJMITcMca5yPsas2fPdHg4KoSCR9x_peS_MfyCz-il99BNJpeqarI_TpuofXsiFXrnbZTDNlSv0TVfsyx6pfuIWKU0ID2msh6mGJQrvr-3p9vU8NOn-XgS0Tl2kiML7P3JQciCW4GanSO_2shCFxsG-043If3zayNdK0ASwTJosDEiK9GjiWPRp7QaSTTh9Nr3ceZQ"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-2.5 left-2.5 font-label-md text-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary-container">restaurant</span>
                    Darbari Dining Baithak
                  </span>
                </div>

                <div className="relative group rounded-xl overflow-hidden min-h-[175px] lg:min-h-[230px]">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Intricately carved sandstone jharokha balcony"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUvEEQ3m6NAH9sQwuiDsaqvOL_VdDZQ2DFjXe9V-Afh7p1I2iMQAM7N73tV6dddyRVrUkYuGVCLg2aEvqh2Watju6Eg5-Z-UtB7aOVmkVg6Fnj7Qp-3Vl-VFMnzGY3goBT19-zhk4CQ0qIu3EaPo1a0c0tIR9211QhCAZnlxcOdF8oKSwJkrAyWFy8GHS1kYLSM8JAQHbORF-F6D673VU4X9I3cymca0klWvNivaoGzVrM6Pg3g7wH6w"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-2.5 left-2.5 font-label-md text-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary-container">balcony</span>
                    Girnar View Jharokha
                  </span>
                </div>

                <div className="relative group rounded-xl overflow-hidden min-h-[175px] lg:min-h-[230px]">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Grand regal haveli master bedroom suite"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9sOlqVIx5TUmIDwi-C32pn_GhBLO4P1BxkAqCRN8FYIzGxaLWcsfFcK_dmFTmfmOpPpZSDsyI9pKAH4UmS8jz_AM1B2XN5rRmk9OZaCAIusbFdnkilUi6uBJZVBFMlFycyLP7EP-941fQ-TVyQAg7oBYAjjLC5BKpdd3mSFjK--Dd_rpEElKpQsQuozhqBvHOqHs2E5J7zggY64argtkdF69sS0cvF0sfEfunvDNaptuSj9uSWEj3EQ"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-2.5 left-2.5 font-label-md text-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary-container">bed</span>
                    Royal Nawabi Suite
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Accreditations Chips Bar */}
            <div className="flex items-center gap-space-xs overflow-x-auto py-space-sm no-scrollbar">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-sm shrink-0">
                <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                <span className="font-label-md text-on-surface">Aadhaar Verified Express Check-in</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-sm shrink-0">
                <span className="material-symbols-outlined text-primary text-base">eco</span>
                <span className="font-label-md text-on-surface">Pure Kathiyawadi Chulha Cuisine</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-sm shrink-0">
                <span className="material-symbols-outlined text-primary text-base">forest</span>
                <span className="font-label-md text-on-surface">Direct Gir Forest Dept. Liaison</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-sm shrink-0">
                <span className="material-symbols-outlined text-primary text-base">ev_station</span>
                <span className="font-label-md text-on-surface">60kW Fast DC EV Charger</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest shadow-sm shrink-0">
                <span className="material-symbols-outlined text-primary text-base">wifi</span>
                <span className="font-label-md text-on-surface">Starlink 220 Mbps Wi-Fi</span>
              </div>
            </div>
          </section>

          {/* Split Content: Details & Sidebar */}
          <section className="w-full max-w-[1440px] mx-auto px-gutter py-space-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Column (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-space-lg">
                {/* AI Intelligence Card */}
                <div className="p-space-lg rounded-2xl bg-gradient-to-br from-on-secondary-fixed via-inverse-surface to-on-secondary-fixed text-surface shadow-xl relative overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-container/15 blur-3xl pointer-events-none"></div>
                  <div className="flex items-start justify-between gap-space-md relative z-10 mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-fixed flex items-center justify-center font-bold shadow-md">
                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      </div>
                      <div>
                        <span className="font-label-caps text-primary-container tracking-wider uppercase">
                          Farva Itinerary Telemetry
                        </span>
                        <h3 className="font-title-lg text-surface">Why BharatYatra matches this stay for your circuit</h3>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-bright/10 text-primary-container font-label-caps uppercase tracking-wider">
                      98.4% DNA Match
                    </span>
                  </div>
                  <p className="font-body-md text-surface-dim relative z-10 mb-space-md">
                    Engineered precisely for your <strong className="text-surface font-medium">Day 4–5 Sasan Gir &amp; Junagadh expedition</strong>. Aligns seamlessly with Asiatic Lion morning safari pass windows at Gir Gate 04, shielding your party from peak afternoon highway fatigue.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm relative z-10">
                    <div className="p-space-sm rounded-xl bg-surface-bright/5 backdrop-blur-sm flex flex-col gap-1">
                      <span className="material-symbols-outlined text-primary-container text-lg">route</span>
                      <span className="font-title-md text-surface text-sm">Zero Safari Fatigue</span>
                      <span className="font-body-sm text-surface-dim text-xs">
                        Only 28 km to Gate 04. Arrive 35 min before the 06:00 AM tracker departure.
                      </span>
                    </div>
                    <div className="p-space-sm rounded-xl bg-surface-bright/5 backdrop-blur-sm flex flex-col gap-1">
                      <span className="material-symbols-outlined text-primary-container text-lg">local_fire_department</span>
                      <span className="font-title-md text-surface text-sm">Kathiyawadi Starlight Rasoi</span>
                      <span className="font-body-sm text-surface-dim text-xs">
                        Charcoal-roasted Ringna No Olo &amp; Bajra Rotla prepared live at the central kund.
                      </span>
                    </div>
                    <div className="p-space-sm rounded-xl bg-surface-bright/5 backdrop-blur-sm flex flex-col gap-1">
                      <span className="material-symbols-outlined text-primary-container text-lg">family_restroom</span>
                      <span className="font-title-md text-surface text-sm">Family Courtyard Flow</span>
                      <span className="font-body-sm text-surface-dim text-xs">
                        Acoustically isolated private wings keep child bedtimes undisturbed by haveli sitars.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Narrative & Heritage Dossier */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-on-surface">The Nawabi Heritage Narrative</h2>
                    <span className="font-label-caps text-secondary uppercase tracking-wider">Est. 1882 CE</span>
                  </div>
                  <div className="relative">
                    <p className="font-body-md text-secondary leading-relaxed">
                      Carved out of pale Dhrangadhra yellow sandstone, the estate served as the royal autumn retreat for the Babi Dynasty nawabs of Junagadh. Enclosed by nine-foot fortified stone arches, the mansion stays naturally insulated against desert winds while catching cool downdrafts flowing down the Girnar sacred hills. Hand-painted ceiling murals showcase floral motifs from pre-colonial Kathiawar, complemented by restored brass swing chains and courtyard plunge reservoirs fed by Girnar natural spring veins.
                    </p>
                    {bioExpanded && (
                      <p className="font-body-md text-secondary leading-relaxed mt-2">
                        Guests enjoy privileged access to the private family archives, morning temple chanting reverberating gently from the foothill shrines, and a dedicated culinary concierge who tailors regional spice gradients from mild Darbari preparations to authentic fiery Saurashtra red garlic chutneys.
                      </p>
                    )}
                  </div>
                  <button
                    className="self-start font-label-md text-primary hover:text-on-primary-fixed-variant flex items-center gap-1 transition-colors"
                    onClick={() => setBioExpanded(!bioExpanded)}
                  >
                    <span>{bioExpanded ? 'Collapse estate dossier' : 'Read full estate dossier'}</span>
                    <span className="material-symbols-outlined text-sm">
                      {bioExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {/* Amenities */}
                  <div className="pt-space-md">
                    <h3 className="font-title-lg text-on-surface mb-space-sm">Sanctuary Provisions &amp; Amenities</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
                      <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">pool</span>
                        </div>
                        <div>
                          <div className="font-title-md text-sm text-on-surface">Spring Plunge Pool</div>
                          <div className="font-body-sm text-xs text-secondary">Filtered Girnar waters</div>
                        </div>
                      </div>
                      <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">soup_kitchen</span>
                        </div>
                        <div>
                          <div className="font-title-md text-sm text-on-surface">Royal Rasoi</div>
                          <div className="font-body-sm text-xs text-secondary">Heritage Kathiyawadi</div>
                        </div>
                      </div>
                      <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">airport_shuttle</span>
                        </div>
                        <div>
                          <div className="font-title-md text-sm text-on-surface">Safari Escort 4x4</div>
                          <div className="font-body-sm text-xs text-secondary">Dedicated permits</div>
                        </div>
                      </div>
                      <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">concierge</span>
                        </div>
                        <div>
                          <div className="font-title-md text-sm text-on-surface">24/7 Haveli Butler</div>
                          <div className="font-body-sm text-xs text-secondary">Attentive tea service</div>
                        </div>
                      </div>
                      <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">ev_charger</span>
                        </div>
                        <div>
                          <div className="font-title-md text-sm text-on-surface">Chauffeur Rest Wing</div>
                          <div className="font-body-sm text-xs text-secondary">With fast EV station</div>
                        </div>
                      </div>
                      <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">wifi_tethering</span>
                        </div>
                        <div>
                          <div className="font-title-md text-sm text-on-surface">Starlink Satellite</div>
                          <div className="font-body-sm text-xs text-secondary">Zero dropoff guarantee</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Suites */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-label-caps text-primary uppercase tracking-wider">Curated Quarters</span>
                      <h2 className="font-headline-sm text-on-surface">Select Your Sovereign Suite</h2>
                    </div>
                    <span className="font-label-md text-secondary">All rates include Darbari Breakfast &amp; High Tea</span>
                  </div>

                  {/* Suite 1 */}
                  <div
                    className={`p-space-md rounded-2xl bg-surface-container-lowest flex flex-col md:flex-row gap-space-md transition-all ${
                      selectedSuiteId === 'suite1' ? 'shadow-md ring-2 ring-primary' : 'shadow-sm'
                    }`}
                  >
                    <div className="w-full md:w-56 h-48 md:h-auto rounded-xl overflow-hidden relative shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        alt="Royal Nawabi Darbar Suite"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRPXi-dbbiStp5S52vevcFAKiGBZ2U3DEVFJgvbAY6vMu0fnBkFMzolvVDxK556I1alv6EXEWhB5uvgMvIxTh4ZA2jdZsasEr_wj-rnou8IyJZjv5NuZLMF1bbPOv_IZlWX2n1uQOnKH6jhv03vW_sMCvSTLl_CHEmUqkHHFRkjI2i2qBMJf5H-nkHoUmAI65wEP8qERMCqmXVbAaA2Su3NTnzjGzpUKqtPseoMrw4u03lTwkdezaPbQ"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary-container text-on-primary-fixed font-label-caps font-bold">
                        TOP CHOICE
                      </span>
                    </div>
                    <div className="flex flex-col justify-between flex-1 gap-space-xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-title-lg text-on-surface">Royal Nawabi Darbar Suite</h3>
                          <div className="text-right">
                            <span className="font-headline-sm text-on-surface">₹12,500</span>
                            <span className="font-body-sm text-secondary"> / night</span>
                          </div>
                        </div>
                        <p className="font-body-sm text-secondary mt-1">
                          680 sq.ft • King carved teak four-poster bed • Private jharokha balcony with panoramic Girnar sanctuary views • Handcrafted brass soaking tub.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">Max 3 Guests</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">Includes High Tea</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">Girnar Panorama</span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="font-label-md text-error flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">local_fire_department</span>
                          Only 2 suites open for selected dates
                        </span>
                        <button
                          className={`px-4 py-2 rounded-xl font-label-md transition-all flex items-center gap-1.5 shadow-sm ${
                            selectedSuiteId === 'suite1'
                              ? 'bg-on-secondary-fixed text-primary-container'
                              : 'bg-surface-container-high text-on-surface hover:bg-on-secondary-fixed hover:text-surface'
                          }`}
                          onClick={() => handleSelectSuite('Royal Nawabi Darbar Suite', 12500, 'suite1')}
                        >
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          <span>{selectedSuiteId === 'suite1' ? 'Suite Selected' : 'Select Suite'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Suite 2 */}
                  <div
                    className={`p-space-md rounded-2xl bg-surface-container-lowest flex flex-col md:flex-row gap-space-md transition-all ${
                      selectedSuiteId === 'suite2' ? 'shadow-md ring-2 ring-primary' : 'shadow-sm'
                    }`}
                  >
                    <div className="w-full md:w-56 h-48 md:h-auto rounded-xl overflow-hidden relative shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        alt="Sovereign Courtyard Chamber"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvhRIN6y4tt4Mpx1Gab_gOIy586ly7d_ysMUvt1I0Pz7BmgFJF92YX4dZAPaSj5FcNc8CT5NphnafzIBmWg0XPs36o8ZDG30J4WHUbgTqgxVsfMVC8yXJZsGthlGRKEC49HD6Aa6EsAtd3KaB6qEl0JpQfQ14twiVR30hOg2sgnff8TYCZS53hoLcjXhBhv4vOLwsVyyvWFedNfIuI08RS3EDIl0jlRStihmzGWx7vuCLKL_abLTeS0g"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1 gap-space-xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-title-lg text-on-surface">Sovereign Courtyard Chamber</h3>
                          <div className="text-right">
                            <span className="font-headline-sm text-on-surface">₹7,500</span>
                            <span className="font-body-sm text-secondary"> / night</span>
                          </div>
                        </div>
                        <p className="font-body-sm text-secondary mt-1">
                          420 sq.ft • Ground level easy access • Rosewood writing desk • French doors opening directly into jasmine courtyard and water basin.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">Max 2 Guests</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">Direct Garden Access</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">Step-Free Entry</span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="font-label-md text-secondary">4 chambers available</span>
                        <button
                          className={`px-4 py-2 rounded-xl font-label-md transition-all flex items-center gap-1.5 shadow-sm ${
                            selectedSuiteId === 'suite2'
                              ? 'bg-on-secondary-fixed text-primary-container'
                              : 'bg-surface-container-high text-on-surface hover:bg-on-secondary-fixed hover:text-surface'
                          }`}
                          onClick={() => handleSelectSuite('Sovereign Courtyard Chamber', 7500, 'suite2')}
                        >
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          <span>{selectedSuiteId === 'suite2' ? 'Chamber Selected' : 'Select Chamber'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Suite 3 */}
                  <div
                    className={`p-space-md rounded-2xl bg-surface-container-lowest flex flex-col md:flex-row gap-space-md transition-all ${
                      selectedSuiteId === 'suite3' ? 'shadow-md ring-2 ring-primary' : 'shadow-sm'
                    }`}
                  >
                    <div className="w-full md:w-56 h-48 md:h-auto rounded-xl overflow-hidden relative shrink-0">
                      <img
                        alt="Royal Rajwadi Glamping Tent"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida/AEtjO1VWiNPA-w2t1NQyfCn1h4szzX-NTPhydNqzwjbVXvd0r2cyv9cSBUBmNwfCaP_Q-HsX9T_34zUHzblYAF14ziVyzFO9zI4-laLaYl9lYG80Ibe1P_eci89u7CAYJQVjejr00a7U-pb1owHh3K-Vh5fAva8sW6TdDucgZumBPR6UtdE9JqEZmJAa_PoKS7D0Po3yWBkZwsCvICoe1LJmyyJ5CWh2MXSEJyYMjXmWZRbgL1C_cKkmWqy2csHI"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-on-secondary-fixed text-primary-container font-label-caps">
                        DESERT OUTPOST
                      </span>
                    </div>
                    <div className="flex flex-col justify-between flex-1 gap-space-xs">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-title-lg text-on-surface">Royal Rajwadi Glamping Tent</h3>
                          <div className="text-right">
                            <span className="font-headline-sm text-on-surface">₹14,000</span>
                            <span className="font-body-sm text-secondary"> / night</span>
                          </div>
                        </div>
                        <p className="font-body-sm text-secondary mt-1">
                          750 sq.ft • Triple-layered insulated Royal Swiss Tent • En-suite luxury stone bath • Private starlight campfire deck &amp; Kathiyawadi brass barbecue.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">Max 4 Guests</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">Private Campfire</span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface-variant">HVAC Inverter Air-Con</span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="font-label-md text-primary font-medium">Includes Private Safari Stargazer Deck</span>
                        <button
                          className={`px-4 py-2 rounded-xl font-label-md transition-all flex items-center gap-1.5 shadow-sm ${
                            selectedSuiteId === 'suite3'
                              ? 'bg-on-secondary-fixed text-primary-container'
                              : 'bg-surface-container-high text-on-surface hover:bg-on-secondary-fixed hover:text-surface'
                          }`}
                          onClick={() => handleSelectSuite('Royal Rajwadi Glamping Tent', 14000, 'suite3')}
                        >
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          <span>{selectedSuiteId === 'suite3' ? 'Outpost Selected' : 'Select Outpost'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Booking & Telemetry Sidebar (4 Cols) */}
              <div className="lg:col-span-4 sticky top-24">
                <div className="rounded-2xl bg-surface-container-lowest shadow-xl p-space-lg flex flex-col gap-space-md">
                  {/* Price Header */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-label-caps text-secondary uppercase">Selected Suite Rate</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display-hero-mobile text-on-surface font-bold">
                          ₹{currentSuitePrice.toLocaleString('en-IN')}
                        </span>
                        <span className="font-body-sm text-secondary">/ night</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/30 text-on-primary-fixed text-label-caps font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                        BEST RATE GUARANTEED
                      </span>
                      <span className="font-label-caps text-tertiary mt-1">Direct Haveli Quota</span>
                    </div>
                  </div>

                  {/* Selector Container */}
                  <div className="rounded-xl bg-surface-container-low p-space-sm flex flex-col gap-space-xs">
                    <div className="p-2 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                        <div className="flex flex-col">
                          <span className="font-label-caps text-secondary uppercase">Expedition Dates</span>
                          <span className="font-title-md text-sm text-on-surface">Dec 26, 2026 – Dec 28, 2026</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high font-label-caps text-on-surface font-semibold">
                        2 Nights
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary">group</span>
                        <div className="flex flex-col">
                          <span className="font-label-caps text-secondary uppercase">Voyager Composition</span>
                          <span className="font-title-md text-sm text-on-surface">2 Adults, 1 Child</span>
                        </div>
                      </div>
                      <span className="font-label-caps text-secondary">DNA Matched</span>
                    </div>

                    <div className="p-2 rounded-lg bg-on-secondary-fixed text-surface flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-base">king_bed</span>
                        <span className="font-label-md text-surface truncate max-w-[190px]">
                          {selectedSuiteName}
                        </span>
                      </div>
                      <span className="font-label-caps text-primary-container font-semibold">1 Suite</span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="flex flex-col gap-2 pt-1 font-body-sm text-secondary">
                    <div className="flex justify-between items-center">
                      <span>{nights} Nights × ₹{currentSuitePrice.toLocaleString('en-IN')}</span>
                      <span className="text-on-surface font-medium">₹{baseTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <span>Heritage Conservation Levy (3%)</span>
                        <span className="material-symbols-outlined text-xs text-tertiary" title="Contributes to sandstone preservation">help</span>
                      </span>
                      <span className="text-on-surface font-medium">₹{levy.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <span>GST &amp; Subcontinental Telemetry</span>
                        <span className="material-symbols-outlined text-xs text-tertiary" title="Statutory luxury accommodation GST">help</span>
                      </span>
                      <span className="text-on-surface font-medium">₹{gst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 flex justify-between items-baseline">
                      <div className="flex flex-col">
                        <span className="font-title-lg text-on-surface">Total Payable</span>
                        <span className="font-label-caps text-tertiary">All municipal levies included</span>
                      </div>
                      <span className="font-headline-md text-primary font-bold">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="flex flex-col gap-space-xs pt-2">
                    <button
                      className={`w-full py-3.5 px-6 rounded-xl font-headline-sm text-base text-center font-bold transition-all shadow-[0_0_24px_-4px_rgba(254,214,91,0.5)] flex items-center justify-center gap-2 cursor-pointer ${
                        isReserved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-primary-container text-on-primary-fixed hover:brightness-105 active:scale-[0.99]'
                      }`}
                      onClick={handleReserve}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {isReserved ? 'done_all' : 'hotel_class'}
                      </span>
                      <span>{isReserved ? 'Reservation Synchronised!' : 'Reserve Suite & Sync Itinerary'}</span>
                    </button>

                    <MakeMyTripBookingBanner
                      bookingType="hotel"
                      title={selectedSuiteName}
                      priceInr={currentSuitePrice}
                    />
                  </div>

                  {/* Sovereign Guarantee */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">shield</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-title-md text-xs text-on-surface">BharatYatra Sovereign Guarantee</span>
                      <span className="font-body-sm text-xs text-secondary leading-snug">
                        Instant confirmation locked into your offline BharatYatra Pass. Safari permits and chauffeur quarters pre-verified before arrival.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-on-secondary-fixed/95 backdrop-blur-xl flex flex-col p-4 md:p-8">
          <div className="flex items-center justify-between pb-4 max-w-[1440px] w-full mx-auto text-surface">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-2xl">photo_library</span>
              <div>
                <h4 className="font-title-lg text-surface">Estate Gallery Dossier</h4>
                <span className="font-label-caps text-surface-dim uppercase">
                  38 Archival Photographs • Nawab Heritage Haveli
                </span>
              </div>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-surface-bright/10 text-surface hover:bg-surface-bright/20 flex items-center justify-center transition-colors"
              onClick={() => setShowGalleryModal(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="max-w-[1440px] w-full mx-auto flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            <div className="rounded-xl overflow-hidden shadow-md">
              <img alt="Courtyard View" className="w-full h-72 object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VQLt78l4m5Sg8cUy0vfL92yFgFZnsCNVUE85xRYJTrAxGRNRmWMisjhr7BA2Ais_rOuE8fgXG1wtUY_0rvVHhuPVjnwojOFd-a4-5KVKk1J1v7pYR68qqzZxFcZQovihg28BCyVK4nYnuJYRowAf-PZo39QvlfYTb7oxZPRTLs99h5OcrYZl2J85XIW1BpPqOXepR_-4zIgj1Q8yLhrn36yx0U64s6rSJu09BwXwCYhReFSeYXw6egMdFv" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img alt="Luxury Tent View" className="w-full h-72 object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VWiNPA-w2t1NQyfCn1h4szzX-NTPhydNqzwjbVXvd0r2cyv9cSBUBmNwfCaP_Q-HsX9T_34zUHzblYAF14ziVyzFO9zI4-laLaYl9lYG80Ibe1P_eci89u7CAYJQVjejr00a7U-pb1owHh3K-Vh5fAva8sW6TdDucgZumBPR6UtdE9JqEZmJAa_PoKS7D0Po3yWBkZwsCvICoe1LJmyyJ5CWh2MXSEJyYMjXmWZRbgL1C_cKkmWqy2csHI" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img className="w-full h-72 object-cover" alt="Carved stone archway" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn2ZeeFrhEYpKby0U7L0FTl9B5u8bxOB9uMCkw7LqBc14mEZUiRHr7uIakHpmCJO5j5B6JA7bSRNDzLx4AECaek7fQhsYCGBSrb_IF1Q9_m-tED9HmwTUH7IOFZZvso7_eDm1D0-xnkv01ipA32VKeea3RwoKagcTQDDGgyb9dyB6ufcVsMCOLmb-nxCvvmKoOncbvSUncf2QKX_oWah3AJEVfk1PprOEabIaD7Zs46bkosRI7-88LRg" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img className="w-full h-72 object-cover" alt="Gujarati royal thali" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTxBTVENlWe-JeTsP4lWAmvgitQTbb3L3NL7_edCu4hhe2843cQQ4o-4xLBC7aAWC9aFmIL-CHg2VBVWq3-hrV2UMW3i6aV6V4kxwa1899--fatiQinPtClm1pKpnWpDgzfkLOIAxv3T7meZ5BROug2crS79BGaYn1f8vTuoPuUDsurhUldapAD_rbROpYnOIL4972eEKVQEGg60Oo5XNd4FhfoWNEdd5IkBJy19XMjBU4dhRaSr4GBg" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img className="w-full h-72 object-cover" alt="Antique bedroom chamber" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDydXCWzagUR2J_NVTl7-87hpL4kpJQYSSIS-FqCZ1N3ox-XSw5yCNnPl4y8MdDLDJdRQKfiUcrvnNOW8I9nw98vv2iiUKSoQ3yQeK5AI_93fRLK_cobZN-bSthfxBp68oSxwT6pdbrWcfbYl2BVZ7mgIRzrJKV3YaqZ_VKjd6dqdg26Q8hhXSmGK1tATbEuQtr-81mAHqEA3J6HD9R4zpTNdo-bA6HQmXlm5SPOR9Lg29O4da2iz4xNw" />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img className="w-full h-72 object-cover" alt="Jasmine courtyard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1oQlucn6oEFW4BlN94pSU8LbyYQUY0ohQMxpuePmQFcvfsCPuTlBQusNgRAE7XWQtdMkXUwkAwnD8hqixsGDG96DcRLuZXITqrKMCKAzzw4hfkgnPY8LuR5SEVPcc3AA3gGglZ6NnHblwzORD6y3JmLFc1UQjfuf4NFsP_BjJQLbF4VMH6nTa1hbqce2_ixC-EmdZZWFHMDdEiFOdl6P1ZxJooZSYTmpBOoQ3uIc8odC28AMM1I4Jtw" />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
          <div className="p-space-md rounded-2xl bg-on-secondary-fixed text-surface shadow-2xl flex items-center gap-4 max-w-md border-0">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">check</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-surface text-sm">Suite Locked &amp; Synchronised</span>
              <span className="font-body-sm text-xs text-surface-dim">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

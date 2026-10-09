'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CircuitDetailPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handlePlanWithAI = () => {
    router.push('/plan');
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-inverse-surface/95 text-inverse-on-surface backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(20,26,50,0.12)] pt-safe">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Go Back"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-surface-dim hover:text-surface-bright hover:bg-white/5 active:scale-95 transition-all"
              onClick={() => router.back()}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
            <div className="flex flex-col max-w-[170px]">
              <span className="font-label-caps text-label-caps tracking-widest text-primary-fixed uppercase truncate">
                BharatYatra
              </span>
              <h1 className="font-title-md text-title-md leading-none text-surface-bright truncate">
                Circuit Detail
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              aria-label="Share Itinerary"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-surface-variant hover:text-surface-bright hover:bg-white/5 transition-all"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Circuit itinerary link copied to clipboard');
                }
              }}
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
            </button>
            <button
              aria-label="Save to Favorites"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                isSaved ? 'text-primary-container bg-white/10' : 'text-surface-variant hover:text-surface-bright hover:bg-white/5'
              }`}
              onClick={() => setIsSaved(!isSaved)}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
            <div className="pl-space-xs flex items-center">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/40"
                src="https://lh3.googleusercontent.com/aida/AEtjO1Ui59jsO1cRmYcx_EhvwkLGkFogmDjmf7WlO_OauBFwKZ0uk_e307OoSlXT4rFNOTTz18I6VJ9GGtE93D4OpgxiI9xOdoffUGkzgoQ0KG88ACv-KY9EVYggJxEwdGNO95rCHoqDEYuaDqN7tRftqN7dgBVeMibJArETY3NhtGtIYgwZNrtEOGWVQM_PjXq995rzqJH5UGpxAdJ8JA0v0kOcVN3eHS4E9bOBnUkpNA-jIX-7ScyvFM41G5v_ZvuZOXHwVOlo5WZh9Nc"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-28 max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="relative w-full h-[380px] bg-on-secondary-fixed overflow-hidden">
            <img
              alt="White Rann salt desert at sunset with royal tents and camel caravan"
              className="w-full h-full object-cover object-center transform scale-105 animate-fade-in"
              src="https://lh3.googleusercontent.com/aida/AEtjO1VogxcvEk4TD_HyCStWPrpBk2YsWfxphl8NpUzNoxKoH891UHsbmsVwfPOBbvkOLkioA6ESCn7OJSK3uVgwHQ82mZSdaEj5Wtjh6zBWzhSV84xcB9WB0iX20RToE4qjUj1N91GJwnCDCBeXSvagGt38IZe9iB0BB3DDWPkjTrihupAAE3MPbY69QfhOWztiy0rg-aaxfgc0nv1WYCH2SgPvC4IkZ3Ze2vJh_Vnz_QOD4ZkvYZ6bV-fRMvY"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed via-on-secondary-fixed/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-on-secondary-fixed/40 via-transparent to-transparent"></div>

            {/* Floating Badges & Quick Info Overlaid */}
            <div className="absolute bottom-0 inset-x-0 p-margin-mobile flex flex-col gap-space-xs text-surface-lowest">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold shadow-sm">
                  Winter Full Moon Peak
                </span>
                <span className="bg-on-secondary-fixed/80 backdrop-blur-md text-surface-bright font-label-caps text-label-caps px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-primary-container text-[13px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  4.96 (520+ sovereign voyagers)
                </span>
              </div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-surface-lowest leading-tight tracking-tight mt-1">
                Kutch Heritage &amp; White Rann Solstice
              </h2>
              <p className="font-body-sm text-body-sm text-surface-container-high/90 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary-fixed">schedule</span>
                6 Days / 5 Nights Curated Circuit
              </p>
            </div>
          </div>

          {/* Content Container */}
          <div className="flex flex-col px-margin-mobile gap-space-lg -mt-3 relative z-10">
            {/* Dossier Quick Strip */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_4px_20px_-4px_rgba(20,26,50,0.06)] flex flex-col gap-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-on-secondary-fixed">
                    <span className="material-symbols-outlined text-[18px]">route</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-label-caps text-secondary uppercase">Route</span>
                    <span className="font-title-md text-[13px] leading-snug text-on-surface truncate">
                      Ahmedabad ➔ Bhuj ➔ Mandvi
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-on-secondary-fixed">
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-label-caps text-secondary uppercase">Pacing</span>
                    <span className="font-title-md text-[13px] leading-snug text-on-surface truncate">
                      Gentle &amp; Cultural
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-px bg-surface-container-high w-full my-0.5"></div>
              <div className="flex items-center justify-between text-secondary font-label-md text-label-md">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
                  Ideal for Explorers &amp; Families
                </span>
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  Farva Certified
                </span>
              </div>
            </div>

            {/* AI Travel DNA Synergy Card */}
            <div className="bg-gradient-to-br from-on-secondary-fixed to-[#1E2746] rounded-2xl p-space-md text-surface-lowest shadow-[0_8px_24px_-6px_rgba(20,26,50,0.2)] relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between gap-space-sm mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                  <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-fixed">
                    Synergy Intelligence
                  </span>
                </div>
                <span className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-2.5 py-0.5 rounded-full font-bold">
                  98% Match
                </span>
              </div>
              <h3 className="font-title-md text-title-md text-surface-lowest mb-1.5 flex items-center gap-1.5">
                Bespoke fit for your Travel DNA
              </h3>
              <p className="font-body-sm text-body-sm text-surface-container-highest/80 leading-relaxed">
                Intelligently combines the ethereal Dhordo full moon midnight salt walk with intimate master Rogan guild workshops in Nirona, calibrated to avoid desert midday temperatures.
              </p>
            </div>

            {/* Day-by-Day Journey Itinerary */}
            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">Curated Path</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Day-by-Day Journey</h3>
                </div>
                <button
                  className="text-primary font-label-md text-label-md flex items-center gap-0.5"
                  onClick={() => setExpanded(!expanded)}
                >
                  <span>{expanded ? 'Collapse' : 'Expand All'}</span>
                  <span className="material-symbols-outlined text-[16px]">
                    {expanded ? 'unfold_less' : 'unfold_more'}
                  </span>
                </button>
              </div>

              {/* Timeline wrapper */}
              <div className="relative flex flex-col gap-space-md pl-4">
                {/* Vertical guide line */}
                <div className="absolute left-[23px] top-4 bottom-8 w-0.5 bg-surface-container-highest"></div>

                {/* Day 1 Node */}
                <div className="relative flex items-start gap-space-md group">
                  <div className="relative z-10 w-4 h-4 mt-1 rounded-full bg-surface-lowest ring-4 ring-surface-container-high border-2 border-primary-container flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 bg-on-secondary-fixed rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                    <div className="flex items-center justify-between text-secondary font-label-caps text-label-caps uppercase mb-1">
                      <span>Day 01</span>
                      <span className="text-primary font-semibold">Arrival</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface mb-2">Stepwells of Adalaj &amp; Historic Pols</h4>
                    <div className="space-y-2 text-body-sm text-secondary">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">explore</span>
                        <span>Private curated walk through Ahmedabad Walled City &amp; Adalaj Vav.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">hotel</span>
                        <span className="text-on-surface font-medium">Nawab Heritage Haveli</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">restaurant</span>
                        <span>Welcome Gujarati Royal Thali banquet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day 2 Node */}
                <div className="relative flex items-start gap-space-md group">
                  <div className="relative z-10 w-4 h-4 mt-1 rounded-full bg-surface-lowest ring-4 ring-surface-container-high border-2 border-primary-container flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 bg-on-secondary-fixed rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                    <div className="flex items-center justify-between text-secondary font-label-caps text-label-caps uppercase mb-1">
                      <span>Day 02</span>
                      <span className="text-primary font-semibold">Art Guilds</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface mb-2">Sovereign Transit to Bhuj &amp; Rogan Art</h4>
                    <div className="space-y-2 text-body-sm text-secondary">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">directions_car</span>
                        <span>Private Chauffeur SUV transit via the scenic desert highway.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">brush</span>
                        <span>3.5h hands-on Rogan art masterclass with Khatri masters in Nirona.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">hotel</span>
                        <span className="text-on-surface font-medium">Bhuj Heritage Palace Wing</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day 3 Node (Highlight with Image) */}
                <div className="relative flex items-start gap-space-md group">
                  <div className="relative z-10 w-4 h-4 mt-1 rounded-full bg-primary-container ring-4 ring-primary-container/20 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 bg-on-secondary-fixed rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-lowest rounded-2xl p-space-md shadow-md">
                    <div className="flex items-center justify-between text-secondary font-label-caps text-label-caps uppercase mb-1">
                      <span className="text-primary font-bold">Day 03 • Highlight</span>
                      <span className="bg-primary-container/20 text-on-primary-container px-2 py-0.5 rounded-full text-[10px] font-bold">Full Moon</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface mb-2">Dhordo White Salt Desert &amp; Starlit Glamping</h4>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3">
                      <img
                        alt="Luxury royal tent encampment in Dhordo desert with warm evening campfire and lanterns"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida/AEtjO1VWiNPA-w2t1NQyfCn1h4szzX-NTPhydNqzwjbVXvd0r2cyv9cSBUBmNwfCaP_Q-HsX9T_34zUHzblYAF14ziVyzFO9zI4-laLaYl9lYG80Ibe1P_eci89u7CAYJQVjejr00a7U-pb1owHh3K-Vh5fAva8sW6TdDucgZumBPR6UtdE9JqEZmJAa_PoKS7D0Po3yWBkZwsCvICoe1LJmyyJ5CWh2MXSEJyYMjXmWZRbgL1C_cKkmWqy2csHI"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/70 via-transparent to-transparent"></div>
                      <span className="absolute bottom-2 left-2 text-surface-lowest font-label-caps text-label-caps px-2 py-0.5 bg-on-secondary-fixed/60 backdrop-blur-md rounded">
                        Rajwadi Imperial Tents
                      </span>
                    </div>
                    <div className="space-y-2 text-body-sm text-secondary">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">nights_stay</span>
                        <span>Sunset camel safari &amp; moonlit walk across the crystallised salt flats.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">hotel</span>
                        <span className="text-on-surface font-medium">Dhordo Royal Rajwadi AC Tent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary shrink-0">dinner_dining</span>
                        <span>Kathiyawadi feast (Ringna no Olo) &amp; live Sufi desert performance.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day 4-6 Collapsible Group */}
                <div className="relative flex items-start gap-space-md group">
                  <div className="relative z-10 w-4 h-4 mt-1 rounded-full bg-surface-lowest ring-4 ring-surface-container-high border-2 border-primary-container flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 bg-on-secondary-fixed rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
                    <div className="flex items-center justify-between text-secondary font-label-caps text-label-caps uppercase mb-1">
                      <span>Days 04 – 06</span>
                      <span className="text-secondary font-medium">Coast &amp; Return</span>
                    </div>
                    <h4 className="font-title-md text-title-md text-on-surface mb-1">Mandvi Coastal Fort, Shipyards &amp; Departure</h4>
                    <p className="font-body-sm text-body-sm text-secondary mb-3">
                      Explore 400-year-old wooden dhow shipbuilding docks, private Vijay Vilas Palace beachfront tea, followed by luxury transit to Ahmedabad.
                    </p>
                    {expanded && (
                      <div className="space-y-2 text-body-sm text-secondary pt-2 border-t border-surface-container">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">sailing</span>
                          <span>Mandvi Shipyard Dhow Tour & Vijay Vilas Palace Private Suite Tea</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-primary shrink-0">directions_car</span>
                          <span>Chauffeur transit back to Ahmedabad with stop at Little Rann of Kutch</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-semibold mt-2">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                      <span>Full detail unlock upon reservation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="flex flex-col gap-space-sm bg-surface-container-lowest rounded-2xl p-space-md shadow-sm">
              <h3 className="font-title-lg text-title-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">check_circle</span>
                What&apos;s Included in Circuit
              </h3>
              <div className="space-y-3 mt-1 text-body-sm text-on-surface">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">done</span>
                  </div>
                  <span>5 Nights Premium Heritage Haveli Stays &amp; Dhordo Glamping Tents</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">done</span>
                  </div>
                  <span>All Inter-city &amp; Desert Transit via Private AC Chauffeur SUV</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">done</span>
                  </div>
                  <span>VIP White Rann Entry Passes, Rogan Art Guild Workshop &amp; Tools</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">done</span>
                  </div>
                  <span>All Royal Regional Dining, Daily Breakfasts &amp; Camel Desert Safaris</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">done</span>
                  </div>
                  <span>24/7 Dedicated Ground Travel Concierge &amp; Farva Emergency Shield</span>
                </div>
              </div>
            </div>

            {/* Pricing & Sovereign Guarantee */}
            <div className="bg-surface-container rounded-2xl p-space-md flex flex-col gap-space-xs text-on-surface">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span className="material-symbols-outlined text-[20px]">shield</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider">
                  Sovereign Traveler Assurance
                </span>
              </div>
              <p className="font-title-md text-title-md text-on-surface">
                Transparent Luxury Guarantee
              </p>
              <p className="font-body-sm text-body-sm text-secondary">
                Starting from ₹18,400 per guest. All taxes, state permits, and driver gratuities included. 100% refundable if severe weather or permit anomalies disrupt desert access.
              </p>
            </div>

            {/* Reviewer Snippet */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden shrink-0 flex items-center justify-center text-secondary font-title-md">
                RS
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 text-primary-container text-[14px]">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[16px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface italic truncate mt-0.5">
                  &quot;Walking the salt flats under midnight moon was completely transcendent.&quot;
                </p>
                <span className="font-label-caps text-label-caps text-secondary uppercase">
                  Radhika S. • Dec 2024 Voyager
                </span>
              </div>
            </div>
          </div>

          {/* Persistent Sticky Bottom Booking Bar */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-inverse-surface/95 backdrop-blur-xl border-t border-white/10 px-margin-mobile py-3 flex items-center justify-between gap-space-md shadow-[0_-8px_24px_rgba(10,17,40,0.15)]">
            <div className="flex flex-col">
              <span className="font-label-caps text-[10px] text-primary-fixed uppercase tracking-wider">
                All-Inclusive
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-sm text-headline-sm text-surface-lowest leading-none">
                  ₹18,400
                </span>
                <span className="font-body-sm text-[12px] text-surface-dim">/ person</span>
              </div>
              <span className="font-label-caps text-[10px] text-surface-dim/80">6 Days • 5 Nights</span>
            </div>
            <button
              className="bg-primary-container text-on-primary-container font-label-lg text-label-lg font-semibold px-5 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_-2px_rgba(254,214,91,0.4)] active:scale-95 transition-all hover:brightness-105 shrink-0"
              onClick={handlePlanWithAI}
            >
              <span>Plan with AI</span>
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TrainDetailPage() {
  const router = useRouter();
  const [selectedTierCode, setSelectedTierCode] = useState('3A');
  const [tierPricePerPax, setTierPricePerPax] = useState(1080);
  const [showWaypointsDetail, setShowWaypointsDetail] = useState(false);
  const [isSecuring, setIsSecuring] = useState(false);
  const paxCount = 4;

  const selectTier = (code: string, price: number) => {
    setSelectedTierCode(code);
    setTierPricePerPax(price);
  };

  const totalPrice = tierPricePerPax * paxCount;

  const handleReviewBerths = () => {
    setIsSecuring(true);
    setTimeout(() => {
      setIsSecuring(false);
      router.push('/checkout');
    }, 1000);
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-inverse-surface/95 text-inverse-on-surface backdrop-blur-xl shadow-[0_12px_32px_-8px_rgba(20,26,50,0.12)] pt-safe">
        <div className="h-16 px-margin-mobile flex items-center justify-between max-w-5xl mx-auto">
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
                Experience Booking
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
                  alert('Train route link copied');
                }
              }}
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
            </button>
            <button
              aria-label="Save to Favorites"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-surface-variant hover:text-surface-bright hover:bg-white/5 transition-all"
            >
              <span className="material-symbols-outlined text-[22px]">bookmark_border</span>
            </button>
            <div className="pl-space-xs flex items-center">
              <Link href="/profile">
                <img
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/40"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1Ui59jsO1cRmYcx_EhvwkLGkFogmDjmf7WlO_OauBFwKZ0uk_e307OoSlXT4rFNOTTz18I6VJ9GGtE93D4OpgxiI9xOdoffUGkzgoQ0KG88ACv-KY9EVYggJxEwdGNO95rCHoqDEYuaDqN7tRftqN7dgBVeMibJArETY3NhtGtIYgwZNrtEOGWVQM_PjXq995rzqJH5UGpxAdJ8JA0v0kOcVN3eHS4E9bOBnUkpNA-jIX-7ScyvFM41G5v_ZvuZOXHwVOlo5WZh9Nc"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col relative w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-32 max-w-md mx-auto">
          {/* Top Visual Scrim & Hero Card */}
          <div className="relative w-full overflow-hidden bg-on-secondary-fixed">
            <div
              className="w-full h-56 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCP1BIAoIyLHmEoaHeI7bvV9OHxza-PQYPvlzxruNsCgjwGozZfy7X-N_1ql4uJqiS8hqHhgnYUw8B1GQCfnlydx6qCD0eD3hT-vCTAJMltWyqQj65BVY1Ou_YYrIctpRidef02F1OOzvZ8KLXm83BY8UAUTV-hFUgAyv5-3cdLR-phn0D2h8CnNma89J38z9BHzFDM2ghxtOqg_m9dYbpHP_woRA8LgSw2SCv20p2J71XsVYy6_CKuww')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed via-on-secondary-fixed/50 to-transparent"></div>
            <div className="absolute bottom-3 inset-x-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps tracking-wider uppercase shadow-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                On Schedule • LHB German Safety Coach
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface/10 backdrop-blur-md text-surface-bright font-label-md text-label-md">
                <span className="material-symbols-outlined text-[14px] text-primary-fixed">calendar_today</span>
                Thu, Dec 24
              </span>
            </div>
          </div>

          {/* Transit Summary Card */}
          <div className="px-margin-mobile -mt-4 relative z-10">
            <div className="w-full bg-surface-container-lowest rounded-2xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                    Superfast Express
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Gujarat Express #12905</span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md">
                    471 km Total
                  </span>
                </div>
              </div>

              {/* Station to Station Stepper */}
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col items-start max-w-[100px]">
                  <span className="font-display-hero-mobile text-[32px] leading-tight font-bold text-on-surface">
                    21:30
                  </span>
                  <span className="font-title-md text-title-md text-on-surface font-semibold">ADI</span>
                  <span className="font-body-sm text-body-sm text-secondary truncate w-full">Ahmedabad Jn</span>
                  <span className="font-label-caps text-label-caps text-primary font-bold mt-0.5">Platform 4</span>
                </div>
                <div className="flex-1 flex flex-col items-center px-3">
                  <span className="font-label-caps text-label-caps text-secondary font-medium tracking-wide">
                    09h 45m Overnight
                  </span>
                  <div className="relative w-full flex items-center justify-center my-1.5">
                    <div className="w-full h-0.5 bg-surface-variant rounded-full"></div>
                    <div className="absolute w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary-fixed-dim shadow-sm">
                      <span className="material-symbols-outlined text-[16px] rotate-90 text-on-surface">
                        train
                      </span>
                    </div>
                  </div>
                  <span className="font-label-caps text-label-caps text-secondary">Non-stop Sleep Window</span>
                </div>
                <div className="flex flex-col items-end max-w-[100px] text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display-hero-mobile text-[32px] leading-tight font-bold text-on-surface">
                      07:15
                    </span>
                    <span className="font-label-caps text-label-caps text-primary font-bold">+1D</span>
                  </div>
                  <span className="font-title-md text-title-md text-on-surface font-semibold">DWK</span>
                  <span className="font-body-sm text-body-sm text-secondary truncate w-full">Dwarka Jn</span>
                  <span className="font-label-caps text-label-caps text-secondary mt-0.5">Platform 1</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Trip Synergy Insight */}
          <div className="px-margin-mobile mt-4">
            <div className="w-full rounded-2xl bg-on-secondary-fixed text-surface-bright p-4 relative overflow-hidden shadow-md">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary-fixed/10 blur-2xl pointer-events-none"></div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container shrink-0 mt-0.5 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-label-caps tracking-widest text-primary-fixed uppercase">
                      Farva Intelligence
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-ping"></span>
                  </div>
                  <p className="font-body-sm text-body-sm text-surface-variant mt-1">
                    Matches <strong className="text-surface-bright font-semibold">Day 5</strong> of your{' '}
                    <em className="not-italic text-primary-fixed">Royal Gujarat Discovery</em>. Direct overnight transit eliminates hotel transfer friction, reserving prime daylight for Dwarkadhish VIP morning darshan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Class Selection */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="px-margin-mobile flex items-center justify-between">
              <h2 className="font-title-lg text-title-lg text-on-surface">Choose Travel Tier</h2>
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Dynamic Availability
              </span>
            </div>

            {/* Horizontal Scroll Class Cards */}
            <div className="flex gap-3 overflow-x-auto px-margin-mobile no-scrollbar pb-2 pt-1" id="class-tier-container">
              {/* 3A (Selected & Recommended) */}
              <button
                type="button"
                className={`min-w-[240px] flex-1 bg-surface-container-lowest text-left p-4 rounded-2xl transition-all relative flex flex-col justify-between cursor-pointer ${
                  selectedTierCode === '3A'
                    ? 'ring-2 ring-primary-container shadow-md'
                    : 'shadow-sm hover:shadow-md'
                }`}
                onClick={() => selectTier('3A', 1080)}
              >
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps">
                  Recommended
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">3A</span>
                    <span className="font-label-md text-label-md text-secondary">AC 3-Tier</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-title-lg text-title-lg text-on-surface font-bold">₹1,080</span>
                    <span className="font-body-sm text-body-sm text-secondary">/ person</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex flex-col gap-1.5 bg-surface-container-low/60 -mx-4 -mb-4 p-4 rounded-b-2xl">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                    <span className="font-label-md text-label-md">Available (42 seats)</span>
                  </div>
                  <span className="font-body-sm text-[12px] text-secondary">Linen Included • Family Bay Clustered</span>
                </div>
              </button>

              {/* 2A Card */}
              <button
                type="button"
                className={`min-w-[240px] flex-1 bg-surface-container-lowest text-left p-4 rounded-2xl transition-all relative flex flex-col justify-between cursor-pointer ${
                  selectedTierCode === '2A'
                    ? 'ring-2 ring-primary-container shadow-md'
                    : 'shadow-sm hover:shadow-md'
                }`}
                onClick={() => selectTier('2A', 1520)}
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">2A</span>
                    <span className="font-label-md text-label-md text-secondary">AC 2-Tier</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-title-lg text-title-lg text-on-surface font-bold">₹1,520</span>
                    <span className="font-body-sm text-body-sm text-secondary">/ person</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex flex-col gap-1.5 bg-surface-container-low/60 -mx-4 -mb-4 p-4 rounded-b-2xl">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                    <span className="font-label-md text-label-md">Available (18 seats)</span>
                  </div>
                  <span className="font-body-sm text-[12px] text-secondary">Privacy Curtains • Reading Spotlights</span>
                </div>
              </button>

              {/* 1A Card */}
              <button
                type="button"
                className={`min-w-[240px] flex-1 bg-surface-container-lowest text-left p-4 rounded-2xl transition-all relative flex flex-col justify-between cursor-pointer ${
                  selectedTierCode === '1A'
                    ? 'ring-2 ring-primary-container shadow-md'
                    : 'shadow-sm hover:shadow-md'
                }`}
                onClick={() => selectTier('1A', 2480)}
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">1A</span>
                    <span className="font-label-md text-label-md text-secondary">Executive First AC</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-title-lg text-title-lg text-on-surface font-bold">₹2,480</span>
                    <span className="font-body-sm text-body-sm text-secondary">/ person</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex flex-col gap-1.5 bg-surface-container-low/60 -mx-4 -mb-4 p-4 rounded-b-2xl">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">alarm</span>
                    <span className="font-label-md text-label-md">4 Seats Open</span>
                  </div>
                  <span className="font-body-sm text-[12px] text-secondary">Lockable Coupe • Private Attendant</span>
                </div>
              </button>

              {/* SL Card */}
              <button
                type="button"
                className={`min-w-[240px] flex-1 bg-surface-container-lowest text-left p-4 rounded-2xl transition-all relative flex flex-col justify-between cursor-pointer ${
                  selectedTierCode === 'SL'
                    ? 'ring-2 ring-primary-container shadow-md'
                    : 'shadow-sm hover:shadow-md'
                }`}
                onClick={() => selectTier('SL', 390)}
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface">SL</span>
                    <span className="font-label-md text-label-md text-secondary">Sleeper Classic</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-title-lg text-title-lg text-on-surface font-bold">₹390</span>
                    <span className="font-body-sm text-body-sm text-secondary">/ person</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex flex-col gap-1.5 bg-surface-container-low/60 -mx-4 -mb-4 p-4 rounded-b-2xl">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span className="font-label-md text-label-md">RAC 08 (Confirmed on Chart)</span>
                  </div>
                  <span className="font-body-sm text-[12px] text-secondary">Non-AC • Natural Airflow</span>
                </div>
              </button>
            </div>
          </div>

          {/* Waypoint Route Stepper Accordion */}
          <div className="px-margin-mobile mt-5">
            <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowWaypointsDetail(!showWaypointsDetail)}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">alt_route</span>
                  <span className="font-title-md text-title-md text-on-surface">Key Transit Waypoints</span>
                </div>
                <div className="flex items-center gap-1 text-secondary">
                  <span className="font-label-md text-label-md">
                    {showWaypointsDetail ? 'Hide Halts' : '8 Stops'}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
                      showWaypointsDetail ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-center px-1">
                <div className="flex flex-col items-center">
                  <span className="font-label-md text-label-md font-bold text-on-surface">ADI</span>
                  <span className="font-label-caps text-[10px] text-secondary">21:30</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-surface-variant">arrow_forward</span>
                <div className="flex flex-col items-center">
                  <span className="font-label-md text-label-md font-medium text-on-surface">VG</span>
                  <span className="font-label-caps text-[10px] text-secondary">22:25</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-surface-variant">arrow_forward</span>
                <div className="flex flex-col items-center">
                  <span className="font-label-md text-label-md font-medium text-on-surface">RJT</span>
                  <span className="font-label-caps text-[10px] text-secondary">01:55</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-surface-variant">arrow_forward</span>
                <div className="flex flex-col items-center">
                  <span className="font-label-md text-label-md font-medium text-on-surface">JAM</span>
                  <span className="font-label-caps text-[10px] text-secondary">03:20</span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-surface-variant">arrow_forward</span>
                <div className="flex flex-col items-center">
                  <span className="font-label-md text-label-md font-bold text-on-surface">DWK</span>
                  <span className="font-label-caps text-[10px] text-secondary">07:15</span>
                </div>
              </div>

              {/* Collapsible Detailed Halts */}
              {showWaypointsDetail && (
                <div className="mt-4 pt-3 flex flex-col gap-2.5 border-t border-surface-container">
                  <div className="flex items-center justify-between text-body-sm text-on-surface py-1">
                    <span className="font-medium">1. Ahmedabad Jn (ADI)</span>
                    <span className="text-secondary font-label-md">Dep 21:30 • Platform 4</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-on-surface py-1">
                    <span className="font-medium">2. Viramgam Jn (VG)</span>
                    <span className="text-secondary font-label-md">22:23 - 22:25 (2m) • Platform 1</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-on-surface py-1">
                    <span className="font-medium">3. Surendranagar (SUNR)</span>
                    <span className="text-secondary font-label-md">23:28 - 23:30 (2m) • Platform 2</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-on-surface py-1">
                    <span className="font-medium">4. Wankaner Jn (WKR)</span>
                    <span className="text-secondary font-label-md">00:33 - 00:35 (2m) • Platform 1</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-on-surface py-1">
                    <span className="font-medium">5. Rajkot Jn (RJT)</span>
                    <span className="text-secondary font-label-md">01:50 - 01:55 (5m) • Platform 3</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-on-surface py-1">
                    <span className="font-medium">6. Jamnagar (JAM)</span>
                    <span className="text-secondary font-label-md">03:15 - 03:20 (5m) • Platform 1</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-on-surface py-1">
                    <span className="font-medium">7. Khambhalia (KMBL)</span>
                    <span className="text-secondary font-label-md">04:12 - 04:14 (2m) • Platform 2</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-on-surface py-1">
                    <span className="font-medium">8. Dwarka (DWK)</span>
                    <span className="text-primary font-label-md font-bold">Arr 07:15 • Platform 1</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Passenger Roster Vault */}
          <div className="px-margin-mobile mt-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h2 className="font-title-lg text-title-lg text-on-surface">Travel Companions</h2>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-caps text-label-caps font-semibold">
                  4 Pre-Assigned
                </span>
              </div>
              <button className="text-primary font-label-md text-label-md hover:underline active:opacity-80">
                Edit Berths
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {/* Passenger 1 */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-md text-label-md font-bold">
                    DR
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-medium">Devraj Rao</span>
                    <span className="font-body-sm text-body-sm text-secondary">Adult • Male (34)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md">
                    Lower Berth
                  </span>
                  <div className="font-label-caps text-[10px] text-secondary mt-0.5">Coach B2 Bay 1</div>
                </div>
              </div>

              {/* Passenger 2 */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-label-md text-label-md font-bold">
                    AR
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-medium">Ananya Rao</span>
                    <span className="font-body-sm text-body-sm text-secondary">Adult • Female (32)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md">
                    Side Lower
                  </span>
                  <div className="font-label-caps text-[10px] text-secondary mt-0.5">Coach B2 Bay 1</div>
                </div>
              </div>

              {/* Passenger 3 */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">
                    SR
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-medium">Siddharth Rao</span>
                    <span className="font-body-sm text-body-sm text-secondary">Child • Male (8)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md">
                    Upper Berth
                  </span>
                  <div className="font-label-caps text-[10px] text-secondary mt-0.5">Coach B2 Bay 1</div>
                </div>
              </div>

              {/* Passenger 4 */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md font-bold">
                    BR
                  </div>
                  <div className="flex flex-col">
                    <span className="font-title-md text-title-md text-on-surface font-medium">Bhavna Rao</span>
                    <span className="font-body-sm text-body-sm text-secondary">Senior • Female (66)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">elderly</span>
                    <span className="px-2 py-0.5 rounded-lg bg-primary-container/40 text-on-primary-fixed font-label-md text-label-md">
                      Lower Quota
                    </span>
                  </div>
                  <div className="font-label-caps text-[10px] text-secondary mt-0.5">Coach B2 Bay 1</div>
                </div>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Add Co-Traveller / Alter Vault</span>
            </button>
          </div>

          {/* Onboard Amenities Bento Section */}
          <div className="px-margin-mobile mt-5 flex flex-col gap-3">
            <h2 className="font-title-lg text-title-lg text-on-surface">Transit Amenities &amp; Assurance</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">room_service</span>
                </div>
                <div>
                  <span className="font-title-md text-title-md text-on-surface font-semibold block">Kathiyawadi Thali</span>
                  <span className="font-body-sm text-body-sm text-secondary">Pre-orderable hot evening dinner delivered at Rajkot.</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">bed</span>
                </div>
                <div>
                  <span className="font-title-md text-title-md text-on-surface font-semibold block">Fresh Sealed Linen</span>
                  <span className="font-body-sm text-body-sm text-secondary">Micro-sanitized duvet, freshly washed cotton pillow.</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">power</span>
                </div>
                <div>
                  <span className="font-title-md text-title-md text-on-surface font-semibold block">Individual 220V</span>
                  <span className="font-body-sm text-body-sm text-secondary">Dedicated bay charging sockets for all 4 berths.</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-col gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div>
                  <span className="font-title-md text-title-md text-on-surface font-semibold block">Link Protection</span>
                  <span className="font-body-sm text-body-sm text-secondary">Zero cancellation penalty if inbound transit delays.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Touch Booking Bar */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-inverse-surface/95 backdrop-blur-xl p-4 pb-safe shadow-[0_-8px_24px_rgba(10,17,40,0.25)]">
            <div className="max-w-md mx-auto flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-wider">Total</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-surface-bright">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="font-label-md text-label-md text-surface-variant">
                  {paxCount} Travellers ({selectedTierCode} Tier)
                </span>
              </div>
              <button
                type="button"
                className="flex-1 max-w-[210px] h-12 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all hover:bg-primary-fixed cursor-pointer"
                onClick={handleReviewBerths}
                disabled={isSecuring}
              >
                {isSecuring ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Securing Seats...</span>
                  </>
                ) : (
                  <>
                    <span>Review Berths</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

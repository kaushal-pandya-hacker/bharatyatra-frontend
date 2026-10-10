'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BusDetailPage() {
  const router = useRouter();
  const [selectedDeck, setSelectedDeck] = useState<'lower' | 'upper'>('lower');
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['L14', 'L15']);
  const baseRate = 920;

  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert('Maximum of 6 berths can be booked per PNR');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalPrice = selectedSeats.length * baseRate;

  const proceedToReview = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least 1 sleeper berth to continue.');
      return;
    }
    router.push('/checkout');
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
                  alert('Route link copied');
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
        <div className="flex flex-col w-full pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle Route Hero Graphic */}
          <div className="relative w-full h-44 sm:h-56 rounded-2xl bg-inverse-surface overflow-hidden my-4">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB1BYvJu90NDdX5adYohRbzZGQwMASGkWUmwal8NlxMRdH1tp163YySyK_DSxd3s83rwhDuWXXRg56siyU4XNHeQaRkK89w8-IIu9LUtgqhp3zELWZJ2Xh-X_LI0yUJp-iS4ft-LHKH-26z4xyCDxiz62GHIksjv35xppCyKmQbmDKs10H9UAGLwHZarVC7GkfnUqdrKZbGSVke3wOurLMQj4oXltytdS_3AASB_oLpbqiqQ_R0Qr6x5A')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/60 to-transparent"></div>
            <div className="relative z-10 p-margin-mobile sm:p-6 h-full flex flex-col justify-end">
              <div className="flex items-center gap-space-xs mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-fixed font-label-caps text-label-caps">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1 animate-pulse"></span>
                  Express Line 9204
                </span>
                <span className="text-surface-container-high font-label-md text-label-md flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[14px] text-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  4.86 <span className="text-surface-dim">(1.4k trips)</span>
                </span>
              </div>
              <h2 className="text-surface-bright font-title-lg sm:text-2xl text-title-lg tracking-tight">
                GSRTC Multi-Axle Volvo B11R
              </h2>
              <p className="text-surface-dim font-body-sm text-body-sm">
                Air-Suspension Ultra Sleeper (2+1 Luxury)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-space-md">
            {/* Route & Transit Metrics Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface leading-none">22:30</span>
                  <span className="font-label-md text-label-md text-secondary mt-1">Ahmedabad</span>
                  <span className="font-body-sm text-body-sm text-outline">Geeta Mandir / ISKCON</span>
                </div>
                <div className="flex flex-col items-center px-space-xs">
                  <span className="font-label-caps text-label-caps text-secondary font-medium">07h 15m</span>
                  <div className="flex items-center gap-1 my-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span className="w-12 h-0.5 bg-secondary-container rounded-full relative">
                      <span className="absolute left-1/2 -top-1 -translate-x-1/2 text-secondary text-[12px] material-symbols-outlined">
                        directions_bus
                      </span>
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  </div>
                  <span className="font-label-caps text-label-caps text-primary uppercase font-bold">Express Way</span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="font-headline-sm text-headline-sm text-on-surface leading-none">05:45</span>
                  <span className="font-label-md text-label-md text-secondary mt-1">Bhuj (+1D)</span>
                  <span className="font-body-sm text-body-sm text-outline">Jubilee Ground</span>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">Live GPS Corridor Tracking</span>
                </div>
                <span className="font-label-caps text-label-caps bg-surface-container text-secondary px-2 py-0.5 rounded-full">
                  On Schedule
                </span>
              </div>
            </div>

            {/* Boarding / Dropping Selector Sheet */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Pickup &amp; Drop Station
              </span>
              <div className="flex flex-col sm:flex-row gap-space-xs">
                <div className="flex-1 flex items-start gap-space-sm p-2.5 rounded-lg bg-surface-container-low">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">trip_origin</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-on-surface">ISKCON Cross Road</span>
                      <span className="font-label-md text-label-md text-primary font-semibold">23:00</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-outline truncate">BRTS Corridor Pillar 42, SG Highway</p>
                  </div>
                </div>
                <div className="flex-1 flex items-start gap-space-sm p-2.5 rounded-lg bg-surface-container-low">
                  <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">location_on</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-on-surface">Bhuj Jubilee Ground</span>
                      <span className="font-label-md text-label-md text-secondary font-semibold">05:45</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-outline truncate">Central GSRTC Terminal, Platform 2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Sleeper Berth Selector */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface">Select Sleeper Berths</h3>
                  <p className="font-body-sm text-body-sm text-secondary">Multi-Axle Premium Sleeper Pods</p>
                </div>
                {/* Deck Switcher Tabs */}
                <div className="flex bg-surface-container p-1 rounded-xl">
                  <button
                    className={`px-3 py-1 rounded-lg font-label-md text-label-md transition-all ${
                      selectedDeck === 'lower'
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                        : 'text-secondary'
                    }`}
                    onClick={() => setSelectedDeck('lower')}
                  >
                    Lower
                  </button>
                  <button
                    className={`px-3 py-1 rounded-lg font-label-md text-label-md transition-all ${
                      selectedDeck === 'upper'
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                        : 'text-secondary'
                    }`}
                    onClick={() => setSelectedDeck('upper')}
                  >
                    Upper
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-4 gap-1 py-1 px-2 bg-surface-container-low rounded-lg text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-9 rounded bg-surface-container-lowest shadow-xs"></div>
                  <span className="font-label-caps text-label-caps text-secondary">Avail</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-9 rounded bg-primary-container shadow-xs flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-on-primary-container font-bold">
                      check
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface font-semibold">Chosen</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-9 rounded bg-inverse-surface/20"></div>
                  <span className="font-label-caps text-label-caps text-outline">Taken</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-9 rounded bg-tertiary-container"></div>
                  <span className="font-label-caps text-label-caps text-on-tertiary-container">Women</span>
                </div>
              </div>

              {/* Bus Cabin Layout */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm relative overflow-x-auto no-scrollbar">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-[18px]">card_travel</span>
                    <span className="font-label-caps text-label-caps uppercase tracking-wider">Front Entry Cabin</span>
                  </div>
                  <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container text-secondary">
                    {selectedDeck === 'lower' ? 'Deck 1 (Lower)' : 'Deck 2 (Upper)'}
                  </span>
                </div>

                {/* Grid View */}
                {selectedDeck === 'lower' ? (
                  <div className="flex flex-col gap-2.5">
                    {/* Row 1 */}
                    <div className="flex items-center justify-between">
                      <button
                        className={`w-16 h-24 rounded-lg p-1 flex flex-col justify-between text-left active:scale-95 transition-all ${
                          selectedSeats.includes('L11')
                            ? 'bg-primary-container text-on-primary-fixed shadow-md p-1.5'
                            : 'bg-surface-container-lowest shadow-xs'
                        }`}
                        onClick={() => toggleSeat('L11')}
                      >
                        <span className="font-label-md text-label-md">L11</span>
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps">₹920</span>
                          <span className="material-symbols-outlined text-[14px]">bed</span>
                        </div>
                      </button>
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[10px] text-outline uppercase font-label-caps rotate-90 tracking-widest opacity-60">
                          Aisle
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-16 h-24 rounded-lg bg-inverse-surface/15 p-1 flex flex-col justify-between text-left opacity-60 cursor-not-allowed" disabled>
                          <span className="font-label-md text-label-md text-secondary">L12</span>
                          <span className="material-symbols-outlined text-[14px] text-secondary self-end">lock</span>
                        </button>
                        <button className="w-16 h-24 rounded-lg bg-inverse-surface/15 p-1 flex flex-col justify-between text-left opacity-60 cursor-not-allowed" disabled>
                          <span className="font-label-md text-label-md text-secondary">L13</span>
                          <span className="material-symbols-outlined text-[14px] text-secondary self-end">lock</span>
                        </button>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-center justify-between">
                      <button
                        className={`w-16 h-24 rounded-lg p-1.5 flex flex-col justify-between text-left active:scale-95 transition-all ${
                          selectedSeats.includes('L14')
                            ? 'bg-primary-container text-on-primary-fixed shadow-md'
                            : 'bg-surface-container-lowest shadow-xs'
                        }`}
                        onClick={() => toggleSeat('L14')}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-title-md text-title-md">L14</span>
                          {selectedSeats.includes('L14') && (
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          )}
                        </div>
                        <div>
                          <span className="font-label-caps text-label-caps block">Window</span>
                          <span className="font-label-md text-label-md font-bold">₹920</span>
                        </div>
                      </button>

                      <div className="h-full flex items-center justify-center">
                        <span className="text-[10px] text-outline uppercase font-label-caps rotate-90 tracking-widest opacity-60">
                          Aisle
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className={`w-16 h-24 rounded-lg p-1.5 flex flex-col justify-between text-left active:scale-95 transition-all ${
                            selectedSeats.includes('L15')
                              ? 'bg-primary-container text-on-primary-fixed shadow-md'
                              : 'bg-surface-container-lowest shadow-xs'
                          }`}
                          onClick={() => toggleSeat('L15')}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-title-md text-title-md">L15</span>
                            {selectedSeats.includes('L15') && (
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            )}
                          </div>
                          <div>
                            <span className="font-label-caps text-label-caps block">Aisle</span>
                            <span className="font-label-md text-label-md font-bold">₹920</span>
                          </div>
                        </button>

                        <button className="w-16 h-24 rounded-lg bg-tertiary-container text-on-tertiary-container p-1.5 flex flex-col justify-between text-left">
                          <div className="flex justify-between items-start">
                            <span className="font-label-md text-label-md font-bold">L16</span>
                            <span className="material-symbols-outlined text-[14px]">female</span>
                          </div>
                          <div>
                            <span className="font-label-caps text-label-caps block">Female</span>
                            <span className="font-label-md text-label-md">₹920</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-center justify-between">
                      <button
                        className={`w-16 h-24 rounded-lg p-1 flex flex-col justify-between text-left active:scale-95 transition-all ${
                          selectedSeats.includes('L17')
                            ? 'bg-primary-container text-on-primary-fixed shadow-md p-1.5'
                            : 'bg-surface-container-lowest shadow-xs'
                        }`}
                        onClick={() => toggleSeat('L17')}
                      >
                        <span className="font-label-md text-label-md">L17</span>
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps">₹920</span>
                          <span className="material-symbols-outlined text-[14px]">bed</span>
                        </div>
                      </button>

                      <div className="h-full flex items-center justify-center">
                        <span className="text-[10px] text-outline uppercase font-label-caps rotate-90 tracking-widest opacity-60">
                          Aisle
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button className="w-16 h-24 rounded-lg bg-inverse-surface/15 p-1 flex flex-col justify-between text-left opacity-60 cursor-not-allowed" disabled>
                          <span className="font-label-md text-label-md text-secondary">L18</span>
                          <span className="material-symbols-outlined text-[14px] text-secondary self-end">lock</span>
                        </button>
                        <button
                          className={`w-16 h-24 rounded-lg p-1 flex flex-col justify-between text-left active:scale-95 transition-all ${
                            selectedSeats.includes('L19')
                              ? 'bg-primary-container text-on-primary-fixed shadow-md p-1.5'
                              : 'bg-surface-container-lowest shadow-xs'
                          }`}
                          onClick={() => toggleSeat('L19')}
                        >
                          <span className="font-label-md text-label-md">L19</span>
                          <div className="flex items-center justify-between">
                            <span className="font-label-caps text-label-caps">₹920</span>
                            <span className="material-symbols-outlined text-[14px]">bed</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {/* Upper deck berths */}
                    <div className="flex items-center justify-between">
                      <button
                        className={`w-16 h-24 rounded-lg p-1 flex flex-col justify-between text-left active:scale-95 transition-all ${
                          selectedSeats.includes('U11')
                            ? 'bg-primary-container text-on-primary-fixed shadow-md p-1.5'
                            : 'bg-surface-container-lowest shadow-xs'
                        }`}
                        onClick={() => toggleSeat('U11')}
                      >
                        <span className="font-label-md text-label-md">U11</span>
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-label-caps">₹920</span>
                          <span className="material-symbols-outlined text-[14px]">bed</span>
                        </div>
                      </button>
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[10px] text-outline uppercase font-label-caps rotate-90 tracking-widest opacity-60">
                          Aisle
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`w-16 h-24 rounded-lg p-1 flex flex-col justify-between text-left active:scale-95 transition-all ${
                            selectedSeats.includes('U12')
                              ? 'bg-primary-container text-on-primary-fixed shadow-md p-1.5'
                              : 'bg-surface-container-lowest shadow-xs'
                          }`}
                          onClick={() => toggleSeat('U12')}
                        >
                          <span className="font-label-md text-label-md">U12</span>
                          <div className="flex items-center justify-between">
                            <span className="font-label-caps text-label-caps">₹920</span>
                            <span className="material-symbols-outlined text-[14px]">bed</span>
                          </div>
                        </button>
                        <button
                          className={`w-16 h-24 rounded-lg p-1 flex flex-col justify-between text-left active:scale-95 transition-all ${
                            selectedSeats.includes('U13')
                              ? 'bg-primary-container text-on-primary-fixed shadow-md p-1.5'
                              : 'bg-surface-container-lowest shadow-xs'
                          }`}
                          onClick={() => toggleSeat('U13')}
                        >
                          <span className="font-label-md text-label-md">U13</span>
                          <div className="flex items-center justify-between">
                            <span className="font-label-caps text-label-caps">₹920</span>
                            <span className="material-symbols-outlined text-[14px]">bed</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 pt-2 flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded-lg">
                  <span className="font-label-md text-label-md text-on-surface">
                    Chosen Berths:{' '}
                    <strong className="text-primary-fixed-variant">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None chosen'}
                    </strong>
                  </span>
                  <span className="font-label-caps text-label-caps bg-primary-fixed px-2 py-0.5 rounded text-on-primary-fixed font-bold">
                    {selectedSeats.length}/6 Max
                  </span>
                </div>
              </div>
            </div>

            {/* Onboard Amenities */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <h3 className="font-title-md text-title-md text-on-surface">Volvo B11R Fleet Amenities</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-surface-container-low gap-1">
                  <span className="material-symbols-outlined text-primary text-[22px]">mode_fan</span>
                  <span className="font-label-md text-label-md text-on-surface">Individual AC</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-surface-container-low gap-1">
                  <span className="material-symbols-outlined text-primary text-[22px]">bolt</span>
                  <span className="font-label-md text-label-md text-on-surface">USB-C Fast Plug</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-surface-container-low gap-1">
                  <span className="material-symbols-outlined text-primary text-[22px]">bed</span>
                  <span className="font-label-md text-label-md text-on-surface">Fresh Blanket</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-surface-container-low gap-1">
                  <span className="material-symbols-outlined text-primary text-[22px]">local_drink</span>
                  <span className="font-label-md text-label-md text-on-surface">Mineral Water</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-surface-container-low gap-1">
                  <span className="material-symbols-outlined text-primary text-[22px]">my_location</span>
                  <span className="font-label-md text-label-md text-on-surface">GPS Live Map</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-surface-container-low gap-1">
                  <span className="material-symbols-outlined text-primary text-[22px]">emergency</span>
                  <span className="font-label-md text-label-md text-on-surface">24/7 SOS Call</span>
                </div>
              </div>
            </div>

            {/* Passenger Dossier */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                  Passenger Dossier
                </span>
                <button className="font-label-md text-label-md text-primary font-semibold">Change</button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-title-md text-title-md text-on-surface">
                      DV
                    </div>
                    <div>
                      <div className="font-title-md text-title-md text-on-surface">Devraj Vaghela</div>
                      <div className="font-body-sm text-body-sm text-outline">Male, 34 yrs • KYC Verified</div>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-semibold">
                    Berth L14
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-title-md text-title-md text-on-surface">
                      AV
                    </div>
                    <div>
                      <div className="font-title-md text-title-md text-on-surface">Ananya Vaghela</div>
                      <div className="font-body-sm text-body-sm text-outline">Female, 31 yrs • KYC Verified</div>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-semibold">
                    Berth L15
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy Guarantee */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-start gap-space-sm mb-2">
              <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
              <div className="flex-1">
                <span className="font-title-md text-title-md text-on-surface block leading-tight">
                  BharatYatra Assured Guarantee
                </span>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  Full cancellation refund permitted up to 4 hours prior to departure time. Automatic instant UPI reversal to source account.
                </p>
              </div>
            </div>
          </div>

          {/* Persistent Sticky Mobile Bottom Booking Bar */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-lg shadow-[0_-8px_24px_-4px_rgba(20,26,50,0.12)] pb-safe">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-space-md">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="font-body-sm text-body-sm text-secondary font-normal">incl. taxes</span>
                </div>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold">
                  {selectedSeats.length} Berth{selectedSeats.length === 1 ? '' : 's'} Selected
                </span>
              </div>
              <button
                className="flex-1 h-12 rounded-xl bg-primary-container text-on-primary-fixed hover:bg-primary-fixed active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                onClick={proceedToReview}
              >
                <span className="font-label-lg text-label-lg font-bold">Passenger Review</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

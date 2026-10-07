'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';

function ProfilePageContent() {
  const { user, logout, completeProfile } = useAuth();

  // Prototype State Management
  const [activeState, setActiveState] = useState<'default' | 'edit-drawer' | 'signout-modal'>('default');
  const [showEmptyStates, setShowEmptyStates] = useState(false);

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || 'Traveler');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.phoneNumber || '');
  const [dob, setDob] = useState('1994-10-14');

  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
      if (user.phoneNumber) setMobile(user.phoneNumber);
    }
  }, [user]);

  // Travel DNA Toggle states
  const [pacing, setPacing] = useState('Balanced (Active)');
  const [transit, setTransit] = useState('Vande Bharat & Semi-High Speed');
  const [lodge, setLodge] = useState('Royal Desert Glamping');
  const [culinary, setCulinary] = useState<string[]>(['Authentic Kathiyawadi', 'Pure Vegetarian']);

  const toggleCulinary = (item: string) => {
    setCulinary(prev =>
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    );
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await completeProfile(fullName, email);
      setActiveState('default');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile details.');
    }
  };

  const executeSignout = async () => {
    setActiveState('default');
    await logout();
    window.location.href = '/login';
  };


  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* MAIN CONTENT */}
      <main className="w-full bg-surface flex-1">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-10">
          <div className="flex flex-col w-full">

            {/* Prototype Controller */}
            <aside aria-label="Prototype state switcher" className="mb-6 w-full bg-surface-container-low rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider">Prototype State Controller:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveState('default')}
                  className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${activeState === 'default' ? 'bg-on-secondary-fixed text-primary-container shadow-sm' : 'bg-surface text-on-surface-variant hover:text-on-surface'}`}
                >
                  Overview (Default)
                </button>
                <button
                  onClick={() => setActiveState('edit-drawer')}
                  className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${activeState === 'edit-drawer' ? 'bg-on-secondary-fixed text-primary-container shadow-sm' : 'bg-surface text-on-surface-variant hover:text-on-surface'}`}
                >
                  Edit Profile Modal
                </button>
                <button
                  onClick={() => setActiveState('signout-modal')}
                  className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${activeState === 'signout-modal' ? 'bg-on-secondary-fixed text-primary-container shadow-sm' : 'bg-surface text-on-surface-variant hover:text-on-surface'}`}
                >
                  Sign Out Modal
                </button>
                <button
                  onClick={() => setShowEmptyStates(!showEmptyStates)}
                  className={`px-3 py-1 rounded-full font-label-md text-label-md transition-all ${showEmptyStates ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface text-on-surface-variant hover:text-on-surface'}`}
                >
                  {showEmptyStates ? 'Empty States ON' : 'Toggle Empty States'}
                </button>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant font-label-caps text-label-caps uppercase">
                <span className="material-symbols-outlined text-[15px] text-primary">sync</span>
                <span>100% Ground Rules Synced</span>
              </div>
            </aside>

            {/* 2-Column Command Center Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT COLUMN (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">

                {/* PROFILE HEADER CARD */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md ring-4 ring-primary-container/80" alt="Kaushal Patel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD0KTLfdaLSbkbeDVcOEIzzvthu0D229YhofQOleSgCsJRVHktiS65oM76pfcu1hM1HTN0p1y5ss5v-gJUL11dn7xMoxCphijS6B5HEDFs1-unr31duYG6dPltLpY4irzvVVPrYwSZ3F8Bmpiz510whVT2wgd17ZKuX-QPDRljaF1zOr_VOYL9zEUuqNGmuXKCc0yEJVqIFbVuRwrsa0tY3gSi1YpT3xUjDSNJm9hhJSsa0MsMWtmjtQ" />
                        <div className="absolute -bottom-1 -right-1 bg-on-secondary-fixed text-primary-container rounded-full p-1 shadow-sm flex items-center justify-center" title="Identity Verified">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">{fullName}</h1>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-caps text-label-caps uppercase tracking-wider">Voyager Tier 2</span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Travel Explorer • Authentic Subcontinental Expeditions</p>
                        <span className="font-label-md text-label-md text-tertiary mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                          Member since Nov 2024 • Sovereign Verified Identity
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setActiveState('edit-drawer')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-on-secondary-fixed text-surface-container-lowest font-label-lg text-label-lg hover:bg-on-secondary-fixed-variant transition-all shadow-sm">
                      <span className="material-symbols-outlined text-[18px] text-primary-container">edit_square</span>
                      <span>Edit profile</span>
                    </button>
                  </div>
                </section>

                {/* PERSONAL INFORMATION CARD */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Personal information</h2>
                    </div>
                    <button onClick={() => setActiveState('edit-drawer')} className="font-label-md text-label-md text-primary hover:underline">Edit information</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-xl bg-surface-container-low">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Full Legal Name</span>
                      <p className="font-title-md text-title-md text-on-surface font-semibold mt-1">{fullName}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-low">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Privacy-Masked Email</span>
                      <p className="font-title-md text-title-md text-on-surface font-semibold mt-1">{email.replace(/(.{2})(.*)(?=@)/, '$1*******')}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-low">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Mobile Number</span>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-title-md text-title-md text-on-surface font-semibold">+91 {mobile.slice(0, 5)} •••••</p>
                        <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-surface font-label-caps text-label-caps font-semibold">OTP Verified</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-low">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Date of Birth &amp; Age</span>
                      <p className="font-title-md text-title-md text-on-surface font-semibold mt-1">14 Oct 1994 (Age 31)</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-xl bg-surface-container-highest/60 flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0">shield_lock</span>
                    <p className="font-body-sm text-body-sm">Your identity credentials are cryptographically protected under DigiLocker API standards and never shared with unverified commercial third parties.</p>
                  </div>
                </section>

                {/* TRAVEL PREFERENCES (TRAVEL DNA) */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Travel preferences (Travel DNA)</h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span> Powering Farva AI
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">These travel parameters dynamically tune the timetable orchestration, layover duration, and sanctuary bookings on every suggested itinerary.</p>

                  <div className="space-y-4">
                    {/* Pacing */}
                    <div>
                      <label className="font-label-md text-label-md text-on-surface block mb-1.5 font-semibold">Pacing &amp; Exploration Style</label>
                      <div className="flex flex-wrap gap-2">
                        {['Relaxed & Slow', 'Balanced (Active)', 'Rugged Adventure'].map((item) => (
                          <button
                            key={item}
                            onClick={() => setPacing(item)}
                            className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all ${pacing === item ? 'bg-on-secondary-fixed text-primary-container font-semibold shadow-sm flex items-center gap-1' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
                          >
                            {pacing === item && <span className="material-symbols-outlined text-[14px]">check</span>}
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transit */}
                    <div>
                      <label className="font-label-md text-label-md text-on-surface block mb-1.5 font-semibold">Preferred Subcontinental Transit</label>
                      <div className="flex flex-wrap gap-2">
                        {['GSRTC Premium Volvo', 'Vande Bharat & Semi-High Speed', 'Private 4x4 Chauffeur', 'Aviation Charter'].map((item) => (
                          <button
                            key={item}
                            onClick={() => setTransit(item)}
                            className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all ${transit === item ? 'bg-on-secondary-fixed text-primary-container font-semibold shadow-sm flex items-center gap-1' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
                          >
                            {transit === item && <span className="material-symbols-outlined text-[14px]">train</span>}
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lodge */}
                    <div>
                      <label className="font-label-md text-label-md text-on-surface block mb-1.5 font-semibold">Lodge &amp; Hospitality Tier</label>
                      <div className="flex flex-wrap gap-2">
                        {['Heritage Darbargadh Haveli', 'Royal Desert Glamping', 'Eco Sanctuary Villa'].map((item) => (
                          <button
                            key={item}
                            onClick={() => setLodge(item)}
                            className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all ${lodge === item ? 'bg-on-secondary-fixed text-primary-container font-semibold shadow-sm flex items-center gap-1' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
                          >
                            {lodge === item && <span className="material-symbols-outlined text-[14px]">bed</span>}
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Culinary */}
                    <div>
                      <label className="font-label-md text-label-md text-on-surface block mb-1.5 font-semibold">Culinary DNA</label>
                      <div className="flex flex-wrap gap-2">
                        {['Authentic Kathiyawadi', 'Pure Vegetarian', 'Jain Gastronomy', 'Old Bazaar Street Curation'].map((item) => {
                          const isSelected = culinary.includes(item);
                          return (
                            <button
                              key={item}
                              onClick={() => toggleCulinary(item)}
                              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-all ${isSelected ? 'bg-on-secondary-fixed text-primary-container font-semibold shadow-sm flex items-center gap-1' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
                            >
                              {isSelected && <span className="material-symbols-outlined text-[14px]">restaurant</span>}
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* FARVA AI PERSONALIZATION CARD */}
                <section className="bg-on-secondary-fixed rounded-2xl p-6 md:p-8 text-surface-container-lowest relative overflow-hidden shadow-xl">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[24px]">psychology</span>
                        <h2 className="font-title-lg text-title-lg text-surface-container-lowest font-bold">Farva AI knows your travel style</h2>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-label-caps text-label-caps uppercase tracking-wider font-bold">Sync Active</span>
                    </div>
                    <p className="font-body-md text-body-md text-surface-dim">Your adaptive recommendations are continuously synchronized around your travel DNA, saved sanctuaries, and verified seasonal ground telemetry.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[18px] mt-0.5">check_circle</span>
                        <div>
                          <span className="font-label-md text-label-md text-surface-container-lowest font-semibold">Target Sanctuaries</span>
                          <p className="font-body-sm text-body-sm text-surface-dim">Kutch White Rann &amp; Saurashtra Coast</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[18px] mt-0.5">check_circle</span>
                        <div>
                          <span className="font-label-md text-label-md text-surface-container-lowest font-semibold">Thermal Avoidance</span>
                          <p className="font-body-sm text-body-sm text-surface-dim">Automated midday indoor layovers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[18px] mt-0.5">check_circle</span>
                        <div>
                          <span className="font-label-md text-label-md text-surface-container-lowest font-semibold">Transit Calibration</span>
                          <p className="font-body-sm text-body-sm text-surface-dim">High-speed rail over road when &gt; 4 hrs</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary-container text-[18px] mt-0.5">check_circle</span>
                        <div>
                          <span className="font-label-md text-label-md text-surface-container-lowest font-semibold">Heritage Filter</span>
                          <p className="font-body-sm text-body-sm text-surface-dim">Centenary architecture &amp; courtyard lodgings</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                      <button className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold hover:bg-primary-fixed-dim transition-all shadow-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">neurology</span>
                        <span>Manage AI telemetry parameters</span>
                      </button>
                      <span className="font-label-caps text-label-caps text-surface-dim uppercase tracking-wider font-semibold">Engine: Farva Llama-Travel 3.2</span>
                    </div>
                  </div>
                </section>

                {/* SAVED PLACES SECTION */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Saved places ({showEmptyStates ? '0' : '4'} Sanctuaries)</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Curated destinations bookmarked for fast multi-modal itinerary assembly.</p>
                    </div>
                    <Link className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 font-semibold" href="/explore">
                      <span>View all in map</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>

                  {!showEmptyStates ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Card 1: Kutch */}
                      <div className="group rounded-xl overflow-hidden bg-surface-container-low hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-36 w-full overflow-hidden">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Great Rann of Kutch" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbp6xtqsoTAzS6J1C256en1v0D25sc0QopJmZjQI4d1cH_nALcUBM_npo0730U2xzeeBXJbJCe9Ztk5vYVKNDjpH46fUQlRzXkDp_ZfWl6y-n7ig2UEoIVJj4F_jvfy03lKmRrpo0z33XcjUHNuL8NkL-yFHUuvcuN_Jq8bONOzVuHIQTeU-jOtnTvuYBVWUGFnGYnb-ke3wjNkatWCe9pHfPqPmcjqgWk8lTm7qxLNzaZV5e5fDa_og" />
                          <span className="absolute top-2 right-2 bg-on-secondary-fixed/80 backdrop-blur-md text-primary-container p-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">bookmark</span>
                          </span>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-on-secondary-fixed/90 text-surface-container-lowest font-label-caps text-label-caps uppercase font-bold">Full Moon Expedition</span>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="font-title-md text-title-md text-on-surface font-bold">Great Rann of Kutch</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Dhordo White Salt Flats • Kutch</p>
                          </div>
                          <div className="pt-3 flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">wb_twilight</span> Best Nov - Feb</span>
                            <span className="text-primary font-semibold">Explore →</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Gir Lion */}
                      <div className="group rounded-xl overflow-hidden bg-surface-container-low hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-36 w-full overflow-hidden">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Gir Lion" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_avjzlO9JJiJWmpf1wXQmJkbQK5MpZSIhqX6__pcmQpy-APp-QulFZ7ClPiipozhzS9-NdTSa3NBfxNpfF0_WvaKT9fitMSuCFw-TIelQ8CB_4Fp6jbV23DnyjJ3wvPn2BFYtTCU-npAjE3KzN8DgdQnpdVyiJUwxzA2xdmIOI4x-wQ6HjAx0Kvdq22KOvQGDVvn3t3BSHjfjJ4EK9h3NIGmKqJPIqf9DWIkK3IG9X5TToXTW-vLXVA" />
                          <span className="absolute top-2 right-2 bg-on-secondary-fixed/80 backdrop-blur-md text-primary-container p-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">bookmark</span>
                          </span>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-on-secondary-fixed/90 text-surface-container-lowest font-label-caps text-label-caps uppercase font-bold">Zone 04 Morning Gypsy</span>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="font-title-md text-title-md text-on-surface font-bold">Gir Asiatic Sanctuary</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Sasan Gir Reserve • Junagadh</p>
                          </div>
                          <div className="pt-3 flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">forest</span> Permit Synced</span>
                            <span className="text-primary font-semibold">Explore →</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Dwarka */}
                      <div className="group rounded-xl overflow-hidden bg-surface-container-low hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-36 w-full overflow-hidden">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Dwarkadhish" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeCCgq1i8Dm3u2awQc8a_uOMDGwZ5hqmQ54RPuNMBNQ_G9I73NH57Mieo1Z47x9HaojH0UGQinkBASB7INQ1N92QsaLkmRpPoazkIAW8JJX9hPkKjnmFfhQ4dSWNkZcDWuHGczC8agsgc_3xn71en32x5CsJqT-dlRhudEAEhmjjr-zpjPcIa5K2UfDn-wiePoQx9e35kCdKPbbcyMl2Ane-3ysvRFBM1dMiw-BOCh_B08d83ybfGF5g" />
                          <span className="absolute top-2 right-2 bg-on-secondary-fixed/80 backdrop-blur-md text-primary-container p-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">bookmark</span>
                          </span>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-on-secondary-fixed/90 text-surface-container-lowest font-label-caps text-label-caps uppercase font-bold">Aarti Corridor</span>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="font-title-md text-title-md text-on-surface font-bold">Dwarkadhish Sacred Coast</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Dwarka • Arabian Sea Shoreline</p>
                          </div>
                          <div className="pt-3 flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">temple_hindu</span> Evening Aarti</span>
                            <span className="text-primary font-semibold">Explore →</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: Saputara */}
                      <div className="group rounded-xl overflow-hidden bg-surface-container-low hover:shadow-md transition-all flex flex-col">
                        <div className="relative h-36 w-full overflow-hidden">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Saputara" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAONdXWOxU8DKvNRthJQNR3RDArTrF_Z_bRiff0Be_A24BwP0STbXCjorDNEGXgVzErgCuHcuOBQ1v6geovCUsTHHLFYjr9542KjJcbJxwDdhPKJawMz_wCbH_4IBZDhSpZqUsZ34OYiGz-9yi4UA2nbRPbFpnbBBWu83jQmQZOZJl1vxQlKYh07xpGTyCz_L4TpFkr-XpAzzBaW7GU4tz-V_etKe5wCNIWzMf1v2IUiSp7icWwrUFodg" />
                          <span className="absolute top-2 right-2 bg-on-secondary-fixed/80 backdrop-blur-md text-primary-container p-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">bookmark</span>
                          </span>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-on-secondary-fixed/90 text-surface-container-lowest font-label-caps text-label-caps uppercase font-bold">Monsoon Forest</span>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="font-title-md text-title-md text-on-surface font-bold">Saputara Highlands</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Dang District • Sahyadri Range</p>
                          </div>
                          <div className="pt-3 flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">water_drop</span> Tribal Craft Trail</span>
                            <span className="text-primary font-semibold">Explore →</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 rounded-xl bg-surface-container-low text-center flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-outline-variant text-[48px] mb-2">bookmark_border</span>
                      <h3 className="font-title-md text-title-md text-on-surface font-bold">No saved sanctuaries yet</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1 mb-4">Tap the sovereign bookmark icon while exploring royal desert camps, heritage palaces, or coastal havelis to build your wishlist.</p>
                      <Link className="px-4 py-2 rounded-xl bg-on-secondary-fixed text-primary-container font-label-md text-label-md font-bold" href="/explore">Discover curated journeys</Link>
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT SIDEBAR COLUMN (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6 min-w-0">

                {/* GROUP EXPENSE SPLITTER DASHBOARD WIDGET */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-amber-500/30 text-white shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold shrink-0">
                        <span className="material-symbols-outlined text-[22px]">calculate</span>
                      </span>
                      <div>
                        <h3 className="font-title-md text-title-md font-bold text-white">Group Expense Splitter</h3>
                        <p className="text-xs text-slate-300">Split hotels, dining, fuel & transport instantly</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                    <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">payments</span> 1-Click UPI Settlement
                    </span>
                    <Link
                      href="/expenses"
                      className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all shadow"
                    >
                      Launch Splitter →
                    </Link>
                  </div>
                </section>

                {/* TRAVEL STATISTICS COMPACT GRID */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3">
                    <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Subcontinent Ledger</h2>
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold">Verified Metrics</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-bold">12</span>
                      <span className="font-label-md text-label-md text-on-surface-variant mt-0.5">Trips Completed</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-bold">28</span>
                      <span className="font-label-md text-label-md text-on-surface-variant mt-0.5">Total Bookings Synced</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-primary font-bold">7/8</span>
                      <span className="font-label-md text-label-md text-on-surface-variant mt-0.5">Gujarat Zones Explored</span>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-low flex flex-col">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-bold">18</span>
                      <span className="font-label-md text-label-md text-on-surface-variant mt-0.5">Artisanal Masterclasses</span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 px-4 rounded-xl bg-primary-container/25 flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">route</span>
                      4,120 km traversed across sovereign routes
                    </span>
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  </div>
                </section>

                {/* PROFILE COMPLETION PROGRESS CARD */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-title-md text-title-md text-on-surface font-bold">Travel profile completion</h2>
                    <span className="font-label-md text-label-md text-primary font-bold">75% complete</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full transition-all duration-700" style={{ width: '75%' }}></div>
                  </div>
                  <ul className="space-y-1 mb-4">
                    <li className="flex items-center justify-between text-on-surface font-body-sm text-body-sm p-2 rounded-lg bg-surface-container-low">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Basic identity &amp; name
                      </span>
                      <span className="font-label-caps text-label-caps uppercase text-primary font-bold">Done</span>
                    </li>
                    <li className="flex items-center justify-between text-on-surface font-body-sm text-body-sm p-2 rounded-lg bg-surface-container-low">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Travel preferences &amp; DNA
                      </span>
                      <span className="font-label-caps text-label-caps uppercase text-primary font-bold">Done</span>
                    </li>
                    <li className="flex items-center justify-between text-on-surface font-body-sm text-body-sm p-2 rounded-lg bg-surface-container-low">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span> Verified mobile &amp; email
                      </span>
                      <span className="font-label-caps text-label-caps uppercase text-primary font-bold">Done</span>
                    </li>
                    <li className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm p-2 rounded-lg">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-outline">radio_button_unchecked</span> Emergency Ground SOS Contact
                      </span>
                      <span className="font-label-caps text-label-caps uppercase text-error font-bold">Pending</span>
                    </li>
                    <li className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm p-2 rounded-lg">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-outline">radio_button_unchecked</span> Co-traveler DigiLocker link
                      </span>
                      <span className="font-label-caps text-label-caps uppercase text-error font-bold">Pending</span>
                    </li>
                  </ul>
                  <button onClick={() => setActiveState('edit-drawer')} className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-highest transition-all flex items-center justify-center gap-1.5">
                    <span>Complete remaining 25%</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </section>

                {/* PAYMENTS & BILLING CARD */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-1">
                    <h2 className="font-title-md text-title-md text-on-surface font-bold">Payments &amp; billing</h2>
                    <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">Bank-grade vaulted instruments &amp; direct GSTIN tax invoices.</p>
                  
                  {!showEmptyStates ? (
                    <div className="divide-y divide-surface-container-high">
                      <div className="py-2.5 flex items-center justify-between hover:bg-surface-container-low px-2 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">credit_card</span>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface font-semibold">Saved Methods</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">UPI (GPay / PhonePe) &amp; 2 Cards</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                      </div>
                      <div className="py-2.5 flex items-center justify-between hover:bg-surface-container-low px-2 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface font-semibold">Past Invoices &amp; GST</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">12 tax compliant billing records</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                      </div>
                      <div className="py-2.5 flex items-center justify-between hover:bg-surface-container-low px-2 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">domain</span>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface font-semibold">Corporate GSTIN</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">24AAACC1206K1ZV (Input Synced)</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="font-body-sm text-body-sm text-on-surface-variant">No payment credentials vaulted yet.</p>
                      <button className="mt-2 px-4 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold">Add Payment Method</button>
                    </div>
                  )}
                </section>

                {/* TRAVEL DOCUMENTS & IDENTITY VAULT */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-1">
                    <h2 className="font-title-md text-title-md text-on-surface font-bold">Identity &amp; Traveler Manifest</h2>
                    <span className="material-symbols-outlined text-primary text-[20px]">encrypted</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">Zero plaintext storage. Sovereign AES-256 travel credentials.</p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Companions (2 Manifested)</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Devraj Patel, Ananya Desai</p>
                        </div>
                      </div>
                      <button className="font-label-md text-label-md text-primary hover:underline font-semibold">Manage</button>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">fingerprint</span>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Aadhaar / DigiLocker</span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">Synced ••••••••4912</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-surface font-label-caps text-label-caps font-semibold">Active</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-[18px]">emergency</span>
                        <div>
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Emergency SOS Contact</span>
                          <p className="font-body-sm text-body-sm text-error font-medium">Unassigned</p>
                        </div>
                      </div>
                      <button className="font-label-md text-label-md text-primary hover:underline font-semibold">+ Assign</button>
                    </div>
                  </div>
                </section>

                {/* NOTIFICATIONS & TELEMETRY TOGGLES */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                  <h2 className="font-title-md text-title-md text-on-surface font-bold mb-3">Telemetry &amp; Alerts</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold">Live Route Re-routing</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Weather and highway updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-on-secondary-fixed"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold">Booking &amp; PNR Alerts</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Gate, coach &amp; check-in alerts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-on-secondary-fixed"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-semibold">Safari &amp; Temple Aarti Times</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Morning slot countdown cues</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-on-secondary-fixed"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* SECURITY & SOVEREIGN CONCIERGE */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-4">
                  <div>
                    <h2 className="font-title-md text-title-md text-on-surface font-bold mb-2">Language &amp; Currency</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
                        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Language</span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold mt-0.5">English (English/ગુજરાતી)</span>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container-low flex flex-col">
                        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Currency</span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold mt-0.5">INR (₹) Indian Rupee</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-container-high/60">
                    <h2 className="font-title-md text-title-md text-on-surface font-bold mb-2">Account Security</h2>
                    <div className="space-y-1.5 font-label-md text-label-md text-on-surface">
                      <div className="flex items-center justify-between py-1">
                        <span>Two-step Verification</span>
                        <span className="text-primary font-bold">Enabled (Authenticator App)</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Active Sessions</span>
                        <span className="text-on-surface-variant">2 devices (MacBook Pro, iPhone 16)</span>
                      </div>
                    </div>
                  </div>

                  {/* 24/7 Sovereign Desk CTA */}
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold">24/7 Sovereign Assistance</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Connect with our dedicated Saurashtra &amp; Kutch concierge desk for live road assist.</p>
                    <a className="w-full py-2.5 rounded-lg bg-on-secondary-fixed text-primary-container font-label-md text-label-md text-center font-bold hover:bg-on-secondary-fixed-variant transition-all shadow-sm" href="tel:18002031111">Call Concierge: 1800 203 1111</a>
                  </div>

                  {/* Account Actions */}
                  <div className="pt-2 flex items-center justify-between text-body-sm">
                    <button onClick={() => setActiveState('signout-modal')} className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 font-label-md text-label-md font-semibold">
                      <span className="material-symbols-outlined text-[16px]">logout</span> Sign out
                    </button>
                    <button onClick={() => alert('To request irreversible profile deletion under GDPR/DPDP Act 2023, please contact sovereign@chalofarva.in')} className="text-error hover:underline text-label-md font-label-md font-semibold">
                      Delete travel account
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {/* MODAL 1: EDIT PROFILE DRAWER */}
            {activeState === 'edit-drawer' && (
              <div className="fixed inset-0 z-50 bg-on-secondary-fixed/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="p-6 bg-surface-container-low flex items-center justify-between border-b border-surface-container-high/60">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">manage_accounts</span>
                      <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Edit Profile &amp; Identity</h3>
                    </div>
                    <button onClick={() => setActiveState('default')} className="p-1 rounded-full text-on-surface-variant hover:text-on-surface">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                  <form className="p-6 flex flex-col gap-4" onSubmit={handleProfileSave}>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">Full Legal Name</label>
                      <input className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">Email Address</label>
                      <input className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">Mobile (+91)</label>
                        <input className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                      </div>
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">Date of Birth</label>
                        <input className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-high/50 text-on-surface-variant font-body-sm text-body-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                      Updates will re-synchronize live rail and flight booking manifests.
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button onClick={() => setActiveState('default')} className="px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container transition-all" type="button">Cancel</button>
                      <button className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold shadow-sm hover:bg-primary-fixed-dim transition-all" type="submit">Save changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 2: SIGN OUT CONFIRMATION */}
            {activeState === 'signout-modal' && (
              <div className="fixed inset-0 z-50 bg-on-secondary-fixed/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-3 text-error">
                    <div className="w-10 h-10 rounded-full bg-error-container/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px] text-error">logout</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Sign out of BharatYatra?</h3>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">You can sign back in anytime to access your active Gujarat itineraries, live safari permits, and haveli bookings.</p>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button onClick={() => setActiveState('default')} className="px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container transition-all">Stay signed in</button>
                    <button onClick={executeSignout} className="px-4 py-2.5 rounded-xl bg-on-secondary-fixed text-primary-container font-label-lg text-label-lg font-bold hover:bg-on-secondary-fixed-variant transition-all">Sign out</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low shadow-[0_-1px_8px_rgba(20,26,50,0.04)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="flex flex-col gap-1">
              <span className="font-title-md text-title-md text-on-surface font-bold">BharatYatra Checkout</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Unified multi-service sovereign payment gateway. Curated expeditions, royal heritage lodges, and aviation charter booking.</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">Compliance &amp; GST</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">GSTIN: 24AAACC1206K1ZV • Direct GST input tax credit pass-through active for domestic enterprise bookings.</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">Policies</span>
              <div className="flex flex-col gap-1">
                <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface" href="/privacy">Cancellation &amp; Refund Matrix</Link>
                <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface" href="/terms">Travel Protection &amp; Sovereign Guarantee</Link>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">Emergency Support</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">24/7 Sovereign Assistance: 1800 203 1111</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Email: sovereign@chalofarva.in</p>
            </div>
          </div>
          <div className="pt-4 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="font-body-sm text-body-sm text-on-surface-variant">© 2026 BharatYatra Luxury Travel Intelligence Pvt Ltd. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">Bank-Grade TLS 1.3</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">PCI-DSS Level 1</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">IATA Accredited</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';

export default function ExperiencesPage() {
  const { user, logout } = useAuth();
  const [protoState, setProtoState] = useState<'results' | 'dossier' | 'conflict' | 'handoff' | 'fallback'>('results');
  const [destination, setDestination] = useState('Kutch (Dhordo & Nirona)');
  const [modalExpName, setModalExpName] = useState('Rogan Art Masterclass with National Awardee');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addTripText, setAddTripText] = useState('Add to Day 2 Itinerary ✨');
  const [isTripAdded, setIsTripAdded] = useState(false);

  const handleStateChange = (state: 'results' | 'dossier' | 'conflict' | 'handoff' | 'fallback') => {
    setProtoState(state);
  };

  const openReservationModal = (expName: string) => {
    setModalExpName(expName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const confirmReservation = () => {
    setIsModalOpen(false);
    setProtoState('handoff');
  };

  const handleAddToItinerary = () => {
    setIsTripAdded(true);
    setAddTripText('Added to Day 2!');
    setTimeout(() => {
      setIsTripAdded(false);
      setAddTripText('Add to Day 2 Itinerary ✨');
    }, 3000);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
      />

      <div className="bg-[#f8f9ff] font-['Inter',sans-serif] text-[15px] text-[#0b1c30] antialiased selection:bg-[#fed65b] selection:text-[#745c00] min-h-screen">
        


        <main className="w-full pt-4 bg-[#f8f9ff] min-h-screen">
          <div className="flex flex-col w-full">
            
            {/* 1. TOP PROTOTYPE INTERACTIVE MODE PILL BAR */}
            <aside aria-label="Prototype View Controller" className="w-full bg-[#dce9ff]/80 backdrop-blur-md px-6 py-2.5 font-['Outfit']">
              <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#735c00] text-base">tune</span>
                  <span className="text-[11px] uppercase tracking-widest text-[#4d4635] font-bold">Prototype State Machine</span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5" id="proto-toggles">
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1 transition-all ${
                      protoState === 'results' ? 'bg-[#141a32] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                    onClick={() => handleStateChange('results')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fed65b] animate-ping"></span>
                    Curated Results
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all ${
                      protoState === 'dossier' ? 'bg-[#141a32] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                    onClick={() => handleStateChange('dossier')}
                  >
                    Experience Dossier &amp; Schedule
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all ${
                      protoState === 'conflict' ? 'bg-[#141a32] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                    onClick={() => handleStateChange('conflict')}
                  >
                    Schedule Conflict &amp; AI Adaptation
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all ${
                      protoState === 'handoff' ? 'bg-[#141a32] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                    onClick={() => handleStateChange('handoff')}
                  >
                    Partner Booking Handoff
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all ${
                      protoState === 'fallback' ? 'bg-[#141a32] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                    onClick={() => handleStateChange('fallback')}
                  >
                    No Matches Found
                  </button>
                </div>
              </div>
            </aside>

            {/* 2. HERO SEARCH SECTION */}
            <section className="relative w-full bg-white px-6 pt-10 pb-10 overflow-hidden font-['Outfit']">
              <div className="absolute -top-32 right-12 w-96 h-96 rounded-full bg-[#fed65b]/20 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 left-10 w-80 h-80 rounded-full bg-[#ced9ff]/30 blur-3xl pointer-events-none"></div>

              <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e5eeff] text-[#4d4635] text-[11px] uppercase tracking-widest font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#735c00]"></span>
                      IMMERSIVE GUJARAT HERITAGE &amp; ADVENTURE // VERIFIED GROUND CURATION
                    </div>
                    <h1 className="text-[40px] leading-[48px] font-bold text-[#213145] tracking-tight">
                      Experience Gujarat Beyond the Map
                    </h1>
                    <p className="font-['Inter'] text-[18px] leading-[28px] text-[#575d79]">
                      Meet the people, places, flavours and adventures that make every journey unforgettable — precision-synchronized with your travel schedule.
                    </p>
                  </div>

                  <div className="hidden lg:flex items-center gap-4 p-3 rounded-2xl bg-[#eff4ff] shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[#735c00] text-2xl">explore</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79]">Ground-Verified Curations</span>
                      <span className="text-[18px] font-bold text-[#213145]">95+ Sovereign Experiences</span>
                    </div>
                  </div>
                </div>

                {/* Search Console */}
                <div className="w-full p-4 rounded-2xl bg-[#eff4ff] shadow-md flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                    <div className="bg-white p-3 rounded-xl shadow-xs flex flex-col justify-center">
                      <label className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[#735c00] text-sm">location_on</span>
                        Destination Sanctuary
                      </label>
                      <input
                        className="w-full font-bold text-[16px] text-[#213145] bg-transparent outline-none focus:text-[#735c00]"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-xs flex flex-col justify-center">
                      <label className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[#735c00] text-sm">calendar_month</span>
                        Experience Date
                      </label>
                      <div className="font-bold text-[16px] text-[#213145] flex items-center justify-between cursor-pointer">
                        <span>24 Dec 2026</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fed65b]/30 text-[#574500]">Winter Peak</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-xs flex flex-col justify-center">
                      <label className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[#735c00] text-sm">group</span>
                        Travellers &amp; Format
                      </label>
                      <div className="font-bold text-[16px] text-[#213145] flex items-center justify-between">
                        <span>4 Travellers · Family Setup</span>
                        <span className="material-symbols-outlined text-[#575d79] text-xl">expand_more</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-xs flex flex-col justify-center">
                      <label className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[#735c00] text-sm">category</span>
                        Archetype Category
                      </label>
                      <div className="font-bold text-[16px] text-[#213145] flex items-center justify-between">
                        <span>All Experiences</span>
                        <span className="material-symbols-outlined text-[#575d79] text-xl">expand_more</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] uppercase text-[#575d79] font-bold tracking-wider mr-1">Sanctuary Hubs:</span>
                      {[
                        'Kutch (Dhordo & Nirona)',
                        'Sasan Gir Forest',
                        'Ahmedabad Heritage Pol',
                        'Somnath Coast',
                        'Dwarka & Bet Dwarka',
                        'Saputara Hills',
                        'Diu Coastal Cliffs'
                      ].map((hub) => (
                        <button
                          key={hub}
                          className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all ${
                            destination === hub
                              ? 'bg-[#213145] text-[#fed65b] font-bold shadow-xs'
                              : 'bg-white text-[#575d79] hover:bg-[#e5eeff] hover:text-[#0b1c30] shadow-xs'
                          }`}
                          onClick={() => setDestination(hub)}
                        >
                          {hub.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    <button
                      className="px-6 py-3 rounded-xl bg-[#fed65b] text-[#213145] font-bold text-[14px] shadow-[0_0_20px_-2px_rgba(254,214,91,0.4)] hover:shadow-[0_0_28px_2px_rgba(254,214,91,0.6)] transition-all flex items-center justify-center gap-1 shrink-0"
                      onClick={() => handleStateChange('results')}
                    >
                      <span className="material-symbols-outlined text-xl">travel_explore</span>
                      <span>Explore Experiences</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. CATEGORY QUICK SHORTCUTS */}
            <section className="w-full bg-[#f8f9ff] px-6 py-4 font-['Outfit']">
              <div className="max-w-[1440px] mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#575d79] font-bold">Curated Experience Categories</span>
                  <span className="text-[12px] text-[#735c00] font-semibold cursor-pointer hover:underline">Browse Heritage Index</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { title: 'Arts & Crafts', icon: 'palette', active: true },
                    { title: 'Wildlife & Safari', icon: 'pets', active: false },
                    { title: 'Heritage & Culture', icon: 'castle', active: false },
                    { title: 'Food & Culinary', icon: 'restaurant', active: false },
                    { title: 'Adventure', icon: 'hiking', active: false },
                    { title: 'Spiritual', icon: 'temple_hindu', active: false },
                    { title: 'Beaches & Coastal', icon: 'sailing', active: false },
                    { title: 'Nature & Outdoors', icon: 'forest', active: false },
                    { title: 'Family Experiences', icon: 'family_restroom', active: false },
                    { title: 'Local Living', icon: 'cottage', active: false }
                  ].map((cat, idx) => (
                    <button
                      key={idx}
                      className={`shrink-0 flex items-center gap-1 px-4 py-2.5 rounded-full text-[12px] transition-all ${
                        cat.active ? 'bg-[#213145] text-[#fed65b] font-bold shadow-sm' : 'bg-white text-[#4d4635] hover:bg-[#dce9ff] hover:text-[#0b1c30] shadow-xs'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{cat.icon}</span>
                      <span>{cat.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. CONTEXTUAL AI EXPERIENCE PICK BANNER */}
            <section className="w-full bg-[#f8f9ff] px-6 py-2 font-['Outfit']">
              <div className="max-w-[1440px] mx-auto">
                <div className="relative rounded-2xl bg-gradient-to-r from-[#213145] via-[#213145] to-[#1C2442] text-white p-6 shadow-xl overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#fed65b]/15 blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-1 max-w-3xl">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-[#fed65b] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#fed65b] animate-pulse"></span>
                        ✨ BHARAT YATRA AI PICK // SYNCHRONIZED WITH DAY 2 ITINERARY
                      </div>
                      <h2 className="text-[22px] font-bold text-white">Day 2 in Nirona: Master Rogan Art Fabric Craft Workshop</h2>
                      <p className="font-['Inter'] text-[15px] leading-relaxed text-[#dce9ff]">
                        On your <strong className="text-[#fed65b] font-semibold">Royal Gujarat Discovery trip (Dec 24–29)</strong>, your route passes directly through Nirona village en route from Bhuj to Dhordo. 98% itinerary match. Meeting with 8th-generation national awardee artisan for a private castor oil stylus painting session with zero detour.
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] text-[#bac6ed]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#fed65b] text-base">schedule</span>
                          <span>Duration: <strong className="text-white">2.5 Hours</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#fed65b] text-base">group</span>
                          <span>Group: <strong className="text-white">Private Family</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#fed65b] text-base">route</span>
                          <span>Route Detour: <strong className="text-[#fed65b]">0 km</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#fed65b] text-base">verified_user</span>
                          <span className="text-[#fed65b] font-bold">Authentic Guild Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 shrink-0 w-full lg:w-auto">
                      <button
                        className="px-4 py-3 rounded-xl bg-[#fed65b] text-[#213145] font-bold text-[14px] shadow-[0_0_20px_-2px_rgba(254,214,91,0.3)] hover:shadow-[0_0_25px_rgba(254,214,91,0.5)] transition-all text-center"
                        onClick={() => openReservationModal('Rogan Art Masterclass with National Awardee')}
                      >
                        View AI Recommendation
                      </button>
                      <button
                        className={`px-4 py-3 rounded-xl text-white font-semibold backdrop-blur-md transition-all text-center flex items-center justify-center gap-1.5 text-[14px] ${
                          isTripAdded ? 'bg-emerald-900/80' : 'bg-white/10 hover:bg-white/20'
                        }`}
                        onClick={handleAddToItinerary}
                      >
                        <span className="material-symbols-outlined text-lg text-[#fed65b]">
                          {isTripAdded ? 'check_circle' : 'bookmark_add'}
                        </span>
                        <span>{addTripText}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. ROUTE-AWARE FOOD DISCOVERY BAR */}
            <section className="w-full bg-[#f8f9ff] px-6 py-2 font-['Outfit']">
              <div className="max-w-[1440px] mx-auto p-4 rounded-2xl bg-white shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#735c00] text-xl">route</span>
                    <span className="text-[18px] font-bold text-[#213145]">Experiences Along Your Active Transit Corridor</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#575d79]">Synchronized with Royal Gujarat Discovery Route</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { leg: 'Leg 1: UNESCO', city: 'Ahmedabad', desc: 'Pol Heritage Walk', active: false },
                    { leg: 'Leg 2: Oasis', city: 'Bhuj', desc: 'Aina Mahal & Silver Craft', active: false },
                    { leg: 'Leg 3: Active Waypoint', city: 'Kutch & Nirona', desc: 'Rogan Art & Salt Sunset Walk', active: true },
                    { leg: 'Leg 4: Girnar', city: 'Junagadh', desc: 'Stepwell & Nawabi Palace', active: false },
                    { leg: 'Leg 5: Forest', city: 'Sasan Gir', desc: 'Asiatic Lion Dawn Safari', active: false },
                    { leg: 'Leg 6: Coastal', city: 'Somnath', desc: 'Arabian Sea Aarti & Light Show', active: false },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 shrink-0">
                      <div
                        onClick={() => setDestination(`${step.city} (Sovereign Circuit)`)}
                        className={`flex flex-col p-2.5 rounded-xl cursor-pointer transition-all ${
                          step.active
                            ? 'bg-[#213145] text-[#fed65b] shadow-md min-w-[210px]'
                            : 'bg-[#eff4ff] text-[#0b1c30] min-w-[170px] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] uppercase font-bold">
                          <span className="flex items-center gap-1">
                            {step.active && <span className="w-2 h-2 rounded-full bg-[#fed65b] animate-pulse"></span>}
                            {step.leg}
                          </span>
                          {step.active && <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px]">Day 2</span>}
                        </div>
                        <span className={`text-[16px] font-bold ${step.active ? 'text-white' : 'text-[#0b1c30]'}`}>{step.city}</span>
                        <span className={`text-[11px] ${step.active ? 'text-[#fed65b]/90' : 'text-[#575d79]'}`}>{step.desc}</span>
                      </div>
                      {idx < 5 && <span className="material-symbols-outlined text-[#575d79] text-xl">trending_flat</span>}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. MAIN CONTENT LAYOUT */}
            <section className="w-full bg-[#f8f9ff] px-6 py-6 font-['Outfit']">
              <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: FILTERS */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                  <div className="p-4 rounded-2xl bg-white shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#735c00] text-xl">tune</span>
                        <span className="text-[18px] font-bold text-[#213145]">Refine Activities</span>
                      </div>
                      <button className="text-[12px] text-[#735c00] hover:underline font-semibold" onClick={() => handleStateChange('results')}>Clear All</button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Duration</span>
                      <div className="space-y-2 font-['Inter'] text-[13px]">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#0b1c30]">Under 2 Hours</span>
                          <span className="text-[11px] font-['Outfit'] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#575d79]">18</span>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="font-bold text-[#213145] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#735c00]"></span> 2–4 Hours (Optimal)
                          </span>
                          <span className="text-[11px] font-['Outfit'] px-1.5 py-0.5 rounded-full bg-[#fed65b] text-[#574500] font-bold">24</span>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#0b1c30]">Half Day (4–6 Hrs)</span>
                          <span className="text-[11px] font-['Outfit'] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#575d79]">14</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Group Size &amp; Format</span>
                      <div className="space-y-2 font-['Inter'] text-[13px]">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input defaultChecked className="w-4 h-4 rounded text-[#213145] accent-[#fed65b]" type="checkbox" />
                          <span className="font-semibold text-[#0b1c30]">Private Family Session</span>
                          <span className="ml-auto font-['Outfit'] text-[11px] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#575d79]">12</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input defaultChecked className="w-4 h-4 rounded text-[#213145] accent-[#fed65b]" type="checkbox" />
                          <span className="font-semibold text-[#0b1c30]">Small Curated Group (&lt;8)</span>
                          <span className="ml-auto font-['Outfit'] text-[11px] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#575d79]">28</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Experience Archetype</span>
                      <div className="space-y-2 font-['Inter'] text-[13px]">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="font-semibold text-[#0b1c30]">Heritage &amp; Living Craft</span>
                          <span className="font-['Outfit'] text-[11px] text-[#575d79]">32</span>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#0b1c30]">Wildlife Safari &amp; Tracking</span>
                          <span className="font-['Outfit'] text-[11px] text-[#575d79]">14</span>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#0b1c30]">Culinary &amp; Rasoi Masterclass</span>
                          <span className="font-['Outfit'] text-[11px] text-[#575d79]">16</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Timing &amp; Sun Angle</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[12px] bg-[#e5eeff] text-[#575d79] cursor-pointer">Morning Sunrise</span>
                        <span className="px-2.5 py-1 rounded-full text-[12px] bg-[#213145] text-[#fed65b] font-semibold cursor-pointer">Sunset Golden Hour</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Instruction Language</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-[#e5eeff] text-[11px] font-semibold text-[#0b1c30]">Gujarati</span>
                        <span className="px-2 py-0.5 rounded bg-[#e5eeff] text-[11px] font-semibold text-[#0b1c30]">Hindi</span>
                        <span className="px-2 py-0.5 rounded bg-[#213145] text-[#fed65b] text-[11px] font-bold">English</span>
                        <span className="px-2 py-0.5 rounded bg-[#e5eeff] text-[11px] font-semibold text-[#0b1c30]">Kutchi</span>
                      </div>
                    </div>
                  </div>

                  {/* SPECIAL CARD */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#eff4ff] to-[#e5eeff] shadow-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#fed65b]/30 text-[#574500]">
                        <span className="material-symbols-outlined text-lg">support_agent</span>
                      </div>
                      <div>
                        <div className="text-[16px] font-bold text-[#213145]">Sovereign Artisan Guild</div>
                        <div className="text-[11px] text-[#735c00] font-semibold uppercase">Direct Master Access</div>
                      </div>
                    </div>
                    <p className="font-['Inter'] text-[13px] text-[#575d79] pt-1">
                      Direct liaison with national awardee artisan guilds for private collector viewings and bespoke village residences.
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#213145]">+91 1800 203 1111</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#fed65b] text-[#574500] text-[11px] font-bold">Guild Desk</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: RESULTS MATRIX */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                  
                  {/* Results Header */}
                  <div className="p-3 rounded-2xl bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[18px] font-bold text-[#213145]">Curated Experiences in Kutch &amp; Saurashtra</span>
                      <span className="text-[11px] text-[#575d79] uppercase ml-2 tracking-wider">36 Verified Sanctuaries</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] uppercase text-[#575d79] font-bold">Sort By:</span>
                      <select className="px-3 py-1.5 rounded-xl bg-[#eff4ff] text-[12px] text-[#213145] font-semibold outline-none">
                        <option>✨ Farva AI Match (Recommended)</option>
                        <option>National Awardee / Heritage Priority</option>
                        <option>Itinerary Synchronization</option>
                        <option>Duration: Low to High</option>
                      </select>
                    </div>
                  </div>

                  {/* RESULTS MATRIX VIEW */}
                  {protoState === 'results' && (
                    <div className="space-y-4" id="results-container">
                      
                      {/* EXPERIENCE 1: ROGAN ART */}
                      <div className="group relative rounded-2xl bg-white shadow-md hover:shadow-xl hover:shadow-[#fed65b]/10 transition-all overflow-hidden flex flex-col md:flex-row">
                        <div className="relative md:w-5/12 h-64 md:h-auto overflow-hidden shrink-0">
                          <img
                            alt="Rogan Art Painting"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBoJNfmnJIDPy2QmuWqLFx89h0YxoYaU5mf7NEhufGLJWTs4031jKPTi3CN3b1Xu614JoeePvKhnG2HL3TL4mJx9TWnw1CmEp8vhjR58s4Uq2MddG_2Rvj6OOIjbYnEJpxKVwL2YP8vNHGcB-cn3mAaJaPfBynAPQLs0eLoo16RzjPt44IwKnyB7ZwpeukEljMkRrYPgz33c-a5PpPsSnidhYepPLQBHRZjMzI3bHii-K6XN6tpq7QKQ"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#213145]/80 via-transparent to-black/20"></div>
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#213145]/90 backdrop-blur-md text-[#fed65b] text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#fed65b] animate-pulse"></span>
                            ✨ 98% AI MATCH
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <div className="flex items-center gap-1.5 text-[12px] font-bold">
                              <span className="material-symbols-outlined text-[#fed65b] text-base">brush</span>
                              <span>8th Gen National Awardee</span>
                            </div>
                            <div className="text-[12px] text-[#d3e4fe] font-medium">Living Kutchi Craft Heritage Archive</div>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#0b1c30] text-[11px] font-semibold">Master Artisan</span>
                              <span className="px-2 py-0.5 rounded-full bg-[#fed65b]/20 text-[#745c00] text-[11px] font-bold">Exclusive Access</span>
                              <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#4d4635] text-[11px]">Nirona Village</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-[22px] font-bold text-[#213145] group-hover:text-[#735c00] transition-colors">
                                  Rogan Art Masterclass with National Awardee
                                </h3>
                                <p className="text-[12px] text-[#575d79]">Khatri Artisan Haveli, Nirona, Kutch District</p>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#213145] text-[#fed65b] text-[14px] font-bold">
                                  <span className="material-symbols-outlined text-[#fed65b] text-xs">star</span>
                                  <span>4.98</span>
                                </div>
                                <span className="text-[11px] text-[#575d79] mt-0.5">310 reviews</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 py-2 text-[12px] text-[#0b1c30]">
                              <span className="font-bold text-[#735c00]">₹1,800 / person</span>
                              <span className="text-[#575d79]">•</span>
                              <span className="flex items-center gap-1 text-[#575d79]">
                                <span className="material-symbols-outlined text-base text-[#735c00]">schedule</span>
                                2.5 Hours · Private Family
                              </span>
                              <span className="text-[#575d79]">•</span>
                              <span className="px-2 py-0.5 rounded bg-[#e5eeff] text-[11px] font-semibold">Fits Day 2 (11:30 AM)</span>
                            </div>
                            <p className="font-['Inter'] text-[13px] text-[#575d79] line-clamp-2">
                              Learn ancient 400-year-old Persian-origin Rogan fabric art directly from Khatri master artisans using hand-prepared castor seed dye paste and a brass stylus. Create your own framed 10x10 silk motif to carry home.
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-[11px] uppercase font-bold text-emerald-600 font-['Outfit']">4 Slots Open for Dec 24</span>
                            <div className="flex items-center gap-2">
                              <button className="px-4 py-2 rounded-xl bg-[#e5eeff] text-[#213145] text-[12px] font-semibold hover:bg-[#dce9ff]" onClick={() => handleStateChange('dossier')}>View Dossier</button>
                              <button className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold shadow-sm" onClick={() => openReservationModal('Rogan Art Masterclass with National Awardee')}>Reserve Experience</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* EXPERIENCE 2: WHITE RANN STARRY WALK */}
                      <div className="group relative rounded-2xl bg-white shadow-md hover:shadow-xl hover:shadow-[#fed65b]/10 transition-all overflow-hidden flex flex-col md:flex-row">
                        <div className="relative md:w-5/12 h-64 md:h-auto overflow-hidden shrink-0">
                          <img
                            alt="White Rann Salt Sunset"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src="https://lh3.googleusercontent.com/aida/AEtjO1VogxcvEk4TD_HyCStWPrpBk2YsWfxphl8NpUzNoxKoH891UHsbmsVwfPOBbvkOLkioA6ESCn7OJSK3uVgwHQ82mZSdaEj5Wtjh6zBWzhSV84xcB9WB0iX20RToE4qjUj1N91GJwnCDCBeXSvagGt38IZe9iB0BB3DDWPkjTrihupAAE3MPbY69QfhOWztiy0rg-aaxfgc0nv1WYCH2SgPvC4IkZ3Ze2vJh_Vnz_QOD4ZkvYZ6bV-fRMvY"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#213145]/80 via-transparent to-black/20"></div>
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#213145]/90 backdrop-blur-md text-[#fed65b] text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#fed65b]"></span>
                            ✨ 96% AI MATCH
                          </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#0b1c30] text-[11px] font-semibold">Desert Sanctuary</span>
                              <span className="px-2 py-0.5 rounded-full bg-[#fed65b]/20 text-[#745c00] text-[11px] font-bold">Astronomy Guide</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-[22px] font-bold text-[#213145] group-hover:text-[#735c00] transition-colors">
                                  White Rann Sunset Salt &amp; Stargazing Walk
                                </h3>
                                <p className="text-[12px] text-[#575d79]">White Rann Salt Flats, Beyond Gate Checkpoint, Dhordo</p>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#213145] text-[#fed65b] text-[14px] font-bold">
                                <span>4.95⭐</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 py-2 text-[12px] text-[#0b1c30]">
                              <span className="font-bold text-[#735c00]">₹1,200 / person</span>
                              <span className="text-[#575d79]">• 0.8 km from tent sanctuary</span>
                            </div>
                            <p className="font-['Inter'] text-[13px] text-[#575d79] line-clamp-2">
                              Walk past tourist vantage points onto pristine untouched salt crust with official naturalist. Watch sunset turn the expanse violet before Orion and Jupiter illuminate the desert sky.
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-[11px] uppercase font-bold text-amber-500">Permits Limited for Dusk</span>
                            <div className="flex items-center gap-2">
                              <button className="px-4 py-2 rounded-xl bg-[#e5eeff] text-[#213145] text-[12px] font-semibold" onClick={() => handleStateChange('dossier')}>View Details</button>
                              <button className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold shadow-sm" onClick={() => openReservationModal('White Rann Sunset Salt & Stargazing Walk')}>Reserve Experience</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* EXPERIENCE 3: SASAN GIR SAFARI */}
                      <div className="group relative rounded-2xl bg-white shadow-md hover:shadow-xl hover:shadow-[#fed65b]/10 transition-all overflow-hidden flex flex-col md:flex-row">
                        <div className="relative md:w-5/12 h-64 md:h-auto overflow-hidden shrink-0">
                          <img
                            alt="Asiatic Lion Sasan Gir"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src="https://lh3.googleusercontent.com/aida/AEtjO1XFLwmElP2uWNJYzzPJtQD_W7-zfvzzrDSJLRt4i4q2kiSaCiDgkH6tDth_9upU-41UMOXgneabJ7gJlolfBaEJ8oF4RWLiMlgPVnJJUbZkaCVGoG6vmgT5YMzXL1cg9Bcc67Aez6KXc0Gb5nu9k1Fx3iaIXGOiRfJLR8uY7kZRZD4AxiLvUbsYdLiGC2e-jpqzBFNl9sGD3kXtVhQHuFvdjH-FedAax64YNjLKY0PaTDXXiTUAbGuK9RM"
                          />
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-[22px] font-bold text-[#213145]">Sasan Gir Asiatic Lion Dawn Gypsy Safari</h3>
                                <p className="text-[12px] text-[#575d79]">Sinh Sadan Reception, Sasan Gir National Sanctuary</p>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#213145] text-[#fed65b] text-[14px] font-bold">
                                <span>4.92⭐</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 py-2 text-[12px] text-[#0b1c30]">
                              <span className="font-bold text-[#735c00]">₹4,250 / gypsy</span>
                              <span className="text-[#575d79]">• 3.5 Hours · Forest Dept Tracker</span>
                            </div>
                            <p className="font-['Inter'] text-[13px] text-[#575d79] line-clamp-2">
                              Exclusive open 4x4 Gypsy expedition through Gir's prime teak valleys at dawn when Asiatic lions, leopards, and spotted deer are most active.
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-[11px] uppercase font-bold text-emerald-600">Govt Permit Allocated</span>
                            <div className="flex items-center gap-2">
                              <button className="px-4 py-2 rounded-xl bg-[#e5eeff] text-[#213145] text-[12px] font-semibold" onClick={() => handleStateChange('dossier')}>View Details</button>
                              <button className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold" onClick={() => openReservationModal('Sasan Gir Asiatic Lion Dawn Gypsy Safari')}>Reserve Experience</button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* STATE MACHINE ALTERNATIVE 1: DOSSIER */}
                  {protoState === 'dossier' && (
                    <div className="p-6 rounded-2xl bg-white shadow-md space-y-4 font-['Outfit']" id="view-dossier">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#735c00] text-xl">history_edu</span>
                          <h3 className="text-[22px] font-bold text-[#213145]">Rogan Art Masterclass with Master Artisan Khatri</h3>
                        </div>
                        <button className="px-3 py-1.5 rounded-xl bg-[#e5eeff] text-[#0b1c30] text-[12px]" onClick={() => handleStateChange('results')}>
                          ✕ Back to Curated Results
                        </button>
                      </div>
                      <div className="p-4 rounded-xl bg-[#eff4ff] space-y-1">
                        <span className="text-[11px] uppercase font-bold text-[#735c00]">Host &amp; Custodian Dossier</span>
                        <p className="font-['Inter'] text-[15px] text-[#0b1c30]">
                          Hosted by Rizwan Khatri — 8th Generation Custodian of Rogan Craft, recipient of National Merit Award. Direct descendant of royal artisan families under the patronage of Kutch Darbar.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-['Inter']">
                        <div className="p-4 rounded-xl bg-[#eff4ff] space-y-2">
                          <span className="text-[11px] font-['Outfit'] uppercase font-bold text-[#735c00]">Session Inclusions</span>
                          <ul className="text-[13px] text-[#0b1c30] space-y-1">
                            <li>• Handmade metal stylus instruction</li>
                            <li>• Boiled castor seed pigment palette</li>
                            <li>• Take-home 10x10 pure silk artwork</li>
                            <li>• Fresh spiced Kutchi chai service</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-[#eff4ff] space-y-2 font-['Outfit']">
                          <span className="text-[11px] uppercase font-bold text-[#735c00]">Daily Schedule Slots</span>
                          <div className="space-y-1.5 text-[13px]">
                            <div className="flex justify-between items-center p-2 rounded bg-white"><span>09:30 AM – 12:00 PM</span><span className="text-[#575d79]">Open</span></div>
                            <div className="flex justify-between items-center p-2 rounded bg-[#213145] text-[#fed65b] font-bold"><span>11:30 AM – 02:00 PM</span><span>Recommended ✨</span></div>
                            <div className="flex justify-between items-center p-2 rounded bg-white"><span>03:00 PM – 05:30 PM</span><span className="text-[#575d79]">Open</span></div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-[#eff4ff] space-y-2">
                          <span className="text-[11px] font-['Outfit'] uppercase font-bold text-[#735c00]">Transparent Fare Protocol</span>
                          <div className="text-[13px] text-[#0b1c30] space-y-1">
                            <div className="flex justify-between"><span>₹1,800 × 4 Travellers</span><span>₹7,200</span></div>
                            <div className="flex justify-between"><span>4× Silk Keepsake Kits</span><span>₹800</span></div>
                            <div className="flex justify-between text-[#575d79]"><span>Unified Heritage GST</span><span>₹400</span></div>
                            <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-[#735c00] font-['Outfit']"><span>Total Sovereign Fare</span><span>₹8,400</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#e5eeff] flex items-center justify-between">
                        <span className="text-[13px] text-[#575d79] font-['Inter']">Guaranteed direct artisan remuneration via Gujarat Handicraft Development Syndicate.</span>
                        <button className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold" onClick={() => openReservationModal('Rogan Art Masterclass with National Awardee')}>Proceed to Reservation</button>
                      </div>
                    </div>
                  )}

                  {/* STATE MACHINE ALTERNATIVE 1B: CONFLICT & ADAPTATION */}
                  {protoState === 'conflict' && (
                    <div className="p-6 rounded-2xl bg-white shadow-md space-y-4 font-['Outfit']" id="view-conflict">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">auto_mode</span>
                        </div>
                        <div>
                          <h3 className="text-[22px] font-bold text-[#213145]">Farva AI Adaptive Reroute Engine</h3>
                          <p className="text-[13px] text-[#575d79] font-['Inter']">Smart environmental and transit synchronization for Day 2 (Dec 25).</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#eff4ff] space-y-2">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-[#735c00] text-xl shrink-0 mt-0.5">thermostat</span>
                          <div>
                            <div className="text-[16px] font-bold text-[#213145]">Automated Thermal &amp; Solar Optimization</div>
                            <p className="font-['Inter'] text-[13px] text-[#575d79]">
                              Forecasted temperature at Nirona village reaches 36°C between 13:00 and 15:30. AI proactively recommends conducting this air-cooled indoor haveli masterclass at 11:30 AM, shifting the outdoor White Rann salt walk to the sunset golden hour (17:45) with zero schedule friction.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="px-2 py-1 rounded bg-[#fed65b] text-[#574500] text-[11px] font-bold uppercase">Day 2 Plan Synchronized</span>
                          <span className="text-[13px] font-['Inter'] text-emerald-600 font-semibold">+45 Mins Buffer Restored</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-['Inter'] text-[#575d79]">One-click itinerary sync updates all family calendar feeds instantly.</span>
                        <button className="px-4 py-2 rounded-xl bg-[#213145] text-[#fed65b] text-[12px] font-bold" onClick={() => handleStateChange('results')}>Accept Adaptive Plan</button>
                      </div>
                    </div>
                  )}

                  {/* STATE MACHINE ALTERNATIVE 2: HANDOFF */}
                  {protoState === 'handoff' && (
                    <div className="p-6 rounded-2xl bg-white shadow-md space-y-4 font-['Outfit']" id="view-handoff">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#fed65b]/20 text-[#745c00] flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">verified_user</span>
                        </div>
                        <div>
                          <h3 className="text-[22px] font-bold text-[#213145]">Farva Master Artisan Booking Token Dispatched</h3>
                          <p className="text-[13px] font-['Inter'] text-[#575d79]">Direct artisan reservation secured through Gujarat Handicraft Development Syndicate.</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#eff4ff] space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                          <div>
                            <span className="text-[11px] uppercase text-[#575d79]">Experience Token</span>
                            <div className="text-[16px] font-bold text-[#213145]">#CF-EXP-9104</div>
                          </div>
                          <div>
                            <span className="text-[11px] uppercase text-[#575d79]">Artisan Sanctuary</span>
                            <div className="text-[16px] font-bold text-[#213145]">Rogan Master Haveli</div>
                          </div>
                          <div>
                            <span className="text-[11px] uppercase text-[#575d79]">Confirmed Slot</span>
                            <div className="text-[16px] font-bold text-[#213145]">24 Dec · 11:30 AM</div>
                          </div>
                          <div>
                            <span className="text-[11px] uppercase text-[#575d79]">Token Status</span>
                            <div className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                              ● Confirmed Family Session
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-['Inter'] text-[#575d79]">Dispatch SMS token sent to +91 98251 22401 with offline GPS coordinates to Nirona workshop.</span>
                        <button className="px-4 py-2 rounded-xl bg-[#213145] text-[#fed65b] text-[12px] font-bold" onClick={() => handleStateChange('results')}>Return to Curations</button>
                      </div>
                    </div>
                  )}

                  {/* STATE MACHINE ALTERNATIVE 3: FALLBACK */}
                  {protoState === 'fallback' && (
                    <div className="p-12 rounded-2xl bg-white shadow-sm text-center space-y-4 font-['Outfit']" id="view-fallback">
                      <div className="w-20 h-20 mx-auto rounded-full bg-[#eff4ff] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#575d79] text-4xl">explore_off</span>
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="text-[22px] font-bold text-[#213145]">No Experiences Match This Exact Filter</h3>
                        <p className="font-['Inter'] text-[15px] text-[#575d79]">
                          We could not find active heritage craft or safari workshops matching your strict criteria in this radius. Loosen duration constraints or view all Kutch sanctuary activities.
                        </p>
                      </div>
                      <button className="px-4 py-2.5 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold" onClick={() => handleStateChange('results')}>
                        Reset Filters &amp; View All 36 Activities
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </section>

            {/* 7. RESERVATION MODAL */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 bg-[#213145]/70 backdrop-blur-sm flex items-center justify-center p-4" id="reservation-modal">
                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6 space-y-4 overflow-hidden relative font-['Outfit']">
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1 text-[11px] uppercase text-[#735c00] font-bold tracking-wider">
                        <span className="material-symbols-outlined text-base">history_edu</span> Sovereign Experience Reservation
                      </div>
                      <h3 className="text-[28px] font-bold text-[#213145]">
                        {modalExpName}
                      </h3>
                      <p className="text-[12px] text-[#575d79]">Guaranteed Private Artisan Session with Master Rizwan Khatri</p>
                    </div>
                    <button className="p-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30]" onClick={closeModal}>
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-[#eff4ff]">
                        <span className="text-[11px] text-[#575d79] uppercase">Date</span>
                        <div className="text-[14px] font-bold text-[#213145]">24 Dec 2026</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#eff4ff]">
                        <span className="text-[11px] text-[#575d79] uppercase">Time Slot</span>
                        <div className="text-[14px] font-bold text-[#213145]">11:30 AM (Optimal)</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#eff4ff]">
                        <span className="text-[11px] text-[#575d79] uppercase">Format</span>
                        <div className="text-[14px] font-bold text-[#213145]">4 Guests · Family</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase text-[#575d79] font-bold">Available Time Slots</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className="p-2.5 rounded-xl bg-[#e5eeff] text-[#0b1c30] text-[12px] flex items-center justify-between cursor-pointer hover:bg-[#dce9ff]">
                          <span>09:30 AM</span>
                          <span className="material-symbols-outlined text-xs text-[#575d79]">radio_button_unchecked</span>
                        </label>
                        <label className="p-2.5 rounded-xl bg-[#213145] text-[#fed65b] text-[12px] font-semibold flex items-center justify-between cursor-pointer">
                          <span>11:30 AM (Day 2 AI)</span>
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                        </label>
                        <label className="p-2.5 rounded-xl bg-[#e5eeff] text-[#0b1c30] text-[12px] flex items-center justify-between cursor-pointer hover:bg-[#dce9ff]">
                          <span>03:00 PM</span>
                          <span className="material-symbols-outlined text-xs text-[#575d79]">radio_button_unchecked</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase text-[#575d79] font-bold">Artisan Guidance &amp; Inclusions</span>
                      <div className="p-3 rounded-xl bg-[#eff4ff] font-['Inter'] text-[13px] text-[#0b1c30] space-y-1">
                        <div>• Hands-on castor oil dye preparation, stylus technique &amp; fabric folding geometry</div>
                        <div>• 4 take-home framed silk keepsakes + spiced herbal chai ceremony</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#fed65b]/15 flex items-start gap-2 text-[#213145]">
                      <span className="material-symbols-outlined text-[#735c00] text-base shrink-0">info</span>
                      <span className="font-['Inter'] text-[12px] leading-tight">
                        Direct artisan reservation secured through Gujarat Handicraft Development Syndicate. Zero middleman surcharge &amp; free rescheduling up to 4 hours prior.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] text-emerald-600 font-bold uppercase">● Guild Slot Confirmed</span>
                      <div className="text-[11px] text-[#575d79]">Total: ₹8,400 all-inclusive for 4 guests</div>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-[#fed65b] text-[#213145] font-bold text-[14px] shadow-md hover:shadow-[0_0_20px_rgba(254,214,91,0.5)] transition-all" onClick={confirmReservation}>
                      Confirm Experience Reservation ✨
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. FOOD EXPERIENCE HIGHLIGHTS */}
            <section className="w-full bg-[#eff4ff] px-6 py-10 font-['Outfit']">
              <div className="max-w-[1440px] mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-[11px] uppercase text-[#735c00] font-bold tracking-wider">
                      <span className="material-symbols-outlined text-xs">local_activity</span>
                      EXPERIENTIAL EXPEDITIONS
                    </div>
                    <h2 className="text-[40px] leading-[48px] font-bold text-[#213145]">
                      Unforgettable Gujarat Living Heritage Expeditions
                    </h2>
                    <p className="font-['Inter'] text-[15px] text-[#575d79]">
                      Curated immersive multi-hour expeditions led by certified historians, naturalists, and master artisans.
                    </p>
                  </div>
                  <button className="text-[14px] text-[#735c00] font-bold hover:underline flex items-center gap-1">
                    <span>View All 16 Expeditions</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* EXPEDITION 1 */}
                  <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Somnath Coastline Sunset" src="https://lh3.googleusercontent.com/aida/AEtjO1XZz60sasmrRwOu0xxudaWXAaUq7yRw6MKY5PE3RChfmhdVufZ4D_WqdQBknzyBSNPtUdtQ8Y5d9UiXibw3nwJrEUNmnkZSvobe5oEwwOMxDot0OOgi_eTQONLFExHs1gMGlVowEk8-rnoBFCD71L1i5jC9QIWIxQkWG6B-isSSAwRnLSBtb5eXFlnyppoyseRJCYG_pfQaNxOvGJS-Ct_EPi8LAN-t4zo0mW5DiO10M9KBnrzKb_FBQGRM" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#fed65b] text-[#745c00]">Somnath &amp; Dwarka Bay</span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#213145]">Dwarka Arabian Sea Coastal Dhow &amp; Coral Reef Sail</h3>
                        <p className="font-['Inter'] text-[13px] text-[#575d79] mt-1">
                          Private sunset wooden dhow cruise around holy marine sanctuary and ancient submerged city waters with marine biologist.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[12px] text-[#735c00] font-bold">₹3,500 / session</span>
                        <button className="text-[12px] text-[#213145] font-bold hover:underline" onClick={() => openReservationModal('Dwarka Arabian Sea Coastal Dhow & Coral Reef Sail')}>Reserve Trail →</button>
                      </div>
                    </div>
                  </div>

                  {/* EXPEDITION 2 */}
                  <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Ahmedabad Pol Heritage Walk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAExK2j6GaJmZYBVKUryMutLw69mJbZ-fEIM_JRscsOr5k9IqIfwYXcfzEEFH5i2vM5gtbJcxyzC1m65Xo130kV8zV-Kl81S_Vg4fQXjXuCtt5pa--8i_lFZF71QjcPtgijX1eHM7lhGOE4zJLEg073bk-1CGF82aoZWXspqTKQPlwLFHmr4NZP88ubx8slrxS4xvbzc6DhWDcZiBMsY5aIo8GN2DUH-NQ57WMMB7TRFXCtyg20lFTsZg" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#fed65b] text-[#745c00]">Ahmedabad UNESCO Pol</span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#213145]">Ahmedabad UNESCO Pol Midnight Heritage &amp; Food Trail</h3>
                        <p className="font-['Inter'] text-[13px] text-[#575d79] mt-1">
                          Architectural exploration through 600-year-old carved wooden bird feeders, secret underground pol passages, and midnight Manek Chowk delicacies.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[12px] text-[#735c00] font-bold">₹1,100 / person</span>
                        <button className="text-[12px] text-[#213145] font-bold hover:underline" onClick={() => openReservationModal('Ahmedabad UNESCO Pol Midnight Heritage & Food Trail')}>Reserve Trail →</button>
                      </div>
                    </div>
                  </div>

                  {/* EXPEDITION 3 */}
                  <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Royal Tent Camp Dhordo Kutch" src="https://lh3.googleusercontent.com/aida/AEtjO1VWiNPA-w2t1NQyfCn1h4szzX-NTPhydNqzwjbVXvd0r2cyv9cSBUBmNwfCaP_Q-HsX9T_34zUHzblYAF14ziVyzFO9zI4-laLaYl9lYG80Ibe1P_eci89u7CAYJQVjejr00a7U-pb1owHh3K-Vh5fAva8sW6TdDucgZumBPR6UtdE9JqEZmJAa_PoKS7D0Po3yWBkZwsCvICoe1LJmyyJ5CWh2MXSEJyYMjXmWZRbgL1C_cKkmWqy2csHI" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#fed65b] text-[#745c00]">Dhordo Kutch Sanctuary</span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#213145]">Dhordo Salt Desert Stargazing &amp; Sufi Campfire Recital</h3>
                        <p className="font-['Inter'] text-[13px] text-[#575d79] mt-1">
                          Night desert glamping experience with astronomical telescope observation of galactic core accompanied by live soulful Kutchi Jodiya Pawa musicians.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[12px] text-[#735c00] font-bold">₹2,800 / couple</span>
                        <button className="text-[12px] text-[#213145] font-bold hover:underline" onClick={() => openReservationModal('Dhordo Salt Desert Stargazing & Sufi Campfire Recital')}>Reserve Trail →</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </main>

        {/* FOOTER */}
        <footer className="w-full bg-[#141a32] text-[#d3e4fe] mt-12 font-['Outfit']">
          <div className="max-w-[1440px] mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pb-10 border-b border-slate-800">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm ring-1 ring-[#fed65b]/30 shrink-0">
                    <img
                      alt="BharatYatra"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA88HSN5BeNrbu5OxEj33JOWHBI71YdcvPbqskrJUpqcX1feG0w8aX7grn7sxV68KWJ0S1Wub5i_COfH6rltnjAdYdc-9Zpkq6t-JbJ8fjvm7xs8dx45Eocp8vqryPsuTcQrpbKuErFlDsxTX5V5RodpmuO5_JFcFuJ_9ewG4Uhk2A6OfjUwzoZQH8BRsDLiYgqfjLtxVeykibgcdpriOhrqTIzFyB8WfkBjTAMsj5yv4aziDz8qv-WfoBP3Tm2bkNgOQA"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[22px] tracking-tight font-bold text-white">BHARAT YATRA</span>
                    <span className="text-[11px] text-[#d3e4fe]/70 tracking-widest uppercase">ભારત યાત્રા • Sovereign Gujarat Travel Engine</span>
                  </div>
                </div>
                <p className="font-['Inter'] text-[15px] text-[#c0c5e5] max-w-md">
                  Sovereign luxury transit architecture and algorithmic curation across the ancient corridors, salt sanctuaries, coastal fortresses, and heritage dynasties of Gujarat.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[12px]">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#fed65b] font-semibold">Gujarat Tourism Accredited</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white font-semibold">PCI-DSS Royal Secure</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[18px] text-white font-bold tracking-tight">Sovereign Desk</div>
                <ul className="space-y-1 font-['Inter'] text-[13px] text-[#c0c5e5]">
                  <li><a className="hover:text-[#fed65b]" href="#">Imperial Concierge 24/7</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Bespoke Royal Charters</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Private Wildlife Expeditions</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">VIP Somnath &amp; Dwarka Protocol</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Rann Utsav Pavilions</a></li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-[18px] text-white font-bold tracking-tight">Transit Corridors</div>
                <ul className="space-y-1 font-['Inter'] text-[13px] text-[#c0c5e5]">
                  <li><a className="hover:text-[#fed65b]" href="#">Ahmedabad – Rajkot High-Speed</a></li>
                  <li><Link className="hover:text-[#fed65b]" href="/buses">GSRTC Sovereign Sleeper Fleet</Link></li>
                  <li><Link className="hover:text-[#fed65b]" href="/trains">Vande Bharat Saurashtra Link</Link></li>
                  <li><Link className="hover:text-[#fed65b]" href="/flights">Aviation Gateway Protocol</Link></li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-[18px] text-white font-bold tracking-tight">Flagship Circuits</div>
                <ul className="space-y-1 font-['Inter'] text-[13px] text-[#c0c5e5]">
                  <li><a className="hover:text-[#fed65b]" href="#">Kutch White Rann Solitude</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Gir Asiatic Lion Sanctuaries</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Patan &amp; Modhera Architectural Route</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Dwarka-Bet Holy Estuary</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#d3e4fe]/80 text-[12px] font-['Inter']">
              <div>© 2025 BharatYatra Technologies Ltd. Sovereign Gujarat Travel Engine.</div>
              <div className="flex items-center gap-6">
                <span>Department of Tourism Government of Gujarat Partner</span>
                <span>Guaranteed Dispatch SLA: &lt; 90s</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

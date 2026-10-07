'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RestaurantsPage() {
  const [protoState, setProtoState] = useState<'results' | 'dossier' | 'modal' | 'handoff' | 'fallback'>('results');
  const [destination, setDestination] = useState('Rajkot (Saurashtra Heartland)');
  const [modalRestName, setModalRestName] = useState('Rajwadi Kathiyawadi Royal Thal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addTripText, setAddTripText] = useState('Add to Day 3 Dinner ✨');
  const [isTripAdded, setIsTripAdded] = useState(false);

  const handleStateChange = (state: 'results' | 'dossier' | 'modal' | 'handoff' | 'fallback') => {
    setProtoState(state);
    if (state === 'modal') {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const openReservationModal = (restName: string) => {
    setModalRestName(restName);
    setIsModalOpen(true);
  };

  const confirmReservation = () => {
    setIsModalOpen(false);
    setProtoState('handoff');
  };

  const handleAddToItinerary = () => {
    setIsTripAdded(true);
    setAddTripText('Added to Day 3!');
    setTimeout(() => {
      setIsTripAdded(false);
      setAddTripText('Add to Day 3 Dinner ✨');
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
                  <span className="material-symbols-outlined text-[#735c00] text-[16px]">tune</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#4d4635]">Prototype State Machine</span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5" id="proto-toggles">
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all ${
                      protoState === 'results' ? 'bg-[#141a32] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                    onClick={() => handleStateChange('results')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fed65b] animate-ping"></span>
                    Results Matrix
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all ${
                      protoState === 'dossier' ? 'bg-[#141a32] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                    onClick={() => handleStateChange('dossier')}
                  >
                    Restaurant Dossier &amp; Menu
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1 transition-all ${
                      protoState === 'modal' ? 'bg-[#141a32] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:text-[#0b1c30] hover:bg-[#e5eeff]'
                    }`}
                    onClick={() => handleStateChange('modal')}
                  >
                    Table Reservation Modal
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
                    Empty / No Match Fallback
                  </button>
                </div>
              </div>
            </aside>

            {/* 2. HERO SEARCH SECTION */}
            <section className="relative w-full bg-white px-6 pt-10 pb-10 overflow-hidden">
              <div className="absolute -top-32 right-12 w-96 h-96 rounded-full bg-[#fed65b]/20 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 left-10 w-80 h-80 rounded-full bg-[#ced9ff]/30 blur-3xl pointer-events-none"></div>
              
              <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e5eeff] text-[#4d4635] font-['Outfit'] font-bold text-[11px] uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-[#735c00]"></span>
                      CULINARY HERITAGE VECTORS // VERIFIED GUJARAT GASTRONOMY
                    </div>
                    <h1 className="font-['Outfit'] font-semibold text-[40px] leading-[48px] text-[#213145] tracking-tight">
                      Taste Gujarat Like a Local
                    </h1>
                    <p className="font-['Inter'] text-[18px] leading-[28px] text-[#575d79]">
                      Discover authentic flavours, legendary thalis and memorable dining experiences along your journey, precision-synchronized with your travel schedule.
                    </p>
                  </div>
                  {/* Fast Stats Seal */}
                  <div className="hidden lg:flex items-center gap-4 p-3 rounded-2xl bg-[#eff4ff] shadow-sm font-['Outfit']">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[#735c00] text-2xl">restaurant</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79]">Verified Kitchens</span>
                      <span className="text-[18px] font-bold text-[#213145]">140+ Sovereign Bhojanalays</span>
                    </div>
                  </div>
                </div>

                {/* Search Console */}
                <div className="w-full p-4 rounded-2xl bg-[#eff4ff] shadow-md flex flex-col gap-4 font-['Outfit']">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                    {/* DESTINATION FIELD */}
                    <div className="bg-white p-3 rounded-xl shadow-xs flex flex-col justify-center">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#575d79] flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[#fed65b] text-[14px]">location_on</span>
                        Destination
                      </label>
                      <input
                        className="w-full font-['Outfit'] font-bold text-[16px] text-[#213145] bg-transparent outline-none focus:text-[#735c00]"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                    {/* DATE FIELD */}
                    <div className="bg-white p-3 rounded-xl shadow-xs flex flex-col justify-center">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#575d79] flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[#735c00] text-[14px]">calendar_month</span>
                        Dining Date
                      </label>
                      <div className="font-bold text-[16px] text-[#213145] flex items-center justify-between cursor-pointer">
                        <span>24 Dec 2026</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fed65b]/30 text-[#574500]">Winter Peak</span>
                      </div>
                    </div>
                    {/* MEAL & TIME */}
                    <div className="bg-white p-3 rounded-xl shadow-xs flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#575d79] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#735c00] text-[14px]">schedule</span>
                          Slot
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#e5eeff] text-[#575d79]">B</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#e5eeff] text-[#575d79]">L</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#213145] text-[#fed65b]">D</span>
                        </div>
                      </div>
                      <div className="font-bold text-[16px] text-[#213145]">
                        Dinner (07:30 PM)
                      </div>
                    </div>
                    {/* GUESTS */}
                    <div className="bg-white p-3 rounded-xl shadow-xs flex flex-col justify-center">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#575d79] flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[#735c00] text-[14px]">group</span>
                        Party Configuration
                      </label>
                      <div className="font-bold text-[16px] text-[#213145] flex items-center justify-between">
                        <span>4 Guests · Family Setup</span>
                        <span className="material-symbols-outlined text-[#575d79] text-xl">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Line */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] uppercase text-[#575d79] font-bold tracking-wider mr-1">Quick Select:</span>
                      {['Ahmedabad', 'Rajkot', 'Bhuj', 'Junagadh', 'Somnath', 'Dwarka'].map((city) => (
                        <button
                          key={city}
                          className={`px-3 py-1 rounded-full text-[12px] font-semibold shadow-xs transition-all ${
                            destination.includes(city)
                              ? 'bg-[#213145] text-[#fed65b]'
                              : 'bg-white text-[#575d79] hover:bg-[#e5eeff] hover:text-[#0b1c30]'
                          }`}
                          onClick={() => setDestination(`${city} (Sovereign Circuit)`)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                    <button
                      className="px-6 py-3 rounded-xl bg-[#fed65b] text-[#213145] font-['Outfit'] font-bold text-[14px] shadow-[0_0_20px_-2px_rgba(254,214,91,0.4)] hover:shadow-[0_0_28px_2px_rgba(254,214,91,0.6)] transition-all flex items-center justify-center gap-1 shrink-0"
                      onClick={() => handleStateChange('results')}
                    >
                      <span className="material-symbols-outlined text-xl">travel_explore</span>
                      <span>Find Restaurants</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. FOOD CATEGORY QUICK SHORTCUTS */}
            <section className="w-full bg-[#f8f9ff] px-6 py-4 font-['Outfit']">
              <div className="max-w-[1440px] mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest text-[#575d79] font-bold">Curated Gastronomy Categories</span>
                  <span className="text-[12px] text-[#735c00] font-semibold cursor-pointer hover:underline">Explore Culinary Glossary</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { title: 'Gujarati Thali (Grand Kansa Feast)', icon: 'dinner_dining', active: true },
                    { title: 'Kathiyawadi (Smoky Bajra & Ringna Olo)', icon: 'local_fire_department', active: false },
                    { title: 'Heritage Haveli Dining', icon: 'castle', active: false },
                    { title: 'Street Food & Farsan Walk', icon: 'ramen_dining', active: false },
                    { title: 'Traditional Bhunga Rasoi', icon: 'cottage', active: false },
                    { title: 'Coastal Catch (Kathiawar Port)', icon: 'set_meal', active: false },
                    { title: 'Artisanal Desert Cafes', icon: 'local_cafe', active: false },
                    { title: 'Royal Nawabi Dastarkhwan', icon: 'stars', active: false },
                  ].map((cat, i) => (
                    <button
                      key={i}
                      className={`shrink-0 flex items-center gap-1 px-4 py-2.5 rounded-full text-[12px] font-semibold transition-all ${
                        cat.active ? 'bg-[#213145] text-[#fed65b] shadow-sm' : 'bg-white text-[#4d4635] hover:bg-[#dce9ff] hover:text-[#0b1c30] shadow-xs'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                      <span>{cat.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. CONTEXTUAL AI FOOD RECOMMENDATION BANNER */}
            <section className="w-full bg-[#f8f9ff] px-6 py-2 font-['Outfit']">
              <div className="max-w-[1440px] mx-auto">
                <div className="relative rounded-2xl bg-gradient-to-r from-[#213145] via-[#213145] to-[#1C2442] text-white p-6 shadow-xl overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#fed65b]/15 blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-1 max-w-3xl">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-[#fed65b] text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#fed65b] animate-pulse"></span>
                        ✨ BHARAT YATRA AI PICK // SYNCHRONIZED WITH DAY 3 ITINERARY
                      </div>
                      <h2 className="text-[22px] font-bold text-white">
                        Tonight in Rajkot: Wood-fired Bajra &amp; White Butter Protocol
                      </h2>
                      <p className="font-['Inter'] text-[15px] leading-relaxed text-[#dce9ff]">
                        On your <strong className="text-[#fed65b] font-semibold">Royal Gujarat Discovery Trip (Dec 24–29)</strong>, experience authentic Kathiyawadi dining at <span className="text-white underline decoration-[#fed65b] underline-offset-4 font-bold">Rajwadi Kansa Thal</span> — situated just 10 minutes (3.2 km) from your evening hotel check-in at Imperial Palace. Curated for 100% pure vegetarian, authentic Jain/Swaminarayan preparation without onion-garlic roots.
                      </p>
                      {/* Route Metrics Metadata Bar */}
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] text-[#bac6ed]">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#fed65b] text-base">near_me</span>
                          <span>Distance: <strong className="text-white">3.2 km</strong> from Route</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#fed65b] text-base">timer</span>
                          <span>Est. Dining Dwell Time: <strong className="text-white">75 mins</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#fed65b] text-base">verified_user</span>
                          <span className="text-[#fed65b] font-bold">Zero Surge Guarantee</span>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 shrink-0 w-full lg:w-auto">
                      <button
                        className="px-4 py-3 rounded-xl bg-[#fed65b] text-[#213145] font-bold text-[14px] shadow-[0_0_20px_-2px_rgba(254,214,91,0.3)] hover:shadow-[0_0_25px_rgba(254,214,91,0.5)] transition-all text-center"
                        onClick={() => openReservationModal('Rajwadi Kathiyawadi Royal Thal')}
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
                    <span className="text-[18px] font-bold text-[#213145]">Restaurants Along Active Transit Corridor</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#575d79]">Synchronized with Gujarat State Highway 27</span>
                </div>
                {/* Stepper / Waypoint Rail */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { leg: 'Leg 1: UNESCO', city: 'Ahmedabad', desc: 'Farsan & Pol Bhojanalays', active: false },
                    { leg: 'Leg 2: Oasis', city: 'Bhuj', desc: 'Kutchi Dabeli & Khichdi', active: false },
                    { leg: 'Leg 3: Salt Plains', city: 'Dhordo', desc: 'Desert Camp Rasoi', active: false },
                    { leg: 'Leg 4: Active Waypoint', city: 'Rajkot (Heartland)', desc: 'Royal Kathiyawadi & Chhaas', active: true },
                    { leg: 'Leg 5: Girnar', city: 'Junagadh', desc: 'Gir Forest Thali', active: false },
                    { leg: 'Leg 6: Coastal', city: 'Somnath', desc: 'Coastal Sattvik', active: false },
                    { leg: 'Leg 7: Sacred Bay', city: 'Dwarka', desc: 'Pushtimargiya Bhog', active: false },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 shrink-0">
                      <div
                        onClick={() => setDestination(`${step.city} (Sovereign Circuit)`)}
                        className={`flex flex-col p-2.5 rounded-xl cursor-pointer transition-all ${
                          step.active
                            ? 'bg-[#213145] text-[#fed65b] shadow-md min-w-[200px]'
                            : 'bg-[#eff4ff] text-[#0b1c30] min-w-[170px] opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] uppercase font-bold">
                          <span className="flex items-center gap-1">
                            {step.active && <span className="w-2 h-2 rounded-full bg-[#fed65b] animate-pulse"></span>}
                            {step.leg}
                          </span>
                          {step.active && <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px]">Today</span>}
                        </div>
                        <span className={`text-[16px] font-bold ${step.active ? 'text-white' : 'text-[#0b1c30]'}`}>{step.city}</span>
                        <span className={`text-[11px] ${step.active ? 'text-[#fed65b]/90' : 'text-[#575d79]'}`}>{step.desc}</span>
                      </div>
                      {idx < 6 && <span className="material-symbols-outlined text-[#575d79] text-xl">trending_flat</span>}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. MAIN CONTENT LAYOUT */}
            <section className="w-full bg-[#f8f9ff] px-6 py-6">
              <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: FILTERS */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-4 font-['Outfit']">
                  <div className="p-4 rounded-2xl bg-white shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#735c00] text-xl">filter_alt</span>
                        <span className="text-[18px] font-bold text-[#213145]">Refine Table</span>
                      </div>
                      <button className="text-[12px] text-[#735c00] hover:underline font-semibold" onClick={() => handleStateChange('results')}>Clear All</button>
                    </div>

                    {/* DIETARY RESTRICTIONS */}
                    <div className="space-y-1">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Dietary Protocol</span>
                      <div className="space-y-2 font-['Inter']">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input defaultChecked className="w-4 h-4 rounded text-[#213145] accent-[#fed65b]" type="checkbox" />
                          <span className="text-[13px] font-semibold text-[#0b1c30]">100% Pure Vegetarian</span>
                          <span className="ml-auto text-[11px] font-['Outfit'] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#575d79]">48</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input defaultChecked className="w-4 h-4 rounded text-[#213145] accent-[#fed65b]" type="checkbox" />
                          <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-[#0b1c30]">Dedicated Jain Preparation</span>
                            <span className="text-[11px] text-[#575d79]">Zero root veg / garlic / onions</span>
                          </div>
                          <span className="ml-auto text-[11px] font-['Outfit'] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#575d79]">38</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input className="w-4 h-4 rounded text-[#213145] accent-[#fed65b]" type="checkbox" />
                          <span className="text-[13px] text-[#0b1c30]">Swaminarayan Sattvik</span>
                          <span className="ml-auto text-[11px] font-['Outfit'] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#575d79]">24</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input className="w-4 h-4 rounded text-[#213145] accent-[#fed65b]" type="checkbox" />
                          <span className="text-[13px] text-[#0b1c30]">Vegan-Friendly Options</span>
                          <span className="ml-auto text-[11px] font-['Outfit'] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#575d79]">15</span>
                        </label>
                      </div>
                    </div>

                    {/* CUISINE FILTER */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Cuisine Category</span>
                      <div className="space-y-2 font-['Inter'] text-[13px]">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#0b1c30]">Gujarati Thali</span>
                          <span className="text-[11px] font-['Outfit'] text-[#575d79] font-semibold">42</span>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="font-bold text-[#213145] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#735c00]"></span> Kathiyawadi Speciality
                          </span>
                          <span className="text-[11px] font-['Outfit'] px-1.5 py-0.5 rounded-full bg-[#fed65b] text-[#574500] font-bold">28</span>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#0b1c30]">North Indian &amp; Tandoor</span>
                          <span className="text-[11px] font-['Outfit'] text-[#575d79] font-semibold">16</span>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-[#0b1c30]">Royal Nawabi Cuisine</span>
                          <span className="text-[11px] font-['Outfit'] text-[#575d79] font-semibold">6</span>
                        </label>
                      </div>
                    </div>

                    {/* PRICE TIER */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Price Range / Person</span>
                      <div className="grid grid-cols-4 gap-1">
                        <button className="py-2 rounded-xl bg-[#e5eeff] text-[12px] text-[#575d79] hover:bg-[#dce9ff]">₹</button>
                        <button className="py-2 rounded-xl bg-[#213145] text-[#fed65b] text-[12px] font-bold shadow-sm">₹₹</button>
                        <button className="py-2 rounded-xl bg-[#e5eeff] text-[12px] text-[#575d79] hover:bg-[#dce9ff]">₹₹₹</button>
                        <button className="py-2 rounded-xl bg-[#e5eeff] text-[12px] text-[#575d79] hover:bg-[#dce9ff]">₹₹₹₹</button>
                      </div>
                    </div>

                    {/* AMBIANCE */}
                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider text-[#575d79] font-bold">Ambiance &amp; Seating</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[12px] bg-[#e5eeff] text-[#575d79] cursor-pointer">Heritage Haveli</span>
                        <span className="px-2.5 py-1 rounded-full text-[12px] bg-[#213145] text-[#fed65b] font-semibold cursor-pointer">Royal Baithak (Floor)</span>
                        <span className="px-2.5 py-1 rounded-full text-[12px] bg-[#e5eeff] text-[#575d79] cursor-pointer">Open-Air Rooftop</span>
                      </div>
                    </div>
                  </div>

                  {/* SPECIAL CARD: CONCIERGE DESK */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#eff4ff] to-[#e5eeff] shadow-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#fed65b]/30 text-[#574500]">
                        <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                      </div>
                      <div>
                        <div className="text-[16px] font-bold text-[#213145]">Farva Gastronomy Concierge</div>
                        <div className="text-[11px] text-[#735c00] font-semibold uppercase">Private Table Bookings</div>
                      </div>
                    </div>
                    <p className="font-['Inter'] text-[13px] text-[#575d79] pt-1">
                      Need private Maharaj-curated dining, royal thal service, or dietary customizations for large groups?
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#213145]">+91 1800 203 1111</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#fed65b] text-[#574500] text-[11px] font-bold">Toll-Free</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: RESULTS MATRIX */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                  
                  {/* Results Header */}
                  <div className="p-3 rounded-2xl bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-['Outfit']">
                    <div>
                      <span className="text-[18px] font-bold text-[#213145]">Restaurants in Rajkot</span>
                      <span className="text-[11px] text-[#575d79] uppercase ml-2 tracking-wider">48 Dining Sanctuaries</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] uppercase text-[#575d79] font-bold">Sort By:</span>
                      <select className="px-3 py-1.5 rounded-xl bg-[#eff4ff] text-[12px] text-[#213145] font-semibold outline-none">
                        <option>✨ Farva AI Match (Recommended)</option>
                        <option>Culinary Rating (4.8+)</option>
                        <option>Closest to Itinerary Route</option>
                        <option>Price: Moderate to Royal</option>
                      </select>
                    </div>
                  </div>

                  {/* RESULTS MATRIX VIEW */}
                  {protoState === 'results' && (
                    <div className="space-y-4 font-['Outfit']" id="results-container">
                      
                      {/* CARD 1: RAJWADI KANSA THAL */}
                      <div className="group relative rounded-2xl bg-white shadow-md hover:shadow-xl hover:shadow-[#fed65b]/10 transition-all overflow-hidden flex flex-col md:flex-row">
                        <div className="relative md:w-5/12 h-64 md:h-auto overflow-hidden shrink-0">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Traditional Kathiyawadi thali"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtjYa-FFeFiYw1AvcUx4lx3Xvw6CQnsz0UlF1v9-7c3xHY38bVwm2TRazYR8pMgAOvghBCD12uRGJ5uYe_piSAkwX6JtU7KLOjpZ7XetRWpXgPKkU__Xcz1ObPMK_flT1B_6I7ma0GGYnEiLd3oJciuY23WT9hvaLkOq90H7t0IvSCrtrez8vSKLW9PLkfjt-GjKrzyi8z0nQK3BsKbXWN7Fv21RVQdX1JRMaAguyvYtuWlDn9rxo7rw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#213145]/80 via-transparent to-black/20"></div>
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#213145]/90 backdrop-blur-md text-[#fed65b] text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#fed65b] animate-pulse"></span>
                            ✨ 96% AI MATCH
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <div className="flex items-center gap-1.5 text-[12px] font-bold">
                              <span className="material-symbols-outlined text-[#fed65b] text-base">verified</span>
                              <span>Saurashtra Regional Icon</span>
                            </div>
                            <div className="text-[12px] text-[#d3e4fe] font-medium">150+ Year-old Recipe Archive</div>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#0b1c30] text-[11px] font-semibold">Heritage Kathiyawadi</span>
                              <span className="px-2 py-0.5 rounded-full bg-[#fed65b]/20 text-[#745c00] text-[11px] font-bold">100% Pure Veg</span>
                              <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#4d4635] text-[11px]">Jain Available</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-[22px] font-bold text-[#213145] group-hover:text-[#735c00] transition-colors">
                                  Rajwadi Kathiyawadi Royal Thal
                                </h3>
                                <p className="text-[12px] text-[#575d79]">Kasturba Road, Opp. Jubilee Garden, Rajkot</p>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#213145] text-[#fed65b] text-[14px] font-bold">
                                  <span className="material-symbols-outlined text-[#fed65b] text-xs">star</span>
                                  <span>4.9</span>
                                </div>
                                <span className="text-[11px] text-[#575d79] mt-0.5">1,420 reviews</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 py-2 text-[12px] text-[#0b1c30]">
                              <span className="font-bold text-[#735c00]">₹450 – ₹750 / person</span>
                              <span className="text-[#575d79]">•</span>
                              <span className="flex items-center gap-1 text-[#575d79]">
                                <span className="material-symbols-outlined text-base text-[#735c00]">near_me</span>
                                3.2 km from Route Checkpoint
                              </span>
                            </div>
                            <p className="font-['Inter'] text-[13px] text-[#575d79] line-clamp-2">
                              Signature wood-fired bajra rotla drenched in home-churned white butter (makkhan), slow-roasted Ringna no olo, Sev tameta shaak, pure desi ghee with organic jaggery (gol), lasaniya bateta, and chilled cumin masala chaas served in brass kansa vessels.
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#575d79] font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              <span>Tables Open Tonight</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="px-4 py-2 rounded-xl bg-[#e5eeff] text-[#213145] text-[12px] font-semibold hover:bg-[#dce9ff] transition-all"
                                onClick={() => handleStateChange('dossier')}
                              >
                                View Menu &amp; Dossier
                              </button>
                              <button
                                className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold shadow-sm hover:shadow-[0_0_15px_rgba(254,214,91,0.5)] transition-all flex items-center gap-1"
                                onClick={() => openReservationModal('Rajwadi Kathiyawadi Royal Thal')}
                              >
                                <span>Reserve Table</span>
                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: THE GRAND HAVELI */}
                      <div className="group relative rounded-2xl bg-white shadow-md hover:shadow-xl hover:shadow-[#fed65b]/10 transition-all overflow-hidden flex flex-col md:flex-row">
                        <div className="relative md:w-5/12 h-64 md:h-auto overflow-hidden shrink-0">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Grand Haveli Dining"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFTA5CfdtEQeIzQ2oPXeC8pLFhq8c0w3Eb544YmWkEwkywfjiepMZqj2Z0Kvx3HgZ-iS9g_KzPILZqG5c0bqsRckq-vn_n4kkrjUuxl8K_rN9KsOpOgevujcnwpbrNWrdvsh-PgC6EUSD0jfkmWgyfh6D4AWSdVhexFNFhTMjSVtJAc_mKeyfdV0cbe3059mzKrCCZbWNXHpkd8HcevEWpKq7LVF_TYD-IJzm1lOvuhl2NWzKnTAO6qQ"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#213145]/80 via-transparent to-black/20"></div>
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#213145]/90 backdrop-blur-md text-[#fed65b] text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#fed65b]"></span>
                            ✨ 92% AI MATCH
                          </div>
                        </div>

                        <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#0b1c30] text-[11px] font-semibold">Royal Fine Dining</span>
                              <span className="px-2 py-0.5 rounded-full bg-[#fed65b]/20 text-[#745c00] text-[11px] font-bold">Twilight Candlelight</span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-[22px] font-bold text-[#213145] group-hover:text-[#735c00] transition-colors">
                                  The Grand Haveli Courtyard Dining
                                </h3>
                                <p className="text-[12px] text-[#575d79]">Heritage Estate Road, Kalawad Highway, Rajkot</p>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#213145] text-[#fed65b] text-[14px] font-bold">
                                  <span className="material-symbols-outlined text-[#fed65b] text-xs">star</span>
                                  <span>4.8</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 py-2 text-[12px] text-[#0b1c30]">
                              <span className="font-bold text-[#735c00]">₹1,200 / person</span>
                              <span className="text-[#575d79]">•</span>
                              <span className="text-[#575d79]">15 mins from airport highway</span>
                            </div>
                            <p className="font-['Inter'] text-[13px] text-[#575d79] line-clamp-2">
                              Curated 32-item royal degustation featuring seasonal Undhiyu prepared in earthen matkas, puran poli, saffron shrikhand, smoked aubergine mash, and silver leaf mithai.
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-[11px] uppercase font-bold text-[#575d79]">3 Courtyard Tables Left</span>
                            <div className="flex items-center gap-2">
                              <button className="px-4 py-2 rounded-xl bg-[#e5eeff] text-[#213145] text-[12px] font-semibold hover:bg-[#dce9ff]" onClick={() => handleStateChange('dossier')}>View Details</button>
                              <button className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold shadow-sm" onClick={() => openReservationModal('The Grand Haveli Courtyard Dining')}>Reserve Table</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: GORDHAN THAL */}
                      <div className="group relative rounded-2xl bg-white shadow-md hover:shadow-xl hover:shadow-[#fed65b]/10 transition-all overflow-hidden flex flex-col md:flex-row">
                        <div className="relative md:w-5/12 h-64 md:h-auto overflow-hidden shrink-0">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt="Gordhan Thal"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC9YOD55s6R1gXPs59C-1vcWlkOhy4z02G7GbFB5xqmbIAVcx4yfWvB7eV-efPsGR-LLmPtLjs6rr3LOcNCaA-2nh8Sx82iTkS0CkhrlAeap5s9csS_fwygEvvxJm1YtPHVJp-3dgHbMpu_BROAn0wkMCB8ak1aq4_VJTRMQiZKyXemQD7U5LIjhrz1X0tiIdbPLuKO3Y96Tkg69sXQAuIqdTuGpCJFzjmLFD70bNF70nfvAgtVMvG0Q"
                          />
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-[22px] font-bold text-[#213145]">Gordhan Thal — Saurashtra Heritage Thali</h3>
                                <p className="text-[12px] text-[#575d79]">Yagnik Road, Near Jagnath Temple, Rajkot</p>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#213145] text-[#fed65b] text-[14px] font-bold">
                                <span>4.7⭐</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 py-2 text-[12px] text-[#0b1c30]">
                              <span className="font-bold text-[#735c00]">₹520 / person</span>
                              <span className="text-[#575d79]">• Unlimited Refills</span>
                            </div>
                            <p className="font-['Inter'] text-[13px] text-[#575d79] line-clamp-2">
                              Legendary grand Gujarati thali hospitality. Includes hot Fafda-Jalebi live counter, crispy Lilva kachori, Dal-Baati Churma, sweet Kadhi, basundi, and warm phulkas.
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-[11px] uppercase font-bold text-emerald-600">Instant Seating Allocated</span>
                            <div className="flex items-center gap-2">
                              <button className="px-4 py-2 rounded-xl bg-[#e5eeff] text-[#213145] text-[12px] font-semibold" onClick={() => handleStateChange('dossier')}>View Details</button>
                              <button className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold" onClick={() => openReservationModal('Gordhan Thal')}>Reserve Table</button>
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
                          <span className="material-symbols-outlined text-[#735c00] text-xl">menu_book</span>
                          <h3 className="text-[22px] font-bold text-[#213145]">Rajwadi Kathiyawadi Royal Thal — Daily Menu</h3>
                        </div>
                        <button className="px-3 py-1.5 rounded-xl bg-[#e5eeff] text-[#0b1c30] text-[12px]" onClick={() => handleStateChange('results')}>
                          ✕ Back to Results
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-['Inter']">
                        <div className="p-4 rounded-xl bg-[#eff4ff] space-y-2">
                          <span className="text-[11px] font-['Outfit'] uppercase font-bold text-[#735c00]">Rotla &amp; Bread Basket</span>
                          <ul className="text-[13px] text-[#0b1c30] space-y-1">
                            <li>• Hand-pressed Bajra Rotla with Desi Ghee</li>
                            <li>• Crisp Makai no Rotlo</li>
                            <li>• Hot Puran Poli with Saffron Scent</li>
                            <li>• Phulka Rotli with White Butter</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-[#eff4ff] space-y-2">
                          <span className="text-[11px] font-['Outfit'] uppercase font-bold text-[#735c00]">Royal Shaak (Curries)</span>
                          <ul className="text-[13px] text-[#0b1c30] space-y-1">
                            <li>• Ringna no Olo (Charcoal Smoked)</li>
                            <li>• Sev Tameta nu Shaak (Sweet &amp; Tangy)</li>
                            <li>• Lasaniya Bateta (Garlic or Jain Spiced)</li>
                            <li>• Bharela Bhinda (Stuffed Okra)</li>
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-[#eff4ff] space-y-2">
                          <span className="text-[11px] font-['Outfit'] uppercase font-bold text-[#735c00]">Farsan, Sweets &amp; Dairy</span>
                          <ul className="text-[13px] text-[#0b1c30] space-y-1">
                            <li>• Khaman Dhokla &amp; Fried Green Chillies</li>
                            <li>• Unlimited Chhaas in Clay Matka</li>
                            <li>• Dry Fruit Shrikhand &amp; Basundi</li>
                            <li>• Gor &amp; Ghee Pot (Organic Jaggery)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#e5eeff] flex items-center justify-between">
                        <span className="text-[13px] text-[#575d79] font-['Inter']">Kitchen complies with strict Sattvik &amp; Jain protocol.</span>
                        <button className="px-4 py-2 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold" onClick={() => openReservationModal('Rajwadi Kathiyawadi Royal Thal')}>Proceed to Booking</button>
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
                          <h3 className="text-[22px] font-bold text-[#213145]">Farva Partner Booking Protocol &amp; Digital Token</h3>
                          <p className="text-[13px] font-['Inter'] text-[#575d79]">Seamless dispatch token allocated directly with restaurant management system.</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#eff4ff] space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                          <div>
                            <span className="text-[11px] uppercase text-[#575d79]">Token ID</span>
                            <div className="text-[16px] font-bold text-[#213145]">#CF-RAJ-8842</div>
                          </div>
                          <div>
                            <span className="text-[11px] uppercase text-[#575d79]">Restaurant</span>
                            <div className="text-[16px] font-bold text-[#213145]">Rajwadi Kansa Thal</div>
                          </div>
                          <div>
                            <span className="text-[11px] uppercase text-[#575d79]">Slot &amp; Date</span>
                            <div className="text-[16px] font-bold text-[#213145]">24 Dec · 07:30 PM</div>
                          </div>
                          <div>
                            <span className="text-[11px] uppercase text-[#575d79]">Allocation Status</span>
                            <div className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[12px]">
                              ● Confirmed VIP Table
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-['Inter'] text-[#575d79]">Digital SMS token dispatched to +91 98251 22401. Zero cancellation penalty.</span>
                        <button className="px-4 py-2 rounded-xl bg-[#213145] text-[#fed65b] text-[12px] font-bold" onClick={() => handleStateChange('results')}>Return to Results</button>
                      </div>
                    </div>
                  )}

                  {/* STATE MACHINE ALTERNATIVE 3: FALLBACK */}
                  {protoState === 'fallback' && (
                    <div className="p-12 rounded-2xl bg-white shadow-sm text-center space-y-4 font-['Outfit']" id="view-fallback">
                      <div className="w-20 h-20 mx-auto rounded-full bg-[#eff4ff] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#575d79] text-4xl">search_off</span>
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="text-[22px] font-bold text-[#213145]">No Dining Sanctuaries Match This Filter</h3>
                        <p className="font-['Inter'] text-[15px] text-[#575d79]">
                          We couldn't find restaurants matching your precise dietary criteria in this specific radius. Try loosening the price tier or exploring nearby highway Bhojanalays.
                        </p>
                      </div>
                      <button className="px-4 py-2.5 rounded-xl bg-[#fed65b] text-[#213145] text-[12px] font-bold" onClick={() => handleStateChange('results')}>
                        Reset Filters &amp; View All 48 Places
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
                        <span className="material-symbols-outlined text-base">restaurant</span> Sovereign Table Reservation
                      </div>
                      <h3 className="text-[28px] font-bold text-[#213145]">
                        {modalRestName}
                      </h3>
                      <p className="text-[12px] text-[#575d79]">Guaranteed Zero-Waiting Table Allocation</p>
                    </div>
                    <button className="p-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30]" onClick={() => setIsModalOpen(false)}>
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
                        <span className="text-[11px] text-[#575d79] uppercase">Slot</span>
                        <div className="text-[14px] font-bold text-[#213145]">07:30 PM (Dinner)</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#eff4ff]">
                        <span className="text-[11px] text-[#575d79] uppercase">Guests</span>
                        <div className="text-[14px] font-bold text-[#213145]">4 Guests (Family)</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase text-[#575d79] font-bold">Seating Preference</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <label className="p-2.5 rounded-xl bg-[#213145] text-[#fed65b] text-[12px] font-semibold flex items-center justify-between cursor-pointer">
                          <span>Royal Baithak (Floor)</span>
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                        </label>
                        <label className="p-2.5 rounded-xl bg-[#e5eeff] text-[#0b1c30] text-[12px] flex items-center justify-between cursor-pointer hover:bg-[#dce9ff]">
                          <span>Heritage Garden</span>
                          <span className="material-symbols-outlined text-xs text-[#575d79]">radio_button_unchecked</span>
                        </label>
                        <label className="p-2.5 rounded-xl bg-[#e5eeff] text-[#0b1c30] text-[12px] flex items-center justify-between cursor-pointer hover:bg-[#dce9ff]">
                          <span>AC Family Hall</span>
                          <span className="material-symbols-outlined text-xs text-[#575d79]">radio_button_unchecked</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase text-[#575d79] font-bold">Dietary Instructions for Chef</span>
                      <div className="p-3 rounded-xl bg-[#eff4ff] font-['Inter'] text-[13px] text-[#0b1c30]">
                        "2 Pax Jain preparation (no root veg/garlic/onion) + 2 Pax regular Kathiyawadi with garlic lasaniya chutney on side. Request table near accessible walkway."
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] text-emerald-600 font-bold uppercase">● Table Available</span>
                      <div className="text-[11px] text-[#575d79]">Zero Booking Fee · Guaranteed Reservation</div>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-[#fed65b] text-[#213145] font-bold text-[14px] shadow-md hover:shadow-[0_0_20px_rgba(254,214,91,0.5)] transition-all" onClick={confirmReservation}>
                      Confirm Table Reservation ✨
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
                      EXPERIENTIAL GASTRONOMY
                    </div>
                    <h2 className="text-[40px] leading-[48px] font-bold text-[#213145]">
                      Unforgettable Gujarat Culinary Journeys
                    </h2>
                    <p className="font-['Inter'] text-[15px] text-[#575d79]">
                      Beyond standard restaurants: immersive sensory feasts curated across heritage palaces, night markets, and desert camps.
                    </p>
                  </div>
                  <button className="text-[14px] text-[#735c00] font-bold hover:underline flex items-center gap-1">
                    <span>View All 12 Trails</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Trail 1 */}
                  <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Heritage Haveli Dinner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_iHkBRYeZ320Jh5phUx50Q1ArEp5vxKVAkhpiaHAymR9L-pBV_hTN_mDxJGsR_K2Lp45csQvwVJgRrW3rQKXUXaBrIkXXBLnP0yMhKOTOORPvULtUEMFenhZHGU9fjGiXCOlgKqzBFRdMMy_9wZCyjJyQbsMfzCjP8Xrd1OS7duoxreEmxv2k5PAl5bU5QMyIjaDUbRu1La0n61bhMEn5Mo73Mi9T5YRsxiCRPI7tBrq8hDFp7bJ7Bg" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#fed65b] text-[#745c00]">Junagadh &amp; Rajkot</span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#213145]">Heritage Haveli Candlelight Feast</h3>
                        <p className="font-['Inter'] text-[13px] text-[#575d79] mt-1">
                          Private courtyard dining under Saurashtra starlight with personal Maharaj, sitar player, and vintage brass dinnerware service.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[12px] text-[#735c00] font-bold">₹2,400 / couple</span>
                        <button className="text-[12px] text-[#213145] font-bold hover:underline" onClick={() => openReservationModal('Heritage Haveli Candlelight Feast')}>Reserve Trail →</button>
                      </div>
                    </div>
                  </div>

                  {/* Trail 2 */}
                  <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Manek Chowk Food Walk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAExK2j6GaJmZYBVKUryMutLw69mJbZ-fEIM_JRscsOr5k9IqIfwYXcfzEEFH5i2vM5gtbJcxyzC1m65Xo130kV8zV-Kl81S_Vg4fQXjXuCtt5pa--8i_lFZF71QjcPtgijX1eHM7lhGOE4zJLEg073bk-1CGF82aoZWXspqTKQPlwLFHmr4NZP88ubx8slrxS4xvbzc6DhWDcZiBMsY5aIo8GN2DUH-NQ57WMMB7TRFXCtyg20lFTsZg" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#fed65b] text-[#745c00]">Ahmedabad UNESCO Pol</span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#213145]">Old Ahmedabad Midnight Farsan Walk</h3>
                        <p className="font-['Inter'] text-[13px] text-[#575d79] mt-1">
                          Guided night exploration through Manek Chowk jewelers market turned vibrant street food haven with 8 curated tastings.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[12px] text-[#735c00] font-bold">₹850 / person</span>
                        <button className="text-[12px] text-[#213145] font-bold hover:underline" onClick={() => openReservationModal('Old Ahmedabad Midnight Farsan Walk')}>Reserve Trail →</button>
                      </div>
                    </div>
                  </div>

                  {/* Trail 3 */}
                  <div className="group rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="White Rann Desert Dinner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwO68CjmHxhu6vFv49C7POA2eHBi3I8-VOCTe6cF2X911cA9nEimIsCIA__hKd37TgO4WFsONfPMvEN7txmbGArWQk6imRyxqJcfqbeEjaZYOjJFYdCQb8lMyvY8gokoMRVCiopiByJcZ3Fbco8bf_MnwubzUY2s5d8k8kKllXTatZqbqeeRqGl9athggSFgLFB8Px8GreqT2mQ4ncWgy2JYKU1vmmk16ZU195DESU1lmBwLZ6VwTn5w" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#fed65b] text-[#745c00]">White Rann Sanctuary</span>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#213145]">White Rann Glamping Sunset Bajra Rasoi</h3>
                        <p className="font-['Inter'] text-[13px] text-[#575d79] mt-1">
                          Authentic Kutchi salt-pan culinary masterclass featuring curd curry (kadhi), bajra rotla cooked on cow dung fuel, and fresh jaggery tea.
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[12px] text-[#735c00] font-bold">₹1,800 / person</span>
                        <button className="text-[12px] text-[#213145] font-bold hover:underline" onClick={() => openReservationModal('White Rann Glamping Sunset Bajra Rasoi')}>Reserve Trail →</button>
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
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-xl bg-white/10">
                    <span className="material-symbols-outlined text-[#fed65b] text-2xl">temple_hindu</span>
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
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#fed65b] font-semibold">Verified Gujarat Tourism Accredited</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white font-semibold">PCI-DSS Royal Secure</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[18px] text-white font-bold tracking-tight">Sovereign Desk</div>
                <ul className="space-y-1 font-['Inter'] text-[13px] text-[#c0c5e5]">
                  <li><a className="hover:text-[#fed65b]" href="#">Imperial Concierge 24/7</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Bespoke Royal Charters</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Private Culinary Tours</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">VIP Temple Dining Protocol</a></li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-[18px] text-white font-bold tracking-tight">Transit Corridors</div>
                <ul className="space-y-1 font-['Inter'] text-[13px] text-[#c0c5e5]">
                  <li><a className="hover:text-[#fed65b]" href="#">Ahmedabad – Rajkot High-Speed</a></li>
                  <li><Link className="hover:text-[#fed65b]" href="/buses">GSRTC Sovereign Sleeper</Link></li>
                  <li><Link className="hover:text-[#fed65b]" href="/trains">Vande Bharat Saurashtra Link</Link></li>
                  <li><Link className="hover:text-[#fed65b]" href="/flights">Aviation Gateway Protocol</Link></li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-[18px] text-white font-bold tracking-tight">Flagship Circuits</div>
                <ul className="space-y-1 font-['Inter'] text-[13px] text-[#c0c5e5]">
                  <li><a className="hover:text-[#fed65b]" href="#">Kutch White Rann Solitude</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Gir Asiatic Lion Sanctuaries</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Patan &amp; Modhera Route</a></li>
                  <li><a className="hover:text-[#fed65b]" href="#">Dwarka-Bet Holy Estuary</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#d3e4fe]/80 text-[12px] font-['Inter']">
              <div>© 2025 BharatYatra Technologies Ltd. Sovereign Gujarat Travel Engine.</div>
              <div className="flex items-center gap-6">
                <span>Department of Tourism Government of Gujarat Partner</span>
                <span>Guaranteed Table SLA: &lt; 90s</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

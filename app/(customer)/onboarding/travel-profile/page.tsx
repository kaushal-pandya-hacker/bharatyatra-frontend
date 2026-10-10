'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { searchCities, reverseGeocode, resolveCityCoordinates, CityItem } from '@/lib/data/indian-cities';
import { saveUserTravelProfile, TravelProfile } from '@/lib/profile/travel-profile';

export default function TravelProfileOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  // Location State
  const [cityInput, setCityInput] = useState('Ahmedabad');
  const [selectedCity, setSelectedCity] = useState<CityItem>({
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
  });
  const [citySuggestions, setCitySuggestions] = useState<CityItem[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [locating, setLocating] = useState(false);

  // Travel Preferences
  const [travelStyle, setTravelStyle] = useState<string>('balanced');
  const [interests, setInterests] = useState<string[]>(['heritage', 'nature']);
  const [transport, setTransport] = useState<string[]>(['train', 'bus']);

  // Trip Preferences
  const [typicalTravelers, setTypicalTravelers] = useState<number>(2);
  const [budget, setBudget] = useState<string>('moderate');
  const [pace, setPace] = useState<string>('balanced');

  // Prefill name from logged in user if available
  useEffect(() => {
    if (user && user.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);

  // Handle City Search Autocomplete
  const handleCityInputChange = (val: string) => {
    setCityInput(val);
    if (val.trim().length > 0) {
      setCitySuggestions(searchCities(val));
      setShowCityDropdown(true);
    } else {
      setCitySuggestions([]);
      setShowCityDropdown(false);
    }
  };

  const handleSelectCity = (c: CityItem) => {
    setSelectedCity(c);
    setCityInput(c.city);
    setShowCityDropdown(false);
  };

  // Browser Location Handler
  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const matchedCity = await reverseGeocode(lat, lng);
          setSelectedCity(matchedCity);
          setCityInput(matchedCity.city);
        } catch (e) {
          setErrorMsg('Failed to reverse geocode location. Please select your city manually.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg('Location permission denied. Please search and select your city manually below.');
        } else {
          setErrorMsg('Unable to retrieve location. Please select your city manually.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Toggle Interests Multi-Select
  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Toggle Transport Multi-Select
  const toggleTransport = (item: string) => {
    setTransport((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  };

  // Step Navigations
  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!fullName || !fullName.trim()) {
        setErrorMsg('Please enter your full name to proceed.');
        return;
      }
    } else if (step === 2) {
      if (!cityInput || !cityInput.trim()) {
        setErrorMsg('Please select your starting city.');
        return;
      }
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  // Complete Onboarding
  const handleCompleteOnboarding = async () => {
    setSubmitting(true);
    setErrorMsg('');

    const resolvedCoords = selectedCity.latitude
      ? selectedCity
      : resolveCityCoordinates(cityInput);

    const profileData: Partial<TravelProfile> = {
      fullName: fullName.trim(),
      origin: {
        city: resolvedCoords.city,
        state: resolvedCoords.state,
        country: resolvedCoords.country || 'India',
        latitude: resolvedCoords.latitude,
        longitude: resolvedCoords.longitude,
      },
      travelStyle,
      budget,
      pace,
      transport,
      interests,
      typicalTravelers,
      preferredLanguage,
      completed: true,
    };

    try {
      await saveUserTravelProfile(profileData);
      router.push('/dashboard');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save travel profile. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Top Header */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between z-30 shadow-xs">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="BharatYatra Logo" className="h-10 w-auto object-contain" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900">BharatYatra</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Step {step} of 4</span>
          <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        {/* Onboarding Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Let&apos;s personalize BharatYatra for you.
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Tell us a little about yourself so we can plan journeys around where you are and how you love to travel.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600">error</span>
              <span>{errorMsg}</span>
            </div>
            <button type="button" onClick={() => setErrorMsg('')} className="text-rose-600 font-bold hover:text-rose-900">✕</button>
          </div>
        )}

        {/* CARD CONTAINER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl transition-all">
          {/* ================================================= */}
          {/* STEP 1: ABOUT YOU */}
          {/* ================================================= */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl">
                  👤
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Step 1 — About You</h2>
                  <p className="text-slate-500 text-sm font-medium">How should we address you across BharatYatra?</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-extrabold text-slate-800 mb-2">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kaushal Pandya"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:ring-0 text-slate-900 font-bold text-lg transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-slate-800 mb-2">
                    Preferred Language
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { code: 'en', label: 'English', icon: '🇬🇧' },
                      { code: 'gu', label: 'ગુજરાતી', icon: '🦁' },
                      { code: 'hi', label: 'हिंदी', icon: '🇮🇳' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setPreferredLanguage(lang.code)}
                        className={`p-4 rounded-2xl border-2 font-bold text-base flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          preferredLanguage === lang.code
                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{lang.icon}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 2: YOUR STARTING POINT */}
          {/* ================================================= */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xl">
                  📍
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Step 2 — Your Starting Point</h2>
                  <p className="text-slate-500 text-sm font-medium">Where do you usually start your journeys from?</p>
                </div>
              </div>

              {/* Location Privacy Guarantee Note */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center gap-3 font-medium">
                <span className="material-symbols-outlined text-blue-700 text-xl shrink-0">shield</span>
                <span>
                  <strong>Privacy First:</strong> We only store city-level origin (e.g., Ahmedabad). We never ask for your home address.
                </span>
              </div>

              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {locating ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Detecting city location...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">my_location</span>
                    <span>Use my current location</span>
                  </>
                )}
              </button>

              <div className="relative text-center my-2">
                <span className="bg-white px-4 text-xs font-bold uppercase text-slate-400">or select city manually</span>
                <div className="w-full h-px bg-slate-200 absolute top-1/2 left-0 -z-10" />
              </div>

              {/* Search City Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-extrabold text-slate-800 mb-2">
                  Starting City <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => handleCityInputChange(e.target.value)}
                    onFocus={() => setShowCityDropdown(true)}
                    placeholder="Search city (e.g. Ahmedabad, Surat, Vadodara, Mumbai...)"
                    className="w-full px-5 py-4 pl-12 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:ring-0 text-slate-900 font-bold text-lg transition-all outline-none"
                  />
                  <span className="material-symbols-outlined text-slate-400 absolute left-4 top-4 text-2xl">search</span>
                </div>

                {/* Suggestions Dropdown */}
                {showCityDropdown && citySuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2">
                    {citySuggestions.map((c) => (
                      <button
                        key={`${c.city}-${c.state}`}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 flex items-center justify-between transition-all"
                      >
                        <div>
                          <strong className="block font-bold text-slate-900">{c.city}</strong>
                          <span className="text-xs text-slate-500 font-medium">{c.state}, {c.country}</span>
                        </div>
                        {c.popular && (
                          <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Popular</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected City Confirmation */}
              {selectedCity && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-2xl">location_on</span>
                    <div>
                      <p className="font-extrabold text-base">📍 {selectedCity.city}</p>
                      <p className="text-xs font-semibold text-emerald-700">{selectedCity.state}, {selectedCity.country}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">Origin Set</span>
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 3: TRAVEL PREFERENCES */}
          {/* ================================================= */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xl">
                  🧳
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Step 3 — Travel Preferences</h2>
                  <p className="text-slate-500 text-sm font-medium">What kind of traveler are you?</p>
                </div>
              </div>

              {/* Travel Style Single Selection */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Travel Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'relaxed', label: 'Relaxed', icon: '🌿' },
                    { id: 'balanced', label: 'Balanced', icon: '⚖️' },
                    { id: 'adventure', label: 'Adventure', icon: '🧗' },
                    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
                    { id: 'spiritual', label: 'Spiritual', icon: '🛕' },
                    { id: 'luxury', label: 'Luxury', icon: '👑' },
                    { id: 'budget', label: 'Budget', icon: '🎒' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTravelStyle(style.id)}
                      className={`p-3 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                        travelStyle === style.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{style.icon}</span>
                      <span>{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests Multi-Select */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">What do you usually enjoy? (Select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'nature', label: 'Nature', icon: '🌳' },
                    { id: 'heritage', label: 'Heritage', icon: '🏛️' },
                    { id: 'beaches', label: 'Beaches', icon: '🏖️' },
                    { id: 'mountains', label: 'Mountains', icon: '🏔️' },
                    { id: 'food', label: 'Food & Culinary', icon: '🍱' },
                    { id: 'spiritual', label: 'Spiritual Shrines', icon: '🕉️' },
                    { id: 'adventure', label: 'Adventure', icon: '🚴' },
                    { id: 'culture', label: 'Culture & Crafts', icon: '🎨' },
                    { id: 'shopping', label: 'Local Shopping', icon: '🛍️' },
                    { id: 'wildlife', label: 'Wildlife Safaris', icon: '🦁' },
                  ].map((item) => {
                    const isSelected = interests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInterest(item.id)}
                        className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transport Preference */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">How do you usually travel?</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'car', label: 'Car', icon: '🚗' },
                    { id: 'bus', label: 'Bus', icon: '🚌' },
                    { id: 'train', label: 'Train', icon: '🚆' },
                    { id: 'flight', label: 'Flight', icon: '✈️' },
                    { id: 'mixed', label: 'Mixed', icon: '🔄' },
                  ].map((t) => {
                    const isSelected = transport.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTransport(t.id)}
                        className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl">{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 4: TRIP PREFERENCES */}
          {/* ================================================= */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xl">
                  🎯
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Step 4 — Trip Preferences</h2>
                  <p className="text-slate-500 text-sm font-medium">Help BharatYatra plan trips that fit you.</p>
                </div>
              </div>

              {/* Typical Travelers */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Typical Travelers</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { num: 1, label: 'Solo (1)' },
                    { num: 2, label: 'Couple (2)' },
                    { num: 3, label: 'Small Group (3–4)' },
                    { num: 5, label: 'Family/Group (5+)' },
                  ].map((item) => (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => setTypicalTravelers(item.num)}
                      className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all cursor-pointer ${
                        typicalTravelers === item.num
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Tier */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Budget Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'budget', label: 'Budget Friendly', desc: 'Economical homestays & bus' },
                    { id: 'moderate', label: 'Moderate', desc: 'Comfortable 3-star stays & AC train' },
                    { id: 'premium', label: 'Premium', desc: 'Luxury resorts & private AC cars' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`p-4 rounded-2xl border-2 font-bold text-left transition-all cursor-pointer ${
                        budget === b.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-base font-extrabold">{b.label}</p>
                      <p className={`text-xs mt-1 font-medium ${budget === b.id ? 'text-amber-100' : 'text-slate-500'}`}>{b.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip Pace (Optional) */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Preferred Trip Pace (Optional)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'slow', label: 'Slow & Leisurely' },
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'packed', label: 'Packed & Fast' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPace(p.id)}
                      className={`p-3.5 rounded-2xl border-2 font-bold text-sm text-center transition-all cursor-pointer ${
                        pace === p.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS FOOTER */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-all cursor-pointer"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={submitting}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Saving Travel Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile & Go to Dashboard</span>
                    <span>🚀</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-6 text-xs text-slate-400 font-medium">
        © 2026 BharatYatra Technologies. BharatYatra Travel Personalization Engine.
      </footer>
    </div>
  );
}

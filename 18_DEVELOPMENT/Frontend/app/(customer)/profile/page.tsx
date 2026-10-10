'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import {
  fetchUserTravelProfile,
  saveUserTravelProfile,
  TravelProfile,
  calculateProfileCompletionPercentage,
} from '@/lib/profile/travel-profile';
import { searchCities, reverseGeocode, resolveCityCoordinates, CityItem } from '@/lib/data/indian-cities';
import { TravelOriginMap } from '@/components/maps/travel-maps';
import { NotificationSettingsPanel } from '@/components/notifications/notification-settings-panel';

function ProfilePageContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  // Origin Location
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

  // Preferences
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [interests, setInterests] = useState<string[]>(['heritage', 'nature']);
  const [transport, setTransport] = useState<string[]>(['train', 'bus']);
  const [budget, setBudget] = useState('moderate');
  const [pace, setPace] = useState('balanced');
  const [typicalTravelers, setTypicalTravelers] = useState<number>(2);

  // Load Existing Profile
  useEffect(() => {
    async function initProfile() {
      try {
        const prof = await fetchUserTravelProfile();
        if (prof) {
          if (prof.fullName) setFullName(prof.fullName);
          if (prof.preferredLanguage) setPreferredLanguage(prof.preferredLanguage);
          if (prof.origin) {
            setCityInput(prof.origin.city || 'Ahmedabad');
            setSelectedCity({
              city: prof.origin.city || 'Ahmedabad',
              state: prof.origin.state || 'Gujarat',
              country: prof.origin.country || 'India',
              latitude: prof.origin.latitude || 23.0225,
              longitude: prof.origin.longitude || 72.5714,
            });
          }
          if (prof.travelStyle) setTravelStyle(prof.travelStyle);
          if (prof.budget) setBudget(prof.budget);
          if (prof.pace) setPace(prof.pace);
          if (prof.transport) setTransport(prof.transport);
          if (prof.interests) setInterests(prof.interests);
          if (prof.typicalTravelers) setTypicalTravelers(prof.typicalTravelers);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    initProfile();
  }, []);

  // Autocomplete City Search
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

  // Browser Location
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
          setErrorMsg('Failed to reverse geocode location. Please select city manually.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setErrorMsg('Location permission denied or unavailable. Please select your city manually.');
      },
      { timeout: 10000 }
    );
  };

  // Toggle Selection Helpers
  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleTransport = (item: string) => {
    setTransport((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName || !fullName.trim()) {
      setErrorMsg('Full name is required');
      setSaving(false);
      return;
    }

    const resolvedCoords = selectedCity.latitude
      ? selectedCity
      : resolveCityCoordinates(cityInput);

    const profilePayload: Partial<TravelProfile> = {
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
      await saveUserTravelProfile(profilePayload);
      setSuccessMsg('Your BharatYatra Travel Profile has been updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile updates.');
    } finally {
      setSaving(false);
    }
  };

  const currentProfileState: Partial<TravelProfile> = {
    fullName,
    origin: selectedCity,
    travelStyle,
    interests,
    transport,
    budget,
    pace,
    typicalTravelers,
  };

  const completionPct = calculateProfileCompletionPercentage(currentProfileState);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 pb-16">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="BharatYatra Logo" className="h-10 w-auto object-contain" />
          <span className="font-black text-xl text-slate-900 tracking-tight">BharatYatra</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Page Title & Completion Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Traveler Account & Personalization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Your Travel Profile
            </h1>
            <p className="text-slate-300 text-base font-medium">
              Manage your origin location, travel style, and preferences used across AI trip planning.
            </p>
          </div>

          {/* Completion Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[260px] space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-white">
              <span>Profile Completion</span>
              <span className="text-amber-300 font-black text-base">{completionPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              {completionPct < 100
                ? 'Your travel profile is ' + completionPct + '% complete'
                : '100% Complete — Perfect for AI Planning!'}
            </p>
          </div>
        </section>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              <span>{successMsg}</span>
            </div>
            <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-700">✕</button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600">error</span>
              <span>{errorMsg}</span>
            </div>
            <button type="button" onClick={() => setErrorMsg('')} className="text-rose-700">✕</button>
          </div>
        )}

        {/* PROFILE EDIT FORM */}
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-blue-600 text-2xl">badge</span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">1. Personal Information</h2>
                <p className="text-xs text-slate-500 font-medium">Your identity & contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-bold text-base outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">
                  Preferred Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-bold text-base outline-none bg-white"
                >
                  <option value="en">English (UK/IN)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: TRAVEL ORIGIN */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-amber-600 text-2xl">location_on</span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">2. Travel Origin Location</h2>
                <p className="text-xs text-slate-500 font-medium">Where do you usually start your trips from?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {locating ? (
                    <span>Locating...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">my_location</span>
                      <span>Use my current location</span>
                    </>
                  )}
                </button>

                <div className="relative">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Search City</label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => handleCityInputChange(e.target.value)}
                    onFocus={() => setShowCityDropdown(true)}
                    placeholder="Search city (e.g. Ahmedabad, Surat...)"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-600 text-slate-900 font-bold text-base outline-none"
                  />

                  {showCityDropdown && citySuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-2">
                      {citySuggestions.map((c) => (
                        <button
                          key={`${c.city}-${c.state}`}
                          type="button"
                          onClick={() => handleSelectCity(c)}
                          className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between text-sm"
                        >
                          <div>
                            <strong className="block text-slate-900">{c.city}</strong>
                            <span className="text-xs text-slate-500">{c.state}, {c.country}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-bold text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">City</span>
                    <span>{selectedCity.city}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">State</span>
                    <span>{selectedCity.state}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Country</span>
                    <span>{selectedCity.country}</span>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="lg:col-span-5 space-y-2">
                <p className="text-xs font-extrabold text-slate-700">Origin Location Map</p>
                <TravelOriginMap origin={selectedCity} height="230px" />
              </div>
            </div>
          </div>

          {/* SECTION 3: TRAVEL STYLE & INTERESTS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">style</span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">3. Travel Style & Interests</h2>
                <p className="text-xs text-slate-500 font-medium">How do you love to explore?</p>
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-2">Travel Style</label>
              <div className="flex flex-wrap gap-2">
                {['relaxed', 'balanced', 'adventure', 'family', 'spiritual', 'luxury', 'budget'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTravelStyle(st)}
                    className={`px-4 py-2.5 rounded-xl border font-extrabold text-xs uppercase tracking-wider transition-all capitalize cursor-pointer ${
                      travelStyle === st
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests Multi Select */}
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {['nature', 'heritage', 'beaches', 'mountains', 'food', 'spiritual', 'adventure', 'culture', 'shopping', 'wildlife'].map((item) => {
                  const isSelected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-xs capitalize transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4: TRANSPORT & BUDGET */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-purple-600 text-2xl">directions_transit</span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">4. Transport, Budget & Pace</h2>
                <p className="text-xs text-slate-500 font-medium">Logistics context for itinerary generation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Transport */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Transport Options</label>
                <div className="flex flex-wrap gap-2">
                  {['car', 'bus', 'train', 'flight', 'mixed'].map((t) => {
                    const isSelected = transport.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTransport(t)}
                        className={`px-3 py-2 rounded-xl border font-bold text-xs capitalize transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Budget Tier</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm outline-none bg-white"
                >
                  <option value="budget">Budget Friendly</option>
                  <option value="moderate">Moderate Comfort</option>
                  <option value="premium">Premium Luxury</option>
                </select>
              </div>

              {/* Typical Travelers */}
              <div>
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Typical Travelers</label>
                <select
                  value={typicalTravelers}
                  onChange={(e) => setTypicalTravelers(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-sm outline-none bg-white"
                >
                  <option value={1}>1 Solo</option>
                  <option value={2}>2 Couple</option>
                  <option value={3}>3-4 Small Group</option>
                  <option value={5}>5+ Family / Large Group</option>
                </select>
              </div>
            </div>
          </div>

          {/* Web Push & Notification Preferences Settings */}
          <section className="pt-2">
            <NotificationSettingsPanel />
          </section>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Save Travel Profile</span>
                  <span>✓</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
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

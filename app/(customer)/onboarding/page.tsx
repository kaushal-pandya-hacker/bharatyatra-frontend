'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  Car,
  Plane,
  Train,
  Bus,
  Bike,
  Route,
  Hotel,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Heart,
  Calendar,
  Check,
  MapPin,
  Camera,
  Coffee,
  Mountain,
  Sun,
  ShieldAlert,
  ChevronRight,
  Edit2,
  Bookmark,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  TravelProfile,
  fetchUserTravelProfile,
  saveUserTravelProfile,
  skipUserOnboarding,
  DEFAULT_TRAVEL_PROFILE,
} from '@/lib/profile/travel-profile';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const { user } = useAuth();

  // Wizard Step (1 to 9)
  const [currentStep, setCurrentStep] = useState<number>(isEditMode ? 8 : 1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- Step 2: Traveller Info State ---
  const [groupType, setGroupType] = useState<string>('Family');
  const [totalPax, setTotalPax] = useState<number>(2);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [seniors, setSeniors] = useState<number>(0);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);

  // --- Step 3: Travel Mode State ---
  const [travelModePreference, setTravelModePreference] = useState<'road_trip' | 'book_transport' | 'mixed' | 'not_sure'>('road_trip');
  const [roadVehicleType, setRoadVehicleType] = useState<string>('Car');
  const [isVehicleOwned, setIsVehicleOwned] = useState<boolean>(true);
  const [vehicleCount, setVehicleCount] = useState<number>(1);
  const [isLongDistanceReady, setIsLongDistanceReady] = useState<boolean>(true);
  const [drivingPace, setDrivingPace] = useState<string>('relaxed');
  const [bookedTransportModes, setBookedTransportModes] = useState<string[]>(['flight', 'train']);
  const [mixedPreferences, setMixedPreferences] = useState<string[]>(['flight_plus_cab', 'train_plus_road']);

  // --- Step 4: Bookings Needed State ---
  const [bookingPreferences, setBookingPreferences] = useState<string[]>([
    'hotels',
    'local_activities',
  ]);
  const [arrangeMyself, setArrangeMyself] = useState<boolean>(false);

  // --- Step 5: Accommodation State ---
  const [accommodationTypes, setAccommodationTypes] = useState<string[]>([
    'standard',
    'resorts',
  ]);
  const [roomCount, setRoomCount] = useState<number>(1);
  const [roomArrangement, setRoomArrangement] = useState<string>('King Bed');
  const [roomAccessibility, setRoomAccessibility] = useState<string>('Standard Room');

  // --- Step 6: Budget State ---
  const [budgetScope, setBudgetScope] = useState<'per_person' | 'total_group'>('total_group');
  const [budgetRange, setBudgetRange] = useState<string>('25k_50k');
  const [customBudgetAmount, setCustomBudgetAmount] = useState<number>(35000);

  // --- Step 7: Style & Pace State ---
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Historical Places',
    'Nature & Scenic',
    'Food & Local Culture',
  ]);
  const [travelPace, setTravelPace] = useState<'relaxed' | 'balanced' | 'active'>('balanced');
  const [explorationStyle, setExplorationStyle] = useState<'fewer_deep' | 'balanced' | 'more_destinations'>('balanced');

  // Load existing profile if available on mount
  useEffect(() => {
    async function loadInitialProfile() {
      try {
        const prof = await fetchUserTravelProfile(user?.id);
        if (prof) {
          if (prof.groupType) setGroupType(prof.groupType);
          if (prof.typicalTravelers) setTotalPax(prof.typicalTravelers);
          if (prof.travelerComposition) {
            setAdults(prof.travelerComposition.adults || 2);
            setChildren(prof.travelerComposition.children || 0);
            setInfants(prof.travelerComposition.infants || 0);
            setSeniors(prof.travelerComposition.seniors || 0);
          }
          if (prof.travelModePreference) setTravelModePreference(prof.travelModePreference);
          if (prof.bookingPreferences && prof.bookingPreferences.length > 0) {
            setBookingPreferences(prof.bookingPreferences);
            setArrangeMyself(prof.bookingPreferences.includes('arrange_myself'));
          }
          if (prof.accommodationTypes && prof.accommodationTypes.length > 0) {
            setAccommodationTypes(prof.accommodationTypes);
          }
          if (prof.budgetScope) setBudgetScope(prof.budgetScope);
          if (prof.budgetRange) setBudgetRange(prof.budgetRange);
          if (prof.customBudgetAmount) setCustomBudgetAmount(prof.customBudgetAmount);
          if (prof.interests && prof.interests.length > 0) setSelectedInterests(prof.interests);
          if (prof.pace) setTravelPace(prof.pace as any);
          if (prof.explorationStyle) setExplorationStyle(prof.explorationStyle);
          if (prof.roomRequirements?.roomCount) setRoomCount(prof.roomRequirements.roomCount);
        }
      } catch (e) {}
    }
    loadInitialProfile();
  }, [user]);

  // Keep totalPax in sync with adults + children + infants + seniors
  const compositionTotal = adults + children + infants + seniors;
  const isCompositionValid = compositionTotal === totalPax;

  // Toggle helper for multi-select arrays
  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Handle Skip
  const handleSkip = async () => {
    await skipUserOnboarding(user?.id);
    router.push('/');
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setNotification(null);

    const profileData: Partial<TravelProfile> = {
      fullName: user?.fullName || 'BharatYatra Traveler',
      typicalTravelers: totalPax,
      completed: true,
      onboardingStatus: 'COMPLETED',
      groupType,
      travelerComposition: {
        adults,
        children,
        infants,
        seniors,
      },
      travelModePreference,
      ownVehicleDetails: travelModePreference === 'road_trip' ? {
        vehicleType: roadVehicleType,
        isOwned: isVehicleOwned,
        vehicleCount,
        longDistanceReady: isLongDistanceReady,
        drivingPace,
      } : undefined,
      bookingPreferences: arrangeMyself ? ['arrange_myself'] : bookingPreferences,
      accommodationTypes,
      roomRequirements: {
        roomCount,
        arrangement: roomArrangement,
        accessibility: roomAccessibility,
      },
      budgetScope,
      budgetRange,
      customBudgetAmount,
      interests: selectedInterests,
      pace: travelPace,
      explorationStyle,
      accessibilityRequirements: accessibilityNeeds,
    };

    try {
      await saveUserTravelProfile(profileData, user?.id);
      setIsSaving(false);
      setCurrentStep(9); // Show Step 9 Dashboard
    } catch (e) {
      setIsSaving(false);
      setNotification('Unable to save travel profile to server. Local copy saved.');
      setCurrentStep(9);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-white selection:bg-amber-400 selection:text-slate-950 font-sans flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-[#2A3656] bg-[#141A32]/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="BharatYatra Logo" className="h-10 w-auto object-contain" />
          <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold hidden sm:inline">
            Traveler Intelligence
          </span>
        </Link>

        {/* Step Progress Pills (Steps 1–8) */}
        {currentStep <= 8 && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (s < currentStep || isEditMode) setCurrentStep(s);
                }}
                className={`h-2 rounded-full transition-all ${
                  s === currentStep
                    ? 'w-6 bg-amber-400'
                    : s < currentStep
                    ? 'w-2 bg-emerald-400 cursor-pointer'
                    : 'w-2 bg-slate-800'
                }`}
                title={`Step ${s}`}
              />
            ))}
            <span className="text-xs text-slate-400 ml-2 font-mono">
              Step {currentStep} of 8
            </span>
          </div>
        )}

        {/* Skip for now option */}
        {currentStep <= 8 && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition"
          >
            Skip for Now
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex-1 flex flex-col justify-center">
        {/* =================================================================== */}
        {/* STEP 1: WELCOME SCREEN                                              */}
        {/* =================================================================== */}
        {currentStep === 1 && (
          <div className="bg-[#141A32] border border-[#2A3656] rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            <div className="relative z-10 space-y-6 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Welcome to BharatYatra
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Let's understand how you love to travel.
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                We'll personalize your journeys around you. Answer a few brief questions so your AI itineraries,
                transportation options, and stay recommendations are perfectly tailored every time.
              </p>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
                <div className="bg-[#0A1128]/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Adaptive AI Pacing</h4>
                  <p className="text-[11px] text-slate-400">
                    No rushing. Duration and daily schedules dynamically balance transit with rest.
                  </p>
                </div>

                <div className="bg-[#0A1128]/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Your Vehicle or Bookings</h4>
                  <p className="text-[11px] text-slate-400">
                    Tell us if you love road trips or want flights and train tickets arranged for you.
                  </p>
                </div>

                <div className="bg-[#0A1128]/70 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Zero Invented Costs</h4>
                  <p className="text-[11px] text-slate-400">
                    Calculated using verified rates, room occupancy math, and actual highway distances.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl transition shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <span>Start Planning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full sm:w-auto px-6 py-4 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: TRAVELLER INFORMATION                                      */}
        {/* =================================================================== */}
        {currentStep === 2 && (
          <div className="bg-[#141A32] border border-[#2A3656] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 2 • Party Details</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Who is travelling with you?</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Tell us your typical travel group size and composition so we allocate the right number of rooms and seats.
              </p>
            </div>

            {/* Travel Group Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Travel Group Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Solo', 'Couple', 'Family', 'Friends', 'Group tour', 'Corporate', 'Other'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setGroupType(t);
                      if (t === 'Solo') {
                        setTotalPax(1);
                        setAdults(1);
                        setChildren(0);
                        setInfants(0);
                        setSeniors(0);
                      } else if (t === 'Couple') {
                        setTotalPax(2);
                        setAdults(2);
                        setChildren(0);
                        setInfants(0);
                        setSeniors(0);
                      }
                    }}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition ${
                      groupType === t
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-[#0A1128] text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Travellers Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Travellers</label>
                <span className="text-sm font-black text-amber-300">{totalPax} {totalPax === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 4, 6, 10, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      setTotalPax(count);
                      setAdults(count);
                      setChildren(0);
                      setInfants(0);
                      setSeniors(0);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      totalPax === count
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-[#0A1128] text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {count === 1 ? '1 Solo' : count === 15 ? '12+ Pax' : `${count} Pax`}
                  </button>
                ))}
              </div>
            </div>

            {/* Traveller Composition Breakdown */}
            <div className="bg-[#0A1128] p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Traveller Composition</span>
                <span className={`text-[11px] font-mono ${isCompositionValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Sum: {compositionTotal} / {totalPax} Pax {isCompositionValid ? '✓' : '(Please balance)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Adults */}
                <div className="bg-[#141A32] p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block font-semibold">Adults (12+)</span>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-white">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="bg-[#141A32] p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block font-semibold">Children (2–11)</span>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-white">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="bg-[#141A32] p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block font-semibold">Infants (&lt; 2)</span>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-white">{infants}</span>
                    <button
                      type="button"
                      onClick={() => setInfants(infants + 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Seniors */}
                <div className="bg-[#141A32] p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block font-semibold">Seniors (60+)</span>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setSeniors(Math.max(0, seniors - 1))}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-white">{seniors}</span>
                    <button
                      type="button"
                      onClick={() => setSeniors(seniors + 1)}
                      className="w-7 h-7 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Accessibility Requirements */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Accessibility & Comfort Needs</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'senior_friendly', label: 'Senior-Friendly Pacing & Steps' },
                  { id: 'child_friendly', label: 'Child-Friendly Stays & Stops' },
                  { id: 'wheelchair', label: 'Wheelchair / Elevator Access' },
                ].map((item) => {
                  const isChecked = accessibilityNeeds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(accessibilityNeeds, setAccessibilityNeeds, item.id)}
                      className={`p-3 rounded-xl text-left text-xs font-semibold border transition flex items-center gap-2 ${
                        isChecked
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : 'bg-[#0A1128] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isChecked ? 'text-teal-400' : 'text-slate-600'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setTotalPax(compositionTotal > 0 ? compositionTotal : totalPax);
                  setCurrentStep(3);
                }}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: HOW DO YOU WANT TO TRAVEL?                                 */}
        {/* =================================================================== */}
        {currentStep === 3 && (
          <div className="bg-[#141A32] border border-[#2A3656] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 3 • Transportation</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">How would you like to explore India?</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Whether you prefer personal road trips or scheduled flights and superfast trains, we calibrate every route.
              </p>
            </div>

            {/* The 4 Major Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Road Trip */}
              <div
                onClick={() => setTravelModePreference('road_trip')}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  travelModePreference === 'road_trip'
                    ? 'bg-amber-950/20 border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                    : 'bg-[#0A1128] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-3">Option A — Road Trip</h3>
                <p className="text-xs text-slate-300 mt-1">"I want to travel using my own vehicle."</p>

                {travelModePreference === 'road_trip' && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 animate-in fade-in">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Vehicle Type</span>
                      <div className="grid grid-cols-4 gap-1.5 mt-1">
                        {['Car', 'Motorcycle', 'SUV', 'Camper'].map((vt) => (
                          <button
                            key={vt}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRoadVehicleType(vt);
                            }}
                            className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition ${
                              roadVehicleType === vt
                                ? 'bg-amber-400 text-slate-950 border-amber-400'
                                : 'bg-[#141A32] text-slate-300 border-slate-700'
                            }`}
                          >
                            {vt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Do you own the vehicle?</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsVehicleOwned(!isVehicleOwned);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          isVehicleOwned ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isVehicleOwned ? 'Yes, Owned' : 'Rented / Borrowed'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Driving Pace</span>
                      <div className="flex gap-1">
                        {['relaxed', 'longer'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrivingPace(p);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              drivingPace === p ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Option B: Book Transportation */}
              <div
                onClick={() => setTravelModePreference('book_transport')}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  travelModePreference === 'book_transport'
                    ? 'bg-blue-950/20 border-blue-400 ring-2 ring-blue-400/30 shadow-lg'
                    : 'bg-[#0A1128] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black">
                  <Plane className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-3">Option B — Book Transportation</h3>
                <p className="text-xs text-slate-300 mt-1">"I want BharatYatra to help me find and arrange transportation."</p>

                {travelModePreference === 'book_transport' && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 animate-in fade-in">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Preferred Transport Modes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'flight', label: 'Flights' },
                        { id: 'train', label: 'Superfast Trains' },
                        { id: 'bus', label: 'Express Buses' },
                        { id: 'cab', label: 'Private Intercity Cab' },
                        { id: 'rental', label: 'Car Rental' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(bookedTransportModes, setBookedTransportModes, item.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            bookedTransportModes.includes(item.id)
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-[#141A32] text-slate-400 border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Option C: Mixed Travel */}
              <div
                onClick={() => setTravelModePreference('mixed')}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  travelModePreference === 'mixed'
                    ? 'bg-purple-950/20 border-purple-400 ring-2 ring-purple-400/30 shadow-lg'
                    : 'bg-[#0A1128] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-black">
                  <Route className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-3">Option C — Mixed Travel</h3>
                <p className="text-xs text-slate-300 mt-1">"I want to combine road trips with trains, flights or buses."</p>

                {travelModePreference === 'mixed' && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 animate-in fade-in">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Preferred Combinations</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'flight_plus_cab', label: 'Flight + Local Cab' },
                        { id: 'train_plus_road', label: 'Train + Road Trip' },
                        { id: 'road_plus_ferry', label: 'Road + Island Ferry' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(mixedPreferences, setMixedPreferences, item.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            mixedPreferences.includes(item.id)
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-[#141A32] text-slate-400 border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Option D: Not Sure */}
              <div
                onClick={() => setTravelModePreference('not_sure')}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  travelModePreference === 'not_sure'
                    ? 'bg-teal-950/20 border-teal-400 ring-2 ring-teal-400/30 shadow-lg'
                    : 'bg-[#0A1128] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-3">Option D — Not Sure</h3>
                <p className="text-xs text-slate-300 mt-1">"Recommend the best transportation for my journey."</p>
                <p className="text-[11px] text-teal-300/80 mt-2">
                  AI will evaluate origin, destination, road terrain, and distance to pick the most comfortable mode.
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: WHAT BOOKINGS DO YOU NEED?                                 */}
        {/* =================================================================== */}
        {currentStep === 4 && (
          <div className="bg-[#141A32] border border-[#2A3656] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 4 • Service Preferences</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">What would you like BharatYatra to arrange?</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select services you want bundled into your itinerary. (Selecting an item indicates preference only; no bookings are executed without supplier confirmation).
              </p>
            </div>

            {/* Arrange Myself Override */}
            <div
              onClick={() => {
                const next = !arrangeMyself;
                setArrangeMyself(next);
                if (next) setBookingPreferences(['arrange_myself']);
                else setBookingPreferences(['hotels', 'local_activities']);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                arrangeMyself
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow'
                  : 'bg-[#0A1128] text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div>
                <span className="text-sm font-extrabold">"I'll arrange everything myself."</span>
                <p className={`text-xs mt-0.5 ${arrangeMyself ? 'text-slate-900' : 'text-slate-400'}`}>
                  Use BharatYatra purely for free AI route mapping, timing intelligence, and landmark blueprints.
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            </div>

            {!arrangeMyself && (
              <div className="space-y-4 pt-2">
                {/* Transportation */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Transportation Services</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'flight_tickets', label: 'Flight Tickets' },
                      { id: 'train_tickets', label: 'Train Bookings' },
                      { id: 'bus_tickets', label: 'Bus Tickets' },
                      { id: 'private_cab', label: 'Private Intercity Cab' },
                      { id: 'vehicle_rental', label: 'Self-Drive Rental' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(bookingPreferences, setBookingPreferences, item.id)}
                        className={`p-3 rounded-xl text-left text-xs font-semibold border transition flex items-center gap-2 ${
                          bookingPreferences.includes(item.id)
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                            : 'bg-[#0A1128] text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${bookingPreferences.includes(item.id) ? 'text-teal-400' : 'text-slate-700'}`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accommodation */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Accommodations</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'hotels', label: 'Hotels & Haveli Stays' },
                      { id: 'resorts', label: 'Luxury Resorts' },
                      { id: 'homestays', label: 'Heritage Homestays' },
                      { id: 'campsites', label: 'Campsites & Glamping' },
                      { id: 'hostels', label: 'Backpacker Hostels' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(bookingPreferences, setBookingPreferences, item.id)}
                        className={`p-3 rounded-xl text-left text-xs font-semibold border transition flex items-center gap-2 ${
                          bookingPreferences.includes(item.id)
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-bold'
                            : 'bg-[#0A1128] text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${bookingPreferences.includes(item.id) ? 'text-amber-400' : 'text-slate-700'}`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experiences */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Experiences & Tours</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'local_activities', label: 'Local Activities' },
                      { id: 'adventure_activities', label: 'Adventure & Treks' },
                      { id: 'guided_tours', label: 'Licensed Heritage Guides' },
                      { id: 'complete_package', label: 'Complete Tour Package' },
                      { id: 'travel_insurance', label: 'Travel Insurance Info' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(bookingPreferences, setBookingPreferences, item.id)}
                        className={`p-3 rounded-xl text-left text-xs font-semibold border transition flex items-center gap-2 ${
                          bookingPreferences.includes(item.id)
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                            : 'bg-[#0A1128] text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${bookingPreferences.includes(item.id) ? 'text-blue-400' : 'text-slate-700'}`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 5: ACCOMMODATION PREFERENCES                                  */}
        {/* =================================================================== */}
        {currentStep === 5 && (
          <div className="bg-[#141A32] border border-[#2A3656] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 5 • Lodging & Stays</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Where would you prefer to stay?</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select your preferred lodging tiers and room requirements. You can choose multiple options.
              </p>
            </div>

            {/* Stay Options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'budget', label: 'Budget Hotels (1–2★)', desc: 'Clean basic stays' },
                { id: 'standard', label: 'Standard Hotels (3★)', desc: 'Comfort & breakfast' },
                { id: 'premium', label: 'Premium Hotels (4★)', desc: 'Full-service amenities' },
                { id: 'luxury', label: 'Luxury Stays & 5★', desc: 'World-class luxury' },
                { id: 'resorts', label: 'Resorts & Retreats', desc: 'Scenic getaways' },
                { id: 'homestays', label: 'Heritage Homestays', desc: 'Authentic local hosts' },
                { id: 'hostels', label: 'Backpacker Hostels', desc: 'Social & vibrant' },
                { id: 'campsites', label: 'Campsites & Tents', desc: 'Outdoor immersion' },
                { id: 'recommend', label: 'Recommend by Budget', desc: 'Auto-balanced by AI' },
              ].map((tier) => {
                const isSelected = accommodationTypes.includes(tier.id);
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => toggleItem(accommodationTypes, setAccommodationTypes, tier.id)}
                    className={`p-3.5 rounded-2xl text-left border transition ${
                      isSelected
                        ? 'bg-amber-400/20 text-white border-amber-400 ring-1 ring-amber-400/30'
                        : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{tier.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Room Arrangements */}
            <div className="bg-[#0A1128] p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Room Allocation & Needs</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Number of Rooms</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
                      className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-white px-2">{roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}</span>
                    <button
                      type="button"
                      onClick={() => setRoomCount(roomCount + 1)}
                      className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Room Arrangement</span>
                  <select
                    value={roomArrangement}
                    onChange={(e) => setRoomArrangement(e.target.value)}
                    className="w-full mt-1.5 bg-[#141A32] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="King Bed">1 King / Queen Bed</option>
                    <option value="Twin Beds">Twin Single Beds</option>
                    <option value="Family Suite">Family Suite / Connecting</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Special Accessibility</span>
                  <select
                    value={roomAccessibility}
                    onChange={(e) => setRoomAccessibility(e.target.value)}
                    className="w-full mt-1.5 bg-[#141A32] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Standard Room">Standard Access</option>
                    <option value="Ground Floor Required">Ground Floor Required</option>
                    <option value="Wheelchair Accessible">Wheelchair Accessible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 6: BUDGET PREFERENCES                                         */}
        {/* =================================================================== */}
        {currentStep === 6 && (
          <div className="bg-[#141A32] border border-[#2A3656] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 6 • Financial Calibration</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">What is your approximate travel budget?</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Tell us your target expenditure so the AI picks realistic stays, transit options, and dining.
              </p>
            </div>

            {/* Per Person vs Total Group Budget Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Budget Calculation Scope</label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setBudgetScope('per_person')}
                  className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition ${
                    budgetScope === 'per_person'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-[#0A1128] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Per Person Budget
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetScope('total_group')}
                  className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition ${
                    budgetScope === 'total_group'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-[#0A1128] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Total Group Budget ({totalPax} Pax)
                </button>
              </div>
            </div>

            {/* Budget Ranges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                { id: 'under_5k', label: 'Under ₹5,000' },
                { id: '5k_10k', label: '₹5,000 – ₹10,000' },
                { id: '10k_25k', label: '₹10,000 – ₹25,000' },
                { id: '25k_50k', label: '₹25,000 – ₹50,000' },
                { id: '50k_100k', label: '₹50,000 – ₹1,00,000' },
                { id: 'above_100k', label: 'Above ₹1,00,000' },
                { id: 'custom', label: 'Custom Amount' },
                { id: 'not_decided', label: 'Not Decided Yet' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudgetRange(b.id)}
                  className={`p-3 rounded-xl text-center border text-xs font-bold transition ${
                    budgetRange === b.id
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow ring-1 ring-teal-500/30'
                      : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Custom Budget Input */}
            {budgetRange === 'custom' && (
              <div className="bg-[#0A1128] p-4 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in">
                <label className="text-xs font-bold text-slate-300">Enter Exact Budget Amount (INR)</label>
                <div className="flex items-center gap-2 bg-[#141A32] border border-slate-700 rounded-xl px-4 py-2.5 max-w-sm">
                  <span className="text-amber-400 font-bold">₹</span>
                  <input
                    type="number"
                    step={1000}
                    value={customBudgetAmount}
                    onChange={(e) => setCustomBudgetAmount(Math.max(1000, parseInt(e.target.value) || 0))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                    placeholder="35000"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 7: TRAVEL STYLE & INTERESTS                                   */}
        {/* =================================================================== */}
        {currentStep === 7 && (
          <div className="bg-[#141A32] border border-[#2A3656] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 7 • Passions & Pacing</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">What kind of travel experience do you enjoy?</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select your travel interests, exploration pace, and how many places you prefer to discover each day.
              </p>
            </div>

            {/* Travel Interests Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Interests & Activities</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Historical Places',
                  'Nature & Scenic',
                  'Religious Destinations',
                  'Wildlife & Safari',
                  'Beaches & Coastal',
                  'Mountains & Hills',
                  'Adventure & Trekking',
                  'Food & Local Culture',
                  'Photography',
                  'Relaxation & Wellness',
                  'Shopping & Handicrafts',
                  'Luxury Experiences',
                  'Family-Friendly',
                ].map((item) => {
                  const isSelected = selectedInterests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem(selectedInterests, setSelectedInterests, item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow'
                          : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Pace */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Travel Pace</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'relaxed', label: 'Relaxed', desc: 'Slow travel with plenty of downtime & café stops' },
                  { id: 'balanced', label: 'Balanced', desc: 'Optimal sightseeing with relaxed evenings' },
                  { id: 'active', label: 'Active', desc: 'High-energy to cover maximum iconic sights' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTravelPace(p.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      travelPace === p.id
                        ? 'bg-teal-500/20 text-white border-teal-400 ring-1 ring-teal-400/30'
                        : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-teal-300">{p.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exploration Preference */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Exploration Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'fewer_deep', label: 'Fewer Destinations', desc: 'Deeper local immersion & minimal hotel hops' },
                  { id: 'balanced', label: 'Balanced Sightseeing', desc: 'Standard regional circuit with key highlights' },
                  { id: 'more_destinations', label: 'More Destinations', desc: 'Broad multi-city discovery expedition' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setExplorationStyle(s.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      explorationStyle === s.id
                        ? 'bg-purple-500/20 text-white border-purple-400 ring-1 ring-purple-400/30'
                        : 'bg-[#0A1128] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-300">{s.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
              >
                <span>Review Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 8: REVIEW YOUR TRAVEL PROFILE                                 */}
        {/* =================================================================== */}
        {currentStep === 8 && (
          <div className="bg-[#141A32] border border-[#2A3656] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Step 8 • Confirmation</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Your BharatYatra Travel Profile</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Review your saved preferences before locking them in. You can edit any individual section below.
              </p>
            </div>

            {/* Profile Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Party & Travellers */}
              <div className="bg-[#0A1128] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Travellers & Party
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-sm font-bold text-white">
                  {totalPax} {totalPax === 1 ? 'Person' : 'People'} • {groupType}
                </p>
                <p className="text-xs text-slate-400">
                  {adults} Adults{children > 0 ? `, ${children} Children` : ''}
                  {infants > 0 ? `, ${infants} Infants` : ''}
                  {seniors > 0 ? `, ${seniors} Seniors` : ''}
                </p>
              </div>

              {/* Transportation */}
              <div className="bg-[#0A1128] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" /> Transportation Mode
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-slate-400 hover:text-teal-400 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-sm font-bold text-white capitalize">
                  {travelModePreference === 'road_trip'
                    ? `Own Road Trip (${roadVehicleType})`
                    : travelModePreference === 'book_transport'
                    ? `Book Transportation (${bookedTransportModes.join(', ')})`
                    : travelModePreference === 'mixed'
                    ? 'Mixed Multi-Modal'
                    : 'AI Decided'}
                </p>
                <p className="text-xs text-slate-400">
                  {travelModePreference === 'road_trip' ? `${drivingPace} driving pacing` : 'Door-to-door transit buffers'}
                </p>
              </div>

              {/* Bookings & Stays */}
              <div className="bg-[#0A1128] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Hotel className="w-3.5 h-3.5" /> Lodging & Bookings
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-sm font-bold text-white">
                  {arrangeMyself ? 'Self-Arranged' : accommodationTypes.join(', ')}
                </p>
                <p className="text-xs text-slate-400">
                  {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'} • {roomArrangement}
                </p>
              </div>

              {/* Budget & Pacing */}
              <div className="bg-[#0A1128] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Budget & Pacing
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="text-xs text-slate-400 hover:text-purple-400 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-sm font-bold text-white capitalize">
                  {budgetRange === 'custom' ? `₹${customBudgetAmount.toLocaleString('en-IN')}` : budgetRange.replace('_', '–')} ({budgetScope.replace('_', ' ')})
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {travelPace} pace • {explorationStyle.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Interests Summary */}
            <div className="bg-[#0A1128] p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Core Travel Interests
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(7)}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedInterests.map((item) => (
                  <span
                    key={item}
                    className="bg-[#141A32] text-amber-300 border border-amber-400/30 text-xs px-2.5 py-1 rounded-lg font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {notification && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {/* Final Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Edit
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Saving Preferences...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Save My Travel Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 9: PERSONALIZED DASHBOARD / COMPLETION                        */}
        {/* =================================================================== */}
        {currentStep === 9 && (
          <div className="bg-[#141A32] border border-amber-400/40 rounded-3xl p-6 sm:p-12 shadow-2xl text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-400">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Setup Complete</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">Your travel preferences are ready!</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
                BharatYatra has personalized your travel engine. Your future itineraries will now automatically load with
                your preferred pacing, vehicle setup, and stay preferences.
              </p>
            </div>

            {/* Quick Links Dashboard Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-left">
              <Link
                href="/plan"
                className="bg-[#0A1128] border border-slate-800 hover:border-amber-400/50 p-4 rounded-2xl group transition space-y-1"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Plan a New Trip</h4>
                <p className="text-[10px] text-slate-400">Prepopulates your saved profile</p>
              </Link>

              <Link
                href="/ai-planner"
                className="bg-[#0A1128] border border-slate-800 hover:border-teal-400/50 p-4 rounded-2xl group transition space-y-1"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">AI Duration Planner</h4>
                <p className="text-[10px] text-slate-400">Calculate ideal route days</p>
              </Link>

              <Link
                href="/states"
                className="bg-[#0A1128] border border-slate-800 hover:border-blue-400/50 p-4 rounded-2xl group transition space-y-1"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">Explore States & UTs</h4>
                <p className="text-[10px] text-slate-400">All 36 regions of India</p>
              </Link>

              <Link
                href="/landmarks"
                className="bg-[#0A1128] border border-slate-800 hover:border-purple-400/50 p-4 rounded-2xl group transition space-y-1"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Mountain className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">100 Landmarks</h4>
                <p className="text-[10px] text-slate-400">Iconic Gujarat directory</p>
              </Link>

              <Link
                href="/saved"
                className="bg-[#0A1128] border border-slate-800 hover:border-emerald-400/50 p-4 rounded-2xl group transition space-y-1"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bookmark className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">My Trips & Stays</h4>
                <p className="text-[10px] text-slate-400">Saved itineraries & bookings</p>
              </Link>

              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="bg-[#0A1128] border border-slate-800 hover:border-amber-400/50 p-4 rounded-2xl group transition space-y-1 text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Edit Preferences</h4>
                <p className="text-[10px] text-slate-400">Update anytime</p>
              </button>
            </div>

            {/* Launch CTA */}
            <div className="pt-4">
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-amber-400/20 transition"
              >
                <span>Launch Trip Planner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full border-t border-[#2A3656] py-3 text-center text-[11px] text-slate-500 bg-[#0A1128]">
        BharatYatra Traveler Intelligence • 100% Verified Geography across 28 States & 8 UTs
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A1128] text-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading BharatYatra Onboarding...</span>
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}


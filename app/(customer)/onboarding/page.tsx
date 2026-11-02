'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Car,
  Plane,
  Train,
  Bus,
  Bike,
  CheckCircle2,
  Calendar,
  MapPin,
  Search,
  AlertTriangle,
  Utensils,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useDestinationSelection } from '@/lib/tourism/destination-selection-context';
import {
  TravelProfile,
  fetchUserTravelProfile,
  saveUserTravelProfile,
  skipUserOnboarding,
} from '@/lib/profile/travel-profile';
import {
  calculateTripDurationRecommendation,
  customizeTripDuration,
  TripDurationRecommendationOutput,
  CustomizeDurationOutput,
} from '@/lib/ai-planner/trip-duration-intelligence-engine';
import { searchCities, CityItem } from '@/lib/data/indian-cities';
import { generateItineraryBlueprint, PlanningResult } from '@/lib/trips/itinerary-generator';
import { saveTripToApi, saveTrip, TripItem } from '@/lib/trips/trip-storage';
import { playNotificationSound, initAudioUnlocker } from '@/lib/utils/sound';
import { AshokaChakraIcon } from '@/components/qr/AshokaChakraIcon';

// Popular Indian Destination Presets for Quick Pick
const QUICK_DESTINATIONS = [
  { name: 'Leh & Ladakh', state: 'Ladakh', region: 'Himalayas', icon: '🏔️', type: 'Adventure & Altitude' },
  { name: 'Jaipur & Udaipur', state: 'Rajasthan', region: 'North', icon: '🏰', type: 'Royal Heritage' },
  { name: 'Munnar & Alleppey', state: 'Kerala', region: 'South', icon: '🌴', type: 'Backwaters & Hills' },
  { name: 'Varanasi Ghats', state: 'Uttar Pradesh', region: 'North', icon: '🪔', type: 'Spiritual Sacred' },
  { name: 'Baratang & Port Blair', state: 'Andaman & Nicobar Islands', region: 'Islands', icon: '🏝️', type: 'Coastal & Caves' },
  { name: 'White Rann of Kutch', state: 'Gujarat', region: 'West', icon: '🏜️', type: 'Desert & Culture' },
  { name: 'Goa Coastal Trail', state: 'Goa', region: 'West', icon: '🏖️', type: 'Beaches & Leisure' },
  { name: 'Statue of Unity & Narmada', state: 'Gujarat', region: 'West', icon: '🌿', type: 'Landmark & Eco' },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams ? searchParams.get('edit') === 'true' : false;
  const flowParam = searchParams ? searchParams.get('flow') : null; // 'plan' if triggered from selection bar
  const { user } = useAuth();
  const { selectedDestinations, clearSelection } = useDestinationSelection();

  // Wizard Step: 0 = Welcome, 1..7 = Core Questions, 8 = AI Duration & Summary, 9 = Final Itinerary Ready
  const [currentStep, setCurrentStep] = useState<number>(isEditMode ? 8 : (flowParam === 'plan' ? 1 : 0));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- STEP 1: TRAVELLER INFORMATION ---
  const [groupType, setGroupType] = useState<string>('Family');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [childAgeGroups, setChildAgeGroups] = useState<string[]>([]);
  const [hasSeniors, setHasSeniors] = useState<boolean>(false);

  // --- STEP 2: TRAVEL DESTINATION ---
  const [originCity, setOriginCity] = useState<string>('Ahmedabad, Gujarat');
  const [originSearch, setOriginSearch] = useState<string>('');
  const [showOriginDropdown, setShowOriginDropdown] = useState<boolean>(false);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destInput, setDestInput] = useState<string>('');
  const [showDestDropdown, setShowDestDropdown] = useState<boolean>(false);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);
  const [isMultiDestination, setIsMultiDestination] = useState<boolean>(false);

  // --- STEP 3: TRAVEL DATES ---
  const [dateMode, setDateMode] = useState<'flexible' | 'fixed'>('flexible');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [preferredSeason, setPreferredSeason] = useState<string>('Winter & Festive Peak (Oct–Feb)');

  // --- STEP 4: TRANSPORTATION ---
  const [preferredTransport, setPreferredTransport] = useState<string>('road_trip'); // road_trip, flight, train, bus, bike, ai_decide

  // --- STEP 5: BUDGET ---
  const [budgetTier, setBudgetTier] = useState<'budget' | 'balanced' | 'luxury' | 'custom'>('balanced');
  const [budgetScope, setBudgetScope] = useState<'per_person' | 'total_group'>('total_group');
  const [customBudgetAmount, setCustomBudgetAmount] = useState<number>(45000);

  // --- STEP 6: TRAVEL PACE ---
  const [travelPace, setTravelPace] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');

  // --- STEP 7: TRAVEL PREFERENCES ---
  const [accommodationTypes, setAccommodationTypes] = useState<string[]>(['Boutique Hotels', 'Heritage Havelis']);
  const [foodPreference, setFoodPreference] = useState<string>('Pure Vegetarian');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'History & Heritage',
    'Nature & Scenic',
    'Culture & Festivals',
  ]);
  const [specialRequirements, setSpecialRequirements] = useState<string>('');

  // --- STEP 8: INTELLIGENT AI DURATION RECOMMENDATION STATE ---
  const [durationRecommendation, setDurationRecommendation] = useState<TripDurationRecommendationOutput | null>(null);
  const [chosenDurationDays, setChosenDurationDays] = useState<number>(5);
  const [durationTierSelection, setDurationTierSelection] = useState<'recommended' | 'minimum' | 'relaxed' | 'custom'>('recommended');
  const [, setCustomizationResult] = useState<CustomizeDurationOutput | null>(null);

  // --- STEP 9: GENERATED TRIP RESULT ---
  const [generatedTrip, setGeneratedTrip] = useState<TripItem | null>(null);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<PlanningResult | null>(null);

  // Audio unlocker
  useEffect(() => {
    initAudioUnlocker();
  }, []);

  // Hydrate destinations from context if available
  useEffect(() => {
    if (selectedDestinations && selectedDestinations.length > 0) {
      const names = selectedDestinations.map((d) => d.name);
      setDestinations((prev) => Array.from(new Set([...prev, ...names])));
      if (selectedDestinations.length > 1) {
        setIsMultiDestination(true);
      }
    }
  }, [selectedDestinations]);

  // Load saved draft or profile on mount
  useEffect(() => {
    async function initData() {
      try {
        if (typeof window !== 'undefined') {
          const savedDraft = localStorage.getItem('by_onboarding_draft');
          if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            if (draft.groupType) setGroupType(draft.groupType);
            if (draft.adults) setAdults(draft.adults);
            if (draft.children) setChildren(draft.children);
            if (draft.childAgeGroups) setChildAgeGroups(draft.childAgeGroups);
            if (draft.originCity) setOriginCity(draft.originCity);
            if (draft.destinations && draft.destinations.length > 0) setDestinations(draft.destinations);
            if (draft.dateMode) setDateMode(draft.dateMode);
            if (draft.preferredTransport) setPreferredTransport(draft.preferredTransport);
            if (draft.budgetTier) setBudgetTier(draft.budgetTier);
            if (draft.budgetScope) setBudgetScope(draft.budgetScope);
            if (draft.travelPace) setTravelPace(draft.travelPace);
            if (draft.foodPreference) setFoodPreference(draft.foodPreference);
            if (draft.selectedInterests) setSelectedInterests(draft.selectedInterests);
            if (draft.accommodationTypes) setAccommodationTypes(draft.accommodationTypes);
          }
        }

        if (user?.id) {
          const prof = await fetchUserTravelProfile(user.id);
          if (prof) {
            if (prof.groupType) setGroupType(prof.groupType);
            if (prof.travelerComposition?.adults) setAdults(prof.travelerComposition.adults);
            if (prof.travelerComposition?.children) setChildren(prof.travelerComposition.children);
            if (prof.pace) setTravelPace(prof.pace as any);
            if (prof.interests && prof.interests.length > 0) setSelectedInterests(prof.interests);
            if (prof.accommodationTypes && prof.accommodationTypes.length > 0) {
              setAccommodationTypes(prof.accommodationTypes);
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    initData();
  }, [user]);

  // Autosave draft into localStorage on every relevant change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const draftState = {
          groupType,
          adults,
          children,
          childAgeGroups,
          originCity,
          destinations,
          dateMode,
          startDate,
          endDate,
          preferredSeason,
          preferredTransport,
          budgetTier,
          budgetScope,
          customBudgetAmount,
          travelPace,
          accommodationTypes,
          foodPreference,
          selectedInterests,
          specialRequirements,
          currentStep,
        };
        localStorage.setItem('by_onboarding_draft', JSON.stringify(draftState));
      }
    } catch {}
  }, [
    groupType,
    adults,
    children,
    childAgeGroups,
    originCity,
    destinations,
    dateMode,
    startDate,
    endDate,
    preferredSeason,
    preferredTransport,
    budgetTier,
    budgetScope,
    customBudgetAmount,
    travelPace,
    accommodationTypes,
    foodPreference,
    selectedInterests,
    specialRequirements,
    currentStep,
  ]);

  // Destination search matches
  const destinationSuggestions: CityItem[] = useMemo(() => {
    if (!destInput.trim()) return [];
    return searchCities(destInput).slice(0, 6);
  }, [destInput]);

  const originSuggestions: CityItem[] = useMemo(() => {
    if (!originSearch.trim()) return [];
    return searchCities(originSearch).slice(0, 6);
  }, [originSearch]);

  const handleAddDestination = (name: string) => {
    const clean = name.trim();
    if (clean && !destinations.includes(clean)) {
      const updated = [...destinations, clean];
      setDestinations(updated);
      if (updated.length > 1) setIsMultiDestination(true);
    }
    setDestInput('');
    setShowDestDropdown(false);
  };

  const handleRemoveDest = (index: number) => {
    const updated = destinations.filter((_, i) => i !== index);
    setDestinations(updated);
    if (updated.length <= 1) setIsMultiDestination(false);
  };

  const toggleArrayItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Trigger Intelligent AI Duration Calculation when entering Step 8
  const runDurationRecommendation = async () => {
    setIsCalculating(true);
    try {
      const targetDests = destinations.length > 0 ? destinations : ['Leh & Ladakh', 'Jaipur & Udaipur'];
      const paceMapped = travelPace === 'packed' ? 'active' : travelPace;
      const modeMapped = preferredTransport === 'ai_decide' ? 'flight' : preferredTransport === 'road_trip' ? 'car' : preferredTransport;

      const rec = calculateTripDurationRecommendation({
        origin: originCity,
        destinations: targetDests,
        travelMode: modeMapped as any,
        travelPace: paceMapped as any,
        travellers: adults + children,
        hasSeniors,
        hasChildren: children > 0,
        preferences: selectedInterests,
      });

      setDurationRecommendation(rec);
      setChosenDurationDays(rec.recommendedDuration.days);
      setDurationTierSelection('recommended');
    } catch (e) {
      console.error('[Onboarding] Error calculating duration:', e);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (currentStep === 8) {
      runDurationRecommendation();
    }
  }, [currentStep]);

  const handleSelectTier = (tier: 'recommended' | 'minimum' | 'relaxed') => {
    if (!durationRecommendation) return;
    setDurationTierSelection(tier);
    if (tier === 'recommended') setChosenDurationDays(durationRecommendation.recommendedDuration.days);
    if (tier === 'minimum') setChosenDurationDays(durationRecommendation.minimumDuration.days);
    if (tier === 'relaxed') setChosenDurationDays(durationRecommendation.relaxedDuration.days);
  };

  const handleAdjustDays = (newDays: number) => {
    if (!durationRecommendation) return;
    const clamped = Math.max(2, Math.min(28, newDays));
    setChosenDurationDays(clamped);
    setDurationTierSelection('custom');

    const customized = customizeTripDuration({
      origin: originCity,
      destinations: destinations.length > 0 ? destinations : ['Rajasthan'],
      travelMode: preferredTransport === 'road_trip' ? 'car' : 'flight',
      travelPace: travelPace === 'packed' ? 'active' : travelPace,
      customDays: clamped,
      travellers: adults + children,
    });
    setCustomizationResult(customized);
  };

  const handleGenerateAIItinerary = async () => {
    setIsSaving(true);
    playNotificationSound('notification');

    try {
      const totalTravellers = adults + children;
      const targetPlaces = destinations.length > 0 ? destinations : ['Ahmedabad Heritage', 'White Rann of Kutch'];

      // 1. Generate Itinerary Blueprint
      const blueprint = generateItineraryBlueprint({
        selectedPlaceIds: [],
        durationDays: chosenDurationDays,
        originCity: originCity.split(',')[0].trim(),
        paxCount: totalTravellers,
        selectedTier: budgetTier === 'custom' ? 'balanced' : budgetTier,
        customPlaces: targetPlaces.map((d, idx) => ({
          id: 9100 + idx,
          name: d,
          district: d,
          category: 'Modern & Cultural' as const,
          description: `Signature destination experience across ${d}`,
          image: '/hero-bg.jpg',
        })),
        tripContext: {
          traveler: {
            name: user?.fullName || 'BharatYatra Traveler',
            typicalTravelers: totalTravellers,
          },
          origin: {
            city: originCity.split(',')[0].trim(),
            state: originCity.split(',')[1]?.trim() || 'India',
            country: 'India',
          },
          trip: {
            origin: {
              city: originCity.split(',')[0].trim(),
              state: originCity.split(',')[1]?.trim() || 'India',
              country: 'India',
            },
            destination: {
              city: targetPlaces[0],
            },
            travelers: totalTravellers,
            durationDays: chosenDurationDays,
            startDate: startDate || new Date().toISOString().split('T')[0],
          },
          preferences: {
            budget: budgetTier,
            pace: travelPace,
            transport: [preferredTransport],
            interests: selectedInterests,
          },
        },
      });

      setGeneratedBlueprint(blueprint);

      // 2. Save Trip to Storage & Backend
      const newTripItem: TripItem = {
        id: `trip_${Date.now()}`,
        tripId: `trip_${Date.now()}`,
        title: blueprint.circuitTitle,
        destination: targetPlaces.join(', '),
        destinationCity: targetPlaces[0],
        originCity: originCity.split(',')[0].trim(),
        startDate: startDate || new Date().toISOString().split('T')[0],
        durationDays: chosenDurationDays,
        travelers: totalTravellers,
        status: 'UPCOMING',
        selectedTier: budgetTier === 'custom' ? 'balanced' : budgetTier,
        budgetInr: durationRecommendation?.budgetEstimate?.totalGroupCost || 35000,
      };

      await saveTripToApi(newTripItem);
      saveTrip(newTripItem);
      setGeneratedTrip(newTripItem);

      // 3. Save Permanent User Preferences
      const permanentProfile: Partial<TravelProfile> = {
        fullName: user?.fullName || 'BharatYatra Traveler',
        typicalTravelers: totalTravellers,
        completed: true,
        onboardingStatus: 'COMPLETED',
        groupType,
        travelerComposition: {
          adults,
          children,
          infants: childAgeGroups.includes('Infants (0–2)') ? 1 : 0,
          seniors: hasSeniors ? 1 : 0,
        },
        travelModePreference: preferredTransport === 'road_trip' ? 'road_trip' : 'book_transport',
        accommodationTypes,
        budgetScope,
        budgetRange: budgetTier,
        customBudgetAmount: customBudgetAmount,
        interests: selectedInterests,
        pace: travelPace,
        origin: {
          city: originCity.split(',')[0].trim(),
          state: originCity.split(',')[1]?.trim() || 'India',
          country: 'India',
        },
      };

      await saveUserTravelProfile(permanentProfile, user?.id);

      // 4. Clear temporary selection context
      clearSelection();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('by_onboarding_draft');
      }

      playNotificationSound('notification');
      setCurrentStep(9);
    } catch (err: any) {
      console.error('[Onboarding] Error generating trip:', err);
      setNotification('A temporary network issue occurred while saving your trip. Saved locally.');
      setCurrentStep(9);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    await skipUserOnboarding(user?.id);
    router.push('/');
  };

  const progressPercent = currentStep === 0 ? 0 : Math.min(100, Math.round((currentStep / 8) * 100));

  return (
    <div className="min-h-screen bg-slate-50 text-[#102A56] font-sans flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Header & Progress */}
      <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <AshokaChakraIcon size={20} color="#000080" />
            <span className="text-base font-black tracking-tight text-[#102A56]">
              Bharat<span className="text-[#F28C28]">Yatra</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-[#1769AA] text-[10px] font-black uppercase tracking-wider border border-blue-200">
              Smart Onboarding
            </span>
          </Link>

          {/* Progress Indicator */}
          {currentStep >= 1 && currentStep <= 8 && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Step {currentStep} of 8
                </span>
                <span className="text-xs font-black text-[#102A56]">
                  {currentStep === 1 && 'Traveller Info'}
                  {currentStep === 2 && 'Destinations'}
                  {currentStep === 3 && 'Travel Dates'}
                  {currentStep === 4 && 'Transportation'}
                  {currentStep === 5 && 'Budget Tier'}
                  {currentStep === 6 && 'Travel Pace'}
                  {currentStep === 7 && 'Preferences'}
                  {currentStep === 8 && 'AI Duration & Summary'}
                </span>
              </div>
              <div className="w-24 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-[#1769AA] via-[#F28C28] to-[#F5BD4F] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Skip for Now */}
          {currentStep <= 8 && (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-slate-500 hover:text-[#102A56] px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 transition cursor-pointer"
            >
              Skip for Now
            </button>
          )}
        </div>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {notification && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-amber-700 font-black cursor-pointer">✕</button>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 0: WELCOME SCREEN                                              */}
        {/* =================================================================== */}
        {currentStep === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-12 shadow-sm text-center space-y-6 relative overflow-hidden animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#F28C28] uppercase font-mono">
                ✨ Official Traveler Setup
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-[#102A56] tracking-tight">
                Welcome to BharatYatra!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Let&apos;s get to know your travel preferences. We&apos;ll help you plan a journey that suits you.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#102A56]">Intelligent Auto-Duration</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  No arbitrary day counts. AI evaluates highway distances, terrain, and dwell times.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Car className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#102A56]">Your Vehicle or Bookings</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Choose self-drive road trips, high-speed rail, or full flight &amp; hotel logistics.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#102A56]">Dietary &amp; Cultural Care</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Pure Veg, Jain, Vegan, and accessibility accommodations respected across all stops.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#102A56] hover:bg-blue-950 text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold text-slate-500 hover:text-[#102A56] transition cursor-pointer"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 1: TRAVELLER INFORMATION                                      */}
        {/* =================================================================== */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-black text-[#F28C28] uppercase tracking-wider">Step 1 of 8</span>
              <h2 className="text-2xl font-black text-[#102A56] mt-0.5">Who is travelling?</h2>
              <p className="text-xs text-slate-500 mt-1">
                Tell us about your group composition so we can recommend the right vehicles, room arrangements, and daily pacing.
              </p>
            </div>

            {/* Group Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: 'Solo', label: 'Solo', icon: '🎒', desc: '1 Traveler' },
                { id: 'Couple', label: 'Couple', icon: '💑', desc: '2 Adults' },
                { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Parents & Kids' },
                { id: 'Friends', label: 'Friends', icon: '🍻', desc: 'Peer Group' },
                { id: 'Group', label: 'Group', icon: '🚌', desc: 'Large Tour' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setGroupType(t.id);
                    if (t.id === 'Solo') {
                      setAdults(1);
                      setChildren(0);
                    } else if (t.id === 'Couple') {
                      setAdults(2);
                      setChildren(0);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
                    groupType === t.id
                      ? 'border-[#102A56] bg-blue-50/60 ring-2 ring-[#102A56]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl block mb-1">{t.icon}</span>
                  <span className="font-extrabold text-xs text-[#102A56] block">{t.label}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>

            {/* Steppers: Adults and Children */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#102A56] block">Adults (Age 18+)</label>
                  <span className="text-[11px] text-slate-500">Standard room &amp; vehicle occupancy</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-[#102A56] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-[#102A56] w-6 text-center">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(20, adults + 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-[#102A56] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#102A56] block">Children (Under 18)</label>
                  <span className="text-[11px] text-slate-500">Extra beds &amp; kid-friendly attractions</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(0, children - 1);
                      setChildren(next);
                      if (next === 0) setChildAgeGroups([]);
                    }}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-[#102A56] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-[#102A56] w-6 text-center">{children}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setChildren(Math.min(10, children + 1));
                      if (childAgeGroups.length === 0) setChildAgeGroups(['Kids (3–12)']);
                    }}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 font-bold text-[#102A56] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Children's Age Groups */}
            {children > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <span className="text-xs font-bold text-amber-900 block">Children&apos;s Age Groups:</span>
                <div className="flex flex-wrap gap-2">
                  {['Infants (0–2)', 'Kids (3–12)', 'Teens (13–17)'].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => toggleArrayItem(childAgeGroups, setChildAgeGroups, age)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        childAgeGroups.includes(age)
                          ? 'bg-[#102A56] text-white shadow-2xs'
                          : 'bg-white border border-amber-300 text-amber-900'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Senior Citizens & Special Needs Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="seniors-check"
                checked={hasSeniors}
                onChange={(e) => setHasSeniors(e.target.checked)}
                className="w-4 h-4 text-[#102A56] rounded border-slate-300 focus:ring-blue-600 cursor-pointer"
              />
              <label htmlFor="seniors-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Travelling with Senior Citizens (60+) — Apply gentle transit speeds and elevator/ground-floor preferences
              </label>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#102A56] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: TRAVEL DESTINATION                                          */}
        {/* =================================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-black text-[#F28C28] uppercase tracking-wider">Step 2 of 8</span>
              <h2 className="text-2xl font-black text-[#102A56] mt-0.5">Where would you like to travel?</h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose single or multiple destinations across all Indian states and union territories.
              </p>
            </div>

            {/* Starting Location (Origin) */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-slate-700 block">Where are you travelling from? (Starting City)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#F28C28] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={originSearch || originCity}
                  onChange={(e) => {
                    setOriginSearch(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  placeholder="e.g. Ahmedabad, Gujarat"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#102A56] focus:ring-1 focus:ring-[#102A56] text-xs font-bold text-[#102A56]"
                />
              </div>

              {showOriginDropdown && originSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {originSuggestions.map((c) => (
                    <button
                      key={`${c.city}-${c.state}`}
                      type="button"
                      onClick={() => {
                        setOriginCity(`${c.city}, ${c.state}`);
                        setOriginSearch('');
                        setShowOriginDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <span>{c.city}, {c.state}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{c.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Destinations Tag Deck */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Selected Destinations ({destinations.length})</label>
                {destinations.length > 1 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Multi-Destination Circuit
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                {destinations.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No destination added yet. Choose suggestions below or type to search.</span>
                ) : (
                  destinations.map((d, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102A56] text-white text-xs font-bold shadow-2xs"
                    >
                      <span>{d}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDest(idx)}
                        className="w-3.5 h-3.5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Destination Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={destInput}
                  onChange={(e) => {
                    setDestInput(e.target.value);
                    setShowDestDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (destInput.trim()) handleAddDestination(destInput);
                    }
                  }}
                  placeholder="Type city, state, or landmark name to add..."
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 focus:border-[#102A56] text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => destInput.trim() && handleAddDestination(destInput)}
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-[#102A56] text-white rounded-lg text-xs font-bold hover:bg-blue-950 cursor-pointer"
                >
                  Add Place
                </button>

                {showDestDropdown && destinationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {destinationSuggestions.map((c) => (
                      <button
                        key={`${c.city}-${c.state}`}
                        type="button"
                        onClick={() => handleAddDestination(`${c.city}, ${c.state}`)}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <span>{c.city}, {c.state}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{c.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Destination Suggestions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Destination Suggestions
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUICK_DESTINATIONS.map((preset) => {
                  const isSelected = destinations.includes(preset.name);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setDestinations(destinations.filter((x) => x !== preset.name));
                        } else {
                          handleAddDestination(preset.name);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#102A56] bg-blue-50/70 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-xs font-bold text-[#102A56] truncate">{preset.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">{preset.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Journey Type Toggle (Round Trip vs One-Way) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#102A56] block">Return to Starting City?</span>
                <span className="text-[10px] text-slate-500">Calculate fuel, tolls, and return leg logistics</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRoundTrip(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isRoundTrip ? 'bg-[#102A56] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Round Trip
                </button>
                <button
                  type="button"
                  onClick={() => setIsRoundTrip(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    !isRoundTrip ? 'bg-[#102A56] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  One Way
                </button>
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (destinations.length === 0) {
                    handleAddDestination('Leh & Ladakh');
                  }
                  setCurrentStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#102A56] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: TRAVEL DATES                                                */}
        {/* =================================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-black text-[#F28C28] uppercase tracking-wider">Step 3 of 8</span>
              <h2 className="text-2xl font-black text-[#102A56] mt-0.5">When are you planning to travel?</h2>
              <p className="text-xs text-slate-500 mt-1">
                Tell us whether your schedule is fixed or if you&apos;d like AI to suggest optimal seasonal dates.
              </p>
            </div>

            {/* Date Mode Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDateMode('flexible')}
                className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
                  dateMode === 'flexible'
                    ? 'border-[#102A56] bg-blue-50/60 ring-2 ring-[#102A56]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Sparkles className="w-6 h-6 text-[#F28C28] mx-auto mb-1.5" />
                <span className="font-extrabold text-xs text-[#102A56] block">Flexible Dates</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Let AI recommend peak season</span>
              </button>

              <button
                type="button"
                onClick={() => setDateMode('fixed')}
                className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
                  dateMode === 'fixed'
                    ? 'border-[#102A56] bg-blue-50/60 ring-2 ring-[#102A56]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Calendar className="w-6 h-6 text-[#1769AA] mx-auto mb-1.5" />
                <span className="font-extrabold text-xs text-[#102A56] block">Fixed Dates</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">I have exact departure dates</span>
              </button>
            </div>

            {/* Flexible Season Cards */}
            {dateMode === 'flexible' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Preferred Season or Holiday Window:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'Winter & Festive Peak (Oct–Feb)', label: '❄️ Winter / Festive Peak (Oct–Feb)', desc: 'Crisp pleasant weather, Rann Utsav & Beach season' },
                    { id: 'Spring & Heritage (Feb–Apr)', label: '🌸 Spring Season (Feb–Apr)', desc: 'Mild temperatures across Rajasthan, Gujarat & MP' },
                    { id: 'Summer Hill Escape (May–Jun)', label: '☀️ Summer Hill Escape (May–Jun)', desc: 'Cool breeze in Ladakh, Himachal, Kashmir & Ooty' },
                    { id: 'Monsoon Trails (Jul–Sep)', label: '🌧️ Monsoon Scenic Trails (Jul–Sep)', desc: 'Lush green Western Ghats, waterfalls & valley treks' },
                    { id: 'Upcoming Long Weekend', label: '🚀 Upcoming Long Weekend', desc: 'Short recharge 3–4 days break' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPreferredSeason(s.id)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        preferredSeason === s.id
                          ? 'border-[#102A56] bg-blue-50/70 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-xs font-extrabold text-[#102A56] block">{s.label}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="text-xs font-bold text-[#102A56] block">Departure / Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#102A56] bg-white"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="text-xs font-bold text-[#102A56] block">Return Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Leave blank for AI duration"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#102A56] bg-white"
                  />
                  <span className="text-[10px] text-slate-500 block">Leave blank to let AI recommend optimal length!</span>
                </div>
              </div>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-xl bg-[#102A56] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: TRANSPORTATION                                              */}
        {/* =================================================================== */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-black text-[#F28C28] uppercase tracking-wider">Step 4 of 8</span>
              <h2 className="text-2xl font-black text-[#102A56] mt-0.5">What is your preferred mode of travel?</h2>
              <p className="text-xs text-slate-500 mt-1">
                BharatYatra AI considers distance, transit times, highway topography, and budget when planning travel legs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'road_trip', label: 'Road Trip', icon: Car, desc: 'Own vehicle or private cab with door-to-door scenic freedom.' },
                { id: 'flight', label: 'Flight', icon: Plane, desc: 'Fast airport-to-airport transfers for distant destinations.' },
                { id: 'train', label: 'Express Rail', icon: Train, desc: 'Scenic rail journeys via Vande Bharat, Tejas, & Rajdhani.' },
                { id: 'bus', label: 'Bus', icon: Bus, desc: 'Luxury AC multi-axle sleeper coaches with verified amenities.' },
                { id: 'bike', label: 'Bike Ride', icon: Bike, desc: 'Adventurous two-wheeler motorcycle circuit.' },
                { id: 'ai_decide', label: 'Let AI Decide', icon: Compass, desc: 'Optimal multimodal combination balancing speed, cost & fatigue.' },
              ].map((m) => {
                const IconComponent = m.icon;
                const isSelected = preferredTransport === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPreferredTransport(m.id)}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#102A56] bg-blue-50/60 ring-2 ring-[#102A56]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-[#102A56] text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-[#102A56] block">{m.label}</span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Route Physics Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-[#102A56]">
                <Clock className="w-4 h-4 text-[#F28C28]" />
                <span>Door-to-Door Transit Evaluation</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Origin: <strong className="text-slate-800">{originCity}</strong> ➔ Target:{' '}
                <strong className="text-slate-800">{destinations.slice(0, 3).join(', ') || 'Selected destinations'}</strong>.
                AI automatically builds realistic rest stops, fuel intervals, and meal halts into your itinerary.
              </p>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2.5 rounded-xl bg-[#102A56] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 5: BUDGET                                                      */}
        {/* =================================================================== */}
        {currentStep === 5 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-black text-[#F28C28] uppercase tracking-wider">Step 5 of 8</span>
              <h2 className="text-2xl font-black text-[#102A56] mt-0.5">What is your budget tier?</h2>
              <p className="text-xs text-slate-500 mt-1">
                We calculate transparent estimates without hidden fees, covering hotel tariffs, toll math, and meal averages.
              </p>
            </div>

            {/* Primary 3 Options + Custom */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'budget', label: 'Budget', icon: '🎒', range: 'Hostels & Local Transit', approx: '₹1,500 – ₹2,500 / day / person' },
                { id: 'balanced', label: 'Balanced', icon: '🏨', range: '3★–4★ Hotels & Private Cab', approx: '₹3,500 – ₹6,500 / day / person' },
                { id: 'luxury', label: 'Luxury', icon: '👑', range: '5★ Resorts & Express Travel', approx: '₹9,000+ / day / person' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudgetTier(b.id as any)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    budgetTier === b.id
                      ? 'border-[#102A56] bg-blue-50/60 ring-2 ring-[#102A56]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl block mb-1.5">{b.icon}</span>
                  <span className="font-extrabold text-xs text-[#102A56] block">{b.label}</span>
                  <span className="text-[11px] text-slate-600 font-semibold block mt-1">{b.range}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{b.approx}</span>
                </button>
              ))}
            </div>

            {/* Custom Budget Amount Option */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#102A56]">Or Specify Custom Budget Amount:</span>
                <button
                  type="button"
                  onClick={() => setBudgetTier('custom')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    budgetTier === 'custom' ? 'bg-[#102A56] text-white' : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  Use Custom Budget
                </button>
              </div>

              {budgetTier === 'custom' && (
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      step={1000}
                      value={customBudgetAmount}
                      onChange={(e) => setCustomBudgetAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 font-bold text-xs text-[#102A56] bg-white"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">INR</span>
                </div>
              )}

              {/* Budget Scope: Per Person vs Total */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-600">Is this budget:</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBudgetScope('per_person')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      budgetScope === 'per_person' ? 'bg-[#102A56] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Per Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetScope('total_group')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      budgetScope === 'total_group' ? 'bg-[#102A56] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Total Trip Budget
                  </button>
                </div>
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-6 py-2.5 rounded-xl bg-[#102A56] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 6: TRAVEL PACE                                                 */}
        {/* =================================================================== */}
        {currentStep === 6 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-black text-[#F28C28] uppercase tracking-wider">Step 6 of 8</span>
              <h2 className="text-2xl font-black text-[#102A56] mt-0.5">What is your ideal travel pace?</h2>
              <p className="text-xs text-slate-500 mt-1">
                We adjust daily itinerary densities, sightseeing dwell times, and rest stops to fit your speed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'relaxed',
                  label: 'Relaxed',
                  icon: '☕',
                  title: 'Fewer Activities & Free Time',
                  desc: '1–2 key landmarks per day. Late mornings, extended cafe breaks, and leisurely scenic sunsets.',
                },
                {
                  id: 'balanced',
                  label: 'Balanced',
                  icon: '⚖️',
                  title: 'Sightseeing & Relaxation',
                  desc: '3–4 highlights per day. A steady, rewarding rhythm covering major sights with comfortable pauses.',
                },
                {
                  id: 'packed',
                  label: 'Packed',
                  icon: '⚡',
                  title: 'More Sights & Activities',
                  desc: '5+ attractions daily. High-energy explorer schedule covering maximum landmarks from dawn to dusk.',
                },
              ].map((p) => {
                const isSelected = travelPace === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTravelPace(p.id as any)}
                    className={`p-5 rounded-2xl border text-left transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-[#102A56] bg-blue-50/60 ring-2 ring-[#102A56]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-3xl block">{p.icon}</span>
                    <span className="font-extrabold text-sm text-[#102A56] block">{p.label}</span>
                    <span className="text-xs font-bold text-slate-700 block">{p.title}</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="px-6 py-2.5 rounded-xl bg-[#102A56] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 7: TRAVEL PREFERENCES (Stay, Food & Interests)                 */}
        {/* =================================================================== */}
        {currentStep === 7 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-black text-[#F28C28] uppercase tracking-wider">Step 7 of 8</span>
              <h2 className="text-2xl font-black text-[#102A56] mt-0.5">Stay, food, and travel interests</h2>
              <p className="text-xs text-slate-500 mt-1">
                These preferences become your permanent traveler profile so future trips match your tastes.
              </p>
            </div>

            {/* Food Preferences (Mandatory Single Choice) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Food &amp; Dining Preference (Required):</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'Pure Vegetarian', label: 'Pure Veg', icon: '🥗' },
                  { id: 'Jain', label: 'Jain (No Root)', icon: '🌿' },
                  { id: 'Vegan', label: 'Vegan', icon: '🌱' },
                  { id: 'Non-vegetarian', label: 'Non-Veg', icon: '🍗' },
                  { id: 'No preference', label: 'No Preference', icon: '🍽️' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFoodPreference(f.id)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      foodPreference === f.id
                        ? 'border-[#102A56] bg-blue-50/70 font-bold ring-1 ring-[#102A56]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">{f.icon}</span>
                    <span className="text-xs font-bold text-[#102A56]">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accommodation Preferences */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Accommodation Styles (Select any):</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Boutique Hotels',
                  'Heritage Havelis',
                  'Luxury Resorts',
                  'Verified Homestays',
                  'Eco Lodges & Cottages',
                  'Desert & Safari Tents',
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleArrayItem(accommodationTypes, setAccommodationTypes, st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      accommodationTypes.includes(st)
                        ? 'bg-[#102A56] text-white shadow-2xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Interests */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Travel Interests &amp; Passions:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Adventure', icon: '🧗' },
                  { label: 'Nature & Wildlife', icon: '🌲' },
                  { label: 'Spirituality & Temples', icon: '🪔' },
                  { label: 'History & Heritage', icon: '🏰' },
                  { label: 'Culture & Festivals', icon: '🎭' },
                  { label: 'Shopping & Handicrafts', icon: '🛍️' },
                  { label: 'Beaches & Coastal', icon: '🏖️' },
                ].map((interest) => (
                  <button
                    key={interest.label}
                    type="button"
                    onClick={() => toggleArrayItem(selectedInterests, setSelectedInterests, interest.label)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      selectedInterests.includes(interest.label)
                        ? 'bg-[#F28C28] text-white shadow-2xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{interest.icon}</span>
                    <span>{interest.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requirements */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Special Requirements (Optional):</label>
              <textarea
                rows={2}
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. Ground floor room needed for senior citizen, wheelchair accessibility, infant booster seat..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#102A56]"
              />
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="px-6 py-2.5 rounded-xl bg-[#102A56] hover:bg-blue-950 text-white text-xs font-black uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Calculate AI Duration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 8: INTELLIGENT AI DURATION RECOMMENDATION & SUMMARY            */}
        {/* =================================================================== */}
        {currentStep === 8 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-150">
            <div>
              <span className="text-[11px] font-black text-[#F28C28] uppercase tracking-wider">Step 8 of 8 • AI Intelligence</span>
              <h2 className="text-2xl font-black text-[#102A56] mt-0.5">Your Personalized Journey Architecture</h2>
              <p className="text-xs text-slate-500 mt-1">
                AI analyzed door-to-door transit times, terrain topography, and attraction density to compute your optimal trip duration.
              </p>
            </div>

            {isCalculating ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-3 border-[#102A56] border-t-[#F28C28] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  Evaluating door-to-door distances, altitude buffers, and landmark exploration times...
                </p>
              </div>
            ) : durationRecommendation ? (
              <div className="space-y-6">
                
                {/* PROMINENT AI DURATION HERO CARD */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#102A56] to-[#0A1A33] text-white space-y-4 shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> AI Intelligent Recommendation
                    </span>
                    <span className="text-xs text-slate-300">
                      ~{durationRecommendation.travelTime.totalDistanceKm} km • ~{durationRecommendation.travelTime.totalTransitHours.toFixed(1)}h Total Transit
                    </span>
                  </div>

                  <div>
                    <h3 className="text-3xl sm:text-4xl font-black text-amber-400">
                      Recommended duration: {durationRecommendation.recommendedDuration.days}–{durationRecommendation.relaxedDuration.days} days
                    </h3>
                    <p className="text-xs text-slate-200 mt-1">
                      Current selection: <strong className="text-white">{chosenDurationDays} Days / {Math.max(1, chosenDurationDays - 1)} Nights</strong>
                    </p>
                  </div>

                  {/* Why AI recommends this */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      Why we recommend this duration:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-200">
                      {durationRecommendation.reasoning.slice(0, 4).map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Route & Altitude Warning if applicable */}
                  {durationRecommendation.warnings && durationRecommendation.warnings.length > 0 && (
                    <div className="p-3 bg-amber-500/15 border border-amber-400/40 rounded-xl text-xs text-amber-200 space-y-1">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> High Altitude &amp; Route Advisory
                      </div>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5">
                        {durationRecommendation.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Duration Adjustment Controls */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectTier('minimum')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          durationTierSelection === 'minimum' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Fast Track ({durationRecommendation.minimumDuration.days}D)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTier('recommended')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          durationTierSelection === 'recommended' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Recommended ({durationRecommendation.recommendedDuration.days}D)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTier('relaxed')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          durationTierSelection === 'relaxed' ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Relaxed Pace ({durationRecommendation.relaxedDuration.days}D)
                      </button>
                    </div>

                    {/* Stepper for custom days */}
                    <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleAdjustDays(chosenDurationDays - 1)}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-12 text-center">{chosenDurationDays} Days</span>
                      <button
                        type="button"
                        onClick={() => handleAdjustDays(chosenDurationDays + 1)}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* TRIP SUMMARY REVIEW CARD WITH DIRECT EDIT BUTTONS */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Complete Trip Configuration Summary
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Starting Location &amp; Route</span>
                        <span className="font-extrabold text-[#102A56] block mt-0.5">{originCity}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {isRoundTrip ? 'Round Trip' : 'One Way'} • {isMultiDestination ? 'Multi-destination' : 'Single destination'}
                        </span>
                      </div>
                      <button onClick={() => setCurrentStep(2)} className="text-[#1769AA] font-bold text-xs underline cursor-pointer">
                        Edit
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Destinations</span>
                        <span className="font-extrabold text-[#102A56] block mt-0.5">
                          {destinations.slice(0, 3).join(', ') || 'Custom Selection'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">{destinations.length} places selected</span>
                      </div>
                      <button onClick={() => setCurrentStep(2)} className="text-[#1769AA] font-bold text-xs underline cursor-pointer">
                        Edit
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Travellers</span>
                        <span className="font-extrabold text-[#102A56] block mt-0.5">{groupType}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {adults} Adults{children > 0 ? `, ${children} Children` : ''}{hasSeniors ? ' (Inc. Seniors)' : ''}
                        </span>
                      </div>
                      <button onClick={() => setCurrentStep(1)} className="text-[#1769AA] font-bold text-xs underline cursor-pointer">
                        Edit
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Dates &amp; Pace</span>
                        <span className="font-extrabold text-[#102A56] block mt-0.5">
                          {dateMode === 'fixed' ? `${startDate || 'Selected'} to ${endDate || 'Optimal'}` : preferredSeason}
                        </span>
                        <span className="text-[11px] text-slate-500 block uppercase font-semibold text-amber-700">
                          {travelPace} Pace
                        </span>
                      </div>
                      <button onClick={() => setCurrentStep(3)} className="text-[#1769AA] font-bold text-xs underline cursor-pointer">
                        Edit
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Transport &amp; Budget</span>
                        <span className="font-extrabold text-[#102A56] block mt-0.5 uppercase">
                          {preferredTransport.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-500 block capitalize">
                          {budgetTier} Tier ({budgetScope.replace('_', ' ')})
                        </span>
                      </div>
                      <button onClick={() => setCurrentStep(4)} className="text-[#1769AA] font-bold text-xs underline cursor-pointer">
                        Edit
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Food &amp; Stays</span>
                        <span className="font-extrabold text-[#102A56] block mt-0.5">{foodPreference}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                          {accommodationTypes.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      <button onClick={() => setCurrentStep(7)} className="text-[#1769AA] font-bold text-xs underline cursor-pointer">
                        Edit
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            ) : null}

            {/* Final Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(7)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Back to Preferences
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleGenerateAIItinerary}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#F28C28] via-[#ffc857] to-[#F5BD4F] hover:from-[#ffc857] hover:to-[#f59e3b] text-[#102A56] font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#102A56]" />
                <span>{isSaving ? 'Synthesizing Blueprint...' : 'Generate My AI Trip'}</span>
                <ArrowRight className="w-4 h-4 text-[#102A56]" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 9: FINAL MASTER ITINERARY READY / CELEBRATION                 */}
        {/* =================================================================== */}
        {currentStep === 9 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-mono font-bold rounded-full uppercase tracking-wider mb-2">
                Trip ID: #{generatedTrip?.id || 'BY-TRIP-CONFIRMED'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#102A56]">
                Your Personalized Journey is Ready! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
                BharatYatra AI has created a personalized day-by-day itinerary tailored to your group, pace, and preferences.
              </p>
            </div>

            {/* Generated Blueprint Highlights */}
            {generatedBlueprint && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-left max-w-xl mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#102A56]">{generatedBlueprint.circuitTitle}</span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                    {generatedBlueprint.totalDays} Days • {generatedBlueprint.totalNights} Nights
                  </span>
                </div>
                <div className="divide-y divide-slate-200/70 text-xs">
                  {generatedBlueprint.itineraryDays.slice(0, 3).map((d) => (
                    <div key={d.day} className="py-2 flex items-start gap-3">
                      <span className="font-mono font-bold text-slate-400 shrink-0">Day {d.day}</span>
                      <div>
                        <span className="font-bold text-slate-800 block">{d.dayTitle || d.district}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {d.badge ? `[${d.badge}] ` : ''}{d.detail || (d.activities && d.activities[0]?.description) || 'Curated cultural and travel experience'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {generatedBlueprint.totalDays > 3 && (
                    <div className="pt-2 text-[11px] text-slate-500 italic text-center">
                      + {generatedBlueprint.totalDays - 3} more tailored days included in master itinerary
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/trips/${generatedTrip?.id || 'demo'}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#102A56] hover:bg-blue-950 text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>View Full Master Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs"
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setDestinations([]);
                }}
                className="w-full sm:w-auto px-5 py-3.5 text-xs font-bold text-[#102A56] hover:underline cursor-pointer"
              >
                Plan Another Journey
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer Copyright */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <p>© 2026 BharatYatra Travel Technologies. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-xs text-slate-500 font-semibold">
          Loading BharatYatra Smart Onboarding...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

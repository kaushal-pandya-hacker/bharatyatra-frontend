'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { saveTrip, saveTripToApi, TripItem } from '@/lib/trips/trip-storage';
import Gujarat100LandmarksDirectory from '@/components/travel/Gujarat100LandmarksDirectory';
import { GUJARAT_100_LANDMARKS, LandmarkItem } from '@/lib/data/destinations';
import { generateItineraryBlueprint, PlanningResult } from '@/lib/trips/itinerary-generator';
import { useDestinationSelection } from '@/lib/tourism/destination-selection-context';
import { fetchUserTravelProfile, TravelProfile, buildTravelContext } from '@/lib/profile/travel-profile';
import { searchCities, resolveCityCoordinates, CityItem } from '@/lib/data/indian-cities';

interface TargetRegion {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
}

const REGIONS: TargetRegion[] = [
  {
    id: 'ahmedabad',
    title: 'Ahmedabad Heritage',
    subtitle: 'Sabarmati, Riverfront & Stepwell',
    badge: 'UNESCO Heritage City',
    image: '/bhuj-kutch-bg.jpg',
  },
  {
    id: 'gandhinagar',
    title: 'Gandhinagar Capital',
    subtitle: 'Akshardham & Dandi Kutir',
    badge: 'Green Capital Zone',
    image: '/bhuj-kutch-bg.jpg',
  },
  {
    id: 'kutch',
    title: 'Kutch White Desert',
    subtitle: 'Dhordo, Rann & Dholavira',
    badge: 'Rann Utsav Peak',
    image: '/bhuj-kutch-bg.jpg',
  },
  {
    id: 'gir',
    title: 'Gir Somnath & Safari',
    subtitle: 'Asiatic Lion & Somnath Temple',
    badge: 'Safari & Sanctuary',
    image: '/sasan-gir-bg.jpg',
  },
  {
    id: 'dwarka',
    title: 'Devbhumi Dwarka',
    subtitle: 'Dwarkadhish & Shivrajpur Beach',
    badge: 'Sacred Coast',
    image: '/dwarka-temple-bg.jpg',
  },
  {
    id: 'junagadh',
    title: 'Junagadh Fort & Hills',
    subtitle: 'Girnar Ropeway & Uparkot',
    badge: 'Ancient Hill Fort',
    image: '/sasan-gir-bg.jpg',
  },
  {
    id: 'surat',
    title: 'Surat Coastal & Heritage',
    subtitle: 'Dumas Beach & Silk Hub',
    badge: 'Diamond City',
    image: '/bhuj-kutch-bg.jpg',
  },
  {
    id: 'vadodara',
    title: 'Vadodara Royal Heritage',
    subtitle: 'Laxmi Vilas & Sayaji Baug',
    badge: 'Cultural Capital',
    image: '/somnath-temple-bg.jpg',
  },
  {
    id: 'narmada',
    title: 'Narmada & Statue of Unity',
    subtitle: 'Ekta Nagar & Zarwani Falls',
    badge: 'World Highest Statue',
    image: '/dwarka-temple-bg.jpg',
  },
  {
    id: 'banaskantha',
    title: 'Banaskantha & Ambaji',
    subtitle: 'Ambaji Temple & Gabbar Hill',
    badge: 'Shakti Peeth Zone',
    image: '/somnath-temple-bg.jpg',
  },
  {
    id: 'patan',
    title: 'Patan Stepwell Heritage',
    subtitle: 'Rani Ki Vav & Patola Silk',
    badge: 'UNESCO Stepwell',
    image: '/bhuj-kutch-bg.jpg',
  },
  {
    id: 'mehsana',
    title: 'Mehsana Sun Temple',
    subtitle: 'Modhera & Vadnagar',
    badge: 'Solar Architecture',
    image: '/bhuj-kutch-bg.jpg',
  },
  {
    id: 'sabarkantha',
    title: 'Sabarkantha & Polo Forest',
    subtitle: 'Idar Fort & Ancient Ruins',
    badge: 'Eco Wilderness',
    image: '/sasan-gir-bg.jpg',
  },
  {
    id: 'aravalli',
    title: 'Aravalli Hill Sanctuary',
    subtitle: 'Shamlaji Temple & Meshwo',
    badge: 'Pilgrimage Valley',
    image: '/somnath-temple-bg.jpg',
  },
  {
    id: 'dang',
    title: 'Dang & Saputara Hills',
    subtitle: 'Highland Waterfalls & Tribal Art',
    badge: 'Hill Station Sanctuary',
    image: '/somnath-temple-bg.jpg',
  },
];

const ALL_VECTORS = [
  'Wildlife & Gir Safari',
  'Sacred Temples & Aarti',
  'Ancient Stepwells & Pols',
  'Kathiyawadi Gastronomy',
  'Rogan Art & Patola Silk',
  'Coastal Sunset',
  'Astrophotography',
  'Heritage Haveli Stay',
];

function PlanPageContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { selectedDestinations, removeDestination: removeCartDestination, clearSelection: clearCartSelection } = useDestinationSelection();
  const searchParams = useSearchParams();
  const urlDestination = searchParams ? searchParams.get('destination') : null;
  const urlDistrict = searchParams ? searchParams.get('district') : null;
  const urlDuration = searchParams ? searchParams.get('duration') : null;
  const urlTier = searchParams ? searchParams.get('tier') : null;
  const urlOrigin = searchParams ? searchParams.get('origin') : null;
  const urlEndCity = searchParams ? searchParams.get('endCity') : null;

  // Single Source of Truth Planning State
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([]);
  const [customSelectedPlaces, setCustomSelectedPlaces] = useState<LandmarkItem[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [placeSearchQuery, setPlaceSearchQuery] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(urlDuration ? parseInt(urlDuration) || 5 : 5);
  const [startDate, setStartDate] = useState<string>('2026-12-24');
  const [crewType, setCrewType] = useState<string>('Family Crew (4 Pax)');
  const [paxCount, setPaxCount] = useState<number>(4);
  const [selectedTier, setSelectedTier] = useState<'budget' | 'balanced' | 'luxury'>(
    urlTier === 'budget' || urlTier === 'balanced' || urlTier === 'luxury' ? urlTier : 'balanced'
  );
  const [activeVectors, setActiveVectors] = useState<string[]>([
    'Wildlife & Gir Safari',
    'Sacred Temples & Aarti',
    'Ancient Stepwells & Pols',
    'Kathiyawadi Gastronomy',
    'Rogan Art & Patola Silk',
  ]);

  // Loading & Race Condition Management
  const [isReplanning, setIsReplanning] = useState<boolean>(false);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);
  const requestIdRef = useRef<number>(0);

  // Travel Profile & Origin State
  const [userProfile, setUserProfile] = useState<TravelProfile | null>(null);
  const [permanentOrigin, setPermanentOrigin] = useState<string>(urlOrigin || 'Dholka, Ahmedabad');
  const [tripOrigin, setTripOrigin] = useState<string>(urlOrigin || 'Dholka, Ahmedabad');
  const [isChangingOrigin, setIsChangingOrigin] = useState<boolean>(false);
  const [originSearchQuery, setOriginSearchQuery] = useState<string>('');
  const [originSuggestions, setOriginSuggestions] = useState<CityItem[]>([]);

  // Load User Travel Profile automatically on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const prof = await fetchUserTravelProfile();
        if (prof) {
          setUserProfile(prof);
          if (prof.origin?.city) {
            setPermanentOrigin(prof.origin.city);
            setTripOrigin(prof.origin.city);
          }
          if (prof.budget) {
            setSelectedTier(
              prof.budget === 'budget' || prof.budget === 'luxury' ? prof.budget : 'balanced'
            );
          }
          if (prof.typicalTravelers) {
            setPaxCount(prof.typicalTravelers);
          }
        }
      } catch (e) {}
    }
    loadProfile();
  }, []);

  // Handle Trip Origin Search
  const handleOriginSearch = (query: string) => {
    setOriginSearchQuery(query);
    if (query.trim().length > 0) {
      setOriginSuggestions(searchCities(query));
    } else {
      setOriginSuggestions([]);
    }
  };

  const selectTripOrigin = (cityName: string) => {
    setTripOrigin(cityName);
    setIsChangingOrigin(false);
    setOriginSearchQuery('');
    setOriginSuggestions([]);
  };

  // Custom places resolution: strictly prioritize selectedDestinations & customSelectedPlaces as Single Source of Truth
  const customPlaces: LandmarkItem[] = useMemo(() => {
    let places: LandmarkItem[] = [];

    // 1. Explicitly selected destinations from Destination Selection Context (Single Source of Truth)
    if (selectedDestinations && selectedDestinations.length > 0) {
      const cartPlaces = selectedDestinations.map((d, idx) => ({
        id: 9000 + idx,
        name: d.displayName || d.name,
        district: d.location || d.stateName || 'India',
        category: 'Modern & Cultural' as LandmarkItem['category'],
        description: d.location ? `Iconic destination in ${d.location}, ${d.stateName}` : `Top landmark in ${d.stateName}`,
        image: d.imageUrl || '/sasan-gir-bg.jpg',
        idealHours: 2.5,
        bestTime: 'Morning / Sunset',
        isMustVisit: true,
      }));
      for (const cp of cartPlaces) {
        if (!places.some((p) => p.name.toLowerCase() === cp.name.toLowerCase())) {
          places.push(cp);
        }
      }
    }

    // 2. Explicitly searched and added custom places in current planning session
    if (customSelectedPlaces && customSelectedPlaces.length > 0) {
      for (const cp of customSelectedPlaces) {
        if (!places.some((p) => p.name.toLowerCase() === cp.name.toLowerCase())) {
          places.push(cp);
        }
      }
    }

    // 3. URL parameters if no context destinations are selected
    if (places.length === 0 && urlDestination) {
      const names = urlDestination.split(',').map((s) => s.trim()).filter(Boolean);
      if (names.length > 0) {
        const urlPlaces = names.map((name, idx) => ({
          id: 8000 + idx,
          name,
          district: urlDistrict || 'Destination',
          category: 'Modern & Cultural' as LandmarkItem['category'],
          description: `Featured destination in ${urlDistrict || 'India'}`,
          image: '/sasan-gir-bg.jpg',
          idealHours: 2.5,
          bestTime: 'Morning / Sunset',
          isMustVisit: true,
        }));
        for (const up of urlPlaces) {
          if (!places.some((p) => p.name.toLowerCase() === up.name.toLowerCase())) {
            places.push(up);
          }
        }
      }
    }

    // 4. Manual Gujarat Landmark ID selections ONLY IF no context/searched places exist
    if (places.length === 0 && selectedPlaceIds.length > 0) {
      const gPlaces = GUJARAT_100_LANDMARKS.filter((item) => selectedPlaceIds.includes(item.id));
      for (const gp of gPlaces) {
        if (!places.some((p) => p.name.toLowerCase() === gp.name.toLowerCase())) {
          places.push(gp);
        }
      }
    }

    // 5. Region filter selections ONLY IF no explicit place selections exist
    if (places.length === 0 && selectedRegions.length > 0) {
      const regionNames = selectedRegions.map((r) => r.toLowerCase());
      const regionPlaces = GUJARAT_100_LANDMARKS.filter((item) => {
        const dist = item.district.toLowerCase();
        const name = item.name.toLowerCase();
        return regionNames.some((r) => dist.includes(r) || r.includes(dist) || name.includes(r));
      });
      for (const p of regionPlaces) {
        if (!places.some((pItem) => pItem.name.toLowerCase() === p.name.toLowerCase())) {
          places.push(p);
        }
      }
    }

    return places;
  }, [selectedDestinations, urlDestination, urlDistrict, selectedPlaceIds, selectedRegions, customSelectedPlaces]);

  const searchResults = useMemo(() => {
    if (!placeSearchQuery.trim()) return [];
    const q = placeSearchQuery.toLowerCase().trim();
    const currentPlaceNames = new Set(customPlaces.map((p) => p.name.toLowerCase()));
    
    // 1. Search Gujarat Landmarks
    const gMatches = GUJARAT_100_LANDMARKS.filter(
      (item) =>
        (item.name.toLowerCase().includes(q) || item.district.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)) &&
        !currentPlaceNames.has(item.name.toLowerCase())
    );

    // 2. Search All Indian Cities
    const cityMatches = searchCities(q)
      .filter((c) => !currentPlaceNames.has(c.city.toLowerCase()))
      .map((c, idx) => ({
        id: 7000 + idx,
        name: c.city,
        district: c.state,
        category: 'Modern & Cultural' as LandmarkItem['category'],
        description: `Popular travel destination in ${c.state}, ${c.country}`,
        image: '/sasan-gir-bg.jpg',
        idealHours: 3.0,
        bestTime: 'Morning / Sunset',
        isMustVisit: true,
      }));

    const combined = [...gMatches, ...cityMatches];
    if (combined.length === 0 && q.length > 1) {
      const coords = resolveCityCoordinates(placeSearchQuery);
      return [{
        id: 6000 + Date.now() % 1000,
        name: placeSearchQuery,
        district: coords.state || 'India',
        category: 'Modern & Cultural' as LandmarkItem['category'],
        description: `Custom destination in ${coords.state || 'India'}`,
        image: '/sasan-gir-bg.jpg',
        idealHours: 3.0,
        bestTime: 'Morning / Sunset',
        isMustVisit: true,
      }];
    }

    return combined.slice(0, 8);
  }, [placeSearchQuery, customPlaces]);

  const addLandmark = (item: LandmarkItem) => {
    if (!selectedPlaceIds.includes(item.id)) {
      setSelectedPlaceIds((prev) => [...prev, item.id]);
    }
    setCustomSelectedPlaces((prev) => {
      if (prev.some((p) => p.name.toLowerCase() === item.name.toLowerCase())) return prev;
      return [...prev, item];
    });
    setPlaceSearchQuery('');
  };

  // Initialize selected place IDs from URL parameters ONLY IF no context destinations exist
  useEffect(() => {
    if ((!selectedDestinations || selectedDestinations.length === 0) && (urlDestination || urlDistrict)) {
      const destQuery = (urlDestination || '').toLowerCase();
      const distQuery = (urlDistrict || '').toLowerCase();

      const matchedPlaces = GUJARAT_100_LANDMARKS.filter((item) => {
        const nameMatch = destQuery && destQuery.includes(item.name.toLowerCase());
        const districtMatch = distQuery && item.district.toLowerCase().includes(distQuery);
        return nameMatch || districtMatch;
      });

      if (matchedPlaces.length > 0) {
        setSelectedPlaceIds(matchedPlaces.map((p) => p.id));
      }
    }
  }, [urlDestination, urlDistrict, selectedDestinations]);

  // Pure Deterministic Itinerary Synthesis derived from Single Source of Truth
  const blueprint: PlanningResult = useMemo(() => {
    return generateItineraryBlueprint({
      selectedPlaceIds,
      selectedRegions,
      durationDays,
      crewType,
      paxCount,
      selectedTier,
      startDate,
      customPlaces,
      originCity: tripOrigin,
      destinationCity: urlEndCity && urlEndCity !== 'Return to Start Location' ? urlEndCity : undefined,
    });
  }, [selectedPlaceIds, selectedRegions, durationDays, crewType, paxCount, selectedTier, startDate, customPlaces, tripOrigin, urlEndCity]);

  // Debounced Loading & Race Condition Protection
  useEffect(() => {
    const currentReqId = ++requestIdRef.current;
    setIsReplanning(true);

    const timer = setTimeout(() => {
      if (currentReqId === requestIdRef.current) {
        setIsReplanning(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedPlaceIds, selectedRegions, durationDays, crewType, paxCount, selectedTier]);

  const toggleRegion = (id: string) => {
    setSelectedRegions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((r) => r !== id);
      }
      return [...prev, id];
    });
  };

  const toggleVector = (vector: string) => {
    setActiveVectors((prev) =>
      prev.includes(vector) ? prev.filter((v) => v !== vector) : [...prev, vector]
    );
  };

  const handleCrewChange = (type: string, pax: number) => {
    setCrewType(type);
    setPaxCount(pax);
  };

  const handleManualReSynthesize = () => {
    setIsReplanning(true);
    setTimeout(() => {
      setIsReplanning(false);
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 3000);
    }, 400);
  };

  const removePlace = (id: number) => {
    setSelectedPlaceIds((prev) => prev.filter((pId) => pId !== id));
    setCustomSelectedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveJourney = async () => {
    setIsSaving(true);
    const destCity = blueprint.destinationCity && blueprint.destinationCity !== 'Destination'
      ? blueprint.destinationCity
      : blueprint.districtList[0] || (blueprint.selectedPlaces[0]?.name) || (blueprint.selectedPlaces[0]?.district) || 'Destination';
    const generatedId = `trip-${Date.now()}`;

    const originCoords = resolveCityCoordinates(tripOrigin);
    const destCoords = resolveCityCoordinates(destCity);

    const tripCtx = {
      traveler: { name: user?.fullName || 'Traveler', typicalTravelers: paxCount },
      origin: { city: tripOrigin, state: originCoords.state || 'India', country: 'India' },
      trip: {
        origin: { city: tripOrigin, state: originCoords.state || 'India', country: 'India' },
        destination: { city: destCity, state: destCoords.state || 'India', country: 'India' },
        travelers: paxCount,
        startDate: startDate || '2026-12-24',
        endDate: '2026-12-28',
      },
      preferences: {
        travelStyle: selectedTier,
        budget: selectedTier === 'budget' ? 'economy' : selectedTier === 'luxury' ? 'premium' : 'moderate',
        pace: 'balanced',
        transport: ['train', 'bus'],
        interests: activeVectors,
      },
    };

    const routeData = {
      origin: { name: tripOrigin, latitude: originCoords.latitude, longitude: originCoords.longitude },
      destination: { name: destCity, latitude: destCoords.latitude, longitude: destCoords.longitude },
      stops: blueprint.selectedPlaces.map((p) => {
        const coords = resolveCityCoordinates(p.name);
        return {
          name: p.name,
          district: p.district,
          lat: coords.latitude,
          lng: coords.longitude,
        };
      }),
    };

    const itineraryData = {
      title: blueprint.circuitTitle,
      days: blueprint.itineraryDays.map((d) => ({
        dayNumber: d.day,
        title: d.dayTitle,
        badge: d.badge,
        detail: d.detail,
        activities: d.activities,
      })),
    };

    const tripObj: Partial<TripItem> = {
      tripId: generatedId,
      id: generatedId,
      title: blueprint.circuitTitle,
      destination: destCity,
      destinationCity: destCity,
      originCity: tripOrigin,
      startDate: startDate || '2026-12-24',
      endDate: '2026-12-28',
      durationDays: blueprint.totalDays,
      travelers: paxCount,
      travellerCount: paxCount,
      crewType,
      selectedTier,
      budgetInr: blueprint.totalPackageCost,
      status: 'UPCOMING',
      rawStatus: 'SAVED',
      version: 1,
      image: blueprint.selectedPlaces[0]?.image || '/sasan-gir-bg.jpg',
      tripContext: tripCtx as any,
      tripContextJson: tripCtx,
      routeJson: routeData,
      itineraryJson: itineraryData,
      nodes: blueprint.itineraryDays.map((d) => ({
        day: `Day ${d.day}`,
        title: d.dayTitle,
        badge: d.badge,
        detail: d.detail,
      })),
    };

    const saved = await saveTripToApi(tripObj, (user as any)?.token);
    setIsSaving(false);
    setSavedTripId(saved.id || saved.tripId);
    setGenerationSuccess(true);
  };

  const handleStartTrip = () => {
    handleSaveJourney();
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-900 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="w-full bg-slate-900 text-white py-6 px-4 sm:px-8 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">AI Trip Planner</h1>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Select your places to generate your customized trip plan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700">
              📍 {blueprint.selectedPlaces.length} Places Selected
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* AUTOMATIC PROFILE ORIGIN BANNER */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl font-bold">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold text-slate-400">Trip Starting Point</span>
                {tripOrigin !== permanentOrigin && (
                  <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    Trip-Specific Origin (Profile: {permanentOrigin})
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Starting from <span className="text-blue-700">{tripOrigin}</span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsChangingOrigin(!isChangingOrigin)}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-amber-600">edit_location</span>
            <span>{isChangingOrigin ? 'Close Origin Editor' : 'Change starting point for this trip'}</span>
          </button>
        </div>

        {/* CHANGE STARTING POINT INLINE EDITOR */}
        {isChangingOrigin && (
          <div className="bg-blue-50/80 border-2 border-blue-200 rounded-3xl p-5 shadow-inner space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-blue-900">
                Select a temporary origin for THIS trip only (Permanent profile stays &quot;{permanentOrigin}&quot;)
              </p>
              <button type="button" onClick={() => setIsChangingOrigin(false)} className="text-xs font-bold text-blue-700">✕ Close</button>
            </div>

            <div className="relative max-w-md">
              <input
                type="text"
                value={originSearchQuery}
                onChange={(e) => handleOriginSearch(e.target.value)}
                placeholder="Search city (e.g. Mumbai, Surat, Rajkot, Vadodara, Delhi...)"
                className="w-full bg-white border border-blue-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {originSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-blue-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 p-2">
                  {originSuggestions.map((c) => (
                    <button
                      key={`${c.city}-${c.state}`}
                      type="button"
                      onClick={() => selectTripOrigin(c.city)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 flex items-center justify-between text-xs transition-all cursor-pointer"
                    >
                      <span className="font-bold text-slate-900">{c.city} ({c.state})</span>
                      <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">Use for Trip</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs font-extrabold">
              <span className="text-slate-500 self-center">Popular Origins:</span>
              {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Mumbai', 'Delhi'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => selectTripOrigin(c)}
                  className={`px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                    tripOrigin === c ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Destination Selector & Controls */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* SECTION 1: Selected Destinations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider">
                    Where do you want to go?
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">Selected destinations from {tripOrigin}</p>
                </div>
                <div className="flex items-center gap-2">
                  {blueprint.selectedPlaces.length > 0 && (
                    <button
                      onClick={() => {
                        if (clearCartSelection) clearCartSelection();
                        setCustomSelectedPlaces([]);
                        setSelectedPlaceIds([]);
                        setSelectedRegions([]);
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                  <Link
                    href="/destinations"
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 transition flex items-center gap-1"
                  >
                    + Browse Catalog
                  </Link>
                </div>
              </div>

              {/* Quick Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={placeSearchQuery}
                  onChange={(e) => setPlaceSearchQuery(e.target.value)}
                  placeholder="🔍 Search & add places (e.g. Somnath, Dwarka, Rann of Kutch, Statue of Unity)..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addLandmark(item)}
                        className="w-full text-left px-4 py-2.5 hover:bg-amber-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="text-slate-500 ml-1.5 font-medium">({item.district})</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">+ Add</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Places List Badges */}
              {blueprint.selectedPlaces.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {blueprint.selectedPlaces.map((place) => (
                    <span
                      key={place.id}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs"
                    >
                      <span>📍 {place.name} ({place.district})</span>
                      <button
                        onClick={() => {
                          removeCartDestination(String(place.id));
                          removePlace(place.id);
                        }}
                        className="w-4 h-4 rounded-full bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ml-1"
                        title="Remove place"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-amber-50/50 rounded-xl border border-dashed border-amber-200 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    No places selected yet. Search above or browse catalog to add places to your trip.
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 2: Trip Options */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Trip Options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Duration (Days):</label>
                  <div className="flex items-center gap-1">
                    {[3, 5, 7, 10].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDurationDays(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          durationDays === d
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d}D
                      </button>
                    ))}
                  </div>
                </div>

                {/* Travelers */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Travelers Group:</label>
                  <select
                    value={crewType}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes('1')) handleCrewChange('Solo Adventurer (1 Pax)', 1);
                      else if (val.includes('2')) handleCrewChange('Couple (2 Pax)', 2);
                      else if (val.includes('6')) handleCrewChange('Friends Group (6 Pax)', 6);
                      else handleCrewChange('Family Crew (4 Pax)', 4);
                    }}
                    className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs font-medium text-slate-800"
                  >
                    <option value="Solo Adventurer (1 Pax)">Solo (1 Guest)</option>
                    <option value="Couple (2 Pax)">Couple (2 Guests)</option>
                    <option value="Family Crew (4 Pax)">Family (4 Guests)</option>
                    <option value="Friends Group (6 Pax)">Friends (6 Guests)</option>
                  </select>
                </div>

                {/* Comfort Tier */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Comfort Level:</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as any)}
                    className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs font-medium text-slate-800"
                  >
                    <option value="budget">Budget Explorer (₹2,500/day)</option>
                    <option value="balanced">Balanced Comfort (₹6,000/day)</option>
                    <option value="luxury">Sovereign Luxury (₹13,500/day)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Trip Plan (Generated Itinerary) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                    Your Trip Plan
                  </span>
                  <h3 className="text-base font-bold leading-tight">
                    {blueprint.circuitTitle}
                  </h3>
                  {blueprint.districtList.length > 0 && (
                    <p className="text-xs text-slate-300 mt-0.5">
                      📍 {blueprint.districtList.join(' • ')}
                    </p>
                  )}
                </div>
                {blueprint.selectedPlaces.length > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg">
                    {blueprint.totalDays} Days / {blueprint.totalNights} Nights
                  </span>
                )}
              </div>

              {/* Itinerary Schedule */}
              <div className="p-6">
                {blueprint.selectedPlaces.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-slate-300">map</span>
                    <h4 className="text-sm font-bold text-slate-700">No Places Selected Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Search and add places on the left to see your customized day-by-day trip itinerary here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="relative pl-6 flex flex-col gap-6">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-amber-400"></div>
                      {blueprint.itineraryDays.map((node) => (
                        <div key={node.day} className="relative flex flex-col gap-1.5">
                          <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-white"></span>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">
                              Day {node.day}: {node.dayTitle}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                              {node.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {node.detail}
                          </p>

                          {/* Specific Activities for the Day */}
                          {node.activities.length > 0 && (
                            <div className="mt-1 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {node.activities.map((act, aIdx) => (
                                <div key={aIdx} className="flex items-start gap-2 text-xs">
                                  <span className="font-mono text-[10px] font-bold text-amber-700 shrink-0 mt-0.5">
                                    {act.time}
                                  </span>
                                  <div className="flex-1">
                                    <span className="font-bold text-slate-900">{act.placeName}</span>
                                    <span className="text-[10px] text-slate-500 ml-1">({act.district})</span>
                                    <p className="text-[11px] text-slate-600 line-clamp-1">{act.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Price & Booking Footer */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Total Cost</span>
                          <div className="text-lg font-black text-slate-900">
                            ₹{blueprint.totalPackageCost.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500">{paxCount} Guests ({blueprint.totalDays} Days)</span>
                          <div className="text-xs font-bold text-amber-700">
                            ₹{blueprint.pricePerPaxPerDay.toLocaleString('en-IN')} / person / day
                          </div>
                        </div>
                      </div>

                      {generationSuccess ? (
                        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
                          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                            <span>✓</span>
                            <span>Journey saved ✓</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/trips/${savedTripId || 'demo-trip-id-123'}`}
                              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl text-center shadow-xs transition"
                            >
                              View My Trip →
                            </Link>
                            <Link
                              href="/dashboard"
                              className="py-3 px-4 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl text-center transition"
                            >
                              Dashboard
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              Your journey is ready
                            </span>
                            <span className="text-[10px] text-slate-400">Explicit save required</span>
                          </div>

                          <button
                            onClick={handleSaveJourney}
                            disabled={isSaving}
                            className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined font-bold">bookmark</span>
                            <span>{isSaving ? 'Saving Journey...' : 'Save Journey'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-white">Loading AI Planner...</div>}>
      <PlanPageContent />
    </Suspense>
  );
}

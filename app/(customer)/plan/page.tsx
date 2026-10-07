'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { saveTrip, TripItem } from '@/lib/trips/trip-storage';
import Gujarat100LandmarksDirectory from '@/components/travel/Gujarat100LandmarksDirectory';
import { GUJARAT_100_LANDMARKS, LandmarkItem } from '@/lib/data/destinations';
import { generateItineraryBlueprint, PlanningResult } from '@/lib/trips/itinerary-generator';

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
  const searchParams = useSearchParams();
  const urlDestination = searchParams ? searchParams.get('destination') : null;
  const urlDistrict = searchParams ? searchParams.get('district') : null;

  // Single Source of Truth Planning State
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['kutch', 'gir']);
  const [durationDays, setDurationDays] = useState<number>(5);
  const [startDate, setStartDate] = useState<string>('2026-12-24');
  const [crewType, setCrewType] = useState<string>('Family Crew (4 Pax)');
  const [paxCount, setPaxCount] = useState<number>(4);
  const [selectedTier, setSelectedTier] = useState<'budget' | 'balanced' | 'luxury'>('luxury');
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

  // Initialize selected place IDs from URL parameters if present
  useEffect(() => {
    if (urlDestination || urlDistrict) {
      const destQuery = (urlDestination || '').toLowerCase();
      const distQuery = (urlDistrict || '').toLowerCase();

      const matchedPlaces = GUJARAT_100_LANDMARKS.filter((item) => {
        const nameMatch = destQuery.includes(item.name.toLowerCase());
        const districtMatch = distQuery && item.district.toLowerCase().includes(distQuery);
        return nameMatch || districtMatch;
      });

      if (matchedPlaces.length > 0) {
        setSelectedPlaceIds(matchedPlaces.map((p) => p.id));
      }

      // Sync selected regions
      const matchedRegion = REGIONS.find((r) => {
        if (distQuery && (r.id === distQuery || r.title.toLowerCase().includes(distQuery))) return true;
        if (destQuery && (r.title.toLowerCase().split(' ').some((w) => w.length > 3 && destQuery.includes(w)))) return true;
        return false;
      });

      if (matchedRegion) {
        setSelectedRegions([matchedRegion.id]);
      }
    }
  }, [urlDestination, urlDistrict]);

  // Synchronize URL query parameters with active state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const selectedItems = GUJARAT_100_LANDMARKS.filter((item) => selectedPlaceIds.includes(item.id));
    const placeNames = selectedItems.map((item) => item.name).join(', ');
    const uniqueDistricts = Array.from(new Set(selectedItems.map((item) => item.district))).join(', ');

    const params = new URLSearchParams(window.location.search);
    if (placeNames) {
      params.set('destination', placeNames);
      params.set('district', uniqueDistricts);
    } else {
      params.delete('destination');
      params.delete('district');
    }

    const newQuery = params.toString();
    const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [selectedPlaceIds]);

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
    });
  }, [selectedPlaceIds, selectedRegions, durationDays, crewType, paxCount, selectedTier, startDate]);

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
        if (prev.length === 1) return prev; // Keep at least one selected
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
  };

  const handleStartTrip = () => {
    const tripObj: TripItem = {
      tripId: `trip-${Date.now()}`,
      title: blueprint.circuitTitle,
      destination: blueprint.districtList.join(' & ') || 'Gujarat',
      startDate: startDate || 'Dec 24, 2026',
      durationDays: blueprint.totalDays,
      travellerCount: paxCount,
      crewType,
      selectedTier,
      budgetInr: blueprint.totalPackageCost,
      status: 'ACTIVE',
      version: 1,
      image: blueprint.selectedPlaces[0]?.image || '/sasan-gir-bg.jpg',
      nodes: blueprint.itineraryDays.map((d) => ({
        day: `Day ${d.day}`,
        title: d.dayTitle,
        badge: d.badge,
        detail: d.detail,
      })),
      createdAt: new Date().toISOString(),
    };

    if (!user) {
      try {
        localStorage.setItem('chalo_farva_pending_trip', JSON.stringify(tripObj));
      } catch {}
      router.push('/login?redirect=/plan');
      return;
    }

    saveTrip(tripObj);
    router.push('/my-trips');
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* MAIN CONTENT */}
      <main className="w-full bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          {/* Command Center Control Ribbon */}
          <div className="w-full bg-on-secondary-fixed text-on-secondary py-space-sm px-gutter-desktop">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-md">
                <span className="flex items-center gap-space-xs font-label-caps text-label-caps text-primary-container uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-ping inline-block"></span>
                  Autonomous Route Synthesis Engine
                </span>
                <span className="text-secondary-fixed-dim/40 font-body-sm">|</span>
                <span className="font-body-sm text-body-sm text-surface-variant font-medium">
                  LIVE RE-PLANNING ACTIVE // SINGLE SOURCE OF TRUTH
                </span>
              </div>
              <div className="flex items-center gap-space-md font-body-sm text-body-sm text-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">verified_user</span>
                  <span>{selectedPlaceIds.length} Places Selected ({blueprint.zonesSynced} Zones)</span>
                </div>
                <span className="text-secondary-fixed-dim/40">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">satellite_alt</span>
                  <span>Sync Pulse: 12ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Stepper Ribbon */}
          <div className="w-full bg-surface-container-lowest shadow-sm py-space-md px-gutter-desktop">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between overflow-x-auto gap-space-md pb-1">
                {/* Step 1 */}
                <div className="flex items-center gap-space-xs flex-shrink-0">
                  <span className="w-6 h-6 rounded-full bg-on-secondary-fixed text-primary-container flex items-center justify-center font-label-caps text-label-caps font-bold">
                    {blueprint.zonesSynced}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps uppercase text-outline">01. Destination</span>
                    <span className="font-title-md text-title-md text-on-secondary-fixed font-semibold">
                      {blueprint.zonesSynced} Target {blueprint.zonesSynced === 1 ? 'Region' : 'Regions'}
                    </span>
                  </div>
                </div>
                <span className="w-8 h-[2px] bg-secondary-fixed-dim/30 flex-shrink-0"></span>

                {/* Step 2 */}
                <div className="flex items-center gap-space-xs flex-shrink-0">
                  <span className="w-6 h-6 rounded-full bg-on-secondary-fixed text-primary-container flex items-center justify-center font-label-caps text-label-caps font-bold">
                    ✓
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps uppercase text-outline">02. Duration</span>
                    <span className="font-title-md text-title-md text-on-secondary-fixed font-semibold">
                      {blueprint.totalDays} Days / {blueprint.totalNights} Nights
                    </span>
                  </div>
                </div>
                <span className="w-8 h-[2px] bg-secondary-fixed-dim/30 flex-shrink-0"></span>

                {/* Step 3 */}
                <div className="flex items-center gap-space-xs flex-shrink-0">
                  <span className="w-6 h-6 rounded-full bg-on-secondary-fixed text-primary-container flex items-center justify-center font-label-caps text-label-caps font-bold">
                    ✓
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps uppercase text-outline">03. Group</span>
                    <span className="font-title-md text-title-md text-on-secondary-fixed font-semibold">
                      {crewType}
                    </span>
                  </div>
                </div>
                <span className="w-8 h-[2px] bg-secondary-fixed-dim/30 flex-shrink-0"></span>

                {/* Step 4 */}
                <div className="flex items-center gap-space-xs flex-shrink-0">
                  <span className="w-6 h-6 rounded-full bg-primary-container text-on-secondary-fixed font-bold flex items-center justify-center font-label-caps text-label-caps shadow-sm">
                    04
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold">04. Comfort Tier</span>
                    <span className="font-title-md text-title-md text-on-surface font-bold">
                      {selectedTier === 'luxury'
                        ? 'Sovereign Luxury'
                        : selectedTier === 'balanced'
                        ? 'Balanced Comfort'
                        : 'Budget Explorer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="w-full px-gutter-desktop py-space-xl max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
              {/* LEFT COLUMN: Interactive Configurator */}
              <div className="lg:col-span-7 flex flex-col gap-space-xl min-w-0">
                {/* SECTION 1: Target Regions & City/Places Selector */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                      <h2 className="font-headline-sm text-headline-sm text-on-secondary-fixed tracking-tight">
                        1. Select Target Regions &amp; Cities (Click to Toggle)
                      </h2>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold bg-primary-fixed/30 px-2 py-1 rounded">
                      {selectedRegions.length} Regions Active
                    </span>
                  </div>

                  {/* Target Macro Region Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                    {REGIONS.map((region) => {
                      const isSelected = selectedRegions.includes(region.id);
                      return (
                        <div
                          key={region.id}
                          onClick={() => toggleRegion(region.id)}
                          className={`group relative rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer border-2 ${
                            isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="relative h-32 w-full overflow-hidden">
                            <img
                              src={region.image}
                              alt={region.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed/90 via-transparent to-transparent"></div>
                            {isSelected && (
                              <span className="absolute top-2 right-2 bg-primary-container text-on-secondary-fixed rounded-full p-1 shadow-sm flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                              </span>
                            )}
                            <span className="absolute bottom-2 left-2 text-on-secondary font-label-caps text-label-caps uppercase bg-on-secondary-fixed/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                              {region.badge}
                            </span>
                          </div>
                          <div className="p-3 bg-surface-container-lowest flex flex-col">
                            <span className="font-title-md text-title-md text-on-surface font-semibold text-sm">
                              {region.title}
                            </span>
                            <span className="font-body-sm text-xs text-outline">
                              {region.subtitle}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Clean Selected Places & Quick Multi-Place Selection Control */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Selected Destinations &amp; Places ({selectedPlaceIds.length})
                          </span>
                        </div>
                        <Link
                          href="/destinations"
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1"
                        >
                          <span>+ Add More Places from Catalog</span>
                        </Link>
                      </div>

                      {/* Display Active Selected Place Badges */}
                      {selectedPlaceIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {GUJARAT_100_LANDMARKS.filter((item) => selectedPlaceIds.includes(item.id)).map((place) => (
                            <span
                              key={place.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold shadow-2xs"
                            >
                              <span>📍 {place.name} ({place.district})</span>
                              <button
                                onClick={() => removePlace(place.id)}
                                className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-900 flex items-center justify-center text-[10px] font-bold"
                                title="Remove place"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-medium">
                          No specific landmarks selected yet. Select target regions above or click quick tags below to include iconic attractions in your AI itinerary.
                        </p>
                      )}

                      {/* Quick Add Featured Landmarks */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Add:</span>
                        {[
                          { id: 1, name: 'Gir National Park' },
                          { id: 2, name: 'Somnath Temple' },
                          { id: 3, name: 'Rann of Kutch' },
                          { id: 4, name: 'Statue of Unity' },
                          { id: 5, name: 'Dwarkadhish Temple' },
                          { id: 6, name: 'Rani Ki Vav' },
                        ].map((landmark) => {
                          const isSelected = selectedPlaceIds.includes(landmark.id);
                          return (
                            <button
                              key={landmark.id}
                              onClick={() => {
                                if (isSelected) {
                                  removePlace(landmark.id);
                                } else {
                                  setSelectedPlaceIds((prev) => [...prev, landmark.id]);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {landmark.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Dates & Travelers Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {/* Dates Card */}
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps uppercase text-outline">Temporal Parameters</span>
                      <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-on-surface">Start Date:</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-surface-container-low px-2 py-1 rounded text-xs text-on-surface font-mono border border-outline/20"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-on-surface">Duration:</span>
                        <div className="flex items-center gap-1">
                          {[3, 5, 7, 10].map((d) => (
                            <button
                              key={d}
                              onClick={() => setDurationDays(d)}
                              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                                durationDays === d
                                  ? 'bg-primary-container text-on-secondary-fixed'
                                  : 'bg-surface-container-low text-secondary hover:text-on-surface'
                              }`}
                            >
                              {d}D
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-sm">wb_twilight</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {blueprint.totalDays} Days / {blueprint.totalNights} Nights Window • Recommended {blueprint.recommendedDays}D
                      </span>
                    </div>
                  </div>

                  {/* Travelers Card */}
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps uppercase text-outline">Expedition Manifest</span>
                      <span className="material-symbols-outlined text-primary text-[20px]">group</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCrewChange('Solo Adventurer (1 Pax)', 1)}
                        className={`p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                          paxCount === 1 ? 'border-primary bg-primary-fixed/20 text-on-surface font-bold' : 'border-outline/20 text-secondary'
                        }`}
                      >
                        👤 Solo (1 Pax)
                      </button>
                      <button
                        onClick={() => handleCrewChange('Couple (2 Pax)', 2)}
                        className={`p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                          paxCount === 2 ? 'border-primary bg-primary-fixed/20 text-on-surface font-bold' : 'border-outline/20 text-secondary'
                        }`}
                      >
                        👫 Couple (2 Pax)
                      </button>
                      <button
                        onClick={() => handleCrewChange('Family Crew (4 Pax)', 4)}
                        className={`p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                          paxCount === 4 ? 'border-primary bg-primary-fixed/20 text-on-surface font-bold' : 'border-outline/20 text-secondary'
                        }`}
                      >
                        👨‍👩‍👧‍👦 Family (4 Pax)
                      </button>
                      <button
                        onClick={() => handleCrewChange('Friends Group (6 Pax)', 6)}
                        className={`p-2 rounded-lg text-left text-xs font-medium border transition-all ${
                          paxCount === 6 ? 'border-primary bg-primary-fixed/20 text-on-surface font-bold' : 'border-outline/20 text-secondary'
                        }`}
                      >
                        👥 Friends (6 Pax)
                      </button>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-sm">verified</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {crewType} • Verified Vehicle Sizing
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Curated Expedition Vectors */}
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-on-secondary-fixed font-semibold">
                      Active Expedition Focus Vectors
                    </span>
                    <span className="font-label-caps text-label-caps uppercase text-outline">Click to Toggle</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALL_VECTORS.map((vector) => {
                      const isVectorActive = activeVectors.includes(vector);
                      return (
                        <button
                          key={vector}
                          onClick={() => toggleVector(vector)}
                          className={`px-3.5 py-1.5 rounded-full font-label-md text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                            isVectorActive
                              ? 'bg-on-secondary-fixed text-primary-container shadow-sm font-bold'
                              : 'bg-surface-container-lowest text-secondary hover:bg-surface-container-low'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVectorActive ? 'bg-primary-container' : 'bg-outline'
                            }`}
                          ></span>
                          {vector}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 4: Sanctuary Comfort Tier Selection */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                      <h2 className="font-headline-sm text-headline-sm text-on-secondary-fixed tracking-tight">
                        Sanctuary Comfort & Mobility Level
                      </h2>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                      Active Tier: {selectedTier.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                    {/* Budget Option */}
                    <div
                      onClick={() => setSelectedTier('budget')}
                      className={`bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-md cursor-pointer transition-all border-2 ${
                        selectedTier === 'budget' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-label-caps text-label-caps uppercase text-outline">Verified Heritage</span>
                        <span className="font-title-md text-title-md font-bold text-on-surface">Budget Explorer</span>
                        <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                          ₹2,500 <span className="font-body-sm text-body-sm text-outline font-normal">/day/pax</span>
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1.5 font-body-sm text-xs text-secondary">
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                          Verified Haveli guesthouses
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                          GSRTC Premium AC Volvo Transit
                        </li>
                      </ul>
                      <button className="w-full py-2 bg-surface-container text-on-surface font-label-md text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors">
                        {selectedTier === 'budget' ? 'Active Tier' : 'Select Budget'}
                      </button>
                    </div>

                    {/* Balanced Option */}
                    <div
                      onClick={() => setSelectedTier('balanced')}
                      className={`bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between gap-space-md cursor-pointer transition-all border-2 ${
                        selectedTier === 'balanced' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-label-caps text-label-caps uppercase text-outline">Curated Comfort</span>
                        <span className="font-title-md text-title-md font-bold text-on-surface">Balanced Comfort</span>
                        <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                          ₹6,000 <span className="font-body-sm text-body-sm text-outline font-normal">/day/pax</span>
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1.5 font-body-sm text-xs text-secondary">
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                          3-Star AC Heritage Havelis
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                          Dedicated Sedan Transfers
                        </li>
                      </ul>
                      <button className="w-full py-2 bg-surface-container text-on-surface font-label-md text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors">
                        {selectedTier === 'balanced' ? 'Active Tier' : 'Select Balanced'}
                      </button>
                    </div>

                    {/* Luxury Option */}
                    <div
                      onClick={() => setSelectedTier('luxury')}
                      className={`bg-on-secondary-fixed text-on-secondary p-space-md rounded-xl shadow-xl flex flex-col justify-between gap-space-md relative overflow-hidden cursor-pointer border-2 ${
                        selectedTier === 'luxury' ? 'border-primary-container ring-2 ring-primary-container/30' : 'border-transparent opacity-90 hover:opacity-100'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-label-caps text-label-caps uppercase text-primary-container">BharatYatra Signature</span>
                        <span className="font-title-md text-title-md font-bold text-on-secondary">Sovereign Luxury</span>
                        <span className="font-headline-sm text-headline-sm text-primary-container font-semibold">
                          ₹13,500 <span className="font-body-sm text-body-sm text-surface-variant font-normal">/day/pax</span>
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1.5 font-body-sm text-xs text-surface-variant">
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary-container">verified</span>
                          Royal Palace & Premium Tents
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-primary-container">verified</span>
                          Chauffeur Innova Crysta throughout
                        </li>
                      </ul>
                      <button className="w-full py-2 bg-primary-container text-on-secondary-fixed font-label-md text-xs font-bold rounded-lg text-center">
                        {selectedTier === 'luxury' ? 'Active Target' : 'Select Luxury'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Live Synthesized Blueprint Preview (Single Source of Truth) */}
              <div className="lg:col-span-5 flex flex-col gap-space-lg min-w-0 sticky top-24">
                {/* Live AI Telemetry Card */}
                <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col gap-space-sm relative overflow-hidden">
                  {/* Replanning Loading Overlay */}
                  {isReplanning && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-200">
                      <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Replanning your journey...</span>
                      <span className="text-[11px] text-slate-300 mt-1">Optimizing destinations, travel time &amp; daily route</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${isReplanning ? 'bg-amber-400 animate-ping' : 'bg-primary-container'}`}></span>
                      <h3 className="font-title-lg text-title-lg text-on-secondary-fixed font-bold">
                        {isReplanning ? 'Synthesizing Neural Blueprint...' : 'Neural Constraint Engine'}
                      </h3>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold bg-primary-fixed/40 px-2 py-0.5 rounded">
                      Zero Conflict
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                        <span className="font-body-sm text-xs text-on-surface font-medium">Selected Regions Route Optimization</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-primary font-bold">
                        {blueprint.zonesSynced} {blueprint.zonesSynced === 1 ? 'ZONE SYNCED' : 'ZONES SYNCED'}
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">group</span>
                        <span className="font-body-sm text-xs text-on-surface font-medium">Vehicle &amp; Room Capacity Allocation</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-primary font-bold">{crewType}</span>
                    </div>
                  </div>
                </div>

                {/* Blueprint Card */}
                <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col relative">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      alt="Gujarat Itinerary Preview"
                      src={blueprint.selectedPlaces[0]?.image || '/sasan-gir-bg.jpg'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-secondary-fixed via-on-secondary-fixed/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <div>
                        <span className="font-label-caps text-label-caps uppercase text-primary-container tracking-wider">
                          Synthesized Blueprint Preview
                        </span>
                        <h3 className="font-headline-sm text-headline-sm text-on-secondary font-bold leading-tight">
                          {blueprint.circuitTitle}
                        </h3>
                        <p className="text-xs text-amber-300 font-medium truncate max-w-xs mt-0.5">
                          📍 {blueprint.districtList.join(' • ') || 'Gujarat Vector'}
                        </p>
                      </div>
                      <span className="bg-primary-container text-on-secondary-fixed font-label-caps text-label-caps px-2.5 py-1 rounded font-bold uppercase text-xs shrink-0">
                        {blueprint.totalDays}D / {blueprint.totalNights}N
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Summary of Selected Places */}
                  {blueprint.selectedPlaces.length > 0 && (
                    <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                        <span>Selected Places ({blueprint.selectedPlaces.length}):</span>
                        <button
                          onClick={() => setSelectedPlaceIds([])}
                          className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                        {blueprint.selectedPlaces.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium"
                          >
                            <span>{p.name}</span>
                            <button
                              onClick={() => removePlace(p.id)}
                              className="text-slate-400 hover:text-white ml-0.5"
                              title="Remove place"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Nodes List */}
                  <div className="p-space-md flex flex-col gap-space-md">
                    <div className="relative pl-6 flex flex-col gap-space-md">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary-container/80"></div>
                      {blueprint.itineraryDays.map((node) => (
                        <div key={node.day} className="relative flex flex-col gap-1 border-b border-slate-800/40 pb-3 last:border-b-0 last:pb-0">
                          <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-primary-container ring-4 ring-surface-container-lowest"></span>
                          <div className="flex items-center justify-between">
                            <span className="font-title-md text-sm font-bold text-on-surface">
                              Day {node.day}: {node.dayTitle}
                            </span>
                            <span className="font-label-caps text-[10px] text-outline uppercase">{node.badge}</span>
                          </div>
                          <p className="font-body-sm text-xs text-secondary leading-relaxed">
                            {node.detail}
                          </p>

                          {/* Specific Activities for the Day */}
                          {node.activities.length > 0 && (
                            <div className="mt-1 space-y-1 bg-surface-container-low p-2 rounded-lg">
                              {node.activities.map((act, aIdx) => (
                                <div key={aIdx} className="flex items-start gap-2 text-xs">
                                  <span className="font-mono text-[10px] font-bold text-primary-container shrink-0 mt-0.5">
                                    {act.time}
                                  </span>
                                  <div className="flex-1">
                                    <span className="font-bold text-on-surface">{act.placeName}</span>
                                    <span className="text-[10px] text-outline ml-1">({act.district})</span>
                                    <p className="text-[11px] text-secondary line-clamp-1">{act.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Price Summary */}
                    <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-label-caps text-label-caps uppercase text-outline">
                          Estimated Total ({paxCount} Guests, {blueprint.totalDays} Days)
                        </span>
                        <span className="font-label-caps text-label-caps text-primary font-bold">ALL-INCLUSIVE</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="font-headline-md text-xl font-bold text-on-secondary-fixed">
                          ₹{blueprint.totalPackageCost.toLocaleString('en-IN')}{' '}
                          <span className="text-xs text-secondary font-normal">total package</span>
                        </span>
                        <span className="text-xs text-tertiary font-semibold">
                          ₹{blueprint.pricePerPaxPerDay.toLocaleString('en-IN')} / person / day
                        </span>
                      </div>
                      <p className="text-xs text-secondary">
                        Includes stays, private transit, permits, &amp; meals for {crewType}. Zero hidden tariffs.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      <button
                        onClick={handleStartTrip}
                        className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-title-md text-sm font-extrabold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50 group"
                      >
                        <span className="material-symbols-outlined font-bold group-hover:scale-110 transition-transform">rocket_launch</span>
                        <span>Start Trip &amp; Add to Dashboard</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>

                      <button
                        onClick={handleManualReSynthesize}
                        disabled={isReplanning}
                        className="w-full py-2.5 px-6 bg-surface-container-high text-on-surface font-title-md text-xs font-semibold rounded-xl hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        <span>
                          {isReplanning
                            ? 'Synthesizing Adaptive Itinerary...'
                            : generationSuccess
                            ? '✓ Blueprint Updated!'
                            : 'Re-Synthesize AI Blueprint'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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

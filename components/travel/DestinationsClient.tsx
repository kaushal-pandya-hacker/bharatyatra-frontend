'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Compass,
  Filter,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Globe,
  CheckCircle2,
  RotateCcw,
  Building2,
  Grid,
  Plus,
  Check,
  ArrowLeft,
  Route
} from 'lucide-react';
import {
  getAllStateFolderItems,
  StateFolderItem,
} from '@/lib/tourism/state-folder-loader';
import { useDestinationSelection } from '@/lib/tourism/destination-selection-context';

interface MasterDestinationView {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  state: string;
  stateSlug: string;
  location: string;
  category: string;
  imageUrl: string;
  rawFileName: string;
}

export default function DestinationsClient() {
  const { toggleDestination, isDestinationSelected } = useDestinationSelection();

  const [allStates, setAllStates] = useState<StateFolderItem[]>([]);
  const [allPlaces, setAllPlaces] = useState<MasterDestinationView[]>([]);
  const [loading, setLoading] = useState(true);



  // Filter states
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-Place Selection for Custom Trip Planning
  const [selectedTripPlaces, setSelectedTripPlaces] = useState<MasterDestinationView[]>([]);

  useEffect(() => {
    function loadFolderData() {
      setLoading(true);
      const states = getAllStateFolderItems();
      setAllStates(states);

      const combined: MasterDestinationView[] = [];
      states.forEach((st) => {
        st.places.forEach((p) => {
          combined.push({
            id: `${st.slug}-${p.slug}`,
            name: p.name,
            displayName: p.displayName || p.name,
            slug: p.slug,
            state: p.stateName,
            stateSlug: p.stateSlug,
            location: p.location || p.district || p.city || p.stateName,
            category: p.category || 'Attraction',
            imageUrl: p.imageUrl,
            rawFileName: p.rawFileName,
          });
        });
      });

      setAllPlaces(combined);
      setLoading(false);
    }

    loadFolderData();
  }, []);

  function normalizeState(str: string): string {
    return str.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
  }

  // Compute available locations for selected state
  const availableLocations = useMemo(() => {
    if (selectedState === 'All States') return ['All Locations'];
    const placesInState = allPlaces.filter(
      (p) => p.state.toLowerCase().trim() === selectedState.toLowerCase().trim() ||
             normalizeState(p.state) === normalizeState(selectedState)
    );
    const locs = Array.from(new Set(placesInState.map((p) => p.location))).sort();
    return ['All Locations', ...locs];
  }, [allPlaces, selectedState]);

  // Compute available categories
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(allPlaces.map((p) => p.category))).sort();
    return ['All Categories', ...cats];
  }, [allPlaces]);

  // Filter logic
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter((dest) => {
      if (
        selectedState !== 'All States' &&
        dest.state.toLowerCase().trim() !== selectedState.toLowerCase().trim() &&
        normalizeState(dest.state) !== normalizeState(selectedState)
      ) {
        return false;
      }

      if (
        selectedLocation !== 'All Locations' &&
        dest.location.toLowerCase().trim() !== selectedLocation.toLowerCase().trim()
      ) {
        return false;
      }

      if (
        selectedCategory !== 'All Categories' &&
        dest.category.toLowerCase().trim() !== selectedCategory.toLowerCase().trim()
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = dest.name.toLowerCase().includes(q);
        const matchesState = dest.state.toLowerCase().includes(q);
        const matchesLocation = dest.location.toLowerCase().includes(q);
        const matchesCategory = dest.category.toLowerCase().includes(q);
        const matchesFile = dest.rawFileName.toLowerCase().includes(q);

        if (!matchesName && !matchesState && !matchesLocation && !matchesCategory && !matchesFile) {
          return false;
        }
      }

      return true;
    });
  }, [allPlaces, selectedState, selectedLocation, selectedCategory, searchQuery]);

  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    setSelectedLocation('All Locations');
    if (typeof window !== 'undefined') {
      const el = document.getElementById('destinations-directory-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleResetFilters = () => {
    setSelectedState('All States');
    setSelectedLocation('All Locations');
    setSelectedCategory('All Categories');
    setSearchQuery('');
  };

  // Toggle place selection for multi-destination planning
  const togglePlaceSelection = (dest: MasterDestinationView) => {
    setSelectedTripPlaces((prev) => {
      const exists = prev.some((p) => p.id === dest.id);
      if (exists) {
        return prev.filter((p) => p.id !== dest.id);
      } else {
        return [...prev, dest];
      }
    });
  };

  const isPlaceSelected = (id: string) => {
    return selectedTripPlaces.some((p) => p.id === id);
  };

  const uniqueStatesCount = useMemo(() => {
    return new Set(selectedTripPlaces.map((p) => p.state)).size;
  }, [selectedTripPlaces]);

  const displayStates = useMemo(() => {
    if (!searchQuery.trim()) return allStates;
    const q = searchQuery.toLowerCase().trim();
    return allStates.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.slug.toLowerCase().includes(q)
    );
  }, [allStates, searchQuery]);

  const isShowStateBoxGrid = selectedState === 'All States' && (displayStates.length > 0 || !searchQuery.trim());

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans antialiased pb-28">
      {/* Main Filter Console & Listing Section */}
      <section id="destinations-directory-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
        <div className="space-y-8">

            {/* Unified Filter Console */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Quick Search &amp; Filter Directory
                  </h3>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search state name, destination, city, or category (e.g. Gujarat, Dwarka, Munnar, Jaipur)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-600 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 hover:text-slate-900 bg-slate-200 px-2 py-0.5 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* VIEW MODE A: STATE BOX GRID (When All States is selected) */}
            {/* ------------------------------------------------------------- */}
            {isShowStateBoxGrid ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                      <Grid className="w-5 h-5 text-blue-600" />
                      <span>Select State to Explore Places ({displayStates.length} Regions)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Click any state box to view all places, select destinations, and build your custom AI travel plan.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>36 States &amp; UTs Ready</span>
                  </div>
                </div>

                {/* 36 State Cards Boxing Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {displayStates.map((st) => (
                    <button
                      key={st.slug}
                      onClick={() => handleStateSelect(st.name)}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 hover:border-blue-600 text-left transition-all duration-300 h-40 flex flex-col justify-end p-3.5 shadow-2xs hover:shadow-lg hover:-translate-y-1 bg-white"
                    >
                      <img
                        src={st.coverImage}
                        alt={st.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent group-hover:from-blue-950/80 transition-colors" />

                      <div className="relative z-10">
                        <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block mb-0.5 bg-slate-950/60 backdrop-blur-xs px-2 py-0.5 rounded w-fit">
                          {st.placesCount} Places
                        </span>
                        <span className="font-bold text-sm text-white block truncate drop-shadow-xs leading-snug mt-1 group-hover:text-amber-200 transition-colors">
                          {st.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ------------------------------------------------------------- */
              /* VIEW MODE B: DESTINATION PLACES GRID */
              /* ------------------------------------------------------------- */
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      {selectedState !== 'All States' && (
                        <button
                          onClick={() => handleStateSelect('All States')}
                          className="inline-flex items-center space-x-1 text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>All States Grid</span>
                        </button>
                      )}
                      <h3 className="text-2xl font-black text-slate-900">
                        {selectedState !== 'All States' ? `${selectedState} Destinations` : 'Filtered Destinations'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Displaying {filteredPlaces.length} destination{filteredPlaces.length === 1 ? '' : 's'}. Click &ldquo;+ Add to Plan&rdquo; on multiple places to build your custom AI itinerary.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-slate-600 text-sm font-medium mb-4">No destinations found matching your selected filters.</p>
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-extrabold bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow hover:bg-blue-700 transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlaces.map((dest) => {
                      const selected = isPlaceSelected(dest.id);
                      return (
                        <div
                          key={dest.id}
                          className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col shadow-xs hover:shadow-md ${
                            selected ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="relative h-52 overflow-hidden bg-slate-100">
                            <img
                              src={dest.imageUrl}
                              alt={`${dest.displayName} - ${dest.state}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                            
                            <div className="absolute top-3 left-3 bg-white/90 text-blue-700 text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs border border-slate-200 uppercase tracking-wider backdrop-blur-xs">
                              {dest.category}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleDestination({
                                  id: dest.id,
                                  name: dest.name,
                                  displayName: dest.displayName,
                                  slug: dest.slug,
                                  stateName: dest.state,
                                  stateSlug: dest.stateSlug,
                                  location: dest.location,
                                  category: dest.category,
                                  imageUrl: dest.imageUrl,
                                })
                              }
                              className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition flex items-center space-x-1.5 ${
                                selected
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-white/95 hover:bg-white text-slate-900 border border-slate-200'
                              }`}
                            >
                              {selected ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                                  <span>+ Add to Plan</span>
                                </>
                              )}
                            </button>

                            <div className="absolute bottom-3 left-3 right-3">
                              <span className="text-xs font-bold text-white drop-shadow-xs flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{dest.location}</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                                {dest.displayName}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium mb-3">
                                State: <span className="text-slate-800 font-bold">{dest.state}</span>
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDestination({
                                    id: dest.id,
                                    name: dest.name,
                                    displayName: dest.displayName,
                                    slug: dest.slug,
                                    stateName: dest.state,
                                    stateSlug: dest.stateSlug,
                                    location: dest.location,
                                    category: dest.category,
                                    imageUrl: dest.imageUrl,
                                  })
                                }
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                                  selected
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                <span>{selected ? 'Added to Trip' : 'Add to Trip'}</span>
                              </button>

                              <Link
                                href={`/packages?search=${encodeURIComponent(dest.displayName)}`}
                                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition flex items-center space-x-1 border border-slate-200"
                              >
                                <span>Packages</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* AI Quick Trip Banner - Clean White Theme */}
        <div className="mt-12 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20 mb-3 inline-block">
              AI Powered Itinerary Engine
            </span>
            <h3 className="text-2xl font-black text-white mb-2">
              Want a custom travel itinerary for these destinations?
            </h3>
            <p className="text-sm text-slate-200 max-w-xl">
              Our AI trip planner automatically clusters selected places, optimizes driving routes, and calculates daily sightseeing schedules.
            </p>
          </div>
          <Link
            href="/plan"
            className="whitespace-nowrap font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 px-6 py-3.5 rounded-2xl transition shadow-md flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate Custom Itinerary</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

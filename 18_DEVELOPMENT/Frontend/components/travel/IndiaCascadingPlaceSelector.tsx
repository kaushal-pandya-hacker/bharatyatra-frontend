'use client';

import React, { useState, useMemo } from 'react';
import {
  ALL_INDIA_TOURISM_DATA,
  IndiaPlaceItem,
  IndiaCityRegion,
  IndiaStateDataset,
} from '@/data/allIndiaTourismData';
import {
  Search,
  MapPin,
  Compass,
  Sparkles,
  Building2,
  Landmark,
  TreePine,
  Waves,
  Maximize2,
  X,
  Check,
  ArrowRight,
  Filter,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

interface IndiaCascadingPlaceSelectorProps {
  initialState?: string;
  initialCity?: string;
  onSelectPlace?: (place: IndiaPlaceItem) => void;
}

export default function IndiaCascadingPlaceSelector({
  initialState = 'All',
  initialCity = 'All',
  onSelectPlace,
}: IndiaCascadingPlaceSelectorProps) {
  // Cascading Selection Mode: 'city-first' (Select City -> State -> Place) vs 'state-first' (Select State -> City -> Place)
  const [selectionFlow, setSelectionFlow] = useState<'city-first' | 'state-first'>('city-first');

  // Filter States
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeModalPlace, setActiveModalPlace] = useState<IndiaPlaceItem | null>(null);

  // Extract All Unique Cities and States
  const allStates = useMemo(() => {
    return ALL_INDIA_TOURISM_DATA.map((st) => st.state);
  }, []);

  const allCitiesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    ALL_INDIA_TOURISM_DATA.forEach((st) => {
      map[st.state] = st.regions.map((r) => r.city);
    });
    return map;
  }, []);

  const allCitiesFlat = useMemo(() => {
    const list: { city: string; state: string; icon: string }[] = [];
    ALL_INDIA_TOURISM_DATA.forEach((st) => {
      st.regions.forEach((r) => {
        list.push({ city: r.city, state: st.state, icon: r.icon });
      });
    });
    return list;
  }, []);

  // Available Cities based on Selected State
  const availableCitiesForState = useMemo(() => {
    if (selectedState === 'All') return allCitiesFlat.map((c) => c.city);
    return allCitiesMap[selectedState] || [];
  }, [selectedState, allCitiesMap, allCitiesFlat]);

  // Flattened All Places
  const allPlaces = useMemo(() => {
    const list: IndiaPlaceItem[] = [];
    ALL_INDIA_TOURISM_DATA.forEach((st) => {
      st.regions.forEach((reg) => {
        reg.places.forEach((p) => {
          list.push(p);
        });
      });
    });
    return list;
  }, []);

  // Filtered Places based on selections
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter((place) => {
      // Search term filter
      if (
        searchTerm.trim() !== '' &&
        !place.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !place.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !place.city.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !place.state.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // State filter
      if (selectedState !== 'All' && place.state !== selectedState) {
        return false;
      }

      // City filter
      if (selectedCity !== 'All' && place.city !== selectedCity) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && place.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [allPlaces, searchTerm, selectedState, selectedCity, selectedCategory]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    if (city !== 'All') {
      const found = allCitiesFlat.find((c) => c.city === city);
      if (found && selectionFlow === 'city-first') {
        setSelectedState(found.state);
      }
    }
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    if (state !== 'All' && selectionFlow === 'state-first') {
      setSelectedCity('All');
    }
  };

  const categories = ['All', 'Pilgrimage & Temples', 'Heritage & Forts', 'Nature & Wildlife', 'Beaches & Coast', 'Modern & Cultural'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Flow Control */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> India District & City Explorer
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-['Outfit',sans-serif]">
              Select <span className="text-amber-400">City</span>, <span className="text-indigo-400">State</span> &amp; <span className="text-emerald-400">Tourism Places</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl font-medium">
              Explore 310+ top curated tourism destinations across 36 States &amp; Union Territories with AI-assisted visual cards.
            </p>
          </div>

          {/* Flow Mode Selector */}
          <div className="flex flex-col gap-2 shrink-0 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <span className="text-xs text-slate-300 font-semibold px-2">Selection Order Flow:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectionFlow('city-first')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectionFlow === 'city-first'
                    ? 'bg-amber-500 text-slate-950 shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> 1. City → 2. State → 3. Place
              </button>
              <button
                type="button"
                onClick={() => setSelectionFlow('state-first')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectionFlow === 'state-first'
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> 1. State → 2. City → 3. Place
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cascading Controls Console */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* STEP 1 / CITY OR STATE DEPENDING ON FLOW */}
          {selectionFlow === 'city-first' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">1</span>
                Select City / Region
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All Cities &amp; Regions ({allCitiesFlat.length})</option>
                {allCitiesFlat.map((item, idx) => (
                  <option key={idx} value={item.city}>
                    {item.icon} {item.city} ({item.state})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black">1</span>
                Select State
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All States &amp; UTs ({allStates.length})</option>
                {allStates.map((st, idx) => (
                  <option key={idx} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* STEP 2 / STATE OR CITY DEPENDING ON FLOW */}
          {selectionFlow === 'city-first' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black">2</span>
                State (Auto-mapped)
              </label>
              <select
                value={selectedState}
                onChange={(e) => handleStateSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All States &amp; UTs</option>
                {allStates.map((st, idx) => (
                  <option key={idx} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">2</span>
                Select City / Region
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="All">All Cities in {selectedState}</option>
                {availableCitiesForState.map((city, idx) => (
                  <option key={idx} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SEARCH BAR & CATEGORY */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">3</span>
              Search &amp; Filter Places
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search place name (e.g. Kamakhya, Bodh Gaya)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
          {(selectedCity !== 'All' || selectedState !== 'All' || selectedCategory !== 'All' || searchTerm !== '') && (
            <button
              type="button"
              onClick={() => {
                setSelectedCity('All');
                setSelectedState('All');
                setSelectedCategory('All');
                setSearchTerm('');
              }}
              className="ml-auto px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Outfit',sans-serif]">
          <Compass className="w-5 h-5 text-indigo-600" />
          Showing <span className="text-indigo-600">{filteredPlaces.length}</span> Tourism Places
          {selectedCity !== 'All' && <span className="text-slate-500 text-sm font-normal">in {selectedCity}</span>}
          {selectedState !== 'All' && <span className="text-slate-500 text-sm font-normal">({selectedState})</span>}
        </h3>
      </div>

      {/* Places Cards Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
          <Compass className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-lg font-bold text-slate-700">No matching tourism places found</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Try adjusting your search terms, selecting a different city, or resetting the filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCity('All');
              setSelectedState('All');
              setSelectedCategory('All');
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide">
                    {place.state}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 text-[11px] font-bold">
                    {place.city}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20 uppercase tracking-wider">
                    {place.category}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors font-['Outfit',sans-serif] line-clamp-1">
                    {place.name}
                  </h4>
                  <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed font-medium">
                    {place.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate max-w-[150px]">{place.city}, {place.state}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveModalPlace(place);
                      if (onSelectPlace) onSelectPlace(place);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {activeModalPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="relative h-60 w-full overflow-hidden bg-slate-900">
              <img
                src={activeModalPlace.imageUrl}
                alt={activeModalPlace.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveModalPlace(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                  {activeModalPlace.category}
                </span>
                <h3 className="text-2xl font-black mt-2 font-['Outfit',sans-serif]">{activeModalPlace.name}</h3>
                <p className="text-slate-300 text-xs flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {activeModalPlace.city}, {activeModalPlace.state}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overview</h5>
                <p className="text-slate-700 text-sm mt-1 leading-relaxed font-medium">
                  {activeModalPlace.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-indigo-950">AI Travel Planner Ready</div>
                    <div className="text-[11px] text-indigo-700">Add this place directly to your custom itinerary</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModalPlace(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Added ${activeModalPlace.name} to your trip plan!`);
                  setActiveModalPlace(null);
                }}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Add to Trip Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

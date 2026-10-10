'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GUJARAT_100_LANDMARKS, LandmarkItem } from '@/lib/data/destinations';
import {
  Search,
  MapPin,
  Sparkles,
  Compass,
  Landmark,
  TreePine,
  Waves,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ExternalLink,
  Check,
  CheckSquare,
  Square,
  Layers,
  ListFilter,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Pilgrimage & Temples',
  'Heritage & Forts',
  'Nature & Wildlife',
  'Beaches & Coast',
  'Modern & Cultural',
] as const;

// Visual images for each district card
const DISTRICT_COVER_IMAGES: Record<string, string> = {
  Ahmedabad: '/landmarks/sabarmati-riverfront.png',
  Gandhinagar: '/landmarks/akshardham-temple.jpg',
  Kutch: '/bhuj-kutch-bg.jpg',
  'Gir Somnath': '/landmarks/somnath-temple-real.png',
  'Devbhumi Dwarka': '/places/dwarkadhish-temple.jpg',
  Junagadh: '/places/girnar-hill.jpg',
  Surat: '/landmarks/dumas-beach-surat.png',
  Vadodara: '/landmarks/kirti-mandir.jpg',
  Narmada: '/dwarka-temple-bg.jpg',
  Banaskantha: '/places/ambaji-temple.jpg',
  Patan: '/places/rani-ki-vav.jpg',
  Mehsana: '/places/modhera-sun-temple.jpg',
  Sabarkantha: '/places/polo-forest.jpg',
  Aravalli: '/places/somnath-temple.jpg',
  Dang: '/landmarks/kankaria-lake.jpg',
  Navsari: '/bhuj-kutch-bg.jpg',
  Bharuch: '/places/polo-forest.jpg',
  Panchmahal: '/places/champaner-pavagadh.jpg',
  Rajkot: '/landmarks/adalaj-stepwell-real.jpg',
};

interface Gujarat100LandmarksDirectoryProps {
  initialSearch?: string;
  initialCategory?: string;
  selectedPlaceIds?: number[];
  onSelectionChange?: (placeIds: number[]) => void;
}

export default function Gujarat100LandmarksDirectory({
  initialSearch = '',
  initialCategory = 'All',
  selectedPlaceIds: propSelectedPlaceIds,
  onSelectionChange,
}: Gujarat100LandmarksDirectoryProps = {}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [activeModalLandmark, setActiveModalLandmark] = useState<LandmarkItem | null>(null);

  // Internal selection state if not controlled externally
  const [internalSelectedPlaceIds, setInternalSelectedPlaceIds] = useState<number[]>([]);

  const selectedPlaceIds = propSelectedPlaceIds !== undefined ? propSelectedPlaceIds : internalSelectedPlaceIds;

  const updateSelections = (newIds: number[]) => {
    if (propSelectedPlaceIds === undefined) {
      setInternalSelectedPlaceIds(newIds);
    }
    if (onSelectionChange) {
      onSelectionChange(newIds);
    }
  };

  // Selection Mode Toggle: 'by-city' (Step 1) vs 'all-places' (Step 2)
  const [activeTab, setActiveTab] = useState<'cities' | 'places'>('cities');

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch);
      if (initialSearch.trim() !== '') {
        setActiveTab('places');
      }
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory && initialCategory !== 'All') {
      setSelectedCategory(initialCategory);
      setActiveTab('places');
    }
  }, [initialCategory]);

  // Aggregate Districts with metadata
  const districtMetadata = useMemo(() => {
    const map: Record<string, LandmarkItem[]> = {};
    GUJARAT_100_LANDMARKS.forEach((item) => {
      if (!map[item.district]) map[item.district] = [];
      map[item.district].push(item);
    });

    return Object.keys(map)
      .sort()
      .map((d) => ({
        districtName: d,
        places: map[d],
        count: map[d].length,
        coverImage: DISTRICT_COVER_IMAGES[d] || map[d][0]?.image || '/bhuj-kutch-bg.jpg',
      }));
  }, []);

  const districtsList = useMemo(() => {
    return ['All', ...districtMetadata.map((d) => d.districtName)];
  }, [districtMetadata]);

  const filteredLandmarks = useMemo(() => {
    return GUJARAT_100_LANDMARKS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesDistrict = selectedDistrict === 'All' || item.district === selectedDistrict;

      return matchesSearch && matchesCategory && matchesDistrict;
    });
  }, [searchTerm, selectedCategory, selectedDistrict]);

  const activeIndex = useMemo(() => {
    if (!activeModalLandmark) return -1;
    return filteredLandmarks.findIndex((l) => l.id === activeModalLandmark.id);
  }, [activeModalLandmark, filteredLandmarks]);

  // Keyboard navigation & ESC handler for full-screen modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeModalLandmark) return;
      if (e.key === 'Escape') {
        setActiveModalLandmark(null);
      } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
        setActiveModalLandmark(filteredLandmarks[activeIndex - 1]);
      } else if (e.key === 'ArrowRight' && activeIndex < filteredLandmarks.length - 1) {
        setActiveModalLandmark(filteredLandmarks[activeIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalLandmark, activeIndex, filteredLandmarks]);

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (activeModalLandmark) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalLandmark]);

  const togglePlaceSelection = (id: number) => {
    const newIds = selectedPlaceIds.includes(id)
      ? selectedPlaceIds.filter((pId) => pId !== id)
      : [...selectedPlaceIds, id];
    updateSelections(newIds);
  };

  const selectAllPlacesInDistrict = (districtName: string) => {
    const districtPlaceIds = GUJARAT_100_LANDMARKS.filter((item) => item.district === districtName).map(
      (item) => item.id
    );

    const allSelected = districtPlaceIds.every((id) => selectedPlaceIds.includes(id));
    let newIds: number[];
    if (allSelected) {
      newIds = selectedPlaceIds.filter((id) => !districtPlaceIds.includes(id));
    } else {
      newIds = Array.from(new Set([...selectedPlaceIds, ...districtPlaceIds]));
    }
    updateSelections(newIds);
  };

  const selectAllFilteredPlaces = () => {
    const filteredIds = filteredLandmarks.map((item) => item.id);
    const allSelected = filteredIds.every((id) => selectedPlaceIds.includes(id));
    let newIds: number[];
    if (allSelected) {
      newIds = selectedPlaceIds.filter((id) => !filteredIds.includes(id));
    } else {
      newIds = Array.from(new Set([...selectedPlaceIds, ...filteredIds]));
    }
    updateSelections(newIds);
  };

  const clearAllSelections = () => {
    updateSelections([]);
  };

  const handlePlanTripWithSelection = () => {
    const selectedItems = GUJARAT_100_LANDMARKS.filter((item) => selectedPlaceIds.includes(item.id));
    const placeNames = selectedItems.map((item) => item.name).join(', ');
    const uniqueDistricts = Array.from(new Set(selectedItems.map((item) => item.district))).join(', ');

    router.push(
      `/plan?destination=${encodeURIComponent(placeNames || 'Gujarat Custom Trip')}&district=${encodeURIComponent(
        uniqueDistricts
      )}`
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pilgrimage & Temples':
        return <Landmark className="h-4 w-4 text-amber-400" />;
      case 'Heritage & Forts':
        return <Building2 className="h-4 w-4 text-orange-400" />;
      case 'Nature & Wildlife':
        return <TreePine className="h-4 w-4 text-emerald-400" />;
      case 'Beaches & Coast':
        return <Waves className="h-4 w-4 text-cyan-400" />;
      default:
        return <Compass className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/90 text-white rounded-3xl border border-slate-800 shadow-2xl my-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Gujarat District &amp; Places Directory
            </div>
            <h2 className="text-3xl font-extrabold font-heading sm:text-4xl text-white tracking-tight">
              Select City &amp; Places To Visit
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Choose your target city/district, then select all places in one click or select specific places as you wish.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('cities')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'cities'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Step 1: Select Cities ({districtMetadata.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'places'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ListFilter className="h-4 w-4" />
              <span>Step 2: Choose Places ({filteredLandmarks.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: STEP 1 - CITY / DISTRICT SELECTION GRID */}
        {activeTab === 'cities' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300 font-medium">
                Click any city to view its places, or click <strong className="text-amber-400">&quot;Select All Places&quot;</strong> to include the whole district.
              </p>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {selectedPlaceIds.length} Places Selected Total
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {districtMetadata.map((d) => {
                const districtPlaceIds = d.places.map((p) => p.id);
                const selectedCountInDistrict = districtPlaceIds.filter((id) =>
                  selectedPlaceIds.includes(id)
                ).length;
                const isFullySelected =
                  selectedCountInDistrict > 0 && selectedCountInDistrict === d.count;
                const isPartiallySelected =
                  selectedCountInDistrict > 0 && selectedCountInDistrict < d.count;

                return (
                  <div
                    key={d.districtName}
                    className={`group relative rounded-2xl overflow-hidden bg-slate-800/60 border transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                      isFullySelected
                        ? 'border-amber-500 ring-2 ring-amber-500/30'
                        : isPartiallySelected
                        ? 'border-amber-500/50'
                        : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    {/* Cover Header */}
                    <div
                      onClick={() => {
                        setSelectedDistrict(d.districtName);
                        setActiveTab('places');
                      }}
                      className="relative h-40 w-full overflow-hidden cursor-pointer"
                    >
                      <img
                        src={d.coverImage}
                        alt={d.districtName}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 font-mono text-[11px] font-bold px-2.5 py-1 rounded-md border border-amber-500/30">
                        {d.count} Places
                      </span>

                      {selectedCountInDistrict > 0 && (
                        <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" />
                          {selectedCountInDistrict}/{d.count}
                        </span>
                      )}

                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                          {d.districtName}
                        </h3>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-3.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => selectAllPlacesInDistrict(d.districtName)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isFullySelected
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {isFullySelected ? (
                          <>
                            <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
                            <span>All {d.count} Selected</span>
                          </>
                        ) : (
                          <>
                            <Square className="h-3.5 w-3.5 text-slate-400" />
                            <span>Select All {d.count} Places</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDistrict(d.districtName);
                          setActiveTab('places');
                        }}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
                        title="View & Choose Places"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: STEP 2 - INTERACTIVE PLACES GRID & FILTERS */}
        {activeTab === 'places' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Interactive Question Banner */}
            <div className="bg-slate-800/80 border border-amber-500/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedDistrict === 'All'
                      ? 'Would you like to visit all places or select as your wish?'
                      : `Do you want to visit all places in ${selectedDistrict} or select as your wish?`}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Choose below: click &quot;Visit All Places&quot; or toggle individual place checkboxes below.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={selectAllFilteredPlaces}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Visit All Places ({filteredLandmarks.length})</span>
                </button>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 bg-slate-700/60 border border-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  <span>Select As Your Wish</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              
              {/* Search Box */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by place name, temple, fort..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* District Selector Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-all"
                >
                  {districtsList.map((d) => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      {d === 'All' ? 'All Cities / Districts (19 Regions)' : `City: ${d}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulk Action Buttons */}
              <div className="md:col-span-5 flex items-center justify-end gap-2">
                <button
                  onClick={selectAllFilteredPlaces}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>Select All Shown ({filteredLandmarks.length})</span>
                </button>
                {selectedPlaceIds.length > 0 && (
                  <button
                    onClick={clearAllSelections}
                    className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Clear All ({selectedPlaceIds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0 pr-2">
                Filter Category:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Places Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredLandmarks.map((item) => {
                const isSelected = selectedPlaceIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => togglePlaceSelection(item.id)}
                    className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/95 border-amber-500 ring-2 ring-amber-500/40 -translate-y-1'
                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/40 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Image Header */}
                      <div className="relative h-52 w-full overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-900 flex items-center justify-center">
                            <Compass className="h-8 w-8 text-slate-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-black/40" />

                        {/* Number Badge */}
                        <span className="absolute top-3 left-3 font-mono text-[11px] font-bold text-amber-400 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-amber-500/30 shadow-md">
                          #{String(item.id).padStart(3, '0')}
                        </span>

                        {/* Checkbox Toggle Button */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlaceSelection(item.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-950/80 text-slate-300 border border-slate-700 hover:border-amber-400'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckSquare className="h-4 w-4" />
                              <span className="text-xs">Selected</span>
                            </>
                          ) : (
                            <>
                              <Square className="h-4 w-4 text-slate-400" />
                              <span className="text-xs">Select Place</span>
                            </>
                          )}
                        </div>

                        {/* Expand Modal Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalLandmark(item);
                          }}
                          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md text-slate-200 text-[11px] px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1"
                        >
                          <Maximize2 className="h-3 w-3 text-amber-400" />
                          <span>Preview</span>
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-amber-400 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.district}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{item.category}</span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/50 shrink-0 mt-0.5">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                              {item.name}
                            </h3>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Toggle Bar */}
                    <div className="px-5 py-3 border-t border-slate-700/30 bg-slate-900/40 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Verified Location
                      </span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                        {isSelected ? '✓ Added to Custom Trip' : '+ Click to Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredLandmarks.length === 0 && (
              <div className="text-center py-16 space-y-3 bg-slate-800/30 rounded-2xl border border-slate-800">
                <Compass className="h-10 w-10 text-amber-400 mx-auto animate-spin" />
                <h3 className="text-lg font-bold text-white">No landmarks found matching your search</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or switching to another category/district.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedDistrict('All');
                  }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* STICKY BOTTOM FLOATING SELECTION BAR */}
      {selectedPlaceIds.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-8 z-40 bg-slate-950/95 border border-amber-500/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-6 max-w-xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-base shadow-md">
              {selectedPlaceIds.length}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {selectedPlaceIds.length} Places Selected for Trip
              </span>
              <span className="text-[11px] text-slate-400 line-clamp-1">
                Ready to synthesize custom route in AI Planner
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAllSelections}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handlePlanTripWithSelection}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <span>Plan AI Trip</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* FULL SCREEN LIGHTBOX MODAL */}
      {activeModalLandmark && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 md:p-8 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalLandmark(null);
          }}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/30">
                #{String(activeModalLandmark.id).padStart(3, '0')}
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  {activeModalLandmark.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 text-slate-300 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    {activeModalLandmark.district}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">{activeModalLandmark.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                ESC to exit • ← → to browse
              </span>
              <button
                onClick={() => setActiveModalLandmark(null)}
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                aria-label="Close Fullscreen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Fullscreen Image Area with Prev/Next Controls */}
          <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden max-w-7xl mx-auto w-full">
            {/* Prev Arrow */}
            {activeIndex > 0 && (
              <button
                onClick={() => setActiveModalLandmark(filteredLandmarks[activeIndex - 1])}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 transition-all border border-slate-700/80 shadow-2xl backdrop-blur-md"
                title="Previous Landmark (Left Arrow)"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* High-Res Image Viewport */}
            {activeModalLandmark.image ? (
              <div className="relative max-h-full max-w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center bg-black/50">
                <img
                  src={activeModalLandmark.image}
                  alt={activeModalLandmark.name}
                  className="max-h-[62vh] sm:max-h-[70vh] w-auto object-contain rounded-2xl shadow-2xl"
                />
              </div>
            ) : (
              <div className="h-64 w-full max-w-md bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-6 border border-slate-800 text-center">
                <Compass className="h-12 w-12 text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-400">High-Resolution Image Preview</p>
                <p className="text-xs text-slate-500 mt-1">{activeModalLandmark.name}</p>
              </div>
            )}

            {/* Next Arrow */}
            {activeIndex < filteredLandmarks.length - 1 && (
              <button
                onClick={() => setActiveModalLandmark(filteredLandmarks[activeIndex + 1])}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 transition-all border border-slate-700/80 shadow-2xl backdrop-blur-md"
                title="Next Landmark (Right Arrow)"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Landmark Description & AI Trip Planner Call-to-Action */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-7xl mx-auto w-full backdrop-blur-md">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Ground Verified
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Landmark {activeIndex + 1} of {filteredLandmarks.length}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {activeModalLandmark.description}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  togglePlaceSelection(activeModalLandmark.id);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors border flex items-center gap-1.5 ${
                  selectedPlaceIds.includes(activeModalLandmark.id)
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {selectedPlaceIds.includes(activeModalLandmark.id) ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    <span>Selected</span>
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    <span>Select Place</span>
                  </>
                )}
              </button>

              <Link
                href={`/plan?destination=${encodeURIComponent(activeModalLandmark.name)}&district=${encodeURIComponent(activeModalLandmark.district)}`}
                onClick={() => setActiveModalLandmark(null)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm transition-all shadow-lg hover:shadow-amber-500/25 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Plan with AI Now</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

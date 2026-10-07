'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TripMap, { MapMarker } from '@/components/maps/trip-map';

const GUJARAT_CENTER: [number, number] = [22.2587, 71.1924];

const ALL_GUJARAT_MARKERS: MapMarker[] = [
  {
    id: 'ahmedabad',
    title: 'Ahmedabad UNESCO Heritage City',
    category: 'ATTRACTION',
    latitude: 23.0225,
    longitude: 72.5714,
    description: '500-year-old wooden pols, secret rainwater cisterns, and intricate stepwell architecture.',
    address: 'Ahmedabad, Gujarat 380001',
    price: 'Free / ₹1,200 Tour',
    rating: 4.9,
    imageUrl: '/landmarks/adalaj-stepwell-real.jpg',
  },
  {
    id: 'kutch',
    title: 'Great Rann of Kutch Salt Desert',
    category: 'ATTRACTION',
    latitude: 23.8340,
    longitude: 69.5447,
    description: 'Endless white salt marsh gleaming under full moonlight with authentic handicraft artisan villages.',
    address: 'Dhordo, Kutch, Gujarat 370510',
    price: '₹100 Entry Permit',
    rating: 4.9,
    imageUrl: '/bhuj-kutch-bg.jpg',
  },
  {
    id: 'gir',
    title: 'Gir National Park & Lion Sanctuary',
    category: 'EXPERIENCE',
    latitude: 21.1243,
    longitude: 70.8242,
    description: 'The sole natural habitat of the wild Asiatic Lions in the world.',
    address: 'Sasan Gir, Junagadh, Gujarat 362135',
    price: '₹1,000 Safari Permit',
    rating: 4.8,
    imageUrl: '/gir-national-park-bg.jpg',
  },
  {
    id: 'somnath',
    title: 'Somnath Shore Temple',
    category: 'ATTRACTION',
    latitude: 20.8880,
    longitude: 70.4012,
    description: 'First among the 12 revered Jyotirlingas, overlooking the vast ocean with evening light show.',
    address: 'Somnath Mandir Marg, Veraval, Gujarat 362268',
    price: 'Free Entry',
    rating: 5.0,
    imageUrl: '/somnath-temple-bg.jpg',
  },
  {
    id: 'dwarka',
    title: 'Dwarkadhish Temple',
    category: 'ATTRACTION',
    latitude: 22.2394,
    longitude: 68.9678,
    description: '5-story 72-pillar ancient shrine of Lord Krishna on the sacred Gomti river estuary.',
    address: 'Dwarka, Devbhumi Dwarka, Gujarat 361335',
    price: 'Free Entry',
    rating: 4.9,
    imageUrl: '/dwarka-temple-bg.jpg',
  },
  {
    id: 'unity',
    title: 'Statue of Unity (Kevadia)',
    category: 'ATTRACTION',
    latitude: 21.8380,
    longitude: 73.7191,
    description: "World's tallest statue (182m) with high-speed viewing gallery elevator & Valley of Flowers.",
    address: 'Ekta Nagar, Kevadia, Narmada, Gujarat 393151',
    price: '₹150 / ₹380 Express',
    rating: 4.9,
    imageUrl: '/landmarks/science-city-ahmedabad.jpg',
  },
  {
    id: 'saputara',
    title: 'Saputara Sahyadri Hill Station',
    category: 'ATTRACTION',
    latitude: 20.5750,
    longitude: 73.7483,
    description: 'Cool forest hill retreat nestled in the Dang rainforest with ropeway, lake & tribal art.',
    address: 'Saputara, Dang, Gujarat 394740',
    price: 'Free Access',
    rating: 4.7,
    imageUrl: '/hero-bg.jpg',
  },
  {
    id: 'patan',
    title: 'Rani Ki Vav UNESCO Stepwell',
    category: 'ATTRACTION',
    latitude: 23.8589,
    longitude: 72.1018,
    description: '11th-century subterranean stepwell featuring over 500 main sculptures of Lord Vishnu.',
    address: 'Patan, Gujarat 384265',
    price: '₹40 Entry',
    rating: 4.9,
    imageUrl: '/landmarks/adalaj-stepwell-real.jpg',
  },
  {
    id: 'modhera',
    title: 'Modhera Sun Temple',
    category: 'ATTRACTION',
    latitude: 23.5835,
    longitude: 72.1330,
    description: 'Solanki-era architectural marvel built so equinox sun rays illuminate the sanctum.',
    address: 'Modhera, Mehsana, Gujarat 384212',
    price: '₹25 Entry',
    rating: 4.8,
    imageUrl: '/landmarks/sidi-saiyyed-jali.jpg',
  },
  {
    id: 'junagadh',
    title: 'Girnar Hill & Temples',
    category: 'EXPERIENCE',
    latitude: 21.5222,
    longitude: 70.4579,
    description: 'Sacred mountain with 10,000 stone steps, ropeway, ancient Jain temples and Dattatreya peak.',
    address: 'Junagadh, Gujarat 362001',
    price: 'Free / ₹750 Ropeway',
    rating: 4.8,
    imageUrl: '/sasan-gir-bg.jpg',
  },
  {
    id: 'vadodara',
    title: 'Laxmi Vilas Palace',
    category: 'ATTRACTION',
    latitude: 22.3072,
    longitude: 73.1812,
    description: 'Indo-Saracenic royal palace four times the size of Buckingham Palace.',
    address: 'J N Marg, Vadodara, Gujarat 390001',
    price: '₹220 Entry',
    rating: 4.8,
    imageUrl: '/landmarks/akshardham-temple.jpg',
  },
  {
    id: 'surat',
    title: 'Dumas Beach & Surat Castle',
    category: 'ATTRACTION',
    latitude: 21.1702,
    longitude: 72.8311,
    description: 'Historic Tapi river port city known for black sand shores, textiles & diamond bazaar.',
    address: 'Dumas, Surat, Gujarat 395007',
    price: 'Free Entry',
    rating: 4.6,
    imageUrl: '/landmarks/kankaria-lake.jpg',
  },
  {
    id: 'agashiye',
    title: 'Agashiye Heritage Terrace Dining',
    category: 'DINING',
    latitude: 23.0260,
    longitude: 72.5800,
    description: 'Iconic rooftop Gujarati thali dining served on traditional silver and kansa thalis.',
    address: 'The House of MG, Lal Darwaja, Ahmedabad 380001',
    price: '₹1,450 / thali',
    rating: 4.9,
    imageUrl: '/landmarks/sabarmati-ashram.jpg',
  },
  {
    id: 'gir-resort',
    title: 'The Fern Royal Farm Resort Gir',
    category: 'HOTEL',
    latitude: 21.1400,
    longitude: 70.8100,
    description: 'Eco-luxury jungle resort nestled amidst mango orchards near Gir Forest sanctuary gates.',
    address: 'Sasan Gir, Gujarat 362135',
    price: '₹7,500 / night',
    rating: 4.8,
    imageUrl: '/sasan-gir-bg.jpg',
  },
  {
    id: 'saputara-resort',
    title: 'Toran Resort Saputara',
    category: 'HOTEL',
    latitude: 20.5770,
    longitude: 73.7490,
    description: 'Scenic hillside stay offering panoramic views of Saputara Lake and foggy monsoon valleys.',
    address: 'Saputara Hill Station, Gujarat 394740',
    price: '₹3,800 / night',
    rating: 4.7,
    imageUrl: '/hero-bg.jpg',
  },
  {
    id: 'shivrajpur',
    title: 'Shivrajpur Blue Flag Beach',
    category: 'ATTRACTION',
    latitude: 22.3325,
    longitude: 68.9550,
    description: 'Pristine white sand Blue Flag certified beach with crystal clear waters & scuba diving.',
    address: 'Shivrajpur, Devbhumi Dwarka, Gujarat 361335',
    price: '₹30 Entry',
    rating: 4.8,
    imageUrl: '/dwarka-temple-bg.jpg',
  },
];

const WEEKEND_ESCAPE_ROUTE: [number, number][] = [
  [23.0225, 72.5714], // Ahmedabad
  [22.3072, 73.1812], // Vadodara
  [21.8380, 73.7191], // Statue of Unity
];

export default function MapPage() {
  const [viewState, setViewState] = useState<'default' | 'selected' | 'route' | 'optimize' | 'empty'>('default');
  const [selectedNode, setSelectedNode] = useState<string>('ahmedabad');
  const [selectedMarker, setSelectedMarker] = useState<MapMarker>(ALL_GUJARAT_MARKERS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiQuery, setAiQueryState] = useState<string>('');
  const [aiHighlight, setAiHighlight] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>(GUJARAT_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(8);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSwitchState = (state: 'default' | 'selected' | 'route' | 'optimize' | 'empty') => {
    setViewState(state);
    if (state === 'default') {
      setSearchQuery('');
      setMapCenter(GUJARAT_CENTER);
      setMapZoom(8);
    } else if (state === 'selected') {
      setSearchQuery('Ahmedabad UNESCO Heritage');
      handleSelectNode('ahmedabad');
    } else if (state === 'route') {
      setSearchQuery('Weekend Escape Corridor');
      setMapCenter([22.3072, 73.1812]);
      setMapZoom(9);
    }
  };

  const handleFilterCategory = (category: string) => {
    setCategoryFilter(category);
    if (category !== 'all') {
      setSearchQuery(`Filtered: ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    } else {
      setSearchQuery('');
    }
  };

  const handleSelectNode = (nodeId: string) => {
    setSelectedNode(nodeId);
    setViewState('selected');
    const target = ALL_GUJARAT_MARKERS.find((m) => m.id === nodeId);
    if (target) {
      setSelectedMarker(target);
      setMapCenter([target.latitude, target.longitude]);
      setMapZoom(12);
      setSearchQuery(target.title);
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedNode(marker.id);
    setSelectedMarker(marker);
    setViewState('selected');
    setMapCenter([marker.latitude, marker.longitude]);
    setMapZoom(12);
  };

  const handleZoomToRegion = (regionId: string) => {
    handleSelectNode(regionId);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const triggerAiInsight = () => {
    setAiHighlight(true);
    showToast('Farva AI processing map telemetry query...');
    setTimeout(() => setAiHighlight(false), 1200);
  };

  const handleSetAiQuery = (promptText: string) => {
    setAiQueryState(promptText);
    triggerAiInsight();
  };

  const applyOptimization = () => {
    showToast('Route optimization applied! Statue of Unity re-slotted to 08:30 AM.');
    setViewState('route');
  };

  const handleLocateUser = () => {
    if ('geolocation' in navigator) {
      showToast('Acquiring real GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapZoom(13);
          showToast(`Located at ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
        },
        () => {
          showToast('Geolocation permission denied. Showing Ahmedabad, Gujarat.');
          setMapCenter([23.0225, 72.5714]);
          setMapZoom(12);
        }
      );
    } else {
      showToast('Geolocation not supported by your browser.');
    }
  };

  // Filter markers based on category and search query
  const filteredMarkers = ALL_GUJARAT_MARKERS.filter((m) => {
    if (viewState === 'empty') return false;

    let matchesCat = true;
    if (categoryFilter === 'destinations' || categoryFilter === 'attractions') {
      matchesCat = m.category === 'ATTRACTION';
    } else if (categoryFilter === 'stays') {
      matchesCat = m.category === 'HOTEL';
    } else if (categoryFilter === 'dining') {
      matchesCat = m.category === 'DINING';
    } else if (categoryFilter === 'experiences') {
      matchesCat = m.category === 'EXPERIENCE';
    }

    if (!matchesCat) return false;

    if (searchQuery && !searchQuery.startsWith('Filtered:')) {
      const q = searchQuery.toLowerCase();
      const titleMatch = m.title.toLowerCase().includes(q);
      const descMatch = m.description?.toLowerCase().includes(q) ?? false;
      const addrMatch = m.address?.toLowerCase().includes(q) ?? false;
      return titleMatch || descMatch || addrMatch;
    }

    return true;
  });

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <main className="w-full pt-4 bg-background">
        <div className="flex flex-col w-full">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transition-all border border-primary-container/30">
              <span className="material-symbols-outlined text-primary-container text-base">check_circle</span>
              <span className="font-body-md text-body-md">{toastMessage}</span>
            </div>
          )}

          {/* Command Header & Spatial Discovery Navigation */}
          <section className="w-full px-gutter pt-space-lg pb-space-md">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-space-md">
              {/* Editorial Title & Prototype Scenario Switcher */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
                <div>
                  <div className="flex items-center gap-space-xs mb-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="font-label-caps text-label-caps tracking-widest text-primary uppercase font-bold">
                      GIS Spatial Engine • Geo-Spatial Telemetry {mapCenter[0].toFixed(4)}° N, {mapCenter[1].toFixed(4)}° E
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Explore Gujarat</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-0.5">
                    Discover real landmarks, historic sanctuaries, ancestral pols, sacred shores, and royal stays across Gujarat.
                  </p>
                </div>

                {/* Interactive Prototype Mode Toggles */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-container rounded-xl">
                  <button
                    className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                      viewState === 'default'
                        ? 'bg-inverse-surface text-inverse-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => handleSwitchState('default')}
                  >
                    Default View
                  </button>
                  <button
                    className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                      viewState === 'selected'
                        ? 'bg-inverse-surface text-inverse-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => handleSwitchState('selected')}
                  >
                    Selected: Ahmedabad
                  </button>
                  <button
                    className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                      viewState === 'route'
                        ? 'bg-inverse-surface text-inverse-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => handleSwitchState('route')}
                  >
                    Route Mode: Weekend Escape
                  </button>
                  <button
                    className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                      viewState === 'optimize'
                        ? 'bg-inverse-surface text-inverse-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => handleSwitchState('optimize')}
                  >
                    Optimization Alert
                  </button>
                  <button
                    className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
                      viewState === 'empty'
                        ? 'bg-inverse-surface text-inverse-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    onClick={() => handleSwitchState('empty')}
                  >
                    Empty State
                  </button>
                </div>
              </div>

              {/* Luxury Search & Multi-layer Filtering System */}
              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md">
                {/* Luxury Floating Search Input */}
                <div className="relative flex-1 max-w-2xl">
                  <div className="flex items-center h-14 w-full bg-surface-container-lowest rounded-xl shadow-md px-space-md gap-space-sm border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary text-2xl">explore</span>
                    <input
                      className="w-full bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Ahmedabad, Kutch, Gir, Dwarka, Saputara, Kevadia, Patan..."
                      type="text"
                    />
                    <button
                      className="flex items-center gap-1 px-space-sm py-1 rounded-md bg-surface-container font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors"
                      onClick={() => showToast('Filter dialog triggered')}
                    >
                      <span className="material-symbols-outlined text-sm">tune</span> Filter
                    </button>
                    <button
                      className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg hover:shadow-[0_0_20px_-2px_rgba(254,214,91,0.4)] transition-all flex items-center justify-center shrink-0 font-bold"
                      onClick={() => showToast(`Searching for: ${searchQuery || 'Gujarat Region'}`)}
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Layers', icon: null },
                    { id: 'destinations', label: 'Destinations', icon: 'location_city' },
                    { id: 'stays', label: 'Stays', icon: 'castle' },
                    { id: 'dining', label: 'Dining', icon: 'restaurant' },
                    { id: 'experiences', label: 'Experiences', icon: 'palette' },
                    { id: 'attractions', label: 'Heritage Sites', icon: 'temple_hindu' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      className={`px-space-md h-9 rounded-full font-label-md text-label-md flex items-center gap-1.5 shrink-0 transition-all shadow-sm ${
                        categoryFilter === cat.id
                          ? 'bg-inverse-surface text-primary-container font-bold'
                          : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => handleFilterCategory(cat.id)}
                    >
                      {cat.id === 'all' ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                      ) : (
                        <span className="material-symbols-outlined text-base text-primary">{cat.icon}</span>
                      )}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Map Command Center & Split Discovery Console */}
          <section className="w-full px-gutter pb-space-xl">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
              {/* CARTOGRAPHIC CANVAS CONTAINER (8 Cols) */}
              <div className="xl:col-span-8 flex flex-col gap-space-md">
                <div className="relative w-full h-[620px] rounded-2xl overflow-hidden shadow-2xl bg-inverse-surface border border-outline-variant/30 flex flex-col justify-between">
                  {/* Real Google Maps Tile Engine */}
                  <div className="absolute inset-0 z-0">
                    <TripMap
                      center={mapCenter}
                      zoom={mapZoom}
                      markers={filteredMarkers}
                      routePolyline={viewState === 'route' || viewState === 'optimize' ? WEEKEND_ESCAPE_ROUTE : []}
                      isEstimated={false}
                      height="620px"
                      mapType={mapType}
                      onMarkerClick={handleMarkerClick}
                    />
                  </div>

                  {/* FLOATING MAP CONTROLS & TELEMETRY BADGE */}
                  <div className="relative z-20 p-space-md flex items-start justify-between pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-space-sm px-space-md py-2 rounded-xl bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface shadow-lg border border-outline-variant/20">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></div>
                      <div className="flex flex-col">
                        <span className="font-label-caps text-label-caps text-primary uppercase font-bold">Google Maps Engine Active</span>
                        <span className="font-label-lg text-label-lg font-semibold tracking-wide">
                          {selectedMarker ? selectedMarker.title : 'Gujarat State Overview'}
                        </span>
                      </div>
                      <span className="text-outline-variant font-body-sm text-body-sm pl-space-xs">
                        | {filteredMarkers.length} Sanctuaries Pinpoint Active
                      </span>
                    </div>

                    <div className="pointer-events-auto flex flex-col gap-1.5 bg-inverse-surface/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-outline-variant/20">
                      {/* Google Map Mode Toggles */}
                      <div className="flex flex-col gap-1 pb-1 border-b border-outline/20">
                        <button
                          className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                            mapType === 'roadmap'
                              ? 'bg-primary-container text-on-primary-fixed shadow-sm'
                              : 'text-inverse-on-surface hover:bg-surface-container-high/30'
                          }`}
                          title="Google Maps Standard View"
                          onClick={() => setMapType('roadmap')}
                        >
                          Map
                        </button>
                        <button
                          className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                            mapType === 'satellite'
                              ? 'bg-primary-container text-on-primary-fixed shadow-sm'
                              : 'text-inverse-on-surface hover:bg-surface-container-high/30'
                          }`}
                          title="Google Maps Satellite Hybrid View"
                          onClick={() => setMapType('satellite')}
                        >
                          Satellite
                        </button>
                        <button
                          className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                            mapType === 'terrain'
                              ? 'bg-primary-container text-on-primary-fixed shadow-sm'
                              : 'text-inverse-on-surface hover:bg-surface-container-high/30'
                          }`}
                          title="Google Maps Terrain View"
                          onClick={() => setMapType('terrain')}
                        >
                          Terrain
                        </button>
                      </div>

                      <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-inverse-on-surface hover:bg-surface-container-high/30 transition-all"
                        title="Locate Real Position (GPS)"
                        onClick={handleLocateUser}
                      >
                        <span className="material-symbols-outlined text-lg text-primary-container">near_me</span>
                      </button>
                      <div className="w-full h-px bg-outline/20"></div>
                      <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-inverse-on-surface hover:bg-surface-container-high/30 transition-all"
                        title="Reset Full Gujarat View"
                        onClick={() => {
                          setMapCenter(GUJARAT_CENTER);
                          setMapZoom(8);
                          showToast('Resetting map view to Gujarat');
                        }}
                      >
                        <span className="material-symbols-outlined text-lg">crop_free</span>
                      </button>
                      <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-inverse-on-surface hover:bg-surface-container-high/30 transition-all"
                        title="Zoom In"
                        onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                      <button
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-inverse-on-surface hover:bg-surface-container-high/30 transition-all"
                        title="Zoom Out"
                        onClick={() => setMapZoom((z) => Math.max(z - 1, 5))}
                      >
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Spatial Overlay */}
                  <div className="relative z-20 p-space-md pointer-events-none">
                    {/* Selected Place Flyout (Default & Selected State) */}
                    {(viewState === 'default' || viewState === 'selected') && selectedMarker && (
                      <div className="pointer-events-auto bg-surface/95 backdrop-blur-xl rounded-xl p-space-md shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md transition-all border border-outline-variant/30">
                        <div className="flex items-center gap-space-md">
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container shadow-inner">
                            <img
                              className="w-full h-full object-cover"
                              alt={selectedMarker.title}
                              src={selectedMarker.imageUrl || '/landmarks/adalaj-stepwell-real.jpg'}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/landmarks/adalaj-stepwell-real.jpg';
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="px-2 py-0.5 rounded-full bg-primary-container/25 text-on-primary-container font-label-caps text-label-caps uppercase font-bold">
                                {selectedMarker.category}
                              </span>
                              <span className="flex items-center text-primary font-label-md text-label-md font-bold">
                                <span className="material-symbols-outlined text-sm mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  star
                                </span>{' '}
                                {selectedMarker.rating || '4.9'}
                              </span>
                            </div>
                            <h3 className="font-title-md text-title-md text-on-surface font-semibold">{selectedMarker.title}</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">{selectedMarker.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedMarker.latitude},${selectedMarker.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-space-md py-2 rounded-lg bg-surface-container font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-all"
                          >
                            Directions ↗
                          </a>
                          <button
                            className="px-space-md py-2 rounded-lg bg-inverse-surface text-inverse-on-surface font-label-md text-label-md hover:bg-inverse-surface/90 transition-all flex items-center gap-1 font-bold"
                            onClick={() => showToast(`Added ${selectedMarker.title} to your trip plan!`)}
                          >
                            <span className="material-symbols-outlined text-base text-primary-container">add_circle</span> Add to Trip
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AI Route Optimization Alert (Shown in 'optimize' state) */}
                    {viewState === 'optimize' && (
                      <div className="pointer-events-auto bg-inverse-surface text-inverse-on-surface rounded-xl p-space-md shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-primary-container/40">
                        <div className="flex items-start gap-space-sm">
                          <span className="material-symbols-outlined text-primary-container text-2xl shrink-0 mt-0.5">auto_awesome</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-title-md text-title-md font-bold text-primary-container">Sovereign Route Optimization</span>
                              <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-caps text-label-caps font-bold">
                                AI INSIGHT
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-surface-container-highest mt-0.5 max-w-xl">
                              Moving your Statue of Unity slot from 02:00 PM to 08:30 AM avoids midday peak humidity, circumvents ticket queue congestion, and eliminates 42 mins in return highway traffic.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-sm shrink-0">
                          <button
                            className="px-space-md py-2 rounded-lg bg-primary-container text-on-primary-fixed font-label-md text-label-md font-bold shadow-md hover:scale-102 transition-all"
                            onClick={applyOptimization}
                          >
                            Apply Suggestion
                          </button>
                          <button
                            className="px-space-md py-2 rounded-lg bg-surface-container-high/20 text-inverse-on-surface font-label-md text-label-md hover:bg-surface-container-high/30 transition-all"
                            onClick={() => handleSwitchState('default')}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIVE TRIP TELEMETRY BAR (Shown in Route Mode or Optimize state) */}
                {(viewState === 'route' || viewState === 'optimize') && (
                  <div className="w-full p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-outline-variant/30">
                    <div className="flex items-center gap-space-md">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">route</span>
                      </div>
                      <div>
                        <span className="font-label-caps text-label-caps text-primary font-bold uppercase tracking-wider">Active Route Trajectory</span>
                        <h4 className="font-title-md text-title-md text-on-surface font-bold">Weekend Gujarat Escape • 3 Waypoints</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Ahmedabad Old City → Vadodara Laxmi Vilas → Kevadia Sardar Sarovar</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-lg text-left">
                      <div>
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Distance</span>
                        <p className="font-title-md text-title-md font-bold text-on-surface">198 km</p>
                      </div>
                      <div className="h-6 w-px bg-surface-variant"></div>
                      <div>
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Estimated Drive</span>
                        <p className="font-title-md text-title-md font-bold text-on-surface">3h 45m</p>
                      </div>
                      <div className="h-6 w-px bg-surface-variant"></div>
                      <div>
                        <span className="font-label-caps text-label-caps text-on-surface-variant">Sanctuaries</span>
                        <p className="font-title-md text-title-md font-bold text-primary">3 Included</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FLOATING DISCOVERY & AI ASSISTANT PANEL (4 Cols) */}
              <div className="xl:col-span-4 flex flex-col gap-space-md">
                {/* Smart AI Assistant Card ('Ask Farva') */}
                <div className="w-full p-space-md rounded-2xl bg-inverse-surface text-inverse-on-surface shadow-xl relative overflow-hidden border border-outline-variant/30">
                  <div className="relative z-10 flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary-container text-xl">psychology</span>
                        <span className="font-title-md text-title-md text-primary-container font-semibold">Ask Farva AI</span>
                      </div>
                      <span className="font-label-caps text-label-caps uppercase px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-bold">
                        Predictive Mode
                      </span>
                    </div>

                    {/* Intelligent Query Input Field */}
                    <div className="relative mt-1">
                      <input
                        className="w-full h-11 pl-3 pr-20 rounded-lg bg-surface-container-high/15 text-inverse-on-surface placeholder:text-surface-dim/60 font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant/20"
                        value={aiQuery}
                        onChange={(e) => setAiQueryState(e.target.value)}
                        placeholder="Ask Farva about this map or plan a route..."
                        type="text"
                      />
                      <button
                        className="absolute right-1 top-1 h-9 px-3 rounded-md bg-primary-container text-on-primary-fixed font-label-md text-label-md font-bold hover:shadow-[0_0_15px_rgba(254,214,91,0.5)] transition-all"
                        onClick={triggerAiInsight}
                      >
                        Ask ✨
                      </button>
                    </div>

                    {/* Quick Suggestion Pill Row */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        className="px-2.5 py-1 rounded-full bg-surface-container-high/10 hover:bg-surface-container-high/25 text-surface-container-low font-label-caps text-label-caps transition-all"
                        onClick={() => handleSetAiQuery('Best places near Ahmedabad')}
                      >
                        ✦ Places near Ahmedabad
                      </button>
                      <button
                        className="px-2.5 py-1 rounded-full bg-surface-container-high/10 hover:bg-surface-container-high/25 text-surface-container-low font-label-caps text-label-caps transition-all"
                        onClick={() => handleSetAiQuery('Plan a 2-day Kutch trip')}
                      >
                        ✦ 2-day Kutch itinerary
                      </button>
                      <button
                        className="px-2.5 py-1 rounded-full bg-surface-container-high/10 hover:bg-surface-container-high/25 text-surface-container-low font-label-caps text-label-caps transition-all"
                        onClick={() => handleSetAiQuery('Pure veg Kathiyawadi thalis nearby')}
                      >
                        ✦ Authentic Kathiyawadi
                      </button>
                    </div>

                    {/* Dynamic AI Discovery Notification Box */}
                    <div
                      className={`mt-2 p-2.5 rounded-xl bg-surface-container-high/10 flex items-start gap-2.5 transition-all ${
                        aiHighlight ? 'ring-2 ring-primary-container' : ''
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary-container text-lg shrink-0 mt-0.5">lightbulb</span>
                      <div className="flex-1">
                        <p className="font-body-sm text-body-sm text-surface-container-low leading-snug">
                          Farva AI discovered: The highlighted heritage gems in Gujarat can be linked sequentially with real GPS driving routes and zero backtrack commute.
                        </p>
                        <button
                          className="mt-2 text-primary-container font-label-md text-label-md font-bold hover:underline flex items-center gap-1"
                          onClick={() => showToast('1-Day Itinerary draft built!')}
                        >
                          Build Custom Itinerary ✨
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Curated Discovery Nearby Places List */}
                <div className="w-full p-space-md rounded-2xl bg-surface-container-lowest shadow-md flex flex-col gap-space-md border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Real Destinations</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Gujarat GeoEngine • {filteredMarkers.length} Active</p>
                    </div>
                    <button className="font-label-md text-label-md text-primary font-semibold hover:underline" onClick={() => showToast('Sorted by Rating')}>
                      Sort: Rating ↓
                    </button>
                  </div>

                  {/* Places Container List (Switchable for Empty State) */}
                  {filteredMarkers.length > 0 ? (
                    <div className="flex flex-col gap-space-sm max-h-[440px] overflow-y-auto pr-1">
                      {filteredMarkers.map((m) => (
                        <div
                          key={m.id}
                          className={`group p-space-sm rounded-xl transition-all cursor-pointer flex gap-space-sm items-center border ${
                            selectedNode === m.id
                              ? 'bg-primary-container/15 border-primary/40 shadow-sm'
                              : 'bg-surface-container-low hover:bg-surface-container border-transparent'
                          }`}
                          onClick={() => handleSelectNode(m.id)}
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container shadow-inner">
                            <img
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              alt={m.title}
                              src={m.imageUrl || '/landmarks/adalaj-stepwell-real.jpg'}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/landmarks/adalaj-stepwell-real.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-label-caps text-label-caps uppercase text-primary font-bold">{m.category}</span>
                              <span className="font-label-md text-label-md font-bold text-on-surface flex items-center">
                                <span className="material-symbols-outlined text-sm text-primary mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  star
                                </span>{' '}
                                {m.rating || '4.8'}
                              </span>
                            </div>
                            <h4 className="font-title-md text-title-md text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
                              {m.title}
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{m.description}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-label-md text-label-md font-semibold text-on-surface">{m.price || 'Explore'}</span>
                              <button
                                className="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-primary-container hover:text-on-primary-container transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showToast(`Bookmarked ${m.title}`);
                                }}
                              >
                                <span className="material-symbols-outlined text-sm">bookmark</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty State Container */
                    <div className="flex flex-col items-center justify-center py-space-xl text-center px-space-md">
                      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-outline-variant mb-space-sm">
                        <span className="material-symbols-outlined text-3xl">travel_explore</span>
                      </div>
                      <h4 className="font-title-md text-title-md text-on-surface font-bold">No Sanctuaries Found</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">
                        Try resetting your search query or category filter pills above.
                      </p>
                      <button
                        className="mt-space-md px-space-md py-2 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md font-bold"
                        onClick={() => handleSwitchState('default')}
                      >
                        Reset Map Scope
                      </button>
                    </div>
                  )}

                  {/* Discovery Panel Bottom Actions */}
                  <div className="pt-space-xs flex items-center justify-between">
                    <button
                      className="w-full py-2.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-label-md text-label-md font-semibold hover:bg-inverse-surface/90 transition-all flex items-center justify-center gap-1.5"
                      onClick={() => showToast(`Added all ${filteredMarkers.length} destinations to trip!`)}
                    >
                      <span className="material-symbols-outlined text-base text-primary-container">playlist_add</span>
                      Add All ({filteredMarkers.length}) to Trip Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Regional Explorer Showcase (Four Pillars of Gujarat) */}
          <section className="w-full px-gutter pb-space-xl">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-space-lg">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
                <div>
                  <span className="font-label-caps text-label-caps tracking-widest text-primary uppercase font-bold">Geographic Enclaves</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Explore Gujarat by Region</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">Four distinct biogeographic and cultural ecosystems across the map.</p>
                </div>
              </div>

              {/* Regional Editorial Bento Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {/* Region 1: Kutch */}
                <div className="group relative rounded-2xl overflow-hidden bg-inverse-surface shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-[400px]">
                  <div className="absolute inset-0">
                    <img
                      alt="Vast salt flats of Great Rann of Kutch"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src="/landmarks/rann-of-kutch-real.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent"></div>
                  </div>
                  <div className="relative z-10 p-space-md mt-auto flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-primary-container/90 text-on-primary-fixed font-label-caps text-label-caps uppercase font-bold">
                        Frontier Salt Desert
                      </span>
                      <span className="font-label-caps text-label-caps text-surface-container-low font-mono">23.83° N</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-inverse-on-surface font-bold tracking-tight">Kutch &amp; Great Rann</h3>
                    <p className="font-body-sm text-body-sm text-surface-container-highest line-clamp-2">
                      Endless crystalline salt plains, moonlit camel caravans, and master artisans in Ajrakhpur and Rogan painting.
                    </p>
                    <div className="pt-space-sm flex items-center justify-between">
                      <span className="font-label-md text-label-md text-primary-container font-semibold">18 Curated Stays</span>
                      <button
                        className="w-8 h-8 rounded-full bg-surface-container-lowest/20 hover:bg-primary-container hover:text-on-primary-fixed text-inverse-on-surface flex items-center justify-center transition-all"
                        onClick={() => handleZoomToRegion('kutch')}
                      >
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Region 2: Saurashtra & Dwarka */}
                <div className="group relative rounded-2xl overflow-hidden bg-inverse-surface shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-[400px]">
                  <div className="absolute inset-0">
                    <img
                      alt="Ancient Somnath shoreline temple"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src="/landmarks/somnath-temple-real.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent"></div>
                  </div>
                  <div className="relative z-10 p-space-md mt-auto flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-primary-container/90 text-on-primary-fixed font-label-caps text-label-caps uppercase font-bold">
                        Sacred Coastlines
                      </span>
                      <span className="font-label-caps text-label-caps text-surface-container-low font-mono">20.88° N</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-inverse-on-surface font-bold tracking-tight">Saurashtra &amp; Dwarka</h3>
                    <p className="font-body-sm text-body-sm text-surface-container-highest line-clamp-2">
                      Millennia-old sea-cliff sanctums, sacred submerged ports, and rich Kathiyawadi royal culinary traditions.
                    </p>
                    <div className="pt-space-sm flex items-center justify-between">
                      <span className="font-label-md text-label-md text-primary-container font-semibold">24 Sanctums</span>
                      <button
                        className="w-8 h-8 rounded-full bg-surface-container-lowest/20 hover:bg-primary-container hover:text-on-primary-fixed text-inverse-on-surface flex items-center justify-center transition-all"
                        onClick={() => handleZoomToRegion('dwarka')}
                      >
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Region 3: Sasan Gir */}
                <div className="group relative rounded-2xl overflow-hidden bg-inverse-surface shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-[400px]">
                  <div className="absolute inset-0">
                    <img
                      alt="Asiatic lion in Gir National Park"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src="/landmarks/gir-national-park-real.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent"></div>
                  </div>
                  <div className="relative z-10 p-space-md mt-auto flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-primary-container/90 text-on-primary-fixed font-label-caps text-label-caps uppercase font-bold">
                        Wild Sovereign Forest
                      </span>
                      <span className="font-label-caps text-label-caps text-surface-container-low font-mono">21.12° N</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-inverse-on-surface font-bold tracking-tight">Sasan Gir Wildlife</h3>
                    <p className="font-body-sm text-body-sm text-surface-container-highest line-clamp-2">
                      The sole sanctuary on Earth of the regal Asiatic lion, framed by dry deciduous teak forest corridors and Maldhari pastoralists.
                    </p>
                    <div className="pt-space-sm flex items-center justify-between">
                      <span className="font-label-md text-label-md text-primary-container font-semibold">12 Wilderness Lodges</span>
                      <button
                        className="w-8 h-8 rounded-full bg-surface-container-lowest/20 hover:bg-primary-container hover:text-on-primary-fixed text-inverse-on-surface flex items-center justify-center transition-all"
                        onClick={() => handleZoomToRegion('gir')}
                      >
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Region 4: Saputara */}
                <div className="group relative rounded-2xl overflow-hidden bg-inverse-surface shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-[400px]">
                  <div className="absolute inset-0">
                    <img
                      alt="Saputara Hill Station"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src="/landmarks/saputara-hill-station-real.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent"></div>
                  </div>
                  <div className="relative z-10 p-space-md mt-auto flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-primary-container/90 text-on-primary-fixed font-label-caps text-label-caps uppercase font-bold">
                        Highlands &amp; Havelis
                      </span>
                      <span className="font-label-caps text-label-caps text-surface-container-low font-mono">20.57° N</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-inverse-on-surface font-bold tracking-tight">Saputara &amp; Royal Stays</h3>
                    <p className="font-body-sm text-body-sm text-surface-container-highest line-clamp-2">
                      Verdant Dang highlands with monsoon waterfalls, ancestral Gaekwad palaces, and courtyard haveli retreats.
                    </p>
                    <div className="pt-space-sm flex items-center justify-between">
                      <span className="font-label-md text-label-md text-primary-container font-semibold">15 Royal Stays</span>
                      <button
                        className="w-8 h-8 rounded-full bg-surface-container-lowest/20 hover:bg-primary-container hover:text-on-primary-fixed text-inverse-on-surface flex items-center justify-center transition-all"
                        onClick={() => handleZoomToRegion('saputara')}
                      >
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

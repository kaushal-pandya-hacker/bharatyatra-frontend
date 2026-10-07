'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ALL_INDIA_PACKAGES, IndiaPackage } from '@/data/india-packages.data';
import { getPackageImageUrl } from '@/lib/utils/package-image-fallback';

export default function PackagesClient() {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedTourismType, setSelectedTourismType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxDays, setMaxDays] = useState<number>(15);
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'DURATION'>('POPULAR');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Extract unique states and tourism types for filters
  const allStates = useMemo(() => {
    const statesSet = new Set<string>();
    ALL_INDIA_PACKAGES.forEach(pkg => {
      if (pkg.stateOrRegion) statesSet.add(pkg.stateOrRegion);
    });
    return Array.from(statesSet).sort();
  }, []);

  const allTourismTypes = useMemo(() => {
    const typesSet = new Set<string>();
    ALL_INDIA_PACKAGES.forEach(pkg => {
      if (pkg.tourismType) typesSet.add(pkg.tourismType);
    });
    return Array.from(typesSet).sort();
  }, []);

  // Filter & Sort packages
  const filteredPackages = useMemo(() => {
    return ALL_INDIA_PACKAGES.filter(pkg => {
      if (selectedState !== 'ALL' && pkg.stateOrRegion !== selectedState) {
        return false;
      }
      if (selectedTourismType !== 'ALL' && pkg.tourismType !== selectedTourismType) {
        return false;
      }
      if (pkg.durationDays > maxDays) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = pkg.packageName.toLowerCase().includes(q);
        const matchState = pkg.stateOrRegion.toLowerCase().includes(q);
        const matchType = pkg.tourismType.toLowerCase().includes(q);
        const matchDest = pkg.destinations.some((d: string) => d.toLowerCase().includes(q));
        if (!matchTitle && !matchState && !matchType && !matchDest) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const priceA = a.discountedPrice || a.startingPriceInr || a.startingPrice || 0;
      const priceB = b.discountedPrice || b.startingPriceInr || b.startingPrice || 0;

      if (sortBy === 'PRICE_LOW') return priceA - priceB;
      if (sortBy === 'PRICE_HIGH') return priceB - priceA;
      if (sortBy === 'DURATION') return b.durationDays - a.durationDays;
      // Default: POPULAR / Rating
      return (b.rating || 4.9) - (a.rating || 4.9);
    });
  }, [selectedState, selectedTourismType, searchQuery, maxDays, sortBy]);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <section className="bg-[#0A1128] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FED65B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#FED65B] font-extrabold text-xs uppercase tracking-widest border border-white/10 mb-4">
            🇮🇳 Verified Pan-India Tourism Packages
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Discover India Tourism Circuits
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Explore 100% geographically verified tourism packages covering 1,100+ destinations across all 28 States & 8 Union Territories.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search packages by state, destination, temple, fort, or circuit..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-[#FED65B]/50 shadow-xl"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Filters Toolbar */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* State Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Filter by State / UT
              </label>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0A1128]"
              >
                <option value="ALL">All States & Union Territories ({allStates.length})</option>
                {allStates.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Tourism Type Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Filter by Tourism Type
              </label>
              <select
                value={selectedTourismType}
                onChange={e => setSelectedTourismType(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0A1128]"
              >
                <option value="ALL">All Tourism Categories ({allTourismTypes.length})</option>
                {allTourismTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Duration Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Max Duration
                </label>
                <span className="text-xs font-extrabold text-[#0A1128] bg-slate-100 px-2 py-0.5 rounded-md">
                  Up to {maxDays} Days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={maxDays}
                onChange={e => setMaxDays(Number(e.target.value))}
                className="w-full accent-[#0A1128] cursor-pointer mt-2"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Sort Packages By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#0A1128]"
              >
                <option value="POPULAR">Most Popular / Highest Rated</option>
                <option value="PRICE_LOW">Estimated Price: Low to High</option>
                <option value="PRICE_HIGH">Estimated Price: High to Low</option>
                <option value="DURATION">Longest Duration Circuit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Available Packages</span>
            <span className="px-3 py-1 bg-[#0A1128] text-[#FED65B] text-xs font-black rounded-full">
              {filteredPackages.length}
            </span>
          </h2>
          {selectedState !== 'ALL' && (
            <button
              onClick={() => setSelectedState('ALL')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              Clear State Filter ({selectedState})
            </button>
          )}
        </div>

        {/* Package Grid */}
        {filteredPackages.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
            <span className="text-4xl block mb-3">🏝️</span>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Matching Packages Found</h3>
            <p className="text-xs text-slate-500 mb-6">
              Try adjusting your search terms, state selection, or duration filter.
            </p>
            <button
              onClick={() => {
                setSelectedState('ALL');
                setSelectedTourismType('ALL');
                setMaxDays(15);
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-[#0A1128] text-[#FED65B] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map(pkg => {
              const displayPrice = pkg.discountedPrice || pkg.startingPriceInr || pkg.startingPrice || 15000;
              const imgUrl = getPackageImageUrl(pkg.coverImage || pkg.heroImageUrl || pkg.primaryImageUrl, pkg.stateOrRegion || pkg.state);
              const isWishlisted = wishlist.has(pkg.id);

              // Format top 3 destinations cleanly to avoid text overwriting / overflow
              const topDestinationsStr = Array.isArray(pkg.destinations) && pkg.destinations.length > 0
                ? pkg.destinations.slice(0, 3).join(', ') + (pkg.destinations.length > 3 ? ` +${pkg.destinations.length - 3} more` : '')
                : (pkg.destinationName || pkg.startingPoint || 'India');

              return (
                <div
                  key={pkg.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col justify-between hover:-translate-y-1.5 relative"
                >
                  {/* Entire Card Clickable Link */}
                  <Link href={`/packages/${pkg.slug}`} className="block flex-1 flex flex-col justify-between">
                    <div>
                      {/* Cover Image & Badges */}
                      <div className="relative h-56 overflow-hidden bg-slate-100">
                        <img
                          src={imgUrl}
                          alt={pkg.packageName || pkg.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e: any) => {
                            e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                          <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                            ⏱️ {pkg.durationDays}D / {Math.max(1, pkg.durationDays - 1)}N
                          </span>
                          <button
                            type="button"
                            onClick={e => toggleWishlist(pkg.id, e)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              isWishlisted
                                ? 'bg-red-500 text-white shadow-md'
                                : 'bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white'
                            }`}
                          >
                            ♥
                          </button>
                        </div>

                        {/* Bottom Image Info - Clean Truncated Overlay */}
                        <div className="absolute bottom-3 left-4 right-4 text-white z-10">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FED65B] block truncate drop-shadow-md mb-0.5">
                            📍 {pkg.stateOrRegion || pkg.state} &bull; {topDestinationsStr}
                          </span>
                          <h3 className="font-black text-lg leading-snug drop-shadow-md line-clamp-1 text-white group-hover:text-[#FED65B] transition-colors">
                            {pkg.packageName || pkg.title}
                          </h3>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5">
                        {/* Rating & Category */}
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-extrabold text-slate-700">
                            {pkg.tourismType || pkg.category || 'Tourism Package'}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <span>★</span>
                            <span className="text-slate-800 font-extrabold">{pkg.rating || 4.9}</span>
                            <span className="text-slate-400 font-normal">({pkg.totalReviews || 120})</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-normal">
                          {pkg.description || pkg.shortDescription}
                        </p>

                        {/* Highlights bullets */}
                        {pkg.highlights && pkg.highlights.length > 0 && (
                          <div className="mb-4 space-y-1.5 border-t border-slate-100 pt-3">
                            {pkg.highlights.slice(0, 3).map((h: any, i: number) => {
                              const highlightText = typeof h === 'string' ? h : (h?.title || String(h));
                              return (
                                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A1128] shrink-0"></span>
                                  <span className="truncate">{highlightText}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {pkg.bestSeason && (
                          <div className="text-[11px] text-slate-500 mb-2">
                            <span className="font-semibold text-slate-700">Best Season:</span> {pkg.bestSeason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing & CTA Footer */}
                    <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                          ESTIMATED PRICE
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-bold text-slate-400">Starting</span>
                          <span className="text-xl font-extrabold text-[#0A1128]">
                            ₹{displayPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <span className="px-4 py-2.5 bg-[#0A1128] text-[#FED65B] font-bold text-xs uppercase tracking-wider rounded-xl group-hover:bg-slate-800 transition-all shadow-md group-hover:scale-105 transform">
                        VIEW PACKAGE
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  Search, 
  ArrowRight, 
  Building2, 
  Mountain, 
  Sun, 
  ShieldCheck, 
  Star,
  CheckCircle2
} from 'lucide-react';
import Gujarat100LandmarksDirectory from '@/components/travel/Gujarat100LandmarksDirectory';
import IndiaCascadingPlaceSelector from '@/components/travel/IndiaCascadingPlaceSelector';
import CustomerReviewSection from '@/components/reviews/CustomerReviewSection';

export default function ExploreClient() {
  const [radarInput, setRadarInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [explorerMode, setExplorerMode] = useState<'all-india' | 'gujarat'>('all-india');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(radarInput);
    const directoryEl = document.getElementById('landmarks-directory');
    if (directoryEl) {
      directoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category: string, searchKeyword?: string) => {
    setActiveCategory(category);
    if (searchKeyword !== undefined) {
      setActiveSearch(searchKeyword);
    } else {
      setActiveSearch('');
    }
    const directoryEl = document.getElementById('landmarks-directory');
    if (directoryEl) {
      directoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white font-sans text-slate-900 antialiased min-h-screen">
      <main className="w-full pt-4 pb-16 bg-white min-h-screen">
        <div className="flex flex-col w-full">

          {/* Pristine Hero Banner with White Theme */}
          <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12 bg-gradient-to-b from-blue-50/60 via-white to-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-black tracking-wider uppercase mb-3 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>EXPLORE 1,089+ INDIA DESTINATIONS</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                    Where will your <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 text-transparent bg-clip-text">
                      journey lead next?
                    </span>
                  </h1>
                  <p className="text-slate-600 text-base sm:text-lg font-medium mt-3 max-w-2xl leading-relaxed">
                    Discover handpicked heritage forts, beaches, hill stations, wildlife sanctuaries &amp; spiritual shrines across all 36 Indian States &amp; Union Territories.
                  </p>
                </div>

                {/* Quick AI Plan CTA */}
                <div className="shrink-0">
                  <Link
                    href="/plan"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Plan Trip with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Sleek Search Console */}
              <form onSubmit={handleSearchSubmit} className="relative w-full bg-white p-3 rounded-2xl border border-slate-200/90 shadow-md flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400 pl-3">
                  <Search className="w-5 h-5 text-blue-600 shrink-0" />
                </div>
                <div className="relative flex-1 w-full">
                  <input
                    aria-label="Search destinations"
                    className="w-full bg-transparent font-sans text-base text-slate-900 placeholder:text-slate-400 focus:outline-none py-2"
                    id="radar-input"
                    type="text"
                    value={radarInput}
                    placeholder="Search Gir Forest, Somnath, Rann of Kutch, Jaipur, Munnar, Goa..."
                    onChange={(e) => setRadarInput(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Search Destinations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Category Quick Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 pr-1">
                  POPULAR SEARCHES:
                </span>
                {[
                  { label: 'All Destinations', cat: 'All', search: '' },
                  { label: 'Great Rann of Kutch', cat: 'All', search: 'Kutch' },
                  { label: 'Gir Asiatic Lions', cat: 'Nature & Wildlife', search: 'Gir' },
                  { label: 'Somnath & Dwarka', cat: 'Pilgrimage & Temples', search: 'Somnath' },
                  { label: 'Saputara Hill Station', cat: 'All', search: 'Saputara' },
                  { label: 'Heritage Forts', cat: 'Heritage & Forts', search: '' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleCategoryClick(item.cat, item.search)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 whitespace-nowrap border cursor-pointer ${
                      activeSearch === item.search && (item.cat === 'All' || activeCategory === item.cat)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Mode Selector & Main Catalog Section */}
          <section id="landmarks-directory" className="w-full px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
              
              {/* Clean White Mode Switcher Bar */}
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 pl-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    EXPLORATION CATALOG
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExplorerMode('all-india')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      explorerMode === 'all-india'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🇮🇳 All-India Cascading Explorer (36 States &amp; UTs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplorerMode('gujarat')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      explorerMode === 'gujarat'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🏛️ Gujarat 100 Iconic Landmarks
                  </button>
                </div>
              </div>

              {/* Dynamic Catalog Component Render */}
              {explorerMode === 'gujarat' ? (
                <Gujarat100LandmarksDirectory initialSearch={activeSearch} initialCategory={activeCategory} />
              ) : (
                <IndiaCascadingPlaceSelector />
              )}
            </div>
          </section>

          {/* Clean White Highlight Banner */}
          <section className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-amber-50/80 border border-amber-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                      SEASONAL HIGHLIGHT
                    </span>
                    <p className="text-slate-800 text-sm mt-0.5 font-medium leading-relaxed">
                      <strong>Rann Utsav in Kutch &amp; Wildlife Safaris in Gir are active!</strong> Experience full moon nights on white salt deserts or Asiatic lion safaris.
                    </p>
                  </div>
                </div>
                <Link
                  href="/plan"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs shrink-0 text-center"
                >
                  Generate Trip with AI
                </Link>
              </div>
            </div>
          </section>

          {/* Verified Customer Reviews Section */}
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <CustomerReviewSection />
          </div>
        </div>
      </main>
    </div>
  );
}

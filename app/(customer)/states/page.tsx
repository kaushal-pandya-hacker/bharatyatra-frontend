'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Search, Compass, Layers, ShieldCheck, ChevronRight, Sparkles, Globe, CheckCircle2 } from 'lucide-react';
import { getAllStateFolderItems, StateFolderItem } from '@/lib/tourism/state-folder-loader';
import { MASTER_INDIA_DATA } from '@/data/indiaMasterData';

interface DisplayStateRecord {
  id: string;
  name: string;
  slug: string;
  folderName: string;
  code?: string;
  type: 'STATE' | 'UNION_TERRITORY';
  capital?: string;
  description?: string;
  coverImage: string;
  placesCount: number;
}

export default function PanIndiaStatesDiscoveryPage() {
  const [states, setStates] = useState<DisplayStateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'STATE' | 'UNION_TERRITORY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadStates() {
      setLoading(true);
      
      // Load folder-based state items directly (source of truth)
      const folderStates = getAllStateFolderItems();
      const folderStateMap = new Map<string, StateFolderItem>();
      folderStates.forEach(s => {
        folderStateMap.set(s.slug, s);
        folderStateMap.set(s.name.toLowerCase().replace(/[^a-z0-9]/g, ''), s);
      });

      // Merge metadata with MASTER_INDIA_DATA for capitals/descriptions while guaranteeing folder coverImage & places
      const merged: DisplayStateRecord[] = folderStates.map(folderState => {
        const masterMatch = MASTER_INDIA_DATA.states.find(
          m => m.slug === folderState.slug || m.name.toLowerCase().replace(/[^a-z0-9]/g, '') === folderState.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        const isUt = folderState.slug.includes('andaman') || 
                     folderState.slug.includes('delhi') || 
                     folderState.slug.includes('ladakh') || 
                     folderState.slug.includes('chandigarh') || 
                     folderState.slug.includes('daman') || 
                     folderState.slug.includes('lakshadweep') || 
                     folderState.slug.includes('puducherry') || 
                     (masterMatch && masterMatch.type === 'UNION_TERRITORY');

        return {
          id: folderState.slug,
          name: folderState.name,
          slug: folderState.slug,
          folderName: folderState.folderName,
          code: masterMatch?.code || folderState.name.substring(0, 2).toUpperCase(),
          type: isUt ? 'UNION_TERRITORY' : 'STATE',
          capital: masterMatch?.capital || (isUt ? 'UT Headquarters' : `${folderState.name} Capital`),
          description: masterMatch?.description || `Discover iconic destinations, heritage sites, wildlife sanctuaries, and sacred shrines in ${folderState.name}.`,
          coverImage: folderState.coverImage, // Official folder cover image
          placesCount: folderState.placesCount,
        };
      });

      setStates(merged);
      setLoading(false);
    }

    loadStates();
  }, []);

  const filteredStates = states.filter((s) => {
    if (filterType !== 'ALL' && s.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.capital && s.capital.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="bg-[#0A1128] text-white min-h-screen font-sans selection:bg-[#FED65B] selection:text-[#0A1128]">

      {/* Hero Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A1128] via-[#141A32] to-[#0A1128]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-400 mb-4">
            <Globe className="w-4 h-4" />
            <span>Folder-Driven Master Tourism Directory</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            Explore All {states.length} Indian States &amp; UTs
          </h1>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-gray-300 font-normal leading-relaxed mb-8">
            Complete India-level travel ecosystem. Discover official state covers, tourist destinations, heritage monuments, and curated tour packages driven directly from the state data repository.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search state name, capital, or description (e.g., Gujarat, Jaipur, Kerala)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141A32] border border-[#2A3656] text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-amber-400 text-sm shadow-xl transition"
            />
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Filter Pills */}
          <div className="flex items-center space-x-2 bg-[#141A32] p-1.5 rounded-xl border border-[#2A3656]">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                filterType === 'ALL'
                  ? 'bg-amber-400 text-[#0A1128] shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              All States &amp; UTs ({states.length})
            </button>
            <button
              onClick={() => setFilterType('STATE')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                filterType === 'STATE'
                  ? 'bg-amber-400 text-[#0A1128] shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              States ({states.filter((s) => s.type === 'STATE').length})
            </button>
            <button
              onClick={() => setFilterType('UNION_TERRITORY')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                filterType === 'UNION_TERRITORY'
                  ? 'bg-amber-400 text-[#0A1128] shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Union Territories ({states.filter((s) => s.type === 'UNION_TERRITORY').length})
            </button>
          </div>

          <div className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-3.5 py-2 rounded-xl border border-amber-400/30">
            Showing {filteredStates.length} Regions
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStates.map((st) => (
              <Link
                key={st.slug}
                href={`/states/${st.slug}`}
                className="group bg-[#141A32] rounded-2xl overflow-hidden border border-[#2A3656] hover:border-amber-400/50 transition duration-300 flex flex-col hover:-translate-y-1 shadow-lg"
              >
                <div className="relative h-52 overflow-hidden bg-gray-900">
                  <img
                    src={st.coverImage || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80'}
                    alt={`${st.name} Official Cover`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141A32] via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="bg-amber-400 text-[#0A1128] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded shadow tracking-wider">
                      {st.type === 'UNION_TERRITORY' ? 'UT' : 'State'}
                    </span>
                    {st.code && (
                      <span className="bg-[#0A1128]/80 text-gray-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/20 backdrop-blur">
                        {st.code}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-bold drop-shadow">{st.capital ? `Capital: ${st.capital}` : ''}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2 flex items-center justify-between">
                      <span>{st.name}</span>
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed mb-4">
                      {st.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#2A3656] flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-white font-semibold">{st.placesCount} Tourism Places</span>
                      </span>
                    </div>
                    <span className="text-amber-400 font-bold flex items-center space-x-0.5 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

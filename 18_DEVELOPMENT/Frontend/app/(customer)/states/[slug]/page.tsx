import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { MapPin, ShieldAlert, Sparkles, Compass, Star, ChevronRight, ArrowLeft, Clock, Calendar, Package, Layers, CheckCircle2, Image as ImageIcon } from 'lucide-react';

import { getStateFolderItemBySlug, getAllStateFolderItems, PlaceFolderItem } from '@/lib/tourism/state-folder-loader';
import { MASTER_INDIA_DATA } from '@/data/indiaMasterData';
import { ALL_INDIA_PACKAGES, IndiaPackage } from '@/data/india-packages.data';
import verifiedDestinationsData from '@/data/tourism/verified-destinations.json';

import StatePlacesInteractiveGrid from '@/components/travel/StatePlacesInteractiveGrid';

interface Props {
  params: { slug: string };
}

function normalizeStateString(str: string): string {
  return str.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
}

function matchesState(stateOrUt: string, slug: string): boolean {
  const normState = normalizeStateString(stateOrUt);
  const normSlug = normalizeStateString(slug);
  if (normState === normSlug) return true;
  const rawState = stateOrUt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const rawSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return rawState === rawSlug;
}

export function generateStaticParams() {
  const folderStates = getAllStateFolderItems();
  return folderStates.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stateFolderItem = getStateFolderItemBySlug(params.slug);
  const stateName = stateFolderItem ? stateFolderItem.name : params.slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const placesCount = stateFolderItem ? stateFolderItem.placesCount : 0;

  return {
    title: `${stateName} Tourism — ${placesCount} Official Places, Cover & Itineraries | BharatYatra`,
    description: `Discover all ${placesCount} tourist destinations, attractions, official state cover image, and tour packages for ${stateName}, India.`,
  };
}

export default async function DynamicStateDetailPage({ params }: Props) {
  const { slug } = params;

  // 1. Load folder-based state item (SOURCE OF TRUTH)
  const stateFolderItem = getStateFolderItemBySlug(slug);

  // Fallback metadata from MASTER_INDIA_DATA
  const masterState = MASTER_INDIA_DATA.states.find((s) => matchesState(s.name, slug));

  const stateName = stateFolderItem?.name || masterState?.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const isUt = slug.includes('andaman') || slug.includes('delhi') || slug.includes('ladakh') || slug.includes('chandigarh') || slug.includes('daman') || slug.includes('lakshadweep') || slug.includes('puducherry') || (masterState && masterState.type === 'UNION_TERRITORY');

  const capital = masterState?.capital || (isUt ? 'UT Headquarters' : `${stateName} Capital`);

  // Official State Cover Image directly from folder structure
  const coverImage = stateFolderItem?.coverImage || masterState?.coverImage || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1600&q=80';

  const description = masterState?.description || `Explore ${stateName}, featuring ${stateFolderItem?.placesCount || 0} tourism places, official cover, heritage monuments, wildlife sanctuaries, and scenic routes.`;

  // 2. Tourism Places contained inside this state's folder ONLY
  const folderPlaces: PlaceFolderItem[] = stateFolderItem ? stateFolderItem.places : [];

  // Filter packages for this state
  const statePackages = ALL_INDIA_PACKAGES.filter((pkg: IndiaPackage) =>
    matchesState(pkg.state || pkg.stateOrRegion, slug) ||
    (pkg.destinations && pkg.destinations.some((dName) =>
      folderPlaces.some((fp) => fp.name.toLowerCase() === dName.toLowerCase())
    ))
  );

  // Schema.org structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AdministrativeArea',
    name: stateName,
    description: description,
    url: `https://bharatyatra.com/states/${slug}`,
    image: coverImage,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
  };

  return (
    <div className="bg-[#0A1128] text-white min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* State Hero with OFFICIAL STATE COVER IMAGE */}
      <section className="relative h-[420px] overflow-hidden bg-slate-950">
        <img
          src={coverImage}
          alt={`${stateName} Official State Cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-[#0A1128]/60 to-transparent"></div>
        
        {/* Navigation back */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/states"
            className="inline-flex items-center space-x-2 bg-[#0A1128]/80 hover:bg-[#141A32] text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-[#2A3656] shadow backdrop-blur transition"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>All States Directory</span>
          </Link>
        </div>

        <div className="absolute bottom-0 inset-x-0 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="bg-amber-500 text-slate-950 text-xs font-extrabold uppercase px-3 py-1 rounded-md tracking-wider shadow">
                {isUt ? 'Union Territory' : 'Indian State'}
              </span>
              <span className="text-xs text-white bg-[#0A1128]/80 px-3 py-1 rounded-md border border-[#2A3656] font-medium flex items-center space-x-1 backdrop-blur">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{capital}</span>
              </span>
              <span className="text-xs text-emerald-300 bg-[#0A1128]/80 px-3 py-1 rounded-md border border-emerald-500/30 font-medium flex items-center space-x-1 backdrop-blur">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{folderPlaces.length} Verified Destinations</span>
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-3">
              {stateName}
            </h1>
            <p className="max-w-3xl text-sm sm:text-base text-slate-300 line-clamp-3 font-normal leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* State Tour Packages */}
        {statePackages.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Package className="w-5 h-5 text-amber-400" />
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Curated Tour Packages in {stateName} ({statePackages.length})
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Verified itineraries with optimized travel routes &amp; hotel stays
                </p>
              </div>
              <Link
                href="/packages"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30"
              >
                <span>View All Packages</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statePackages.map((pkg: IndiaPackage) => (
                <Link
                  key={pkg.id || pkg.packageId}
                  href={`/packages/${pkg.slug}`}
                  className="group bg-[#141A32] rounded-2xl overflow-hidden border border-[#2A3656] hover:border-amber-400 transition duration-300 flex flex-col hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                >
                  <div className="relative h-48 overflow-hidden bg-[#0A1128]">
                    <img
                      src={pkg.coverImage || pkg.image || coverImage}
                      alt={pkg.title || pkg.packageName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/80 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded shadow tracking-wider">
                      {pkg.tourismType || pkg.category || 'Package'}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#0A1128]/90 text-white text-[10px] font-bold px-2 py-1 rounded border border-[#2A3656] backdrop-blur">
                      {pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-2 line-clamp-1">
                        {pkg.title || pkg.packageName}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {pkg.shortDescription || pkg.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#2A3656] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Starting From</span>
                        <span className="text-lg font-extrabold text-amber-400 font-mono">₹{(pkg.startingPriceInr || pkg.discountedPrice || 15000).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-400"> / person</span>
                      </div>
                      <span className="text-xs font-bold text-slate-950 bg-amber-500 group-hover:bg-amber-400 px-3.5 py-2 rounded-lg transition flex items-center space-x-1 shadow-sm">
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tourism Places Grid with Multi-Select & AI Planning Bar */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
                <span>Tourism Places in {stateName}</span>
                <span className="text-amber-400">({folderPlaces.length})</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select multiple places using <span className="text-amber-400 font-bold">&ldquo;+ Add to Plan&rdquo;</span> to build your custom AI trip itinerary.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3.5 py-2 rounded-xl border border-emerald-500/30 self-start sm:self-auto flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{folderPlaces.length} Destinations Available</span>
            </div>
          </div>

          {folderPlaces.length === 0 ? (
            <div className="text-center py-16 bg-[#141A32] rounded-2xl border border-[#2A3656] shadow-xl">
              <p className="text-slate-400 text-sm font-medium">No tourism places found for {stateName}.</p>
            </div>
          ) : (
            <StatePlacesInteractiveGrid folderPlaces={folderPlaces} stateName={stateName} />
          )}
        </section>

        {/* AI Quick Planner Trigger Banner */}
        <section className="bg-[#141A32] p-8 rounded-3xl border border-[#2A3656] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 mb-3 inline-block">
              AI Powered Itinerary Engine
            </span>
            <h3 className="text-2xl font-black text-white mb-2">
              Want a custom travel plan connecting places in {stateName}?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Our AI travel planner automatically clusters nearby destinations, calculates route distances, and optimizes daily sightseeing schedules.
            </p>
          </div>
          <Link
            href={`/ai-planner?destination=${encodeURIComponent(stateName)}`}
            className="whitespace-nowrap font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3.5 rounded-xl transition shadow-md flex items-center space-x-2 text-xs uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build {stateName} Itinerary</span>
          </Link>
        </section>
      </main>
    </div>
  );
}


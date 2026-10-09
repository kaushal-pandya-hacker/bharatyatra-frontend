import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Clock,
  Calendar,
  Plane,
  Train,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Hotel as HotelIcon,
  Utensils,
  Compass,
  Star,
  Banknote,
  Info,
} from 'lucide-react';
import { MASTER_DESTINATIONS } from '@/data/indiaMasterData';
import { getDestinationBySlug } from '@/lib/data/destinations';
import DestinationMapSection from '@/components/maps/destination-map-section';
import * as fs from 'fs';
import * as path from 'path';
import { getStateFolderItemBySlug } from '@/lib/tourism/state-folder-loader';

interface DestinationDetailPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return MASTER_DESTINATIONS.map((d) => ({
    id: d.slug,
  }));
}

function getMasterFallbackDestination(slug: string) {
  try {
    const masterPath = path.resolve(process.cwd(), '../08_TRAVEL_DATA/India/india_master_data.json');
    if (fs.existsSync(masterPath)) {
      const raw = fs.readFileSync(masterPath, 'utf-8');
      const data = JSON.parse(raw);
      for (const st of data.states || []) {
        for (const d of st.destinations || []) {
          if (d.slug === slug) {
            return {
              ...d,
              state: st.name,
              country: 'India',
              bgImage: d.primaryImageUrl,
              idealDays: d.recommendedDays || 2,
              durationHours: (d.recommendedDays || 2) * 24,
            };
          }
        }
      }
    }
  } catch (e) {
    // Fallback notice
  }
  return null;
}

async function fetchDestinationFromApi(slug: string) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '');
  try {
    const res = await fetch(`${apiBase}/destinations/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    // API connection fallback
  }

  const masterItem = MASTER_DESTINATIONS.find((d) => d.slug.toLowerCase() === slug.toLowerCase());
  if (masterItem) {
    return {
      ...masterItem,
      region: masterItem.state,
      idealDays: masterItem.recommendedDays || 2,
      durationHours: (masterItem.recommendedDays || 2) * 24,
      bgImage: masterItem.primaryImageUrl,
      attractions: (masterItem.aliases || []).map((a) => ({ name: a, isVerified: true })),
    };
  }

  const masterFallback = getMasterFallbackDestination(slug);
  if (masterFallback) {
    return masterFallback;
  }

  const local = getDestinationBySlug(slug);
  if (!local) return null;

  return {
    slug: local.slug,
    name: local.name,
    region: local.region,
    state: 'Gujarat',
    country: 'India',
    durationHours: local.durationHours,
    recommendedDays: local.idealDays,
    estimatedBudget: 15000,
    tagline: local.tagline,
    description: local.description,
    overview: local.overview,
    bestTimeToVisit: local.bestTimeToVisit,
    nearestAirport: local.nearestAirport,
    nearestRailway: local.nearestRailway,
    heroColor: local.heroColor,
    bgImage: local.bgImage || (local.slug === 'dwarka' ? '/dwarka-temple-bg.jpg' : undefined),
    activities: local.activities || [],
    attractions: (local.highlights || []).map((h) => ({ name: h, isVerified: true })),
    hotels: [],
    restaurants: [],
  };
}

export default async function DestinationDetailPage({ params }: DestinationDetailPageProps) {
  const destination = await fetchDestinationFromApi(params.id);

  if (!destination) {
    notFound();
  }

  const title = destination.name;
  const region = destination.state || destination.region || 'India';
  const tagline = destination.tagline || `${destination.category || 'Tourism'} destination in ${region}`;
  const description = destination.description || destination.shortDescription || '';
  const overview = destination.overview || description;
  const bestTimeToVisit = destination.bestTimeToVisit || 'October to March';
  const nearestAirport = destination.nearestAirport || 'Nearest Regional Airport';
  const nearestRailway = destination.nearestRailway || 'Nearest Junction Station';
  const idealDays = destination.recommendedDays || destination.idealDays || 2;
  const estimatedBudget = destination.estimatedBudget ? Number(destination.estimatedBudget) : 15000;
  const entryFee = destination.entryFee !== undefined ? Number(destination.entryFee) : 0;

  const attractions = destination.attractions || [];
  
  // Official State Cover Image & Folder Place Image Fallback
  const stateFolderItem = getStateFolderItemBySlug(region);
  const bgImage = destination.primaryImageUrl || destination.bgImage || stateFolderItem?.coverImage || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1600&q=80';

  // Schema.org TouristAttraction JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: destination.name,
    description: description,
    url: `https://bharatyatra.com/destinations/${destination.slug}`,
    image: bgImage,
    address: {
      '@type': 'PostalAddress',
      addressRegion: region,
      addressCountry: 'IN',
    },
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-amber-200 selection:text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Bar - Clean White Theme */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <Link
              href="/destinations"
              className="hover:text-amber-700 flex items-center space-x-1 font-bold text-amber-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Destinations</span>
            </Link>
            <span>/</span>
            {destination.state && (
              <>
                <Link href={`/states/${destination.state.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="hover:text-slate-900 font-medium">
                  {destination.state}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-900 font-bold truncate max-w-[180px] sm:max-w-none">{destination.name}</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/ai-planner?destination=${encodeURIComponent(destination.name)}`}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition shadow flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan Trip to {destination.name}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Clean Image & Contrast Overlay */}
      <section className="relative min-h-[420px] flex items-end pb-12 overflow-hidden bg-slate-900">
        <img
          src={bgImage}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-md tracking-wider shadow">
                {destination.category || 'Destination'}
              </span>
              {destination.isUNESCO && (
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow">
                  UNESCO Site
                </span>
              )}
              {destination.permitRequired && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center space-x-1 shadow">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Permit Needed: {destination.permitType || 'ILP'}</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              {destination.name}
            </h1>
            <p className="text-base sm:text-lg text-amber-300 font-medium mb-4 drop-shadow">
              {tagline}
            </p>
            <p className="text-sm text-slate-200 line-clamp-3 leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Clean White Theme */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Permit Alert Banner */}
          {destination.permitRequired && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start space-x-4 shadow-sm">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900 mb-1">
                  Permit &amp; Access Restriction Notice
                </h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  Visiting {destination.name} requires an official permit ({destination.permitType || 'Inner Line Permit (ILP)'}).
                  Please secure your permit before traveling.
                </p>
              </div>
            </div>
          )}

          {/* Key Quick Facts Grid - White Theme */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Recommended Stay</span>
              <span className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{idealDays} Days</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Best Season</span>
              <span className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="truncate">{bestTimeToVisit.split(' ')[0]}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Entry Fee</span>
              <span className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                <Banknote className="w-4 h-4 text-amber-600" />
                <span>{entryFee > 0 ? `₹${entryFee}` : 'Free'}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Est. Budget</span>
              <span className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                <Banknote className="w-4 h-4 text-amber-600" />
                <span>₹{estimatedBudget.toLocaleString('en-IN')}</span>
              </span>
            </div>
          </div>

          {/* Overview - White Theme */}
          <section className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-amber-600" />
              <span>Destination Overview</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {overview}
            </p>
          </section>

          {/* Top Attractions & Landmarks - White Theme */}
          {attractions.length > 0 && (
            <section className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <span>Top Attractions &amp; Key Landmarks</span>
              </h2>
              <div className="space-y-4">
                {attractions.map((att: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-amber-300">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{att.name || att.title}</h4>
                      {att.description && <p className="text-xs text-slate-600 leading-relaxed">{att.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Map Section - White Theme */}
          <section className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span>Geographic Location &amp; Nearby Map</span>
            </h2>
            <div className="h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <DestinationMapSection
                destinationName={destination.name}
                center={[destination.latitude || 22.2442, destination.longitude || 68.9685]}
              />
            </div>
          </section>
        </div>

        {/* Right 1 Column Sidebar */}
        <div className="space-y-8">
          
          {/* AI Planner Banner Card - White Theme */}
          <div className="bg-white p-7 rounded-2xl border border-amber-300 shadow-md text-center bg-gradient-to-b from-amber-50/50 to-white">
            <Sparkles className="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Build Your {destination.name} Itinerary</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Generate a personalized day-by-day travel plan for {destination.name} matched with your budget and pacing.
            </p>
            <Link
              href={`/ai-planner?destination=${encodeURIComponent(destination.name)}`}
              className="w-full inline-block font-bold bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl transition shadow text-xs uppercase tracking-wider"
            >
              Start AI Trip Planner
            </Link>
          </div>

          {/* Transport & Access Card - White Theme */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              How to Reach
            </h3>
            <div className="flex items-start space-x-3">
              <Plane className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Nearest Airport</span>
                <span className="text-xs text-slate-600 leading-relaxed">{nearestAirport}</span>
              </div>
            </div>
            <div className="flex items-start space-x-3 pt-2 border-t border-slate-100">
              <Train className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Nearest Railway</span>
                <span className="text-xs text-slate-600 leading-relaxed">{nearestRailway}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

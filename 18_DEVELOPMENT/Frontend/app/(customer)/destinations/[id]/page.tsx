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
  Hotel as HotelIcon,
  Utensils,
  Compass,
  Star,
  Banknote,
} from 'lucide-react';
import { getDestinationBySlug } from '@/lib/data/destinations';
import { Badge } from '@/components/ui/badge';
import DestinationMapSection from '@/components/maps/destination-map-section';

interface DestinationDetailPageProps {
  params: {
    id: string;
  };
}

async function fetchDestinationFromApi(slug: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
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

  const local = getDestinationBySlug(slug);
  if (!local) return null;

  return {
    slug: local.slug,
    name: local.name,
    region: local.region,
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
    attractions: local.highlights.map((h, idx) => ({
      id: `attr-local-${idx}`,
      name: h,
      category: 'Top Landmark',
      openingHours: 'Regular Hours',
      entryFeeInr: 0,
    })),
    activities: local.activities.map((act, idx) => ({
      id: `act-local-${idx}`,
      title: act.title,
      durationMinutes: act.duration === '2 hours' ? 120 : 60,
      priceInr: act.price.includes('₹') ? parseInt(act.price.replace(/[^0-9]/g, '')) || 0 : 0,
      category: 'Activity',
    })),
    hotels: [],
    restaurants: [],
  };
}

export default async function DestinationDetailPage({ params }: DestinationDetailPageProps) {
  const destination = await fetchDestinationFromApi(params.id);

  if (!destination) {
    notFound();
  }

  const regionFormatted = destination.region ? destination.region.replace('_', ' ') : 'Gujarat';
  const durationHours = destination.durationHours || (destination.recommendedDays ? destination.recommendedDays * 24 : 48);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner */}
      <section className={`bg-gradient-to-r ${destination.heroColor || 'from-amber-600 to-amber-900'} px-4 py-16 text-white sm:px-6 lg:px-8 relative overflow-hidden`}>
        <div className="mx-auto max-w-7xl relative z-10 space-y-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to All Destinations
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="verified">{regionFormatted}</Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" /> Recommended {durationHours}h Stay ({destination.recommendedDays || 3} Days)
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl font-extrabold font-heading sm:text-5xl lg:text-6xl tracking-tight">
              {destination.name}
            </h1>
            {destination.tagline && (
              <p className="text-lg font-medium text-amber-200">{destination.tagline}</p>
            )}
            <p className="text-sm text-slate-200 sm:text-base leading-relaxed">
              {destination.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={`/ai-planner?destination=${destination.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-brand-primary-hover transition-colors"
            >
              <Sparkles className="h-4 w-4" /> Plan {destination.name} Trip with AI
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              View Tour Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Details & Travel Inventory */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            {destination.overview && (
              <section className="space-y-3">
                <h2 className="text-2xl font-bold font-heading text-slate-900">Destination Overview</h2>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  {destination.overview}
                </p>
              </section>
            )}

            {/* Interactive Destination Map */}
            <DestinationMapSection
              destinationName={destination.name}
              center={[
                destination.latitude ? Number(destination.latitude) : 22.2442,
                destination.longitude ? Number(destination.longitude) : 68.9685,
              ]}
              attractions={destination.attractions}
              hotels={destination.hotels}
              restaurants={destination.restaurants}
              activities={destination.activities}
            />

            {/* Key Highlights / Attractions */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900">Key Highlights & Attractions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.attractions && destination.attractions.length > 0 ? (
                  destination.attractions.map((attr: any, index: number) => (
                    <div
                      key={attr.id || index}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <CheckCircle2 className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{attr.name}</span>
                        {attr.description && <p className="text-xs text-slate-500 mt-0.5">{attr.description}</p>}
                        {attr.openingHours && (
                          <span className="text-[10px] text-slate-400 block mt-1">Hours: {attr.openingHours}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No specific attractions listed.</p>
                )}
              </div>
            </section>

            {/* WHERE TO STAY (Hotels Section) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HotelIcon className="h-5 w-5 text-brand-primary" />
                  <h2 className="text-2xl font-bold font-heading text-slate-900">Where to Stay</h2>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Sample Accommodations
                </span>
              </div>

              {destination.hotels && destination.hotels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {destination.hotels.map((hotel: any) => (
                    <div key={hotel.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                            {hotel.category || 'Hotel'}
                          </span>
                          <span className="flex items-center text-xs font-bold text-amber-500 gap-0.5">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {hotel.starRating}-Star
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{hotel.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{hotel.description || hotel.address}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Est. Nightly Rate</span>
                          <span className="text-sm font-extrabold text-slate-900">₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}</span>
                        </div>
                        <Link
                          href={`/hotels/${hotel.id}`}
                          className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary transition-colors"
                        >
                          View Stay
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                  Stay inventory integration in progress for {destination.name}.
                </div>
              )}
            </section>

            {/* WHERE TO EAT (Restaurants Section) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-brand-primary" />
                  <h2 className="text-2xl font-bold font-heading text-slate-900">Where to Eat</h2>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Dining Highlights
                </span>
              </div>

              {destination.restaurants && destination.restaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {destination.restaurants.map((rest: any) => (
                    <div key={rest.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {rest.cuisineType}
                          </span>
                          <span className="flex items-center text-xs font-bold text-amber-500 gap-0.5">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {rest.rating || '4.5'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{rest.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{rest.description || rest.address}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Avg. Cost for 2</span>
                          <span className="text-sm font-extrabold text-slate-900">₹{Number(rest.averageCost).toLocaleString('en-IN')}</span>
                        </div>
                        <Link
                          href={`/restaurants/${rest.id}`}
                          className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                  Dining inventory integration in progress for {destination.name}.
                </div>
              )}
            </section>

            {/* THINGS TO DO (Activities Section) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-brand-primary" />
                  <h2 className="text-2xl font-bold font-heading text-slate-900">Things to Do</h2>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Experiences
                </span>
              </div>

              <div className="space-y-3">
                {destination.activities && destination.activities.length > 0 ? (
                  destination.activities.map((act: any, index: number) => (
                    <div
                      key={act.id || index}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div>
                        <Link href={act.id ? `/activities/${act.id}` : '#'} className="text-sm font-bold text-slate-900 hover:text-brand-primary transition-colors">
                          {act.title || act.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                          <span>Duration: {act.durationMinutes ? `${act.durationMinutes} mins` : act.duration || '1 hour'}</span>
                          <span>Est. Cost: {act.priceInr !== undefined ? `₹${act.priceInr}` : act.price || 'Free'}</span>
                        </p>
                      </div>
                      <Link
                        href={`/ai-planner?destination=${destination.slug}&activity=${encodeURIComponent(act.title || act.name)}`}
                        className="rounded-lg bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/20 transition-colors whitespace-nowrap"
                      >
                        Add to Trip
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No specific activities listed.</p>
                )}
              </div>
            </section>
          </div>

          {/* Useful Travel Information Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-3">
                Useful Travel Info
              </h3>

              <div className="space-y-4 text-xs">
                {destination.bestTimeToVisit && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Best Time to Visit</span>
                      <span className="text-slate-600">{destination.bestTimeToVisit}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Recommended Duration</span>
                    <span className="text-slate-600">{destination.recommendedDays || 3} Days ({durationHours} Hours)</span>
                  </div>
                </div>

                {destination.estimatedBudget && (
                  <div className="flex items-start gap-3">
                    <Banknote className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Estimated Budget</span>
                      <span className="text-slate-600">₹{Number(destination.estimatedBudget).toLocaleString('en-IN')} per couple</span>
                    </div>
                  </div>
                )}

                {destination.nearestAirport && (
                  <div className="flex items-start gap-3">
                    <Plane className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Nearest Airport</span>
                      <span className="text-slate-600">{destination.nearestAirport}</span>
                    </div>
                  </div>
                )}

                {destination.nearestRailway && (
                  <div className="flex items-start gap-3">
                    <Train className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Nearest Railway</span>
                      <span className="text-slate-600">{destination.nearestRailway}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Region Circuit</span>
                    <span className="text-slate-600">{regionFormatted}</span>
                  </div>
                </div>
              </div>

              {/* AI Planner CTA Box */}
              <div className="rounded-xl bg-brand-dark p-5 text-white space-y-3">
                <h4 className="text-sm font-bold font-heading">Instant AI Itinerary</h4>
                <p className="text-xs text-slate-300">
                  Build a 100% customized {destination.name} itinerary matching your dates, budget, and travel style.
                </p>
                <Link
                  href={`/ai-planner?destination=${destination.slug}`}
                  className="block w-full text-center rounded-lg bg-brand-primary py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors"
                >
                  Generate {destination.name} Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

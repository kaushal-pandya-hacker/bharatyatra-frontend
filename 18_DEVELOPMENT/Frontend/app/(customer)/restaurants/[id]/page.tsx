import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Utensils,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import BookingCard from '@/components/booking/booking-card';

interface RestaurantDetailPageProps {
  params: {
    id: string;
  };
}

async function fetchRestaurantDetail(id: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const res = await fetch(`${apiBase}/destinations/inventory/restaurants/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    // API connection fallback
  }

  return null;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const restaurant = await fetchRestaurantDetail(params.id);

  if (!restaurant) {
    notFound();
  }

  const destinationSlug = restaurant.destination?.slug || 'dwarka';
  const destinationName = restaurant.destination?.name || 'Gujarat';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <Link
        href={`/destinations/${destinationSlug}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {destinationName}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="verified">{restaurant.cuisineType || 'Dining'}</Badge>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {restaurant.priceRange} Price Tier
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold font-heading text-slate-900">{restaurant.name}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-primary" /> {restaurant.address || `${destinationName}, Gujarat`}
                </p>
              </div>

              <div className="text-right sm:text-right space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[180px]">
                <span className="text-xs text-slate-500 block">Avg. Cost for Two</span>
                <div className="text-2xl font-extrabold font-heading text-brand-primary">
                  ₹{Number(restaurant.averageCost).toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-end gap-1 text-xs font-bold text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{restaurant.rating || '4.5'} Rating</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-heading text-slate-900">About Dining Experience</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {restaurant.description || `Popular dining destination serving authentic ${restaurant.cuisineType} meals in ${destinationName}, Gujarat.`}
              </p>
            </div>

            {/* Hours & Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <Clock className="h-4 w-4 text-brand-primary" />
                <div>
                  <span className="font-bold text-slate-900 block">Operating Hours</span>
                  <span className="text-slate-600">{restaurant.openingTime || '11:00 AM'} - {restaurant.closingTime || '10:30 PM'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <Banknote className="h-4 w-4 text-brand-primary" />
                <div>
                  <span className="font-bold text-slate-900 block">Cuisine Category</span>
                  <span className="text-slate-600">{restaurant.cuisineType}</span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="rounded-2xl bg-brand-dark p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold font-heading">Include in AI Meal Plan?</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Add {restaurant.name} to your daily AI itinerary meal schedule.
                </p>
              </div>
              <Link
                href={`/ai-planner?destination=${destinationSlug}&restaurant=${encodeURIComponent(restaurant.name)}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4" /> Add Dining to AI Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar Booking Widget (1 col) */}
        <div className="lg:col-span-1">
          <BookingCard
            inventoryType="RESTAURANT"
            inventoryId={restaurant.id}
            inventoryName={restaurant.name}
            unitPrice={Number(restaurant.averageCost)}
            supplierId={restaurant.supplierId}
          />
        </div>
      </div>
    </div>
  );
}


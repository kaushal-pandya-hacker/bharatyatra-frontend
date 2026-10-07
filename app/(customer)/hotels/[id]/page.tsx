import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Hotel as HotelIcon,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import BookingCard from '@/components/booking/booking-card';

import { getBaseUrl } from '@/lib/api/client';

interface HotelDetailPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return [
    { id: 'the-ummed-ahmedabad' },
    { id: 'hyatt-regency-ahmedabad' },
    { id: 'fern-residency-dwarka' },
    { id: 'demo' },
  ];
}

async function fetchHotelDetail(id: string) {
  try {
    const apiBase = getBaseUrl();
    const res = await fetch(`${apiBase}/destinations/inventory/hotels/${id}`, { cache: 'no-store' });
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

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
  const hotel = await fetchHotelDetail(params.id);

  if (!hotel) {
    notFound();
  }

  const destinationSlug = hotel.destination?.slug || 'dwarka';
  const destinationName = hotel.destination?.name || 'Gujarat';

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
        {/* Left Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="verified">{hotel.category || 'Hotel'}</Badge>
                  {hotel.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Partner
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                      Development Sample Inventory
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-extrabold font-heading text-slate-900">{hotel.name}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-primary" /> {hotel.address || `${destinationName}, Gujarat`}
                </p>
              </div>

              <div className="text-right sm:text-right space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[180px]">
                <span className="text-xs text-slate-500 block">Est. Nightly Rate</span>
                <div className="text-2xl font-extrabold font-heading text-brand-primary">
                  ₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}
                  <span className="text-xs text-slate-500 font-normal"> / night</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-xs font-bold text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{hotel.starRating}-Star Category</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-heading text-slate-900">About Property</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {hotel.description || `Comfortable ${hotel.starRating}-star stay option located in ${destinationName}, Gujarat with modern amenities and pilgrim-friendly services.`}
              </p>
            </div>

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold font-heading text-slate-900">Key Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {hotel.amenities.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <CheckCircle className="h-4 w-4 text-brand-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className="rounded-2xl bg-brand-dark p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold font-heading">Include in AI Itinerary?</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Let BharatYatra AI optimize your stay duration and travel routes matching {hotel.name}.
                </p>
              </div>
              <Link
                href={`/ai-planner?destination=${destinationSlug}&hotel=${encodeURIComponent(hotel.name)}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4" /> Add Stay to AI Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar Booking Widget (1 col) */}
        <div className="lg:col-span-1">
          <BookingCard
            inventoryType="HOTEL"
            inventoryId={hotel.id}
            inventoryName={hotel.name}
            unitPrice={Number(hotel.pricePerNight)}
            supplierId={hotel.supplierId}
          />
        </div>
      </div>
    </div>
  );
}


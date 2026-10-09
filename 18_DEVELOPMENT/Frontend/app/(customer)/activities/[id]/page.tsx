import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Compass,
  MapPin,
  Clock,
  Banknote,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import BookingCard from '@/components/booking/booking-card';

interface ActivityDetailPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return [
    { id: 'dwarka-evening-aarti' },
    { id: 'somnath-light-sound' },
    { id: 'rann-camel-safari' },
    { id: 'statue-viewing-deck' },
    { id: 'gir-jungle-safari' },
    { id: 'demo' },
  ];
}

async function fetchActivityDetail(id: string) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '');
  try {
    const res = await fetch(`${apiBase}/destinations/inventory/activities/${id}`, { cache: 'no-store' });
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

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const activity = await fetchActivityDetail(params.id);

  if (!activity) {
    notFound();
  }

  const destinationSlug = activity.destination?.slug || 'dwarka';
  const destinationName = activity.destination?.name || 'Gujarat';

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
                  <Badge variant="verified">{activity.category || 'Activity'}</Badge>
                  {activity.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Activity
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-extrabold font-heading text-slate-900">{activity.title || activity.name}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-primary" /> {destinationName}, Gujarat
                </p>
              </div>

              <div className="text-right sm:text-right space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 min-w-[180px]">
                <span className="text-xs text-slate-500 block">Estimated Cost</span>
                <div className="text-2xl font-extrabold font-heading text-brand-primary">
                  {Number(activity.priceInr) > 0 ? `₹${Number(activity.priceInr).toLocaleString('en-IN')}` : 'Free'}
                </div>
                <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-brand-primary" />
                  <span>{activity.durationMinutes || 60} minutes</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-heading text-slate-900">Activity Overview</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activity.description || `Enjoy this recommended ${activity.category} experience in ${destinationName}, Gujarat.`}
              </p>
            </div>

            {/* Best time to visit */}
            {activity.bestTimeToVisit && (
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <Calendar className="h-4 w-4 text-brand-primary shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">Recommended Timing</span>
                  <span className="text-slate-600">{activity.bestTimeToVisit}</span>
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className="rounded-2xl bg-brand-dark p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold font-heading">Add Activity to AI Itinerary?</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Include {activity.title || activity.name} in your custom AI itinerary schedule.
                </p>
              </div>
              <Link
                href={`/ai-planner?destination=${destinationSlug}&activity=${encodeURIComponent(activity.title || activity.name)}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4" /> Add Activity to AI Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar Booking Widget (1 col) */}
        <div className="lg:col-span-1">
          <BookingCard
            inventoryType="ACTIVITY"
            inventoryId={activity.id}
            inventoryName={activity.title || activity.name}
            unitPrice={Number(activity.priceInr || 0)}
            supplierId={activity.supplierId}
          />
        </div>
      </div>
    </div>
  );
}


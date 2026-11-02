'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Sparkles,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Filter,
  CheckCircle,
  ArrowRight,
  Heart,
} from 'lucide-react';

interface PublicReview {
  id: string;
  customerName: string;
  destination: string;
  tripDates: {
    startDate: string;
    endDate?: string;
    durationDays: number;
  };
  travellerCount: number;
  overallRating: number;
  categoryRatings: Record<string, number>;
  positiveHighlights: string[];
  writtenReview: string;
  photos: Array<{ id: string; url: string; caption?: string }>;
  officialReply?: {
    responderName: string;
    responderRole: string;
    message: string;
    timestamp: string;
  };
  createdAt: string;
}

export default function PublicReviewsPage() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [searchDestination, setSearchDestination] = useState<string>('');

  useEffect(() => {
    async function loadPublicReviews() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedRating > 0) params.append('rating', selectedRating.toString());
        if (searchDestination.trim()) params.append('destination', searchDestination.trim());

        const res = await fetch(`/api/reviews?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) setReviews(json.data);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPublicReviews();
  }, [selectedRating, searchDestination]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Verified Customer Journeys</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Traveller Stories &amp; Authentic Reviews
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Every journey creates a story. Read genuine, post-trip feedback from travellers who explored India
            with BharatYatra&apos;s intelligent itineraries.
          </p>

          {/* Ratings KPI Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-amber-400">{avgRating}</span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-300 font-medium ml-1">Overall Rating</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-slate-200">
              {reviews.length} Verified Reviews Published
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedRating(0)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  selectedRating === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-0.5 ${
                    selectedRating === star
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              placeholder="Filter by destination..."
              className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Reviews Listing */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading verified reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 fill-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">No public reviews matching your criteria</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All BharatYatra reviews are submitted by real travellers upon journey completion. Be the first to
                leave feedback after your trip!
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <span>Visit Your Travel Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4 transition hover:shadow-md"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center">
                      {r.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{r.customerName}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span>{r.destination}</span>
                        </span>
                        <span>•</span>
                        <span>{r.tripDates?.durationDays || 3} Days Trip</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= r.overallRating ? 'fill-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {r.overallRating}.0
                    </span>
                  </div>
                </div>

                {/* Written review */}
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {r.writtenReview}
                </p>

                {/* Positive Highlights tags */}
                {r.positiveHighlights && r.positiveHighlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.positiveHighlights.map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                )}

                {/* Photo Gallery if any */}
                {r.photos && r.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {r.photos.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                      >
                        <img src={p.url} alt={p.caption || 'Traveler photo'} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Official BharatYatra Response Box */}
                {r.officialReply && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>Official Response from BharatYatra</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(r.officialReply.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium pl-5 border-l-2 border-blue-300">
                      &ldquo;{r.officialReply.message}&rdquo;
                    </p>
                    <div className="text-[10px] text-slate-500 font-medium pl-5">
                      — {r.officialReply.responderName} ({r.officialReply.responderRole.replace('_', ' ')})
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


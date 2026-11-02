'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TripCompletionModal } from '@/components/reviews/TripCompletionModal';
import { fetchUserTripsFromApi, TripItem } from '@/lib/trips/trip-storage';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export default function TripReviewPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = (params?.id as string) || '';

  const [trip, setTrip] = useState<TripItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    async function loadTripAndReview() {
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('auth_token') || localStorage.getItem('token')
            : null;

        // Fetch user trips
        const trips = await fetchUserTripsFromApi(token || undefined);
        const match = trips.find((t) => (t.tripId || t.id) === tripId);
        if (match) {
          setTrip(match);
        } else {
          // Construct fallback minimal trip for review
          setTrip({
            tripId,
            id: tripId,
            title: `Voyage #${tripId.slice(0, 8)}`,
            destination: 'India',
            startDate: new Date().toISOString().split('T')[0],
            durationDays: 3,
            status: 'COMPLETED',
          });
        }

        // Check if existing review exists
        if (token) {
          const revRes = await fetch('/api/user/reviews', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (revRes.ok) {
            const revJson = await revRes.json();
            const revMatch = revJson.data?.find((r: any) => r.tripId === tripId);
            if (revMatch) setExistingReview(revMatch);
          }
        }
      } catch (err) {
        console.error('Failed to load trip for review:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTripAndReview();
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading your journey details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Journey Review &amp; Appreciation
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Share feedback for your expedition to {trip?.destination || 'India'}
            </p>
          </div>
        </div>

        {trip && (
          <TripCompletionModal
            isOpen={true}
            onClose={() => router.push('/dashboard')}
            trip={trip}
            existingReview={existingReview}
            onReviewSubmitted={() => {
              setTimeout(() => {
                router.push('/dashboard#reviews');
              }, 1500);
            }}
          />
        )}
      </div>
    </div>
  );
}


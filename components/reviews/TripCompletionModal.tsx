'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Sparkles,
  Heart,
  CheckCircle,
  X,
  Camera,
  Trash2,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Compass,
  Smile,
  ShieldCheck,
  Send,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import type { StarRating, CategoryRatings, ReviewPhoto } from '@/lib/reviews/review-store';

interface TripCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id?: string;
    tripId?: string;
    title: string;
    destination: string;
    startDate: string;
    endDate?: string;
    durationDays: number;
    travelers?: number;
    nodes?: Array<{ name?: string; title?: string }>;
  };
  existingReview?: any;
  onReviewSubmitted?: (review: any) => void;
}

const RATING_LABELS: Record<StarRating, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Great',
  5: 'Excellent',
};

const CATEGORIES: Array<{ key: keyof CategoryRatings; label: string }> = [
  { key: 'tripPlanning', label: 'Trip Planning Experience' },
  { key: 'transportation', label: 'Transportation & Transit' },
  { key: 'accommodation', label: 'Accommodation Quality' },
  { key: 'destinationRecommendations', label: 'Destination Recommendations' },
  { key: 'itineraryQuality', label: 'AI Itinerary Quality' },
  { key: 'bookingExperience', label: 'Booking Experience' },
  { key: 'customerSupport', label: 'Customer Support' },
  { key: 'valueForMoney', label: 'Overall Value for Money' },
];

const POSITIVE_OPTIONS = [
  'Easy trip planning',
  'Excellent destinations',
  'Great accommodation',
  'Comfortable transportation',
  'Helpful recommendations',
  'Smooth booking experience',
  'Excellent customer support',
  'Personalized AI itinerary',
];

const IMPROVEMENT_OPTIONS = [
  'Better destination recommendations',
  'More affordable packages',
  'Improved transportation options',
  'Better hotel options',
  'More accurate itineraries',
  'Faster customer support',
  'Better booking experience',
  'Other suggestions',
];

export function TripCompletionModal({
  isOpen,
  onClose,
  trip,
  existingReview,
  onReviewSubmitted,
}: TripCompletionModalProps) {
  // Steps: 'CELEBRATION' | 'RATING' | 'DETAILS' | 'PHOTOS' | 'SUMMARY' | 'THANK_YOU'
  const [currentStep, setCurrentStep] = useState<
    'CELEBRATION' | 'RATING' | 'DETAILS' | 'PHOTOS' | 'SUMMARY' | 'THANK_YOU'
  >(existingReview ? 'RATING' : 'CELEBRATION');

  // Form State
  const [overallRating, setOverallRating] = useState<StarRating>(existingReview?.overallRating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>(
    existingReview?.categoryRatings || {}
  );
  const [writtenReview, setWrittenReview] = useState<string>(existingReview?.writtenReview || '');
  const [selectedPositives, setSelectedPositives] = useState<string[]>(
    existingReview?.positiveHighlights || ['Easy trip planning', 'Excellent destinations']
  );
  const [customPositive, setCustomPositive] = useState<string>(existingReview?.customPositiveNote || '');
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>(
    existingReview?.improvementSuggestions || []
  );
  const [customImprovement, setCustomImprovement] = useState<string>(
    existingReview?.customImprovementNote || ''
  );
  const [photos, setPhotos] = useState<ReviewPhoto[]>(existingReview?.photos || []);
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');
  const [publicConsent, setPublicConsent] = useState<boolean>(
    existingReview?.publicConsent !== undefined ? existingReview.publicConsent : false
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const tripId = trip.tripId || trip.id;
  const destination = trip.destination || 'India';
  const travelers = trip.travelers || 2;
  const stops = trip.nodes && trip.nodes.length > 0 ? trip.nodes.map((n) => n.name || n.title || '').join(', ') : destination;

  // Toggle helpers
  const togglePositive = (item: string) => {
    setSelectedPositives((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const toggleImprovement = (item: string) => {
    setSelectedImprovements((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const setCatRating = (key: keyof CategoryRatings, val: number) => {
    setCategoryRatings((prev) => ({
      ...prev,
      [key]: prev[key] === val ? undefined : val,
    }));
  };

  // Mock Photo Upload / Base64 Simulator
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length >= 6) {
      alert('You can upload a maximum of 6 photographs per journey.');
      return;
    }

    const file = files[0];
    if (file.size > 8 * 1024 * 1024) {
      alert('Image size exceeds 8MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setPhotos((prev) => [
        ...prev,
        {
          id: `img_${Date.now()}`,
          url,
          caption: photoCaptionInput.trim() || undefined,
        },
      ]);
      setPhotoCaptionInput('');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Submission handler
  const handleSubmitReview = async () => {
    if (!writtenReview || writtenReview.trim().length === 0) {
      setErrorMsg('Please share a few words about your journey experience.');
      setCurrentStep('RATING');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token') || localStorage.getItem('token')
          : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/user/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tripId,
          destination,
          tripDates: {
            startDate: trip.startDate,
            endDate: trip.endDate,
            durationDays: trip.durationDays || 3,
          },
          travellerCount: travelers,
          overallRating,
          categoryRatings,
          positiveHighlights: selectedPositives,
          improvementSuggestions: selectedImprovements,
          customPositiveNote: customPositive.trim() || undefined,
          customImprovementNote: customImprovement.trim() || undefined,
          writtenReview: writtenReview.trim(),
          photos,
          publicConsent,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (onReviewSubmitted) onReviewSubmitted(json.data);
        setCurrentStep('THANK_YOU');
      } else {
        setErrorMsg(json.error || 'Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to review service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col relative">
        {/* Close Button */}
        {currentStep !== 'THANK_YOU' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* STEP 1: CELEBRATION SCREEN */}
        {currentStep === 'CELEBRATION' && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center space-y-6 overflow-y-auto">
            {/* Travel Illustration & Badge */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 animate-bounce">
              <Heart className="w-10 h-10 fill-white" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Welcome Back, Traveller! ❤️
              </h2>
              <p className="text-amber-600 font-bold text-base sm:text-lg">
                We hope you had an incredible journey with BharatYatra.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-1">
                Thank you for making BharatYatra a part of your journey. We hope you collected unforgettable
                memories, explored amazing places and enjoyed every moment.
              </p>
            </div>

            {/* Trip Summary Card */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Destination
                </span>
                <span className="font-extrabold text-slate-900 truncate block mt-0.5">{destination}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Duration
                </span>
                <span className="font-extrabold text-slate-900 block mt-0.5">
                  {trip.durationDays} Days / {Math.max(1, trip.durationDays - 1)} Nights
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dates
                </span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{trip.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Travelers
                </span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{travelers} Pax</span>
              </div>
            </div>

            {/* Prominent Story Hook */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 text-blue-950 text-sm font-semibold w-full">
              ✨ Every journey creates a story. We&apos;d love to hear yours!
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep('RATING')}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Share Your Experience</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                href="/states"
                onClick={onClose}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition text-center"
              >
                Explore Your Next Journey
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: STAR RATING & PRIMARY FEEDBACK */}
        {currentStep === 'RATING' && (
          <div className="p-6 sm:p-8 flex flex-col space-y-6 overflow-y-auto">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                Step 1 of 3 • Overall Journey Impression
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                How was your BharatYatra experience?
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Rate your voyage to <strong className="text-slate-800">{destination}</strong>.
              </p>
            </div>

            {/* Interactive 5-Star Rating */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                {([1, 2, 3, 4, 5] as StarRating[]).map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setOverallRating(star)}
                    className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                        (hoverRating !== null ? star <= hoverRating : star <= overallRating)
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Reactive Rating Label Confirmation */}
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-xs uppercase tracking-wider">
                  {RATING_LABELS[hoverRating !== null ? (hoverRating as StarRating) : overallRating]} (
                  {hoverRating !== null ? hoverRating : overallRating} of 5 Stars)
                </span>
              </div>
            </div>

            {/* Written Review Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Tell us about your journey <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={writtenReview}
                onChange={(e) => setWrittenReview(e.target.value)}
                placeholder="Share your favourite moments, what you enjoyed and how we can improve..."
                className="w-full p-4 text-sm bg-white border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-medium leading-relaxed"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Navigation Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('CELEBRATION')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!writtenReview.trim()) {
                    setErrorMsg('Please share a few words about your journey experience.');
                    return;
                  }
                  setErrorMsg('');
                  setCurrentStep('DETAILS');
                }}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Continue to Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CATEGORY RATINGS, HIGHLIGHTS & IMPROVEMENTS */}
        {currentStep === 'DETAILS' && (
          <div className="p-6 sm:p-8 flex flex-col space-y-6 overflow-y-auto">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                Step 2 of 3 • Category Breakdown & Insights
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                What stood out on your voyage?
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Select your positive highlights, improvement areas, and optional category scores.
              </p>
            </div>

            {/* WHAT DID YOU LOVE? */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>What did you love? (Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {POSITIVE_OPTIONS.map((opt) => {
                  const active = selectedPositives.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => togglePositive(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                        active
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {opt}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={customPositive}
                onChange={(e) => setCustomPositive(e.target.value)}
                placeholder="Other positive experience (optional)..."
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* WHAT CAN WE IMPROVE? */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>How can we make your next journey even better?</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {IMPROVEMENT_OPTIONS.map((opt) => {
                  const active = selectedImprovements.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleImprovement(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                        active
                          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {opt}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={customImprovement}
                onChange={(e) => setCustomImprovement(e.target.value)}
                placeholder="Other suggestions for our operations team (optional)..."
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* OPTIONAL CATEGORY RATINGS */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Category Ratings (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Click a star to rate or skip</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const val = categoryRatings[cat.key] || 0;
                  return (
                    <div
                      key={cat.key}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-slate-700 truncate pr-2">{cat.label}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCatRating(cat.key, s)}
                            className="p-0.5 hover:scale-110 transition"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                s <= val ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('RATING')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('PHOTOS')}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Continue to Memories</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PHOTO UPLOADS & PUBLIC DISPLAY CONSENT */}
        {currentStep === 'PHOTOS' && (
          <div className="p-6 sm:p-8 flex flex-col space-y-6 overflow-y-auto">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                Step 3 of 3 • Travel Memories & Verification
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Add Photos & Review Submission
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Share your favourite photos from your trip (optional).
              </p>
            </div>

            {/* Photo Uploader Box */}
            <div className="space-y-3">
              <div className="p-5 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl bg-slate-50 text-center space-y-2 transition">
                <Camera className="w-8 h-8 text-blue-600 mx-auto" />
                <div className="text-xs text-slate-600 font-bold">
                  Upload snapshots from <strong className="text-slate-900">{destination}</strong>
                </div>
                <p className="text-[11px] text-slate-400">JPG, PNG, WebP up to 8MB • Max 6 photographs</p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    value={photoCaptionInput}
                    onChange={(e) => setPhotoCaptionInput(e.target.value)}
                    placeholder="Photo caption (e.g., Sunset at White Rann)..."
                    className="w-full text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800"
                  />
                  <label className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-xs">
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded Photos Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-xs"
                    >
                      <img src={p.url} alt={p.caption || 'Travel memory'} className="w-full h-full object-cover" />
                      {p.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 p-1 text-[10px] text-white truncate px-2">
                          {p.caption}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(p.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Public Display Consent Checkbox */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicConsent}
                  onChange={(e) => setPublicConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div className="text-xs text-slate-700">
                  <strong className="font-bold text-slate-900 block">
                    Allow BharatYatra to feature my travel memories and feedback publicly
                  </strong>
                  Your review may be featured on our verified destination showcases after moderation. Private
                  email and contact details will never be exposed.
                </div>
              </label>
            </div>

            {/* Navigation Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('DETAILS')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('SUMMARY')}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Review &amp; Confirm</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW SUMMARY BEFORE SUBMIT */}
        {currentStep === 'SUMMARY' && (
          <div className="p-6 sm:p-8 flex flex-col space-y-6 overflow-y-auto">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                Final Step • Summary
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Review Your Feedback
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Double check your review before locking it in for the operations team.
              </p>
            </div>

            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-800">
              {/* Rating header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-900">
                    {RATING_LABELS[overallRating]} ({overallRating}★)
                  </span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= overallRating ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-slate-500 font-semibold">{destination}</span>
              </div>

              {/* Written review */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Your Written Review
                </span>
                <p className="text-slate-700 italic font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  &ldquo;{writtenReview}&rdquo;
                </p>
              </div>

              {/* Highlights */}
              {selectedPositives.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Loved
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPositives.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {selectedImprovements.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Suggested Improvements
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedImprovements.map((i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]"
                      >
                        • {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos count & public consent */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>{photos.length} photograph(s) attached</span>
                <span className="font-semibold text-slate-700">
                  Public Display: {publicConsent ? 'Granted' : 'Private Only'}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('PHOTOS')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Edit Details
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitReview}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Submitting Review...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit My Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: THANK YOU CELEBRATION */}
        {currentStep === 'THANK_YOU' && (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center space-y-6 overflow-y-auto">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Thank You for Sharing Your Experience! ❤️
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Your feedback helps us improve BharatYatra and create better journeys for every traveller.
              </p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900">What happens next?</div>
              <p>
                Our operations team reviews all feedback within 24 hours. If you requested assistance or suggested
                improvements, you will receive an official response directly in your travel dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
              <Link
                href="/dashboard#reviews"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition text-center"
              >
                View My Reviews
              </Link>
              <Link
                href="/ai-planner"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-sm transition text-center"
              >
                Plan Next Voyage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

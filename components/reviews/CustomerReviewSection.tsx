'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Plus, CheckCircle2, User, Filter, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export interface ReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  destination: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  tags: string[];
  helpfulCount: number;
  verifiedTrip: boolean;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    userName: 'Ananya Sharma',
    destination: 'Rani Ki Vav, Patan',
    rating: 5,
    date: '2 days ago',
    title: 'Mind-blowing Solanki Architecture!',
    comment: 'The 7-storey subterranean stepwell is even more majestic in real life. BharatYatra AI recommended visiting between 8:30 AM - 10:30 AM when morning light hits the carved Vishnu sculptures. Perfect timing!',
    tags: ['Heritage Tour', 'Family Trip', 'AI Recommended'],
    helpfulCount: 42,
    verifiedTrip: true,
  },
  {
    id: 'rev-2',
    userName: 'Jignesh Patel',
    destination: 'Great Rann of Kutch',
    rating: 5,
    date: '1 week ago',
    title: 'Full Moon Night on the Salt Desert was Unforgettable',
    comment: 'Booked our tent city stay through BharatYatra. The desert sunset and moonlit salt marsh walk were magical. Local Kathiyawadi food was top notch!',
    tags: ['Rann Utsav', 'Must Visit', 'Cultural'],
    helpfulCount: 38,
    verifiedTrip: true,
  },
  {
    id: 'rev-3',
    userName: 'Dr. Rahul Mehta',
    destination: 'Sasan Gir Asiatic Lions',
    rating: 5,
    date: '2 weeks ago',
    title: 'Spotted a Pride of Lions on Morning Safari!',
    comment: 'Seamless safari booking guidance. Saw a male Asiatic lion with two lionesses near Kamleshwar Dam. Devalia zone was also super convenient with kids.',
    tags: ['Wildlife Safari', 'Verified Traveler'],
    helpfulCount: 29,
    verifiedTrip: true,
  },
  {
    id: 'rev-4',
    userName: 'Priya Nair',
    destination: 'Somnath & Dwarka Trail',
    rating: 5,
    date: '3 weeks ago',
    title: 'Peaceful Coastal Temple Pilgrimage',
    comment: 'The evening Aarti at Somnath right by the roaring ocean gave me goosebumps. The 3D laser projection show on the temple walls is world class.',
    tags: ['Spiritual', 'Solo Traveler'],
    helpfulCount: 19,
    verifiedTrip: true,
  },
];

const GUJARAT_DESTINATIONS_LIST = [
  'Rani Ki Vav, Patan',
  'Great Rann of Kutch',
  'Sasan Gir Asiatic Lions',
  'Somnath Temple',
  'Dwarkadhish Temple',
  'Statue of Unity',
  'Saputara Hill Station',
  'Sabarmati Riverfront',
  'Modhera Sun Temple',
  'Polo Forest',
];

export default function CustomerReviewSection() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [filterRating, setFilterRating] = useState<number | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Review Form State
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newDestination, setNewDestination] = useState(GUJARAT_DESTINATIONS_LIST[0]);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('Verified Traveler');
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleHelpfulClick = (id: string) => {
    if (helpfulVoted[id]) return;
    setHelpfulVoted((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) return;

    const createdReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      userName: user?.fullName || user?.email?.split('@')[0] || 'Gujarat Explorer',
      destination: newDestination,
      rating: newRating,
      date: 'Just now',
      title: newTitle,
      comment: newComment,
      tags: [newTag, 'Verified Traveler'],
      helpfulCount: 0,
      verifiedTrip: true,
    };

    setReviews([createdReview, ...reviews]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsModalOpen(false);
      setNewTitle('');
      setNewComment('');
      setNewRating(5);
    }, 1500);
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'All') return true;
    return r.rating === filterRating;
  });

  const averageRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <section className="w-full bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl my-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              VERIFIED TRAVELER REVIEWS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-['Outfit',sans-serif] tracking-tight">
              Real Experiences Across Gujarat
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              See what 1,250+ verified travelers say about Gujarat temples, lion safaris, white desert stays, and AI itineraries.
            </p>
          </div>

          {/* Rating Summary Badge & Write Review Action */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-black text-amber-400 font-['Outfit',sans-serif]">
                {averageRating}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-400 mt-0.5">Based on 1,250+ Ratings</span>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-700 hidden sm:block"></div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-2">Filter Stars:</span>
            
            {(['All', 5, 4, 3] as const).map((star) => (
              <button
                key={star.toString()}
                onClick={() => setFilterRating(star)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterRating === star
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {star === 'All' ? 'All Reviews' : `${star} ★ Stars`}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 shrink-0">
            Showing {filteredReviews.length} reviews
          </span>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between gap-4 hover:shadow-xl"
            >
              <div className="space-y-3">
                {/* Header User info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow-md font-['Outfit',sans-serif]">
                      {rev.userName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{rev.userName}</span>
                        {rev.verifiedTrip && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-amber-400 font-semibold">{rev.destination}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{rev.date}</span>
                </div>

                {/* Rating & Title */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">{rev.title}</h3>
                </div>

                {/* Comment Body */}
                <p className="text-slate-300 text-sm leading-relaxed">{rev.comment}</p>
              </div>

              {/* Footer Tags & Helpful Button */}
              <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {rev.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 text-[11px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleHelpfulClick(rev.id)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    helpfulVoted[rev.id]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                      : 'bg-slate-700/40 text-slate-300 hover:bg-slate-700 border border-slate-600/40'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{rev.helpfulCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* WRITE A REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {submitSuccess ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">Review Submitted!</h3>
                <p className="text-slate-400 text-sm">Thank you for sharing your Gujarat travel experience.</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-5">
                <div>
                  <h3 className="text-2xl font-black text-white font-['Outfit',sans-serif]">
                    Rate &amp; Review Your Trip
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Share feedback about your Gujarat destination or AI itinerary.</p>
                </div>

                {/* Star Rating Interactive Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            (hoverRating || newRating) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-amber-400 ml-2 font-mono">{newRating} / 5 Stars</span>
                  </div>
                </div>

                {/* Destination Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Destination Visited</label>
                  <select
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  >
                    {GUJARAT_DESTINATIONS_LIST.map((dest, i) => (
                      <option key={i} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Review Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unforgettable Sunset at Rann of Kutch!"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Feedback Comment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Experience</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell other travelers about the weather, best times to visit, local thali food, or AI route recommendations..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-4 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {/* Category Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Trip Type</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="Family Trip">Family Trip</option>
                    <option value="Solo Traveler">Solo Traveler</option>
                    <option value="Spiritual Pilgrimage">Spiritual Pilgrimage</option>
                    <option value="Wildlife Safari">Wildlife Safari</option>
                    <option value="Heritage & Architecture">Heritage &amp; Architecture</option>
                  </select>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer font-['Outfit',sans-serif]"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  RefreshCw,
  Search,
  Filter,
  Check,
  Clock,
  MapPin,
  Heart,
  ChevronDown,
  User,
} from 'lucide-react';
import type { TripReview, StarRating } from '@/lib/reviews/review-store';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<TripReview[]>([]);
  const [metrics, setMetrics] = useState<{
    totalReviews: number;
    averageRating: number;
    starDistribution: Record<StarRating, number>;
    pendingResponsesCount: number;
    resolvedCount: number;
    publishedCount: number;
  }>({
    totalReviews: 0,
    averageRating: 5.0,
    starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    pendingResponsesCount: 0,
    resolvedCount: 0,
    publishedCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedResponseStatus, setSelectedResponseStatus] = useState<string>('ALL');
  const [selectedDestination, setSelectedDestination] = useState<string>('');

  // Reply drawer / modal state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [markResolvedCheck, setMarkResolvedCheck] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fetchReviews = async () => {
    setLoading(true);
    setActionFeedback(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
          : null;

      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedRating > 0) params.append('rating', selectedRating.toString());
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedResponseStatus !== 'ALL') params.append('responseStatus', selectedResponseStatus);
      if (selectedDestination.trim()) params.append('destination', selectedDestination.trim());

      const res = await fetch(`/api/admin/reviews?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) setReviews(json.data);
        if (json.metrics) setMetrics(json.metrics);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedRating, selectedStatus, selectedResponseStatus, selectedDestination]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleModerate = async (reviewId: string, status: string) => {
    const reason = prompt(`Enter moderation reason for status ${status}:`, 'Verified travel review policy adherence.');
    if (reason === null) return;

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
          : null;

      const res = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, notes: reason }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback({ type: 'success', message: `Review status updated to ${status}.` });
        fetchReviews();
      } else {
        setActionFeedback({ type: 'error', message: data.message || 'Failed to moderate review.' });
      }
    } catch (e: any) {
      setActionFeedback({ type: 'error', message: e.message || 'Error updating review.' });
    }
  };

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      alert('Please enter an official response before sending.');
      return;
    }

    setSubmittingReply(true);
    setActionFeedback(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
          : null;

      const res = await fetch(`/api/admin/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: replyText.trim(),
          markResolved: markResolvedCheck,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionFeedback({ type: 'success', message: 'Official response sent and notification dispatched!' });
        setReplyingReviewId(null);
        setReplyText('');
        fetchReviews();
      } else {
        setActionFeedback({ type: 'error', message: data.error || 'Failed to send reply.' });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Error sending reply.' });
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <span>Customer Experience</span>
            <span>•</span>
            <span>Reputation &amp; Trust Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Customer Feedback &amp; Reviews Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Review post-trip feedback, send official responses to customer experiences, identify negative issues, and moderate verified ratings.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Notifications */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Real Database KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Reviews
          </span>
          <div className="text-2xl font-black text-slate-900">{metrics.totalReviews}</div>
          <div className="text-[11px] text-slate-500 font-medium">Authentic customer submissions</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Average Rating
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-amber-500">{metrics.averageRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Out of 5.0 Stars</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            5★ &amp; 4★ Ratings
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {(metrics.starDistribution[5] || 0) + (metrics.starDistribution[4] || 0)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">
            {metrics.starDistribution[5] || 0} (5★) • {metrics.starDistribution[4] || 0} (4★)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            1★–3★ Critical
          </span>
          <div className="text-2xl font-black text-rose-700">
            {(metrics.starDistribution[1] || 0) +
              (metrics.starDistribution[2] || 0) +
              (metrics.starDistribution[3] || 0)}
          </div>
          <div className="text-[11px] text-rose-600 font-bold">Requires attention</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Pending Responses
          </span>
          <div className="text-2xl font-black text-amber-600">{metrics.pendingResponsesCount}</div>
          <div className="text-[11px] text-amber-700 font-medium">Awaiting official reply</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Resolved Feedback
          </span>
          <div className="text-2xl font-black text-blue-700">{metrics.resolvedCount}</div>
          <div className="text-[11px] text-blue-600 font-medium">Addressed and closed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, destination, or review words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Rating filter */}
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
          >
            <option value={0}>All Ratings (1★-5★)</option>
            <option value={5}>5 Stars (Excellent)</option>
            <option value={4}>4 Stars (Great)</option>
            <option value={3}>3 Stars (Average)</option>
            <option value={2}>2 Stars (Poor)</option>
            <option value={1}>1 Star (Critical)</option>
          </select>

          {/* Response status filter */}
          <select
            value={selectedResponseStatus}
            onChange={(e) => setSelectedResponseStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
          >
            <option value="ALL">All Response Statuses</option>
            <option value="AWAITING_REPLY">Awaiting Reply</option>
            <option value="REPLIED">Replied</option>
            <option value="RESOLVED">Resolved</option>
            <option value="UNRESOLVED">Unresolved / Open</option>
          </select>

          {/* Moderation status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
          >
            <option value="ALL">All Moderation Statuses</option>
            <option value="PENDING_MODERATION">Pending Moderation</option>
            <option value="PUBLISHED">Published Publicly</option>
            <option value="HIDDEN">Hidden</option>
            <option value="SPAM">Marked Spam</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs font-semibold text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            Loading review records...
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs font-semibold text-slate-400">
            No reviews matching your filter criteria.
          </div>
        ) : (
          reviews.map((r) => {
            const isNegative = r.overallRating <= 2;
            const hasReply = Boolean(r.officialReply);
            const isReplying = replyingReviewId === r.id;

            return (
              <div
                key={r.id}
                className={`bg-white rounded-3xl border shadow-xs overflow-hidden transition ${
                  isNegative ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                      {r.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-sm">{r.customerName}</h3>
                        <span className="text-[10px] text-slate-500 font-mono">({r.customerEmail})</span>
                        {r.publicConsent && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Public Consent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="font-semibold text-slate-800">{r.destination}</span>
                        <span>•</span>
                        <span>Trip ID: {r.tripId.slice(0, 12)}</span>
                        <span>•</span>
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Overall Star Badge */}
                    <div
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs ${
                        r.overallRating >= 4
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : r.overallRating === 3
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-300 animate-pulse'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                      <span>{r.overallRating} / 5 Stars</span>
                    </div>

                    {/* Moderation Status Pill */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        r.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.status === 'PENDING_MODERATION'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : r.status === 'SPAM'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Written Review */}
                  <div className="text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    &ldquo;{r.writtenReview}&rdquo;
                  </div>

                  {/* Highlights and Improvement Chips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {r.positiveHighlights && r.positiveHighlights.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Loved By Customer
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {r.positiveHighlights.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                            >
                              ✓ {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.improvementSuggestions && r.improvementSuggestions.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Improvement Suggestions
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {r.improvementSuggestions.map((i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold"
                            >
                              • {i}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category Ratings Breakdown */}
                  {r.categoryRatings && Object.keys(r.categoryRatings).length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Category Scores
                      </span>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {Object.entries(r.categoryRatings).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                          >
                            <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-black text-amber-600">{v}★</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attached Photos */}
                  {r.photos && r.photos.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Customer Photographs ({r.photos.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {r.photos.map((p) => (
                          <div
                            key={p.id}
                            className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
                          >
                            <img src={p.url} alt={p.caption || 'Traveler photo'} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversation Thread & Official Reply */}
                  {r.repliesThread && r.repliesThread.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Conversation Thread ({r.repliesThread.length})
                      </span>
                      <div className="space-y-2">
                        {r.repliesThread.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-2xl text-xs space-y-1 max-w-xl ${
                              msg.sender === 'ADMIN'
                                ? 'bg-blue-50/80 border border-blue-200 ml-auto'
                                : 'bg-slate-100 border border-slate-200 mr-auto'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                              <span>
                                {msg.sender === 'ADMIN' ? '🛡️ Official BharatYatra Response' : '👤 Customer Reply'} (
                                {msg.senderName})
                              </span>
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-800 font-medium leading-relaxed">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Reply Box if toggled */}
                  {isReplying && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-blue-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900">
                          Draft Official BharatYatra Response to {r.customerName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyingReviewId(null)}
                          className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Dear ${r.customerName}, thank you for your feedback...`}
                        className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={markResolvedCheck}
                            onChange={(e) => setMarkResolvedCheck(e.target.checked)}
                            className="rounded text-blue-600 border-slate-300"
                          />
                          <span>Mark this feedback as resolved</span>
                        </label>
                        <button
                          type="button"
                          disabled={submittingReply}
                          onClick={() => handleSendReply(r.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingReply ? 'Sending...' : 'Send Official Response'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      {!isReplying && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(r.id);
                            setReplyText(
                              r.officialReply
                                ? `Thank you for the update, ${r.customerName}. `
                                : `Dear ${r.customerName}, thank you for choosing BharatYatra. `
                            );
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>{hasReply ? 'Post Follow-up Reply' : 'Send Official Reply'}</span>
                        </button>
                      )}

                      {r.isResolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <Check className="w-3 h-3" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                          <Clock className="w-3 h-3" /> In Progress
                        </span>
                      )}
                    </div>

                    {/* Moderation Controls */}
                    <div className="flex items-center gap-1.5">
                      {r.status !== 'PUBLISHED' && (
                        <button
                          type="button"
                          onClick={() => handleModerate(r.id, 'PUBLISHED')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs transition"
                        >
                          Publish Publicly
                        </button>
                      )}
                      {r.status !== 'HIDDEN' && (
                        <button
                          type="button"
                          onClick={() => handleModerate(r.id, 'HIDDEN')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition"
                        >
                          Hide
                        </button>
                      )}
                      {r.status !== 'SPAM' && (
                        <button
                          type="button"
                          onClick={() => handleModerate(r.id, 'SPAM')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-lg text-xs transition"
                        >
                          Spam
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

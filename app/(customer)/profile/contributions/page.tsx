'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import type { PlaceSubmissionSummary, SubmissionStatus, PlaceCategory } from '@/lib/contributions/types';
import { PLACE_CATEGORIES } from '@/lib/contributions/types';

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string; icon: string }
> = {
  PENDING: {
    label: 'Submitted (Pending Review)',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: 'hourglass_empty',
  },
  IN_REVIEW: {
    label: 'Under Active Review',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: 'search_check',
  },
  UNDER_REVIEW: {
    label: 'Under Active Review',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: 'search_check',
  },
  CHANGES_REQUESTED: {
    label: 'Action Required: Revisions Requested',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-300',
    dot: 'bg-orange-500 animate-ping',
    icon: 'edit_note',
  },
  APPROVED: {
    label: 'Approved & Published Live',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: 'verified',
  },
  REJECTED: {
    label: 'Not Approved',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: 'cancel',
  },
};

export default function UserContributionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [submissions, setSubmissions] = useState<PlaceSubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<PlaceSubmissionSummary | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/contributions');
      if (res.status === 401) {
        router.push('/login?redirect=/profile/contributions');
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Failed to load contributions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile/contributions');
      return;
    }
    if (user) {
      fetchContributions();
    }
  }, [user, authLoading, router]);

  const handleWithdraw = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to withdraw "${name}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/v1/contributions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to withdraw contribution');
      }
      setActionMessage({ type: 'success', text: `Contribution "${name}" successfully withdrawn.` });
      setSubmissions((prev) => prev.filter((p) => p.id !== id));
      if (activeItem?.id === id) setActiveItem(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error withdrawing place';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === 'PENDING').length,
    in_review: submissions.filter((s) => s.status === 'UNDER_REVIEW' || (s.status as string) === 'IN_REVIEW').length,
    changes_requested: submissions.filter((s) => s.status === 'CHANGES_REQUESTED').length,
    approved: submissions.filter((s) => s.status === 'APPROVED').length,
    rejected: submissions.filter((s) => s.status === 'REJECTED').length,
  };

  const filtered = submissions.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  if (authLoading || (loading && submissions.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold">Loading your travel contributions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-slate-50 to-white pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/profile" className="hover:text-slate-900 transition-colors">Profile</Link>
                <span>/</span>
                <span className="text-amber-600 font-bold">My Contributions</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>My Contributed Places</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                  {submissions.length} Total
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Back to Profile
              </Link>
              <Link
                href="/places/add"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Contribute New Place</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Status Action Banner */}
        {actionMessage && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="text-xs underline hover:no-underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Counter KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'ALL', label: 'All Places', count: counts.all, color: 'text-slate-900', border: 'border-slate-200' },
            { key: 'PENDING', label: 'Pending', count: counts.pending, color: 'text-amber-600', border: 'border-amber-200' },
            { key: 'IN_REVIEW', label: 'In Review', count: counts.in_review, color: 'text-blue-600', border: 'border-blue-200' },
            { key: 'CHANGES_REQUESTED', label: 'Revisions', count: counts.changes_requested, color: 'text-orange-600', border: 'border-orange-200' },
            { key: 'APPROVED', label: 'Approved', count: counts.approved, color: 'text-emerald-600', border: 'border-emerald-200' },
            { key: 'REJECTED', label: 'Not Approved', count: counts.rejected, color: 'text-rose-600', border: 'border-rose-200' },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setFilterStatus(pill.key)}
              className={`p-3.5 rounded-2xl bg-white border text-left transition-all ${
                filterStatus === pill.key
                  ? 'border-amber-500 shadow-md ring-2 ring-amber-400/20'
                  : `${pill.border} hover:border-slate-300 shadow-xs`
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500 truncate">{pill.label}</div>
              <div className={`text-2xl font-black mt-1 ${pill.color}`}>{pill.count}</div>
            </button>
          ))}
        </div>

        {/* Informational Guidance Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5">verified_user</span>
          <div className="text-xs text-slate-700 leading-relaxed space-y-1">
            <span className="font-extrabold text-slate-900">How BharatYatra Verification Works: </span>
            Submissions are systematically checked for geographical accuracy, duplicate listings, and genuine travel quality. Once approved, the location is published live across the Explore directory, Interactive Maps, Search, and AI Trip Planner with full contributor attribution.
          </div>
        </div>

        {/* Content Section */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">map</span>
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">No contributions found</h3>
              <p className="text-xs text-slate-500">
                {filterStatus === 'ALL'
                  ? 'You have not submitted any destinations yet. Be the first to share an uncharted gem with travelers across India!'
                  : `You have no places matching status: ${filterStatus.replace(/_/g, ' ')}`}
              </p>
            </div>
            <Link
              href="/places/add"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-sm">add_location_alt</span>
              <span>Add Your First Place</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
              const categoryMeta = PLACE_CATEGORIES[item.category as PlaceCategory];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                      {item.primary_photo_url ? (
                        <Image
                          src={item.primary_photo_url}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                          <span className="material-symbols-outlined text-3xl">image</span>
                          <span className="text-xs font-semibold">No Image Provided</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} shadow-sm`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                          <span>{statusCfg.label}</span>
                        </span>
                      </div>

                      {/* Photo Count */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/70 text-white backdrop-blur-md">
                          <span className="material-symbols-outlined text-xs">photo_camera</span>
                          <span>{item.photo_count} photos</span>
                        </span>
                      </div>

                      {/* Category Pill */}
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/90 text-slate-800 backdrop-blur-md shadow-xs">
                          <span>{categoryMeta?.icon || '📍'}</span>
                          <span>{categoryMeta?.label || item.category}</span>
                        </span>
                      </div>
                    </div>

                    {/* Details Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-snug tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                          <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                          <span>
                            {item.city ? `${item.city}, ` : ''}{item.district ? `${item.district}, ` : ''}{item.state}
                          </span>
                        </p>
                      </div>

                      {/* Revision Request / Rejection Reason Box */}
                      {item.rejection_reason && (
                        <div className={`p-3 rounded-2xl text-xs space-y-1 ${
                          item.status === 'CHANGES_REQUESTED'
                            ? 'bg-orange-50 border border-orange-200 text-orange-950'
                            : 'bg-rose-50 border border-rose-200 text-rose-950'
                        }`}>
                          <div className="font-black flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">info</span>
                            <span>{item.status === 'CHANGES_REQUESTED' ? 'Reviewer Feedback (Action Required):' : 'Rejection Reason:'}</span>
                          </div>
                          <p className="leading-relaxed font-medium">{item.rejection_reason}</p>
                        </div>
                      )}

                      {/* Submission Metadata */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                        <span>Submitted: {new Date(item.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {item.approved_at && (
                          <span className="text-emerald-600 font-bold">
                            Published: {new Date(item.approved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Action when changes requested */}
                      {item.status === 'CHANGES_REQUESTED' && (
                        <Link
                          href={`/places/add?edit=${item.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>Update & Resubmit</span>
                        </Link>
                      )}

                      {/* Action when approved */}
                      {item.status === 'APPROVED' && item.approved_place_id && (
                        <Link
                          href={`/destinations/${item.approved_place_id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1"
                          target="_blank"
                        >
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                          <span>View Live Page</span>
                        </Link>
                      )}

                      {/* Action when pending */}
                      {item.status === 'PENDING' && (
                        <Link
                          href={`/places/add?edit=${item.id}`}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-all"
                        >
                          Edit Details
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Withdraw for Pending */}
                      {item.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleWithdraw(item.id, item.name)}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading === item.id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

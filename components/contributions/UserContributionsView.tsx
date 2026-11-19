'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  MapPin,
  MapPinPlus,
  Compass,
  Sparkles,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import type { PlaceSubmissionSummary, ContributionStatus, ContributionCategory } from '@/lib/contributions/types';
import { PLACE_CATEGORIES } from '@/lib/contributions/types';

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string; icon: string; description: string }
> = {
  PENDING: {
    label: 'PENDING',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: 'hourglass_empty',
    description: 'Waiting for review',
  },
  IN_REVIEW: {
    label: 'UNDER REVIEW',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: 'search_check',
    description: 'Admin is checking the submission',
  },
  UNDER_REVIEW: {
    label: 'UNDER REVIEW',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: 'search_check',
    description: 'Admin is checking the submission',
  },
  CHANGES_REQUESTED: {
    label: 'CHANGES REQUESTED',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-300',
    dot: 'bg-orange-500 animate-ping',
    icon: 'edit_note',
    description: 'Action required: user needs to update information',
  },
  APPROVED: {
    label: 'APPROVED',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: 'verified',
    description: 'Destination is published live across BharatYatra',
  },
  REJECTED: {
    label: 'REJECTED',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: 'cancel',
    description: 'Submission was not accepted',
  },
};

interface UserContributionsViewProps {
  originPath?: 'dashboard' | 'profile';
}

export default function UserContributionsView({ originPath = 'dashboard' }: UserContributionsViewProps) {
  const { user, token: authToken, loading: authLoading } = useAuth();
  const router = useRouter();

  const getAuthToken = () => {
    return (
      authToken ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('auth_token') ||
          localStorage.getItem('sb_auth_token') ||
          localStorage.getItem('admin_token')
        : null)
    );
  };

  const [submissions, setSubmissions] = useState<PlaceSubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [inspectSubmission, setInspectSubmission] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/contributions', { headers });
      if (res.status === 401) {
        router.push(`/login?redirect=${originPath === 'dashboard' ? '/dashboard/my-contributions' : '/profile/contributions'}`);
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
      router.push(`/login?redirect=${originPath === 'dashboard' ? '/dashboard/my-contributions' : '/profile/contributions'}`);
      return;
    }
    if (user) {
      fetchContributions();
    }
  }, [user, authLoading]);

  const handleWithdraw = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to withdraw "${name}"? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(id);
    setActionMessage(null);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/contributions/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to withdraw contribution');
      }
      setActionMessage({ type: 'success', text: `Contribution "${name}" successfully withdrawn.` });
      setSubmissions((prev) => prev.filter((p) => p.id !== id));
      if (inspectSubmission?.id === id) setInspectSubmission(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error withdrawing place';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDossier = async (id: string) => {
    setInspectLoading(true);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/contributions/${id}`, { headers });
      const data = await res.json();
      if (data.success && data.submission) {
        setInspectSubmission(data.submission);
      }
    } catch (err) {
      console.error('Failed to load submission details', err);
    } finally {
      setInspectLoading(false);
    }
  };

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === 'PENDING').length,
    under_review: submissions.filter((s) => s.status === 'UNDER_REVIEW' || (s.status as string) === 'IN_REVIEW').length,
    changes_requested: submissions.filter((s) => s.status === 'CHANGES_REQUESTED').length,
    approved: submissions.filter((s) => s.status === 'APPROVED').length,
    rejected: submissions.filter((s) => s.status === 'REJECTED').length,
  };

  const filtered = submissions.filter((s) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'UNDER_REVIEW') return s.status === 'UNDER_REVIEW' || (s.status as string) === 'IN_REVIEW';
    return s.status === filterStatus;
  });

  const contributeUrl = originPath === 'dashboard' ? '/dashboard/contribute-place' : '/places/add';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 pb-20">
      {/* Sub-Header Breadcrumb Bar */}
      <div className="w-full border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            {originPath === 'dashboard' ? (
              <>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
                <span>/</span>
              </>
            ) : (
              <>
                <Link href="/profile" className="hover:text-slate-900 transition-colors">Profile</Link>
                <span>/</span>
              </>
            )}
            <span className="text-amber-700 font-extrabold">My Contributions</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchContributions}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              href={contributeUrl}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
            >
              <MapPinPlus className="w-3.5 h-3.5" />
              <span>Contribute a Place</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Traveler Contribution Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Contributed Places
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl">
              Track the verification status of your contributed tourist places, view moderator recommendations, edit requested changes, and see published destinations live on BharatYatra.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[200px] text-center space-y-1">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Total Submissions</div>
            <div className="text-3xl font-black text-amber-300">{submissions.length}</div>
            <div className="text-[10px] text-slate-400 font-medium">Credited to your profile</div>
          </div>
        </div>

        {/* Action Message Banner */}
        {actionMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button type="button" onClick={() => setActionMessage(null)} className="text-xs underline cursor-pointer ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Status Counters KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'ALL', label: 'All Places', count: counts.all, color: 'text-slate-900', border: 'border-slate-200' },
            { key: 'PENDING', label: 'PENDING', count: counts.pending, color: 'text-amber-600', border: 'border-amber-200' },
            { key: 'UNDER_REVIEW', label: 'UNDER REVIEW', count: counts.under_review, color: 'text-blue-600', border: 'border-blue-200' },
            { key: 'CHANGES_REQUESTED', label: 'CHANGES REQUESTED', count: counts.changes_requested, color: 'text-orange-600', border: 'border-orange-200' },
            { key: 'APPROVED', label: 'APPROVED', count: counts.approved, color: 'text-emerald-600', border: 'border-emerald-200' },
            { key: 'REJECTED', label: 'REJECTED', count: counts.rejected, color: 'text-rose-600', border: 'border-rose-200' },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setFilterStatus(pill.key)}
              className={`p-3.5 rounded-2xl bg-white border text-left transition-all cursor-pointer ${
                filterStatus === pill.key
                  ? 'border-amber-500 shadow-md ring-2 ring-amber-400/20'
                  : `${pill.border} hover:border-slate-300 shadow-xs`
              }`}
            >
              <div className="text-[11px] font-black text-slate-500 truncate">{pill.label}</div>
              <div className={`text-2xl font-black mt-1 ${pill.color}`}>{pill.count}</div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <MapPinPlus className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">No destinations found</h3>
              <p className="text-xs text-slate-500">
                {filterStatus === 'ALL'
                  ? 'You haven’t contributed any travel destinations yet. Share an uncharted temple, waterfall, heritage site, or viewpoint with travelers across India!'
                  : `You currently have no submissions under status: ${filterStatus.replace(/_/g, ' ')}.`}
              </p>
            </div>
            <Link
              href={contributeUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs shadow-md transition-all"
            >
              <MapPinPlus className="w-4 h-4" />
              <span>Contribute a Place Now</span>
            </Link>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
              const categoryMeta = PLACE_CATEGORIES[item.category as ContributionCategory];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Destination Image & Badges */}
                    <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                      {item.primary_photo_url ? (
                        <Image
                          src={item.primary_photo_url}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                          <MapPin className="w-8 h-8" />
                          <span className="text-[11px] font-bold">No Image Provided</span>
                        </div>
                      )}

                      {/* Status Indicator Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border backdrop-blur-md shadow-xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                          <span>{statusCfg.label}</span>
                        </span>
                      </div>

                      {/* Photo Count */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900/75 text-white backdrop-blur-md">
                          <span>{item.photo_count} photos</span>
                        </span>
                      </div>

                      {/* Category Pill */}
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/95 text-slate-900 shadow-xs">
                          <span>{categoryMeta?.icon || '📍'}</span>
                          <span>{categoryMeta?.label || item.category}</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {item.city ? `${item.city}, ` : ''}{item.district ? `${item.district}, ` : ''}{item.state}
                          </span>
                        </p>
                      </div>

                      {/* Status Meaning Explainer Box */}
                      <div className="text-[11px] text-slate-500 font-medium">
                        <strong>Status: </strong>{statusCfg.description}
                      </div>

                      {/* Admin Feedback / Rejection Reason (Critical Requirement) */}
                      {(item.rejection_reason || item.admin_feedback) && (
                        <div
                          className={`p-3 rounded-2xl text-xs space-y-1 ${
                            item.status === 'CHANGES_REQUESTED'
                              ? 'bg-orange-50 border border-orange-200 text-orange-950'
                              : 'bg-rose-50 border border-rose-200 text-rose-950'
                          }`}
                        >
                          <div className="font-black flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {item.status === 'CHANGES_REQUESTED' ? 'Admin Feedback (Action Required):' : 'Moderation Note:'}
                            </span>
                          </div>
                          <p className="leading-relaxed font-medium pl-4">{item.admin_feedback || item.rejection_reason}</p>
                        </div>
                      )}

                      {/* Reward Coupon Card */}
                      {item.status === 'APPROVED' && (item.reward_coupon_code || (item as any).rewardCouponCode) && (
                        <div className="mb-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">🎁</span>
                            <div className="min-w-0">
                              <div className="text-[10px] uppercase font-black text-amber-800 tracking-wider">7% Contributor Reward</div>
                              <code className="text-xs font-black font-mono text-slate-900 bg-white/90 px-1.5 py-0.5 rounded border border-amber-300 block truncate">
                                {item.reward_coupon_code || (item as any).rewardCouponCode}
                              </code>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const code = item.reward_coupon_code || (item as any).rewardCouponCode || '';
                              navigator.clipboard.writeText(code);
                              alert(`Coupon ${code} copied! Apply at checkout for 7% off your next booking.`);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
                          >
                            Copy
                          </button>
                        </div>
                      )}

                      {/* Dates Ledger */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
                        <span>Submitted: {new Date(item.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {item.approved_at && (
                          <span className="text-emerald-700 font-bold">
                            Live: {new Date(item.approved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* View Details Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => handleOpenDossier(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Details</span>
                      </button>

                      {/* Edit when Changes Requested */}
                      {item.status === 'CHANGES_REQUESTED' && (
                        <Link
                          href={`${contributeUrl}?edit=${item.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit &amp; Resubmit</span>
                        </Link>
                      )}

                      {/* View Live Destination when Approved */}
                      {item.status === 'APPROVED' && item.approved_place_id && (
                        <Link
                          href={`/destinations/${item.approved_place_id}`}
                          target="_blank"
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Live</span>
                        </Link>
                      )}
                    </div>

                    <div>
                      {/* Withdraw Eligible Pending Submission */}
                      {item.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleWithdraw(item.id, item.name)}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                          title="Withdraw pending submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{actionLoading === item.id ? 'Withdrawing...' : 'Withdraw'}</span>
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

      {/* INSPECT DETAILS MODAL */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${STATUS_CONFIG[inspectSubmission.status]?.bg} ${STATUS_CONFIG[inspectSubmission.status]?.text}`}>
                  {STATUS_CONFIG[inspectSubmission.status]?.label}
                </span>
                <h3 className="text-base font-black text-slate-900">{inspectSubmission.placeName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectSubmission(null)}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Photo preview */}
              {inspectSubmission.photos && inspectSubmission.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {inspectSubmission.photos.map((p: string, idx: number) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border">
                      <Image src={p} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {inspectSubmission.status === 'APPROVED' && (inspectSubmission.rewardCouponCode || inspectSubmission.reward_coupon_code) && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                      <span>🎁 7% Contributor Discount Reward Activated</span>
                    </div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      Code: <code className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-300">{inspectSubmission.rewardCouponCode || inspectSubmission.reward_coupon_code}</code>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const code = inspectSubmission.rewardCouponCode || inspectSubmission.reward_coupon_code;
                      navigator.clipboard.writeText(code);
                      alert(`Coupon ${code} copied!`);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    Copy Code
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <div className="font-black text-slate-900 text-sm">{inspectSubmission.placeName} ({inspectSubmission.category})</div>
                <div className="text-slate-500 font-semibold">{inspectSubmission.address || `${inspectSubmission.city}, ${inspectSubmission.state}`}</div>
                <div className="text-slate-400">GPS: {inspectSubmission.latitude}, {inspectSubmission.longitude}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">Short Summary:</div>
                <p className="text-slate-600 leading-relaxed">{inspectSubmission.shortDescription}</p>
                <div className="font-bold text-slate-800 pt-2 border-t">Detailed Description:</div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{inspectSubmission.detailedDescription}</p>
              </div>

              {inspectSubmission.travelTips && inspectSubmission.travelTips.length > 0 && (
                <div className="space-y-1">
                  <div className="font-bold text-slate-800">Travel Tips:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {inspectSubmission.travelTips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {inspectSubmission.rejectionReason && (
                <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Reviewer Feedback / Revision Notice:</span>
                  </div>
                  <p className="leading-relaxed font-medium">{inspectSubmission.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">ID: {inspectSubmission.id}</span>
              <button
                type="button"
                onClick={() => setInspectSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


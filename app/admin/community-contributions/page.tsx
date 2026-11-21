'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Share2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  User,
  Eye,
  Edit3,
  RotateCcw,
  Sparkles,
  Building,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import type {
  PlaceSubmissionSummary,
  PlaceSubmissionDossier,
  SubmissionStatus,
  PlaceCategory,
  ContributionStats
} from '@/lib/contributions/types';
import { PLACE_CATEGORIES } from '@/lib/contributions/types';
import { INDIAN_STATES_AND_UTS } from '@/components/destinations/AddDestinationModal';

const STATUS_PILLS: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  IN_REVIEW: { label: 'In Review', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  UNDER_REVIEW: { label: 'In Review', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  CHANGES_REQUESTED: { label: 'Revisions Requested', bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-300' },
  APPROVED: { label: 'Approved & Live', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
};

export default function AdminCommunityContributionsPage() {
  const [, startTransition] = useTransition();

  const getAdminToken = () => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('admin_token') ||
        localStorage.getItem('auth_token') ||
        localStorage.getItem('sb_auth_token')
      : null;
  };

  const [submissions, setSubmissions] = useState<PlaceSubmissionSummary[]>([]);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [sortFilter, setSortFilter] = useState<string>('NEWEST');

  // Modal / Drawer state
  const [selectedDossier, setSelectedDossier] = useState<PlaceSubmissionDossier | null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'DUPLICATE' | 'EDIT' | null>(null);
  const [feedbackError, setFeedbackError] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Editable fields inside dossier
  const [editFields, setEditFields] = useState<{
    name: string;
    category: PlaceCategory;
    description: string;
    state: string;
    city: string;
    entry_fee: string;
    timings: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (stateFilter !== 'ALL') params.set('state', stateFilter);
      if (sortFilter) params.set('sort', sortFilter);

      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/admin/contributions?${params.toString()}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch contributions');
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [statusFilter, categoryFilter, stateFilter, sortFilter]);

  const handleQuickAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    let notes = '';
    if (action === 'REJECT') {
      const reason = window.prompt('Enter rejection reason for contributor:');
      if (!reason || !reason.trim()) return;
      notes = reason.trim();
    } else {
      if (!window.confirm('Quick Approve this destination and publish globally to BharatYatra?')) return;
      notes = 'Quick approved by administrator.';
    }

    try {
      const token = getAdminToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/admin/contributions/${id}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, notes, feedback: notes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Quick action failed');
        return;
      }
      fetchList();
    } catch (err: any) {
      alert(err.message || 'Error executing quick action');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList();
  };

  const openDossier = async (id: string) => {
    setDossierLoading(true);
    setFeedbackError('');
    setActionSuccessMsg('');
    setActionType(null);
    setFeedbackInput('');
    try {
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/admin/contributions/${id}`, { headers });
      const data = await res.json();
      if (data.success && data.dossier) {
        setSelectedDossier(data.dossier);
        setEditFields({
          name: data.dossier.submission.name,
          category: data.dossier.submission.category,
          description: data.dossier.submission.description,
          state: data.dossier.submission.state,
          city: data.dossier.submission.city || '',
          entry_fee: data.dossier.submission.entry_fee || '',
          timings: data.dossier.submission.timings || '',
          latitude: data.dossier.submission.latitude,
          longitude: data.dossier.submission.longitude,
        });
      }
    } catch (err) {
      console.error('Failed to open dossier', err);
    } finally {
      setDossierLoading(false);
    }
  };

  const executeAction = async (action: 'CLAIM_REVIEW' | 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'DUPLICATE' | 'EDIT') => {
    if (!selectedDossier) return;
    setFeedbackError('');

    if ((action === 'REQUEST_CHANGES' || action === 'REJECT') && !feedbackInput.trim()) {
      setFeedbackError(`Please provide detailed feedback for ${action === 'REJECT' ? 'rejection' : 'revision request'}.`);
      return;
    }

    try {
      setActionLoading(true);
      const payload: any = { action };
      if (feedbackInput.trim()) {
        payload.feedback = feedbackInput.trim();
        payload.notes = feedbackInput.trim();
      }
      if (action === 'EDIT' && editFields) {
        payload.editedFields = editFields;
        payload.modifications = editFields;
      }

      const token = getAdminToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/admin/contributions/${selectedDossier.submission.id}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Action execution failed');
      }

      setActionSuccessMsg(data.message || `Action "${action}" completed successfully.`);
      // Refresh current dossier
      await openDossier(selectedDossier.submission.id);
      // Refresh background list
      fetchList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing action';
      setFeedbackError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-100 text-amber-700">
              <Share2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-700">
              Travel Moderation Desk
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Community Destination Review Center
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Review user-submitted places, verify geolocation coordinates, evaluate automated AI duplicate &amp; quality reports, request revisions, and publish approved destinations directly across BharatYatra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchList}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500">Total Submissions</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
            <div className="text-[11px] font-bold text-amber-600">Pending Review</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-xs">
            <div className="text-[11px] font-bold text-blue-600">Under Review</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats.underReview ?? (stats as any).in_review ?? 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-orange-200 shadow-xs">
            <div className="text-[11px] font-bold text-orange-600">Revisions Requested</div>
            <div className="text-2xl font-black text-orange-600 mt-1">{stats.changesRequested ?? (stats as any).changes_requested ?? 0}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
            <div className="text-[11px] font-bold text-emerald-600">Approved &amp; Live</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.approved}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs">
            <div className="text-[11px] font-bold text-rose-600">Rejected</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.rejected}</div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by destination name, city, state, or contributor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="px-3 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Categories (14)</option>
              {(Object.entries(PLACE_CATEGORIES) as [string, { label: string; icon: string }][]).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.icon} {meta.label}
                </option>
              ))}
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              aria-label="Filter by state"
              className="px-3 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 max-w-[170px]"
            >
              <option value="ALL">All States/UTs (36)</option>
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              aria-label="Sort submissions"
              className="px-3 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="NAME_ASC">Name A-Z</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-extrabold">
          {[
            { key: 'ALL', label: 'All Submissions' },
            { key: 'PENDING', label: 'Pending Review' },
            { key: 'IN_REVIEW', label: 'In Review' },
            { key: 'CHANGES_REQUESTED', label: 'Revisions Requested' },
            { key: 'APPROVED', label: 'Approved & Live' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <p className="text-sm font-bold text-slate-700">No submissions found</p>
            <p className="text-xs">Adjust your search query or status filter to see other places.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold">
                <tr>
                  <th className="py-3.5 px-4">Place / Destination</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Contributor</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {submissions.map((sub) => {
                  const statusCfg = STATUS_PILLS[sub.status] || STATUS_PILLS.PENDING;
                  const cat = PLACE_CATEGORIES[sub.category as PlaceCategory];

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden relative shrink-0">
                            {sub.primary_photo_url ? (
                              <Image
                                src={sub.primary_photo_url}
                                alt={sub.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <MapPin className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-slate-900">{sub.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <span>{sub.photo_count} photos</span>
                              {sub.is_hidden_gem && (
                                <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> Hidden Gem
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-[11px]">
                          <span>{cat?.icon || '📍'}</span>
                          <span>{cat?.label || sub.category}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold">{sub.state}</div>
                        <div className="text-[11px] text-slate-400">{sub.district || sub.city || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sub.contributor_name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{sub.contributor_email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(sub.submitted_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDossier(sub.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                            title="Open review dossier"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                          {sub.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickAction(sub.id, 'APPROVE')}
                                className="px-2 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-0.5 shadow-xs"
                                title="Quick Approve & Publish"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAction(sub.id, 'REJECT')}
                                className="px-2 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-0.5 shadow-xs"
                                title="Quick Reject"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Dossier Modal / Drawer */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-end">
          <div className="w-full max-w-4xl h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border ${
                    STATUS_PILLS[selectedDossier.submission.status]?.bg
                  } ${STATUS_PILLS[selectedDossier.submission.status]?.text} ${
                    STATUS_PILLS[selectedDossier.submission.status]?.border
                  }`}
                >
                  {STATUS_PILLS[selectedDossier.submission.status]?.label}
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  {selectedDossier.submission.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDossier(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Notification Banner */}
              {actionSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}
              {feedbackError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{feedbackError}</span>
                </div>
              )}

              {/* AI Verification Report */}
              {selectedDossier.ai_report && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                        AI-Assisted Verification Assessment
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        selectedDossier.ai_report.risk_level === 'LOW'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : selectedDossier.ai_report.risk_level === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      }`}
                    >
                      Risk Level: {selectedDossier.ai_report.risk_level} (Score: {selectedDossier.ai_report.risk_score}/100)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                      <div className="text-[11px] text-indigo-200 font-semibold">India GPS Bounds</div>
                      <div className="font-extrabold mt-0.5 text-white flex items-center gap-1">
                        {selectedDossier.ai_report.gps_within_india ? (
                          <span className="text-emerald-300 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Within India
                          </span>
                        ) : (
                          <span className="text-rose-300 flex items-center gap-0.5">
                            <XCircle className="w-3.5 h-3.5" /> Outside India
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                      <div className="text-[11px] text-indigo-200 font-semibold">Duplicate Check</div>
                      <div className="font-extrabold mt-0.5 text-white flex items-center gap-1">
                        {selectedDossier.ai_report.is_potential_duplicate ? (
                          <span className="text-rose-300 flex items-center gap-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Duplicate Alert!
                          </span>
                        ) : (
                          <span className="text-emerald-300 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Unique Location
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                      <div className="text-[11px] text-indigo-200 font-semibold">Text Quality Score</div>
                      <div className="font-extrabold mt-0.5 text-white">
                        {selectedDossier.ai_report.text_quality_score}/100
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10">
                      <div className="text-[11px] text-indigo-200 font-semibold">Image Sanity</div>
                      <div className="font-extrabold mt-0.5 text-white">
                        {selectedDossier.ai_report.image_sanity_passed ? 'Valid Photos' : 'Issues Detected'}
                      </div>
                    </div>
                  </div>

                  {/* Duplicate Candidates List */}
                  {selectedDossier.duplicate_candidates && selectedDossier.duplicate_candidates.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs space-y-2">
                      <div className="font-black text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Potential Existing Catalog Duplicates:</span>
                      </div>
                      <div className="space-y-1">
                        {selectedDossier.duplicate_candidates.map((cand: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-rose-200 bg-rose-900/30 p-2 rounded-xl">
                            <span>
                              <strong>{cand.existing_name}</strong> ({cand.existing_state})
                            </span>
                            <span className="font-bold text-amber-300">{Math.round(cand.similarity_score * 100)}% match</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flagged Issues */}
                  {selectedDossier.ai_report.flagged_issues.length > 0 && (
                    <div className="text-xs text-amber-200/90 space-y-1 bg-amber-950/40 p-3 rounded-2xl border border-amber-800/60">
                      <div className="font-bold text-amber-300">Flagged Items:</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {selectedDossier.ai_report.flagged_issues.map((issue: string, idx: number) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Gallery */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Submitted Photographs ({selectedDossier.photos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedDossier.photos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video group bg-slate-100"
                    >
                      <Image
                        src={photo.photo_url}
                        alt={photo.caption || 'Contribution photo'}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                      {photo.is_primary && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                          Primary
                        </div>
                      )}
                      <a
                        href={photo.photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Full</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributor Information */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Contributor Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold">Name: </span>
                    <span className="font-black text-slate-900">{selectedDossier.submission.contributor_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Email: </span>
                    <span className="font-bold text-slate-900">{selectedDossier.submission.contributor_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Type: </span>
                    <span className="font-bold text-slate-900">{selectedDossier.submission.contributor_type || 'Local Resident'}</span>
                  </div>
                </div>
              </div>

              {/* Destination Core Details (Editable) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Destination Information (Review &amp; Edit)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActionType(actionType === 'EDIT' ? null : 'EDIT')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{actionType === 'EDIT' ? 'Cancel Editing' : 'Edit Before Publishing'}</span>
                  </button>
                </div>

                {actionType === 'EDIT' && editFields ? (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Place Name</label>
                        <input
                          type="text"
                          value={editFields.name}
                          onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                          className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Category</label>
                        <select
                          value={editFields.category}
                          onChange={(e) => setEditFields({ ...editFields, category: e.target.value as PlaceCategory })}
                          className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold"
                        >
                          {(Object.entries(PLACE_CATEGORIES) as [string, { label: string; icon: string }][]).map(([key, meta]) => (
                            <option key={key} value={key}>{meta.icon} {meta.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">State</label>
                        <input
                          type="text"
                          value={editFields.state}
                          onChange={(e) => setEditFields({ ...editFields, state: e.target.value })}
                          className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">City / Town</label>
                        <input
                          type="text"
                          value={editFields.city}
                          onChange={(e) => setEditFields({ ...editFields, city: e.target.value })}
                          className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={editFields.description}
                        onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                        className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => executeAction('EDIT')}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs"
                      >
                        {actionLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400">Coordinates &amp; Location</div>
                      <div className="font-extrabold text-slate-900">
                        {selectedDossier.submission.latitude.toFixed(5)}, {selectedDossier.submission.longitude.toFixed(5)}
                      </div>
                      <div className="text-slate-600">
                        {selectedDossier.submission.address || `${selectedDossier.submission.city || ''}, ${selectedDossier.submission.state}`}
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${selectedDossier.submission.latitude},${selectedDossier.submission.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-amber-700 font-bold hover:underline mt-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Open in Google Maps</span>
                      </a>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400">Timings &amp; Entry</div>
                      <div className="text-slate-800">
                        <strong>Timings: </strong> {selectedDossier.submission.timings || 'Open all days / Not specified'}
                      </div>
                      <div className="text-slate-800">
                        <strong>Entry Fee: </strong> {selectedDossier.submission.entry_fee || 'Free'}
                      </div>
                      <div className="text-slate-800">
                        <strong>Ideal Duration: </strong> {selectedDossier.submission.ideal_duration || '2-3 Hours'}
                      </div>
                      <div className="text-slate-800">
                        <strong>Best Time: </strong> {selectedDossier.submission.best_season || 'October to March'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Description & History */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-black text-slate-800">Detailed Description</div>
                  <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {selectedDossier.submission.description}
                  </p>
                  {selectedDossier.submission.historical_significance && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="font-bold text-slate-800">Historical Significance:</div>
                      <p className="text-slate-600 leading-relaxed mt-0.5">
                        {selectedDossier.submission.historical_significance}
                      </p>
                    </div>
                  )}
                  {selectedDossier.submission.travel_tips && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="font-bold text-slate-800">Traveler Tips:</div>
                      <p className="text-slate-600 leading-relaxed mt-0.5">
                        {selectedDossier.submission.travel_tips}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review History Audit Trail */}
              {selectedDossier.reviews.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Moderation Audit Log
                  </h3>
                  <div className="space-y-2">
                    {selectedDossier.reviews.map((rev: any) => (
                      <div key={rev.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">{rev.reviewer_name} ({rev.action})</span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(rev.created_at).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {rev.feedback_to_user && (
                          <div className="text-slate-600">
                            <strong>Feedback: </strong> {rev.feedback_to_user}
                          </div>
                        )}
                        {rev.internal_notes && (
                          <div className="text-amber-800 text-[11px] italic">
                            Internal note: {rev.internal_notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Feedback Input if Requesting changes or rejecting */}
              {actionType && actionType !== 'EDIT' && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 block">
                    {actionType === 'APPROVE'
                      ? 'Publication Note (Optional):'
                      : actionType === 'REQUEST_CHANGES'
                      ? 'Action Required Feedback (Sent to Contributor):'
                      : actionType === 'DUPLICATE'
                      ? 'Duplicate Note & Linked Destination ID / Reason:'
                      : 'Rejection Reason (Sent to Contributor):'}
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder={
                      actionType === 'REQUEST_CHANGES'
                        ? 'e.g. Please clarify exact operating hours and upload at least one landscape orientation photo...'
                        : actionType === 'REJECT'
                        ? 'e.g. This destination is already registered or does not meet criteria...'
                        : actionType === 'DUPLICATE'
                        ? 'e.g. Marked as duplicate of verified catalog place: Somnath Temple (ID: somnath-temple)...'
                        : 'Optional notes...'
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  {selectedDossier.submission.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => executeAction('CLAIM_REVIEW')}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold transition-all"
                    >
                      Claim Review
                    </button>
                  )}
                  {selectedDossier.submission.status === 'APPROVED' && selectedDossier.submission.approved_place_id && (
                    <Link
                      href={`/destinations/${selectedDossier.submission.approved_place_id}`}
                      target="_blank"
                      className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Live Page</span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {actionType === 'APPROVE' ? (
                    <button
                      type="button"
                      onClick={() => executeAction('APPROVE')}
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{actionLoading ? 'Publishing...' : 'Confirm Approve & Publish'}</span>
                    </button>
                  ) : actionType === 'REQUEST_CHANGES' ? (
                    <button
                      type="button"
                      onClick={() => executeAction('REQUEST_CHANGES')}
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>{actionLoading ? 'Sending...' : 'Send Revision Request'}</span>
                    </button>
                  ) : actionType === 'REJECT' ? (
                    <button
                      type="button"
                      onClick={() => executeAction('REJECT')}
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{actionLoading ? 'Rejecting...' : 'Confirm Rejection'}</span>
                    </button>
                  ) : actionType === 'DUPLICATE' ? (
                    <button
                      type="button"
                      onClick={() => executeAction('DUPLICATE')}
                      disabled={actionLoading}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Layers className="w-4 h-4" />
                      <span>{actionLoading ? 'Marking Duplicate...' : 'Confirm Duplicate'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('REQUEST_CHANGES');
                          setFeedbackInput('');
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold transition-all"
                      >
                        Request Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('REJECT');
                          setFeedbackInput('');
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('DUPLICATE');
                          setFeedbackInput('');
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all"
                      >
                        Mark Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('APPROVE');
                          setFeedbackInput('');
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve &amp; Publish</span>
                      </button>
                    </>
                  )}
                  {actionType && (
                    <button
                      type="button"
                      onClick={() => setActionType(null)}
                      className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

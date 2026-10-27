'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Edit3,
  ExternalLink,
  Search,
  Filter,
  Send,
  Eye,
} from 'lucide-react';
import { TravelPackage } from '@/types/travel-partner';

export default function PartnerPackagesPage() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
      const headers: HeadersInit = agencyId ? { 'x-agency-id': agencyId } : {};
      const res = await fetch('/api/v1/partner/packages', { headers });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPackages(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handlePauseToggle = async (pkgId: string) => {
    setActionLoading(pkgId);
    setMessage(null);
    try {
      const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
      const headers: HeadersInit = agencyId ? { 'x-agency-id': agencyId } : {};
      const res = await fetch(`/api/v1/partner/packages/${pkgId}/pause`, { method: 'POST', headers });
      const json = await res.json();
      if (json.success) {
        setMessage(json.message);
        fetchPackages();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitForReview = async (pkgId: string) => {
    setActionLoading(pkgId);
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/partner/packages/${pkgId}/submit`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setMessage('Package successfully submitted for administrative review.');
        fetchPackages();
      } else {
        alert(json.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return {
          label: 'PUBLISHED (LIVE)',
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'PENDING_REVIEW':
        return {
          label: 'UNDER REVIEW',
          className: 'bg-[#FED65B]/10 text-[#FED65B] border-[#FED65B]/30',
        };
      case 'CHANGES_REQUESTED':
        return {
          label: 'CHANGES REQUESTED',
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'PAUSED':
        return {
          label: 'PAUSED',
          className: 'bg-slate-700 text-slate-300 border-slate-600',
        };
      case 'DRAFT':
      default:
        return {
          label: 'DRAFT',
          className: 'bg-slate-800 text-slate-400 border-slate-700',
        };
    }
  };

  const filtered = packages.filter((p) => {
    if (filterStatus !== 'ALL' && p.publicationStatus !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.destinationSummary.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Manage Tour Packages
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, update itineraries, submit packages for review, and pause active catalog listings.
          </p>
        </div>

        <Link
          href="/partner/packages/new"
          className="px-5 py-2.5 bg-[#FED65B] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Create New Package
        </Link>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or destination..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FED65B]"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['ALL', 'PUBLISHED', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'DRAFT', 'PAUSED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                filterStatus === st
                  ? 'bg-[#FED65B] text-slate-950 border-[#FED65B]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Table / List */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-8 h-8 border-2 border-[#FED65B] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-slate-400 font-semibold">Loading tour packages...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Tour Packages Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven&apos;t created any packages matching the selected filters yet.
            </p>
          </div>
          <Link
            href="/partner/packages/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FED65B] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400"
          >
            <PlusCircle className="w-4 h-4" /> Create Package
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((pkg) => {
            const badge = getStatusBadge(pkg.publicationStatus);
            const isBusy = actionLoading === pkg.id;

            return (
              <div
                key={pkg.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        ⏱️ {pkg.durationDays}D / {pkg.durationNights}N
                      </span>
                      <span className="text-[11px] text-slate-400">• {pkg.category}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">{pkg.title}</h3>
                    <p className="text-xs text-slate-400">{pkg.destinationSummary}</p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-lg font-black text-[#FED65B]">
                      ₹{pkg.discountedPrice || pkg.basePrice}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Per Person Quote</div>
                  </div>
                </div>

                {/* Feedback / Review Notes if any */}
                {pkg.adminReviewNotes && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl text-xs space-y-0.5">
                    <span className="font-bold text-amber-300">Reviewer Feedback:</span>
                    <p className="text-[11px] leading-relaxed">{pkg.adminReviewNotes}</p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-500">
                    Last updated {new Date(pkg.updatedAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Public preview if published */}
                    {pkg.publicationStatus === 'PUBLISHED' && (
                      <Link
                        href={`/packages/${pkg.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Live
                      </Link>
                    )}

                    {/* Pause or Resume */}
                    {(pkg.publicationStatus === 'PUBLISHED' || pkg.publicationStatus === 'PAUSED') && (
                      <button
                        onClick={() => handlePauseToggle(pkg.id)}
                        disabled={isBusy}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {pkg.publicationStatus === 'PAUSED' ? (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" /> Resume Live
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-amber-400" /> Pause Listing
                          </>
                        )}
                      </button>
                    )}

                    {/* Submit for review button */}
                    {(pkg.publicationStatus === 'DRAFT' || pkg.publicationStatus === 'CHANGES_REQUESTED') && (
                      <button
                        onClick={() => handleSubmitForReview(pkg.id)}
                        disabled={isBusy}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[11px] tracking-wider rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit for Review
                      </button>
                    )}

                    {/* Edit Wizard */}
                    <Link
                      href={`/partner/packages/${pkg.id}/edit`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#FED65B] font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Package
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

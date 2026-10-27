'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  PauseCircle,
  Eye,
  ArrowLeft,
  Calendar,
  IndianRupee,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TravelPackage } from '@/types/travel-partner';

export default function AdminPackageReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchPackage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/partner/packages/${id}`, {
        headers: { 'x-agency-id': 'agy-somnath-tours-01' },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPkg(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPackage();
  }, [id]);

  const handleDecision = async (decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' | 'PAUSE') => {
    setActionLoading(true);
    setActionMessage(null);

    let endpoint = '';
    let payload: any = { adminId: 'admin-operations-ops1', reviewNotes };

    if (decision === 'APPROVE') {
      endpoint = `/api/v1/admin/travel-packages/${id}/approve`;
    } else if (decision === 'REQUEST_CHANGES') {
      endpoint = `/api/v1/admin/travel-packages/${id}/request-changes`;
    } else if (decision === 'REJECT') {
      endpoint = `/api/v1/admin/travel-packages/${id}/reject`;
    } else if (decision === 'PAUSE') {
      endpoint = `/api/v1/admin/travel-packages/${id}/pause`;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message);
        fetchPackage();
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading package review dossier...
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center">
        <div className="text-base font-bold text-slate-900">Package Not Found</div>
        <Link href="/admin/travel-packages" className="text-xs text-blue-600 font-bold mt-2 inline-block">
          &larr; Back to Package List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <Link
          href="/admin/travel-packages"
          className="text-xs text-slate-500 hover:text-slate-900 font-bold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Packages List
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
          <span>✓ {actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Review Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 uppercase font-mono">
              Status: {pkg.publicationStatus}
            </span>
            <span className="text-xs text-slate-500">
              Supplied by <strong className="text-slate-800">{pkg.agencyName || 'Verified Partner'}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{pkg.title}</h1>
          <p className="text-xs text-slate-500">
            {pkg.durationDays} Days / {pkg.durationNights} Nights • {pkg.category} • Origin: {pkg.origin}
          </p>
        </div>

        {/* Action Decision Buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {pkg.publicationStatus !== 'PUBLISHED' && (
            <button
              onClick={() => handleDecision('APPROVE')}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve & Auto-Publish
            </button>
          )}

          <button
            onClick={() => handleDecision('REQUEST_CHANGES')}
            disabled={actionLoading}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" /> Request Changes
          </button>

          {pkg.publicationStatus === 'PUBLISHED' && (
            <button
              onClick={() => handleDecision('PAUSE')}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <PauseCircle className="w-4 h-4" /> Pause Package
            </button>
          )}

          {pkg.publicationStatus === 'PUBLISHED' && (
            <Link
              href={`/packages/${pkg.slug}`}
              target="_blank"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> View Public
            </Link>
          )}
        </div>
      </div>

      {/* Reviewer Feedback Notes Input */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-800">
          Reviewer Notes / Requested Changes:
        </label>
        <textarea
          rows={2}
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          placeholder="State specific corrections needed (e.g. adjust Day 2 itinerary, clarify hotel category)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
        />
      </div>

      {/* Package Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description & Itinerary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Package Description
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{pkg.description}</p>
          </div>

          {/* Structured Itinerary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" /> Day-by-Day Itinerary ({pkg.itinerary?.length || 0} Days)
            </h3>

            <div className="space-y-3">
              {pkg.itinerary?.map((day) => (
                <div key={day.dayNumber} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">
                      Day {day.dayNumber}: {day.title}
                    </span>
                    {day.accommodationDetails && (
                      <span className="text-slate-500 text-[11px]">🏨 {day.accommodationDetails}</span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{day.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Pricing & Inclusions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-500" /> Pricing & Capacity
            </h3>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Discounted Offer Price:</span>
              <span className="font-black text-slate-900 text-base">₹{pkg.discountedPrice || pkg.basePrice}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Original Base Price:</span>
              <span className="font-semibold text-slate-500 line-through">₹{pkg.basePrice}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Group Capacity:</span>
              <span className="font-bold text-slate-800">{pkg.minTravellers} to {pkg.maxTravellers} Guests</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Advance Cutoff:</span>
              <span className="font-bold text-slate-800">{pkg.bookingNoticeDays} Days Notice</span>
            </div>
          </div>

          {/* Inclusions */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Inclusions & Exclusions
            </h3>

            <div className="space-y-1">
              <span className="font-bold text-emerald-600 text-[11px] uppercase">Included:</span>
              {pkg.inclusions?.map((inc, i) => (
                <div key={i} className="text-slate-700">✓ {inc}</div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="font-bold text-rose-600 text-[11px] uppercase">Excluded:</span>
              {pkg.exclusions?.map((exc, i) => (
                <div key={i} className="text-slate-700">✕ {exc}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

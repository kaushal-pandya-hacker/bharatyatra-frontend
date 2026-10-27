'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileCheck2,
  ArrowRight,
  Search,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function ApplicationStatusPage() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [refNumber, setRefNumber] = useState(initialRef);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);

  useEffect(() => {
    if (initialRef) {
      handleLookup(initialRef, '');
    }
  }, [initialRef]);

  const handleLookup = async (lookupRef: string, lookupEmail: string) => {
    if (!lookupRef.trim()) {
      setError('Please enter your application reference number (e.g. BY-AGY-849201).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('ref', lookupRef.trim().toUpperCase());
      if (lookupEmail.trim()) {
        params.append('email', lookupEmail.trim());
      }

      const res = await fetch(`/api/v1/travel-partners/application-status?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Unable to find application with provided details.');
      }

      setApplicationData(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve application status.');
      setApplicationData(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(refNumber, email);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'APPROVED & ACTIVATED',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
        };
      case 'NEEDS_INFORMATION':
        return {
          label: 'CORRECTIONS REQUESTED',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
        };
      case 'REJECTED':
        return {
          label: 'APPLICATION REJECTED',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: ShieldAlert,
        };
      case 'SUSPENDED':
        return {
          label: 'ACCOUNT SUSPENDED',
          color: 'bg-slate-700/50 text-slate-300 border-slate-600',
          icon: ShieldAlert,
        };
      case 'PENDING_VERIFICATION':
      case 'SUBMITTED':
      default:
        return {
          label: 'UNDER ADMINISTRATIVE REVIEW',
          color: 'bg-[#FED65B]/10 text-[#FED65B] border-[#FED65B]/30',
          icon: Clock,
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-white text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block shadow-sm">
            Secure Status Verification
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Track Travel Partner Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Check the verification progress of your travel agency registration using your application reference ID.
          </p>
        </div>

        {/* Lookup Card */}
        <form
          onSubmit={onSubmit}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Application Reference Number *
              </label>
              <input
                type="text"
                required
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
                placeholder="e.g. BY-AGY-849201"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Registered Business Email (Optional verification)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@agencyname.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Status...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Check Application Status
              </>
            )}
          </button>
        </form>

        {/* Results Card */}
        {applicationData && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Agency File</span>
                <h3 className="text-xl font-bold text-slate-950">{applicationData.businessName}</h3>
                <p className="text-xs text-slate-500">
                  Ref: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{applicationData.referenceNumber}</span>
                </p>
              </div>

              {(() => {
                const badge = getStatusBadge(applicationData.verificationStatus);
                const Icon = badge.icon;
                return (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.color}`}>
                    <Icon className="w-4 h-4" /> {badge.label}
                  </span>
                );
              })()}
            </div>

            {/* Timeline Stepper */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Lifecycle Progress:</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    step: '1. Submitted',
                    active: true,
                    done: true,
                  },
                  {
                    step: '2. Verification',
                    active: applicationData.verificationStatus === 'PENDING_VERIFICATION' || applicationData.verificationStatus === 'SUBMITTED',
                    done: applicationData.verificationStatus === 'APPROVED',
                  },
                  {
                    step: '3. Approved & Live',
                    active: applicationData.verificationStatus === 'APPROVED',
                    done: applicationData.verificationStatus === 'APPROVED',
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold ${
                      s.done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : s.active
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {s.step}
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Notes */}
            {applicationData.informationRequestNotes && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Corrections Requested by Reviewer:
                </div>
                <p className="leading-relaxed">{applicationData.informationRequestNotes}</p>
              </div>
            )}

            {applicationData.rejectionReason && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Review Decision Notes:
                </div>
                <p className="leading-relaxed">{applicationData.rejectionReason}</p>
              </div>
            )}

            {/* Approved Next Steps */}
            {applicationData.verificationStatus === 'APPROVED' && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Partner Account Activated!
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Congratulations! Your agency has been verified and granted access to the private Partner Dashboard. You can now publish packages and view booking requests.
                </p>
                <Link
                  href="/partner/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                >
                  Enter Private Partner Dashboard &rarr;
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link href="/partners/register" className="text-xs text-slate-500 hover:text-slate-900 font-semibold">
                Submit another application &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

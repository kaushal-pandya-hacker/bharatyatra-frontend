'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Percent,
  Package,
  Layers,
  ExternalLink,
} from 'lucide-react';

export default function AdminTravelPartnerDossierPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'SUSPEND' | null>(null);
  const [notes, setNotes] = useState('');
  const [commissionRate, setCommissionRate] = useState(10.0);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/travel-partners/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setDossier(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDossier();
  }, [id]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAction) return;

    setSubmitting(true);
    setActionSuccess(null);

    let endpoint = '';
    let payload: any = { notes, adminId: 'admin-operations-ops1' };

    if (modalAction === 'APPROVE') {
      endpoint = `/api/v1/admin/travel-partners/${id}/approve`;
      payload.commissionRate = Number(commissionRate);
    } else if (modalAction === 'REJECT') {
      endpoint = `/api/v1/admin/travel-partners/${id}/reject`;
    } else if (modalAction === 'REQUEST_INFO') {
      endpoint = `/api/v1/admin/travel-partners/${id}/request-information`;
    } else if (modalAction === 'SUSPEND') {
      endpoint = `/api/v1/admin/travel-partners/${id}/suspend`;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setActionSuccess(json.message);
        setModalAction(null);
        setNotes('');
        fetchDossier();
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 space-y-2">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <div>Loading travel agency dossier...</div>
      </div>
    );
  }

  if (!dossier || !dossier.agency) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center">
        <div className="text-base font-bold text-slate-900">Agency Record Not Found</div>
        <Link href="/admin/travel-partners" className="text-xs text-blue-600 font-bold mt-2 inline-block">
          &larr; Back to partner list
        </Link>
      </div>
    );
  }

  const { agency, packages = [], ledger = [], auditLogs = [] } = dossier;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/admin/travel-partners"
          className="text-xs text-slate-500 hover:text-slate-900 font-bold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Partner Directory
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-2xl text-xs flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Header Dossier Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
              {agency.referenceNumber}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                agency.verificationStatus === 'APPROVED'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                  : agency.verificationStatus === 'SUSPENDED'
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-amber-500/10 text-amber-700 border-amber-500/30'
              }`}
            >
              {agency.verificationStatus}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{agency.businessName}</h1>
          <p className="text-xs text-slate-500">
            Entity: <strong className="text-slate-700 font-mono">{agency.businessType}</strong> • Operating out of{' '}
            <strong className="text-slate-700">{agency.city}, {agency.stateCode}</strong>
          </p>
        </div>

        {/* Action Decision Buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {agency.verificationStatus !== 'APPROVED' && (
            <button
              onClick={() => setModalAction('APPROVE')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Agency
            </button>
          )}

          <button
            onClick={() => setModalAction('REQUEST_INFO')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" /> Request Info
          </button>

          {agency.verificationStatus !== 'SUSPENDED' ? (
            <button
              onClick={() => setModalAction('SUSPEND')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Suspend Agency
            </button>
          ) : (
            <button
              onClick={() => setModalAction('APPROVE')}
              className="px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Reactivate Agency
            </button>
          )}

          {agency.verificationStatus !== 'REJECTED' && agency.verificationStatus !== 'APPROVED' && (
            <button
              onClick={() => setModalAction('REJECT')}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Reject
            </button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business & Representative info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" /> Authorized Contact
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Representative:</span>
              <span className="font-bold text-slate-800 text-sm">{agency.representativeName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Official Email:</span>
              <span className="font-mono text-slate-800">{agency.businessEmail}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Direct Phone:</span>
              <span className="font-mono text-slate-800">{agency.contactPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Physical Address:</span>
              <span className="text-slate-700">{agency.address}, {agency.city}, {agency.stateCode} - {agency.postalCode}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Years in Operation:</span>
              <span className="text-slate-700 font-bold">{agency.yearsInOperation} Years</span>
            </div>
          </div>
        </div>

        {/* Middle Column: Registration Identifiers & Verification Docs */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" /> Identifiers & Legal Compliance
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">GSTIN:</span>
              <span className="font-mono font-bold text-slate-800">
                {agency.registrationIdentifiers?.gstin || 'Not supplied / Unregistered'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">PAN Number:</span>
              <span className="font-mono font-bold text-slate-800">
                {agency.registrationIdentifiers?.pan || 'Not supplied'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Tourism Board Accreditation:</span>
              <span className="font-mono text-slate-800">
                {agency.registrationIdentifiers?.tourismRegNumber || 'Under Review'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Primary Operating Region:</span>
              <span className="text-slate-700 font-medium">
                {agency.serviceCoverage?.primaryRegion || 'Gujarat Circuits'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Commercial & Agreement Terms */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Percent className="w-4 h-4 text-blue-500" /> Commercial Contract
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Agreement Model:</span>
              <span className="font-bold text-slate-800">Option A: Commission-based Travel Marketplace</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Marketplace Commission:</span>
              <span className="font-bold text-emerald-600 text-sm">10.00% on Completed Bookings</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Monthly Guest Capacity:</span>
              <span className="text-slate-700 font-medium">{agency.commercialPreferences?.monthlyBookingCapacity || 50} Travellers</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Terms Acknowledged:</span>
              <span className="text-emerald-600 font-bold">✓ Executed electronically on registration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Belonging to This Agency */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-500" /> Tour Packages Supplied by this Agency ({packages.length})
        </h3>

        {packages.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No packages created by this agency yet.
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg: any) => (
              <div
                key={pkg.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{pkg.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {pkg.publicationStatus}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    {pkg.durationDays}D/{pkg.durationNights}N • {pkg.category} • {pkg.destinationSummary}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black text-slate-900">₹{pkg.discountedPrice || pkg.basePrice}</div>
                    <div className="text-[10px] text-slate-400">per person</div>
                  </div>
                  <Link
                    href={`/admin/travel-packages/${pkg.id}/review`}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold text-xs"
                  >
                    Review Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {modalAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">
              {modalAction === 'APPROVE' && 'Approve & Activate Agency Partner'}
              {modalAction === 'REJECT' && 'Reject Agency Registration'}
              {modalAction === 'REQUEST_INFO' && 'Request Corrections / Documents'}
              {modalAction === 'SUSPEND' && 'Suspend Partner Account'}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              {modalAction === 'APPROVE' && 'Approving this agency grants immediate private partner dashboard access and permits package publishing.'}
              {modalAction === 'SUSPEND' && 'Suspension immediately suppresses all published tour packages from the public marketplace.'}
              {modalAction === 'REQUEST_INFO' && 'Enter actionable correction notes to notify the agency representative.'}
              {modalAction === 'REJECT' && 'State the rationale for rejection. An official notification will be transmitted.'}
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              {modalAction === 'APPROVE' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agreed Commission Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reviewer Decision Notes</label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter decision rationale or requested updates..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

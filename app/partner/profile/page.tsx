'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { TravelAgency } from '@/types/travel-partner';

export default function PartnerProfilePage() {
  const [agency, setAgency] = useState<TravelAgency | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form Fields
  const [representativeName, setRepresentativeName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  useEffect(() => {
    const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
    const headers: HeadersInit = agencyId ? { 'x-agency-id': agencyId } : {};
    fetch('/api/v1/partner/profile', { headers })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const a: TravelAgency = json.data;
          setAgency(a);
          setRepresentativeName(a.representativeName);
          setContactPhone(a.contactPhone);
          setAddress(a.address);
          setCity(a.city);
          setPostalCode(a.postalCode);
          setWebsiteUrl(a.websiteUrl || '');
          setBusinessDescription(a.businessDescription);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const agencyId = typeof window !== 'undefined' ? localStorage.getItem('partner_agency_id') : '';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(agencyId ? { 'x-agency-id': agencyId } : {}),
      };
      const res = await fetch('/api/v1/partner/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          representativeName,
          contactPhone,
          address,
          city,
          postalCode,
          websiteUrl,
          businessDescription,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage('Agency profile updated successfully.');
        setAgency(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-xs text-slate-400">Loading agency profile...</div>;
  }

  if (!agency) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Agency Business Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your operational contact information, office locations, and public branding.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Verification Card (Read-only security protection) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Registration Reference
          </span>
          <div className="text-sm font-mono font-bold text-[#FED65B]">{agency.referenceNumber}</div>
          <div className="text-xs text-slate-300 font-semibold mt-0.5">{agency.businessName}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase">Verification Status</div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {agency.verificationStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building2 className="w-4 h-4 text-[#FED65B]" /> Editable Contact & Address Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Authorized Representative *</label>
            <input
              type="text"
              required
              value={representativeName}
              onChange={(e) => setRepresentativeName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Direct Contact Phone *</label>
            <input
              type="tel"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Headquarters City *</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Postal Code</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Office Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Website</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Agency Overview & Biography</label>
            <textarea
              rows={3}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#FED65B] hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

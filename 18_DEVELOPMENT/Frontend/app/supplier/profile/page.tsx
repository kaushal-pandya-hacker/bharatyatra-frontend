'use client';

import React, { useEffect, useState } from 'react';
import { getBaseUrl } from '@/lib/api/client';

export default function SupplierProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    phoneNumber: '',
    city: '',
    gstin: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-supplier-id'] = 'supp_001';
      }

      const res = await fetch(`${getBaseUrl()}/suppliers/me`, { headers });
      const json = await res.json();

      if (json.success && json.data) {
        setProfile(json.data);
        setFormData({
          companyName: json.data.companyName || json.data.businessName || '',
          phoneNumber: json.data.phone || json.data.phoneNumber || '',
          city: json.data.city || 'Somnath',
          gstin: json.data.legalName || '',
        });
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('chalo_farva_supplier_token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-supplier-id'] = 'supp_001';
      }

      const res = await fetch(`${getBaseUrl()}/suppliers/me`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success && json.data) {
        setProfile(json.data);
        setMessage('Supplier business profile updated successfully.');
        localStorage.setItem('chalo_farva_supplier', JSON.stringify(json.data));
      } else {
        throw new Error(json.message || 'Update failed');
      }
    } catch (err: any) {
      setMessage(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm text-slate-400">Loading business profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-heading text-slate-100">Supplier Business Profile</h1>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
            {profile?.verificationStatus || 'VERIFIED'}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Manage your verified travel business identity, contact information, and registration metadata.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs rounded-xl flex items-center gap-2">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company / Property Title</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Contact Phone</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Operating City / Region</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Legal Name / GSTIN Metadata</label>
          <input
            type="text"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

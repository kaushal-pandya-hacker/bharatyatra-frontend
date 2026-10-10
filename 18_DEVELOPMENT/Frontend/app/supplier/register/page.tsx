'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBaseUrl } from '@/lib/api/client';

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: 'HOTEL',
    email: '',
    password: '',
    phoneNumber: '',
    gstin: '',
    city: 'Somnath',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getBaseUrl()}/suppliers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Registration failed');
      }

      const token = resData.token || resData.data?.token;
      const supplier = resData.supplier || resData.data?.supplier;

      localStorage.setItem('chalo_farva_supplier_token', token);
      localStorage.setItem('chalo_farva_supplier', JSON.stringify(supplier));

      router.push('/supplier/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create supplier account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-block p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-1">
          🏢
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-100">Register B2B Travel Supplier</h1>
        <p className="text-xs text-slate-400">Join Gujarat&apos;s AI travel marketplace for Hotels, Buses & Experiences</p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business / Company Name *</label>
          <input
            type="text"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Lords Resort Somnath"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
            <select
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
            >
              <option value="HOTEL">Hotel & Resort</option>
              <option value="BUS">Bus & Transit Operator</option>
              <option value="RESTAURANT">Restaurant & Dining</option>
              <option value="ACTIVITY">Activity & Tour Guide</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">City / Location *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Somnath / Ahmedabad"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@lordsresort.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">GSTIN (Optional)</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              placeholder="24AAAAA0000A1Z5"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Password *</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg transition disabled:opacity-50"
        >
          {loading ? 'Registering Supplier Tenant...' : 'Create Supplier Partner Account'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
        Already registered as a supplier partner?{' '}
        <Link href="/supplier/login" className="text-teal-400 font-semibold hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
}

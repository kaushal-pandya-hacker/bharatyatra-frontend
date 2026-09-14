'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SupplierLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/v1/suppliers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (!response.ok || !resData.token && !resData.data?.token) {
        throw new Error(resData.message || 'Invalid email or password');
      }

      const token = resData.token || resData.data?.token;
      const supplier = resData.supplier || resData.data?.supplier;

      localStorage.setItem('chalo_farva_supplier_token', token);
      localStorage.setItem('chalo_farva_supplier', JSON.stringify(supplier));

      router.push('/supplier/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate supplier account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-block p-3 rounded-full bg-teal-500/10 text-teal-400 mb-1">
          🔐
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-100">Supplier Portal Login</h1>
        <p className="text-xs text-slate-400">Access your Gujarat Travel Marketplace inventory & payouts</p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="vendor@somnathheritage.com"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
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
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg transition disabled:opacity-50"
        >
          {loading ? 'Authenticating Tenant...' : 'Sign In to Vendor Portal'}
        </button>
      </form>

      <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4">
        Don&apos;t have a supplier account yet?{' '}
        <Link href="/supplier/register" className="text-teal-400 font-semibold hover:underline">
          Register New Property / Service
        </Link>
      </div>
    </div>
  );
}

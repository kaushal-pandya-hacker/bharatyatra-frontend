'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/client';
import { Shield, ArrowRight, Home } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@bharatyatra.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const json = await apiFetch<any>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!json.success) {
        throw new Error(json.message || 'Invalid admin credentials');
      }

      const token = json.data.token;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(json.data.user));
      if (typeof document !== 'undefined') {
        const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
        document.cookie = `admin_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=86400${isSecure ? '; Secure' : ''}`;
      }
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-amber-100 selection:text-amber-900 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        {/* Brand Header with BharatYatra Logo */}
        <div className="flex flex-col items-center space-y-3">
          <Link href="/" className="inline-block transition-transform hover:scale-105" title="Go to BharatYatra Home">
            <img
              src="/logo.png"
              alt="BharatYatra Logo"
              className="h-14 w-auto object-contain mx-auto"
            />
          </Link>
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-full border border-amber-200 uppercase tracking-wider">
              <Shield className="w-3 h-3 text-amber-600" /> Operations Governance
            </span>
            <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900">
              BharatYatra Admin Login
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Authorized administrative access only
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-xs font-medium"
              placeholder="admin@bharatyatra.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-xs font-medium"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-md hover:shadow-lg transition-all text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Operations Portal'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <Link href="/supplier/login" className="hover:text-amber-600 flex items-center gap-1 transition-colors font-semibold">
            Supplier Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

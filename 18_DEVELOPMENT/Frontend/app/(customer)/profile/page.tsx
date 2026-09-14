'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { User, Mail, ShieldCheck, Calendar, LogOut, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Not Signed In</h2>
        <p className="text-xs text-slate-500">Please sign in to view your profile details and saved trips.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-8">
      {/* Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary text-2xl font-bold font-heading">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-heading text-slate-900">{user.fullName}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <ShieldCheck className="h-3 w-3" /> VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-brand-primary" /> Full Name
            </span>
            <span className="font-bold text-slate-900 block text-sm">{user.fullName}</span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-brand-primary" /> Email Address
            </span>
            <span className="font-bold text-slate-900 block text-sm">{user.email}</span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" /> Account Role
            </span>
            <span className="font-bold text-slate-900 block text-sm">{user.role}</span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-primary" /> Member Since
            </span>
            <span className="font-bold text-slate-900 block text-sm">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'September 2026'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Links Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold font-heading text-slate-900">Manage Saved Trips</h3>
          <p className="text-xs text-slate-500">View, modify, or export your AI-generated Gujarat itineraries.</p>
        </div>
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-sm transition-colors whitespace-nowrap"
        >
          <MapPin className="h-4 w-4" /> Go to My Trips
        </Link>
      </div>
    </div>
  );
}

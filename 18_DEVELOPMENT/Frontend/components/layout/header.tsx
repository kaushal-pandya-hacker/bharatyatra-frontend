'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { User, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold font-heading text-brand-primary tracking-tight">
            CHALO FARVA
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link href="/explore" className="hover:text-brand-primary transition-colors">Explore</Link>
          <Link href="/packages" className="hover:text-brand-primary transition-colors">Packages</Link>
          <Link href="/ai-planner" className="hover:text-brand-primary transition-colors font-semibold text-brand-primary">AI Planner</Link>
          <Link href="/trips" className="hover:text-brand-primary transition-colors">My Trips</Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-brand-primary bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-brand-primary" />
                <span>{user.fullName || user.email.split('@')[0]}</span>
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-brand-primary">
              Sign In
            </Link>
          )}
          <Link
            href="/ai-planner"
            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primary-hover transition-colors"
          >
            Plan Trip
          </Link>
        </div>
      </div>
    </header>
  );
}

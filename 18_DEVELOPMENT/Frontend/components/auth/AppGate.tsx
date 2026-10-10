'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export function AppGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 selection:bg-orange-100 selection:text-orange-900">
        <div className="flex flex-col items-center space-y-6 animate-fade-in max-w-sm text-center">
          {/* OFFICIAL BHARATYATRA LOGO IMAGE */}
          <div className="p-4 bg-white rounded-3xl shadow-xl border-2 border-slate-200">
            <img
              src="/logo.png"
              alt="BharatYatra Official Logo"
              className="h-16 w-auto object-contain animate-pulse"
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              BharatYatra
            </h1>
            <p className="text-slate-600 text-base font-semibold">
              Preparing your journey across India...
            </p>
          </div>
          <div className="w-56 h-2 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <div className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 animate-pulse w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

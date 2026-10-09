'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnTo=${returnUrl}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-6 animate-fade-in max-w-sm text-center">
          {/* OFFICIAL BHARATYATRA LOGO DISPLAY */}
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
            <img
              src="/logo.png"
              alt="BharatYatra Logo"
              className="h-16 w-auto object-contain animate-pulse"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              BharatYatra
            </h2>
            <p className="text-slate-600 text-base font-medium">
              Preparing your journey...
            </p>
          </div>
          <div className="w-56 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600 animate-pulse w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

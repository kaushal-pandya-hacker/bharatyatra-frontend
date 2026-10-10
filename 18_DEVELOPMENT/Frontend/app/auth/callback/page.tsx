'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const handleCallback = async () => {
      try {
        const code = searchParams ? searchParams.get('code') : null;
        const next = searchParams ? searchParams.get('next') || searchParams.get('redirect') : null;
        const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange error:', error.message);
          }
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (session && isSubscribed) {
          router.replace(destination);
        } else {
          // Listen for session detection from URL hash
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (newSession && isSubscribed) {
              router.replace(destination);
            }
          });

          // Timeout fallback if no session is detected within 4 seconds
          setTimeout(() => {
            if (isSubscribed) {
              setErrorMsg('Unable to complete authentication. Please try logging in again.');
            }
          }, 4000);

          return () => subscription.unsubscribe();
        }
      } catch (err: any) {
        if (isSubscribed) {
          setErrorMsg(err.message || 'Authentication error occurred.');
        }
      }
    };

    handleCallback();

    return () => {
      isSubscribed = false;
    };
  }, [router, searchParams]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Authentication Failed</h2>
            <p className="text-slate-600 text-sm font-medium">{errorMsg}</p>
          </div>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-md transition-all"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="flex flex-col items-center space-y-4">
        <img src="/logo.png" alt="BharatYatra Logo" className="h-16 w-auto object-contain animate-pulse" />
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-5 h-5 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-base font-extrabold text-slate-800">Signing you in securely with Google...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <img src="/logo.png" alt="BharatYatra Logo" className="h-16 w-auto object-contain animate-pulse mb-4" />
          <p className="text-base font-bold text-slate-700">Verifying session...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

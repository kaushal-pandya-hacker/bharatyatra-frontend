'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useAccessibility } from '@/lib/accessibility/accessibility-context';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams ? searchParams.get('returnTo') || searchParams.get('redirect') : null;
  const { user, loginWithGoogle, loading: authLoading } = useAuth();
  const { openSettings, language, setLanguage } = useAccessibility();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Navigation guard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const destination = returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';
      router.replace(destination);
    }
  }, [user, authLoading, router, returnTo]);

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await loginWithGoogle(returnTo || '/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <img src="/logo.png" alt="BharatYatra Logo" className="h-16 w-auto object-contain animate-pulse" />
          <p className="text-base font-semibold text-slate-700">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-orange-100 selection:text-orange-900 font-sans">
      {/* Header Bar */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="BharatYatra Official Logo"
            className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-extrabold">
            {(['en', 'gu', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                  language === lang ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'gu' ? 'ગુજ' : 'हिं'}
              </button>
            ))}
          </div>

          {/* Easy Read Accessibility Button */}
          <button
            type="button"
            onClick={openSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-900 font-extrabold text-xs transition-all min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-700">accessibility_new</span>
            <span className="hidden sm:inline">Easy Read</span>
          </button>

          <Link
            href="/"
            className="text-slate-700 hover:text-blue-700 transition flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-140px)] items-center p-6 lg:p-12 gap-8">
        {/* LEFT COLUMN: Clean Brand Introduction */}
        <section className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-sm font-bold w-fit shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Easy & Secure Google Login</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-blue-700">
                BharatYatra
              </span>
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed max-w-xl">
              Plan less. Coordinate less. Enjoy more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-base">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
                <span>Safe & Secure</span>
              </div>
              <p className="text-sm text-slate-600 leading-normal">
                Your login is secured with official Google Authentication.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-orange-600 font-bold text-base">
                <span className="material-symbols-outlined text-2xl">bolt</span>
                <span>Instant Access</span>
              </div>
              <p className="text-sm text-slate-600 leading-normal">
                Sign in with one tap using your Google account without remembering passwords.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Senior-Friendly White Google Auth Portal */}
        <section className="lg:col-span-6 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 text-center">
            {/* Logo inside Auth Box */}
            <div className="flex justify-center mb-2">
              <img src="/logo.png" alt="BharatYatra Logo" className="h-14 w-auto object-contain" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome to BharatYatra
              </h2>
              <p className="text-slate-600 text-base font-medium">
                Plan less. Coordinate less. Enjoy more.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-sm flex items-start gap-3 text-left shadow-sm">
                <span className="material-symbols-outlined text-rose-600 text-2xl mt-0.5 shrink-0">error</span>
                <div className="flex-grow">
                  <strong className="font-bold block text-base text-rose-950">Notice</strong>
                  <span className="font-medium text-rose-800">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-rose-700 hover:text-rose-950 text-base font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* GOOGLE SIGN IN BUTTON */}
            <div className="pt-2 space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-extrabold text-lg tracking-wide transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
                    <span className="text-slate-700 font-bold">Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    {/* OFFICIAL GOOGLE ICON */}
                    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.36 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span className="material-symbols-outlined text-emerald-600 text-sm">lock</span>
                <span>Secure sign in with Google</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                By continuing, you agree to BharatYatra&apos;s{' '}
                <Link href="/terms" className="text-blue-700 font-bold hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-700 font-bold hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between text-sm font-semibold text-slate-600">
        <div>© 2026 BharatYatra Technologies Inc. All rights reserved.</div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>
            Customer Support: <strong className="text-slate-900">1800 203 1111</strong>
          </span>
          <span>•</span>
          <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            System Active
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
          <img src="/logo.png" alt="BharatYatra Logo" className="h-16 w-auto object-contain animate-pulse mb-3" />
          <p className="text-base font-semibold text-slate-700">Loading authentication...</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOtpRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <img src="/logo.png" alt="BharatYatra Logo" className="h-16 w-auto object-contain animate-pulse" />
        <p className="text-sm font-bold text-slate-700">Redirecting to Google Sign In...</p>
      </div>
    </div>
  );
}

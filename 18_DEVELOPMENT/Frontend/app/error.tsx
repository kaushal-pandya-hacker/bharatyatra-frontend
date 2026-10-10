'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        We encountered a temporary issue while loading travel data. Please try again.
      </p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}

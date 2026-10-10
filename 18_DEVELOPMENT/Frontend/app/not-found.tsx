import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold font-heading text-brand-primary mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Destination Not Found</h2>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        The Gujarat travel page or trip plan you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
}

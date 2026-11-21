import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Cart & Checkout | BharatYatra',
  description: 'Review your selected itinerary accommodations, transport, and experiences.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

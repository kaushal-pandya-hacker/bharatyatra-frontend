import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Trips | BharatYatra',
  description: 'Manage and customize your saved itineraries and active journeys.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function MyTripsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

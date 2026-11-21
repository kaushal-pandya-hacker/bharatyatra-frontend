import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Traveler Profile | BharatYatra',
  description: 'Manage your verified traveler profile, origin city, and dietary preferences.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

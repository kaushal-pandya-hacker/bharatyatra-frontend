import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Bookings | BharatYatra',
  description: 'View your verified booking confirmation vouchers and reservation status.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

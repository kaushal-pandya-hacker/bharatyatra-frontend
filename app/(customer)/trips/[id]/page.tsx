import type { Metadata } from 'next';
import TripClient from './TripClient';
import { getSampleTripStaticParams } from '@/lib/utils/static-params';

export const metadata: Metadata = {
  title: 'Trip Command Center | BharatYatra',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export function generateStaticParams() {
  return getSampleTripStaticParams();
}

export default function TripCommandCenterPage({ params }: { params?: { id?: string } }) {
  return <TripClient params={params} />;
}

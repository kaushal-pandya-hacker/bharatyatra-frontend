import TripClient from './TripClient';
import { getSampleTripStaticParams } from '@/lib/utils/static-params';

export function generateStaticParams() {
  return getSampleTripStaticParams();
}

export default function TripCommandCenterPage({ params }: { params?: { id?: string } }) {
  return <TripClient params={params} />;
}

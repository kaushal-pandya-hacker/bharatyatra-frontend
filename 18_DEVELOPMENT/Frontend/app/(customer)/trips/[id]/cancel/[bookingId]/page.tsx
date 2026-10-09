import CancelClient from './CancelClient';
import { getSampleTripCancelStaticParams } from '@/lib/utils/static-params';

export function generateStaticParams() {
  return getSampleTripCancelStaticParams();
}

export default function BookingCancellationPage() {
  return <CancelClient />;
}

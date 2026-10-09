import BookingClient from './BookingClient';
import { getSampleBookingStaticParams } from '@/lib/utils/static-params';

export function generateStaticParams() {
  return getSampleBookingStaticParams();
}

export default function BookingDetailPage() {
  return <BookingClient />;
}

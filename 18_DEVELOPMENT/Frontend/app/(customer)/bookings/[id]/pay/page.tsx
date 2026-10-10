import BookingPayClient from './BookingPayClient';
import { getSampleBookingStaticParams } from '@/lib/utils/static-params';

export function generateStaticParams() {
  return getSampleBookingStaticParams();
}

export default function BookingPayPage() {
  return <BookingPayClient />;
}

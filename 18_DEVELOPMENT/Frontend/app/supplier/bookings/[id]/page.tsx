import SupplierBookingClient from './SupplierBookingClient';

export function generateStaticParams() {
  return [{ id: 'demo' }];
}

export default function SupplierBookingDetailPage() {
  return <SupplierBookingClient />;
}

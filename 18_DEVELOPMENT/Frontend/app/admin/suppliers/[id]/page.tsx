import AdminSupplierClient from './AdminSupplierClient';

export function generateStaticParams() {
  return [{ id: 'demo' }];
}

export default function AdminSupplierDetailPage() {
  return <AdminSupplierClient />;
}

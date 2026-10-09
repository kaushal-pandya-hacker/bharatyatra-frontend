import ExpensesClient from './ExpensesClient';
import { getSampleTripStaticParams } from '@/lib/utils/static-params';

export function generateStaticParams() {
  return getSampleTripStaticParams();
}

export default function ExpensesPage() {
  return <ExpensesClient />;
}

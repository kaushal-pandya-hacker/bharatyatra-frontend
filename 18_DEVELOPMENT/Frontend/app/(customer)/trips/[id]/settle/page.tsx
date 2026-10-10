import SettleClient from './SettleClient';
import { getSampleTripStaticParams } from '@/lib/utils/static-params';

export function generateStaticParams() {
  return getSampleTripStaticParams();
}

export default function SettlePage() {
  return <SettleClient />;
}

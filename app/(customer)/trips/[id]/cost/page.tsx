import CostClient from './CostClient';
import { getSampleTripStaticParams } from '@/lib/utils/static-params';

export function generateStaticParams() {
  return getSampleTripStaticParams();
}

export default function TripCostIntelligencePage() {
  return <CostClient />;
}

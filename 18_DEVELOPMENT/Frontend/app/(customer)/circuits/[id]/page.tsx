import CircuitClient from './CircuitClient';

export function generateStaticParams() {
  return [
    { id: 'heritage-spiritual-circuit' },
    { id: 'kutch-rann-circuit' },
    { id: 'wildlife-nature-circuit' },
    { id: 'coastal-beach-circuit' },
    { id: 'demo' },
  ];
}

export default function CircuitDetailPage() {
  return <CircuitClient />;
}

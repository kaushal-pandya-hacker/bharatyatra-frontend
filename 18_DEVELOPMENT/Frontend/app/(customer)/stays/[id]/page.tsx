import StayClient from './StayClient';

export function generateStaticParams() {
  return [
    { id: 'rann-kudrat-resort' },
    { id: 'statue-tented-city' },
    { id: 'gir-birding-lodge' },
    { id: 'demo' },
  ];
}

export default function StayDetailPage() {
  return <StayClient />;
}

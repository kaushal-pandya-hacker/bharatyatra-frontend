import FlightClient from './FlightClient';

export function generateStaticParams() {
  return [
    { id: 'fl-bom-amd-6e102' },
    { id: 'fl-del-amd-ai817' },
    { id: 'demo' },
  ];
}

export default function FlightDetailPage() {
  return <FlightClient />;
}

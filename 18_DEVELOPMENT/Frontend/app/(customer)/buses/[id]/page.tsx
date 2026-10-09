import BusClient from './BusClient';

export function generateStaticParams() {
  return [
    { id: 'gsrtc-volvo-ahmedabad-rajkot' },
    { id: 'gsrtc-express-dwarka' },
    { id: 'patel-tours-sleeper-surat' },
    { id: 'shrinath-travels-bhuj' },
    { id: 'demo' },
  ];
}

export default function BusDetailPage() {
  return <BusClient />;
}

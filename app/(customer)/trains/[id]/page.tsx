import TrainClient from './TrainClient';

export function generateStaticParams() {
  return [
    { id: 'vande-bharat-12010' },
    { id: 'saurashtra-mail-19015' },
    { id: 'demo' },
  ];
}

export default function TrainDetailPage() {
  return <TrainClient />;
}

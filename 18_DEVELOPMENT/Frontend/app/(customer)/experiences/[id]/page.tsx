import ExperienceClient from './ExperienceClient';

export function generateStaticParams() {
  return [
    { id: 'rogan-art-masterclass' },
    { id: 'patola-weaving-workshop' },
    { id: 'kutchi-bhunga-homestay' },
    { id: 'demo' },
  ];
}

export default function ExperienceDetailPage() {
  return <ExperienceClient />;
}

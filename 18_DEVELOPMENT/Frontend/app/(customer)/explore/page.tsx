import type { Metadata } from 'next';
import ExploreClient from '@/components/travel/ExploreClient';

export const metadata: Metadata = {
  title: 'Explore Gujarat & India Destinations — 100+ Iconic Landmarks',
  description: 'Explore Gujarat and India travel destinations. Filter heritage forts, beaches, hill stations, wildlife sanctuaries, and pilgrimage shrines with live AI route planning.',
  alternates: {
    canonical: '/explore',
  },
  openGraph: {
    title: 'Explore Gujarat & India Destinations — 100+ Iconic Landmarks | BharatYatra',
    description: 'Explore Gujarat and India travel destinations. Filter heritage forts, beaches, hill stations, wildlife sanctuaries, and pilgrimage shrines with live AI route planning.',
    url: 'https://www.bharatyatra.com/explore',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/bhuj-kutch-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Explore Gujarat Destinations - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Gujarat & India Destinations — 100+ Iconic Landmarks',
    description: 'Explore Gujarat travel destinations. Heritage stepwells, Gir lion safaris, Kutch salt deserts, and Somnath temples.',
    images: ['/bhuj-kutch-bg.jpg'],
  },
};

export default function Page() {
  return <ExploreClient />;
}

import type { Metadata } from 'next';
import DestinationsClient from '@/components/travel/DestinationsClient';

export const metadata: Metadata = {
  title: 'Gujarat & India Master Destinations Directory — 36 States & UTs',
  description: 'Discover destinations across Gujarat and India. Filter by State, City, Category, UNESCO status, or special permits across all 36 States & UTs.',
  alternates: {
    canonical: '/destinations',
  },
  openGraph: {
    title: 'Gujarat & India Master Destinations Directory | BharatYatra',
    description: 'Discover destinations across Gujarat and India. Filter by State, City, Category, UNESCO status, or special permits across all 36 States & UTs.',
    url: 'https://www.bharatyatra.com/destinations',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Master India Destinations Directory - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gujarat & India Master Destinations Directory — 36 States & UTs',
    description: 'Filter by State, City, Category, UNESCO status, or special permits across all 36 States & UTs.',
    images: ['/hero-bg.jpg'],
  },
};

export default function Page() {
  return <DestinationsClient />;
}

import type { Metadata } from 'next';
import ExploreClient from '@/components/travel/ExploreClient';

export const metadata: Metadata = {
  title: 'Explore Gujarat & India Destinations — 100+ Iconic Landmarks',
  description: 'Explore Gujarat and India travel destinations. Filter heritage forts, beaches, hill stations, wildlife sanctuaries, and pilgrimage shrines with live AI route planning.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/explore',
  },
  openGraph: {
    title: 'Explore Gujarat & India Destinations — 100+ Iconic Landmarks | BharatYatra',
    description: 'Explore Gujarat and India travel destinations. Filter heritage forts, beaches, hill stations, wildlife sanctuaries, and pilgrimage shrines with live AI route planning.',
    url: 'https://www.bharatyatra.in/explore',
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
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.bharatyatra.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Explore India',
        item: 'https://www.bharatyatra.in/explore',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ExploreClient />
    </>
  );
}

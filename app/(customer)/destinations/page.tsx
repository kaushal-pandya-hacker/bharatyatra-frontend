import type { Metadata } from 'next';
import DestinationsClient from '@/components/travel/DestinationsClient';

export const metadata: Metadata = {
  title: 'Gujarat & India Master Destinations Directory — 36 States & UTs',
  description: 'Discover destinations across Gujarat and India. Filter by State, City, Category, UNESCO status, or special permits across all 36 States & UTs.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/destinations',
  },
  openGraph: {
    title: 'Gujarat & India Master Destinations Directory | BharatYatra',
    description: 'Discover destinations across Gujarat and India. Filter by State, City, Category, UNESCO status, or special permits across all 36 States & UTs.',
    url: 'https://www.bharatyatra.in/destinations',
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

import { GUJARAT_DESTINATIONS } from '@/lib/data/destinations';

export default function Page() {
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BharatYatra Iconic Destinations Directory',
    description:
      'Curated directory of tourist attractions, UNESCO heritage sites, spiritual temples, and wildlife sanctuaries across India.',
    numberOfItems: GUJARAT_DESTINATIONS.length,
    itemListElement: GUJARAT_DESTINATIONS.map((d, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: d.name,
      url: `https://www.bharatyatra.in/destinations/${d.slug}`,
    })),
  };

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
        name: 'Destinations',
        item: 'https://www.bharatyatra.in/destinations',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DestinationsClient />
    </>
  );
}

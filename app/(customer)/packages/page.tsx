import type { Metadata } from 'next';
import PackagesClient from '@/components/travel/PackagesClient';

export const metadata: Metadata = {
  title: 'Gujarat & Worldwide Tour Packages — All-Inclusive Travel Deals',
  description: 'Book curated Gujarat & India tour packages with BharatYatra. All-inclusive luxury resort stays, guided transport, zero hidden fees, and instant AI customization.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/packages',
  },
  openGraph: {
    title: 'Gujarat & Worldwide Tour Packages — All-Inclusive Travel Deals | BharatYatra',
    description: 'Book curated Gujarat & India tour packages with BharatYatra. All-inclusive luxury resort stays, guided transport, zero hidden fees, and instant AI customization.',
    url: 'https://www.bharatyatra.in/packages',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Gujarat & Worldwide Tour Packages - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gujarat & Worldwide Tour Packages — All-Inclusive Travel Deals',
    description: 'Curated nationwide Indian odysseys & international escapes with transparent pricing.',
    images: ['/hero-bg.jpg'],
  },
};

import { ALL_INDIA_PACKAGES } from '@/data/india-packages.data';

export default function Page() {
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BharatYatra Curated Tour Packages Directory',
    description:
      'Curated holiday packages and cultural odysseys across Gujarat and all 36 States and Union Territories of India.',
    numberOfItems: ALL_INDIA_PACKAGES.length,
    itemListElement: ALL_INDIA_PACKAGES.slice(0, 30).map((pkg, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: pkg.title || pkg.packageName,
      url: `https://www.bharatyatra.in/packages/${pkg.slug}`,
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
        name: 'Tour Packages',
        item: 'https://www.bharatyatra.in/packages',
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
      <PackagesClient />
    </>
  );
}

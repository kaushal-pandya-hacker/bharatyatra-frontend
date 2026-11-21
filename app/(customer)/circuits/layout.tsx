import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Gujarat & India Cultural Travel Circuits — Multi-Day Itineraries | BharatYatra',
  description:
    'Discover curated multi-day Gujarat and India travel circuits. Experience the Kutch Rann Utsav Artisan Trail, Saurashtra Sacred Temple Circuit, and Gir Asiatic Lion Safari with verified stays and guided transit.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/circuits',
  },
  openGraph: {
    title: 'Gujarat & India Cultural Travel Circuits | BharatYatra',
    description:
      'Curated multi-day travel circuits with stays, transport, and guided cultural experiences across Gujarat and India.',
    url: 'https://www.bharatyatra.in/circuits',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/somnath-temple-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Gujarat Travel Circuits - BharatYatra',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gujarat & India Cultural Travel Circuits | BharatYatra',
    description:
      'Multi-day thematic travel circuits featuring temple trails, wildlife safaris, and desert heritage.',
    images: ['/somnath-temple-bg.jpg'],
  },
};

const circuitsItemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Gujarat Cultural Travel Circuits',
  description: 'Curated thematic travel circuits across Gujarat with verified transport and hotel links.',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Kutch Rann Utsav & Artisan Circuit',
      url: 'https://www.bharatyatra.in/circuits/kutch-rann-utsav',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Saurashtra Sacred Temple Circuit',
      url: 'https://www.bharatyatra.in/circuits/saurashtra-temple-trail',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Gir Lion Wildlife & Coastal Circuit',
      url: 'https://www.bharatyatra.in/circuits/gir-asiatic-lion-trail',
    },
  ],
};

const breadcrumbsSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.bharatyatra.in/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Travel Circuits',
      item: 'https://www.bharatyatra.in/circuits',
    },
  ],
};

export default function CircuitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(circuitsItemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {children}
    </>
  );
}

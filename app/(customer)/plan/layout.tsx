import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'AI Trip Planner — Customized India Travel Itineraries | BharatYatra',
  description:
    'Plan your perfect India trip with BharatYatra\'s AI planner. Generate day-by-day itineraries with verified transit times, temple darshan hours, wildlife safari permits, and live cost calculation.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/plan',
  },
  openGraph: {
    title: 'AI Trip Planner — Customized India Travel Itineraries | BharatYatra',
    description:
      'Generate day-by-day ground-verified India itineraries with transit calculations, live pricing, and regional darshan hours.',
    url: 'https://www.bharatyatra.in/plan',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'BharatYatra AI Trip Planner',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Trip Planner — Customized India Itineraries | BharatYatra',
    description:
      'Adaptive AI travel planner for India with real-time route optimization and verified hotel & transit links.',
    images: ['/hero-bg.jpg'],
  },
};

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BharatYatra AI Trip Planner',
  url: 'https://www.bharatyatra.in/plan',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'All modern browsers (Web, iOS, Android)',
  description:
    'AI-powered trip and itinerary generator tailored to Indian heritage, pilgrimage darshan schedules, wildlife permit quotas, and multi-modal transit coordination.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free to plan and customize itineraries',
  },
  featureList: [
    'Automated day-by-day itinerary blueprint generation',
    'Ground-verified transit distance and time calculations',
    'Temple darshan timings and festival calendar integration',
    'Real-time multi-tier budget estimation (Budget, Balanced, Luxury)',
    '100 Iconic Landmarks integration with cultural etiquette guidance',
    'Seamless multi-modal booking linking hotels, buses, trains, and flights',
  ],
  provider: {
    '@type': 'Organization',
    name: 'BharatYatra',
    url: 'https://www.bharatyatra.in/',
  },
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
      name: 'AI Trip Planner',
      item: 'https://www.bharatyatra.in/plan',
    },
  ],
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {children}
    </>
  );
}

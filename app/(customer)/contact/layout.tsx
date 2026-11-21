import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Contact Us — 24/7 Traveler Concierge & Customer Support | BharatYatra',
  description:
    'Connect with BharatYatra customer support. 24/7 concierge assistance for bookings, AI itinerary customization, emergency assistance, and partner inquiries in Ahmedabad, Gujarat, India.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/contact',
  },
  openGraph: {
    title: 'Contact Us — 24/7 Concierge Support | BharatYatra',
    description:
      'Reach the BharatYatra support team for booking assistance, custom tour design, and traveler queries.',
    url: 'https://www.bharatyatra.in/contact',
    siteName: 'BharatYatra',
    images: [
      {
        url: '/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'BharatYatra Contact and Support',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — 24/7 Concierge Support | BharatYatra',
    description:
      '24/7 traveler concierge and support for verified bookings and custom itineraries.',
    images: ['/hero-bg.jpg'],
  },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact BharatYatra',
  url: 'https://www.bharatyatra.in/contact',
  description: 'BharatYatra official customer support, booking inquiries, and concierge services.',
  mainEntity: {
    '@type': 'Organization',
    name: 'BharatYatra',
    url: 'https://www.bharatyatra.in/',
    telephone: '+919624282521',
    email: 'support@bharatyatra.in',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+919624282521',
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['English', 'Gujarati', 'Hindi'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+919624282521',
        contactType: 'emergency',
        areaServed: 'IN',
        availableLanguage: ['English', 'Gujarati', 'Hindi'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ahmedabad',
      addressRegion: 'Gujarat',
      postalCode: '380015',
      addressCountry: 'IN',
    },
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
      name: 'Contact Us',
      item: 'https://www.bharatyatra.in/contact',
    },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {children}
    </>
  );
}

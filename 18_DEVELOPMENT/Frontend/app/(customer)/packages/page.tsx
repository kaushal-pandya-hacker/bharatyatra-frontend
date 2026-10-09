import type { Metadata } from 'next';
import PackagesClient from '@/components/travel/PackagesClient';

export const metadata: Metadata = {
  title: 'Gujarat & Worldwide Tour Packages — All-Inclusive Travel Deals',
  description: 'Book curated Gujarat & India tour packages with BharatYatra. All-inclusive luxury resort stays, guided transport, zero hidden fees, and instant AI customization.',
  alternates: {
    canonical: '/packages',
  },
  openGraph: {
    title: 'Gujarat & Worldwide Tour Packages — All-Inclusive Travel Deals | BharatYatra',
    description: 'Book curated Gujarat & India tour packages with BharatYatra. All-inclusive luxury resort stays, guided transport, zero hidden fees, and instant AI customization.',
    url: 'https://www.bharatyatra.com/packages',
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

export default function Page() {
  return <PackagesClient />;
}

import type { Metadata } from 'next';
import { TermsClient } from '@/components/legal/TermsClient';

export const metadata: Metadata = {
  title: 'Terms & Conditions | BharatYatra',
  description:
    'Official Terms and Conditions for BharatYatra — India AI Travel Planning, Destination Discovery, and Travel Booking Coordination.',
  alternates: {
    canonical: 'https://bharatyatra.in/terms/',
  },
  openGraph: {
    title: 'Terms & Conditions | BharatYatra',
    description:
      'Official Terms and Conditions for BharatYatra — India AI Travel Planning, Destination Discovery, and Travel Booking Coordination.',
    url: 'https://bharatyatra.in/terms/',
    siteName: 'BharatYatra',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms & Conditions | BharatYatra',
    description:
      'Official Terms and Conditions for BharatYatra — India AI Travel Planning, Destination Discovery, and Travel Booking Coordination.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function TermsPage() {
  return <TermsClient />;
}

